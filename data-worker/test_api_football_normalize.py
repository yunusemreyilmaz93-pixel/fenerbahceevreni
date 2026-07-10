# -*- coding: utf-8 -*-
"""Pure unit tests for API-Football normalizers (no network)."""
from __future__ import annotations

import sys
from pathlib import Path

WORKER = Path(__file__).resolve().parent
sys.path.insert(0, str(WORKER))

from providers.api_football import (
    merge_matches_into_existing,
    normalize_fixture_item,
    normalize_standings_table,
    parse_match_status,
    resolve_logo,
)


def test_parse_status():
    assert parse_match_status("FT") == "finished"
    assert parse_match_status("1H") == "live"
    assert parse_match_status("NS") == "upcoming"
    assert parse_match_status("PST") == "cancelled"


def test_resolve_logo():
    assert resolve_logo("Fenerbahçe").endswith("fenerbahce.png")
    assert resolve_logo("Galatasaray").endswith("galatasaray.svg")


def test_normalize_standings_minimal():
    raw = {
        "response": [
            {
                "league": {
                    "standings": [
                        [
                            {
                                "rank": 1,
                                "team": {"id": 645, "name": "Galatasaray", "logo": "x"},
                                "points": 77,
                                "goalsDiff": 40,
                                "form": "WW",
                                "all": {
                                    "played": 34,
                                    "win": 24,
                                    "draw": 5,
                                    "lose": 5,
                                    "goals": {"for": 70, "against": 30},
                                },
                            }
                        ]
                    ]
                }
            }
        ]
    }
    doc = normalize_standings_table(raw, season=2025)
    assert doc["provider"] == "api_football"
    assert doc["season"] == "2025-26"
    assert len(doc["standingsList"]) == 1
    assert doc["standingsList"][0]["teamName"] == "Galatasaray"
    assert doc["standingsList"][0]["points"] == 77


def test_normalize_fixture_and_merge():
    item = {
        "fixture": {
            "id": 999001,
            "date": "2025-08-10T18:00:00+03:00",
            "status": {"short": "NS"},
            "venue": {"name": "Ülker", "city": "Istanbul"},
        },
        "league": {"id": 203, "name": "Super Lig", "round": "Regular Season - 1", "season": 2025},
        "teams": {
            "home": {"id": 611, "name": "Fenerbahce", "logo": "h"},
            "away": {"id": 645, "name": "Galatasaray", "logo": "a"},
        },
        "goals": {"home": None, "away": None},
    }
    m = normalize_fixture_item(item)
    assert m["id"] == "match-api-999001"
    assert m["status"] == "upcoming"
    assert m["provider"] == "api_football"
    assert m["scoreHome"] is None

    existing = [
        {
            "id": "fb-prep-1",
            "homeTeam": "Fenerbahçe",
            "awayTeam": "X",
            "status": "finished",
            "matchDate": "2025-07-01T12:00:00",
            "featured": True,
        }
    ]
    merged = merge_matches_into_existing(existing, [m])
    ids = {x["id"] for x in merged}
    assert "fb-prep-1" in ids
    assert "match-api-999001" in ids
    featured = [x for x in merged if x.get("featured")]
    assert len(featured) == 1


if __name__ == "__main__":
    test_parse_status()
    test_resolve_logo()
    test_normalize_standings_minimal()
    test_normalize_fixture_and_merge()
    print("ok")
