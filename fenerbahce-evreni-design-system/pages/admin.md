# Admin CMS — Page Override

## Rol

Admin paneli **editoryal operasyon merkezi**dir.

Görevi güzel görünmekten önce:

- hızlı,
- güvenilir,
- yoğun,
- anlaşılır,
- hata önleyici,
- denetlenebilir

olmaktır.

Public sitedeki dramatik editoryal dil burada azaltılır.

---

## Görsel mod

**Operations Mode**

---

## Tek imza öğesi

**System Status Rail**

Üst alanda kompakt sistem durumu:

- bağlantı,
- veri güncelliği,
- bekleyen iş,
- hata,
- son yayın,
- kullanıcı/ortam.

Yalnızca gerçek sistem verisi.

---

## Bilgi mimarisi

Mevcut çok sayıdaki menü öğesi gruplandırılmalıdır.

Önerilen gruplar:

### İçerik

- Dashboard
- Yazılar / Analizler
- Maç Raporları
- Premium
- Bülten Sayıları

### Futbol Verisi

- Maç Merkezi
- Oyuncular
- Takımlar
- Transfer Radar
- Anketler
- Entity Map

### Yayın ve Topluluk

- Ana Sayfa
- Menü
- Kategoriler
- Duyuru
- Mesajlar
- Bülten Aboneleri
- Sponsorlar

### Veri Operasyonları

- Veri Entegrasyonu
- Scraper Jobs
- Kaynaklar
- İçerik Sağlığı
- İçe / Dışa Aktar
- API Test

### Sistem

- Medya
- Site Ayarları

Sidebar'da 25 öğeyi tek düz listede göstermekten kaçın.

---

## Sidebar

- 248–272 px
- grup başlıkları
- sentence case
- aktif öğe sarı tam blok yerine sarı sol çizgi + yüzey olabilir
- ikonlar nötr
- scroll durumu görünür
- collapse opsiyonu geniş ekranlarda düşünülebilir
- kullanıcı ve çıkış alt bölümde

Bütün menü öğeleri uppercase ve `tracking-wider` olmamalıdır.

---

## Üst bar

Göster:

- aktif bölüm,
- breadcrumb,
- global arama gerekiyorsa,
- quick create,
- ortam veya sistem durumu,
- kullanıcı menüsü.

Her sayfada farklı başlık tasarımı oluşturma.

---

## Dashboard

Göster:

- eylem gerektiren öğeler,
- son yayınlar,
- veri sağlık durumu,
- başarısız job,
- bekleyen taslak,
- hızlı oluşturma.

Dört jenerik KPI kartı yerine önem sırasına göre operasyon özeti kullan.

“Toplam oyuncu” gibi değişmeyen sayı ana dashboard'u kaplamamalıdır; bağlamlı trend veya uyarı daha değerlidir.

---

## Tablo ve liste

- sticky header,
- net sütun,
- görünür status,
- row action menu,
- bulk action yalnızca gerekliyse,
- sayfalama,
- arama/filtre,
- empty state,
- loading.

Her satır ayrı büyük kart olmaz.

Destructive action:

- kırmızı,
- confirmation,
- öğe adı belirtilir,
- undo mümkünse sunulur.

---

## Formlar

- mantıksal bölümler,
- görünür label,
- yardım metni,
- zorunlu alan,
- validation,
- unsaved changes uyarısı,
- preview,
- kaydet/yayınla ayrımı.

Uzun formlarda sticky action bar kullanılabilir.

Primary eylem:

- Taslağı kaydet
- Yayınla
- Güncelle

aynı anda üç sarı buton olmamalıdır.

---

## Veri entegrasyonu

Bu alan ürünün teknik gücünü göstermelidir fakat terminal cosplay yapmamalıdır.

Sekmeler:

- Genel Bakış
- Eşleştirmeler
- Veri Önizleme
- İş Geçmişi

Göster:

- kaynak,
- son çalışma,
- başarılı/başarısız kayıt,
- hata özeti,
- yeniden çalıştır,
- etkilenen koleksiyon,
- iş sahibi veya tetikleyen kullanıcı.

Raw JSON ayrı collapsible code yüzeyinde olabilir.

---

## Bildirim ve toast

- başarı: kısa, yeşil
- hata: ne olduğunu ve mümkünse çözümü söyler
- info: nötr/mavi
- toast 4–6 saniye
- kritik hata yalnızca toast ile kaybolmaz
- aynı anda çok sayıda toast yığılmaz

---

## Mobil ve tablet

Admin panelinin bütün karmaşık özelliklerini telefona sıkıştırma.

Mobilde öncelik:

- hızlı kontrol,
- taslak düzenleme,
- status,
- mesaj,
- basit yayın işlemi.

Geniş tablo ve veri eşleştirme alanları için yatay düzen veya “masaüstü önerilir” notu gerekebilir; ancak temel navigasyon çalışmalıdır.

Sidebar drawer:

- focus trap,
- escape,
- body lock,
- 44 px öğeler.

---

## Kabul kriterleri

- [ ] Menü öğeleri gruplu
- [ ] Uppercase kullanım azaltılmış
- [ ] Aktif durum tek bakışta açık
- [ ] Form label ve validation tutarlı
- [ ] Kaydet/yayınla ayrımı açık
- [ ] Tablo kart grid'e dönüşmemiş
- [ ] Sistem durumu gerçek veriye dayanıyor
- [ ] Destructive eylem güvenli
- [ ] 1024 px genişlikte kullanılabilir
