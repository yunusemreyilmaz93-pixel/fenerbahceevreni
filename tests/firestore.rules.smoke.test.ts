/**
 * Static smoke tests for firestore.rules — catches accidental security regressions
 * without requiring the Firebase emulator.
 */
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { describe, it, expect } from 'vitest';

const rulesPath = resolve(process.cwd(), 'firestore.rules');
const rules = readFileSync(rulesPath, 'utf8');

describe('firestore.rules security posture', () => {
  it('has default deny catch-all', () => {
    expect(rules).toMatch(/match\s*\/\{document=\*\*\}\s*\{\s*allow read,\s*write:\s*if false;/);
  });

  it('supports admin custom claim and email fallback', () => {
    expect(rules).toContain('request.auth.token.admin == true');
    expect(rules).toContain('yunusemreyilmaz93@gmail.com');
  });

  it('does not use unused helper warnings targets without purpose', () => {
    // isSignedIn / existing removed — avoid dead helpers
    expect(rules).not.toMatch(/function isSignedIn\s*\(/);
    expect(rules).not.toMatch(/function existing\s*\(/);
  });

  it('restricts poll vote create to signed-in owner uid', () => {
    expect(rules).toContain('request.auth.uid == voteId');
    expect(rules).toContain('incoming().userId == request.auth.uid');
    expect(rules).toContain('incoming().keys().size() == 3');
    // Regression guard: never public-read all votes
    const votesBlock = rules.slice(
      rules.indexOf('match /votes/{voteId}'),
      rules.indexOf('// 7. newsletterSubscribers')
    );
    expect(votesBlock).not.toMatch(/allow read:\s*if true/);
  });

  it('keeps admin-only providerIds and scrapeJobs', () => {
    expect(rules).toContain('match /providerIds/{playerDocumentId}');
    expect(rules).toContain('match /scrapeJobs/{jobId}');
  });

  it('validates public form creates (email + field limits)', () => {
    expect(rules).toContain('isValidEmail');
    expect(rules).toContain("incoming().status == \"new\"");
    expect(rules).toContain('newsletterSubscribers');
    expect(rules).toContain('contactMessages');
  });

  it('supports isLocked premium gate', () => {
    expect(rules).toContain('canReadPremiumDoc');
    expect(rules).toContain('isLocked');
  });
});

describe('storage.rules security posture', () => {
  const storage = readFileSync(resolve(process.cwd(), 'storage.rules'), 'utf8');

  it('uses path-based rules and denies open write', () => {
    expect(storage).toContain('article-covers');
    expect(storage).toContain('player-images');
    expect(storage).toMatch(/match\s*\/\{allPaths=\*\*\}\s*\{\s*allow read,\s*write:\s*if false;/);
  });

  it('gates writes with admin + image type', () => {
    expect(storage).toContain('isAdmin() && isImage()');
    expect(storage).toContain('request.auth.token.admin == true');
  });
});
