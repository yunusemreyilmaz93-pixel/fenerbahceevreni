import React from 'react';
import { motion } from 'motion/react';
import { Clock, BookOpen, ArrowRight } from 'lucide-react';
import { latestArticles } from '../../constants/mockData';

interface LatestAnalysisProps {
  onNavigate: (view: string) => void;
}

const LatestAnalysis: React.FC<LatestAnalysisProps> = ({ onNavigate }) => {
  const getSlugForArticleId = (id: string) => {
    switch (id) {
      case 'art-1': return 'fenerbahce-oyun-plani-problem';
      case 'art-2': return 'fenerbahce-neden-tempoyu-kaybediyor';
      case 'art-3': return 'orta-sahada-dogru-uclu-kombinasyonu';
      case 'art-4': return 'kanat-rotasyonu-hucum-akli';
      default: return 'fenerbahce-oyun-plani-problem';
    }
  };

  return (
    <section id="latest-analysis" className="py-20 bg-fb-dark">
      <div className="container mx-auto px-6">
        
        {/* Section title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div className="text-left">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-fb-yellow block mb-2">Taktik, Rapor & Köşe Yazıları</span>
            <h2 className="text-3xl md:text-4xl font-display font-black text-white uppercase tracking-tight">Son Analizler</h2>
          </div>
          <button 
            onClick={() => onNavigate('analysis')}
            className="self-start md:self-auto text-xs font-black text-fb-yellow uppercase hover:underline tracking-widest flex items-center gap-1"
          >
            Tüm Analiz Arşivi →
          </button>
        </div>

        {/* Content grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {latestArticles.map((art, idx) => (
            <motion.article
              key={art.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              viewport={{ once: true }}
              onClick={() => {
                window.location.hash = `#/analizler/${getSlugForArticleId(art.id)}`;
                onNavigate('analysis');
              }}
              className="group p-5 rounded-xl bg-fb-card border border-white/[0.06] hover:border-fb-yellow/20 flex flex-col justify-between transition-all cursor-pointer"
            >
              <div className="space-y-4 text-left">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-fb-yellow">
                  <span>{art.category}</span>
                  <span className="text-fb-muted flex items-center gap-1">
                    <Clock className="w-3" /> {art.readingTime}
                  </span>
                </div>

                <h3 className="text-lg font-black text-white leading-snug group-hover:text-fb-yellow transition-colors italic">
                  {art.title}
                </h3>

                <p className="text-fb-muted text-xs leading-relaxed line-clamp-3">
                  {art.excerpt}
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-white/[0.05] flex items-center justify-between">
                <div className="text-left">
                  <div className="text-[10px] text-white font-bold">{art.author}</div>
                  <span className="text-[9px] text-fb-muted font-bold">{art.date}</span>
                </div>
                <button 
                  className="w-8 h-8 rounded-full bg-white/5 group-hover:bg-fb-yellow group-hover:text-fb-navy flex items-center justify-center text-white transition-all pointer-events-none"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.article>
          ))}
        </div>

      </div>
    </section>
  );
};

export default LatestAnalysis;
