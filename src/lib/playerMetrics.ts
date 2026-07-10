/**
 * Player metric honesty — null = veri yok. Never coerce missing ratings to 0 for display.
 */

export function parseOptionalMetric(v: unknown): number | null {
  if (v === null || v === undefined || v === '') return null;
  if (typeof v === 'number') {
    if (Number.isNaN(v)) return null;
    return v;
  }
  const n = parseFloat(String(v).replace(',', '.').replace(/[^\d.-]/g, ''));
  if (Number.isNaN(n)) return null;
  return n;
}

/** Ratings: null or <=0 treated as missing (providers don't use 0 form as real). */
export function hasRating(v: number | null | undefined): boolean {
  return v != null && v > 0 && !Number.isNaN(v);
}

export function formatRating(
  v: number | null | undefined,
  opts?: { decimals?: number; empty?: string }
): string {
  if (!hasRating(v)) return opts?.empty ?? '—';
  const d = opts?.decimals ?? (Number.isInteger(v) ? 0 : 1);
  return Number(v).toFixed(d).replace(/\.0$/, '');
}

export function parseMarketValueEuro(mv?: string | null): number {
  if (!mv) return 0;
  const m = mv.replace(',', '.').match(/([\d.]+)/);
  if (!m) return 0;
  const n = parseFloat(m[1]);
  if (Number.isNaN(n)) return 0;
  if (/mil/i.test(mv)) return n * 1_000_000;
  if (/bin/i.test(mv)) return n * 1_000;
  return n;
}

export type SeasonStats = {
  season?: string;
  scope?: string;
  appearances?: number;
  goals?: number;
  assists?: number;
  yellowCards?: number;
  secondYellows?: number;
  redCards?: number;
  subOn?: number;
  subOff?: number;
  minutes?: number;
  inSquad?: number;
  source?: string;
  provider?: string;
  fetchedAt?: string;
};

export function hasSeasonStats(s?: SeasonStats | null): boolean {
  if (!s) return false;
  return (
    s.appearances != null ||
    s.goals != null ||
    s.assists != null ||
    s.minutes != null
  );
}
