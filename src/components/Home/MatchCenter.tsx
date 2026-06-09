import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, User, TrendingUp, AlertTriangle, ShieldCheck, Vote } from 'lucide-react';
import { matchCenter } from '../../constants/mockData';

interface MatchCenterProps {
  onNavigate: (view: string) => void;
}

const MatchCenter: React.FC<MatchCenterProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'xi' | 'poll'>('preview');
  const [pollVotes, setPollVotes] = useState({
    home: matchCenter.predictionPoll.homeWinPct,
    draw: matchCenter.predictionPoll.drawPct,
    away: matchCenter.predictionPoll.awayWinPct,
    voted: false
  });

  const handleVote = (option: 'home' | 'draw' | 'away') => {
    if (pollVotes.voted) return;
    setPollVotes(prev => {
      const next = { ...prev };
      next[option] = next[option] + 1;
      next.voted = true;
      return next;
    });
  };

  const total = pollVotes.home + pollVotes.draw + pollVotes.away;
  const homePercent = Math.round((pollVotes.home / total) * 100);
  const drawPercent = Math.round((pollVotes.draw / total) * 100);
  const awayPercent = Math.round((pollVotes.away / total) * 100);

  return (
    <section id="match-center" className="py-20 bg-fb-dark/40 border-t border-b border-white/[0.04]">
      <div className="container mx-auto px-6">
        
        {/* Section title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div className="text-left">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-fb-yellow block mb-2">Canlı & Gelecek Maçlar</span>
            <h2 className="text-3xl md:text-4xl font-display font-black text-white uppercase tracking-tight">Maç Merkezi</h2>
          </div>
          <button 
            onClick={() => onNavigate('match-center')}
            className="self-start md:self-auto text-xs font-black text-fb-yellow uppercase hover:underline tracking-widest flex items-center gap-1"
          >
            Detaylı Raporlar & Arşiv →
          </button>
        </div>

        {/* Featured upcoming/latest match block */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Match Overview card (Left) */}
          <div className="lg:col-span-4 rounded-2xl bg-fb-card border border-white/[0.08] p-6 text-center flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/[0.05]">
                <div className="text-xs font-bold text-fb-muted">{matchCenter.competition}</div>
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-[9px] font-black text-red-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-ping" />
                  KİLİT MAÇ
                </div>
              </div>

              {/* Matchup row */}
              <div className="space-y-6 my-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-left">
                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center font-display font-heavy text-fb-yellow italic border border-white/5 text-lg">FE</div>
                    <div>
                      <div className="text-base font-black text-white">{matchCenter.homeTeam}</div>
                      <span className="text-[10px] text-emerald-400 font-bold uppercase">Form: Mükemmel</span>
                    </div>
                  </div>
                  <span className="text-2xl font-black italic text-fb-yellow">5. Yıl</span>
                </div>

                <div className="h-px bg-white/[0.04]" />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-left">
                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center p-2 border border-white/5">
                      <img src={matchCenter.opponentLogo} alt={matchCenter.opponent} className="w-8 h-8 object-contain" />
                    </div>
                    <div>
                      <div className="text-base font-black text-white">{matchCenter.opponent}</div>
                      <span className="text-[10px] text-amber-500 font-bold uppercase">Form: Stabil</span>
                    </div>
                  </div>
                  <span className="text-2xl font-black italic text-[#FFB020]">Derbi</span>
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-6 border-t border-white/[0.05]">
              <div className="text-left bg-white/5 rounded-xl p-3.5 flex items-center gap-3">
                <Calendar className="w-4 h-4 text-fb-yellow shrink-0" />
                <div>
                  <div className="text-xs font-bold text-white uppercase tracking-wider">{matchCenter.date} • {matchCenter.time}</div>
                  <span className="text-[10px] text-fb-muted font-bold">Kadıköy Şükrü Saracoğlu Stadyumu</span>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Tactical Workspace tabs (Right) */}
          <div className="lg:col-span-8 rounded-2xl bg-fb-card border border-white/[0.08] flex flex-col overflow-hidden">
            
            {/* Tabs bar */}
            <div className="grid grid-cols-3 border-b border-white/[0.08] bg-white/[0.01]">
              <button 
                onClick={() => setActiveTab('preview')}
                className={`py-4 text-xs font-black tracking-widest uppercase transition-all ${
                  activeTab === 'preview' ? 'text-fb-yellow bg-white/[0.02] border-b-2 border-fb-yellow' : 'text-slate-400 border-b border-transparent'
                }`}
              >
                Maç Önü Analiz
              </button>
              <button 
                onClick={() => setActiveTab('xi')}
                className={`py-4 text-xs font-black tracking-widest uppercase transition-all ${
                  activeTab === 'xi' ? 'text-fb-yellow bg-white/[0.02] border-b-2 border-fb-yellow' : 'text-slate-400 border-b border-transparent'
                }`}
              >
                Muhtemel 11'ler
              </button>
              <button 
                onClick={() => setActiveTab('poll')}
                className={`py-4 text-xs font-black tracking-widest uppercase transition-all ${
                  activeTab === 'poll' ? 'text-fb-yellow bg-white/[0.02] border-b-2 border-fb-yellow' : 'text-slate-400 border-b border-transparent'
                }`}
              >
                Taraftar Tahmin
              </button>
            </div>

            {/* Tab Contents */}
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
                    <h3 className="text-lg font-black text-white italic">Taktik Savaş: Beşiktaş Derbisinin Kilit Şifreleri</h3>
                    <p className="text-fb-muted text-sm leading-relaxed">
                      Fenerbahçe, iç sahada Beşiktaş'a karşı oynayacağı bu kritik maçta orta sahada agresif pres ve hızlı hücum geçişlerine odaklanacaktır. 
                      Savunma hattında derinlik korumak, özellikle rakibin kontra atak çıkışlarını engellemede hayati öneme sahip.
                    </p>
                    <p className="text-fb-muted text-sm leading-relaxed">
                      Analiz ekibimiz, rakibin sol kanat savunmasındaki zayıflıkları göz önüne alarak, özellikle Osayi-Samuel'in bindirmeleri ve İrfan Can'ın içe kat ederek yaratacağı alanların gol yollarını açacağını öngörüyor.
                    </p>
                    <div className="flex gap-4 pt-4 border-t border-white/[0.04]">
                      <button 
                        onClick={() => onNavigate('analysis')}
                        className="text-xs font-black text-fb-yellow hover:underline uppercase tracking-wider"
                      >
                        Tüm Maç Önü Taktik Planını Oku →
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
                    className="space-y-6 text-left"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-black text-white uppercase tracking-widest">Öngörülen Taktik Şablon (4-3-3 / 4-2-3-1)</h3>
                      <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" /> Analist Onaylı
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Football pitch styling lists of players */}
                      <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] space-y-2">
                        <span className="text-[10px] font-black text-fb-yellow tracking-widest uppercase block mb-1">Başlangıç Kadrosu</span>
                        {matchCenter.probableXI.slice(0, 6).map((player, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs text-white">
                            <span className="w-5 h-5 rounded-full bg-fb-yellow/20 text-fb-yellow font-black flex items-center justify-center text-[10px]">{idx + 1}</span>
                            <span>{player}</span>
                          </div>
                        ))}
                      </div>

                      <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] space-y-2">
                        <span className="text-[10px] font-black text-fb-yellow tracking-widest uppercase block mb-1">Hücum Hattı & Kanatlar</span>
                        {matchCenter.probableXI.slice(6).map((player, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs text-white">
                            <span className="w-5 h-5 rounded-full bg-[#FFB020]/20 text-[#FFB020] font-black flex items-center justify-center text-[10px]">{idx + 7}</span>
                            <span>{player}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-white/[0.04] text-xs text-fb-muted flex items-center gap-2 italic">
                      <AlertTriangle className="w-3.5 h-3.5 text-fb-yellow" />
                      Mourinho'nun son antrenman taktik denemelerine göre orta saha kurgusunda değişiklikler yaşanabilir.
                    </div>
                  </motion.div>
                )}

                {activeTab === 'poll' && (
                  <motion.div
                    key="poll"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6 text-left"
                  >
                    <div className="flex items-center gap-2">
                      <Vote className="w-5 h-5 text-fb-yellow" />
                      <h3 className="text-sm font-black text-white uppercase tracking-widest">
                        Bu Karşılaşma Nasıl Sonuçlanır?
                      </h3>
                    </div>

                    {!pollVotes.voted ? (
                      <div className="space-y-3">
                        <p className="text-xs text-fb-muted">
                          Fenerbahçe analiz topluluğunun derbi beklentisini ölçüyoruz. Oyunu kullan ve dağılımı hemen gör.
                        </p>
                        <div className="grid grid-cols-3 gap-3">
                          <button 
                            onClick={() => handleVote('home')}
                            className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-fb-yellow font-bold text-sm text-center text-white transition-all hover:scale-[1.01]"
                          >
                            Fenerbahçe Kazanır
                          </button>
                          <button 
                            onClick={() => handleVote('draw')}
                            className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-fb-yellow font-bold text-sm text-center text-white transition-all hover:scale-[1.01]"
                          >
                            Beraberlik
                          </button>
                          <button 
                            onClick={() => handleVote('away')}
                            className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-fb-yellow font-bold text-sm text-center text-white transition-all hover:scale-[1.01]"
                          >
                            Beşiktaş Kazanır
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="text-xs text-[#3DDC97] font-bold flex items-center gap-1.5 uppercase">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#3DDC97]" /> Oyunuz Kaydedildi! Topluluk Sonuçları:
                        </div>
                        <div className="space-y-3">
                          {/* Home win bar */}
                          <div>
                            <div className="flex justify-between text-xs font-bold text-white mb-1.5">
                              <span>Fenerbahçe Galibiyeti</span>
                              <span>{homePercent}%</span>
                            </div>
                            <div className="h-2.5 rounded-full bg-white/5 overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${homePercent}%` }}
                                className="h-full bg-fb-yellow rounded-full" 
                              />
                            </div>
                          </div>
                          {/* Draw bar */}
                          <div>
                            <div className="flex justify-between text-xs font-bold text-white mb-1.5">
                              <span>Beraberlik</span>
                              <span>{drawPercent}%</span>
                            </div>
                            <div className="h-2.5 rounded-full bg-white/5 overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${drawPercent}%` }}
                                className="h-full bg-[#AAB2C0] rounded-full" 
                              />
                            </div>
                          </div>
                          {/* Away win bar */}
                          <div>
                            <div className="flex justify-between text-xs font-bold text-white mb-1.5">
                              <span>Beşiktaş Galibiyeti</span>
                              <span>{awayPercent}%</span>
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
                        <p className="text-[10px] text-fb-muted italic pt-1 text-right">
                          Toplam Oy: {total} • Gerçek zamanlı güncellenmektedir.
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Navigation CTAs */}
              <div className="flex flex-col sm:flex-row gap-3 pt-6 mt-6 border-t border-white/[0.04] justify-between items-center">
                <span className="text-[10px] text-fb-muted font-bold uppercase tracking-widest">
                  Fenerbahçe Evreni Bağımsız Analiz Portalı
                </span>
                <div className="flex gap-3">
                  <button 
                    onClick={() => onNavigate('predictor')}
                    className="px-4 py-2 bg-fb-yellow/10 border border-fb-yellow/20 hover:border-fb-yellow text-fb-yellow text-[11px] font-black uppercase rounded-lg transition-all"
                  >
                    Şampiyonluk Senaryonu Çiz →
                  </button>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};

export default MatchCenter;
