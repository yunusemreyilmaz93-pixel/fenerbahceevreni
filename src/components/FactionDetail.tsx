import React, { useRef, useState } from 'react';
import { FactionNode } from '../types';
import { motion } from 'motion/react';
import { X, Shield, Tag, Info, ChevronRight, Zap, Target, MessageSquare, Users, AlertTriangle, Download, RefreshCw, CheckCircle2 } from 'lucide-react';
import { toTurkishUppercase } from '../lib/stringUtils';
import { toPng } from 'html-to-image';

interface FactionDetailProps {
  faction: FactionNode;
  onClose: () => void;
  onFactionClick?: (name: string) => void;
}

const FactionDetail: React.FC<FactionDetailProps> = ({ faction, onClose, onFactionClick }) => {
  const dossierRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  const handleDownload = async () => {
    if (!dossierRef.current) return;
    
    setIsExporting(true);
    try {
      const dataUrl = await toPng(dossierRef.current, {
        quality: 1.0,
        pixelRatio: 2,
        backgroundColor: '#020408',
        style: {
          borderRadius: '0',
          border: 'none'
        }
      });
      
      const link = document.createElement('a');
      link.download = `fb-istihbarat-${faction.name.toLowerCase().replace(/\s+/g, '-')}.png`;
      link.href = dataUrl;
      link.click();
      
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <motion.div
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 250 }}
      className="fixed right-0 top-0 h-full w-full md:w-[500px] glass-panel z-50 flex flex-col overflow-hidden border-l border-white/10"
    >
      <div ref={dossierRef} className="flex-1 flex flex-col overflow-hidden bg-fb-dark relative">
        {/* Cinematic Header Background */}
        <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-b from-fb-yellow/10 to-transparent pointer-events-none" />
        
        {/* Header Section */}
        <div className="relative p-6 md:p-8 flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="px-2 py-0.5 rounded bg-fb-yellow/20 border border-fb-yellow/30">
                <span className="intelligence-label text-fb-yellow text-sm">
                  {toTurkishUppercase(faction.parentName || 'MERKEZİ SİSTEM')}
                </span>
              </div>
              {faction.depth === 1 && (
                <div className="px-2 py-0.5 rounded bg-fb-gold/20 border border-fb-gold/30">
                  <span className="intelligence-label text-fb-gold text-sm">{toTurkishUppercase('Birincil Fraksiyon')}</span>
                </div>
              )}
            </div>
            <h2 className="text-3xl md:text-4xl font-display font-black text-white leading-none tracking-tighter">
              {toTurkishUppercase(faction.name)}
            </h2>
            {faction.motto && (
              <p className="text-fb-yellow font-bold text-sm tracking-wider uppercase italic">
                "{toTurkishUppercase(faction.motto)}"
              </p>
            )}
            {faction.summary && (
              <p className="text-fb-yellow/70 text-sm font-medium tracking-wide">
                {toTurkishUppercase(faction.summary)}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-all group"
          >
            <X className="w-5 h-5 text-slate-400 group-hover:text-white" />
          </button>
        </div>

        {/* Scrollable Dossier Content */}
        <div className="flex-1 overflow-y-auto px-6 md:px-8 pb-8 space-y-8 custom-scrollbar relative">
          
          {/* Quick Identity Section */}
          <section className="grid grid-cols-1 gap-4">
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-3">
              <div className="flex items-center gap-2">
                <Zap className="w-3 h-3 text-fb-yellow" />
                <h3 className="intelligence-label text-slate-400">{toTurkishUppercase('Hızlı Kimlik')}</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[14px] uppercase text-slate-500 font-bold tracking-wider">Karakter / Vibe</span>
                  <p className="text-sm text-white font-medium">{faction.vibe}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[14px] uppercase text-slate-500 font-bold tracking-wider">Genel Ton</span>
                  <p className="text-sm text-white font-medium">{faction.tone}</p>
                </div>
              </div>
              <div className="pt-2 border-t border-white/5">
                <span className="text-[14px] uppercase text-slate-500 font-bold tracking-wider">TEMSİLİYET</span>
                <p className="text-sm text-slate-300 mt-1 italic leading-relaxed">
                  "{faction.representation}"
                </p>
              </div>
            </div>
          </section>

          {/* Philosophy Section */}
          {faction.philosophy && (
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <Info className="w-3 h-3 text-fb-yellow" />
                <h3 className="intelligence-label text-slate-400">{toTurkishUppercase('Felsefesi')}</h3>
              </div>
              <p className="text-sm md:text-base text-slate-300 leading-relaxed font-light italic">
                {faction.philosophy}
              </p>
            </section>
          )}

          {/* Highlights Section */}
          {faction.highlights && (
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <Target className="w-3 h-3 text-fb-yellow" />
                <h3 className="intelligence-label text-slate-400">{toTurkishUppercase('Öne Çıkanlar')}</h3>
              </div>
              <p className="text-sm md:text-base text-white leading-relaxed font-bold">
                {faction.highlights}
              </p>
            </section>
          )}

          {/* Main Description */}
          {faction.description && (
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-3 h-3 text-fb-yellow" />
                <h3 className="intelligence-label text-slate-400">{toTurkishUppercase('Analiz ve Detaylar')}</h3>
              </div>
              <p className="text-sm md:text-base text-slate-300 leading-relaxed font-light">
                {faction.description}
              </p>
            </section>
          )}

          {/* Tags Section */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <Tag className="w-3 h-3 text-fb-yellow" />
              <h3 className="intelligence-label text-slate-400">{toTurkishUppercase('Sınıflandırma Etiketleri')}</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {faction.tags?.map((tag) => (
                <span 
                  key={tag} 
                  className="px-3 py-1 rounded-full bg-fb-navy/40 border border-white/10 text-sm text-slate-300 hover:border-fb-yellow/40 hover:text-fb-yellow transition-colors cursor-default"
                >
                  #{toTurkishUppercase(tag)}
                </span>
              ))}
            </div>
          </section>

          {/* Related Factions */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <Users className="w-3 h-3 text-fb-yellow" />
              <h3 className="intelligence-label text-slate-400">{toTurkishUppercase('İlişkisel Harita')}</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-green-500/5 border border-green-500/10 space-y-2">
                <span className="text-sm uppercase text-green-500/70 font-bold tracking-widest">{toTurkishUppercase('Yakın / Benzer')}</span>
                <div className="space-y-1">
                  {faction.relatedFactions?.similar.map(name => (
                    <button 
                      key={name} 
                      onClick={() => onFactionClick?.(name)}
                      className="text-sm text-slate-300 flex items-center gap-1 hover:text-green-400 transition-colors w-full text-left"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500/40" />
                      {name}
                    </button>
                  ))}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/10 space-y-2">
                <span className="text-sm uppercase text-red-500/70 font-bold tracking-widest">{toTurkishUppercase('Uzak / Zıt')}</span>
                <div className="space-y-1">
                  {faction.relatedFactions?.opposite.map(name => (
                    <button 
                      key={name} 
                      onClick={() => onFactionClick?.(name)}
                      className="text-sm text-slate-300 flex items-center gap-1 hover:text-red-400 transition-colors w-full text-left"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500/40" />
                      {name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Sub-factions (Children) */}
          {faction.children && faction.children.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <Shield className="w-3 h-3 text-fb-yellow" />
                <h3 className="intelligence-label text-slate-400">{toTurkishUppercase('Alt Birimler')}</h3>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {faction.children.map((child) => (
                  <button 
                    key={child.id} 
                    onClick={() => onFactionClick?.(child.name)}
                    className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-fb-yellow/20 transition-all cursor-pointer group w-full text-left"
                  >
                    <span className="text-sm font-medium text-slate-300 group-hover:text-white">{toTurkishUppercase(child.name)}</span>
                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-fb-yellow" />
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Minimal Fallback for empty sections */}
          {!faction.children?.length && (
            <div className="p-4 rounded-xl border border-dashed border-white/5 flex items-center justify-center gap-2 opacity-40">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm uppercase tracking-widest">Alt Kırılım Bulunmamaktadır</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer / Action Bar */}
      <div className="p-6 md:p-8 bg-fb-dark/60 backdrop-blur-xl border-t border-white/5">
        <button 
          onClick={handleDownload}
          disabled={isExporting}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-fb-navy to-fb-accent border border-fb-yellow/30 text-fb-yellow font-bold intelligence-label text-sm hover:shadow-[0_0_20px_rgba(254,221,0,0.2)] hover:border-fb-yellow transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isExporting ? <RefreshCw className="w-4 h-4 animate-spin" /> : exportSuccess ? <CheckCircle2 className="w-4 h-4" /> : <Download className="w-4 h-4" />}
          {isExporting ? toTurkishUppercase('Hazırlanıyor...') : exportSuccess ? toTurkishUppercase('İndirildi') : toTurkishUppercase('Fraksiyonu Paylaş')}
        </button>
      </div>
    </motion.div>
  );
};

export default FactionDetail;
