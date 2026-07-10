import React from 'react';
import { LucideIcon, Loader2 } from 'lucide-react';
import { EmptyState } from '../../ui';

/** Calm page kicker — mono, not screaming CAPS block */
export const PageKicker: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <span
    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-fb-yellow/10 border border-fb-yellow/20 text-fb-yellow text-[10px] font-semibold tracking-wide ${className}`}
  >
    {children}
  </span>
);

/** List / archive page title — title case feel, not full uppercase */
export const PageTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <h1
    className={`text-3xl md:text-4xl lg:text-[2.75rem] font-display font-black text-white tracking-tight leading-[1.1] ${className}`}
  >
    {children}
  </h1>
);

export const PageLead: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <p className={`text-sm md:text-[15px] text-slate-400 max-w-2xl font-medium leading-relaxed ${className}`}>
    {children}
  </p>
);

/** Article body title — readable, not all-caps */
export const ArticleTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <h1
    className={`text-3xl md:text-4xl lg:text-5xl font-display font-bold text-white tracking-tight leading-[1.15] ${className}`}
  >
    {children}
  </h1>
);

export const ReadingProgress: React.FC<{ progress: number }> = ({ progress }) => {
  if (progress <= 0) return null;
  return (
    <div
      className="fixed top-0 left-0 h-0.5 bg-fb-yellow z-[210] transition-[width] duration-75 ease-out"
      style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
      role="progressbar"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Okuma ilerlemesi"
    />
  );
};

export const LoadingScreen: React.FC<{ label?: string }> = ({
  label = 'İçerik yükleniyor…',
}) => (
  <div className="min-h-screen flex items-center justify-center bg-fb-dark" role="status" aria-live="polite">
    <div className="space-y-4 text-center px-6">
      <Loader2 className="w-10 h-10 text-fb-yellow animate-spin mx-auto" aria-hidden />
      <p className="text-sm font-medium text-slate-400">{label}</p>
    </div>
  </div>
);

export const ArchiveEmpty: React.FC<{
  icon: LucideIcon;
  title: string;
  description: string;
  onReset?: () => void;
  resetLabel?: string;
}> = ({ icon, title, description, onReset, resetLabel = 'Filtreleri sıfırla' }) => (
  <EmptyState
    variant="hero"
    icon={icon}
    title={title}
    description={description}
    action={onReset ? { label: resetLabel, onClick: onReset } : undefined}
    className="max-w-lg mx-auto"
  />
);
