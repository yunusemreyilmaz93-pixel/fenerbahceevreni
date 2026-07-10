/**
 * Deploy Firestore + Storage rules (and optional indexes).
 * Requires: firebase login (interactive once) or CI token.
 *
 *   node scripts/deploy-rules.mjs
 *   node scripts/deploy-rules.mjs --indexes
 */
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const project = process.env.FIREBASE_PROJECT || 'fenerbahceevreni-a4280';
const withIndexes = process.argv.includes('--indexes');

const only = withIndexes
  ? 'firestore:rules,firestore:indexes,storage'
  : 'firestore:rules,storage';

const args = [
  '-y',
  'firebase-tools@latest',
  'deploy',
  '--only',
  only,
  '--project',
  project,
  '--non-interactive',
];

console.log(`[deploy-rules] project=${project} only=${only}`);

const r = spawnSync('npx', args, {
  stdio: 'inherit',
  shell: true,
  cwd: resolve(process.cwd()),
});

if (r.status !== 0) {
  console.error(
    '\n[deploy-rules] Failed. If not logged in: npx firebase login\n' +
      'Or paste rules in Firebase Console → Firestore → Rules.'
  );
  process.exit(r.status || 1);
}

console.log('[deploy-rules] OK — rules live on Firebase.');

// sanity: local files exist
for (const f of ['firestore.rules', 'storage.rules', 'firebase.json']) {
  if (!existsSync(f)) console.warn(`[deploy-rules] missing local file: ${f}`);
}
