import { useEffect, useMemo, useState } from 'react';
import {
  advancedLookupIds,
  mergeMatchWithOverlay,
  overlayFromAdvancedDoc,
  type MatchAdvancedOverlay,
} from '../lib/matchAdvanced';

/**
 * Load advancedMatchStats for the active match (API → local worker files via server).
 * Returns overlay fields + shotmap shots. Never invents data.
 */
export function useMatchAdvanced(activeMatch: any | null) {
  const [overlay, setOverlay] = useState<MatchAdvancedOverlay | null>(null);
  const [shotmapShots, setShotmapShots] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lookupKey = useMemo(() => {
    if (!activeMatch) return '';
    return advancedLookupIds(activeMatch).join('|');
  }, [
    activeMatch?.id,
    activeMatch?.advancedMatchDocumentId,
    activeMatch?.providerIds?.fotmob,
  ]);

  useEffect(() => {
    setOverlay(null);
    setShotmapShots([]);
    setError(null);
    if (!activeMatch || !lookupKey) return;

    const ids = advancedLookupIds(activeMatch);
    if (ids.length === 0) return;

    let cancelled = false;
    setLoading(true);

    (async () => {
      try {
        for (const id of ids) {
          if (cancelled) return;
          try {
            const res = await fetch(
              `/api/v1/matches/${encodeURIComponent(id)}/advanced?provider=fotmob`
            );
            if (!res.ok) continue;
            const json = await res.json();
            if (cancelled || !json.success || !json.data) continue;
            const adv = Array.isArray(json.data) ? json.data[0] : json.data;
            if (!adv) continue;

            const next = overlayFromAdvancedDoc(adv, activeMatch);
            // Prefer existing match fields when already enriched; fill gaps
            const gapFill: MatchAdvancedOverlay = {
              ...next,
              possessionHome: activeMatch.possessionHome ?? next.possessionHome,
              possessionAway: activeMatch.possessionAway ?? next.possessionAway,
              shotsHome: activeMatch.shotsHome ?? next.shotsHome,
              shotsAway: activeMatch.shotsAway ?? next.shotsAway,
              shotsOnTargetHome: activeMatch.shotsOnTargetHome ?? next.shotsOnTargetHome,
              shotsOnTargetAway: activeMatch.shotsOnTargetAway ?? next.shotsOnTargetAway,
              cornersHome: activeMatch.cornersHome ?? next.cornersHome,
              cornersAway: activeMatch.cornersAway ?? next.cornersAway,
              foulsHome: activeMatch.foulsHome ?? next.foulsHome,
              foulsAway: activeMatch.foulsAway ?? next.foulsAway,
              passAccuracyHome: activeMatch.passAccuracyHome ?? next.passAccuracyHome,
              passAccuracyAway: activeMatch.passAccuracyAway ?? next.passAccuracyAway,
              bigChancesHome: activeMatch.bigChancesHome ?? next.bigChancesHome,
              bigChancesAway: activeMatch.bigChancesAway ?? next.bigChancesAway,
              bigChancesMissedHome:
                activeMatch.bigChancesMissedHome ?? next.bigChancesMissedHome,
              bigChancesMissedAway:
                activeMatch.bigChancesMissedAway ?? next.bigChancesMissedAway,
              touchesOppBoxHome: activeMatch.touchesOppBoxHome ?? next.touchesOppBoxHome,
              touchesOppBoxAway: activeMatch.touchesOppBoxAway ?? next.touchesOppBoxAway,
              xGHome: activeMatch.xGHome ?? next.xGHome,
              xGAway: activeMatch.xGAway ?? next.xGAway,
              statsProvider:
                activeMatch.statsProvider || next.statsProvider || 'fotmob',
              statsFetchedAt: next.statsFetchedAt || activeMatch.statsFetchedAt || null,
              shotmapCount:
                next.shotmapCount ||
                activeMatch.shotmapCount ||
                0,
            };
            setOverlay(gapFill);
            if (Array.isArray(adv.shotmap) && adv.shotmap.length) {
              setShotmapShots(adv.shotmap);
            }
            setLoading(false);
            return;
          } catch {
            /* try next id */
          }
        }
        // No advanced doc — still expose provider metadata from match if any
        if (
          activeMatch.statsProvider ||
          activeMatch.xGHome != null ||
          activeMatch.possessionHome != null
        ) {
          setOverlay({
            statsProvider: activeMatch.statsProvider,
            statsFetchedAt: activeMatch.statsFetchedAt || null,
            shotmapCount: activeMatch.shotmapCount || 0,
            xGHome: activeMatch.xGHome,
            xGAway: activeMatch.xGAway,
            possessionHome: activeMatch.possessionHome,
            possessionAway: activeMatch.possessionAway,
            shotsHome: activeMatch.shotsHome,
            shotsAway: activeMatch.shotsAway,
            shotsOnTargetHome: activeMatch.shotsOnTargetHome,
            shotsOnTargetAway: activeMatch.shotsOnTargetAway,
            cornersHome: activeMatch.cornersHome,
            cornersAway: activeMatch.cornersAway,
            foulsHome: activeMatch.foulsHome,
            foulsAway: activeMatch.foulsAway,
          });
        }
      } catch (e: any) {
        if (!cancelled) setError(String(e?.message || e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [lookupKey, activeMatch]);

  const resolvedMatch = useMemo(
    () => mergeMatchWithOverlay(activeMatch, overlay),
    [activeMatch, overlay]
  );

  return { resolvedMatch, overlay, shotmapShots, loading, error };
}
