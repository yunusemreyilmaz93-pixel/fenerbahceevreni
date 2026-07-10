# Operasyon: Firestore rules + job write + nightly cron

## “Hata” aslında neydi?

| Görünen mesaj | Gerçek sebep | Rules ile ilgisi |
|---------------|--------------|------------------|
| `Firestore credentials: missing` | Makinede **service account JSON yok** | **Yok** — Admin SDK rules’ı bypass eder |
| `firestoreJobLog=False` | Aynı: SA yok, job log buluta yazılamadı | Yok |
| `--require-firestore` exit 2 | SA bilinçli zorunlu | Yok |

**Önemli:** Job’lar `firebase-admin` + service account kullanır.  
Firestore **Security Rules client SDK** içindir. Rules yanlış olsa bile SA ile write engellenmez; rules client’ı korur.

Rules deploy bu oturumda yapıldı: `fenerbahceevreni-a4280` → `firestore.rules` + `storage.rules` **released**.

## Senin yapman gereken tek kritik şey (1 kez)

### Service account JSON

1. [Firebase Console](https://console.firebase.google.com/project/fenerbahceevreni-a4280/settings/serviceaccounts/adminsdk)  
2. **Generate new private key** → JSON indir  
3. Dosyayı **asla git’e koyma** (örn. `C:\secrets\fenerbahceevreni-sa.json`)

**Yerel test:**

```powershell
$env:FIREBASE_SERVICE_ACCOUNT_JSON = "C:\secrets\fenerbahceevreni-sa.json"
pip install -r data-worker\requirements.txt
python data-worker\run_job.py --type health_probe --require-firestore
```

**GitHub Actions (nightly):**

1. Repo → **Settings → Secrets and variables → Actions**  
2. New secret: `FIREBASE_SERVICE_ACCOUNT_JSON`  
3. Value = **JSON dosyasının tüm içeriğini yapıştır** (path değil, metin)  
4. Actions → **Data sync nightly** → Run workflow (manuel test)

## Rules deploy (ben / sen)

```bash
npm run rules:deploy
# veya
npx firebase deploy --only firestore:rules,storage --project fenerbahceevreni-a4280
```

Firebase CLI zaten `yunusemreyilmaz93@gmail.com` ile login.

## Nightly cron

Dosya: `.github/workflows/data-sync-nightly.yml`  
Zaman: her gün **03:15 UTC**  
Sıra: health → standings → squad → match advanced → entity ids  

SA secret yoksa workflow **fail** eder (bilinçli).

## Yapıştırma checklist (sadece sen)

| Ne | Nereye | Format |
|----|--------|--------|
| Service account JSON | GitHub Secret `FIREBASE_SERVICE_ACCOUNT_JSON` | Tüm JSON metin |
| Aynı dosya (opsiyonel local) | Env `FIREBASE_SERVICE_ACCOUNT_JSON` | Dosya yolu |
| App Check enforce | Firebase Console (birkaç gün metrics sonrası) | UI tık |
| reCAPTCHA site key | Vercel `VITE_FIREBASE_APPCHECK_SITE_KEY` | Zaten varsa atla |

Başka “gizli key” şu an pipeline için zorunlu değil.
