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
    const handleScroll = () => setIsScrolled(window.scrollY > 40);
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

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const primaryLinks = [
    { label: 'Ana sayfa', view: 'home' },
    { label: 'Maç merkezi', view: 'match-center' },
    { label: 'Analizler', view: 'analysis' },
    { label: 'Oyuncular', view: 'players' },
    { label: 'Taraftar', view: 'fan-room' },
  ];

  const secondaryLinks = [
    { label: 'Transfer radar', view: 'transfer-radar', desc: 'Scout dosyası' },
    { label: 'Bülten', view: 'bulten', desc: 'Haftalık özet' },
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
      className={`fixed top-0 left-0 w-full z-[100] transition-all duration-200 ${
        isScrolled
          ? 'bg-[var(--fe-ink-950)]/95 border-b border-[var(--fe-line-subtle)] py-2.5'
          : 'bg-[var(--fe-ink-950)]/80 border-b border-transparent py-3.5'
      }`}
    >
      <div className="fe-container flex items-center justify-between max-w-[var(--fe-container)]">
        <button
          type="button"
          onClick={() => handleLinkClick('home')}
          className="flex items-center gap-2.5 group text-left cursor-pointer"
          id="nav-logo"
        >
          <div className="w-9 h-9 rounded-[var(--fe-radius-sm)] bg-white flex items-center justify-center shrink-0 overflow-hidden p-0.5">
            <img
              src="/fb-evreni-logo.png"
              width={36}
              height={36}
              alt="Fenerbahçe Evreni"
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="flex flex-col gap-0">
            <span className="font-semibold tracking-tight text-[15px] text-[var(--fe-text-strong)] leading-none">
              Fenerbahçe Evreni
            </span>
            <span className="hidden sm:block text-[11px] text-[var(--fe-text-faint)] font-medium mt-0.5">
              Bağımsız yayın
            </span>
          </div>
        </button>

        <div className="hidden lg:flex items-center gap-0.5">
          {primaryLinks.map((link) => (
            <button
              key={link.label}
              id={`nav-link-${link.view}`}
              type="button"
              onClick={() => handleLinkClick(link.view)}
              className={`relative text-[13px] font-medium transition-colors px-3 py-2 rounded-[var(--fe-radius-xs)] hover:text-[var(--fe-text-strong)] cursor-pointer ${
                currentView === link.view
                  ? 'text-[var(--fe-yellow-400)]'
                  : 'text-[var(--fe-text-muted)]'
              }`}
            >
              {link.label}
              {currentView === link.view && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute bottom-0.5 left-3 right-3 h-[2px] bg-[var(--fe-yellow-400)] rounded-full"
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
              className={`text-[13px] font-medium py-2 px-3 rounded-[var(--fe-radius-xs)] flex items-center gap-1 cursor-pointer ${
                isSecondaryActive
                  ? 'text-[var(--fe-yellow-400)]'
                  : 'text-[var(--fe-text-muted)] hover:text-[var(--fe-text-strong)]'
              }`}
            >
              Diğer
              <ChevronDown
                aria-hidden
                size={12}
                className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
              />
            </button>

            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={{ duration: 0.15 }}
                  role="menu"
                  className="absolute right-0 mt-1 w-56 fe-surface-raised p-1.5 z-50"
                >
                  {secondaryLinks.map((link) => (
                    <button
                      type="button"
                      role="menuitem"
                      key={link.label}
                      onClick={() => handleLinkClick(link.view)}
                      className={`w-full text-left px-3 py-2.5 rounded-[var(--fe-radius-sm)] flex flex-col cursor-pointer ${
                        currentView === link.view
                          ? 'bg-[var(--fe-yellow-soft)] text-[var(--fe-yellow-400)]'
                          : 'hover:bg-white/[0.04] text-[var(--fe-text)]'
                      }`}
                    >
                      <span className="text-[13px] font-medium">{link.label}</span>
                      <span className="text-[11px] text-[var(--fe-text-faint)] mt-0.5">
                        {link.desc}
                      </span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleLinkClick('bulten')}
            className="fe-btn-secondary !min-h-[40px] !px-3.5 !text-[12px] gap-1.5"
          >
            <Mail className="w-3.5 h-3.5" aria-hidden />
            Bülten
          </button>
        </div>

        <button
          type="button"
          aria-label={isMobileMenuOpen ? 'Menüyü kapat' : 'Menüyü aç'}
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden w-11 h-11 rounded-[var(--fe-radius-sm)] border border-[var(--fe-line-subtle)] flex items-center justify-center text-[var(--fe-text-strong)] cursor-pointer"
        >
          {isMobileMenuOpen ? <X size={18} aria-hidden /> : <Menu size={18} aria-hidden />}
        </button>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            id="mobile-navigation"
            role="menu"
            className="lg:hidden fixed inset-x-0 top-[57px] bottom-0 bg-[var(--fe-ink-950)] border-t border-[var(--fe-line-subtle)] overflow-y-auto"
          >
            <div className="fe-container py-5 flex flex-col gap-0.5">
              {[...primaryLinks, ...secondaryLinks].map((link) => (
                <button
                  key={link.label}
                  type="button"
                  role="menuitem"
                  onClick={() => handleLinkClick(link.view)}
                  className={`text-left text-[15px] font-medium py-3.5 px-3 rounded-[var(--fe-radius-sm)] min-h-[44px] cursor-pointer ${
                    currentView === link.view
                      ? 'text-[var(--fe-yellow-400)] bg-[var(--fe-yellow-soft)]'
                      : 'text-[var(--fe-text)]'
                  }`}
                >
                  {link.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => handleLinkClick('bulten')}
                className="fe-btn-primary mt-4 w-full"
              >
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
