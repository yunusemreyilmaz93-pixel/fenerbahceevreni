# Soccerdata Firestore Schema & Veri Modeli Dokümantasyonu

Bu doküman, sisteme kazandırılan **Soccerdata gelişmiş analiz veri modelini**, koleksiyon yapılarını, deterministik ID formatlarını ve güvenlik kısıtlamalarını açıklamaktadır.

> **NOT:** Bu dokümandaki JSON örnekleri, şemanın ve alan tiplerinin anlaşılması için kurgulanmış **örnek/demo** içeriklerdir. Veritabanına herhangi bir sahte/demo veri eklenmemiştir.

---

## 1. Mimari Prensipler & API-Sports Uyumluluğu

* **Geriye Dönük Tam Uyumluluk:** Mevcut API-Sports entegrasyonuna, `players`, `matches` ve `standings` koleksiyonlarının mevcut şemalarına kesinlikle dokunulmamıştır.
* **Separation of Concerns (Modülerlik):** Soccerdata entegrasyonuyla elde edilen üçüncü taraf (Sofascore, WhoScored vb.) gelişmiş verileri, mevcut veri modeline müdahale etmek yerine **yeni ve bağımsız koleksiyonlarda** saklanır.
* **Deterministik ID Sistemi:** Tutarlılığı artırmak ve veri çoğalmasını önlemek amacıyla, üretilen yeni belgelerin ID formatları rastgele üretilmek yerine belirli modellerle (deterministik) oluşturulur.

---

## 2. Koleksiyon Şemaları ve Örnek Belgeler

### A. `advancedPlayerStats` (Gelişmiş Oyuncu İstatistikleri)

* **Amaç:** Farklı sağlayıcılardan (provider) belirli sezonlarda derlenen detaylı oyuncu analitiğini (xG, hücum/savunma metrikleri vb.) saklar.
* **Document ID Formatı:** `{playerDocumentId}__{seasonKey}__{provider}`
  * *Örnek ID:* `plyr-api-123__2025-26__sofascore`
* **Firestore İzinleri:** Public read (herkes okuyabilir), Admin write (yalnızca yöneticiler yazabilir).

#### Örnek Belge Yapısı (Demo):
```json
{
  "schemaVersion": 1,
  "playerDocumentId": "plyr-api-123",
  "apiSportsPlayerId": 123,
  "playerName": "Sebastian Szymański",
  "teamDocumentId": "team-turkish-league-1",
  "seasonKey": "2025-26",
  "competition": "Trendyol Süper Lig",
  "provider": "sofascore",
  "providerPlayerId": "981254",
  "metrics": {
    "expectedGoals": 0.45,
    "expectedAssists": 0.38,
    "keyPasses": 3.2,
    "progressivePasses": 6.8,
    "interceptions": 1.4,
    "successfulDribbles": 2.1
  },
  "sourceUrl": "https://www.sofascore.com/player/sebastian-szymanski/981254",
  "fetchedAt": "2026-06-20T12:00:00Z",
  "createdAt": "2026-06-20T12:05:00Z",
  "updatedAt": "2026-06-20T12:05:00Z"
}
```

---

### B. `advancedMatchStats` (Geriye Dönük Gelişmiş Maç İstatistikleri)

* **Amaç:** Sofascore veya WhoScored gibi harici kaynaklardan çekilen gelişmiş takım metriklerini, ısı haritalarını ve detaylı oyuncu performans xG kırılımlarını barındırır.
* **Document ID Formatı:** `{matchDocumentId}__{provider}`
  * *Örnek ID:* `match-api-456__sofascore`
* **Firestore İzinleri:** Public read (herkes okuyabilir), Admin write (yalnızca yöneticiler yazabilir).

#### Örnek Belge Yapısı (Demo):
```json
{
  "schemaVersion": 1,
  "matchDocumentId": "match-api-456",
  "apiSportsFixtureId": 456,
  "provider": "sofascore",
  "providerMatchId": "11824765",
  "homeTeam": "Fenerbahçe",
  "awayTeam": "Galatasaray",
  "competition": "Trendyol Süper Lig",
  "seasonKey": "2025-26",
  "matchDate": "2026-05-25T19:00:00Z",
  "teamMetrics": {
    "home": {
      "expectedGoals": 2.14,
      "possession": 54,
      "shotsOnTarget": 7,
      "bigChancesCreated": 4
    },
    "away": {
      "expectedGoals": 1.05,
      "possession": 46,
      "shotsOnTarget": 3,
      "bigChancesCreated": 1
    }
  },
  "playerMetrics": [
    {
      "playerDocumentId": "plyr-api-123",
      "providerPlayerId": "981254",
      "playerName": "Sebastian Szymański",
      "metrics": {
        "expectedGoals": 0.22,
        "expectedAssists": 0.51,
        "rating": 8.1
      }
    }
  ],
  "sourceUrl": "https://www.sofascore.com/fenerbahce-galatasaray/bsosds",
  "fetchedAt": "2026-06-20T12:00:00Z",
  "createdAt": "2026-06-20T12:05:00Z",
  "updatedAt": "2026-06-20T12:05:00Z"
}
```

---

### C. `externalPlayerMappings` (Dış Oyuncu Kaynak Eşleştirmeleri)

* **Amaç:** API-Sports oyuncu kayıtları ile harici veri sağlayıcıların (Sofascore, WhoScored vb.) ID'leri arasındaki köprüyü kurar.
* **Document ID Formatı:** Ana oyuncunun belge ID'si ile birebir aynı tutulur: `plyr-api-{apiSportsPlayerId}`
  * *Örnek ID:* `plyr-api-123`
* **Firestore İzinleri:** Yalnızca adminler okuyabilir ve yazabilir (`isAdmin()`). Güvenlik amacıyla halka açık erişim tamamen kapatılmıştır.

#### Mapping ve Eşleştirme Kuralları:
1. **Confidence Skoru:** `confidence` değeri 0.0 (en düşük) ile 1.0 (en yüksek) arasında olmalıdır.
2. **Review Aşaması:** Otomatik isim benzerlik algoritmaları yalnızca `review` statüsünde eşleştirme üretebilir. `confirmed` statüsü otomatik olarak atanmamalıdır.
3. **Manuel Onay Şartı:** Worker'lar yalnızca `confirmed` statüsündeki eşleştirmeleri baz alarak gelişmiş istatistikleri eşler. İsim benzerliği sebebiyle hiçbir zaman otomatik olarak veritabanında yeni bir `players` ana belgesi oluşturulmaz.

#### Örnek Belge Yapısı (Demo):
```json
{
  "schemaVersion": 1,
  "playerDocumentId": "plyr-api-123",
  "apiSportsPlayerId": 123,
  "canonicalName": "Sebastian Szymański",
  "aliases": ["S. Szymanski", "Sebastian Szymanski"],
  "providers": {
    "sofascore": {
      "id": "981254",
      "name": "Sebastian Szymański"
    },
    "whoscored": {
      "id": "321654",
      "name": "Sebastian Szymanski"
    }
  },
  "mappingStatus": "confirmed",
  "confidence": 0.98,
  "verifiedBy": "yunusemreyilmaz93@gmail.com",
  "verifiedAt": "2026-06-20T13:00:00Z",
  "createdAt": "2026-06-20T12:00:00Z",
  "updatedAt": "2026-06-20T13:00:00Z"
}
```

---

### D. `dataSyncRuns` (Veri Senkronizasyonu Logları)

* **Amaç:** Scraping ve harvesting işlemlerini izlemek, hata oranlarını, işleme adedini ve tetiklenme türlerini loglamak için kullanılır.
* **Document ID Formatı:** Normal otomatik üretilen Firestore ID'si.
* **Firestore İzinleri:** Yalnızca adminler okuyabilir ve yazabilir (`isAdmin()`).

#### Güvenlik Kısıtlamaları:
* `errorSummary` alanına kullanıcı şifreleri, API anahtarları, hassas veri yığınları (complete credential) veya sunucu içi dizin bilgisi/stack trace eklenmesi kesinlikle yasaktır.

#### Örnek Belge Yapısı (Demo):
```json
{
  "schemaVersion": 1,
  "provider": "sofascore",
  "jobType": "player_stats",
  "status": "success",
  "seasonKey": "2025-26",
  "startedAt": "2026-06-20T13:20:00Z",
  "finishedAt": "2026-06-20T13:22:15Z",
  "triggeredBy": "scheduler",
  "processedCount": 25,
  "successCount": 24,
  "failedCount": 1,
  "errorSummary": "ID 981255 için HTTP 404 yanıtı alındı (Sofascore sayfa eksik)."
}
```
