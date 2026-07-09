# Faz C — Admin CMS perfection (ilerleme)

Amaç: sitede operasyon için kod yazmamak.

## Bu turda eklendi / güçlendirildi

| Özellik | Durum |
|---------|--------|
| Scraper Jobs UI + auth | ✅ `/admin` → Scraper Jobs · checkAdmin |
| Entity Map UI | ✅ `/admin` → Entity Map · tek tık sync |
| adminAuth helper | ✅ `src/lib/adminAuth.ts` |
| Job API koruması | ✅ Bearer zorunlu |
| Mock admin (dev) | ✅ `mock-admin-token-for-{email}` allowlist |
| Shotmap UI | ✅ Maç Merkezi |
| Entity → advanced resolve | ✅ API site match id ile advanced bulur |

## Hâlâ kod/deploy isteyenler

| Özellik | Not |
|---------|-----|
| Firestore service account | Env ile job write |
| FBref Chrome/Edge | Edge binary denendi; Cloudflare değişken |
| Premium ödeme | Ayrı faz |
| Bülten gönderim provider | SMTP/Resend sonra |
| Shotmap + tüm maçlar | FotMob’ta shotmap olanlar |

## Operatör rutini (kodsuz)

1. Admin → Scraper Jobs → **Maç advanced (FotMob)**  
2. **Entity sync** (Jobs veya Entity Map)  
3. Maç Merkezi’nde featured maçı kontrol  
4. Makale / anket / duyuru mevcut CMS sekmelerinden  
