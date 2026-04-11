import React, { useRef, useState } from 'react';
import { motion } from 'motion/react';
import { FACTION_PROFILES } from '../../constants/factionProfiles';
import { Share2, RefreshCw, Download, CheckCircle2 } from 'lucide-react';
import { toPng } from 'html-to-image';
import { toTurkishUppercase } from '../../lib/stringUtils';
import ShareCard from './ShareCard';

interface ResultScreenProps {
  scores: Record<string, number>;
  onReset: () => void;
  onExplore: (factionName: string) => void;
}

const ResultScreen: React.FC<ResultScreenProps> = ({ scores, onReset, onExplore }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  // — Results calculation —
  const sortedFactions = Object.keys(scores).sort(
    (a, b) => (scores[b] || 0) - (scores[a] || 0)
  );

  const mainFactionName = sortedFactions[0] || 'Düz Fenerbahçeliler';
  const mainFaction = FACTION_PROFILES[mainFactionName];

  const top1Score = scores[sortedFactions[0]] || 0;
  const top2Score = scores[sortedFactions[1]] || 0;
  const isHybrid = sortedFactions.length > 1 && (top1Score - top2Score) < 3;
  const hybridFaction = isHybrid ? sortedFactions[1] : undefined;

  // Nearby: exclude main, exclude hybrid if shown separately
  const nearbyFactions = sortedFactions
    .slice(1)
    .filter((f) => !isHybrid || f !== hybridFaction)
    .slice(0, isHybrid ? 2 : 3);

  // — Export refs —
  // exportCardRef points to the hidden 1080x1080 DOM node used for capture.
  // The visible preview is a separate scaled clone — no ref, no capture issues.
  const exportCardRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!exportCardRef.current) return;
    setIsExporting(true);

    try {
      // Wait for fonts to be fully loaded before capture
      await document.fonts.ready;
      await new Promise((resolve) => setTimeout(resolve, 150));

      const dataUrl = await toPng(exportCardRef.current, {
        width: 1080,
        height: 1080,
        quality: 1.0,
        pixelRatio: 2,
        backgroundColor: '#0D1117',
        // Force all styles to be inlined for cross-platform consistency
        includeQueryParams: true,
        cacheBust: true,
        skipFonts: false,
      });

      const link = document.createElement('a');
      link.download = `fenerbahce-evreni-${mainFactionName
        .toLowerCase()
        .replace(/\s+/g, '-')}.png`;
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

  const handleShareX = () => {
    const text = `Fenerbahçe Evreni'nde safım belli oldu: ${toTurkishUppercase(mainFactionName)}!\n\nSen hangi fraksiyondasın? #FenerbahçeEvreni #Fenerbahçe`;
    const url = window.location.href;
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      '_blank'
    );
  };

  const shareCardProps = {
    mainFactionName,
    nearbyFactions,
    isHybrid,
    hybridFaction,
  };

  return (
    <>
      {/* Hidden export target — full 1080x1080, off-screen, no transform */}
      <div
        style={{
          position: 'fixed',
          left: '-9999px',
          top: 0,
          width: '1080px',
          height: '1080px',
          zIndex: -1,
          pointerEvents: 'none',
        }}
        aria-hidden="true"
      >
        <ShareCard ref={exportCardRef} {...shareCardProps} mode="result" />
      </div>

      {/* Visible result screen */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="w-full max-w-6xl flex flex-col items-center gap-8 md:gap-12 py-8 px-4 overflow-y-auto max-h-full custom-scrollbar"
      >
        {/* Header */}
        <div className="text-center space-y-2">
          <span className="intelligence-label text-fb-yellow text-sm tracking-[0.2em]">
            {toTurkishUppercase('Analiz Tamamlandı')}
          </span>
          <h2 className="text-4xl md:text-6xl font-display font-black text-white tracking-tighter">
            {toTurkishUppercase('Senin Safın Belli Oldu')}
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 w-full items-start">
          {/* Card preview — visual only, scaled clone, no ref */}
          <div className="lg:col-span-7 flex justify-center w-full">
            <div className="relative w-full max-w-[500px] aspect-square overflow-hidden rounded-[15px]">
              <div
                style={{
                  transform: `scale(${500 / 1080})`,
                  transformOrigin: 'top left',
                  width: '1080px',
                  height: '1080px',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                }}
              >
                {/* No ref here — this is purely visual */}
                <ShareCard {...shareCardProps} mode="result" />
              </div>
            </div>
          </div>

          {/* Action sidebar */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* Analysis block */}
            <div className="p-8 rounded-[2.5rem] bg-white/[0.03] border border-white/5 space-y-6">
              <div className="space-y-2">
                <h4 className="intelligence-label text-fb-yellow">
                  {toTurkishUppercase('Fraksiyon Analizi')}
                </h4>
                <p className="text-base text-slate-300 leading-relaxed font-light">
                  {mainFaction?.description}
                </p>
              </div>

              {isHybrid && hybridFaction && (
                <div className="p-5 rounded-2xl bg-fb-yellow/5 border border-fb-yellow/10 space-y-2">
                  <h5 className="text-fb-yellow font-black text-sm tracking-widest uppercase">
                    {toTurkishUppercase('Çift Damar Tespit Edildi')}
                  </h5>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    Ana fraksiyonun{' '}
                    <span className="text-white font-bold">
                      {toTurkishUppercase(mainFactionName)}
                    </span>{' '}
                    ama içinde ciddi bir{' '}
                    <span className="text-white font-bold">
                      {toTurkishUppercase(hybridFaction)}
                    </span>{' '}
                    geni taşıyorsun. Karar vermesi zor profil.
                  </p>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={handleDownload}
                disabled={isExporting}
                className="w-full py-5 rounded-2xl bg-fb-yellow text-fb-navy font-black intelligence-label text-sm hover:shadow-[0_0_40px_rgba(254,221,0,0.4)] hover:scale-[1.02] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:hover:scale-100"
              >
                {isExporting ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : exportSuccess ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <Download className="w-5 h-5" />
                )}
                {isExporting
                  ? toTurkishUppercase('Hazırlanıyor...')
                  : exportSuccess
                  ? toTurkishUppercase('İndirildi')
                  : toTurkishUppercase('Kimlik Kartını İndir')}
              </button>

              <button
                onClick={handleShareX}
                className="w-full py-5 rounded-2xl bg-white/5 border border-white/10 text-white font-black intelligence-label text-sm hover:bg-white/10 transition-all flex items-center justify-center gap-3"
              >
                <Share2 className="w-5 h-5" />
                {toTurkishUppercase("X'te Paylaş")}
              </button>

              <button
                onClick={onReset}
                className="w-full py-4 rounded-2xl bg-transparent text-slate-500 font-black intelligence-label text-sm hover:text-white transition-all flex items-center justify-center gap-3"
              >
                <RefreshCw className="w-4 h-4" />
                {toTurkishUppercase('Testi Yenile')}
              </button>
            </div>

            {/* Footer note */}
            <button 
              onClick={() => onExplore(mainFactionName)}
              className="p-6 rounded-[2rem] border border-dashed border-white/10 text-center space-y-2 hover:bg-white/[0.02] hover:border-fb-yellow/30 transition-all group w-full"
            >
              <p className="intelligence-label text-slate-500 group-hover:text-fb-yellow transition-colors">
                {toTurkishUppercase('Daha Fazlasını Keşfet')}
              </p>
              <p className="text-sm text-slate-400 leading-relaxed">
                {toTurkishUppercase(
                  'Haritaya dön ve fraksiyonunun evrendeki yerini incele.'
                )}
              </p>
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default ResultScreen;