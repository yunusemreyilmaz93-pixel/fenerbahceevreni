# -*- coding: utf-8 -*-
"""Fenerbahçe transfer söylentileri (Transfermarkt Gerüchteküche).

Kullanım:
    python data-worker/fetch_rumors.py [--limit 8]

Çıktı: public/data/rumors.json — Taraftar Odası "Söylenti Değirmeni" bunu okur.
Yalnızca Transfermarkt'ta listelenen gerçek söylentiler yazılır; oy sayıları 0'dan başlar.
"""
import argparse
import json
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

from scrapling import Fetcher

REPO_ROOT = Path(__file__).resolve().parent.parent
OUT_PATH = REPO_ROOT / "public" / "data" / "rumors.json"

POS_TR = {
    "Goalkeeper": "Kaleci", "Centre-Back": "Stoper", "Left-Back": "Sol Bek", "Right-Back": "Sağ Bek",
    "Defensive Midfield": "Ön Libero", "Central Midfield": "Merkez Orta Saha", "Attacking Midfield": "On Numara",
    "Left Winger": "Sol Kanat", "Right Winger": "Sağ Kanat", "Centre-Forward": "Santrafor",
    "Second Striker": "İkinci Forvet", "Left Midfield": "Sol Orta Saha", "Right Midfield": "Sağ Orta Saha",
}


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--limit", type=int, default=8)
    args = ap.parse_args()

    url = "https://www.transfermarkt.com/fenerbahce-istanbul/geruechte/verein/36"
    r = Fetcher.get(url, timeout=45, impersonate="chrome")
    if r.status != 200:
        print(f"HATA: {url} -> {r.status}", file=sys.stderr)
        return 1

    rumors = []
    for tr in r.css("table.items tbody tr"):
        tds = tr.css("td")
        if len(tds) != 11:
            continue
        titles = [a.attrib.get("title") for a in tr.css("a") if a.attrib.get("title")]
        if not titles:
            continue
        player = titles[0]
        club = titles[1] if len(titles) > 1 else ""
        cells = [td.text.strip() for td in tds]
        pos_en = cells[4]
        age = cells[6]
        # piyasa değeri genelde son dolu hücrede (€Xm)
        mv = next((c for c in reversed(cells) if "€" in c), "")
        rumors.append({
            "id": "rum-" + re.sub(r"[^a-z0-9]+", "-", player.lower()).strip("-"),
            "player": player,
            "role": POS_TR.get(pos_en, pos_en) + (f" • {age} yaş" if age.isdigit() else ""),
            "source": "Transfermarkt Söylenti Değirmeni",
            "excerpt": f"{player}" + (f" ({club})" if club else "") + " için Fenerbahçe bağlantılı transfer iddiası Transfermarkt söylenti değirmeninde listeleniyor." + (f" Güncel piyasa değeri: {mv}." if mv else ""),
            "currentClub": club,
            "marketValue": mv,
            "hotVotes": 0,
            "coldVotes": 0,
        })
        if len(rumors) >= args.limit:
            break

    if not rumors:
        print("HATA: söylenti bulunamadı", file=sys.stderr)
        return 1

    doc = {
        "updatedAt": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.000Z"),
        "source": "Transfermarkt",
        "sourceUrl": url,
        "rumors": rumors,
    }
    OUT_PATH.write_text(json.dumps(doc, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"OK: {len(rumors)} söylenti -> {OUT_PATH}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
