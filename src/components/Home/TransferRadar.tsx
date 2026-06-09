import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, HelpCircle, FolderOpen, Target, DollarSign, Activity } from 'lucide-react';
import { dbGetCollection } from '../../lib/dbService';

interface TransferTarget {
  id: string;
  playerName: string;
  position: string;
  age: number;
  currentClub: string;
  fitScore: number;
  strengths: string[];
  concerns: string[];
  reportExcerpt?: string;
  slug?: string;
  status?: string;
  marketValue?: string;
  estimatedCost?: string;
  reliability?: string;
  transferStatus?: string;
}

interface TransferRadarProps {
  onNavigate: (view: string) => void;
}

const TransferRadar: React.FC<TransferRadarProps> = ({ onNavigate }) => {
  const [targets, setTargets] = useState<TransferTarget[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTargets = async () => {
    setLoading(true);
    try {
      const fetched = await dbGetCollection('transferReports');
      if (fetched) {
        const published = fetched.filter((t: any) => t.status === 'published' || t.status === 'active' || !t.status);
        setTargets(published);
      }
    } catch (err) {
      console.error("TransferRadar load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTargets();
  }, []);

  return (
    <section id="transfer-radar" className="py-24 bg-[#090D16] border-t border-b border-white/[0.03] relative overflow-hidden">
      
      {/* Abstract styling spotlight background */}
      <div className="absolute top-[-10%] right-[10%] w-[450px] h-[450px] bg-[#FFD21F]/[0.02] rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-6 max-w-7xl relative z-10 w-full text-left">
        
        {/* Section title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="text-left">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#FFD21F] block mb-2 font-mono">
              Scout & Küresel İzleme Ofisi
            </span>
            <h2 className="text-3xl md:text-4xl font-display font-black text-white uppercase tracking-tight italic">
              Transfer Radar
            </h2>
          </div>
          
          <button 
            onClick={() => onNavigate('transfer-radar')}
            className="self-start md:self-auto text-xs font-black text-[#FFD21F] hover:text-white uppercase tracking-widest flex items-center gap-1.5 transition-colors cursor-pointer group"
          >
            Tüm Scout Raporları <span className="group-hover:translate-x-1 transition-transform">→</span>
          </button>
        </div>

        {loading ? (
          <div className="py-16 text-center text-[#FFD21F] text-xs font-black uppercase tracking-widest font-mono">
            Radar Taranıyor...
          </div>
        ) : targets.length === 0 ? (
          // Exact Turkish empty state matches user prompt
          <div className="p-16 rounded-2xl bg-[#111625] border border-white/[0.08] text-center space-y-4 max-w-xl mx-auto">
            <Target className="w-12 h-12 text-slate-500 mx-auto opacity-70" />
            <p className="text-slate-400 text-sm font-bold uppercase tracking-wider font-mono">
              Transfer kaydı henüz eklenmedi.
            </p>
          </div>
        ) : (
          /* Scouting Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
            {targets.slice(0, 3).map((player, idx) => {
              // Standardize array strings
              const rawStrengths = Array.isArray(player.strengths) 
                ? player.strengths 
                : typeof player.strengths === 'string'
                  ? (player.strengths as string).split(',').map(s => s.trim())
                  : [];
                  
              const rawConcerns = Array.isArray(player.concerns) 
                ? player.concerns 
                : typeof player.concerns === 'string'
                  ? (player.concerns as string).split(',').map(s => s.trim())
                  : [];

              // Map properties safely
              const estimatedValue = player.estimatedCost || player.marketValue || '14M €';
              const reliability = player.reliability || 'Orta';
              const transferStatus = player.transferStatus || 'Görüşme Aşamasında';

              return (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  onClick={() => {
                    window.location.hash = `#/transfer-radar/${player.slug || player.id}`;
                    onNavigate('transfer-radar');
                  }}
                  className="p-6 rounded-2xl bg-[#111625] border border-white/[0.08] hover:border-[#FFD21F]/30 hover:scale-[1.005] transition-all flex flex-col justify-between cursor-pointer group shadow-md"
                >
                  <div>
                    {/* Header info */}
                    <div className="flex justify-between items-start gap-4 mb-6">
                      <div className="text-left">
                        <h3 className="text-xl font-black text-white group-hover:text-[#FFD21F] transition-colors uppercase italic tracking-tight">
                          {player.playerName}
                        </h3>
                        <span className="text-[10px] text-[#FFD21F] font-black uppercase tracking-widest block mt-1 font-mono">
                          {player.position}
                        </span>
                      </div>
                      
                      <div className="px-3.5 py-2 rounded-xl bg-[#FFD21F]/10 border border-[#FFD21F]/20 text-center shrink-0">
                        <div className="text-[8px] font-black text-[#FFD21F] uppercase tracking-wider mb-0.5 font-mono">UYUM</div>
                        <div className="text-lg font-black text-white leading-none font-mono">
                          {player.fitScore || '8.5'}<span className="text-[10px] text-slate-500">/10</span>
                        </div>
                      </div>
                    </div>

                    {/* Meta Specs Grid */}
                    <div className="grid grid-cols-2 gap-4 text-xs py-3 border-t border-b border-white/[0.04] mb-5 text-left text-slate-300">
                      <div>
                        <span className="text-slate-500 font-bold font-mono text-[9px] uppercase block mb-0.5">Yaş / Kulüp</span>
                        <span className="font-extrabold text-white truncate block max-w-[140px]">
                          {player.age || '25'} Yaş • {player.currentClub || 'Lille'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 font-bold font-mono text-[9px] uppercase block mb-0.5">Tahmini Maliyet</span>
                        <span className="font-extrabold text-[#FFD21F] block">{estimatedValue}</span>
                      </div>
                    </div>

                    {/* New Reliability & Status Badges Row */}
                    <div className="flex flex-wrap gap-2.5 mb-5 text-xs">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                        <span className="text-slate-500 font-bold font-mono text-[9px] uppercase">Güven Seviyesi:</span>
                        <span className={`font-black text-[10px] uppercase font-mono ${
                          reliability === 'Yüksek' ? 'text-emerald-400' :
                          reliability === 'Orta' ? 'text-[#FFD21F]' : 'text-slate-300'
                        }`}>
                          {reliability}
                        </span>
                      </div>

                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                        <span className="text-slate-500 font-bold font-mono text-[9px] uppercase">Durum:</span>
                        <span className="font-black text-[10px] text-white uppercase font-mono truncate max-w-[100px]">
                          {transferStatus}
                        </span>
                      </div>
                    </div>

                    {/* Excerpt */}
                    <p className="text-xs text-slate-300 italic leading-relaxed mb-6 bg-[#0B0F19]/60 p-3.5 rounded-xl border border-white/[0.03] text-left line-clamp-3">
                      "{player.reportExcerpt || 'Oyuncunun detaylı taktiksel izleme raporu scout birimimiz tarafından güncellenmektedir.'}"
                    </p>

                    {/* Strengths / Concerns lists */}
                    <div className="space-y-4 text-left">
                      {rawStrengths.length > 0 && (
                        <div>
                          <div className="text-[9px] font-black text-emerald-400 tracking-wider uppercase mb-2 flex items-center gap-1 font-mono">
                            <ShieldCheck className="w-3.5 h-3.5" /> Güçlü Yönler
                          </div>
                          <ul className="space-y-1.5">
                            {rawStrengths.slice(0, 2).map((str, sIdx) => (
                              <li key={sIdx} className="text-xs text-slate-300 pl-4 relative font-medium leading-tight">
                                <span className="absolute left-0 top-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                {str}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {rawConcerns.length > 0 && (
                        <div>
                          <div className="text-[9px] font-black text-[#FFD21F] tracking-wider uppercase mb-2 flex items-center gap-1 font-mono">
                            <HelpCircle className="w-3.5 h-3.5" /> Risk / Gelişim Alanları
                          </div>
                          <ul className="space-y-1.5">
                            {rawConcerns.slice(0, 2).map((con, cIdx) => (
                              <li key={cIdx} className="text-xs text-slate-300 pl-4 relative font-medium leading-tight">
                                <span className="absolute left-0 top-1.5 w-1.5 h-1.5 rounded-full bg-[#FFD21F]" />
                                {con}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Link button */}
                  <div className="pt-6 mt-6 border-t border-white/[0.05]">
                    <button 
                      className="w-full py-3.5 rounded-xl bg-white/[0.03] hover:bg-[#FFD21F] hover:text-[#0B0F19] border border-white/[0.08] hover:border-[#FFD21F] text-xs font-black uppercase tracking-wider transition-all pointer-events-none cursor-pointer"
                    >
                      Detaylı Raporu Oku
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

export default TransferRadar;
