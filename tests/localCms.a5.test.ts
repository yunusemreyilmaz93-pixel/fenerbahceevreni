import { describe, it, expect } from 'vitest';
import {
  computeLocalCmsEnabled,
  readForceLocalCmsFlag,
} from '../src/lib/localCms';

describe('A5 local CMS gate', () => {
  it('disables local CMS when Firebase is configured', () => {
    expect(
      computeLocalCmsEnabled({ firebaseConfigured: true, forceLocalCms: false })
    ).toBe(false);
  });

  it('enables local CMS when Firebase is not configured (offline dev)', () => {
    expect(
      computeLocalCmsEnabled({ firebaseConfigured: false, forceLocalCms: false })
    ).toBe(true);
  });

  it('allows explicit force flag even with Firebase (dev emergency)', () => {
    expect(
      computeLocalCmsEnabled({ firebaseConfigured: true, forceLocalCms: true })
    ).toBe(true);
  });

  it('reads VITE_FORCE_LOCAL_CMS from env-like objects', () => {
    expect(readForceLocalCmsFlag({ VITE_FORCE_LOCAL_CMS: 'true' })).toBe(true);
    expect(readForceLocalCmsFlag({ VITE_FORCE_LOCAL_CMS: true })).toBe(true);
    expect(readForceLocalCmsFlag({ VITE_FORCE_LOCAL_CMS: 'false' })).toBe(false);
    expect(readForceLocalCmsFlag({})).toBe(false);
  });
});
