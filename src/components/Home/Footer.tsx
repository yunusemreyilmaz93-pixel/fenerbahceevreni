import React from 'react';
import { Instagram, Twitter, Youtube, ShieldAlert } from 'lucide-react';

interface FooterProps {
  onNavigate?: (view: string) => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="relative z-20 pt-16 pb-10 border-t border-[var(--fe-line-subtle)] bg-[var(--fe-ink-1000)]">
      <div className="fe-container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          <div className="lg:col-span-2 space-y-4 text-left">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-[var(--fe-radius-sm)] bg-white flex items-center justify-center overflow-hidden p-0.5">
                <img
                  loading="lazy"
                  src="/fb-evreni-logo.png"
                  alt="Fenerbahçe Evreni"
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <span className="font-semibold tracking-tight text-base text-[var(--fe-text-strong)] block leading-tight">
                  Fenerbahçe Evreni
                </span>
                <span className="text-[11px] text-[var(--fe-text-faint)]">Bağımsız yayın</span>
              </div>
            </div>
            <p className="text-[var(--fe-text-muted)] text-[13px] leading-relaxed max-w-sm">
              Kadıköy gecesinin netliği: maç verisi, editoryal analiz ve taraftar nabzı — kaynak
              etiketli, uydurma skor yok.
            </p>
            <div className="flex gap-2">
              {[
                { href: 'https://x.com/BasitBiOyun', icon: Twitter, label: 'X' },
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
                  className="w-10 h-10 rounded-[var(--fe-radius-sm)] border border-[var(--fe-line-subtle)] flex items-center justify-center text-[var(--fe-text-muted)] hover:border-[var(--fe-yellow-line)] hover:text-[var(--fe-yellow-400)] transition-colors"
                  aria-label={s.label}
                >
                  <s.icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {[
            {
              title: 'Platform',
              items: [
                { label: 'Ana sayfa', view: 'home' },
                { label: 'Analizler', view: 'analysis' },
                { label: 'Maç merkezi', view: 'match-center' },
                { label: 'Transfer radar', view: 'transfer-radar' },
                { label: 'Hakkında', view: 'about' },
              ],
            },
            {
              title: 'Topluluk',
              items: [
                { label: 'Taraftar odası', view: 'fan-room' },
                { label: 'Bülten', view: 'bulten' },
                { label: 'Oyuncular', view: 'players' },
              ],
            },
            {
              title: 'Yasal',
              items: [
                { label: 'Gizlilik', view: 'privacy' },
                { label: 'Kullanım şartları', view: 'terms' },
                { label: 'Çerezler', view: 'cookies' },
                { label: 'KVKK', view: 'kvkk' },
              ],
            },
          ].map((col) => (
            <div key={col.title} className="text-left">
              <h4 className="text-[12px] fe-data font-medium text-[var(--fe-text-faint)] mb-4 tracking-wide uppercase">
                {col.title}
              </h4>
              <ul className="space-y-2.5">
                {col.items.map((item) => (
                  <li key={item.view}>
                    <button
                      type="button"
                      onClick={() => onNavigate?.(item.view)}
                      className="text-[13px] font-medium text-[var(--fe-text-muted)] hover:text-[var(--fe-yellow-400)] transition-colors cursor-pointer"
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-6 border-t border-[var(--fe-line-subtle)] flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2.5 text-center md:text-left">
            <ShieldAlert className="w-4 h-4 text-[var(--fe-warning)] shrink-0" aria-hidden />
            <p className="text-[11px] text-[var(--fe-text-faint)] max-w-xl leading-relaxed">
              Bağımsız taraftar ve analiz platformudur. Fenerbahçe Spor Kulübü ile resmî bağı
              yoktur.
            </p>
          </div>
          <div className="flex flex-col items-center md:items-end gap-1.5">
            <span className="text-[11px] text-[var(--fe-text-faint)] fe-data">
              © 2026 Fenerbahçe Evreni
            </span>
            <button
              type="button"
              onClick={() => onNavigate?.('admin-login')}
              className="text-[11px] text-[var(--fe-text-faint)] hover:text-[var(--fe-yellow-400)] transition-colors cursor-pointer"
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
