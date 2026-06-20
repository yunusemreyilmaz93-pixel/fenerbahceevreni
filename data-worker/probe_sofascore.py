#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
probe_sofascore.py
Soccerdata 1.9.0 SofaScore Turkish Süper Lig Probe & Diagnostics tool.
Does NOT write to any Firestore collection or launch any OAuth / background processes.
"""

import os
import sys
import argparse
import logging
import json
import traceback

# 1. SETUP ENVIRONMENT BEFORE IMPORTING SOCCERDATA
# Retrieve absolute path of the directory this script is in
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
SOCCERDATA_DIR = os.path.join(SCRIPT_DIR, "soccerdata_home")

# Set the environment variables absolutely
os.environ["SOCCERDATA_DIR"] = SOCCERDATA_DIR

# Establish logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] [%(name)s] %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger("probe_sofascore")

# Safe JSON encoder handling Pandas Series, DataFrames, numpy types, MultiIndex & NaN/NaT
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

def normalize_turkish_text(text):
    if not isinstance(text, str):
        return ""
    replacements = {
        'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u',
        'Ç': 'c', 'Ğ': 'g', 'İ': 'i', 'Ö': 'o', 'Ş': 's', 'Ü': 'u'
    }
    lowered = text.lower()
    for tr, lat in replacements.items():
        lowered = lowered.replace(tr, lat)
    return lowered.strip()

def flatten_multiindex_column(col):
    if isinstance(col, tuple):
        return "_".join(str(c).strip().lower() for c in col if str(c).strip() != "")
    return str(col).strip().lower()

def safe_list_columns(df):
    if df is None:
        return []
    if isinstance(df.columns, pd.MultiIndex):
        # Return a list of tuples/lists or flattened strings to ensure JSON safety
        return [list(col) for col in df.columns]
    return list(df.columns)

def create_failed_manifest(output_path, step, error_msg, args):
    """Writes a standardized failure output and exits with error code."""
    payload = {
        "probeVersion": 1,
        "provider": "sofascore",
        "library": "soccerdata",
        "libraryVersion": "1.9.0",
        "leagueKey": "TUR-Super Lig",
        "seasonKey": args.season,
        "teamQuery": args.team,
        "fetchedAt": pd.Timestamp.now().isoformat(),
        "success": False,
        "errorStep": step,
        "errorMessage": error_msg,
        "availableLeagueConfirmed": False,
        "leagueColumns": [],
        "seasonColumns": [],
        "tableColumns": [],
        "scheduleColumns": [],
        "scheduleRowCount": 0,
        "teamMatchCount": 0,
        "teamMatches": [],
        "warnings": [f"Failed at step '{step}': {error_msg}"]
    }
    try:
        os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(payload, f, cls=SoccerDataJsonEncoder, indent=2, ensure_ascii=False)
        logger.info(f"Saved failure report to {output_path}")
    except Exception as e:
        logger.error(f"Could not write failure file: {e}")
    sys.exit(1)

def main():
    parser = argparse.ArgumentParser(description="Probe SofaScore Süper Lig Integration")
    parser.add_argument("--season", default="2025-26", help="Season in YYYY-YY format")
    parser.add_argument("--team", default="Fenerbahçe", help="Team name to filter")
    parser.add_argument("--output", default="data-worker/output/sofascore_probe.json", help="Path to output JSON")
    parser.add_argument("--force-cache", action="store_true", help="Force cache directories and reload")
    args = parser.parse_args()

    # Determine absolute path for output
    if not os.path.isabs(args.output):
        output_abs_path = os.path.abspath(os.path.join(SCRIPT_DIR, "..", args.output))
    else:
        output_abs_path = args.output

    # Create directories
    os.makedirs(os.path.dirname(output_abs_path), exist_ok=True)
    os.makedirs(os.path.join(SOCCERDATA_DIR, "data"), exist_ok=True)
    os.makedirs(os.path.join(SOCCERDATA_DIR, "logs"), exist_ok=True)

    warnings_list = []

    # --- 1. CONFIGURATION STEP ---
    logger.info("--- STEP 1: CONFIGURATION ---")
    logger.info(f"SOCCERDATA_DIR set to: {SOCCERDATA_DIR}")
    league_dict_path = os.path.join(SOCCERDATA_DIR, "config", "league_dict.json")
    if not os.path.exists(league_dict_path):
        create_failed_manifest(
            output_abs_path,
            "configuration",
            f"league_dict.json config file not found at {league_dict_path}",
            args
        )
    logger.info(f" league_dict.json loaded successfully from {league_dict_path}")

    # Delay soccerdata import after setting env
    try:
        import soccerdata as sd
        logger.info(f"Successfully imported soccerdata. Version: {sd.__version__}")
    except Exception as e:
        create_failed_manifest(
            output_abs_path,
            "configuration",
            f"Failed to import soccerdata library. Is it installed? Details: {str(e)}",
            args
        )

    # --- 2. AVAILABLE LEAGUES STEP ---
    logger.info("--- STEP 2: AVAILABLE LEAGUES ---")
    available_confirmed = False
    try:
        # Check available leagues classmethod
        available = sd.Sofascore.available_leagues()
        logger.info(f"Available leagues: {available}")
        if "TUR-Super Lig" in available:
            available_confirmed = True
            logger.info(" 'TUR-Super Lig' discovered and confirmed in available leagues!")
        else:
            create_failed_manifest(
                output_abs_path,
                "available leagues",
                "TUR-Super Lig was not found in Sofascore available leagues list.",
                args
            )
    except Exception as e:
        create_failed_manifest(
            output_abs_path,
            "available leagues",
            f"Failed to check available leagues: {str(e)}",
            args
        )

    # Instantiate the Sofascore reader
    reader = None
    try:
        logger.info(f"Initializing Sofascore reader for TUR-Super Lig, season: {args.season}")
        # Initialize
        reader = sd.Sofascore(
            leagues="TUR-Super Lig",
            seasons=args.season
        )
    except Exception as e:
        create_failed_manifest(
            output_abs_path,
            "configuration",
            f"Failed to initialize sd.Sofascore: {str(e)}",
            args
        )

    # --- 3. LEAGUES & SEASONS STEP ---
    logger.info("--- STEP 3: LEAGUES ---")
    league_cols = []
    try:
        leagues_df = reader.read_leagues()
        if leagues_df is None:
            raise ValueError("read_leagues() returned None")
        league_cols = safe_list_columns(leagues_df)
        logger.info(f"Leagues fetched. Columns: {league_cols}")
    except Exception as e:
        create_failed_manifest(
            output_abs_path,
            "leagues",
            f"Failed to read leagues: {str(e)}",
            args
        )

    logger.info("--- STEP 4: SEASONS ---")
    season_cols = []
    try:
        seasons_df = reader.read_seasons()
        if seasons_df is None:
            raise ValueError("read_seasons() returned None")
        season_cols = safe_list_columns(seasons_df)
        logger.info(f"Seasons fetched. Columns: {season_cols}")
    except Exception as e:
        create_failed_manifest(
            output_abs_path,
            "seasons",
            f"Failed to read seasons: {str(e)}",
            args
        )

    # --- 4. TABLE STEP ---
    logger.info("--- STEP 5: LEAGUE TABLE ---")
    table_cols = []
    try:
        table_df = reader.read_league_table()
        if table_df is None:
            raise ValueError("read_league_table() returned None")
        table_cols = safe_list_columns(table_df)
        logger.info(f"League table loaded. Shape: {table_df.shape}")
    except Exception as e:
        create_failed_manifest(
            output_abs_path,
            "table",
            f"Failed to read league table: {str(e)}",
            args
        )

    # --- 5. SCHEDULE STEP ---
    logger.info("--- STEP 6: SCHEDULE ---")
    schedule_cols = []
    schedule_df = None
    try:
        schedule_df = reader.read_schedule()
        if schedule_df is None:
            raise ValueError("read_schedule() returned None")
        schedule_cols = safe_list_columns(schedule_df)
        logger.info(f"Schedule loaded. Rows count: {len(schedule_df)}")
    except Exception as e:
        create_failed_manifest(
            output_abs_path,
            "schedule",
            f"Failed to fetch schedule fixture data: {str(e)}",
            args
        )

    # --- 6. TEAM FILTERING ---
    logger.info("--- STEP 7: TEAM FILTERING ---")
    team_matches_serialized = []
    team_match_count = 0
    query_team_normalized = normalize_turkish_text(args.team)

    if schedule_df is not None and not schedule_df.empty:
        # Resolve columns dynamically avoiding hardcoding list mapping
        logger.info("Dynamically searching for team columns in DataFrame...")
        
        # Build flattened column mappings
        flat_to_orig = {flatten_multiindex_column(col): col for col in schedule_df.columns}
        flat_col_keys = list(flat_to_orig.keys())
        
        # Primary indicators
        home_key = None
        away_key = None
        date_key = None
        score_key = None
        status_key = None

        # Look for home team column
        for cand in ["home_team", "home", "team_home", "hometeam"]:
            for f_key in flat_col_keys:
                if cand in f_key:
                    home_key = flat_to_orig[f_key]
                    break
            if home_key:
                break
        
        # Look for away team column
        for cand in ["away_team", "away", "team_away", "awayteam"]:
            for f_key in flat_col_keys:
                if cand in f_key:
                    away_key = flat_to_orig[f_key]
                    break
            if away_key:
                break

        # Look for date column
        for cand in ["date", "time", "datetime", "start", "utc"]:
            for f_key in flat_col_keys:
                if cand in f_key:
                    date_key = flat_to_orig[f_key]
                    break
            if date_key:
                break

        # Look for status
        for cand in ["status", "state", "status_name", "match_status"]:
            for f_key in flat_col_keys:
                if cand in f_key:
                    status_key = flat_to_orig[f_key]
                    break
            if status_key:
                break

        # Look for score
        for cand in ["score", "result", "ft_score", "full_time"]:
            for f_key in flat_col_keys:
                if cand in f_key:
                    score_key = flat_to_orig[f_key]
                    break
            if score_key:
                break

        logger.info(f"Identified candidate columns: Home={home_key}, Away={away_key}, Date={date_key}, Status={status_key}, Score={score_key}")

        # Check if home and away columns are resolved
        if not home_key or not away_key:
            err_msg = f"Could not map home/away team columns in schedule fields. Available fields: {flat_col_keys}"
            create_failed_manifest(output_abs_path, "team filtering", err_msg, args)

        # Loop rows and match
        for idx, row in schedule_df.iterrows():
            # Extract safe values
            home_val = row.get(home_key)
            away_val = row.get(away_key)
            
            home_str = str(home_val) if home_val is not None else ""
            away_str = str(away_val) if away_val is not None else ""

            # Check matching
            home_match = query_team_normalized in normalize_turkish_text(home_str)
            away_match = query_team_normalized in normalize_turkish_text(away_str)

            if home_match or away_match:
                # Key IDs can be index levels formatted safely or extra index values
                match_id = str(idx) if not isinstance(idx, tuple) else "-".join(map(str, idx))
                
                # Retrieve remaining values based on identified keys
                match_date = row.get(date_key) if date_key else None
                match_status = row.get(status_key) if status_key else None
                
                # Dynamic scoring check
                match_score = None
                if score_key:
                    match_score = row.get(score_key)
                else:
                    # Alternately construct score if individual scores are available
                    # e.g., home_score and away_score or similar
                    home_sc_key = next((flat_to_orig[k] for k in flat_col_keys if "home_score" in k or "score_home" in k), None)
                    away_sc_key = next((flat_to_orig[k] for k in flat_col_keys if "away_score" in k or "score_away" in k), None)
                    if home_sc_key and away_sc_key:
                        match_score = f"{row.get(home_sc_key)} - {row.get(away_sc_key)}"

                # Serialize match
                team_matches_serialized.append({
                    "matchId": match_id,
                    "date": match_date,
                    "homeTeam": home_str,
                    "awayTeam": away_str,
                    "score": match_score,
                    "status": match_status,
                    # Safe fallbacks mapping the full series details in a single clean dict
                    "fullDetails": {str(k): row.get(k) for k in row.index}
                })

        team_match_count = len(team_matches_serialized)
        logger.info(f"Matched {team_match_count} games with search term '{args.team}'")
        if team_match_count == 0:
            msg = f"Diagnostic notice: No fixtures discovered inTUR-Super Lig schedule matching the team keyword '{args.team}'."
            logger.warning(msg)
            warnings_list.append(msg)
    else:
        warnings_list.append("The schedule data-frame was loaded but is completely empty.")

    # --- 7. WRITE DIAGNOSTICS MANIFEST ---
    logger.info("--- STEP 8: WRITING JSON OUTPUT ---")
    final_payload = {
        "probeVersion": 1,
        "provider": "sofascore",
        "library": "soccerdata",
        "libraryVersion": "1.9.0",
        "leagueKey": "TUR-Super Lig",
        "seasonKey": args.season,
        "teamQuery": args.team,
        "fetchedAt": pd.Timestamp.now().isoformat(),
        "success": True,
        "availableLeagueConfirmed": available_confirmed,
        "leagueColumns": league_cols,
        "seasonColumns": season_cols,
        "tableColumns": table_cols,
        "scheduleColumns": schedule_cols,
        "scheduleRowCount": len(schedule_df) if schedule_df is not None else 0,
        "teamMatchCount": team_match_count,
        "teamMatches": team_matches_serialized,
        "warnings": warnings_list
    }

    try:
        with open(output_abs_path, "w", encoding="utf-8") as f:
            json.dump(final_payload, f, cls=SoccerDataJsonEncoder, indent=2, ensure_ascii=False)
        logger.info(f" Successfully exported probe diagnostics to: {output_abs_path}")
    except Exception as e:
        logger.error(f"Failed to serialize/save final JSON output: {e}")
        # Re-raise or exit with code
        sys.exit(1)

    logger.info("Probe completed successfully.")

if __name__ == "__main__":
    main()
