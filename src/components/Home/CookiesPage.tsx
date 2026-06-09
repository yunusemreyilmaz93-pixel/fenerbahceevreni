import React from 'react';
import { LegalLayout, LegalSection } from './LegalLayout';
import SEO from './SEO';

interface CookiesPageProps {
  onNavigate: (view: string) => void;
}

export const CookiesPage: React.FC<CookiesPageProps> = ({ onNavigate }) => {
  const sections = [
    { id: 'cerez-nedir', title: 'A. Çerez (Cookie) Nedir?' },
    { id: 'cerez-turleri', title: 'B. Kullanılabilecek Çerez Türleri' },
    { id: 'kullanim-amaclari', title: 'C. Çerezlerin Kullanım Amaçları' },
    { id: 'ucuncu-taraf', title: 'D. Üçüncü Taraf Çerezleri' },
    { id: 'yonetme', title: 'E. Çerezleri Yönetme ve Devre Dışı Bırakma' },
    { id: 'onay', title: 'F. Çerez Politikası Onayı' },
    { id: 'guncelleme', title: 'G. Politikadaki Güncellemeler' },
    { id: 'iletisim', title: 'H. İletişim' }
  ];

  return (
    <>
      <SEO 
        title="Çerez Politikası | Fenerbahçe Evreni"
        description="Fenerbahçe Evreni çerez kullanımı, çerez türleri, analiz amaçları ve tarayıcı ayarları üzerinden çerez yönetimi hakkında bilgilendirme sayfası."
        canonical="https://fenerbahceevreni.com/cerez-politikasi"
      />
      <LegalLayout
        title="Çerez Politikası"
        subtitle="Fenerbahçe Evreni olarak web sitemizde geçirdiğiniz zamanı daha verimli kılabilmek ve analiz raporlarımızı doğru kurgulamak adına çerezler kullanmaktayız."
        onNavigate={onNavigate}
        sections={sections}
    >
      <LegalSection id="cerez-nedir" title="A. Çerez (Cookie) Nedir?">
        <p>
          Çerezler (Cookies), ziyaret ettiğiniz web siteleri tarafından tarayıcınız (Safari, Chrome, Firefox vb.) vasıtasıyla cihazınıza (bilgisayar, tablet veya akıllı telefon) kaydedilen küçük boyutlu metin dosyalarıdır. 
        </p>
        <p className="mt-2">
          Bu küçük kodlar, sitenin sizi hatırlamasına, gezinme tercihlerinizi hafızada tutmasına, güvenlik kontrolleri yapılmasına ve genel kullanıcı deneyiminin optimize edilmesine yardımcı olur.
        </p>
      </LegalSection>

      <LegalSection id="cerez-turleri" title="B. Kullanılabilecek Çerez Türleri">
        <p>Sitemizde kullanım senaryosu ve amacına bağlı olarak şu dört ana grupta çerezler kullanılabilir:</p>
        <ul className="list-disc pl-5 space-y-2 mt-2">
          <li>
            <strong>1. Zorunlu (Gerekli) Çerezler:</strong> Sitenin düzgün çalışması, sayfalar arası geçişin sağlanması ve yönetici giriş paneli gibi güvenli bölgelerin çalışabilmesi için şarttır. Devre dışı bırakıldığında sitenin belirli kısımları tamamen çalışmaz hale gelebilir.
          </li>
          <li>
            <strong>2. İşlevsel (Tercih) Çerezleri:</strong> Sitede yaptığınız seçimleri (örneğin seçtiğiniz koyu/açık mod ayarları, anketlerde veya taraftar odasındaki oylama kayıtlarınız) hatırlayarak size kişiselleştirilmiş bir kolaylık sunar.
          </li>
          <li>
            <strong>3. Performans ve Analitik Çerezleri:</strong> Sitemizi kaç kişinin ziyaret ettiğini, hangi sayfaların daha çok tıklandığını ve kullanıcıların nerede hata aldığını tespit etmek amacıyla kullanılır. Bu çerezler verileri tamamen anonim, sayısal ve toplu olarak analiz eder.
          </li>
          <li>
            <strong>4. Reklam ve Pazarlama Çerezleri:</strong> Platformun desteklenmesi amacıyla gösterilebilecek sponsorlu tekliflerin veya reklam bannerlarının etkinliğini ölçmek, size ilgi duyabileceğiniz spor içeriklerini göstermek amacıyla üçüncü taraf entegrasyonları tarafından yerleştirilebilir.
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="kullanim-amaclari" title="C. Çerezlerin Kullanım Amaçları">
        <p>Çerez bilgilerini aşağıdaki kilit işlevleri yerine getirebilmek adına işlemekteyiz:</p>
        <ul className="list-disc pl-5 space-y-2 mt-2">
          <li>Taraftar analizlerimizi, scout arşivlerimizi ve makalelerimizi ne düzeyde incelediğinizi saptamak,</li>
          <li>Bülten aboneliği veya premium bekleme listesine kaydolup kaydolmadığınızı tarayıcı bazında tespit ederek mükerrer form gösterimlerini engellemek,</li>
          <li>Anket girişlerinde yapay oylamaları, spam bot davranışlarını engelleyerek anket güvenilirliğini temin etmek,</li>
          <li>Geliştirici ekibimizin sitenin çalışma hızını ve sayfa yükleme metriklerini optimize etmesine kaynak sağlamak.</li>
        </ul>
      </LegalSection>

      <LegalSection id="ucuncu-taraf" title="D. Üçüncü Taraf Çerezleri">
        <p>
          Fenerbahçe Evreni, Google Firebase, Google Cloud, YouTube (video önizleme pencereleri için) ve sosyal paylaşım eklentileri (Twitter, Instagram) gibi harici entegrasyonlar kullanmaktadır. 
        </p>
        <p className="mt-2">
          Bu platformlar sitemiz üzerinde kendi çerezlerini tanımlayabilir ve tercih analizi yapabilirler. Üçüncü tarafların çerez yönetim politikaları kendi resmi koşul sayfalarından takip edilmelidir.
        </p>
      </LegalSection>

      <LegalSection id="yonetme" title="E. Çerezleri Yönetme ve Devre Dışı Bırakma">
        <p>
          Çerezlerin bilgisayarınızda depolanıp depolanmayacağına karar verme yetkisi tamamen size aittir. Tarayıcınızın ayarlar menüsüne giderek çerezleri tamamen engelleyebilir, geçmiş çerez dosyalarını temizleyebilir ya da her site girişinde uyarılmayı talep edebilirsiniz.
        </p>
        <div className="p-4 rounded-xl bg-[#090e1b] border border-white/5 space-y-1.5 mt-2 font-mono text-[11px] text-slate-400">
          <p><strong>🛠️ Tarayıcılarda Çerez Yönetim Yolları:</strong></p>
          <p>• Google Chrome: Ayarlar &gt; Gizlilik ve Güvenlik &gt; Çerezler ve Diğer Site Verileri</p>
          <p>• Mozilla Firefox: Seçenekler &gt; Gizlilik ve Güvenlik &gt; Geçmiş &gt; Çerezler</p>
          <p>• Apple Safari: Tercihler &gt; Gizlilik &gt; Çerezler ve Web Sitesi Verileri</p>
        </div>
      </LegalSection>

      <LegalSection id="onay" title="F. Çerez Politikası Onayı">
        <p>
          Fenerbahçe Evreni'ne ilk kez giriş yaptığınızda karşınıza çıkan "Çerez Bilgilendirme ve Onay" bandında tarafımıza izin vermeniz durumunda çerez kullanımı kabul edilmiş sayılır. "Zorunlu Çerezlerle Devam Et" seçeneğini seçtiğiniz takdirde sadece teknik zorunluluğu bulunan çerezler aktif tutulacak, analiz ve takip çerezleri yüklenmeyecektir.
        </p>
      </LegalSection>

      <LegalSection id="guncelleme" title="G. Politikadaki Güncellemeler">
        <p>
          Teknolojik değişimlere ve yasal yeni düzenlemelere ayak uydurabilmek için Çerez Politikası dökümanımız gerektiğinde tek taraflı güncellenebilir. Lütfen aralıklı olarak bu dökümanı ziyaret ederek çerez tercihleriniz hakkında bilgi tazeleyiniz.
        </p>
      </LegalSection>

      <LegalSection id="iletisim" title="H. İletişim">
        <p>Çerez Politikamız ile ilgili kafanıza takılan teknik detaylar için her zaman destek birimimize yazabilirsiniz:</p>
        <p className="mt-2 font-mono font-bold bg-[#0c1223] px-3 py-2 rounded border border-white/5 inline-block text-fb-yellow">
          iletisim@fenerbahceevreni.com
        </p>
      </LegalSection>
    </LegalLayout>
    </>
  );
};
export default CookiesPage;
