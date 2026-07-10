# Firebase App Check (reCAPTCHA v3) — ücretsiz kurulum

Kod tarafı: `src/lib/firebase.ts` → `initFirebaseAppCheck()`.  
Site key env ile gelir; Console’da register + enforcement senin işin.

## A) Google reCAPTCHA v3 site key

1. [Google reCAPTCHA Admin](https://www.google.com/recaptcha/admin)
2. **Create** → reCAPTCHA **v3**
3. Domains:
   - `fenerbahceevreni.com`
   - `www.fenerbahceevreni.com`
   - `localhost` (local test)
   - Vercel preview: `*.vercel.app` (reCAPTCHA domain kurallarına göre ekle)
4. **Site key** kopyala (secret key Firebase’e gider, client’a değil)

## B) Firebase Console

1. [Firebase Console](https://console.firebase.google.com/project/fenerbahceevreni-a4280/appcheck)  
   Project: `fenerbahceevreni-a4280`
2. **App Check** → Web app’ini kaydet
3. Provider: **reCAPTCHA v3** → site key + secret key yapıştır
4. Apps listesinde web app **Registered** olsun

## C) Vercel env

| Değişken | Değer |
|----------|--------|
| `VITE_FIREBASE_APPCHECK_SITE_KEY` | reCAPTCHA **site** key (public) |

Redeploy zorunlu (Vite build-time inject).

Local `.env`:

```env
VITE_FIREBASE_APPCHECK_SITE_KEY=6L...
VITE_FIREBASE_APPCHECK_DEBUG_TOKEN=true
```

Debug token: Console → App Check → Manage debug tokens → tarayıcı console’daki UUID’yi ekle  
(`FIREBASE_APPCHECK_DEBUG_TOKEN` true iken console bir UUID basar).

## D) Enforcement (aşamalı!)

**Hemen “Enforce” basma** — önce Monitoring.

1. App Check → APIs → **Cloud Firestore** → Metrics bir süre izle  
2. Aynı şekilde **Authentication**, **Storage**  
3. Trafik “verified” görünce:
   - Firestore → **Enforce**
   - Storage → **Enforce**
   - Auth → isteğe bağlı Enforce

Enforcement açıkken App Check token’sız SDK istekleri **reddedilir**.

## E) Doğrulama

1. Prod sitede hard refresh  
2. Console’da App Check hatası olmamalı  
3. Anonim oy + form + admin login çalışmalı  
4. Metrics’te valid token oranı yükselmeli  

## F) Bilinen notlar

- Site key **public**’tir (VITE_ OK). Secret key sadece Firebase/Google tarafında.
- Cloudflare Bot Fight + App Check birlikte çalışabilir; login bozulursa önce challenge’ı test et.
- Enforcement’ı kapatmak: Console → product → Unenforce (acil geri alma).
