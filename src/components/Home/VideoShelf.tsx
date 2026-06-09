
import React from 'react';
import { motion } from 'motion/react';
import { Play, Clock, ChevronRight } from 'lucide-react';
import { VIDEOS } from '../../constants/homeData';

const VideoShelf: React.FC = () => {
  return (
    <section className="py-24 bg-fb-dark relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-fb-navy/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
          <div>
            <div className="intelligence-label text-fb-yellow mb-2">MEDYA MERKEZİ</div>
            <h2 className="text-4xl font-display font-black uppercase italic tracking-tighter">VİDEO GALERİ</h2>
          </div>
          <button className="group flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-fb-yellow transition-colors">
            YOUTUBE KANALINA GİT <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {VIDEOS.map((video, i) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="group cursor-pointer"
            >
              <div className="relative aspect-video rounded-3xl overflow-hidden mb-4 border border-white/5">
                <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-fb-dark/20 group-hover:bg-fb-dark/40 transition-colors" />
                
                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div 
                    whileHover={{ scale: 1.1 }}
                    className="w-16 h-16 rounded-full bg-fb-yellow/90 backdrop-blur-sm flex items-center justify-center text-fb-navy shadow-[0_0_30px_rgba(254,221,0,0.4)] opacity-0 group-hover:opacity-100 transition-all duration-300"
                  >
                    <Play className="w-8 h-8 fill-current ml-1" />
                  </motion.div>
                </div>

                {/* Duration Badge */}
                <div className="absolute bottom-4 right-4 px-2 py-1 bg-fb-dark/80 backdrop-blur-md rounded-lg text-[10px] font-bold text-white flex items-center gap-1.5">
                  <Clock className="w-3 h-3" /> {video.duration}
                </div>
              </div>

              <div className="px-2">
                <div className="text-[10px] font-black text-fb-yellow uppercase tracking-widest mb-2">{video.category}</div>
                <h3 className="text-xl font-bold text-white leading-tight group-hover:text-fb-yellow transition-colors line-clamp-2">
                  {video.title}
                </h3>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default VideoShelf;
