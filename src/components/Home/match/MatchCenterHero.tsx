import React from 'react';
import { motion } from 'motion/react';
import { BarChart3, Calendar, FileText, Trophy } from 'lucide-react';

export type KpiBox = {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
  main: string | null;
  sub: string | null;
  empty: string;
};

interface MatchCenterHeroProps {
  isLive: boolean;
  boxes: KpiBox[];
  seasonLabel?: string;
}

/**
 * Maç Merkezi üst şerit — başlık + KPI kartları (world-class scan).
 */
export const MatchCenterHero: React.FC<MatchCenterHeroProps> = ({
  isLive,
  boxes,
  seasonLabel = '2026-27 Sezonu',
}) => (
  <section className="relative -mx-4 md:-mx-8 px-4 md:px-8 pt-10 pb-2 overflow-hidden">
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute -top-40 -left-32 w-[560px] h-[560px] bg-[#002F6C]/25 rounded-full blur-[130px]" />
      <div className="absolute -top-24 right-0 w-[420px] h-[420px] bg-[#FFD21F]/[0.05] rounded-full blur-[110px]" />
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(115deg, #fff 0px, #fff 1px, transparent 1px, transparent 14px)',
        }}
      />
    </div>

    <div className="relative z-10 space-y-3 max-w-4xl">
      <div className="flex items-center gap-3 flex-wrap">
        {isLive && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full text-[10px] font-bold text-red-400 tracking-wide animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Canlı
          </span>
        )}
        <span className="text-[10px] text-slate-500 font-mono tracking-wide">{seasonLabel}</span>
      </div>
      <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-black text-white tracking-tight leading-[0.95]">
        Maç{' '}
        <span className="inline-block pr-3 text-transparent bg-clip-text bg-gradient-to-r from-[#FFD21F] to-[#ffe680]">
          Merkezi
        </span>
      </h1>
      <p className="text-sm text-slate-400 max-w-xl leading-relaxed">
        Skor, advanced istatistik ve fikstür — uydurma metrik yok; kaynak etiketi istatistik sekmesinde.
      </p>
    </div>

    <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mt-8">
      {boxes.map((box, i) => (
        <motion.div
          key={box.label}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06 * i, duration: 0.45 }}
          className="bg-[#0b101c]/80 backdrop-blur border border-white/[0.06] p-4 rounded-2xl shadow-lg hover:border-[#FFD21F]/20 transition-colors group"
        >
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[9px] font-semibold tracking-wide text-slate-400 font-mono">
              {box.label}
            </span>
            <box.icon
              className={`w-3.5 h-3.5 ${box.accent} opacity-60 group-hover:opacity-100 transition-opacity`}
            />
          </div>
          {box.main ? (
            <div className="space-y-0.5">
              <div className="text-base font-display font-black text-white leading-none truncate">
                {box.main}
              </div>
              <div className="text-[10px] text-slate-400 font-mono truncate">{box.sub}</div>
            </div>
          ) : (
            <div className="text-xs text-slate-500 font-medium">{box.empty}</div>
          )}
        </motion.div>
      ))}
    </div>
  </section>
);

/** Helper to build default KPI icons without re-import noise */
export const MATCH_CENTER_KPI_ICONS = {
  Calendar,
  Trophy,
  BarChart3,
  FileText,
} as const;
