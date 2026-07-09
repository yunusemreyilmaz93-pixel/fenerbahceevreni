# SESSION STATE — Fenerbahçe Evreni

> **Son güncelleme:** 2026-07-09  
> **Durum:** Faz A + B + C (çekirdek) operasyonel

## Bu tur (hepsi sırayla)

| # | İş | Durum |
|---|-----|--------|
| 1 | Job API `checkAdmin` + mock token (dev) | ✅ |
| 2 | AdminJobs Bearer auth | ✅ |
| 3 | Shotmap SVG UI | ✅ `ShotmapPitch.tsx` |
| 4 | Maç Merkezi shotmap + advanced resolve | ✅ |
| 5 | FBref + Edge binary | ⚠️ hâlâ "Chrome not found" / 403 — FotMob fallback |
| 6 | Entity Map Admin UI | ✅ |
| 7 | Faz C ops dokümantasyonu | ✅ PHASE_C_STATUS |

## Demo maç (shotmap)

- `fb-eyupspor-2026-lig` — Fenerbahçe 3-3 Eyüpspor  
- fotmob `4842613` · 25 şut · xG 1.33–0.52  
- Maç listesinden seç → Maç Sonu → istatistik + şut haritası  

## Auth

- Prod: Firebase ID token + `ADMIN_EMAILS`  
- Dev: `Bearer mock-admin-token-for-yunusemreyilmaz93@gmail.com`  
- `ALLOW_MOCK_ADMIN=1` veya `NODE_ENV !== production`

## Komutlar

```bash
npm run dev
# Admin → Scraper Jobs / Entity Map
python data-worker/run_job.py --type sync_match_advanced
python data-worker/run_job.py --type sync_entity_ids
```

## Sonraki (opsiyonel)

- Google Chrome kur → FBref gerçek oyuncu sezon  
- Firestore service account  
- Premium ödeme  
- Shotmap koordinat kalibrasyonu (FotMob pitch)

## Context prompt

```
docs/SESSION_STATE.md + PHASE_C_STATUS.md oku.
checkAdmin, shotmap, entity UI hazır.
```
