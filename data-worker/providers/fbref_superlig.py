# -*- coding: utf-8 -*-
"""
FBref Super Lig provider (Faz B).

Öncelik: soccerdata.FBref (stabil API)
Yedek: FBref HTML (scrapling / urllib) — Cloudflare olursa partial fail

Lig: Trendyol Süper Lig — FBref comp id 26
"""
from __future__ import annotations

import json
import logging
import os
import re
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

logger = logging.getLogger("fbref_superlig")

WORKER = Path(__file__).resolve().parent.parent
OUT_DIR = WORKER / "output" / "fbref"
OUT_DIR.mkdir(parents=True, exist_ok=True)

# soccerdata home for custom leagues
os.environ.setdefault("SOCCERDATA_DIR", str(WORKER / "soccerdata_home"))

# FBref Super Lig
FBREF_COMP_ID = 26
FBREF_LEAGUE_URL = "https://fbref.com/en/comps/26/{season_id}/stats/Super-Lig-Stats"
# season_id examples: "Super-Lig-Stats" current, or "2025-2026/stats/2025-2026-Super-Lig-Stats"

TEAM_ALIASES = {
    "fenerbahce": "Fenerbahçe",
    "fenerbahçe": "Fenerbahçe",
    "galatasaray": "Galatasaray",
    "besiktas": "Beşiktaş",
    "beşiktaş": "Beşiktaş",
    "trabzonspor": "Trabzonspor",
}


def utc_now() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3] + "Z"


def _slug(name: str) -> str:
    tr = str.maketrans("çğıöşüÇĞİÖŞÜéãáí", "cgiosuCGIOSUeaai")
    s = name.translate(tr).lower()
    return re.sub(r"[^a-z0-9]+", "-", s).strip("-")


def _df_records(df) -> list[dict[str, Any]]:
    import pandas as pd

    if df is None or (hasattr(df, "empty") and df.empty):
        return []
    # Flatten multiindex columns
    if isinstance(df.columns, pd.MultiIndex):
        df = df.copy()
        df.columns = [
            "_".join(str(c).strip() for c in col if str(c).strip() and str(c) != "nan").strip("_")
            for col in df.columns.values
        ]
    df = df.reset_index()
    # NaN -> None
    records = json.loads(df.to_json(orient="records", date_format="iso"))
    return records


def _try_use_edge_as_chrome() -> None:
    """Chrome yoksa Edge binary yolunu Selenium/UC için dene."""
    candidates = [
        r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
        r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
        os.environ.get("LOCALAPPDATA", "") + r"\Microsoft\Edge\Application\msedge.exe",
        r"C:\Program Files\Google\Chrome\Application\chrome.exe",
        r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
    ]
    for p in candidates:
        if p and Path(p).exists():
            os.environ.setdefault("BINARY_LOCATION", p)
            os.environ.setdefault("SB_BINARY_LOCATION", p)
            os.environ.setdefault("CHROME_PATH", p)
            logger.info("Browser binary: %s", p)
            return
    logger.warning("Chrome/Edge binary bulunamadı")


def fetch_via_soccerdata(season: str = "2025-26") -> dict[str, Any]:
    """soccerdata FBref — Super Lig player/team season stats.

    Not: soccerdata FBref Cloudflare için Chrome/UC driver ister.
    Chrome yoksa Edge binary denenir; yoksa RuntimeError → HTML fallback.
    """
    import soccerdata as sd

    _try_use_edge_as_chrome()

    used_league = "TUR-Super Lig"
    last_err: Exception | None = None
    fbref = None

    # Ensure custom league in config if possible
    league_dict_path = WORKER / "soccerdata_home" / "config" / "league_dict.json"
    try:
        cfg = {}
        if league_dict_path.exists():
            cfg = json.loads(league_dict_path.read_text(encoding="utf-8"))
        cfg.setdefault(
            "TUR-Super Lig",
            {
                "FBref": "Super Lig",
                "season_start": "Aug",
                "season_end": "May",
            },
        )
        league_dict_path.parent.mkdir(parents=True, exist_ok=True)
        league_dict_path.write_text(json.dumps(cfg, ensure_ascii=False, indent=2), encoding="utf-8")
    except Exception as e:
        logger.warning("league_dict update: %s", e)

    try:
        fbref = sd.FBref(leagues=used_league, seasons=season)
    except Exception as e:
        last_err = e
        raise RuntimeError(
            f"soccerdata FBref init failed ({e}). "
            "Chrome yüklü olmalı (Cloudflare). HTML fallback denenecek."
        ) from e

    result: dict[str, Any] = {
        "schemaVersion": 1,
        "provider": "fbref",
        "seasonKey": season,
        "competition": "Trendyol Süper Lig",
        "leagueKey": used_league,
        "fetchedAt": utc_now(),
        "playerSeasonStats": [],
        "teamSeasonStats": [],
        "schedule": [],
        "source": "soccerdata.FBref",
    }

    # Player season stats (standard + shooting if available)
    for reader_name, key in [
        ("standard", "playerSeasonStats"),
    ]:
        try:
            if hasattr(fbref, "read_player_season_stats"):
                df = fbref.read_player_season_stats(stat_type="standard")
                result["playerSeasonStats"] = _df_records(df)
        except TypeError:
            try:
                df = fbref.read_player_season_stats()
                result["playerSeasonStats"] = _df_records(df)
            except Exception as e:
                logger.warning("player season stats: %s", e)
        except Exception as e:
            logger.warning("player season stats (%s): %s", reader_name, e)

    try:
        if hasattr(fbref, "read_team_season_stats"):
            try:
                tdf = fbref.read_team_season_stats(stat_type="standard")
            except TypeError:
                tdf = fbref.read_team_season_stats()
            result["teamSeasonStats"] = _df_records(tdf)
    except Exception as e:
        logger.warning("team season stats: %s", e)

    try:
        if hasattr(fbref, "read_schedule"):
            sdf = fbref.read_schedule()
            result["schedule"] = _df_records(sdf)
    except Exception as e:
        logger.warning("schedule: %s", e)

    # Filter Fenerbahçe players if column exists
    fb_players = []
    for row in result["playerSeasonStats"]:
        team_blob = " ".join(
            str(row.get(k, ""))
            for k in row
            if "team" in k.lower() or "squad" in k.lower()
        ).lower()
        if "fenerbah" in team_blob or "fener" in team_blob:
            fb_players.append(row)
    result["fenerbahcePlayers"] = fb_players
    result["counts"] = {
        "players": len(result["playerSeasonStats"]),
        "teams": len(result["teamSeasonStats"]),
        "schedule": len(result["schedule"]),
        "fbPlayers": len(fb_players),
    }
    return result


def fetch_via_html_fallback(season: str = "2025-26") -> dict[str, Any]:
    """
    Minimal FBref HTML fallback: Super Lig player stats table.
    season '2025-26' -> path segment 2025-2026
    """
    season_path = season.replace("-", "-")
    if re.match(r"^\d{4}-\d{2}$", season):
        y1, y2 = season.split("-")
        y2_full = y1[:2] + y2 if len(y2) == 2 else y2
        season_path = f"{y1}-{y2_full}"

    urls = [
        f"https://fbref.com/en/comps/{FBREF_COMP_ID}/{season_path}/stats/{season_path}-Super-Lig-Stats",
        f"https://fbref.com/en/comps/{FBREF_COMP_ID}/stats/Super-Lig-Stats",
    ]

    html = None
    used_url = None
    last_status = None

    # Try scrapling then urllib
    for url in urls:
        try:
            from scrapling import Fetcher

            r = Fetcher.get(url, timeout=45, impersonate="chrome")
            last_status = r.status
            if r.status == 200 and r.text and len(r.text) > 5000:
                html = r.text
                used_url = url
                break
        except Exception as e:
            logger.warning("scrapling FBref %s: %s", url, e)
        try:
            import urllib.request

            req = urllib.request.Request(
                url,
                headers={
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120 Safari/537.36",
                    "Accept-Language": "en-US,en;q=0.9",
                },
            )
            with urllib.request.urlopen(req, timeout=45) as resp:
                last_status = resp.status
                html = resp.read().decode("utf-8", errors="replace")
                if html and len(html) > 5000:
                    used_url = url
                    break
                html = None
        except Exception as e:
            logger.warning("urllib FBref %s: %s", url, e)
        time.sleep(1.2)

    if not html:
        raise RuntimeError(f"FBref HTML fetch failed (last_status={last_status})")

    # Parse tables with pandas
    import pandas as pd

    tables = pd.read_html(html)
    players: list[dict] = []
    for t in tables:
        cols = [str(c).lower() for c in t.columns]
        flat = " ".join(cols)
        if "player" in flat and ("gls" in flat or "goals" in flat or "mp" in flat):
            if isinstance(t.columns, pd.MultiIndex):
                t = t.copy()
                t.columns = [
                    "_".join(str(x) for x in c if str(x) != "nan").strip("_")
                    for c in t.columns.values
                ]
            recs = json.loads(t.to_json(orient="records"))
            players.extend(recs)
            break

    fb_players = [
        r
        for r in players
        if "fenerbah" in json.dumps(r, ensure_ascii=False).lower()
    ]

    return {
        "schemaVersion": 1,
        "provider": "fbref",
        "seasonKey": season,
        "competition": "Trendyol Süper Lig",
        "fetchedAt": utc_now(),
        "playerSeasonStats": players,
        "teamSeasonStats": [],
        "schedule": [],
        "fenerbahcePlayers": fb_players,
        "source": "fbref_html",
        "sourceUrl": used_url,
        "counts": {
            "players": len(players),
            "fbPlayers": len(fb_players),
        },
    }


def normalize_to_advanced_player_docs(payload: dict[str, Any]) -> list[dict[str, Any]]:
    """Convert FBref rows → advancedPlayerStats-like docs for FB players."""
    docs = []
    season = payload.get("seasonKey") or "2025-26"
    rows = payload.get("fenerbahcePlayers") or []
    if not rows:
        # if filter empty, take all and tag
        rows = payload.get("playerSeasonStats") or []

    for row in rows:
        # Flexible field names
        name = (
            row.get("player")
            or row.get("Player")
            or row.get("player_Player")
            or row.get("Unnamed: 1_level_1")
            or ""
        )
        if not name or str(name).lower() in ("player", "rk"):
            continue
        name = str(name).strip()
        slug = _slug(name)
        metrics: dict[str, Any] = {}
        key_map = {
            "goals": ["gls", "goals", "Gls", "Performance_Gls", "standard_Gls"],
            "assists": ["ast", "assists", "Ast", "Performance_Ast", "standard_Ast"],
            "minutes": ["min", "minutes", "Min", "Playing Time_Min", "standard_Min"],
            "mp": ["mp", "MP", "Playing Time_MP"],
            "xg": ["xg", "xG", "Expected_xG", "standard_xG"],
            "xa": ["xag", "xa", "xA", "Expected_xAG", "standard_xAG"],
            "shots": ["sh", "Sh", "Standard_Sh"],
            "shotsOnTarget": ["sot", "SoT", "Standard_SoT"],
        }
        lower_row = {str(k).lower(): v for k, v in row.items()}
        for metric, candidates in key_map.items():
            for c in candidates:
                if c in row and row[c] is not None:
                    try:
                        metrics[metric] = float(row[c]) if row[c] != "" else None
                    except (TypeError, ValueError):
                        metrics[metric] = None
                    break
                cl = c.lower()
                if cl in lower_row and lower_row[cl] is not None:
                    try:
                        metrics[metric] = float(lower_row[cl]) if lower_row[cl] != "" else None
                    except (TypeError, ValueError):
                        metrics[metric] = None
                    break

        docs.append(
            {
                "schemaVersion": 1,
                "id": f"{slug}__{season}__fbref",
                "playerDocumentId": slug,
                "playerName": name,
                "seasonKey": season,
                "competition": "Trendyol Süper Lig",
                "provider": "fbref",
                "metrics": metrics,
                "raw": {k: row[k] for k in list(row)[:40]},
                "sourceUrl": payload.get("sourceUrl"),
                "fetchedAt": payload.get("fetchedAt") or utc_now(),
            }
        )
    return docs


def run(season: str = "2025-26") -> dict[str, Any]:
    """Main entry: try soccerdata, then HTML."""
    errors = []
    payload = None
    try:
        payload = fetch_via_soccerdata(season)
        if not payload.get("playerSeasonStats") and not payload.get("teamSeasonStats"):
            errors.append("soccerdata returned empty stats")
            payload = None
    except Exception as e:
        errors.append(f"soccerdata: {e}")
        payload = None

    if payload is None:
        try:
            payload = fetch_via_html_fallback(season)
        except Exception as e:
            errors.append(f"html: {e}")
            raise RuntimeError("; ".join(errors)) from e

    payload["errors"] = errors
    docs = normalize_to_advanced_player_docs(payload)
    payload["advancedPlayerDocs"] = docs

    # Write outputs
    stamp = season.replace("/", "-")
    raw_path = OUT_DIR / f"superlig_player_stats_{stamp}.json"
    adv_path = OUT_DIR / f"advanced_players_{stamp}.json"
    raw_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2, default=str), encoding="utf-8")
    adv_path.write_text(json.dumps(docs, ensure_ascii=False, indent=2, default=str), encoding="utf-8")
    payload["outputFiles"] = [str(raw_path), str(adv_path)]
    return payload
