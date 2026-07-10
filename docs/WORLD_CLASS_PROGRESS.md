# World-class platform progress (2026-07-10 oturumu)

Bu belge, A4–D5 hattında yapılanların özetidir. Amaç: **en üst düzey taraftar/analiz platformu** — sahte veri yok, kaynak şeffaf, okuma sakin, pipeline otomatik.

## Pipeline & güvenlik omurgası

| Adım | Özet |
|------|------|
| **A5** | Prod CMS path’te `localStorage` kapalı; Firestore tek kaynak (`isLocalCmsEnabled`) |
| **A4** | `firestore_io.py` — SA credentials, upsert, `lockedFields`, `--require-firestore` |
| **Rules** | Firestore + Storage deploy (`fenerbahceevreni-a4280`) |
| **Nightly** | `.github/workflows/data-sync-nightly.yml` + repo secret `FIREBASE_SERVICE_ACCOUNT_JSON` |
| **TM 403** | CI’da scrape fail → cache `public/data` snapshot ile Firestore upsert (`partial`) |
| **B DoD** | Son **10** FB advanced pack; Palace gürültüsü temiz; entity map stubs |

## UI / UX (Faz D)

| Adım | Özet |
|------|------|
| **D1** | `DataBadge`, `XGCompare`, EmptyState, StatChip 0-disiplini |
| **D2** | `TodayPulse` — 1 maç + 1 analiz + 1 anket; homepage scroll kısaldı |
| **D3** | `useMatchAdvanced`, `MatchStatsTab`, bitmiş maç → İstatistik |
| **D4** | Oyuncu `formRating: null`, seasonStats paneli, featured = XI/MV |
| **D5** | Analiz/Transfer sakin okuma (`ReadingChrome`, `reading-prose`) |

## Operatör notları

- SA: GitHub **Repository secret** `FIREBASE_SERVICE_ACCOUNT_JSON` (JSON içeriği)
- Yerel: `$env:FIREBASE_SERVICE_ACCOUNT_JSON = "C:\path\sa.json"`
- App Check **enforce**: metrics sonrası (bilinçli bekliyor)
- Nightly: Actions → Data sync nightly

## Bilinen limitler

- Transfermarkt canlı scrape GitHub IP’de 403 (cache fallback)
- Form rating çoğu oyuncuda hâlâ boş (kaynak gelince dolar)
- MacMerkeziPage hâlâ büyük (hero/fixtures split sırada)
- Editoryal içerik ritmi ürün skoru için kritik (kod dışı)

## Sonraki adaylar

1. MacMerkeziPage god-file parçalama (hero / fikstür)
2. PWA / maç günü bildirim
3. Premium ödeme webhook
4. İçerik: haftalık maç önü/sonu ritmi
