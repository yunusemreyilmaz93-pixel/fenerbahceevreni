# Faz A — Durum

| Adım | Durum | Not |
|------|--------|-----|
| A1 Sözleşme + rules | ✅ | contracts.ts/py, scrapeJobs/providerIds rules |
| A2 Public API v1 | ✅ | `/api/v1/*` local fallback |
| A3 Job runner | ✅ kısmi | `run_job.py`: health, squad, standings |
| A4 Firestore write | ⚠️ | Service account varsa yazar; yoksa local JSON |
| A5 localStorage prod kapat | ⏳ | Sonraki adım |

## Çalıştırma

```bash
# Job
python data-worker/run_job.py --type health_probe
python data-worker/run_job.py --type sync_standings --season 2025
python data-worker/run_job.py --type sync_squad --season 2026

# API (npm run dev)
curl http://localhost:3000/api/v1/health
curl http://localhost:3000/api/v1/standings
curl http://localhost:3000/api/v1/players
```

Firestore için: `GOOGLE_APPLICATION_CREDENTIALS` veya `FIREBASE_SERVICE_ACCOUNT_JSON` = service account path.
