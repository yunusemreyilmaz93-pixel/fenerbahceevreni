# Oyuncular — Page Override

## Rol

Oyuncular sayfası bir fotoğraf galerisi değil, **kadro atlası**dır.

Kullanıcı:

- kadroyu mevkiye göre tarayabilmeli,
- oyuncunun temel durumunu görebilmeli,
- gerçek sezon verisini inceleyebilmeli,
- scout notunu okuyabilmeli,
- oyuncuları karşılaştırabilmelidir.

---

## Görsel mod

**Data Mode**

Karakter: takım kadro fişi + modern oyuncu profili.

---

## Tek imza öğesi

**Forma Numarası Katmanı**

Oyuncu detayında büyük fakat düşük kontrast forma numarası kompozisyon öğesi olarak kullanılabilir.

- gerçek numara varsa,
- metni ezmez,
- her oyuncu kartında tekrarlanmaz,
- sarı glow içermez.

---

## Kadro liste sayfası

### Üst bölüm

- Kadro başlığı
- sezon
- veri güncellemesi
- toplam oyuncu
- mevki filtresi
- arama
- trend filtresi yalnızca gerçek trend verisi varsa.

KPI alanı dört eşit kart olmak zorunda değildir. Tek bir özet rail yeterlidir.

### Gruplama

Tercih edilen yapı:

- Kaleciler
- Savunma
- Orta saha
- Hücum

veya kullanıcı filtresine göre tek sonuç alanı.

Masaüstünde kontrollü grid, mobilde iki kolon veya satır kullanılabilir.

---

## Player Tile

Göster:

- fotoğraf,
- ad,
- forma numarası,
- ana mevki,
- durum,
- en fazla iki doğrulanmış metrik.

Gösterme:

- kart üzerinde uzun scout listesi,
- altı farklı badge,
- veri yokken 0.0,
- piyasa değerini performans göstergesi gibi,
- her kartta glow.

Fotoğraf yüksekliği ve kırpma tutarlı olmalıdır.

---

## Oyuncu detay

### Hero

5/7 veya 4/8 kompozisyon:

Sol:

- oyuncu görseli,
- forma numarası,
- isim,
- mevki,
- status.

Sağ:

- sezon özeti,
- temel metrikler,
- kaynak/güncellik,
- kısa scout özeti,
- karşılaştırma eylemi.

### Bilgi sırası

1. Kimlik
2. Sezon performansı
3. Son maçlar
4. Rol ve taktik kullanım
5. Güçlü yönler
6. Gelişim alanları
7. Sözleşme/piyasa bilgisi
8. İlgili analizler
9. Kaynaklar

Kişisel bilgi ile performans verisi görsel olarak ayrılmalıdır.

---

## Metrikler

- yalnızca gerçek veri,
- sezon ve turnuva bağlamı,
- dakika başına veya 90 dakika başına ise açık etiket,
- rating sağlayıcısı,
- veri zamanı.

Form rating yoksa `—`.  
Trend verisi yoksa “stabil” varsayımı görsel başarı gibi sunulmamalıdır.

---

## Karşılaştırma

Karşılaştırma görünümü:

- aynı metrik seti,
- aynı ölçek,
- yan yana açık değer,
- mobilde üst üste fakat başlık sticky olabilir,
- veri eksikliği açık.

Radar chart zorunlu değildir. Basit tablo çoğu durumda daha güvenilirdir.

---

## Son maçlar

Satır düzeni:

- tarih,
- rakip,
- skor,
- turnuva,
- dakika,
- puan varsa,
- not.

Oyuncunun oynamadığı maç performans kaydı gibi gösterilmez.

---

## Mobil

- hero görseli maksimum viewport'un yaklaşık %42'si,
- temel kimlik görselle birlikte,
- metrikler 2 kolon,
- filtre drawer veya yatay mevki rail'i,
- compare seçimi kolay,
- uzun scout notu accordion olabilir fakat ana özet gizlenmez.

---

## Kabul kriterleri

- [ ] Oyuncu sayfası transfer kartlarının kopyası değil
- [ ] Fotoğraflar tutarlı
- [ ] Veri sağlayıcısı görünür
- [ ] Eksik veri sıfır gösterilmiyor
- [ ] Piyasa değeri performans gibi sunulmuyor
- [ ] Karşılaştırma aynı ölçeği kullanıyor
- [ ] Mobilde kimlik ve temel metrikler ilk ekranda
