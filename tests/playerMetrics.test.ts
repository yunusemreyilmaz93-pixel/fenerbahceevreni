import { describe, it, expect } from 'vitest';
import {
  formatRating,
  hasRating,
  hasSeasonStats,
  parseMarketValueEuro,
  parseOptionalMetric,
} from '../src/lib/playerMetrics';

describe('playerMetrics honesty', () => {
  it('parses empty formRating as null not 0', () => {
    expect(parseOptionalMetric('')).toBeNull();
    expect(parseOptionalMetric(null)).toBeNull();
    expect(parseOptionalMetric(undefined)).toBeNull();
    expect(parseOptionalMetric('7.5')).toBe(7.5);
    expect(parseOptionalMetric(0)).toBe(0);
  });

  it('hasRating rejects 0 and null', () => {
    expect(hasRating(null)).toBe(false);
    expect(hasRating(0)).toBe(false);
    expect(hasRating(7.2)).toBe(true);
  });

  it('formatRating shows em dash when missing', () => {
    expect(formatRating(null)).toBe('—');
    expect(formatRating(0)).toBe('—');
    expect(formatRating(8)).toBe('8');
  });

  it('detects season stats', () => {
    expect(hasSeasonStats(null)).toBe(false);
    expect(hasSeasonStats({ appearances: 6, goals: 0 })).toBe(true);
  });

  it('parses market value TR strings', () => {
    expect(parseMarketValueEuro('15,00 mil. €')).toBe(15_000_000);
    expect(parseMarketValueEuro('')).toBe(0);
  });
});
