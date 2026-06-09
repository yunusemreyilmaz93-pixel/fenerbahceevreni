import React from 'react';
import { motion } from 'motion/react';
import { TrendingUp, Shield, BarChart3, Users, Newspaper, Cpu, Layers } from 'lucide-react';
import { latestArticles, matchCenter } from '../../constants/mockData';

interface HeroSectionProps {
  onEnterUniverse?: () => void;
  onNavigate: (view: any) => void;
  homeSettings?: any;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onEnterUniverse, onNavigate, homeSettings }) => {
  const dynamicTitle = homeSettings?.heroTitle || "Fenerbahçe’yi sadece izlemiyoruz.";
  const dynamicSubtext = homeSettings?.heroSubtext || "Maç önü taktik notları, maç sonu raporları, transfer profilleri, oyuncu değerlendirmeleri ve taraftarın nabzı burada.";
  const dynamicCtaText = homeSettings?.heroCtaText || "Son Analizleri Oku";

  return (
    <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden pt-28 pb-16 bg-fb-dark">
      {/* Abstract tactical board styling in the background */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-0">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#FFFFFF" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          {/* Halfway line & penalty box outlines to simulate tactical graphics */}
          <circle cx="50%" cy="50%" r="120" fill="none" stroke="#FFFFFF" strokeWidth="2" />
          <line x1="50%" y1="0" x2="50%" y2="100%" stroke="#FFFFFF" strokeWidth="2" />
          <rect x="0" y="25%" width="12%" height="50%" fill="none" stroke="#FFFFFF" strokeWidth="2" />
          <rect x="88%" y="25%" width="12%" height="50%" fill="none" stroke="#FFFFFF" strokeWidth="2" />
        </svg>
      </div>

      {/* Subtle top/bottom stadium light overlays */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-fb-navy/30 via-transparent to-fb-dark" />
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-fb-yellow/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-fb-navy/20 rounded-full blur-[160px] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Hero Left Content */}
          <div className="lg:col-span-7 space-y-8">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6 text-left"
            >


               <h1 className="text-4xl md:text-5xl font-display font-black tracking-tight text-white leading-none uppercase italic">
                {dynamicTitle}
              </h1>

              <p className="text-fb-muted text-base md:text-lg max-w-xl font-semibold leading-relaxed">
                {dynamicSubtext}
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
                <button
                  id="hero-cta-primary"
                  onClick={() => {
                    const el = document.getElementById('latest-analysis');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-full sm:w-auto px-8 py-4 bg-fb-yellow hover:bg-white text-fb-navy font-black rounded-lg shadow-[0_4px_25px_rgba(255,210,31,0.25)] flex items-center justify-center gap-2 group transition-all"
                >
                  <span>{dynamicCtaText}</span>
                  <TrendingUp className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  id="hero-cta-secondary"
                  onClick={() => {
                    const el = document.getElementById('newsletter-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-lg border border-white/10 flex items-center justify-center gap-2 transition-all"
                >
                  <span>Bültene Katıl</span>
                </button>
              </div>
            </motion.div>

            {/* Quick stats / Features bento pills */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-10"
            >
              {[
                { label: 'Maç Raporları', icon: BarChart3, desc: 'Metrik Analizler' },
                { label: 'Transfer Dosyası', icon: Shield, desc: 'Detaylı Radar' },
                { label: 'Taraftar Odası', icon: Users, desc: 'Ses Getiren Nabız' },
                { label: 'Haftalık Bülten', icon: Newspaper, desc: 'Özel Değerlendirme' }
              ].map((stat, i) => (
                <div 
                  key={i} 
                  className="p-4 rounded-xl bg-fb-card/45 border border-white/[0.06] hover:border-fb-yellow/30 transition-all text-left"
                >
                  <stat.icon className="w-5 h-5 text-fb-yellow mb-2.5" />
                  <div className="font-display font-black text-sm text-white">{stat.label}</div>
                  <div className="text-[10px] text-fb-muted font-bold tracking-wider mt-0.5">{stat.desc}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Hero Right Content - Featured Match Card & Latest Activity preview panel */}
          <div className="lg:col-span-5 relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="p-6 rounded-2xl bg-fb-card border border-white/[0.08] shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden"
            >
              {/* Decorative top yellow bar */}
              <div className="absolute top-0 inset-x-0 h-1 bg-fb-yellow" />

              <div className="flex justify-between items-center mb-6">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#FFB020] px-2 py-1 rounded bg-[#FFB020]/10">
                  Öne Çıkan Derbi
                </span>
                <span className="text-xs text-fb-muted font-bold">{matchCenter.competition}</span>
              </div>

              {/* Match matchup */}
              <div className="flex items-center justify-between py-4 text-center">
                <div className="flex flex-col items-center flex-1">
                  <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center p-2 mb-2 border border-white/5">
                    <span className="text-fb-yellow font-black text-2xl italic">FE</span>
                  </div>
                  <span className="text-sm font-black text-white">{matchCenter.homeTeam}</span>
                </div>

                <div className="px-4">
                  <span className="text-fb-muted font-bold text-xs uppercase tracking-widest block mb-1">VS</span>
                  <div className="text-2xl font-black italic text-fb-yellow">{matchCenter.time}</div>
                  <span className="text-[10px] text-fb-muted font-bold">{matchCenter.date}</span>
                </div>

                <div className="flex flex-col items-center flex-1">
                  <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center p-2 mb-2 border border-white/5">
                    <img src={matchCenter.opponentLogo} alt={matchCenter.opponent} className="w-10 h-10 object-contain" />
                  </div>
                  <span className="text-sm font-black text-white">{matchCenter.opponent}</span>
                </div>
              </div>

              <div className="border-t border-white/[0.06] pt-4 mt-2 space-y-4">
                <p className="text-xs text-fb-muted text-left leading-relaxed">
                  {matchCenter.previewText}
                </p>
                
                <div className="flex gap-3 justify-between">
                  <button 
                    onClick={() => onNavigate('match-center')}
                    className="flex-1 py-2.5 rounded-lg bg-fb-yellow hover:bg-white text-fb-navy text-[11px] font-black uppercase transition-all"
                  >
                    Maç Merkezine Git
                  </button>
                  <button 
                    onClick={() => onNavigate('fan-room')}
                    className="py-2.5 px-4 rounded-lg bg-white/5 hover:bg-white/10 text-white text-[11px] font-black uppercase transition-all"
                  >
                    Tahmin Yap
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Additional floating credential panel for monetizable feel */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="absolute -bottom-6 -left-6 hidden sm:flex items-center gap-3 p-3 rounded-xl bg-fb-dark/95 border border-white/[0.1] shadow-2xl"
            >
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <Cpu className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="text-xs font-black text-white leading-none">Isı Haritaları & Veriler</div>
                <div className="text-[10px] text-emerald-400 font-bold mt-1">Opta Entegrasyon Uyumlu</div>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default HeroSection;
