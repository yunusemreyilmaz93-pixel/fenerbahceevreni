import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, ArrowRight, ShieldCheck, Mail, ChevronDown } from 'lucide-react';
import { toTurkishUppercase } from '../../lib/stringUtils';

interface NavbarProps {
  onNavigate: (view: any) => void;
  currentView: string;
  onScrollToSection?: (sectionId: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ onNavigate, currentView, onScrollToSection }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Primary top-level links for a cleaner look
  const primaryLinks = [
    { label: 'ANA SAYFA', view: 'home' },
    { label: 'MAÇ MERKEZİ', view: 'match-center' },
    { label: 'ANALİZLER', view: 'analysis' },
    { label: 'TRANSFER RADAR', view: 'transfer-radar' },
    { label: 'OYUNCULAR', view: 'players' },
    { label: 'TARAFTAR ODASI', view: 'fan-room' },
  ];

  // Secondary overflowing items grouped under "DİĞER" dropdown
  const secondaryLinks = [
    { label: 'BÜLTEN', view: 'bulten', desc: 'E-Posta Analiz Gazetesi' },
    { label: 'HAKKINDA', view: 'about', desc: 'Evrenin Hikayesi ve Ekip' },
    { label: 'İLETİŞİM', view: 'contact', desc: 'Analiz İstek ve Ortaklık' },
  ];

  const handleLinkClick = (view: string) => {
    onNavigate(view);
    if (onScrollToSection) onScrollToSection(view);
    setIsMobileMenuOpen(false);
    setIsDropdownOpen(false);
  };

  const isSecondaryActive = secondaryLinks.some(link => currentView === link.view);

  return (
    <nav className={`fixed top-0 left-0 w-full z-[100] transition-all duration-500 ${
      isScrolled ? 'bg-fb-dark/95 backdrop-blur-md py-3.5 border-b border-white/[0.08]' : 'bg-transparent py-5'
    }`}>
      <div className="container mx-auto px-4 sm:px-6 flex items-center justify-between">
        {/* Logo and Brand */}
        <button 
          onClick={() => handleLinkClick('home')}
          className="flex items-center gap-2 sm:gap-3 group text-left cursor-pointer"
          id="nav-logo"
        >
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white flex items-center justify-center shadow-[0_0_20px_rgba(255,210,31,0.25)] group-hover:scale-105 transition-transform shrink-0 overflow-hidden p-0.5">
            <img 
              src="/fb-evreni-logo.png" 
              alt="FE Logo" 
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-display font-black tracking-tight text-base sm:text-lg text-white leading-none">FENERBAHÇE EVRENİ</span>
          </div>
        </button>

        {/* Desktop & Tablet-Landscape Nav */}
        <div className="hidden lg:flex items-center lg:gap-4 xl:gap-6">
          {primaryLinks.map((link) => (
            <button
              key={link.label}
              id={`nav-link-${link.view}`}
              onClick={() => handleLinkClick(link.view)}
              className={`text-[10px] xl:text-[11px] font-black tracking-[0.12em] xl:tracking-[0.15em] transition-all relative py-2 uppercase hover:text-fb-yellow cursor-pointer ${
                currentView === link.view ? 'text-fb-yellow font-black' : 'text-slate-400'
              }`}
            >
              {link.label}
              {currentView === link.view && (
                <motion.div 
                   layoutId="activeIndicator"
                  className="absolute bottom-0 left-1 right-1 h-0.5 bg-fb-yellow rounded-full" 
                />
              )}
            </button>
          ))}

          {/* DİĞER Dropdown */}
          <div 
            className="relative"
            onMouseEnter={() => setIsDropdownOpen(true)}
            onMouseLeave={() => setIsDropdownOpen(false)}
          >
            <button
              className={`text-[10px] xl:text-[11px] font-black tracking-[0.12em] xl:tracking-[0.15em] transition-all py-2 uppercase hover:text-fb-yellow flex items-center gap-1 cursor-pointer ${
                isSecondaryActive ? 'text-fb-yellow' : 'text-slate-400'
              }`}
            >
              DİĞER
              <ChevronDown size={12} className={`transition-transform duration-250 ${isDropdownOpen ? 'rotate-180 text-fb-yellow' : 'text-slate-500'}`} />
            </button>

            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-1 w-56 bg-fb-dark/95 border border-white/10 rounded-xl shadow-2xl backdrop-blur-xl p-2.5 overflow-hidden"
                >
                  <div className="space-y-1">
                    {secondaryLinks.map((link) => (
                      <button
                        key={link.label}
                        onClick={() => handleLinkClick(link.view)}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex flex-col cursor-pointer ${
                          currentView === link.view ? 'bg-fb-yellow/10 text-fb-yellow' : 'hover:bg-white/5 text-slate-300'
                        }`}
                      >
                        <span className="text-[10px] font-black uppercase tracking-wider">{link.label}</span>
                        <span className="text-[9px] text-slate-500 font-semibold mt-0.5">{link.desc}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Action Controls */}
        <div className="hidden lg:flex items-center lg:gap-2 xl:gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleLinkClick('bulten')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white/5 hover:bg-white/10 text-white text-[10px] xl:text-[11px] font-black rounded-lg border border-white/10 transition-all uppercase cursor-pointer"
          >
            <Mail className="w-3.5 h-3.5 text-fb-yellow" />
            BÜLTEN
          </motion.button>
        </div>

        {/* Mobile & Tablet-Portrait Navigation Toggle */}
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white border border-white/5 cursor-pointer hover:bg-white/10 transition-colors"
        >
          {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="lg:hidden bg-fb-dark/98 backdrop-blur-2xl border-b border-white/[0.08] overflow-hidden"
          >
            <div className="container mx-auto px-6 py-6 flex flex-col gap-3">
              {/* Combine both sets of links for an exhaustive list */}
              {[...primaryLinks, ...secondaryLinks].map((link) => (
                <button
                  key={link.label}
                  onClick={() => handleLinkClick(link.view)}
                  className={`text-left text-xs font-black tracking-widest py-2.5 border-b border-white/5 cursor-pointer transition-colors ${
                    currentView === link.view ? 'text-fb-yellow' : 'text-slate-400'
                  }`}
                >
                  {link.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
