import { describe, it, expect } from 'vitest';
import {
  formatFetchedAtRelative,
  formatProviderLabel,
} from '../src/components/ui/index';

describe('D1 DataBadge helpers', () => {
  it('formats known providers', () => {
    expect(formatProviderLabel('fotmob')).toBe('FotMob');
    expect(formatProviderLabel('transfermarkt')).toBe('Transfermarkt');
    expect(formatProviderLabel('fbref')).toBe('FBref');
    expect(formatProviderLabel(null)).toBe('');
  });

  it('formats relative fetchedAt', () => {
    const now = new Date().toISOString();
    expect(formatFetchedAtRelative(now)).toMatch(/az önce|dk önce/);
    expect(formatFetchedAtRelative(null)).toBe('');
    expect(formatFetchedAtRelative('not-a-date')).toBe('');
  });

  it('formats older timestamps as day/date', () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
    expect(formatFetchedAtRelative(threeDaysAgo)).toMatch(/g önce/);
  });
});
