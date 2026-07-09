
import React from 'react';
import { motion } from 'motion/react';
import { Map, Users, Target, Share2 } from 'lucide-react';

interface UniverseEntryProps {
  onEnter: () => void;
}

const UniverseEntry: React.FC<UniverseEntryProps> = ({ onEnter }) => {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background Visuals */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none opacity-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--color-fb-navy)_0%,_transparent_70%)]" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="glass-panel rounded-[40px] p-8 md:p-16 flex flex-col lg:flex-row items-center gap-16 overflow-hidden">
          <div className="flex-1 text-center lg:text-left">
            <div className="intelligence-label text-fb-yellow mb-4">İMZA DENEYİM</div>
            <h2 className="text-4xl md:text-6xl font-display font-black uppercase italic tracking-tighter mb-6 leading-tight">
              FENERBAHÇE <br />
              <span className="fb-gradient-text">EVRENİNİ KEŞFET</span>
            </h2>
            <p className="text-slate-400 text-lg mb-10 max-w-xl">
              Binlerce taraftarın oluşturduğu devasa bir sosyal galaksi. 
              Hangi fraksiyona aitsin? Kimlerle aynı düşünüyorsun? 
              Etkileşimli haritamızda yerini al.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-10">
              {[
                { icon: <Users />, label: '300+ FRAKSİYON' },
                { icon: <Target />, label: 'KİMLİK ANALİZİ' },
                { icon: <Share2 />, label: 'PAYLAŞILABİLİR KART' },
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center lg:items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-fb-yellow/10 flex items-center justify-center text-fb-yellow">
                    {React.cloneElement(item.icon as React.ReactElement, { size: 20 })}
                  </div>
                  <span className="text-[10px] font-black tracking-widest text-slate-500 uppercase">{item.label}</span>
                </div>
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onEnter}
              className="px-10 py-5 bg-fb-yellow text-fb-navy font-black rounded-full shadow-[0_0_40px_rgba(254,221,0,0.2)] flex items-center gap-3 mx-auto lg:mx-0"
            >
              <Map className="w-6 h-6" />
              HARİTAYI AÇ
            </motion.button>
          </div>

          <div className="flex-1 relative">
            <motion.div
              animate={{ 
                rotate: 360,
              }}
              transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
              className="relative w-[300px] h-[300px] md:w-[500px] md:h-[500px]"
            >
              {/* Decorative Rings */}
              <div className="absolute inset-0 rounded-full border border-fb-yellow/20 scale-100" />
              <div className="absolute inset-0 rounded-full border border-fb-navy/30 scale-75" />
              <div className="absolute inset-0 rounded-full border border-fb-yellow/10 scale-50" />
              
              {/* Floating Nodes */}
              {[0, 60, 120, 180, 240, 300].map((deg, i) => (
                <motion.div
                  key={i}
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 3, delay: i * 0.5, repeat: Infinity }}
                  className="absolute w-4 h-4 rounded-full bg-fb-yellow shadow-[0_0_15px_rgba(254,221,0,0.5)]"
                  style={{
                    top: '50%',
                    left: '50%',
                    transform: `rotate(${deg}deg) translate(${i % 2 === 0 ? '150px' : '200px'})`,
                  }}
                />
              ))}
            </motion.div>
            
            {/* Centerpiece */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 md:w-48 md:h-48 bg-fb-dark rounded-full border-4 border-fb-yellow shadow-[0_0_50px_rgba(254,221,0,0.3)] flex items-center justify-center overflow-hidden">
              <img src="/logos/fenerbahce.png" alt="Fenerbahçe" className="w-2/3 h-2/3 object-contain" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UniverseEntry;
