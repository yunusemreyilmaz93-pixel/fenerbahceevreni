
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, Zap, Map } from 'lucide-react';
import { toTurkishUppercase } from '../../lib/stringUtils';

interface NavbarProps {
  onNavigate: (view: 'home' | 'universe' | 'match-center' | 'news' | 'predictor') => void;
  onStartQuiz: () => void;
  currentView: 'home' | 'universe' | 'match-center' | 'news' | 'predictor';
}

const Navbar: React.FC<NavbarProps> = ({ onNavigate, onStartQuiz, currentView }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'ANA SAYFA', view: 'home' as const },
    { label: 'EVREN HARİTASI', view: 'universe' as const },
    { label: 'MAÇ MERKEZİ', view: 'match-center' as const },
    { label: 'ŞAMPİYONLUK YOLU', view: 'predictor' as const },
    { label: 'HABERLER', view: 'news' as const },
  ];

  return (
    <nav className={`fixed top-0 left-0 w-full z-[100] transition-all duration-500 ${
      isScrolled ? 'bg-fb-dark/80 backdrop-blur-xl py-4 border-b border-white/5' : 'bg-transparent py-8'
    }`}>
      <div className="container mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <button 
          onClick={() => onNavigate('home')}
          className="flex items-center gap-3 group"
        >
          <div className="w-10 h-10 rounded-xl bg-fb-yellow flex items-center justify-center shadow-[0_0_20px_rgba(254,221,0,0.3)] group-hover:scale-110 transition-transform">
            <img src="https://upload.wikimedia.org/wikipedia/tr/f/ff/Fenerbah%C3%A7e_SK.png" alt="FB" className="w-6 h-6 object-contain" />
          </div>
          <span className="galaxy-title text-xl fb-gradient-text hidden md:block">FENERBAHÇE EVRENİ</span>
        </button>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-10">
          {navLinks.map((link) => (
            <button
              key={link.label}
              onClick={() => link.view && onNavigate(link.view)}
              className={`text-[11px] font-black tracking-[0.2em] transition-all hover:text-fb-yellow ${
                currentView === link.view ? 'text-fb-yellow' : 'text-slate-400'
              }`}
            >
              {link.label}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onStartQuiz}
            className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-fb-yellow text-fb-navy text-[11px] font-black rounded-full shadow-[0_0_20px_rgba(254,221,0,0.2)]"
          >
            <Zap className="w-4 h-4 fill-current" />
            FRAKSİYONUNU BUL
          </motion.button>

          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-fb-dark border-b border-white/5 overflow-hidden"
          >
            <div className="container mx-auto px-6 py-8 flex flex-col gap-6">
              {navLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={() => {
                    link.view && onNavigate(link.view);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`text-left text-lg font-black tracking-widest ${
                    currentView === link.view ? 'text-fb-yellow' : 'text-slate-400'
                  }`}
                >
                  {link.label}
                </button>
              ))}
              <button
                onClick={() => {
                  onStartQuiz();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full py-4 bg-fb-yellow text-fb-navy font-black rounded-2xl flex items-center justify-center gap-2"
              >
                <Zap className="w-5 h-5 fill-current" />
                FRAKSİYONUNU BUL
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
