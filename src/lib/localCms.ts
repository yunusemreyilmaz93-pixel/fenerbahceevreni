/**
 * A5 — CMS localStorage gate (pure helpers, no Firebase import).
 *
 * Production path: Firebase configured → Firestore is sole CMS source of truth.
 * Offline / no Firebase → localStorage + /data/*.json bootstrap allowed.
 * Escape hatch: VITE_FORCE_LOCAL_CMS=true (dev emergency only).
 *
 * Non-CMS prefs (cookieConsent, fan_alias, squad_builder) may still use localStorage.
 */

export function computeLocalCmsEnabled(opts: {
  firebaseConfigured: boolean;
  forceLocalCms?: boolean;
}): boolean {
  if (opts.forceLocalCms) return true;
  return !opts.firebaseConfigured;
}

export function readForceLocalCmsFlag(
  env: Record<string, unknown> | undefined | null
): boolean {
  if (!env) return false;
  const v = env.VITE_FORCE_LOCAL_CMS;
  return v === 'true' || v === true;
}
