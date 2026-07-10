# Faz B — Multi-scraper durum

| Bileşen | Durum | Not |
|---------|--------|-----|
| Süreklilik docs | ✅ | CONTINUITY, SESSION_STATE, PROJECT_INDEX |
| FotMob adapter | ✅ | `/api/data/*`, team **8695** (Palace 9826 karışmaz) |
| FotMob match advanced job | ✅ | xG, shotmap, ratings · **limit 10** |
| **B DoD: son 10 FB advanced** | ✅ | `coverage_b_dod.json` · packsOk=10 |
| Entity map + match stubs | ✅ | skoru olan advanced → CMS maç |
| FotMob Super Lig xG table | ✅ | 18 takım |
| FBref soccerdata | ⚠️ | Chrome gerekli |
| FBref HTML | ⚠️ | 403 Cloudflare |
| Player stats fallback | ✅ | FBref fail → FotMob xG table |

## B DoD (2026-07-10)

- `python data-worker/fetch_fotmob_match.py --team-id 8695 --limit 10`
- Sonuç: **10/10** Fenerbahçe paketi (wrong-club skip 0)
- Shotmap+xG dolu: **6** · skorsuz/null dürüst: **4** (hazırlık vb.)
- Crystal Palace gürültüsü temizlendi (team_id filter)

## Çalışan komutlar

```bash
pip install -r data-worker/requirements.txt

# Son 10 FB maç (xG + shotmap veya null)
python data-worker/run_job.py --type sync_match_advanced --season 2025-26
# veya:
set FOTMOB_MATCH_LIMIT=10
python data-worker/fetch_fotmob_match.py --team-id 8695 --limit 10
python data-worker/sync_entity_map.py

# Coverage
type data-worker\output\fotmob\coverage_b_dod.json
```

## Örnek gerçek veri

| Maç | Skor | xG | Shots |
|-----|------|-----|-------|
| Fenerbahçe – Eyüpspor | 3-3 | 1.33 – 0.52 | 25 |
| Konyaspor – Fenerbahçe | 0-3 | 0.59 – 3.37 | 33 |
| Fenerbahçe – Başakşehir | 3-1 | 2.62 – 1.26 | 37 |
| Galatasaray – Fenerbahçe | 3-0 | 2.58 – 1.32 | 26 |
