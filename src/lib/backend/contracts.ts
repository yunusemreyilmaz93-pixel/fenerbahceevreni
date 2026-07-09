/**
 * Fenerbahçe Evreni — Backend sözleşme katmanı (Faz A1)
 *
 * Tek kaynak: job tipleri, provider adları, Firestore koleksiyon adları
 * ve normalize belge şekilleri. API (A2) ve data-worker (A3+) buna uyar.
 *
 * Geriye dönük: eski koleksiyon adları (dataSyncRuns, externalPlayerMappings)
 * hâlâ rules'ta açıktır; yeni kod scrapeJobs / providerIds kullanır.
 */

// ── Koleksiyon adları ──────────────────────────────────────────────────────

export const COLLECTIONS = {
  // CMS / içerik
  players: 'players',
  matches: 'matches',
  standings: 'standings',
  articles: 'articles',
  transferReports: 'transferReports',
  polls: 'polls',
  homeSettings: 'homeSettings',
  announcements: 'announcements',
  teams: 'teams',

  // Advanced / pipeline
  advancedPlayerStats: 'advancedPlayerStats',
  advancedMatchStats: 'advancedMatchStats',

  /** Kanonik job log (yeni). Eski: dataSyncRuns */
  scrapeJobs: 'scrapeJobs',
  /** @deprecated Use scrapeJobs */
  dataSyncRuns: 'dataSyncRuns',

  /** Kanonik entity map (yeni). Eski: externalPlayerMappings */
  providerIds: 'providerIds',
  /** @deprecated Use providerIds */
  externalPlayerMappings: 'externalPlayerMappings',
} as const;

export type CollectionName = (typeof COLLECTIONS)[keyof typeof COLLECTIONS];

// ── Provider ───────────────────────────────────────────────────────────────

export const PROVIDERS = [
  'transfermarkt',
  'fbref',
  'sofascore',
  'fotmob',
  'whoscored',
  'clubelo',
  'api_football',
  'manual',
] as const;

export type Provider = (typeof PROVIDERS)[number];

// ── Job types (pipeline) ───────────────────────────────────────────────────

export const JOB_TYPES = [
  'sync_squad',
  'sync_standings',
  'sync_fixtures',
  'sync_player_season_stats',
  'sync_match_advanced',
  'sync_entity_ids',
  'health_probe',
] as const;

export type JobType = (typeof JOB_TYPES)[number];

export const JOB_STATUSES = [
  'queued',
  'running',
  'success',
  'partial',
  'failed',
  'cancelled',
] as const;

export type JobStatus = (typeof JOB_STATUSES)[number];

export const JOB_TRIGGERS = ['admin', 'scheduler', 'cli', 'api'] as const;
export type JobTrigger = (typeof JOB_TRIGGERS)[number];

/** scrapeJobs belgesi */
export interface ScrapeJobDoc {
  schemaVersion: 1;
  jobType: JobType;
  provider: Provider | Provider[];
  status: JobStatus;
  seasonKey: string;
  triggeredBy: JobTrigger;
  triggeredByEmail?: string | null;
  startedAt: string | null;
  finishedAt: string | null;
  processedCount: number;
  successCount: number;
  failedCount: number;
  recordsWritten: number;
  /** Kullanıcıya gösterilecek kısa hata; secret/stack yasak */
  errorSummary: string | null;
  /** Opsiyonel: hangi maç/oyuncu hedeflendi */
  target?: {
    matchDocumentId?: string;
    playerDocumentId?: string;
    teamSlug?: string;
  };
  meta?: Record<string, string | number | boolean | null>;
  createdAt: string;
  updatedAt: string;
}

// ── Entity map (providerIds) ───────────────────────────────────────────────

export const MAPPING_STATUSES = ['review', 'confirmed', 'rejected'] as const;
export type MappingStatus = (typeof MAPPING_STATUSES)[number];

export interface ProviderIdEntry {
  id: string;
  name?: string;
  url?: string;
}

/** providerIds belgesi — documentId = playerDocumentId (kanonik oyuncu id) */
export interface ProviderIdsDoc {
  schemaVersion: 1;
  playerDocumentId: string;
  canonicalName: string;
  slug?: string;
  aliases: string[];
  providers: Partial<Record<Provider, ProviderIdEntry>>;
  mappingStatus: MappingStatus;
  /** 0..1 — otomatik eşleşmelerde; confirmed için genelde 1 */
  confidence: number;
  verifiedBy?: string | null;
  verifiedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

// ── Advanced stats ─────────────────────────────────────────────────────────

export interface AdvancedPlayerStatsDoc {
  schemaVersion: 1;
  playerDocumentId: string;
  playerName: string;
  teamDocumentId?: string | null;
  seasonKey: string;
  competition: string;
  provider: Provider;
  providerPlayerId?: string | null;
  metrics: Record<string, number | null>;
  sourceUrl?: string | null;
  fetchedAt: string;
  createdAt: string;
  updatedAt: string;
  /** Admin kilitlediği alanlar — job ezmez */
  lockedFields?: string[];
}

export interface ShotEvent {
  x: number | null;
  y: number | null;
  xG: number | null;
  playerName?: string | null;
  playerDocumentId?: string | null;
  outcome?: string | null;
  minute?: number | null;
  teamSide?: 'home' | 'away' | null;
}

export interface AdvancedMatchStatsDoc {
  schemaVersion: 1;
  matchDocumentId: string;
  provider: Provider;
  providerMatchId?: string | null;
  homeTeam: string;
  awayTeam: string;
  competition: string;
  seasonKey: string;
  matchDate?: string | null;
  teamMetrics: {
    home: Record<string, number | null>;
    away: Record<string, number | null>;
  };
  playerMetrics?: Array<{
    playerDocumentId?: string | null;
    providerPlayerId?: string | null;
    playerName: string;
    teamSide?: 'home' | 'away' | null;
    metrics: Record<string, number | null>;
  }>;
  shotmap?: ShotEvent[];
  /** Storage path veya harici URL; ham grid ileride */
  heatmap?: {
    homeUrl?: string | null;
    awayUrl?: string | null;
    note?: string | null;
  } | null;
  sourceUrl?: string | null;
  fetchedAt: string;
  createdAt: string;
  updatedAt: string;
  lockedFields?: string[];
}

// ── Deterministic IDs ──────────────────────────────────────────────────────

export function advancedPlayerStatsId(
  playerDocumentId: string,
  seasonKey: string,
  provider: Provider
): string {
  return `${playerDocumentId}__${seasonKey}__${provider}`;
}

export function advancedMatchStatsId(
  matchDocumentId: string,
  provider: Provider
): string {
  return `${matchDocumentId}__${provider}`;
}

// ── API envelope (A2 ile kullanılacak) ─────────────────────────────────────

export interface ApiSuccess<T> {
  success: true;
  data: T;
  meta?: {
    fetchedAt?: string;
    provider?: Provider | string;
    count?: number;
  };
}

export interface ApiError {
  success: false;
  message: string;
  code?: string;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export function isJobType(v: string): v is JobType {
  return (JOB_TYPES as readonly string[]).includes(v);
}

export function isProvider(v: string): v is Provider {
  return (PROVIDERS as readonly string[]).includes(v);
}
