// Hafif, bağımlılıksız path <-> view eşlemesi (Faz 3).
// Mevcut `view` isimleri korunur; bu katman yalnızca URL senkronizasyonu ekler.

export type AppView =
  | 'home' | 'universe' | 'match-center' | 'analysis' | 'transfer-radar'
  | 'players' | 'fan-room' | 'about' | 'contact' | 'predictor'
  | 'admin' | 'admin-login' | 'bulten' | 'privacy' | 'terms' | 'cookies' | 'kvkk' | '404';

// view -> kanonik path
export const VIEW_PATH: Record<string, string> = {
  home: '/',
  'match-center': '/mac-merkezi',
  analysis: '/analizler',
  'transfer-radar': '/transfer-radar',
  players: '/oyuncular',
  'fan-room': '/taraftar-odasi',
  universe: '/evren',
  predictor: '/tahmin',
  bulten: '/bulten',
  about: '/hakkinda',
  contact: '/iletisim',
  privacy: '/gizlilik-politikasi',
  terms: '/kullanim-sartlari',
  cookies: '/cerez-politikasi',
  kvkk: '/kvkk-aydinlatma-metni',
  admin: '/admin',
  'admin-login': '/admin',
};

// path -> view (ilk segment bazlı; /oyuncular/skriniar → players)
const PATH_VIEW: Record<string, AppView> = {
  '': 'home',
  'mac-merkezi': 'match-center',
  analizler: 'analysis',
  'transfer-radar': 'transfer-radar',
  oyuncular: 'players',
  'taraftar-odasi': 'fan-room',
  evren: 'universe',
  tahmin: 'predictor',
  bulten: 'bulten',
  hakkinda: 'about',
  iletisim: 'contact',
  'gizlilik-politikasi': 'privacy',
  'kullanim-sartlari': 'terms',
  'cerez-politikasi': 'cookies',
  'kvkk-aydinlatma-metni': 'kvkk',
  admin: 'admin',
};

export function viewToPath(view: string, subSlug?: string | null): string {
  const base = VIEW_PATH[view] ?? '/';
  if (view === 'players' && subSlug) return `/oyuncular/${subSlug}`;
  if (view === 'match-center' && subSlug) return `/mac-merkezi/${subSlug}`;
  return base;
}

export function pathToView(pathname: string): AppView | null {
  const seg = pathname.replace(/^\/+/, '').split('/')[0] || '';
  return PATH_VIEW[seg] ?? null;
}

/** /oyuncular/:slug veya /mac-merkezi/:slug için ikinci segment. */
export function pathSubSlug(pathname: string): string | null {
  const parts = pathname.replace(/^\/+/, '').split('/');
  return parts.length > 1 && parts[1] ? decodeURIComponent(parts[1]) : null;
}
