# -*- coding: utf-8 -*-
"""
API-Football (API-Sports) provider — free plan ~100 req/day.

Env (server/worker only, never VITE_):
  APISPORTS_KEY  or  API_FOOTBALL_KEY

IDs (api-sports v3):
  Super Lig league = 203
  Fenerbahçe team  = 611
  Season           = start year (2025 => 2025-26)
"""
from __future__ import annotations

import json
import os
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from urllib.parse import urlencode

import requests

BASE_URL = "https://v3.football.api-sports.io"
LEAGUE_SUPER_LIG = 203
TEAM_FENERBAHCE = 611

# Local logo map (prefer site assets over remote CDN)
LOGO_BY_TEAM_NAME: dict[str, str] = {
    "galatasaray": "/logos/galatasaray.svg",
    "fenerbahçe": "/logos/fenerbahce.png",
    "fenerbahce": "/logos/fenerbahce.png",
    "trabzonspor": "/logos/trabzonspor.png",
    "beşiktaş": "/logos/besiktas.svg",
    "besiktas": "/logos/besiktas.svg",
    "istanbul basaksehir": "/logos/basaksehir.png",
    "başakşehir": "/logos/basaksehir.png",
    "basaksehir": "/logos/basaksehir.png",
    "göztepe": "/logos/goztepe.png",
    "goztepe": "/logos/goztepe.png",
    "samsunspor": "/logos/samsunspor.png",
    "caykur rizespor": "/logos/rizespor.png",
    "çaykur rizespor": "/logos/rizespor.png",
    "rizespor": "/logos/rizespor.png",
    "konyaspor": "/logos/konyaspor.png",
    "kocaelispor": "/logos/kocaelispor.png",
    "alanyaspor": "/logos/alanyaspor.png",
    "gaziantep fk": "/logos/gaziantep-fk.png",
    "gaziantep": "/logos/gaziantep-fk.png",
    "kasimpasa": "/logos/kasimpasa.png",
    "kasımpaşa": "/logos/kasimpasa.png",
    "genclerbirligi": "/logos/genclerbirligi.png",
    "gençlerbirliği": "/logos/genclerbirligi.png",
    "eyüpspor": "/logos/eyupspor.png",
    "eyupspor": "/logos/eyupspor.png",
    "antalyaspor": "/logos/antalyaspor.png",
    "kayserispor": "/logos/kayserispor.png",
    "fatih karagümrük": "/logos/fatih-karagumruk.png",
    "karagumruk": "/logos/fatih-karagumruk.png",
}


class ApiFootballError(Exception):
    def __init__(self, message: str, *, status: int | None = None, payload: Any = None):
        super().__init__(message)
        self.status = status
        self.payload = payload

    @property
    def is_plan_season_limit(self) -> bool:
        msg = str(self).lower()
        return "free plans do not have access" in msg or "try from 2022" in msg


# Free plan (api-sports): historical seasons typically 2022–2024 only.
# Override with API_FOOTBALL_SEASON env. Paid plans unlock current season.
DEFAULT_FREE_SEASON = 2024


def utc_now() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3] + "Z"


def get_api_key(env: dict[str, str] | None = None) -> str | None:
    e = env if env is not None else {k: str(v) for k, v in os.environ.items()}
    for k in ("APISPORTS_KEY", "API_FOOTBALL_KEY", "API_SPORTS_KEY"):
        v = (e.get(k) or "").strip()
        if v:
            return v
    return None


def resolve_logo(team_name: str | None, remote: str | None = None) -> str:
    if not team_name:
        return remote or ""
    key = team_name.strip().lower()
    if key in LOGO_BY_TEAM_NAME:
        return LOGO_BY_TEAM_NAME[key]
    # fuzzy contains
    for name, path in LOGO_BY_TEAM_NAME.items():
        if name in key or key in name:
            return path
    return remote or ""


def parse_match_status(short: str | None) -> str:
    s = (short or "NS").upper()
    if s in ("FT", "AET", "PEN"):
        return "finished"
    if s in ("1H", "2H", "HT", "ET", "BT", "P", "LIVE", "INT"):
        return "live"
    if s in ("PST", "CANC", "ABD", "AWD", "WO"):
        return "cancelled"
    return "upcoming"


class ApiFootballClient:
    """Thin client with request budget tracking (free plan ~100/day)."""

    def __init__(self, api_key: str | None = None, timeout: float = 30.0):
        self.api_key = api_key or get_api_key()
        if not self.api_key:
            raise ApiFootballError(
                "API anahtarı yok. APISPORTS_KEY (veya API_FOOTBALL_KEY) ayarlayın."
            )
        self.timeout = timeout
        self.request_count = 0
        self.last_rate: dict[str, str] = {}

    def get(self, path: str, params: dict[str, Any] | None = None) -> dict[str, Any]:
        url = f"{BASE_URL.rstrip('/')}/{path.lstrip('/')}"
        if params:
            url = f"{url}?{urlencode({k: v for k, v in params.items() if v is not None})}"
        headers = {
            "x-apisports-key": self.api_key,
            "Accept": "application/json",
        }
        try:
            r = requests.get(url, headers=headers, timeout=self.timeout)
        except requests.RequestException as e:
            raise ApiFootballError(f"Ağ hatası: {e}") from e

        self.request_count += 1
        self.last_rate = {
            "limit": r.headers.get("x-ratelimit-requests-limit")
            or r.headers.get("x-ratelimit-limit")
            or "",
            "remaining": r.headers.get("x-ratelimit-requests-remaining")
            or r.headers.get("x-ratelimit-remaining")
            or "",
        }

        if r.status_code == 429:
            raise ApiFootballError("Rate limit (429)", status=429)
        if r.status_code >= 400:
            raise ApiFootballError(
                f"HTTP {r.status_code}: {r.text[:200]}", status=r.status_code
            )

        try:
            data = r.json()
        except Exception as e:
            raise ApiFootballError("JSON parse hatası", status=r.status_code) from e

        errors = data.get("errors")
        if errors and (isinstance(errors, dict) and len(errors) > 0 or isinstance(errors, list) and errors):
            raise ApiFootballError(
                f"API errors: {errors}", status=r.status_code, payload=data
            )
        return data

    def status(self) -> dict[str, Any]:
        return self.get("status")

    def standings(self, *, league: int = LEAGUE_SUPER_LIG, season: int) -> dict[str, Any]:
        return self.get("standings", {"league": league, "season": season})

    def fixtures_by_team(
        self,
        *,
        team: int = TEAM_FENERBAHCE,
        season: int,
        league: int | None = LEAGUE_SUPER_LIG,
    ) -> dict[str, Any]:
        params: dict[str, Any] = {"team": team, "season": season}
        if league is not None:
            params["league"] = league
        return self.get("fixtures", params)

    def fixtures_next(self, *, team: int = TEAM_FENERBAHCE, next_n: int = 5) -> dict[str, Any]:
        return self.get("fixtures", {"team": team, "next": next_n})

    def fixtures_last(self, *, team: int = TEAM_FENERBAHCE, last_n: int = 5) -> dict[str, Any]:
        return self.get("fixtures", {"team": team, "last": last_n})


def normalize_standings_table(
    raw: dict[str, Any],
    *,
    season: int,
    league_id: int = LEAGUE_SUPER_LIG,
) -> dict[str, Any]:
    """API response → site standings.json shape."""
    fetched = utc_now()
    resp = raw.get("response") or []
    if not resp:
        raise ApiFootballError("Standings response boş", payload=raw)

    league = resp[0].get("league") or {}
    tables = league.get("standings") or []
    # Usually standings is list of groups; Super Lig is single table
    rows = tables[0] if tables and isinstance(tables[0], list) else tables
    if not isinstance(rows, list) or len(rows) < 1:
        raise ApiFootballError("Standings satırları yetersiz", payload=raw)

    standings_list = []
    for row in rows:
        if not isinstance(row, dict):
            continue
        team = row.get("team") or {}
        alls = row.get("all") or {}
        goals = alls.get("goals") or {}
        name = team.get("name") or "?"
        standings_list.append(
            {
                "rank": row.get("rank"),
                "teamName": name,
                "teamId": team.get("id"),
                "logo": resolve_logo(name, team.get("logo")),
                "played": alls.get("played"),
                "win": alls.get("win"),
                "draw": alls.get("draw"),
                "lose": alls.get("lose"),
                "goalsFor": goals.get("for"),
                "goalsAgainst": goals.get("against"),
                "goalsDiff": row.get("goalsDiff"),
                "points": row.get("points"),
                "form": row.get("form"),
            }
        )

    season_label = f"{season}-{str(season + 1)[-2:]}"
    return {
        "id": f"super-lig-{season_label}",
        "season": season_label,
        "seasonStartYear": season,
        "leagueId": league_id,
        "isFinal": False,
        "source": "api_football",
        "provider": "api_football",
        "sourceUrl": f"{BASE_URL}/standings?league={league_id}&season={season}",
        "updatedAt": fetched,
        "fetchedAt": fetched,
        "standingsList": standings_list,
        "requestMeta": {
            "results": raw.get("results"),
        },
    }


def normalize_fixture_item(item: dict[str, Any]) -> dict[str, Any]:
    """Single API fixture → site match document."""
    fx = item.get("fixture") or {}
    teams = item.get("teams") or {}
    goals = item.get("goals") or {}
    league = item.get("league") or {}
    home = teams.get("home") or {}
    away = teams.get("away") or {}
    venue = fx.get("venue") or {}
    status_short = (fx.get("status") or {}).get("short")
    fid = fx.get("id")
    if not fid:
        raise ApiFootballError("fixture.id yok", payload=item)

    home_name = home.get("name") or "Ev"
    away_name = away.get("name") or "Dep"
    status = parse_match_status(status_short)
    sh = goals.get("home")
    sa = goals.get("away")

    venue_name = venue.get("name") or ""
    venue_city = venue.get("city") or ""
    venue_str = " / ".join(p for p in (venue_name, venue_city) if p) or None

    round_label = league.get("round") or ""
    league_name = league.get("name") or "Süper Lig"
    competition = f"{league_name} · {round_label}".strip(" ·") if round_label else league_name

    doc: dict[str, Any] = {
        "id": f"match-api-{fid}",
        "apiSportsId": int(fid),
        "provider": "api_football",
        "providerIds": {"api_football": str(fid)},
        "homeTeam": home_name,
        "awayTeam": away_name,
        "homeLogo": resolve_logo(home_name, home.get("logo")),
        "awayLogo": resolve_logo(away_name, away.get("logo")),
        "homeTeamApiId": home.get("id"),
        "awayTeamApiId": away.get("id"),
        "competition": competition,
        "leagueId": league.get("id"),
        "leagueSeason": league.get("season"),
        "matchDate": fx.get("date"),
        "venue": venue_str,
        "status": status,
        "statusShort": status_short,
        "scoreHome": int(sh) if sh is not None else (0 if status == "finished" else None),
        "scoreAway": int(sa) if sa is not None else (0 if status == "finished" else None),
        "fetchedAt": utc_now(),
        "statsProvider": "api_football",
        "statsFetchedAt": utc_now(),
    }
    return doc


def normalize_fixtures(
    raw: dict[str, Any],
    *,
    season: int | None = None,
) -> list[dict[str, Any]]:
    resp = raw.get("response") or []
    out: list[dict[str, Any]] = []
    for item in resp:
        if not isinstance(item, dict):
            continue
        try:
            out.append(normalize_fixture_item(item))
        except ApiFootballError:
            continue
    # sort by date
    out.sort(key=lambda m: m.get("matchDate") or "")
    return out


def pick_featured_match(matches: list[dict[str, Any]]) -> str | None:
    """Next upcoming, else live, else latest finished — Fener focus not required if all FB."""
    live = [m for m in matches if m.get("status") == "live"]
    if live:
        return live[0]["id"]
    upcoming = [m for m in matches if m.get("status") == "upcoming"]
    if upcoming:
        return upcoming[0]["id"]
    finished = [m for m in matches if m.get("status") == "finished"]
    if finished:
        return finished[-1]["id"]
    return matches[0]["id"] if matches else None


def merge_matches_into_existing(
    existing: list[dict[str, Any]],
    api_matches: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    """
    Merge API fixtures into CMS matches.
    - API docs keyed match-api-{id} always upserted
    - Non-API / manual matches kept
    - featured: single flag on pick_featured among API + keep if locked elsewhere later
    """
    by_id: dict[str, dict[str, Any]] = {}
    for m in existing:
        if isinstance(m, dict) and m.get("id"):
            by_id[str(m["id"])] = dict(m)

    for am in api_matches:
        mid = str(am["id"])
        prev = by_id.get(mid) or {}
        # Preserve admin locked fields conceptually: keep goals/lineup if set on prev and not in am
        merged = {**prev, **am}
        # Don't wipe rich manual fields that API brief doesn't provide
        for k in ("goals", "lineupHome", "lineupAway", "probableXI", "matchPreview", "referee", "scorerDetailsHome", "scorerDetailsAway"):
            if prev.get(k) and not am.get(k):
                merged[k] = prev[k]
        by_id[mid] = merged

    # Exactly one featured: prefer API pick, else any
    for m in by_id.values():
        m["featured"] = False

    featured_id = pick_featured_match(api_matches) if api_matches else None
    if not featured_id:
        featured_id = pick_featured_match(list(by_id.values()))
    if featured_id and featured_id in by_id:
        by_id[featured_id]["featured"] = True

    result = list(by_id.values())
    result.sort(key=lambda m: m.get("matchDate") or "")
    return result


def fetch_standings_and_fixtures(
    *,
    season: int = 2025,
    league: int = LEAGUE_SUPER_LIG,
    team: int = TEAM_FENERBAHCE,
    include_all_competitions: bool = False,
    sleep_s: float = 0.35,
) -> dict[str, Any]:
    """
    Budget: 2 requests (standings + team fixtures).
    include_all_competitions=True drops league filter → still 1 fixtures call but all comps.
    """
    client = ApiFootballClient()
    st_raw = client.standings(league=league, season=season)
    time.sleep(sleep_s)
    fx_league = None if include_all_competitions else league
    fx_raw = client.fixtures_by_team(team=team, season=season, league=fx_league)

    standings_doc = normalize_standings_table(st_raw, season=season, league_id=league)
    matches = normalize_fixtures(fx_raw, season=season)

    return {
        "standings": standings_doc,
        "matches": matches,
        "requestCount": client.request_count,
        "rateLimit": client.last_rate,
        "fetchedAt": utc_now(),
        "season": season,
        "teamId": team,
        "leagueId": league,
    }


def write_outputs(
    bundle: dict[str, Any],
    *,
    repo_root: Path,
    existing_matches: list[dict[str, Any]] | None = None,
    write_main_standings: bool = False,
) -> dict[str, Path]:
    """
    Write matches.json (merge) + standings side file.
    Main public/data/standings.json only when write_main_standings=True
    (job fallback / explicit --mode standings) — free plan is often not current season.
    """
    from io_utils import atomic_write_json  # local import — same package

    public_data = repo_root / "public" / "data"
    out_dir = repo_root / "data-worker" / "output" / "api_football"
    public_data.mkdir(parents=True, exist_ok=True)
    out_dir.mkdir(parents=True, exist_ok=True)

    standings = bundle["standings"]
    api_matches = bundle["matches"]
    merged = merge_matches_into_existing(existing_matches or [], api_matches)

    standings_side = public_data / "standings.api_football.json"
    atomic_write_json(standings_side, standings)
    standings_path = standings_side
    if write_main_standings:
        standings_path = public_data / "standings.json"
        atomic_write_json(standings_path, standings)

    matches_path = public_data / "matches.json"
    matches_payload = {
        "season": standings.get("season"),
        "updatedAt": utc_now(),
        "source": "api_football",
        "provider": "api_football",
        "fetchedAt": utc_now(),
        "matches": merged,
        "apiMatchCount": len(api_matches),
        "requestCount": bundle.get("requestCount"),
    }
    atomic_write_json(matches_path, matches_payload)

    atomic_write_json(out_dir / "last_bundle_meta.json", {
        "fetchedAt": bundle.get("fetchedAt"),
        "requestCount": bundle.get("requestCount"),
        "rateLimit": bundle.get("rateLimit"),
        "standingsTeams": len(standings.get("standingsList") or []),
        "apiMatches": len(api_matches),
        "mergedMatches": len(merged),
        "season": bundle.get("season"),
        "wroteMainStandings": write_main_standings,
    })
    return {
        "standings": standings_path,
        "standingsSide": standings_side,
        "matches": matches_path,
        "meta": out_dir / "last_bundle_meta.json",
    }
