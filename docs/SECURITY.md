# Güvenlik Operasyon Rehberi (ücretsiz / top-notch hedef)

Bu belge, Fenerbahçe Evreni güvenlik modelini ve **deploy sonrası zorunlu adımları** özetler.

## Mimari özet

| Katman | Koruma |
|--------|--------|
| Firestore | Default deny; admin claim/email; public create sadece form koleksiyonlarında + alan/uzunluk doğrulama |
| Storage | Path bazlı okuma; image/pdf + boyut limiti; admin yazma |
| Express API | Helmet, rate limit, 100kb body, mock token yok, prod’da debug yok |
| Oylar | `POST /api/v1/polls/:id/vote` + Admin SDK transaction; client poll parent yazamaz |
| Formlar | `POST /api/v1/public/*` + honeypot + rate limit |
| Premium | `premium` / `premiumContent`: claim `premium` veya `isPublic` / teaser |

## Zorunlu deploy adımları

### 1. Rules deploy

```bash
firebase deploy --only firestore:rules,storage
# veya Console → Rules yapıştır
```

`firestore.rules` ve `storage.rules` repodaki dosyalarla birebir olmalı.

### 2. Admin custom claim (önerilen)

Email allowlist hâlâ çalışır; **claim daha sağlamdır**.

```bash
# Service account veya ADC ile:
node scripts/setAdminClaim.mjs yunusemreyilmaz93@gmail.com
```

Kullanıcı bir kez çıkış/giriş yapsın (ID token yenilensin).

### 3. Ortam değişkenleri

| Değişken | Nerede | Not |
|----------|--------|-----|
| `ADMIN_EMAILS` | Server only | Virgülle e-postalar |
| `VITE_ADMIN_EMAILS` | Client | Sadece UI kapısı; secret değil |
| `APISPORTS_KEY` | Server only | Asla `VITE_` prefix yok |
| Firebase `VITE_*` | Client | Public config (normal) |

### 4. Firebase App Check (ücretsiz reCAPTCHA v3)

Console → App Check → Web app → reCAPTCHA v3  
Enforcement’ı Auth / Firestore / Storage için aşamalı aç.

### 5. Anonymous Auth

Oylar için açık kalabilir; App Check ile bot maliyeti düşer.

## Public write endpoint’leri

- `POST /api/v1/polls/:pollId/vote` — Bearer (anon OK)
- `POST /api/v1/public/contact`
- `POST /api/v1/public/newsletter`
- `POST /api/v1/public/waitlist`

Honeypot alan adı: `website` (boş kalmalı).

## Premium kilidi

Varsayılan: belgeler okunabilir (mevcut içerik kırılmaz).  
Kilit için belgede:

```json
{ "isLocked": true }
```

Okuma kilidi açanlar: admin **veya** `request.auth.token.premium == true` **veya** `isLocked != true` / public bayrakları.

Ödeme gelene kadar claim’i manuel:

```js
await admin.auth().setCustomUserClaims(uid, { premium: true });
```

## Bilinen limitler (ücretsiz planda)

- Rate limit IP tabanlıdır (paylaşımlı NAT’ta sıkılaşabilir).
- App Check yoksa anonymous oy abuse mümkün; claim + rate limit + rules yine de yükseltir.
- Storage path’leri: `article-covers/`, `player-images/`, `team-logos/`, `sponsor-logos/` (+ opsiyonel `media/`, `reports/`).

## Yasak / kaldırıldı

- Sabit admin şifresi (`fener1907` vb.) — **yok**; sadece Google + Firebase.
- Mock admin token production’da — **reddedilir**.
- Client’tan poll `votes` aggregate yazma — **yasak** (rules + kod).
