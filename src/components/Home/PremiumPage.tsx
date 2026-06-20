import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import SEO from './SEO';
import { 
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  HelpCircle,
  TrendingUp,
  FileText,
  FileDown,
  Lock,
  ChevronDown,
  Check,
  UserCheck,
  Info,
  Layers,
  Search,
  BookOpen,
  Mail,
  Users,
  Target
} from 'lucide-react';
import { dbGetCollection, dbAddDocument } from '../../lib/dbService';
import { subscribeToNewsletter } from '../../lib/newsletterService';

interface PremiumPageProps {
  onNavigate: (view: string) => void;
}

export const PremiumPage: React.FC<PremiumPageProps> = ({ onNavigate }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [interest, setInterest] = useState('Hepsi');
  const [selectedPlan, setSelectedPlan] = useState('');
  const [latestPremiumPreviews, setLatestPremiumPreviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [faqOpen, setFaqOpen] = useState<{ [key: number]: boolean }>({ 0: true });
  const [showSampleReportModal, setShowSampleReportModal] = useState(false);

  // Form Ref to scroll to
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to top on load
    window.scrollTo({ top: 0, behavior: 'instant' });

    // Load actual Premium Previews from databases/local if available
    const getPreviews = async () => {
      try {
        const data = await dbGetCollection('premium');
        setLatestPremiumPreviews(data.filter(item => item.status === 'published'));
      } catch (e) {
        console.error("Error loaded premium previews: ", e);
      }
    };
    getPreviews();
  }, []);

  const scrollToForm = (planName?: string) => {
    if (planName) {
      setSelectedPlan(planName);
      // Auto assign suitable interest dropdown depending on clicked plan
      if (planName === 'Destekçi') setInterest('Hepsi');
      else if (planName === 'Analiz') setInterest('Maç raporları');
      else if (planName === 'Evren') setInterest('Hepsi');
    }
    
    // Smooth scroll to waitlist form
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      alert("Lütfen adınızı ve geçerli bir e-posta adresini giriniz.");
      return;
    }

    setLoading(true);

    try {
      const waitlistEntry = {
        name: name.trim(),
        email: email.trim(),
        planInterest: selectedPlan || 'Genel Premium İlgi',
        source: 'premium-page',
        interestDetail: interest,
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      // 1. Save to premiumWaitlist collection
      await dbAddDocument('premiumWaitlist', waitlistEntry);

      // 2. Also save email to newsletterSubscribers with source: premium-page as requested
      await subscribeToNewsletter(email.trim(), name.trim(), 'premium-page', ['Premium içerikler']);

      setSuccess(true);
      setName('');
      setEmail('');
    } catch (err) {
      console.error(err);
      alert("Bir hata oluştu, lütfen tekrar deneyiniz.");
    } finally {
      setLoading(false);
    }
  };

  const toggleFaq = (idx: number) => {
    setFaqOpen(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const faqs = [
    {
      q: "Premium şu an aktif mi?",
      a: "Şu an erken erişim listesi toplanıyor. Ödeme sistemi aktif edildiğinde listedeki kullanıcılara haber verilecek ve lansmana özel fiyatlardan yararlanmaları sağlanacaktır."
    },
    {
      q: "Premium içerikler neler olacak?",
      a: "Detaylı maç raporları, transfer radar dosyaları, oyuncu performans analizleri, rakip analizleri ve yüksek çözünürlüklü indirilebilir PDF rapor arşivi planlanıyor."
    },
    {
      q: "Ücretsiz içerikler devam edecek mi?",
      a: "Evet. Fenerbahçe Evreni’nde ücretsiz analizler, maç notları, predictor tahminleri ve taraftar odası etkileşimi her zaman devam edecek. Premium ise çok daha derinlikli, detaylı ve arşivlik analiz seviyesi isteyen taraftarlarımız için alternatif olarak sunulacaktır."
    },
    {
      q: "Ödeme ne zaman açılacak?",
      a: "İlk aşamada topluluk ilgisini ve talebini ölçüyoruz. Yeterli analitik kitleye ulaşıp altyapı hazırlıklarını tamamladığımızda, üyelik paneli ve güvenli ödeme kanalları aynı anda aktif edilecektir."
    },
    {
      q: "Bu platform resmi mi?",
      a: "Hayır. Fenerbahçe Evreni bağımsız bir taraftar ve taktik analiz platformudur. Fenerbahçe Spor Kulübü Derneği ya da bağlı şirketleri ile herhangi bir resmi organik veya ticari bağı bulunmamaktadır."
    }
  ];

  return (
    <div className="min-h-screen bg-fb-dark text-slate-100 overflow-hidden relative">
      <SEO 
        title="Premium | Fenerbahçe Evreni"
        description="Fenerbahçe Evreni Premium ile detaylı maç raporları, transfer dosyaları, oyuncu performans analizleri ve özel bültenlere erken erişim listesine katıl."
        canonical="https://fenerbahceevreni.com/premium"
      />
      
      {/* Dynamic Background Glows */}
      <div className="absolute top-[10%] left-[20%] w-[35rem] h-[35rem] rounded-full bg-fb-navy opacity-30 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[10%] w-[40rem] h-[40rem] rounded-full bg-fb-yellow/5 opacity-20 blur-[150px] pointer-events-none" />
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 md:pt-20 pb-16 md:pb-24 border-b border-white/[0.04]">
        <div className="max-w-6xl mx-auto px-6 text-center">
          
          {/* Top Brand Notification Pin */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-fb-yellow/10 border border-fb-yellow/20 text-[10px] text-fb-yellow font-black uppercase tracking-wider mb-6">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" /> ÖZEL BÜLTEN & ANALİZ KLÜBÜ
          </div>

          <h1 className="text-4xl md:text-6xl font-display font-black text-white italic uppercase tracking-tight leading-none mb-6">
            Fenerbahçe Evreni <span className="text-fb-yellow not-italic">Premium</span>
          </h1>

          <p className="text-slate-300 text-sm md:text-lg max-w-3xl mx-auto leading-relaxed mb-10 font-medium">
            Daha derin maç raporları, transfer dosyaları, oyuncu performans analizleri ve özel içeriklerle Fenerbahçe’yi yüzeyden değil, oyunun içinden takip et.
          </p>

          {/* Hero Badges */}
          <div className="flex flex-wrap justify-center gap-2.5 max-w-4xl mx-auto mb-12">
            {[
              "Detaylı Maç Raporları",
              "Transfer Radar Dosyaları",
              "Oyuncu Performans Analizleri",
              "PDF Arşivi",
              "Haftalık Özel Bülten",
              "Premium Topluluk"
            ].map((badge, i) => (
              <span 
                key={i} 
                className="px-3.5 py-2 rounded-xl bg-fb-card border border-white/[0.06] text-xs font-black text-slate-200 tracking-wide flex items-center gap-2 shadow-sm"
              >
                <Check className="w-3.5 h-3.5 text-fb-yellow" /> {badge}
              </span>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <button 
              onClick={() => scrollToForm()}
              className="w-full sm:w-auto px-8 py-4 bg-fb-yellow hover:bg-white text-fb-navy font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(255,176,32,0.15)] flex items-center justify-center gap-2"
            >
              <UserCheck size={16} /> Premium Listesine Katıl
            </button>
            <button 
              onClick={() => setShowSampleReportModal(true)}
              className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all border border-white/10 flex items-center justify-center gap-2"
            >
              <BookOpen size={16} /> Örnek Raporu Gör
            </button>
          </div>

          {/* Independent Platform Disclaimer Alert */}
          <div className="mt-12 p-3 max-w-2xl mx-auto rounded-xl bg-white/[0.02] border border-white/[0.05] text-[10px] text-fb-muted font-semibold flex items-center justify-center gap-2">
            <Info className="w-3.5 h-3.5 text-fb-yellow shrink-0" />
            <span>Fenerbahçe Evreni tamamen bağımsız bir taraftar platformudur. Kulüp logosu veya ticari marka barındırmaz.</span>
          </div>

        </div>
      </section>

      {/* 2. PROBLEM / VALUE SECTION */}
      <section className="py-16 md:py-24 border-b border-white/[0.04] bg-fb-card/25">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-fb-yellow block mb-3">ODAK NOKTASI</span>
            <h2 className="text-2xl md:text-4xl font-display font-black text-white italic uppercase tracking-wide mb-4">
              Normal haberlerden fazlasını isteyenler için
            </h2>
            <p className="text-sm text-fb-muted leading-relaxed">
              Fenerbahçe gündemi çoğu zaman son dakika haberleri, transfer söylentileri ve maç sonu tepkileriyle dolu. Premium tarafında ise amaç daha sakin, daha detaylı ve daha analitik bir bakış sunmak.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            
            {/* Card 1 */}
            <div className="p-8 rounded-2xl bg-fb-card border border-white/[0.05] hover:border-fb-yellow/20 transition-all flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-fb-yellow/10 flex items-center justify-center text-fb-yellow">
                  <FileText size={20} />
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-fb-yellow transition-colors font-display uppercase italic">
                  Yüzeysel yorum değil
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Maçları sadece skor üzerinden değil; oyun planı, oyuncu rolleri, baskı yapısı, blok kaymaları ve kırılma anları üzerinden değerlendiriyoruz.
                </p>
              </div>
              <div className="text-[10px] text-fb-muted font-bold uppercase tracking-wider pt-6">ANALİTİK MERCEK • 01</div>
            </div>

            {/* Card 2 */}
            <div className="p-8 rounded-2xl bg-fb-card border border-white/[0.05] hover:border-fb-yellow/20 transition-all flex flex-col justify-between group p-8 bg-gradient-to-br from-fb-card to-fb-navy/20">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-fb-yellow/10 flex items-center justify-center text-fb-yellow">
                  <Target size={20} />
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-fb-yellow transition-colors font-display uppercase italic">
                  Transfer söylentisi değil
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Oyuncuları ‘gelir mi gelmez mi’ seviyesinde değil; Fenerbahçe’ye rol, maliyet, risk ve taktik uyum açısından teknik parametrelerle analiz ediyoruz.
                </p>
              </div>
              <div className="text-[10px] text-fb-yellow font-black uppercase tracking-wider pt-6">VERİ ODAKLI • 02</div>
            </div>

            {/* Card 3 */}
            <div className="p-8 rounded-2xl bg-fb-card border border-white/[0.05] hover:border-fb-yellow/20 transition-all flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-fb-yellow/10 flex items-center justify-center text-fb-yellow">
                  <TrendingUp size={20} />
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-fb-yellow transition-colors font-display uppercase italic">
                  Taraftar tepkisi değil
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Duyguyu kaybetmeden ama sadece öfke veya heyecanla anlık hareket etmeden, daha dengeli ve rasyonel bir Fenerbahçe okuması sunuyoruz.
                </p>
              </div>
              <div className="text-[10px] text-fb-muted font-bold uppercase tracking-wider pt-6">RASYONEL ANALİZ • 03</div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. PREMIUM BENEFITS SECTION */}
      <section className="py-16 md:py-24 border-b border-white/[0.04]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-fb-yellow block mb-3">AVANTAJLARIMIZ</span>
            <h2 className="text-2xl md:text-4xl font-display font-black text-white italic uppercase tracking-wide">
              Premium’da neler olacak?
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Detaylı Maç Raporları",
                desc: "Her maçtan sonra maçın hikayesi, kırılma anları, taktik artılar/eksiler ve detaylandırılmış oyuncu puanları."
              },
              {
                title: "Transfer Radar Dosyaları",
                desc: "Gelişmiş oyuncu profilleri, scout analizleri, tahmini maliyet, taktiksel uyum katsayısı ve alternatif değerlendirmeler."
              },
              {
                title: "Oyuncu Performans Raporları",
                desc: "Form trend grafikleri, son maç ısı haritaları, güçlü yönler, zayıf noktalar ve oyuncunun sezon içi gelişim endeksi."
              },
              {
                title: "Rakip Analizleri",
                desc: "Büyük karşılaşmalardan önce rakip takımların oyun planları, kritik tehditleri, savunma açıkları ve ekibimizin muhtemel hamleleri."
              },
              {
                title: "PDF Analiz Arşivi",
                desc: "Hazırlanan detaylı raporları zengin grafiklerle PDF formatında cihazına indirme ve sezon boyu kişisel arşivinde saklama olanağı."
              },
              {
                title: "Haftalık Özel Bülten",
                desc: "Gözden kaçan taktiksel detaylar, scout ekiplerimizin yeni keşif notları ve sadece Premium üyelere özel haftalık futbol mektubu."
              }
            ].map((perf, idx) => (
              <div 
                key={idx} 
                className="p-6 rounded-2xl bg-fb-card/60 hover:bg-fb-card transition-all border border-white/[0.04] hover:border-white/10 flex gap-4"
              >
                <div className="w-8 h-8 rounded-lg bg-fb-yellow/5 text-fb-yellow flex items-center justify-center font-black text-xs shrink-0 border border-fb-yellow/10">
                  {idx + 1}
                </div>
                <div className="space-y-1.5">
                  <h4 className="text-sm font-black text-white uppercase">{perf.title}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{perf.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. SAMPLE PREMIUM REPORT SECTION */}
      <section className="py-16 md:py-24 border-b border-white/[0.04] bg-fb-card/10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-fb-yellow block mb-3">İNTERAKTİF ÖNSEZİ</span>
            <h2 className="text-2xl md:text-4xl font-display font-black text-white italic uppercase tracking-wide">
              Bir Premium raporda ne olur?
            </h2>
          </div>

          <div className="max-w-xl mx-auto rounded-3xl border border-white/[0.08] bg-fb-card overflow-hidden shadow-2xl relative">
            
            {/* Header banner */}
            <div className="bg-gradient-to-r from-fb-navy to-fb-dark/80 p-6 border-b border-white/5 flex justify-between items-center">
              <div>
                <span className="px-2 py-0.5 rounded bg-fb-yellow/10 border border-fb-yellow/20 text-[9px] font-black text-fb-yellow uppercase tracking-wider">MOCK PREVIEW</span>
                <h3 className="text-sm font-black text-white uppercase mt-1">Fenerbahçe 2-1 Rakip | Detaylı Maç Raporu</h3>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-fb-muted font-bold">
                <FileText className="w-4 h-4 text-fb-yellow" /> PDF Raporu (.pdf)
              </div>
            </div>

            {/* Checklist Structure with Blur simulation */}
            <div className="p-6 space-y-4">
              
              <div className="space-y-2.5">
                {[
                  "Maçın kısa hikayesi ve rasyonel özeti",
                  "İlk 15 dakika yüksek ön alan baskısı ve pas blokaj grafikleri",
                  "Mourinho orta saha yerleşiminde Fred ve Amrabat kanalları",
                  "Hücumda kanat bağlantıları ve arka direk bindirme istatistikleri",
                  "Savunma geçişleri ve rakipten kazanılan topların dağılım şeması"
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-2.5 items-center text-xs text-slate-300 font-semibold">
                    <span className="w-4 h-4 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-[10px] font-black">✓</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              {/* Locked transition zone */}
              <div className="relative pt-2">
                
                {/* Simulated blurred items */}
                <div className="space-y-2.5 opacity-35 filter blur-[2px] pointer-events-none select-none">
                  {[
                    "Kişiselleştirilmiş oyuncu form ve taktik puan cetvelleri",
                    "Teknik ekibin oyun içi hamle kartları ve zamanlama grafiği",
                    "Geri dönüş ve kilit kırılma anı alan koordinat ısı dosyası",
                    "Gelecek derbi maçı için galibiyeti getirecek 5 taktik notu"
                  ].map((item, idx) => (
                    <div key={idx} className="flex gap-2.5 items-center text-xs text-slate-400">
                      <span className="w-4 h-4 rounded-full bg-slate-800 text-slate-500 flex items-center justify-center text-[10px] font-black">✓</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                {/* Secure overlay cover */}
                <div className="absolute inset-0 bg-gradient-to-t from-fb-card via-fb-card/90 to-transparent flex flex-col items-center justify-end pb-2 pt-6">
                  <div className="p-3 rounded-full bg-fb-navy border border-fb-yellow/20 text-fb-yellow mb-2 shadow-lg">
                    <Lock size={16} />
                  </div>
                  <p className="text-xs font-black text-white text-center uppercase tracking-wide">
                    Raporun tamamı Premium üyeler için.
                  </p>
                  <p className="text-[10px] text-fb-muted font-bold text-center mt-0.5">
                    Katılınca detaylı analiz grafikleri içeren 24 sayfalık PDF indirmeye açılır.
                  </p>
                </div>

              </div>

            </div>

            {/* Bottom Form Actions Inside Premium Teaser */}
            <div className="p-6 bg-fb-dark/40 border-t border-white/5 text-center">
              <button 
                onClick={() => setShowSampleReportModal(true)}
                className="px-6 py-3 bg-fb-yellow hover:bg-white text-fb-navy font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-md w-full"
              >
                Örnek Raporu Gör
              </button>
            </div>

          </div>

          {/* Show latest published premium files if present */}
          {latestPremiumPreviews.length > 0 && (
            <div className="mt-16 max-w-4xl mx-auto">
              <h3 className="text-xs font-black text-fb-yellow uppercase tracking-widest text-center mb-6">Yayındaki Güncel Premium Yayınlar</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {latestPremiumPreviews.map((p, i) => (
                  <div key={p.id || i} className="p-5 rounded-2xl bg-fb-card border border-white/[0.05] flex items-center gap-4 justify-between">
                    <div>
                      <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[8px] font-black text-slate-400 tracking-wider">PREMIUM PDF</span>
                      <h4 className="text-xs font-black text-white uppercase mt-1.5">{p.title}</h4>
                      <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{p.description}</p>
                    </div>
                    <button 
                      onClick={() => scrollToForm('Analiz')} 
                      className="p-2.5 rounded-xl bg-white/5 hover:bg-fb-yellow/20 text-slate-300 hover:text-fb-yellow border border-white/5 hover:border-fb-yellow/10 transition-all shrink-0 cursor-pointer"
                      title="Listeye Katıl"
                    >
                      <Lock size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </section>

      {/* 5. PRICING / PLAN INTEREST SECTION */}
      <section className="py-16 md:py-24 border-b border-white/[0.04]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-fb-yellow block mb-3">PLANYA SEÇENEKLERİ</span>
            <h2 className="text-2xl md:text-4xl font-display font-black text-white italic uppercase tracking-wide">
              Erken Erişim Fiyat Kartları
            </h2>
            <p className="text-xs text-fb-muted mt-2">Bu aşamada ödeme alınmamaktadır. İlgilendiğiniz planı işaretleyerek yerinizi ayırtın.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            
            {/* Plan 1 */}
            <div className="p-8 rounded-2xl bg-fb-card/50 border border-white/[0.04] flex flex-col justify-between hover:border-white/10 transition-all">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-black text-white uppercase tracking-wider">Destekçi</h3>
                  <p className="text-xs text-slate-400 mt-2">
                    Fenerbahçe Evreni’ni desteklemek ve özel bültene erişmek isteyenler.
                  </p>
                </div>

                <div className="pt-2">
                  <span className="text-3xl font-display font-black text-fb-yellow italic">YAKINDA</span>
                  <p className="text-[10px] font-bold text-fb-muted uppercase mt-1">Lansmanda Duyurulacak</p>
                </div>

                <div className="border-t border-white/5 pt-4 space-y-3">
                  {[
                    "Haftalık özel bülten",
                    "Premium içerik öncelikli erişim",
                    "Topluluk duyuruları ve bildirimler"
                  ].map((f, i) => (
                    <div key={i} className="flex gap-2 items-center text-xs font-semibold text-slate-300">
                      <Check className="w-3.5 h-3.5 text-fb-yellow" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-8">
                <button 
                  onClick={() => scrollToForm('Destekçi')}
                  className="w-full py-3 bg-white/5 hover:bg-white/10 text-white font-black text-xs uppercase tracking-widest rounded-xl border border-white/10 transition-all cursor-pointer"
                >
                  Bu Planla İlgileniyorum
                </button>
              </div>
            </div>

            {/* Plan 2 - Featured */}
            <div className="p-8 rounded-2xl bg-fb-card border-2 border-fb-yellow bg-gradient-to-b from-fb-card to-fb-navy/30 relative flex flex-col justify-between shadow-xl">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-fb-yellow text-fb-navy text-[9px] font-black uppercase tracking-wider shadow">
                EN MANTIKLI SEÇENEK
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-black text-white uppercase tracking-wider mt-1.5 flex items-center gap-2">
                    Analiz <Sparkles className="w-4 h-4 text-fb-yellow" />
                  </h3>
                  <p className="text-xs text-slate-300 mt-2">
                    Detaylı maç raporları ve transfer dosyaları isteyenler.
                  </p>
                </div>

                <div className="pt-2">
                  <span className="text-3xl font-display font-black text-fb-yellow italic">YAKINDA</span>
                  <p className="text-[10px] font-bold text-fb-mono uppercase text-white/70 mt-1">Lansmanda Duyurulacak</p>
                </div>

                <div className="border-t border-white/10 pt-4 space-y-3">
                  {[
                    "Detaylı maç raporları",
                    "Transfer radar dosyaları",
                    "Oyuncu performans analizleri",
                    "PDF analiz arşivi ve indirme izni"
                  ].map((f, i) => (
                    <div key={i} className="flex gap-2 items-center text-xs font-black text-slate-200">
                      <Check className="w-3.5 h-3.5 text-fb-yellow shrink-0" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-8">
                <button 
                  onClick={() => scrollToForm('Analiz')}
                  className="w-full py-3 bg-fb-yellow hover:bg-white text-fb-navy font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-[0_4px_15px_rgba(255,176,32,0.25)] cursor-pointer"
                >
                  Bu Planla İlgileniyorum
                </button>
              </div>
            </div>

            {/* Plan 3 */}
            <div className="p-8 rounded-2xl bg-fb-card/50 border border-white/[0.04] flex flex-col justify-between hover:border-white/10 transition-all">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-black text-white uppercase tracking-wider">Evren</h3>
                  <p className="text-xs text-slate-400 mt-2">
                    En kapsamlı içerik ve topluluk deneyimini isteyenler.
                  </p>
                </div>

                <div className="pt-2">
                  <span className="text-3xl font-display font-black text-fb-yellow italic">YAKINDA</span>
                  <p className="text-[10px] font-bold text-fb-muted uppercase mt-1">Lansmanda Duyurulacak</p>
                </div>

                <div className="border-t border-white/5 pt-4 space-y-3">
                  {[
                    "Tüm Premium içerikler",
                    "Rakip analizleri ve şablonları",
                    "Mourinho özel taktik raporları",
                    "Premium topluluk erişimi",
                    "Öncelikli anket ve predictor oylaması"
                  ].map((f, i) => (
                    <div key={i} className="flex gap-2 items-center text-xs font-semibold text-slate-300">
                      <Check className="w-3.5 h-3.5 text-fb-yellow" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-8">
                <button 
                  onClick={() => scrollToForm('Evren')}
                  className="w-full py-3 bg-white/5 hover:bg-white/10 text-white font-black text-xs uppercase tracking-widest rounded-xl border border-white/10 transition-all cursor-pointer"
                >
                  Bu Planla İlgileniyorum
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 6. PREMIUM WAITLIST FORM */}
      <section ref={formRef} id="waitlist-form-block" className="py-16 md:py-24 border-b border-white/[0.04] bg-fb-card/10 scroll-mt-28">
        <div className="max-w-xl mx-auto px-6">
          <div className="p-8 md:p-10 rounded-3xl bg-fb-card border border-white/[0.08] relative">
            <div className="absolute top-0 right-10 -translate-y-1/2 px-4 py-1 rounded-full bg-fb-yellow/10 border border-fb-yellow/20 text-[9px] text-fb-yellow font-black uppercase tracking-wider">
              KAYIT FORMU
            </div>

            <div className="text-center mb-8">
              <h2 className="text-2xl font-display font-black text-white italic uppercase tracking-wider">
                Premium Erken Erişim Listesine Katıl
              </h2>
              <p className="text-xs text-fb-muted mt-2 leading-relaxed">
                Premium açıldığında ilk haberdar olmak ve erken dönem lansman indirim sigortasından yararlanmak için listeye katıl.
              </p>
            </div>

            {success ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-4"
              >
                <div className="w-12 h-12 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center mx-auto text-xl font-bold">
                  ✓
                </div>
                <h4 className="text-sm font-black text-white uppercase">Sıranız Başarıyla Alındı!</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Premium listesine katıldın. Açılışta sana haber vereceğiz.
                </p>
                <div className="text-[10px] text-emerald-400 font-bold bg-emerald-500/5 px-3 py-1.5 rounded-lg inline-block">
                  En çok ilgilendiğin: <span className="font-black">{interest}</span> {selectedPlan && `| Seçtiğin Plan: ${selectedPlan}`}
                </div>
                <button 
                  onClick={() => setSuccess(false)}
                  className="text-[10px] font-black uppercase text-fb-yellow hover:underline block mx-auto pt-2"
                >
                  Yeni Bir Kayıt Bırak
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleWaitlistSubmit} className="space-y-4 text-left">
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400">Adınız Soyadınız *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Ad Soyad"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-fb-dark border border-white/10 text-xs text-white focus:outline-none focus:border-fb-yellow font-bold"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 font-mono">E-posta Adresiniz *</label>
                  <input 
                    type="email" 
                    required
                    placeholder="ornek@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-fb-dark border border-white/10 text-xs text-white focus:outline-none focus:border-fb-yellow font-mono"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400">En Çok İlgilendiğin İçerik Türü</label>
                  <select 
                    value={interest}
                    onChange={(e) => setInterest(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-fb-dark border border-white/10 text-xs text-white focus:outline-none focus:border-fb-yellow font-bold cursor-pointer"
                  >
                    <option value="Maç raporları">Maç Raporları</option>
                    <option value="Transfer dosyaları">Transfer Dosyaları</option>
                    <option value="Oyuncu analizleri">Oyuncu Analizleri</option>
                    <option value="Rakip analizleri">Rakip Analizleri</option>
                    <option value="Hepsi">Hepsi</option>
                  </select>
                </div>

                {selectedPlan && (
                  <div className="p-3 rounded-xl bg-fb-yellow/5 border border-fb-yellow/15 flex justify-between items-center text-[10px] text-fb-yellow font-bold">
                    <span>Tercih Edilen Plan: <span className="font-black uppercase">{selectedPlan}</span></span>
                    <button 
                      type="button" 
                      onClick={() => setSelectedPlan('')}
                      className="hover:text-white underline cursor-pointer"
                    >
                      Değiştir / Kaldır
                    </button>
                  </div>
                )}

                <div className="pt-2">
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full py-4 bg-fb-yellow hover:bg-white text-fb-navy font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    {loading ? 'Yol Alınıyor...' : 'Sıraya Katıl / Listeye Ekle'}
                  </button>
                </div>

              </form>
            )}
          </div>
        </div>
      </section>

      {/* 7. SOCIAL PROOF / TRUST SECTION */}
      <section className="py-16 md:py-24 border-b border-white/[0.04]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-fb-yellow block mb-3">GÜVEN VE İLTİMAS</span>
            <h2 className="text-2xl md:text-4xl font-display font-black text-white italic uppercase tracking-wide">
              Neden Premium mantıklı?
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "Düzenli format",
                text: "Her maçtan sonra benzer yapıda ve rasyonel formatta raporlar hazırlanacağı için genel sezon gelişimini kaçırmadan pratik takip edersin."
              },
              {
                title: "Daha derin analiz",
                text: "Skor, hakem, yönetim kavgaları ve genel anlık fırtınaların ötesinde tamamen oyunun kendisine, sahada çizilen şemalara bakılır."
              },
              {
                title: "Arşiv değeri",
                text: "Sezon içinde oyuncuların, Mourinho taktik formasyonlarının gelişimini geriye dönük veri setleri üzerinden karşılaştırmalı inceleyebilirsin."
              },
              {
                title: "Topluluk desteği",
                text: "Premium üyelik katkıları platformun teknik altyapısını güçlendirir ve bizlere daha kaliteli veri lisansları alma gücü sağlar."
              }
            ].map((card, idx) => (
              <div key={idx} className="p-6 rounded-2xl bg-fb-card border border-white/[0.04] space-y-3">
                <div className="w-8 h-8 rounded-full bg-fb-navy border border-white/5 flex items-center justify-center text-[10px] text-fb-yellow font-black">
                  0{idx + 1}
                </div>
                <h4 className="text-sm font-black text-white uppercase">{card.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{card.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. FAQ SECTION */}
      <section className="py-16 md:py-24 border-b border-white/[0.04] bg-fb-card/5">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-fb-yellow block mb-3 font-mono">FAQ</span>
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
                  className="w-full p-5 flex items-center justify-between text-left gap-4 font-bold text-xs md:text-sm text-white hover:text-fb-yellow transition-colors cursor-pointer"
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
                      <p className="p-5 text-xs text-slate-300 leading-relaxed bg-[#0c1223]/20">
                        {f.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. FINAL CTA SECTION */}
      <section className="py-20 md:py-28 relative">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-8 relative">
          <h2 className="text-3xl md:text-5xl font-display font-black text-white italic uppercase tracking-tight leading-tight">
            Fenerbahçe’yi daha derinden okumak istiyorsan listede yerini al.
          </h2>
          <p className="text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            Erken erişim kampanyası süresince listeye katılan taraftarlarımız, Premium altyapı lansmanında ömür boyu indirimli üyelik hakkı elde eder.
          </p>
          <div className="pt-4">
            <button 
              onClick={() => scrollToForm()}
              className="px-10 py-4 bg-fb-yellow hover:bg-white text-fb-navy font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-xl hover:scale-105 active:scale-95"
            >
              Premium Listesine Katıl
            </button>
          </div>
        </div>
      </section>

      {/* 10. SAMPLE PREMIUM REPORT MODAL OVERLAY */}
      <AnimatePresence>
        {showSampleReportModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-fb-dark/95 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-fb-card border border-white/10 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative"
            >
              
              {/* Header */}
              <div className="sticky top-0 bg-fb-card/95 backdrop-blur border-b border-white/5 p-6 flex justify-between items-center z-10">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-fb-yellow" />
                  <span className="font-display font-black text-white uppercase italic text-sm md:text-base">ÖRNEK PREMIUM MAÇ RAPORU PREVIEW</span>
                </div>
                <button 
                  onClick={() => setShowSampleReportModal(false)}
                  className="p-1 px-2.5 rounded bg-white/5 hover:bg-white/10 text-xs font-bold text-slate-400 hover:text-white"
                >
                  KAPAT
                </button>
              </div>

              {/* Sample Content */}
              <div className="p-6 md:p-8 space-y-6 text-left">
                
                <header className="border-b border-white/5 pb-4">
                  <span className="text-[9px] font-black text-fb-yellow tracking-widest block uppercase">Trendyol Süper Lig • Derbi Analizi</span>
                  <h2 className="text-lg md:text-xl font-display font-black text-white uppercase italic mt-1">Fenerbahçe 2-1 Rakip | Isı Haritalı ve Pas Koridorlu Taktik Rapor</h2>
                  <p className="text-[10px] text-fb-muted font-bold mt-1">Yazar: Fenerbahçe Evreni Analiz Ekibi • Süre: 24 sayfa PDF eki vardır</p>
                </header>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-xs font-black text-fb-yellow uppercase tracking-widest">1. Maçın Kısa Hikayesi</h3>
                    <p className="text-xs text-slate-300 leading-relaxed text-justify">
                      Karşılaşmaya klasik 4-2-3-1 ön alan baskısı ile başlayan sarı-lacivertlilerimiz, ilk 15 dakikada rakibin geriden kısa pasla çıkışlarını mükemmel kilitledi. Ancak derin bloktaki anlık yerleşim hatası sonucu yenen gol sonrası oyun Mourinho'nun kenar müdahaleleriyle re-organize edildi.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xs font-black text-fb-yellow uppercase tracking-widest">2. İlk 15 Dakika Baskı Analizi (Detay)</h3>
                    <p className="text-xs text-slate-300 leading-relaxed text-justify">
                      Ön grupta Szymański ve Edin Džeko rakip stoperlere gölge pres uygularken, Fred sol iç kulvara sızarak pas bağlantılarını tek tek yok etti. Bu periyotta kazanılan 6 topun 4'ü doğrudan rakip ceza yayı çevresi hücum asisti olarak taslaklandı.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-fb-navy/30 border border-fb-yellow/10 space-y-2">
                    <div className="text-[10px] font-black text-fb-yellow uppercase tracking-widest flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5" /> TAKTİKSEL DERİNLİK NOKTASI
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed italic">
                      "Fred'in orta saha ve hücum kurgusundaki dikey pas ve iç koridor bindirmeleri, rakip orta saha bloğunun kayma hızını tamamen düşürerek bizi sol kenarda Tadić ile birebir pozisyonlara çıkardı."
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xs font-black text-fb-yellow uppercase tracking-widest">3. Oyuncu Puan Cetveli (Rapor Özeti)</h3>
                    <div className="space-y-2">
                      <div className="p-2 rounded bg-white/5 flex justify-between items-center text-xs">
                        <span className="font-bold text-white">Dominik Livaković (GK)</span>
                        <span className="font-mono text-fb-yellow font-black">7.5 / 10</span>
                      </div>
                      <div className="p-2 rounded bg-white/5 flex justify-between items-center text-xs">
                        <span className="font-bold text-white">Fred (CM)</span>
                        <span className="font-mono text-fb-yellow font-black">9.2 / 10 - MOTM</span>
                      </div>
                      <div className="p-2 rounded bg-white/5 flex justify-between items-center text-xs">
                        <span className="font-bold text-white">Alexander Djiku (CB)</span>
                        <span className="font-mono text-fb-yellow font-black">8.0 / 10</span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Locked premium wall inside sample report */}
                <div className="p-6 rounded-2xl bg-[#0c1223] border border-[#FFB020]/20 space-y-4 text-center">
                  <div className="w-10 h-10 rounded-full bg-fb-yellow/10 text-fb-yellow flex items-center justify-center mx-auto">
                    <Lock size={16} />
                  </div>
                  <h4 className="text-xs font-black text-white uppercase tracking-wider">DEVAM EDEN 20 SAYFALIK ANALİZ KİLİTLİDİR</h4>
                  <p className="text-[11px] text-fb-muted leading-relaxed max-w-md mx-auto">
                    Isı Harita Şemaları, Oyuncu Geçiş Koordinatları ve Pas Kombinasyonu grafiklerini indirmek için erken erişim waitlist sırasına katılımınız gerekmektedir.
                  </p>
                  <button 
                    onClick={() => {
                      setShowSampleReportModal(false);
                      scrollToForm();
                    }}
                    className="px-5 py-2.5 bg-fb-yellow text-fb-navy font-black text-[10px] uppercase tracking-widest rounded-lg"
                  >
                    LİSTEYE KATIL VE KİLİDİ AÇ
                  </button>
                </div>

              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
