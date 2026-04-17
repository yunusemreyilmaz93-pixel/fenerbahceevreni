import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Clock, ChevronRight, ArrowUpRight } from 'lucide-react';
import { LATEST_NEWS } from '../../constants/homeData';
import { fetchFenerbahceNews, type FenerNewsItem } from '../../lib/newsService';

const NewsFeed: React.FC = () => {
  const [liveNews, setLiveNews] = useState<FenerNewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetchFenerbahceNews(5)
      .then((items) => {
        if (mounted && items.length > 0) {
          setLiveNews(items);
        }
      })
      .catch(() => {
        // fallback below
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const normalizedFallback = useMemo(
    () =>
      LATEST_NEWS.map((item) => ({
        id: item.id,
        title: item.title,
        summary: item.summary,
        url: item.url || '#',
        image: item.image,
        date: item.date,
        source: 'Fenerbahçe Evreni',
        category: item.category,
      })),
    [],
  );

  const feed = liveNews.length > 0 ? liveNews : normalizedFallback;
  const featured = feed[0];
  const others = feed.slice(1, 5);

  return (
    <section className="py-24">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
          <div>
            <div className="intelligence-label text-fb-yellow mb-2">GÜNCEL AKIŞ</div>
            <h2 className="text-4xl font-display font-black uppercase italic tracking-tighter">HABERLER & ANALİZLER</h2>
            <p className="mt-3 text-sm text-slate-400 max-w-2xl">
              Bu bölüm Google News ve editoryal fallback akışını birleştirir. Amaç hızlı keşif;
              kritik haberleri resmi kulüp kaynaklarıyla teyit etmeni öneririz.
            </p>
          </div>
          <a
            href="https://news.google.com/rss/search?q=Fenerbah%C3%A7e&hl=tr&gl=TR&ceid=TR:tr"
            target="_blank"
            rel="noreferrer"
            className="group flex items-center gap-2 text-sm font-bold text-slate-400 transition-colors hover:text-fb-yellow"
          >
            TÜMÜNÜ GÖR <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </a>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <motion.a
            href={featured.url}
            target={featured.url?.startsWith('http') ? '_blank' : undefined}
            rel={featured.url?.startsWith('http') ? 'noreferrer' : undefined}
            whileHover={{ y: -5 }}
            className="lg:col-span-7 group relative rounded-[32px] overflow-hidden aspect-[16/9] cursor-pointer"
          >
            <img src={featured.image || 'https://picsum.photos/seed/fb-live/1200/700'} alt={featured.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-fb-dark via-fb-dark/40 to-transparent" />

            <div className="absolute bottom-0 left-0 p-8 md:p-12 w-full">
              <div className="mb-2 text-[10px] font-black tracking-[0.16em] text-slate-400">
                {isLoading ? 'HABERLER GÜNCELLENİYOR…' : `KAYNAK: ${featured.source || 'GOOGLE NEWS'}`}
              </div>
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-fb-yellow text-fb-navy text-[10px] font-black rounded-full uppercase tracking-widest">
                  {featured.category}
                </span>
                <span className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
                  <Clock className="w-3.5 h-3.5" /> {featured.date}
                </span>
              </div>
              <h3 className="text-3xl md:text-4xl font-display font-black text-white mb-4 leading-tight group-hover:text-fb-yellow transition-colors">
                {featured.title}
              </h3>
              <p className="text-slate-300 text-sm md:text-base max-w-xl line-clamp-2 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
                {featured.summary}
              </p>
            </div>
          </motion.a>

          <div className="lg:col-span-5 flex flex-col gap-6">
            {others.map((item) => (
              <motion.a
                key={item.id}
                href={item.url}
                target={item.url?.startsWith('http') ? '_blank' : undefined}
                rel={item.url?.startsWith('http') ? 'noreferrer' : undefined}
                whileHover={{ x: 10 }}
                className="group flex gap-6 items-center cursor-pointer"
              >
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl overflow-hidden flex-shrink-0 border border-white/5">
                  <img src={item.image || `https://picsum.photos/seed/news-${item.id}/500/500`} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-[10px] font-black text-fb-yellow uppercase tracking-widest">{item.category}</span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">{item.date}</span>
                  </div>
                  <h4 className="text-lg md:text-xl font-bold text-white mb-2 leading-tight group-hover:text-fb-yellow transition-colors line-clamp-2">
                    {item.title}
                  </h4>
                  <div className="flex items-center gap-1 text-xs font-bold text-slate-500 group-hover:text-fb-yellow transition-colors">
                    OKU <ArrowUpRight className="w-3 h-3" />
                  </div>
                </div>
              </motion.a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewsFeed;
