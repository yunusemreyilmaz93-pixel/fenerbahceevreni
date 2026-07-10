# Fenerbahçe Evreni Design System

## Ajanlar için kullanım

Her UI görevinde şu dosyaları sırayla okuyun:

1. `/AGENTS.md`
2. `/DESIGN.md`
3. `/design-system/MASTER.md`
4. İlgili `/design-system/pages/*.md`

## Sayfa eşlemesi

| Uygulama görünümü | Dosya |
|---|---|
| home | `pages/home.md` |
| match-center | `pages/match-center.md` |
| analysis | `pages/analysis.md` |
| transfer-radar | `pages/transfer-radar.md` |
| players | `pages/players.md` |
| fan-room | `pages/fan-room.md` |
| universe | `pages/universe.md` |
| predictor | `pages/predictor.md` |
| admin / admin-login | `pages/admin.md` |
| about / contact / bulten / privacy / terms / cookies / kvkk / 404 | `pages/static-content.md` |

## Override kuralı

- `DESIGN.md`: marka karakteri, değiştirilemez ana ilkeler
- `MASTER.md`: ortak tokenlar ve bileşen sistemi
- `pages/*.md`: ilgili sayfaya özel kompozisyon ve yoğunluk

Sayfa dosyası yalnızca açıkça tanımladığı konularda MASTER'ı override eder.

## Değişiklik yönetimi

Yeni bir tasarım kuralı:

- bütün ürünü etkiliyorsa `MASTER.md`,
- marka karakterini etkiliyorsa `DESIGN.md`,
- tek sayfayı etkiliyorsa ilgili page dosyasına

eklenmelidir.

Geçici tek kullanımlık kararlar tasarım sistemine eklenmemelidir.
