# Fenerbahçe Evreni Görselleştirmesi — Page Override

## Rol

Evren sayfası markanın deneysel ve kültürel alanıdır.

Bu sayfa:

- taraftar fraksiyonlarını,
- teknik direktör ekollerini,
- tarihsel ve mizahi ilişkileri,
- hiyerarşiyi

interaktif bir kültür haritası olarak sunar.

---

## Görsel mod

**Immersive Mode**

Bu mod yalnızca Evren deneyimi için geçerlidir.

---

## Ana estetik

Jenerik uzay ve galaksi yerine:

> **Arşiv Takımyıldızı**

Görsel referanslar:

- karanlık arşiv odası,
- taktik ağ,
- metro haritası,
- araştırma panosu,
- yıldız haritası,
- eski taraftar kültürü kupürlerinin dijital ağı.

Yıldız dokusu çok düşük kontrastta olabilir; ana kimlik node ve ilişkilerden gelmelidir.

---

## Tek imza öğesi

**Fraksiyon Yörüngesi**

Seçilen node çevresinde:

- bağlı fraksiyonlar,
- parent/child ilişkisi,
- ekol,
- kısa açıklama

anlamlı bir yörünge veya bağlantı sistemiyle gösterilir.

Rastgele particle animasyonu kullanılmaz.

---

## Başlık

Tam ekran deneyimde başlık daha sakin olmalıdır.

- gradient text kullanılmaz,
- aşırı glow yok,
- marka adı küçük/orta,
- harita ana odaktır,
- geri dönüş butonu ulaşılabilir,
- sayfanın nasıl kullanılacağı kısa açıklanır.

---

## Node sistemi

Node boyutu gerçek hiyerarşiyi temsil eder.

Renk rolleri:

- merkez: sarı
- ana dal: açık lacivert
- alt dal: nötr mavi/gri
- seçili: sarı çizgi + açık halo
- ilişkili: yükseltilmiş kontrast
- pasif: düşük kontrast

Her node farklı renk olmaz.

Node label:

- 12 px altına düşmez,
- zoom seviyesine göre kademeli görünür,
- seçili node her zaman okunur,
- uzun adlar tooltip dışında erişilebilir olmalıdır.

---

## Sidebar

Sidebar:

- arama,
- hiyerarşi,
- breadcrumb,
- seçili öğe,
- filtre

sunabilir.

Glass panel yerine koyu opak/yarı opak net yüzey tercih edilir.  
Mobilde drawer.

---

## Detail panel

Göster:

- fraksiyon adı,
- kısa tanım,
- parent/child,
- ilişkili fraksiyonlar,
- kategori,
- mizahi/editoryal not,
- kaynak/atıf gerekiyorsa.

Detay paneli bütün ekranı kaplamaz.  
Mobilde bottom sheet olabilir.

---

## Quiz CTA

Quiz CTA sürekli parlayan büyük floating capsule olmamalıdır.

Tercih:

- sağ alt kompakt kontrol,
- açık “Fraksiyonunu bul” metni,
- tek sarı sinyal,
- kapatılabilir veya haritayı engellemeyen boyut.

---

## Katkı ve kredi

Hazırlayan ve kaynak kredi bilgisi önemlidir fakat ana haritanın üzerinde beyaz-sarı büyük kart olarak durmamalıdır.

Tercih:

- info butonu,
- footer drawer,
- “Hakkında” paneli,
- erişilebilir bağlantı.

---

## Hareket

Kullanılabilir:

- node zoom,
- bağlantı vurgusu,
- panel geçişi,
- başlangıçta kısa ağ oluşumu.

Kaçınılacak:

- sürekli dönen halo,
- sürekli kayan yıldız,
- ağır spring,
- bütün node'ların sürekli pulse etmesi,
- motion sickness üreten kamera hareketi.

---

## Mobil

- harita pan/zoom dokunma hareketleri,
- geri butonu güvenli alan içinde,
- sidebar drawer,
- detail bottom sheet,
- quiz CTA haritayı kapatmaz,
- node label seçildiğinde okunur,
- iki parmak zoom dışında +/- kontrolleri de bulunabilir.

---

## Kabul kriterleri

- [ ] Sayfa generic galaxy demo gibi görünmüyor
- [ ] İlişkiler görsel olarak anlaşılır
- [ ] Node renkleri sınırlı
- [ ] Kredi bilgisi haritayı kapatmıyor
- [ ] Gradient başlık ve yoğun glow kaldırılmış
- [ ] Mobil pan/zoom kullanılabilir
- [ ] Reduced motion alternatifi var
