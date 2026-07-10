# Transfer Radarı — Page Override

## Rol

Transfer Radarı bir dedikodu akışı değil, **scout dosyası ve takip merkezi**dir.

Her oyuncu veya gelişme için:

- kimlik,
- mevcut kulüp,
- mevki,
- yaş,
- tahmini maliyet,
- taktik uyum,
- güçlü yön,
- risk,
- haber durumu,
- kaynak,
- güncellenme

açık biçimde ayrılmalıdır.

---

## Görsel mod

**Data Mode + Dossier karakteri**

---

## Tek imza öğesi

**Dossier Spine**

Her detay raporunda sol veya üst kenarda ince bir bilgi omurgası:

- dosya kodu,
- güncelleme,
- durum,
- kaynak sınıfı,
- premium durumu.

Bu alan dekoratif barkod veya sahte güvenlik kodu üretmez.

---

## Liste sayfası

### Başlık

- Transfer Radarı
- kısa metodoloji açıklaması
- son güncelleme
- “iddia/resmî/scout” ayrımı

### Filtreler

- mevki,
- durum,
- maliyet,
- yaş/potansiyel,
- fit score varsa,
- arama.

Mobilde drawer.  
Bütün filtreler sarı pill yapılmaz.

### Sonuç görünümü

Tercih:

- bir featured dossier,
- altında taranabilir kayıt listesi veya kontrollü grid,
- her kayıtta en fazla temel veriler,
- kaynak ve durum görünür.

---

## Durum sınıfları

Örnek kontrollü sınıflar:

- Resmî
- Görüşme
- Güvenilir iddia
- Basın iddiası
- İzleme listesi
- Editoryal profil
- Kapandı

Renk ve metin birlikte kullanılmalıdır.

“Hot”, “flame”, “mega transfer” gibi etkileşim dili güvenilirliği azaltır.

---

## Fit score

Fit score yalnızca metodoloji varsa gösterilir.

Gerekli bağlam:

- ölçek,
- hesaplama tarihi,
- kriter özeti,
- editoryal mi veri tabanlı mı olduğu.

Büyük dairesel skor göstergesi varsayılan değildir.  
Basit sayı + kısa bar çoğu durumda yeterlidir.

---

## Oyuncu dossier detayı

Önerilen yapı:

1. Kimlik ve görsel
2. Durum + kaynak omurgası
3. Temel profil
4. Taktik uyum özeti
5. Güçlü yönler
6. Riskler / soru işaretleri
7. Maliyet ve sözleşme bağlamı
8. Veri/metodoloji
9. Benzer oyuncular veya kadro etkisi
10. İlgili haberler

Strength ve concern alanları aynı ikonlu küçük kartlara dönüşmek zorunda değildir. İki dengeli sütun veya liste kullanılabilir.

---

## Mevki ihtiyaç panosu

Bu pano yalnızca gerçek admin verisiyle beslenir.

Göster:

- mevki,
- öncelik,
- kısa gerekçe,
- son güncelleme.

İhtiyaç yoksa veya veri girilmemişse uydurma ihtiyaç oluşturulmaz.

---

## Premium

Premium rapor:

- daha derin taktik analiz,
- karşılaştırma,
- veri görselleştirme,
- metodoloji

sunmalıdır.

Sadece daha çok blur veya kilit ikonu premium değer değildir.

---

## Mobil

- oyuncu görseli başlıkla birlikte kompakt,
- dossier spine yatay meta rail'e dönüşür,
- filtre drawer,
- güç/risk sütunları alt alta,
- maliyet ve status ilk ekranda,
- uzun scout metni okunabilir.

---

## Kabul kriterleri

- [ ] Transfer haberi ile scout değerlendirmesi ayrılıyor
- [ ] Kaynak sınıfı ve güncelleme görünür
- [ ] Fit score uydurulmuyor
- [ ] Kartlarda aşırı ikon yok
- [ ] Featured ve standart kayıtlar aynı şablonun büyütülmüş hâli değil
- [ ] Mobilde temel profil ilk ekranda
- [ ] Premium değer içerikle açıklanıyor
