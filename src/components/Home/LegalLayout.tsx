import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, ShieldAlert, BookOpen, AlertCircle, Scale } from 'lucide-react';
import Footer from './Footer';

interface LegalLayoutProps {
  title: string;
  subtitle: string;
  lastUpdated?: string;
  onNavigate: (view: string) => void;
  children: React.ReactNode;
  sections?: { id: string; title: string }[];
}

export const LegalHero: React.FC<{ title: string; subtitle: string; lastUpdated?: string }> = ({ 
  title, 
  subtitle, 
  lastUpdated = '30 Mayıs 2026' 
}) => {
  return (
    <div className="relative overflow-hidden border-b border-white/[0.06] bg-[#070c19] py-16 text-left">
      {/* Background patterns */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,210,31,0.05),transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,rgba(3,7,18,0.4))] pointer-events-none" />
      
      <div className="container mx-auto px-6 max-w-4xl relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-fb-yellow/10 border border-fb-yellow/20 text-fb-yellow text-[10px] font-black uppercase tracking-widest mb-6">
          <Scale size={11} /> HUKUKİ BİLGİLENDİRME & POLİTİKALAR
        </div>
        
        <h1 className="text-3xl md:text-5xl font-display font-black text-white uppercase italic tracking-wide mb-4">
          {title}
        </h1>
        <p className="text-sm md:text-base text-slate-400 font-semibold max-w-2xl leading-relaxed mb-4">
          {subtitle}
        </p>
        <div className="text-[11px] text-fb-muted font-bold font-mono uppercase tracking-wider">
          Son Güncelleme: {lastUpdated}
        </div>
      </div>
    </div>
  );
};

export const LegalNoticeBox: React.FC = () => {
  return (
    <div className="p-5 rounded-2xl bg-fb-yellow/[0.03] border border-fb-yellow/20 text-left space-y-2 flex items-start gap-4">
      <div className="w-8 h-8 rounded-xl bg-fb-yellow/10 border border-fb-yellow/20 flex items-center justify-center text-fb-yellow shrink-0 mt-0.5">
        <AlertCircle size={15} className="animate-pulse" />
      </div>
      <div>
        <h4 className="text-xs font-black text-white uppercase tracking-wider">Önemli Bilgilendirme Notu</h4>
        <p className="text-xs text-slate-300 leading-relaxed font-semibold mt-1">
          Bu metin genel bilgilendirme amacıyla hazırlanmıştır. Hukuki danışmanlık niteliği taşımaz. 
          Platformun kullanım kapsamı ve yürürlükteki mevzuata göre profesyonel hukuki destek alınması önerilir.
        </p>
      </div>
    </div>
  );
};

export const GlobalDisclaimerBox: React.FC = () => {
  return (
    <div className="p-5 rounded-2xl bg-rose-500/[0.02] border border-rose-500/10 text-left space-y-2 flex items-start gap-4">
      <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0 mt-0.5">
        <ShieldAlert size={15} />
      </div>
      <div>
        <h4 className="text-xs font-black text-white uppercase tracking-wider">Bağımsızlık Beyanı (Disclaimer)</h4>
        <p className="text-xs text-slate-300 leading-relaxed font-semibold mt-1">
          Fenerbahçe Evreni, bağımsız bir taraftar ve analiz platformudur. 
          Fenerbahçe Spor Kulübü ile resmî bir bağı, sponsorluğu, temsil yetkisi veya kulüp adına hareket etme durumu yoktur.
        </p>
      </div>
    </div>
  );
};

export const LegalSection: React.FC<{ id: string; title: string; children: React.ReactNode }> = ({ 
  id, 
  title, 
  children 
}) => {
  return (
    <div id={id} className="scroll-mt-32 space-y-4 text-left border-b border-white/[0.04] pb-8 last:border-b-0">
      <div className="flex items-center gap-3">
        <div className="w-1.5 h-6 bg-fb-yellow rounded-full" />
        <h3 className="text-base md:text-lg font-black text-white uppercase tracking-wide">
          {title}
        </h3>
      </div>
      <div className="text-xs md:text-sm text-slate-300 leading-relaxed space-y-4 font-semibold pl-4">
        {children}
      </div>
    </div>
  );
};

export const LegalTableOfContents: React.FC<{ sections: { id: string; title: string }[] }> = ({ sections }) => {
  const handleScroll = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-fb-card border border-white/[0.05] space-y-4 text-left sticky top-28 hidden lg:block">
      <h4 className="text-[10px] font-black uppercase tracking-wider text-fb-muted flex items-center gap-2">
        <BookOpen size={12} className="text-fb-yellow" /> BU SAYFADAKİ BÖLÜMLER
      </h4>
      <nav className="space-y-2">
        {sections.map((sec) => (
          <button
            key={sec.id}
            onClick={() => handleScroll(sec.id)}
            className="w-full text-left font-bold text-xs text-slate-400 hover:text-fb-yellow transition-all flex items-center gap-1.5 py-0.5 cursor-pointer block"
          >
            <span className="w-1 h-1 bg-white/20 rounded-full shrink-0" />
            <span className="truncate">{sec.title}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export const LegalLayout: React.FC<LegalLayoutProps> = ({
  title,
  subtitle,
  lastUpdated = '30 Mayıs 2026',
  onNavigate,
  children,
  sections = []
}) => {
  return (
    <div className="min-h-screen bg-fb-dark">
      {/* Visual Header */}
      <LegalHero title={title} subtitle={subtitle} lastUpdated={lastUpdated} />

      {/* Main Content Pane */}
      <div className="container mx-auto px-6 py-12 max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => onNavigate('home')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-xs font-black text-white uppercase tracking-wider rounded-xl transition-all border border-white/5 cursor-pointer"
          >
            <ArrowLeft size={13} /> Ana Sayfaya Dön
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Body */}
          <div className="lg:col-span-3 space-y-12">
            {/* Notices Panel */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">
              <LegalNoticeBox />
              <GlobalDisclaimerBox />
            </div>

            {/* Injected Children */}
            <div className="space-y-12">
              {children}
            </div>
          </div>

          {/* Table Of Contents Sidebar */}
          {sections.length > 0 && (
            <div className="lg:col-span-1">
              <LegalTableOfContents sections={sections} />
            </div>
          )}
        </div>
      </div>

      <Footer onNavigate={onNavigate} />
    </div>
  );
};
