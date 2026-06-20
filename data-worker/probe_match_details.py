#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
probe_match_details.py
SofaScore Individual Match Details Probe & Diagnostics tool.
Uses SuperLigSofascore verified ID adapter to execute TLS and cache requests to SofaScore API.
Does NOT write to any Firestore collection or launch any OAuth processes.
"""

import os
import sys
import argparse
import logging
import json
import traceback

# 1. SETUP ENVIRONMENT
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
SOCCERDATA_DIR = os.path.join(SCRIPT_DIR, "soccerdata_home")

# Set the environment variables absolutely
os.environ["SOCCERDATA_DIR"] = SOCCERDATA_DIR

# Add SCRIPT_DIR to sys.path so we can import local modules easily
if SCRIPT_DIR not in sys.path:
    sys.path.insert(0, SCRIPT_DIR)

# Establish logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] [%(name)s] %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger("probe_match_details")

# Safe JSON encoder handling Pandas Series, DataFrames, numpy types & NaN/NaT
import numpy as np
import pandas as pd

class SoccerDataJsonEncoder(json.JSONEncoder):
    def default(self, obj):
        if pd.isna(obj):
            return None
        if isinstance(obj, (np.integer, np.int64, np.int32, np.int16, np.int8)):
            return int(obj)
        if isinstance(obj, (np.floating, np.float64, np.float32, np.float16)):
            return float(obj)
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        if isinstance(obj, (pd.Timestamp, pd.Period)):
            return obj.isoformat()
        if isinstance(obj, (tuple, set)):
            return list(obj)
        try:
            return super().default(obj)
        except TypeError:
            return str(obj)

def fetch_sofascore_url(reader, url):
    """
    Resilient helper to invoke GET via reader using soccerdata's underlying
    caching/TLS client if possible, otherwise falling back safely.
    """
    logger.info(f"Issuing HTTP GET request to: {url}")
    if hasattr(reader, "get") and callable(reader.get):
        return reader.get(url)
    elif hasattr(reader, "_request") and callable(reader._request):
        return reader._request(url)
    elif hasattr(reader, "session") and hasattr(reader.session, "get"):
        return reader.session.get(url)
    else:
        import requests
        headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
        return requests.get(url, headers=headers)

def parse_sofascore_response(res):
    """
    Standardizes responses from string, bytes, dict, or requests.Response
    into python dict and calculates metrics including payload size.
    """
    data = None
    byte_size = 0
    
    if res is None:
        raise ValueError("Response object is None")

    if hasattr(res, "json") and callable(res.json):
        byte_size = len(getattr(res, "content", b""))
        try:
            data = res.json()
        except Exception:
            text_val = getattr(res, "text", "")
            data = json.loads(text_val) if text_val else {}
    elif isinstance(res, (str, bytes)):
        if isinstance(res, bytes):
            byte_size = len(res)
            res_str = res.decode("utf-8")
        else:
            byte_size = len(res.encode("utf-8"))
            res_str = res
        data = json.loads(res_str)
    elif isinstance(res, dict):
        data = res
        byte_size = len(json.dumps(res).encode("utf-8"))
    else:
        # Fallback string representation
        try:
            res_str = str(res)
            byte_size = len(res_str.encode("utf-8"))
            data = json.loads(res_str)
        except Exception:
            data = {}
            
    return data, byte_size

def find_discovered_metrics(data):
    """
    Recursively searches for "name" fields inside dict to list unique metrics (up to 50 values).
    """
    known_names = set()
    def recurse(obj):
        if isinstance(obj, dict):
            if "name" in obj and isinstance(obj["name"], str):
                known_names.add(obj["name"])
            for k, v in obj.items():
                if k == "name" and isinstance(v, str):
                    known_names.add(v)
                else:
                    recurse(v)
        elif isinstance(obj, list):
            for item in obj:
                recurse(item)
    recurse(data)
    return sorted(list(known_names))[:50]

def count_lineup_players(data):
    """Counts total players in lineup response."""
    player_count = 0
    if isinstance(data, dict):
        for side in ["home", "away"]:
            side_data = data.get(side, {})
            if isinstance(side_data, dict):
                players = side_data.get("players", [])
                if isinstance(players, list):
                    player_count += len(players)
    if player_count == 0:
        def count_players_recursive(obj):
            count = 0
            if isinstance(obj, dict):
                if "player" in obj:
                    count += 1
                for v in obj.values():
                    count += count_players_recursive(v)
            elif isinstance(obj, list):
                for item in obj:
                    count += count_players_recursive(item)
            return count
        player_count = count_players_recursive(data)
    return player_count

def count_shotmap_shots(data):
    """Counts total shots in shotmap response."""
    shot_count = 0
    if isinstance(data, dict):
        shots = data.get("shots", [])
        if isinstance(shots, list):
            shot_count = len(shots)
    if shot_count == 0:
        def count_shots_recursive(obj):
            count = 0
            if isinstance(obj, dict):
                if "shot" in obj or ("bodyPart" in obj and "shotType" in obj):
                    count += 1
                for v in obj.values():
                    count += count_shots_recursive(v)
            elif isinstance(obj, list):
                for item in obj:
                    count += count_shots_recursive(item)
            return count
        shot_count = count_shots_recursive(data)
    return shot_count

def main():
    from providers import create_superlig_reader
    
    parser = argparse.ArgumentParser(description="Probe SofaScore Match Details")
    parser.add_argument("--event-id", required=True, type=int, help="SofaScore unique match event ID")
    parser.add_argument("--output", default="data-worker/output/match_details_probe.json", help="Path to write the JSON probe report")
    args = parser.parse_args()

    # Calculate absolute coordinates
    output_abs_path = args.output
    if not os.path.isabs(output_abs_path):
        output_abs_path = os.path.join(SCRIPT_DIR, "..", output_abs_path)
    output_abs_path = os.path.abspath(output_abs_path)

    # Ensure output parent directory exists
    os.makedirs(os.path.dirname(output_abs_path), exist_ok=True)

    logger.info(f"Starting Match Details Probe for Event ID: {args.event_id}")
    
    # Initialize SuperLigSofascore reader via helper factory
    reader = None
    try:
        reader = create_superlig_reader(season="2025-26")
    except Exception as e:
        logger.error(f"Failed to initialize soccerdata Sofascore reader: {e}")
        # Build immediate fail payload
        fail_payload = {
            "probeVersion": 1,
            "eventId": args.event_id,
            "success": False,
            "globalError": f"Failed to initialize soccerdata reader: {str(e)}",
            "endpoints": []
        }
        with open(output_abs_path, "w", encoding="utf-8") as f:
            json.dump(fail_payload, f, indent=2)
        sys.exit(1)

    endpoint_targets = ["statistics", "lineups", "shotmap"]
    diagnostic_blocks = []
    
    # Track critical step success status
    statistics_success = False
    lineups_success = False

    for endpoint in endpoint_targets:
        logger.info(f"--- Probing Endpoint: {endpoint} ---")
        url = f"https://api.sofascore.com/api/v1/event/{args.event_id}/{endpoint}"
        
        block = {
            "endpoint": endpoint,
            "success": False,
            "topLevelKeys": [],
            "responseByteSize": 0,
            "itemCount": 0,
            "discoveredMetricNames": [],
            "warning": None,
            "error": None
        }

        try:
            res = fetch_sofascore_url(reader, url)
            data, byte_size = parse_sofascore_response(res)
            
            block["responseByteSize"] = byte_size
            
            if isinstance(data, dict):
                block["topLevelKeys"] = list(data.keys())
                
                # Check for SofaScore REST errors or missing keys
                if "error" in data or (len(data) == 1 and "message" in data) or not data:
                    err_msg = data.get("error", {}).get("message", data.get("message", "Empty or error response"))
                    raise ValueError(f"SofaScore API returned error payload: {err_msg}")
                    
                block["success"] = True
                
                # Specific endpoint diagnostic parsers
                if endpoint == "statistics":
                    metrics = find_discovered_metrics(data)
                    block["discoveredMetricNames"] = metrics
                    # count number of statsItems
                    block["itemCount"] = len(metrics)
                    statistics_success = True
                    
                elif endpoint == "lineups":
                    players_count = count_lineup_players(data)
                    block["itemCount"] = players_count
                    lineups_success = True
                    
                elif endpoint == "shotmap":
                    shots_count = count_shotmap_shots(data)
                    block["itemCount"] = shots_count
            else:
                raise ValueError("Parsed data is not a JSON object dictionary")

        except Exception as e:
            err_msg = str(e)
            logger.warning(f"Endpoint '{endpoint}' failed or was not found: {err_msg}")
            block["success"] = False
            
            if endpoint == "shotmap":
                # Shotmap failure is treated as a warning rather than a fatal crash
                block["warning"] = f"Shotmap endpoint failed: {err_msg}"
            else:
                block["error"] = err_msg

        diagnostic_blocks.append(block)

    # Core success check: statistics and lineups must both be successful
    overall_success = statistics_success and lineups_success

    # Write probe manifestation
    final_payload = {
        "probeVersion": 1,
        "eventId": args.event_id,
        "success": overall_success,
        "fetchedAt": pd.Timestamp.now().isoformat(),
        "endpoints": diagnostic_blocks,
        "warning": None if overall_success or not statistics_success or not lineups_success else "Optional endpoints had warnings"
    }

    try:
        with open(output_abs_path, "w", encoding="utf-8") as f:
            json.dump(final_payload, f, cls=SoccerDataJsonEncoder, indent=2, ensure_ascii=False)
        logger.info(f"Completed match details probe. Output saved to: {output_abs_path}")
    except Exception as e:
        logger.error(f"Failed to write final JSON output: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
