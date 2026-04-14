
import React from 'react';
import { motion } from 'motion/react';
import { Zap, Map, ChevronRight } from 'lucide-react';

interface HeroSectionProps {
  onEnterUniverse: () => void;
  onStartQuiz: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onEnterUniverse, onStartQuiz }) => {
  const scrollToMatchCenter = () => {
    document.getElementById('mac-merkezi')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-20">
      {/* Background Atmosphere */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-fb-navy/20 via-transparent to-fb-dark" />
        <motion.div 
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3] 
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-fb-navy/20 rounded-full blur-[120px]" 
        />
      </div>

      <div className="container mx-auto px-6 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="intelligence-label text-fb-yellow mb-4">FENERBAHÇE EVRENİ • 2025-2026</div>
          <h1 className="galaxy-title text-5xl md:text-7xl lg:text-8xl mb-6 leading-tight">
            SARI LACİVERT <br />
            <span className="fb-gradient-text">BİR MEDENİYET</span>
          </h1>
          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 font-light leading-relaxed">
            Fenerbahçe taraftar kültürünün en derin katmanlarına yolculuk yapın. 
            Fraksiyonunuzu bulun, kimliğinizi keşfedin ve evrenin bir parçası olun.
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onEnterUniverse}
              className="w-full md:w-auto px-8 py-4 bg-fb-yellow text-fb-navy font-black rounded-full flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(254,221,0,0.3)] transition-all"
            >
              <Map className="w-5 h-5" />
              EVRENE GİR
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onStartQuiz}
              className="w-full md:w-auto px-8 py-4 bg-white/5 backdrop-blur-md border border-white/10 text-white font-bold rounded-full flex items-center justify-center gap-2 hover:bg-white/10 transition-all"
            >
              <Zap className="w-5 h-5 text-fb-yellow" />
              FRAKSİYONUNU KEŞFET
            </motion.button>

            <button
              onClick={scrollToMatchCenter}
              className="inline-flex items-center gap-2 text-xs font-black tracking-[0.18em] text-slate-400 transition hover:text-fb-yellow"
              aria-label="Maç merkezi bölümüne kaydır"
            >
              MAÇ MERKEZİNE İN
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-[10px] uppercase tracking-[0.3em] text-slate-500">KEŞFET</span>
          <motion.div 
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-0.5 h-12 bg-gradient-to-b from-fb-yellow to-transparent"
          />
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
