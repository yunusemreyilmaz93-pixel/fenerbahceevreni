#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Fenerbahçe kadro veri boru hattı (Scrapling tabanlı, yeniden çalıştırılabilir).

Ne yapar
--------
1. Transfermarkt kadro sayfasından güncel A takım kadrosunu çeker
   (numara, isim, mevki, yaş, uyruk, piyasa değeri, sözleşme, fotoğraf).
2. Her oyuncunun profil sayfasından fiziksel künyeyi çeker (boy, ayak, tam ad,
   yan mevkiler, doğum yeri).
3. Oyuncu fotoğraflarını public/players/ altına indirir.
4. Mevcut public/data/squad.json içindeki EL YAZISI scout raporlarını (overview,
   strengths, development) slug bazında KORUR — sadece gerçek istatistikleri tazeler.
5. public/data/squad.json'u yeniden yazar (updatedAt bump → uygulama otomatik yeniler).

Kullanım
--------
    pip install scrapling            # tek seferlik
    python data-worker/fetch_squad.py
    python data-worker/fetch_squad.py --season 2026   # sezon override

Not: Scout metinleri scrape edilemez (nitel analiz). Kaynak-doğruluk kuralı:
istatistikler scrape'ten gelir; scout metni squad.json'da yaşar ve korunur.
"""
import argparse, json, os, re, sys, time, urllib.request, datetime

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SQUAD_JSON = os.path.join(REPO, "public", "data", "squad.json")
PHOTO_DIR = os.path.join(REPO, "public", "players")
TEAM_URL = "https://www.transfermarkt.com.tr/fenerbahce-istanbul/kader/verein/36/saison_id/{season}"
UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120 Safari/537.36",
      "Referer": "https://www.transfermarkt.com.tr/"}


def slugify(name: str) -> str:
    tr = str.maketrans("çğıöşüÇĞİÖŞÜéãáí", "cgiosuCGIOSUeaai")
    s = name.translate(tr).lower()
    return re.sub(r"[^a-z0-9]+", "-", s).strip("-")


def first(lst):
    return lst[0] if lst else None


def scrape_squad(season: str, fetch):
    url = TEAM_URL.format(season=season)
    page = fetch(url)
    players = []
    for r in page.css("table.items > tbody > tr"):
        if r.attrib.get("class", "") not in ("odd", "even"):
            continue
        num_el = first(r.css("div.rn_nummer"))
        number = num_el.text.strip() if num_el is not None else ""
        name_el = first(r.css("td.hauptlink a"))
        if name_el is None:
            continue
        name = name_el.text.strip()
        href = name_el.attrib.get("href", "")
        pos_rows = r.css("table.inline-table tr")
        position = ""
        if len(pos_rows) > 1:
            td = first(pos_rows[1].css("td"))
            position = td.text.strip() if td is not None else ""
        img = first(r.css("table.inline-table img"))
        photo = (img.attrib.get("data-src") or img.attrib.get("src") or "") if img is not None else ""
        zent = [t for t in r.css("td") if "zentriert" in (t.attrib.get("class") or "")]
        age = None
        if len(zent) >= 2:
            try:
                age = int(zent[1].text.strip())
            except ValueError:
                pass
        contract = zent[3].text.strip() if len(zent) >= 4 else ""
        nats = [i.attrib.get("title", "") for i in r.css("img.flaggenrahmen")]
        mv_el = first(r.css("td.rechts a"))
        mv = mv_el.text.strip() if mv_el is not None else ""
        players.append({
            "slug": slugify(name), "number": number if number and number != "-" else None,
            "name": name, "position": position, "age": age,
            "nationality": " / ".join(dict.fromkeys([n for n in nats if n])),
            "marketValue": mv or None, "contractUntil": contract or None,
            "photoUrl": photo, "tmProfile": "https://www.transfermarkt.com.tr" + href,
        })
    return players


def scrape_profile(url: str, fetch):
    p = fetch(url)
    labels = [x.text.strip().rstrip(":") for x in p.css("span.info-table__content--regular")]
    vals = [x.text.strip() for x in p.css("span.info-table__content--bold")]
    d = dict(zip(labels, vals))
    return {
        "height": d.get("Boy", ""),
        "foot": d.get("Ayak", ""),
        "fullName": d.get("Tam adı", ""),
        "birthPlace": d.get("Doğum yeri", ""),
        "subPositions": [x.text.strip() for x in p.css("div.detail-position__position dd")],
    }


def download_photo(url: str, slug: str) -> str | None:
    if not url or "default" in url:
        return None
    ext = ".png" if ".png" in url else ".jpg"
    path = os.path.join(PHOTO_DIR, slug + ext)
    try:
        with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=25) as r, open(path, "wb") as f:
            f.write(r.read())
        return f"/players/{slug}{ext}"
    except Exception as e:
        print(f"  [foto hata] {slug}: {str(e)[:60]}")
        return None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--season", default="2026", help="Transfermarkt sezon id (2026 = 26/27)")
    ap.add_argument("--delay", type=float, default=1.8, help="istekler arası saniye")
    args = ap.parse_args()

    try:
        from scrapling.fetchers import Fetcher
    except ImportError:
        sys.exit("HATA: scrapling kurulu değil. Kurulum: pip install scrapling")

    def fetch(u):
        return Fetcher.get(u, timeout=30, impersonate="chrome")

    os.makedirs(PHOTO_DIR, exist_ok=True)

    # Mevcut squad.json'dan scout metinlerini ve id/sezon bilgisini koru
    existing = {}
    season_label = "2026-27"
    if os.path.exists(SQUAD_JSON):
        cur = json.load(open(SQUAD_JSON, encoding="utf-8"))
        season_label = cur.get("season", season_label)
        for pl in cur.get("players", []):
            existing[pl["slug"]] = pl

    print(f"Kadro çekiliyor (sezon {args.season})...")
    squad = scrape_squad(args.season, fetch)
    print(f"  {len(squad)} oyuncu bulundu. Profiller ve fotoğraflar alınıyor...")

    now = datetime.datetime.now().isoformat()
    out_players = []
    for i, r in enumerate(squad, 1):
        time.sleep(args.delay)
        prof = {}
        try:
            prof = scrape_profile(r["tmProfile"], fetch)
        except Exception as e:
            print(f"  [profil hata] {r['name']}: {str(e)[:60]}")
        photo = download_photo(r["photoUrl"], r["slug"])
        prev = existing.get(r["slug"], {})
        out_players.append({
            "id": prev.get("id", f"fb-2627-{r['slug']}"),
            "name": r["name"], "slug": r["slug"],
            "position": r["position"], "age": r["age"],
            "nationality": r["nationality"],
            "photo": photo or prev.get("photo"),
            "shirtNumber": int(r["number"]) if r["number"] else None,
            "contractEndDate": r["contractUntil"], "marketValue": r["marketValue"],
            "status": "active", "season": season_label,
            "height": prof.get("height", prev.get("height", "")),
            "foot": prof.get("foot", prev.get("foot", "")),
            "fullName": prof.get("fullName") or prev.get("fullName") or r["name"],
            "mainPosition": r["position"] or prev.get("mainPosition", ""),
            "subPositions": prof.get("subPositions") or prev.get("subPositions", []),
            "birthPlace": prof.get("birthPlace", prev.get("birthPlace", "")),
            # KORUNAN el yazısı scout raporu + maç kayıtları
            "scout": prev.get("scout"),
            "recentMatches": prev.get("recentMatches", []),
            "formRating": prev.get("formRating", ""),
            "lastMatchRating": prev.get("lastMatchRating", ""),
            "trend": prev.get("trend", "stabil"),
            "strengths": prev.get("strengths", []),
            "weaknesses": prev.get("weaknesses", []),
            "analysis": prev.get("analysis", ""),
            "source": "transfermarkt.com.tr", "scrapedAt": now, "createdAt": prev.get("createdAt", now),
        })
        print(f"  [{i}/{len(squad)}] {r['name']}")

    scout_count = sum(1 for p in out_players if p.get("scout"))
    data = {
        "team": "Fenerbahçe", "season": season_label,
        "source": TEAM_URL.format(season=args.season),
        "scrapedAt": now, "updatedAt": now,
        "count": len(out_players), "scoutCount": scout_count,
        "players": out_players,
    }
    json.dump(data, open(SQUAD_JSON, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    print(f"\n✓ squad.json güncellendi: {len(out_players)} oyuncu, {scout_count} scout raporu korundu.")
    print(f"  → {SQUAD_JSON}")


if __name__ == "__main__":
    main()
