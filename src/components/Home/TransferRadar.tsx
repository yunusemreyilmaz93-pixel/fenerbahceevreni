import React from 'react';
import { motion } from 'motion/react';
import { Star, ShieldCheck, HelpCircle } from 'lucide-react';
import { transferTargets } from '../../constants/mockData';

interface TransferRadarProps {
  onNavigate: (view: string) => void;
}

const TransferRadar: React.FC<TransferRadarProps> = ({ onNavigate }) => {
  const getSlugForPlayerId = (id: string) => {
    switch (id) {
      case 'tgt-1': return 'modern-sag-bek-hiz-makinesi';
      case 'tgt-2': return 'box-to-box-orta-saha-enerjisi';
      case 'tgt-3': return 'merkez-6-profili';
      default: return 'merkez-6-profili';
    }
  };

  return (
    <section id="transfer-radar" className="py-20 bg-fb-dark/40 border-t border-b border-white/[0.04]">
      <div className="container mx-auto px-6">
        
        {/* Section title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div className="text-left">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-fb-yellow block mb-2">Yapay Zeka & Scout İzleme Listesi</span>
            <h2 className="text-3xl md:text-4xl font-display font-black text-white uppercase tracking-tight">Transfer Radar</h2>
          </div>
          <button 
            onClick={() => onNavigate('transfer-radar')}
            className="self-start md:self-auto text-xs font-black text-fb-yellow uppercase hover:underline tracking-widest flex items-center gap-1"
          >
            Tüm Scout Raporları →
          </button>
        </div>

        {/* Content cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {transferTargets.map((player, idx) => (
            <motion.div
              key={player.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              viewport={{ once: true }}
              onClick={() => {
                window.location.hash = `#/transfer-radar/${getSlugForPlayerId(player.id)}`;
                onNavigate('transfer-radar');
              }}
              className="p-6 rounded-2xl bg-fb-card border border-white/[0.06] hover:border-fb-yellow/20 transition-all flex flex-col justify-between cursor-pointer group hover:scale-[1.01]"
            >
              <div>
                {/* Header info */}
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-xl font-black text-white">{player.name}</h3>
                    <span className="text-xs text-fb-yellow font-bold uppercase tracking-wider">{player.position}</span>
                  </div>
                  <div className="px-3 py-1.5 rounded-xl bg-fb-yellow/10 border border-fb-yellow/30 text-center">
                    <div className="text-[9px] font-black text-fb-yellow uppercase leading-none tracking-widest mb-0.5">FIT SCORE</div>
                    <div className="text-lg font-black text-white leading-none">{player.fitScore}<span className="text-xs text-fb-muted">/10</span></div>
                  </div>
                </div>

                <div className="flex gap-4 text-xs font-bold text-fb-muted mb-6 pb-4 border-b border-white/[0.05]">
                  <span>Yaş: <span className="text-white">{player.age}</span></span>
                  <span>Mevcut Kulüp: <span className="text-white">{player.currentClub}</span></span>
                </div>

                {/* Excerpt */}
                <p className="text-xs text-fb-muted italic leading-relaxed mb-6 bg-white/[0.01] p-3 rounded-lg border border-white/[0.03]">
                  "{player.reportExcerpt}"
                </p>

                {/* Strengths / Concerns lists */}
                <div className="space-y-4">
                  <div>
                    <div className="text-[10px] font-black text-emerald-400 tracking-wider uppercase mb-1.5 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> Güçlü Yönler
                    </div>
                    <ul className="space-y-1">
                      {player.strengths.map((str, sIdx) => (
                        <li key={sIdx} className="text-xs text-slate-300 pl-4 relative">
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-emerald-400/55" />
                          {str}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <div className="text-[10px] font-black text-[#FFB020] tracking-wider uppercase mb-1.5 flex items-center gap-1">
                      <HelpCircle className="w-3.5 h-3.5" /> Risk / Gelişim Alanları
                    </div>
                    <ul className="space-y-1">
                      {player.concerns.map((con, cIdx) => (
                        <li key={cIdx} className="text-xs text-slate-300 pl-4 relative">
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#FFB020]/55" />
                          {con}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="pt-8 mt-6 border-t border-white/[0.05]">
                <button 
                  className="w-full py-3 rounded-xl bg-white/5 group-hover:bg-fb-yellow group-hover:text-fb-navy text-xs font-black uppercase tracking-wider transition-all pointer-events-none"
                >
                  Detaylı Raporu Oku
                </button>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default TransferRadar;
