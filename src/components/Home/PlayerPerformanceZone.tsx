import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { TrendingUp, TrendingDown, Star, Milestone, Trophy, Award, Search } from 'lucide-react';
import { playerPerformances } from '../../constants/mockData';
import { dbGetCollection } from '../../lib/dbService';

interface PlayerPerformanceZoneProps {
  onNavigate: (view: string) => void;
}

const PlayerPerformanceZone: React.FC<PlayerPerformanceZoneProps> = ({ onNavigate }) => {
  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const fetched = await dbGetCollection('players');
        if (fetched && fetched.length > 0) {
          setPlayers(fetched);
        } else {
          // If no database collection, fall back to seed mock list
          setPlayers(playerPerformances || []);
        }
      } catch (err) {
        console.error("PlayerPerformanceZone loading failed:", err);
        setPlayers(playerPerformances || []);
      } finally {
        setLoading(false);
      }
    };
    fetchPlayers();
  }, []);

  const getSlugForPlayerId = (id: string) => {
    switch (id) {
      case 'plyr-1': return 'sol-bek-ferdi-kadioglu';
      case 'plyr-2': return 'yaratici-10-szymanski';
      case 'plyr-3': return 'box-to-box-fred';
      case 'plyr-4': return 'lider-stoper-djiku';
      default: return 'sol-bek-ferdi-kadioglu';
    }
  };

  return (
    <section id="player-performances" className="py-24 bg-[#0B0F19] relative overflow-hidden">
      
      {/* Absolute ambient lights */}
      <div className="absolute top-[30%] left-[5%] w-[250px] h-[250px] bg-[#002F6C]/10 rounded-full blur-[80px] pointer-events-none" />

      <div className="container mx-auto px-6 max-w-7xl relative z-10 w-full">
        
        {/* Section title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="text-left">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#FFD21F] block mb-2 font-mono">
              Form Durumu & Analitik Takip
            </span>
            <h2 className="text-3xl md:text-4xl font-display font-black text-white uppercase tracking-tight italic">
              Oyuncu Performansları
            </h2>
          </div>
          
          <button 
            onClick={() => onNavigate('players')}
            className="self-start md:self-auto text-xs font-black text-[#FFD21F] hover:text-white uppercase tracking-widest flex items-center gap-1.5 transition-colors cursor-pointer group"
          >
            Tüm Takım Metrikleri <span className="group-hover:translate-x-1 transition-transform">→</span>
          </button>
        </div>

        {loading ? (
          <div className="py-16 text-center text-[#FFD21F] text-xs font-black uppercase tracking-widest font-mono">
            Matris Yükleniyor...
          </div>
        ) : players.length === 0 ? (
          // Exact Turkish empty state matches user prompt
          <div className="p-16 rounded-2xl bg-[#111625] border border-white/[0.08] text-center space-y-4 max-w-xl mx-auto">
            <Award className="w-12 h-12 text-slate-500 mx-auto opacity-70" />
            <p className="text-slate-400 text-sm font-bold uppercase tracking-wider font-mono">
              Bu sezon için kadro verisi henüz eklenmedi.
            </p>
          </div>
        ) : (
          /* High-Contrast Interactive Cards Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {players.slice(0, 4).map((player, idx) => {
              // Normalize trend to natural Turkish strings
              let trendStr = 'Stabil';
              let isUp = false;
              let isDown = false;

              if (player.trend === 'yükselişte' || player.trend === 'up' || player.trend === 'rising') {
                trendStr = 'Yükselişte';
                isUp = true;
              } else if (player.trend === 'düşüşte' || player.trend === 'down' || player.trend === 'falling') {
                trendStr = 'Düşüşte';
                isDown = true;
              }

              return (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  onClick={() => {
                    const slug = player.slug || getSlugForPlayerId(player.id);
                    window.location.hash = `#/oyuncular/${slug}`;
                    onNavigate('players');
                  }}
                  className="p-5.5 rounded-2xl bg-[#111625] border border-white/[0.08] hover:border-[#FFD21F]/35 hover:scale-[1.01] transition-all flex flex-col justify-between cursor-pointer group shadow-md"
                >
                  <div>
                    {/* Position Label & Trend Badge indicator */}
                    <div className="flex justify-between items-center mb-5 border-b border-white/[0.04] pb-3">
                      <span className="text-[10px] text-slate-400 font-extrabold tracking-wider uppercase font-mono">
                        {player.position || 'Mevki'}
                      </span>
                      
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider font-mono ${
                        isUp ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' :
                        isDown ? 'bg-rose-500/10 border border-rose-500/20 text-rose-400' :
                        'bg-slate-500/10 border border-slate-500/20 text-slate-300'
                      }`}>
                        {isUp && <TrendingUp className="w-3 h-3" />}
                        {isDown && <TrendingDown className="w-3 h-3" />}
                        {trendStr}
                      </span>
                    </div>

                    {/* Player Identity & dynamic rate index */}
                    <div className="mb-5 text-left">
                      <h3 className="text-lg font-black text-white group-hover:text-[#FFD21F] transition-colors italic uppercase truncate">
                        {player.name}
                      </h3>
                      
                      <div className="flex gap-4 mt-3 bg-[#0B0F19]/40 p-2.5 rounded-xl border border-white/[0.03]">
                        <div className="flex-1">
                          <div className="text-[8px] text-slate-500 font-black uppercase tracking-wider font-mono mb-0.5">FORM ORANI</div>
                          <div className="text-base font-black text-white font-mono leading-none">
                            {player.formRating || player.rating || '8.2'}<span className="text-[10px] text-slate-500">/10</span>
                          </div>
                        </div>
                        <div className="w-px bg-white/[0.06] shrink-0" />
                        <div className="flex-1">
                          <div className="text-[8px] text-[#FFD21F] font-black uppercase tracking-wider font-mono mb-0.5">SON MAÇ</div>
                          <div className="text-base font-black text-[#FFD21F] font-mono leading-none">
                            {player.lastMatchRating || player.rating || '8.0'}<span className="text-[10px] text-[#FFD21F]/60">/10</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Short custom index analysis report */}
                    <p className="text-xs text-slate-300 text-left leading-relaxed font-semibold italic">
                      "{player.shortAnalysis || player.analysisExcerpt || 'Fiziksel test parametresi ve taktik analiz raporu hazırlanıyor.'}"
                    </p>
                  </div>

                  {/* Oyuncu Profiline Git button */}
                  <div className="pt-5 mt-5 border-t border-white/[0.04] text-left flex items-center justify-between">
                    <span className="text-[10px] text-[#FFD21F] font-black group-hover:underline uppercase tracking-widest font-mono">
                      Oyuncu Profiline Git
                    </span>
                    <button className="w-7 h-7 rounded-lg bg-white/[0.03] group-hover:bg-[#FFD21F] group-hover:text-[#0B0F19] border border-white/[0.05] flex items-center justify-center text-slate-400 group-hover:text-[#0B0F19] transition-all">
                      <Search className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
};

export default PlayerPerformanceZone;
