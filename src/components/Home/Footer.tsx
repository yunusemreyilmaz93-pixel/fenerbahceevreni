import React from 'react';
import { motion } from 'motion/react';
import { Instagram, Twitter, Youtube, ShieldAlert } from 'lucide-react';

interface FooterProps {
  onNavigate?: (view: string) => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-[#0B0F19] pt-24 pb-12 border-t border-white/[0.04] relative z-20">
      <div className="container mx-auto px-6 max-w-7xl">
        
        {/* Symmetric Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          
          {/* Logo & disclaimer brief */}
          <div className="lg:col-span-2 space-y-6 text-left">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FFD21F] flex items-center justify-center">
                <span className="text-[#0B0F19] font-black text-xl italic font-display">FE</span>
              </div>
              <span className="font-display font-black tracking-tight text-xl text-white">FENERBAHÇE EVRENİ</span>
            </div>
            
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm font-semibold">
              Fenerbahçe taraftar ve analiz dünyasını modern metrikler, scout raporları ve eğlenceli interaktif haritalarla bir araya getiren bağımsız futbol medyası.
            </p>

            <div className="flex gap-3">
              {[Twitter, Instagram, Youtube].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-xl bg-white/[0.03] hover:bg-[#FFD21F] hover:text-[#0B0F19] flex items-center justify-center text-slate-400 transition-all border border-white/[0.05]">
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Column 1: Platform */}
          <div className="text-left">
            <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-white mb-6 font-mono">PLATFORM</h4>
            <ul className="space-y-3.5 text-xs text-slate-400 font-bold">
              <li>
                <button onClick={() => onNavigate && onNavigate('home')} className="hover:text-[#FFD21F] transition-colors cursor-pointer">
                  Ana Sayfa
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate && onNavigate('about')} className="hover:text-[#FFD21F] transition-colors cursor-pointer">
                  Hakkında
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate && onNavigate('analysis')} className="hover:text-[#FFD21F] transition-colors cursor-pointer">
                  Analizler
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate && onNavigate('match-center')} className="hover:text-[#FFD21F] transition-colors cursor-pointer">
                  Maç Merkezi
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate && onNavigate('transfer-radar')} className="hover:text-[#FFD21F] transition-colors cursor-pointer">
                  Transfer Radar
                </button>
              </li>
            </ul>
          </div>

          {/* Column 2: Topluluk */}
          <div className="text-left">
            <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-white mb-6 font-mono">TOPLULUK</h4>
            <ul className="space-y-3.5 text-xs text-slate-400 font-bold">
              <li>
                <button onClick={() => onNavigate && onNavigate('fan-room')} className="hover:text-[#FFD21F] transition-colors cursor-pointer">
                  Taraftar Odası
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate && onNavigate('bulten')} 
                  className="hover:text-[#FFD21F] transition-colors cursor-pointer"
                >
                  Bülten
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate && onNavigate('premium')} className="hover:text-[#FFD21F] transition-colors cursor-pointer">
                  Premium Portal
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Yasal */}
          <div className="text-left">
            <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-white mb-6 font-mono">YASAL</h4>
            <ul className="space-y-3.5 text-xs text-slate-400 font-bold">
              <li>
                <button onClick={() => onNavigate && onNavigate('privacy')} className="hover:text-[#FFD21F] transition-colors cursor-pointer">
                  Gizlilik Politikası
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate && onNavigate('terms')} className="hover:text-[#FFD21F] transition-colors cursor-pointer">
                  Kullanım Şartları
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate && onNavigate('cookies')} className="hover:text-[#FFD21F] transition-colors cursor-pointer">
                  Çerez Politikası
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate && onNavigate('kvkk')} className="hover:text-[#FFD21F] transition-colors cursor-pointer">
                  KVKK Aydınlatma Metni
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Brand new disclaimer required */}
        <div className="pt-8 border-t border-white/[0.04] flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col md:flex-row items-center gap-3 text-center md:text-left">
            <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <p className="text-[10px] md:text-xs text-slate-400 max-w-xl leading-relaxed font-semibold">
              Fenerbahçe Evreni, bağımsız bir taraftar ve analiz platformudur. Fenerbahçe Spor Kulübü ile resmî bir bağı yoktur.
            </p>
          </div>
          
          <div className="text-right shrink-0 flex flex-col items-end gap-2.5">
            <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest font-mono">
              © 2026 FENERBAHÇE EVRENİ. TÜM HAKLARI SAKLIDIR.
            </span>
            <button
              onClick={() => onNavigate && onNavigate('admin-login')}
              className="text-[9px] text-[#FFD21F]/40 hover:text-[#FFD21F] font-black uppercase tracking-widest transition-colors flex items-center gap-1 cursor-pointer font-mono"
            >
              🔐 Yönetici Girişi
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
