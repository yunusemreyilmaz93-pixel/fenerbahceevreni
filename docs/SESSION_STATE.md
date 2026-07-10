# SESSION STATE — Fenerbahçe Evreni

> **Son güncelleme:** 2026-07-10  
> **Durum:** A4+A5+cron+B DoD (10 advanced) · sırada UI/UX 200

## Tamamlanan

| İş | Durum |
|----|--------|
| A5 localStorage prod kapat | ✅ |
| A4 Firestore job write + SA | ✅ |
| Rules deploy | ✅ |
| Nightly GH Actions | ✅ (secret OK, yeşil run) |
| **B DoD son 10 FB advanced** | ✅ packsOk=10, Palace gürültü temiz |
| Entity map + match stubs | ✅ |

## Veri notu

- Advanced: `data-worker/output/advanced/*__fotmob.json` (yalnız FB)
- Coverage: `data-worker/output/fotmob/coverage_b_dod.json`
- CMS maçlar: `public/data/matches.json` (~10; skorlu advanced stub + upcoming)
- TM scrape CI’da 403 → cache snapshot upsert (partial)

## Son tamamlanan

### D1
- DataBadge, XGCompare, EmptyState (Maç Merkezi + MatchCenter)

### D2 — Homepage nabız (world-class odaklı)
- `TodayPulse`: 1 maç + 1 analiz + 1 anket (gerçek oy, xG, DataBadge)
- Uzun MatchCenter + LatestAnalysis + Community yığını homepage’den çıktı
- Hero kısaldı; fraksiyon CTA şeridi; ikincil transfer/kadro py sıkı

## Sonraki

1. **D3** Maç Merkezi polish (god file split + advanced her maçta tutarlı)  
2. Oyuncu formRating null disiplini  
3. Transfer/analiz okuma deneyimi sakinleştir

## Komutlar

```bash
set FOTMOB_MATCH_LIMIT=10
python data-worker/run_job.py --type sync_match_advanced
python data-worker/run_job.py --type sync_entity_ids
```

## Context prompt

```
docs/SESSION_STATE.md oku. B DoD 10 advanced bitti. Sonraki: UI/UX Faz D.
```
