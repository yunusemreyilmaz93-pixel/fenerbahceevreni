import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import SEO from './SEO';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Award, 
  TrendingUp, 
  ShieldAlert, 
  Sparkles, 
  HelpCircle, 
  ChevronRight, 
  CheckCircle, 
  Vote, 
  Layers, 
  FileText, 
  User, 
  Flag 
} from 'lucide-react';

interface MacMerkeziPageProps {
  onNavigate: (view: string) => void;
}

// 11. Mock Data structures ready to be mapped to cloud/Firebase databases later
const featuredMatch = {
  competition: "Trendyol Süper Lig • 36. Hafta",
  opponent: "Beşiktaş",
  opponentLogo: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Besiktas_Logo_Watermarked.svg/1024px-Besiktas_Logo_Watermarked.svg.png",
  homeTeam: "Fenerbahçe",
  status: "Maç Önü",
  date: "30 May 2026",
  time: "20:00",
  venue: "Ülker Stadyumu Şükrü Saracoğlu Spor Kompleksi / Kadıköy",
  previewText: "Fenerbahçe bu karşılaşmada yüksek yoğunluklu ön alan baskısı yaparak oyun temposunu erkenden eline almak, merkez orta sahada geçiş savunmasını dengede tutmak ve kanat bindirmeleriyle ceza sahasını beslemek zorunda.",
};

const matchCountdownStrip = {
  status: "Süper Lig Liderlik Virajı",
  ligDurumu: "2. Sıra (84 Puan)",
  sonBesMac: ["W", "W", "D", "L", "W"],
  eksikler: "Oosterwolde (Sarı Kart Sınırı), Becão (Hafif Sakat)",
  hakem: "Halil Umut Meler"
};

const squadXI_4231 = {
  GK: { name: "Dominik Livaković", no: 40, role: "Kaleci" },
  RB: { name: "Bright Osayi-Samuel", no: 21, role: "Sağ Bek" },
  CB1: { name: "Alexander Djiku", no: 6, role: "Stoper" },
  CB2: { name: "Çağlar Söyüncü", no: 2, role: "Stoper" },
  LB: { name: "Ferdi Kadıoğlu", no: 7, role: "Sol Bek" },
  DM1: { name: "İsmail Yüksek", no: 5, role: "Ön Libero" },
  DM2: { name: "Fred (Dinamo)", no: 35, role: "Merkez Orta Saha" },
  RW: { name: "İrfan Can Kahveci", no: 17, role: "Sağ Kanat" },
  AM: { name: "Sebastian Szymański", no: 53, role: "10 Numara" },
  LW: { name: "Dušan Tadić", no: 10, role: "Sol Kanat" },
  CF: { name: "Edin Džeko", no: 9, role: "Santrafor" }
};

const tacticalNotes = [
  {
    id: "note-1",
    title: "Merkezde Denge",
    text: "Fenerbahçe’nin topa sahip olduğu anlarda iki merkez oyuncusundan birinin (İsmail Yüksek) mutlaka savunma emniyetini alması gerekiyor. Aksi durumda geçiş hücumlarında rakibe geniş alan kalabilir."
  },
  {
    id: "note-2",
    title: "Kanat Bağlantıları",
    text: "Sağ ve sol kanatta bek-kanat uyumu maçın hücum kalitesini belirleyebilir. Özellikle Ferdi ve Osayi'nin geniş alan bindirmeleri ile Tadić/İrfan Can servisleri gol kilidini açacaktır."
  },
  {
    id: "note-3",
    title: "Ön Alan Baskısı",
    text: "Rakibin geriden oyun kurmasına izin verilirse merkez blok geriye yaslanıp tempo kaybedebilir. Fenerbahçe’nin özellikle ilk 15 dakikada pres seviyesini yüksek tutması oyunun yönünü belirleyebilir."
  }
];

const keyPlayers = [
  {
    id: "kp-1",
    name: "Sebastian Szymański",
    role: "Pres Lideri / Bağlantı Oyuncusu",
    reason: "Orta saha ile hücum hattı arasındaki geçiş dinamizmini yönetiyor. Rakip stoperlerin topla çıkışlarında yapacağı yoğun pres derbide hatlar arasındaki boşluğu belirleyecek.",
    score: "9.3 / 10"
  },
  {
    id: "kp-2",
    name: "Ferdi Kadıoğlu",
    role: "Kreatif Sol Koridor Oyun Kurucusu",
    reason: "Klasik bir sol bek yerine içe kat ederek orta sahayı üçleyen dinamik yapısı, rakibin sağ kanat savunma bloğunu dengesiz yakalama konusundaki en büyük kozumuz.",
    score: "9.1 / 10"
  },
  {
    id: "kp-3",
    name: "Dušan Tadić",
    role: "Oyun Aklı & Asist İstasyonu",
    reason: "Ceza sahası çevresinde tempo yavaşlatıp doğru pas açısını bulma becerisi, özellikle derbi gibi kapalı ve taktik disiplini yüksek maçlarda kilidi çözecek kilit unsur.",
    score: "8.8 / 10"
  }
];

const recentReports = [
  {
    id: "rep-1",
    title: "Fenerbahçe 2-1 Kasımpaşa | Taktik Maç Raporu",
    tag: "Maç Sonu",
    excerpt: "Fenerbahçe oyunun bazı bölümlerinde kontrolü kaybetse de Fred'in oyuna girişiyle bireysel kalite ve doğru alan organizasyonuyla geriden gelerek kazanmayı bildirdi.",
    date: "25 May 2026"
  },
  {
    id: "rep-2",
    title: "Deplasmanda Tempo Problemi: Analiz Çözümü",
    tag: "Taktik Analiz",
    excerpt: "Topa sahip olma oranı %64 olarak yüksek görünse de üçüncü bölge üretkenliği sınırlı kaldı. Kanat organizasyonlarında yaşanan durağanlığı masaya yatırıyoruz.",
    date: "18 May 2026"
  },
  {
    id: "rep-3",
    title: "Oyuncu Raporları & Form Grafikleri: Kim Öne Çıktı?",
    tag: "Oyuncu Puanları",
    excerpt: "Süper Lig maratonunda fiziksel direncin en üst düzeyde test edildiği bu kritik dönemeçte orta saha ve stoper ikilisinin Opta puan kartlarını karşılaştırıyoruz.",
    date: "11 May 2026"
  },
  {
    id: "rep-4",
    title: "Mourinho’nun Derbi Planı: Erken Gol Baskısı",
    tag: "Taktik",
    excerpt: "İç sahada oynanacak kritik derbinin ilk yarısındaki şok baskı sekansı, karşılaşmanın kaderini ve taraftar tribün reaksiyonunu değiştirecek ana taktik tercih.",
    date: "04 May 2026"
  }
];

const postMatchFormats = [
  { name: "Maçın Hikayesi", desc: "Karşılaşmanın dakika bazlı taktik kırılma ve duygu dönüm noktalarının anlatımı." },
  { name: "Kırılma Anı", desc: "Karşılaşmanın gidişatını doğrudan etkileyen can alıcı oyuncu değişimi ya da gol varyasyonu." },
  { name: "Oyuncu Puanları", desc: "Her sarı-lacivertli formayı taşıyan oyuncunun Opta metrikleriyle desteklenmiş detaylı karnesi." },
  { name: "Hoca Tercihleri", desc: "Mourinho'nun maç öncesi ana planı ile devre arası taktik müdahalelerinin rasyonel analizi." },
  { name: "Taktik Artılar & Eksiler", desc: "Saha içi alan paylaşımı, set hücumları ve savunmadaki kompakt duruşun listeli dökümü." },
  { name: "Haftanın MVP Oylaması", desc: "Üyelerin ve taraftarların katılımıyla sahanın en iyi oyuncusunu seçtiğimiz interaktif oylama." },
  { name: "Sonraki Maç Yol Haritası", desc: "Analiz ekibimizin sonraki haftanın Süper Lig maçı için çıkardığı erken uyarı ve taktik plan notları." },
];

const MacMerkeziPage: React.FC<MacMerkeziPageProps> = ({ onNavigate }) => {
  const [selectedXIPosition, setSelectedXIPosition] = useState<string | null>("CF");
  const [pollVotes, setPollVotes] = useState({
    home: 74,
    draw: 18,
    away: 8,
    voted: false
  });
  const [countdown, setCountdown] = useState({ gün: 0, saat: 14, dakika: 42, saniye: 55 });
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterJoined, setNewsletterJoined] = useState(false);

  // 3. Simple Match Countdown Timer emulator
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev.saniye > 0) {
          return { ...prev, saniye: prev.saniye - 1 };
        } else if (prev.dakika > 0) {
          return { ...prev, dakika: prev.dakika - 1, saniye: 59 };
        } else if (prev.saat > 0) {
          return { ...prev, saat: prev.saat - 1, dakika: 59, saniye: 59 };
        } else {
          return { gün: 0, saat: 12, dakika: 0, saniye: 0 }; // Loop simulation
        }
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleVote = (option: 'home' | 'draw' | 'away') => {
    if (pollVotes.voted) return;
    setPollVotes(prev => {
      const copy = { ...prev };
      copy[option] = copy[option] + 1;
      copy.voted = true;
      return copy;
    });
  };

  const totalVotes = pollVotes.home + pollVotes.draw + pollVotes.away;
  const homePct = Math.round((pollVotes.home / totalVotes) * 100);
  const drawPct = Math.round((pollVotes.draw / totalVotes) * 100);
  const awayPct = Math.round((pollVotes.away / totalVotes) * 100);

  const handleNewsletterJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) return;
    setNewsletterJoined(true);
  };

  return (
    <div id="mac-merkezi-index" className="space-y-16 pb-24 text-left">
      <SEO 
        title="Maç Merkezi | Fenerbahçe Evreni"
        description="Fenerbahçe maç önü taktik notları, muhtemel 11'ler, son maç analiz dökümanları, oyuncu puan karnesi ve taraftar skor tahminleri."
        canonical="https://fenerbahceevreni.com/mac-merkezi"
      />
      
      {/* SECTION 1: Page Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-8 border-b border-white/[0.04] bg-gradient-to-b from-fb-navy/20 to-transparent">
        {/* Abstract soccer pitch design elements in bg */}
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
          <svg width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
            <line x1="10%" y1="50%" x2="90%" y2="50%" stroke="white" strokeWidth="2" />
            <circle cx="50%" cy="50%" r="100" stroke="white" strokeWidth="2" />
          </svg>
        </div>

        <div className="space-y-6 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-fb-yellow/10 border border-fb-yellow/20 rounded-full text-[10px] font-black uppercase text-fb-yellow tracking-widest animate-pulse">
            <Layers className="w-3.5 h-3.5" /> CANLI VERİ ENTEGRASYONU AKTİF
          </div>
          
          <h1 className="text-4xl md:text-5xl font-display font-black text-white uppercase tracking-tight leading-none italic">
            Maç Merkezi
          </h1>
          
          <p className="text-fb-muted text-sm md:text-base max-w-2xl font-medium leading-relaxed">
            Fenerbahçe’nin maç önü taktik notları, muhtemel 11’leri, maç sonu analizleri, oyuncu puanları ve taraftar oylamaları burada.
          </p>

          <div className="flex flex-wrap gap-2 pt-2">
            {["Maç Önü", "Muhtemel 11", "Oyuncu Puanları", "Taktik Analiz", "Taraftar Oylaması"].map((pill, i) => (
              <span key={i} className="px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                {pill}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 2: Large Featured Match Card */}
      <section id="featured-match-section" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch pt-2">
        <div className="lg:col-span-8 rounded-2xl bg-fb-card border border-white/[0.08] p-6 md:p-8 flex flex-col justify-between relative overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.5)]">
          {/* Decorative indicator line */}
          <div className="absolute top-0 inset-x-0 h-[3px] bg-fb-yellow" />
          
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black uppercase tracking-widest text-fb-yellow px-2.5 py-1 rounded bg-fb-yellow/10">
                {featuredMatch.status}
              </span>
              <span className="text-xs text-fb-muted font-bold tracking-wider">{featuredMatch.competition}</span>
            </div>

            {/* Teams Confrontment Row */}
            <div className="grid grid-cols-3 items-center py-6 text-center border-b border-white/[0.05]">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center font-display font-heavy text-fb-yellow italic border border-white/5 text-2xl shadow-lg">
                  FE
                </div>
                <span className="text-base font-black text-white mt-3 uppercase tracking-wide">{featuredMatch.homeTeam}</span>
              </div>

              <div className="flex flex-col items-center">
                <span className="text-[10px] text-fb-yellow font-black tracking-widest uppercase mb-1">KADIKÖY SAVAŞI</span>
                <span className="text-3xl font-black italic text-white">{featuredMatch.time}</span>
                <span className="text-[10px] text-fb-muted mt-2 font-bold tracking-wider">{featuredMatch.date}</span>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center p-2.5 border border-white/5 shadow-lg">
                  <img src={featuredMatch.opponentLogo} alt={featuredMatch.opponent} className="w-12 h-12 object-contain" referrerPolicy="no-referrer" />
                </div>
                <span className="text-base font-black text-white mt-3 uppercase tracking-wide">{featuredMatch.opponent}</span>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-1.5 text-fb-yellow">
                <Flag className="w-4 h-4" /> Editör Maç Önü Görüşü
              </h3>
              <p className="text-sm text-fb-muted leading-relaxed">
                {featuredMatch.previewText}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-8 border-t border-white/[0.05] mt-6">
            <button 
              onClick={() => {
                const el = document.getElementById('tactical-notes-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex-1 py-3 px-4 rounded-xl bg-fb-yellow hover:bg-white text-fb-navy text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(255,210,31,0.2)]"
            >
              Maç Önü Analizi
            </button>
            <button 
              onClick={() => {
                const el = document.getElementById('lineup-tactics-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="py-3 px-6 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-black uppercase tracking-wider transition-all"
            >
              Muhtemel 11
            </button>
            <button 
              onClick={() => {
                const el = document.getElementById('fan-poll-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="py-3 px-6 rounded-xl bg-fb-yellow/10 border border-fb-yellow/20 hover:border-fb-yellow text-fb-yellow text-xs font-black uppercase tracking-wider transition-all"
            >
              Tahminini Yap
            </button>
          </div>
        </div>

        {/* SECTION 3: Match Countdown & Info Strip */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="p-5 rounded-2xl bg-[#121826] border border-white/[0.06] flex-1 flex flex-col justify-between text-left">
            <div>
              <span className="text-[10px] text-fb-muted font-black tracking-widest uppercase block mb-2">MAÇ BAŞLANGICINA KALAN</span>
              <div className="grid grid-cols-4 gap-2 text-center my-3">
                {[
                  { val: countdown.gün, label: "GÜN" },
                  { val: countdown.saat, label: "SAAT" },
                  { val: countdown.dakika, label: "DK" },
                  { val: countdown.saniye, label: "SN" }
                ].map((item, i) => (
                  <div key={i} className="bg-fb-dark/80 rounded-xl p-3 border border-white/5 relative overflow-hidden">
                    <div className="text-xl font-black italic text-fb-yellow">{item.val.toString().padStart(2, '0')}</div>
                    <div className="text-[8px] text-fb-muted font-black uppercase mt-1">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="pt-4 border-t border-white/[0.04] space-y-1">
              <div className="text-xs font-bold text-slate-300">Stadyum Bilgisi</div>
              <div className="text-[11px] text-fb-muted flex items-center gap-1">
                <MapPin className="w-3 h-3 text-fb-yellow shrink-0" /> {featuredMatch.venue}
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl bg-fb-card border border-white/[0.08] p-5 space-y-4 text-left">
            <span className="text-[10px] text-fb-muted font-black tracking-widest uppercase block border-b border-white/5 pb-2">TAKIM / MAÇ BİLGİ ŞERİDİ</span>
            
            <div className="space-y-3 font-semibold text-xs text-slate-200">
              <div className="flex justify-between">
                <span className="text-fb-muted">Lig Durumu</span>
                <span className="text-white font-black">{matchCountdownStrip.ligDurumu}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-fb-muted">Son 5 Karşılaşma</span>
                <div className="flex gap-1">
                  {matchCountdownStrip.sonBesMac.map((r, i) => (
                    <span 
                      key={i} 
                      className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-black ${
                        r === 'W' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                        r === 'D' ? 'bg-slate-500/20 text-slate-400 border border-slate-500/30' :
                        'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {r}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex justify-between text-left">
                <span className="text-fb-muted mr-4 shrink-0">Kritik Eksikler</span>
                <span className="text-[#FFB020] font-black text-right leading-tight">{matchCountdownStrip.eksikler}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-fb-muted">Maçın Hakemi</span>
                <span className="text-white font-black">{matchCountdownStrip.hakem}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: Probable XI Taktik Tahtası */}
      <section id="lineup-tactics-section" className="space-y-6">
        <div className="text-left space-y-1.5">
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-fb-yellow">AKILLI SAHA DİZİLİMİ</span>
          <h2 className="text-3xl font-display font-black text-white italic uppercase">Muhtemel 11 ve Saha İçi Rolleri</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Detailed visual football field representation */}
          <div className="lg:col-span-8 rounded-3xl bg-gradient-to-b from-[#11241a] to-[#0d1612] border border-emerald-500/25 p-6 md:p-8 relative min-h-[520px] flex flex-col justify-between overflow-hidden shadow-2xl">
            {/* Field Lines design overlays */}
            <div className="absolute inset-x-0 top-0 bottom-0 pointer-events-none opacity-25">
              {/* Outer border & Penalty areas */}
              <div className="absolute inset-4 border border-emerald-400/40" />
              {/* Center Line and Center Circle */}
              <div className="absolute top-1/2 left-4 right-4 h-px bg-emerald-400/40 -translate-y-1/2" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border border-emerald-400/40" />
              {/* Top Penalty Box */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-48 h-20 border-b border-x border-emerald-400/40" />
              {/* Bottom Penalty Box */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-48 h-20 border-t border-x border-emerald-400/40" />
            </div>

            {/* Top Indicator badge */}
            <div className="flex justify-between items-center relative z-20">
              <span className="text-[9px] font-black tracking-widest text-[#5adea9] px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> 4-2-3-1 TAKTİK KROKİSİ
              </span>
              <span className="text-[10px] text-slate-400 font-bold">Taktiğe tıklayarak oyuncu rollerini sağ panelden inceleyin</span>
            </div>

            {/* Players Layout Space (4-2-3-1 representation) */}
            <div className="relative flex-1 w-full flex flex-col justify-around py-8 min-h-[400px] z-20">
              
              {/* FORWARD Row (Edin Dzeko) */}
              <div className="flex justify-center">
                <button 
                  onClick={() => setSelectedXIPosition("CF")}
                  className={`w-14 h-14 rounded-full flex flex-col items-center justify-center font-bold text-xs border transition-all ${
                    selectedXIPosition === "CF" ? 'bg-fb-yellow text-fb-navy border-white scale-110 shadow-[0_0_20px_rgba(255,210,31,0.5)]' : 'bg-fb-navy/80 text-white border-fb-yellow/50 hover:bg-fb-yellow hover:text-fb-navy'
                  }`}
                >
                  <span className="text-[9px] font-extrabold leading-none">CF</span>
                  <span className="font-display font-black leading-none mt-1">{squadXI_4231.CF.no}</span>
                </button>
              </div>

              {/* ATTACKING MIDFIELDERS Row (Tadic, Szymanski, Irfan Can) */}
              <div className="flex justify-around px-8">
                <button 
                  onClick={() => setSelectedXIPosition("LW")}
                  className={`w-14 h-14 rounded-full flex flex-col items-center justify-center font-bold text-xs border transition-all ${
                    selectedXIPosition === "LW" ? 'bg-fb-yellow text-fb-navy border-white scale-110 shadow-[0_0_20px_rgba(255,210,31,0.5)]' : 'bg-fb-navy/80 text-white border-fb-yellow/50 hover:bg-fb-yellow hover:text-fb-navy'
                  }`}
                >
                  <span className="text-[9px] font-extrabold leading-none">LW</span>
                  <span className="font-display font-black leading-none mt-1">{squadXI_4231.LW.no}</span>
                </button>

                <button 
                  onClick={() => setSelectedXIPosition("AM")}
                  className={`w-14 h-14 rounded-full flex flex-col items-center justify-center font-bold text-xs border transition-all ${
                    selectedXIPosition === "AM" ? 'bg-fb-yellow text-fb-navy border-white scale-110 shadow-[0_0_20px_rgba(255,210,31,0.5)]' : 'bg-fb-navy/80 text-white border-fb-yellow/50 hover:bg-fb-yellow hover:text-fb-navy'
                  }`}
                >
                  <span className="text-[9px] font-extrabold leading-none">AM</span>
                  <span className="font-display font-black leading-none mt-1">{squadXI_4231.AM.no}</span>
                </button>

                <button 
                  onClick={() => setSelectedXIPosition("RW")}
                  className={`w-14 h-14 rounded-full flex flex-col items-center justify-center font-bold text-xs border transition-all ${
                    selectedXIPosition === "RW" ? 'bg-fb-yellow text-fb-navy border-white scale-110 shadow-[0_0_20px_rgba(255,210,31,0.5)]' : 'bg-fb-navy/80 text-white border-fb-yellow/50 hover:bg-fb-yellow hover:text-fb-navy'
                  }`}
                >
                  <span className="text-[9px] font-extrabold leading-none">RW</span>
                  <span className="font-display font-black leading-none mt-1">{squadXI_4231.RW.no}</span>
                </button>
              </div>

              {/* DEFENSIVE MIDFIELDERS Row (Ismail, Fred) */}
              <div className="flex justify-center gap-16">
                <button 
                  onClick={() => setSelectedXIPosition("DM1")}
                  className={`w-14 h-14 rounded-full flex flex-col items-center justify-center font-bold text-xs border transition-all ${
                    selectedXIPosition === "DM1" ? 'bg-fb-yellow text-fb-navy border-white scale-110 shadow-[0_0_20px_rgba(255,210,31,0.5)]' : 'bg-fb-navy/80 text-white border-fb-yellow/50 hover:bg-fb-yellow hover:text-fb-navy'
                  }`}
                >
                  <span className="text-[9px] font-extrabold leading-none">DM</span>
                  <span className="font-display font-black leading-none mt-1">{squadXI_4231.DM1.no}</span>
                </button>

                <button 
                  onClick={() => setSelectedXIPosition("DM2")}
                  className={`w-14 h-14 rounded-full flex flex-col items-center justify-center font-bold text-xs border transition-all ${
                    selectedXIPosition === "DM2" ? 'bg-fb-yellow text-fb-navy border-white scale-110 shadow-[0_0_20px_rgba(255,210,31,0.5)]' : 'bg-fb-navy/80 text-white border-fb-yellow/50 hover:bg-fb-yellow hover:text-fb-navy'
                  }`}
                >
                  <span className="text-[9px] font-extrabold leading-none">DM</span>
                  <span className="font-display font-black leading-none mt-1">{squadXI_4231.DM2.no}</span>
                </button>
              </div>

              {/* DEFENDERS Row (Ferdi, Djiku, Caglar, Osayi) */}
              <div className="flex justify-between px-4">
                <button 
                  onClick={() => setSelectedXIPosition("LB")}
                  className={`w-14 h-14 rounded-full flex flex-col items-center justify-center font-bold text-xs border transition-all ${
                    selectedXIPosition === "LB" ? 'bg-fb-yellow text-fb-navy border-white scale-110 shadow-[0_0_20px_rgba(255,210,31,0.5)]' : 'bg-fb-navy/80 text-white border-fb-yellow/50 hover:bg-fb-yellow hover:text-fb-navy'
                  }`}
                >
                  <span className="text-[9px] font-extrabold leading-none">LB</span>
                  <span className="font-display font-black leading-none mt-1">{squadXI_4231.LB.no}</span>
                </button>

                <button 
                  onClick={() => setSelectedXIPosition("CB1")}
                  className={`w-14 h-14 rounded-full flex flex-col items-center justify-center font-bold text-xs border transition-all ${
                    selectedXIPosition === "CB1" ? 'bg-fb-yellow text-fb-navy border-white scale-110 shadow-[0_0_20px_rgba(255,210,31,0.5)]' : 'bg-fb-navy/80 text-white border-fb-yellow/50 hover:bg-fb-yellow hover:text-fb-navy'
                  }`}
                >
                  <span className="text-[9px] font-extrabold leading-none">CB</span>
                  <span className="font-display font-black leading-none mt-1">{squadXI_4231.CB1.no}</span>
                </button>

                <button 
                  onClick={() => setSelectedXIPosition("CB2")}
                  className={`w-14 h-14 rounded-full flex flex-col items-center justify-center font-bold text-xs border transition-all ${
                    selectedXIPosition === "CB2" ? 'bg-fb-yellow text-fb-navy border-white scale-110 shadow-[0_0_20px_rgba(255,210,31,0.5)]' : 'bg-fb-navy/80 text-white border-fb-yellow/50 hover:bg-fb-yellow hover:text-fb-navy'
                  }`}
                >
                  <span className="text-[9px] font-extrabold leading-none">CB</span>
                  <span className="font-display font-black leading-none mt-1">{squadXI_4231.CB2.no}</span>
                </button>

                <button 
                  onClick={() => setSelectedXIPosition("RB")}
                  className={`w-14 h-14 rounded-full flex flex-col items-center justify-center font-bold text-xs border transition-all ${
                    selectedXIPosition === "RB" ? 'bg-fb-yellow text-fb-navy border-white scale-110 shadow-[0_0_20px_rgba(255,210,31,0.5)]' : 'bg-fb-navy/80 text-white border-fb-yellow/50 hover:bg-fb-yellow hover:text-fb-navy'
                  }`}
                >
                  <span className="text-[9px] font-extrabold leading-none">RB</span>
                  <span className="font-display font-black leading-none mt-1">{squadXI_4231.RB.no}</span>
                </button>
              </div>

              {/* GOALKEEPER Row */}
              <div className="flex justify-center">
                <button 
                  onClick={() => setSelectedXIPosition("GK")}
                  className={`w-14 h-14 rounded-full flex flex-col items-center justify-center font-bold text-xs border transition-all ${
                    selectedXIPosition === "GK" ? 'bg-fb-yellow text-fb-navy border-white scale-110 shadow-[0_0_20px_rgba(255,210,31,0.5)]' : 'bg-fb-navy/80 text-white border-fb-yellow/50 hover:bg-fb-yellow hover:text-fb-navy'
                  }`}
                >
                  <span className="text-[9px] font-extrabold leading-none">GK</span>
                  <span className="font-display font-black leading-none mt-1">{squadXI_4231.GK.no}</span>
                </button>
              </div>

            </div>

            <p className="text-[10px] text-[#5adea9] font-medium leading-normal italic text-left border-t border-emerald-500/10 pt-4">
              Bu kadro tahmini maç günü kulüpten, antrenmandan sızan son taktik bilgilere ve Mourinho’nun basın toplantılarına göre anlık güncellenir.
            </p>
          </div>

          {/* Right Selected Player Detail card (4-2-3-1 Commentary) */}
          <div className="lg:col-span-4 flex flex-col justify-between">
            <div className="p-6 rounded-3xl bg-fb-card border border-white/[0.08] text-left space-y-6 flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-fb-yellow">
                  <User className="w-5 h-5" />
                  <span className="text-xs font-black uppercase tracking-widest">OYUNCU ROL DETAYI</span>
                </div>

                <AnimatePresence mode="wait">
                  {selectedXIPosition && (
                    <motion.div
                      key={selectedXIPosition}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="space-y-4"
                    >
                      <div>
                        <div className="text-[10px] text-fb-muted font-bold tracking-wider uppercase mb-1">Pozisyon / Rol</div>
                        <div className="text-xl font-black text-white italic">{squadXI_4231[selectedXIPosition as keyof typeof squadXI_4231].role}</div>
                      </div>

                      <div>
                        <div className="text-[10px] text-fb-muted font-bold tracking-wider uppercase mb-1">Oyuncu İsmi</div>
                        <div className="text-sm font-black text-fb-yellow">
                          {squadXI_4231[selectedXIPosition as keyof typeof squadXI_4231].name} (#{squadXI_4231[selectedXIPosition as keyof typeof squadXI_4231].no})
                        </div>
                      </div>

                      <div className="h-px bg-white/5" />

                      <div>
                        <div className="text-[10px] text-fb-muted font-bold tracking-wider uppercase mb-1.5Packed">Editör Taktik Yorumu</div>
                        <p className="text-xs text-slate-300 leading-relaxed font-semibold">
                          Fenerbahçe’nin bu dizilişte en kritik noktası, merkez ikilinin ({squadXI_4231.DM1.name} & {squadXI_4231.DM2.name}) top kaybı sonrası geçiş savunmasında doğru konumlanması olacaktır. {squadXI_4231[selectedXIPosition as keyof typeof squadXI_4231].name} bu planda kritik rol üstlenmektedir.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="pt-6 border-t border-white/[0.05] mt-6">
                <span className="text-[10px] text-fb-muted font-bold uppercase tracking-widest block mb-2">Taktik Kadro Notu</span>
                <p className="text-xs text-slate-400 leading-normal">
                  Fenerbahçe’nin bu dizilişte en kritik noktası, merkez ikilinin top kaybı sonrası geçiş savunmasında doğru konumlanması olacak.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: Maç Önü Taktik Notları */}
      <section id="tactical-notes-section" className="space-y-6">
        <div className="text-left space-y-1.5">
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-fb-yellow">DETAYLI ANALİZ NOTLARI</span>
          <h2 className="text-3xl font-display font-black text-white italic uppercase">Maç Önü Taktik Notları</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tacticalNotes.map((note) => (
            <div 
              key={note.id}
              className="p-6 rounded-2xl bg-[#111624] border border-white/[0.06] hover:border-fb-yellow/20 transition-all text-left space-y-4 shadow-md relative"
            >
              <div className="w-8 h-8 rounded-lg bg-fb-yellow/10 border border-fb-yellow/30 flex items-center justify-center text-fb-yellow font-display font-bold italic text-sm">
                !
              </div>
              <h3 className="text-lg font-black text-white italic">{note.title}</h3>
              <p className="text-slate-300 text-xs leading-relaxed font-semibold">
                {note.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 6: Maçın Kilit Oyuncuları */}
      <section id="key-players-section" className="space-y-6">
        <div className="text-left space-y-1.5">
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-fb-yellow">SCOUT & SAVAŞ DEĞERLENDİRMELERİ</span>
          <h2 className="text-3xl font-display font-black text-white italic uppercase">Maçın Kilit Oyuncuları</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {keyPlayers.map((player) => (
            <div 
              key={player.id}
              className="p-6 rounded-2xl bg-fb-card border border-white/[0.06] hover:border-fb-yellow/10 transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-black text-white italic">{player.name}</h3>
                    <span className="text-xs text-fb-yellow font-bold uppercase tracking-wider">{player.role}</span>
                  </div>
                  <div className="px-2.5 py-1.5 rounded-lg bg-fb-yellow/10 border border-fb-yellow/20 text-center text-fb-yellow shrink-0">
                    <div className="text-[8px] font-black leading-none uppercase">ETKİ PUANI</div>
                    <div className="text-[13px] font-black leading-none mt-1">{player.score}</div>
                  </div>
                </div>

                <p className="text-xs text-fb-muted leading-relaxed font-semibold pt-2 border-t border-white/5">
                  <strong>Önem Derecesi Neden Yüksek:</strong> {player.reason}
                </p>
              </div>

              <div className="pt-4 border-t border-white/5 text-left mt-6 flex justify-between items-center text-[10px] text-fb-yellow font-black uppercase tracking-wider">
                <span>Maç Önü İstatistikleri</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 7: Taraftar Tahmini (Firebase Readiness) */}
      <section id="fan-poll-section" className="rounded-3xl bg-[#121724] border border-white/[0.08] p-6 md:p-8 relative overflow-hidden">
        {/* Subtle glow decorative sphere */}
        <div className="absolute right-0 top-0 w-80 h-80 bg-fb-yellow/5 rounded-full blur-[80px] pointer-events-none" />

        <div className="max-w-3xl space-y-6 relative z-10 text-left">
          <div className="flex items-center gap-2 text-fb-yellow">
            <Vote className="w-5 h-5 text-fb-yellow" />
            <span className="text-xs font-black uppercase tracking-widest">TARAFTAR KATILIM KÖŞESİ</span>
          </div>
          
          <h2 className="text-2xl md:text-3xl font-display font-black text-white italic uppercase">Bu Karşılaşma Nasıl Sonuçlanır?</h2>
          
          <p className="text-xs text-fb-muted leading-relaxed font-semibold">
            Fenerbahçe analiz topluluğunun derbi beklentisini ölçüyoruz. Oyunuz kaydedildiğinde diğer taraftarların anlık yüzdesel dağılımını görebilirsiniz.
          </p>

          {!pollVotes.voted ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
              <button 
                onClick={() => handleVote('home')}
                className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-fb-yellow font-black text-sm text-center text-white transition-all hover:scale-[1.01]"
              >
                Fenerbahçe Kazanır
              </button>
              <button 
                onClick={() => handleVote('draw')}
                className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-fb-yellow font-black text-sm text-center text-white transition-all hover:scale-[1.01]"
              >
                Beraberlik
              </button>
              <button 
                onClick={() => handleVote('away')}
                className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-fb-yellow font-black text-sm text-center text-white transition-all hover:scale-[1.01]"
              >
                Rakip Kazanır
              </button>
            </div>
          ) : (
            <div className="space-y-4 pt-4">
              <div className="text-xs text-[#3DDC97] font-bold flex items-center gap-2 uppercase">
                <span className="h-2 w-2 rounded-full bg-[#3DDC97]" /> Oyunuz Kaydedildi! Toplu Taraftar Sonuçları:
              </div>
              <div className="space-y-3 max-w-xl">
                {/* Home bar */}
                <div>
                  <div className="flex justify-between text-xs font-bold text-white mb-1.5">
                    <span>Fenerbahçe Galibiyeti</span>
                    <span>{homePct}%</span>
                  </div>
                  <div className="h-3 rounded-full bg-white/5 overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${homePct}%` }}
                      className="h-full bg-fb-yellow rounded-full" 
                    />
                  </div>
                </div>

                {/* Draw bar */}
                <div>
                  <div className="flex justify-between text-xs font-bold text-white mb-1.5">
                    <span>Beraberlik</span>
                    <span>{drawPct}%</span>
                  </div>
                  <div className="h-3 rounded-full bg-white/5 overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${drawPct}%` }}
                      className="h-full bg-slate-400 rounded-full" 
                    />
                  </div>
                </div>

                {/* Away bar */}
                <div>
                  <div className="flex justify-between text-xs font-bold text-white mb-1.5">
                    <span>Rakip Takım Galibiyeti</span>
                    <span>{awayPct}%</span>
                  </div>
                  <div className="h-3 rounded-full bg-white/5 overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${awayPct}%` }}
                      className="h-full bg-rose-500 rounded-full" 
                    />
                  </div>
                </div>
              </div>

              <div className="text-[10px] text-fb-muted italic pt-1 flex justify-between max-w-xl font-bold">
                <span>Ek katılım: canli veri tabani</span>
                <span>Toplam Sürüm Oyu: {totalVotes}</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* SECTION 8: Son Maç Raporları */}
      <section id="recent-match-reports" className="space-y-6">
        <div className="text-left space-y-1.5">
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-fb-yellow">AKTARILMIŞ ARŞİV</span>
          <h2 className="text-3xl font-display font-black text-white italic uppercase">Son Maç Raporları</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {recentReports.map((report) => (
            <div 
              key={report.id}
              className="p-6 rounded-2xl bg-fb-card border border-white/[0.06] hover:border-fb-yellow/20 transition-all flex flex-col justify-between"
            >
              <div className="space-y-4 text-left">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-fb-yellow">
                  <span>{report.tag}</span>
                  <span className="text-fb-muted">{report.date}</span>
                </div>
                <h3 className="text-xl font-black text-white italic leading-tight">{report.title}</h3>
                <p className="text-xs text-fb-muted leading-relaxed font-semibold line-clamp-3">
                  {report.excerpt}
                </p>
              </div>

              <div className="pt-6 border-t border-white/5 mt-6 flex justify-between items-center">
                <span className="text-[9px] text-fb-muted font-bold block">EDITÖR ONAYLI</span>
                <button 
                  onClick={() => onNavigate('analysis')}
                  className="px-4 py-2 bg-white/5 hover:bg-fb-yellow hover:text-fb-navy transition-all text-[11px] font-black uppercase rounded-lg"
                >
                  Raporu Oku
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 9: Maç Sonu Analiz Formatı */}
      <section id="post-match-formats-section" className="space-y-6">
        <div className="text-left space-y-1.5">
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-fb-yellow">REKÜRREN ANALİST STRÜKTÜRÜ</span>
          <h2 className="text-3xl font-display font-black text-white italic uppercase">Maç Sonu Analiz Formatı</h2>
        </div>

        <div className="p-6 md:p-8 rounded-3xl bg-fb-card/50 border border-white/[0.08] text-left">
          <p className="text-xs text-fb-muted leading-relaxed font-semibold mb-6 max-w-2xl border-b border-white/5 pb-4">
            Her müsabakanın son düdüğüyle birlikte Fenerbahçe Evreni analiz kadrosu sahada olan hiçbir detayı kaçırmayacak şu format şablonunda derin analiz raporlarını üyelerimize servis eder:
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {postMatchFormats.map((format, i) => (
              <div key={i} className="p-4 rounded-xl bg-fb-dark/75 border border-white/5 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-fb-yellow/10 text-fb-yellow flex items-center justify-center text-[10px] font-black shrink-0">
                    {i + 1}
                  </div>
                  <span className="text-xs font-black text-white uppercase tracking-wider">{format.name}</span>
                </div>
                <p className="text-[11px] text-fb-muted font-semibold leading-relaxed">{format.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 10: Premium Teaser */}
      <section id="premium-match-teaser" className="pt-2">
        <div className="rounded-3xl bg-gradient-to-r from-fb-card to-[#121825] border border-fb-yellow/20 p-8 md:p-12 relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-8 shadow-2xl">
          {/* Subtle sparkling overlay */}
          <div className="absolute left-1/4 top-0 w-32 h-32 bg-fb-yellow/5 rounded-full blur-[40px] pointer-events-none" />

          <div className="space-y-4 max-w-xl text-left relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-fb-yellow/10 border border-fb-yellow/30 text-[10px] font-black uppercase text-fb-yellow tracking-widest">
              <Sparkles className="w-3.5 h-3.5 fill-current" /> PREMİUM DEĞER KATAR
            </div>
            <h2 className="text-2xl md:text-3xl font-display font-black text-white italic uppercase leading-none">Detaylı Maç Raporları Premium’da</h2>
            <p className="text-xs text-fb-muted leading-relaxed font-semibold">
              Her maçtan sonra çok daha kapsamlı taktik ısı haritaları, oyuncu performans radar grafikleri, Mourinho tercih karnesi ve indirilebilir PDF analiz arşivi için hemen bekleme listesine katılın.
            </p>
          </div>

          <div className="relative z-10 shrink-0 w-full md:w-80">
            <AnimatePresence mode="wait">
              {!newsletterJoined ? (
                <motion.form 
                  key="form"
                  onSubmit={handleNewsletterJoin}
                  className="space-y-3 w-full"
                >
                  <input 
                    type="email" 
                    required
                    placeholder="E-posta adresin"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-lg bg-fb-dark border border-white/10 text-white placeholder:text-fb-muted focus:outline-none focus:border-fb-yellow text-xs font-semibold text-center"
                  />
                  <button
                    type="submit"
                    className="w-full py-3.5 bg-fb-yellow hover:bg-white text-fb-navy font-black text-xs uppercase tracking-wider rounded-lg transition-all shadow-[0_4px_22px_rgba(255,210,31,0.25)]"
                  >
                    Premium Listesine Katıl
                  </button>
                </motion.form>
              ) : (
                <motion.div 
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold text-center"
                >
                  <div className="text-sm font-black mb-1">Listeye Kaydoldunuz! 🎉</div>
                  <p className="text-fb-muted leading-tight">
                    Lansmana özel indirim kodunuz ve ilk haftalık bülten PDF'iniz hazır olduğunda bu e-posta adresine gönderilecektir.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

    </div>
  );
};

export default MacMerkeziPage;
