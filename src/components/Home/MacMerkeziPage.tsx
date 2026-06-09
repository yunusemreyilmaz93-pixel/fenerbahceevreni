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
  ChevronRight, 
  CheckCircle, 
  Vote, 
  Layers, 
  FileText, 
  User, 
  Flag,
  Tv,
  Activity,
  ArrowRight,
  Filter,
  BarChart3,
  ListOrdered,
  AlertCircle
} from 'lucide-react';
import { dbGetCollection } from '../../lib/dbService';

interface MacMerkeziPageProps {
  onNavigate: (view: string) => void;
}

export const MacMerkeziPage: React.FC<MacMerkeziPageProps> = ({ onNavigate }) => {
  const [matches, setMatches] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [standings, setStandings] = useState<any[]>([]);
  const [matchReports, setMatchReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Selected visual active match (featured or first or fallback)
  const [activeMatch, setActiveMatch] = useState<any | null>(null);
  
  // Tab control: "Maç Önü" | "Canlı" | "Maç Sonu" | "İstatistik" | "Taraftar Tahmini"
  const [activeTab, setActiveTab] = useState<string>("Maç Önü");
  
  // Selected lineup index/role
  const [selectedXIPosition, setSelectedXIPosition] = useState<string>("CF");
  
  // Fixture list filter state: "Tüm Maçlar" | "Yaklaşan Maçlar" | "Tamamlanan Maçlar"
  const [fixtureFilter, setFixtureFilter] = useState<string>("Tüm Maçlar");
  
  // Dynamic Voting State
  const [pollVotes, setPollVotes] = useState({
    home: 482,
    draw: 114,
    away: 68,
    voted: false,
    selectedOption: ""
  });
  
  const [countdown, setCountdown] = useState({ gün: 1, saat: 4, dakika: 22, saniye: 15 });
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterJoined, setNewsletterJoined] = useState(false);

  // Subscriptions & DB Fetch
  useEffect(() => {
    const loadDbData = async () => {
      try {
        setLoading(true);
        const matchesList = await dbGetCollection('matches');
        const teamsList = await dbGetCollection('teams');
        const standingsDocList = await dbGetCollection('standings');
        const reportsList = await dbGetCollection('match_reports');
        
        setMatches(matchesList || []);
        setTeams(teamsList || []);
        setMatchReports(reportsList || []);

        // Standings might be a single doc with standingsList inside
        if (standingsDocList && standingsDocList.length > 0) {
          // find any document that has standingsList array
          const docWithList = standingsDocList.find(d => Array.isArray(d.standingsList));
          if (docWithList) {
            setStandings(docWithList.standingsList);
          } else {
            setStandings([]);
          }
        } else {
          setStandings([]);
        }

        // Determine Featured or Best Active Match
        const featured = matchesList.find(m => m.featured);
        const upcoming = matchesList.find(m => m.status === 'upcoming');
        const live = matchesList.find(m => m.status === 'live');
        const completed = matchesList.find(m => m.status === 'finished' || m.status === 'completed');

        const chosenMatch = featured || live || upcoming || completed || null;
        setActiveMatch(chosenMatch);
      } catch (err) {
        console.error("Error loading Match Center dynamic data:", err);
      } finally {
        setLoading(false);
      }
    };
    loadDbData();
  }, []);

  // Simple countdown loop
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev.saniye > 0) {
          return { ...prev, saniye: prev.saniye - 1 };
        } else if (prev.dakika > 0) {
          return { ...prev, dakika: prev.dakika - 1, saniye: 59 };
        } else if (prev.saat > 0) {
          return { ...prev, saat: prev.saat - 1, dakika: 59, saniye: 59 };
        } else if (prev.gün > 0) {
          return { ...prev, gün: prev.gün - 1, saat: 23, dakika: 59, saniye: 59 };
        } else {
          return { gün: 0, saat: 0, dakika: 0, saniye: 0 }; // complete
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
      copy.selectedOption = option === 'home' ? 'Fenerbahçe' : option === 'draw' ? 'Beraberlik' : (activeMatch?.awayTeam || 'Rakip');
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

  // Resolve team logos dynamically based on the DB or match fields, fallback gracefully
  const getTeamLogo = (teamName: string, defaultLogo?: string) => {
    if (!teamName) return 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=80&fit=crop';
    
    // Check if match already has logo embedded
    if (defaultLogo) return defaultLogo;

    // Search in teams collection
    const found = teams.find(t => t.name?.toLowerCase() === teamName?.toLowerCase() || t.shortName?.toLowerCase() === teamName?.toLowerCase());
    if (found?.logoUrl) return found.logoUrl;
    if (found?.logo) return found.logo;

    // Direct fallbacks for big Turkish clubs
    if (teamName.toLowerCase().includes('fenerbahce') || teamName.toLowerCase().includes('fenerbahçe')) {
      return 'https://media.api-sports.io/football/teams/611.png'; // Fenerbahce official API ID logo URL
    }
    if (teamName.toLowerCase().includes('besiktas') || teamName.toLowerCase().includes('beşiktaş')) {
      return 'https://media.api-sports.io/football/teams/565.png';
    }
    if (teamName.toLowerCase().includes('galatasaray')) {
      return 'https://media.api-sports.io/football/teams/564.png';
    }
    if (teamName.toLowerCase().includes('trabzonspor')) {
      return 'https://media.api-sports.io/football/teams/549.png';
    }

    return null;
  };

  // Get Initials as Fallback
  const getInitials = (name: string) => {
    if (!name) return "FB";
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .slice(0, 3)
      .toUpperCase();
  };

  // Default Fallback Match if database has absolutely no records
  const defaultFallbackMatch = {
    id: "match-api-fallback",
    homeTeam: "Fenerbahçe",
    awayTeam: "Beşiktaş",
    homeLogo: "https://media.api-sports.io/football/teams/611.png",
    awayLogo: "https://media.api-sports.io/football/teams/565.png",
    competition: "Trendyol Süper Lig • 36. Hafta",
    matchDate: new Date(Date.now() + 86400 * 1000).toISOString(), // Tomorrow
    venue: "Ülker Stadyumu Şükrü Saracoğlu Spor Kompleksi / Kadıköy",
    status: "upcoming",
    scoreHome: 0,
    scoreAway: 0,
    matchPreview: "Liderlik yolundaki en kritik sınır derbi mücadelesi. Fenerbahçe bu karşılaşmada yüksek yoğunluklu ön alan baskısı yaparak oyun temposunu erkenden eline almak, merkez orta sahada geçiş savunmasını dengede tutmak ve kanat bindirmeleriyle ceza sahasını beslemek zorunda.",
    referee: "Halil Umut Meler",
    broadcasterTarget: "beIN Sports 1",
    probableXI: {
      formation: "4-2-3-1",
      GK: "Dominik Livaković",
      RB: "Bright Osayi-Samuel",
      CB1: "Alexander Djiku",
      CB2: "Çağlar Söyüncü",
      LB: "Jayden Oosterwolde",
      DM1: "İsmail Yüksek",
      DM2: "Fred",
      RW: "İrfan Can Kahveci",
      AM: "Sebastian Szymański",
      LW: "Dušan Tadić",
      CF: "Edin Džeko"
    },
    tacticalNotes: {
      keyMatchup: "Fred vs Gedson Fernandes düellosu merkez hakimiyetini belirleyecek.",
      riskZone: "Rakip kanat oyuncularının savunma arkasına sarkma koşuları.",
      pressPlan: "Merkez blokta 2. bölgeden itibaren agresif adam adama baskı kurgusu.",
      transitionPlay: "Kazanılan toplarda Szymański'nin süratli yönlendirmeleriyle ceza sahasına derin paslar.",
      setPiece: "Tadić'in ön direğe adrese teslim kornerleri ve Çağlar'ın kafa vuruşları."
    },
    stats: null
  };

  // Resolve active match or fallback
  const resolvedActiveMatch = activeMatch || defaultFallbackMatch;

  const isLive = resolvedActiveMatch.status === 'live';
  const isCompleted = resolvedActiveMatch.status === 'finished' || resolvedActiveMatch.status === 'completed';

  const formattedDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch {
      return "Gelecek Tarih";
    }
  };

  const formattedTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return "20:00";
    }
  };

  // Get dynamic probable XI from active match
  const currentXI = resolvedActiveMatch.probableXI || null;

  // Key Player mapping positions
  const squadXI_Dynamic = currentXI ? {
    GK: { name: currentXI.GK || "Dominik Livaković", no: 40, role: "Kaleci" },
    RB: { name: currentXI.RB || "Bright Osayi-Samuel", no: 21, role: "Sağ Bek" },
    CB1: { name: currentXI.CB1 || "Alexander Djiku", no: 6, role: "Stoper" },
    CB2: { name: currentXI.CB2 || "Çağlar Söyüncü", no: 2, role: "Stoper" },
    LB: { name: currentXI.LB || "Jayden Oosterwolde", no: 24, role: "Sol Bek" },
    DM1: { name: currentXI.DM1 || "İsmail Yüksek", no: 5, role: "Ankor Defansif Orta Saha" },
    DM2: { name: currentXI.DM2 || "Fred", no: 35, role: "Merkez Oyun Kurucu" },
    RW: { name: currentXI.RW || "İrfan Can Kahveci", no: 17, role: "Ters Ayaklı Sağ Kanat" },
    AM: { name: currentXI.AM || "Sebastian Szymański", no: 53, role: "Pres Gücü On Numara" },
    LW: { name: currentXI.LW || "Dušan Tadić", no: 10, role: "Kreatif Sol Kanat" },
    CF: { name: currentXI.CF || "Edin Džeko", no: 9, role: "Target Man / Santrafor" }
  } : null;

  // Search details for next match, last match, standings state
  const upcomingMatches = matches.filter(m => m.status === 'upcoming').sort((a, b) => new Date(a.matchDate).getTime() - new Date(b.matchDate).getTime());
  const completedMatches = matches.filter(m => m.status === 'finished' || m.status === 'completed').sort((a, b) => new Date(b.matchDate).getTime() - new Date(a.matchDate).getTime());
  
  const nextMatchItem = upcomingMatches[0] || null;
  const lastMatchItem = completedMatches[0] || null;
  const fenerbahceStanding = standings.find(t => t.teamName?.toLowerCase().includes('fenerbahce') || t.teamName?.toLowerCase().includes('fenerbahçe'));

  // Filter fixtures based on user selection
  const filteredFixtures = matches.filter(m => {
    let matchesType = true;
    if (fixtureFilter === "Yaklaşan Maçlar") {
      matchesType = m.status === "upcoming";
    } else if (fixtureFilter === "Tamamlanan Maçlar") {
      matchesType = m.status === "finished" || m.status === "completed";
    }

    // Filter by competition logic (mock search)
    if (fixtureFilter === "Süper Lig") {
      return m.competition?.toLowerCase().includes('lig') || m.competition?.toLowerCase().includes('süper');
    } else if (fixtureFilter === "Türkiye Kupası") {
      return m.competition?.toLowerCase().includes('kupa');
    } else if (fixtureFilter === "Avrupa") {
      return m.competition?.toLowerCase().includes('avrupa') || m.competition?.toLowerCase().includes('league') || m.competition?.toLowerCase().includes('champions');
    }

    return matchesType;
  });

  // Action helper when clicking a fixture row to load it
  const handleSelectFixture = (match: any, tabTarget: string) => {
    setActiveMatch(match);
    setActiveTab(tabTarget);
    // Scroll smoothly to spot light section
    const element = document.getElementById('featured-match-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div id="mac-merkezi-index" className="space-y-12 pb-24 text-left">
      <SEO 
        title="Maç Merkezi | Fenerbahçe Evreni"
        description="Fenerbahçe maç önü taktik notları, muhtemel 11'ler, son maç analiz dökümanları, oyuncu puan karnesi ve taraftar skor tahminleri."
        canonical="https://fenerbahceevreni.com/mac-merkezi"
      />
      
      {/* 1. Page Header */}
      <section className="relative overflow-hidden pt-8 pb-4 border-b border-white/[0.04] bg-gradient-to-b from-fb-navy/30 to-transparent">
        <div className="space-y-4 max-w-4xl">
          {/* Data Freshness Indicator */}
          <div>
            {isLive ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full text-[10px] font-black uppercase text-red-400 tracking-widest animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Canlı veri aktif
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FFD21F]/10 border border-[#FFD21F]/20 rounded-full text-[10px] font-black uppercase text-[#FFD21F] tracking-widest">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FFD21F]" /> Veri entegrasyonu aktif • Son güncelleme: {new Date().toLocaleDateString('tr-TR')} {new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>
          
          <h1 className="text-4xl md:text-5xl font-display font-black text-white uppercase tracking-tight leading-none italic">
            Maç Merkezi
          </h1>
          
          <p className="text-slate-300 text-sm md:text-base max-w-2xl font-medium leading-relaxed">
            Fenerbahçe’nin fikstürü, maç önü notları, istatistikleri ve taraftar tahminleri tek ekranda.
          </p>
        </div>

        {/* Compact Summary Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/[0.04]">
          {/* Box 1: Sıradaki Maç */}
          <div className="bg-[#0b101c]/90 border border-white/[0.05] p-4 rounded-xl shadow-lg flex flex-col justify-between">
            <span className="text-[9px] font-black tracking-widest text-[#FFD21F]/80 uppercase block mb-1">SIRADAKİ MAÇ</span>
            {nextMatchItem ? (
              <div className="space-y-1">
                <div className="text-xs font-bold text-white truncate">vs {nextMatchItem.awayTeam === 'Fenerbahçe' ? nextMatchItem.homeTeam : nextMatchItem.awayTeam}</div>
                <div className="text-[10px] text-slate-400 font-mono">{formattedDate(nextMatchItem.matchDate)}</div>
              </div>
            ) : (
              <div className="text-xs text-white/50 font-bold italic leading-tight">Yükleniyor veya atanmadı</div>
            )}
          </div>

          {/* Box 2: Son Maç */}
          <div className="bg-[#0b101c]/90 border border-white/[0.05] p-4 rounded-xl shadow-lg flex flex-col justify-between">
            <span className="text-[9px] font-black tracking-widest text-slate-400 uppercase block mb-1">SON MAÇ</span>
            {lastMatchItem ? (
              <div className="space-y-1">
                <div className="text-xs font-bold text-white truncate">{lastMatchItem.homeTeam === 'Fenerbahçe' ? `vs ${lastMatchItem.awayTeam}` : `${lastMatchItem.homeTeam} (D)`}</div>
                <div className="text-[10px] font-mono text-fb-yellow font-black">{lastMatchItem.scoreHome} - {lastMatchItem.scoreAway}</div>
              </div>
            ) : (
              <div className="text-xs text-white/50 font-bold italic leading-tight">Oynanmış maç bulunmuyor</div>
            )}
          </div>

          {/* Box 3: Puan Durumu */}
          <div className="bg-[#0b101c]/90 border border-white/[0.05] p-4 rounded-xl shadow-lg flex flex-col justify-between">
            <span className="text-[9px] font-black tracking-widest text-emerald-400 uppercase block mb-1">PUAN DURUMU (LİG)</span>
            {fenerbahceStanding ? (
              <div className="space-y-1">
                <div className="text-xs font-black text-white">{fenerbahceStanding.rank}. Sıra <span className="text-[10px] text-slate-400 font-normal">({fenerbahceStanding.played} Maç)</span></div>
                <div className="text-[10px] font-mono font-bold text-emerald-400">{fenerbahceStanding.points} Puan • Avr {fenerbahceStanding.goalsDiff || 0}</div>
              </div>
            ) : (
              <div className="text-xs font-black text-white">Fenerbahçe <span className="text-[10px] text-slate-500 font-normal block">Puan tablosu yükleniyor</span></div>
            )}
          </div>

          {/* Box 4: Maç Raporları */}
          <div className="bg-[#0b101c]/90 border border-white/[0.05] p-4 rounded-xl shadow-lg flex flex-col justify-between">
            <span className="text-[9px] font-black tracking-widest text-[#FFD21F]/80 uppercase block mb-1">MAÇ RAPORLARI</span>
            <div className="space-y-1">
              <div className="text-xs font-bold text-white">{matchReports.length} Taktik Analiz</div>
              <div className="text-[10px] text-slate-400 font-mono">Derinlemesine Mourinho karnesi</div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Featured Match Section */}
      <section id="featured-match-section" className="space-y-6 pt-4">
        <h2 className="text-xs font-black text-fb-yellow tracking-widest uppercase border-b border-white/5 pb-2">ÖNE ÇIKAN KARŞILAŞMA ODAĞI</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          <div className="lg:col-span-8 rounded-2xl bg-[#0e1320] border border-white/[0.08] p-6 md:p-8 flex flex-col justify-between relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 inset-x-0 h-[3px] bg-fb-yellow" />
            
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded ${isLive ? 'bg-red-500/10 text-red-500 animate-pulse border border-red-500/20' : isCompleted ? 'bg-emerald-500/10 text-emerald-400' : 'bg-[#FFD21F]/10 text-[#FFD21F]'}`}>
                  {isLive ? 'CANLI MAÇ' : isCompleted ? 'MAÇ SONLANDI' : 'MAÇ ÖNÜ NOTLARI'}
                </span>
                <span className="text-xs text-slate-400 font-bold tracking-wider">{resolvedActiveMatch.competition}</span>
              </div>

              {/* Confrontment Board */}
              <div className="grid grid-cols-3 items-center py-6 text-center border-b border-white/[0.05] gap-2">
                
                {/* Home Team */}
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-2xl bg-[#060a12] flex items-center justify-center p-2 border border-white/5 shadow-lg select-none">
                    {getTeamLogo(resolvedActiveMatch.homeTeam, resolvedActiveMatch.homeLogo) ? (
                      <img 
                        src={getTeamLogo(resolvedActiveMatch.homeTeam, resolvedActiveMatch.homeLogo)!} 
                        alt="" 
                        className="w-12 h-12 object-contain" 
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-xs font-black font-mono text-slate-300">
                        {getInitials(resolvedActiveMatch.homeTeam)}
                      </div>
                    )}
                  </div>
                  <span className="text-xs md:text-sm font-black text-white mt-3 uppercase tracking-wide leading-tight break-words text-center">{resolvedActiveMatch.homeTeam}</span>
                </div>

                {/* Match Score or Time */}
                <div className="flex flex-col items-center">
                  {isLive || isCompleted ? (
                    <div className="space-y-1">
                      <span className="text-3xl md:text-4xl font-display font-black tracking-tight text-white font-mono">
                        {resolvedActiveMatch.scoreHome} - {resolvedActiveMatch.scoreAway}
                      </span>
                      {isLive && (
                        <span className="text-[9px] text-red-500 font-extrabold tracking-widest block uppercase animate-pulse">● CANLI VERİ</span>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <span className="text-[9px] text-[#FFD21F] font-black tracking-widest uppercase block mb-1">BAŞLAMA SAATİ</span>
                      <span className="text-2xl font-black italic text-white font-mono">{formattedTime(resolvedActiveMatch.matchDate)}</span>
                      <span className="text-[10px] text-slate-400 mt-2 font-bold tracking-wider block">{formattedDate(resolvedActiveMatch.matchDate)}</span>
                    </div>
                  )}
                </div>

                {/* Away Team */}
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-2xl bg-[#060a12] flex items-center justify-center p-2 border border-white/5 shadow-lg select-none">
                    {getTeamLogo(resolvedActiveMatch.awayTeam, resolvedActiveMatch.awayLogo) ? (
                      <img 
                        src={getTeamLogo(resolvedActiveMatch.awayTeam, resolvedActiveMatch.awayLogo)!} 
                        alt="" 
                        className="w-12 h-12 object-contain" 
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-xs font-black font-mono text-slate-300">
                        {getInitials(resolvedActiveMatch.awayTeam)}
                      </div>
                    )}
                  </div>
                  <span className="text-xs md:text-sm font-black text-white mt-3 uppercase tracking-wide leading-tight break-words text-center">{resolvedActiveMatch.awayTeam}</span>
                </div>
              </div>

              {/* Live Scorers, Cards & Subs */}
              {(resolvedActiveMatch.scorerDetailsHome || resolvedActiveMatch.scorerDetailsAway) && (
                <div className="p-3.5 rounded-xl bg-[#070b14] border border-white/5 grid grid-cols-2 gap-4 text-xs font-bold text-slate-300">
                  <div className="text-left border-r border-white/5 pr-4">
                    <span className="text-[9px] text-slate-400 uppercase block mb-1">Ev Sahibi Goller</span>
                    <p className="font-mono text-white text-[11px] leading-tight">{resolvedActiveMatch.scorerDetailsHome || '-'}</p>
                  </div>
                  <div className="text-right pl-4">
                    <span className="text-[9px] text-slate-400 uppercase block mb-1">Deplasman Goller</span>
                    <p className="font-mono text-white text-[11px] leading-tight">{resolvedActiveMatch.scorerDetailsAway || '-'}</p>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <span className="text-[10px] font-black text-fb-yellow uppercase tracking-widest flex items-center gap-1.5 font-mono">
                  <Flag className="w-3.5 h-3.5 text-[#FFD21F]" /> Taktik Köşesi Maç Analiz Notu
                </span>
                <p className="text-sm text-slate-300 leading-relaxed font-semibold">
                  {resolvedActiveMatch.matchPreview || "Karşılaşma ile ilgili taktiksel kurgular, savunma setleri ve teknik heyet planları maç günü yüklenecektir."}
                </p>
              </div>
            </div>

            {/* Buttons Row with dynamic interaction navigation */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-white/[0.05] mt-6">
              <button 
                onClick={() => {
                  setActiveTab("Maç Önü");
                  const el = document.getElementById('match-details-tabs-hub');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="flex-1 py-3 px-4 rounded-xl bg-fb-yellow hover:bg-[#ffe05c] text-fb-navy text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_4px_20px_rgba(255,210,31,0.15)]"
              >
                Maç Önü Analizini Oku
              </button>
              <button 
                onClick={() => {
                  setActiveTab("Taraftar Tahmini");
                  const el = document.getElementById('match-details-tabs-hub');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="py-3 px-5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Vote className="w-3.5 h-3.5" /> Tahmin Yap
              </button>
              <button 
                onClick={() => {
                  const el = document.getElementById('fixtures-and-calendar');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="py-3 px-5 rounded-xl bg-[#090d16] hover:bg-white/[0.03] text-slate-300 border border-white/10 text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
              >
                Fikstüre Git
              </button>
            </div>
          </div>

          {/* Quick Side Information card */}
          <div className="lg:col-span-4 flex flex-col gap-4 text-left">
            {!(isLive || isCompleted) ? (
              <div className="p-5 rounded-2xl bg-[#0b101c] border border-white/[0.06] flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[9px] text-slate-400 font-black tracking-widest uppercase block mb-2 font-mono">BAŞLAMA SAYACINA KALAN</span>
                  <div className="grid grid-cols-4 gap-2 text-center my-1">
                    {[
                      { val: countdown.gün, label: "GÜN" },
                      { val: countdown.saat, label: "SAAT" },
                      { val: countdown.dakika, label: "DAKİKA" },
                      { val: countdown.saniye, label: "SANİYE" }
                    ].map((item, i) => (
                      <div key={i} className="bg-[#05080e] rounded-lg p-2.5 border border-white/5">
                        <div className="text-lg font-black italic text-fb-yellow font-mono">{item.val.toString().padStart(2, '0')}</div>
                        <div className="text-[8px] text-slate-500 font-extrabold uppercase mt-0.5">{item.label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-white/[0.04]">
                  <div className="text-xs font-bold text-slate-400 font-mono flex items-center gap-1 uppercase"><MapPin className="w-3.5 h-3.5 text-fb-yellow" /> Stadyum Bilgisi</div>
                  <div className="text-[11px] text-slate-300 font-semibold mt-1.5 leading-snug">
                    {resolvedActiveMatch.venue || 'Şükrü Saracoğlu Spor Kompleksi / İstanbul'}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-5 rounded-2xl bg-[#0b101c] border border-white/[0.06] flex-1 flex flex-col justify-between">
                <div className="space-y-4">
                  <span className="text-[9px] text-[#FFD21F] font-black tracking-widest uppercase block font-mono">Düdük ve Kart Detayları</span>
                  
                  {resolvedActiveMatch.cardsDetails ? (
                    <div className="p-3 bg-red-500/5 rounded-xl border border-red-500/10 space-y-1">
                      <span className="text-[8px] text-rose-400 font-extrabold uppercase font-mono">Kart Durumu</span>
                      <p className="text-[11px] text-slate-300 font-bold leading-tight">{resolvedActiveMatch.cardsDetails}</p>
                    </div>
                  ) : (
                    <div className="p-3 bg-white/[0.02] rounded-xl border border-white/5 space-y-1">
                      <p className="text-[11px] text-slate-400 italic">Bu maça ait kart/ceza bilgisi girilmemiştir.</p>
                    </div>
                  )}

                  {resolvedActiveMatch.substitutionDetails && (
                    <div className="p-3 bg-blue-500/5 rounded-xl border border-blue-500/10 space-y-1">
                      <span className="text-[8px] text-blue-400 font-extrabold uppercase font-mono">Oyuncu Değişiklikleri</span>
                      <p className="text-[11px] text-slate-300 font-bold leading-tight">{resolvedActiveMatch.substitutionDetails}</p>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-white/[0.04] mt-4">
                  <div className="text-xs font-bold text-slate-400 font-mono flex items-center gap-1 uppercase"><MapPin className="w-3.5 h-3.5 text-fb-yellow" /> Stat Konumu</div>
                  <div className="text-[11px] text-slate-300 font-semibold mt-1 leading-snug">
                    {resolvedActiveMatch.venue?.split('/')[0]}
                  </div>
                </div>
              </div>
            )}

            <div className="overflow-hidden rounded-2xl bg-[#0b101c] border border-white/[0.08] p-5 space-y-3.5">
              <span className="text-[9px] text-slate-400 font-black tracking-widest uppercase block border-b border-white/5 pb-2 font-mono">MÜSABAKA VE MEDYA BİLGİLERİ</span>
              
              <div className="space-y-3 font-semibold text-xs text-slate-200">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Karşılaşma Hakemi</span>
                  <span className="text-white font-black">{resolvedActiveMatch.referee || 'Henüz Atanmadı'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Yayıncı Kanal</span>
                  <span className="text-fb-yellow font-black flex items-center gap-1 font-mono">
                    <Tv size={12} className="text-[#FFD21F]" /> {resolvedActiveMatch.broadcasterTarget || 'beIN Sports 1'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Şehir</span>
                  <span className="text-white font-black text-right truncate max-w-44 font-mono">{resolvedActiveMatch.venue?.split('/')[1] || 'İstanbul'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Match Tabs Interface */}
      <section id="match-details-tabs-hub" className="space-y-6">
        {/* Tab Headers */}
        <div className="border-b border-white/[0.06] overflow-x-auto no-scrollbar scroll-smooth flex">
          <div className="flex space-x-4 md:space-x-8 pb-px min-w-full">
            {["Maç Önü", "Canlı", "Maç Sonu", "İstatistik", "Taraftar Tahmini"].map((tab) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-3 px-1.5 text-xs md:text-sm font-black uppercase tracking-wider relative transition-all whitespace-nowrap cursor-pointer ${
                    isActive ? 'text-fb-yellow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tab}
                  {isActive && (
                    <motion.div 
                      layoutId="activeMatchTabLine"
                      className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#FFD21F] rounded-full"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Tab Panes */}
        <div className="transition-all duration-300">
          
          {/* TAB 1: MAÇ ÖNÜ */}
          {activeTab === "Maç Önü" && (
            <div className="space-y-8 animate-fade-in">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                
                {/* Visual Tactical Field */}
                <div className="lg:col-span-8 rounded-2xl bg-gradient-to-b from-[#091510] to-[#040906] border border-emerald-500/20 p-5 md:p-6 relative min-h-[460px] flex flex-col justify-between overflow-hidden shadow-xl">
                  {/* Field Lines overlay */}
                  <div className="absolute inset-0 pointer-events-none opacity-20">
                    <div className="absolute inset-4 border border-emerald-400/35" />
                    <div className="absolute top-1/2 left-4 right-4 h-px bg-emerald-400/35 -translate-y-1/2" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 rounded-full border border-emerald-400/35" />
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 w-44 h-16 border-b border-x border-emerald-400/35" />
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-44 h-16 border-t border-x border-emerald-400/35" />
                  </div>

                  <div className="flex md:flex-row flex-col justify-between items-start md:items-center relative z-20 gap-2">
                    <span className="text-[9px] font-black tracking-widest text-emerald-400 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> {(currentXI && currentXI.formation) || '4-2-3-1'} TAKTİK DİZİLİMİ
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold">Kanal butonlarına dokunarak oyuncu rollerini inceleyin</span>
                  </div>

                  {squadXI_Dynamic ? (
                    <div className="relative flex-1 w-full flex flex-col justify-around py-6 min-h-[400px] z-20">
                      
                      {/* FORWARD */}
                      <div className="flex justify-center">
                        <button 
                          onClick={() => setSelectedXIPosition("CF")}
                          className={`w-12 h-12 rounded-full flex flex-col items-center justify-center font-bold text-xs border transition-all cursor-pointer ${
                            selectedXIPosition === "CF" ? 'bg-fb-yellow text-fb-navy border-white scale-110 shadow-[0_0_15px_rgba(255,210,31,0.5)]' : 'bg-fb-navy/90 text-white border-fb-yellow/30 hover:bg-fb-yellow hover:text-fb-navy'
                          }`}
                        >
                          <span className="text-[8px] font-extrabold leading-none">CF</span>
                          <span className="font-display font-black leading-none mt-1">{squadXI_Dynamic.CF.no}</span>
                        </button>
                      </div>

                      {/* MIDFIELD ATTACKING */}
                      <div className="flex justify-around px-2">
                        <button 
                          onClick={() => setSelectedXIPosition("LW")}
                          className={`w-12 h-12 rounded-full flex flex-col items-center justify-center font-bold text-xs border transition-all cursor-pointer ${
                            selectedXIPosition === "LW" ? 'bg-fb-yellow text-fb-navy border-white scale-110 shadow-[0_0_15px_rgba(255,210,31,0.5)]' : 'bg-fb-navy/90 text-white border-fb-yellow/30 hover:bg-fb-yellow hover:text-fb-navy'
                          }`}
                        >
                          <span className="text-[8px] font-extrabold leading-none">LW</span>
                          <span className="font-display font-black leading-none mt-1">{squadXI_Dynamic.LW.no}</span>
                        </button>

                        <button 
                          onClick={() => setSelectedXIPosition("AM")}
                          className={`w-12 h-12 rounded-full flex flex-col items-center justify-center font-bold text-xs border transition-all cursor-pointer ${
                            selectedXIPosition === "AM" ? 'bg-fb-yellow text-fb-navy border-white scale-110 shadow-[0_0_15px_rgba(255,210,31,0.5)]' : 'bg-fb-navy/90 text-white border-fb-yellow/30 hover:bg-fb-yellow hover:text-fb-navy'
                          }`}
                        >
                          <span className="text-[8px] font-extrabold leading-none">AM</span>
                          <span className="font-display font-black leading-none mt-1">{squadXI_Dynamic.AM.no}</span>
                        </button>

                        <button 
                          onClick={() => setSelectedXIPosition("RW")}
                          className={`w-12 h-12 rounded-full flex flex-col items-center justify-center font-bold text-xs border transition-all cursor-pointer ${
                            selectedXIPosition === "RW" ? 'bg-fb-yellow text-fb-navy border-white scale-110 shadow-[0_0_15px_rgba(255,210,31,0.5)]' : 'bg-fb-navy/90 text-white border-fb-yellow/30 hover:bg-fb-yellow hover:text-fb-navy'
                          }`}
                        >
                          <span className="text-[8px] font-extrabold leading-none">RW</span>
                          <span className="font-display font-black leading-none mt-1">{squadXI_Dynamic.RW.no}</span>
                        </button>
                      </div>

                      {/* DEFENSIVE MIDFIELD */}
                      <div className="flex justify-center gap-12">
                        <button 
                          onClick={() => setSelectedXIPosition("DM1")}
                          className={`w-12 h-12 rounded-full flex flex-col items-center justify-center font-bold text-xs border transition-all cursor-pointer ${
                            selectedXIPosition === "DM1" ? 'bg-fb-yellow text-fb-navy border-white scale-110 shadow-[0_0_15px_rgba(255,210,31,0.5)]' : 'bg-fb-navy/90 text-white border-fb-yellow/30 hover:bg-fb-yellow hover:text-fb-navy'
                          }`}
                        >
                          <span className="text-[8px] font-extrabold leading-none">DM</span>
                          <span className="font-display font-black leading-none mt-1">{squadXI_Dynamic.DM1.no}</span>
                        </button>

                        <button 
                          onClick={() => setSelectedXIPosition("DM2")}
                          className={`w-12 h-12 rounded-full flex flex-col items-center justify-center font-bold text-xs border transition-all cursor-pointer ${
                            selectedXIPosition === "DM2" ? 'bg-fb-yellow text-fb-navy border-white scale-110 shadow-[0_0_15px_rgba(255,210,31,0.5)]' : 'bg-fb-navy/90 text-white border-fb-yellow/30 hover:bg-fb-yellow hover:text-fb-navy'
                          }`}
                        >
                          <span className="text-[8px] font-extrabold leading-none">DM</span>
                          <span className="font-display font-black leading-none mt-1">{squadXI_Dynamic.DM2.no}</span>
                        </button>
                      </div>

                      {/* DEFENDERS */}
                      <div className="flex justify-between px-2">
                        <button 
                          onClick={() => setSelectedXIPosition("LB")}
                          className={`w-12 h-12 rounded-full flex flex-col items-center justify-center font-bold text-xs border transition-all cursor-pointer ${
                            selectedXIPosition === "LB" ? 'bg-fb-yellow text-fb-navy border-white scale-110 shadow-[0_0_15px_rgba(255,210,31,0.5)]' : 'bg-fb-navy/90 text-white border-fb-yellow/30 hover:bg-fb-yellow hover:text-fb-navy'
                          }`}
                        >
                          <span className="text-[8px] font-extrabold leading-none">LB</span>
                          <span className="font-display font-black leading-none mt-1">{squadXI_Dynamic.LB.no}</span>
                        </button>

                        <button 
                          onClick={() => setSelectedXIPosition("CB1")}
                          className={`w-12 h-12 rounded-full flex flex-col items-center justify-center font-bold text-xs border transition-all cursor-pointer ${
                            selectedXIPosition === "CB1" ? 'bg-fb-yellow text-fb-navy border-white scale-110 shadow-[0_0_15px_rgba(255,210,31,0.5)]' : 'bg-fb-navy/90 text-white border-fb-yellow/30 hover:bg-fb-yellow hover:text-fb-navy'
                          }`}
                        >
                          <span className="text-[8px] font-extrabold leading-none">CB</span>
                          <span className="font-display font-black leading-none mt-1">{squadXI_Dynamic.CB1.no}</span>
                        </button>

                        <button 
                          onClick={() => setSelectedXIPosition("CB2")}
                          className={`w-12 h-12 rounded-full flex flex-col items-center justify-center font-bold text-xs border transition-all cursor-pointer ${
                            selectedXIPosition === "CB2" ? 'bg-fb-yellow text-fb-navy border-white scale-110 shadow-[0_0_15px_rgba(255,210,31,0.5)]' : 'bg-fb-navy/90 text-white border-fb-yellow/30 hover:bg-fb-yellow hover:text-fb-navy'
                          }`}
                        >
                          <span className="text-[8px] font-extrabold leading-none">CB</span>
                          <span className="font-display font-black leading-none mt-1">{squadXI_Dynamic.CB2.no}</span>
                        </button>

                        <button 
                          onClick={() => setSelectedXIPosition("RB")}
                          className={`w-12 h-12 rounded-full flex flex-col items-center justify-center font-bold text-xs border transition-all cursor-pointer ${
                            selectedXIPosition === "RB" ? 'bg-fb-yellow text-fb-navy border-white scale-110 shadow-[0_0_15px_rgba(255,210,31,0.5)]' : 'bg-fb-navy/90 text-white border-fb-yellow/30 hover:bg-fb-yellow hover:text-fb-navy'
                          }`}
                        >
                          <span className="text-[8px] font-extrabold leading-none">RB</span>
                          <span className="font-display font-black leading-none mt-1">{squadXI_Dynamic.RB.no}</span>
                        </button>
                      </div>

                      {/* GOALKEEPER */}
                      <div className="flex justify-center">
                        <button 
                          onClick={() => setSelectedXIPosition("GK")}
                          className={`w-12 h-12 rounded-full flex flex-col items-center justify-center font-bold text-xs border transition-all cursor-pointer ${
                            selectedXIPosition === "GK" ? 'bg-fb-yellow text-fb-navy border-white scale-110 shadow-[0_0_15px_rgba(255,210,31,0.5)]' : 'bg-fb-navy/90 text-white border-fb-yellow/30 hover:bg-fb-yellow hover:text-fb-navy'
                          }`}
                        >
                          <span className="text-[8px] font-extrabold leading-none">GK</span>
                          <span className="font-display font-black leading-none mt-1">{squadXI_Dynamic.GK.no}</span>
                        </button>
                      </div>

                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-400">
                      <AlertCircle className="w-10 h-10 text-slate-500 mb-2" />
                      <div className="text-sm font-black">Muhtemel 11 bilgisi henüz eklenmedi.</div>
                      <p className="text-xs text-slate-500 mt-1">Karşılaşmaya ait kadro listesi yayınlandığında interaktif saha dizilimi etkinleşecektir.</p>
                    </div>
                  )}

                  <div className="border-t border-emerald-500/10 pt-3 relative z-20">
                    <p className="text-[9px] text-[#5adea9] font-medium italic">
                      Antrenman analizleri, bireysel form grafiklerine göre dinamik optimize edilen taktik şablon.
                    </p>
                  </div>
                </div>

                {/* Sub Panel: 6. Tactical Preview Details */}
                <div className="lg:col-span-4 flex flex-col justify-between text-left">
                  <div className="p-5 rounded-2xl bg-[#0b101c] border border-white/[0.08] space-y-4 flex-1 flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-fb-yellow border-b border-white/5 pb-2.5">
                        <User className="w-4 h-4 text-fb-yellow" />
                        <span className="text-[10px] font-black uppercase tracking-wider font-mono">Taktik Analiz Paneli</span>
                      </div>

                      {squadXI_Dynamic ? (
                        <AnimatePresence mode="wait">
                          {selectedXIPosition && squadXI_Dynamic[selectedXIPosition as keyof typeof squadXI_Dynamic] && (
                            <motion.div
                              key={selectedXIPosition}
                              initial={{ opacity: 0, x: 8 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -8 }}
                              className="space-y-3.5"
                            >
                              <div>
                                <span className="text-[8px] text-slate-400 font-bold uppercase block tracking-wider font-mono">Pozisyon / Alan</span>
                                <div className="text-base font-black text-white italic">{squadXI_Dynamic[selectedXIPosition as keyof typeof squadXI_Dynamic].role}</div>
                              </div>

                              <div>
                                <span className="text-[8px] text-slate-400 font-bold uppercase block tracking-wider font-mono">Seçilen Oyuncu</span>
                                <div className="text-sm font-black text-fb-yellow">
                                  {squadXI_Dynamic[selectedXIPosition as keyof typeof squadXI_Dynamic].name} <span className="font-mono text-slate-400 font-bold ml-1">#{squadXI_Dynamic[selectedXIPosition as keyof typeof squadXI_Dynamic].no}</span>
                                </div>
                              </div>

                              <div className="h-px bg-white/5" />

                              <div>
                                <span className="text-[8px] text-[#FFD21F] font-black uppercase block tracking-wider font-mono mb-1">Mourinho Maç İçi Görevi</span>
                                <p className="text-xs text-slate-300 leading-relaxed font-semibold">
                                  Teknik kurulun taktiksel kurgusunda <strong>{squadXI_Dynamic[selectedXIPosition as keyof typeof squadXI_Dynamic].name}</strong>, alan dengesini kapamak, {resolvedActiveMatch.awayTeam || 'rakip'} kilit orta sahalarına agresif gölge baskısı yapmak ve asimetrik pas koridorlarını desteklemek üzere yerleşik olacaktır.
                                </p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      ) : (
                        <div className="py-12 text-center text-slate-500 text-xs italic">Seçili bir taktik rol bilgisi bulunmuyor.</div>
                      )}
                    </div>

                    <div className="pt-4 border-t border-white/[0.04] text-[10px] space-y-2 mt-4">
                      <div className="text-slate-400 font-bold uppercase tracking-wider font-mono">Saha İçi Direktifleri</div>
                      <p className="text-slate-500 leading-normal">
                        Kompakt blok disiplini ön alan pres başarısını doğrudan belirleyecektir.
                      </p>
                    </div>
                  </div>
                </div>

              </div>
              
              {/* 7. Tactical Analysis Panel fields */}
              <div className="p-6 rounded-2xl bg-[#0b101c] border border-white/[0.06] space-y-4">
                <h3 className="text-sm font-black text-white uppercase tracking-wider border-b border-white/5 pb-2 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-fb-yellow" /> MAÇ ÖNÜ STRATEJİK ANAHTARLARI
                </h3>

                {resolvedActiveMatch.tacticalNotes ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="p-3.5 rounded-xl bg-white/[0.01] border border-white/5 space-y-1">
                      <span className="text-[9px] font-black text-fb-yellow font-mono uppercase">KİLİT EŞLEŞME</span>
                      <p className="text-xs text-slate-300 leading-relaxed font-bold">{resolvedActiveMatch.tacticalNotes.keyMatchup || "Merkez çarpışması ve savunma koridorları."}</p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-white/[0.01] border border-white/5 space-y-1">
                      <span className="text-[9px] font-black text-rose-400 font-mono uppercase">RİSK BÖLGESİ</span>
                      <p className="text-xs text-slate-300 leading-relaxed font-bold">{resolvedActiveMatch.tacticalNotes.riskZone || "Kenar kanat sarkmaları ve ani kontralar."}</p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-white/[0.01] border border-white/5 space-y-1">
                      <span className="text-[9px] font-black text-amber-500 font-mono uppercase">PRES PLANI</span>
                      <p className="text-xs text-slate-300 leading-relaxed font-bold">{resolvedActiveMatch.tacticalNotes.pressPlan || "İkinci bölgede agresif adam markajı."}</p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-white/[0.01] border border-white/5 space-y-1">
                      <span className="text-[9px] font-black text-[#5adea9] font-mono uppercase">GEÇİŞ OYUNU NOTU</span>
                      <p className="text-xs text-slate-300 leading-relaxed font-bold">{resolvedActiveMatch.tacticalNotes.transitionPlay || "Kazanılan hızlı toplarla derinlik kovalaması."}</p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-white/[0.01] border border-white/5 space-y-1">
                      <span className="text-[9px] font-black text-sky-400 font-mono uppercase">DURAN TOP NOTU</span>
                      <p className="text-xs text-slate-300 leading-relaxed font-bold">{resolvedActiveMatch.tacticalNotes.setPiece || "Ön direğe varyasyonel kesmeler."}</p>
                    </div>
                  </div>
                ) : (
                  <div className="py-4 text-[#FFD21F]/80 text-xs italic font-semibold">
                    Bu maç için taktik analiz notu henüz eklenmedi.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: CANLI */}
          {activeTab === "Canlı" && (
            <div className="p-12 rounded-2xl bg-[#0b101c] border border-white/[0.08] text-center space-y-4 max-w-xl mx-auto animate-fade-in">
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto text-slate-400">
                <Clock className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-black text-white uppercase">Maç şu anda canlı değil.</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                  Canlı müsabaka dakikaları başladığında, bu panelde anlık top şemaları, şans yüzdeleri ve dakika olay simülasyonları etkinleşir.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: MAÇ SONU */}
          {activeTab === "Maç Sonu" && (
            <div className="space-y-6 animate-fade-in">
              {matchReports && matchReports.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Left big details */}
                  <div className="lg:col-span-8 space-y-6">
                    {matchReports.map((report) => (
                      <div key={report.id} className="p-6 md:p-8 rounded-2xl bg-[#0e1320] border border-white/[0.08] space-y-6 relative overflow-hidden">
                        <div className="absolute top-0 inset-x-0 h-[2px] bg-[#FFD21F]" />
                        
                        <div className="space-y-3">
                          <span className="text-[10px] text-fb-yellow font-black uppercase tracking-widest font-mono">TAKTMSEL ANALİZ RAPORU</span>
                          <h3 className="text-2xl font-display font-black text-white uppercase leading-tight italic">{report.title}</h3>
                          <div className="text-xs text-slate-400 font-bold">{formattedDate(report.createdAt)}</div>
                        </div>

                        <p className="text-sm text-slate-300 leading-relaxed font-medium bg-white/[0.01] border-l-2 border-l-[#FFD21F] pl-4 py-1 italic">
                          "{report.summary}"
                        </p>

                        <div className="space-y-4 pt-4 border-t border-white/5">
                          <h4 className="text-xs font-black text-white uppercase tracking-wider">Maç Hikayesi & Oyun Yapısı</h4>
                          <p className="text-xs text-slate-400 leading-relaxed">{report.matchStory || 'Rapor detayları şu sıralarda analiz kurulunca düzenlenmekte.'}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                          <div className="p-4 rounded-xl bg-[#060a12] border border-white/5 space-y-1 leading-snug">
                            <span className="text-[9px] font-black text-[#5adea9] font-mono">TACTICAL POSITIVES (ARILARIMIZ - ARTILAR)</span>
                            <p className="text-xs text-slate-300 font-semibold">{report.tacticalPositives || 'Kusursuz ikinci bölge presi.'}</p>
                          </div>
                          <div className="p-4 rounded-xl bg-[#060a12] border border-white/5 space-y-1 leading-snug">
                            <span className="text-[9px] font-black text-rose-400 font-mono">TACTICAL NEGATIVES (EKSİK HUSUSLARIMIZ)</span>
                            <p className="text-xs text-slate-300 font-semibold">{report.tacticalNegatives || 'Savunma geçişlerinde ağır kalınması.'}</p>
                          </div>
                        </div>

                        <div className="p-4 rounded-xl bg-gradient-to-r from-[#141d2f]/50 to-[#0e1423] border border-white/5 space-y-2">
                          <h5 className="text-[10px] text-[#FFD21F] font-black uppercase tracking-wider font-mono">Kritik Dönüm Noktası (Key Moment)</h5>
                          <p className="text-xs text-slate-300 font-semibold">{report.turningPoint || '60\'daki hamleler gidişatı canlandırdı.'}</p>
                        </div>

                        {report.playerRatings && report.playerRatings.length > 0 && (
                          <div className="space-y-3.5 pt-4">
                            <h4 className="text-xs font-black text-white uppercase tracking-wider font-mono">Teknik Analiz Kurulu Detaylı Oyuncu Puanlamaları</h4>
                            <div className="divide-y divide-white/5">
                              {report.playerRatings.map((rating: any, rIdx: number) => (
                                <div key={rIdx} className="py-2.5 flex items-start justify-between text-xs gap-4">
                                  <div>
                                    <div className="font-bold text-white uppercase">{rating.name} <span className="font-mono text-[9px] text-[#FFD21F] bg-white/5 px-1.5 py-0.5 rounded ml-1.5 font-normal">{rating.position}</span></div>
                                    <p className="text-[11px] text-slate-400 leading-normal mt-0.5">{rating.comment}</p>
                                  </div>
                                  <div className="text-sm font-black text-fb-yellow font-mono">{rating.rating.toFixed(1)}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="lg:col-span-4 space-y-4 text-left">
                    <div className="p-5 rounded-2xl bg-[#0b101c] border border-white/[0.08] space-y-4">
                      <span className="text-[10px] text-[#FFD21F] font-black uppercase tracking-widest block font-mono">TARAFTAR SEÇİMİ (Maçın Oyuncusu)</span>
                      
                      {matchReports[0]?.fanMotm ? (
                        <div className="space-y-2">
                          <div className="text-white text-base font-black italic">{matchReports[0].fanMotm}</div>
                          <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                            Sarı-lacivertli taraftarların ezici çoğunluğu bu karşılaşmadaki dinamizmi sebebiyle kendisini MVP seçti.
                          </p>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500 italic">Oyuncu anketi oylanmadı.</p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-12 rounded-2xl bg-[#0b101c] border border-white/[0.08] text-center space-y-4 max-w-xl mx-auto animate-fade-in">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto text-slate-400">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-black text-white uppercase">Maç sonu raporu henüz eklenmedi.</h3>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                      Bu karşılaşmanın detaylı taktik kurgu analizi, oyuncu performans haritaları karşılaşma bittikten kısa süre sonra yayınlanacaktır.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: İSTATİSTİK */}
          {activeTab === "İstatistik" && (
            <div className="animate-fade-in">
              {resolvedActiveMatch.possessionHome !== undefined ? (
                <div className="p-6 md:p-8 rounded-2xl bg-[#0b101c] border border-white/[0.08] grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  
                  {/* Left stats columns */}
                  <div className="lg:col-span-7 space-y-5">
                    <span className="text-[10px] font-black text-[#FFD21F] tracking-widest uppercase block border-b border-white/5 pb-2.5 font-mono">MÜSABAKA İSTATİSTİK CÜZDANI</span>
                    
                    {/* Possession */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-bold text-slate-300">
                        <span>Topa Sahip Olma (%)</span>
                        <span className="text-white font-mono font-black">{resolvedActiveMatch.possessionHome}% - {resolvedActiveMatch.possessionAway}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-white/5 overflow-hidden flex">
                        <div className="bg-[#FFD21F] rounded-l-full" style={{ width: `${resolvedActiveMatch.possessionHome}%` }} />
                        <div className="bg-slate-500 rounded-r-full" style={{ width: `${resolvedActiveMatch.possessionAway}%` }} />
                      </div>
                    </div>

                    {/* Shots */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-bold text-slate-300">
                        <span>Toplam Şut</span>
                        <span className="text-white font-mono font-black">{resolvedActiveMatch.shotsHome} - {resolvedActiveMatch.shotsAway}</span>
                      </div>
                      <div className="h-2 rounded-full bg-white/5 overflow-hidden flex">
                        <div className="bg-[#FFD21F]" style={{ width: `${(resolvedActiveMatch.shotsHome / (resolvedActiveMatch.shotsHome + resolvedActiveMatch.shotsAway || 1)) * 100}%` }} />
                        <div className="bg-slate-500" style={{ width: `${(resolvedActiveMatch.shotsAway / (resolvedActiveMatch.shotsHome + resolvedActiveMatch.shotsAway || 1)) * 100}%` }} />
                      </div>
                    </div>

                    {/* Pass Accuracy */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-bold text-slate-300">
                        <span>Pas İsabet Oranı (%)</span>
                        <span className="text-white font-mono font-black">{resolvedActiveMatch.passAccuracyHome}% - {resolvedActiveMatch.passAccuracyAway}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-white/5 overflow-hidden flex">
                        <div className="bg-[#FFD21F]" style={{ width: `${resolvedActiveMatch.passAccuracyHome}%` }} />
                        <div className="bg-slate-500" style={{ width: `${resolvedActiveMatch.passAccuracyAway}%` }} />
                      </div>
                    </div>

                    {/* Corner */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-bold text-[#FFD21F]/80">
                        <span>Köşe Vuruşu (Korner)</span>
                        <span className="text-white font-mono font-bold">{(resolvedActiveMatch.cornersHome || 'Yok')} - {(resolvedActiveMatch.cornersAway || 'Yok')}</span>
                      </div>
                    </div>

                    {/* Faul */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-bold text-slate-400">
                        <span>Faul Sayısı</span>
                        <span className="text-white font-mono font-bold">{(resolvedActiveMatch.foulsHome || 'Bilinmiyor')} - {(resolvedActiveMatch.foulsAway || 'Bilinmiyor')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right xG detail column (Strict Rule: Do not fake xG if empty) */}
                  <div className="lg:col-span-5 p-5 rounded-xl bg-white/[0.01] border border-white/5 space-y-4">
                    <span className="text-[9px] text-fb-yellow tracking-widest uppercase block font-black font-mono">xG & ANALİTİK MAÇ METRİĞİ</span>
                    
                    {resolvedActiveMatch.xG ? (
                      <div className="p-3 bg-emerald-500/10 rounded-lg">
                        <div className="text-xs uppercase text-emerald-400 font-black">Müsabaka Gol Beklentisi (xG)</div>
                        <div className="text-xl font-mono font-black text-white mt-1">{resolvedActiveMatch.xG}</div>
                      </div>
                    ) : (
                      <div className="p-3.5 bg-white/[0.02] border border-white/5 rounded-lg text-slate-400 text-xs italic leading-relaxed">
                        xG verisi henüz bulunmuyor.
                      </div>
                    )}

                    <p className="text-xs text-slate-400 leading-relaxed leading-snug">
                      Derbi ve lig karşılaşmalarının anlık istatistiki Opta parametreleri, antrenör raporları ve analist şablonları veri tabanından bu panele aktarılır.
                    </p>
                  </div>

                </div>
              ) : (
                <div className="p-12 rounded-2xl bg-[#0b101c] border border-white/[0.08] text-center space-y-4 max-w-xl mx-auto animate-fade-in">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto text-slate-400">
                    <BarChart3 className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-black text-white uppercase">Bu maç için istatistik verisi henüz bulunmuyor.</h3>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                      Karşılaşmaya ait şut, korner, isabetli pas verileri karşılaşma başladığında veya bittiğinde bu sekmede canlanacaktır.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: TARAFTAR TAHMİNİ */}
          {activeTab === "Taraftar Tahmini" && (
            <div className="animate-fade-in">
              {resolvedActiveMatch ? (
                <div className="rounded-2xl bg-[#0b101c] border border-white/[0.06] p-6 text-left max-w-2xl mx-auto space-y-6">
                  <div className="flex items-center gap-2 text-fb-yellow">
                    <Vote className="w-4 h-4 text-fb-yellow" />
                    <span className="text-[10px] font-black uppercase tracking-widest font-mono">Bu Maç Nasıl Sonuçlanır?</span>
                  </div>

                  <h3 className="text-xl md:text-2xl font-display font-black text-white italic uppercase">{resolvedActiveMatch.homeTeam} vs {resolvedActiveMatch.awayTeam}</h3>
                  
                  <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                    Fenerbahçe taraftar topluluğunun bu müsabaka hakkındaki nabzını ölçüyoruz. Oyunuz kaydedildiğinde diğer taraftarların anlık yüzdesel gidişat dağılımlarını görebilirsiniz.
                  </p>

                  {!pollVotes.voted ? (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                      <button 
                        onClick={() => handleVote('home')}
                        className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-fb-yellow font-black text-xs text-center text-white transition-all hover:scale-[1.01] cursor-pointer"
                      >
                        {resolvedActiveMatch.homeTeam === 'Fenerbahçe' ? 'Fenerbahçe Kazanır' : `${resolvedActiveMatch.homeTeam} Kazanir`}
                      </button>
                      <button 
                        onClick={() => handleVote('draw')}
                        className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-fb-yellow font-black text-xs text-center text-white transition-all hover:scale-[1.01] cursor-pointer"
                      >
                        Beraberlik
                      </button>
                      <button 
                        onClick={() => handleVote('away')}
                        className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-fb-yellow font-black text-xs text-center text-[#ffea8c] transition-all hover:scale-[1.01] cursor-pointer"
                      >
                        {resolvedActiveMatch.awayTeam.toLowerCase().includes('fenerbahce') || resolvedActiveMatch.awayTeam.toLowerCase().includes('fenerbahçe') ? 'Fenerbahçe Kazanır' : `${resolvedActiveMatch.awayTeam} Kazanır`}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4 pt-2">
                      <div className="text-xs text-emerald-400 font-bold flex items-center gap-2 uppercase font-mono">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Tahmininiz Kaydedildi: <span className="text-white font-black">"{pollVotes.selectedOption}"</span>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-slate-300 text-[11px] font-bold mb-1">
                            <span>{resolvedActiveMatch.homeTeam} Galibiyeti</span>
                            <span>{homePct}%</span>
                          </div>
                          <div className="h-2.5 rounded-full bg-white/5 overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${homePct}%` }}
                              className="h-full bg-fb-yellow rounded-full" 
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-[#a0aec0] text-[11px] font-bold mb-1">
                            <span>Beraberlik</span>
                            <span>{drawPct}%</span>
                          </div>
                          <div className="h-2.5 rounded-full bg-white/5 overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${drawPct}%` }}
                              className="h-full bg-slate-400 rounded-full" 
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-slate-300 text-[11px] font-bold mb-1">
                            <span>{resolvedActiveMatch.awayTeam} Galibiyeti</span>
                            <span>{awayPct}%</span>
                          </div>
                          <div className="h-2.5 rounded-full bg-white/5 overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${awayPct}%` }}
                              className="h-full bg-rose-500 rounded-full" 
                            />
                          </div>
                        </div>
                      </div>

                      <div className="text-[10px] text-slate-400 italic pt-2 flex justify-between font-mono">
                        <span>Canlı topluluk oylaması bülteni</span>
                        <span>Toplam oy: {totalVotes}</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-12 rounded-2xl bg-[#0b101c] border border-white/[0.08] text-center space-y-4 max-w-xl mx-auto animate-fade-in">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto text-slate-400">
                    <Vote className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-black text-white uppercase">Bu maç için tahmin anketi henüz açılmadı.</h3>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </section>

      {/* 5. Fixtures Section & Filter List */}
      <section id="fixtures-and-calendar" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-4">
        
        {/* Left Side: Fixtures */}
        <div id="fixtures-and-calendar" className="lg:col-span-8 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-3">
            <h2 className="text-2xl font-display font-black text-white italic uppercase tracking-tight">Fikstür ve Maç Takvimi</h2>
            
            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-1.5 overflow-x-auto max-w-full">
              {["Tüm Maçlar", "Yaklaşan Maçlar", "Tamamlanan Maçlar", "Süper Lig", "Türkiye Kupası", "Avrupa"].map((filter) => {
                const isSelected = fixtureFilter === filter;
                return (
                  <button
                    key={filter}
                    onClick={() => setFixtureFilter(filter)}
                    className={`px-3 py-1 rounded text-[10px] font-mono font-black uppercase transition-all whitespace-nowrap cursor-pointer ${
                      isSelected ? 'bg-fb-yellow text-fb-navy font-bold' : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {filter}
                  </button>
                );
              })}
            </div>
          </div>

          {filteredFixtures && filteredFixtures.length > 0 ? (
            <div className="space-y-3.5">
              {filteredFixtures.map((item) => {
                const matchDateObj = new Date(item.matchDate);
                const itemFinished = item.status === 'finished' || item.status === 'completed';
                const itemLive = item.status === 'live';
                
                return (
                  <div 
                    key={item.id} 
                    className="p-4 md:p-5 rounded-xl bg-[#0b101c] hover:bg-white/[0.01] border border-white/[0.05] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all"
                  >
                    {/* Left details */}
                    <div className="flex items-center gap-3.5 text-left shrink-0">
                      <div className="p-2.5 bg-[#05080e] rounded-lg border border-white/5 text-center min-w-[54px] font-mono">
                        <div className="text-sm font-black italic text-fb-yellow">{matchDateObj.getDate()}</div>
                        <div className="text-[8px] text-slate-400 font-extrabold uppercase mt-0.5">{matchDateObj.toLocaleDateString('tr-TR', { month: 'short' })}</div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[9px] text-emerald-400 font-bold uppercase block tracking-wider font-mono">{item.competition}</span>
                        <div className="text-xs text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-[#FFD21F]" /> <span>{formattedTime(item.matchDate)}</span>
                          <span className="text-white/20 select-none">•</span>
                          <span>{item.venue?.split('/')[0] || 'Kadir Has Stadı'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Middle Scoreboard Teams */}
                    <div className="flex items-center gap-4 max-w-sm flex-1 justify-center">
                      {/* Team A */}
                      <div className="flex items-center gap-2 text-right justify-end w-[42%]">
                        <span className="text-xs font-black text-white uppercase truncate">{item.homeTeam}</span>
                        {getTeamLogo(item.homeTeam, item.homeLogo) ? (
                          <img src={getTeamLogo(item.homeTeam, item.homeLogo)!} alt="" className="w-4.5 h-4.5 object-contain" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="w-4 h-4 rounded-full bg-slate-800 text-[8px] flex items-center justify-center font-mono">
                            {getInitials(item.homeTeam)}
                          </div>
                        )}
                      </div>

                      {/* Middle Badge / Score */}
                      <div className="font-mono text-xs text-center font-black min-w-[52px]">
                        {itemFinished || itemLive ? (
                          <span className="px-2.5 py-1 bg-white/5 border border-white/10 rounded text-fb-yellow text-sm font-black italic">
                            {item.scoreHome} - {item.scoreAway}
                          </span>
                        ) : (
                          <span className="text-[9px] text-[#FFD21F] bg-[#FFD21F]/10 px-2 py-0.5 rounded border border-[#FFD21F]/20 uppercase">
                            VS
                          </span>
                        )}
                      </div>

                      {/* Team B */}
                      <div className="flex items-center gap-2 text-left justify-start w-[42%]">
                        {getTeamLogo(item.awayTeam, item.awayLogo) ? (
                          <img src={getTeamLogo(item.awayTeam, item.awayLogo)!} alt="" className="w-4.5 h-4.5 object-contain" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="w-4 h-4 rounded-full bg-slate-800 text-[8px] flex items-center justify-center font-mono">
                            {getInitials(item.awayTeam)}
                          </div>
                        )}
                        <span className="text-xs font-black text-white uppercase truncate">{item.awayTeam}</span>
                      </div>
                    </div>

                    {/* Action Buttons to select/analyze */}
                    <div className="flex gap-1.5 self-end sm:self-auto shrink-0 font-mono">
                      <button 
                        onClick={() => handleSelectFixture(item, "Maç Önü")}
                        className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-white rounded text-[9px] font-black uppercase transition-all cursor-pointer"
                      >
                        Detay
                      </button>
                      <button 
                        onClick={() => handleSelectFixture(item, "İstatistik")}
                        className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-white rounded text-[9px] font-black uppercase transition-all cursor-pointer"
                      >
                        Analiz
                      </button>
                      <button 
                        onClick={() => handleSelectFixture(item, "Maç Sonu")}
                        className="px-2.5 py-1 bg-[#FFD21F]/10 hover:bg-[#FFD21F]/20 text-fb-yellow rounded text-[9px] font-black uppercase transition-all border border-[#FFD21F]/10 cursor-pointer"
                      >
                        Rapor
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 rounded-xl bg-white/[0.01] border border-white/5 text-center text-slate-500 text-xs italic">
              Seçilen kıstaslara uygun maç ya da fikstür kaydı veritabanında bulunamadı.
            </div>
          )}
        </div>

        {/* Right Side: 10. Standings Preview Column */}
        <div className="lg:col-span-4 space-y-6">
          <div className="border-b border-white/5 pb-3">
            <h2 className="text-2xl font-display font-black text-white italic uppercase tracking-tight">Puan Durumu</h2>
          </div>

          {standings && standings.length > 0 ? (
            <div className="rounded-2xl bg-[#0b101c] border border-white/[0.08] p-4 space-y-3.5 shadow-xl">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block border-b border-white/5 pb-2 font-mono">TRENDYOL SÜPER LİG PUAN CETVELİ</span>
              
              <div className="space-y-2">
                {/* Headers */}
                <div className="grid grid-cols-12 text-[9px] font-extrabold uppercase text-slate-500 font-mono tracking-wider border-b border-white/5 pb-1 text-center">
                  <div className="col-span-1 border-r border-white/5">Sıra</div>
                  <div className="col-span-6 text-left pl-2">Takım</div>
                  <div className="col-span-1">O</div>
                  <div className="col-span-1 text-emerald-400">G</div>
                  <div className="col-span-1 text-slate-400">B</div>
                  <div className="col-span-1 text-rose-400">M</div>
                  <div className="col-span-1 font-black text-[#FFD21F] font-mono">P</div>
                </div>

                {/* Rows limit top 8 or standings content */}
                {standings.slice(0, 10).map((row, index) => {
                  const isFenerbahce = row.teamName?.toLowerCase().includes('fenerbahce') || row.teamName?.toLowerCase().includes('fenerbahçe') || row.teamId === 611;
                  return (
                    <div 
                      key={index} 
                      className={`grid grid-cols-12 items-center text-xs text-center py-2.5 rounded-lg border transition-all ${
                        isFenerbahce 
                          ? 'bg-fb-yellow/10 border-[#FFD21F]/30 text-white font-black shadow-[inset_0_0_10px_rgba(255,210,31,0.1)]' 
                          : 'bg-white/[0.01] border-transparent text-slate-300 hover:bg-white/[0.02]'
                      }`}
                    >
                      <div className="col-span-1 font-mono font-black">{row.rank || index + 1}</div>
                      <div className="col-span-6 flex items-center gap-2 text-left pl-2 font-semibold">
                        {getTeamLogo(row.teamName, row.logo) ? (
                          <img src={getTeamLogo(row.teamName, row.logo)!} alt="" className="w-4 h-4 object-contain" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="w-4 h-4 rounded bg-slate-800 text-[8px] flex items-center justify-center font-mono">
                            {getInitials(row.teamName)}
                          </div>
                        )}
                        <span className={`truncate text-xxs ${isFenerbahce ? 'text-[#FFD21F]' : ''}`}>{row.teamName || 'Bilinmeyen'}</span>
                      </div>
                      <div className="col-span-1 font-mono">{row.played}</div>
                      <div className="col-span-1 font-mono text-emerald-400">{row.win}</div>
                      <div className="col-span-1 font-mono text-slate-400">{row.draw}</div>
                      <div className="col-span-1 font-mono text-rose-400">{row.lose}</div>
                      <div className="col-span-1 font-mono font-black text-[#FFD21F] text-xs">{row.points}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="p-10 rounded-2xl bg-[#0b101c] border border-white/[0.08] text-center text-slate-500 text-xs italic font-semibold leading-relaxed">
              Puan durumu verisi henüz eklenmedi.
            </div>
          )}
        </div>

      </section>

      {/* 9. Latest Match Reports Panel */}
      <section className="space-y-6 pt-4">
        <div className="border-b border-white/5 pb-3">
          <h2 className="text-2xl font-display font-black text-white italic uppercase tracking-tight">Son Maç Raporları</h2>
        </div>

        {matchReports && matchReports.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matchReports.slice(0, 3).map((report) => (
              <div 
                key={report.id} 
                className="bg-[#0e1320] rounded-xl border border-white/[0.08] p-5 flex flex-col justify-between hover:border-fb-yellow/20 transition-all shadow-lg text-left"
              >
                <div className="space-y-3.5">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-mono px-2 py-0.5 bg-fb-yellow/10 text-fb-yellow border border-fb-yellow/20 rounded font-bold uppercase">
                      MAÇ SONU ANALİZİ
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">{formattedDate(report.createdAt)}</span>
                  </div>
                  
                  <h4 className="text-sm font-black text-white hover:text-fb-yellow transition-all uppercase leading-tight line-clamp-2 italic">
                    {report.title}
                  </h4>
                  
                  <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                    {report.summary || 'Fenerbahçe\'nin galibiyeti sonrasındaki taktiksel gelişim, Mourinho tercihleri ve koridor varyasyon analiz notu.'}
                  </p>
                </div>

                <div className="pt-5 border-t border-white/5 mt-5 flex items-center justify-between">
                  <span className="text-[10px] font-mono font-black text-[#3DDC97]">● {report.fanMotm || 'Fred (#35)'} MVP</span>
                  <button 
                    onClick={() => {
                      setActiveTab("Maç Sonu");
                      // find this exact match in matches list and set it active
                      const relatedMatch = matches.find(m => m.id === report.matchId);
                      if (relatedMatch) {
                        setActiveMatch(relatedMatch);
                      }
                      const el = document.getElementById('match-details-tabs-hub');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="text-xs font-black text-[#FFD21F] hover:text-white transition-all flex items-center gap-1 cursor-pointer font-mono"
                  >
                    Raporu Oku <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-10 rounded-xl bg-[#0b101c] border border-white/[0.08] text-center text-slate-500 text-xs italic font-semibold leading-relaxed">
            Henüz maç raporu eklenmedi.
          </div>
        )}
      </section>

      {/* 12. Premium CTA */}
      <section id="premium-match-teaser" className="pt-4">
        <div className="rounded-3xl bg-gradient-to-r from-[#0d131f] to-[#121825] border border-fb-yellow/25 p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-fb-yellow/5 rounded-full blur-[70px] pointer-events-none" />

          <div className="space-y-4 max-w-xl text-left relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-fb-yellow/10 border border-fb-yellow/30 text-[10px] font-black uppercase text-fb-yellow tracking-widest font-mono">
              <Sparkles className="w-3.5 h-3.5 fill-current text-[#FFD21F]" /> Premium İçerik
            </div>
            <h2 className="text-2xl md:text-3xl font-display font-black text-white uppercase italic leading-none">Detaylı maç raporları Premium’da</h2>
            <p className="text-xs text-slate-300 leading-relaxed font-semibold">
              Maç sonrası kapsamlı analizler, oyuncu performansları ve taktik notları haftalık raporlarda. Hemen listemize katılın ve ilk bülteni kaçırmayın.
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
                    className="w-full px-4 py-3.5 rounded-lg bg-[#05080f] border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-fb-yellow text-xs font-semibold text-center"
                  />
                  <button
                    type="submit"
                    className="w-full py-3 bg-fb-yellow hover:bg-white text-fb-navy font-black text-xs uppercase tracking-wider rounded-lg transition-all shadow-[0_4px_22px_rgba(255,210,31,0.25)] cursor-pointer"
                  >
                    Premium’a Katıl
                  </button>
                </motion.form>
              ) : (
                <motion.div 
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold text-center w-full"
                >
                  <div className="text-sm font-black mb-1">Listeye Kaydoldunuz! 🎉</div>
                  <p className="text-slate-400 leading-tight">
                    Premium bülten PDF analizi hazır olduğunda bu adrese ulaştırılacaktır.
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
