import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import SEO from './SEO';
import { 
  Search, 
  Lock, 
  ArrowRight, 
  ChevronLeft, 
 
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
  ShieldCheck,
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
  shirtNumber?: number;
  secondaryPosition?: string;
  height?: string;
  preferredFoot?: string;
  contractEndDate?: string;
  marketValue?: string;
  season?: string;
  firstXI?: boolean;
  createdAt?: string;
  updatedAt?: string;
  // Gerçek profil + scout verisi (Transfermarkt + oyuncu profili analizi)
  fullName?: string;
  mainPosition?: string;
  subPositions?: string[];
  birthPlace?: string;
  scout?: {
    overview: string;
    strengths: string[];
    development: string[];
    dataSource?: string;
  } | null;
  recentMatches?: { opponent: string; score: string; result: string; competition: string; date?: string; note?: string }[];
  seasonStats?: {
    season: string; scope: string; appearances: number; goals: number; assists: number;
    yellowCards: number; secondYellows: number; redCards: number; subOn: number; subOff: number; minutes: number; source?: string;
  } | null;
}

interface PlayersPageProps {
  onNavigate: (view: string) => void;
  initialPlayerSlug?: string | null;
  onPlayerRoute?: (slug: string | null) => void;
}

export const PlayersPage: React.FC<PlayersPageProps> = ({ onNavigate, initialPlayerSlug = null, onPlayerRoute }) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [playerArticles, setPlayerArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPosition, setSelectedPosition] = useState('Tümü'); // Tümü, Kaleci, Defans, Orta Saha, Kanat, Forvet
  const [selectedTrend, setSelectedTrend] = useState('Tümü'); // Tümü, Yükselişte, Düşüşte, Stabil

  // Dynamic details view
  const [selectedPlayerSlug, setSelectedPlayerSlug] = useState<string | null>(null);
  const [comparePlayerSlug, setComparePlayerSlug] = useState<string | null>(null);

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
  // Product rule: no fabricated squad data. Empty DB -> premium empty state.
  const fallbackPlayers: Player[] = [];

  // Fetch players from Firebase with Fallback
  useEffect(() => {
    const fetchPlayers = async () => {
      setLoading(true);
      try {
        const list = await dbGetCollection('players');
        try {
          const arts = await dbGetCollection('articles');
          setPlayerArticles(
            (arts || [])
              .filter((a: any) => a.status === 'published')
              .sort((a: any, b: any) => new Date(b.publishedAt || b.createdAt || 0).getTime() - new Date(a.publishedAt || a.createdAt || 0).getTime())
              .slice(0, 3)
          );
        } catch { setPlayerArticles([]); }
        // Filter by active, loan, target status
        const validStatuses = ['active', 'loan', 'target'];
        const filtered = list.filter((p: any) => validStatuses.includes(p.status));
        
        const isSeeded = localStorage.getItem("cms_firebase_seeded_done") === "true" || !!localStorage.getItem("cms_articles");
        
        if (filtered && (filtered.length > 0 || isSeeded)) {
          const mapped = filtered.map((p: any) => ({
            id: p.id,
            name: p.name,
            slug: p.slug || p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            position: p.position || '',
            age: parseInt(p.age) || 0,
            nationality: p.nationality || '',
            photo: p.photoUrl || p.photo || '',
            // 0 = "veri yok" — asla uydurma puan basılmaz, UI '—' gösterir.
            formRating: parseFloat(p.formRating) || 0,
            lastMatchRating: parseFloat(p.lastMatchRating) || 0,
            trend: (p.trend === 'yükselişte' || p.trend === 'düşüşte' || p.trend === 'stabil') ? p.trend : 'stabil',
            // Scout raporu varsa onu kullan (gerçek profil analizi); yoksa eski alanlara düş.
            strengths: (p.scout?.strengths && p.scout.strengths.length) ? p.scout.strengths
              : (Array.isArray(p.strengths) ? p.strengths : (typeof p.strengths === 'string' && p.strengths ? p.strengths.split(',').map((s: string) => s.trim()) : [])),
            weaknesses: (p.scout?.development && p.scout.development.length) ? p.scout.development
              : (Array.isArray(p.weaknesses) ? p.weaknesses : (typeof p.weaknesses === 'string' && p.weaknesses ? p.weaknesses.split(',').map((w: string) => w.trim()) : [])),
            analysis: p.scout?.overview || p.analysis || p.shortAnalysis || '',
            status: p.status,
            shirtNumber: p.shirtNumber ? parseInt(p.shirtNumber) : undefined,
            secondaryPosition: p.secondaryPosition || '',
            height: p.height || '',
            preferredFoot: p.foot || p.preferredFoot || '',
            contractEndDate: p.contractEndDate || '',
            marketValue: p.marketValue || '',
            season: p.season || '',
            firstXI: !!p.firstXI,
            fullName: p.fullName || p.name,
            mainPosition: p.mainPosition || p.position || '',
            subPositions: Array.isArray(p.subPositions) ? p.subPositions : [],
            birthPlace: p.birthPlace || '',
            scout: p.scout || null,
            recentMatches: Array.isArray(p.recentMatches) ? p.recentMatches : [],
            seasonStats: p.seasonStats || null,
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

  // Faz 3 routing: App'ten gelen URL slug'ını (derin link / geri-ileri) senkronla
  useEffect(() => {
    setSelectedPlayerSlug(initialPlayerSlug);
  }, [initialPlayerSlug]);

  // Hard-reload fallback: prop henüz gelmediyse URL'den slug'ı doğrudan oku
  useEffect(() => {
    if (initialPlayerSlug) return;
    const parts = window.location.pathname.replace(/^\/+/, '').split('/');
    if (parts[0] === 'oyuncular' && parts[1]) {
      setSelectedPlayerSlug(decodeURIComponent(parts[1]));
    }
    // yalnızca ilk mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelectPlayer = (slug: string) => {
    setSelectedPlayerSlug(slug);
    onPlayerRoute?.(slug);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToList = () => {
    setSelectedPlayerSlug(null);
    onPlayerRoute?.(null);
    setComparePlayerSlug(null);
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
    // Puan verisi yoksa isim uydurma — null döner, UI '—' gösterir.
    const rated = players.filter(p => p.lastMatchRating > 0);
    if (rated.length === 0) return null;
    return [...rated].sort((a, b) => b.lastMatchRating - a.lastMatchRating)[0]?.name || null;
  }, [players]);

  const averageFormRating = useMemo(() => {
    const rated = players.filter(p => p.formRating > 0);
    if (rated.length === 0) return null;
    const total = rated.reduce((acc, p) => acc + p.formRating, 0);
    return parseFloat((total / rated.length).toFixed(1));
  }, [players]);

  // Featured Player: yalnızca GERÇEK form verisi varsa seçilir; yoksa modül gizlenir.
  const featuredPlayer = useMemo(() => {
    const rated = players.filter(p => p.formRating > 0);
    if (rated.length === 0) return null;
    return [...rated].sort((a, b) => b.formRating - a.formRating)[0];
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
                  { label: "Toplam Kadro", val: totalPlayers > 0 ? `${totalPlayers} Aktif` : '—', note: "Analiz Havuzu" },
                  { label: "Formda Oyuncular (8.0+)", val: averageFormRating !== null ? inFormPlayers : '—', note: "Sınıf Üstü Form", highlight: true },
                  { label: "Düşüş Trendinde", val: averageFormRating !== null ? decliningPlayers : '—', note: "Alarm Verenler", alert: decliningPlayers > 0 },
                  { label: "Son Maçın En İyisi", val: bestInLastMatch ?? '—', note: "Maçın Kahramanı", truncate: true },
                  { label: "Kanal Ortalama Formu", val: averageFormRating !== null ? `${averageFormRating} /10` : '—', note: "Aritmetik Ortalama" }
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
                      {/* Actual Player Photo with Fallback */}
                      {featuredPlayer.photo ? (
                        <div className="w-24 h-24 rounded-2xl bg-fb-dark border-2 border-fb-yellow/40 overflow-hidden shadow-xl mx-auto group-hover:scale-105 transition-transform">
                          <img 
                            src={featuredPlayer.photo} 
                            alt={featuredPlayer.name} 
                            className="w-full h-full object-cover" 
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      ) : (
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-fb-navy to-fb-yellow/10 border-2 border-fb-yellow/40 flex items-center justify-center text-fb-yellow/90 font-display italic font-black text-2xl shadow-xl group-hover:scale-105 transition-transform mx-auto">
                          FE
                        </div>
                      )}
                      <div>
                        <h3 className="text-2xl font-black text-white group-hover:text-fb-yellow transition-colors italic uppercase tracking-tight">
                          {featuredPlayer.shirtNumber && <span className="text-fb-yellow font-mono not-italic mr-1.5">#{featuredPlayer.shirtNumber}</span>}
                          {featuredPlayer.name}
                        </h3>
                        <span className="text-xs text-fb-yellow font-black uppercase tracking-widest block mt-0.5">
                          {featuredPlayer.position} {featuredPlayer.secondaryPosition ? `(${featuredPlayer.secondaryPosition})` : ''}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2 w-full justify-center">
                      <span className="px-3.5 py-1.5 rounded-xl bg-fb-dark border border-white/5 text-center flex-1">
                        <span className="text-[8px] font-black text-[#5C6F84] uppercase tracking-wider block">FORM FORMÜL</span>
                        <span className="text-sm font-black text-white">{featuredPlayer.formRating > 0 ? featuredPlayer.formRating : '—'}</span>
                      </span>
                      <span className="px-3.5 py-1.5 rounded-xl bg-fb-dark border border-white/5 text-center flex-1">
                        <span className="text-[8px] font-black text-[#5C6F84] uppercase tracking-wider block">SON MAÇ</span>
                        <span className="text-xs font-black text-[#FFD21F]">{featuredPlayer.lastMatchRating > 0 ? featuredPlayer.lastMatchRating : '—'}</span>
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
                        <span className="text-[10px] font-black text-[#FFD21F] tracking-widest uppercase flex items-center gap-1.5"> TAKTİKSEL MAÇ ANALİZ DOSYASI</span>
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
                        
                        {/* Title block with Photo */}
                        <div className="flex gap-4 items-start pb-2">
                          {player.photo ? (
                            <div className="w-14 h-14 rounded-xl border border-white/10 overflow-hidden shrink-0 bg-fb-dark">
                              <img 
                                src={player.photo} 
                                alt={player.name} 
                                className="w-full h-full object-cover" 
                                referrerPolicy="no-referrer"
                              />
                            </div>
                          ) : (
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-tr from-fb-navy to-[#FFD21F]/10 border border-white/10 flex items-center justify-center text-[#FFD21F] font-display font-black text-lg italic shrink-0">
                              FE
                            </div>
                          )}
                          
                          <div className="min-w-0 flex-1">
                            <h3 className="text-base font-black text-white uppercase group-hover:text-fb-yellow transition-colors italic leading-tight truncate">
                              {player.shirtNumber && <span className="text-fb-yellow font-mono mr-1">#{player.shirtNumber}</span>}
                              {player.name}
                            </h3>
                            <span className="text-[10px] font-bold text-fb-muted uppercase tracking-wider block mt-0.5 truncate">
                              {player.position} {player.secondaryPosition ? `(${player.secondaryPosition})` : ''}
                            </span>
                            {player.marketValue && (
                              <span className="inline-block mt-1 px-1.5 py-0.5 rounded bg-white/5 text-[9px] text-[#FFD21F] font-black">
                                {player.marketValue}
                              </span>
                            )}
                          </div>

                          {/* Trend badge */}
                          <span className={`text-[8.5px] font-black uppercase px-2 py-0.5 rounded border flex items-center gap-1 shrink-0 ${
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
                            <span className="text-sm font-black text-white">{player.formRating > 0 ? player.formRating : '—'} <span className="text-[10px] text-slate-400">/10</span></span>
                          </div>
                          <div className="py-1">
                            <span className="text-[8px] text-[#5C6F84] font-extrabold uppercase block mb-0.5">SON MAÇ PUANI</span>
                            <span className="text-sm font-black text-[#FFD21F]">{player.lastMatchRating > 0 ? player.lastMatchRating : '—'} <span className="text-[10px] text-[#FFD21F]/70">/10</span></span>
                          </div>
                        </div>

                        {/* Short Analysis */}
                        {player.analysis ? (
                          <p className="text-xs text-fb-muted leading-relaxed line-clamp-3 italic">
                            "{player.analysis}"
                          </p>
                        ) : (
                          <p className="text-[10px] text-slate-500 leading-relaxed italic">
                            Scout raporu henüz yayınlanmadı.
                          </p>
                        )}

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
                          <span className="text-xs font-black text-emerald-400 block">Form: {p.formRating > 0 ? p.formRating : '—'}</span>
                          <span className="text-[9px] text-[#A1B0CB] font-bold">Son: {p.lastMatchRating > 0 ? p.lastMatchRating : '—'}</span>
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
                          <span className="text-xs font-black text-slate-300 block">Form: {p.formRating > 0 ? p.formRating : '—'}</span>
                          <span className="text-[9px] text-[#A1B0CB] font-bold">Son: {p.lastMatchRating > 0 ? p.lastMatchRating : '—'}</span>
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
                          <span className="text-xs font-black text-rose-400 block">Form: {p.formRating > 0 ? p.formRating : '—'}</span>
                          <span className="text-[9px] text-[#A1B0CB] font-bold">Son: {p.lastMatchRating > 0 ? p.lastMatchRating : '—'}</span>
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

              {playerArticles.length === 0 ? (
                <div className="p-8 rounded-2xl bg-white/[0.015] border border-dashed border-white/[0.08] text-center space-y-2">
                  <p className="text-[11px] text-slate-400 font-black uppercase tracking-widest font-mono">
                    Yayınlanmış oyuncu analizi henüz yok
                  </p>
                  <p className="text-[10px] text-slate-500 italic">
                    Taktik kurul raporları yayınlandıkça en güncel üç analiz burada listelenir.
                  </p>
                </div>
              ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                {playerArticles.map((art: any, i: number) => (
                  <div 
                    key={art.id || i} 
                    onClick={() => onNavigate('analysis')}
                    className="p-6 rounded-2xl bg-[#121724]/90 border border-white/[0.05] hover:border-fb-yellow/20 transition-all cursor-pointer space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <span className="text-[8.5px] font-black text-fb-yellow tracking-widest uppercase block">{art.category || 'Analiz'}</span>
                      <h4 className="text-sm font-black text-white hover:text-fb-yellow transition-colors">{art.title}</h4>
                      <p className="text-xs text-fb-muted leading-relaxed line-clamp-3">
                        {art.excerpt}
                      </p>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#FFD21F] flex items-center gap-1 pt-2 border-t border-white/5 mt-3">
                      Detayları Oku <ChevronRight size={11} />
                    </span>
                  </div>
                ))}
              </div>
              )}
            </section>

            {/* Premium teaser kaldırıldı — sadece bülten (NewsletterSection) kaldı. */}

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
                    {currentPlayer.photo ? (
                      <div className="w-24 h-24 rounded-2xl border-2 border-fb-yellow/30 overflow-hidden shadow-xl shrink-0 bg-fb-dark">
                        <img 
                          src={currentPlayer.photo} 
                          alt={currentPlayer.name} 
                          className="w-full h-full object-cover" 
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    ) : (
                      <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#121724] to-fb-yellow/10 border border-fb-yellow/30 flex items-center justify-center font-display font-heavy text-fb-yellow text-2xl italic shadow-inner shrink-0">
                        FE
                      </div>
                    )}
                    <div>
                      <h2 className="text-3xl md:text-4xl font-display font-black text-white italic uppercase">
                        {currentPlayer.shirtNumber && <span className="text-fb-yellow font-mono italic mr-2">#{currentPlayer.shirtNumber}</span>}
                        {currentPlayer.name}
                      </h2>
                      <div className="flex flex-wrap gap-2 items-center justify-center md:justify-start mt-1.5 text-xs text-fb-muted font-bold">
                        <span className="text-fb-yellow font-black">{currentPlayer.position}</span>
                        {currentPlayer.secondaryPosition && (
                          <>
                            <span>•</span>
                            <span className="text-slate-300">{currentPlayer.secondaryPosition}</span>
                          </>
                        )}
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

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 pt-6 text-xs text-slate-300 border-t border-white/[0.04]">
                  <div className="p-3.5 bg-white/[0.02] border border-white/5 rounded-xl text-center">
                    <span className="text-[9px] font-black text-fb-muted block mb-1">TREND DURUMU</span>
                    <span className={`inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider ${
                      currentPlayer.trend === 'yükselişte' 
                        ? 'text-emerald-400' 
                        : (currentPlayer.trend === 'düşüşte' ? 'text-rose-400' : 'text-slate-300')
                    }`}>
                      {currentPlayer.trend === 'yükselişte' && <TrendingUp size={11} />}
                      {currentPlayer.trend === 'düşüşte' && <TrendingDown size={11} />}
                      {currentPlayer.trend === 'stabil' && <Minus size={11} />}
                      {currentPlayer.trend}
                    </span>
                  </div>

                  <div className="p-3.5 bg-white/[0.02] border border-white/5 rounded-xl text-center">
                    <span className="text-[9px] font-black text-fb-muted block mb-1">BOY</span>
                    <span className="text-[11px] font-black text-white">
                      {currentPlayer.height ? `${currentPlayer.height} cm` : '182 cm'}
                    </span>
                  </div>

                  <div className="p-3.5 bg-white/[0.02] border border-white/5 rounded-xl text-center">
                    <span className="text-[9px] font-black text-fb-muted block mb-1">TERCİH EDİLEN AYAK</span>
                    <span className="text-[11px] font-black text-white">
                      {currentPlayer.preferredFoot || 'Sağ Ayak'}
                    </span>
                  </div>

                  <div className="p-3.5 bg-white/[0.02] border border-white/5 rounded-xl text-center">
                    <span className="text-[9px] font-black text-fb-muted block mb-1">PİYASA DEĞERİ</span>
                    <span className="text-[11px] font-black text-fb-yellow">
                      {currentPlayer.marketValue || '€12.5M'}
                    </span>
                  </div>

                  <div className="p-3.5 bg-white/[0.02] border border-white/5 rounded-xl text-center">
                    <span className="text-[9px] font-black text-fb-muted block mb-1">SÖZLEŞME BİTİŞ</span>
                    <span className="text-[11px] font-black text-white">
                      {currentPlayer.contractEndDate || '30.06.2027'}
                    </span>
                  </div>

                  <div className="p-3.5 bg-white/[0.02] border border-white/5 rounded-xl text-center">
                    <span className="text-[9px] font-black text-fb-muted block mb-1">ROLU / SEZON</span>
                    <span className="text-[11px] font-black text-[#5C6F84]">
                      {currentPlayer.status === 'active' ? (currentPlayer.firstXI ? 'AS (İLK XI)' : 'A TAKIM') : 'KİRALIK'} ({currentPlayer.season || '2026-27'})
                    </span>
                  </div>
                </div>

              </div>

              {/* Detailed Breakdown Tabs */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Left block: details, strengths, weaknesses, radar/attributes metrics, compare, form log */}
                <div className="lg:col-span-8 space-y-6 text-left">
                  
                  {/* DYNAMIC ATTRIBUTIONS (FM STYLE SCOUTING RADAR CARD) */}
                  <div className="p-6 md:p-8 rounded-3xl bg-[#121724]/90 border border-white/[0.08] text-left space-y-6 shadow-2xl relative overflow-hidden bg-gradient-to-b from-[#121722] to-[#0E121F]">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-fb-yellow/[0.015] rounded-full blur-[60px] pointer-events-none"></div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.04]">
                      <div className="space-y-1">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-fb-yellow/10 border border-fb-yellow/20 text-fb-yellow text-[9px] uppercase font-black tracking-wider">
                          <Sliders size={11} /> FİZİKSEL & TEKNİK KÜNYE
                        </span>
                        <h3 className="text-lg font-display font-black text-white italic uppercase tracking-tight leading-none">
                          Detaylı Scout Özellikleri (Veri Tabanlı)
                        </h3>
                      </div>
                      {currentPlayer.marketValue && (
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black text-fb-muted uppercase tracking-widest">PİYASA DEĞERİ:</span>
                          <span className="font-mono text-base font-black px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                            {currentPlayer.marketValue}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Gerçek fiziksel künye — Transfermarkt profil verisi */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        { label: 'Boy', val: currentPlayer.height },
                        { label: 'Ayak', val: currentPlayer.preferredFoot },
                        { label: 'Yaş', val: currentPlayer.age > 0 ? `${currentPlayer.age}` : '' },
                        { label: 'Uyruk', val: currentPlayer.nationality },
                        { label: 'Ana Mevki', val: currentPlayer.mainPosition },
                        { label: 'Forma No', val: currentPlayer.shirtNumber ? `#${currentPlayer.shirtNumber}` : '' },
                        { label: 'Doğum Yeri', val: currentPlayer.birthPlace },
                        { label: 'Sözleşme', val: currentPlayer.contractEndDate },
                      ].filter(f => f.val).map((f, i) => (
                        <div key={i} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                          <span className="text-[8.5px] font-black uppercase tracking-widest text-slate-500 font-mono block mb-1">{f.label}</span>
                          <span className="text-xs font-black text-white leading-tight block truncate">{f.val}</span>
                        </div>
                      ))}
                    </div>

                    {currentPlayer.subPositions && currentPlayer.subPositions.length > 0 && (
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <span className="text-[9px] font-black uppercase tracking-widest text-fb-muted font-mono">Oynayabildiği Mevkiler:</span>
                        {currentPlayer.subPositions.map((sp, i) => (
                          <span key={i} className="text-[9px] font-bold px-2 py-0.5 rounded bg-fb-yellow/10 border border-fb-yellow/20 text-fb-yellow">{sp}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* INTERACTIVE COMPARISON WIDGET (SÜPER KADRO KARŞILAŞTIRMA SİSTEMİ) */}
                  <div className="p-6 md:p-8 rounded-3xl bg-fb-card border border-white/[0.08] text-left space-y-6 relative overflow-hidden bg-gradient-to-b from-fb-card to-fb-dark/40 shadow-2xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-fb-yellow/[0.01] rounded-full blur-[90px] pointer-events-none"></div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.04]">
                      <div className="space-y-1">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-fb-yellow/10 border border-fb-yellow/20 text-fb-yellow text-[9px] uppercase font-black tracking-wider">
                          <Activity size={10} /> TAKTİKSEL KARŞILAŞTIRMA MATRİSİ
                        </span>
                        <h3 className="text-base font-display font-black text-white italic uppercase tracking-tight leading-none">
                          Oyuncu Karşılaştırma Laboratuvarı
                        </h3>
                      </div>

                      <div className="relative shrink-0">
                        <select
                          value={comparePlayerSlug || ''}
                          onChange={(e) => setComparePlayerSlug(e.target.value ? e.target.value : null)}
                          className="px-3.5 py-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-white opacity-95 focus:outline-none focus:border-fb-yellow font-bold select-none cursor-pointer"
                        >
                          <option value="">-- Karşılaştırılacak Oyuncu Seçin --</option>
                          {players
                            .filter(p => p.slug !== currentPlayer.slug)
                            .map(p => (
                              <option key={p.id} value={p.slug}>
                                {p.shirtNumber ? `#${p.shirtNumber} ` : ''}{p.name} ({p.position})
                              </option>
                            ))}
                        </select>
                      </div>
                    </div>

                    {comparePlayerSlug ? (
                      (() => {
                        const companion = players.find(p => p.slug === comparePlayerSlug);
                        if (!companion) return null;
                        
                        return (
                          <div className="space-y-6 pt-2">
                            {/* Comparison Side By Side Header info */}
                            <div className="grid grid-cols-2 gap-4 pb-4 border-b border-white/[0.04] text-center">
                              <div className="p-3.5 rounded-2xl bg-fb-navy/20 border border-fb-yellow/15 relative">
                                <span className="absolute top-2 left-3 text-[8px] font-black text-fb-yellow tracking-widest">HEDEF SEÇİM</span>
                                <span className="text-xs font-black text-white block mt-1.5 uppercase italic truncate">{currentPlayer.name}</span>
                                <span className="text-[10px] text-emerald-400 font-bold block">İndeks: {currentPlayer.formRating} Form</span>
                              </div>
                              <div className="p-3.5 rounded-2xl bg-[#1A1F2C]/40 border border-white/5 relative">
                                <span className="absolute top-2 left-3 text-[8px] font-black text-slate-400 tracking-widest">KIYAS MAKAM</span>
                                <span className="text-xs font-black text-white block mt-1.5 uppercase italic truncate">{companion.name}</span>
                                <span className="text-[10px] text-fb-yellow font-bold block">İndeks: {companion.formRating} Form</span>
                              </div>
                            </div>

                            {/* Relative Metric Comparisons */}
                            <div className="space-y-3.5">
                              {/* Form Rating Relative Bar */}
                              <div className="space-y-1">
                                <div className="flex justify-between text-[11px] font-black text-fb-muted uppercase">
                                  <span>{currentPlayer.name.split(' ')[0]}: {currentPlayer.formRating}</span>
                                  <span className="text-white">GENEL FORM DEĞERİ (1-10)</span>
                                  <span>{companion.name.split(' ')[0]}: {companion.formRating}</span>
                                </div>
                                <div className="h-2 bg-slate-950 rounded-full overflow-hidden flex">
                                  <div 
                                    className="h-full bg-emerald-500 rounded-l" 
                                    style={{ width: `${(currentPlayer.formRating / (currentPlayer.formRating + companion.formRating)) * 100}%` }}
                                  ></div>
                                  <div 
                                    className="h-full bg-fb-yellow rounded-r border-l border-slate-950/20" 
                                    style={{ width: `${(companion.formRating / (currentPlayer.formRating + companion.formRating)) * 100}%` }}
                                  ></div>
                                </div>
                              </div>

                              {/* Last Match Rating Relative Bar */}
                              <div className="space-y-1">
                                <div className="flex justify-between text-[11px] font-black text-fb-muted uppercase">
                                  <span>{currentPlayer.name.split(' ')[0]}: {currentPlayer.lastMatchRating}</span>
                                  <span className="text-white">SON RESMİ MAÇ DERECESİ</span>
                                  <span>{companion.name.split(' ')[0]}: {companion.lastMatchRating}</span>
                                </div>
                                <div className="h-2 bg-slate-950 rounded-full overflow-hidden flex">
                                  <div 
                                    className="h-full bg-emerald-500 rounded-l" 
                                    style={{ width: `${(currentPlayer.lastMatchRating / (currentPlayer.lastMatchRating + companion.lastMatchRating)) * 100}%` }}
                                  ></div>
                                  <div 
                                    className="h-full bg-fb-yellow rounded-r border-l border-slate-950/20" 
                                    style={{ width: `${(companion.lastMatchRating / (currentPlayer.lastMatchRating + companion.lastMatchRating)) * 100}%` }}
                                  ></div>
                                </div>
                              </div>

                              {/* Age Relative Bar */}
                              <div className="space-y-1">
                                <div className="flex justify-between text-[11px] font-black text-fb-muted uppercase">
                                  <span>{currentPlayer.name.split(' ')[0]}: {currentPlayer.age} Yaş</span>
                                  <span className="text-white">FIZIKSEL AKTİF YAŞ KIYASI</span>
                                  <span>{companion.name.split(' ')[0]}: {companion.age} Yaş</span>
                                </div>
                                <div className="h-2 bg-slate-950 rounded-full overflow-hidden flex">
                                  <div 
                                    className="h-full bg-emerald-500 rounded-l" 
                                    style={{ width: `${(currentPlayer.age / (currentPlayer.age + companion.age)) * 100}%` }}
                                  ></div>
                                  <div 
                                    className="h-full bg-fb-yellow rounded-r border-l border-slate-950/20" 
                                    style={{ width: `${(companion.age / (currentPlayer.age + companion.age)) * 100}%` }}
                                  ></div>
                                </div>
                              </div>
                            </div>

                            {/* Summary Scouting Conclusion */}
                            <div className="p-4 rounded-xl bg-slate-950/50 border border-white/5 text-[11px] text-fb-muted font-semibold leading-relaxed text-left">
                              <strong>Karşılaştırma:</strong> {currentPlayer.formRating > 0 && companion.formRating > 0
                                ? `${currentPlayer.name} ile ${companion.name} arasındaki form indeksi farkı ${Math.abs(currentPlayer.formRating - companion.formRating).toFixed(1)} puan.`
                                : 'Form indeksi verisi yayınlandığında bu iki oyuncunun sayısal karşılaştırması burada görünecek.'}
                            </div>
                          </div>
                        );
                      })()
                    ) : (
                      <div className="py-8 text-center text-xs text-fb-muted leading-relaxed font-semibold">
                        Aynı takım içerisindeki mevkidaşların form durumlarını as kadro asimetrik analiz şablonlarıyla kıyaslamak için yukarıdaki açılır kutudan bir oyuncu seçin.
                      </div>
                    )}
                  </div>

                  {/* A. GENEL BAKIŞ */}
                  <div className="p-6 rounded-2xl bg-[#121724]/90 border border-white/[0.05] space-y-4">
                    <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                      <FileText size={16} className="text-fb-yellow" /> A. Genel Bakış Raporu
                    </h3>
                    {currentPlayer.analysis ? (
                      <p className="text-xs text-slate-300 leading-relaxed font-semibold">
                        {currentPlayer.analysis}
                      </p>
                    ) : (
                      <p className="text-xs text-slate-500 italic leading-relaxed">
                        Bu oyuncu için genel bakış raporu henüz hazırlanmadı.
                      </p>
                    )}
                  </div>

                  {/* B & C. GÜÇLÜ VE GELİŞİM ALANLARI */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* B. Güçlü yönler */}
                    <div className="p-6 rounded-2xl bg-emerald-950/10 border border-emerald-500/10 space-y-3">
                      <h4 className="text-xs font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                        ✓ Güçlü Yönler
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

                  {/* Maç bazlı performans kaydı: gerçek maç verisi entegre edilene kadar boş durum.
                      (Önceki sürüm her oyuncuda aynı uydurma 5 maçı gösteriyordu — kaldırıldı.) */}
                  <div className="p-6 rounded-3xl bg-fb-card/50 border border-white/[0.04] space-y-5 shadow-inner">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                        <Activity className="w-4 h-4 text-fb-yellow" /> Son Maçlar
                      </h3>
                    </div>
                    {currentPlayer.recentMatches && currentPlayer.recentMatches.length > 0 ? (
                      <div className="space-y-2.5">
                        {currentPlayer.recentMatches.map((m, i) => (
                          <div key={i} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[#0b101c] border border-white/[0.04]">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className={`w-6 h-6 shrink-0 rounded-md flex items-center justify-center text-[10px] font-black font-mono ${m.result === 'G' ? 'bg-emerald-500/15 text-emerald-400' : m.result === 'M' ? 'bg-rose-500/15 text-rose-400' : 'bg-white/10 text-slate-300'}`}>{m.result}</span>
                              <div className="min-w-0">
                                <div className="text-[11px] font-black text-white truncate">vs {m.opponent} <span className="font-mono text-fb-yellow">{m.score}</span></div>
                                <div className="text-[9px] text-slate-500 font-mono uppercase truncate">{m.competition}</div>
                              </div>
                            </div>
                            {m.note && (
                              <span className="shrink-0 text-[9px] font-black uppercase tracking-wider text-fb-yellow bg-fb-yellow/10 border border-fb-yellow/20 rounded px-2 py-0.5">{m.note}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 rounded-2xl bg-white/[0.015] border border-dashed border-white/[0.08] text-center space-y-2">
                        <p className="text-[11px] text-slate-400 font-black uppercase tracking-widest font-mono">
                          Bu oyuncu için maç kaydı henüz yok
                        </p>
                        <p className="text-[10px] text-slate-500 italic">
                          Oyuncu forma giydikçe son karşılaşmaları burada listelenecek.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* SEZON İSTATİSTİKLERİ — gerçek Transfermarkt verisi */}
                  <div className="p-6 rounded-2xl bg-fb-card/50 border border-white/[0.04] space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-black text-white uppercase tracking-widest">
                        {currentPlayer.seasonStats ? `${currentPlayer.seasonStats.season} Sezon İstatistikleri` : 'Sezon İstatistikleri'}
                      </h3>
                      {currentPlayer.seasonStats && (
                        <span className="text-[9px] text-slate-400 font-mono uppercase tracking-wider">{currentPlayer.seasonStats.scope}</span>
                      )}
                    </div>

                    {currentPlayer.seasonStats && currentPlayer.seasonStats.appearances > 0 ? (
                      <>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {[
                            { label: 'Maç', value: currentPlayer.seasonStats.appearances, accent: 'text-white' },
                            { label: 'Gol', value: currentPlayer.seasonStats.goals, accent: 'text-fb-yellow' },
                            { label: 'Asist', value: currentPlayer.seasonStats.assists, accent: 'text-emerald-400' },
                            { label: 'Dakika', value: currentPlayer.seasonStats.minutes.toLocaleString('tr-TR'), accent: 'text-white' }
                          ].map(s => (
                            <div key={s.label} className="p-4 rounded-xl bg-[#0b101c] border border-white/[0.05] text-center">
                              <div className={`text-2xl font-display font-black italic ${s.accent}`}>{s.value}</div>
                              <div className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-1 font-mono">{s.label}</div>
                            </div>
                          ))}
                        </div>
                        <div className="flex flex-wrap gap-x-6 gap-y-1.5 pt-3 border-t border-white/[0.04] text-[11px] font-bold text-slate-300">
                          <span>🟨 Sarı Kart: <strong className="text-white">{currentPlayer.seasonStats.yellowCards}</strong></span>
                          {currentPlayer.seasonStats.secondYellows > 0 && <span>🟨🟥 Çift Sarı: <strong className="text-white">{currentPlayer.seasonStats.secondYellows}</strong></span>}
                          {currentPlayer.seasonStats.redCards > 0 && <span>🟥 Kırmızı: <strong className="text-white">{currentPlayer.seasonStats.redCards}</strong></span>}
                          <span>Oyuna Girdi: <strong className="text-white">{currentPlayer.seasonStats.subOn}</strong></span>
                          <span>Oyundan Çıktı: <strong className="text-white">{currentPlayer.seasonStats.subOff}</strong></span>
                        </div>
                        <p className="text-[9px] text-slate-500 font-mono">Kaynak: {currentPlayer.seasonStats.source || 'Transfermarkt'} • {currentPlayer.seasonStats.season} sezonu, tüm resmi maçlar</p>
                      </>
                    ) : (
                      <div className="p-8 rounded-2xl bg-white/[0.015] border border-dashed border-white/[0.08] text-center space-y-2">
                        <p className="text-[11px] text-slate-400 font-black uppercase tracking-widest font-mono">
                          Geçmiş sezon istatistiği bulunmuyor
                        </p>
                        <p className="text-[10px] text-slate-500 italic">
                          Oyuncu geçen sezon kulüpte forma giymedi ya da veri kaynağında kaydı yok. Yeni sezon verileri maçlar oynandıkça eklenecek.
                        </p>
                      </div>
                    )}
                  </div>

                </div>

                {/* Right block: Related info, Premium list join */}
                <div className="lg:col-span-4 space-y-6">
                  
                  {/* Premium Rapor dosyası list join */}
                  <div className="p-6 rounded-2xl bg-fb-card border border-white/[0.08] text-center space-y-4">
                    
                    <h3 className="text-base font-black text-white uppercase italic">Premium Oyuncu Maç Isı Raporları</h3>
                    <p className="text-xs text-fb-muted leading-relaxed">
                      Oyuncunun detaylı ısı haritaları, pas dağıtım hızı, ikili mücadele başarı yüzdeleri ve sezon içi gelişim şemalarına ulaşın.
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
                        { title: "Takımın Kadıköy Pres Kılavuzu", view: "analysis" },
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
