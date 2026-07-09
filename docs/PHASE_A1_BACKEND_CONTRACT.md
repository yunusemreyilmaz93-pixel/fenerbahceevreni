# Faz A1 — Backend sözleşme (tamamlandı)

Bu adım **çalışan scraper veya public API değil**; pipeline’ın konuşacağı **ortak dil**.

## Ne eklendi?

| Dosya | Rol |
|-------|-----|
| `src/lib/backend/contracts.ts` | TS: koleksiyonlar, job tipleri, provider, belge tipleri, ID helper |
| `data-worker/contracts.py` | Python: aynı sabitler + `new_scrape_job()` |
| `firestore.rules` | Kanonik `scrapeJobs` + `providerIds` (+ eski adlar korunur) |
| `src/lib/dbService.ts` | Koleksiyon alias sabitleri |

## Koleksiyon kararı

| Kanonik (yeni kod) | Eski (uyumluluk) | Erişim |
|--------------------|------------------|--------|
| `scrapeJobs` | `dataSyncRuns` | Sadece admin |
| `providerIds` | `externalPlayerMappings` | Sadece admin |
| `advancedPlayerStats` | — | Public read, admin write |
| `advancedMatchStats` | — | Public read, admin write |

**Not:** Firebase Console’da rules deploy edilmeden canlıda etkili olmaz.  
Deploy: `firebase deploy --only firestore:rules` (proje bağlıysa).

## Job tipleri

| jobType | Amaç | Birincil provider (hedef) |
|---------|------|---------------------------|
| `sync_squad` | Kadro + foto/MV | transfermarkt |
| `sync_standings` | Puan durumu | transfermarkt / fbref |
| `sync_fixtures` | Fikstür | sofascore / fbref |
| `sync_player_season_stats` | Sezon oyuncu metrikleri | fbref |
| `sync_match_advanced` | xG, shotmap, rating | fotmob / sofascore |
| `sync_entity_ids` | ID eşleştirme | multi |
| `health_probe` | Provider sağlık | multi |

## Durum makinesi

`queued` → `running` → `success` | `partial` | `failed` | `cancelled`

## Deterministik ID

- Advanced player: `{playerDocumentId}__{seasonKey}__{provider}`
- Advanced match: `{matchDocumentId}__{provider}`
- providerIds doc id: kanonik `playerDocumentId`

## Güvenlik

- `errorSummary` içine API key, path, stack trace **yazılmaz**
- Public client `scrapeJobs` / `providerIds` okuyamaz
- `lockedFields` (advanced belgelerde): admin override; job o alanları ezmez (A3+ implement)

## Sonraki adım (A2)

Express `/api/v1/*` read endpoint’leri: standings, fixtures, players, match advanced — bu sözleşmedeki envelope ile.
