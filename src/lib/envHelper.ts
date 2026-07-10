/**
 * Helper to safely retrieve environment variables with Vite patterns, compatible with Google AI Studio and Vercel.
 * Note: VITE_* values are public in the client bundle — never put secrets here.
 */
export function getEnvVar(name: string): string {
  const metaEnv = (import.meta as any).env || {};
  const value = metaEnv[name];
  if (!value && metaEnv.DEV) {
    console.warn(`Missing environment variable: ${name}`);
  }
  return value || '';
}

/**
 * Decodes administrative emails, trimmed, lowercase, filtered.
 * UI gate only — real authorization is Firestore rules + server checkAdmin + custom claims.
 */
export function getAdminEmails(): string[] {
  const envEmails = getEnvVar('VITE_ADMIN_EMAILS');
  if (!envEmails) {
    return ["yunusemreyilmaz93@gmail.com"];
  }
  return envEmails
    .split(',')
    .map(email => email.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Email allowlist check (legacy UI helper).
 * Prefer isAdminUser() which also honors custom claim `admin: true`.
 */
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const adminEmails = getAdminEmails();
  return adminEmails.includes(email.toLowerCase());
}

/**
 * Full client-side admin check: custom claim OR email allowlist.
 * Still only a UX gate — server/rules enforce truth.
 */
export function isAdminUser(user: { email?: string | null; admin?: boolean } | null | undefined): boolean {
  if (!user) return false;
  if (user.admin === true) return true;
  return isAdminEmail(user.email);
}
