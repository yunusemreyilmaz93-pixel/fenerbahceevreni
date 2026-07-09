
import React from 'react';
import { motion } from 'motion/react';
import { Clock, ChevronRight, ArrowUpRight } from 'lucide-react';
import { LATEST_NEWS } from '../../constants/homeData';

const NewsFeed: React.FC = () => {
  const featured = LATEST_NEWS[0];
  const others = LATEST_NEWS.slice(1);

  return (
    <section className="py-24">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
          <div>
            <div className="intelligence-label text-fb-yellow mb-2">GÜNCEL AKIŞ</div>
            <h2 className="text-4xl font-display font-black uppercase italic tracking-tighter">HABERLER & ANALİZLER</h2>
          </div>
          <button className="group flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-fb-yellow transition-colors">
            TÜMÜNÜ GÖR <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Featured News */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="lg:col-span-7 group relative rounded-[32px] overflow-hidden aspect-[16/9] cursor-pointer"
          >
            <img loading="lazy"src={featured.image} alt={featured.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-fb-dark via-fb-dark/40 to-transparent" />
            
            <div className="absolute bottom-0 left-0 p-8 md:p-12 w-full">
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
          </motion.div>

          {/* Secondary News */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {others.map((item) => (
              <motion.div 
                key={item.id}
                whileHover={{ x: 10 }}
                className="group flex gap-6 items-center cursor-pointer"
              >
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl overflow-hidden flex-shrink-0 border border-white/5">
                  <img loading="lazy"src={item.image} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
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
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewsFeed;
