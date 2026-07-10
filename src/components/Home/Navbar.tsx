import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, Mail, ChevronDown } from 'lucide-react';

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

  useEffect(() => {
    if (!isDropdownOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsDropdownOpen(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [isDropdownOpen]);

  const primaryLinks = [
    { label: 'Ana sayfa', view: 'home' },
    { label: 'Maç merkezi', view: 'match-center' },
    { label: 'Analizler', view: 'analysis' },
    { label: 'Oyuncular', view: 'players' },
    { label: 'Taraftar', view: 'fan-room' },
  ];

  const secondaryLinks = [
    { label: 'Transfer radar', view: 'transfer-radar', desc: 'Scout ve fit skoru' },
    { label: 'Bülten', view: 'bulten', desc: 'Haftalık e-posta' },
    { label: 'Hakkında', view: 'about', desc: 'Bağımsız atlas' },
    { label: 'İletişim', view: 'contact', desc: 'İş birliği' },
  ];

  const handleLinkClick = (view: string) => {
    onNavigate(view);
    if (onScrollToSection) onScrollToSection(view);
    setIsMobileMenuOpen(false);
    setIsDropdownOpen(false);
  };

  const isSecondaryActive = secondaryLinks.some((link) => currentView === link.view);

  return (
    <nav
      aria-label="Ana navigasyon"
      className={`fixed top-0 left-0 w-full z-[100] transition-all duration-300 ${
        isScrolled
          ? 'bg-[#060a12]/92 backdrop-blur-xl py-2.5 border-b border-white/[0.07] shadow-[0_8px_32px_-12px_rgba(0,0,0,0.7)]'
          : 'bg-gradient-to-b from-[#060a12]/85 to-transparent py-4 border-b border-transparent'
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 flex items-center justify-between max-w-7xl">
        <button
          onClick={() => handleLinkClick('home')}
          className="flex items-center gap-2.5 sm:gap-3 group text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fb-yellow focus-visible:ring-offset-2 focus-visible:ring-offset-fb-dark"
          id="nav-logo"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white flex items-center justify-center shadow-[0_0_24px_rgba(255,210,31,0.2)] group-hover:scale-105 transition-transform shrink-0 overflow-hidden p-0.5">
            <img
              src="/fb-evreni-logo.png"
              width={40}
              height={40}
              alt="Fenerbahçe Evreni"
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="font-display font-bold tracking-tight text-[15px] sm:text-base text-white leading-none">
              Fenerbahçe Evreni
            </span>
            <span className="hidden sm:block text-[10px] text-slate-500 font-medium tracking-wide">
              Bağımsız analiz atlası
            </span>
          </div>
        </button>

        <div className="hidden lg:flex items-center lg:gap-0.5 xl:gap-1">
          {primaryLinks.map((link) => (
            <button
              key={link.label}
              id={`nav-link-${link.view}`}
              onClick={() => handleLinkClick(link.view)}
              className={`text-[13px] font-semibold transition-colors relative px-3 py-2 rounded-lg hover:text-white hover:bg-white/[0.04] cursor-pointer ${
                currentView === link.view ? 'text-fb-yellow' : 'text-slate-400'
              }`}
            >
              {link.label}
              {currentView === link.view && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute bottom-0.5 left-3 right-3 h-0.5 bg-fb-yellow rounded-full"
                />
              )}
            </button>
          ))}

          <div
            className="relative"
            onMouseEnter={() => setIsDropdownOpen(true)}
            onMouseLeave={() => setIsDropdownOpen(false)}
          >
            <button
              type="button"
              aria-haspopup="menu"
              aria-expanded={isDropdownOpen}
              onClick={() => setIsDropdownOpen((open) => !open)}
              className={`text-[13px] font-semibold transition-colors py-2 px-3 rounded-lg hover:text-white hover:bg-white/[0.04] flex items-center gap-1 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fb-yellow ${
                isSecondaryActive ? 'text-fb-yellow' : 'text-slate-400'
              }`}
            >
              Diğer
              <ChevronDown
                aria-hidden="true"
                size={12}
                className={`transition-transform duration-250 ${isDropdownOpen ? 'rotate-180 text-fb-yellow' : 'text-slate-500'}`}
              />
            </button>

            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.97 }}
                  role="menu"
                  className="absolute right-0 mt-1.5 w-60 ui-surface rounded-xl p-1.5 overflow-hidden shadow-2xl"
                >
                  <div className="absolute top-0 inset-x-0 h-px ui-hairline opacity-70" />
                  <div className="space-y-0.5 pt-0.5">
                    {secondaryLinks.map((link) => (
                      <button
                        type="button"
                        role="menuitem"
                        key={link.label}
                        onClick={() => handleLinkClick(link.view)}
                        className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors flex flex-col cursor-pointer ${
                          currentView === link.view
                            ? 'bg-fb-yellow/10 text-fb-yellow'
                            : 'hover:bg-white/[0.05] text-slate-200'
                        }`}
                      >
                        <span className="text-[13px] font-semibold leading-tight">{link.label}</span>
                        <span className="text-[11px] text-slate-500 font-medium mt-0.5">{link.desc}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="hidden lg:flex items-center lg:gap-2 xl:gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleLinkClick('bulten')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-fb-yellow/10 hover:bg-fb-yellow text-fb-yellow hover:text-fb-dark text-[12px] font-semibold rounded-lg border border-fb-yellow/25 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fb-yellow focus-visible:ring-offset-2 focus-visible:ring-offset-fb-dark"
          >
            <Mail aria-hidden="true" className="w-3.5 h-3.5" />
            Bülten
          </motion.button>
        </div>

        <button
          type="button"
          aria-label={isMobileMenuOpen ? 'Menüyü kapat' : 'Menüyü aç'}
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center text-white border border-white/[0.07] cursor-pointer hover:bg-white/[0.08] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fb-yellow focus-visible:ring-offset-2 focus-visible:ring-offset-fb-dark"
        >
          {isMobileMenuOpen ? <X size={18} aria-hidden="true" /> : <Menu size={18} aria-hidden="true" />}
        </button>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            id="mobile-navigation"
            role="menu"
            className="lg:hidden bg-[#060a12]/98 backdrop-blur-2xl border-b border-white/[0.08] overflow-hidden"
          >
            <div className="container mx-auto px-6 py-5 flex flex-col gap-1">
              {[...primaryLinks, ...secondaryLinks].map((link) => (
                <button
                  key={link.label}
                  type="button"
                  role="menuitem"
                  onClick={() => handleLinkClick(link.view)}
                  className={`text-left text-sm font-semibold py-3 px-3 rounded-lg border-b border-white/[0.04] last:border-0 cursor-pointer transition-colors ${
                    currentView === link.view
                      ? 'text-fb-yellow bg-fb-yellow/[0.06]'
                      : 'text-slate-300 hover:text-white hover:bg-white/[0.03]'
                  }`}
                >
                  {link.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => handleLinkClick('bulten')}
                className="mt-3 flex items-center justify-center gap-2 py-3 rounded-xl bg-fb-yellow text-fb-dark text-sm font-bold cursor-pointer"
              >
                <Mail className="w-4 h-4" aria-hidden />
                Bültene abone ol
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
