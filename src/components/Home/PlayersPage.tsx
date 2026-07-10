import React, { useState, useEffect, useMemo, useDeferredValue } from 'react';
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
  const deferredSearchQuery = useDeferredValue(searchQuery);
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
        const [list, arts] = await Promise.all([
          dbGetCollection('players'),
          dbGetCollection('articles').catch(() => [])
        ]);
        setPlayerArticles(
          (arts || [])
            .filter((a: any) => a.status === 'published')
            .sort((a: any, b: any) => new Date(b.publishedAt || b.createdAt || 0).getTime() - new Date(a.publishedAt || a.createdAt || 0).getTime())
            .slice(0, 3)
        );
        // Filter by active, loan, target status (A5: no localStorage seed heuristic)
        const validStatuses = ['active', 'loan', 'target'];
        const filtered = list.filter((p: any) => validStatuses.includes(p.status));
        
        if (filtered.length > 0) {
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

  const handlePlayerLinkClick = (event: React.MouseEvent<HTMLAnchorElement>, slug: string) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    handleSelectPlayer(slug);
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
      const q = deferredSearchQuery.trim().toLocaleLowerCase('tr-TR');
      const matchesSearch = 
        p.name.toLocaleLowerCase('tr-TR').includes(q) ||
        p.position.toLocaleLowerCase('tr-TR').includes(q) ||
        p.nationality.toLocaleLowerCase('tr-TR').includes(q);

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
  }, [players, deferredSearchQuery, selectedPosition, selectedTrend]);

  // Trend Columns division for FormTrendSection
  const risingPlayersList = useMemo(() => players.filter(p => p.trend === 'yükselişte'), [players]);
  const stablePlayersList = useMemo(() => players.filter(p => p.trend === 'stabil'), [players]);
  const decliningPlayersList = useMemo(() => players.filter(p => p.trend === 'düşüşte'), [players]);

  // Selected Player Detail
  const currentPlayer = useMemo(() => {
    if (!selectedPlayerSlug) return null;
    return players.find(p => p.slug === selectedPlayerSlug);
  }, [players, selectedPlayerSlug]);

  const comparisonPlayer = useMemo(() => {
    if (!comparePlayerSlug) return null;
    return players.find(p => p.slug === comparePlayerSlug) ?? null;
  }, [players, comparePlayerSlug]);

  const comparisonMetrics = useMemo(() => {
    if (!currentPlayer || !comparisonPlayer) return [];

    return [
      { label: 'Genel Form', left: currentPlayer.formRating, right: comparisonPlayer.formRating, suffix: '/10' },
      { label: 'Son Resmî Maç', left: currentPlayer.lastMatchRating, right: comparisonPlayer.lastMatchRating, suffix: '/10' },
      { label: 'Yaş', left: currentPlayer.age, right: comparisonPlayer.age, suffix: '' }
    ].filter((metric) => metric.left > 0 && metric.right > 0);
  }, [currentPlayer, comparisonPlayer]);
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#070b13]" role="status" aria-live="polite">
        <div className="space-y-4 text-center">
          <div className="w-12 h-12 border-4 border-fb-yellow border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-bold text-fb-yellow tracking-wide animate-pulse">Kadro ve performans analizleri yükleniyor…</p>
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
          ogImage={currentPlayer.photo}
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
            role="status" aria-live="polite" className={`fixed bottom-6 right-6 z-[200] max-w-sm p-4 rounded-xl shadow-2xl border text-xs font-bold flex items-center gap-3 ${
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
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-fb-yellow/10 border border-fb-yellow/20 text-fb-yellow text-xs uppercase font-black tracking-widest">
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
                    <span key={inf} className="text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-slate-300">
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
                    <span className="text-xs font-extrabold uppercase tracking-wider text-fb-muted">{stat.label}</span>
                    <div>
                      <span className={`text-xl md:text-2xl font-display font-black leading-none block truncate ${
                        stat.highlight ? 'text-emerald-400' : (stat.alert ? 'text-amber-400' : 'text-white')
                      }`}>
                        {stat.val}
                      </span>
                      <span className="text-xs text-fb-muted font-bold block mt-1">{stat.note}</span>
                    </div>
                  </div>
                ))}

              </div>
            </section>

            {/* FEATURED BEST PLAYER SUMMARY */}
            {featuredPlayer && (
              <section className="container mx-auto px-6 max-w-6xl py-8">
                <div className="mb-4">
                  <span className="text-xs font-black uppercase tracking-[0.25em] text-fb-yellow block">Haftanın En Yüksek Ortalama Form Puanı</span>
                  <h2 className="text-xl font-display font-black text-white uppercase italic">Zirvedeki Performans</h2>
                </div>

                <a
                  href={`/oyuncular/${featuredPlayer.slug}`}
                  onClick={(event) => handlePlayerLinkClick(event, featuredPlayer.slug)}
                  className="group rounded-3xl bg-fb-card border border-white/[0.08] hover:border-fb-yellow/30 transition-colors overflow-hidden grid grid-cols-1 lg:grid-cols-12 shadow-2xl bg-gradient-to-r from-fb-card to-[#121826] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fb-yellow/70"
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
                            width={96}
                            height={96}
                            loading="lazy"
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
                        <span className="text-xs font-black text-[#5C6F84] uppercase tracking-wider block">FORM FORMÜL</span>
                        <span className="text-sm font-black text-white">{featuredPlayer.formRating > 0 ? featuredPlayer.formRating : '—'}</span>
                      </span>
                      <span className="px-3.5 py-1.5 rounded-xl bg-fb-dark border border-white/5 text-center flex-1">
                        <span className="text-xs font-black text-[#5C6F84] uppercase tracking-wider block">SON MAÇ</span>
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
                        <span className="px-3 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-black uppercase tracking-widest flex items-center gap-1">
                          <TrendingUp size={11} /> YÜKSELİŞTE
                        </span>
                      </div>

                      <div className="space-y-2">
                        <span className="text-xs font-black text-[#FFD21F] tracking-widest uppercase flex items-center gap-1.5"> TAKTİKSEL MAÇ ANALİZ DOSYASI</span>
                        <p className="text-sm text-slate-300 leading-relaxed font-semibold">
                          {featuredPlayer.analysis}
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-white/[0.04] flex gap-2 flex-wrap items-center justify-between">
                      <div className="flex gap-1.5">
                        {featuredPlayer.strengths.slice(0, 3).map((st, i) => (
                          <span key={i} className="text-xs font-black uppercase bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-md">
                            + {st}
                          </span>
                        ))}
                      </div>

                      <span className="px-4 py-2.5 bg-fb-yellow hover:bg-white text-fb-navy text-xs font-black uppercase rounded-lg tracking-wider transition-colors flex items-center gap-1.5 shadow-lg shrink-0">
                        Oyuncu Profilini Gör <ArrowRight size={12} />
                      </span>
                    </div>
                  </div>
                </a>
              </section>
            )}

            {/* SQUAD FILTERS */}
            <section className="container mx-auto px-6 max-w-6xl py-4" aria-labelledby="squad-filters-title">
              <div className="ui-card p-5 md:p-6 space-y-5">
                <div className="flex flex-col gap-1">
                  <h2 id="squad-filters-title" className="text-lg font-bold text-white">Kadroyu Filtrele</h2>
                  <p className="text-sm text-fb-muted">İsim, mevki veya form trendine göre oyuncuları bulun.</p>
                </div>

                <div className="grid gap-5 lg:grid-cols-[minmax(16rem,1fr)_2fr]">
                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-slate-200">Oyuncu Ara</span>
                    <span className="relative block">
                      <Search size={18} aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-fb-muted" />
                      <input
                        type="search"
                        name="player-search"
                        autoComplete="off"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Örn. İrfan Can, kaleci…"
                        className="min-h-11 w-full rounded-xl border border-white/10 bg-fb-dark py-3 pl-11 pr-4 text-base text-white placeholder:text-fb-muted focus-visible:border-fb-yellow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fb-yellow/30"
                      />
                    </span>
                  </label>

                  <fieldset>
                    <legend className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-200">
                      <Sliders size={16} aria-hidden="true" /> Form Trendi
                    </legend>
                    <div className="flex flex-wrap gap-2">
                      {['Tümü', 'Yükselişte', 'Stabil', 'Düşüşte'].map((trend) => (
                        <button
                          type="button"
                          key={trend}
                          aria-pressed={selectedTrend === trend}
                          onClick={() => setSelectedTrend(trend)}
                          className={`min-h-11 rounded-lg border px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fb-yellow/60 ${
                            selectedTrend === trend
                              ? 'border-white/30 bg-white/15 text-white'
                              : 'border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/25 hover:bg-white/[0.07]'
                          }`}
                        >
                          {trend}
                        </button>
                      ))}
                    </div>
                  </fieldset>
                </div>

                <fieldset className="border-t border-white/[0.06] pt-4">
                  <legend className="mb-2 text-sm font-semibold text-slate-200">Mevki</legend>
                  <div className="flex flex-wrap gap-2">
                    {['Tümü', 'Kaleci', 'Defans', 'Orta Saha', 'Kanat', 'Forvet'].map((position) => (
                      <button
                        type="button"
                        key={position}
                        aria-pressed={selectedPosition === position}
                        onClick={() => setSelectedPosition(position)}
                        className={`min-h-11 rounded-lg border px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fb-yellow/60 ${
                          selectedPosition === position
                            ? 'border-fb-yellow bg-fb-yellow text-fb-navy'
                            : 'border-white/10 bg-white/5 text-slate-300 hover:border-fb-yellow/30 hover:bg-white/[0.08]'
                        }`}
                      >
                        {position}
                      </button>
                    ))}
                  </div>
                </fieldset>
              </div>
            </section>

            {/* SQUAD PLAYERS RESPONSIVE GRID */}
            <section className="container mx-auto px-6 max-w-6xl py-6" aria-labelledby="squad-results-title">
              <div className="mb-4 flex items-end justify-between gap-4">
                <h2 id="squad-results-title" className="text-xl font-bold text-white">Oyuncular</h2>
                <p className="text-sm text-fb-muted" aria-live="polite">{filteredPlayers.length} oyuncu gösteriliyor</p>
              </div>
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
                    className="px-4 py-2 bg-fb-yellow hover:bg-white text-fb-navy text-xs font-black uppercase rounded-lg transition-colors"
                  >
                    Filtreleri Sıfırla
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredPlayers.map((player, idx) => (
                    <motion.a
                      key={player.id}
                      href={`/oyuncular/${player.slug}`}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: Math.min(idx * 0.05, 0.4) }}
                      onClick={(event) => handlePlayerLinkClick(event, player.slug)}
                      className="ui-card-interactive group flex flex-col justify-between overflow-hidden p-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fb-yellow/70 md:p-6"
                    >
                      <div className="text-left space-y-4">
                        
                        {/* Title block with Photo */}
                        <div className="flex gap-4 items-start pb-2">
                          {player.photo ? (
                            <div className="w-14 h-14 rounded-xl border border-white/10 overflow-hidden shrink-0 bg-fb-dark">
                              <img 
                                src={player.photo} 
                                alt={player.name}
                                width={56}
                                height={56}
                                loading="lazy"
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
                            <h3 className="truncate text-lg font-bold leading-tight text-white transition-colors group-hover:text-fb-yellow">
                              {player.shirtNumber && <span className="text-fb-yellow font-mono mr-1">#{player.shirtNumber}</span>}
                              {player.name}
                            </h3>
                            <span className="mt-1 block truncate text-sm font-medium text-fb-muted">
                              {player.position} {player.secondaryPosition ? `(${player.secondaryPosition})` : ''}
                            </span>
                            {player.marketValue && (
                              <span className="mt-2 inline-block rounded bg-white/5 px-2 py-1 text-xs font-semibold text-fb-yellow">
                                {player.marketValue}
                              </span>
                            )}
                          </div>

                          {/* Trend badge */}
                          <span className={`text-xs font-semibold px-2 py-1 rounded border flex items-center gap-1 shrink-0 ${
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
                            <span className="mb-1 block text-xs font-semibold text-fb-muted">Form Puanı</span>
                            <span className="text-sm font-black text-white">{player.formRating > 0 ? player.formRating : '—'} <span className="text-xs text-slate-400">/10</span></span>
                          </div>
                          <div className="py-1">
                            <span className="mb-1 block text-xs font-semibold text-fb-muted">Son Maç</span>
                            <span className="text-sm font-black text-[#FFD21F]">{player.lastMatchRating > 0 ? player.lastMatchRating : '—'} <span className="text-xs text-[#FFD21F]/70">/10</span></span>
                          </div>
                        </div>

                        {/* Short Analysis */}
                        {player.analysis ? (
                          <p className="line-clamp-3 text-sm leading-relaxed text-slate-300">
                            "{player.analysis}"
                          </p>
                        ) : (
                          <p className="text-sm leading-relaxed text-fb-muted">
                            Scout raporu henüz yayınlanmadı.
                          </p>
                        )}

                        {/* Strengths tags */}
                        {player.strengths && player.strengths.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {player.strengths.slice(0, 3).map((st, i) => (
                              <span key={i} className="text-xs font-semibold px-2 py-1 bg-emerald-500/5 text-emerald-400 border border-emerald-500/10 rounded">
                                + {st}
                              </span>
                            ))}
                          </div>
                        )}

                      </div>

                      {/* Footer */}
                      <div className="pt-4 mt-6 border-t border-white/[0.04] flex items-center justify-between text-xs font-bold text-fb-muted">
                        <span>{player.age} Yaşında • {player.nationality}</span>
                        <span className="flex items-center gap-1 text-sm font-semibold text-fb-yellow transition-transform group-hover:translate-x-1">
                          Profili Gör <ChevronRight size={13} />
                        </span>
                      </div>
                    </motion.a>
                  ))}
                </div>
              )}
            </section>

            {/* FORM TRENDS COLUMNS (3 columns/cards) */}
            <section className="container mx-auto px-6 max-w-6xl py-12 border-t border-white/[0.03]">
              <div className="mb-8">
                <span className="text-xs font-black uppercase tracking-[0.25em] text-fb-yellow block mb-2">Sezon İçi Gidişat Grafiği</span>
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
                    <span className="text-xs font-black px-2 py-0.5 bg-emerald-500/10 rounded-full text-emerald-400">{risingPlayersList.length}</span>
                  </div>

                  <div className="space-y-2.5">
                    {risingPlayersList.slice(0, 5).map((p) => (
                      <a
                        key={p.id}
                        href={`/oyuncular/${p.slug}`}
                        onClick={(event) => handlePlayerLinkClick(event, p.slug)}
                        className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/5 hover:border-emerald-500/20 transition-colors flex justify-between items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fb-yellow/60"
                      >
                        <div>
                          <span className="text-xs text-slate-100 font-extrabold block">{p.name}</span>
                          <span className="block text-xs font-medium text-fb-muted">{p.position}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-black text-emerald-400 block">Form: {p.formRating > 0 ? p.formRating : '—'}</span>
                          <span className="text-xs font-medium text-fb-muted">Son: {p.lastMatchRating > 0 ? p.lastMatchRating : '—'}</span>
                        </div>
                      </a>
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
                    <span className="text-xs font-black px-2 py-0.5 bg-white/5 rounded-full text-slate-300">{stablePlayersList.length}</span>
                  </div>

                  <div className="space-y-2.5">
                    {stablePlayersList.slice(0, 5).map((p) => (
                      <a
                        key={p.id}
                        href={`/oyuncular/${p.slug}`}
                        onClick={(event) => handlePlayerLinkClick(event, p.slug)}
                        className="p-3 rounded-lg bg-white/[0.01] border border-white/5 hover:border-white/10 transition-colors flex justify-between items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fb-yellow/60"
                      >
                        <div>
                          <span className="text-xs text-slate-100 font-extrabold block">{p.name}</span>
                          <span className="block text-xs font-medium text-fb-muted">{p.position}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-black text-slate-300 block">Form: {p.formRating > 0 ? p.formRating : '—'}</span>
                          <span className="text-xs font-medium text-fb-muted">Son: {p.lastMatchRating > 0 ? p.lastMatchRating : '—'}</span>
                        </div>
                      </a>
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
                    <span className="text-xs font-black px-2 py-0.5 bg-rose-500/10 rounded-full text-rose-400">{decliningPlayersList.length}</span>
                  </div>

                  <div className="space-y-2.5">
                    {decliningPlayersList.slice(0, 5).map((p) => (
                      <a
                        key={p.id}
                        href={`/oyuncular/${p.slug}`}
                        onClick={(event) => handlePlayerLinkClick(event, p.slug)}
                        className="p-3 rounded-lg bg-rose-950/30 border border-rose-500/5 hover:border-rose-500/20 transition-colors flex justify-between items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fb-yellow/60"
                      >
                        <div>
                          <span className="text-xs text-slate-100 font-extrabold block">{p.name}</span>
                          <span className="block text-xs font-medium text-fb-muted">{p.position}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-black text-rose-400 block">Form: {p.formRating > 0 ? p.formRating : '—'}</span>
                          <span className="text-xs font-medium text-fb-muted">Son: {p.lastMatchRating > 0 ? p.lastMatchRating : '—'}</span>
                        </div>
                      </a>
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
                <span className="text-xs font-black uppercase tracking-[0.25em] text-fb-yellow block mb-2">Metrik ve Temel Form Değerlendirme Yaklaşımı</span>
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
                <span className="text-xs font-black uppercase tracking-[0.25em] text-fb-yellow block">Taktik Kurul Odası Raporları</span>
                <h2 className="text-xl font-display font-black text-white uppercase italic">Son Oyuncu Analizleri</h2>
              </div>

              {playerArticles.length === 0 ? (
                <div className="p-8 rounded-2xl bg-white/[0.015] border border-dashed border-white/[0.08] text-center space-y-2">
                  <p className="text-xs text-slate-400 font-black uppercase tracking-widest font-mono">
                    Yayınlanmış oyuncu analizi henüz yok
                  </p>
                  <p className="text-xs text-slate-500 italic">
                    Taktik kurul raporları yayınlandıkça en güncel üç analiz burada listelenir.
                  </p>
                </div>
              ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                {playerArticles.map((art: any, i: number) => (
                  <div 
                    key={art.id || i} 
                    onClick={() => onNavigate('analysis')}
                    className="p-6 rounded-2xl bg-[#121724]/90 border border-white/[0.05] hover:border-fb-yellow/20 transition-colors cursor-pointer space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <span className="text-xs font-black text-fb-yellow tracking-widest uppercase block">{art.category || 'Analiz'}</span>
                      <h4 className="text-sm font-black text-white hover:text-fb-yellow transition-colors">{art.title}</h4>
                      <p className="text-xs text-fb-muted leading-relaxed line-clamp-3">
                        {art.excerpt}
                      </p>
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest text-[#FFD21F] flex items-center gap-1 pt-2 border-t border-white/5 mt-3">
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
                type="button"
                onClick={handleBackToList}
                className="group inline-flex min-h-11 items-center gap-2 rounded-lg text-sm font-semibold text-fb-muted transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fb-yellow/60"
              >
                <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Oyuncular Listesine Dön
              </button>

              {/* PLAYER PROFILE SUMMARY */}
              <header className="ui-card relative overflow-hidden bg-gradient-to-br from-fb-card to-[#0E121E] p-5 md:p-8">
                <div className="pointer-events-none absolute right-0 top-0 h-80 w-80 rounded-full bg-fb-yellow/[0.015] blur-3xl" />

                <div className="relative flex flex-col gap-6 border-b border-white/[0.06] pb-6 md:flex-row md:items-center md:justify-between">
                  <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:text-left">
                    {currentPlayer.photo ? (
                      <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl border-2 border-fb-yellow/30 bg-fb-dark shadow-xl">
                        <img
                          src={currentPlayer.photo}
                          alt={currentPlayer.name}
                          width={96}
                          height={96}
                          fetchPriority="high"
                          className="h-full w-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    ) : (
                      <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-fb-yellow/30 bg-gradient-to-tr from-[#121724] to-fb-yellow/10 text-2xl font-black text-fb-yellow shadow-inner">
                        FE
                      </div>
                    )}

                    <div className="min-w-0">
                      <p className="mb-2 text-sm font-semibold text-fb-yellow">{currentPlayer.position || 'Mevki belirtilmedi'}</p>
                      <h1 className="text-pretty text-3xl font-black leading-tight text-white md:text-4xl">
                        {currentPlayer.shirtNumber ? <span className="mr-2 font-mono text-fb-yellow">#{currentPlayer.shirtNumber}</span> : null}
                        {currentPlayer.name}
                      </h1>
                      <p className="mt-2 text-sm text-fb-muted">
                        {[currentPlayer.secondaryPosition, currentPlayer.age > 0 ? `${currentPlayer.age} yaş` : '', currentPlayer.nationality]
                          .filter(Boolean)
                          .join(' • ') || 'Profil bilgileri güncelleniyor'}
                      </p>
                    </div>
                  </div>

                  <dl className="grid w-full grid-cols-2 gap-3 sm:w-auto">
                    <div className="min-w-[8rem] rounded-2xl border border-white/5 bg-fb-dark p-4 text-center">
                      <dt className="mb-2 text-xs font-semibold text-fb-muted">Form Puanı</dt>
                      <dd className="tabular-nums text-2xl font-black leading-none text-emerald-400">
                        {currentPlayer.formRating > 0 ? currentPlayer.formRating : '—'}
                      </dd>
                      <dd className="mt-2 text-xs text-slate-400">{currentPlayer.formRating > 0 ? '/10' : 'Veri yok'}</dd>
                    </div>
                    <div className="min-w-[8rem] rounded-2xl border border-white/5 bg-fb-dark p-4 text-center">
                      <dt className="mb-2 text-xs font-semibold text-fb-muted">Son Maç</dt>
                      <dd className="tabular-nums text-2xl font-black leading-none text-fb-yellow">
                        {currentPlayer.lastMatchRating > 0 ? currentPlayer.lastMatchRating : '—'}
                      </dd>
                      <dd className="mt-2 text-xs text-slate-400">{currentPlayer.lastMatchRating > 0 ? '/10' : 'Veri yok'}</dd>
                    </div>
                  </dl>
                </div>

                <dl className="relative grid grid-cols-2 gap-3 pt-6 sm:grid-cols-3 lg:grid-cols-6">
                  {[
                    { label: 'Form Trendi', value: currentPlayer.trend || '—' },
                    { label: 'Boy', value: currentPlayer.height ? `${currentPlayer.height} cm` : '—' },
                    { label: 'Tercih Edilen Ayak', value: currentPlayer.preferredFoot || '—' },
                    { label: 'Piyasa Değeri', value: currentPlayer.marketValue || '—', accent: true },
                    { label: 'Sözleşme Bitişi', value: currentPlayer.contractEndDate || '—' },
                    {
                      label: 'Kadro Durumu',
                      value: currentPlayer.status === 'active'
                        ? (currentPlayer.firstXI ? 'İlk 11' : 'A Takım')
                        : currentPlayer.status === 'loan' ? 'Kiralık' : 'Transfer Hedefi'
                    }
                  ].map((fact) => (
                    <div key={fact.label} className="min-w-0 rounded-xl border border-white/5 bg-white/[0.02] p-3.5 text-center">
                      <dt className="mb-1 text-xs font-semibold text-fb-muted">{fact.label}</dt>
                      <dd className={`break-words text-sm font-bold ${fact.accent ? 'text-fb-yellow' : 'text-white'}`}>{fact.value}</dd>
                    </div>
                  ))}
                </dl>
              </header>

              {/* Detailed Breakdown Tabs */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Left block: details, strengths, weaknesses, radar/attributes metrics, compare, form log */}
                <div className="lg:col-span-8 space-y-6 text-left">
                  
                  {/* DYNAMIC ATTRIBUTIONS (FM STYLE SCOUTING RADAR CARD) */}
                  <div className="p-6 md:p-8 rounded-3xl bg-[#121724]/90 border border-white/[0.08] text-left space-y-6 shadow-2xl relative overflow-hidden bg-gradient-to-b from-[#121722] to-[#0E121F]">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-fb-yellow/[0.015] rounded-full blur-[60px] pointer-events-none"></div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.04]">
                      <div className="space-y-1">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-fb-yellow/10 border border-fb-yellow/20 text-fb-yellow text-xs uppercase font-black tracking-wider">
                          <Sliders size={11} /> FİZİKSEL & TEKNİK KÜNYE
                        </span>
                        <h3 className="text-lg font-display font-black text-white italic uppercase tracking-tight leading-none">
                          Detaylı Scout Özellikleri (Veri Tabanlı)
                        </h3>
                      </div>
                      {currentPlayer.marketValue && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-fb-muted uppercase tracking-widest">PİYASA DEĞERİ:</span>
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
                          <span className="text-xs font-black uppercase tracking-widest text-slate-500 font-mono block mb-1">{f.label}</span>
                          <span className="text-xs font-black text-white leading-tight block truncate">{f.val}</span>
                        </div>
                      ))}
                    </div>

                    {currentPlayer.subPositions && currentPlayer.subPositions.length > 0 && (
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <span className="text-xs font-black uppercase tracking-widest text-fb-muted font-mono">Oynayabildiği Mevkiler:</span>
                        {currentPlayer.subPositions.map((sp, i) => (
                          <span key={i} className="text-xs font-bold px-2 py-0.5 rounded bg-fb-yellow/10 border border-fb-yellow/20 text-fb-yellow">{sp}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* PLAYER COMPARISON */}
                  <section className="ui-card space-y-6 p-5 md:p-8" aria-labelledby="player-comparison-title">
                    <div className="flex flex-col gap-5 border-b border-white/[0.06] pb-5 sm:flex-row sm:items-end sm:justify-between">
                      <div className="space-y-2">
                        <p className="inline-flex items-center gap-2 rounded bg-fb-yellow/10 px-2.5 py-1 text-xs font-semibold text-fb-yellow">
                          <Activity size={14} aria-hidden="true" /> Oyuncu Karşılaştırması
                        </p>
                        <h2 id="player-comparison-title" className="text-xl font-bold text-white">Kadro İçi Kıyaslama</h2>
                        <p id="comparison-help" className="max-w-xl text-sm leading-relaxed text-fb-muted">
                          Yayınlanmış form, son maç ve yaş verilerini yan yana inceleyin.
                        </p>
                      </div>

                      <label className="block w-full sm:max-w-xs">
                        <span className="mb-2 block text-sm font-semibold text-slate-200">Karşılaştırılacak Oyuncu</span>
                        <select
                          name="comparison-player"
                          value={comparePlayerSlug || ''}
                          aria-describedby="comparison-help"
                          onChange={(e) => setComparePlayerSlug(e.target.value || null)}
                          className="min-h-11 w-full cursor-pointer rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2.5 text-sm text-white focus-visible:border-fb-yellow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fb-yellow/30"
                        >
                          <option value="">Oyuncu seçin…</option>
                          {players
                            .filter((player) => player.slug !== currentPlayer.slug)
                            .map((player) => (
                              <option key={player.id} value={player.slug}>
                                {player.shirtNumber ? `#${player.shirtNumber} ` : ''}{player.name} ({player.position})
                              </option>
                            ))}
                        </select>
                      </label>
                    </div>

                    <div aria-live="polite">
                      {comparisonPlayer ? (
                        <div className="space-y-5">
                          <div className="grid grid-cols-2 gap-3 text-center">
                            {[currentPlayer, comparisonPlayer].map((player, index) => (
                              <div key={player.id} className={`min-w-0 rounded-2xl border p-4 ${index === 0 ? 'border-fb-yellow/20 bg-fb-navy/20' : 'border-white/10 bg-white/[0.03]'}`}>
                                <span className="mb-1 block text-xs font-semibold text-fb-muted">{index === 0 ? 'Seçili Oyuncu' : 'Karşılaştırılan'}</span>
                                <strong className="block truncate text-base text-white">{player.name}</strong>
                                <span className="mt-1 block text-sm text-fb-muted">{player.position || 'Mevki belirtilmedi'}</span>
                              </div>
                            ))}
                          </div>

                          {comparisonMetrics.length > 0 ? (
                            <div className="space-y-5">
                              {comparisonMetrics.map((metric) => {
                                const total = metric.left + metric.right;
                                const leftPercent = (metric.left / total) * 100;
                                return (
                                  <div key={metric.label}>
                                    <div className="mb-2 grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-sm">
                                      <span className="tabular-nums font-bold text-emerald-400">{metric.left}{metric.suffix}</span>
                                      <span className="text-center font-semibold text-slate-200">{metric.label}</span>
                                      <span className="tabular-nums text-right font-bold text-fb-yellow">{metric.right}{metric.suffix}</span>
                                    </div>
                                    <div className="flex h-2 overflow-hidden rounded-full bg-slate-950" aria-hidden="true">
                                      <span className="bg-emerald-500" style={{ width: `${leftPercent}%` }} />
                                      <span className="bg-fb-yellow" style={{ width: `${100 - leftPercent}%` }} />
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <p className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-5 text-center text-sm text-fb-muted">
                              Bu iki oyuncu için karşılaştırılabilir sayısal veri henüz yayınlanmadı.
                            </p>
                          )}

                          <p className="rounded-xl border border-white/5 bg-slate-950/50 p-4 text-sm leading-relaxed text-fb-muted">
                            {currentPlayer.formRating > 0 && comparisonPlayer.formRating > 0
                              ? `${currentPlayer.name} ile ${comparisonPlayer.name} arasındaki form puanı farkı ${Math.abs(currentPlayer.formRating - comparisonPlayer.formRating).toFixed(1)}.`
                              : 'Form puanları yayınlandığında sayısal fark burada gösterilecek.'}
                          </p>
                        </div>
                      ) : (
                        <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-8 text-center">
                          <p className="text-sm font-semibold text-slate-200">Karşılaştırma için bir oyuncu seçin.</p>
                          <p className="mt-2 text-sm text-fb-muted">Mevkidaşları veya farklı rollerdeki oyuncuları yan yana inceleyebilirsiniz.</p>
                        </div>
                      )}
                    </div>
                  </section>

                  {/* A. GENEL BAKIŞ */}
                  <div className="p-6 rounded-2xl bg-[#121724]/90 border border-white/[0.05] space-y-4">
                    <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                      <FileText size={16} className="text-fb-yellow" /> A. Genel Bakış Raporu
                    </h3>
                    {currentPlayer.analysis ? (
                      <p className="text-sm leading-relaxed text-slate-300">
                        {currentPlayer.analysis}
                      </p>
                    ) : (
                      <p className="text-sm leading-relaxed text-fb-muted">
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
                        {currentPlayer.strengths.length > 0 ? currentPlayer.strengths.map((strength, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm text-slate-200">
                            <span className="shrink-0 font-bold text-emerald-400" aria-hidden="true">+</span>
                            <span>{strength}</span>
                          </li>
                        )) : (
                          <li className="text-sm text-fb-muted">Güçlü yön analizi henüz yayınlanmadı.</li>
                        )}
                      </ul>
                    </div>

                    {/* C. Gelişim Alanları (Weaknesses) */}
                    <div className="p-6 rounded-2xl bg-rose-950/10 border border-rose-500/10 space-y-3">
                      <h4 className="text-xs font-black text-rose-400 uppercase tracking-widest flex items-center gap-1.5">
                        ⚠ Gelişim Alanları & Riskler
                      </h4>
                      <ul className="space-y-2">
                        {currentPlayer.weaknesses.length > 0 ? currentPlayer.weaknesses.map((weakness, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm text-slate-200">
                            <span className="shrink-0 font-bold text-rose-400" aria-hidden="true">−</span>
                            <span>{weakness}</span>
                          </li>
                        )) : (
                          <li className="text-sm text-fb-muted">Gelişim alanı analizi henüz yayınlanmadı.</li>
                        )}
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
                              <span className={`w-6 h-6 shrink-0 rounded-md flex items-center justify-center text-xs font-black font-mono ${m.result === 'G' ? 'bg-emerald-500/15 text-emerald-400' : m.result === 'M' ? 'bg-rose-500/15 text-rose-400' : 'bg-white/10 text-slate-300'}`}>{m.result}</span>
                              <div className="min-w-0">
                                <div className="text-xs font-black text-white truncate">vs {m.opponent} <span className="font-mono text-fb-yellow">{m.score}</span></div>
                                <div className="text-xs text-slate-500 font-mono uppercase truncate">{m.competition}</div>
                              </div>
                            </div>
                            {m.note && (
                              <span className="shrink-0 text-xs font-black uppercase tracking-wider text-fb-yellow bg-fb-yellow/10 border border-fb-yellow/20 rounded px-2 py-0.5">{m.note}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 rounded-2xl bg-white/[0.015] border border-dashed border-white/[0.08] text-center space-y-2">
                        <p className="text-xs text-slate-400 font-black uppercase tracking-widest font-mono">
                          Bu oyuncu için maç kaydı henüz yok
                        </p>
                        <p className="text-xs text-slate-500 italic">
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
                        <span className="text-xs text-slate-400 font-mono uppercase tracking-wider">{currentPlayer.seasonStats.scope}</span>
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
                              <div className="text-xs text-slate-400 font-black uppercase tracking-widest mt-1 font-mono">{s.label}</div>
                            </div>
                          ))}
                        </div>
                        <div className="flex flex-wrap gap-x-6 gap-y-1.5 pt-3 border-t border-white/[0.04] text-xs font-bold text-slate-300">
                          <span>🟨 Sarı Kart: <strong className="text-white">{currentPlayer.seasonStats.yellowCards}</strong></span>
                          {currentPlayer.seasonStats.secondYellows > 0 && <span>🟨🟥 Çift Sarı: <strong className="text-white">{currentPlayer.seasonStats.secondYellows}</strong></span>}
                          {currentPlayer.seasonStats.redCards > 0 && <span>🟥 Kırmızı: <strong className="text-white">{currentPlayer.seasonStats.redCards}</strong></span>}
                          <span>Oyuna Girdi: <strong className="text-white">{currentPlayer.seasonStats.subOn}</strong></span>
                          <span>Oyundan Çıktı: <strong className="text-white">{currentPlayer.seasonStats.subOff}</strong></span>
                        </div>
                        <p className="text-xs text-slate-500 font-mono">Kaynak: {currentPlayer.seasonStats.source || 'Transfermarkt'} • {currentPlayer.seasonStats.season} sezonu, tüm resmi maçlar</p>
                      </>
                    ) : (
                      <div className="p-8 rounded-2xl bg-white/[0.015] border border-dashed border-white/[0.08] text-center space-y-2">
                        <p className="text-xs text-slate-400 font-black uppercase tracking-widest font-mono">
                          Geçmiş sezon istatistiği bulunmuyor
                        </p>
                        <p className="text-xs text-slate-500 italic">
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
                      <form onSubmit={handleWaitlistSubmit} className="space-y-3">
                        <label className="block text-left">
                          <span className="mb-2 block text-sm font-semibold text-slate-200">E-posta Adresi</span>
                          <input
                            type="email"
                            name="email"
                            autoComplete="email"
                            spellCheck={false}
                            required
                            value={waitlistEmail}
                            onChange={(e) => setWaitlistEmail(e.target.value)}
                            placeholder="ornek@eposta.com…"
                            className="min-h-11 w-full rounded-lg border border-white/10 bg-fb-dark px-3 py-2.5 text-base text-white focus-visible:border-fb-yellow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fb-yellow/30"
                          />
                        </label>
                        <button
                          type="submit"
                          disabled={waitlistLoading}
                          className="ui-button ui-button-primary w-full disabled:cursor-wait disabled:opacity-70"
                        >
                          {waitlistLoading ? 'Listeye ekleniyor…' : 'Öncü Listeye Katıl'}
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
                        <button
                          type="button"
                          key={idx}
                          onClick={() => {
                            if (item.view === 'players') {
                              handleBackToList();
                            } else {
                              onNavigate(item.view);
                            }
                          }}
                          className="p-3 rounded bg-fb-dark/80 border border-white/5 hover:border-fb-yellow/20  transition-colors flex items-center justify-between text-xs font-bold text-slate-100 w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fb-yellow/60"
                        >
                          <span className="truncate pr-2">{item.title}</span>
                          <ChevronRight size={14} className="shrink-0 text-fb-yellow" />
                        </button>
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
