// Central local team-logo resolver for the 2026-27 Süper Lig.
// Assets live in /public/logos (see /public/logos/manifest.json).
// Rule: only real, locally provided assets — no external image URLs.

export interface TeamLogoEntry {
  slug: string;
  name: string;
  file: string;
}

const LOGOS: TeamLogoEntry[] = [
  { slug: 'galatasaray', name: 'Galatasaray', file: 'galatasaray.svg' },
  { slug: 'fenerbahce', name: 'Fenerbahçe', file: 'fenerbahce.png' },
  { slug: 'besiktas', name: 'Beşiktaş', file: 'besiktas.svg' },
  { slug: 'trabzonspor', name: 'Trabzonspor', file: 'trabzonspor.png' },
  { slug: 'basaksehir', name: 'İstanbul Başakşehir', file: 'basaksehir.png' },
  { slug: 'kasimpasa', name: 'Kasımpaşa', file: 'kasimpasa.png' },
  { slug: 'eyupspor', name: 'Eyüpspor', file: 'eyupspor.png' },
  { slug: 'goztepe', name: 'Göztepe', file: 'goztepe.png' },
  { slug: 'samsunspor', name: 'Samsunspor', file: 'samsunspor.png' },
  { slug: 'rizespor', name: 'Çaykur Rizespor', file: 'rizespor.png' },
  { slug: 'konyaspor', name: 'Konyaspor', file: 'konyaspor.png' },
  { slug: 'kocaelispor', name: 'Kocaelispor', file: 'kocaelispor.png' },
  { slug: 'alanyaspor', name: 'Alanyaspor', file: 'alanyaspor.png' },
  { slug: 'gaziantep-fk', name: 'Gaziantep FK', file: 'gaziantep-fk.png' },
  { slug: 'genclerbirligi', name: 'Gençlerbirliği', file: 'genclerbirligi.png' },
  { slug: 'erzurumspor', name: 'Erzurumspor FK', file: 'erzurumspor.png' },
  { slug: 'amedspor', name: 'Amedspor', file: 'amedspor.png' },
  { slug: 'corum-fk', name: 'Çorum FK', file: 'corum-fk.png' },
];

/** Lowercase + strip Turkish diacritics + drop non-alphanumerics for robust matching. */
const normalize = (s: string): string =>
  s
    .toLocaleLowerCase('tr-TR')
    .replace(/ç/g, 'c')
    .replace(/ğ/g, 'g')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ş/g, 's')
    .replace(/ü/g, 'u')
    .replace(/[^a-z0-9]/g, '');

// Extra aliases → slug (normalized form)
const ALIASES: Record<string, string> = {
  fb: 'fenerbahce',
  fenerbahcesk: 'fenerbahce',
  gs: 'galatasaray',
  galatasaraysk: 'galatasaray',
  bjk: 'besiktas',
  besiktasjk: 'besiktas',
  ts: 'trabzonspor',
  istanbulbasaksehir: 'basaksehir',
  basaksehirfk: 'basaksehir',
  rizespor: 'rizespor',
  caykurrizespor: 'rizespor',
  gaziantep: 'gaziantep-fk',
  gaziantepfk: 'gaziantep-fk',
  corum: 'corum-fk',
  corumfk: 'corum-fk',
  amedsportif: 'amedspor',
  amedsportiffaaliyetler: 'amedspor',
  erzurum: 'erzurumspor',
  erzurumsporfk: 'erzurumspor',
};

const bySlug = new Map(LOGOS.map((l) => [l.slug, l]));
const byNormalizedName = new Map(LOGOS.map((l) => [normalize(l.name), l]));

/**
 * Resolve a team name (any common spelling) to a local logo path.
 * Returns null when we don't have a real asset — callers must render
 * a graceful fallback (initials badge), never an external image.
 */
export function getTeamLogoPath(teamName?: string | null): string | null {
  if (!teamName) return null;
  const n = normalize(teamName);
  if (!n) return null;

  const direct = byNormalizedName.get(n) || bySlug.get(ALIASES[n] ?? '') || bySlug.get(n);
  if (direct) return `/logos/${direct.file}`;

  // Substring pass for verbose names, e.g. "Fenerbahçe A.Ş." / "Beşiktaş JK".
  for (const l of LOGOS) {
    const ln = normalize(l.name);
    if (n.includes(ln) || ln.includes(n)) return `/logos/${l.file}`;
  }
  for (const [alias, slug] of Object.entries(ALIASES)) {
    if (n.includes(alias)) return `/logos/${bySlug.get(slug)!.file}`;
  }
  return null;
}

/** Initials fallback for teams we have no asset for (e.g. European opponents). */
export function getTeamInitials(teamName?: string | null): string {
  if (!teamName) return '—';
  return teamName
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 3)
    .toLocaleUpperCase('tr-TR');
}

export const SUPER_LIG_TEAMS = LOGOS;
