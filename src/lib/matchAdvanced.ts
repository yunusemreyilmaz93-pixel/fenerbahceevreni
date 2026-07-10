/**
 * D3 — Advanced match stats helpers (pure).
 * Provider metrics → site match fields. No fabricated numbers.
 */

export type MatchAdvancedOverlay = {
  possessionHome?: number | null;
  possessionAway?: number | null;
  shotsHome?: number | null;
  shotsAway?: number | null;
  shotsOnTargetHome?: number | null;
  shotsOnTargetAway?: number | null;
  cornersHome?: number | null;
  cornersAway?: number | null;
  foulsHome?: number | null;
  foulsAway?: number | null;
  passAccuracyHome?: number | null;
  passAccuracyAway?: number | null;
  bigChancesHome?: number | null;
  bigChancesAway?: number | null;
  bigChancesMissedHome?: number | null;
  bigChancesMissedAway?: number | null;
  touchesOppBoxHome?: number | null;
  touchesOppBoxAway?: number | null;
  xGHome?: number | null;
  xGAway?: number | null;
  statsProvider?: string;
  statsFetchedAt?: string | null;
  shotmapCount?: number;
};

function num(obj: Record<string, unknown>, keys: string[]): number | null {
  for (const k of keys) {
    if (obj[k] != null && obj[k] !== '') {
      const n = parseFloat(String(obj[k]).replace(/[^\d.]/g, ''));
      if (!Number.isNaN(n)) return n;
    }
    const found = Object.keys(obj).find((ok) =>
      ok.toLowerCase().includes(k.toLowerCase())
    );
    if (found != null) {
      const n = parseFloat(String(obj[found]).replace(/[^\d.]/g, ''));
      if (!Number.isNaN(n)) return n;
    }
  }
  return null;
}

/** API / file advanced doc → overlay for site home/away orientation */
export function overlayFromAdvancedDoc(
  adv: any,
  match: { statsFlippedFromProvider?: boolean; statsProvider?: string; statsFetchedAt?: string; shotmapCount?: number } | null
): MatchAdvancedOverlay {
  const tm = adv?.teamMetrics || {};
  const homeM = (tm.home || {}) as Record<string, unknown>;
  const awayM = (tm.away || {}) as Record<string, unknown>;
  const flipped = !!match?.statsFlippedFromProvider;
  const H = flipped ? awayM : homeM;
  const A = flipped ? homeM : awayM;
  const shotmap = Array.isArray(adv?.shotmap) ? adv.shotmap : [];
  const passAcc = (side: Record<string, unknown>): number | null => {
    const raw = side['Accurate passes'] ?? side['accurate_passes'];
    if (raw == null) return null;
    const m = String(raw).match(/\((\d+)%\)/);
    if (m) return parseInt(m[1], 10);
    return num(side, ['Accurate passes']);
  };

  return {
    possessionHome: num(H, ['Ball possession', 'possession']),
    possessionAway: num(A, ['Ball possession', 'possession']),
    shotsHome: num(H, ['Total shots', 'Shots']),
    shotsAway: num(A, ['Total shots', 'Shots']),
    shotsOnTargetHome: num(H, ['Shots on target']),
    shotsOnTargetAway: num(A, ['Shots on target']),
    cornersHome: num(H, ['Corners']),
    cornersAway: num(A, ['Corners']),
    foulsHome: num(H, ['Fouls committed', 'Fouls']),
    foulsAway: num(A, ['Fouls committed', 'Fouls']),
    passAccuracyHome: passAcc(H),
    passAccuracyAway: passAcc(A),
    bigChancesHome: num(H, ['Big chances']),
    bigChancesAway: num(A, ['Big chances']),
    bigChancesMissedHome: num(H, ['Big chances missed']),
    bigChancesMissedAway: num(A, ['Big chances missed']),
    touchesOppBoxHome: num(H, ['Touches in opposition box']),
    touchesOppBoxAway: num(A, ['Touches in opposition box']),
    xGHome: num(H, ['expectedGoals', 'Expected goals', 'xG']),
    xGAway: num(A, ['expectedGoals', 'Expected goals', 'xG']),
    statsProvider: adv?.provider || match?.statsProvider || 'fotmob',
    statsFetchedAt: adv?.fetchedAt || match?.statsFetchedAt || null,
    shotmapCount: shotmap.length || match?.shotmapCount || 0,
  };
}

/** Candidate IDs for GET /api/v1/matches/:id/advanced */
export function advancedLookupIds(match: any): string[] {
  if (!match) return [];
  const ids: string[] = [];
  const advDoc = match.advancedMatchDocumentId;
  const fotmob = match.providerIds?.fotmob;
  if (advDoc) ids.push(String(advDoc));
  if (fotmob) {
    ids.push(`fotmob-${fotmob}`, `fotmob-${fotmob}__fotmob`, String(fotmob));
  }
  if (match.id) ids.push(String(match.id));
  return [...new Set(ids.filter(Boolean))];
}

export function hasDetailedStats(m: any): boolean {
  if (!m) return false;
  return (
    (m.possessionHome !== undefined && m.possessionHome !== null) ||
    (m.xGHome !== undefined && m.xGHome !== null) ||
    (m.shotsHome !== undefined && m.shotsHome !== null)
  );
}

export function mergeMatchWithOverlay(match: any, overlay: MatchAdvancedOverlay | null) {
  if (!match) return null;
  const merged: any = { ...match, ...(overlay || {}) };
  if ((merged.xGHome != null || merged.xGAway != null) && !merged.xG) {
    merged.xG = `${merged.xGHome ?? '—'} – ${merged.xGAway ?? '—'}`;
  }
  return merged;
}
