#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
API-Football fetcher — standings + Fenerbahçe fixtures.

Kullanım:
  set APISPORTS_KEY=...
  python data-worker/fetch_api_football.py --season 2025
  python data-worker/fetch_api_football.py --mode standings --season 2025
  python data-worker/fetch_api_football.py --mode fixtures --season 2025
  python data-worker/fetch_api_football.py --mode status

Free plan budget: standings+fixtures = 2 istek / çalıştırma.
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

WORKER = Path(__file__).resolve().parent
REPO = WORKER.parent
sys.path.insert(0, str(WORKER))

from providers.api_football import (  # noqa: E402
    DEFAULT_FREE_SEASON,
    LEAGUE_SUPER_LIG,
    TEAM_FENERBAHCE,
    ApiFootballClient,
    ApiFootballError,
    fetch_standings_and_fixtures,
    get_api_key,
    merge_matches_into_existing,
    normalize_fixtures,
    normalize_standings_table,
    write_outputs,
)
import os


def load_existing_matches() -> list:
    path = REPO / "public" / "data" / "matches.json"
    if not path.exists():
        return []
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
        return list(data.get("matches") or [])
    except Exception:
        return []


def main() -> int:
    ap = argparse.ArgumentParser(description="API-Football → public/data + Firestore-ready JSON")
    ap.add_argument(
        "--mode",
        choices=("both", "standings", "fixtures", "status"),
        default="both",
        help="both = 2 istek (önerilen günlük)",
    )
    ap.add_argument(
        "--season",
        type=int,
        default=None,
        help="Sezon başlangıç yılı (2024 = 2024-25). Free plan: genelde 2022–2024.",
    )
    ap.add_argument("--league", type=int, default=LEAGUE_SUPER_LIG)
    ap.add_argument("--team", type=int, default=TEAM_FENERBAHCE)
    ap.add_argument(
        "--all-competitions",
        action="store_true",
        help="Fikstürde league filtresi yok (kupa + lig; hâlâ 1 fixtures isteği)",
    )
    args = ap.parse_args()

    if not get_api_key():
        print(
            "HATA: APISPORTS_KEY veya API_FOOTBALL_KEY tanımlı değil.",
            file=sys.stderr,
        )
        return 2

    if args.season is None:
        env_s = (os.environ.get("API_FOOTBALL_SEASON") or "").strip()
        args.season = int(env_s) if env_s.isdigit() else DEFAULT_FREE_SEASON

    try:
        if args.mode == "status":
            client = ApiFootballClient()
            data = client.status()
            resp = (data.get("response") or {})
            account = resp.get("account") or {}
            sub = resp.get("subscription") or {}
            reqs = resp.get("requests") or {}
            print(
                json.dumps(
                    {
                        "ok": True,
                        "account": account.get("email") or account.get("firstname"),
                        "plan": sub.get("plan"),
                        "requests": reqs,
                        "rateLimit": client.last_rate,
                        "requestCount": client.request_count,
                    },
                    ensure_ascii=False,
                    indent=2,
                )
            )
            return 0

        if args.mode == "both":
            bundle = fetch_standings_and_fixtures(
                season=args.season,
                league=args.league,
                team=args.team,
                include_all_competitions=args.all_competitions,
            )
            paths = write_outputs(
                bundle,
                repo_root=REPO,
                existing_matches=load_existing_matches(),
            )
            print(
                json.dumps(
                    {
                        "ok": True,
                        "mode": "both",
                        "standingsTeams": len(bundle["standings"].get("standingsList") or []),
                        "apiMatches": len(bundle["matches"]),
                        "requestCount": bundle["requestCount"],
                        "rateLimit": bundle.get("rateLimit"),
                        "paths": {k: str(v) for k, v in paths.items()},
                    },
                    ensure_ascii=False,
                    indent=2,
                )
            )
            return 0

        client = ApiFootballClient()
        if args.mode == "standings":
            raw = client.standings(league=args.league, season=args.season)
            doc = normalize_standings_table(raw, season=args.season, league_id=args.league)
            from io_utils import atomic_write_json

            path = REPO / "public" / "data" / "standings.json"
            atomic_write_json(path, doc)
            print(
                json.dumps(
                    {
                        "ok": True,
                        "mode": "standings",
                        "teams": len(doc.get("standingsList") or []),
                        "requestCount": client.request_count,
                        "rateLimit": client.last_rate,
                        "path": str(path),
                    },
                    ensure_ascii=False,
                    indent=2,
                )
            )
            return 0

        # fixtures only
        from io_utils import atomic_write_json
        from providers.api_football import utc_now

        league = None if args.all_competitions else args.league
        raw = client.fixtures_by_team(team=args.team, season=args.season, league=league)
        matches = normalize_fixtures(raw, season=args.season)
        merged = merge_matches_into_existing(load_existing_matches(), matches)
        path = REPO / "public" / "data" / "matches.json"
        payload = {
            "season": f"{args.season}-{str(args.season + 1)[-2:]}",
            "updatedAt": utc_now(),
            "fetchedAt": utc_now(),
            "source": "api_football",
            "provider": "api_football",
            "matches": merged,
            "apiMatchCount": len(matches),
        }
        atomic_write_json(path, payload)
        print(
            json.dumps(
                {
                    "ok": True,
                    "mode": "fixtures",
                    "apiMatches": len(matches),
                    "mergedMatches": len(merged),
                    "requestCount": client.request_count,
                    "rateLimit": client.last_rate,
                    "path": str(path),
                },
                ensure_ascii=False,
                indent=2,
            )
        )
        return 0

    except ApiFootballError as e:
        print(f"HATA: {e}", file=sys.stderr)
        return 1
    except Exception as e:
        print(f"HATA: {e}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
