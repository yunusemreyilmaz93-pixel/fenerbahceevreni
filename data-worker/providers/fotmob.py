# -*- coding: utf-8 -*-
"""
FotMob unofficial API adapter (Faz B).

Kaynak: https://www.fotmob.com/api/*
- Super Lig league id: 71
- Fenerbahçe team id: 9826 (yaygın; search ile doğrulanır)

Çıktı: xG, team stats, shotmap, player ratings → advancedMatchStats şekline yakın.
Kırılgan: token/bot koruması olabilir; rate-limit uygula.
"""
from __future__ import annotations

import json
import logging
import re
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

logger = logging.getLogger("fotmob")

WORKER = Path(__file__).resolve().parent.parent
OUT_DIR = WORKER / "output" / "fotmob"
OUT_DIR.mkdir(parents=True, exist_ok=True)

# 2025+ FotMob public JSON prefix: /api/data/* (eski /api/teams 404)
BASE = "https://www.fotmob.com/api/data"
# Bilinen ID'ler (doğrulama search ile)
DEFAULT_LEAGUE_ID = 71  # Super Lig
DEFAULT_TEAM_ID = 8695  # Fenerbahçe (FotMob) — 9826 Crystal Palace, karıştırma
DEFAULT_TEAM_NAME = "Fenerbahçe"

UA = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
)


def utc_now() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3] + "Z"


def _request(path: str, params: dict | None = None, timeout: int = 40) -> Any:
    q = f"?{urllib.parse.urlencode(params)}" if params else ""
    url = f"{BASE}{path}{q}"
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": UA,
            "Accept": "application/json,text/plain,*/*",
            "Accept-Language": "en-US,en;q=0.9,tr;q=0.8",
            "Referer": "https://www.fotmob.com/",
            "Origin": "https://www.fotmob.com",
        },
        method="GET",
    )
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            raw = resp.read()
            if not raw:
                raise RuntimeError(f"Empty body: {url}")
            # Sometimes HTML challenge
            text = raw.decode("utf-8", errors="replace")
            if text.lstrip().startswith("<!"):
                raise RuntimeError(f"HTML challenge/block: {url}")
            return json.loads(text)
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", errors="replace")[:200]
        raise RuntimeError(f"HTTP {e.code} {url}: {body}") from e


def search_team(query: str = "Fenerbahce") -> dict[str, Any] | None:
    # suggest endpoint site root'ta kalabilir
    for base in (BASE, "https://www.fotmob.com/api"):
        try:
            url_path = "/searchapi/suggest" if "api/data" not in base else "/search"
            # skip complex search; team id known
            break
        except Exception:
            continue
    return {"id": DEFAULT_TEAM_ID, "name": DEFAULT_TEAM_NAME}


def get_team_fixtures(team_id: int = DEFAULT_TEAM_ID) -> dict[str, Any]:
    return _request("/teams", {"id": team_id})


def get_league(league_id: int = DEFAULT_LEAGUE_ID, season: str | None = None) -> dict[str, Any]:
    params: dict[str, Any] = {"id": league_id}
    if season:
        params["season"] = season
    return _request("/leagues", params)


def get_match_details(match_id: int | str) -> dict[str, Any]:
    # Primary: /api/data/matchDetails
    try:
        return _request("/matchDetails", {"matchId": match_id})
    except Exception as e1:
        # Fallback old path
        try:
            q = urllib.parse.urlencode({"matchId": match_id})
            url = f"https://www.fotmob.com/api/matchDetails?{q}"
            req = urllib.request.Request(
                url,
                headers={
                    "User-Agent": UA,
                    "Accept": "application/json",
                    "Referer": "https://www.fotmob.com/",
                },
            )
            with urllib.request.urlopen(req, timeout=40) as resp:
                return json.loads(resp.read().decode("utf-8"))
        except Exception as e2:
            raise RuntimeError(f"matchDetails failed: {e1}; fallback: {e2}") from e2


def _team_id_in_match_obj(obj: dict, team_id: int) -> bool:
    """True if this fixture object is clearly about team_id (avoids rival noise)."""
    tid = str(team_id)
    home = obj.get("home") or {}
    away = obj.get("away") or {}
    for side in (home, away):
        if not isinstance(side, dict):
            continue
        for key in ("id", "teamId", "idTeam"):
            if side.get(key) is not None and str(side.get(key)) == tid:
                return True
    # pageUrl sometimes embeds /teams/8695/
    page = str(obj.get("pageUrl") or obj.get("matchUrl") or "")
    if f"/{tid}" in page or f"id={tid}" in page:
        return True
    # name fallback for Fenerbahçe only when ids missing
    for side in (home, away):
        if not isinstance(side, dict):
            continue
        name = str(side.get("name") or side.get("teamName") or "")
        if "fenerbah" in name.lower():
            return True
    return False


def involves_fenerbahce(home: str, away: str) -> bool:
    blob = f"{home or ''} {away or ''}".lower()
    return "fenerbah" in blob


def extract_match_ids_from_team(
    team_payload: dict[str, Any],
    limit: int = 10,
    team_id: int = DEFAULT_TEAM_ID,
) -> list[str]:
    """Pull finished match ids for this team only (skip league noise / wrong clubs)."""
    finished: list[str] = []
    upcoming: list[str] = []

    def add_from_match_obj(obj: dict):
        mid = obj.get("id")
        if mid is None and obj.get("pageUrl"):
            m = re.search(r"#(\d{6,})", str(obj["pageUrl"]))
            mid = m.group(1) if m else None
        if mid is None and obj.get("matchId"):
            mid = obj.get("matchId")
        if mid is None:
            return
        # CRITICAL: only keep fixtures for the requested team (prevents Palace etc.)
        if not _team_id_in_match_obj(obj, team_id):
            return
        mid = str(mid)
        status = obj.get("status") or {}
        finished_flag = bool(
            status.get("finished")
            or obj.get("status", {}).get("finished")
            if isinstance(obj.get("status"), dict)
            else False
        )
        home = obj.get("home") or {}
        away = obj.get("away") or {}
        has_score = home.get("score") is not None and away.get("score") is not None
        not_started = bool(obj.get("notStarted") or status.get("started") is False)
        if finished_flag or (has_score and not not_started):
            if mid not in finished:
                finished.append(mid)
        else:
            if mid not in upcoming and mid not in finished:
                upcoming.append(mid)

    def walk_matches(obj: Any):
        if isinstance(obj, dict):
            if ("home" in obj and "away" in obj) or "pageUrl" in obj:
                if isinstance(obj.get("home"), dict) or "pageUrl" in obj:
                    add_from_match_obj(obj)
            for v in obj.values():
                walk_matches(v)
        elif isinstance(obj, list):
            for v in obj:
                walk_matches(v)

    # Prefer fixtures block only (overview often has other teams' widgets)
    if "fixtures" in team_payload:
        walk_matches(team_payload["fixtures"])
    if len(finished) < limit:
        # allFixtures / fixturesAll variants
        for key in ("allFixtures", "fixturesAll", "fixture", "matches"):
            if key in team_payload:
                walk_matches(team_payload[key])
    if len(finished) < limit:
        walk_matches(team_payload.get("overview") or {})
    # Full payload walk is last resort and still team-filtered
    if len(finished) < limit:
        walk_matches(team_payload)

    ordered = list(reversed(finished)) + upcoming
    seen = set()
    out = []
    for i in ordered:
        if i not in seen:
            seen.add(i)
            out.append(i)
    return out[:limit]


def parse_advanced_from_match(details: dict[str, Any], match_id: str) -> dict[str, Any]:
    """Normalize FotMob matchDetails → advancedMatchStats-like document."""
    general = details.get("general") or {}
    header = details.get("header") or {}
    content = details.get("content") or {}

    home_name = (
        (header.get("teams") or [{}])[0].get("name")
        if isinstance(header.get("teams"), list) and header.get("teams")
        else general.get("homeTeam", {}).get("name")
        if isinstance(general.get("homeTeam"), dict)
        else "Home"
    )
    away_name = (
        (header.get("teams") or [{}, {}])[1].get("name")
        if isinstance(header.get("teams"), list) and len(header.get("teams") or []) > 1
        else general.get("awayTeam", {}).get("name")
        if isinstance(general.get("awayTeam"), dict)
        else "Away"
    )

    # Scores
    status = header.get("status") or {}
    score_str = status.get("scoreStr") or ""

    team_metrics = {"home": {}, "away": {}}
    stats_block = (content.get("stats") or {})
    # periods[0].stats or stats
    periods = stats_block.get("Periods") or stats_block.get("periods") or {}
    all_stats = periods.get("All") or periods.get("all") or stats_block

    def ingest_stat_list(stat_list: list):
        for s in stat_list:
            title = (s.get("title") or s.get("key") or "").lower()
            stats = s.get("stats") or s.get("statsItems") or []
            if not isinstance(stats, list):
                continue
            for item in stats:
                key = (item.get("title") or item.get("key") or item.get("type") or "").strip()
                if not key:
                    continue
                vals = item.get("stats") or item.get("values") or []
                if isinstance(vals, list) and len(vals) >= 2:
                    team_metrics["home"][key] = vals[0]
                    team_metrics["away"][key] = vals[1]

    if isinstance(all_stats, dict):
        for k, v in all_stats.items():
            if isinstance(v, list):
                ingest_stat_list(v)
            elif isinstance(v, dict) and "stats" in v:
                ingest_stat_list(v.get("stats") or [])
    elif isinstance(all_stats, list):
        ingest_stat_list(all_stats)

    # xG often under Expected goals
    def find_xg(side: str) -> float | None:
        for k, v in team_metrics[side].items():
            if "expected goal" in k.lower() or k.lower() in ("xg", "xG"):
                try:
                    return float(str(v).replace("%", ""))
                except ValueError:
                    return None
        return None

    if find_xg("home") is not None:
        team_metrics["home"]["expectedGoals"] = find_xg("home")
    if find_xg("away") is not None:
        team_metrics["away"]["expectedGoals"] = find_xg("away")

    # Shotmap
    shotmap_raw = content.get("shotmap") or details.get("shotmap") or {}
    shots = shotmap_raw.get("shots") if isinstance(shotmap_raw, dict) else shotmap_raw
    shot_events = []
    if isinstance(shots, list):
        for sh in shots:
            shot_events.append(
                {
                    "x": sh.get("x") or sh.get("eventType"),
                    "y": sh.get("y"),
                    "xG": sh.get("expectedGoals") or sh.get("xg") or sh.get("xG"),
                    "playerName": (sh.get("playerName") or (sh.get("player") or {}).get("name")),
                    "outcome": sh.get("eventType") or sh.get("shotType") or sh.get("situation"),
                    "minute": sh.get("min") or sh.get("minute"),
                    "teamId": sh.get("teamId"),
                    "isHome": sh.get("isHome"),
                }
            )

    # Player ratings from lineup
    player_metrics = []
    lineup = content.get("lineup") or {}
    for side_key, side in (("home", "home"), ("away", "away")):
        team_line = lineup.get(side_key) or lineup.get(side) or {}
        players = team_line.get("players") or []
        # nested [[]]
        flat = []
        for row in players:
            if isinstance(row, list):
                flat.extend(row)
            elif isinstance(row, dict):
                flat.append(row)
        for p in flat:
            if not isinstance(p, dict):
                continue
            name = p.get("name") or (p.get("player") or {}).get("name")
            rating = None
            for rk in ("rating", "ratingTitle", "performance"):
                if p.get(rk) is not None:
                    try:
                        rating = float(p[rk])
                    except (TypeError, ValueError):
                        pass
            if name:
                player_metrics.append(
                    {
                        "playerName": name,
                        "teamSide": side_key,
                        "metrics": {"rating": rating},
                        "providerPlayerId": str(p.get("id") or p.get("playerId") or ""),
                    }
                )

    home_slug = re.sub(r"[^a-z0-9]+", "-", (home_name or "home").lower()).strip("-")
    away_slug = re.sub(r"[^a-z0-9]+", "-", (away_name or "away").lower()).strip("-")
    match_doc_id = f"fotmob-{match_id}"

    return {
        "schemaVersion": 1,
        "id": f"{match_doc_id}__fotmob",
        "matchDocumentId": match_doc_id,
        "provider": "fotmob",
        "providerMatchId": str(match_id),
        "homeTeam": home_name,
        "awayTeam": away_name,
        "score": score_str,
        "competition": general.get("leagueName") or "Trendyol Süper Lig",
        "seasonKey": str(general.get("season") or ""),
        "matchDate": general.get("matchTimeUTC") or general.get("matchTimeUTCDate"),
        "teamMetrics": team_metrics,
        "playerMetrics": player_metrics,
        "shotmap": shot_events,
        "heatmap": None,
        "sourceUrl": f"https://www.fotmob.com/match/{match_id}",
        "fetchedAt": utc_now(),
        "meta": {
            "homeSlug": home_slug,
            "awaySlug": away_slug,
            "finished": bool(general.get("finished") or status.get("finished")),
        },
    }


def export_league_xg_table(league_id: int = DEFAULT_LEAGUE_ID) -> dict[str, Any]:
    """Süper Lig xG / xPoints tablosu (FBref yerine sezon takım metriği)."""
    league = get_league(league_id)
    xg_rows = []
    # table structure varies: table / overview
    blob = league.get("table") or league.get("overview") or league
    raw = json.dumps(blob, ensure_ascii=False)

    def walk(obj: Any):
        if isinstance(obj, dict):
            if obj.get("teamId") and ("xg" in obj or "xG" in obj or "xPoints" in obj):
                xg_rows.append(
                    {
                        "teamId": obj.get("teamId") or obj.get("id"),
                        "teamName": obj.get("teamName") or obj.get("name"),
                        "pts": obj.get("pts") or obj.get("points"),
                        "xg": obj.get("xg") or obj.get("xG"),
                        "xgConceded": obj.get("xgConceded") or obj.get("xGA"),
                        "xPoints": obj.get("xPoints"),
                        "scoresStr": obj.get("scoresStr"),
                        "goalConDiff": obj.get("goalConDiff"),
                    }
                )
            # xg array items: name, id, ...
            if obj.get("name") and obj.get("id") and "pageUrl" in obj and "xg" in json.dumps(obj).lower():
                if any(k in obj for k in ("xg", "xG", "xPoints", "ongoing")):
                    pass
            for v in obj.values():
                walk(v)
        elif isinstance(obj, list):
            # dedicated xg tables often list of teams with xg fields nested differently
            for item in obj:
                if isinstance(item, dict) and item.get("name") and item.get("id"):
                    # try nested stats
                    if "xg" in item or "xG" in item:
                        xg_rows.append(
                            {
                                "teamId": item.get("id"),
                                "teamName": item.get("name"),
                                "xg": item.get("xg") or item.get("xG"),
                                "xgConceded": item.get("xgConceded"),
                                "xPoints": item.get("xPoints"),
                                "pts": item.get("pts"),
                            }
                        )
                walk(item)

    walk(blob)

    # Also regex from full league dump for teamId 8695 block
    # Prefer unique by teamId
    by_id: dict[str, dict] = {}
    for r in xg_rows:
        tid = str(r.get("teamId") or "")
        if not tid:
            continue
        prev = by_id.get(tid) or {}
        # merge non-null
        merged = {**prev, **{k: v for k, v in r.items() if v is not None}}
        by_id[tid] = merged

    rows = list(by_id.values())
    # enrich from known Super Lig xg table if present in overview.table
    try:
        # deep search scoresStr style entries
        for m in re.finditer(
            r'"teamId"\s*:\s*(\d+).*?"teamName"\s*:\s*"([^"]+)".*?"xg"\s*:\s*([0-9.]+).*?"xgConceded"\s*:\s*([0-9.]+).*?"xPoints"\s*:\s*([0-9.]+)',
            raw,
        ):
            tid, name, xg, xgc, xp = m.groups()
            by_id[tid] = {
                "teamId": tid,
                "teamName": name.encode().decode("unicode_escape") if "\\u" in name else name,
                "xg": float(xg),
                "xgConceded": float(xgc),
                "xPoints": float(xp),
            }
        rows = list(by_id.values())
    except Exception:
        pass

    out = {
        "schemaVersion": 1,
        "provider": "fotmob",
        "competition": "Trendyol Süper Lig",
        "leagueId": league_id,
        "fetchedAt": utc_now(),
        "teams": rows,
        "fenerbahce": by_id.get(str(DEFAULT_TEAM_ID)),
    }
    path = OUT_DIR / "superlig_xg_table.json"
    path.write_text(json.dumps(out, ensure_ascii=False, indent=2), encoding="utf-8")
    # also save raw league for debugging
    (OUT_DIR / "league_71.json").write_text(
        json.dumps(league, ensure_ascii=False, indent=2, default=str),
        encoding="utf-8",
    )
    out["outputFile"] = str(path)
    return out


def run(
    team_id: int = DEFAULT_TEAM_ID,
    limit: int = 10,
    match_id: str | None = None,
    delay: float = 1.1,
) -> dict[str, Any]:
    """
    Fetch last N matches advanced packs for Fenerbahçe (or single match_id).
    B DoD default: limit=10 finished packs with xG/shotmap when available.
    """
    results: list[dict] = []
    errors: list[str] = []
    skipped: list[str] = []
    match_ids: list[str] = []
    require_fb = int(team_id) == int(DEFAULT_TEAM_ID)

    if match_id:
        match_ids = [str(match_id)]
    else:
        try:
            team = get_team_fixtures(team_id)
            team_path = OUT_DIR / f"team_{team_id}.json"
            team_path.write_text(json.dumps(team, ensure_ascii=False, indent=2, default=str), encoding="utf-8")
            match_ids = extract_match_ids_from_team(team, limit=limit, team_id=team_id)
            if not match_ids:
                errors.append("No match ids found in team payload for this team")
        except Exception as e:
            errors.append(f"team fetch: {e}")
            try:
                league = get_league(DEFAULT_LEAGUE_ID)
                (OUT_DIR / "league_71.json").write_text(
                    json.dumps(league, ensure_ascii=False, indent=2, default=str),
                    encoding="utf-8",
                )
                blob_ids = extract_match_ids_from_team(
                    league, limit=limit * 3, team_id=team_id
                )
                match_ids = blob_ids[:limit]
            except Exception as e2:
                errors.append(f"league fallback: {e2}")

    adv_dir = WORKER / "output" / "advanced"
    adv_dir.mkdir(parents=True, exist_ok=True)

    for mid in match_ids[:limit]:
        try:
            time.sleep(delay)
            details = get_match_details(mid)
            raw_path = OUT_DIR / f"match_raw_{mid}.json"
            raw_path.write_text(json.dumps(details, ensure_ascii=False, indent=2, default=str), encoding="utf-8")
            adv = parse_advanced_from_match(details, mid)
            # Drop wrong-club pollution (e.g. Crystal Palace when team=8695)
            if require_fb and not involves_fenerbahce(
                str(adv.get("homeTeam") or ""), str(adv.get("awayTeam") or "")
            ):
                skipped.append(f"match {mid}: not Fenerbahçe ({adv.get('homeTeam')} vs {adv.get('awayTeam')})")
                logger.warning("skip non-FB match %s", mid)
                continue
            adv_path = OUT_DIR / f"match_adv_{mid}.json"
            adv_path.write_text(json.dumps(adv, ensure_ascii=False, indent=2, default=str), encoding="utf-8")
            (adv_dir / f"{adv['matchDocumentId']}__fotmob.json").write_text(
                json.dumps(adv, ensure_ascii=False, indent=2, default=str),
                encoding="utf-8",
            )
            results.append(adv)
            xg_h = (adv.get("teamMetrics") or {}).get("home", {}).get("expectedGoals")
            xg_a = (adv.get("teamMetrics") or {}).get("away", {}).get("expectedGoals")
            logger.info(
                "OK match %s shots=%s xG=%s-%s",
                mid,
                len(adv.get("shotmap") or []),
                xg_h,
                xg_a,
            )
        except Exception as e:
            errors.append(f"match {mid}: {e}")
            logger.warning("match %s failed: %s", mid, e)

    # Coverage report (B DoD: last N FB advanced packs)
    packs_with_shotmap = sum(1 for m in results if (m.get("shotmap") or []))
    packs_with_xg = sum(
        1
        for m in results
        if (m.get("teamMetrics") or {}).get("home", {}).get("expectedGoals") is not None
        or (m.get("teamMetrics") or {}).get("away", {}).get("expectedGoals") is not None
    )
    coverage = {
        "targetLimit": limit,
        "packsOk": len(results),
        "packsWithShotmap": packs_with_shotmap,
        "packsWithXg": packs_with_xg,
        "bDodMet": len(results) >= min(limit, 10) or len(results) >= 10,
        "skippedWrongClub": len(skipped),
        "errors": len(errors),
    }

    summary = {
        "schemaVersion": 1,
        "provider": "fotmob",
        "teamId": team_id,
        "fetchedAt": utc_now(),
        "matchIds": match_ids[:limit],
        "successCount": len(results),
        "failedCount": len(errors),
        "errors": errors,
        "skipped": skipped,
        "coverage": coverage,
        "matches": results,
    }
    (OUT_DIR / "last_run_summary.json").write_text(
        json.dumps(summary, ensure_ascii=False, indent=2, default=str),
        encoding="utf-8",
    )
    (OUT_DIR / "coverage_b_dod.json").write_text(
        json.dumps({"fetchedAt": utc_now(), **coverage, "sample": [
            {
                "id": m.get("id"),
                "home": m.get("homeTeam"),
                "away": m.get("awayTeam"),
                "score": m.get("score"),
                "shots": len(m.get("shotmap") or []),
                "xgHome": (m.get("teamMetrics") or {}).get("home", {}).get("expectedGoals"),
                "xgAway": (m.get("teamMetrics") or {}).get("away", {}).get("expectedGoals"),
            }
            for m in results
        ]}, ensure_ascii=False, indent=2, default=str),
        encoding="utf-8",
    )
    if not results and errors:
        raise RuntimeError("; ".join(errors[:5]))
    return summary
