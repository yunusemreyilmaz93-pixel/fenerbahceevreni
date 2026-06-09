import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { BarChart3, Shield, Users, Newspaper, Calendar, AppWindow, Trophy, ChevronRight, HelpCircle } from 'lucide-react';
import { dbGetCollection } from '../../lib/dbService';

interface HeroSectionProps {
  onEnterUniverse?: () => void;
  onNavigate: (view: any) => void;
  homeSettings?: any;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onEnterUniverse, onNavigate, homeSettings }) => {
  const [match, setMatch] = useState<any>(null);
  const [opponentLogo, setOpponentLogo] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHeroMatchAndTeams = async () => {
      try {
        const matchesList = await dbGetCollection('matches');
        const teamsList = await dbGetCollection('teams');
        
        // Find featured or first upcoming/live match
        const activeMatch = matchesList.find((m: any) => m.featured) || 
                            matchesList.find((m: any) => m.status === 'live' || m.status === 'upcoming') || 
                            matchesList[0];
        
        if (activeMatch) {
          setMatch(activeMatch);
          
          // Match opponent details from teams
          const oppName = activeMatch.awayTeam === 'Fenerbahçe' ? activeMatch.homeTeam : activeMatch.awayTeam;
          const oppTeam = teamsList.find((t: any) => 
            t.name?.toLowerCase().includes(oppName.toLowerCase()) || 
            t.shortName?.toLowerCase().includes(oppName.toLowerCase())
          );
          
          if (oppTeam) {
            setOpponentLogo(oppTeam.logoUrl || oppTeam.logo || '');
          } else {
            // Check if there is already an opponentLogo field on the match
            setOpponentLogo(activeMatch.opponentLogo || 'https://upload.wikimedia.org/wikipedia/tr/f/ff/Fenerbah%C3%A7e_SK.png');
          }
        }
      } catch (err) {
        console.error("Hero match fetching failed:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchHeroMatchAndTeams();
  }, []);

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden pt-24 pb-12 bg-[#0B0F19]">
      
      {/* Premium Tactical Pitch Background Outline */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none z-0">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="tactical-grid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#FFFFFF" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#tactical-grid)" />
          <circle cx="50%" cy="50%" r="150" fill="none" stroke="#FFFFFF" strokeWidth="1.5" />
          <line x1="50%" y1="0" x2="50%" y2="100%" stroke="#FFFFFF" strokeWidth="1.5" strokeDasharray="5,5" />
          <rect x="0" y="20%" width="15%" height="60%" fill="none" stroke="#FFFFFF" strokeWidth="1.5" />
          <rect x="85%" y="20%" width="15%" height="60%" fill="none" stroke="#FFFFFF" strokeWidth="1.5" />
        </svg>
      </div>

      {/* Modern Radial Vignette Gradients & Glowing Accents */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#090D16]/40 via-transparent to-[#0B0F19]" />
      
      {/* Soft yellow and blue stadium ambient lights */}
      <div className="absolute top-[-10%] left-[20%] w-[550px] h-[550px] bg-[#FFD21F]/[0.03] rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[15%] w-[650px] h-[650px] bg-[#002F6C]/[0.22] rounded-full blur-[160px] pointer-events-none" />

      {/* Fenerbahçe subtle accent highlight borders */}
      <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#FFD21F]/30 to-transparent z-10" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Hero Left Content */}
          <div className="lg:col-span-7 space-y-8 text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              {/* Premium Badge Identifier */}
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/[0.03] border border-white/[0.08] rounded-full">
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest font-mono">
                  ANALİZ & BİLGİ MERKEZİ
                </span>
              </div>

              {/* Bold Headline */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-black tracking-tight text-white leading-none uppercase italic">
                Fenerbahçe’ye <br />
                <span className="text-[#FFD21F] drop-shadow-[0_2px_15px_rgba(255,210,31,0.15)]">daha yakından</span> bak.
              </h1>

              {/* Clean Subtitle */}
              <p className="text-[#E2E8F0] text-sm md:text-base max-w-xl font-medium leading-relaxed opacity-90">
                Maç raporları, transfer profilleri, oyuncu analizleri ve taraftar gündemi tek merkezde.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
                <button
                  id="hero-cta-primary"
                  onClick={() => {
                    const el = document.getElementById('latest-analysis');
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth' });
                    } else {
                      onNavigate('analysis');
                    }
                  }}
                  className="w-full sm:w-auto px-8 py-3.5 bg-[#FFD21F] hover:bg-white text-[#0B0F19] font-black hover:scale-[1.02] active:scale-[0.98] rounded-xl shadow-[0_4px_30px_rgba(255,210,31,0.25)] flex items-center justify-center gap-2 group transition-all cursor-pointer"
                >
                  <span className="uppercase tracking-widest text-xs">Analizleri Oku</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  id="hero-cta-secondary"
                  onClick={() => onNavigate('match-center')}
                  className="w-full sm:w-auto px-8 py-3.5 bg-white/[0.03] hover:bg-white/[0.08] text-white font-black rounded-xl border border-white/[0.08] hover:border-[#FFD21F]/40 hover:scale-[1.01] transition-all cursor-pointer"
                >
                  <span className="uppercase tracking-widest text-xs">Maç Merkezine Git</span>
                </button>
              </div>
            </motion.div>

            {/* Statistics strip / Features line */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="pt-8 border-t border-white/[0.05]"
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Maç Raporları', icon: BarChart3 },
                  { label: 'Transfer Radar', icon: Shield },
                  { label: 'Oyuncu Performansları', icon: Trophy },
                  { label: 'Taraftar Nabzı', icon: Users }
                ].map((item, idx) => (
                  <div 
                    key={idx}
                    className="flex items-center gap-2.5 p-2 px-3 rounded-lg bg-white/[0.01] border border-white/[0.03]"
                  >
                    <div className="w-7 h-7 rounded-lg bg-[#FFD21F]/10 flex items-center justify-center text-[#FFD21F] shrink-0">
                      <item.icon className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-300 leading-tight">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Hero Right Content - Large Premium Match Card Dashboard */}
          <div className="lg:col-span-5 w-full">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="p-6 rounded-2xl bg-[#111625] border border-white/[0.08] shadow-[0_24px_60px_rgba(0,0,0,0.65)] relative overflow-hidden text-left"
            >
              {/* Elegant Accent Yellow bar */}
              <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-[#FFD21F]/30 via-[#FFD21F] to-[#FFD21F]/30" />

              {/* Card top details */}
              <div className="flex justify-between items-center mb-6 border-b border-white/[0.05] pb-4">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#FFD21F] bg-[#FFD21F]/10 px-2.5 py-1 rounded-md border border-[#FFD21F]/20 font-mono">
                  🔥 {match?.status === 'live' ? 'CANLI MAÇ' : 'SIRADAKİ MAÇ'}
                </span>
                <span className="text-xs text-slate-400 font-bold">
                  {match?.competition || 'Trendyol Süper Lig'}
                </span>
              </div>

              {loading ? (
                <div className="py-12 text-center text-[#FFD21F] text-xs font-bold uppercase tracking-widest">
                  Maç Bilgileri Yükleniyor...
                </div>
              ) : !match ? (
                // Beautiful Turkish empty state
                <div className="py-12 px-4 text-center space-y-4">
                  <Calendar className="w-10 h-10 text-slate-500 mx-auto opacity-70" />
                  <p className="text-xs text-slate-400 font-bold max-w-sm mx-auto leading-relaxed">
                    Yaklaşan maç bilgisi henüz eklenmedi.
                  </p>
                </div>
              ) : (
                <>
                  {/* Big Match matchup */}
                  <div className="flex items-center justify-between py-2 text-center relative">
                    {/* Home Team */}
                    <div className="flex flex-col items-center flex-1">
                      <div className="w-16 h-16 rounded-2xl bg-[#0B0F19] border border-white/[0.06] flex items-center justify-center p-2 mb-2 shadow-inner">
                        <img 
                          src="https://upload.wikimedia.org/wikipedia/tr/f/ff/Fenerbah%C3%A7e_SK.png" 
                          alt="Fenerbahçe" 
                          className="w-12 h-12 object-contain"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <span className="text-sm font-black text-white uppercase italic">
                        {match.homeTeam}
                      </span>
                    </div>

                    {/* VS block */}
                    <div className="px-4 flex flex-col items-center shrink-0">
                      <span className="text-[11px] text-slate-500 font-black tracking-widest">VS</span>
                      <div className="text-2xl font-black italic text-[#FFD21F] font-mono select-none my-1">
                        {match.time || '20:00'}
                      </div>
                      <span className="text-[10px] text-slate-400 font-bold font-mono">
                        {match.matchDate ? new Date(match.matchDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }) : match.date || '30 May'}
                      </span>
                    </div>

                    {/* Away Team */}
                    <div className="flex flex-col items-center flex-1">
                      <div className="w-16 h-16 rounded-2xl bg-[#0B0F19] border border-white/[0.06] flex items-center justify-center p-2 mb-2 shadow-inner">
                        {opponentLogo ? (
                          <img 
                            src={opponentLogo} 
                            alt={match.awayTeam === 'Fenerbahçe' ? match.homeTeam : match.awayTeam} 
                            className="w-12 h-12 object-contain" 
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
                            <span className="text-[#FFD21F] font-black text-xl italic font-display">FE</span>
                          </div>
                        )}
                      </div>
                      <span className="text-sm font-black text-white uppercase italic truncate max-w-[110px]">
                        {match.awayTeam === 'Fenerbahçe' ? match.homeTeam : match.awayTeam}
                      </span>
                    </div>
                  </div>

                  {/* Match spec grid detail */}
                  <div className="bg-[#0B0F19]/60 border border-white/[0.03] rounded-xl p-3.5 my-5 text-xs text-slate-300 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-semibold">Stadyum:</span>
                      <span className="font-bold text-white text-right truncate max-w-[200px]">{match.venue || 'Şükrü Saracoğlu Kompleksi'}</span>
                    </div>
                    {match.referee && (
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-semibold">Hakem:</span>
                        <span className="font-bold text-white text-right">{match.referee}</span>
                      </div>
                    )}
                  </div>

                  {/* Short match preview text */}
                  <p className="text-xs text-slate-400 leading-relaxed italic border-t border-white/[0.04] pt-4 mb-5">
                    "{match.matchPreview || 'Fenerbahçe derbi hazırlıkları devam ediyor. Analiz ekibimizin maç önü raporu yakında yayında.'}"
                  </p>

                  {/* Direct Dashboard actions */}
                  <div className="flex gap-3 pt-1">
                    <button 
                      onClick={() => onNavigate('match-center')}
                      className="flex-1 py-3 text-center bg-[#FFD21F] hover:bg-white text-[#0B0F19] text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-lg hover:scale-[1.01]"
                    >
                      Maç Merkezine Git
                    </button>
                    <button 
                      onClick={() => onNavigate('fan-room')}
                      className="py-3 px-5 text-center bg-white/[0.04] hover:bg-white/[0.08] text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all border border-white/[0.08] cursor-pointer"
                    >
                      Tahmin Yap
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default HeroSection;
