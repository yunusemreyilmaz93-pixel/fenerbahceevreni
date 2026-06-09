# Fenerbahçe Evreni - Premium & Ödeme Güvenliği Kılavuzu (PREMIUM_PAYMENT_NOTES.md)

Bu kılavuz, **Fenerbahçe Evreni** platformunun ayrıcalıklı analiz bülteni ve derinlemesine scout raporlarına yönelik Premium ödeme altyapısı entegrasyonuna ilişkin güvenlik yönergelerini Türkçe olarak içerir.

---

## 🛑 Öncelikli Kural: İstemci Tarafı Güvenilmezdir (Client-Side is Untrusted)

Uygulamanın şimdiki yapısında Premium üyelik ve bazı kilitli scout detayları arayüz düzeyinde denetlenebilir. Ancak gerçek canlı ortamda:
* İstemci kodundaki `isPremium = true` veya `usr.premium = true` gibi flag değişkenleri tarayıcı üzerinden kolayca manipüle edilebilir.
* Premium makaleler, raporlar ve PDF indirme linkleri Firestore veritabanından istemciye çağrılırken mutlaka **sunucu tarafında doğrulanmış bir yetkilendirme süzgecinden (Firebase Security Rules)** geçirilmelidir.

---

## 🔒 Güvenli Premium Mimarisi Nasıl Olmalıdır?

Canlı ortamda Premium akışı şu 4 adımdan oluşmalıdır:

1. **Ödeme Aracı Entegrasyonu:**
   * Türkiye'de popüler olan **iyzico**, **Shopier**, **PayTR** veya globalde popüler olan **Stripe** gibi ödeme sağlayıcıları tercih edilebilir.
   * Ödeme formu hiçbir zaman sadece frontend üzerinden doğrudan işlem yapmamalıdır; ödeme durumunu bildiren güvenli bir **Webhook API** kullanılmalıdır.

2. **Sunucu Tarafı Güvenli Doğrulama (Cloud Functions veya Express Backend):**
   * Ödeme tamamlandığında ödeme sağlayıcısı, önceden tanımlanmış bir Webhook URL'ine (örn. `/api/webhooks/payment`) şifreli bir istek (payload) gönderir.
   * Backend tarafı bu talebi doğrular ve ödemeyi yapan kullanıcının Firebase Authentication **UID** değerini okur.

3. **Kullanıcı Yetkilendirmesinin Kalıcı Hale getirilmesi (Custom Claims):**
   * Firebase Admin SDK kullanılarak kullanıcının Firebase Auth kimliğine bir **Custom Claim** (Örn: `token.premium = true`) atanır:
     ```typescript
     // Node.js Firebase Admin Örneği
     await admin.auth().setCustomUserClaims(uid, { premium: true });
     ```
   * Custom claims, kullanıcının JWT kimlik doğrulama token’ına gömülür ve doğrudan Firestore kuralları tarafından güvenli biçimde okunabilir.

4. **Firestore Veri Koruma Kuralları:**
   * Premium içeriklerin bulunduğu dökümanlara erişim sadece bu custom claim'e sahip kullanıcılara açılmalıdır:
     ```javascript
     match /transferReports/{reportId} {
       allow read: if request.auth.token.premium == true || resource.data.isPremium != true;
     }
     ```

---

## 💳 Önerilen Ödeme Sağlayıcıları (Payment Gateways)

| Sağlayıcı | Entegrasyon Kolaylığı | Türkiye Desteği | Önerilen Yöntem |
| :--- | :--- | :--- | :--- |
| **iyzico** | Yüksek (Resmi Node.js SDK var) | Evet | Abonelik (Subscription) API |
| **Shopier** | Çok Yüksek (Webhook tabanlı) | Evet | Manuel Webhook Doğrulama |
| **PayTR** | Orta (İmza doğrulama tabanlı) | Evet | Iframe API + Webhook |
| **Stripe** | Mükemmel | Sınırlı (Türkiye dışı hesap gerekir) | Stripe Customer Portal & Webhook |

---

## ⚡ Canlıya Geçiş İçin Yol Haritası (TODOS)

- [ ] Firebase projesi oluşturulduğunda bir Cloud Functions entegrasyonu hazırlayın.
- [ ] Seçilen ödeme aracı üzerinden bir "Sandbox" test hesabı açın.
- [ ] Ödeme başarılı olduktan sonra veritabanında kullanıcının rolünü güncelleyecek ve Custom Claims tanımlayacak webhook endpoint'ini `server.ts` veya Serverless Functions üzerinde kodlayın.
- [ ] `firestore.rules` dosyasını `request.auth.token.premium == true` ifadesine göre güncelleyin.
