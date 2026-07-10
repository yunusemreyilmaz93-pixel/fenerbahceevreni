import React from 'react';
import { motion } from 'motion/react';
import { CalendarDays, BarChart3, ArrowRight } from 'lucide-react';

interface LeagueStripProps {
  onNavigate: (view: string) => void;
}

/**
 * Trendyol Süper Lig giriş kartı — maç merkezi yönlendirmesi.
 */
const LeagueStrip: React.FC<LeagueStripProps> = ({ onNavigate }) => (
  <section className="py-12 border-y border-white/[0.05]">
    <div className="container mx-auto px-6 max-w-7xl">
      <motion.button
        type="button"
        onClick={() => onNavigate('match-center')}
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        className="group w-full flex flex-col md:flex-row items-center gap-6 md:gap-8 rounded-2xl ui-surface ui-surface-hover p-6 md:p-8 text-left cursor-pointer relative overflow-hidden"
      >
        <div className="absolute top-0 inset-x-0 h-px ui-hairline opacity-60" />

        <div className="shrink-0 w-24 h-24 md:w-28 md:h-28 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center p-3">
          <img
            src="/logos/super-lig.png"
            alt="Trendyol Süper Lig"
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
          />
        </div>

        <div className="flex-1 space-y-2 text-center md:text-left">
          <span className="text-[11px] font-semibold tracking-wide text-fb-yellow block">
            2026-27 sezonu
          </span>
          <h2 className="text-2xl md:text-3xl font-display font-bold text-white tracking-tight leading-none">
            Trendyol Süper Lig
          </h2>
          <p className="text-[13px] text-slate-400 font-medium leading-relaxed max-w-xl">
            Fenerbahçe&apos;nin fikstürü, maç sonuçları ve güncel puan durumu tek merkezde. Maç
            Merkezi&apos;nden tüm sezonu takip et.
          </p>
        </div>

        <div className="shrink-0 flex flex-col gap-2.5 w-full md:w-auto">
          <span className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-fb-yellow text-fb-dark text-[13px] font-bold group-hover:bg-white transition-colors">
            <CalendarDays className="w-4 h-4" /> Fikstür
          </span>
          <span className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-300 text-[13px] font-semibold group-hover:text-fb-yellow transition-colors">
            <BarChart3 className="w-4 h-4" /> Puan durumu
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </motion.button>
    </div>
  </section>
);

export default LeagueStrip;
