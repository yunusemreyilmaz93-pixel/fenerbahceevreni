# Fenerbahçe Evreni - Firestore Bileşik Endeks Kılavuzu (FIREBASE_INDEX_NOTES.md)

Bu kılavuz, **Fenerbahçe Evreni** uygulamasında karmaşık sorguların hata vermeden, yüksek performansla çalışabilmesi için Firestore üzerinde oluşturulması gereken bileşik endeksleri (composite indexes) açıklamaktadır.

---

## 🛠 Neden Bileşik Endekslere İhtiyaç Duyulur?
Firestore'da birden çok alana göre filtreleme (`where`) ve sıralama (`orderBy`) işlemleri yapıldığında, Firestore güvenlik nedeniyle bu sorguların önceden indekslenmesini şart koşar. Aksi takdirde, sorgu çalıştırıldığında konsolda endeks oluşturma bağlantısı (`Query requires an index...`) içeren bir hata döner.

---

## 📋 Önerilen Bileşik Endeksler (Composite Indexes)

Aşağıdaki endekslerin her birini **Firebase Console > Firestore > Indexes** sekmesinden manuel oluşturabilir veya `firestore.indexes.json` dosyanız aracılığıyla Firebase CLI kullanarak yükleyebilirsiniz.

### 1. Makaleler / Analizler (articles)
* **Sorgu Amacı:** Yayınlanmış makaleleri tarihe göre tersten listelemek.
  * **Koleksiyon ID:** `articles`
  * **Alanlar:**
    1. `status` (Ascending)
    2. `publishedAt` (Descending)
  * **Sorgu Kapsamı:** Single Collection

* **Sorgu Amacı:** Öne çıkarılan yayınlanmış makaleleri listelemek.
  * **Koleksiyon ID:** `articles`
  * **Alanlar:**
    1. `status` (Ascending)
    2. `featured` (Ascending)
    3. `publishedAt` (Descending)
  * **Sorgu Kapsamı:** Single Collection

### 2. Maç Merkezi (matches)
* **Sorgu Amacı:** Maç durumuna göre yaklaşan, canlı veya bitmiş maçları tarihe göre sıralı getirmek.
  * **Koleksiyon ID:** `matches`
  * **Alanlar:**
    1. `status` (Ascending)
    2. `matchDate` (Descending)
  * **Sorgu Kapsamı:** Single Collection

### 3. Transfer Radarı (transferReports)
* **Sorgu Amacı:** Yayınlanmış scouting raporlarını uyumluluk skoruna veya tarihe göre sıralamak.
  * **Koleksiyon ID:** `transferReports`
  * **Alanlar:**
    1. `status` (Ascending)
    2. `fitScore` (Descending)
  * **Sorgu Kapsamı:** Single Collection

* **Sorgu Amacı:** Öne çıkan transfer analizlerini listelemek.
  * **Koleksiyon ID:** `transferReports`
  * **Alanlar:**
    1. `status` (Ascending)
    2. `featured` (Ascending)
    3. `createdAt` (Descending)
  * **Sorgu Kapsamı:** Single Collection

### 4. Oyuncu Performans Alanı (players)
* **Sorgu Amacı:** Aktif kadro oyuncularını form puanına göre yüksekten düşüğe sıralamak.
  * **Koleksiyon ID:** `players`
  * **Alanlar:**
    1. `status` (Ascending)
    2. `formRating` (Descending)
  * **Sorgu Kapsamı:** Single Collection

---

## 🚀 Firebase CLI ile Endeks Dağıtımı

Eğer `firestore.indexes.json` dosyasını yapılandırdıysanız, aşağıdaki komutla tüm endeksleri Firebase projenize tek komutla yükleyebilirsiniz:

```bash
firebase deploy --only firestore:indexes
```
