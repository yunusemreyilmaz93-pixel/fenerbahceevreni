# Fenerbahçe Spor Kulübü - Veri Boru Hattı (data-worker)

## Kadro Fetcher — `fetch_squad.py` (Scrapling, önerilen akış)

Uygulamanın kullandığı `public/data/squad.json` dosyasını yeniden üreten, **yeniden
çalıştırılabilir** kadro boru hattı. Transfermarkt'tan güncel kadroyu (numara, mevki,
yaş, uyruk, piyasa değeri, sözleşme, fotoğraf) ve her oyuncunun fiziksel künyesini
(boy, ayak, yan mevkiler, doğum yeri) çeker; fotoğrafları `public/players/` altına indirir.

**Önemli:** El yazısı **scout raporları** (overview / güçlü yönler / gelişim alanları)
`squad.json` içinde yaşar ve her çalıştırmada slug bazında **korunur** — yalnızca gerçek
istatistikler tazelenir. Kadroya yeni katılan oyuncular otomatik yakalanır (scout'ları
boş gelir, sonradan doldurulur).

```bash
pip install "scrapling[fetchers]>=0.2.0"
python data-worker/fetch_squad.py                 # 26/27 kadrosu
python data-worker/fetch_squad.py --season 2027   # sonraki sezon
```

Çıktı: `public/data/squad.json` (updatedAt bump → uygulama açılışında otomatik yeniler).

Fikstür / puan durumu için aşağıdaki SofaScore probu ve `public/data/matches.json`
(elle/otomatik güncellenebilir) kullanılır.

---

# Soccerdata Entegrasyon Worker'ı (SofaScore Test Probu)

Bu dizin, Fenerbahçe Spor Portalı için bağımsız Python veri entegrasyonu (`data-worker`) altyapısını kurmak ve doğrulamak için tasarlanmıştır. Bu aşamada, `soccerdata==1.9.0` kütüphanesi ve SofaScore kaynağı üzerinden Trendyol Süper Lig bağlantısının ve programatik akışların testi gerçekleştirilir.

> ⚠️ **Firestore / Bağımlılık Yasağı Sınırı**: Bu aşamada Firebase Admin API bağlantıları, Cloud Run container kurgusu veya veritabanına doğrudan kayıt (write) işlemleri gerçekleştirilmemektedir. Testler tamamen izole bir "Probe" niteliğindedir.

---

## Sistem Gereksinimleri
* **Python**: `3.10` ile `3.14` arası bir sürüm tercih edilmelidir.
* **İşletim Sistemi**: Linux, macOS veya Windows WSL.

---

## Kurulum ve Hazırlık

### 1. Sanal Ortam (Virtual Environment) Oluşturma
Proje dizininde izole bir sanal ortam oluşturun:

```bash
# macOS / Linux terminalinde
python3 -m venv data-worker/.venv

# Windows komut satırında (CMD/PowerShell)
python -m venv data-worker\.venv
```

Sanal ortamı aktifleştirin:

```bash
# macOS / Linux
source data-worker/.venv/bin/activate

# Windows CMD
data-worker\.venv\Scripts\activate

# Windows PowerShell
data-worker\.venv\Scripts\Activate.ps1
```

Ayrıca **Windows PowerShell** üzerinde ortamı doğrudan aktifleştirmeye gerek kalmadan (Execution Policy yetki kısıtlamalarına takılmadan) şu komutlarla da kurulum ve çalıştırma işlemlerini gerçekleştirebilirsiniz:

```powershell
py -m venv data-worker\.venv
data-worker\.venv\Scripts\python.exe -m pip install --upgrade pip
data-worker\.venv\Scripts\python.exe -m pip install -r data-worker\requirements.txt
data-worker\.venv\Scripts\python.exe data-worker\probe_sofascore.py --season 2025-26 --team "Fenerbahçe"
data-worker\.venv\Scripts\python.exe data-worker\probe_match_details.py --event-id 14109614
```

### 2. Bağımlılıkları Yükleme
`requirements.txt` dosyasındaki stabil ve sabitlenmiş paket sürümünü yükleyin:

```bash
pip install -r data-worker/requirements.txt
```

---

## Komut Dosyası ve Probe Çalıştırma

`probe_sofascore.py` betiği, Trendyol Süper Lig (`TUR-Super Lig`) özel tanımları aracılığıyla SofaScore veritabanından sezon, lig tablosu ve fikstür (schedule) bilgilerini çekerek doğrular ve Fenerbahçe maçlarını Türkçe karakter duyarlı şekilde süzerek yerel bir JSON raporu çıktılar.

### Çalıştırma Parametreleri
Betiği çalıştırırken aşağıdaki komut satırı argümanlarını (CLI) belirleyebilirsiniz:

* `--season`: Sorgulanacak sezon anahtarı. Varsayılan: `2025-26`.
* `--team`: Fikstürde aranacak ve filtreler için kullanılacak takım ismi. Varsayılan: `Fenerbahçe`.
* `--output`: Çıktılanacak teşhis raporunun yerel dosya yolu. Varsayılan: `data-worker/output/sofascore_probe.json`.
* `--force-cache`: Soccerdata yerel cache dosyalarının yeniden yüklenmesini tetikler.

### Örnek Çalıştırma Komutu

Aşağıdaki komutla Fenerbahçe'nin 2025-26 sezonu fikstürünü ve lig tablosunu test edebilirsiniz:

```bash
python data-worker/probe_sofascore.py --season 2025-26 --team "Fenerbahçe"
```

### Bireysel Maç Detayları Probu (`probe_match_details.py`)

Seçilen tek bir maçın ayrıntılı istatistiklerini, kadrolarını ve şut haritasını test etmek için tasarlanmıştır:

```bash
python data-worker/probe_match_details.py --event-id 14109614
```

* **Zorunlu Parametre**: `--event-id` (SofaScore sayısal benzersiz maç kimliği).
* **Opsiyonel Parametre**: `--output`, varsayılan: `data-worker/output/match_details_probe.json`.

Bu probe, hedef SofaScore REST API endpoint'lerini (`statistics`, `lineups`, `shotmap`) Soccerdata'nın yerleşik TLS ve önbellekleme mekanizmasıyla sorgulayarak özet metrikleri ve alan yapılarını teşhis raporu halinde kaydeder.

---

## Çıktı ve Kapsam Doğrulaması

Başarılı bir çalıştırma sonrasında çıktılanan rapor dosyası (`data-worker/output/sofascore_probe.json`) şu bilgileri doğrular:
* Özel lig konfigürasyonunun gücü ve `TUR-Super Lig` tanımsızlıklarının çözülmesi.
* `SofaScore` veri sağlayıcısı tarafından sunulan Süper Lig lig ve sezon bilgileri.
* Güncel puan durumu (League Table) kolonları ve satırları.
* Fikstürdeki tüm maçlar arasından Fenerbahçe derbileri dahil tüm karşılaşmaların yakalanması.

### Entegrasyon Kısıtlamaları (SofaScore Sınıfı Hakkında)
Bu kurguda test edilen SofaScore sınıfı, `soccerdata` API yapısı gereği yalnızca lig, sezon, genel puan tablosu ve fikstür (schedule) verileri sunmaktadır. Ayrıntılı oyuncu bazlı bireysel maç içi istatistikler ve gelişmiş ısı haritaları (read_player_stats, read_match_stats) bu sınıfta yer almamaktadır.

## fetch_standings.py — Süper Lig Puan Durumu

Transfermarkt'tan puan durumunu çeker ve `public/data/standings.json`'a yazar.
Takım adlarını Türkçeleştirir, yerel `public/logos/` dosyalarıyla eşler
(dosya yoksa boş bırakır — UI baş harf rozetine düşer). Sezon bittiyse
`isFinal: true` etiketler.

```
python data-worker/fetch_standings.py --season 2025   # 2025-26 sezonu
python data-worker/fetch_standings.py --season 2026   # 2026-27 (sezon başlayınca)
```

Site tarafında `bootstrapStandingsFromLocalFile()` (dbService.ts) bu dosyayı
versiyon-farkında olarak `cms_standings`'e yükler.

Not: SofaScore API (403) ve FotMob API (boş gövde/token korumalı) maç
istatistikleri için denendi ve şu an erişilemiyor — maç istatistik scraper'ı
için ileride tekrar denenebilir.
