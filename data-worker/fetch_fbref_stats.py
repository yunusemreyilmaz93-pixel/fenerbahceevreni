#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CLI: FBref Super Lig oyuncu/takım sezon istatistikleri."""
import argparse
import json
import logging
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--season", default="2025-26")
    args = ap.parse_args()
    from providers.fbref_superlig import run

    try:
        payload = run(season=args.season)
    except Exception as e:
        print(f"HATA: {e}", file=sys.stderr)
        return 1
    counts = payload.get("counts") or {}
    docs = payload.get("advancedPlayerDocs") or []
    print(
        json.dumps(
            {
                "ok": True,
                "source": payload.get("source"),
                "counts": counts,
                "advancedDocs": len(docs),
                "files": payload.get("outputFiles"),
            },
            ensure_ascii=False,
            indent=2,
        )
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
