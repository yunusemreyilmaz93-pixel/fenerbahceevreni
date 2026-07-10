# Fenerbahçe Evreni - Canlıya Çıkış Kontrol Listesi (LAUNCH_CHECKLIST.md)

Bu dosya, **Fenerbahçe Evreni** web portalının Firebase ve canlı yayın ortamları (Vercel, Google AI Studio, vb.) üzerinde güvenle canlıya alınabilmesi için gereken tüm teknik ve güvenlik denetim adımlarını Türkçe olarak listeler.

---

## 🔒 1. Çevre Değişkenleri ve Gizlilik Denetimleri
- [ ] **Google AI Studio Ortam Değişkenleri:** AI Studio panelinde tüm Firebase değişkenlerinin (`VITE_FIREBASE_...`) eklendiği doğrulandı mı?
- [ ] **Yerel `.env` Güvenliği:** Gerçek API anahtarlarının veya üretim ortamı şifrelerinin Git depolarına (GitHub, GitLab vb.) yüklenmediğinden emin olmak için `.env` dosyası `.gitignore` içinde mi?
- [ ] **Admin whitelist kontrolü:** `VITE_ADMIN_EMAILS` değişkeninde en azından ana admin e-postası olan `yunusemreyilmaz93@gmail.com` tanımlı mı?
- [ ] **Arayüz denetimi:** Hassas çevre değişkenlerinin veya Firebase API şifrelerinin istemci tarafında halka açık arayüzlerde veya konsol loglarında yazdırılmadığı doğrulandı mı?

---

## 🛡 2. Firebase Kuralları ve Erişim Güvenliği
- [ ] **Firestore Güvenlik Kuralları:** `firestore.rules` dosyasının Firebase Console üzerine başarıyla deploy edildiği ve aktif olduğu doğrulandı mı?
- [ ] **Storage Güvenlik Kuralları:** `storage.rules` dosyasının yüklendiği ve yetkisiz kullanıcıların dosya yüklemesini (`write: if false`) engellediği doğrulandı mı?
- [ ] **Firestore Admin E-Posta Eşleşmesi:** `firestore.rules` içerisindeki `isAdmin()` fonksiyonunda admin e-posta adresinin (`yunusemreyilmaz93@gmail.com`) el ile yazıldığı ve `VITE_ADMIN_EMAILS` ile birebir eşleştiği kontrol edildi mi?
- [ ] **Bülten & İletişim Formu İzinleri:** Genel ziyaretçilerin bültene kayıt olma, iletişim formu gönderme ve bekleme listesine eklenme dışında hiçbir dökümanı okuyamadığı, güncelleyemediği ve silemediği doğrulandı mı?
- [ ] **Makale ve Maç Ekleme:** Yönetici harici kullanıcıların hiçbir şekilde yeni makale, transfer raporu, oyuncu puanı veya sponsor ekleyemediği sızma testleri ile denetlendi mi?

---

## 📡 3. Fonksiyonel Denetim ve Test Senaryoları
- [ ] **Yönetici Girişi:** `/admin` sayfasına gidildiğinde kullanıcı oturum açmamış ise `/admin/login` sayfasına yönlendiriyor mu?
- [ ] **Kimlik Doğrulama Süreci:** Yetkili Google hesabı ile admin CMS konsoluna geçiş yapılıyor mu? (Sabit şifre yok; Firebase Google Auth + allowlist/claim)
- [ ] **Yönetici Olmayan Google Girişi:** Yetkisiz bir Google hesabı ile admin panel girişi denendiğinde ekrana **"Bu alana erişim yetkiniz yok."** uyarısı gelerek erişim engelleniyor mu?
- [ ] **Yükleniyor Efekti:** Admin yetki doğrulanması sırasında düzgün çalışan bir "Yetki kontrol ediliyor..." spinner'ı gösteriliyor mu?
- [ ] **Hata Mesajları:** Geçersiz şifrelerde Türkçe ve anlaşılır hata mesajları (`Giriş başarısız. Bilgileri kontrol et.`) gösteriliyor mu?
- [ ] **Güvenli Oy Verme:** Taraftar odasındaki anketlerde oylama yaparken tüm anket belgesini ezmek yerine `polls/{pollId}/votes/{voteId}` alt koleksiyonu kullanılarak güvenli oy yazıldığı doğrulandı mı?

---

## 🚀 4. Dağıtım ve Yayınlama (Vercel & Domain)
- [ ] **Vercel Çapraz Platform Uyum Değişkenleri:** Vercel projesi ayarlarına `VITE_FIREBASE_...` ve `VITE_ADMIN_EMAILS` değişkenleri tanımlandı mı?
- [ ] **SPA Router Yönlendirmesi:** `vercel.json` dosyasında `/admin` gibi yapay alt sayfalarda sayfa yenilendiğinde 404 vermemesi için gerekli SPA yönlendirme (rewrites) kuralı mevcut mu?
- [ ] **Derleme Başarısı:** `npm run build` komutu yerelde sıfır hata ile tamamlanıyor mu ve `dist` klasörü eksiksiz çıkıyor mu?
- [ ] **Domain Bağlantısı:** `fenerbahceevreni.com` alan adı kayıt kuruluşundan Vercel DNS sunucularına veya A/CNAME kayıtlarına düzgün yönlendirildi mi ve SSL sertifikası (HTTPS) aktif mi?
