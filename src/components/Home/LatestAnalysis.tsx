import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Clock, BookOpen, ArrowRight, FolderOpen, User, Calendar } from 'lucide-react';
import { dbGetCollection } from '../../lib/dbService';

interface Article {
  id: string;
  category: string;
  title: string;
  excerpt: string;
  readingTime: string;
  author: string;
  date: string;
  createdAt?: string;
  status?: string;
  slug?: string;
  coverImage?: string;
}

interface LatestAnalysisProps {
  onNavigate: (view: string) => void;
}

const LatestAnalysis: React.FC<LatestAnalysisProps> = ({ onNavigate }) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  const loadArticles = async () => {
    setLoading(true);
    try {
      const fetched = await dbGetCollection('articles');
      if (fetched) {
        // Filter by state
        const published = fetched.filter((a: any) => a.status === 'published' || a.status === 'active' || !a.status);
        setArticles(published);
      }
    } catch (err) {
      console.error("LatestAnalysis load failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArticles();
  }, []);

  // Split into left (featured) and right (standard)
  const featuredArticle = articles[0] || null;
  const secondaryArticles = articles.slice(1, 4);

  // Ana sayfada içeriksiz bölüm gösterme: boş durumlar kendi sayfasında (Analizler) yaşar.
  if (!loading && articles.length === 0) return null;

  return (
    <section id="latest-analysis" className="py-24 bg-[#0B0F19] relative overflow-hidden">
      
      {/* Background visual detail */}
      <div className="absolute top-[20%] left-[-10%] w-[300px] h-[300px] bg-[#FFD21F]/[0.01] rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-6 max-w-7xl relative z-10 w-full">
        
        {/* Section title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="text-left">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#FFD21F] block mb-2 font-mono">
              Taktiğin ve Verinin Ortak Noktası
            </span>
            <h2 className="text-3xl md:text-4xl font-display font-black text-white uppercase tracking-tight italic">
              Son Analizler
            </h2>
          </div>
          
          <button 
            onClick={() => onNavigate('analysis')}
            className="self-start md:self-auto text-xs font-black text-[#FFD21F] hover:text-white uppercase tracking-widest flex items-center gap-1.5 transition-colors cursor-pointer group"
          >
            Tüm Analizleri Gör <span className="group-hover:translate-x-1 transition-transform">→</span>
          </button>
        </div>

        {loading ? (
          <div className="py-16 text-center text-[#FFD21F] text-xs font-black uppercase tracking-widest font-mono">
            Analizler Derleniyor...
          </div>
        ) : articles.length === 0 ? (
          // Exact Turkish empty state matches user prompt
          <div className="p-16 rounded-2xl bg-[#111625] border border-white/[0.08] text-center space-y-4 max-w-xl mx-auto">
            <FolderOpen className="w-12 h-12 text-slate-500 mx-auto opacity-70" />
            <p className="text-slate-400 text-sm font-bold uppercase tracking-wider font-mono">
              Henüz haber eklenmedi.
            </p>
          </div>
        ) : (
          /* Editorial Asymmetric Grid */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Featured Article Card (Left Side) */}
            {featuredArticle && (
              <motion.article
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                onClick={() => {
                  window.location.hash = `#/analizler/${featuredArticle.slug || featuredArticle.id}`;
                  onNavigate('analysis');
                }}
                className="lg:col-span-7 rounded-2xl bg-[#111625] border border-white/[0.08] hover:border-[#FFD21F]/30 p-8 flex flex-col justify-between transition-all cursor-pointer group shadow-lg hover:scale-[1.005]"
              >
                <div className="space-y-6 text-left">
                  {/* Aspect Top Row */}
                  <div className="flex justify-between items-center pb-4 border-b border-white/[0.04]">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#FFD21F] bg-[#FFD21F]/10 px-2.5 py-1 rounded-md border border-[#FFD21F]/20 font-mono">
                      {featuredArticle.category || 'Öne Çıkan Analiz'}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5 font-mono">
                      <Clock className="w-3.5 h-3.5" /> {featuredArticle.readingTime || '6 dk okuma'}
                    </span>
                  </div>

                  {/* Title and Excerpt */}
                  <div className="space-y-4">
                    <h3 className="text-2xl md:text-3xl font-display font-black text-white leading-tight uppercase italic group-hover:text-[#FFD21F] transition-colors">
                      {featuredArticle.title}
                    </h3>
                    <p className="text-slate-300 text-sm md:text-base leading-relaxed font-medium">
                      {featuredArticle.excerpt}
                    </p>
                  </div>
                </div>

                {/* Footer specs */}
                <div className="pt-8 mt-8 border-t border-white/[0.05] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-white/[0.03] border border-white/10 flex items-center justify-center text-slate-300">
                      <User className="w-4 h-4 text-[#FFD21F]" />
                    </div>
                    <div>
                      <div className="text-xs font-black text-white uppercase italic">{featuredArticle.author || 'Analiz Ekibi'}</div>
                      <span className="text-[10px] text-slate-400 font-bold">{featuredArticle.date || 'Bugün'}</span>
                    </div>
                  </div>
                  
                  <button className="flex items-center gap-2 text-xs font-black text-[#FFD21F] uppercase tracking-widest bg-[#FFD21F]/10 border border-[#FFD21F]/20 p-2.5 px-4 rounded-xl group-hover:bg-[#FFD21F] group-hover:text-[#0B0F19] transition-all">
                    <span>Devamını Oku</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.article>
            )}

            {/* Minor Articles Column (Right Side) */}
            <div className="lg:col-span-5 flex flex-col gap-6 justify-between">
              {secondaryArticles.length > 0 ? (
                secondaryArticles.map((art, idx) => (
                  <motion.article
                    key={art.id}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                    viewport={{ once: true }}
                    onClick={() => {
                      window.location.hash = `#/analizler/${art.slug || art.id}`;
                      onNavigate('analysis');
                    }}
                    className="p-5 rounded-2xl bg-[#111625] border border-white/[0.06] hover:border-[#FFD21F]/30 hover:scale-[1.01] flex flex-col justify-between transition-all cursor-pointer group text-left flex-1"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-slate-400 font-mono">
                        <span>{art.category || 'Taktik Rapor'}</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3" /> {art.readingTime || '4 dk okuma'}
                        </span>
                      </div>
                      <h4 className="text-base font-black text-white leading-snug group-hover:text-[#FFD21F] transition-colors uppercase italic truncate">
                        {art.title}
                      </h4>
                      <p className="text-slate-400 text-xs leading-relaxed line-clamp-2">
                        {art.excerpt}
                      </p>
                    </div>

                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/[0.05]">
                      <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">
                        {art.author || 'Fenerbahçe Evreni'} • {art.date || 'Dün'}
                      </span>
                      <span className="text-[10px] font-bold text-[#FFD21F] group-hover:underline uppercase tracking-wider">
                        Devamını Oku
                      </span>
                    </div>
                  </motion.article>
                ))
              ) : (
                // Fill if less than 3 other articles exist
                <div className="flex flex-col items-center justify-center p-8 rounded-2xl bg-[#111625]/40 border border-white/[0.04] text-center flex-1">
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Diğer Analizler Hazırlanıyor</p>
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </section>
  );
};

export default LatestAnalysis;
