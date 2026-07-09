# -*- coding: utf-8 -*-
"""Fenerbahçe oyuncu sezon istatistikleri (Transfermarkt leistungsdaten).

Kullanım:
    python data-worker/fetch_player_stats.py --season 2025

public/data/squad.json içindeki oyunculara isim eşleşmesiyle `seasonStats`
alanı ekler/tazeler; diğer tüm alanlara (scout, recentMatches...) dokunmaz.
Sezon parametresi Transfermarkt reldata yılıdır (2025 => 2025-26, tüm kulvarlar).
"""
import argparse
import json
import sys
import unicodedata
from datetime import datetime, timezone
from pathlib import Path

from io_utils import atomic_write_json

from scrapling import Fetcher

REPO_ROOT = Path(__file__).resolve().parent.parent
SQUAD_PATH = REPO_ROOT / "public" / "data" / "squad.json"


def norm(s: str) -> str:
    s = unicodedata.normalize("NFKD", s or "")
    s = "".join(c for c in s if not unicodedata.combining(c))
    return s.lower().replace("ı", "i").strip()


def to_int(v: str) -> int:
    v = (v or "").replace(".", "").replace("'", "").strip()
    return int(v) if v.isdigit() else 0


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--season", default="2025", help="Transfermarkt reldata yılı (2025 => 2025-26)")
    args = ap.parse_args()

    season_label = f"{int(args.season)}-{str(int(args.season) + 1)[-2:]}"
    url = f"https://www.transfermarkt.com/fenerbahce-istanbul/leistungsdaten/verein/36/reldata/%26{args.season}/plus/1"
    r = Fetcher.get(url, timeout=45, impersonate="chrome")
    if r.status != 200:
        print(f"HATA: {url} -> {r.status}", file=sys.stderr)
        return 1

    stats_by_name = {}
    for tr in r.css("table.items tbody tr"):
        tds = tr.css("td")
        if len(tds) != 18:
            continue
        name = None
        for a in tr.css("a"):
            t = (a.text or "").strip()
            if t and not t.isdigit():
                name = t
                break
        if not name:
            continue
        cells = [td.text.strip() for td in tds]
        # cells[7:] = [kadroda, maç, gol, asist, sarı, çift sarı, kırmızı, girdi, çıktı, PPM, dakika]
        apps_raw = cells[8]
        not_used = "not used" in apps_raw.lower()
        stats_by_name[norm(name)] = {
            "season": season_label,
            "scope": "Tüm kulvarlar",
            "inSquad": to_int(cells[7]),
            "appearances": 0 if not_used else to_int(apps_raw),
            "goals": to_int(cells[9]),
            "assists": to_int(cells[10]),
            "yellowCards": to_int(cells[11]),
            "secondYellows": to_int(cells[12]),
            "redCards": to_int(cells[13]),
            "subOn": to_int(cells[14]),
            "subOff": to_int(cells[15]),
            "minutes": to_int(cells[17]),
            "source": "Transfermarkt",
        }

    if not stats_by_name:
        print("HATA: istatistik satırı bulunamadı", file=sys.stderr)
        return 1

    squad = json.loads(SQUAD_PATH.read_text(encoding="utf-8"))
    matched = 0
    for p in squad.get("players", []):
        key = norm(p.get("name", ""))
        hit = stats_by_name.get(key)
        if not hit:
            # kısmi eşleşme (soyad + ad parçası)
            for k, v in stats_by_name.items():
                if key and (key in k or k in key):
                    hit = v
                    break
        if hit:
            p["seasonStats"] = hit
            matched += 1

    squad["updatedAt"] = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.000Z")
    atomic_write_json(SQUAD_PATH, squad)
    print(f"OK: {matched}/{len(squad.get('players', []))} oyuncuya {season_label} seasonStats yazıldı ({len(stats_by_name)} satır kaynakta)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
