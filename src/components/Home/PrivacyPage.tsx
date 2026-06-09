import React from 'react';
import { LegalLayout, LegalSection } from './LegalLayout';
import SEO from './SEO';

interface PrivacyPageProps {
  onNavigate: (view: string) => void;
}

export const PrivacyPage: React.FC<PrivacyPageProps> = ({ onNavigate }) => {
  const sections = [
    { id: 'kapsam', title: 'A. Kapsam' },
    { id: 'toplanan-veriler', title: 'B. Toplanan Veriler' },
    { id: 'toplanma-yontemi', title: 'C. Verilerin Toplanma Yöntemi' },
    { id: 'kullanim-amaclari', title: 'D. Verilerin Kullanım Amaçları' },
    { id: 'third-party', title: 'E. Firebase ve Üçüncü Taraf Servisler' },
    { id: 'veri-paylasimi', title: 'F. Verilerin Paylaşımı' },
    { id: 'saklama-suresi', title: 'G. Veri Saklama Süresi' },
    { id: 'kullanici-haklari', title: 'H. Kullanıcı Hakları' },
    { id: 'bulten', title: 'I. Bülten Aboneliği' },
    { id: 'cocuklar', title: 'J. Çocukların Gizliliği' },
    { id: 'guvenlik', title: 'K. Güvenlik Önlemleri' },
    { id: 'degisiklikler', title: 'L. Politika Değişiklikleri' },
    { id: 'iletisim', title: 'M. İletişim Bilgileri' }
  ];

  return (
    <>
      <SEO 
        title="Gizlilik Politikası | Fenerbahçe Evreni"
        description="Fenerbahçe Evreni gizlilik politikası, veri saklama süreleri, Firebase altyapısı, çerezler ve KVKK kapsamındaki haklarınız hakkında detaylı bilgilendirme."
        canonical="https://fenerbahceevreni.com/gizlilik-politikasi"
      />
      <LegalLayout
        title="Gizlilik Politikası"
        subtitle="Fenerbahçe Evreni olarak ziyaretçilerimizin ve kullanıcılarımızın gizliliğine önem veriyoruz. Bu metin, kişisel verilerinizin işlenmesine dair detayları içerir."
        onNavigate={onNavigate}
        sections={sections}
    >
      <LegalSection id="kapsam" title="A. Kapsam">
        <p>
          Bu Gizlilik Politikası, başta <strong>fenerbahceevreni.com</strong> alan adı altında yayın yapan web sitemiz olmak üzere, platforma bağlı bülten kayıt formları, premium bekleme listesi, analiz değerlendirme modülleri ve tüm interaktif sayfalarda toplanan kişisel verileri kapsamaktadır.
        </p>
      </LegalSection>

      <LegalSection id="toplanan-veriler" title="B. Toplanan Veriler">
        <p>Fenerbahçe Evreni ile gerçekleştirdiğiniz etkileşimlere bağlı olarak aşağıdaki verileriniz işlenebilir:</p>
        <ul className="list-disc pl-5 space-y-2 mt-2">
          <li><strong>Kimlik ve İletişim Bilgileri:</strong> Adınız, soyadınız ve e-posta adresiniz.</li>
          <li><strong>Form Bilgileri:</strong> İletişim formlarında ilettiğiniz mesaj içerikleri, konu başlıkları ve gönderim zamanları.</li>
          <li><strong>Bülten ve Tercih Verileri:</strong> Haftalık bülten abonelik durumu, ilgi duyduğunuz bülten kategorileri, katılım sağladığınız anket ve oylama yanıtları.</li>
          <li><strong>Premium Bekleme Listesi:</strong> Premium üyelik ön kayıt bilgileri, listeye katılım sıranız ve sunduğunuz tercihler.</li>
          <li><strong>Kullanım ve Teknik Veriler:</strong> IP adresiniz, tarayıcı türünüz, cihaz modeliniz, işletim sisteminiz, ziyaret ettiğiniz sayfalar, sitede harcanan süre, dil tercihleri ve teknik çerezler.</li>
        </ul>
      </LegalSection>

      <LegalSection id="toplanma-yontemi" title="C. Verilerin Toplanma Yöntemi">
        <p>
          Kişisel verileriniz, sitemizi kullanımınız esnasında tamamen dijital ve elektronik kanallar aracılığıyla toplanır:
        </p>
        <ul className="list-disc pl-5 space-y-2 mt-2">
          <li>Doğrudan doldurduğunuz iletişim ve bülten kayıt formları,</li>
          <li>Haftalık analiz değerlendirme ve bekleme listesi katılım ekranları,</li>
          <li>Anketler ve taraftar odası oylama etkileşimleri,</li>
          <li>Çerezler (Cookies) ve benzeri analitik takip kodları aracılığıyla otomatik olarak,</li>
          <li>Veritabanı altyapımızda kullanılan Firebase / Google Cloud güvenli bulut servisleri üzerinden.</li>
        </ul>
      </LegalSection>

      <LegalSection id="kullanim-amaclari" title="D. Verilerin Kullanım Amaçları">
        <p>Toplanan kişisel verileriniz sadece şu amaçlarla sınırlandırılmış olarak kullanılır:</p>
        <ul className="list-disc pl-5 space-y-2 mt-2">
          <li>Platform üzerinden gönderdiğiniz sorulara ve destek taleplerine yanıt verilmesi,</li>
          <li>Talep etmeniz halinde haftalık analiz dökümanları ve bülten içeriklerinin e-posta adresinize ulaştırılması,</li>
          <li>Premium bekleme listesi süreçlerinin yürütülmesi ve yeni özellikler devreye girdiğinde bilgilendirme sağlanması,</li>
          <li>Taraftar dünyasının nabzını tutarak sitemizdeki içeriklerin, makalelerin ve istatistiki analizlerin kalitesinin artırılması,</li>
          <li>Kötüye kullanımın, spam mesajların ve siber saldırıların engellenerek platform güvenliğinin muhafaza edilmesi,</li>
          <li>Sponsorluk ve iş ortaklığı süreçlerinin yönetilmesi.</li>
        </ul>
      </LegalSection>

      <LegalSection id="third-party" title="E. Firebase ve Üçüncü Taraf Servisler">
        <p>
          Fenerbahçe Evreni, hızlı ve kararlı bir deneyim sunabilmek amacıyla Google Firebase (Firestore Veritabanı, Bulut Kayıt Depoları, Web Hosting, Kimlik Doğrulama) servislerini kullanmaktadır. 
        </p>
        <p className="mt-2">
          Gelecekte platforma eklenebilecek e-posta gönderim sağlayıcıları (Resend, Brevo, Mailchimp vb.), analitik ve istatistik araçları (Google Analytics vb.) ile lisanslı ödeme aracı kuruluşların kendi gizlilik beyanları da ek olarak geçerli olacaktır.
        </p>
      </LegalSection>

      <LegalSection id="veri-paylasimi" title="F. Verilerin Paylaşımı">
        <p>
          Fenerbahçe Evreni kullanıcı verilerini hiçbir şekilde <strong>üçüncü şahıslara veya şirketlere satmaz veya kiralamaz</strong>. 
        </p>
        <p className="mt-2">
          Verileriniz sadece teknik hizmet aldığımız altyapı sağlayıcıları ile (hizmetin ifasını sağlamak adına gerekli teknik sınırda), yasal mevzuattan kaynaklanan zorunlu hallerde yetkili mercilerin resmi talebi üzerine veya sizin açık rızanızın bulunduğu durumlarda paylaşılabilir.
        </p>
      </LegalSection>

      <LegalSection id="saklama-suresi" title="G. Veri Saklama Süresi">
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Bülten Verileriniz:</strong> Siz abonelikten çıkana kadar veya bülten hizmetine son verilene kadar aktif şekilde saklanır.</li>
          <li><strong>İletişim Formu Mesajları:</strong> İdari takip ve arşivleme amacıyla makul hukuki saklama süreleri boyunca korunur.</li>
          <li><strong>Premium Ön Kayıtları:</strong> Ön kayıt projesi aktif kaldığı sürece veya siz kaydınızın silinmesini talep edene kadar muhafaza edilir.</li>
          <li><strong>Teknik Sunucu Logları:</strong> Altyapı sağlayıcılarının yasal güvenlik ve izleme prosedürleri kapsamındaki sürelerde saklanır.</li>
        </ul>
      </LegalSection>

      <LegalSection id="kullanici-haklari" title="H. Kullanıcı Hakları">
        <p>Bilgilerinizi güncel tutma ve kontrol etme hakkına sahipsiniz. Sahip olduğunuz haklar:</p>
        <ul className="list-disc pl-5 space-y-2 mt-2">
          <li>Hakkınızda hangi kişisel verilerin tutulduğunu öğrenmek amacıyla bilgi talep etme,</li>
          <li>Eksik veya yanlış işlenmiş verilerin düzeltilmesini isteme,</li>
          <li>Kişisel verilerinizin kalıcı olarak silinmesini talep etme,</li>
          <li>Açık rıza göstererek katıldığınız işlemlerden rızanızı geri çekme.</li>
        </ul>
      </LegalSection>

      <LegalSection id="bulten" title="I. Bülten Aboneliği">
        <p>
          Gönderilen her haftalık bülten e-postasının en alt kısmında yer alan "Abonelikten Ayrıl" (Unsubscribe) bağlantısını kullanarak veya sitemizdeki araçlardan talebinizi ileterek dilediğiniz an bülten listesinden çıkış yapabilirsiniz. Abonelikten çıktığınızda e-posta gönderim listemizden derhal temizlenirsiniz.
        </p>
      </LegalSection>

      <LegalSection id="cocuklar" title="J. Çocukların Gizliliği">
        <p>
          Fenerbahçe Evreni, çocukları hedef alan veya reşit olmayan bireylerden doğrudan kişisel veri toplamayı amaçlayan bir yapıya sahip değildir. Bilerek ve isteyerek çocuk yaştaki kullanıcıların verileri işlenmez. Fark edilmeden toplanmış veriler ile karşılaşıldığında bu kayıtlar derhal silinmektedir.
        </p>
      </LegalSection>

      <LegalSection id="guvenlik" title="K. Güvenlik Önlemleri">
        <p>
          Verilerinizin yetkisiz kişilerce ele geçirilmesini, kaybolmasını veya zarar görmesini önlemek için güvenli SSL/HTTPS protokolleri, güncel şifreleme metotları ve bulut tabanlı Firebase erişim kontrol kuralları dahil olmak üzere makul düzeyde teknik ve idari tedbirler uygulanmaktadır.
        </p>
      </LegalSection>

      <LegalSection id="degisiklikler" title="L. Politika Değişiklikleri">
        <p>
          Platformun yeni özellikleri, yasal gereksinimler veya altyapı güncellemelerine bağlı olarak Gizlilik Politikası zaman zaman güncellenebilir. Güncellemeler sitemizdeki bu sayfadan duyurulacak olup, sayfa başındaki "Son Güncelleme" tarihi güncellenecektir.
        </p>
      </LegalSection>

      <LegalSection id="iletisim" title="M. İletişim Bilgileri">
        <p>Gizlilik Politikası dökümanımızla ilgili her türlü soru, görüş veya silme talebiniz için bizimle iletişime geçebilirsiniz:</p>
        <p className="mt-2 font-mono font-bold bg-[#0c1223] px-3 py-2 rounded border border-white/5 inline-block text-fb-yellow">
          iletisim@fenerbahceevreni.com
        </p>
      </LegalSection>
    </LegalLayout>
    </>
  );
};
export default PrivacyPage;
