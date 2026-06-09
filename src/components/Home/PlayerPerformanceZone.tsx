import React from 'react';
import { motion } from 'motion/react';
import { TrendingUp, TrendingDown, Star, Milestone } from 'lucide-react';
import { playerPerformances } from '../../constants/mockData';

interface PlayerPerformanceZoneProps {
  onNavigate: (view: string) => void;
}

const PlayerPerformanceZone: React.FC<PlayerPerformanceZoneProps> = ({ onNavigate }) => {
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
    <section id="player-performances" className="py-20 bg-fb-dark">
      <div className="container mx-auto px-6">
        
        {/* Section title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div className="text-left">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-fb-yellow block mb-2">Haftalık Performans Grafikleri & İndeksi</span>
            <h2 className="text-3xl md:text-4xl font-display font-black text-white uppercase tracking-tight">Oyuncu Performansları</h2>
          </div>
          <button 
            onClick={() => onNavigate('players')}
            className="self-start md:self-auto text-xs font-black text-fb-yellow uppercase hover:underline tracking-widest flex items-center gap-1"
          >
            Tüm Takım Metrikleri →
          </button>
        </div>

        {/* Performance Zone Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {playerPerformances.map((player, idx) => {
            const isUp = player.trend === 'yükselişte';
            const isDown = player.trend === 'düşüşte';
            const isStable = player.trend === 'stabil';

            return (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                viewport={{ once: true }}
                onClick={() => {
                  window.location.hash = `#/oyuncular/${getSlugForPlayerId(player.id)}`;
                  onNavigate('players');
                }}
                className="p-5 rounded-2xl bg-fb-card border border-white/[0.06] hover:border-fb-yellow/20 transition-all flex flex-col justify-between cursor-pointer group hover:scale-[1.01]"
              >
                <div>
                  {/* Status pills */}
                  <div className="flex justify-between items-center mb-5">
                    <span className="text-[10px] text-fb-muted font-bold tracking-widest uppercase">{player.position}</span>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                      isUp ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' :
                      isDown ? 'bg-rose-500/10 border border-rose-500/20 text-rose-400' :
                      'bg-slate-500/10 border border-slate-500/20 text-slate-400'
                    }`}>
                      {isUp && <TrendingUp className="w-3 h-3" />}
                      {isDown && <TrendingDown className="w-3 h-3" />}
                      {player.trend}
                    </span>
                  </div>

                  {/* Player info & scores */}
                  <div className="mb-6 text-left">
                    <h3 className="text-xl font-black text-white">{player.name}</h3>
                    
                    <div className="flex gap-4 mt-3">
                      <div>
                        <div className="text-[9px] text-fb-muted font-black uppercase tracking-wider">Form Oranı</div>
                        <div className="text-lg font-black text-white">{player.formRating}<span className="text-xs text-fb-muted">/10</span></div>
                      </div>
                      <div className="w-px bg-white/[0.06]" />
                      <div>
                        <div className="text-[9px] text-fb-muted font-black uppercase tracking-wider font-display">Son Maç Puanı</div>
                        <div className="text-lg font-black text-fb-yellow">{player.lastMatchRating}<span className="text-xs text-fb-muted">/10</span></div>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-fb-muted text-left leading-relaxed">
                    {player.shortAnalysis}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-white/[0.05] text-left">
                  <span className="text-[10px] text-fb-muted font-bold tracking-wider uppercase">Fenerbahçe Evreni Analiz İndeksi</span>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default PlayerPerformanceZone;
