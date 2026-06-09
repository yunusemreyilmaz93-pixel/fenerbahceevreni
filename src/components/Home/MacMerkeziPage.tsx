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
  Flag,
  Tv,
  Activity,
  Award as RibbonIcon
} from 'lucide-react';
import { dbGetCollection } from '../../lib/dbService';

interface MacMerkeziPageProps {
  onNavigate: (view: string) => void;
}

export const MacMerkeziPage: React.FC<MacMerkeziPageProps> = ({ onNavigate }) => {
  const [matches, setMatches] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedXIPosition, setSelectedXIPosition] = useState<string | null>("CF");
  
  // Voting State
  const [pollVotes, setPollVotes] = useState({
    home: 74,
    draw: 18,
    away: 8,
    voted: false
  });
  
  const [countdown, setCountdown] = useState({ gün: 0, saat: 14, dakika: 42, saniye: 55 });
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterJoined, setNewsletterJoined] = useState(false);

  // Subscriptions & DB Fetch
  useEffect(() => {
    const loadDbData = async () => {
      try {
        setLoading(true);
        const matchesList = await dbGetCollection('matches');
        const teamsList = await dbGetCollection('teams');
        setMatches(matchesList || []);
        setTeams(teamsList || []);
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
          return { gün: 0, saat: 4, dakika: 0, saniye: 0 }; // fallback
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

  // Resolve team logos dynamically based on the DB
  const getTeamLogo = (teamName: string) => {
    const found = teams.find(t => t.name?.toLowerCase() === teamName?.toLowerCase() || t.shortName?.toLowerCase() === teamName?.toLowerCase());
    return found?.logoUrl || found?.logo || 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=80&fit=crop';
  };

  // Find Featured Match or use most recent or first available
  const activeMatch = matches.find(m => m.featured) || matches[0] || {
    id: "mock-fallback",
    homeTeam: "Fenerbahçe",
    awayTeam: "Beşiktaş",
    competition: "Trendyol Süper Lig • 36. Hafta",
    matchDate: "2026-05-30T20:00:00",
    venue: "Ülker Stadyumu Şükrü Saracoğlu Spor Kompleksi / Kadıköy",
    status: "upcoming",
    scoreHome: 0,
    scoreAway: 0,
    matchPreview: "Fenerbahçe bu karşılaşmada yüksek yoğunluklu ön alan baskısı yaparak oyun temposunu erkenden eline almak, merkez orta sahada geçiş savunmasını dengede tutmak ve kanat bindirmeleriyle ceza sahasını beslemek zorunda.",
    referee: "Halil Umut Meler",
    broadcasterTarget: "beIN Sports 1",
    scorerDetailsHome: "Edin Džeko 12\', Dušan Tadić 55\'(P)",
    scorerDetailsAway: "Mauro Icardi 33\'",
    cardsDetails: "A. Djiku 41\'(Y) • J. Svensson 80\'(Y)",
    substitutionDetails: "Edin Džeko ➔ Youssef En-Nesyri (75\')",
    possessionHome: 55,
    possessionAway: 45,
    shotsHome: 14,
    shotsAway: 8,
    shotsOnTargetHome: 6,
    shotsOnTargetAway: 3,
    passAccuracyHome: 84,
    passAccuracyAway: 78,
    cornersHome: 5,
    cornersAway: 2,
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
    }
  };

  const xi = activeMatch.probableXI || {
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
  };

  const formattedDate = () => {
    try {
      const d = new Date(activeMatch.matchDate);
      return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch {
      return "30 Mayıs 2026";
    }
  };

  const formattedTime = () => {
    try {
      const d = new Date(activeMatch.matchDate);
      return d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return "20:00";
    }
  };

  const isLive = activeMatch.status === 'live';
  const isCompleted = activeMatch.status === 'completed';

  const squadXI_Dynamic = {
    GK: { name: xi.GK || "Dominik Livaković", no: 40, role: "Kaleci" },
    RB: { name: xi.RB || "Bright Osayi-Samuel", no: 21, role: "Sağ Bek" },
    CB1: { name: xi.CB1 || "Alexander Djiku", no: 6, role: "Stoper" },
    CB2: { name: xi.CB2 || "Çağlar Söyüncü", no: 2, role: "Stoper" },
    LB: { name: xi.LB || "Jayden Oosterwolde", no: 24, role: "Sol Bek" },
    DM1: { name: xi.DM1 || "İsmail Yüksek", no: 5, role: "Ön Libero" },
    DM2: { name: xi.DM2 || "Fred", no: 35, role: "Merkez Orta Saha" },
    RW: { name: xi.RW || "İrfan Can Kahveci", no: 17, role: "Sağ Kanat" },
    AM: { name: xi.AM || "Sebastian Szymański", no: 53, role: "On Numara" },
    LW: { name: xi.LW || "Dušan Tadić", no: 10, role: "Sol Kanat" },
    CF: { name: xi.CF || "Edin Džeko", no: 9, role: "Santrafor" }
  };

  return (
    <div id="mac-merkezi-index" className="space-y-16 pb-24 text-left">
      <SEO 
        title="Maç Merkezi | Fenerbahçe Evreni"
        description="Fenerbahçe maç önü taktik notları, muhtemel 11'ler, son maç analiz dökümanları, oyuncu puan karnesi ve taraftar skor tahminleri."
        canonical="https://fenerbahceevreni.com/mac-merkezi"
      />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-8 border-b border-white/[0.04] bg-gradient-to-b from-fb-navy/20 to-transparent">
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
            Fenerbahçe’nin taktik dersleri, stadyum verileri, muhtemel şablonları, d3 destekli istatistikleri ve anlık canlanan simülasyonları burada.
          </p>
        </div>
      </section>

      {/* SECTION 2: Large Match Card */}
      <section id="featured-match-section" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch pt-2">
        <div className="lg:col-span-8 rounded-2xl bg-fb-card border border-white/[0.08] p-6 md:p-8 flex flex-col justify-between relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 inset-x-0 h-[3px] bg-fb-yellow" />
          
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded ${isLive ? 'bg-red-500/10 text-red-400 animate-pulse border border-red-500/20' : isCompleted ? 'bg-emerald-500/10 text-emerald-400' : 'bg-fb-yellow/10 text-fb-yellow'}`}>
                {isLive ? 'CANLI MAÇ' : isCompleted ? 'MAÇ SONU' : 'MAÇ ÖNÜ'}
              </span>
              <span className="text-xs text-fb-muted font-bold tracking-wider">{activeMatch.competition}</span>
            </div>

            {/* Confrontment Board */}
            <div className="grid grid-cols-3 items-center py-6 text-center border-b border-white/[0.05]">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-[#0a0f1d] flex items-center justify-center p-2 border border-fb-yellow/20 shadow-lg">
                  <img src={getTeamLogo(activeMatch.homeTeam)} alt="" className="w-12 h-12 object-contain" />
                </div>
                <span className="text-sm font-black text-white mt-3 uppercase tracking-wide leading-tight">{activeMatch.homeTeam}</span>
              </div>

              <div className="flex flex-col items-center">
                {isLive || isCompleted ? (
                  <div className="space-y-1">
                    <span className="text-4xl font-display font-black tracking-tight text-white font-mono">
                      {activeMatch.scoreHome} - {activeMatch.scoreAway}
                    </span>
                    {isLive && (
                      <span className="text-[10px] text-red-400 font-extrabold tracking-widest block uppercase animate-pulse">● CANLI SİMÜLASYON</span>
                    )}
                  </div>
                ) : (
                  <div className="space-y-1">
                    <span className="text-[9px] text-fb-yellow font-black tracking-widest uppercase block">BAŞLAMA SAATİ</span>
                    <span className="text-2xl font-black italic text-white font-mono">{formattedTime()}</span>
                    <span className="text-[10px] text-fb-muted mt-2 font-bold tracking-wider">{formattedDate()}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-[#0a0f1d] flex items-center justify-center p-2 border border-slate-700/50 shadow-lg">
                  <img src={getTeamLogo(activeMatch.awayTeam)} alt="" className="w-12 h-12 object-contain" referrerPolicy="no-referrer" />
                </div>
                <span className="text-sm font-black text-white mt-3 uppercase tracking-wide leading-tight">{activeMatch.awayTeam}</span>
              </div>
            </div>

            {/* Live Scorer Details if applicable */}
            {(activeMatch.scorerDetailsHome || activeMatch.scorerDetailsAway) && (
              <div className="p-4 rounded-xl bg-fb-dark/40 border border-white/5 grid grid-cols-2 gap-4 text-xs font-bold text-slate-300">
                <div className="text-left border-r border-white/5 pr-4">
                  <span className="text-[9px] text-fb-muted uppercase block mb-1">Fenerbahçe Golleri</span>
                  <p className="font-mono text-white leading-tight">{activeMatch.scorerDetailsHome || 'Yok'}</p>
                </div>
                <div className="text-right pl-4">
                  <span className="text-[9px] text-fb-muted uppercase block mb-1">{activeMatch.awayTeam} Golleri</span>
                  <p className="font-mono text-white leading-tight">{activeMatch.scorerDetailsAway || 'Yok'}</p>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-1.5 text-fb-yellow">
                <Flag className="w-4 h-4" /> Taktik Köşesi Maç Analiz Notu
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed font-semibold">
                {activeMatch.matchPreview || "Karşılaşma ile ilgili taktiksel kurgular, savunma setleri ve Mourinho planları maç günü yüklenecektir."}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-8 border-t border-white/[0.05] mt-6">
            <button 
              onClick={() => {
                const el = document.getElementById('lineup-tactics-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex-1 py-3 px-4 rounded-xl bg-fb-yellow hover:bg-white text-fb-navy text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(255,210,31,0.2)] cursor-pointer hover:scale-[1.01]"
            >
              Maç Önü & Dizilişi İgili İncele
            </button>
            <button 
              onClick={() => {
                const el = document.getElementById('d3-match-analytics');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="py-3 px-6 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
            >
              Maç İçi Analitikleri
            </button>
          </div>
        </div>

        {/* SECTION 3: Right Side Information panel */}
        <div className="lg:col-span-4 flex flex-col gap-4 text-left">
          {!(isLive || isCompleted) ? (
            <div className="p-5 rounded-2xl bg-[#121826] border border-white/[0.06] flex-1 flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-fb-muted font-black tracking-widest uppercase block mb-2">MÜSABAKA BAŞLANGICINA KALAN</span>
                <div className="grid grid-cols-4 gap-2 text-center my-3">
                  {[
                    { val: countdown.gün, label: "GÜN" },
                    { val: countdown.saat, label: "SAAT" },
                    { val: countdown.dakika, label: "DK" },
                    { val: countdown.saniye, label: "SN" }
                  ].map((item, i) => (
                    <div key={i} className="bg-fb-dark/80 rounded-xl p-3 border border-white/5">
                      <div className="text-xl font-black italic text-fb-yellow font-mono">{item.val.toString().padStart(2, '0')}</div>
                      <div className="text-[8px] text-fb-muted font-black uppercase mt-1">{item.label}</div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="pt-4 border-t border-white/[0.04]">
                <div className="text-xs font-bold text-slate-300">Stadyum Bilgisi</div>
                <div className="text-[11px] text-fb-muted flex items-start gap-1 mt-1.5 leading-tight">
                  <MapPin className="w-3.5 h-3.5 text-fb-yellow shrink-0 mt-0.5" /> <span>{activeMatch.venue}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-5 rounded-2xl bg-[#121826]/90 border border-white/[0.06] flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                <span className="text-[10px] text-fb-yellow font-black tracking-widest uppercase block"> canli olay akisi panosu (Event Log)</span>
                
                {activeMatch.cardsDetails && (
                  <div className="p-3 bg-red-500/5 rounded-xl border border-red-500/10 space-y-1">
                    <span className="text-[9px] text-rose-400 font-extrabold uppercase">Kart Ayrıntıları (Cards)</span>
                    <p className="text-[11px] text-slate-300 font-semibold leading-tight">{activeMatch.cardsDetails}</p>
                  </div>
                )}

                {activeMatch.substitutionDetails && (
                  <div className="p-3 bg-blue-500/5 rounded-xl border border-blue-500/10 space-y-1">
                    <span className="text-[9px] text-blue-400 font-extrabold uppercase">Oyuncu Değişiklik Panosu (Subs)</span>
                    <p className="text-[11px] text-slate-300 font-semibold leading-tight">{activeMatch.substitutionDetails}</p>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-white/[0.04] mt-4">
                <div className="text-xs font-bold text-slate-300">Saha Konumu</div>
                <div className="text-[11px] text-fb-muted flex items-center gap-1 mt-1 leading-tight">
                  <MapPin className="w-3 h-3 text-fb-yellow shrink-0" /> {activeMatch.venue}
                </div>
              </div>
            </div>
          )}

          <div className="overflow-hidden rounded-2xl bg-fb-card border border-white/[0.08] p-5 space-y-3">
            <span className="text-[10px] text-fb-muted font-black tracking-widest uppercase block border-b border-white/5 pb-2">müsabaka ve medya karti</span>
            
            <div className="space-y-3 font-semibold text-xs text-slate-200">
              <div className="flex justify-between items-center">
                <span className="text-fb-muted">Müsabaka Hakemi</span>
                <span className="text-white font-black">{activeMatch.referee || 'Atanmadı'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-fb-muted">Yayıncı Kanal</span>
                <span className="text-fb-yellow font-black flex items-center gap-1">
                  <Tv size={12} /> {activeMatch.broadcasterTarget || 'beIN Sports'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-fb-muted">Oyun Sahası</span>
                <span className="text-white font-black text-right max-w-44 leading-tight">{activeMatch.venue?.split('/')[0]}</span>
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
          <div className="lg:col-span-8 rounded-3xl bg-gradient-to-b from-[#11241a] to-[#0d1612] border border-emerald-500/25 p-6 md:p-8 relative min-h-[520px] flex flex-col justify-between overflow-hidden shadow-2xl">
            {/* Field Lines overlay */}
            <div className="absolute inset-x-0 top-0 bottom-0 pointer-events-none opacity-25">
              <div className="absolute inset-4 border border-emerald-400/40" />
              <div className="absolute top-1/2 left-4 right-4 h-px bg-emerald-400/40 -translate-y-1/2" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border border-emerald-400/40" />
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-48 h-20 border-b border-x border-emerald-400/40" />
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-48 h-20 border-t border-x border-emerald-400/40" />
            </div>

            <div className="flex justify-between items-center relative z-20">
              <span className="text-[9px] font-black tracking-widest text-[#5adea9] px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> {xi.formation || '4-2-3-1'} TAKTİK ŞABLONU
              </span>
              <span className="text-[10px] text-slate-400 font-bold block">Kanallara dokunarak oyuncu rollerini sağ panelden inceleyin</span>
            </div>

            {/* Players on Visual Pitch */}
            <div className="relative flex-1 w-full flex flex-col justify-around py-8 min-h-[400px] z-20">
              
              {/* FORWARD */}
              <div className="flex justify-center">
                <button 
                  onClick={() => setSelectedXIPosition("CF")}
                  className={`w-14 h-14 rounded-full flex flex-col items-center justify-center font-bold text-xs border transition-all cursor-pointer ${
                    selectedXIPosition === "CF" ? 'bg-fb-yellow text-fb-navy border-white scale-110 shadow-[0_0_20px_rgba(255,210,31,0.5)]' : 'bg-fb-navy/80 text-white border-fb-yellow/50 hover:bg-fb-yellow hover:text-fb-navy'
                  }`}
                >
                  <span className="text-[9px] font-extrabold leading-none">CF</span>
                  <span className="font-display font-black leading-none mt-1">{squadXI_Dynamic.CF.no}</span>
                </button>
              </div>

              {/* AM, LW, RW */}
              <div className="flex justify-around px-8">
                <button 
                  onClick={() => setSelectedXIPosition("LW")}
                  className={`w-14 h-14 rounded-full flex flex-col items-center justify-center font-bold text-xs border transition-all cursor-pointer ${
                    selectedXIPosition === "LW" ? 'bg-fb-yellow text-fb-navy border-white scale-110 shadow-[0_0_20px_rgba(255,210,31,0.5)]' : 'bg-fb-navy/80 text-white border-fb-yellow/50 hover:bg-fb-yellow hover:text-fb-navy'
                  }`}
                >
                  <span className="text-[9px] font-extrabold leading-none">LW</span>
                  <span className="font-display font-black leading-none mt-1">{squadXI_Dynamic.LW.no}</span>
                </button>

                <button 
                  onClick={() => setSelectedXIPosition("AM")}
                  className={`w-14 h-14 rounded-full flex flex-col items-center justify-center font-bold text-xs border transition-all cursor-pointer ${
                    selectedXIPosition === "AM" ? 'bg-fb-yellow text-fb-navy border-white scale-110 shadow-[0_0_20px_rgba(255,210,31,0.5)]' : 'bg-fb-navy/80 text-white border-fb-yellow/50 hover:bg-fb-yellow hover:text-fb-navy'
                  }`}
                >
                  <span className="text-[9px] font-extrabold leading-none">AM</span>
                  <span className="font-display font-black leading-none mt-1">{squadXI_Dynamic.AM.no}</span>
                </button>

                <button 
                  onClick={() => setSelectedXIPosition("RW")}
                  className={`w-14 h-14 rounded-full flex flex-col items-center justify-center font-bold text-xs border transition-all cursor-pointer ${
                    selectedXIPosition === "RW" ? 'bg-fb-yellow text-fb-navy border-white scale-110 shadow-[0_0_20px_rgba(255,210,31,0.5)]' : 'bg-fb-navy/80 text-white border-fb-yellow/50 hover:bg-fb-yellow hover:text-fb-navy'
                  }`}
                >
                  <span className="text-[9px] font-extrabold leading-none">RW</span>
                  <span className="font-display font-black leading-none mt-1">{squadXI_Dynamic.RW.no}</span>
                </button>
              </div>

              {/* DMs */}
              <div className="flex justify-center gap-16">
                <button 
                  onClick={() => setSelectedXIPosition("DM1")}
                  className={`w-14 h-14 rounded-full flex flex-col items-center justify-center font-bold text-xs border transition-all cursor-pointer ${
                    selectedXIPosition === "DM1" ? 'bg-fb-yellow text-fb-navy border-white scale-110 shadow-[0_0_20px_rgba(255,210,31,0.5)]' : 'bg-fb-navy/80 text-white border-fb-yellow/50 hover:bg-fb-yellow hover:text-fb-navy'
                  }`}
                >
                  <span className="text-[9px] font-extrabold leading-none">DM</span>
                  <span className="font-display font-black leading-none mt-1">{squadXI_Dynamic.DM1.no}</span>
                </button>

                <button 
                  onClick={() => setSelectedXIPosition("DM2")}
                  className={`w-14 h-14 rounded-full flex flex-col items-center justify-center font-bold text-xs border transition-all cursor-pointer ${
                    selectedXIPosition === "DM2" ? 'bg-fb-yellow text-fb-navy border-white scale-110 shadow-[0_0_20px_rgba(255,210,31,0.5)]' : 'bg-fb-navy/80 text-white border-fb-yellow/50 hover:bg-fb-yellow hover:text-fb-navy'
                  }`}
                >
                  <span className="text-[9px] font-extrabold leading-none">DM</span>
                  <span className="font-display font-black leading-none mt-1">{squadXI_Dynamic.DM2.no}</span>
                </button>
              </div>

              {/* DEFENDERS */}
              <div className="flex justify-between px-4">
                <button 
                  onClick={() => setSelectedXIPosition("LB")}
                  className={`w-14 h-14 rounded-full flex flex-col items-center justify-center font-bold text-xs border transition-all cursor-pointer ${
                    selectedXIPosition === "LB" ? 'bg-fb-yellow text-fb-navy border-white scale-110 shadow-[0_0_20px_rgba(255,210,31,0.5)]' : 'bg-fb-navy/80 text-white border-fb-yellow/50 hover:bg-fb-yellow hover:text-fb-navy'
                  }`}
                >
                  <span className="text-[9px] font-extrabold leading-none">LB</span>
                  <span className="font-display font-black leading-none mt-1">{squadXI_Dynamic.LB.no}</span>
                </button>

                <button 
                  onClick={() => setSelectedXIPosition("CB1")}
                  className={`w-14 h-14 rounded-full flex flex-col items-center justify-center font-bold text-xs border transition-all cursor-pointer ${
                    selectedXIPosition === "CB1" ? 'bg-fb-yellow text-fb-navy border-white scale-110 shadow-[0_0_20px_rgba(255,210,31,0.5)]' : 'bg-fb-navy/80 text-white border-fb-yellow/50 hover:bg-fb-yellow hover:text-fb-navy'
                  }`}
                >
                  <span className="text-[9px] font-extrabold leading-none">CB</span>
                  <span className="font-display font-black leading-none mt-1">{squadXI_Dynamic.CB1.no}</span>
                </button>

                <button 
                  onClick={() => setSelectedXIPosition("CB2")}
                  className={`w-14 h-14 rounded-full flex flex-col items-center justify-center font-bold text-xs border transition-all cursor-pointer ${
                    selectedXIPosition === "CB2" ? 'bg-fb-yellow text-fb-navy border-white scale-110 shadow-[0_0_20px_rgba(255,210,31,0.5)]' : 'bg-fb-navy/80 text-white border-fb-yellow/50 hover:bg-fb-yellow hover:text-fb-navy'
                  }`}
                >
                  <span className="text-[9px] font-extrabold leading-none">CB</span>
                  <span className="font-display font-black leading-none mt-1">{squadXI_Dynamic.CB2.no}</span>
                </button>

                <button 
                  onClick={() => setSelectedXIPosition("RB")}
                  className={`w-14 h-14 rounded-full flex flex-col items-center justify-center font-bold text-xs border transition-all cursor-pointer ${
                    selectedXIPosition === "RB" ? 'bg-fb-yellow text-fb-navy border-white scale-110 shadow-[0_0_20px_rgba(255,210,31,0.5)]' : 'bg-fb-navy/80 text-white border-fb-yellow/50 hover:bg-fb-yellow hover:text-fb-navy'
                  }`}
                >
                  <span className="text-[9px] font-extrabold leading-none">RB</span>
                  <span className="font-display font-black leading-none mt-1">{squadXI_Dynamic.RB.no}</span>
                </button>
              </div>

              {/* GOALKEEPER */}
              <div className="flex justify-center">
                <button 
                  onClick={() => setSelectedXIPosition("GK")}
                  className={`w-14 h-14 rounded-full flex flex-col items-center justify-center font-bold text-xs border transition-all cursor-pointer ${
                    selectedXIPosition === "GK" ? 'bg-fb-yellow text-fb-navy border-white scale-110 shadow-[0_0_20px_rgba(255,210,31,0.5)]' : 'bg-fb-navy/80 text-white border-fb-yellow/50 hover:bg-fb-yellow hover:text-fb-navy'
                  }`}
                >
                  <span className="text-[9px] font-extrabold leading-none">GK</span>
                  <span className="font-display font-black leading-none mt-1">{squadXI_Dynamic.GK.no}</span>
                </button>
              </div>

            </div>

            <p className="text-[10px] text-[#5adea9] font-medium leading-normal italic text-left border-t border-emerald-500/10 pt-4">
              Bu kadro bilgileri, antrenmandan sızan son taktik notlara ve Jose Mourinho'nun kararlarına göre veri tabanından anlık beslenir.
            </p>
          </div>

          {/* Selected Player Detail */}
          <div className="lg:col-span-4 flex flex-col justify-between text-left">
            <div className="p-6 rounded-3xl bg-fb-card border border-white/[0.08] space-y-6 flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-fb-yellow">
                  <User className="w-5 h-5" />
                  <span className="text-xs font-black uppercase tracking-widest">TACTICAL ANALYST PANEL</span>
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
                        <span className="text-[10px] text-fb-muted font-bold tracking-wider uppercase block mb-1">Pozisyon / Rol</span>
                        <div className="text-xl font-black text-white italic">{squadXI_Dynamic[selectedXIPosition as keyof typeof squadXI_Dynamic].role}</div>
                      </div>

                      <div>
                        <span className="text-[10px] text-fb-muted font-bold tracking-wider uppercase block mb-1">Oyuncu İsmi</span>
                        <div className="text-sm font-black text-fb-yellow">
                          {squadXI_Dynamic[selectedXIPosition as keyof typeof squadXI_Dynamic].name} (#{squadXI_Dynamic[selectedXIPosition as keyof typeof squadXI_Dynamic].no})
                        </div>
                      </div>

                      <div className="h-px bg-white/5" />

                      <div>
                        <span className="text-[10px] text-fb-muted font-bold tracking-wider uppercase block mb-1.5">Mourinho Taktik Yorumu</span>
                        <p className="text-xs text-slate-300 leading-relaxed font-semibold">
                          Fenerbahçe'nin {activeMatch.awayTeam || 'rakip'} karşısındaki taktiğinde <strong>{squadXI_Dynamic[selectedXIPosition as keyof typeof squadXI_Dynamic].name}</strong>, geçiş emniyetini kurmak ve genişlik asimetrisini yakalamakta birinci dereceden sorumludur.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="pt-6 border-t border-white/[0.05] mt-6">
                <span className="text-[10px] text-fb-muted font-bold uppercase tracking-widest block mb-2">Sevk Taktik Kadro Notu</span>
                <p className="text-xs text-slate-400 leading-normal font-medium">
                  Merkez oyuncuların top kayıplarında kompakt blok hızı derbi galibiyetinin can damarıdır.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: Dynamic Match Analytics Charts */}
      <section id="d3-match-analytics" className="space-y-6 text-left">
        <div className="space-y-1.5">
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-fb-yellow">CANLI İSTATİSTİK ANALİTİKLERİ</span>
          <h2 className="text-3xl font-display font-black text-white italic uppercase">Müsabaka Analitik Grafikleri</h2>
        </div>

        <div className="p-6 md:p-8 rounded-3xl bg-fb-card border border-white/[0.08] grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <span className="text-xs font-black text-fb-yellow tracking-widest uppercase block border-b border-white/5 pb-2">TAKIM GÜÇ KARŞILAŞTIRMASI</span>
            
            {/* Possession Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-300">
                <span>Topa Sahip Olma (%)</span>
                <span className="text-white font-black">{activeMatch.possessionHome || 50}% - {activeMatch.possessionAway || 50}%</span>
              </div>
              <div className="h-3 rounded-full bg-white/5 overflow-hidden flex">
                <div className="bg-fb-yellow rounded-l-full" style={{ width: `${activeMatch.possessionHome || 50}%` }} />
                <div className="bg-slate-500 rounded-r-full" style={{ width: `${activeMatch.possessionAway || 50}%` }} />
              </div>
            </div>

            {/* Shots Row */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-300">
                <span>Toplam Şut (Şut Girişimi)</span>
                <span className="text-white font-black">{activeMatch.shotsHome || 10} - {activeMatch.shotsAway || 6}</span>
              </div>
              <div className="h-3 rounded-full bg-white/5 overflow-hidden flex">
                <div className="bg-fb-yellow rounded-l-full" style={{ width: `${((activeMatch.shotsHome || 10) / ((activeMatch.shotsHome || 10) + (activeMatch.shotsAway || 6) || 1)) * 100}%` }} />
                <div className="bg-slate-500 rounded-r-full" style={{ width: `${((activeMatch.shotsAway || 6) / ((activeMatch.shotsHome || 10) + (activeMatch.shotsAway || 6) || 1)) * 100}%` }} />
              </div>
            </div>

            {/* Shots on Target */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-300">
                <span>İsabetli Şut</span>
                <span className="text-white font-black">{activeMatch.shotsOnTargetHome || 4} - {activeMatch.shotsOnTargetAway || 2}</span>
              </div>
              <div className="h-3 rounded-full bg-white/5 overflow-hidden flex">
                <div className="bg-fb-yellow rounded-l-full" style={{ width: `${((activeMatch.shotsOnTargetHome || 4) / ((activeMatch.shotsOnTargetHome || 4) + (activeMatch.shotsOnTargetAway || 2) || 1)) * 100}%` }} />
                <div className="bg-slate-500 rounded-r-full" style={{ width: `${((activeMatch.shotsOnTargetAway || 2) / ((activeMatch.shotsOnTargetHome || 4) + (activeMatch.shotsOnTargetAway || 2) || 1)) * 100}%` }} />
              </div>
            </div>

            {/* Pass Accuracy */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-300">
                <span>Pas İsabet Yüzdesi (%)</span>
                <span className="text-white font-black">{activeMatch.passAccuracyHome || 80}% - {activeMatch.passAccuracyAway || 75}%</span>
              </div>
              <div className="h-3 rounded-full bg-white/5 overflow-hidden flex">
                <div className="bg-fb-yellow rounded-l-full" style={{ width: `${activeMatch.passAccuracyHome || 80}%` }} />
                <div className="bg-slate-500 rounded-r-full" style={{ width: `${activeMatch.passAccuracyAway || 75}%` }} />
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-fb-dark/80 border border-white/5 space-y-4 text-xs text-slate-300 font-semibold h-full flex flex-col justify-center">
            <span className="text-[10px] text-fb-yellow tracking-widest uppercase block font-black">XG & TAKTİKSEL MAÇ ÖZETİ</span>
            <p className="leading-relaxed">
              Veri tabanından doğrudan çekilen şut ve pas metrikleri yardımıyla Fenerbahçe'nin kurguladığı hücum xG (Gol Beklentisi) değeri: <strong className="text-white text-sm">{( (activeMatch.shotsOnTargetHome || 4) * 0.35 ).toFixed(2)}</strong> seviyelerinde seyrediyor.
            </p>
            <p className="leading-relaxed">
              Özellikle {activeMatch.homeTeam} takımının korner sayısı <strong className="text-white">({activeMatch.cornersHome || 4})</strong> ve rakip takım {activeMatch.awayTeam} faul sayısı <strong className="text-white">({activeMatch.foulsAway || 11})</strong> duran top varyasyonlarının Kadıköy'de zenginleştiğini kanıtlıyor.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 6: Taraftar Tahmin Sandığı */}
      <section id="fan-poll-section" className="rounded-3xl bg-[#121724] border border-white/[0.08] p-6 md:p-8 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-fb-yellow/5 rounded-full blur-[80px] pointer-events-none" />

        <div className="max-w-3xl space-y-6 relative z-10 text-left">
          <div className="flex items-center gap-2 text-fb-yellow">
            <Vote className="w-5 h-5 text-fb-yellow" />
            <span className="text-xs font-black uppercase tracking-widest">TARAFTAR KATILIM KÖŞESİ</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-display font-black text-white italic uppercase">Bu Karşılaşma Nasıl Sonuçlanır?</h2>
          
          <p className="text-xs text-fb-muted leading-relaxed font-semibold">
            Fenerbahçe analiz topluluğunun beklentisini ölçüyoruz. Oyunuz kaydedildiğinde diğer taraftarların anlık yüzdesel dağılımını görebilirsiniz.
          </p>

          {!pollVotes.voted ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
              <button 
                onClick={() => handleVote('home')}
                className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-fb-yellow font-black text-sm text-center text-white transition-all hover:scale-[1.01] cursor-pointer"
              >
                Fenerbahçe Kazanır
              </button>
              <button 
                onClick={() => handleVote('draw')}
                className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-fb-yellow font-black text-sm text-center text-white transition-all hover:scale-[1.01] cursor-pointer"
              >
                Beraberlik
              </button>
              <button 
                onClick={() => handleVote('away')}
                className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-fb-yellow font-black text-sm text-center text-white transition-all hover:scale-[1.01] cursor-pointer"
              >
                {activeMatch.awayTeam} Kazanır
              </button>
            </div>
          ) : (
            <div className="space-y-4 pt-4">
              <div className="text-xs text-[#3DDC97] font-bold flex items-center gap-2 uppercase">
                <span className="h-2 w-2 rounded-full bg-[#3DDC97]" /> Oyunuz Kaydedildi! Toplu Taraftar Sonuçları:
              </div>
              
              <div className="space-y-3 max-w-xl">
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

                <div>
                  <div className="flex justify-between text-xs font-bold text-white mb-1.5">
                    <span>{activeMatch.awayTeam} Galibiyeti</span>
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
                <span>Katılım durumu: Canlı veri tabanı senkronize</span>
                <span>Toplam tahmin oyu: {totalVotes}</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Premium Teaser */}
      <section id="premium-match-teaser" className="pt-2">
        <div className="rounded-3xl bg-gradient-to-r from-fb-card to-[#121825] border border-fb-yellow/20 p-8 md:p-12 relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-8 shadow-2xl">
          <div className="absolute left-1/4 top-0 w-32 h-32 bg-fb-yellow/5 rounded-full blur-[40px] pointer-events-none" />

          <div className="space-y-4 max-w-xl text-left relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-fb-yellow/10 border border-fb-yellow/30 text-[10px] font-black uppercase text-fb-yellow tracking-widest">
              <Sparkles className="w-3.5 h-3.5 fill-current" /> PREMİUM DEĞER KATAR
            </div>
            <h2 className="text-2xl md:text-3xl font-display font-black text-white uppercase italic leading-none">Detaylı Maç Raporları Premium’da</h2>
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
                    className="w-full py-3.5 bg-fb-yellow hover:bg-white text-fb-navy font-black text-xs uppercase tracking-wider rounded-lg transition-all shadow-[0_4px_22px_rgba(255,210,31,0.25)] cursor-pointer"
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
