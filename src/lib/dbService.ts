import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  runTransaction
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import { DataProvider, AdvancedPlayerStats, AdvancedMatchStats, ExternalPlayerMapping, DataSyncRun } from '../types/soccerdata';

// Firestore Error Handler requested by Section 3 of Firebase-Integration Skill
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const savedUser = localStorage.getItem("mock_admin_user");
  const authUser = savedUser ? JSON.parse(savedUser) : null;
  
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: authUser?.uid || null,
      email: authUser?.email || null,
    },
    operationType,
    path
  };
  console.error('Firestore Error Detailed Logs (CMS): ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Local-first bootstrap: legacy key migrations + real configuration defaults only.
// Content collections (articles, matches, players, transfers, polls, ...) are NEVER
// seeded with fabricated data â€” they start empty and are filled via the admin panel,
// JSON import or future API integrations. UI must render premium empty states.
const seedDatabaseLocal = () => {
  // --- Legacy localStorage key migrations (snake_case -> camelCase) ---
  if (localStorage.getItem("cms_match_reports") && !localStorage.getItem("cms_matchReports")) {
    localStorage.setItem("cms_matchReports", localStorage.getItem("cms_match_reports")!);
  }
  if (localStorage.getItem("cms_transfer_reports") && !localStorage.getItem("cms_transferReports")) {
    localStorage.setItem("cms_transferReports", localStorage.getItem("cms_transfer_reports")!);
  }
  if (localStorage.getItem("cms_homepage_settings") && !localStorage.getItem("cms_homeSettings")) {
    localStorage.setItem("cms_homeSettings", localStorage.getItem("cms_homepage_settings")!);
  }
  if (localStorage.getItem("cms_site_settings") && !localStorage.getItem("cms_siteSettings")) {
    localStorage.setItem("cms_siteSettings", localStorage.getItem("cms_site_settings")!);
  }

  // --- Real configuration defaults (product copy, not fake content) ---
  if (!localStorage.getItem("cms_homeSettings")) {
    const initialHps = {
      featuredArticleIds: [],
      featuredMatchId: null,
      featuredTransferReportIds: [],
      heroTitle: "BAÄIMSIZ FENERBAHÃ‡E ANALÄ°Z ATLASI",
      heroSubtitle: "CamianÄ±n taktik rÃ¼zgarlarÄ±nÄ± tarafsÄ±z analiz dosyalarÄ±, scout haritalarÄ± ve interaktif fraksiyon ÅŸemalarÄ±yla analiz eden baÄŸÄ±msÄ±z futbol bÃ¼lteni.",
      heroPrimaryButtonText: "Taktik HaritayÄ± AÃ§",
      heroSecondaryButtonText: "MaÃ§ Merkezi",
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem("cms_homeSettings", JSON.stringify(initialHps));
  }

  if (!localStorage.getItem("cms_siteSettings")) {
    const initialSettings = {
      siteTitle: "FenerbahÃ§e Evreni - BaÄŸÄ±msÄ±z Analiz PortalÄ±",
      siteDescription: "FenerbahÃ§e taktik analiz, scout bÃ¼lteni, taraftar fraksiyonlarÄ± ve maÃ§ merkezi portalÄ±.",
      contactEmail: "iletisim@fenerbahceevreni.com",
      socialLinks: { twitter: "@BasitBiOyun", instagram: "fenerbahceevreni", youtube: "@fenerbahcevreni" },
      disclaimerText: "FenerbahÃ§e Evreni, baÄŸÄ±msÄ±z bir taraftar ve analiz platformudur. Ticari ya da hukuki olarak FenerbahÃ§e SK ya da baÄŸlÄ± ÅŸirketleri ile herhangi bir resmi organik baÄŸÄ± veya ortaklÄ±ÄŸÄ± bulunmamaktadÄ±r.",
      newsletterEnabled: true,
      premiumEnabled: true,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem("cms_siteSettings", JSON.stringify(initialSettings));
  }
};

// Seed storage straight away
seedDatabaseLocal();

// Local-first real-data bootstrap: load the scraped squad file into the players
// collection when it is empty. This is REAL club data (Transfermarkt snapshot),
// not fabricated content â€” and it is replaced automatically once admin/API data exists.
let squadBootstrapPromise: Promise<void> | null = null;
export const bootstrapSquadFromLocalFile = (): Promise<void> => {
  if (!squadBootstrapPromise) {
    squadBootstrapPromise = (async () => {
      try {
        const res = await fetch('/data/squad.json');
        if (!res.ok) return;
        const data = await res.json();
        if (!Array.isArray(data?.players) || data.players.length === 0) return;

        // Versiyon-farkÄ±nda yÃ¼kleme: dosya gÃ¼ncellendiÄŸinde (updatedAt deÄŸiÅŸince)
        // localStorage tazelensin. KullanÄ±cÄ± admin'den dÃ¼zenlediyse (manuel iÅŸaret) dokunma.
        const fileVersion: string = data.updatedAt || data.scrapedAt || '';
        const storedVersion = localStorage.getItem('cms_players_version');
        const existing = localStorage.getItem('cms_players');
        const userEdited = localStorage.getItem('cms_players_userEdited') === 'true';

        const isEmpty = !existing || JSON.parse(existing).length === 0;
        const isStale = !userEdited && storedVersion !== fileVersion;

        if (isEmpty || isStale) {
          localStorage.setItem('cms_players', JSON.stringify(data.players));
          localStorage.setItem('cms_players_version', fileVersion);
          console.log(`Kadro yÃ¼klendi: ${data.players.length} oyuncu (${data.season}, kaynak: ${data.source})`);
        }
      } catch (err) {
        console.warn('Yerel kadro dosyasÄ± yÃ¼klenemedi:', err);
      }
    })();
  }
  return squadBootstrapPromise;
};


// GerÃ§ek maÃ§ verisi bootstrap'Ä± (hazÄ±rlÄ±k maÃ§larÄ± / fikstÃ¼r). Kadro ile aynÄ± desen.
let matchesBootstrapPromise: Promise<void> | null = null;
export const bootstrapMatchesFromLocalFile = (): Promise<void> => {
  if (!matchesBootstrapPromise) {
    matchesBootstrapPromise = (async () => {
      try {
        const res = await fetch('/data/matches.json');
        if (!res.ok) return;
        const data = await res.json();
        if (!Array.isArray(data?.matches) || data.matches.length === 0) return;
        const fileVersion: string = data.updatedAt || '';
        const storedVersion = localStorage.getItem('cms_matches_version');
        const existing = localStorage.getItem('cms_matches');
        const userEdited = localStorage.getItem('cms_matches_userEdited') === 'true';
        const isEmpty = !existing || JSON.parse(existing).length === 0;
        const isStale = !userEdited && storedVersion !== fileVersion;
        if (isEmpty || isStale) {
          localStorage.setItem('cms_matches', JSON.stringify(data.matches));
          localStorage.setItem('cms_matches_version', fileVersion);
          // MaÃ§ raporlarÄ±nÄ± da (varsa) senkronla
          if (Array.isArray(data.reports)) {
            const repEdited = localStorage.getItem('cms_matchReports_userEdited') === 'true';
            if (!repEdited) {
              localStorage.setItem('cms_matchReports', JSON.stringify(data.reports));
            }
          }
          console.log(`MaÃ§ verisi yÃ¼klendi: ${data.matches.length} maÃ§, ${(data.reports || []).length} rapor (${data.season})`);
        }
      } catch (err) {
        console.warn('Yerel maÃ§ dosyasÄ± yÃ¼klenemedi:', err);
      }
    })();
  }
  return matchesBootstrapPromise;
};


// Editoryal makale bootstrap'Ä± (gerÃ§ek maÃ§/fikstÃ¼r verisine dayalÄ± yazÄ±lar). AynÄ± desen.
let articlesBootstrapPromise: Promise<void> | null = null;
export const bootstrapArticlesFromLocalFile = (): Promise<void> => {
  if (!articlesBootstrapPromise) {
    articlesBootstrapPromise = (async () => {
      try {
        const res = await fetch('/data/articles.json');
        if (!res.ok) return;
        const data = await res.json();
        if (!Array.isArray(data?.articles) || data.articles.length === 0) return;
        const fileVersion: string = data.updatedAt || '';
        const storedVersion = localStorage.getItem('cms_articles_version');
        const existing = localStorage.getItem('cms_articles');
        const userEdited = localStorage.getItem('cms_articles_userEdited') === 'true';
        const isEmpty = !existing || JSON.parse(existing).length === 0;
        const isStale = !userEdited && storedVersion !== fileVersion;
        if (isEmpty || isStale) {
          localStorage.setItem('cms_articles', JSON.stringify(data.articles));
          localStorage.setItem('cms_articles_version', fileVersion);
          console.log(`Makaleler yÃ¼klendi: ${data.articles.length} yazÄ±`);
        }
      } catch (err) {
        console.warn('Yerel makale dosyasÄ± yÃ¼klenemedi:', err);
      }
    })();
  }
  return articlesBootstrapPromise;
};


// GerÃ§ek puan durumu bootstrap'Ä± (Transfermarkt scrape â†’ standings.json). AynÄ± desen.
let standingsBootstrapPromise: Promise<void> | null = null;
export const bootstrapStandingsFromLocalFile = (): Promise<void> => {
  if (!standingsBootstrapPromise) {
    standingsBootstrapPromise = (async () => {
      try {
        const res = await fetch('/data/standings.json');
        if (!res.ok) return;
        const data = await res.json();
        if (!Array.isArray(data?.standingsList) || data.standingsList.length === 0) return;
        const fileVersion: string = data.updatedAt || '';
        const storedVersion = localStorage.getItem('cms_standings_version');
        const existing = localStorage.getItem('cms_standings');
        const userEdited = localStorage.getItem('cms_standings_userEdited') === 'true';
        const isEmpty = !existing || JSON.parse(existing).length === 0;
        const isStale = !userEdited && storedVersion !== fileVersion;
        if (isEmpty || isStale) {
          localStorage.setItem('cms_standings', JSON.stringify([{
            id: 'superlig',
            season: data.season,
            isFinal: data.isFinal === true,
            source: data.source,
            updatedAt: data.updatedAt,
            standingsList: data.standingsList
          }]));
          localStorage.setItem('cms_standings_version', fileVersion);
          console.log(`Puan durumu yÃ¼klendi: ${data.standingsList.length} takÄ±m (${data.season}, kaynak: ${data.source})`);
        }
      } catch (err) {
        console.warn('Yerel puan durumu dosyasÄ± yÃ¼klenemedi:', err);
      }
    })();
  }
  return standingsBootstrapPromise;
};


let firebaseSeedingPromise: Promise<void> | null = null;

export const seedDatabaseFirebase = async (): Promise<void> => {
  if (!isFirebaseConfigured || !db) return;
  if (localStorage.getItem("cms_firebase_seeded_done") === "true") return;

  if (!firebaseSeedingPromise) {
    firebaseSeedingPromise = (async () => {
      try {
        // Fetch to check if system is already seeded
        const metaRef = doc(db, "metadata", "system");
        const metaSnap = await getDoc(metaRef);
        if (metaSnap.exists() && metaSnap.data().seeded === true) {
          localStorage.setItem("cms_firebase_seeded_done", "true");
          console.log("Firebase has already been seeded before.");
          return;
        }

        console.log("Firebase not seeded yet. Starting auto-seeding of database tracking...");
        
        // Let's iterate all local collections and upload them
        const collectionsToSeed = [
          { localKey: 'cms_articles', colName: 'articles' },
          { localKey: 'cms_matches', colName: 'matches' },
          { localKey: 'cms_matchReports', colName: 'matchReports' },
          { localKey: 'cms_players', colName: 'players' },
          { localKey: 'cms_transferReports', colName: 'transferReports' },
          { localKey: 'cms_polls', colName: 'polls' },
          { localKey: 'cms_newsletter', colName: 'newsletter' },
          { localKey: 'cms_premium', colName: 'premium' },
          { localKey: 'cms_premiumWaitlist', colName: 'premiumWaitlist' },
          { localKey: 'cms_sponsors', colName: 'sponsors' },
          { localKey: 'cms_homeSettings', colName: 'homeSettings' },
          { localKey: 'cms_siteSettings', colName: 'siteSettings' }
        ];

        for (const target of collectionsToSeed) {
          const rawData = localStorage.getItem(target.localKey);
          if (rawData) {
            try {
              const parsed = JSON.parse(rawData);
              if (Array.isArray(parsed)) {
                for (const item of parsed) {
                  if (item && item.id) {
                    await setDoc(doc(db, target.colName, item.id), item);
                  }
                }
              } else if (parsed && typeof parsed === 'object') {
                // Like homeSettings or siteSettings
                await setDoc(doc(db, target.colName, 'main'), parsed);
              }
            } catch (err) {
              console.error(`Error seeding collection ${target.colName}`, err);
            }
          }
        }

        // Set seeded true
        await setDoc(metaRef, { seeded: true, seededAt: new Date().toISOString() });
        localStorage.setItem("cms_firebase_seeded_done", "true");
        console.log("Firebase successfully seeded and synchronized with premium blueprints!");
      } catch (err) {
        console.error("Failed to seed Firebase Firestore dynamically:", err);
      }
    })();
  }
  return firebaseSeedingPromise;
};


// Normalizes dirty/mismatched collection names into a single unified camelCase form.
// This prevents desynchronization bugs where the admin panel writes to one collection name (e.g., camelCase)
// and home page modules read from another (e.g., snake_case).
export const normalizeCollectionName = (colName: string): string => {
  const norm = colName.trim();
  if (norm === 'match_reports' || norm === 'match-reports') return 'matchReports';
  if (norm === 'site_settings' || norm === 'site-settings' || norm === 'site_settings_general') return 'siteSettings';
  if (norm === 'contact_messages' || norm === 'contact-messages') return 'contactMessages';
  if (norm === 'transfer_reports' || norm === 'transfer-reports') return 'transferReports';
  if (norm === 'homepage_settings' || norm === 'homepage-settings' || norm === 'homeSettings' || norm === 'home_settings' || norm === 'home-settings') return 'homeSettings';
  if (norm === 'newsletterSubscribers' || norm === 'newsletter-subscribers' || norm === 'newsletter_subscribers') return 'newsletter';
  
  // Soccerdata normalized custom collections
  if (norm === 'advanced_player_stats' || norm === 'advanced-player-stats') return 'advancedPlayerStats';
  if (norm === 'advanced_match_stats' || norm === 'advanced-match-stats') return 'advancedMatchStats';
  if (norm === 'external_player_mappings' || norm === 'external-player-mappings') return 'externalPlayerMappings';
  if (norm === 'data_sync_runs' || norm === 'data-sync-runs') return 'dataSyncRuns';
  
  return norm;
};

// Generic high-performance local/cloud operations
export const dbGetCollection = async (rawCollectionName: string): Promise<any[]> => {
  const collectionName = normalizeCollectionName(rawCollectionName);
  if (isFirebaseConfigured && db) {
    try {
      await seedDatabaseFirebase();
      const snap = await getDocs(collection(db, collectionName));
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, collectionName);
      return [];
    }
  } else {
    // Real-data bootstrap: fill players/matches collections from local files once.
    if (collectionName === 'players') {
      await bootstrapSquadFromLocalFile();
    }
    if (collectionName === 'matches') {
      await bootstrapMatchesFromLocalFile();
    }
    if (collectionName === 'standings') {
      await bootstrapStandingsFromLocalFile();
    }
    if (collectionName === 'articles') {
      await bootstrapArticlesFromLocalFile();
    }
    const dataStr = localStorage.getItem(`cms_${collectionName}`);
    if (!dataStr) return [];
    const parsed = JSON.parse(dataStr);
    if (Array.isArray(parsed)) return parsed;
    // Singleton documents (homeSettings, siteSettings) are stored as objects â€”
    // expose them consistently as a one-element collection with id 'main'.
    if (parsed && typeof parsed === 'object') return [{ id: 'main', ...parsed }];
    return [];
  }
};

export const dbUpsertDocument = async (rawCollectionName: string, id: string, data: any): Promise<void> => {
  const collectionName = normalizeCollectionName(rawCollectionName);
  const timestamped = {
    ...data,
    updatedAt: new Date().toISOString()
  };

  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, collectionName, id), timestamped, { merge: true });
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `${collectionName}/${id}`);
    }
  } else {
    const list = await dbGetCollection(collectionName);
    const existingIdx = list.findIndex(item => item.id === id);
    if (existingIdx > -1) {
      list[existingIdx] = { ...list[existingIdx], ...timestamped };
    } else {
      list.push({ id, ...timestamped });
    }
    localStorage.setItem(`cms_${collectionName}`, JSON.stringify(list));
  }
};

export const dbAddDocument = async (rawCollectionName: string, data: any): Promise<string> => {
  const collectionName = normalizeCollectionName(rawCollectionName);
  const finalId = data.id || `${collectionName.slice(0, 3)}-${Math.random().toString(36).substr(2, 9)}`;
  const finalData = {
    ...data,
    id: finalId,
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, collectionName, finalId), finalData);
      return finalId;
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, collectionName);
      return finalId;
    }
  } else {
    const list = await dbGetCollection(collectionName);
    list.push(finalData);
    localStorage.setItem(`cms_${collectionName}`, JSON.stringify(list));
    return finalId;
  }
};

export const dbDeleteDocument = async (rawCollectionName: string, id: string): Promise<void> => {
  const collectionName = normalizeCollectionName(rawCollectionName);
  if (isFirebaseConfigured && db) {
    try {
      await deleteDoc(doc(db, collectionName, id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `${collectionName}/${id}`);
    }
  } else {
    const list = await dbGetCollection(collectionName);
    const filtered = list.filter(item => item.id !== id);
    localStorage.setItem(`cms_${collectionName}`, JSON.stringify(filtered));
  }
};

// --- SOCCERDATA ADVANCED STATS COLLECTIONS HELPERS ---
export const COLL_ADV_PLAYER_STATS = 'advancedPlayerStats';
export const COLL_ADV_MATCH_STATS = 'advancedMatchStats';
/** @deprecated Use COLL_PROVIDER_IDS */
export const COLL_EXT_PLAYER_MAPPINGS = 'externalPlayerMappings';
/** @deprecated Use COLL_SCRAPE_JOBS */
export const COLL_DATA_SYNC_RUNS = 'dataSyncRuns';
/** Kanonik entity map (Faz A1) */
export const COLL_PROVIDER_IDS = 'providerIds';
/** Kanonik job log (Faz A1) */
export const COLL_SCRAPE_JOBS = 'scrapeJobs';

export const dbGetAdvancedPlayerStats = async (
  playerDocumentId: string,
  seasonKey?: string,
  provider?: DataProvider
): Promise<AdvancedPlayerStats[]> => {
  if (isFirebaseConfigured && db) {
    try {
      let q = query(
        collection(db, COLL_ADV_PLAYER_STATS),
        where('playerDocumentId', '==', playerDocumentId)
      );
      if (seasonKey) {
        q = query(q, where('seasonKey', '==', seasonKey));
      }
      if (provider) {
        q = query(q, where('provider', '==', provider));
      }
      const snap = await getDocs(q);
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, COLL_ADV_PLAYER_STATS);
      return [];
    }
  } else {
    const list = await dbGetCollection(COLL_ADV_PLAYER_STATS);
    return list.filter((item: any) => {
      if (item.playerDocumentId !== playerDocumentId) return false;
      if (seasonKey && item.seasonKey !== seasonKey) return false;
      if (provider && item.provider !== provider) return false;
      return true;
    });
  }
};

export const dbGetAdvancedMatchStats = async (
  matchDocumentId: string,
  provider?: DataProvider
): Promise<AdvancedMatchStats[]> => {
  if (isFirebaseConfigured && db) {
    try {
      let q = query(
        collection(db, COLL_ADV_MATCH_STATS),
        where('matchDocumentId', '==', matchDocumentId)
      );
      if (provider) {
        q = query(q, where('provider', '==', provider));
      }
      const snap = await getDocs(q);
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, COLL_ADV_MATCH_STATS);
      return [];
    }
  } else {
    const list = await dbGetCollection(COLL_ADV_MATCH_STATS);
    return list.filter((item: any) => {
      if (item.matchDocumentId !== matchDocumentId) return false;
      if (provider && item.provider !== provider) return false;
      return true;
    });
  }
};

export const dbGetExternalPlayerMapping = async (
  playerDocumentId: string
): Promise<ExternalPlayerMapping | null> => {
  if (isFirebaseConfigured && db) {
    try {
      const snap = await getDoc(doc(db, COLL_EXT_PLAYER_MAPPINGS, playerDocumentId));
      if (snap.exists()) {
        return { id: snap.id, ...snap.data() as any };
      }
      return null;
    } catch (e) {
      handleFirestoreError(e, OperationType.GET, `${COLL_EXT_PLAYER_MAPPINGS}/${playerDocumentId}`);
      return null;
    }
  } else {
    const list = await dbGetCollection(COLL_EXT_PLAYER_MAPPINGS);
    const found = list.find((item: any) => item.id === playerDocumentId);
    return found || null;
  }
};

export const dbUpsertExternalPlayerMapping = async (
  mapping: ExternalPlayerMapping
): Promise<void> => {
  if (!mapping.playerDocumentId) {
    throw new Error('playerDocumentId is required to upsert player mapping');
  }
  const docId = mapping.playerDocumentId;
  const timestamped = {
    ...mapping,
    updatedAt: new Date().toISOString()
  };

  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, COLL_EXT_PLAYER_MAPPINGS, docId), timestamped, { merge: true });
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `${COLL_EXT_PLAYER_MAPPINGS}/${docId}`);
    }
  } else {
    const list = await dbGetCollection(COLL_EXT_PLAYER_MAPPINGS);
    const existingIdx = list.findIndex(item => item.id === docId);
    if (existingIdx > -1) {
      list[existingIdx] = { ...list[existingIdx], ...timestamped };
    } else {
      list.push({ id: docId, ...timestamped });
    }
    localStorage.setItem(`cms_${COLL_EXT_PLAYER_MAPPINGS}`, JSON.stringify(list));
  }
};

export const dbGetDataSyncRuns = async (
  provider?: DataProvider,
  limitCount?: number
): Promise<DataSyncRun[]> => {
  if (isFirebaseConfigured && db) {
    try {
      let q = query(collection(db, COLL_DATA_SYNC_RUNS), orderBy('startedAt', 'desc'));
      if (provider) {
        q = query(collection(db, COLL_DATA_SYNC_RUNS), where('provider', '==', provider), orderBy('startedAt', 'desc'));
      }
      
      const snap = await getDocs(q);
      let results = snap.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
      if (limitCount && limitCount > 0) {
        results = results.slice(0, limitCount);
      }
      return results;
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, COLL_DATA_SYNC_RUNS);
      return [];
    }
  } else {
    let list = await dbGetCollection(COLL_DATA_SYNC_RUNS);
    list.sort((a, b) => {
      const dateA = new Date(a.startedAt).getTime();
      const dateB = new Date(b.startedAt).getTime();
      return dateB - dateA;
    });
    if (provider) {
      list = list.filter((item: any) => item.provider === provider);
    }
    if (limitCount && limitCount > 0) {
      list = list.slice(0, limitCount);
    }
    return list;
  }
};
export async function castPollVote(pollId: string, optionId: string, userId: string): Promise<void> {
  if (!isFirebaseConfigured || !db) {
    throw new Error('Firebase oy sistemi hazır değil.');
  }

  await runTransaction(db, async (transaction) => {
    const pollRef = doc(db, 'polls', pollId);
    const voteRef = doc(db, 'polls', pollId, 'votes', userId);
    const [pollSnap, voteSnap] = await Promise.all([
      transaction.get(pollRef),
      transaction.get(voteRef)
    ]);

    if (!pollSnap.exists()) throw new Error('Anket bulunamadı.');
    const poll = pollSnap.data() as any;
    if (poll.status !== 'active') throw new Error('Bu anket artık aktif değil.');
    if (!Array.isArray(poll.options) || !poll.options.includes(optionId)) {
      throw new Error('Geçersiz anket seçeneği.');
    }
    if (voteSnap.exists()) throw new Error('Bu ankette daha önce oy kullandınız.');

    const options = poll.options as string[];
    const votes = Array.isArray(poll.votes) ? [...poll.votes] : options.map(() => 0);
    const optionIndex = options.indexOf(optionId);
    while (votes.length < options.length) votes.push(0);
    votes[optionIndex] = (Number(votes[optionIndex]) || 0) + 1;

    transaction.set(voteRef, {
      optionId,
      userId,
      createdAt: new Date().toISOString()
    });
    transaction.update(pollRef, {
      votes,
      totalVotes: votes.reduce((sum, value) => sum + (Number(value) || 0), 0),
      updatedAt: new Date().toISOString()
    });
  });
}
