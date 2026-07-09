# Fenerbahçe Evreni — Agent kuralları

## Ürün hedefi
Bağımsız Fenerbahçe analiz + taraftar platformu. Sahte veri basılmaz.

## Çalışma sırası (zorunlu)
1. Backend + veri pipeline  
2. Multi-scraper (FBref, Sofa, TM, FotMob…)  
3. Admin CMS perfection  
4. Frontend / UX  

Frontend redesign’e backend dolmadan girme.

## Faz disiplini
- Bir seferde **tek faz / tek adım**.
- Adım bitince kullanıcıya **kısa rapor** (ne yapıldı, dosyalar, nasıl test, sonraki adım).
- Kaynak gerçeklik: `ROADMAP.md`, `docs/PHASE_A1_BACKEND_CONTRACT.md`, `src/lib/backend/contracts.ts`, `data-worker/contracts.py`.

## Veri kuralları
- Eksik metrik = `null` / UI “veri yok”; uydurma rating/xG yok.
- Her advanced kayıtta `provider` + `fetchedAt`.
- `lockedFields` admin override: job ezmez.
- Provider fail → site ayakta, job `failed`/`partial`.

## Koleksiyonlar (kanonik)
- Jobs: `scrapeJobs` (eski: `dataSyncRuns`)
- Entity map: `providerIds` (eski: `externalPlayerMappings`)
- Advanced: `advancedPlayerStats`, `advancedMatchStats`

## Job tipleri
`sync_squad` | `sync_standings` | `sync_fixtures` | `sync_player_season_stats` | `sync_match_advanced` | `sync_entity_ids` | `health_probe`

## Kod stili
- God file büyütme; yeni API `server/` veya `api/v1` altında.
- Public site ham scraper’a bağlanmaz; API veya Firestore normalize veri.

## Rapor formatı (her adım sonunda)
1. Yapılanlar  
2. Dosyalar  
3. Test / çalıştırma  
4. Bilinen limit  
5. Sonraki adım  
