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

def process_endpoint_url(reader, url):
    """
    Attempts to fetch the given URL and extract full HTTP metrics and diagnostics,
    including requestUrl, finalUrl, httpStatus, contentType, rawResponseByteSize,
    and responseBodyPreview (up to first 500 chars).
    Returns a tuple of (success, dict_data, attempt_diagnostic_dict, res_object)
    """
    attempt_diag = {
        "requestUrl": url,
        "finalUrl": url,
        "httpStatus": None,
        "contentType": None,
        "rawResponseByteSize": 0,
        "responseBodyPreview": "",
        "success": False,
        "error": None
    }
    
    res = None
    try:
        # Call fetch helper
        res = fetch_sofascore_url(reader, url)
    except Exception as e:
        attempt_diag["error"] = str(e)
        logger.warning(f"Fetch failed for {url}: {e}")
        return False, None, attempt_diag, None
        
    if res is None:
        attempt_diag["error"] = "Received None response object"
        return False, None, attempt_diag, None
        
    # httpStatus
    status_code = getattr(res, "status_code", None)
    if status_code is None:
        status_code = getattr(res, "status", None)
    if status_code is None:
        status_code = 200
        
    attempt_diag["httpStatus"] = status_code
    
    # finalUrl
    final_url = getattr(res, "url", url)
    attempt_diag["finalUrl"] = final_url
    
    # contentType
    headers = getattr(res, "headers", None)
    content_type = ""
    if headers and hasattr(headers, "get"):
        content_type = headers.get("content-type", "")
    attempt_diag["contentType"] = content_type
    
    # rawResponseByteSize & responseBodyPreview
    content_bytes = b""
    text_val = ""
    
    if hasattr(res, "content") and getattr(res, "content") is not None:
        content_bytes = getattr(res, "content", b"")
        attempt_diag["rawResponseByteSize"] = len(content_bytes)
    elif isinstance(res, (str, bytes)):
        if isinstance(res, bytes):
            content_bytes = res
            attempt_diag["rawResponseByteSize"] = len(res)
        else:
            text_val = res
            attempt_diag["rawResponseByteSize"] = len(res.encode("utf-8"))
    elif isinstance(res, dict):
        try:
            dumped = json.dumps(res)
            attempt_diag["rawResponseByteSize"] = len(dumped.encode("utf-8"))
            text_val = dumped
        except Exception:
            pass
            
    # Derive text_val for preview
    if not text_val:
        if hasattr(res, "text") and getattr(res, "text") is not None:
            text_val = getattr(res, "text", "")
        elif content_bytes:
            try:
                text_val = content_bytes.decode("utf-8", errors="replace")
            except Exception:
                text_val = ""
        elif isinstance(res, dict):
            text_val = json.dumps(res)
            
    attempt_diag["responseBodyPreview"] = text_val[:500] if text_val else ""
    
    # json parsing: only if response is successful (2xx) and body is non-empty
    data = None
    is_success = (status_code is not None and 200 <= status_code < 300)
    
    if is_success:
        try:
            if hasattr(res, "json") and callable(res.json):
                if text_val.strip():
                    data = res.json()
                else:
                    data = {}
            elif isinstance(res, dict):
                data = res
            elif text_val.strip():
                data = json.loads(text_val)
            else:
                data = {}
        except Exception as e:
            attempt_diag["error"] = f"Failed to parse JSON body: {e}"
            is_success = False
    else:
        attempt_diag["error"] = f"HTTP Error status code: {status_code}"
        if text_val.strip():
            try:
                data = json.loads(text_val)
            except Exception:
                data = {"raw_text": text_val[:1000]}
        else:
            data = {}
            
    # Check for SofaScore REST errors inside successfully parsed JSON
    if is_success and isinstance(data, dict):
        if "error" in data or (len(data) == 1 and "message" in data) or not data:
            err_msg = data.get("error", {}).get("message", data.get("message", "Empty query or error content"))
            attempt_diag["error"] = f"SofaScore API payload error: {err_msg}"
            is_success = False
            
    attempt_diag["success"] = is_success
    return is_success, data, attempt_diag, res

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
        
        # 1. Primary URL (www.sofascore.com)
        url1 = f"https://www.sofascore.com/api/v1/event/{args.event_id}/{endpoint}"
        attempts = []
        
        is_success, data, diag_dict, res = process_endpoint_url(reader, url1)
        attempts.append(diag_dict)
        
        if not is_success:
            # 2. Secondary URL diagnostic target (api.sofascore.com)
            logger.info(f"Primary URL failed for {endpoint}. Attempting secondary api.sofascore.com target...")
            url2 = f"https://api.sofascore.com/api/v1/event/{args.event_id}/{endpoint}"
            is_success_2, data_2, diag_dict_2, res_2 = process_endpoint_url(reader, url2)
            attempts.append(diag_dict_2)
            if is_success_2:
                is_success = True
                data = data_2
                diag_dict = diag_dict_2
                res = res_2

        # Build diagnostic block with requested structured response mappings
        block = {
            "endpoint": endpoint,
            "success": is_success,
            "requestUrl": diag_dict["requestUrl"],
            "finalUrl": diag_dict["finalUrl"],
            "httpStatus": diag_dict["httpStatus"],
            "contentType": diag_dict["contentType"],
            "rawResponseByteSize": diag_dict["rawResponseByteSize"],
            "responseBodyPreview": diag_dict["responseBodyPreview"],
            "attempts": attempts,
            "topLevelKeys": [],
            "itemCount": 0,
            "discoveredMetricNames": [],
            "warning": None,
            "error": diag_dict["error"]
        }

        if is_success:
            try:
                if isinstance(data, dict):
                    block["topLevelKeys"] = list(data.keys())
                    
                    # Specific endpoint diagnostic parsers
                    if endpoint == "statistics":
                        metrics = find_discovered_metrics(data)
                        block["discoveredMetricNames"] = metrics
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
                block["success"] = False
                block["error"] = f"Parsing parsed data block failed: {err_msg}"
                if endpoint == "shotmap":
                    block["warning"] = f"Shotmap parsing failed: {err_msg}"
                else:
                    if endpoint == "statistics":
                        statistics_success = False
                    elif endpoint == "lineups":
                        lineups_success = False

        else:
            # Not successful
            if endpoint == "shotmap":
                block["warning"] = f"Shotmap endpoint failed: {block['error']}"

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
