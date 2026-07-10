import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import SEO from './SEO';
import { 
  Mail, 
  MapPin, 
  Phone, 
  Send, 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  HelpCircle, 
  Briefcase, 
  DollarSign, 
  Globe, 
 
  MessageSquare,
  Users,
  Megaphone,
  Lightbulb,
  Check
} from 'lucide-react';
import { dbGetCollection } from '../../lib/dbService';
import { apiContactSubmit } from '../../lib/secureApi';

interface ContactPageProps {
  onNavigate: (view: string) => void;
  initialType?: string; // e.g. 'sponsor-reklam' or 'icerik-onerisi'
}

export const ContactPage: React.FC<ContactPageProps> = ({ onNavigate, initialType }) => {
  const [siteSettings, setSiteSettings] = useState<any>({
    contactEmail: "iletisim@fenerbahceevreni.com",
    twitterUrl: "https://x.com/BasitBiOyun",
    youtubeUrl: "https://www.youtube.com/@fenerbahcevreni",
    instagramUrl: "https://instagram.com"
  });

  // State hooks for Form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [messageType, setMessageType] = useState('genel'); // genel, geri-bildirim, icerik-onerisi, sponsor-reklam, is-birligi, premium
  const [message, setMessage] = useState('');
  
  // Conditionally visible fields
  const [companyName, setCompanyName] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [budgetRange, setBudgetRange] = useState('Belirtmek istemiyorum');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const formRef = useRef<HTMLDivElement>(null);

  // Load configuration and listen to initial type selection
  useEffect(() => {
    document.title = "İletişim | Fenerbahçe Evreni";

    const fetchConfig = async () => {
      try {
        const settings = await dbGetCollection('site_settings');
        if (settings && settings.length > 0) {
          setSiteSettings(settings[0]);
        }
      } catch (err) {
        console.error("Error loading site settings in Contact Page:", err);
      }
    };
    fetchConfig();
  }, []);

  // Set messageType if initialType prop changes
  useEffect(() => {
    if (initialType) {
      setMessageType(initialType);
    }
  }, [initialType]);

  const handleSponsorCTA = () => {
    setMessageType('sponsor-reklam');
    setSubject('Sponsorluk ve Reklam Alanı Talebi');
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleSuggestCTA = () => {
    setMessageType('icerik-onerisi');
    setSubject('Yeni Analiz / İçerik Önerisi');
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Client-side validations
    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      setErrorMsg("Lütfen tüm zorunlu alanları eksiksiz doldurunuz.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMsg("Lütfen geçerli bir e-posta adresi yazın.");
      return;
    }

    setLoading(true);
    try {
      const payload: Record<string, unknown> = {
        name: name.trim(),
        email: email.trim(),
        subject: subject.trim(),
        messageType,
        message: message.trim(),
        website: '', // honeypot — bots fill this; server rejects silently
      };

      if (messageType === 'sponsor-reklam') {
        payload.companyName = companyName.trim();
        payload.websiteUrl = websiteUrl.trim();
        payload.budgetRange = budgetRange;
      }

      const result = await apiContactSubmit(payload);
      if (!result.success) {
        setErrorMsg(result.message || 'Mesaj gönderilirken bir hata oluştu. Lütfen tekrar dene.');
        return;
      }
      setSuccess(true);
      
      // Clear values
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
      setCompanyName('');
      setWebsiteUrl('');
      setBudgetRange('Belirtmek istemiyorum');
    } catch (err: any) {
      console.error("Error sending contact message:", err);
      setErrorMsg("Mesaj gönderilirken bir hata oluştu. Lütfen tekrar dene.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-fb-dark text-slate-100 overflow-hidden relative">
      <SEO 
        title="İletişim | Fenerbahçe Evreni"
        description="Fenerbahçe Evreni ile iletişime geçin, içerik önerisi gönderin, sponsorluk ve reklam iş birliği taleplerini bizimle paylaşın."
        canonical="https://fenerbahceevreni.com/iletisim"
      />
      
      {/* Visual background lights */}
      <div className="absolute top-[3%] left-[15%] w-[35rem] h-[35rem] rounded-full bg-fb-navy opacity-30 blur-[130px] pointer-events-none" />
      <div className="absolute top-[60%] right-[5%] w-[30rem] h-[30rem] rounded-full bg-fb-yellow/5 opacity-10 blur-[140px] pointer-events-none" />

      {/* 1. PAGE HERO */}
      <section className="relative pt-12 md:pt-20 pb-16 md:pb-24 border-b border-white/[0.04] text-center">
        <div className="max-w-4xl mx-auto px-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-fb-yellow/10 border border-fb-yellow/20 text-[10px] text-fb-yellow font-black uppercase tracking-wider mb-6">
            <Mail className="w-3.5 h-3.5" /> İLETİŞİM HUB
          </div>

          <h1 className="text-4xl md:text-6xl font-display font-black text-white italic uppercase tracking-tight leading-none mb-6">
            İLETİŞİM
          </h1>

          <p className="text-slate-300 text-sm md:text-lg max-w-2xl mx-auto leading-relaxed mb-10 font-semibold text-center">
            Geri bildirim, içerik önerisi, sponsorlu çalışma, reklam ve iş birliği talepleri için Fenerbahçe Evreni’ne ulaş.
          </p>

          <div className="flex flex-wrap justify-center gap-2.5 max-w-4xl mx-auto">
            {[
              "Geri Bildirim",
              "İçerik Önerisi",
              "Sponsor / Reklam",
              "İş Birliği",
              "Premium Soruları"
            ].map((badge, i) => (
              <span 
                key={i} 
                className="px-3.5 py-2 rounded-xl bg-fb-card border border-white/[0.06] text-xs font-black text-slate-200 tracking-wide flex items-center gap-2 shadow-sm"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-fb-yellow" /> {badge}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 2. CONTACT OPTIONS CARDS */}
      <section className="py-16 md:py-20 border-b border-white/[0.04]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-5">
            {/* Card 1 */}
            <div className="p-6 rounded-2xl bg-fb-card border border-white/[0.04] text-left space-y-3">
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-fb-yellow">
                <MessageSquare className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-black text-white uppercase font-display tracking-widest">Genel İletişim</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed font-semibold">
                Platformla ilgili soruların, önerilerin veya genel mesajların için bize yazabilirsin.
              </p>
            </div>

            {/* Card 2 */}
            <div className="p-6 rounded-2xl bg-fb-card border border-white/[0.04] text-left space-y-3">
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-fb-yellow">
                <Lightbulb className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-black text-white uppercase font-display tracking-widest">İçerik Önerisi</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed font-semibold">
                Analiz edilmesini istediğin maç, oyuncu, transfer profili veya tartışma konusu varsa gönderebilirsin.
              </p>
            </div>

            {/* Card 3 */}
            <div className="p-6 rounded-2xl bg-fb-card border border-white/[0.04] text-left space-y-3">
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-fb-yellow">
                <Megaphone className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-black text-white uppercase font-display tracking-widest">Sponsor / Reklam</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed font-semibold">
                Fenerbahçe kitlesine ulaşmak isteyen markalar için sponsorlu içerik, bülten ve reklam alanları değerlendirilebilir.
              </p>
            </div>

            {/* Card 4 */}
            <div className="p-6 rounded-2xl bg-fb-card border border-white/[0.04] text-left space-y-3">
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-fb-yellow">
                <Users className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-black text-white uppercase font-display tracking-widest">İş Birliği</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed font-semibold">
                Yazar, analizci, tasarımcı, video editörü veya içerik üreticisi olarak katkı sunmak istiyorsan iletişime geçebilirsin.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. MAIN CONTACT FORM & DETAILS SIDEBAR */}
      <section className="py-16 md:py-24 border-b border-white/[0.04] bg-fb-card/10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-12 gap-12 items-start" ref={formRef}>
            
            {/* Form Column - 7/12 */}
            <div className="lg:col-span-7 bg-fb-card border border-white/[0.06] rounded-3xl p-6 md:p-8 text-left space-y-6 relative">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-2">
                <div>
                  <h2 className="text-lg md:text-xl font-display font-black text-white italic uppercase tracking-wide">
                    İLETİŞİM FORMU
                  </h2>
                  <p className="text-[10px] text-fb-muted tracking-wide font-mono mt-0.5">DOLDURULMASI ZORUNLU ALANLAR YILDIZ (*) İLE BELİRTİLMİŞTİR</p>
                </div>
                <div className="w-1.5 h-6 bg-fb-yellow" />
              </div>

              {success ? (
                <div className="p-8 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto text-lg">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-black text-white uppercase">Mesajın alındı.</h3>
                  <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto">
                    Evren destek ekibi mesajınızı aldı. En kısa sürede en rasyonel şekilde dönüş yapmaya çalışacağız. Teşekkürler.
                  </p>
                  <button 
                    onClick={() => setSuccess(false)}
                    className="px-5 py-2.5 bg-fb-yellow hover:bg-white text-fb-navy font-black text-[10px] uppercase tracking-widest rounded-xl transition-all shadow-md inline-block cursor-pointer"
                  >
                    Yeni Bir Mesaj İlet
                  </button>
                </div>
              ) : (
                <form onSubmit={handleFormSubmit} className="space-y-4">
                  
                  {errorMsg && (
                    <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-slate-400">Ad Soyad *</label>
                      <input 
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full px-3.5 py-3 bg-fb-dark border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-fb-yellow font-semibold"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-slate-400 font-mono">E-posta Adresi *</label>
                      <input 
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="ornek@domain.com"
                        className="w-full px-3.5 py-3 bg-fb-dark border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-fb-yellow font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-slate-400">Konu *</label>
                      <input 
                        type="text"
                        required
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="Konu başlığı yazınız"
                        className="w-full px-3.5 py-3 bg-fb-dark border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-fb-yellow font-semibold"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-slate-400">Mesaj Türü *</label>
                      <select 
                        value={messageType}
                        onChange={(e) => setMessageType(e.target.value)}
                        className="w-full px-3.5 py-3 bg-fb-dark border border-white/10 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-fb-yellow font-semibold cursor-pointer"
                      >
                        <option value="genel">Genel Mesaj</option>
                        <option value="geri-bildirim">Geri Bildirim</option>
                        <option value="icerik-onerisi">İçerik Önerisi</option>
                        <option value="sponsor-reklam">Sponsor / Reklam Talebi</option>
                        <option value="is-birligi">İş Birliği</option>
                        <option value="premium">Premium Hakkında</option>
                      </select>
                    </div>
                  </div>

                  {/* Conditional Fields for Sponsor / Reklam */}
                  <AnimatePresence>
                    {messageType === 'sponsor-reklam' && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="p-5 rounded-2xl bg-fb-yellow/5 border border-fb-yellow/15 space-y-4 overflow-hidden"
                      >
                        <h4 className="text-xs font-black text-fb-yellow uppercase tracking-wider flex items-center gap-2">
                          <Briefcase className="w-4 h-4" /> Kurumsal Detaylar (Sponsor-Reklam)
                        </h4>
                        
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase text-slate-300">Marka / Şirket Adı</label>
                            <input 
                              type="text"
                              value={companyName}
                              onChange={(e) => setCompanyName(e.target.value)}
                              placeholder="Firma Adı Ltd. Şti."
                              className="w-full px-3.5 py-2.5 bg-fb-dark border border-white/5 rounded-xl text-xs text-white focus:outline-none focus:border-fb-yellow font-semibold"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase text-slate-300">Web Sitesi</label>
                            <input 
                              type="text"
                              value={websiteUrl}
                              onChange={(e) => setWebsiteUrl(e.target.value)}
                              placeholder="https://brand.com"
                              className="w-full px-3.5 py-2.5 bg-fb-dark border border-white/5 rounded-xl text-xs text-white focus:outline-none focus:border-fb-yellow font-mono"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase text-slate-300">Tahmini Bütçe Aralığı</label>
                          <select 
                            value={budgetRange}
                            onChange={(e) => setBudgetRange(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-fb-dark border border-white/5 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-fb-yellow font-semibold cursor-pointer"
                          >
                            <option value="Belirtmek istemiyorum">Belirtmek istemiyorum</option>
                            <option value="1.000 - 5.000 TL">1.000 - 5.000 TL</option>
                            <option value="5.000 - 15.000 TL">5.000 - 15.000 TL</option>
                            <option value="15.000 - 50.000 TL">15.000 - 50.000 TL</option>
                            <option value="50.000 TL+">50.000 TL+</option>
                          </select>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-slate-400">Mesajınız *</label>
                    <textarea 
                      required
                      rows={6}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Sorunuzu, iş birliği teklifinizi veya detaylı mesajınızı buraya yazın..."
                      className="w-full px-3.5 py-3.5 bg-fb-dark border border-white/10 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-fb-yellow leading-relaxed"
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full py-4 bg-fb-yellow hover:bg-white text-fb-navy font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {loading ? 'İletiliyor...' : 'MESAJIVER / GÖNDER'}
                  </button>

                  {/* Disclaimer check */}
                  <p className="text-[10px] text-slate-500 font-semibold leading-relaxed text-center pt-2">
                    Lütfen küfür, argo ve hakaret içeren ifadelerden kaçınınız. Kişisel verileriniz gizlilik tüzüğümüz doğrultusunda saklanır.
                  </p>

                </form>
              )}
            </div>

            {/* Sidebar Columns - 5/12 */}
            <div className="lg:col-span-5 space-y-6 text-left">
              
              {/* Contact Info Card */}
              <div className="p-6 bg-fb-card border border-white/[0.06] rounded-3xl space-y-6">
                <div>
                  <h3 className="text-xs font-black text-slate-300 uppercase font-mono tracking-widest mb-1">MECRA KANALLARI</h3>
                  <h4 className="text-base font-black text-white font-display uppercase italic">Diğer kanallar</h4>
                  <p className="text-[11px] text-fb-muted mt-2">Bize form dışında e-posta veya sosyal medya pencerelerimizden de anlık erişebilirsin.</p>
                </div>

                <div className="space-y-4">
                  {/* Email */}
                  <div className="p-4 rounded-xl bg-fb-dark border border-white/5 flex gap-3.5 items-center">
                    <div className="w-10 h-10 rounded-xl bg-fb-yellow/5 border border-fb-yellow/10 flex items-center justify-center text-fb-yellow shrink-0">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[9px] text-fb-muted font-black block uppercase tracking-wider">E-POSTA ADRESİ</span>
                      <a href={`mailto:${siteSettings.contactEmail || 'iletisim@fenerbahceevreni.com'}`} className="text-xs text-white font-mono font-bold hover:text-fb-yellow transition-colors break-all">
                        {siteSettings.contactEmail || 'iletisim@fenerbahceevreni.com'}
                      </a>
                    </div>
                  </div>

                  {/* X Twitter */}
                  <div className="p-4 rounded-xl bg-fb-dark border border-white/5 flex gap-3.5 items-center">
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white shrink-0 font-display font-black text-sm italic">
                      X
                    </div>
                    <div>
                      <span className="text-[9px] text-fb-muted font-black block uppercase tracking-wider">TWITTER @ X</span>
                      <a href={siteSettings.twitterUrl || "https://x.com/FenerEvreni"} target="_blank" rel="noreferrer" className="text-xs text-white font-bold hover:text-fb-yellow transition-colors">
                        @FenerEvreni
                      </a>
                    </div>
                  </div>

                  {/* YouTube */}
                  <div className="p-4 rounded-xl bg-fb-dark border border-white/5 flex gap-3.5 items-center">
                    <div className="w-10 h-10 rounded-xl bg-red-500/5 border border-red-500/10 flex items-center justify-center text-red-500 shrink-0">
                      <Globe className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[9px] text-fb-muted font-black block uppercase tracking-wider">YOUTUBE KANALI</span>
                      <a href={siteSettings.youtubeUrl || "https://youtube.com"} target="_blank" rel="noreferrer" className="text-xs text-white font-bold hover:text-fb-yellow transition-colors">
                        Fenerbahçe Evreni TV
                      </a>
                    </div>
                  </div>

                  {/* Instagram */}
                  <div className="p-4 rounded-xl bg-fb-dark border border-white/5 flex gap-3.5 items-center">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/5 border border-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
                      
                    </div>
                    <div>
                      <span className="text-[9px] text-fb-muted font-black block uppercase tracking-wider">INSTAGRAM HESABI</span>
                      <a href={siteSettings.instagramUrl || "https://instagram.com"} target="_blank" rel="noreferrer" className="text-xs text-white font-bold hover:text-fb-yellow transition-colors">
                        @fenerbahceevreni
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Expectations Card */}
              <div className="p-6 bg-[#0c1223]/50 border border-white/[0.04] rounded-3xl space-y-4">
                <h4 className="text-xs font-black text-slate-300 uppercase tracking-widest">DÖNÜŞ SÜRECİ</h4>
                
                <div className="space-y-4">
                  <div className="text-left">
                    <span className="text-[10px] text-fb-yellow font-black uppercase block">1. Genel mesajlar</span>
                    <p className="text-[11px] text-slate-400 font-semibold leading-relaxed mt-0.5">Yoğunluğa göre dönüş süresi değişebilir. Genelde 2 iş günü sürer.</p>
                  </div>
                  <div className="text-left">
                    <span className="text-[10px] text-fb-yellow font-black uppercase block">2. Sponsor / reklam</span>
                    <p className="text-[11px] text-slate-400 font-semibold leading-relaxed mt-0.5">Marka, hedef ve bütçe bilgisi paylaşıldığında uzman ekibimiz en net sunumla dönüş yapar.</p>
                  </div>
                  <div className="text-left">
                    <span className="text-[10px] text-fb-yellow font-black uppercase block">3. İçerik önerileri</span>
                    <p className="text-[11px] text-slate-400 font-semibold leading-relaxed mt-0.5">Tüm öneriler titizlikle değerlendirilir; ancak her önerinin içerik olarak yayınlanması garanti değildir.</p>
                  </div>
                </div>
              </div>

              {/* Independence Notice */}
              <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15 text-[10px] text-slate-400 font-semibold leading-relaxed flex gap-2">
                <AlertTriangle className="w-4 h-4 text-fb-yellow shrink-0 mt-0.5" />
                <span>
                  <strong>Hatırlatma:</strong> Fenerbahçe Evreni, bağımsız bir taraftar ve analiz platformudur. Fenerbahçe Spor Kulübü ile resmî bir bağı yoktur. Bu sayfa üzerinden resmi kulüp derneğine veya yönetimine erişemezsiniz.
                </span>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* 4. SPONSORSHIP CALLOUT */}
      <section className="py-16 md:py-24 border-b border-white/[0.04] relative">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-6">
          <div className="w-12 h-12 rounded-2xl bg-fb-yellow/10 text-fb-yellow flex items-center justify-center mx-auto mb-4">
            <Briefcase size={24} />
          </div>

          <h2 className="text-xl md:text-3xl font-display font-black text-white italic uppercase tracking-wide">
            Fenerbahçe kitlesine ulaşmak isteyen markalar için
          </h2>

          <p className="text-xs md:text-sm text-slate-300 leading-relaxed max-w-3xl mx-auto font-semibold">
            Fenerbahçe Evreni; analiz içerikleri, maç raporları, bülten, premium bekleme listesi ve sosyal medya yönlendirmeleriyle zaman içinde markalar için niş ve sadık bir futbol kitlesine ulaşma alanı oluşturmayı hedefler.
          </p>

          <div className="p-6 rounded-2xl bg-fb-card border border-white/[0.06] max-w-2xl mx-auto text-left">
            <h3 className="text-xs font-black text-white uppercase tracking-wider mb-4 pb-2 border-b border-white/5 text-center">AKTİF REKLAM & SPONSORLUK ALANLARIMIZ</h3>
            <div className="grid sm:grid-cols-2 gap-3.5 text-[11px] font-semibold text-slate-300">
              <div className="flex gap-2 items-center">
                <div className="w-4 h-4 rounded-full bg-fb-yellow/10 text-fb-yellow flex items-center justify-center text-[8px] font-mono font-black">✓</div>
                <span>Ana Sayfa Sponsor Alanı</span>
              </div>
              <div className="flex gap-2 items-center">
                <div className="w-4 h-4 rounded-full bg-fb-yellow/10 text-fb-yellow flex items-center justify-center text-[8px] font-mono font-black">✓</div>
                <span>Maç Merkezi Sponsorluğu</span>
              </div>
              <div className="flex gap-2 items-center">
                <div className="w-4 h-4 rounded-full bg-fb-yellow/10 text-fb-yellow flex items-center justify-center text-[8px] font-mono font-black">✓</div>
                <span>Haftalık Bülten Sponsorluğu</span>
              </div>
              <div className="flex gap-2 items-center">
                <div className="w-4 h-4 rounded-full bg-fb-yellow/10 text-fb-yellow flex items-center justify-center text-[8px] font-mono font-black">✓</div>
                <span>Analiz Yazısı Sponsorluğu</span>
              </div>
              <div className="flex gap-2 items-center">
                <div className="w-4 h-4 rounded-full bg-fb-yellow/10 text-fb-yellow flex items-center justify-center text-[8px] font-mono font-black">✓</div>
                <span>Transfer Radar Sponsorluğu</span>
              </div>
              <div className="flex gap-2 items-center">
                <div className="w-4 h-4 rounded-full bg-fb-yellow/10 text-fb-yellow flex items-center justify-center text-[8px] font-mono font-black">✓</div>
                <span>Sosyal Medya Ortaklık Paketleri</span>
              </div>
            </div>
          </div>

          <button 
            onClick={handleSponsorCTA}
            className="px-6 py-3 bg-fb-yellow hover:bg-white text-fb-navy font-black text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-lg inline-flex items-center gap-2"
          >
            Sponsor / Reklam Talebi Gönder
          </button>
        </div>
      </section>

      {/* 5. CONTENT SUGGESTION CALLOUT */}
      <section className="py-16 md:py-20 bg-fb-card/25">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-6">
          <div className="w-12 h-12 rounded-2xl bg-fb-yellow/10 text-fb-yellow flex items-center justify-center mx-auto mb-4">
            <Lightbulb size={24} />
          </div>

          <h2 className="text-xl md:text-2xl font-display font-black text-white italic uppercase tracking-wide">
            Analiz edilmesini istediğin bir konu mu var?
          </h2>

          <p className="text-xs text-slate-300 leading-relaxed max-w-2xl mx-auto font-semibold">
            Bir maç, oyuncu, transfer profili ya da taktik tartışma başlığı öner. Fenerbahçe Evreni’nde ele alınabilecek konuları taraftarla birlikte rasyonel zeminde şekillendirelim.
          </p>

          <button 
            onClick={handleSuggestCTA}
            className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-black text-xs uppercase tracking-widest border border-white/10 rounded-xl transition-all cursor-pointer inline-flex items-center gap-2"
          >
            İçerik Önerisi Gönder
          </button>
        </div>
      </section>

    </div>
  );
};
