import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, AlertTriangle, Vote } from 'lucide-react';
import { dbGetCollection } from '../../lib/dbService';

interface MatchCenterProps {
  onNavigate: (view: string) => void;
}

const MatchCenter: React.FC<MatchCenterProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'xi' | 'poll'>('preview');
  const [matchData, setMatchData] = useState<any>(null);
  const [opponentLogo, setOpponentLogo] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Poll votes logic — gerçek katılımdan başlar, sahte seed yok
  const [pollVotes, setPollVotes] = useState({
    home: 0,
    draw: 0,
    away: 0,
    voted: false
  });

  useEffect(() => {
    const fetchMatchDetails = async () => {
      try {
        const matchesList = await dbGetCollection('matches');
        const teamsList = await dbGetCollection('teams');
        
        // Find featured or first upcoming or live match
        const activeMatch = matchesList.find((m: any) => m.featured) || 
                            matchesList.find((m: any) => m.status === 'live' || m.status === 'upcoming') || 
                            matchesList[0];
        
        if (activeMatch) {
          setMatchData(activeMatch);
          
          // Match opponent details from teams
          const oppName = activeMatch.awayTeam === 'Fenerbahçe' ? activeMatch.homeTeam : activeMatch.awayTeam;
          const oppTeam = teamsList.find((t: any) => 
            t.name?.toLowerCase().includes(oppName.toLowerCase()) || 
            t.shortName?.toLowerCase().includes(oppName.toLowerCase())
          );
          
          if (oppTeam) {
            setOpponentLogo(oppTeam.logoUrl || oppTeam.logo || '');
          } else {
            setOpponentLogo(activeMatch.awayLogo || activeMatch.opponentLogo || '');
          }

          // Merge prediction data if present
          if (activeMatch.predictionPoll) {
            setPollVotes({
              home: activeMatch.predictionPoll.homeWinPct || 0,
              draw: activeMatch.predictionPoll.drawPct || 0,
              away: activeMatch.predictionPoll.awayWinPct || 0,
              voted: false
            });
          }
        }
      } catch (err) {
        console.error("MatchCenter fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMatchDetails();
  }, []);

  const handleVote = (option: 'home' | 'draw' | 'away') => {
    if (pollVotes.voted) return;
    setPollVotes(prev => {
      const next = { ...prev };
      next[option] = next[option] + 1;
      next.voted = true;
      return next;
    });
  };

  const isFinished = matchData?.status === 'finished' || matchData?.status === 'completed';

  const total = pollVotes.home + pollVotes.draw + pollVotes.away;
  const homePercent = Math.round((pollVotes.home / total) * 100) || 0;
  const drawPercent = Math.round((pollVotes.draw / total) * 100) || 0;
  const awayPercent = Math.round((pollVotes.away / total) * 100) || 0;

  // Compile probable XI array
  const renderProbableXI = () => {
    if (!matchData) return [];
    if (Array.isArray(matchData.probableXI)) return matchData.probableXI;
    if (typeof matchData.probableXI === 'object') {
      const xiObj = matchData.probableXI;
      return [
        xiObj.GK, xiObj.RB, xiObj.CB1, xiObj.CB2, xiObj.LB,
        xiObj.DM1, xiObj.DM2, xiObj.RW, xiObj.AM, xiObj.LW, xiObj.CF
      ].filter(Boolean);
    }
    // Gerçek kadro verisi yoksa uydurma liste basma — boş dön, UI boş durum gösterir
    return [];
  };

  const xiList = renderProbableXI();

  return (
    <section id="match-center" className="py-24 bg-[#090D16] border-t border-b border-white/[0.03] relative overflow-hidden">
      
      {/* Background glow lines */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[350px] h-[350px] bg-[#002F6C]/10 rounded-full blur-[110px] pointer-events-none" />
      <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-[#FFD21F]/[0.02] rounded-full blur-[130px] pointer-events-none" />

      <div className="container mx-auto px-6 max-w-7xl relative z-10 w-full">
        
        {/* Section header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="text-left">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#FFD21F] block mb-2 font-mono">
              Saha İçi İstihbaratı
            </span>
            <h2 className="text-3xl md:text-4xl font-display font-black text-white uppercase tracking-tight italic">
              Maç Merkezi
            </h2>
          </div>
          <button 
            onClick={() => onNavigate('match-center')}
            className="self-start md:self-auto text-xs font-black text-[#FFD21F] hover:text-white uppercase tracking-widest flex items-center gap-1.5 transition-colors cursor-pointer group"
          >
            Detaylı Raporlar & Arşiv <span className="group-hover:translate-x-1 transition-transform">→</span>
          </button>
        </div>

        {loading ? (
          <div className="py-16 text-center text-[#FFD21F] text-xs font-black uppercase tracking-widest font-mono">
            Veriler Alınıyor...
          </div>
        ) : !matchData ? (
          <div className="p-16 rounded-2xl bg-[#111625] border border-white/[0.08] text-center space-y-4">
            <Calendar className="w-12 h-12 text-slate-500 mx-auto opacity-60" />
            <p className="text-slate-400 text-sm font-bold uppercase tracking-wider">
              Yaklaşan maç bilgisi henüz eklenmedi.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Match Overview card (Left) */}
            <div className="lg:col-span-4 rounded-2xl bg-[#111625] border border-white/[0.08] p-6 text-center flex flex-col justify-between hover:border-white/[0.12] transition-colors shadow-lg relative">
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-red-500 via-transparent to-red-500 opacity-65" />
              
              <div>
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/[0.05]">
                  <div className="text-[11px] font-black text-slate-400 uppercase font-mono tracking-wider">
                    {matchData.competition || 'Trendyol Süper Lig'}
                  </div>
                  {matchData.status === 'live' ? (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-[9px] font-black text-red-400 font-mono">
                      <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                      CANLI
                    </div>
                  ) : isFinished ? (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-black text-emerald-400 font-mono">
                      MAÇ SONUCU
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FFD21F]/10 border border-[#FFD21F]/20 text-[9px] font-black text-[#FFD21F] font-mono">
                      YAKLAŞAN MAÇ
                    </div>
                  )}
                </div>

                {/* Matchup row */}
                <div className="space-y-6 my-8">
                  {/* Home Team (Fenerbahçe) */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-left">
                      <div className="w-12 h-12 rounded-xl bg-[#0B0F19] flex items-center justify-center border border-white/[0.06] p-1.5">
                        <img loading="lazy"
                          src="/logos/fenerbahce.png" 
                          alt="Fenerbahçe" 
                          className="w-9 h-9 object-contain"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div>
                        <div className="text-base font-black text-white uppercase italic">{matchData.homeTeam}</div>
                      </div>
                    </div>
                    {(matchData.status === 'live' || isFinished) && (
                      <span className="text-xl font-mono font-black text-[#FFD21F]">{matchData.scoreHome}</span>
                    )}
                  </div>

                  <div className="h-px bg-white/[0.05] relative">
                    <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#111625] px-2 text-[9px] text-slate-500 font-black tracking-widest uppercase font-mono">{isFinished ? 'MS' : 'VS'}</span>
                  </div>

                  {/* Away Team (Opponent) */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-left">
                      <div className="w-12 h-12 rounded-xl bg-[#0B0F19] flex items-center justify-center border border-white/[0.06] p-1.5">
                        {opponentLogo ? (
                          <img loading="lazy"
                            src={opponentLogo} 
                            alt={matchData.awayTeam === 'Fenerbahçe' ? matchData.homeTeam : matchData.awayTeam} 
                            className="w-9 h-9 object-contain" 
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center">
                            <span className="text-[#FFD21F] font-black text-xs italic">FE</span>
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="text-base font-black text-white uppercase italic truncate max-w-[130px]">
                          {matchData.awayTeam === 'Fenerbahçe' ? matchData.homeTeam : matchData.awayTeam}
                        </div>
                      </div>
                    </div>
                    {(matchData.status === 'live' || isFinished) && (
                      <span className="text-xl font-mono font-black text-white">{matchData.scoreAway}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Stadium & Date */}
              <div className="space-y-4 pt-6 border-t border-white/[0.05]">
                <div className="text-left bg-[#0B0F19]/45 rounded-xl p-3.5 flex items-center gap-3 border border-white/[0.03]">
                  <Calendar className="w-4 h-4 text-[#FFD21F] shrink-0" />
                  <div>
                    <div className="text-xs font-black text-white uppercase tracking-wider font-mono">
                      {matchData.matchDate
                        ? `${new Date(matchData.matchDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })} • ${new Date(matchData.matchDate).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}`
                        : '—'}
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold leading-none">
                      {matchData.venue || '—'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Tactical Workspace tabs (Right) */}
            <div className="lg:col-span-8 rounded-2xl bg-[#111625] border border-white/[0.08] flex flex-col overflow-hidden shadow-lg hover:border-white/[0.12] transition-colors">
              
              {/* Tab Header bar */}
              <div className={`grid ${isFinished ? 'grid-cols-2' : 'grid-cols-3'} border-b border-white/[0.06] bg-white/[0.01]`}>
                {[
                  { id: 'preview' as const, label: isFinished ? 'Maç Özeti' : 'Maç Önü Analizi' },
                  { id: 'xi' as const, label: isFinished ? 'İlk 11' : 'Muhtemel 11' },
                  ...(isFinished ? [] : [{ id: 'poll' as const, label: 'Taraftar Tahmini' }])
                ].map((tab) => (
                  <button 
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 text-xs font-black tracking-widest uppercase transition-all cursor-pointer relative ${
                      activeTab === tab.id 
                        ? 'text-[#FFD21F] bg-[#151C30]/40' 
                        : 'text-slate-400 hover:text-white hover:bg-white/[0.01]'
                    }`}
                  >
                    {tab.label}
                    {activeTab === tab.id && (
                      <motion.div 
                        layoutId="activeMatchTabUnderline"
                        className="absolute bottom-0 inset-x-0 h-[2.5px] bg-[#FFD21F]" 
                      />
                    )}
                  </button>
                ))}
              </div>

              {/* Tab Content Box */}
              <div className="p-6 md:p-8 flex-1 flex flex-col justify-between">
                <AnimatePresence mode="wait">
                  {activeTab === 'preview' && (
                    <motion.div
                      key="preview"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-4 text-left"
                    >
                      <h3 className="text-xl font-black text-white italic tracking-tight uppercase">
                        {isFinished ? 'Maç Özeti' : 'Maç Önü Değerlendirmesi'}
                      </h3>
                      {matchData.matchPreview ? (
                        <p className="text-slate-300 text-sm leading-relaxed">
                          {matchData.matchPreview}
                        </p>
                      ) : (
                        <p className="text-slate-500 text-sm leading-relaxed italic">
                          Bu karşılaşma için maç önü analizi henüz yayınlanmadı. Analiz ekibinin değerlendirmesi
                          maç haftasında bu alanda yer alacak.
                        </p>
                      )}

                      {matchData.tacticalNotes && matchData.tacticalNotes.length > 0 && (
                        <div className="pt-4 border-t border-white/[0.05] space-y-2.5">
                          <span className="text-[10px] font-black uppercase text-[#FFD21F] tracking-widest font-mono">Taktik Direktifler:</span>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {matchData.tacticalNotes.slice(0, 2).map((note: any, i: number) => (
                              <div key={i} className="p-3 bg-[#0B0F19]/60 border border-white/[0.03] rounded-lg">
                                <span className="text-xs font-black text-white block mb-0.5">{note.title}</span>
                                <span className="text-[11px] text-slate-400 block leading-tight">{note.text}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="pt-4 border-t border-white/[0.04]">
                        <button
                          onClick={() => onNavigate(isFinished ? 'match-center' : 'analysis')}
                          className="text-xs font-black text-[#FFD21F] hover:text-white uppercase tracking-wider cursor-pointer"
                        >
                          {isFinished ? 'Detaylı Maç Raporunu Oku →' : 'Tüm Maç Önü Analizini Oku →'}
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'xi' && (
                    <motion.div
                      key="xi"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-5 text-left"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-black text-white uppercase tracking-widest font-mono">
                          {isFinished ? 'İlk 11' : 'Muhtemel 11'}{matchData.probableXI?.formation ? ` (${matchData.probableXI.formation})` : ''}
                        </h3>
                      </div>

                      {xiList.length === 0 ? (
                        <div className="p-8 rounded-xl bg-[#0B0F19]/60 border border-white/[0.04] text-center text-sm text-slate-400 font-semibold">
                          Kadro bilgisi henüz açıklanmadı.
                        </div>
                      ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-[#0B0F19]/85 border border-white/[0.04] space-y-2">
                          <span className="text-[10px] font-black text-[#FFD21F] tracking-widest uppercase block mb-2 font-mono">Defansif & Omurga</span>
                          {xiList.slice(0, 6).map((player: any, idx: number) => (
                            <div key={idx} className="flex items-center gap-2.5 text-xs text-slate-300">
                              <span className="w-5 h-5 rounded-full bg-[#FFD21F]/10 text-[#FFD21F] font-black flex items-center justify-center text-[10px] font-mono">{idx + 1}</span>
                              <span className="font-semibold">{player}</span>
                            </div>
                          ))}
                        </div>

                        <div className="p-4 rounded-xl bg-[#0B0F19]/85 border border-white/[0.04] space-y-2">
                          <span className="text-[10px] font-black text-[#FFD21F] tracking-widest uppercase block mb-2 font-mono">Hücum & Kreatif Güç</span>
                          {xiList.slice(6).map((player: any, idx: number) => (
                            <div key={idx} className="flex items-center gap-2.5 text-xs text-slate-300">
                              <span className="w-5 h-5 rounded-full bg-[#FFD21F]/10 text-[#FFD21F] font-black flex items-center justify-center text-[10px] font-mono">{idx + 7}</span>
                              <span className="font-semibold">{player}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      )}

                      {!isFinished && xiList.length > 0 && (
                        <div className="pt-2 border-t border-white/[0.04] text-xs text-slate-400 flex items-center gap-2 italic">
                          <AlertTriangle className="w-3.5 h-3.5 text-[#FFD21F] shrink-0" />
                          Teknik heyetin son antrenman tercihleri doğrultusunda kadroda değişiklik olabilir.
                        </div>
                      )}
                    </motion.div>
                  )}

                  {activeTab === 'poll' && !isFinished && (
                    <motion.div
                      key="poll"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-6 text-left"
                    >
                      <div className="flex items-center gap-2">
                        <Vote className="w-5 h-5 text-[#FFD21F]" />
                        <h3 className="text-sm font-black text-white uppercase tracking-widest font-mono">
                          Bu Karşılaşma Nasıl Sonuçlanır?
                        </h3>
                      </div>

                      {!pollVotes.voted ? (
                        <div className="space-y-4">
                          <p className="text-sm text-slate-300 leading-relaxed font-semibold">
                            Taraftar topluluğunun maç beklentisini ölçüyoruz. Oyunu ver, güncel dağılımı gör.
                          </p>
                          <div className="grid grid-cols-3 gap-3">
                            <button 
                              onClick={() => handleVote('home')}
                              className="p-4 rounded-xl bg-[#0B0F19] border border-white/10 hover:border-[#FFD21F] font-black text-xs uppercase tracking-wider text-center text-white transition-all hover:scale-[1.01] cursor-pointer"
                            >
                              Fenerbahçe Galibiyeti
                            </button>
                            <button 
                              onClick={() => handleVote('draw')}
                              className="p-4 rounded-xl bg-[#0B0F19] border border-white/10 hover:border-[#FFD21F] font-black text-xs uppercase tracking-wider text-center text-white transition-all hover:scale-[1.01] cursor-pointer"
                            >
                              Beraberlik
                            </button>
                            <button 
                              onClick={() => handleVote('away')}
                              className="p-4 rounded-xl bg-[#0B0F19] border border-white/10 hover:border-[#FFD21F] font-black text-xs uppercase tracking-wider text-center text-white transition-all hover:scale-[1.01] cursor-pointer"
                            >
                              {matchData.awayTeam === 'Fenerbahçe' ? 'İlk Takım Galibiyeti' : 'Deplasman Galibiyeti'}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="text-xs text-[#3DDC97] font-black flex items-center gap-1.5 uppercase font-mono">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#3DDC97]" /> OYUNUZ KAYDEDİLDİ: Topluluk Yönelimi
                          </div>
                          <div className="space-y-3 bg-[#0B0F19]/40 p-4 rounded-xl border border-white/[0.03]">
                            {/* Home win bar */}
                            <div>
                              <div className="flex justify-between text-[11px] font-black text-white mb-1.5 uppercase tracking-wide">
                                <span>Fenerbahçe Galibiyeti</span>
                                <span className="font-mono">{homePercent}%</span>
                              </div>
                              <div className="h-2.5 rounded-full bg-white/5 overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${homePercent}%` }}
                                  className="h-full bg-[#FFD21F] rounded-full" 
                                />
                              </div>
                            </div>
                            {/* Draw bar */}
                            <div>
                              <div className="flex justify-between text-[11px] font-black text-white mb-1.5 uppercase tracking-wide">
                                <span>Beraberlik</span>
                                <span className="font-mono">{drawPercent}%</span>
                              </div>
                              <div className="h-2.5 rounded-full bg-white/5 overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${drawPercent}%` }}
                                  className="h-full bg-slate-500 rounded-full" 
                                />
                              </div>
                            </div>
                            {/* Away win bar */}
                            <div>
                              <div className="flex justify-between text-[11px] font-black text-white mb-1.5 uppercase tracking-wide">
                                <span>Rakip Galibiyeti</span>
                                <span className="font-mono">{awayPercent}%</span>
                              </div>
                              <div className="h-2.5 rounded-full bg-white/5 overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${awayPercent}%` }}
                                  className="h-full bg-rose-500 rounded-full" 
                                />
                              </div>
                            </div>
                          </div>
                          <p className="text-[10px] text-slate-400 italic pt-1 text-right font-mono">
                            Toplam Oy: {total}
                          </p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Sub-navigation CTAs */}
                <div className="flex flex-col sm:flex-row gap-3 pt-6 mt-6 border-t border-white/[0.04] justify-end items-center">
                  <button
                    onClick={() => onNavigate('predictor')}
                    className="px-5 py-2.5 bg-[#FFD21F]/10 border border-[#FFD21F]/20 hover:border-[#FFD21F] text-[#FFD21F] text-xs font-black uppercase rounded-xl transition-all cursor-pointer shadow-sm hover:scale-[1.01]"
                  >
                    Şampiyonluk Senaryonu Çiz →
                  </button>
                </div>
              </div>

            </div>

          </div>
        )}

      </div>
    </section>
  );
};

export default MatchCenter;
