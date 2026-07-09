# Faz B — Multi-scraper durum

| Bileşen | Durum | Not |
|---------|--------|-----|
| Süreklilik docs | ✅ | CONTINUITY, SESSION_STATE, PROJECT_INDEX |
| FotMob adapter | ✅ | `/api/data/*`, team **8695** |
| FotMob match advanced job | ✅ | xG, shotmap, ratings |
| FotMob Super Lig xG table | ✅ | 18 takım |
| FBref soccerdata | ⚠️ | Chrome gerekli |
| FBref HTML | ⚠️ | 403 Cloudflare |
| Player stats fallback | ✅ | FBref fail → FotMob xG table |

## Çalışan komutlar

```bash
pip install -r data-worker/requirements.txt

# Fenerbahçe son maçlar (xG + shotmap)
python data-worker/run_job.py --type sync_match_advanced --season 2025-26
python data-worker/fetch_fotmob_match.py --team-id 8695 --limit 5

# Sezon stats (FBref dener; fail olursa FotMob xG table)
python data-worker/run_job.py --type sync_player_season_stats --season 2025-26
```

## Örnek gerçek veri (2026-07-09 çekimi)

| Maç | Skor | xG | Shots |
|-----|------|-----|-------|
| Fenerbahçe – Eyüpspor | 3-3 | 1.33 – 0.52 | 25 |
| Konyaspor – Fenerbahçe | 0-3 | 0.59 – 3.37 | 33 |

FB sezon xG (FotMob table): ~66.8 for, ~30.2 against, xPoints ~70.2
