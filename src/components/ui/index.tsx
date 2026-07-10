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
      <span className="text-[11px] font-semibold tracking-wide text-fb-yellow block mb-2">
        {kicker}
      </span>
      <h2 className="text-2xl md:text-3xl font-display font-bold text-white tracking-tight">
        {title}
      </h2>
    </div>
    {action && (
      <button
        type="button"
        onClick={action.onClick}
        className="text-[13px] font-semibold text-slate-400 hover:text-fb-yellow transition-colors cursor-pointer self-start md:self-auto"
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
      <div className={`ui-surface relative overflow-hidden rounded-3xl p-10 md:p-14 text-center ${className}`}>
        <div className="absolute top-0 inset-x-0 h-px ui-hairline opacity-80" />
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[420px] h-[420px] bg-fb-navy/40 rounded-full blur-[110px] pointer-events-none" />
        <div className="relative z-10 max-w-xl mx-auto space-y-5">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-fb-yellow/10 border border-fb-yellow/25 flex items-center justify-center shadow-[0_0_40px_-8px_rgba(255,210,31,0.35)]">
            <Icon className="w-7 h-7 text-fb-yellow" />
          </div>
          <div className="space-y-2.5">
            <h3 className="text-xl md:text-2xl font-display font-bold text-white tracking-tight">{title}</h3>
            {description && (
              <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
            )}
          </div>
          {action && (
            <button
              onClick={action.onClick}
              className="px-6 py-3 bg-fb-yellow hover:bg-white text-fb-dark text-sm font-bold rounded-xl transition-all cursor-pointer"
            >
              {action.label}
            </button>
          )}
        </div>
      </div>
    );
  }
  return (
    <div className={`ui-surface p-7 rounded-2xl text-center space-y-3 ${className}`}>
      <div className="w-11 h-11 mx-auto rounded-xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center">
        <Icon className="w-5 h-5 text-fb-yellow/80" />
      </div>
      <p className="text-sm font-semibold text-slate-200 leading-snug">{title}</p>
      {description && <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">{description}</p>}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-1 px-4 py-2 bg-fb-yellow/10 hover:bg-fb-yellow text-fb-yellow hover:text-fb-dark text-xs font-bold rounded-lg transition-all cursor-pointer border border-fb-yellow/20"
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
  // 0 is valid sports data (e.g. 0 goals) — only null/undefined/'' mean "no data"
  const hasValue = value !== null && value !== undefined && value !== '';
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

// ── DataBadge (provider + fetchedAt) — world-class kaynak şeffaflığı ────────
export function formatFetchedAtRelative(iso?: string | null): string {
  if (!iso) return '';
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return '';
  const diffMs = Date.now() - t;
  if (diffMs < 0) return 'az önce';
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'az önce';
  if (mins < 60) return `${mins} dk önce`;
  const hours = Math.floor(mins / 60);
  if (hours < 48) return `${hours} sa önce`;
  const days = Math.floor(hours / 24);
  if (days < 14) return `${days} g önce`;
  try {
    return new Date(iso).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '';
  }
}

export function formatProviderLabel(provider?: string | null): string {
  if (!provider) return '';
  const p = String(provider).toLowerCase().trim();
  const map: Record<string, string> = {
    fotmob: 'FotMob',
    transfermarkt: 'Transfermarkt',
    fbref: 'FBref',
    sofascore: 'SofaScore',
    api_football: 'API-Football',
    manual: 'Manuel',
  };
  return map[p] || provider;
}

interface DataBadgeProps {
  provider?: string | null;
  fetchedAt?: string | null;
  /** Extra short note e.g. "25 şut noktası" */
  extra?: string | null;
  /** When true, show "veri yok" style if no provider */
  showMissing?: boolean;
  className?: string;
}

/**
 * Kaynak etiketi: provider + ne zaman çekildi.
 * Sahte metrik basmaz; sadece şeffaflık.
 */
export const DataBadge: React.FC<DataBadgeProps> = ({
  provider,
  fetchedAt,
  extra,
  showMissing = false,
  className = '',
}) => {
  const label = formatProviderLabel(provider);
  const when = formatFetchedAtRelative(fetchedAt);
  if (!label && !when && !extra) {
    if (!showMissing) return null;
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border border-white/[0.06] bg-white/[0.02] text-[9px] font-mono font-bold uppercase tracking-wider text-slate-500 ${className}`}
        title="Bu blok için kaynak bilgisi yok"
      >
        kaynak yok
      </span>
    );
  }
  return (
    <span
      className={`inline-flex flex-wrap items-center gap-x-2 gap-y-0.5 px-2 py-0.5 rounded-md border border-emerald-500/15 bg-emerald-500/[0.06] text-[9px] font-mono font-bold uppercase tracking-wider text-emerald-400/90 ${className}`}
      title={[label && `Kaynak: ${label}`, fetchedAt && `Çekim: ${fetchedAt}`, extra]
        .filter(Boolean)
        .join(' · ')}
    >
      {label && <span>{label}</span>}
      {when && (
        <>
          {label && <span className="text-emerald-500/40" aria-hidden>·</span>}
          <span className="text-emerald-500/80 normal-case tracking-normal">{when}</span>
        </>
      )}
      {extra && (
        <>
          {(label || when) && <span className="text-emerald-500/40" aria-hidden>·</span>}
          <span className="text-slate-400 normal-case tracking-normal font-semibold">{extra}</span>
        </>
      )}
    </span>
  );
};

// ── XGCompare bar (honest null) ────────────────────────────────────────────
interface XGCompareProps {
  home: number | null | undefined;
  away: number | null | undefined;
  homeLabel?: string;
  awayLabel?: string;
  className?: string;
}

export const XGCompare: React.FC<XGCompareProps> = ({
  home,
  away,
  homeLabel = 'Ev',
  awayLabel = 'Dep',
  className = '',
}) => {
  const has = home != null || away != null;
  if (!has) {
    return (
      <div className={`p-3 rounded-lg bg-white/[0.02] border border-dashed border-white/[0.08] ${className}`}>
        <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500">
          xG verisi yok
        </p>
      </div>
    );
  }
  const h = Number(home) || 0;
  const a = Number(away) || 0;
  const total = h + a || 1;
  const hw = (h / total) * 100;
  return (
    <div className={`p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/15 space-y-2 ${className}`}>
      <div className="flex justify-between items-baseline gap-2">
        <span className="text-lg font-mono font-black text-white tabular-nums">
          {home != null ? h.toFixed(2) : '—'}
        </span>
        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">xG</span>
        <span className="text-lg font-mono font-black text-white tabular-nums">
          {away != null ? a.toFixed(2) : '—'}
        </span>
      </div>
      <div className="h-2 rounded-full bg-white/5 overflow-hidden flex" role="img" aria-label={`xG ${homeLabel} ${home ?? 'yok'}, ${awayLabel} ${away ?? 'yok'}`}>
        <div className="bg-fb-yellow transition-all" style={{ width: `${hw}%` }} />
        <div className="bg-slate-600 transition-all" style={{ width: `${100 - hw}%` }} />
      </div>
      <div className="flex justify-between text-[9px] font-mono text-slate-500 uppercase tracking-wider">
        <span>{homeLabel}</span>
        <span>{awayLabel}</span>
      </div>
    </div>
  );
};
