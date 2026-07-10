import React from 'react';
import { motion } from 'motion/react';
import { CalendarDays, BarChart3, ArrowRight } from 'lucide-react';

interface LeagueStripProps {
  onNavigate: (view: string) => void;
}

const LeagueStrip: React.FC<LeagueStripProps> = ({ onNavigate }) => (
  <section className="py-10 border-y border-[var(--fe-line-subtle)]">
    <div className="fe-container">
      <motion.button
        type="button"
        onClick={() => onNavigate('match-center')}
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        viewport={{ once: true }}
        className="group w-full flex flex-col md:flex-row items-center gap-5 md:gap-8 fe-surface p-5 md:p-6 text-left cursor-pointer hover:border-[var(--fe-yellow-line)] transition-colors relative"
      >
        <div className="absolute left-0 top-4 bottom-4 w-[3px] bg-[var(--fe-yellow-400)] rounded-r-sm opacity-80" />
        <div className="shrink-0 w-20 h-20 rounded-[var(--fe-radius-md)] fe-surface-inset flex items-center justify-center p-2">
          <img
            src="/logos/super-lig.png"
            alt="Trendyol Süper Lig"
            className="w-full h-full object-contain"
          />
        </div>
        <div className="flex-1 space-y-1 text-center md:text-left">
          <span className="text-[11px] fe-data font-medium text-[var(--fe-yellow-400)]">
            2026-27 sezonu
          </span>
          <h2 className="text-xl md:text-2xl font-semibold text-[var(--fe-text-strong)] tracking-tight">
            Trendyol Süper Lig
          </h2>
          <p className="text-[13px] text-[var(--fe-text-muted)] max-w-xl leading-relaxed">
            Fikstür, sonuçlar ve puan durumu — maç merkezinden takip et.
          </p>
        </div>
        <div className="shrink-0 flex flex-col gap-2 w-full md:w-auto">
          <span className="fe-btn-primary !min-h-[40px] pointer-events-none">
            <CalendarDays className="w-4 h-4" /> Fikstür
          </span>
          <span className="fe-btn-secondary !min-h-[40px] pointer-events-none group-hover:border-[var(--fe-yellow-line)]">
            <BarChart3 className="w-4 h-4" /> Puan durumu
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </motion.button>
    </div>
  </section>
);

export default LeagueStrip;
