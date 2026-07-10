import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import SEO from './SEO';
import { 
  Shield, 
  Target, 
  Users, 
  AlertTriangle, 
  Terminal, 
  Award, 
  Flame, 
  HelpCircle, 
  FileText, 
  Activity, 
  PieChart, 
  Check, 
  TrendingUp, 
  Info, 
  ChevronDown, 
  Mail, 
  Lock, 
  Send,
  DollarSign,
  Briefcase 
} from 'lucide-react';
import { dbGetCollection } from '../../lib/dbService';
import { apiContactSubmit } from '../../lib/secureApi';

interface AboutPageProps {
  onNavigate: (view: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  const [siteSettings, setSiteSettings] = useState<any>({
    siteTitle: "Fenerbahçe Evreni - Bağımsız Analiz Portalı",
    siteDescription: "Fenerbahçe taktik analiz, scout bülteni, taraftar fraksiyonları ve maç merkezi portalı.",
    contactEmail: "iletisim@fenerbahceevreni.com",
    disclaimerText: "Fenerbahçe Evreni, bağımsız bir taraftar ve analiz platformudur. Ticari ya da hukuki olarak Fenerbahçe SK ya da bağlı şirketleri ile herhangi bir resmi organik bağı veya ortaklığı bulunmamaktadır."
  });
  const [faqOpen, setFaqOpen] = useState<{ [key: number]: boolean }>({ 0: true });
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMsg, setContactMsg] = useState('');
  const [contactSuccess, setContactSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Set Document Title for SEO
    document.title = "Hakkında | Fenerbahçe Evreni";

    // Attempt to load settings from dbService
    const loadSettings = async () => {
      try {
        const settings = await dbGetCollection('site_settings');
        if (settings && settings.length > 0) {
          setSiteSettings(settings[0]);
        }
      } catch (err) {
        console.error("Error loading site settings in About Page:", err);
      }
    };
    loadSettings();
  }, []);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !contactEmail.trim() || !contactMsg.trim()) {
      alert("Lütfen tüm alanları doldurunuz.");
      return;
    }

    setLoading(true);
    try {
      const result = await apiContactSubmit({
        name: contactName.trim(),
        email: contactEmail.trim(),
        subject: 'Hakkında sayfası iletişim',
        message: contactMsg.trim(),
        messageType: 'genel',
        website: '',
      });
      if (!result.success) {
        alert(result.message || 'Mesajınız iletilemedi, lütfen e-posta ile ulaşın.');
        return;
      }
      setContactSuccess(true);
      setContactName('');
      setContactEmail('');
      setContactMsg('');
    } catch (err) {
      console.error(err);
      alert("Mesajınız iletilemedi, lütfen e-posta ile ulaşın.");
    } finally {
      setLoading(false);
    }
  };

  const toggleFaq = (idx: number) => {
    setFaqOpen(p => ({ ...p, [idx]: !p[idx] }));
  };

  const faqs = [
    {
      q: "Fenerbahçe Evreni resmî bir platform mu?",
      a: "Hayır. Fenerbahçe Evreni bağımsız bir taraftar ve analiz platformudur. Fenerbahçe Spor Kulübü ile resmî bir bağı yoktur."
    },
    {
      q: "İçerikler kim tarafından hazırlanıyor?",
      a: "İçerikler bağımsız analiz ve taraftar perspektifiyle hazırlanır. İleride platform büyüdükçe yazar ve katkı ekibi genişletilebilir."
    },
    {
      q: "Premium içerikler ücretsiz içerikleri bitirecek mi?",
      a: "Hayır. Ücretsiz içerikler her zaman devam edecektir. Premium ise daha derin, arşivlik ve özel gelişmiş analitik verileri barındıran PDF raporları için ek bir seçenek olarak sunulur."
    },
    {
      q: "Sponsorlu içerikler olacak mı?",
      a: "İş birliği ve bülten sürdürülebilirliği çerçevesinde olabilir. Ancak her türlü sponsorlu iş birliği yayın bağımsızlığımızın önüne geçemez ve okuyucularımıza açıkça beyan edilir."
    },
    {
      q: "Taraftar yorumları yayınlanacak mı?",
      a: "Evet. Taraftar Odası bölümü anketler, yorumlar ve tartışma başlıklarıyla topluluk hissiyatını güçlendirmek için tasarlanmıştır. Moderasyon kurallarına uyan her görüş burada kendine yer bulur."
    }
  ];

  return (
    <div className="min-h-screen bg-fb-dark text-slate-100 overflow-hidden relative">
      <SEO 
        title="Hakkında | Fenerbahçe Evreni"
        description="Fenerbahçe Evreni, bağımsız Fenerbahçe analiz, taktik döküman, maç raporu, transfer radar ve interaktif taraftar analiz platformudur."
        canonical="https://fenerbahceevreni.com/hakkinda"
      />
      
      {/* Dynamic Ambient Blur Background elements */}
      <div className="absolute top-[5%] right-[10%] w-[40rem] h-[40rem] rounded-full bg-fb-navy opacity-30 blur-[130px] pointer-events-none" />
      <div className="absolute top-[50%] left-[5%] w-[35rem] h-[35rem] rounded-full bg-fb-yellow/5 opacity-15 blur-[150px] pointer-events-none" />

      {/* 1. HERO SECTION */}
      <section className="relative pt-12 md:pt-20 pb-16 md:pb-24 border-b border-white/[0.04] text-center">
        <div className="max-w-4xl mx-auto px-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-fb-yellow/10 border border-fb-yellow/20 text-[10px] text-fb-yellow font-black uppercase tracking-wider mb-6">
            <Shield className="w-3.5 h-3.5" /> BEYAN VE VİZYON BELGESİ
          </div>

          <h1 className="text-4xl md:text-6xl font-display font-black text-white italic uppercase tracking-tight leading-none mb-6">
            HAKKINDA
          </h1>

          <p className="text-slate-300 text-sm md:text-lg max-w-3xl mx-auto leading-relaxed mb-10 font-semibold text-center">
            Fenerbahçe Evreni; maçları, oyuncuları, transferleri ve taraftar gündemini daha derin okumak isteyenler için kurulmuş bağımsız bir analiz platformudur.
          </p>

          <div className="flex flex-wrap justify-center gap-2.5 max-w-4xl mx-auto mb-6">
            {[
              "Bağımsız Platform",
              "Maç Analizi",
              "Transfer Radar",
              "Oyuncu Performansı",
              "Taraftar Topluluğu",
              "Premium Raporlar"
            ].map((badge, i) => (
              <span 
                key={i} 
                className="px-3.5 py-1.5 rounded-xl bg-fb-card border border-white/[0.06] text-xs font-black text-slate-200 tracking-wide flex items-center gap-2 shadow-sm"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-fb-yellow animate-pulse" /> {badge}
              </span>
            ))}
          </div>

          {/* Legal Warning Notice (Visual) */}
          <div className="mt-8 p-3.5 max-w-3xl mx-auto rounded-xl bg-red-500/5 border border-red-500/15 text-[11px] text-slate-300 font-semibold flex items-start gap-2.5 text-left">
            <AlertTriangle className="w-4 h-4 text-fb-yellow shrink-0 mt-0.5" />
            <span>
              <strong>Yasal Sorumluluk Beyanı:</strong> Bu web sitesi bağımsız bir taraftar topluluğuna ait olup, hiçbir şekilde Fenerbahçe Spor Kulübü’nün resmi temsilcisi veya bağlı bir kuruluşu değildir. Platformumuzda resmi kulüp markaları, tescilli logolar veya ticari logolar kullanılmamaktadır.
            </span>
          </div>
        </div>
      </section>

      {/* 2. WHAT IS FENERBAHÇE EVRENİ ? */}
      <section className="py-16 md:py-24 border-b border-white/[0.04] bg-fb-card/20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-fb-yellow block mb-2 font-mono">BİZ KİMİZ?</span>
            <h2 className="text-2xl md:text-4xl font-display font-black text-white italic uppercase tracking-wide">
              Fenerbahçe Evreni nedir?
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed max-w-3xl mx-auto mt-4 font-semibold">
              Fenerbahçe Evreni, Fenerbahçe gündemini sadece skor, transfer söylentisi veya maç sonu tepkisi üzerinden değil; taktik yapı, oyuncu rolleri, kadro mühendisliği, maç içi kırılma anları ve taraftar hissiyatı üzerinden değerlendirmeyi amaçlayan bağımsız bir taraftar ve analiz platformudur.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="p-8 rounded-2xl bg-fb-card border border-white/[0.05] hover:border-fb-yellow/20 transition-all flex flex-col justify-between group">
              <div className="space-y-4 text-left">
                <div className="w-10 h-10 rounded-xl bg-fb-yellow/10 flex items-center justify-center text-fb-yellow">
                  <Activity size={20} />
                </div>
                <h3 className="text-base font-black text-white group-hover:text-fb-yellow transition-colors font-display uppercase italic tracking-wide">
                  Analiz odaklı
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                  Maçları sadece kazanıldı/kaybedildi diye değil; oyun planı, tempo, baskı yapısı, oyuncu rolleri ve teknik kararlar üzerinden değerlendirir.
                </p>
              </div>
              <div className="text-[10px] text-fb-muted font-bold tracking-wider pt-6 border-t border-white/[0.03] mt-6">TACTICAL VISION • 01</div>
            </div>

            {/* Card 2 */}
            <div className="p-8 rounded-2xl bg-fb-card border border-white/[0.05] hover:border-fb-yellow/20 transition-all flex flex-col justify-between group">
              <div className="space-y-4 text-left">
                <div className="w-10 h-10 rounded-xl bg-fb-yellow/10 flex items-center justify-center text-fb-yellow">
                  <Users size={20} />
                </div>
                <h3 className="text-base font-black text-white group-hover:text-fb-yellow transition-colors font-display uppercase italic tracking-wide">
                  Taraftar merkezli
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                  Taraftarın duygusunu yok saymaz; ama bu duyguyu daha seviyeli, daha üretken ve daha analitik bir zemine taşımaya çalışır.
                </p>
              </div>
              <div className="text-[10px] text-fb-muted font-bold tracking-wider pt-6 border-t border-white/[0.03] mt-6">COMMUNITY VIBE • 02</div>
            </div>

            {/* Card 3 */}
            <div className="p-8 rounded-2xl bg-fb-card border border-white/[0.05] hover:border-fb-yellow/20 transition-all flex flex-col justify-between group bg-gradient-to-br from-fb-card to-fb-navy/30">
              <div className="space-y-4 text-left">
                <div className="w-10 h-10 rounded-xl bg-fb-yellow/10 flex items-center justify-center text-fb-yellow">
                  <Shield size={20} />
                </div>
                <h3 className="text-base font-black text-white group-hover:text-fb-yellow transition-colors font-display uppercase italic tracking-wide">
                  Bağımsız
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                  Fenerbahçe Spor Kulübü ile resmî bir bağı yoktur. Yayın çizgisi bağımsızdır ve içerikler taraftar/analiz perspektifiyle hazırlanır.
                </p>
              </div>
              <div className="text-[10px] text-fb-yellow font-black tracking-wider pt-6 border-t border-fb-yellow/10 mt-6 font-mono">100% INDEPENDENT • 03</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. WHAT WE ARE NOT */}
      <section className="py-16 md:py-24 border-b border-white/[0.04]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-fb-yellow block mb-2 font-mono">NİYET TÜZÜĞÜ</span>
            <h2 className="text-2xl md:text-4xl font-display font-black text-white italic uppercase tracking-wide">
              Ne değiliz?
            </h2>
            <p className="text-xs text-fb-muted">Klişelerden ve sosyal medya karmaşasından ayrışmak için ilkelerimizi netleştiriyoruz.</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
            
            {/* Warning Card 1 */}
            <div className="p-6 rounded-2xl bg-fb-card border-l-4 border-red-500 bg-gradient-to-r from-fb-card to-[#23151b]/10 text-left space-y-3">
              <h3 className="text-sm font-black text-white uppercase italic font-display tracking-wider flex items-center gap-1.5">
                <XCircleIcon /> Resmî kulüp sitesi değiliz
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                Fenerbahçe Evreni, Fenerbahçe Spor Kulübü’nün resmî yayın organı değildir ve kulüp kararlarında söz sahibi ya da temsilcisi değildir.
              </p>
            </div>

            {/* Warning Card 2 */}
            <div className="p-6 rounded-2xl bg-fb-card border-l-4 border-red-500 bg-gradient-to-r from-fb-card to-[#23151b]/10 text-left space-y-3">
              <h3 className="text-sm font-black text-white uppercase italic font-display tracking-wider flex items-center gap-1.5">
                <XCircleIcon /> Son dakika haber yarışı yapmıyoruz
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                Amacımız haberi en hızlı sunup hatalı bilgi aktarmak değil; netleşmiş gelişmelerin ardındaki derin manayı ve rasyonel analizleri sunmaktır.
              </p>
            </div>

            {/* Warning Card 3 */}
            <div className="p-6 rounded-2xl bg-fb-card border-l-4 border-red-500 bg-gradient-to-r from-fb-card to-[#23151b]/10 text-left space-y-3">
              <h3 className="text-sm font-black text-white uppercase italic font-display tracking-wider flex items-center gap-1.5">
                <XCircleIcon /> Transfer duyum hesabı değiliz
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                Transfer gündemindeki oyuncuları popülist ‘geliyor/gidiyor’ dilinden ziyade; taktik uyum, maliyet, risk ve kadro ihtiyaçları açısından analiz ederiz.
              </p>
            </div>

            {/* Warning Card 4 */}
            <div className="p-6 rounded-2xl bg-fb-card border-l-4 border-red-500 bg-gradient-to-r from-fb-card to-[#23151b]/10 text-left space-y-3">
              <h3 className="text-sm font-black text-white uppercase italic font-display tracking-wider flex items-center gap-1.5">
                <XCircleIcon /> Clickbait medya değiliz
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                Ucuz sansasyon başlıkları, manipülatif iddialar veya teyit edilmemiş dedikodular üzerinden trafik kovalamak yerine, saygıdeğer ve dürüst bir kütüphane sunarız.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 4. MISSION SECTION */}
      <section className="py-16 md:py-24 border-b border-white/[0.04] bg-fb-card/10">
        <div className="max-w-5xl mx-auto px-6 grid md:grid-cols-5 gap-10 items-center">
          
          <div className="md:col-span-3 text-left space-y-6">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-fb-yellow block font-mono">Platform Ülküsü</span>
            <h2 className="text-2xl md:text-4xl font-display font-black text-white italic uppercase tracking-wide">
              Misyonumuz
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed font-semibold">
              Fenerbahçe taraftarının daha kaliteli futbol tartışmalarına ulaşabileceği, maçları daha bilinçli okuyabileceği ve takımın gelişimini sezon boyunca takip edebileceği bir analiz merkezi oluşturmak.
            </p>

            <div className="space-y-3">
              {[
                "Maçları daha anlaşılır hale getirmek",
                "Taraftar tartışmasını seviyeli ve üretken tutmak",
                "Transfer gündemine daha rasyonel bakmak",
                "Oyuncu performanslarını bağlam içinde değerlendirmek",
                "Fenerbahçe etrafında bağımsız bir analiz arşivi oluşturmak"
              ].map((bullet, idx) => (
                <div key={idx} className="flex gap-2.5 items-center text-xs font-semibold text-slate-300">
                  <span className="w-5 h-5 rounded-full bg-fb-yellow/10 text-fb-yellow flex items-center justify-center text-[10px] font-mono font-black shrink-0">✓</span>
                  <span>{bullet}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="md:col-span-2 p-8 rounded-3xl bg-fb-card border border-white/[0.08] text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-fb-yellow/10 text-fb-yellow flex items-center justify-center mx-auto">
              <Target size={24} />
            </div>
            <h4 className="text-xs font-black text-white uppercase tracking-wider">NEDEN FENERBAHÇE EVRENİ?</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Çünkü futbol sadece 90 dakikadan ibaret değıl. Saha dışında kurulan taktik disiplinler ve camianın rasyonel desteği şampiyonlukların en büyük tetikleyicisidir.
            </p>
          </div>

        </div>
      </section>

      {/* 5. EDITORIAL PRINCIPLES */}
      <section className="py-16 md:py-24 border-b border-white/[0.04]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-fb-yellow block mb-2 font-mono">ÇİZGİMİZ</span>
            <h2 className="text-2xl md:text-4xl font-display font-black text-white italic uppercase tracking-wide">
              Yayın İlkelerimiz
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Duygu var, körlük yok",
                text: "Fenerbahçe’ye tutkuyla bakarız; ama analiz yaparken sadece duyguyla hareket etmeyiz. Gerçekleri görmek başarının tek anahtarıdır."
              },
              {
                title: "Eleştiri var, hakaret yok",
                text: "Oyuncu, teknik ekip ve yönetim tercihleri özgürce eleştirilebilir; fakat kişisel değer saldırısı ve hakaret çizgimiz içinde barınamaz."
              },
              {
                title: "Kaynak ve bağlam önemlidir",
                text: "Transfer, istatistik ve maç değerlendirmelerinde tamamen bağlamlı, analitik verilere uygun ve somut kaynaklı ilerlemeye azami gayret ederiz."
              },
              {
                title: "Skor değil, oyun da önemlidir",
                text: "Her zaman galibiyet veya mağlubiyet tek başına yeterli açıklama değildir. Oyun kalitesi, gelişim ve taktik sistem bizim için ana esastır."
              },
              {
                title: "Taraftar aklı değerlidir",
                text: "Anketler, taraftar odası yorumları ve topluluk katılımı bu bağımsız yapının rütbeli ve en kıymetli parçasıdır."
              },
              {
                title: "Bağımsızlık korunur",
                text: "Platformumuzun tüm ticari sponsorlukları veya afiliye reklamları açıkça belirtilmeli, yayın yönümüzü kesinlikle esir alamamalıdır."
              }
            ].map((principle, idx) => (
              <div 
                key={idx} 
                className="p-6 rounded-2xl bg-fb-card/50 hover:bg-fb-card transition-all border border-white/[0.04] text-left space-y-3"
              >
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-fb-yellow/10 premium-mono font-mono font-bold text-[11px] text-fb-yellow flex items-center justify-center">
                    0{idx + 1}
                  </span>
                  <h4 className="text-xs font-black text-white uppercase tracking-wider">{principle.title}</h4>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed font-semibold">{principle.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. CONTENT TYPES SECTION */}
      <section className="py-16 md:py-24 border-b border-white/[0.04] bg-fb-card/20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-fb-yellow block mb-2 font-mono">PORTFÖY HAVUZU</span>
            <h2 className="text-2xl md:text-4xl font-display font-black text-white italic uppercase tracking-wide">
              Hangi içerikleri üretiyoruz?
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                title: "Maç Önü Analizleri",
                desc: "Gelecek rakibin zayıf ve güçlü noktaları, muhtemel 11'ler, taktik riskler ve teknik heyetin muhtemel maç planı analizleri."
              },
              {
                title: "Maç Sonu Raporları",
                desc: "Kırılma anları, oyuncu performans karneleri, teknik heyetin hamle değerlendirmeleri ve istatistik şemaları."
              },
              {
                title: "Transfer Radar",
                desc: "Söylentisi çıkan oyuncuların yaş, maliyet, uyum, fayda rasyosu ve fit score parametreleriyle derinlikli scout raporları."
              },
              {
                title: "Oyuncu Performansları",
                desc: "Isı haritaları, son maç puan durumları ve sezon içi form trendlerini takip eden düzenli performans matrisleri."
              },
              {
                title: "Taraftar Anketleri",
                desc: "Topluluk oylamaları, predictor şampiyonluk yüzde tahminleri ve haftalık nabız ölçme bültenleri."
              },
              {
                title: "Premium Raporlar",
                desc: "Kapsamlı ve detaylı analizler, özel scout arşiv bültenleri ve yüksek kalitede indirilebilir PDF kitapçık dosyaları."
              }
            ].map((content, idx) => (
              <div 
                key={idx} 
                className="p-6 rounded-2xl bg-fb-card border border-white/[0.05] hover:border-fb-yellow/10 transition-all text-left flex gap-4"
              >
                <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-fb-yellow shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-black text-white uppercase">{content.title}</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-semibold">{content.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. MONETIZATION TRANSPARENCY SECTION */}
      <section className="py-16 md:py-24 border-b border-white/[0.04]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-fb-yellow block mb-2 font-mono">DÜRÜST FİNANS</span>
            <h2 className="text-2xl md:text-3xl font-display font-black text-white italic uppercase tracking-wide">
              Gelir modeli ve şeffaflık
            </h2>
            <p className="text-xs text-fb-muted mt-3 max-w-2xl mx-auto leading-relaxed">
              Fenerbahçe Evreni’nin sürdürülebilir olması ve sunucu/veri altyapı maliyetlerinin karşılanması amacıyla ileride premium üyelik, bülten sponsorluğu, reklam alanları ve iş birlikleri kullanılabilir. Ancak bu gelir modelleri platformun bağımsız yayın çizgisini zedelememelidir.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pb-8">
            {[
              { title: "Premium Üyelik", desc: "Arşiv kilit açma destekleri" },
              { title: "Sponsorlu İçerik", desc: "Açıkça beyan edilen sponsorluklar" },
              { title: "Reklam Alanları", desc: "Kullanıcı dostu banner alanları" },
              { title: "Bülten Destekleri", desc: "E-posta bülten sponsorları" }
            ].map((p, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-fb-card border border-white/[0.04] text-center space-y-1">
                <DollarSign className="w-5 h-5 text-fb-yellow mx-auto mb-1.5" />
                <h4 className="text-xs font-black text-white uppercase">{p.title}</h4>
                <p className="text-[10px] text-fb-muted font-bold">{p.desc}</p>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-fb-yellow/5 border border-fb-yellow/25 text-[10px] text-slate-300 font-bold max-w-2xl mx-auto text-center">
            📌 “Sponsorlu veya iş birliği içeren her türlü içerik ve reklam bu platformda okuyucularımıza açıkça belirtilecektir.”
          </div>
        </div>
      </section>

      {/* 8. INDEPENDENCE DISCLAIMER SECTION */}
      <section className="py-12 bg-[#0c1223]/40 border-b border-white/[0.04]">
        <div className="max-w-4xl mx-auto px-6">
          <div className="p-8 rounded-3xl border border-fb-yellow/20 bg-fb-card flex flex-col md:flex-row items-center gap-6 text-left relative overflow-hidden">
            <div className="absolute top-0 right-10 -translate-y-1/2 px-3 py-0.5 rounded-full bg-fb-yellow text-fb-navy font-black text-[9px] uppercase tracking-widest leading-none">
              ÖNEMLİ DUYURU
            </div>
            <div className="w-12 h-12 rounded-full bg-fb-yellow/10 text-fb-yellow flex items-center justify-center shrink-0">
              <Info className="w-6 h-6 shrink-0" />
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-black text-white uppercase tracking-wider">BAĞIMSIZLIK NOTU</h4>
              <p className="text-xs text-slate-300 leading-relaxed font-semibold">
                {siteSettings.disclaimerText || "Fenerbahçe Evreni, bağımsız bir taraftar ve analiz platformudur. Fenerbahçe Spor Kulübü ile resmî bir bağı yoktur. Platformda yer alan yorum, analiz ve değerlendirmeler bağımsız içerik üretimi kapsamında hazırlanır."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 9. CONTACT / COLLABORATION CTA & FORM */}
      <section className="py-16 md:py-24 border-b border-white/[0.04] bg-fb-card/5">
        <div className="max-w-4xl mx-auto px-6 grid md:grid-cols-2 gap-10">
          
          <div className="text-left space-y-6">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-fb-yellow block font-mono">BİZİMLE ÇALIŞIN</span>
            <h2 className="text-2xl md:text-3xl font-display font-black text-white italic uppercase tracking-wide">
              İletişim ve iş birlikleri
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed font-semibold">
              Öneri, geri bildirim, sponsorlu analiz çalışmaları veya iş birliği talepleri için aşağıdaki formu kullanarak bizimle doğrudan iletişime geçebilirsin. En geç 48 saat içerisinde geri dönüş yapıyoruz.
            </p>

            <div className="space-y-4 pt-4 text-xs font-semibold text-slate-300">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-fb-yellow shrink-0">
                  <Mail size={14} />
                </div>
                <div>
                  <div className="text-[10px] text-fb-muted font-bold">REKTÖR E-POSTA ADRESİ</div>
                  <div className="text-white font-mono font-bold mt-0.5">{siteSettings.contactEmail || "iletisim@fenerbahceevreni.com"}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-fb-yellow shrink-0">
                  <Terminal size={14} />
                </div>
                <div>
                  <div className="text-[10px] text-fb-muted font-bold">SOSYAL MEDYA KÜNYESİ</div>
                  <div className="text-white font-bold mt-0.5">Twitter / X: @FenerEvreni</div>
                </div>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap gap-3">
              <button 
                onClick={() => {
                  const formEl = document.getElementById('contact-form-anchor');
                  formEl?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }}
                className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-all border border-white/10"
              >
                Hızlı Formla İlet
              </button>
              <button 
                onClick={() => onNavigate('bulten')}
                className="px-5 py-2.5 bg-fb-yellow hover:bg-white text-fb-navy font-black text-[10px] uppercase tracking-widest rounded-xl transition-all"
              >
                Premium Listesine Katıl
              </button>
            </div>
          </div>

          <div id="contact-form-anchor" className="p-6 rounded-2xl bg-fb-card border border-white/[0.08] text-left">
            <h3 className="text-xs font-black text-white uppercase tracking-wider mb-4 pb-2 border-b border-white/5">İletişim Formu</h3>

            {contactSuccess ? (
              <div className="p-6 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-center space-y-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center mx-auto font-black">
                  ✓
                </div>
                <h4 className="text-xs font-black text-white uppercase">Mesajınız Alındı!</h4>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  İletişim talebiniz başarıyla kaydedilmiştir. En kısa sürede yanıtlayacağız.
                </p>
                <button 
                  onClick={() => setContactSuccess(false)}
                  className="text-[10px] font-black text-fb-yellow hover:underline block mx-auto pt-1 uppercase"
                >
                  Yeni Bir Mesaj Gönder
                </button>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-black uppercase text-slate-400">Adınız Soyadınız *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Adınız"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full px-3 py-2 bg-fb-dark border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-fb-yellow font-semibold"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-black uppercase text-slate-400 font-mono">E-posta Adresiniz *</label>
                  <input 
                    type="email" 
                    required
                    placeholder="ornek@domain.com"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-fb-dark border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-fb-yellow font-mono"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-black uppercase text-slate-400">Mesajınız / Talebiniz *</label>
                  <textarea 
                    required
                    rows={4}
                    placeholder="Sponsorluk, yazar başvurusu veya teknik geri bildiriminizi buraya yazabilirsiniz..."
                    value={contactMsg}
                    onChange={(e) => setContactMsg(e.target.value)}
                    className="w-full px-3 py-2 bg-fb-dark border border-white/10 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-fb-yellow leading-relaxed"
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full py-3 bg-fb-yellow hover:bg-white text-fb-navy font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                >
                  {loading ? 'İletiliyor...' : 'GÖNDER / BİZE ULAŞTIR'}
                </button>
              </form>
            )}
          </div>

        </div>
      </section>

      {/* 10. FAQ SECTION */}
      <section className="py-16 md:py-24 max-w-4xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-fb-yellow block mb-2 font-mono">FAQ</span>
          <h2 className="text-2xl md:text-3xl font-display font-black text-white italic uppercase tracking-wide">
            Sık Sorulan Sorular
          </h2>
        </div>

        <div className="space-y-3 text-left">
          {faqs.map((f, idx) => (
            <div 
              key={idx} 
              className="rounded-2xl border border-white/[0.05] bg-fb-card/30 overflow-hidden"
            >
              <button 
                onClick={() => toggleFaq(idx)}
                className="w-full p-5 flex items-center justify-between text-left gap-4 font-black text-xs md:text-sm text-white hover:text-fb-yellow transition-colors cursor-pointer"
              >
                <span className="flex items-start gap-3">
                  <HelpCircle className="w-4 h-4 text-fb-yellow shrink-0 mt-0.5" />
                  <span>{f.q}</span>
                </span>
                <ChevronDown className={`w-4 h-4 text-fb-muted shrink-0 transition-transform ${faqOpen[idx] ? 'rotate-180 text-fb-yellow' : ''}`} />
              </button>
              
              <AnimatePresence>
                {faqOpen[idx] && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-white/[0.03]"
                  >
                    <p className="p-5 text-xs text-slate-300 leading-relaxed bg-[#0c1223]/25">
                      {f.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};

// Beautiful vector icons to prevent importing missing things
const XCircleIcon = () => (
  <span className="w-5 h-5 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center text-[9px] font-black shrink-0 font-mono">✕</span>
);
