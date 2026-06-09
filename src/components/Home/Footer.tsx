import React from 'react';
import { motion } from 'motion/react';
import { Instagram, Twitter, Youtube, ShieldAlert } from 'lucide-react';

interface FooterProps {
  onNavigate?: (view: string) => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-fb-dark pt-24 pb-12 border-t border-white/[0.06] relative z-20">
      <div className="container mx-auto px-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Logo & disclaimer brief */}
          <div className="lg:col-span-2 space-y-6 text-left">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-fb-yellow flex items-center justify-center">
                <span className="text-fb-navy font-black text-xl italic font-display">FE</span>
              </div>
              <span className="font-display font-black tracking-tight text-xl text-white">FENERBAHÇE EVRENİ</span>
            </div>
            
            <p className="text-fb-muted text-xs leading-relaxed max-w-sm font-semibold">
              Fenerbahçe taraftar ve analiz dünyasını modern metrikler, scout raporları ve eğlenceli interaktif haritalarla bir araya getiren bağımsız futbol medyası.
            </p>

            <div className="flex gap-3">
              {[Twitter, Instagram, Youtube].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 hover:bg-fb-yellow hover:text-fb-navy transition-all border border-white/5">
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Column 1: Platform */}
          <div className="text-left">
            <h4 className="text-[11px] font-black uppercase tracking-widest text-white mb-6">PLATFORM</h4>
            <ul className="space-y-3.5 text-xs text-fb-muted font-bold">
              <li>
                <button onClick={() => onNavigate && onNavigate('home')} className="hover:text-fb-yellow transition-colors cursor-pointer">
                  Ana Sayfa
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate && onNavigate('about')} className="hover:text-fb-yellow transition-colors cursor-pointer">
                  Hakkında
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate && onNavigate('analysis')} className="hover:text-fb-yellow transition-colors cursor-pointer">
                  Analizler
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate && onNavigate('match-center')} className="hover:text-fb-yellow transition-colors cursor-pointer">
                  Maç Merkezi
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate && onNavigate('transfer-radar')} className="hover:text-fb-yellow transition-colors cursor-pointer">
                  Transfer Radar
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate && onNavigate('contact')} className="hover:text-fb-yellow transition-colors cursor-pointer">
                  İletişim
                </button>
              </li>
            </ul>
          </div>

          {/* Column 2: Topluluk */}
          <div className="text-left">
            <h4 className="text-[11px] font-black uppercase tracking-widest text-white mb-6">TOPLULUK</h4>
            <ul className="space-y-3.5 text-xs text-fb-muted font-bold">
              <li>
                <button onClick={() => onNavigate && onNavigate('fan-room')} className="hover:text-fb-yellow transition-colors cursor-pointer">
                  Taraftar Odası
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate && onNavigate('bulten')} 
                  className="hover:text-fb-yellow transition-colors cursor-pointer"
                >
                  Bülten
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate && onNavigate('premium')} className="hover:text-fb-yellow transition-colors cursor-pointer">
                  Premium
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Legal pages links */}
        <div className="pt-8 border-t border-white/[0.06] flex flex-wrap justify-start gap-x-6 gap-y-2 mb-4">
          <button 
            onClick={() => onNavigate && onNavigate('privacy')} 
            className="text-[10px] text-fb-muted hover:text-fb-yellow transition-colors font-black uppercase tracking-widest cursor-pointer"
          >
            Gizlilik Politikası
          </button>
          <button 
            onClick={() => onNavigate && onNavigate('terms')} 
            className="text-[10px] text-fb-muted hover:text-fb-yellow transition-colors font-black uppercase tracking-widest cursor-pointer"
          >
            Kullanım Şartları
          </button>
          <button 
            onClick={() => onNavigate && onNavigate('cookies')} 
            className="text-[10px] text-fb-muted hover:text-fb-yellow transition-colors font-black uppercase tracking-widest cursor-pointer"
          >
            Çerez Politikası
          </button>
          <button 
            onClick={() => onNavigate && onNavigate('kvkk')} 
            className="text-[10px] text-fb-muted hover:text-fb-yellow transition-colors font-black uppercase tracking-widest cursor-pointer"
          >
            KVKK Aydınlatma Metni
          </button>
        </div>

        {/* Brand new disclaimer required */}
        <div className="pt-4 pb-4 border-t border-white/[0.06] flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col md:flex-row items-center gap-3 text-center md:text-left">
            <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <p className="text-[10px] md:text-xs text-fb-muted max-w-xl leading-relaxed font-semibold">
              Fenerbahçe Evreni, bağımsız bir taraftar ve analiz platformudur. Fenerbahçe Spor Kulübü ile resmî bir bağı yoktur.
            </p>
          </div>
          <div className="text-right shrink-0 flex flex-col items-end gap-2">
            <span className="text-[10px] text-fb-muted font-black uppercase tracking-widest">
              © 2026 FENERBAHÇE EVRENİ. TÜM HAKLARI SAKLIDIR.
            </span>
            <button
              onClick={() => onNavigate && onNavigate('admin-login')}
              className="text-[9px] text-fb-yellow/40 hover:text-fb-yellow font-bold uppercase tracking-widest transition-colors flex items-center gap-1 cursor-pointer"
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
