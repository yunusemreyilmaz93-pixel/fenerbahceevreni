import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cookie, X } from 'lucide-react';

interface CookieConsentBannerProps {
  onNavigate: (view: string) => void;
}

export const CookieConsentBanner: React.FC<CookieConsentBannerProps> = ({ onNavigate }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem('cookieConsent');
      if (!consent) {
        // Delay slight bit for aesthetic entrance
        const timer = setTimeout(() => {
          setIsVisible(true);
        }, 1500);
        return () => clearTimeout(timer);
      }
    } catch (e) {
      console.error("Local storage lookup failed in CookieConsentBanner:", e);
    }
  }, []);

  const handleAcceptAll = () => {
    try {
      localStorage.setItem('cookieConsent', 'all');
    } catch (e) {
      console.error(e);
    }
    setIsVisible(false);
  };

  const handleAcceptEssentialOnly = () => {
    try {
      localStorage.setItem('cookieConsent', 'essential');
    } catch (e) {
      console.error(e);
    }
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:max-w-md z-[100] p-5 rounded-2xl bg-[#090f1f]/95 border border-white/10 shadow-2xl backdrop-blur-md text-left"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2 border-b border-white/[0.06] pb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-fb-yellow/10 border border-fb-yellow/20 flex items-center justify-center text-fb-yellow">
                  <Cookie size={16} />
                </div>
                <h4 className="text-xs font-black text-white uppercase tracking-wider">Çerez Ayarları</h4>
              </div>
              <button 
                onClick={handleAcceptEssentialOnly}
                className="text-fb-muted hover:text-white p-1 rounded-md transition-colors cursor-pointer"
                title="Kapat"
              >
                <X size={14} />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-semibold">
              Deneyimi iyileştirmek ve site kullanımını analiz etmek için çerezler kullanabiliriz. 
              Detaylar için{' '}
              <button
                onClick={() => {
                  onNavigate('cookies');
                  setIsVisible(false);
                }}
                className="text-fb-yellow hover:underline font-black cursor-pointer inline"
              >
                Çerez Politikası’nı
              </button>{' '}
              inceleyebilirsin.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
              <button
                onClick={handleAcceptEssentialOnly}
                className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all border border-white/5 cursor-pointer text-center"
              >
                Zorunlu Çerezlerle Devam Et
              </button>
              <button
                onClick={handleAcceptAll}
                className="px-3 py-2.5 bg-fb-yellow hover:bg-white text-fb-navy text-[10px] font-black uppercase tracking-wider rounded-xl transition-all shadow-[0_4px_12px_rgba(255,210,31,0.15)] cursor-pointer text-center"
              >
                Tümünü Kabul Et
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
export default CookieConsentBanner;
