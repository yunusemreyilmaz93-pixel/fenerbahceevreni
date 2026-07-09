import React, { useState, useRef } from 'react';
import {
  motion, AnimatePresence } from 'motion/react';
import SEO from './SEO';
import { 
  Mail, 
  CheckCircle2, 
 
  BookOpen, 
  TrendingUp, 
  UserCheck, 
  Award, 
  Bookmark, 
  Lock, 
  AlertCircle,
  HelpCircle,
  Clock,
  Shield,
  ChevronRight,
  ArrowRight,
  Star,
} from 'lucide-react';
import { subscribeToNewsletter } from '../../lib/newsletterService';

interface BultenPageProps {
  onNavigate: (view: string) => void;
}

const BultenPage: React.FC<BultenPageProps> = ({ onNavigate }) => {
  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Custom Toast visual feedback
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const formRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 4000);
  };

  const interestOptions = [
    'Maç analizleri',
    'Transfer dosyaları',
    'Oyuncu performansları',
    'Taraftar anketleri',
    'Premium içerikler'
  ];

  const handleToggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(prev => prev.filter(item => item !== interest));
    } else {
      setSelectedInterests(prev => [...prev, interest]);
    }
  };

  const handleSubscribeForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      showToast('Lütfen geçerli bir e-posta adresi girin.', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await subscribeToNewsletter(email, name, 'newsletter-page', selectedInterests);
      
      if (res.success) {
        setSuccess(true);
        showToast(res.message, 'success');
        setName('');
        setEmail('');
        setSelectedInterests([]);
      } else {
        showToast(res.message, 'error');
      }
    } catch (err) {
      console.error('Subscription error:', err);
      showToast('Bir teknik hata oluştu. Lütfen tekrar deneyin.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const scrollToSection = (ref: React.RefObject<HTMLDivElement | null>) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-[#070b13] text-slate-100 flex flex-col pt-24 pb-16 relative overflow-hidden">
      <SEO 
        title="Bülten | Fenerbahçe Evreni"
        description="Haftalık Fenerbahçe Evreni Bülteni'ne katılın; maç taktik analizleri, transfer radarları, oyuncu performansları ve taraftarın nabzı e-postanıza gelsin!"
        canonical="https://fenerbahceevreni.com/bulten"
      />
      
      {/* Background Ambience Grid and Glows */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:32px_32px]" />
      <div className="absolute top-[10%] left-1/4 w-[400px] h-[400px] bg-fb-yellow/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-1/4 w-[500px] h-[500px] bg-fb-navy/30 rounded-full blur-[160px] pointer-events-none" />

      {/* Floating Notification Toast */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-24 right-6 z-[999] px-5 py-3.5 rounded-xl border font-bold text-xs uppercase tracking-wide shadow-2xl flex items-center gap-2.5 backdrop-blur-md ${
              toastMsg.type === 'success' 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
            }`}
          >
            {toastMsg.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{toastMsg.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="container mx-auto px-6 relative z-10 max-w-7xl flex-1 flex flex-col space-y-20">
        
        {/* 1. Page Hero Section */}
        <section className="text-center max-w-4xl mx-auto space-y-8 pt-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-fb-yellow/10 border border-fb-yellow/20 text-fb-yellow text-[10px] font-black uppercase tracking-wider">
              <Mail className="w-3.5 h-3.5" /> HAFTALIK ÖZEL ANALİZ AKIŞI
            </span>
            <h1 className="text-3xl md:text-5xl font-display font-black tracking-tight text-white uppercase italic leading-none">
              HAFTALIK FENERBAHÇE EVRENİ BÜLTENİ
            </h1>
            <p className="text-sm md:text-base text-fb-muted max-w-3xl mx-auto leading-relaxed font-semibold">
              Maç notları, taktik analizler, transfer radarları, oyuncu performansları ve taraftarın nabzı haftada bir e-postana gelsin.
            </p>
          </motion.div>

          {/* Hero badges */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-2 max-w-2xl mx-auto"
          >
            {[
              'Maç Notları',
              'Transfer Radar',
              'Oyuncu Formu',
              'Taraftar Anketleri',
              'Premium Duyuruları',
              'Haftalık Özet'
            ].map((badge, idx) => (
              <span 
                key={idx} 
                className="text-[10px] sm:text-xs font-black px-3.5 py-1.5 bg-[#0f172a] hover:bg-[#1e293b] border border-white/5 rounded-full text-slate-100 transition-colors"
              >
                # {badge}
              </span>
            ))}
          </motion.div>

          {/* Hero CTAs */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <button
              onClick={() => scrollToSection(formRef)}
              className="w-full sm:w-auto px-8 py-4 bg-fb-yellow hover:bg-white text-fb-navy font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-[0_4px_25px_rgba(255,210,31,0.25)] flex items-center justify-center gap-2 group cursor-pointer"
            >
              Bültene Katıl <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => scrollToSection(previewRef)}
              className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 font-black text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              Örnek Bülteni Gör
            </button>
          </motion.div>
        </section>

        {/* 2. Newsletter Signup Form Container */}
        <section ref={formRef} className="max-w-xl mx-auto w-full">
          <div className="p-8 rounded-3xl bg-fb-card border border-white/[0.06] relative overflow-hidden shadow-2xl bg-gradient-to-br from-fb-card to-[#0d1424]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-fb-yellow/5 rounded-full blur-[40px] pointer-events-none" />
            
            <div className="text-center space-y-2 mb-6">
              <h2 className="text-lg font-black text-white uppercase tracking-wider">Hemen Abone Ol</h2>
              <p className="text-xs text-fb-muted font-semibold">Taktik ve scout analizlerini kaçırmamak için formu doldur.</p>
            </div>

            <AnimatePresence mode="wait">
              {!success ? (
                <motion.form key="form-main" onSubmit={handleSubscribeForm} className="space-y-5">
                  <div className="space-y-1 text-left">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-300 pl-1">Ad Soyad (İsteğe Bağlı)</label>
                    <input 
                      type="text"
                      placeholder="Örn: Yunus Emre"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg bg-fb-dark border border-white/10 text-white placeholder:text-fb-muted focus:outline-none focus:border-fb-yellow text-xs font-semibold"
                    />
                  </div>

                  <div className="space-y-1 text-left">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-300 pl-1">E-Posta Adresi (Zorunlu)</label>
                    <input 
                      type="email"
                      required
                      placeholder="Örn: adiniz@domain.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg bg-fb-dark border border-white/10 text-white placeholder:text-fb-muted focus:outline-none focus:border-fb-yellow text-xs font-semibold"
                    />
                  </div>

                  <div className="space-y-2 text-left pt-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-300 pl-1 block">İlgi Alanların (Çoklu Seçim)</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {interestOptions.map((interest) => {
                        const isSelected = selectedInterests.includes(interest);
                        return (
                          <button
                            type="button"
                            key={interest}
                            onClick={() => handleToggleInterest(interest)}
                            className={`px-3 py-2.5 rounded-lg border text-left text-xs font-bold transition-all flex items-center justify-between ${
                              isSelected 
                                ? 'bg-fb-yellow/10 border-fb-yellow text-fb-yellow'
                                : 'bg-[#090e1a] border-white/5 text-slate-400 hover:border-white/10'
                            }`}
                          >
                            <span>{interest}</span>
                            <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center text-[8px] ${
                              isSelected ? 'bg-fb-yellow text-fb-navy border-fb-yellow' : 'border-white/20'
                            }`}>
                              {isSelected && '✓'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-fb-yellow hover:bg-white text-fb-navy font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-[0_4px_20px_rgba(255,210,31,0.2)] disabled:opacity-50 cursor-pointer text-center block"
                  >
                    {loading ? 'KAYDEDİLİYOR...' : 'BÜLTENE KATIL'}
                  </button>
                </motion.form>
              ) : (
                <motion.div 
                  key="success-state"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center flex flex-col items-center space-y-3 py-8"
                >
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <CheckCircle2 size={24} />
                  </div>
                  <h3 className="text-base font-black text-white uppercase tracking-wider">Abonelik Tamamlandı!</h3>
                  <p className="text-slate-300 text-xs font-semibold leading-relaxed max-w-sm">
                    Bültene katıldın. İlk sayıda görüşürüz. Artık hiçbir taktik dosyayı ve kilit scout analizini kaçırmayacaksın.
                  </p>
                  <button 
                    onClick={() => setSuccess(false)}
                    className="text-xs font-bold text-fb-yellow underline pt-2 cursor-pointer hover:text-white"
                  >
                    Başka Bir E-posta Ekle
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* 3. What You Get Section */}
        <section className="space-y-10 text-left">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <h2 className="text-2xl font-display font-black text-white uppercase tracking-tight italic">
              BÜLTENDE NE OLACAK?
            </h2>
            <p className="text-xs text-fb-muted font-semibold">Taktik dünyasının özenle seçilmiş ve işlenmiş özet verileri haftada bir inbox'ınızda.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: BookOpen,
                color: 'text-fb-yellow bg-fb-yellow/10',
                title: 'Haftanın maç notları',
                text: 'Maç önü ve maç sonu öne çıkan taktik detaylar.'
              },
              {
                icon: Award,
                color: 'text-blue-400 bg-blue-400/10',
                title: 'Transfer Radar özeti',
                text: 'Gündemdeki oyunculara dair kısa ama net uyum değerlendirmeleri.'
              },
              {
                icon: TrendingUp,
                color: 'text-emerald-400 bg-emerald-400/10',
                title: 'Oyuncu form takibi',
                text: 'Kim yükselişte, kim düşüşte, kim kritik rol üstleniyor?'
              },
              {
                icon: UserCheck,
                color: 'text-purple-400 bg-purple-400/10',
                title: 'Taraftarın nabzı',
                text: 'Anket sonuçları, maç tahminleri ve haftanın tartışma başlıkları.'
              },
              {
                icon: Star,
                color: 'text-pink-400 bg-pink-400/10',
                title: 'Premium ön izlemeler',
                text: 'Detaylı raporların kısa özetleri ve premium duyuruları.'
              },
              {
                icon: Bookmark,
                color: 'text-amber-500 bg-amber-500/10',
                title: 'Haftanın 5 notu',
                text: 'Fenerbahçe gündemine dair kısa, okunabilir ve seçilmiş notlar.'
              }
            ].map((item, idx) => (
              <div 
                key={idx}
                className="p-6 rounded-2xl bg-fb-card border border-white/[0.04] hover:border-white/10 transition-all space-y-4 hover:translate-y-[-2px] duration-300"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.color}`}>
                  <item.icon size={20} />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-sm font-black text-white uppercase tracking-wide">{item.title}</h3>
                  <p className="text-xs text-slate-400 font-semibold leading-relaxed">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 4. Sample Newsletter Preview */}
        <section ref={previewRef} className="space-y-10">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <h2 className="text-2xl font-display font-black text-white uppercase tracking-tight italic">
              ÖRNEK BÜLTEN KONSEPTİ
            </h2>
            <p className="text-xs text-fb-muted font-semibold">Tasarım ve içerik yönünden gelen kutunuza ulaşacak mailin prototipi.</p>
          </div>

          <div className="max-w-3xl mx-auto rounded-2xl bg-[#0b101f] border border-white/[0.08] shadow-2xl p-6 sm:p-10 space-y-8 text-left relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-fb-yellow" />
            
            {/* Newsletter Fake Header */}
            <div className="border-b border-white/[0.06] pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[9px] font-black text-fb-yellow uppercase tracking-widest block mb-1">FENERBAHÇE EVRENİ HAFTALIK BÜLTEN</span>
                <h3 className="text-base sm:text-lg font-black text-white leading-tight font-sans">
                  Konu: Fenerbahçe’de merkez denge, transfer ihtiyacı ve haftanın oyuncusu
                </h3>
              </div>
              <div className="shrink-0 flex items-center gap-1.5 text-xs text-slate-400 font-bold bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                <Clock size={13} className="text-fb-yellow" /> Her Perşembe • 10:00
              </div>
            </div>

            {/* Newsletter Fake Body Content */}
            <div className="space-y-8 text-xs text-slate-300 leading-relaxed font-sans font-semibold">
              <p className="text-sm text-white italic">
                Merhaba Sarı Kanarya sevdalısı! Bu hafta Kadıköy'deki taktiksel yerleşimimizi, transfer radarımızdaki son gelişmeleri ve taraftarın sesini tek bir bültende derledik. İşte bu haftanın kritik notları...
              </p>

              {/* Sample sections */}
              <div className="space-y-6">
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                  <h4 className="text-xs font-black text-[#FFD21F] uppercase tracking-wider flex items-center gap-1.5">
                    <span className="flex h-1.5 w-1.5 rounded-full bg-fb-yellow" /> 1. HAFTANIN MAÇ NOTU
                  </h4>
                  <p className="text-xs text-slate-300">
                    Fenerbahçe’nin son maçında tempo sorunu skorun ötesinde merkez yerleşimiyle doğrudan ilişkiliydi. Ön alan pres çizgimiz çok ilerde kurulduğu için rakip orta sahada geniş boşluklar yakaladı.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                  <h4 className="text-xs font-black text-[#FFD21F] uppercase tracking-wider flex items-center gap-1.5">
                    <span className="flex h-1.5 w-1.5 rounded-full bg-fb-yellow" /> 2. TRANSFER RADAR
                  </h4>
                  <p className="text-xs text-slate-300">
                    6 numara profili hâlâ kadro mühendisliğinin en kritik başlığı olarak görünüyor. Mevcut yapı içerisinde oyun kurucu meziyetleri yüksek olan dinamik bir ön liberonun sisteme katkısı hayati önem taşıyor.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                  <h4 className="text-xs font-black text-[#FFD21F] uppercase tracking-wider flex items-center gap-1.5">
                    <span className="flex h-1.5 w-1.5 rounded-full bg-fb-yellow" /> 3. OYUNCU FORMU
                  </h4>
                  <p className="text-xs text-slate-300">
                    Orta sahada pres direnci ve ilk pas kalitesiyle öne çıkan oyuncular haftanın belirleyici isimleri oldu. Fred'in sahadaki hareketliliği hücum aksiyonlarımıza akıcılık kazandırırken takımı ayakta tuttu.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                  <h4 className="text-xs font-black text-[#FFD21F] uppercase tracking-wider flex items-center gap-1.5">
                    <span className="flex h-1.5 w-1.5 rounded-full bg-fb-yellow" /> 4. TARAFTARIN NABZI
                  </h4>
                  <p className="text-xs text-slate-300">
                    Haftanın anketinde taraftarların büyük bölümü en acil ihtiyacı merkez orta saha olarak görüyor. Kadronun derinliği arttıkça teknik heyetin taktik rotasyonlarında taraftar güven endeksi %85 seviyesine tırmandı.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                  <h4 className="text-xs font-black text-[#FFD21F] uppercase tracking-wider flex items-center gap-1.5">
                    <span className="flex h-1.5 w-1.5 rounded-full bg-fb-yellow" /> 5. PREMIUM NOT
                  </h4>
                  <p className="text-xs text-slate-300 flex-1">
                    Detaylı maç raporunda oyuncu puanları ve kırılma anı analizi yer aldı. Bu haftanın premium sol bek ısı analizi PDF haritası tüm destekçilerimizin erişimine açıldı.
                  </p>
                </div>
              </div>
            </div>

            {/* Newsletter Fake Footer CTA */}
            <div className="border-t border-white/[0.06] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-[10px] text-fb-muted font-bold">İlk bülteni kaçırmamak için hemen kaydolun.</span>
              <button
                onClick={() => scrollToSection(formRef)}
                className="px-5 py-2.5 bg-fb-yellow text-fb-navy font-black text-[10px] uppercase tracking-wider rounded-lg hover:bg-white transition-all cursor-pointer"
              >
                Bültene Katıl
              </button>
            </div>
          </div>
        </section>

        {/* 5. Why Subscribe Section */}
        <section className="space-y-10 text-left">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <h2 className="text-2xl font-display font-black text-white uppercase tracking-tight italic">
              NEDEN ABONE OLMALISIN?
            </h2>
            <p className="text-xs text-fb-muted font-semibold">Fenerbahçe Evreni bülteninin vaat ettiği farklar ve güven garantisi.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              {
                title: 'Gündemi kaçırmazsın',
                desc: 'Hafta içinde öne çıkan analizleri tek yerde görürsün.'
              },
              {
                title: 'Daha düzenli takip',
                desc: 'Maçtan maça değişen duygular yerine sezonun genel gidişini izlersin.'
              },
              {
                title: 'Premium’dan önce haberdar olursun',
                desc: 'Premium içerikler ve erken erişim duyuruları önce bülten abonelerine gider.'
              },
              {
                title: 'Spam yok',
                desc: 'Sadece Fenerbahçe Evreni ile ilgili seçilmiş içerikler gönderilir.'
              }
            ].map((card, idx) => (
              <div 
                key={idx}
                className="p-5 rounded-2xl bg-fb-card border border-white/[0.04] flex gap-4 hover:border-white/10 transition-colors"
              >
                <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-500/20 text-[9px]">
                  ✓
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-black text-white uppercase tracking-wider">{card.title}</h4>
                  <p className="text-xs text-slate-400 font-semibold leading-relaxed">{card.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 6. Newsletter Frequency Section */}
        <section className="space-y-10 text-left">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <h2 className="text-2xl font-display font-black text-white uppercase tracking-tight italic">
              NE SIKLIKLA INBOX'INA GELİR?
            </h2>
            <p className="text-xs text-fb-muted font-semibold">Taktik ve scout analiz takvimimizin periyot detayları.</p>
          </div>

          <div className="max-w-4xl mx-auto bg-fb-card border border-white/[0.04] p-8 rounded-3xl grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-5 space-y-3">
              <h3 className="text-base font-black text-white uppercase tracking-wider">Hassas Gönderim Sıklığı</h3>
              <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                Bülten haftada bir gönderilecek şekilde planlanır. Önemli maçlar, derbiler veya özel rapor dönemlerinde ek özel sayılar hazırlanabilir. Sizi gereksiz maillerle boğmayız.
              </p>
            </div>
            <div className="md:col-span-7 grid grid-cols-2 gap-4">
              {[
                { title: 'Haftalık ana bülten', freq: 'Her Perşembe' },
                { title: 'Derbi özel sayısı', freq: 'Maç Önü / Sonu' },
                { title: 'Transfer özel sayısı', freq: 'Dönemlik Raporlar' },
                { title: 'Premium duyuruları', freq: 'Erken Erişim' }
              ].map((card, idx) => (
                <div 
                  key={idx}
                  className="p-4 rounded-2xl bg-fb-dark/80 border border-white/5 space-y-1.5 flex flex-col justify-center text-center hover:scale-[1.02] transition-transform"
                >
                  <span className="text-xs font-black text-white uppercase tracking-wide truncate">{card.title}</span>
                  <span className="text-[10px] text-fb-yellow font-bold tracking-wider">{card.freq}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 7. Privacy / Trust Note */}
        <section className="max-w-2xl mx-auto text-center rounded-2xl bg-white/[0.01] border border-white/[0.04] p-6 space-y-3">
          <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center justify-center gap-2">
            <Shield size={14} className="text-fb-yellow" /> E-POSTA GİZLİLİK GÜVENCESİ
          </h3>
          <p className="text-xs text-slate-400 font-semibold leading-relaxed max-w-xl mx-auto">
            E-posta adresin üçüncü taraflarla satılmaz veya paylaşılmaz. Fenerbahçe Evreni bağımsızlığına sadık kalır. Bülten aboneliğinden dilediğin an tek tıkla ayrılabilirsin.
          </p>
        </section>

        {/* 8. Final CTA */}
        <section className="text-center rounded-3xl bg-gradient-to-r from-fb-card via-[#0c1221] to-fb-card border border-white/[0.06] p-8 md:p-12 relative overflow-hidden max-w-4xl mx-auto space-y-6 shadow-2xl">
          <div className="absolute top-0 right-0 w-48 h-48 bg-fb-yellow/5 rounded-full blur-[60px] pointer-events-none" />
          
          <h2 className="text-xl md:text-3xl font-display font-black text-white uppercase tracking-tight italic">
            FENERBAHÇE’Yİ HAFTALIK ANALİZ BÜLTENİYLE TAKİP ET.
          </h2>
          <p className="text-xs md:text-sm text-fb-muted font-semibold max-w-2xl mx-auto">
            Maç notları, transfer radarları ve taraftar nabzı her hafta gelen kutunda. Bir sonraki sayı çıkmadan yerini al!
          </p>
          <div className="pt-2">
            <button
              onClick={() => {
                scrollToSection(formRef);
                const inputEl = document.querySelector('input[placeholder="Örn: adiniz@domain.com"]') as HTMLInputElement;
                if (inputEl) inputEl.focus();
              }}
              className="px-8 py-4 bg-fb-yellow hover:bg-white text-fb-navy font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-[0_4px_25px_rgba(255,210,31,0.25)] cursor-pointer"
            >
              Şimdi Bültene Katıl
            </button>
          </div>
        </section>

      </div>
    </div>
  );
};

export default BultenPage;
