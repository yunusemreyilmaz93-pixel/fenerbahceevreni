import React from 'react';
import { Instagram, Twitter, Youtube, ShieldAlert } from 'lucide-react';

interface FooterProps {
  onNavigate?: (view: string) => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="relative z-20 pt-20 pb-10 border-t border-white/[0.06] bg-[#050810]">
      <div className="absolute top-0 inset-x-0 h-px ui-hairline opacity-50" />
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-14">
          <div className="lg:col-span-2 space-y-5 text-left">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-[0_0_20px_rgba(255,210,31,0.22)] overflow-hidden p-0.5">
                <img
                  loading="lazy"
                  src="/fb-evreni-logo.png"
                  alt="Fenerbahçe Evreni"
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <span className="font-display font-bold tracking-tight text-lg text-white block leading-tight">
                  Fenerbahçe Evreni
                </span>
                <span className="text-[11px] text-slate-500 font-medium">Bağımsız analiz atlası</span>
              </div>
            </div>

            <p className="text-slate-400 text-[13px] leading-relaxed max-w-sm font-medium">
              Fenerbahçe taraftar ve analiz dünyasını modern metrikler, scout raporları ve
              interaktif haritalarla bir araya getiren bağımsız futbol medyası.
            </p>

            <div className="flex gap-2.5">
              {[
                { href: 'https://x.com/BasitBiOyun', icon: Twitter, label: 'X / Twitter' },
                {
                  href: 'https://instagram.com/fenerbahceevreni',
                  icon: Instagram,
                  label: 'Instagram',
                },
                {
                  href: 'https://www.youtube.com/@fenerbahcevreni',
                  icon: Youtube,
                  label: 'YouTube',
                },
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-xl bg-white/[0.03] hover:bg-fb-yellow hover:text-fb-dark flex items-center justify-center text-slate-400 transition-all border border-white/[0.07]"
                  title={s.label}
                  aria-label={s.label}
                >
                  <s.icon size={16} />
                </a>
              ))}
            </div>
          </div>

          <div className="text-left">
            <h4 className="text-[12px] font-semibold tracking-wide text-white mb-5">Platform</h4>
            <ul className="space-y-3 text-[13px] text-slate-400 font-medium">
              {[
                { label: 'Ana sayfa', view: 'home' },
                { label: 'Hakkında', view: 'about' },
                { label: 'Analizler', view: 'analysis' },
                { label: 'Maç merkezi', view: 'match-center' },
                { label: 'Transfer radar', view: 'transfer-radar' },
              ].map((item) => (
                <li key={item.view}>
                  <button
                    type="button"
                    onClick={() => onNavigate?.(item.view)}
                    className="hover:text-fb-yellow transition-colors cursor-pointer"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="text-left">
            <h4 className="text-[12px] font-semibold tracking-wide text-white mb-5">Topluluk</h4>
            <ul className="space-y-3 text-[13px] text-slate-400 font-medium">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate?.('fan-room')}
                  className="hover:text-fb-yellow transition-colors cursor-pointer"
                >
                  Taraftar odası
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate?.('bulten')}
                  className="hover:text-fb-yellow transition-colors cursor-pointer"
                >
                  Bülten
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate?.('players')}
                  className="hover:text-fb-yellow transition-colors cursor-pointer"
                >
                  Oyuncular
                </button>
              </li>
            </ul>
          </div>

          <div className="text-left">
            <h4 className="text-[12px] font-semibold tracking-wide text-white mb-5">Yasal</h4>
            <ul className="space-y-3 text-[13px] text-slate-400 font-medium">
              {[
                { label: 'Gizlilik politikası', view: 'privacy' },
                { label: 'Kullanım şartları', view: 'terms' },
                { label: 'Çerez politikası', view: 'cookies' },
                { label: 'KVKK aydınlatma', view: 'kvkk' },
              ].map((item) => (
                <li key={item.view}>
                  <button
                    type="button"
                    onClick={() => onNavigate?.(item.view)}
                    className="hover:text-fb-yellow transition-colors cursor-pointer"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-7 border-t border-white/[0.06] flex flex-col md:flex-row justify-between items-center gap-5">
          <div className="flex flex-col md:flex-row items-center gap-3.5 text-center md:text-left">
            <div className="flex items-center gap-2 shrink-0">
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center p-0.5 shadow-[0_0_15px_rgba(255,210,31,0.18)] overflow-hidden">
                <img
                  loading="lazy"
                  src="/fb-evreni-logo.png"
                  alt=""
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                <ShieldAlert className="w-4 h-4" aria-hidden />
              </div>
            </div>
            <p className="text-[11px] md:text-[12px] text-slate-500 max-w-xl leading-relaxed font-medium">
              Fenerbahçe Evreni, bağımsız bir taraftar ve analiz platformudur. Fenerbahçe Spor
              Kulübü ile resmî bir bağı yoktur.
            </p>
          </div>

          <div className="text-right shrink-0 flex flex-col items-center md:items-end gap-2">
            <span className="text-[11px] text-slate-500 font-medium">
              © 2026 Fenerbahçe Evreni. Tüm hakları saklıdır.
            </span>
            <button
              type="button"
              onClick={() => onNavigate?.('admin-login')}
              className="text-[11px] text-fb-yellow/50 hover:text-fb-yellow font-medium transition-colors cursor-pointer"
            >
              Yönetici girişi
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
