# SESSION STATE — Fenerbahçe Evreni

> **Son güncelleme:** 2026-07-10  
> **Durum:** A4+A5+rules deploy+nightly workflow · SA secret kullanıcıda

## Bu tur

| İş | Durum |
|----|--------|
| A5 localStorage prod kapat | ✅ |
| A4 firestore_io + job write | ✅ |
| Firestore + Storage rules deploy | ✅ `fenerbahceevreni-a4280` (CLI login) |
| Nightly GH Actions workflow | ✅ `.github/workflows/data-sync-nightly.yml` |
| `npm run rules:deploy` | ✅ script |
| Service account JSON | ⏳ **kullanıcı yapıştırır** (GitHub secret + opsiyonel local) |

## “Hata” açıklaması

`Firestore credentials: missing` = SA yok, **rules hatası değil**.  
Admin SDK rules’ı bypass eder. Detay: `docs/OPS_FIRESTORE_AND_CRON.md`

## Senin tek zorunlu adımın

1. Firebase Console → Service accounts → Generate private key  
2. GitHub → Secrets → `FIREBASE_SERVICE_ACCOUNT_JSON` = JSON içeriği  
3. Actions → Data sync nightly → Run workflow  

## Sonraki (kod)

- SA gelince: ilk gerçek `sync_standings` + `sync_squad` smoke (istersen buradan)
- Veri doluluğu (son 10 maç advanced)
- UI/UX 200 (Faz D) — omurga sonrası

## Context prompt

```
docs/SESSION_STATE.md + OPS_FIRESTORE_AND_CRON.md oku.
Rules deploy edildi. Nightly workflow hazır. SA secret kullanıcıda.
```
