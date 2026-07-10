# Cloudflare ücretsiz güvenlik (WAF / Rate Limit / Bot)

Domain `fenerbahceevreni.com` (veya Vercel domain) için **ücretsiz Cloudflare** katmanı.  
Kod deploy’dan bağımsızdır; DNS Cloudflare üzerinden geçerse aktif olur.

## 1) Siteyi Cloudflare’e ekle

1. [dash.cloudflare.com](https://dash.cloudflare.com) → **Add a site**
2. Domain’i gir → plan: **Free**
3. Nameserver’ları domain registrar’da Cloudflare’in verdiği NS’lerle değiştir
4. DNS kayıtları: Vercel için genelde `CNAME @` → `cname.vercel-dns.com` (proxy **turuncu bulut ON**)

Proxy turuncu olmalı (CDN + WAF). Gri bulut = sadece DNS, güvenlik yok.

## 2) SSL / TLS

- SSL/TLS → **Full (strict)** (Vercel zaten HTTPS verir)
- Always Use HTTPS: **On**
- Automatic HTTPS Rewrites: **On**
- Minimum TLS: **1.2**

## 3) Bot Fight Mode (Free)

- Security → Bots → **Bot Fight Mode: On**

Basit botları keser; aşırı agresif olursa kapatıp sadece rate limit kullan.

## 4) Security Level

- Security → Settings → Security Level: **Medium** (veya High)
- Challenge Passage: varsayılan OK

## 5) Rate limiting (Free limitli)

Cloudflare Free’de klasik “Rate Limiting Rules” kotası sınırlı olabilir.  
Alternatifler (hepsi free-friendly):

### A) WAF custom rule (önerilen basit)

Security → WAF → Custom rules → Create:

**Rule name:** `Block burst API`  
**Expression** (örnek):

```text
(http.request.uri.path contains "/api/" and rate(1m) > 120)
```

*Not: `rate()` operatörü plan/özelliğe göre değişir. Yoksa:*

```text
(http.request.uri.path contains "/api/v1/public")
```

Action: **Managed Challenge** veya **Block** (dikkatli).

### B) Under Attack Mode (acil)

Security → Settings → **I’m Under Attack!**  
Sadece DDoS anında aç; normalde kapalı tut.

## 6) Scrape / hotlink koruması (opsiyonel)

- Scrape Shield → Email Address Obfuscation: On  
- Hotlink Protection: On (logo/player image dış sitelerden çekiliyorsa bozabilir — test et)

## 7) Vercel + Cloudflare birlikte

| Katman | Ne yapar |
|--------|----------|
| Cloudflare | Edge bot + challenge + TLS + cache |
| Vercel headers (`vercel.json`) | X-Frame-Options, HSTS, nosniff |
| Express rate limit | App-level IP limit |
| Firebase App Check | Client SDK isteklerinde bot skoru |

**Önemli:** Cloudflare “Full (strict)” + Vercel SSL uyumlu olsun.  
API path’leri için cache **Bypass** (Cache Rules: `/api/*` → Bypass).

### Cache Rule önerisi

- If URI Path starts with `/api` → **Bypass cache**
- Static assets (`/assets/*`, logos) → cache as needed

## 8) Kontrol listesi

- [ ] NS Cloudflare’e geçti (yeşil active)
- [ ] Turuncu proxy ON
- [ ] SSL Full (strict)
- [ ] Bot Fight Mode ON
- [ ] `/api/*` cache bypass
- [ ] Site + admin login + form + oy hâlâ çalışıyor
- [ ] Vercel env değişmedi

## 9) Sorun olursa

| Belirti | Çözüm |
|---------|--------|
| Infinite redirect | SSL mode Flexible ise → Full (strict) |
| Admin Google login bozuldu | Auth domain allowlist + Cloudflare challenge kapat test |
| API 429 sürekli | Rate rule gevşet; Express limit zaten var |
| Görseller yüklenmiyor | Hotlink Protection kapat |

Bu adımlar kod gerektirmez; Console tıklamalarıdır.
