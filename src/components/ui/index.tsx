import React from 'react';
import { LucideIcon } from 'lucide-react';

/**
 * FE Signal System — ortak UI (DESIGN.md + MASTER.md).
 * Sarı yalnızca sinyal; kart varsayılan değil; uydurma veri yok.
 */

// ── SignalHeading ──────────────────────────────────────────────────────────
interface SignalHeadingProps {
  label: string;
  index?: string | number;
  className?: string;
}

export const SignalHeading: React.FC<SignalHeadingProps> = ({
  label,
  index,
  className = '',
}) => (
  <div className={`fe-signal-heading ${className}`}>
    {index != null && index !== '' ? (
      <span className="fe-signal-index">{String(index).padStart(2, '0')}</span>
    ) : (
      <span className="fe-signal-dot" aria-hidden />
    )}
    <span className="fe-signal-line" aria-hidden />
    <span className="fe-signal-label">{label}</span>
  </div>
);

// ── SectionHeader ──────────────────────────────────────────────────────────
interface SectionHeaderProps {
  kicker: string;
  title: string;
  action?: { label: string; onClick: () => void };
  className?: string;
  /** Editorial title uses Newsreader */
  editorial?: boolean;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  kicker,
  title,
  action,
  className = '',
  editorial = false,
}) => (
  <div className={`flex flex-col md:flex-row md:items-end justify-between gap-4 ${className}`}>
    <div className="text-left">
      <SignalHeading label={kicker} />
      <h2
        className={`text-[1.75rem] md:text-[2rem] font-semibold tracking-tight text-[var(--fe-text-strong)] leading-[1.1] ${
          editorial ? 'font-editorial' : 'font-sans'
        }`}
        style={editorial ? { fontFamily: 'var(--fe-font-editorial)' } : undefined}
      >
        {title}
      </h2>
    </div>
    {action && (
      <button type="button" onClick={action.onClick} className="fe-btn-tertiary self-start md:self-auto">
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
  variant?: 'compact' | 'hero';
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
  variant = 'compact',
  className = '',
}) => {
  if (variant === 'hero') {
    return (
      <div className={`fe-surface relative overflow-hidden rounded-[var(--fe-radius-xl)] p-10 md:p-14 text-center ${className}`}>
        <div className="relative z-10 max-w-xl mx-auto space-y-5">
          <div className="w-12 h-12 mx-auto rounded-[var(--fe-radius-md)] bg-[var(--fe-yellow-soft)] border border-[var(--fe-yellow-line)] flex items-center justify-center">
            <Icon className="w-6 h-6 text-[var(--fe-yellow-400)]" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl md:text-2xl font-semibold text-[var(--fe-text-strong)] tracking-tight">
              {title}
            </h3>
            {description && (
              <p className="text-sm text-[var(--fe-text-muted)] leading-relaxed">{description}</p>
            )}
          </div>
          {action && (
            <button type="button" onClick={action.onClick} className="fe-btn-primary">
              {action.label}
            </button>
          )}
        </div>
      </div>
    );
  }
  return (
    <div className={`fe-surface p-7 rounded-[var(--fe-radius-lg)] text-center space-y-3 ${className}`}>
      <div className="w-10 h-10 mx-auto rounded-[var(--fe-radius-sm)] bg-white/[0.03] border border-[var(--fe-line-subtle)] flex items-center justify-center">
        <Icon className="w-5 h-5 text-[var(--fe-text-muted)]" />
      </div>
      <p className="text-sm font-semibold text-[var(--fe-text-strong)] leading-snug">{title}</p>
      {description && (
        <p className="text-xs text-[var(--fe-text-faint)] leading-relaxed max-w-sm mx-auto">{description}</p>
      )}
      {action && (
        <button type="button" onClick={action.onClick} className="fe-btn-secondary text-xs !min-h-[40px] !px-4">
          {action.label}
        </button>
      )}
    </div>
  );
};

// ── Skeleton ───────────────────────────────────────────────────────────────
export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse rounded-[var(--fe-radius-sm)] bg-white/[0.05] ${className}`} />
);

export const SkeletonCard: React.FC<{ lines?: number; className?: string }> = ({
  lines = 3,
  className = '',
}) => (
  <div className={`p-6 fe-surface space-y-3 ${className}`}>
    <Skeleton className="h-4 w-1/3" />
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton key={i} className={`h-3 ${i === lines - 1 ? 'w-1/2' : 'w-full'}`} />
    ))}
  </div>
);

// ── StatChip ───────────────────────────────────────────────────────────────
interface StatChipProps {
  label: string;
  value: string | number | null | undefined;
  hint?: string;
  accent?: 'yellow' | 'green' | 'red' | 'neutral';
  className?: string;
}

const ACCENTS: Record<NonNullable<StatChipProps['accent']>, string> = {
  yellow: 'text-[var(--fe-yellow-400)]',
  green: 'text-[var(--fe-success)]',
  red: 'text-[var(--fe-danger)]',
  neutral: 'text-[var(--fe-text-strong)]',
};

export const StatChip: React.FC<StatChipProps> = ({
  label,
  value,
  hint,
  accent = 'neutral',
  className = '',
}) => {
  const hasValue = value !== null && value !== undefined && value !== '';
  return (
    <div className={`p-4 fe-surface-inset ${className}`}>
      <span className="text-[11px] font-medium text-[var(--fe-text-faint)] fe-data block mb-1">
        {label}
      </span>
      <span
        className={`text-xl font-semibold fe-data ${hasValue ? ACCENTS[accent] : 'text-[var(--fe-text-faint)]'}`}
      >
        {hasValue ? value : '—'}
      </span>
      {hint && <span className="text-[11px] text-[var(--fe-text-faint)] block mt-0.5">{hint}</span>}
    </div>
  );
};

// ── DataBadge / ProvenanceStamp ────────────────────────────────────────────
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
  extra?: string | null;
  showMissing?: boolean;
  className?: string;
}

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
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[var(--fe-radius-xs)] border border-[var(--fe-line-subtle)] text-[11px] fe-data font-medium text-[var(--fe-text-faint)] ${className}`}
        title="Bu blok için kaynak bilgisi yok"
      >
        kaynak yok
      </span>
    );
  }
  return (
    <span
      className={`inline-flex flex-wrap items-center gap-x-2 gap-y-0.5 px-2 py-0.5 rounded-[var(--fe-radius-xs)] border border-[var(--fe-line-subtle)] bg-black/20 text-[11px] fe-data font-medium text-[var(--fe-text-muted)] ${className}`}
      title={[label && `Kaynak: ${label}`, fetchedAt && `Çekim: ${fetchedAt}`, extra]
        .filter(Boolean)
        .join(' · ')}
    >
      {label && <span className="text-[var(--fe-text)]">{label}</span>}
      {when && (
        <>
          {label && <span className="text-[var(--fe-text-faint)]" aria-hidden>·</span>}
          <span className="normal-case tracking-normal">{when}</span>
        </>
      )}
      {extra && (
        <>
          {(label || when) && <span className="text-[var(--fe-text-faint)]" aria-hidden>·</span>}
          <span className="text-[var(--fe-text-faint)] normal-case tracking-normal">{extra}</span>
        </>
      )}
    </span>
  );
};

export const ProvenanceStamp = DataBadge;

// ── XGCompare ──────────────────────────────────────────────────────────────
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
      <div className={`p-3 fe-surface-inset ${className}`}>
        <p className="text-[11px] fe-data font-medium text-[var(--fe-text-faint)]">xG verisi yok</p>
      </div>
    );
  }
  const h = Number(home) || 0;
  const a = Number(away) || 0;
  const total = h + a || 1;
  const hw = (h / total) * 100;
  return (
    <div className={`p-3 fe-surface-inset space-y-2 ${className}`}>
      <div className="flex justify-between items-baseline gap-2">
        <span className="text-lg fe-data font-semibold text-[var(--fe-text-strong)] tabular-nums">
          {home != null ? h.toFixed(2) : '—'}
        </span>
        <span className="text-[11px] fe-data font-medium text-[var(--fe-yellow-400)]">xG</span>
        <span className="text-lg fe-data font-semibold text-[var(--fe-text-strong)] tabular-nums">
          {away != null ? a.toFixed(2) : '—'}
        </span>
      </div>
      <div
        className="h-1.5 rounded-full bg-white/5 overflow-hidden flex"
        role="img"
        aria-label={`xG ${homeLabel} ${home ?? 'yok'}, ${awayLabel} ${away ?? 'yok'}`}
      >
        <div className="bg-[var(--fe-yellow-400)] transition-all" style={{ width: `${hw}%` }} />
        <div className="bg-[var(--fe-navy-700)] transition-all" style={{ width: `${100 - hw}%` }} />
      </div>
      <div className="flex justify-between text-[11px] fe-data text-[var(--fe-text-faint)]">
        <span>{homeLabel}</span>
        <span>{awayLabel}</span>
      </div>
    </div>
  );
};
