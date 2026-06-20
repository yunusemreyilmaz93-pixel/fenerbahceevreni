// Data providers supported by Soccerdata integration
export type DataProvider = 'sofascore' | 'whoscored' | 'fbref' | 'sofifa';

// Firebase Timestamp interface representation to avoid strict dependency on web SDK in helper files
export interface FirestoreTimestamp {
  seconds: number;
  nanoseconds: number;
  toDate?: () => Date;
}

// Flexible date type supporting standard cloud Firestore Timestamp, custom object formats, Date, or ISO strings
export type FlexibleDate = FirestoreTimestamp | Date | string | any;

// A helper helper function to convert any FlexibleDate into a reliable ISO string or Date for frontend display
export function parseFlexibleDate(date: FlexibleDate): string {
  if (!date) return new Date().toISOString();
  if (typeof date === 'string') return date;
  if (date instanceof Date) return date.toISOString();
  if (typeof date.toDate === 'function') return date.toDate().toISOString();
  if (typeof date.seconds === 'number') return new Date(date.seconds * 1000).toISOString();
  return String(date);
}

/**
 * matches collection document ID maps to advancedMatchStats document ID with suffix: `{matchDocumentId}__{provider}`
 */
export interface AdvancedPlayerStats {
  id?: string; // Deterministic form: `{playerDocumentId}__{seasonKey}__{provider}`
  schemaVersion: number;
  playerDocumentId: string; // References players.id ('plyr-api-{apiSportsPlayerId}')
  apiSportsPlayerId: number;
  playerName: string;
  teamDocumentId?: string; // References teams.id
  seasonKey: string; // e.g., '2025-26'
  competition: string; // e.g., 'Süper Lig'
  provider: DataProvider;
  providerPlayerId: string;
  metrics: Record<string, number | null>; // Raw advanced metrics (e.g., xG, progressivePasses, etc.)
  sourceUrl?: string;
  fetchedAt: FlexibleDate;
  createdAt: FlexibleDate;
  updatedAt: FlexibleDate;
}

/**
 * players collection document ID maps to advancedPlayerStats document ID with suffix: `{playerDocumentId}__{seasonKey}__{provider}`
 */
export interface AdvancedMatchStats {
  id?: string; // Deterministic form: `{matchDocumentId}__{provider}`
  schemaVersion: number;
  matchDocumentId: string; // References matches.id ('match-api-{apiSportsFixtureId}')
  apiSportsFixtureId: number;
  provider: DataProvider;
  providerMatchId: string;
  homeTeam: string;
  awayTeam: string;
  competition: string;
  seasonKey: string;
  matchDate: FlexibleDate;
  teamMetrics: {
    home: Record<string, number | null>;
    away: Record<string, number | null>;
  };
  playerMetrics?: Array<{
    playerDocumentId?: string;
    providerPlayerId: string;
    playerName: string;
    metrics: Record<string, number | null>;
  }>;
  sourceUrl?: string;
  fetchedAt: FlexibleDate;
  createdAt: FlexibleDate;
  updatedAt: FlexibleDate;
}

/**
 * Maps standard player to multiple external scraping sources
 * Document ID: `{playerDocumentId}` i.e. 'plyr-api-{apiSportsPlayerId}'
 */
export interface ExternalPlayerMapping {
  id?: string; // Same as playerDocumentId
  schemaVersion: number;
  playerDocumentId: string;
  apiSportsPlayerId: number;
  canonicalName: string;
  aliases: string[];
  providers: {
    sofascore?: {
      id: string;
      name: string;
    };
    whoscored?: {
      id: string;
      name: string;
    };
    fbref?: {
      id: string;
      name: string;
    };
    sofifa?: {
      id: string;
      name: string;
    };
  };
  mappingStatus: "confirmed" | "review" | "unmatched";
  confidence: number; // Between 0.0 and 1.0
  verifiedBy?: string; // User email or uid
  verifiedAt?: FlexibleDate;
  createdAt: FlexibleDate;
  updatedAt: FlexibleDate;
}

/**
 * Tracks stats harvesting and resolution operations
 */
export interface DataSyncRun {
  id?: string; // Auto-generated
  schemaVersion: number;
  provider: DataProvider;
  jobType: "player_stats" | "match_stats" | "mapping_discovery";
  status: "pending" | "running" | "success" | "partial" | "failed";
  seasonKey?: string;
  startedAt: FlexibleDate;
  finishedAt?: FlexibleDate;
  triggeredBy: "manual" | "scheduler";
  requestedBy?: string; // User email if triggered manually
  processedCount: number;
  successCount: number;
  failedCount: number;
  errorSummary?: string; // Safe, non-sensitive, high-level message
}
