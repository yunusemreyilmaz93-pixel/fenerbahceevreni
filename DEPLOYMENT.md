# Fenerbahçe Evreni - Canlı Yayın & Dağıtım Kılavuzu (DEPLOYMENT.md)

Bu kılavuz, **Fenerbahçe Evreni** web sitesinin Firebase servisleri, Google AI Studio ve Vercel platformları üzerinde nasıl canlıya alınacağını adım adım Türkçe olarak açıklar.

---

## 📋 Gerekli Firebase Kaynakları

Uygulamanın tam fonksiyonel çalışabilmesi için aşağıdaki Firebase servislerinin aktif edilmesi gerekmektedir:

### 1. Firebase Authentication
* **Aktivasyon:** Firebase Console > Build > Authentication seçeneğine gidin.
* **Sağlayıcı (Provider):** **Google Sign-In** yöntemini etkinleştirin.
* **Yetkilendirilmiş Alan Adları (Authorized Domains):** Uygulamanızı barındıracağınız alan adlarını "Authorized domains" listesine ekleyin. 
  
  **ÖNEMLİ (Google AI Studio Geliştirme Hatası Çözümü - `auth/unauthorized-domain`):**
  Uygulamayı Google AI Studio önizleme ekranında test ederken Google ile Giriş yapabilmek için aşağıdaki alan adlarını Firebase Console > Authentication > Settings > Authorized Domains listesine eklemeniz gerekmektedir:
  - `ais-dev-h3sihairyqutbq5l46bsjg-102981137171.europe-west2.run.app`
  - `ais-pre-h3sihairyqutbq5l46bsjg-102981137171.europe-west2.run.app`
  - `localhost` (Yerel geliştirme için)
  - `fenerbahceevreni.com` (Canlı domain için)
  - `*.vercel.app` (Vercel testleri için)

### 2. Cloud Firestore Database
* **Aktivasyon:** Firebase Console > Build > Cloud Firestore seçeneğine gidin ve bir veritabanı oluşturun.
* **Konum:** Projenize en yakın bölgeyi seçin (örn. `europe-west3` veya `europe-west1`).
* **İlk Kurulum:** Test modunda başlayabilirsiniz, ancak canlıya çıkış öncesi kuralları `firestore.rules` dosyasındaki kurallarla güncelleyin.

### 3. Firebase Storage
* **Aktivasyon:** Firebase Console > Build > Storage seçeneğine gidin.
* **Kullanım Amacı:** Oyuncu fotoğrafları, makale kapak resimleri ve transfer analiz çizimlerinin güvenli depolanabilmesi içindir.

---

## 🔒 Güvenlik Kurallarının Uygulanması

### Firestore Güvenlik Kuralları
Kök dizinde bulunan `firestore.rules` dosyasının içeriğini kopyalayın ve **Firebase Console > Firestore > Rules** sekmesine yapıştırıp **Publish (Yayınla)** butonuna tıklayın.

* **Yönetici Doğrulama Mantığı:**
```javascript
function isAdmin() {
  return request.auth != null &&
    request.auth.token.email in [
      "yunusemreyilmaz93@gmail.com"
    ];
}
```
*Önemli:* Eğer yönetici e-posta adresleri değişirse, kurallardaki e-posta listesini ve çevre değişkenindeki `VITE_ADMIN_EMAILS` değerini senkronize olarak güncelleyin.

### Storage Güvenlik Kuralları
Kök dizindeki `storage.rules` dosyasını **Firebase Console > Storage > Rules** sekmesine yükleyin. Bu kurallar, tüm ziyaretçilere okuma hakkı verirken, yükleme/güncelleme/silme işlemlerini yalnızca kimliği doğrulanmış yetkili admin e-postasına izin verir.

---

## 🔌 Çevre Değişkenleri Kontrol Listesi (Environment Variables)

Canlıya çıkarken (Vercel, Google AI Studio veya yerel `.env` dosyası üzerinde) aşağıdaki değişkenlerin tanımlandığından emin olun:

| Değişken Adı | Açıklama | Örnek / Varsayılan Değer |
| :--- | :--- | :--- |
| `VITE_FIREBASE_API_KEY` | Firebase API Anahtarı | `AIzaSyA1...` |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Yetkilendirme Alan Adı | `fenerbahce-evreni.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | Firebase Proje Kimliği | `fenerbahce-evreni` |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase Depolama Havuzu Adresi | `fenerbahce-evreni.appspot.com` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase Mesajlaşma Gönderici ID | `854972...` |
| `VITE_FIREBASE_APP_ID` | Firebase Uygulama Numarası | `1:8549...` |
| `VITE_ADMIN_EMAILS` | Yetkili Admin E-postaları (Virgülle ayrılmış) | `yunusemreyilmaz93@gmail.com` |

---

## 🚀 Vercel Üzerinde Yayınlama Adımları

Uygulamayı Vercel'de barındırmak için aşağıdaki adımları sırayla takip edin:

### Adım 1: Deponuzu Bağlayın
1. [Vercel Dashboard](https://vercel.com) ekranına gidin.
2. **Add New > Project** seçeneğine tıklayın.
3. Fenerbahçe Evreni kod deposunu (GitHub/GitLab) içe aktarın (Import).

### Adım 2: Derleme ve Ağ Ayarları
Vercel projenin Vite tabanlı bir SPA (Single Page Application) olduğunu otomatik algılayacaktır. Ayarların şu şekilde olduğunu kontrol edin:
* **Framework Preset:** `Vite`
* **Build Command:** `npm run build`
* **Output Directory:** `dist`
* **Install Command:** `npm install`

### Adım 3: Çevre Değişkenlerini Ekleyin
* Proje ayarları ekranında **Environment Variables** bölümünü genişletin.
* Yukarıdaki "Çevre Değişkenleri Kontrol Listesi" tablosunda yer alan tüm `VITE_` önekli değişkenleri tek tek ekleyin.
* Değerleri tırnak işareti kullanmadan girin.

### Adım 4: Dağıtımı Başlatın (Deploy)
* **Deploy** butonuna basın. Derleme aşaması başarıyla tamamlandığında siteniz canlıya alınacaktır.

---

## 💻 Yerel Geliştirme Komutları

Uygulamayı kendi bilgisayarınızda yerel olarak test etmek isterseniz:

1. **Bağımlılıkları Yükleme:**
   ```bash
   npm install
   ```
2. **Yerel Sunucuyu Başlatma (Hata Ayıklama Modu - Port 3000):**
   ```bash
   npm run dev
   ```
3. **Üretim Sürümü Derleme:**
   ```bash
   npm run build
   ```
4. **Derlenmiş Sürümü Yerelde Önizleme:**
   ```bash
   npm run preview
   ```

---

## 🔄 Admin ve Veritabanı Yönetimi

* **Yönetici Yetkilendirmesi:** Projede hem Google Kimlik Doğrulaması hem de geleneksel yönetici şifresi (`fener1907`) aktiftir. Yönetici e-postalarını doğrudan `.env` veya hosting sağlayıcısının panelindeki `VITE_ADMIN_EMAILS` değişkeninden güvenle listeleyebilirsiniz.
* **İlk Veri Seeding:** Firebase ilk kez kurulduğunda veritabanı boş olacaktır. `src/lib/dbService.ts` üzerinde tanımlı olan veri tohumlama yapısı, Firebase bağlantısı yoksa yerel depolama (`localStorage`) ile çalışır. Firebase bağlandığında admin panel üzerinden dilediğiniz makale, transfer raporu veya oyuncu analizini panel arayüzünü kullanarak oluşturabilir, güncelleyebilir veya silebilirsiniz.
