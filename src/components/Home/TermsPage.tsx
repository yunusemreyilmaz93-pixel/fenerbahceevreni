import React from 'react';
import { LegalLayout, LegalSection } from './LegalLayout';
import SEO from './SEO';

interface TermsPageProps {
  onNavigate: (view: string) => void;
}

export const TermsPage: React.FC<TermsPageProps> = ({ onNavigate }) => {
  const sections = [
    { id: 'nitelik', title: 'A. Platformun Niteliği' },
    { id: 'icerik-kullanimi', title: 'B. İçeriklerin Kullanımı ve Telif' },
    { id: 'analiz-yorum', title: 'C. Analiz ve Yorum Niteliği' },
    { id: 'davranislar', title: 'D. Kullanıcı Davranışları ve Sorumluluk' },
    { id: 'taraftar-odasi', title: 'E. Taraftar Odası ve Anketler' },
    { id: 'premium-future', title: 'F. Premium / Ücretli Hizmetler Gelecek Maddesi' },
    { id: 'sponsor-reklam', title: 'G. Sponsorlu İçerik ve Reklamlar' },
    { id: 'dis-baglantilar', title: 'H. Dış Bağlantılar (External Links)' },
    { id: 'sorumluluk-siniri', title: 'I. Sorumluluk Sınırlandırması (Limitation of Liability)' },
    { id: 'hesap-guvenligi', title: 'J. Hesap ve Yönetici Güvenliği' },
    { id: 'degisiklikler', title: 'K. Şartlarda Değişiklikler' },
    { id: 'iletisim', title: 'L. İletişim' }
  ];

  return (
    <>
      <SEO 
        title="Kullanım Şartları | Fenerbahçe Evreni"
        description="Fenerbahçe Evreni kullanım şartları ve kuralları. Bağımsız içerik niteliği, taraftar odası sorumlulukları, bülten kayıt sözleşmesi, fikri mülkiyet ve yasal sorumluluk sınırları."
        canonical="https://fenerbahceevreni.com/kullanim-sartlari"
      />
      <LegalLayout
        title="Kullanım Şartları"
        subtitle="Fenerbahçe Evreni web portalı ve buna bağlı servisleri kullanarak aşağıda belirtilen kullanım kurallarını, şartları ve sınırlamaları kabul etmiş olursunuz."
        onNavigate={onNavigate}
        sections={sections}
    >
      <LegalSection id="nitelik" title="A. Platformun Niteliği">
        <p>
          Fenerbahçe Evreni (fenerbahceevreni.com), sarı lacivertli renklere gönül vermiş taraftarlar için kurulmuş bağımsız bir futbol analiz, scout, taktik analiz, fikstür değerlendirmesi ve interaktif lobi haritası yayınıdır. 
        </p>
        <p className="mt-2">
          <strong>Önemli Telif & Marka Beyanı:</strong> Platformumuzun Fenerbahçe Spor Kulübü (Fenerbahçe SK) ve onun iştirakleriyle hiçbir resmî, organik ya da sponsorluk bağı bulunmamaktadır. Sitede yer alan tüm değerlendirmeler taraftar yorumu ve bağımsız spor medyası niteliğindedir. Fenerbahçe SK markası, logoları ve fikri hakları kulübün kendisine aittir.
        </p>
      </LegalSection>

      <LegalSection id="icerik-kullanimi" title="B. İçeriklerin Kullanımı ve Telif">
        <p>
          Fenerbahçe Evreni üzerindeki tüm makaleler, taktik grafikler, veritabanı tasarımları, lobilerin görsel haritaları, kodlanmış etkileşim şemaları, özel scout raporları ve ara yüz tasarımları Fenerbahçe Evreni'ne aittir veya lisansla kullanılmaktadır.
        </p>
        <ul className="list-disc pl-5 space-y-2 mt-2">
          <li>İçeriklerimizin tamamı veya bir kısmı, Fenerbahçe Evreni yönetimi tarafından yazılı açık izin verilmedikçe kopyalanamaz, başka ortamlara kopyalanıp basılamaz, ticari amaçla satılamaz veya otomatik botlarla (scraping) çekilemez.</li>
          <li>Kısa alıntılar veya paylaşımlar, sadece sitemize <strong>tıklanabilir aktif bağlantı (link) verilmesi ve kaynak gösterilmesi</strong> şartıyla serbesttir.</li>
        </ul>
      </LegalSection>

      <LegalSection id="analiz-yorum" title="C. Analiz ve Yorum Niteliği">
        <p>
          Sitede yayınlanan analizler, taktiksel öngörüler, oyuncu performans karneleri ve transfer iddiaları değişmez doğrular değildir. Bunlar tamamen subjektif spor yorumu, analitik modelleme ve veri okuma yöntemlerine dayanmaktadır. 
        </p>
        <p className="mt-2">
          Haber sekmesinde ya da radar modülünde yer alan bilgiler resmi kulüp transfer tebliğleri değildir, spor kulübünün onayını barındırmaz. Oyuncu puanlama verilerimiz, istatistiki algoritma ve araştırmacı yazar ekibimizin gözlem puanlarının birleşimidir.
        </p>
      </LegalSection>

      <LegalSection id="davranislar" title="D. Kullanıcı Davranışları ve Sorumluluk">
        <p>Formlarımızı, etkileşimli oy ve taraftar odası ekranlarını kullanan her kullanıcımız aşağıdaki kurallara uymakla yükümlüdür:</p>
        <ul className="list-disc pl-5 space-y-2 mt-2">
          <li>Küfür, hakaret, aşağılayıcı sözler, ırkçı ve nefret söylemi barındıran metinlerin yazılması, taraftarları kışkırtacak provokatif mesajların paylaşılması kesinlikle yasaktır.</li>
          <li>İletişim ve bülten formlarının asılsız, alakasız veya spam/reklam mailleriyle kasıtlı olarak doldurulması yasaktır.</li>
          <li>Web sitemizin sunucularına, Firebase veritabanı güvenlik kurallarına, admin paneline veya güvenlik mekanizmalarına sızma girişimi (hacking, SQL veya NoSQL enjeksiyonu vb.) tespit edildiğinde hukuki işlem hakkımız saklıdır.</li>
        </ul>
      </LegalSection>

      <LegalSection id="taraftar-odasi" title="E. Taraftar Odası ve Anketler">
        <p>
          Taraftar Odası'nda yapılan anketler ve oylamalar bilimsel veya resmi araştırma niteliğinde değildir. Sadece Fenerbahçe taraftar kitlesinin reflekslerini, lobi dağılımlarını ve gündeme bakışını eğlenceli bir biçimde yansıtır. 
        </p>
        <p className="mt-2">
          Yayınlanan anketlerin sonuçları üzerinde botlar, sahte hesaplar veya mükerrer oylamalarla manipülasyon yapmak sitemizin sistem algoritması tarafından filtrelenir ve tespit edilen geçersiz oylar derhal veritabanından silinir.
        </p>
      </LegalSection>

      <LegalSection id="premium-future" title="F. Premium / Ücretli Hizmetler Gelecek Maddesi">
        <p>
          Mevcut aşamada web sitemizde bulunan "Premium" bölümü taraftarları bekleme listesine alan ve ücret talep etmeyen ücretsiz ön kayıt aşamasındadır. 
        </p>
        <p className="mt-2">
          Gelecekte sitemize ücretli analizler, özel scout havuzları veya basılı bülten gönderimleri gibi ücretli servisler eklenirse, bu servislerin ödeme koşulları, cayma şartları ve iade politikaları yürürlüğe koyulacağı tarihte ayrı bir hizmet sözleşmesi olarak yayınlanacak ve kullanıcılara sunulacaktır. Ön kayıt yaptırmış olmak kullanıcılara herhangi bir maddi yükümlülük yüklemez.
        </p>
      </LegalSection>

      <LegalSection id="sponsor-reklam" title="G. Sponsorlu İçerik ve Reklamlar">
        <p>
          Fenerbahçe Evreni, giderlerini karşılamak ve bağımsız yayın hayatını sürdürebilmek için iş birlikleri, sponsorluklar ve banner reklamlar yayınlayabilir. Sponsorlu içeriklerin tamamı açık veya dolaylı olarak belirtilmelidir. Sponsorlu içerikler, sitemizin o sponsor kuruluşun politika ve görüşlerini tamamen desteklediği anlamına gelmez.
        </p>
      </LegalSection>

      <LegalSection id="dis-baglantilar" title="H. Dış Bağlantılar (External Links)">
        <p>
          Sitemizdeki analizlerde veya haberlerde üçüncü şahıs web sitelerine, kulüp resmi duyurularına veya sosyal medya mecralarına (X, YouTube vb.) bağlantılar verilebilir. Dışarıya yönlendirilen sitelerin içerikleri veya bilgi güvenliği politikaları bizim sorumluluğumuz dışındadır.
        </p>
      </LegalSection>

      <LegalSection id="sorumluluk-siniri" title="I. Sorumluluk Sınırlandırması (Limitation of Liability)">
        <p>
          Fenerbahçe Evreni; sitenin kesintisiz, tamamen hatasız veya siber saldırılardan %100 arındırılmış olarak yayın yapacağını kesin olarak taahhüt etmez. İçeriklerde yer alan maddi yazım hatalarından, geçici sunucu kesintilerinden ya da sitemizdeki yazarların şahsi fikirlerinin doğurabileceği dolaylı sonuçlardan yönetimimiz sorumlu tutulamaz.
        </p>
      </LegalSection>

      <LegalSection id="hesap-guvenligi" title="J. Hesap ve Yönetici Güvenliği">
        <p>
          Yönetici/Admin paneline giriş yapma yetkisi bulunan kullanıcılar, kendi şifrelerini ve giriş bilgilerini gizli tutmakla bizzat yükümlüdür. Kendi ihmalleri sebebiyle hesaplarının yetkisiz kişilerce kullanılmasından doğan veri kayıplarından platform yönetimi sorumlu tutulamaz.
        </p>
      </LegalSection>

      <LegalSection id="degisiklikler" title="K. Şartlarda Değişiklikler">
        <p>
          Fenerbahçe Evreni, tamamen kendi takdirine bağlı olarak bu Kullanım Şartları’nı dilediği vakit değiştirme hakkını saklı tutar. Değişiklikler bu sayfanın yayınlanmasıyla beraber doğrudan yürürlüğe girer.
        </p>
      </LegalSection>

      <LegalSection id="iletisim" title="L. İletişim">
        <p>Kullanım Kuralları ve Şartlarıyla ilgili her türlü bildirim, soru ve öneriniz için iletişim adresi:</p>
        <p className="mt-2 font-mono font-bold bg-[#0c1223] px-3 py-2 rounded border border-white/5 inline-block text-fb-yellow">
          iletisim@fenerbahceevreni.com
        </p>
      </LegalSection>
    </LegalLayout>
    </>
  );
};
export default TermsPage;
