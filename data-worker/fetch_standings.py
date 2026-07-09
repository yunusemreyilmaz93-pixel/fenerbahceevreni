# -*- coding: utf-8 -*-
"""Süper Lig puan durumu fetcher (Transfermarkt).

Kullanım:
    python data-worker/fetch_standings.py --season 2025

Çıktı: public/data/standings.json
Not: season parametresi Transfermarkt saison_id'dir (2025 => 2025-26 sezonu).
Sezon bitmişse "final" etiketiyle yazar; devam ediyorsa güncel tabloyu yazar.
"""
import argparse
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

from scrapling import Fetcher

REPO_ROOT = Path(__file__).resolve().parent.parent
OUT_PATH = REPO_ROOT / "public" / "data" / "standings.json"

# Transfermarkt adları -> site içi Türkçe adlar + yerel logo yolları
NAME_MAP = {
    "Galatasaray": ("Galatasaray", "/logos/galatasaray.svg"),
    "Fenerbahce": ("Fenerbahçe", "/logos/fenerbahce.png"),
    "Trabzonspor": ("Trabzonspor", "/logos/trabzonspor.png"),
    "Besiktas JK": ("Beşiktaş", "/logos/besiktas.svg"),
    "Basaksehir FK": ("İstanbul Başakşehir", "/logos/basaksehir.png"),
    "Göztepe": ("Göztepe", "/logos/goztepe.png"),
    "Samsunspor": ("Samsunspor", "/logos/samsunspor.png"),
    "Caykur Rizespor": ("Çaykur Rizespor", "/logos/rizespor.png"),
    "Konyaspor": ("Konyaspor", "/logos/konyaspor.png"),
    "Kocaelispor": ("Kocaelispor", "/logos/kocaelispor.png"),
    "Alanyaspor": ("Alanyaspor", "/logos/alanyaspor.png"),
    "Gaziantep FK": ("Gaziantep FK", "/logos/gaziantep-fk.png"),
    "Kasimpasa": ("Kasımpaşa", "/logos/kasimpasa.png"),
    "Genclerbirligi Ankara": ("Gençlerbirliği", "/logos/genclerbirligi.png"),
    "Eyüpspor": ("Eyüpspor", "/logos/eyupspor.png"),
    "Antalyaspor": ("Antalyaspor", "/logos/antalyaspor.png"),
    "Kayserispor": ("Kayserispor", "/logos/kayserispor.png"),
    "Fatih Karagümrük": ("Fatih Karagümrük", "/logos/fatih-karagumruk.png"),
    "Erzurumspor FK": ("Erzurumspor FK", "/logos/erzurumspor.png"),
    "Amedspor": ("Amedspor", "/logos/amedspor.png"),
    "Corum FK": ("Çorum FK", "/logos/corum-fk.png"),
}


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--season", default="2025", help="Transfermarkt saison_id (2025 => 2025-26)")
    args = ap.parse_args()

    url = f"https://www.transfermarkt.com/super-lig/tabelle/wettbewerb/TR1/saison_id/{args.season}"
    r = Fetcher.get(url, timeout=40, impersonate="chrome")
    if r.status != 200:
        print(f"HATA: {url} -> {r.status}", file=sys.stderr)
        return 1

    rows = r.css("table.items tbody tr")
    if len(rows) < 10:
        print("HATA: tablo satırları bulunamadı", file=sys.stderr)
        return 1

    standings = []
    for tr in rows:
        cells = [td.text.strip() for td in tr.css("td")]
        raw_name = None
        for a in tr.css("td a"):
            t = a.attrib.get("title")
            if t:
                raw_name = t
                break
        if not raw_name:
            imgs = tr.css("img")
            raw_name = imgs[0].attrib.get("alt") if imgs else "?"
        name, logo = NAME_MAP.get(raw_name, (raw_name, ""))
        # yerel logo dosyası gerçekten yoksa boş bırak (UI baş harf rozetine düşer)
        if logo and not (REPO_ROOT / "public" / logo.lstrip("/")).exists():
            logo = ""
        gf, ga = cells[7].split(":")
        standings.append({
            "rank": int(cells[0]),
            "teamName": name,
            "logo": logo,
            "played": int(cells[3]),
            "win": int(cells[4]),
            "draw": int(cells[5]),
            "lose": int(cells[6]),
            "goalsFor": int(gf),
            "goalsAgainst": int(ga),
            "goalsDiff": int(cells[8]),
            "points": int(cells[9]),
        })

    season_start = int(args.season)
    season_label = f"{season_start}-{str(season_start + 1)[-2:]}"
    played = standings[0]["played"] if standings else 0
    total_rounds = (len(standings) - 1) * 2
    is_final = played >= total_rounds > 0

    doc = {
        "season": season_label,
        "isFinal": is_final,
        "source": "Transfermarkt",
        "sourceUrl": url,
        "updatedAt": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.000Z"),
        "standingsList": standings,
    }
    OUT_PATH.write_text(json.dumps(doc, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"OK: {len(standings)} takım -> {OUT_PATH} (sezon {season_label}, final={is_final})")
    return 0


if __name__ == "__main__":
    sys.exit(main())
