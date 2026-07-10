# Maç Merkezi — Page Override

## Rol

Maç Merkezi bir “kart koleksiyonu” değil, **yayın kontrol odası**dır.

Kullanıcı:

- hangi maçın aktif olduğunu,
- maçın durumunu,
- skoru veya başlama zamanını,
- temel istatistikleri,
- olay akışını,
- kadroları,
- fikstürü ve puan durumunu

hızlıca anlamalıdır.

---

## Görsel mod

**Data Mode**

Karakter: yayın grafiği + maç kâğıdı + canlı veri disiplini.

---

## Tek imza öğesi

**Maç Zaman Rayı**

Gol, kart, devre, değişiklik ve kritik olaylar için yatay veya dikey zaman çizgisi.

- sarı: Fenerbahçe kritik olayı,
- kırmızı: kart veya live,
- nötr: sistem/yarı bilgisi,
- renk tek başına anlam taşımaz.

---

## Üst bölüm

### Match Hero

Tam genişlikte tek ana yüzey:

- competition ve hafta,
- home team,
- score/time,
- away team,
- status,
- location/channel,
- source/update.

Takım logoları dengeli boyutta olmalıdır. Skor en güçlü tipografik öğedir.

Hero içinde gereksiz KPI kartları kullanılmaz.

### Duruma göre davranış

#### Upcoming

- tarih/saat,
- geri sayım,
- yayın bilgisi,
- tahmin bağlantısı,
- muhtemel kadro yalnızca veri varsa.

#### Live

- dakika,
- canlı skor,
- kritik olay,
- son veri güncellemesi,
- live kırmızı yalnızca burada.

#### Finished

- sonuç,
- maç durumu,
- istatistik özeti,
- rapor bağlantısı,
- tekrar veya simülasyon butonu ana odak olmaz.

---

## Sekmeler

Önerilen sekmeler:

- Genel
- İstatistik
- Olaylar
- Kadrolar
- Taraftar
- Maç Sonu

Duruma göre gereksiz sekmeler gizlenebilir.

Biten maçta “Canlı” sekmesi gösterilmez.  
Oynanmamış maçta gerçek olay akışı varmış gibi görünmez.

---

## İstatistik düzeni

- iki takım karşılaştırması,
- ortak eksen,
- açık değerler,
- bar renkleri sınırlı,
- metrik açıklaması,
- kaynak.

Possession bar, shot map ve benzeri görseller gerçek veri yoksa render edilmez.

Yüzdeler toplamı mantıksızsa arayüz sessizce normalize etmemeli; veri sorunu ele alınmalıdır.

---

## Kadro ve saha

Saha görselleştirmesi:

- gerçek taktik tahta hissi,
- düşük kontrast çizgiler,
- oyuncu isimleri okunabilir,
- forma numarası,
- pozisyon,
- tooltip yerine dokunulabilir detay.

Mobilde saha yatay taşmamalıdır.  
Oyuncu etiketleri 10 px altına düşmemelidir.

---

## Fikstür ve puan durumu

Maç hero'dan sonra ayrı bir “lig merkezi” alanı olabilir.

- fikstür satır düzeninde,
- sonuç ve durum hizalı,
- puan tablosu gerçek tablo,
- Fenerbahçe satırı sarı çizgiyle işaretli,
- bütün satır sarı doldurulmaz,
- sezon ve veri güncellemesi görünür.

---

## Simülasyon

Simülasyon ayrı bir deneysel mod olarak görünmelidir.

Zorunlu etiket:

> Simülasyon — gerçek maç akışı değildir.

Simülasyon:

- canlı sekmeyle aynı görsel dili birebir kullanmamalı,
- gerçek bildirim sesi veya “CANLI” etiketi kullanmamalı,
- sonuçları resmî veri alanına yazmamalı,
- açık bir başlat/sıfırla kontrolüne sahip olmalı.

---

## Mobil

- üstte sticky kompakt skor strip,
- sekmeler yatay kaydırılabilir,
- istatistikler tek kolon karşılaştırma,
- olay rayı dikey olabilir,
- tablo kritik sütunlara indirgenir,
- geri sayım dört küçük karta bölünmek yerine tek satır veri olabilir.

---

## Kabul kriterleri

- [ ] Aktif maç durumu ilk bakışta anlaşılıyor
- [ ] Kaynak ve güncelleme zamanı görünür
- [ ] Live ve simülasyon karışmıyor
- [ ] Skor en güçlü tipografik öğe
- [ ] KPI kart yığını yok
- [ ] İstatistikler gerçek ve karşılaştırılabilir
- [ ] Mobilde skor görünür kalıyor
- [ ] Fikstür ve puan durumu tablo mantığını koruyor
