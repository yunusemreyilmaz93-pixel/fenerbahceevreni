import React from 'react';
import { LucideIcon } from 'lucide-react';

/**
 * Fenerbahçe Evreni — ortak UI kitaplığı (Faz 0).
 * Tasarım dili kuralları:
 *  - Tek marka sarısı: fb-yellow (#FFD21F). #FFB020 yalnızca admin uyarı rengi.
 *  - Radius: kart 2xl (16px), küçük öğe lg (8px).
 *  - Boş durumlar pasif değil yönlendiricidir: ikon + başlık + açıklama + opsiyonel CTA.
 */

// ── SectionHeader ──────────────────────────────────────────────────────────
interface SectionHeaderProps {
  kicker: string;
  title: string;
  action?: { label: string; onClick: () => void };
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ kicker, title, action, className = '' }) => (
  <div className={`flex flex-col md:flex-row md:items-end justify-between gap-4 ${className}`}>
    <div className="text-left">
      <span className="text-[10px] font-black uppercase tracking-[0.25em] text-fb-yellow block mb-2 font-mono">
        {kicker}
      </span>
      <h2 className="text-2xl md:text-3xl font-display font-black text-white uppercase tracking-tight italic">
        {title}
      </h2>
    </div>
    {action && (
      <button
        onClick={action.onClick}
        className="text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-fb-yellow transition-colors cursor-pointer self-start md:self-auto"
      >
        {action.label} →
      </button>
    )}
  </div>
);

// ── EmptyState ─────────────────────────────────────────────────────────────
interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  /** compact: kart içi; hero: tam genişlik vitrin */
  variant?: 'compact' | 'hero';
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon, title, description, action, variant = 'compact', className = '',
}) => {
  if (variant === 'hero') {
    return (
      <div className={`relative overflow-hidden rounded-3xl border border-white/[0.06] bg-gradient-to-br from-[#0E1526] via-fb-dark to-[#0E1526] p-10 md:p-16 text-center shadow-2xl ${className}`}>
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[420px] h-[420px] bg-fb-navy/40 rounded-full blur-[110px] pointer-events-none" />
        <div className="relative z-10 max-w-xl mx-auto space-y-6">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-fb-yellow/10 border border-fb-yellow/20 flex items-center justify-center">
            <Icon className="w-8 h-8 text-fb-yellow" />
          </div>
          <div className="space-y-3">
            <h3 className="text-2xl md:text-3xl font-display font-black text-white uppercase italic tracking-tight">{title}</h3>
            {description && (
              <p className="text-sm text-slate-400 leading-relaxed font-medium">{description}</p>
            )}
          </div>
          {action && (
            <button
              onClick={action.onClick}
              className="px-6 py-3 bg-fb-yellow hover:bg-white text-fb-dark text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer"
            >
              {action.label}
            </button>
          )}
        </div>
      </div>
    );
  }
  return (
    <div className={`p-8 rounded-2xl bg-white/[0.015] border border-dashed border-white/[0.08] text-center space-y-3 ${className}`}>
      <Icon className="w-8 h-8 text-slate-600 mx-auto" />
      <p className="text-[11px] text-slate-400 font-black uppercase tracking-widest font-mono leading-relaxed">{title}</p>
      {description && <p className="text-[10px] text-slate-500 italic leading-relaxed">{description}</p>}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-1 px-4 py-2 bg-white/5 hover:bg-fb-yellow hover:text-fb-dark text-slate-300 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

// ── Skeleton ───────────────────────────────────────────────────────────────
export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse rounded-lg bg-white/[0.05] ${className}`} />
);

export const SkeletonCard: React.FC<{ lines?: number; className?: string }> = ({ lines = 3, className = '' }) => (
  <div className={`p-6 rounded-2xl bg-fb-card/60 border border-white/[0.06] space-y-3 ${className}`}>
    <Skeleton className="h-4 w-1/3" />
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton key={i} className={`h-3 ${i === lines - 1 ? 'w-1/2' : 'w-full'}`} />
    ))}
  </div>
);

// ── StatChip ───────────────────────────────────────────────────────────────
interface StatChipProps {
  label: string;
  /** null/undefined → veri yok, '—' gösterilir; asla sahte değer basılmaz */
  value: string | number | null | undefined;
  hint?: string;
  accent?: 'yellow' | 'green' | 'red' | 'neutral';
  className?: string;
}

const ACCENTS: Record<NonNullable<StatChipProps['accent']>, string> = {
  yellow: 'text-fb-yellow',
  green: 'text-emerald-400',
  red: 'text-rose-400',
  neutral: 'text-white',
};

export const StatChip: React.FC<StatChipProps> = ({ label, value, hint, accent = 'neutral', className = '' }) => {
  const hasValue = value !== null && value !== undefined && value !== '' && value !== 0 && value !== '0';
  return (
    <div className={`p-4 rounded-xl bg-fb-card/60 border border-white/[0.06] ${className}`}>
      <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 font-mono block mb-1">{label}</span>
      <span className={`text-xl font-display font-black ${hasValue ? ACCENTS[accent] : 'text-slate-600'}`}>
        {hasValue ? value : '—'}
      </span>
      {hint && <span className="text-[9px] text-slate-500 block mt-0.5">{hint}</span>}
    </div>
  );
};
