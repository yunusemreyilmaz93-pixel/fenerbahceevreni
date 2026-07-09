# Proje dosya haritası

```
fenerbahceevreni-main/
├── AGENTS.md                 # Agent kuralları
├── ROADMAP.md                # Ürün roadmap
├── docs/
│   ├── CONTINUITY.md         # Context handoff
│   ├── SESSION_STATE.md      # Canlı durum (güncel tut)
│   ├── PROJECT_INDEX.md      # Bu dosya
│   ├── PHASE_A1_BACKEND_CONTRACT.md
│   ├── PHASE_A_STATUS.md
│   ├── PHASE_B_STATUS.md
│   └── soccerdata-firestore-schema.md
├── src/lib/backend/contracts.ts   # TS job/provider sözleşmesi
├── server.ts                      # Express + /api/v1
├── server/v1/publicApi.ts         # Public read API
├── data-worker/
│   ├── contracts.py
│   ├── run_job.py                 # Job runner CLI
│   ├── requirements.txt
│   ├── fetch_squad.py             # TM kadro
│   ├── fetch_standings.py         # TM puan
│   ├── providers/
│   │   ├── sofascore_superlig.py
│   │   ├── fbref_superlig.py      # FBref sezon stats
│   │   └── fotmob.py              # FotMob xG/shotmap
│   ├── fetch_fbref_stats.py
│   ├── fetch_fotmob_match.py
│   └── output/
│       ├── scrapeJobs/
│       ├── fbref/
│       └── fotmob/
└── public/data/                   # squad.json, standings.json, matches.json
```

## API (public)

| Method | Path |
|--------|------|
| GET | `/api/v1/health` |
| GET | `/api/v1/standings` |
| GET | `/api/v1/players` |
| GET | `/api/v1/players/:slug` |
| GET | `/api/v1/matches` |
| GET | `/api/v1/matches/:id/advanced` |
| GET | `/api/v1/articles` |

## Job komutları

```bash
python data-worker/run_job.py --type health_probe
python data-worker/run_job.py --type sync_standings --season 2025
python data-worker/run_job.py --type sync_squad --season 2026
python data-worker/run_job.py --type sync_player_season_stats --season 2025-26
python data-worker/run_job.py --type sync_match_advanced --season 2025-26
# veya doğrudan:
python data-worker/fetch_fbref_stats.py --season 2025-26
python data-worker/fetch_fotmob_match.py --team-id 8695 --limit 5
```

## FotMob sabitleri

- Fenerbahçe team id: **8695**
- Super Lig league id: **71**
- API prefix: `https://www.fotmob.com/api/data/`
