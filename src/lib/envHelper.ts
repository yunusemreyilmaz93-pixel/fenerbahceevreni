/**
 * Helper to safely retrieve environment variables with Vite patterns, compatible with Google AI Studio and Vercel.
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
 */
export function getAdminEmails(): string[] {
  const envEmails = getEnvVar('VITE_ADMIN_EMAILS');
  if (!envEmails) {
    // Dynamic fallback to primary email asked
    return ["yunusemreyilmaz93@gmail.com"];
  }
  return envEmails
    .split(',')
    .map(email => email.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Validates whether a given email address contains admin authorization.
 */
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const adminEmails = getAdminEmails();
  return adminEmails.includes(email.toLowerCase());
}
