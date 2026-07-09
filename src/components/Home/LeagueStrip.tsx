import React from 'react';
import { motion } from 'motion/react';
import { CalendarDays, BarChart3, ArrowRight } from 'lucide-react';

interface LeagueStripProps {
  onNavigate: (view: string) => void;
}

/**
 * Trendyol Süper Lig giriş kartı. 18 takım şeridi yerine — Fenerbahçe odaklı platformda
 * gerekmediği için — sadece resmî lig logosu ve fikstür/puan durumu girişini sunar.
 */
const LeagueStrip: React.FC<LeagueStripProps> = ({ onNavigate }) => (
  <section className="py-12 bg-[#080C15] border-y border-white/[0.03]">
    <div className="container mx-auto px-6 max-w-7xl">
      <motion.button
        onClick={() => onNavigate('match-center')}
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        className="group w-full flex flex-col md:flex-row items-center gap-6 md:gap-8 rounded-3xl bg-gradient-to-br from-fb-card via-[#0C111E] to-fb-card border border-white/[0.06] hover:border-fb-yellow/30 p-6 md:p-8 text-left transition-all cursor-pointer shadow-lg hover:shadow-fb-yellow/5"
      >
        {/* Lig logosu */}
        <div className="shrink-0 w-24 h-24 md:w-28 md:h-28 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center p-3">
          <img
            src="/logos/super-lig.png"
            alt="Trendyol Süper Lig"
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
          />
        </div>

        {/* Metin */}
        <div className="flex-1 space-y-2 text-center md:text-left">
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-fb-yellow font-mono block">
            2026-27 Sezonu
          </span>
          <h2 className="text-2xl md:text-3xl font-display font-black text-white uppercase italic tracking-tight leading-none">
            Trendyol Süper Lig
          </h2>
          <p className="text-sm text-slate-400 font-medium leading-relaxed max-w-xl">
            Fenerbahçe'nin fikstürü, maç sonuçları ve güncel puan durumu tek merkezde.
            Maç Merkezi'nden tüm sezonu takip et.
          </p>
        </div>

        {/* Aksiyonlar */}
        <div className="shrink-0 flex flex-col gap-3 w-full md:w-auto">
          <span className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-fb-yellow text-fb-dark text-xs font-black uppercase tracking-wider group-hover:bg-white transition-colors">
            <CalendarDays className="w-4 h-4" /> Fikstür
          </span>
          <span className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white/[0.04] border border-white/[0.06] text-slate-300 text-xs font-black uppercase tracking-wider group-hover:text-fb-yellow transition-colors">
            <BarChart3 className="w-4 h-4" /> Puan Durumu
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </motion.button>
    </div>
  </section>
);

export default LeagueStrip;
