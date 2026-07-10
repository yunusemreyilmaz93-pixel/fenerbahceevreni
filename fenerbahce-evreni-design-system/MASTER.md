# Fenerbahçe Evreni — Master Design System

Bu dosya bütün sayfalar için uygulanabilir tasarım tokenlarını, ortak bileşen kurallarını ve kalite standartlarını tanımlar.

Sayfa bazlı farklılıklar `/design-system/pages/` altında yer alır.

---

## 1. Sistem adı

**FE Signal System v1**

Ana kavramlar:

- Stadium Night
- Editorial Intelligence
- Yellow Signal
- Match Sheet
- Provenance Stamp
- Controlled Density

---

## 2. Tasarım modları

Ürün içinde üç ana yoğunluk modu vardır.

### 2.1 Editorial Mode

Kullanım:

- ana sayfa haber alanı,
- analiz listesi,
- analiz detay,
- bülten,
- hakkımızda.

Özellik:

- daha fazla boşluk,
- daha güçlü başlık,
- Newsreader kullanımı,
- uzun okuma konforu,
- görsel ve metin dengesi.

### 2.2 Data Mode

Kullanım:

- maç merkezi,
- oyuncular,
- transfer radarı,
- puan durumu,
- tahmin aracı.

Özellik:

- daha sıkı grid,
- tabular numbers,
- açık kaynak/güncellik,
- karşılaştırılabilir veri,
- nötr yüzeyler,
- sarı yalnızca aktif sinyal.

### 2.3 Operations Mode

Kullanım:

- admin paneli,
- veri entegrasyonu,
- içerik sağlığı,
- scraper işleri,
- formlar ve tablolar.

Özellik:

- yüksek bilgi yoğunluğu,
- düşük dekorasyon,
- hızlı tarama,
- görünür sistem durumu,
- güvenli ve tutarlı eylemler.

---

## 3. Renk tokenları

Önerilen CSS değişkenleri:

```css
:root {
  /* Core canvas */
  --fe-ink-1000: #030508;
  --fe-ink-950: #05080D;
  --fe-ink-900: #080D15;

  /* Navy structure */
  --fe-navy-950: #06101D;
  --fe-navy-900: #08172A;
  --fe-navy-850: #0B1D33;
  --fe-navy-800: #102641;
  --fe-navy-700: #173453;

  /* Brand signal */
  --fe-yellow-500: #E9C914;
  --fe-yellow-400: #F3D51B;
  --fe-yellow-300: #F8DE4A;
  --fe-yellow-soft: rgba(243, 213, 27, 0.10);
  --fe-yellow-line: rgba(243, 213, 27, 0.34);

  /* Text */
  --fe-text-strong: #F6F7F9;
  --fe-text: #D6DBE3;
  --fe-text-muted: #929CAA;
  --fe-text-faint: #697382;

  /* Lines */
  --fe-line-subtle: rgba(255, 255, 255, 0.065);
  --fe-line: rgba(255, 255, 255, 0.105);
  --fe-line-strong: rgba(255, 255, 255, 0.18);

  /* Editorial paper */
  --fe-paper: #F1EEE6;
  --fe-paper-raised: #F8F5EE;
  --fe-paper-ink: #15191F;
  --fe-paper-muted: #5D6269;
  --fe-paper-line: rgba(21, 25, 31, 0.14);

  /* Semantic */
  --fe-success: #3FAE78;
  --fe-warning: #E3A536;
  --fe-danger: #E25A5A;
  --fe-info: #5797D1;
  --fe-live: #F04444;
}
```

### Mevcut token eşlemesi

Geçiş sürecinde mevcut değişkenler şu rollere bağlanabilir:

```css
--color-fb-dark: var(--fe-ink-950);
--color-fb-card: var(--fe-navy-900);
--color-fb-navy: var(--fe-navy-800);
--color-fb-yellow: var(--fe-yellow-400);
--color-fb-gold: var(--fe-yellow-500);
--color-fb-text: var(--fe-text-strong);
--color-fb-muted: var(--fe-text-muted);
```

`fb-gold` yeni tasarımlarda ayrı dekoratif altın olarak kullanılmamalıdır. Sarının koyu varyantı olarak değerlendirilmelidir.

---

## 4. Tipografi tokenları

Google Fonts önerisi:

```css
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:ital,wght@0,400;0,500;0,600;0,700;1,500&family=Newsreader:opsz,wght@6..72,500;6..72,600;6..72,700&display=swap');
```

```css
:root {
  --fe-font-ui: "IBM Plex Sans", ui-sans-serif, system-ui, sans-serif;
  --fe-font-editorial: "Newsreader", Georgia, serif;
  --fe-font-data: "IBM Plex Mono", ui-monospace, monospace;
}
```

### Ölçek

```css
--fe-text-xs: 0.75rem;      /* 12 */
--fe-text-sm: 0.875rem;     /* 14 */
--fe-text-base: 1rem;       /* 16 */
--fe-text-lg: 1.125rem;     /* 18 */
--fe-text-xl: 1.375rem;     /* 22 */
--fe-text-2xl: 1.75rem;     /* 28 */
--fe-text-3xl: 2.25rem;     /* 36 */
--fe-text-4xl: 3rem;        /* 48 */
--fe-text-5xl: 4rem;        /* 64 */
```

### Başlık kuralları

- H1: 36–64 px, sayfaya göre.
- H2: 28–40 px.
- H3: 20–28 px.
- Gövde: 15–18 px.
- Yardımcı metin: 12–14 px.
- 12 px altı yalnızca grafik üzerindeki zorunlu kısa etiketlerde ve erişilebilir alternatifle.
- Başlık line-height: 0.98–1.15.
- Gövde line-height: 1.55–1.75.
- Okuma metni maksimum 72 karakter satır uzunluğu.

### Veri tipi

Skor, saat, para, oran ve tablo sayılarında:

```css
font-family: var(--fe-font-data);
font-variant-numeric: tabular-nums;
```

---

## 5. Spacing sistemi

4 px temel birim:

```css
--fe-space-1: 0.25rem;
--fe-space-2: 0.5rem;
--fe-space-3: 0.75rem;
--fe-space-4: 1rem;
--fe-space-5: 1.25rem;
--fe-space-6: 1.5rem;
--fe-space-8: 2rem;
--fe-space-10: 2.5rem;
--fe-space-12: 3rem;
--fe-space-16: 4rem;
--fe-space-20: 5rem;
--fe-space-24: 6rem;
```

Sayfa bölümü dikey boşlukları:

- Mobil: 48–64 px
- Tablet: 64–80 px
- Masaüstü: 72–104 px
- Data Mode yoğun bölümler: 32–56 px
- Admin: 20–36 px

---

## 6. Grid ve container

```css
--fe-container-wide: 1440px;
--fe-container: 1280px;
--fe-container-reading: 760px;
--fe-gutter-mobile: 16px;
--fe-gutter-tablet: 24px;
--fe-gutter-desktop: 32px;
```

### Ana grid

- Masaüstü: 12 kolon
- Tablet: 8 kolon
- Mobil: 4 kolon
- Kolon aralığı: 16–28 px

### Önerilen kompozisyonlar

- Editorial feature: 7 / 5
- Article detail: 8 / 4 veya centered 760 px
- Player detail: 5 / 7
- Match hero: 12 tam genişlik, içte 4 / 4 / 4
- Admin: 264 px sidebar + fluid content
- Data list: sabit filtre rail + fluid sonuç alanı yalnızca yeterli genişlikte

---

## 7. Radius

```css
--fe-radius-xs: 6px;
--fe-radius-sm: 8px;
--fe-radius-md: 10px;
--fe-radius-lg: 14px;
--fe-radius-xl: 18px;
--fe-radius-pill: 999px;
```

Kullanım:

- input/button: 8–10 px
- standart panel: 12–14 px
- büyük hero yüzeyi: 16–18 px
- status chip: pill veya 6 px
- görsel: bağlama göre 8–14 px

---

## 8. Çizgi ve gölge

### Çizgiler

Birincil ayrım yöntemi çizgidir.

- bölüm çizgisi: `--fe-line-subtle`
- kart sınırı: `--fe-line`
- aktif/hover: `--fe-yellow-line`
- açık yüzey: `--fe-paper-line`

### Gölgeler

```css
--fe-shadow-raised: 0 16px 40px rgba(0, 0, 0, 0.24);
--fe-shadow-overlay: 0 24px 70px rgba(0, 0, 0, 0.42);
--fe-shadow-focus: 0 0 0 3px rgba(243, 213, 27, 0.22);
```

Kartlar varsayılan olarak gölgesizdir. Shadow yalnızca:

- modal,
- dropdown,
- sticky floating control,
- önemli hero object,
- export/share preview

için kullanılır.

---

## 9. Ana yüzeyler

### Canvas

```css
background: var(--fe-ink-950);
color: var(--fe-text);
```

### Surface

```css
background: var(--fe-navy-900);
border: 1px solid var(--fe-line-subtle);
```

### Surface Raised

```css
background: var(--fe-navy-850);
border: 1px solid var(--fe-line);
box-shadow: var(--fe-shadow-raised);
```

### Surface Inset

```css
background: rgba(0, 0, 0, 0.18);
border: 1px solid var(--fe-line-subtle);
```

### Editorial Paper

```css
background: var(--fe-paper);
color: var(--fe-paper-ink);
border: 1px solid var(--fe-paper-line);
```

Editorial Paper yalnızca uzun okuma, özel rapor veya paylaşım çıktısı için kullanılır. Her sayfada dekoratif açık kart olarak kullanılmaz.

---

## 10. Sarı Sinyal bileşeni

Önerilen yapısal kalıp:

```html
<div class="fe-signal-heading">
  <span class="fe-signal-index">03</span>
  <span class="fe-signal-line"></span>
  <span class="fe-signal-label">OYUNCU FORMU</span>
</div>
```

Numara yalnızca gerçek sıra, hafta, dakika veya bölüm indeksi varsa kullanılır.

Alternatif:

```html
<div class="fe-signal-heading">
  <span class="fe-signal-dot"></span>
  <span class="fe-signal-line"></span>
  <span class="fe-signal-label">CANLI</span>
</div>
```

Bir viewport içinde iki veya üçten fazla büyük Sarı Sinyal kullanılmaz.

---

## 11. Ortak sayfa başlığı

Standart sayfa başlığı şu parçalardan oluşabilir:

1. kısa kicker,
2. güçlü H1,
3. en fazla iki satır lead,
4. kaynak/güncellik veya sayfa bağlamı,
5. birincil eylem gerekiyorsa tek CTA.

Başlık her zaman bağımsız büyük bir kart içinde olmak zorunda değildir.

### Kicker

- 12–13 px
- IBM Plex Mono veya IBM Plex Sans 600
- kısa
- sarı veya muted
- `tracking` sınırlı
- yalnızca gerçek kategori veya bağlam

### Lead

- 16–19 px
- maksimum 65 karakter satır
- açık ve bilgi odaklı

---

## 12. Navigasyon

### Masaüstü

- 64–72 px yükseklik
- koyu düz zemin
- çok hafif alt çizgi
- logo/marka solda
- ana sayfalar ortada veya soldan devam eden yapıda
- yardımcı eylemler sağda
- aktif öğe Sarı Sinyal alt çizgisiyle
- navigasyonun tamamı pill butonlardan oluşmaz

### Mobil

- logo + menü
- 44 px dokunma alanı
- drawer içinde bölümlenmiş linkler
- aktif sayfa net
- admin linki kullanıcı menüsünde veya alt grupta
- body scroll kilidi ve focus yönetimi

### Sticky davranış

- scroll sırasında yükseklik küçülebilir
- yoğun blur kullanma
- canlı maç varsa ince score strip eklenebilir
- sticky bar içerik alanını kapatmamalı

---

## 13. Butonlar

### Primary

- sarı zemin
- koyu metin
- yalnızca sayfanın birincil eylemi
- glow yok
- hover: daha açık sarı veya kırık beyaz
- min-height 44 px

### Secondary

- şeffaf veya koyu yüzey
- ince sınır
- açık metin
- hover'da sınır ve metin değişimi

### Tertiary

- metin butonu
- ok veya küçük ikon kullanılabilir
- hover underline veya renk

### Destructive

- danger rengi
- sarı kullanılmaz
- onay gerektiren işlemlerde açık metin

Aynı bölgede birden fazla primary buton kullanma.

---

## 14. Form kontrolleri

- yükseklik 44–48 px
- label her zaman görünür
- placeholder label değildir
- focus ring sarı
- hata danger
- başarı success
- açıklama 13–14 px
- form grupları 16–24 px aralıklı
- geniş formlarda iki kolon yalnızca alanlar ilişkiliyse
- admin formunda değişiklik durumu görünür olmalı
- kaydetme sonrası geri bildirim açık olmalı

---

## 15. Chip, badge ve etiket

Badge türleri:

- status
- source
- category
- freshness
- premium
- simulation

Kurallar:

- her metin chip yapılmaz,
- badge satırı iki satıra taşmamalı,
- kategori nötr olabilir,
- aktif durum sarı,
- live kırmızı,
- success yeşil,
- source çoğunlukla muted,
- premium için sürekli taç/yıldız kullanılmaz.

---

## 16. Kart aileleri

### Editorial Story

- görsel + kategori + başlık + özet + meta
- başlık Newsreader olabilir
- kart sınırı her zaman gerekli değil
- featured ve standard aynı şablonun ölçeklenmiş hâli olmak zorunda değil

### Data Record

- başlık + temel metrik + kaynak + güncellik
- taranabilir satır veya panel
- tabloya dönüşebilecek veriyi kartlaştırma

### Player Tile

- oyuncu görseli
- ad
- mevki/numara
- en fazla iki birincil veri
- veri yok durumunu dürüst göster
- her detay kart üzerinde bulunmaz

### Scout Dossier

- oyuncu kimliği
- status
- estimated cost
- fit score varsa metodoloji
- strengths/concerns
- source rail

### Action Panel

- tek amaç
- kısa başlık
- kısa açıklama
- tek primary
- gerekiyorsa secondary

---

## 17. Tablo sistemi

- sticky header gerekliyse kullan
- satır yüksekliği 44–52 px
- zebra yerine ince satır çizgisi tercih et
- sayılar sağa hizalı
- isimler sola hizalı
- durumlar badge
- sort durumu görünür
- mobilde kritik sütunları koru
- yatay scroll varsa kullanıcıya görsel ipucu ver
- ilk sütunu sticky yapmak yalnızca gerçekten gerekliyse
- bütün hücrelere ikon koyma

---

## 18. Sekmeler

- sekme sayısı 2–6
- aktif sekme sarı alt çizgi veya koyu/sarı ton farkı
- pill group yalnızca kompakt kontrol gerekiyorsa
- mobilde yatay kaydırma
- seçili sekme erişilebilir `aria-selected`
- tab içeriği değişiminde 180–220 ms fade
- sekmenin içinde ikinci bir sekme katmanı oluşturmaktan kaçın

---

## 19. Arama ve filtre

- arama alanı açıkça görünür
- aktif filtre sayısı belirtilir
- temizleme eylemi bulunur
- mobilde filtre drawer
- desktop'ta kategori rail veya toolbar
- her filtreyi pill yapma
- sonuç sayısı görünür olabilir
- boş sonuçta kullanılan filtreler özetlenir

---

## 20. Veri kaynağı ve güncellik

Ortak `ProvenanceStamp` bileşeni önerilir.

Alanlar:

- source
- updatedAt
- scope/season
- dataType
- confidence/status

Görsel yapı:

- küçük mono metin
- nötr border
- optional status dot
- tooltip yerine temel bilgi doğrudan görünür
- ayrıntı tooltip veya popover olabilir

---

## 21. Loading, empty ve error

### Loading

- gerçek layout oranlarına yakın skeleton
- tek tip pulse
- spinner yalnızca küçük bağımsız işlemde
- bütün ekranı süresiz kapatma

### Empty

- neden boş olduğu açıklanır
- veri uydurulmaz
- mümkünse kullanıcıya sonraki adım verilir
- admin için içerik oluşturma CTA'sı
- public için güncelleme veya ilgili sayfa bağlantısı

### Error

- neyin yüklenemediğini söyle
- tekrar deneme varsa göster
- teknik stack trace gösterme
- “siber hata” gibi belirsiz dil kullanma

---

## 22. Motion tokenları

```css
--fe-ease-standard: cubic-bezier(0.22, 1, 0.36, 1);
--fe-duration-fast: 140ms;
--fe-duration-base: 200ms;
--fe-duration-slow: 320ms;
--fe-duration-intro: 480ms;
```

Hover translate maksimum 2 px.  
Scale yalnızca özel görsel kartlarda maksimum `1.02`.

---

## 23. Responsive kurallar

### 360–479

- 16 px gutter
- tek kolon
- H1 34–42 px
- tablo sadeleştirme
- filtre drawer
- CTA tam genişlik olabilir
- hero minimum yükseklik zorunlu değil
- sticky skor strip düşünülebilir

### 480–767

- 20 px gutter
- 4 kolon
- iki küçük bilgi bloğu yan yana olabilir

### 768–1023

- 24 px gutter
- 8 kolon
- sidebar çoğunlukla drawer
- editorial 5/3 veya 8 tam genişlik

### 1024–1279

- 28 px gutter
- 12 kolon
- yoğun data layout kullanılabilir

### 1280+

- 32 px gutter
- geniş container
- aşırı boşluk üretme
- ana içerik maksimum genişlik korunur

---

## 24. Görsel test kontrol listesi

Her sayfa için:

- [ ] Tek ana odak var
- [ ] Sarı kullanım oranı kontrollü
- [ ] Başlık kesilmiyor
- [ ] 360 px yatay taşma yok
- [ ] Odak halkası görünür
- [ ] Metin 12 px altına inmiyor
- [ ] Veri yoksa sıfır gösterilmiyor
- [ ] Kaynak/güncellik görünür
- [ ] Kart içinde kart azaltıldı
- [ ] Hover olmadan da anlaşılır
- [ ] Motion reduce çalışıyor
- [ ] Görsel aspect ratio sabit
- [ ] Loading state layout shift üretmiyor
- [ ] Primary CTA tek
- [ ] Sayfa kendi görevine özgü görünüyor

---

## 25. Yeni ortak bileşen önerileri

Aşağıdaki bileşenler gerektiğinde ortaklaştırılabilir:

- `SignalHeading`
- `PageHeader`
- `ProvenanceStamp`
- `StatusBadge`
- `SourceBadge`
- `FreshnessLabel`
- `EditorialStory`
- `DataRow`
- `MetricCell`
- `PlayerTile`
- `ScoutDossier`
- `EmptyState`
- `LoadingFrame`
- `ErrorState`
- `FilterToolbar`
- `MobileFilterDrawer`
- `ResponsiveDataTable`
- `StickyMatchStrip`

Önce mevcut `src/components/ui` bileşenlerini incele. Aynı işi yapan ikinci bir sistem oluşturma.

---

## 26. Definition of Done

Bir UI işi ancak şunlar tamamlandığında biter:

- [ ] DESIGN.md okundu
- [ ] ilgili page override okundu
- [ ] gerçek veri kontratı korundu
- [ ] loading/empty/error tasarlandı
- [ ] mobil tasarım yapıldı
- [ ] erişilebilirlik kontrol edildi
- [ ] build ve uygun testler geçti
- [ ] ekran görüntüsüyle incelendi veya bunun yapılamadığı belirtildi
- [ ] en az bir sadeleştirme turu yapıldı
- [ ] yeni kararlar sisteme aykırı değil
