import { describe, it, expect } from 'vitest';
import {
  advancedLookupIds,
  hasDetailedStats,
  mergeMatchWithOverlay,
  overlayFromAdvancedDoc,
} from '../src/lib/matchAdvanced';

describe('D3 matchAdvanced helpers', () => {
  it('builds lookup ids from site match', () => {
    const ids = advancedLookupIds({
      id: 'fb-eyupspor-2026-lig',
      advancedMatchDocumentId: 'fotmob-4842613',
      providerIds: { fotmob: '4842613' },
    });
    expect(ids).toContain('fb-eyupspor-2026-lig');
    expect(ids).toContain('fotmob-4842613');
    expect(ids).toContain('fotmob-4842613__fotmob');
  });

  it('extracts xG from advanced teamMetrics', () => {
    const overlay = overlayFromAdvancedDoc(
      {
        provider: 'fotmob',
        fetchedAt: '2026-07-10T00:00:00.000Z',
        teamMetrics: {
          home: { expectedGoals: 1.33, 'Ball possession': 58 },
          away: { expectedGoals: 0.52, 'Ball possession': 42 },
        },
        shotmap: [{ x: 1, y: 2 }],
      },
      null
    );
    expect(overlay.xGHome).toBe(1.33);
    expect(overlay.xGAway).toBe(0.52);
    expect(overlay.possessionHome).toBe(58);
    expect(overlay.shotmapCount).toBe(1);
    expect(overlay.statsProvider).toBe('fotmob');
  });

  it('merges overlay without fabricating xG string when empty', () => {
    const m = mergeMatchWithOverlay({ id: 'a', homeTeam: 'FB' }, null);
    expect(m?.xG).toBeUndefined();
    const m2 = mergeMatchWithOverlay({ id: 'a' }, { xGHome: 1, xGAway: 2 });
    expect(m2?.xG).toContain('1');
  });

  it('detects detailed stats honestly', () => {
    expect(hasDetailedStats({})).toBe(false);
    expect(hasDetailedStats({ xGHome: 0 })).toBe(true);
    expect(hasDetailedStats({ shotsHome: 10 })).toBe(true);
  });
});
