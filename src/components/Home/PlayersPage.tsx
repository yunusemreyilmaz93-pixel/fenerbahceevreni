import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import SEO from './SEO';
import { 
  Search, 
  Lock, 
  ArrowRight, 
  ChevronLeft, 
  Sparkles, 
  CheckCircle, 
  User, 
  TrendingUp, 
  Award, 
  ChevronRight,
  TrendingDown,
  Minus,
  HelpCircle,
  FileText,
  BadgeAlert,
  Sliders,
  Zap,
  Flame,
  Star,
  Activity,
  Award as RibbonIcon,
  ShieldAlert,
  Target
} from 'lucide-react';
import { dbGetCollection, dbAddDocument } from '../../lib/dbService';

interface Player {
  id: string;
  name: string;
  slug: string;
  position: string; // Kaleci, Stoper, Defans, Orta Saha, Kanat, Forvet etc
  age: number;
  nationality: string;
  photo?: string;
  formRating: number;
  lastMatchRating: number;
  trend: 'yükselişte' | 'düşüşte' | 'stabil';
  strengths: string[];
  weaknesses: string[];
  analysis: string;
  status: 'active' | 'loan' | 'target';
  createdAt?: string;
  updatedAt?: string;
}

interface PlayersPageProps {
  onNavigate: (view: string) => void;
}

export const PlayersPage: React.FC<PlayersPageProps> = ({ onNavigate }) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPosition, setSelectedPosition] = useState('Tümü'); // Tümü, Kaleci, Defans, Orta Saha, Kanat, Forvet
  const [selectedTrend, setSelectedTrend] = useState('Tümü'); // Tümü, Yükselişte, Düşüşte, Stabil

  // Dynamic details view
  const [selectedPlayerSlug, setSelectedPlayerSlug] = useState<string | null>(null);

  // Waitlist email form inside premium teaser
  const [waitlistEmail, setWaitlistEmail] = useState('');
  const [waitlistSubscribed, setWaitlistSubscribed] = useState(false);
  const [waitlistLoading, setWaitlistLoading] = useState(false);

  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 4000);
  };

  // High-fidelity fallback mock dataset matching requested descriptions
  const fallbackPlayers: Player[] = [
    {
      id: "plyr-mock-1",
      name: "Kaleci Profili(L. Dominik)",
      slug: "kaleci-profili-dominik",
      position: "Kaleci",
      age: 28,
      nationality: "Hırvatistan",
      formRating: 7.8,
      lastMatchRating: 8.1,
      trend: "yükselişte",
      strengths: ["Refleks", "Ayak kullanımı", "Pozisyon alma"],
      weaknesses: ["Yan toplar", "Oyun sıkışınca uzun pas isabeti"],
      analysis: "Son maçlarda özellikle çizgi refleksleri ve oyun kurulurken baskı altında ayak şut ve pas sakinliğiyle öne çıkıyor. Savunma arkası sarkan toplarda uyanık duruş sergiliyor.",
      status: "active"
    },
    {
      id: "plyr-mock-2",
      name: "Lider Stoper (A. Djiku)",
      slug: "lider-stoper-djiku",
      position: "Defans",
      age: 30,
      nationality: "Gana",
      formRating: 8.2,
      lastMatchRating: 8.0,
      trend: "stabil",
      strengths: ["Hava topları", "Liderlik", "Pozisyon bilgisi"],
      weaknesses: ["Açık alan hızı", "Yüksek pres altında dripling çıkışı"],
      analysis: "Savunma hattının yerleşimini yönlendiren, pas istasyonlarında emniyet supabı olan ve özellikle duran toplarda kafayla tehlikeler eriten kusursuz bir stoper profili.",
      status: "active"
    },
    {
      id: "plyr-mock-3",
      name: "Sol Bek (Ferdi K.)",
      slug: "sol-bek-ferdi-kadioglu",
      position: "Defans",
      age: 25,
      nationality: "Türkiye",
      formRating: 7.1,
      lastMatchRating: 6.8,
      trend: "stabil",
      strengths: ["Bindirme", "Orta", "Sonsuz Enerji"],
      weaknesses: ["Savunma arkası kademesi", "Fiziksel omuz omuza presi"],
      analysis: "Hücumda sol iç koridoru üçleyerek takıma muhteşem asimetrik genişlik sağlıyor ancak arkasına atılan ani uzun toplarda zaman zaman kademede açıklar oluşabiliyor.",
      status: "active"
    },
    {
      id: "plyr-mock-4",
      name: "Merkez 6 (İsmail Y.)",
      slug: "merkez-6-ismail",
      position: "Orta Saha",
      age: 26,
      nationality: "Türkiye",
      formRating: 8.4,
      lastMatchRating: 8.3,
      trend: "yükselişte",
      strengths: ["Top kazanma", "İlk pas kalitesi", "Geçiş savunması önleyici"],
      weaknesses: ["Uzaktan şut isabeti", "Agresyon sarı kart riski"],
      analysis: "Takımın savunma emniyetini üst derecede sağlayan, rakibin kontra ataklarını ilk saniyede kesen ve ayağına gelen topu en temiz arkadaşına çıkaran ön alan savaşçısı.",
      status: "active"
    },
    {
      id: "plyr-mock-5",
      name: "Box-to-box (Fred R.)",
      slug: "box-to-box-fred",
      position: "Orta Saha",
      age: 24,
      nationality: "Brezilya",
      formRating: 7.6,
      lastMatchRating: 7.4,
      trend: "stabil",
      strengths: ["Oyun içi Enerji", "Ön alan presi", "Top Taşıma hacmi"],
      weaknesses: ["Son karar kalitesi", "Yay çevresinde gereksiz fauller"],
      analysis: "Yüksek enerjisiyle merkezde tempo sağlıyor fakat üçüncü bölgeye girerken verdiği son pas kararlarında ve top kayıplarında gelişim alanı bulunmaktadır.",
      status: "active"
    },
    {
      id: "plyr-mock-6",
      name: "Yaratıcı 10 (Szymański)",
      slug: "yaratici-10-szymanski",
      position: "Orta Saha",
      age: 29,
      nationality: "Polonya",
      formRating: 7.9,
      lastMatchRating: 8.0,
      trend: "yükselişte",
      strengths: ["Son bitirici pas", "Duran top üstünlüğü", "Oyun görüşü"],
      weaknesses: ["Pres direnci zafiyeti", "Geri koşu sprint tekrarları"],
      analysis: "Kapalı ve derinde bekleyen savunmalara karşı final pası, ince zeka ürünü ara koşular ve mükemmel duran top kalitesiyle fark yaratarak kilidi açabiliyor.",
      status: "active"
    },
    {
      id: "plyr-mock-7",
      name: "Sağ Kanat (İrfan Can)",
      slug: "sag-kanat-irfan-can",
      position: "Kanat",
      age: 23,
      nationality: "Türkiye",
      formRating: 7.5,
      lastMatchRating: 7.8,
      trend: "yükselişte",
      strengths: ["Hız", "Bire bir çalım", "İçe sürpriz kat"],
      weaknesses: ["Savunma geri dönüş katkısı", "Dar alanda fiziksel temas kaybı"],
      analysis: "Bire bir izole tehdidiyle rakip sol bekleri sürekli geriye iterek Kadıköy bütününde üstünlük kuruyor ancak topsuz oyundaki savunma koşularında devamlılığı değişmeli.",
      status: "active"
    },
    {
      id: "plyr-mock-8",
      name: "Sol Kanat (D. Tadić)",
      slug: "sol-kanat-tadic-analiz",
      position: "Kanat",
      age: 27,
      nationality: "Sırbistan",
      formRating: 6.9,
      lastMatchRating: 6.4,
      trend: "düşüşte",
      strengths: ["Şut isabeti", "Küratör Teknik", "Ceza sahası koşusu"],
      weaknesses: ["Atletik hız eksiği", "Dar alan pres yorulması"],
      analysis: "Teknik kalitesi tartışmasız son derece yüksek fakat yoğun maç trafiğinde son haftalarda fiziksel olarak oyun arası süreklilik ve hücum karar keskinliği düştü.",
      status: "active"
    },
    {
      id: "plyr-mock-9",
      name: "Bitirici Forvet (E. Džeko)",
      slug: "bitirici-forvet-edin-dzeko",
      position: "Forvet",
      age: 31,
      nationality: "Bosna Hersek",
      formRating: 7.7,
      lastMatchRating: 7.2,
      trend: "stabil",
      strengths: ["Klinik Bitiricilik", "Ceza sahası pozisyonu", "Sırtı dönük duvar"],
      weaknesses: ["Pres yoğunluğu hızı", "Yüksek şiddetli sprint dayanıklılığı"],
      analysis: "Ceza sahasında topla buluşunca öldürücü bir tehdittir ancak modern Mourinho oyun planındaki önden başlatılan pres setlerine katkısı zaman zaman aksamaktadır.",
      status: "active"
    },
    {
      id: "plyr-mock-10",
      name: "Genç Yetenek (Yunus Emre)",
      slug: "genc-yetenek-yunus-emre",
      position: "Orta Saha",
      age: 19,
      nationality: "Türkiye",
      formRating: 7.2,
      lastMatchRating: 7.0,
      trend: "yükselişte",
      strengths: ["Gelecek Potansiyeli", "Sert top tekniği", "Cesur top taşıma"],
      weaknesses: ["Fiziksel gövde kuvveti", "Süper lig maç tecrübesi"],
      analysis: "Son dakikalarda oyuna girip cesur oyunu, derin pas denemeleriyle dikkat çekiyor. Doğru fiziksel gelişim planıyla çok yakın zamanda adından söz ettirecektir.",
      status: "active"
    }
  ];

  // Fetch players from Firebase with Fallback
  useEffect(() => {
    const fetchPlayers = async () => {
      setLoading(true);
      try {
        const list = await dbGetCollection('players');
        // Filter by active, loan, target status
        const validStatuses = ['active', 'loan', 'target'];
        const filtered = list.filter((p: any) => validStatuses.includes(p.status));
        
        if (filtered && filtered.length > 0) {
          const mapped = filtered.map((p: any) => ({
            id: p.id,
            name: p.name,
            slug: p.slug || p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            position: p.position || 'Orta Saha',
            age: parseInt(p.age) || 25,
            nationality: p.nationality || 'Türkiye',
            photo: p.photo || '',
            formRating: parseFloat(p.formRating) || 7.0,
            lastMatchRating: parseFloat(p.lastMatchRating) || 7.0,
            trend: (p.trend === 'yükselişte' || p.trend === 'düşüşte' || p.trend === 'stabil') ? p.trend : 'stabil',
            strengths: Array.isArray(p.strengths) ? p.strengths : (typeof p.strengths === 'string' ? p.strengths.split(',').map((s: string) => s.trim()) : ["Kazanma Hırsı"]),
            weaknesses: Array.isArray(p.weaknesses) ? p.weaknesses : (typeof p.weaknesses === 'string' ? p.weaknesses.split(',').map((w: string) => w.trim()) : ["Kondisyon"]),
            analysis: p.analysis || p.shortAnalysis || 'Detaylı scout raporu yakında eklenecek.',
            status: p.status
          }));
          setPlayers(mapped);
        } else {
          setPlayers(fallbackPlayers);
        }
      } catch (err) {
        console.error("Firebase players retrieval failed, fallback loaded:", err);
        setPlayers(fallbackPlayers);
      } finally {
        setLoading(false);
      }
    };
    fetchPlayers();
  }, []);

  // Sync hash routing for shareable URL
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#/oyuncular/')) {
        const slug = hash.replace('#/oyuncular/', '');
        if (slug) {
          setSelectedPlayerSlug(slug);
        } else {
          setSelectedPlayerSlug(null);
        }
      } else {
        setSelectedPlayerSlug(null);
      }
    };
    window.addEventListener('hashchange', handleHash);
    handleHash();
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const handleSelectPlayer = (slug: string) => {
    window.location.hash = `#/oyuncular/${slug}`;
    setSelectedPlayerSlug(slug);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToList = () => {
    window.location.hash = '#/oyuncular';
    setSelectedPlayerSlug(null);
  };

  // Waitlist submit
  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!waitlistEmail || !waitlistEmail.includes('@')) {
      showToast('Lütfen geçerli bir e-posta adresi yazın.', 'error');
      return;
    }
    setWaitlistLoading(true);
    try {
      await dbAddDocument('newsletter', {
        email: waitlistEmail.trim(),
        source: 'premium_player_scout_waitlist',
        subscribedAt: new Date().toISOString(),
        status: 'active',
        isPremiumWaitlist: true,
        interestedPlayerSlug: selectedPlayerSlug || 'general_players'
      });
      setWaitlistSubscribed(true);
      setWaitlistEmail('');
      showToast('Kayıt alındı! Premium oyuncu performans analizleri bülteni için sıraya eklendiniz. 🔔');
    } catch (err) {
      console.error(err);
      showToast('Kayıt eklenirken bir siber hata meydana geldi.', 'error');
    } finally {
      setWaitlistLoading(false);
    }
  };

  // Stats overviews matching exact prompt requests
  const totalPlayers = players.length;
  
  const inFormPlayers = useMemo(() => {
    return players.filter(p => p.formRating >= 8.0).length;
  }, [players]);

  const decliningPlayers = useMemo(() => {
    return players.filter(p => p.trend === 'düşüşte').length;
  }, [players]);

  const bestInLastMatch = useMemo(() => {
    if (players.length === 0) return 'Yok';
    // Find player with highest lastMatchRating
    const sorted = [...players].sort((a, b) => b.lastMatchRating - a.lastMatchRating);
    return sorted[0]?.name || 'Yok';
  }, [players]);

  const averageFormRating = useMemo(() => {
    if (players.length === 0) return 0;
    const total = players.reduce((acc, p) => acc + p.formRating, 0);
    return parseFloat((total / players.length).toFixed(1));
  }, [players]);

  // Featured Player calculation (highest form rating player)
  const featuredPlayer = useMemo(() => {
    if (players.length === 0) return null;
    return [...players].sort((a, b) => b.formRating - a.formRating)[0];
  }, [players]);

  // Frontend filters application
  const filteredPlayers = useMemo(() => {
    return players.filter(p => {
      // 1. Text Search query matching name, position, or nationality
      const q = searchQuery.toLowerCase();
      const matchesSearch = 
        p.name.toLowerCase().includes(q) || 
        p.position.toLowerCase().includes(q) || 
        p.nationality.toLowerCase().includes(q);

      // 2. Position pill filter
      let matchesPosition = false;
      if (selectedPosition === 'Tümü') {
        matchesPosition = true;
      } else if (selectedPosition === 'Kaleci') {
        matchesPosition = p.position.toLowerCase().includes('kaleci');
      } else if (selectedPosition === 'Defans') {
        matchesPosition = p.position.toLowerCase().includes('defans') || p.position.toLowerCase().includes('stoper') || p.position.toLowerCase().includes('bek');
      } else if (selectedPosition === 'Orta Saha') {
        matchesPosition = p.position.toLowerCase().includes('orta saha') || p.position.toLowerCase().includes('libero') || p.position.toLowerCase().includes('10 numara');
      } else if (selectedPosition === 'Kanat') {
        matchesPosition = p.position.toLowerCase().includes('kanat');
      } else if (selectedPosition === 'Forvet') {
        matchesPosition = p.position.toLowerCase().includes('forvet') || p.position.toLowerCase().includes('santrfor');
      }

      // 3. Trend filter (Tümü, Yükselişte, Düşüşte, Stabil)
      let matchesTrend = false;
      if (selectedTrend === 'Tümü') {
        matchesTrend = true;
      } else if (selectedTrend === 'Yükselişte') {
        matchesTrend = p.trend === 'yükselişte';
      } else if (selectedTrend === 'Düşüşte') {
        matchesTrend = p.trend === 'düşüşte';
      } else if (selectedTrend === 'Stabil') {
        matchesTrend = p.trend === 'stabil';
      }

      return matchesSearch && matchesPosition && matchesTrend;
    });
  }, [players, searchQuery, selectedPosition, selectedTrend]);

  // Trend Columns division for FormTrendSection
  const risingPlayersList = useMemo(() => players.filter(p => p.trend === 'yükselişte'), [players]);
  const stablePlayersList = useMemo(() => players.filter(p => p.trend === 'stabil'), [players]);
  const decliningPlayersList = useMemo(() => players.filter(p => p.trend === 'düşüşte'), [players]);

  // Selected Player Detail
  const currentPlayer = useMemo(() => {
    if (!selectedPlayerSlug) return null;
    return players.find(p => p.slug === selectedPlayerSlug);
  }, [players, selectedPlayerSlug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#070b13]">
        <div className="space-y-4 text-center">
          <div className="w-12 h-12 border-4 border-fb-yellow border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-black uppercase text-fb-yellow tracking-[0.2em] animate-pulse">SQUAD INDEKS & PERFORMANS ANALIZLERI YÜKLENIYOR...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0A0E17] min-h-screen text-slate-100 relative overflow-hidden">
      {currentPlayer ? (
        <SEO 
          title={`${currentPlayer.name} Oyuncu Analizi | Fenerbahçe Evreni`}
          description={`${currentPlayer.name} oyuncu performans analizi, form durumu, güçlü ve zayıf yönler ve son maç istatistik değerlendirmesi.`}
          canonical={`https://fenerbahceevreni.com/oyuncular/${currentPlayer.slug}`}
          ogImage={currentPlayer.imageUrl}
        />
      ) : (
        <SEO 
          title="Oyuncular | Fenerbahçe Evreni"
          description="Fenerbahçe futbol takımı oyuncularının form durumları, bireysel maç performans endeksleri, güçlü/zayıf özellikleri ve bağımsız analiz dökümanları."
          canonical="https://fenerbahceevreni.com/oyuncular"
        />
      )}
      
      {/* Toast notifier */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`fixed bottom-6 right-6 z-[200] max-w-sm p-4 rounded-xl shadow-2xl border text-xs font-bold flex items-center gap-3 ${
              toastMsg.type === 'success' 
                ? 'bg-emerald-950/90 border-emerald-500/30 text-emerald-400' 
                : 'bg-rose-950/90 border-rose-500/30 text-rose-400'
            }`}
          >
            <CheckCircle size={16} className="shrink-0 animate-bounce" />
            <span>{toastMsg.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {!currentPlayer ? (
          /* ========================================================================= */
          /* 1. SQUAD OVERVIEW ARCHIVE LIST VIEW                                      */
          /* ========================================================================= */
          <motion.div
            key="squad-archive"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="pb-24 text-left"
          >
            {/* HERO MODULE */}
            <header className="relative pt-28 pb-12 bg-gradient-to-b from-fb-navy/30 to-transparent border-b border-white/[0.04]">
              <div className="container mx-auto px-6 max-w-6xl space-y-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-fb-yellow/10 border border-fb-yellow/20 text-fb-yellow text-[10px] uppercase font-black tracking-widest">
                  <Activity size={12} className="animate-pulse" /> Profesyonel Form & Performans Departmanı
                </div>
                
                <h1 className="text-4xl md:text-5xl font-display font-black text-white italic uppercase tracking-tight leading-none">
                  OYUNCULAR
                </h1>
                
                <p className="text-sm text-fb-muted max-w-2xl font-semibold leading-relaxed">
                  Fenerbahçe kadrosundaki oyuncuların dahi anlık form durumlarını, son maç puanlarını, detaylı taktiksel formasyon esnekliklerini, güçlü yönlerini, gelişim alanlarını ve haftalık yükseliş/düşüş trendlerini veri matrisi eşliğinde takip edin.
                </p>

                {/* Info pills inside hero header */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {['Form Durumu', 'Son Maç Puanı', 'Oyuncu Analizi', 'Güçlü Yönler', 'Zayıf Yönler', 'Trend Takibi'].map((inf) => (
                    <span key={inf} className="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-slate-300">
                      • {inf}
                    </span>
                  ))}
                </div>
              </div>
            </header>

            {/* SQUAD OVERVIEW STATS BOXES SECTION */}
            <section className="container mx-auto px-6 max-w-6xl py-8">
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                
                {[
                  { label: "Toplam Kadro", val: `${totalPlayers} Aktif`, note: "Analiz Havuzu" },
                  { label: "Formda Oyuncular (8.0+)", val: inFormPlayers, note: "Sınıf Üstü Form", highlight: true },
                  { label: "Düşüş Trendinde", val: decliningPlayers, note: "Alarm Verenler", alert: decliningPlayers > 0 },
                  { label: "Son Maçın En İyisi", val: bestInLastMatch, note: "Maçın Kahramanı", truncate: true },
                  { label: "Kanal Ortalama Formu", val: `${averageFormRating} /10`, note: "Aritmetik Ortalama" }
                ].map((stat, i) => (
                  <div key={i} className="p-4 rounded-xl bg-fb-card border border-white/[0.06] flex flex-col justify-between space-y-2">
                    <span className="text-[9px] font-extrabold uppercase tracking-wider text-fb-muted">{stat.label}</span>
                    <div>
                      <span className={`text-xl md:text-2xl font-display font-black leading-none block truncate ${
                        stat.highlight ? 'text-emerald-400' : (stat.alert ? 'text-amber-400' : 'text-white')
                      }`}>
                        {stat.val}
                      </span>
                      <span className="text-[10px] text-fb-muted font-bold block mt-1">{stat.note}</span>
                    </div>
                  </div>
                ))}

              </div>
            </section>

            {/* FEATURED BEST PLAYER SUMMARY */}
            {featuredPlayer && (
              <section className="container mx-auto px-6 max-w-6xl py-8">
                <div className="mb-4">
                  <span className="text-[10px] font-black uppercase tracking-[0.25em] text-fb-yellow block">Haftanın En Yüksek Ortalama Form Puanı</span>
                  <h2 className="text-xl font-display font-black text-white uppercase italic">Zirvedeki Performans</h2>
                </div>

                <div 
                  onClick={() => handleSelectPlayer(featuredPlayer.slug)}
                  className="group rounded-3xl bg-fb-card border border-white/[0.08] hover:border-fb-yellow/30 transition-all cursor-pointer overflow-hidden grid grid-cols-1 lg:grid-cols-12 shadow-2xl bg-gradient-to-r from-fb-card to-[#121826]"
                >
                  {/* Left portion */}
                  <div className="lg:col-span-4 p-8 flex flex-col justify-between items-center text-center bg-fb-dark/45 border-r border-white/[0.04]">
                    <div className="space-y-4 py-4">
                      {/* Abstract Silhouette representation */}
                      <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-fb-navy to-fb-yellow/10 border-2 border-fb-yellow/40 flex items-center justify-center text-fb-yellow/90 font-display italic font-black text-2xl shadow-xl group-hover:scale-105 transition-transform mx-auto">
                        FE
                      </div>
                      <div>
                        <h3 className="text-2xl font-black text-white group-hover:text-fb-yellow transition-colors italic uppercase tracking-tight">{featuredPlayer.name}</h3>
                        <span className="text-xs text-fb-yellow font-black uppercase tracking-widest block mt-0.5">{featuredPlayer.position}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 w-full justify-center">
                      <span className="px-3.5 py-1.5 rounded-xl bg-fb-dark border border-white/5 text-center flex-1">
                        <span className="text-[8px] font-black text-[#5C6F84] uppercase tracking-wider block">FORM FORMÜL</span>
                        <span className="text-sm font-black text-white">{featuredPlayer.formRating}</span>
                      </span>
                      <span className="px-3.5 py-1.5 rounded-xl bg-fb-dark border border-white/5 text-center flex-1">
                        <span className="text-[8px] font-black text-[#5C6F84] uppercase tracking-wider block">SON MAÇ</span>
                        <span className="text-xs font-black text-[#FFB020]">{featuredPlayer.lastMatchRating}</span>
                      </span>
                    </div>
                  </div>

                  {/* Right portion */}
                  <div className="lg:col-span-8 p-8 flex flex-col justify-between space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-white/[0.04]">
                        <div className="flex gap-4 text-xs font-bold text-fb-muted">
                          <span>Yaş: <strong className="text-slate-100">{featuredPlayer.age}</strong></span>
                          <span>Uyruk: <strong className="text-slate-100">{featuredPlayer.nationality}</strong></span>
                        </div>
                        <span className="px-3 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                          <TrendingUp size={11} /> YÜKSELİŞTE
                        </span>
                      </div>

                      <div className="space-y-2">
                        <span className="text-[10px] font-black text-[#FFB020] tracking-widest uppercase flex items-center gap-1.5"><Sparkles size={11} /> TAKTİKSEL MAÇ ANALİZ DOSYASI</span>
                        <p className="text-sm text-slate-300 leading-relaxed font-semibold">
                          {featuredPlayer.analysis}
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-white/[0.04] flex gap-2 flex-wrap items-center justify-between">
                      <div className="flex gap-1.5">
                        {featuredPlayer.strengths.slice(0, 3).map((st, i) => (
                          <span key={i} className="text-[9px] font-black uppercase bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-md">
                            + {st}
                          </span>
                        ))}
                      </div>

                      <span className="px-4 py-2.5 bg-fb-yellow hover:bg-white text-fb-navy text-[10px] font-black uppercase rounded-lg tracking-wider transition-all flex items-center gap-1.5 shadow-lg shrink-0">
                        Oyuncu Profilini Gör <ArrowRight size={12} />
                      </span>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* SEPARATE FILTER & ARTIFACT CONTROLLER */}
            <section className="container mx-auto px-6 max-w-6xl py-4">
              <div className="p-6 rounded-2xl bg-fb-card border border-white/[0.06] space-y-4">
                
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                  {/* Text search widget */}
                  <div className="relative w-full md:w-80">
                    <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-fb-muted" />
                    <input 
                      type="text" 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Oyuncu ara (isim, mevki, uyruk...)"
                      className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-fb-dark border border-white/10 text-xs text-white focus:outline-none focus:border-fb-yellow placeholder-fb-muted font-bold"
                    />
                  </div>

                  {/* Trend filtering tabs (Tümü, Yükselişte, Düşüşte, Stabil) */}
                  <div className="flex flex-wrap gap-2 items-center justify-end w-full md:w-auto">
                    <span className="text-[10px] font-black text-fb-muted uppercase tracking-widest mr-2 flex items-center gap-1"><Sliders size={11} /> Trend Durumu:</span>
                    
                    {['Tümü', 'Yükselişte', 'Stabil', 'Düşüşte'].map((tr) => (
                      <button
                        key={tr}
                        onClick={() => setSelectedTrend(tr)}
                        className={`text-[10px] font-bold px-3 py-1.5 rounded-lg border transition-all ${
                          selectedTrend === tr 
                            ? 'bg-white/14 text-white border-white/30 font-extrabold' 
                            : 'bg-white/[0.02] text-slate-400 border-transparent hover:border-white/10'
                        }`}
                      >
                        {tr}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Position Row buttons */}
                <div className="flex flex-wrap gap-2 pt-3 border-t border-white/[0.04]">
                  {['Tümü', 'Kaleci', 'Defans', 'Orta Saha', 'Kanat', 'Forvet'].map((pos) => (
                    <button
                      key={pos}
                      onClick={() => setSelectedPosition(pos)}
                      className={`text-[9px] font-black uppercase tracking-widest px-3.5 py-2 rounded-lg border transition-all ${
                        selectedPosition === pos 
                          ? 'bg-fb-yellow border-fb-yellow text-fb-navy font-bold shadow-lg shadow-fb-yellow/5' 
                          : 'bg-white/5 border-white/5 text-slate-300 hover:border-fb-yellow/30 hover:bg-white/[0.08]'
                      }`}
                    >
                      {pos}
                    </button>
                  ))}
                </div>

              </div>
            </section>

            {/* SQUAD PLAYERS RESPONSIVE GRID */}
            <section className="container mx-auto px-6 max-w-6xl py-6">
              {filteredPlayers.length === 0 ? (
                <div className="py-20 text-center max-w-sm mx-auto space-y-4">
                  <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-fb-muted mx-auto">
                    <Search size={18} />
                  </div>
                  <h3 className="text-base font-black text-white italic uppercase tracking-wider">Arama Sonucu Kalmadı</h3>
                  <p className="text-xs text-fb-muted leading-relaxed">
                    Aranan kriterlere uygun oyuncu bulunamadı. Filtreleri değiştirerek yeniden arayın.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedPosition('Tümü');
                      setSelectedTrend('Tümü');
                    }}
                    className="px-4 py-2 bg-fb-yellow hover:bg-white text-fb-navy text-[10px] font-black uppercase rounded-lg transition-all"
                  >
                    Filtreleri Sıfırla
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredPlayers.map((player, idx) => (
                    <motion.div
                      key={player.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: Math.min(idx * 0.05, 0.4) }}
                      onClick={() => handleSelectPlayer(player.slug)}
                      className="group rounded-2xl bg-fb-card border border-white/[0.06] hover:border-fb-yellow/20 flex flex-col justify-between transition-all cursor-pointer overflow-hidden p-6"
                    >
                      <div className="text-left space-y-4">
                        
                        {/* Title block */}
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-base font-black text-white uppercase group-hover:text-fb-yellow transition-colors italic leading-tight">
                              {player.name}
                            </h3>
                            <span className="text-[10px] font-bold text-fb-muted uppercase tracking-wider block mt-0.5">
                              {player.position}
                            </span>
                          </div>

                          {/* Trend badge */}
                          <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border flex items-center gap-1 shrink-0 ${
                            player.trend === 'yükselişte' 
                              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                              : (player.trend === 'düşüşte' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 'bg-slate-500/10 border-slate-500/20 text-slate-300')
                          }`}>
                            {player.trend === 'yükselişte' && <TrendingUp size={10} />}
                            {player.trend === 'düşüşte' && <TrendingDown size={10} />}
                            {player.trend === 'stabil' && <Minus size={10} />}
                            {player.trend.toUpperCase()}
                          </span>
                        </div>

                        {/* Ratings dual board */}
                        <div className="grid grid-cols-2 gap-2 py-2 border-t border-b border-white/[0.04] text-center bg-fb-dark/25 rounded-lg">
                          <div className="border-r border-white/5 py-1">
                            <span className="text-[8px] text-[#5C6F84] font-extrabold uppercase block mb-0.5">FORM PUANI</span>
                            <span className="text-sm font-black text-white">{player.formRating} <span className="text-[10px] text-slate-400">/10</span></span>
                          </div>
                          <div className="py-1">
                            <span className="text-[8px] text-[#5C6F84] font-extrabold uppercase block mb-0.5">SON MAÇ PUANI</span>
                            <span className="text-sm font-black text-[#FFB020]">{player.lastMatchRating} <span className="text-[10px] text-[#FFB020]/70">/10</span></span>
                          </div>
                        </div>

                        {/* Short Analysis */}
                        <p className="text-xs text-fb-muted leading-relaxed line-clamp-3 italic">
                          "{player.analysis}"
                        </p>

                        {/* Strengths tags */}
                        {player.strengths && player.strengths.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {player.strengths.slice(0, 3).map((st, i) => (
                              <span key={i} className="text-[8.5px] font-black uppercase px-2 py-0.5 bg-emerald-500/5 text-emerald-400 border border-emerald-500/10 rounded">
                                + {st}
                              </span>
                            ))}
                          </div>
                        )}

                      </div>

                      {/* Footer */}
                      <div className="pt-4 mt-6 border-t border-white/[0.04] flex items-center justify-between text-xs font-bold text-fb-muted">
                        <span>{player.age} Yaşında • {player.nationality}</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-fb-yellow flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                          Profili Gör <ChevronRight size={13} />
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </section>

            {/* FORM TRENDS COLUMNS (3 columns/cards) */}
            <section className="container mx-auto px-6 max-w-6xl py-12 border-t border-white/[0.03]">
              <div className="mb-8">
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-fb-yellow block mb-2">Sezon İçi Gidişat Grafiği</span>
                <h2 className="text-2xl md:text-3xl font-display font-black text-white uppercase italic">Anlık Kadro Form Trendleri</h2>
                <p className="text-xs text-[#8A99AD] mt-1">İvmesini yukarı çevirenler, gücünü koruyanlar ve toparlanması gerekenlerin taktiksel bölüşümü.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* 1. Rising players */}
                <div className="p-6 rounded-2xl bg-emerald-950/20 border border-emerald-500/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                      <TrendingUp size={14} /> Yükselişte Olanlar
                    </h3>
                    <span className="text-[10.5px] font-black px-2 py-0.5 bg-emerald-500/10 rounded-full text-emerald-400">{risingPlayersList.length}</span>
                  </div>

                  <div className="space-y-2.5">
                    {risingPlayersList.slice(0, 5).map((p) => (
                      <div 
                        key={p.id} 
                        onClick={() => handleSelectPlayer(p.slug)}
                        className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/5 hover:border-emerald-500/20 transition-all cursor-pointer flex justify-between items-center"
                      >
                        <div>
                          <span className="text-xs text-slate-100 font-extrabold block">{p.name}</span>
                          <span className="text-[9px] text-[#A1B0CB] uppercase font-bold block">{p.position}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-black text-emerald-400 block">Form: {p.formRating}</span>
                          <span className="text-[9px] text-[#A1B0CB] font-bold">Son: {p.lastMatchRating}</span>
                        </div>
                      </div>
                    ))}
                    {risingPlayersList.length === 0 && (
                      <p className="text-xs text-fb-muted italic pt-1 text-center">Formunu yükselten oyuncu bulunamadı.</p>
                    )}
                  </div>
                </div>

                {/* 2. Stable players */}
                <div className="p-6 rounded-2xl bg-slate-900/40 border border-white/[0.05] space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
                      <Minus size={14} /> Stabil Gidenler
                    </h3>
                    <span className="text-[10.5px] font-black px-2 py-0.5 bg-white/5 rounded-full text-slate-300">{stablePlayersList.length}</span>
                  </div>

                  <div className="space-y-2.5">
                    {stablePlayersList.slice(0, 5).map((p) => (
                      <div 
                        key={p.id} 
                        onClick={() => handleSelectPlayer(p.slug)}
                        className="p-3 rounded-lg bg-white/[0.01] border border-white/5 hover:border-white/10 transition-all cursor-pointer flex justify-between items-center"
                      >
                        <div>
                          <span className="text-xs text-slate-100 font-extrabold block">{p.name}</span>
                          <span className="text-[9px] text-[#A1B0CB] uppercase font-bold block">{p.position}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-black text-slate-300 block">Form: {p.formRating}</span>
                          <span className="text-[9px] text-[#A1B0CB] font-bold">Son: {p.lastMatchRating}</span>
                        </div>
                      </div>
                    ))}
                    {stablePlayersList.length === 0 && (
                      <p className="text-xs text-fb-muted italic pt-1 text-center">Performansı stabil devam eden bulunamadı.</p>
                    )}
                  </div>
                </div>

                {/* 3. Declining players */}
                <div className="p-6 rounded-2xl bg-rose-950/20 border border-rose-500/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black text-rose-400 uppercase tracking-widest flex items-center gap-1.5">
                      <TrendingDown size={14} /> Düşüşte Olanlar
                    </h3>
                    <span className="text-[10.5px] font-black px-2 py-0.5 bg-rose-500/10 rounded-full text-rose-400">{decliningPlayersList.length}</span>
                  </div>

                  <div className="space-y-2.5">
                    {decliningPlayersList.slice(0, 5).map((p) => (
                      <div 
                        key={p.id} 
                        onClick={() => handleSelectPlayer(p.slug)}
                        className="p-3 rounded-lg bg-rose-950/30 border border-rose-500/5 hover:border-rose-500/20 transition-all cursor-pointer flex justify-between items-center"
                      >
                        <div>
                          <span className="text-xs text-slate-100 font-extrabold block">{p.name}</span>
                          <span className="text-[9px] text-[#A1B0CB] uppercase font-bold block">{p.position}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-black text-rose-400 block">Form: {p.formRating}</span>
                          <span className="text-[9px] text-[#A1B0CB] font-bold">Son: {p.lastMatchRating}</span>
                        </div>
                      </div>
                    ))}
                    {decliningPlayersList.length === 0 && (
                      <p className="text-xs text-fb-muted italic pt-1 text-center">Herhangi bir performans düşüşü tespit edilmedi. Sevindirici!</p>
                    )}
                  </div>
                </div>

              </div>
            </section>

            {/* PLAYER RATING LOGIC EXPLANATION */}
            <section className="container mx-auto px-6 max-w-6xl py-12 border-t border-white/[0.03]">
              <div className="mb-8">
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-fb-yellow block mb-2">Metrik ve Temel Form Değerlendirme Yaklaşımı</span>
                <h2 className="text-2xl md:text-3xl font-display font-black text-white uppercase italic">Oyuncu Puanları Nasıl Değerlendiriliyor?</h2>
                <p className="text-xs text-[#8A99AD] mt-1">Oyuncu form durumu ve maç bülten puanlaması salt gol veya asist sayıları üstünden değil; çok yönlü veri matrisi felsefesiyle puanlanır.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { title: "Pozisyon Bilgisi", desc: "Takım yerleşim disiplini, rakip akınlarda nerede konumlanacağı, blok aralarını daraltma sezgisi ve asimetrik kademe hamleleri." },
                  { title: "Pas Kalitesi & Kurulum", desc: "Baskı altındayken bile isabetli pas oynama cesareti, dikine kilit paslar, diyagonal yön değiştirmeler ve sahadaki beyin hakimiyeti." },
                  { title: "Savunma Katkısı", desc: "Kazanılan ikili mücadeleler, geriye koşu sprintleri, ön alan pres koordinasyonu ve sahadaki basmadık santimetre bırakmama direnci." },
                  { title: "Hücum Etkisi", desc: "Rakip ceza sahasına dikine ara koşular, kilit anahtar rol asisliği, bitirici son pas vuruşları ve hücum yerleşimini dinamize etme gücü." },
                  { title: "Baskı Direnci", desc: "Üçlü pres altında gövdesini doğru kullanıp top kurtarabilme kabriyeti, çıkılması imkansız görünen dar alanları teknikle açabilme esnekliği." },
                  { title: "Karar Kalitesi", desc: "Anlık hücum ya da savunma koşularında egoist oynamayıp pas tercihini arkadaşına kullanma derecesi veya sert faul bütçesi kontrolü." }
                ].map((item, i) => (
                  <div key={i} className="p-5 rounded-xl bg-fb-card/40 border border-white/[0.04] space-y-2">
                    <span className="text-fb-yellow text-xs font-black uppercase tracking-wider block">{item.title}</span>
                    <p className="text-xs text-fb-muted leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* LATEST PLAYER ANALYSIS STRIP (Read from articles of category 'Oyuncu Analizi') */}
            <section className="container mx-auto px-6 max-w-6xl py-12 border-t border-white/[0.03]">
              <div className="mb-6">
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-fb-yellow block">Taktik Kurul Odası Raporları</span>
                <h2 className="text-xl font-display font-black text-white uppercase italic">Son Oyuncu Analizleri</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                {[
                  { title: "Orta Saha Dengesini Kim Sağlıyor?", excerpt: "İsmail Yüksek ile Fred'in yan yana oynadığı maçlardaki ortalama top kazanma bütçesi ve geçiş reaksiyon haritalarının kapsamlı taktiksel masaya yatırılışı.", date: "28 Mayıs 2026" },
                  { title: "Kanat Rotasyonunda Doğru Tercih Hangisi?", excerpt: "İrfan Can Kahveci'nin sağda yarattığı dar koridor yaratıcılığı ile sol kanattaki Tadic asimetrisinin Kadıköy maçlarındaki kırılma analizi.", date: "25 Mayıs 2026" },
                  { title: "Savunma Hattında Liderlik Problemi Var mı?", excerpt: "Süper ligin sert fizik savunma şemalarına karşı Djiku'nun önderliğindeki stoper hattının önde baskı yaparken bıraktığı tehlikeli gölgelik alanlar.", date: "22 Mayıs 2026" }
                ].map((art, i) => (
                  <div 
                    key={i} 
                    onClick={() => onNavigate('analysis')}
                    className="p-6 rounded-2xl bg-[#121724]/90 border border-white/[0.05] hover:border-fb-yellow/20 transition-all cursor-pointer space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <span className="text-[8.5px] font-black text-fb-yellow tracking-widest uppercase block">{art.date} • Oyuncu Analizi</span>
                      <h4 className="text-sm font-black text-white hover:text-fb-yellow transition-colors">{art.title}</h4>
                      <p className="text-xs text-fb-muted leading-relaxed line-clamp-3">
                        {art.excerpt}
                      </p>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#FFB020] flex items-center gap-1 pt-2 border-t border-white/5 mt-3">
                      Detayları Oku <ChevronRight size={11} />
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* PREMIUM TEASER */}
            <section className="container mx-auto px-6 max-w-6xl py-4">
              <div className="p-8 md:p-12 rounded-3xl bg-fb-card border border-white/[0.06] relative overflow-hidden flex flex-col md:flex-row gap-8 items-center justify-between text-left shadow-xl bg-gradient-to-br from-fb-card to-[#121826]">
                <div className="absolute top-0 right-0 w-80 h-80 bg-fb-yellow/[0.015] rounded-full blur-[100px] pointer-events-none"></div>
                
                <div className="space-y-3 max-w-lg text-left">
                  <div className="flex items-center gap-1.5 text-fb-yellow font-black text-[10px] tracking-widest uppercase">
                    <Sparkles size={11} className="animate-pulse" /> Sınıfının En İyisi Analiz İndeksi
                  </div>
                  <h3 className="text-2xl md:text-3xl font-display font-black text-white italic uppercase tracking-tight">
                    Detaylı Oyuncu Performans Raporları Premium'da!
                  </h3>
                  <p className="text-xs text-fb-muted leading-relaxed font-semibold">
                    Maç maç oyuncu puanları, form dalgalanma grafikleri, rakiplere özel taktik rol analizleri ve profesyonel düzeyde hazırlanmış sezon gelişim raporlarına bültenimize katılarak erken erişim kazanın.
                  </p>
                </div>

                <div className="w-full md:w-auto shrink-0 min-w-[300px]">
                  <button 
                    onClick={() => onNavigate('premium')}
                    className="w-full py-4 bg-fb-yellow hover:bg-white text-fb-navy font-black text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-lg flex items-center justify-center gap-2"
                  >
                    Premium Listesine Katıl
                  </button>
                </div>

              </div>
            </section>

          </motion.div>
        ) : (
          /* ========================================================================= */
          /* 2. DYNAMIC PLAYER GENERAL ANALYSIS DETAIL VIEW                           */
          /* ========================================================================= */
          <motion.div
            key="player-detail"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="pb-24 pt-28 text-left"
          >
            <div className="container mx-auto px-6 max-w-5xl space-y-8">
              
              {/* Back Breadcrumbs */}
              <button 
                onClick={handleBackToList}
                className="group inline-flex items-center gap-1 text-xs text-fb-muted hover:text-white transition-colors uppercase font-black tracking-widest cursor-pointer"
              >
                <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Oyuncular Listesine Dön
              </button>

              {/* Detail Header Hero Display Card */}
              <div className="p-8 rounded-3xl bg-fb-card border border-white/[0.08] relative overflow-hidden bg-gradient-to-br from-fb-card to-[#0E121E]">
                <div className="absolute top-0 right-0 w-80 h-80 bg-fb-yellow/[0.015] rounded-full blur-3xl pointer-events-none"></div>

                <div className="flex flex-col md:flex-row gap-8 items-center justify-between pb-6 border-b border-white/[0.06]">
                  
                  {/* Left Specs Title block */}
                  <div className="flex flex-col md:flex-row gap-6 items-center text-center md:text-left">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#121724] to-fb-yellow/10 border border-fb-yellow/30 flex items-center justify-center font-display font-heavy text-fb-yellow text-2xl italic shadow-inner shrink-0">
                      FE
                    </div>
                    <div>
                      <h2 className="text-3xl md:text-4xl font-display font-black text-white italic uppercase">{currentPlayer.name}</h2>
                      <div className="flex flex-wrap gap-2 items-center justify-center md:justify-start mt-1 text-xs text-fb-muted font-bold">
                        <span className="text-fb-yellow font-black">{currentPlayer.position}</span>
                        <span>•</span>
                        <span>{currentPlayer.age} Yaşında</span>
                        <span>•</span>
                        <span>{currentPlayer.nationality}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Dual ratings */}
                  <div className="flex gap-4">
                    <div className="p-4 rounded-2xl bg-fb-dark border border-white/5 text-center min-w-[90px]">
                      <span className="text-[8px] font-black text-[#5C6F84] uppercase tracking-wider block mb-1">FORM PUANI</span>
                      <span className="text-2xl font-display font-black text-emerald-400 leading-none">{currentPlayer.formRating}</span>
                      <span className="text-[10px] text-slate-400 block mt-1">/ 10.0</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-fb-dark border border-white/5 text-center min-w-[90px]">
                      <span className="text-[8px] font-black text-[#5C6F84] uppercase tracking-wider block mb-1">SON MAÇ</span>
                      <span className="text-2xl font-display font-black text-fb-yellow leading-none">{currentPlayer.lastMatchRating}</span>
                      <span className="text-[10px] text-slate-400 block mt-1">/ 10.0</span>
                    </div>
                  </div>

                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 text-xs text-slate-300">
                  <div>
                    <span className="text-[9px] font-black text-fb-muted tracking-wide uppercase block mb-1.5 flex items-center gap-1">
                      <Star size={11} className="text-fb-yellow animate-spin" /> TREND DURUMU
                    </span>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-black uppercase tracking-wider ${
                      currentPlayer.trend === 'yükselişte' 
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                        : (currentPlayer.trend === 'düşüşte' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 'bg-slate-500/10 border-slate-500/20 text-slate-300')
                    }`}>
                      {currentPlayer.trend === 'yükselişte' && <TrendingUp size={12} />}
                      {currentPlayer.trend === 'düşüşte' && <TrendingDown size={12} />}
                      {currentPlayer.trend === 'stabil' && <Minus size={12} />}
                      {currentPlayer.trend.toUpperCase()} GİDİYOR
                    </span>
                  </div>

                  <div>
                    <span className="text-[9px] font-black text-fb-muted tracking-wide uppercase block mb-1.5">OYUNCU STATÜSÜ</span>
                    <span className="inline-flex items-center gap-1 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg text-white font-extrabold text-xs uppercase tracking-wider">
                      {currentPlayer.status === 'active' ? 'AS KADRO' : (currentPlayer.status === 'loan' ? 'KİRALIK GÖNDERİLDİ' : 'TRANSFER HEDEFİ')}
                    </span>
                  </div>

                  <div>
                    <span className="text-[9px] font-black text-fb-muted tracking-wide uppercase block mb-1.5">VERİ DÜZENLEME</span>
                    <span className="inline-flex items-center gap-1 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg text-white font-extrabold text-xs uppercase tracking-wider">
                       GÜNCEL DOYARLILIK
                    </span>
                  </div>
                </div>

              </div>

              {/* Detailed Breakdown Tabs */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Left block: details, strengths, weaknesses */}
                <div className="lg:col-span-8 space-y-6 text-left">
                  
                  {/* A. GENEL BAKIŞ */}
                  <div className="p-6 rounded-2xl bg-[#121724]/90 border border-white/[0.05] space-y-4">
                    <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                      <FileText size={16} className="text-fb-yellow" /> A. Genel Bakış Raporu
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed font-semibold">
                      {currentPlayer.analysis}
                    </p>
                    <div className="p-4 rounded-xl bg-fb-navy/35 border border-white/5 text-xs text-fb-muted leading-relaxed font-semibold">
                      <strong>Scout Gözlem Notu:</strong> Oyuncunun taktik disiplinine olan saygısı ve antrenman dayanıklılığı Mourinho'nun listesine girmesindeki en büyük tetikleyici olmuştur. Süper ligin sert futbol anatomisinde ayakta kalabilecek sertliğe sahiptir.
                    </div>
                  </div>

                  {/* B & C. GÜÇLÜ VE GELİŞİM ALANLARI */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* B. Güçlü yönler */}
                    <div className="p-6 rounded-2xl bg-emerald-950/10 border border-emerald-500/10 space-y-3">
                      <h4 className="text-xs font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                        ✓ Güçlü Yönler (Analiz)
                      </h4>
                      <ul className="space-y-2">
                        {currentPlayer.strengths.map((str, i) => (
                          <li key={i} className="text-xs font-bold text-slate-200 flex items-start gap-2">
                            <span className="text-emerald-400 font-extrabold shrink-0">+</span>
                            <span>{str}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* C. Gelişim Alanları (Weaknesses) */}
                    <div className="p-6 rounded-2xl bg-rose-950/10 border border-rose-500/10 space-y-3">
                      <h4 className="text-xs font-black text-rose-400 uppercase tracking-widest flex items-center gap-1.5">
                        ⚠ Gelişim Alanları & Riskler
                      </h4>
                      <ul className="space-y-2">
                        {currentPlayer.weaknesses.map((wk, i) => (
                          <li key={i} className="text-xs font-bold text-slate-200 flex items-start gap-2">
                            <span className="text-rose-400 font-extrabold shrink-0">-</span>
                            <span>{wk}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                  </div>

                  {/* D & E. SON MAÇ PERFORMANSI & TAKTİK ROL */}
                  <div className="p-6 rounded-2xl bg-fb-card/50 border border-white/[0.04] space-y-4">
                    <h3 className="text-sm font-black text-white uppercase tracking-widest">
                      D & E. Son Maç Performansı & Taktik Rolü
                    </h3>
                    
                    <div className="space-y-2 text-xs text-fb-muted leading-relaxed">
                      <p>
                        Oyuncu, son resmi lig müsabakasında asimetrik olarak hücum hatlarını ikiye yarmada son derece başarılı oldu. Rakip orta sahanın yaptığı daraltılmış prese karşı teknik bütçesini doğru kullanarak topu oyunda tutmayı hep başardı.
                      </p>
                      
                      <div className="p-3.5 rounded-xl bg-fb-dark/80 border border-white/5 grid grid-cols-2 gap-4">
                        <div>
                          <strong className="text-slate-200 block mb-0.5">Mourinho Rol Ataması:</strong>
                          <span>Geçiş asistanı ve prese dönük tampon elemanı.</span>
                        </div>
                        <div>
                          <strong className="text-slate-200 block mb-0.5">Sezon Sonu Değerlendirmesi:</strong>
                          <span>Yüksek potansiyelli değerini koruyor.</span>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Right block: Related info, Premium list join */}
                <div className="lg:col-span-4 space-y-6">
                  
                  {/* Premium Rapor dosyası list join */}
                  <div className="p-6 rounded-2xl bg-fb-card border border-white/[0.08] text-center space-y-4">
                    <Sparkles className="w-8 h-8 text-fb-yellow mx-auto animate-bounce" />
                    <h3 className="text-base font-black text-white uppercase italic">Premium Oyuncu Maç Isı Raporları</h3>
                    <p className="text-xs text-fb-muted leading-relaxed">
                      Oyuncunun Opta ısı haritaları, pas dağıtım hızı, ikili mücadele başarı yüzdeleri ve sezon içi gelişim şemalarına ulaşın.
                    </p>
                    
                    {waitlistSubscribed ? (
                      <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-xs font-bold">
                        Premium öncü listeye katıldınız! Teşekkür ederiz.
                      </div>
                    ) : (
                      <form onSubmit={handleWaitlistSubmit} className="space-y-2">
                        <input 
                          type="email" 
                          required
                          value={waitlistEmail}
                          onChange={(e) => setWaitlistEmail(e.target.value)}
                          placeholder="E-posta adresin..."
                          className="w-full px-3 py-2 bg-fb-dark border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-fb-yellow"
                        />
                        <button 
                          type="submit" 
                          disabled={waitlistLoading}
                          className="w-full py-2 bg-fb-yellow hover:bg-white text-fb-navy text-[10px] font-black uppercase rounded-lg transition-all cursor-pointer"
                        >
                          {waitlistLoading ? 'EKLENİYOR...' : 'ÖNCÜ LİSTEYE BÖLÜN'}
                        </button>
                      </form>
                    )}
                  </div>

                  {/* Related Articles list */}
                  <div className="p-6 rounded-2xl bg-fb-card border border-white/[0.08] space-y-4 text-left">
                    <h3 className="text-xs font-black text-white uppercase tracking-widest">İlgili Diğer Analiz Dosyaları</h3>
                    
                    <div className="space-y-3">
                      {[
                        { title: "Mourinho'nun Kadıköy Pres Kılavuzu", view: "analysis" },
                        { title: "Merkez Orta Sahanın Hücum Genişleme Raporu", view: "analysis" },
                        { title: "Yeni Oyuncu Form Sıralama Şablonu", view: "players" }
                      ].map((item, idx) => (
                        <div 
                          key={idx} 
                          onClick={() => {
                            if (item.view === 'players') {
                              handleBackToList();
                            } else {
                              onNavigate(item.view);
                            }
                          }}
                          className="p-3 rounded bg-fb-dark/80 border border-white/5 hover:border-fb-yellow/20 cursor-pointer transition-all flex items-center justify-between text-xs font-bold text-slate-100"
                        >
                          <span className="truncate pr-2">{item.title}</span>
                          <ChevronRight size={14} className="shrink-0 text-fb-yellow" />
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
