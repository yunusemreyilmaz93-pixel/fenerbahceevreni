# Fenerbahçe Evreni — Ürün & Teknik Roadmap

> Hedef: **Kod yazmadan siteyi yönetebileceğin** Admin CMS + **çok kaynaklı, dolu veri** + aşamalı premium frontend.  
> Sıra (senin talebin): **Roadmap → Backend → Veri/Scraper → Frontend/UX → Admin CMS perfection**.  
> Son güncelleme: 2026-07-09

---

## 0) İlkeler (değişmeyecek kurallar)

1. **Backend ve veri önce.** UI, boş/yanlış veriyle “güzel boş kutu” olmasın.
2. **Tek kaynaklı gerçeklik (source of truth):** Firestore (veya Postgres) + normalize şema. `localStorage` CMS sadece dev fallback; prod’da kapanır.
3. **Sağlayıcılar pluggable:** SofaScore, FBref, FotMob, Transfermarkt, WhoScored… hepsi adapter. UI asla ham scraper’a bağlanmaz.
4. **Admin = operasyon paneli.** Makale, maç, oyuncu, anket, bülten, scraper job, hata logu, manuel override — hepsi UI’dan.
5. **Sahte veri yok.** Eksik metrik = `null` + “veri yok” UI; uydurma rating/xG basılmaz.
6. **Kaynak şeffaflığı:** Her metrikte `provider`, `fetchedAt`, mümkünse `sourceUrl`.
7. **Scrape ≠ yasal garanti.** Rate-limit, cache, ToS farkındalığı, mümkünse resmi/ücretli API yedek.

---

## 1) Açık kaynak araştırma özeti (GitHub / ekosistem)

### 1.1 Kullanılabilir ana kütüphaneler

| Araç | Dil | Kaynaklar | Süper Lig? | xG / shot / heatmap | Not |
|------|-----|-----------|------------|---------------------|-----|
| **[soccerdata](https://github.com/probberechts/soccerdata)** (~1.8k★) | Python | FBref, SofaScore, Understat, WhoScored, ESPN, ClubElo, SoFIFA, Football-Data.co.uk | SofaScore + **FBref evet**; Understat **hayır** (top-5) | FBref: sezonsal advanced; Understat: shot xG (top-5); WhoScored: event stream (kırılgan) | **Zaten projede var.** Çok-kaynak omurga için en mantıklı başlangıç. |
| **[worldfootballR](https://github.com/JaseZiv/worldfootballR)** | R | FBref, Transfermarkt, Understat | FBref/TM evet | İyi | **FotMob v0.6.4+ kaldırıldı** (ToS). R stack istemiyorsan es geç. |
| **[ScraperFC](https://github.com/oseymour/ScraperFC)** | Python | FBref, Understat, Capology, Transfermarkt… | Kısmi | Orta | soccerdata’ya alternatif/ek. |
| **[alraven3/Football](https://github.com/alraven3/Football)** | Notebook | FotMob, SofaScore, Understat | Deneysel | FotMob match/event notları | Hazır “ürün” değil; **FotMob reverse-engineering referansı**. |
| **[statsbomb/open-data](https://github.com/statsbomb/open-data)** | JSON | Seçili turnuvalar | Süper Lig canlı sezon **yok** | Event-level altın standart | Eğitim / demo / geçmiş; günlük FB pipeline değil. |
| **[EasySoccerData](https://github.com/manucabral/EasySoccerData)** | Python | Sofa, FBref… | Değişken | Orta | İncelenebilir; production hardening gerekir. |
| **Transfermarkt scrapers** (çeşitli) | Python | Kadro, MV, transfer | Evet | Hayır | Sizde zaten `fetch_squad` / `fetch_standings` (Scrapling). |
| **API-Football / Sportmonks** (ücretli) | REST | Canlı skor, XI, stats | Evet | Sınırlı advanced | Scrape kırılınca **yedek omurga**. ToS-uyumlu. |

### 1.2 Kaynak bazlı gerçekçi beklenti (FB odaklı)

| İhtiyaç | En iyi pratik kaynak | Alternatif | Risk |
|---------|----------------------|------------|------|
| Kadro, forma no, MV, sözleşme, foto | **Transfermarkt** (mevcut) | Sofa/FotMob | HTML değişimi |
| Puan durumu / fikstür | **SofaScore** veya **FBref** veya **API-Football** | TM | 403 / rate limit (sizin README’de Sofa 403 notu var) |
| Sezon oyuncu stats (şut, pas, baskı…) | **FBref** (Süper Lig var) | Sofa | Cloudflare / 403 dönemleri |
| Maç xG, shot map | **FotMob** veya **SofaScore** match endpoints | FBref match (daha az görsel) | Token / bot koruması |
| Isı haritası (heatmap) | **FotMob** / **SofaScore** (varsa endpoint) | Kendi event→grid (WhoScored) | En kırılgan katman |
| Shot-level xG zinciri | **Understat** | — | **Süper Lig yok** → UCL/top-5 rakip analizi için |
| Event stream (pass/shot xy) | **WhoScored** (soccerdata) | StatsBomb ücretli | Selenium, ban riski |
| Elo / güç | **ClubElo** | — | Kolay, düşük risk |
| Canlı skor (maç günü) | **API-Football** (önerilen yedek) | Sofa live | Scrape ile canlı = cehennem |

### 1.3 FotMob özel not (önemli)

- `worldfootballR` FotMob’u **ToS nedeniyle çıkardı**.
- Sizin `data-worker/README`: FotMob API denendi → **boş gövde / token koruması**.
- Toplulukta (alraven3 notebook’ları, çeşitli gist’ler) **match detail / shotmap / rating** örnekleri var; bunlar “resmi SDK” değil, **kırılgan adapter** olarak düşünülmeli.
- Strateji: **FotMob = advanced layer (xG, heatmap, player rating)**, asla tek “source of truth” olmasın. Kırılırsa site ayakta kalsın (FBref + Sofa + admin override).

### 1.4 Önerilen multi-scraper mimarisi (sizin için)

```
                    ┌─────────────────────┐
                    │   Scheduler (cron)  │
                    │  GitHub Actions /   │
                    │  Cloud Run / local  │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              ▼                ▼                ▼
        Provider A       Provider B       Provider C
        (FBref)          (SofaScore)      (FotMob*)
        soccerdata       soccerdata       custom adapter
              │                │                │
              └────────────────┼────────────────┘
                               ▼
                    ┌─────────────────────┐
                    │  Normalize + Entity │
                    │  Resolver (player/  │
                    │  match ID map)      │
                    └──────────┬──────────┘
                               ▼
                    ┌─────────────────────┐
                    │  Firestore / DB     │
                    │  + raw archive      │
                    │  + job logs         │
                    └──────────┬──────────┘
                               ▼
                    ┌─────────────────────┐
                    │  Public API / Admin │
                    │  (read + override)  │
                    └─────────────────────┘
```

\*FotMob custom; TM zaten Scrapling ile ayrı job.

**Entity resolver şart:** Aynı oyuncu = `fbref_id` + `sofascore_id` + `fotmob_id` + `tm_id` → tek `playerId`.  
Bunu yapmazsan raporlar dağılır, CMS kabus olur.

---

## 2) Fazlar (yüksek seviye sıra)

| Faz | İsim | Çıktı | Tahmini süre* |
|-----|------|-------|----------------|
| **A** | Backend çekirdek | API, auth, şema, job runner, seed | 1–2 hafta |
| **B** | Veri / multi-scraper | FBref + Sofa + TM + FotMob adapter, entity map | 2–4 hafta |
| **C** | Admin CMS perfection | “Kod yazmadan yönet” | 2–3 hafta |
| **D** | Frontend / UX aşamaları | Homepage → maç → oyuncu → evren | 3–5 hafta |
| **E** | Platform (opsiyonel) | Kullanıcı hesabı, fraksiyon profili | 2+ hafta |
| **F** | Premium / ödeme | Gerçek kilit + webhook | ihtiyaca göre |

\*Tek geliştirici + AI destek varsayımı. İçerik üretimi süreye dahil değil.

---

## 3) Faz A — Backend tamamen (önce bu)

### A1. Hedef mimari

**Öneri (mevcut yığınla uyumlu):**

- **API:** Express (zaten `server.ts`) → net REST (veya tRPC)  
  - Public: read-only spor + CMS content  
  - Admin: CRUD + job trigger + media  
- **DB:** Firestore (mevcut) **veya** Postgres (daha güçlü query/join; ileride).  
  Kısa vade: **Firestore + net koleksiyon sözleşmesi** (docs’taki advanced şemayı uygula).
- **Auth:** Firebase Auth admin only (şimdilik); custom claims.
- **Jobs:** Python `data-worker` ayrı process; Node sadece “enqueue / status / result ingest”.
- **Storage:** Firebase Storage (görseller, heatmap PNG opsiyonel, export CSV).
- **Secrets:** `.env` + host env; asla client’a private key.

### A2. Koleksiyon sözleşmesi (uygulanacak)

Mevcut + genişletme:

| Koleksiyon | Yazan | Okuyan | Amaç |
|------------|-------|--------|------|
| `players` | Admin + squad job | Public | Kanonik kadro |
| `matches` | Admin + fixture job | Public | Fikstür / skor |
| `standings` | Job | Public | Puan durumu |
| `articles` | Admin only | Public published | Analiz |
| `transferReports` | Admin | Public | Radar |
| `polls` + `votes` | Admin / public vote | Public | Anket |
| `advancedPlayerStats` | Jobs | Public | Sezon metrikleri |
| `advancedMatchStats` | Jobs | Public | Maç xG, shotmap, heatmap meta |
| `providerIds` | Jobs + Admin | Admin | Entity map |
| `scrapeJobs` | System | Admin | Job log, hata, süre |
| `rawSnapshots` (opsiyonel Storage) | Jobs | Admin | Ham JSON arşiv |
| `homeSettings`, `announcements`, `newsletter`… | Admin | Public | CMS |

### A3. Backend API yüzeyleri (minimum)

```
GET  /api/health
GET  /api/v1/standings
GET  /api/v1/fixtures?team=fb&season=
GET  /api/v1/matches/:id
GET  /api/v1/matches/:id/advanced?provider=
GET  /api/v1/players
GET  /api/v1/players/:slug
GET  /api/v1/players/:slug/stats?season=
GET  /api/v1/articles
GET  /api/v1/articles/:slug

POST /api/admin/jobs/run          { type, season, force }
GET  /api/admin/jobs
GET  /api/admin/jobs/:id
POST /api/admin/players/:id/override
POST /api/admin/matches/:id/override
...
```

Public site **doğrudan Firestore client okumayı** bırakıp (veya kademeli) API’ye geçebilir — kurallar sadeleşir, cache eklenir.

### A4. Job tipleri (backend “tamam” sayılır)

1. `sync_squad` — TM (mevcut)
2. `sync_standings` — TM / FBref / Sofa
3. `sync_fixtures` — Sofa / FBref
4. `sync_player_season_stats` — **FBref öncelik**
5. `sync_match_advanced` — Sofa + **FotMob adapter** (xG, shotmap, rating)
6. `sync_entity_ids` — isim/slug fuzzy + manuel map
7. `health_probe` — her provider “canlı mı?”

Her job: `status`, `startedAt`, `finishedAt`, `error`, `recordsWritten`, `provider`.

### A5. Faz A kabul kriterleri (Definition of Done)

- [ ] Admin harici write yok (rules + API)
- [ ] `localStorage` prod path’te devre dışı
- [ ] En az 1 job end-to-end: çek → normalize → Firestore → API’den oku
- [ ] Job log Admin’de görünür (ham JSON da yeter)
- [ ] Entity map koleksiyonu var (en az FB kadrosu elle/yarı-oto map)

---

## 4) Faz B — Veri & multi-scraper (Sofa yetmez)

### B1. Provider öncelik matrisi (uygulama sırası)

| Sıra | Provider | Ne çekeriz | Araç |
|------|----------|------------|------|
| 1 | **Transfermarkt** | Kadro, MV, sözleşme, standings | Scrapling (mevcut) |
| 2 | **FBref** | Sezon player/team stats, schedule, bazı match stats | soccerdata `FBref` + custom league key `TUR-Super Lig` |
| 3 | **SofaScore** | Fixtures, live-ish, lineups, partial advanced | soccerdata + sizin `sofascore_superlig` |
| 4 | **FotMob** | Match xG, shotmap, heatmap endpoints, ratings | **Custom adapter** (referans: alraven3 notebook’ları; production hardening) |
| 5 | **WhoScored** (opsiyonel) | Event stream denemesi | soccerdata (kırılgan) |
| 6 | **ClubElo** | Takım gücü | soccerdata |
| 7 | **API-Football** (yedek) | Fixtures/live/XI | Resmi API key |

**Understat:** Süper Lig yok → sadece Avrupa maçları / eğitim; ana pipeline’a koyma.

### B2. FotMob adapter planı (ayrı scraper)

Hedef endpoint aileleri (keşif sonrası netleşir; probe script ile):

- League table / fixtures (league id Super Lig ≈ 71)
- Match details (xG, stats)
- Shotmap
- Player season stats
- Heatmap (varsa image URL veya coordinate grid)

Implementasyon adımları:

1. `data-worker/providers/fotmob.py` — sadece HTTP + parse  
2. `probe_fotmob.py` — tek maç / tek lig teşhis JSON  
3. Rate limit: min aralık, cache dir, user-agent rotasyonu dikkatli  
4. Başarısızlıkta job `degraded` + diğer provider devam  
5. Admin’de “FotMob son başarılı sync” badge

### B3. Normalize alanlar (rapor yazmak için minimum set)

**Maç (`advancedMatchStats`):**

- skor, dk, durum  
- xG home/away (provider’a göre)  
- possession, shots, sot, big chances  
- shotmap: `[{x,y,xG,player,outcome}]`  
- heatmap: storage path veya grid  
- ratings (player list)  
- timeline events (gol, kart, değişiklik)

**Oyuncu sezon:**

- dk, gol, asistik, xG, xA  
- shot, sot, key pass, progressive  
- tackle, interception, aerial  
- form son 5 maç rating ort.

### B4. Veri kalitesi kuralları

- İki provider çelişirse: **admin override > primary provider config > freshest fetchedAt**
- Primary default önerisi:  
  - skor/fixture: Sofa veya API-Football  
  - advanced sezon: FBref  
  - maç xG/görsel: FotMob (varsa) else Sofa  
- Her gece full season soft-refresh; maç bitince +2s / +1h / +6h re-fetch advanced

### B5. Faz B kabul kriterleri

- [ ] Son 10 FB maçı için en az bir advanced paket (xG + shotmap veya eşdeğeri)
- [ ] Güncel kadro + sezon stats FBref/TM birleşik
- [ ] Provider fail → site çökmez, Admin kırmızı uyarı
- [ ] Ham snapshot arşivi (debug için)

---

## 5) Faz C — Admin CMS “perfect” (bir daha kod yazma)

Amaç: **İçerik, veri override, scraper, menü, anket, bülten — sıfır deploy/kod.**

### C1. Operasyon checklist (CMS kapsamı)

| Modül | Perfect tanımı |
|-------|----------------|
| Dashboard | Bugün maç? Boş içerik? Son job hata? Bekleyen mesaj? |
| Makaleler | Draft/publish, kapak, SEO, premium flag, etiket, ilgili oyuncu/maç |
| Maçlar | Fikstür düzenle, featured, muhtemel XI, maç notu, advanced’i “kilitle/override” |
| Oyuncular | Scout metni, foto, slug, stat override, “first XI” |
| Transfer | Rapor + güven skoru + kaynak link |
| Anketler | Oluştur, kapat, sonuç gör |
| Bülten | Abone listesi, issue draft, gönderim log (provider sonra) |
| Medya | Upload, crop yoksa en az URL + alt text |
| Scraper Jobs | Tek tık çalıştır, log, retry, provider toggle |
| Entity Map | Oyuncu/takım ID eşleştirme UI (kritik) |
| Ana sayfa | Bölüm aç/kapa, hero metin, announcement |
| Mesajlar / raporlar | İletişim formu kuyruğu |
| Ayarlar | Admin e-postaları, feature flags, primary provider |

### C2. “Kod yazmamak” için kırmızı çizgiler

- Yeni sezon → Admin’den `seasonKey` + job run  
- Yeni oyuncu → squad job + scout formu  
- Ana sayfa kampanyası → homeSettings  
- Acil duyuru → announcement  
- Scraper kırıldı → provider disable + manuel maç skoru  

### C3. Faz C kabul kriterleri

- [ ] 30 gün boyunca site operasyonu **sadece Admin** (kod yok)
- [ ] Job retry + hata mesajı Türkçe
- [ ] Override edilen alan “manuel kilit” ikonu taşır; job ezmez
- [ ] Import/Export (JSON/CSV) yedek

---

## 6) Faz D — Frontend & tasarım (backend dolunca)

Sıra bilinçli olarak **geç**:

| Alt faz | Sayfa | Odak |
|---------|-------|------|
| D1 | Design system | Tek radius, tipografi scale, EmptyState, DataBadge (provider + saat) |
| D2 | Homepage | “Bugünün nabzı” — maç + 1 analiz + 1 anket; scroll kısalt |
| D3 | Maç Merkezi | Advanced stats, shotmap, xG bar, kaynak etiketi |
| D4 | Oyuncular | Sezon radar, form, karşılaştırma (gerçek veri) |
| D5 | Transfer / Analiz | Okuma deneyimi sakin (CAPS azalt) |
| D6 | Fraksiyon Evreni | Mobil UX, kredi kartı sadeleştir, quiz→profil hook |
| D7 | SEO | Prerender/SSR kritik sayfalar |

---

## 7) Faz E–F (sonra)

- Kullanıcı hesabı (fraksiyon badge, kayıtlı XI, oylar)
- Premium gerçek ödeme (iyzico/PayTR + custom claims)
- PWA / bildirim (maç günü)

---

## 8) İlk 14 günlük sprint önerisi (hemen başlanacak)

### Hafta 1 — Backend iskelet
1. `scrapeJobs` + `providerIds` + `advancedMatchStats` rules deploy  
2. Express `/api/v1/*` read endpoints (mevcut Firestore’dan)  
3. Admin endpoint: job trigger (local Python spawn veya queue file)  
4. `sync_squad` + `sync_standings` → Firestore write (localStorage’ı kes)

### Hafta 2 — Multi source başlangıç
5. FBref Super Lig probe + `sync_player_season_stats`  
6. Sofa match details (mevcut probe) → `advancedMatchStats`  
7. FotMob probe script (tek maç xG/shotmap keşfi)  
8. Admin “Jobs” sayfası v0 (liste + run + log)

---

## 9) Riskler ve bilinçli kararlar

| Risk | Etki | Mitigasyon |
|------|------|------------|
| Sofa/FotMob bot koruması | Advanced boş | FBref + manuel + ücretli API yedek |
| ToS / hukuki | Site riski | Rate limit, non-commercial kullanım, mümkünse lisanslı API; ham HTML’i re-publish etme |
| Entity mismatch | Yanlış oyuncu stats | Admin map UI + fuzzy + manuel onay |
| God-file frontend | Bakım | CMS perfect sonrası bile FE refactor şart |
| Tek kişi operasyon | Tükenme | Job otomasyonu + “minimum viable content” ritmi |

---

## 10) Bilinçli “yapmayacağımız” şeyler (şimdilik)

- Understat’ı Süper Lig ana kaynağı sanmak  
- Sadece FotMob’a bağlanmak  
- Canlı skoru scrape ile “garanti” sunmak  
- Frontend redesign’e backend dolmadan girmek  
- Premium’u client flag ile “satmak”

---

## 11) Sonraki adım (onayın sonrası)

Roadmap onaylanınca **Faz A** ile kod:

1. `data-worker` job runner sözleşmesi  
2. Firestore rules + schema uygulaması  
3. API v1  
4. İlk production-path: squad/standings → Firestore  

Onay soruları (istersen cevapla, default ile gideriz):

1. **DB:** Firestore’da kalalım mı, yoksa Postgres’e (Supabase) geçiş düşünüyor musun?  
   → **Default: Firestore (mevcut).**  
2. **Canlı skor yedek:** API-Football ücretsiz/ücretli key almaya açık mısın?  
   → **Default: önce free scrape, 2. sprintte API slotu.**  
3. **Host:** Job’lar GitHub Actions mi, kendi PC cron mu, Cloud Run mu?  
   → **Default: önce local/Admin tetik + GH Actions nightly.**

---

## 12) Kaynak linkleri (bookmark)

- soccerdata: https://github.com/probberechts/soccerdata  
- soccerdata docs: https://soccerdata.readthedocs.io/  
- worldfootballR (FotMob removed note): https://jaseziv.github.io/worldfootballR/  
- StatsBomb open data: https://github.com/statsbomb/open-data  
- FotMob/Understat scrape notları: https://github.com/alraven3/Football  
- FBref Super Lig: https://fbref.com/en/comps/26/Super-Lig-Stats  
- Sizin şema taslağı: `docs/soccerdata-firestore-schema.md`  
- Sizin worker: `data-worker/README.md`
