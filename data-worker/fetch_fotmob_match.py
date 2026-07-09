#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CLI: FotMob maç advanced (xG / shotmap / ratings)."""
import argparse
import json
import logging
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--team-id", type=int, default=8695, help="FotMob team id (Fenerbahçe=8695)")
    ap.add_argument("--limit", type=int, default=5)
    ap.add_argument("--match-id", default=None, help="Tek maç id")
    ap.add_argument("--delay", type=float, default=1.1)
    args = ap.parse_args()
    from providers.fotmob import run

    try:
        summary = run(
            team_id=args.team_id,
            limit=args.limit,
            match_id=args.match_id,
            delay=args.delay,
        )
    except Exception as e:
        print(f"HATA: {e}", file=sys.stderr)
        return 1
    print(
        json.dumps(
            {
                "ok": True,
                "successCount": summary.get("successCount"),
                "failedCount": summary.get("failedCount"),
                "matchIds": summary.get("matchIds"),
                "errors": summary.get("errors"),
                "sample": [
                    {
                        "id": m.get("id"),
                        "home": m.get("homeTeam"),
                        "away": m.get("awayTeam"),
                        "score": m.get("score"),
                        "shots": len(m.get("shotmap") or []),
                        "xgHome": (m.get("teamMetrics") or {}).get("home", {}).get("expectedGoals"),
                        "xgAway": (m.get("teamMetrics") or {}).get("away", {}).get("expectedGoals"),
                    }
                    for m in (summary.get("matches") or [])[:3]
                ],
            },
            ensure_ascii=False,
            indent=2,
        )
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
