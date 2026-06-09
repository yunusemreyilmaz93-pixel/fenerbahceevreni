import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, HelpCircle, ArrowLeft, Home, FileText } from 'lucide-react';
import SEO from './SEO';

interface NotFoundPageProps {
  onNavigate: (view: any) => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-[#070b13] text-slate-100 flex flex-col justify-center items-center px-6 py-12 relative overflow-hidden text-center">
      <SEO 
        title="Sayfa Bulunamadı | Fenerbahçe Evreni"
        description="Aradığınız sayfa taşınmış, silinmiş ya da hiç var olmamış olabilir. Bağımsız Fenerbahçe analiz portalında doğru yola dönün."
      />

      {/* Decorative Brand Glow background */}
      <div className="absolute top-[30%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[35rem] h-[35rem] rounded-full bg-fb-navy/5 opacity-40 blur-[140px] pointer-events-none" />
      <div className="absolute top-[40%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[25rem] h-[25rem] rounded-full bg-fb-yellow/5 opacity-15 blur-[120px] pointer-events-none" />

      <div className="max-w-md w-full relative z-10 space-y-8">
        
        {/* Animated 404 Visual Icon */}
        <div className="relative inline-block">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="text-[120px] font-display font-black leading-none bg-gradient-to-b from-fb-yellow via-fb-yellow/70 to-transparent bg-clip-text text-transparent italic select-none"
          >
            404
          </motion.div>
          <motion.div
            initial={{ opacity: 0, rotate: -20 }}
            animate={{ opacity: 1, rotate: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="absolute -top-3 -right-3 bg-fb-yellow text-fb-dark p-2 rounded-full border-4 border-[#070b13] shadow-lg"
          >
            <HelpCircle size={22} className="stroke-[2.5]" />
          </motion.div>
        </div>

        {/* Text Area */}
        <div className="space-y-3">
          <h1 className="text-2xl md:text-3xl font-display font-black text-white uppercase italic">
            Sayfa Bulunamadı
          </h1>
          <p className="text-fb-muted text-sm leading-relaxed max-w-sm mx-auto font-medium">
            Aradığın sayfa taşınmış, silinmiş ya da hiç var olmamış olabilir. Ama merak etme, analiz ekibimize giden taktik yollar hala açık!
          </p>
        </div>

        {/* Button selection actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-fb-navy to-fb-navy-light text-white text-xs font-black uppercase tracking-wider hover:opacity-90 transition-all border border-white/10 shadow-[0_4px_20px_rgba(30,41,59,0.3)] group cursor-pointer"
          >
            <Home size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            Ana Sayfaya Dön
          </button>
          <button
            onClick={() => onNavigate('analysis')}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-black uppercase tracking-wider transition-all border border-white/10 shadow-md group cursor-pointer"
          >
            <FileText size={14} className="text-fb-yellow" />
            Analizlere Git
            <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Independent Platform Disclaimer */}
        <p className="text-[10px] text-white/30 font-semibold max-w-xs mx-auto italic pt-6 leading-normal border-t border-white/[0.04]">
          “Fenerbahçe Evreni, bağımsız bir taraftar ve analiz platformudur. Fenerbahçe Spor Kulübü ile resmî bir bağı yoktur.”
        </p>

      </div>
    </div>
  );
};

export default NotFoundPage;
