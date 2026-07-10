/**
 * A4 pure-logic mirrors — Python firestore_io has the real runtime.
 * These tests document the same rules for TS consumers / CI without firebase_admin.
 */
import { describe, it, expect } from 'vitest';

/** Mirror of data-worker/firestore_io.apply_locked_fields */
function applyLockedFields(
  existing: Record<string, unknown> | null,
  incoming: Record<string, unknown>
): Record<string, unknown> {
  if (!existing) return { ...incoming };
  const locked = Array.isArray(existing.lockedFields)
    ? (existing.lockedFields as unknown[]).map(String)
    : [];
  const lockedSet = new Set(locked);
  const out: Record<string, unknown> = { ...existing };
  for (const [k, v] of Object.entries(incoming)) {
    if (lockedSet.has(k)) continue;
    if (k === 'lockedFields') continue;
    out[k] = v;
  }
  if (locked.length) out.lockedFields = locked;
  return out;
}

/** Mirror of resolve: path-like vs missing */
function resolveReason(env: Record<string, string>): string {
  if (env.FIREBASE_SERVICE_ACCOUNT_JSON_B64) return 'b64_present';
  const sa = (env.FIREBASE_SERVICE_ACCOUNT_JSON || '').trim();
  if (sa.startsWith('{')) return 'inline_json';
  if (sa) return 'path_string';
  if (env.GOOGLE_APPLICATION_CREDENTIALS) return 'gac_path';
  return 'missing';
}

describe('A4 lockedFields merge (mirror)', () => {
  it('preserves locked top-level fields from existing admin doc', () => {
    const existing = {
      formRating: 8.5,
      scoutNote: 'Admin yazdı',
      lockedFields: ['formRating', 'scoutNote'],
      goals: 3,
    };
    const incoming = {
      formRating: 1.0,
      scoutNote: 'Job ezmeye çalıştı',
      goals: 10,
      provider: 'fotmob',
    };
    const merged = applyLockedFields(existing, incoming);
    expect(merged.formRating).toBe(8.5);
    expect(merged.scoutNote).toBe('Admin yazdı');
    expect(merged.goals).toBe(10);
    expect(merged.provider).toBe('fotmob');
    expect(merged.lockedFields).toEqual(['formRating', 'scoutNote']);
  });

  it('does not invent locks when existing is empty', () => {
    const merged = applyLockedFields(null, { a: 1, lockedFields: ['a'] });
    expect(merged.a).toBe(1);
  });
});

describe('A4 credentials reason codes (mirror)', () => {
  it('reports missing when no env set', () => {
    expect(resolveReason({})).toBe('missing');
  });

  it('detects path / inline / gac shapes', () => {
    expect(resolveReason({ FIREBASE_SERVICE_ACCOUNT_JSON: 'C:/sa.json' })).toBe(
      'path_string'
    );
    expect(
      resolveReason({ FIREBASE_SERVICE_ACCOUNT_JSON: '{"project_id":"x"}' })
    ).toBe('inline_json');
    expect(
      resolveReason({ GOOGLE_APPLICATION_CREDENTIALS: 'C:/gac.json' })
    ).toBe('gac_path');
  });
});
