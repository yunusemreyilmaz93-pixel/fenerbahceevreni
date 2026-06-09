import React from 'react';
import { LegalLayout, LegalSection } from './LegalLayout';
import SEO from './SEO';

interface KvkkPageProps {
  onNavigate: (view: string) => void;
}

export const KvkkPage: React.FC<KvkkPageProps> = ({ onNavigate }) => {
  const sections = [
    { id: 'veri-sorumlusu', title: '1. Veri Sorumlusu' },
    { id: 'islenen-veriler', title: '2. İşlenen Kişisel Veriler' },
    { id: 'isleme-amaclari', title: '3. Kişisel Veri İşleme Amaçları' },
    { id: 'hukuki-sebepler', title: '4. İşlemenin Hukuki Sebepleri' },
    { id: 'toplama-yontemleri', title: '5. Veri Toplama Yöntemleri' },
    { id: 'aktarim', title: '6. İşlenen Verilerin Aktarımı' },
    { id: 'saklama-suresi', title: '7. Saklama Süresi ve İmha' },
    { id: 'haklar', title: '8. KVKK Kapsamındaki Haklarınız (Madde 11)' },
    { id: 'basvuru', title: '9. Başvuru Yöntemi' },
    { id: 'guncelleme', title: '10. Politikadaki Güncellemeler' }
  ];

  return (
    <>
      <SEO 
        title="KVKK Aydınlatma Metni | Fenerbahçe Evreni"
        description="Fenerbahçe Evreni KVKK Aydınlatma Metni. Kişisel verilerinizin toplanma yöntemleri, işlenme amaçları, aktarım koşulları ve Madde 11 hakları."
        canonical="https://fenerbahceevreni.com/kvkk-aydinlatma-metni"
      />
      <LegalLayout
        title="KVKK Aydınlatma Metni"
        subtitle="Fenerbahçe Evreni olarak, 6698 Sayılı Kişisel Verilerin Korunması Kanunu (KVKK) uyarınca verilerinizin güvenliği ve yasal haklarınız hususunda sizleri aydınlatmak isteriz."
        onNavigate={onNavigate}
        sections={sections}
    >
      <LegalSection id="veri-sorumlusu" title="1. Veri Sorumlusu">
        <p>
          6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında, veri sorumlusu sıfatıyla hareket eden merci <strong>Fenerbahçe Evreni</strong> platform kurgusudur. 
        </p>
        <p className="mt-2 text-rose-400 font-bold">
          Önemli Not: Platformumuz henüz bağımsız bir taraftar girişimi olup tüzel kişilik/şirket niteliğinde değildir. Gelecekte bir şirket kurulumu gerçekleşirse yasal unvan ve mersis numarası gibi detaylar bu bölüme doğrudan eklenecektir.
        </p>
      </LegalSection>

      <LegalSection id="islenen-veriler" title="2. İşlenen Kişisel Veriler">
        <p>Aydınlatma Metni kapsamında işlenebilecek kullanıcı verileriniz şu şekildedir:</p>
        <ul className="list-disc pl-5 space-y-2 mt-2">
          <li><strong>Kimlik ve İletişim Bilgileri:</strong> Formlarda belirttiğiniz ad, soyad ve e-posta adresi.</li>
          <li><strong>İşlem Güvenliği ve Teknik Veriler:</strong> Sitemizi ziyaret ettiğiniz esnada kaydedilen IP adresi, port, tarayıcı bilgisi, sistem giriş çıkış logları.</li>
          <li><strong>Etkileşim Verileri:</strong> Bülten aboneliğindeki ilgi alanlarınız, katıldığınız anketlerin logları, taraftar odası lobi seçimleriniz ve premium bekleme listesi tercih bilgileri.</li>
        </ul>
      </LegalSection>

      <LegalSection id="isleme-amaclari" title="3. Kişisel Veri İşleme Amaçları">
        <p>Kişisel verileriniz Kanun'un 4. 5. ve 6. maddelerinde belirtilen şartlara uygun olarak şu amaçlarla işlenecektir:</p>
        <ul className="list-disc pl-5 space-y-2 mt-2">
          <li>Platformumuzun teknik olarak kesintisiz ve kararlı bir biçimde yayınlanması,</li>
          <li>Abonelik talebinize istinaden haftalık bülten gönderimlerinin güvenli şekilde organize edilmesi,</li>
          <li>Gönderdiğiniz öneri, talep, şikayet ve sponsorluk ortaklık mesajlarının incelenerek cevaplanması,</li>
          <li>Premium bekleme listesi sıralama algoritmasının yönetilmesi ve üyelik hazırlıklarının tamamlanması,</li>
          <li>Anket güvenliğinin, oylama tutarlılığının sağlanması ve mükerrer oy basımının engellenmesi,</li>
          <li>Siber suçların, spam ihlallerinin ve sitemizi hedef alan ddos benzeri saldırıların önlenmesi ve adli birimlerin yasal taleplerine destek olunması.</li>
        </ul>
      </LegalSection>

      <LegalSection id="hukuki-sebepler" title="4. İşlemenin Hukuki Sebepleri">
        <p>Fenerbahçe Evreni kişisel verilerinizi şu hukuki sebeplere dayanarak işler:</p>
        <ul className="list-disc pl-5 space-y-2 mt-2">
          <li><strong>Açık Rıza:</strong> Bülten aboneliğine ve premium bekleme listesine katılımınız esnasında verdiğiniz doğrudan onay.</li>
          <li><strong>Sözleşmenin İfası:</strong> İletişim formundan doldurduğunuz mesajın işlenmesi ve cevaplanması talebi.</li>
          <li><strong>Meşru Menfaat:</strong> Platformun siber güvenliğini muhafaza etmek, sistem hatalarını taramak ve anket manipulated girişimlerini önlemek adına IP ve log kaydı tutmak.</li>
          <li><strong>Hukuki Yükümlülük:</strong> Sunucu hizmetleri yasal takipleri ve bilişim suçları mevzuatı kapsamındaki resmi adli zorunluluklar.</li>
        </ul>
      </LegalSection>

      <LegalSection id="toplama-yontemleri" title="5. Veri Toplama Yöntemleri">
        <p>
          Verileriniz, sitemizdeki tüm form alanları aracılığıyla elektronik ve dijital olarak toplanır. Formlar (iletişim, bülten, bekleme listesi) gönder tuşuna basıldığında Firebase Firestore veritabanımıza şifreli olarak aktarılır. Teknik loglar ve çerezler ise sunucu sistemlerimizin arka planında otomatik olarak oluşmaktadır.
        </p>
      </LegalSection>

      <LegalSection id="aktarim" title="6. İşlenen Verilerin Aktarımı">
        <p>
          Fenerbahçe Evreni, kişisel verilerinizi üçüncü kişilere satmaz veya ticari menfaat doğrultusunda pazarlamaz. 
        </p>
        <p className="mt-2">
          Veriler sadece hosting, database ve bilgi güvenliği aldığımız iş ortaklarımız ile (Google Firebase altyapısı gibi sunucu sağlayıcıları) veri koruma sözleşmelerine uygun sınırlar içerisinde paylaşılabilir. Yasal olarak yetkili resmi kurum ve mahkemeler tarafından talep edildiğinde ise yasal sınırlar dâhilinde aktarım yapılabilir.
        </p>
      </LegalSection>

      <LegalSection id="saklama-suresi" title="7. Saklama Süresi ve İmha">
        <p>
          Kişisel verileriniz, işleme amaçlarımızın geçerliliğini koruduğu süre boyunca saklanır. Örneğin, bülten aboneliğiniz siz listeden ayrılana kadar saklanırken; iletişim mesajları idari takipler için hukuken makul arşiv sürelerinde muhafaza edilir. Amacı kalmayan veya yasal süreleri dolan kişisel verileriniz veri imha politikamız uyarınca kalıcı olarak silinir.
        </p>
      </LegalSection>

      <LegalSection id="haklar" title="8. KVKK Kapsamındaki Haklarınız (Madde 11)">
        <p>Kanun'un 11. maddesi uyarınca sahip olduğunuz yasal haklar şunlardır:</p>
        <ul className="list-disc pl-5 space-y-2 mt-2">
          <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme,</li>
          <li>İşlenmişse buna ilişkin bilgi talep etme,</li>
          <li>Kişisel verilerin işlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme,</li>
          <li>Yurt içinde veya yurt dışında kişisel verilerin aktarıldığı üçüncü kişileri bilme,</li>
          <li>Eksik veya yanlış işlenmiş olması hâlinde bunların düzeltilmesini isteme,</li>
          <li>Kanun’un 7. maddesinde öngörülen şartlar çerçevesinde kişisel verilerin silinmesini veya yok edilmesini isteme,</li>
          <li>İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme,</li>
          <li>Kişisel verilerin kanuna aykırı olarak işlenmesi sebebiyle zarara uğramanız hâlinde zararın giderilmesini talep etme.</li>
        </ul>
      </LegalSection>

      <LegalSection id="basvuru" title="9. Başvuru Yöntemi">
        <p>
          Kanun kapsamındaki tüm taleplerinizi veya silme müracaatlarınızı, sistemlerimize kayıtlı olan e-posta adresiniz üzerinden platformumuza iletebilirsiniz. Başvurularınız incelenerek en geç 30 gün içerisinde yasal mevzuata uygun şekilde cevaplandırılacaktır.
        </p>
        <p className="mt-2 font-mono font-bold bg-[#0c1223] px-3 py-2 rounded border border-white/5 inline-block text-fb-yellow">
          iletisim@fenerbahceevreni.com
        </p>
      </LegalSection>

      <LegalSection id="guncelleme" title="10. Politikadaki Güncellemeler">
        <p>
          Bu Aydınlatma Metni, yürürlükteki mevzuatta yapılacak revizyonlara veya platformun veri toplama pratiklerindeki gelişmelere göre güncellenebilir. Olası güncellemeleri sitemizdeki bu sayfadan takip edebilirsiniz.
        </p>
      </LegalSection>
    </LegalLayout>
    </>
  );
};
export default KvkkPage;
