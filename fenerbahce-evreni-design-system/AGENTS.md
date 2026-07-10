# AGENTS.md — Fenerbahçe Evreni Ajan Çalışma Sözleşmesi

Bu dosya Codex, Claude Code, Grok tabanlı ajanlar, Gemini CLI, Cursor, OpenCode ve repoda çalışan bütün diğer kod ajanları için bağlayıcı çalışma kurallarını tanımlar.

---

## 1. Zorunlu okuma sırası

Her UI/UX veya frontend görevinden önce şu sırayla oku:

1. `/AGENTS.md`
2. `/DESIGN.md`
3. `/design-system/MASTER.md`
4. İlgili sayfa dosyası: `/design-system/pages/<page>.md`
5. Değiştirilecek mevcut bileşenler ve ortak UI bileşenleri
6. İlgili veri servisleri, type tanımları ve testler

Sayfa override dosyası `MASTER.md` ile çelişirse sayfa dosyası yalnızca açıkça tanımladığı alanlarda önceliklidir.  
`DESIGN.md` marka kimliği konusunda her zaman en üst kaynaktır.

---

## 2. Ana çalışma ilkesi

Görevi “daha güzel yap” şeklinde yorumlama.

Her görevde önce şunları belirle:

- sayfanın tek ana görevi,
- birincil kullanıcı,
- en önemli bilgi,
- ana eylem,
- veri kaynakları,
- mevcut sorunlar,
- korunması gereken işlevler,
- uygulanacak sayfa kimliği.

Koda başlamadan önce kısa bir tasarım kararı oluştur:

- **Amaç**
- **Hiyerarşi**
- **Kompozisyon**
- **Kullanılacak mevcut bileşenler**
- **Kaldırılacak yapay zekâ kalıpları**
- **Mobil yaklaşım**
- **Doğrulama yöntemi**

Uzun teorik açıklama üretme; ancak tasarım kararını vermeden doğrudan kod yazma.

---

## 3. Veri ve gerçeklik kuralları

Kesinlikle veri uydurma.

Aşağıdakileri tahmin ederek doldurma:

- oyuncu yaşı,
- piyasa değeri,
- tercih edilen ayak,
- form puanı,
- maç skoru,
- gol/asist,
- dakika,
- xG,
- kaynak güven puanı,
- transfer bedeli,
- sözleşme tarihi,
- lig sıralaması,
- oy sayısı,
- kullanıcı sayısı.

Veri yoksa dürüst boş durum kullan.

Kurgusal özellikler açıkça etiketlenmelidir:

- simülasyon,
- senaryo,
- demo,
- editoryal tahmin.

Simülasyon verisini canlı veya resmî veri gibi sunma.

---

## 4. Mevcut sistemi koruma

UI görevi sırasında aşağıdakileri gerekmedikçe değiştirme:

- Firebase koleksiyon adları
- veri şemaları
- route yapısı
- admin yetkilendirmesi
- güvenlik kuralları
- API anahtar yönetimi
- servis fonksiyonları
- deep-link davranışı
- analytics event adları
- SEO canonical yapısı
- form submit akışları
- import/export davranışı

Görsel iyileştirme bahanesiyle çalışan özelliği yeniden yazma.

Bir veri kontratını değiştirmek zorundaysan:

1. etkilenen bütün kullanımları bul,
2. geri uyumluluğu koru,
3. type tanımlarını güncelle,
4. test ekle,
5. değişikliği raporla.

---

## 5. Teknoloji tercihleri

Mevcut stack'i öncelikle kullan:

- React
- TypeScript
- Vite
- Tailwind CSS 4
- Motion
- Lucide
- mevcut UI bileşenleri
- mevcut yardımcı fonksiyonlar

Yeni bağımlılık yalnızca şu koşullarda eklenebilir:

- mevcut stack ile makul biçimde çözülemiyorsa,
- bakım yükü düşükse,
- bundle etkisi kabul edilebilirse,
- lisansı uygunsa,
- güvenlik riski oluşturmuyorsa,
- neden gerekli olduğu açıklanabiliyorsa.

Yalnızca tek bir küçük görsel efekt için paket ekleme.

---

## 6. Tasarım uygulama kuralları

Her UI görevinde:

- `DESIGN.md` içindeki marka karakterine uy,
- `MASTER.md` tokenlarını kullan,
- ilgili sayfa override dosyasını uygula,
- var olan ortak bileşenleri yeniden kullan,
- aynı problemin ikinci bir bileşenini üretmeden önce mevcut çözümü ara,
- inline style yerine token ve ortak class tercih et,
- rastgele hex kod ekleme,
- rastgele radius veya gölge üretme,
- aynı sayfada birden fazla tasarım dili oluşturma.

Yeni bir tasarım tokenı gerekiyorsa önce `MASTER.md` ile uyumunu değerlendir. Tek bir kullanım için global token üretme.

---

## 7. Yapay zekâ anti-pattern kontrolü

Kod tesliminden önce aşağıdakileri ara ve sorgula:

- gereksiz `backdrop-blur`
- büyük gradient metin
- çok sayıda `rounded-2xl` veya `rounded-3xl`
- her kartta glow
- her ikonun sarı olması
- aynı boyda üç veya dört özellik kartı
- kart içinde kart
- anlamsız KPI
- sahte canlı durum
- 11 px altı metin
- aşırı uppercase
- gereksiz `tracking-widest`
- her öğede hover scale
- her bölümde scroll reveal
- sayfa genelinde rastgele absolute ışık lekeleri
- bilgi taşımayan etiketler

Bunlardan biri varsa otomatik olarak silme; önce işlevsel gerekçesi olup olmadığını kontrol et. Gerekçe yoksa sadeleştir.

---

## 8. Responsive zorunlulukları

Her önemli sayfayı en az şu genişliklerde doğrula:

- 1440 × 900
- 1024 × 768
- 768 × 1024
- 390 × 844
- 360 × 800

Kontrol et:

- yatay taşma,
- kesilen başlık,
- üst üste binen fixed öğeler,
- erişilemeyen buton,
- tabloda kritik sütun kaybı,
- modal ve drawer yüksekliği,
- sticky alanların içerik kapatması,
- görsel aspect ratio,
- dokunma alanı,
- form klavyesi açıldığında kullanılabilirlik.

Mobil tasarımı masaüstü tamamlandıktan sonra “küçültme” olarak ele alma. Aynı görev içinde tasarla.

---

## 9. Erişilebilirlik zorunlulukları

Her değişiklikte:

- semantik HTML kullan,
- butonu `div` ile taklit etme,
- link ve buton ayrımını koru,
- görünür `focus-visible` ekle,
- form alanlarını label ile ilişkilendir,
- hata mesajlarını erişilebilir yap,
- ikon-only butona `aria-label` ver,
- dekoratif ikonlara `aria-hidden` ver,
- modal focus trap ve escape davranışını koru,
- renk dışında metin/ikon ile durum anlat,
- `prefers-reduced-motion` desteğini bozma,
- en az 44 px dokunma alanı sağla.

---

## 10. Performans kuralları

- Büyük görsellerde width/height veya aspect ratio tanımla.
- Gereksiz yüksek çözünürlüklü görsel yükleme.
- Aşağıdaki sayfaları lazy-load yapısını bozma.
- Uzun listelerde gereksiz animasyon kullanma.
- Sürekli çalışan interval ve event listener'ları temizle.
- Arka planda büyük blur yüzeyleri çoğaltma.
- Aynı Firebase koleksiyonunu gereksiz tekrar çağırma.
- Hesaplanan listelerde uygun olduğunda memoization kullan.
- Skeleton yüksekliği gerçek içeriğe yakın olsun.
- Layout shift üretme.
- Kullanılmayan ikon ve importları temizle.

---

## 11. Güvenlik kuralları

Aşağıdakileri istemci koduna taşıma veya loglama:

- gizli API anahtarları,
- admin tokenları,
- servis hesabı bilgileri,
- kullanıcı kişisel verileri,
- tam hata payload'ları,
- yetki kontrolünün hassas ayrıntıları.

Admin işlemlerinde yalnızca arayüzü gizlemeyi yetkilendirme kabul etme. Mevcut sunucu/Firebase güvenlik katmanını koru.

---

## 12. Test ve doğrulama

Değişiklikten sonra uygun olanları çalıştır:

```bash
npm run lint
npm test
npm run build
```

Görsel görevlerde tarayıcı erişimin varsa:

1. uygulamayı aç,
2. hedef sayfayı gerçek veri durumuyla incele,
3. masaüstü ekran görüntüsü al,
4. mobil ekran görüntüsü al,
5. boş/yükleme/hata durumunu kontrol et,
6. tasarımı `DESIGN.md` ve sayfa dosyasına göre eleştir,
7. en az bir düzeltme turu yap,
8. tekrar ekran görüntüsü al.

Ekran görüntüsü alamıyorsan bunu açıkça belirt; görsel doğrulama yapılmış gibi davranma.

---

## 13. Kod kalitesi

- TypeScript'te gereksiz `any` ekleme.
- Mevcut `any` alanlarını görev dışında topluca refactor etme.
- Bileşenleri yalnızca gerçekten anlamlı sınırlar varsa böl.
- Tek kullanımlık küçük JSX için gereksiz dosya üretme.
- 500+ satırlık bir bileşene yeni büyük blok ekliyorsan ayrıştırmayı değerlendir.
- Magic number yerine mevcut token veya anlamlı sabit kullan.
- Yorumlar “ne”yi değil gerektiğinde “neden”i açıklasın.
- Eski yorumları kopyalayıp yanlış bırakma.
- Türkçe kullanıcı metinlerinde yazım ve karakter doğruluğunu koru.

---

## 14. Sayfa yeniden tasarım yöntemi

Tam sayfa redesign görevinde şu sırayı izle:

### A. Denetim

- mevcut içerik ve özellikleri listele,
- veri kaynaklarını belirle,
- tekrar eden görsel kalıpları bul,
- hiyerarşi sorunlarını bul,
- mobil sorunlarını bul,
- korunacak güçlü öğeleri belirle.

### B. Tasarım planı

- sayfanın modunu seç,
- tek imza öğesini belirle,
- ana grid'i tanımla,
- içerik sırasını belirle,
- tipografi rollerini belirt,
- hangi kartların kaldırılacağını belirt.

### C. Uygulama

- önce ana iskelet,
- sonra ortak bileşenler,
- sonra veri durumları,
- sonra responsive,
- sonra mikro etkileşim,
- en son dekoratif ayrıntı.

### D. Eleştiri

Şu soruları yanıtla:

- Ana odak ne?
- Sarı fazla mı?
- Kart sayısı azaltılabilir mi?
- Sayfa başka bir SaaS ürününe ait görünüyor mu?
- Kaynak ve güncellik görünür mü?
- Mobilde ilk ekran doğru bilgiyi gösteriyor mu?
- Bir öğe çıkarılırsa tasarım güçlenir mi?

---

## 15. Teslim raporu

Görev sonunda kısa ve somut rapor ver:

- değiştirilen dosyalar,
- görsel kararlar,
- korunan işlevler,
- çalıştırılan testler,
- doğrulanan ekran boyutları,
- bilinen eksikler,
- veri veya içerik gerektiren alanlar.

“Premium oldu”, “modernleştirildi” gibi kanıtsız ifadeler kullanma. Ne değiştiğini söyle.

---

## 16. Çelişki çözümü

Öncelik sırası:

1. Güvenlik
2. Veri doğruluğu
3. Çalışan özelliklerin korunması
4. Erişilebilirlik
5. `DESIGN.md`
6. `design-system/MASTER.md`
7. Sayfa override dosyası
8. Görev promptundaki estetik tercih
9. Ajanın kişisel tasarım tercihi

Kullanıcı talebi veri doğruluğu veya güvenliği bozuyorsa uygulama; sorunu açıkla ve güvenli çözümü seç.

---

## 17. Altın kural

> **Yeni bir şey eklemekten önce gereksiz olanı çıkar.  
> Görsel etkiyi efektle değil, karar kalitesiyle oluştur.  
> Gerçek verinin önüne tasarımı geçirme.**
