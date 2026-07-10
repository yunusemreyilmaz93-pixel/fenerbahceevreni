# Tahmin Aracı — Page Override

## Rol

Tahmin aracı **senaryo laboratuvarı**dır.

Kullanıcı kalan maçlara sonuç girer, olası puan durumunu görür ve paylaşılabilir bir senaryo üretir.

Bu araç:

- bahis ürünü değildir,
- olasılık tahmini değildir,
- resmî puan durumu değildir,
- canlı veri gibi davranmaz.

---

## Görsel mod

**Data Mode + Interactive Tool**

---

## Tek imza öğesi

**Senaryo Şeridi**

Kullanıcının ilerlemesini gösteren sade bir şerit:

- tamamlanan maç sayısı,
- kalan maç sayısı,
- tahmini puan,
- sıfırla,
- paylaş.

Progress oyunlaştırma değil, görev durumu olarak sunulur.

---

## Sayfa başlığı

Göster:

- araç adı,
- sezon,
- kısa açıklama,
- açık simülasyon etiketi.

“Şampiyonluk kesin”, “kupaya bir adım” gibi sonuç yönlendiren dil kullanılmaz.

---

## Maç girişi

Her maç satırı:

- hafta,
- ev/deplasman,
- rakip,
- tarih,
- H/B/M veya skor girişi,
- seçili durum.

H/B/M seçenekleri bahis kuponu gibi görünmemelidir.

- nötr butonlar,
- seçili sonuç sarı çizgi veya yüzey,
- takım renkleri sınırlı,
- skor inputları erişilebilir.

---

## Puan tablosu

- gerçek başlangıç puanı açıkça belirtilir,
- tahminle eklenen puan ayrı gösterilebilir,
- toplam puan,
- sıralama,
- senaryo etiketi.

Gerçek ve tahmini değerler renk dışında metinle ayrılır.

---

## Paylaşım kartı

1920×1080 çıktı için:

- Fenerbahçe Evreni markası,
- “Benim senaryom” etiketi,
- seçili sonuç özeti,
- puan tablosu,
- üretim tarihi,
- açık simülasyon notu,
- okunabilir tipografi.

Paylaşım kartı web sayfasının birebir screenshot'ı olmamalıdır. Kendine ait yayın grafiği kompozisyonu olmalıdır.

---

## Hareket

- seçimde kısa state geçişi,
- puan değişiminde sayı vurgu,
- export sırasında loading,
- confetti yok,
- sürekli glow yok.

---

## Mobil

- maçlar satır veya accordion,
- sonuç butonları 44 px,
- tablo kritik sütunlarla,
- alt kısımda paylaş/sıfırla,
- export önizlemesi mobil layout'u bozmaz,
- sticky özet yalnızca yer kaplamıyorsa.

---

## Kabul kriterleri

- [ ] Araç bahis kuponu gibi görünmüyor
- [ ] Simülasyon etiketi ilk ekranda
- [ ] Gerçek ve tahmini puan ayrılıyor
- [ ] Maç girişi klavyeyle kullanılabilir
- [ ] Paylaşım kartında simülasyon notu var
- [ ] Mobilde bütün maçlar rahat girilebiliyor
- [ ] Emoji arayüz ikonu olarak kullanılmıyor
