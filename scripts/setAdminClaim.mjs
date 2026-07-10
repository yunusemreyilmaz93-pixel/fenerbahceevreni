/**
 * One-time / ops script: set Firebase custom claim { admin: true } for a user.
 *
 * Prerequisites (free):
 *  - GOOGLE_APPLICATION_CREDENTIALS = path to service account JSON
 *
 * Usage:
 *   node scripts/setAdminClaim.mjs you@example.com
 *   node scripts/setAdminClaim.mjs --uid FIREBASE_UID
 *   node scripts/setAdminClaim.mjs you@example.com --revoke
 */
import { readFileSync, existsSync } from "fs";
import { initializeApp, cert, applicationDefault } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const args = process.argv.slice(2);
const revoke = args.includes("--revoke");
const uidFlag = args.indexOf("--uid");
const target =
  uidFlag >= 0 ? args[uidFlag + 1] : args.find((a) => !a.startsWith("--"));

if (!target) {
  console.error("Usage: node scripts/setAdminClaim.mjs <email|--uid UID> [--revoke]");
  process.exit(1);
}

function loadCredential() {
  const keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (keyPath) {
    if (!existsSync(keyPath)) {
      throw new Error(`Service account file not found: ${keyPath}`);
    }
    const sa = JSON.parse(readFileSync(keyPath, "utf8"));
    return cert(sa);
  }
  // Fallback (gcloud ADC)
  return applicationDefault();
}

try {
  initializeApp({ credential: loadCredential() });
} catch (e) {
  console.error("Firebase Admin init failed:", e.message);
  console.error(
    'Set GOOGLE_APPLICATION_CREDENTIALS to your service-account JSON path, e.g.\n  $env:GOOGLE_APPLICATION_CREDENTIALS="C:\\path\\to\\key.json"'
  );
  process.exit(1);
}

const auth = getAuth();

async function main() {
  let user;
  if (uidFlag >= 0) {
    user = await auth.getUser(target);
  } else {
    user = await auth.getUserByEmail(target);
  }

  const claims = { ...(user.customClaims || {}) };
  if (revoke) {
    delete claims.admin;
  } else {
    claims.admin = true;
  }

  await auth.setCustomUserClaims(user.uid, claims);
  console.log(
    revoke
      ? `Revoked admin claim for ${user.email || user.uid}`
      : `Set admin: true for ${user.email || user.uid}`
  );
  console.log("User must refresh ID token (sign out/in) for claim to apply client-side.");
  process.exit(0);
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
