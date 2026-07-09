import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Trophy, 
  ShieldAlert, 
  Users, 
  Calendar, 
  ListTodo, 
  CheckCircle2, 
  AlertTriangle,
  FileText,
  Search,
  Globe,
  Star,
  RefreshCw,
  KeyRound,
  Check,
  Link,
  Database,
  Server,
  Info,
  Eye,
  EyeOff,
  Cpu,
  BookmarkCheck,
  HelpCircle
} from 'lucide-react';
import { dbUpsertDocument, dbGetCollection } from '../../lib/dbService';
import { getCurrentAdminUser, isFirebaseConfigured, auth } from '../../lib/firebase';

export interface DebugInfo {
  action: string;
  backendRoute: string;
  externalEndpoint: string;
  statusCode: number | string;
  contentType: string;
  rawResponsePreview?: string;
  rateLimits?: {
    remaining: string;
    limit: string;
    requests: string;
  };
}

export const AdminApiTest: React.FC = () => {
  // Navigation Tabs for Football Data Hub
  const [activeTab, setActiveTab] = useState<'status' | 'leagues' | 'teams' | 'players' | 'fixtures' | 'standings' | 'details' | 'preview'>('status');

  // Config States
  const [country, setCountry] = useState<string>('Turkey');
  const [teamSearch, setTeamSearch] = useState<string>('Fenerbahce');
  const [season, setSeason] = useState<string>('2025');
  const [leagueId, setLeagueId] = useState<string>('203'); // default Süper Lig
  const [teamId, setTeamId] = useState<string>('611'); // default Fenerbahçe
  const [fixtureId, setFixtureId] = useState<string>(''); // For single match details

  // Execution & Loading States
  const [loading, setLoading] = useState<string | null>(null);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Debug & Developer terminal state
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const [showDeveloperConsole, setShowDeveloperConsole] = useState<boolean>(false);

  // Authenticated user checks
  const [currentUser, setCurrentUser] = useState<any>(null);

  // API Data States (Preview before persistent save)
  const [rateLimitInfo, setRateLimitInfo] = useState<{
    remaining: string;
    limit: string;
    requests: string;
  } | null>(null);

  const [apiLeagues, setApiLeagues] = useState<any[] | null>(null);
  const [apiTeams, setApiTeams] = useState<any[] | null>(null);
  const [apiPlayers, setApiPlayers] = useState<any[] | null>(null);
  const [apiFixtures, setApiFixtures] = useState<any[] | null>(null);
  const [apiStandings, setApiStandings] = useState<any[] | null>(null);
  const [apiMatchDetails, setApiMatchDetails] = useState<any | null>(null);

  // Database Preview Counts & Records
  const [dbStats, setDbStats] = useState({
    leagues: 0,
    teams: 0,
    players: 0,
    matches: 0,
    standings: 0,
    matchDetails: 0
  });
  const [dbSamples, setDbSamples] = useState<Record<string, any[]>>({});
  const [defaultLeagueIdSaved, setDefaultLeagueIdSaved] = useState<string>('');

  // Fetch running administrative auth context on load
  const loadUserAndSettings = () => {
    const user = getCurrentAdminUser();
    setCurrentUser(user);
    
    // Load default league setting from generic siteSettings
    dbGetCollection('siteSettings').then(settingsList => {
      const general = settingsList.find(s => s.id === 'general');
      if (general && general.defaultLeagueId) {
        setDefaultLeagueIdSaved(String(general.defaultLeagueId));
      }
    }).catch(err => console.error(err));
  };

  useEffect(() => {
    loadUserAndSettings();
    loadDatabaseCounts();
  }, [activeTab]);

  const loadDatabaseCounts = async () => {
    try {
      const leaguesColl = await dbGetCollection('leagues');
      const teamsColl = await dbGetCollection('teams');
      const playersColl = await dbGetCollection('players');
      const matchesColl = await dbGetCollection('matches');
      const standingsColl = await dbGetCollection('standings');
      const detailsColl = await dbGetCollection('matchDetails');

      setDbStats({
        leagues: leaguesColl.length,
        teams: teamsColl.length,
        players: playersColl.length,
        matches: matchesColl.length,
        standings: standingsColl.length,
        matchDetails: detailsColl.length
      });

      setDbSamples({
        leagues: leaguesColl.slice(0, 5),
        teams: teamsColl.slice(0, 5),
        players: playersColl.slice(0, 5),
        matches: matchesColl.slice(0, 5),
        standings: standingsColl.slice(0, 5),
        matchDetails: detailsColl.slice(0, 5)
      });
    } catch (e) {
      console.error("Failed to load local DB preview stats:", e);
    }
  };

  // Safe checks prior to database insert operations (per rules)
  const verifyAdminAuthentication = (): boolean => {
    const user = getCurrentAdminUser();
    setCurrentUser(user);
    
    // Check if user session exists
    if (!user) {
      setErrorMsg("Veritabanına yazmak için admin olarak giriş yapmanız gerekiyor.");
      setSuccessMsg(null);
      return false;
    }

    // Check if they are configured on a live Firebase, but only logged in mock
    if (isFirebaseConfigured && auth && !auth.currentUser) {
      setErrorMsg("Veritabanına yazmak için admin olarak giriş yapmanız gerekiyor. Mock oturumu canlı Firebase servis kısıtlamaları nedeniyle veri kaydedemez.");
      setSuccessMsg(null);
      return false;
    }

    return true;
  };

  // Safe Server API proxy fetch wrapper with limits parsing
  const executeApiFetch = async (
    actionName: string,
    route: string,
    onSuccess: (data: any) => void
  ) => {
    setLoading(actionName);
    setErrorMsg(null);
    setSuccessMsg(null);
    setDebugInfo(null);

    // Prepare auth headers
    const requestHeaders: Record<string, string> = {
      "Content-Type": "application/json"
    };

    if (isFirebaseConfigured && auth) {
      const user = auth.currentUser;
      if (!user) {
        setErrorMsg("API isteği başarısız: Aktif bir oturum bulunamadı. Lütfen giriş yapın.");
        setLoading(null);
        return;
      }
      try {
        const token = await user.getIdToken();
        requestHeaders["Authorization"] = `Bearer ${token}`;
      } catch (tokenErr: any) {
        console.error("Firebase token alınamadı:", tokenErr);
        setErrorMsg(`Yetkilendirme hatası: Token alınamadı (${tokenErr.message})`);
        setLoading(null);
        return;
      }
    } else {
      const mockUser = getCurrentAdminUser();
      if (!mockUser) {
        setErrorMsg("API isteği başarısız: Yönetici oturumu bulunamadı.");
        setLoading(null);
        return;
      }
      // Pass mock value when Firebase is not configured but a mock user is logged in
      requestHeaders["Authorization"] = `Bearer mock-admin-token-for-${mockUser.email || 'unknown'}`;
    }

    try {
      const response = await fetch(route, {
        headers: requestHeaders
      });
      const contentType = response.headers.get("content-type") || "";
      let payload: any = null;

      if (contentType.includes("application/json")) {
        payload = await response.json();
      } else {
        const txt = await response.text();
        const dbgError: DebugInfo = {
          action: actionName,
          backendRoute: route,
          externalEndpoint: "Sunucu Proxy Katmanı",
          statusCode: response.status,
          contentType: contentType,
          rawResponsePreview: txt.slice(0, 500)
        };
        setDebugInfo(dbgError);
        throw new Error(response.status === 404 
          ? "Backend API router tanımlanmadı veya deploy edilmedi." 
          : `API sunucusundan geçersiz yanıt alındı (Status: ${response.status}).`
        );
      }

      // Populate limit tracking metrics and error definitions
      if (payload) {
        const dbg: DebugInfo = {
          action: actionName,
          backendRoute: route,
          externalEndpoint: payload.debug?.externalEndpoint || "Bilinmiyor",
          statusCode: payload.debug?.statusCode || response.status,
          contentType: payload.debug?.contentType || contentType,
          rawResponsePreview: payload.debug?.errorPreview || (!payload.success ? JSON.stringify(payload, null, 2).slice(0, 400) : undefined),
          rateLimits: payload.headers ? {
            remaining: payload.headers.remaining,
            limit: payload.headers.limit,
            requests: payload.headers.requests
          } : undefined
        };
        setDebugInfo(dbg);

        if (payload.headers) {
          setRateLimitInfo({
            remaining: payload.headers.remaining,
            limit: payload.headers.limit,
            requests: payload.headers.requests
          });
        }
      }

      if (!payload.success) {
        let errorTranslated = payload.message || "API-Football verisi alınamadı.";
        if (payload.isApiError) {
          errorTranslated = "Yetkilendirme hatası: APISPORTS_KEY bulunamadı veya geçersiz.";
        } else if (errorTranslated.toLowerCase().includes("limit") || errorTranslated.toLowerCase().includes("exceeded")) {
          errorTranslated = "Kadro çekilirken kota kalmadı veya günlük request limiti doldu.";
        }
        throw new Error(errorTranslated);
      }

      onSuccess(payload.data);
      setSuccessMsg(`"${actionName}" başarılı şekilde tamamlandı. Aşağıdan ön izleme yapabilirsiniz.`);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "API bağlantısı esnasında hata oluştu.");
    } finally {
      setLoading(null);
    }
  };

  // Tab 1: Connection status testing
  const runTestConnection = () => {
    executeApiFetch("Status Bağlantı Testi", "/api/sports/test-connection", (data) => {
      // Basic response status from sports
      setSuccessMsg("API-Sports bağlantısı başarılı ve anahtarlar doğrulanmıştır.");
    });
  };

  // Tab 2: Leagues management
  const runFetchLeagues = () => {
    executeApiFetch("Ligleri Çek", `/api/sports/leagues?country=${encodeURIComponent(country)}`, (data) => {
      setApiLeagues(data.response || []);
    });
  };

  const saveLeagueToFirestore = async (leagueObj: any) => {
    if (!verifyAdminAuthentication()) return;
    setSavingKey(`league-${leagueObj.league.id}`);
    try {
      const docId = `league-api-${leagueObj.league.id}`;
      const payload = {
        id: docId,
        apiSportsId: Number(leagueObj.league.id),
        name: leagueObj.league.name,
        logo: leagueObj.league.logo,
        type: leagueObj.league.type || 'league',
        countryName: leagueObj.country?.name || country,
        countryFlag: leagueObj.country?.flag || '',
        currentSeason: leagueObj.seasons?.find((s: any) => s.current)?.year || Number(season)
      };
      await dbUpsertDocument('leagues', docId, payload);
      setSuccessMsg(`"${payload.name}" lig bilgisi 'leagues' koleksiyonuna kaydedildi.`);
      loadDatabaseCounts();
    } catch (err: any) {
      setErrorMsg(`Lig kaydedilirken hata: ${err.message}`);
    } finally {
      setSavingKey(null);
    }
  };

  const makeLeagueDefault = async (leagueIdVal: string) => {
    if (!verifyAdminAuthentication()) return;
    setSavingKey(`default-league-${leagueIdVal}`);
    try {
      // Find existing site settings block, or default
      const list = await dbGetCollection('siteSettings');
      const existingSettings = list.find(s => s.id === 'general') || {};

      await dbUpsertDocument('siteSettings', 'general', {
        ...existingSettings,
        defaultLeagueId: String(leagueIdVal),
        updatedAt: new Date().toISOString()
      });

      setDefaultLeagueIdSaved(String(leagueIdVal));
      setSuccessMsg(`Varsayılan lig ayarı ID: ${leagueIdVal} olarak güncellendi.`);
    } catch (err: any) {
      setErrorMsg(`Varsayılan ayar yapılırken hata: ${err.message}`);
    } finally {
      setSavingKey(null);
    }
  };

  // Tab 3: Teams Management
  const runSearchTeams = () => {
    executeApiFetch("Takım Ara", `/api/sports/teams?search=${encodeURIComponent(teamSearch)}&country=${encodeURIComponent(country)}`, (data) => {
      setApiTeams(data.response || []);
    });
  };

  const saveTeamToFirestore = async (teamObj: any) => {
    if (!verifyAdminAuthentication()) return;
    setSavingKey(`team-${teamObj.team.id}`);
    try {
      const docId = `team-api-${teamObj.team.id}`;
      const payload = {
        id: docId,
        apiSportsId: Number(teamObj.team.id),
        name: teamObj.team.name,
        code: teamObj.team.code || '',
        shortName: teamObj.team.code || teamObj.team.name?.slice(0,3).toUpperCase(),
        logo: teamObj.team.logo,
        logoUrl: teamObj.team.logo,
        country: teamObj.team.country || country,
        founded: teamObj.team.founded || null,
        venueName: teamObj.venue?.name || '',
        venueCity: teamObj.venue?.city || '',
        venueCapacity: teamObj.venue?.capacity || null
      };
      await dbUpsertDocument('teams', docId, payload);
      setSuccessMsg(`"${payload.name}" takımı ve amblem haritaları başarıyla 'teams' koleksiyonuna kaydedildi.`);
      loadDatabaseCounts();
    } catch (err: any) {
      setErrorMsg(`Takım kaydedilirken hata: ${err.message}`);
    } finally {
      setSavingKey(null);
    }
  };

  const saveAllTeamsToFirestore = async () => {
    if (!apiTeams || apiTeams.length === 0) return;
    if (!verifyAdminAuthentication()) return;
    setSavingKey('all-teams');
    try {
      let count = 0;
      for (const item of apiTeams) {
        const docId = `team-api-${item.team.id}`;
        await dbUpsertDocument('teams', docId, {
          id: docId,
          apiSportsId: Number(item.team.id),
          name: item.team.name,
          code: item.team.code || '',
          shortName: item.team.code || item.team.name?.slice(0,3).toUpperCase(),
          logo: item.team.logo,
          logoUrl: item.team.logo,
          country: item.team.country || country,
          founded: item.team.founded || null,
          venueName: item.venue?.name || '',
          venueCity: item.venue?.city || ''
        });
        count++;
      }
      setSuccessMsg(`${count} takım toplu olarak başarıyla 'teams' koleksiyonuna kaydedildi.`);
      loadDatabaseCounts();
    } catch (err: any) {
      setErrorMsg(`Toplu kayıt esnasında hata: ${err.message}`);
    } finally {
      setSavingKey(null);
    }
  };

  // Tab 4: Players / Squad Management
  const runFetchSquad = () => {
    executeApiFetch("Kadroyu Çek", `/api/sports/squad?teamId=${teamId}`, (data) => {
      const resp = data.response || [];
      const sq = resp[0]?.players || [];
      setApiPlayers(sq);
    });
  };

  const saveSquadToFirestore = async () => {
    if (!apiPlayers || apiPlayers.length === 0) return;
    if (!verifyAdminAuthentication()) return;
    setSavingKey('squad-to-db');
    try {
      let count = 0;
      for (const plyr of apiPlayers) {
        const docId = `plyr-api-${plyr.id}`;
        
        // Map English position strings to standard Turkish labels
        let trPos = 'Ortasaha';
        const rawPos = plyr.position || '';
        if (rawPos === 'Goalkeeper') trPos = 'Kaleci';
        else if (rawPos === 'Defender') trPos = 'Defans';
        else if (rawPos === 'Midfielder') trPos = 'Ortasaha';
        else if (rawPos === 'Attacker') trPos = 'Forvet';

        const payload = {
          id: docId,
          apiSportsId: Number(plyr.id),
          name: plyr.name,
          position: trPos,
          age: plyr.age || 25,
          nationality: plyr.nationality || 'Turkey',
          photo: plyr.photo || '',
          number: plyr.number ? String(plyr.number) : '',
          formRating: "7.2",
          lastMatchRating: "7.0",
          trend: "stabil",
          status: "active"
        };
        
        await dbUpsertDocument('players', docId, payload);
        count++;
      }
      setSuccessMsg(`${count} oyuncu verisi 'players' koleksiyonuna başarıyla kaydedildi ve senkronize edildi.`);
      loadDatabaseCounts();
    } catch (err: any) {
      setErrorMsg(`Kadro kaydedilirken hata oluştu: ${err.message}`);
    } finally {
      setSavingKey(null);
    }
  };

  // Tab 5: Fixtures/Matches Management
  const runFetchFixtures = () => {
    executeApiFetch("Fikstürleri Çek", `/api/sports/fixtures?teamId=${teamId}&season=${season}&leagueId=${leagueId}`, (data) => {
      setApiFixtures(data.response || []);
    });
  };

  const saveFixturesToFirestore = async () => {
    if (!apiFixtures || apiFixtures.length === 0) return;
    if (!verifyAdminAuthentication()) return;
    setSavingKey('fixtures-to-db');
    try {
      let count = 0;
      for (const item of apiFixtures) {
        const docId = `match-api-${item.fixture.id}`;
        const matchStatusRaw = item.fixture?.status?.short || 'NS';
        
        // Clean Turkish match status parser
        let statusParsed: 'upcoming' | 'live' | 'finished' = 'upcoming';
        if (matchStatusRaw === 'FT' || matchStatusRaw === 'AET' || matchStatusRaw === 'PEN') {
          statusParsed = 'finished';
        } else if (['1H', '2H', 'HT', 'ET', 'P', 'LIVE'].includes(matchStatusRaw)) {
          statusParsed = 'live';
        }

        const payload = {
          id: docId,
          apiSportsId: Number(item.fixture.id),
          homeTeam: item.teams?.home?.name || 'Ev Sahibi',
          awayTeam: item.teams?.away?.name || 'Deplasman',
          homeLogo: item.teams?.home?.logo || '',
          awayLogo: item.teams?.away?.logo || '',
          competition: item.league?.name ? `${item.league.name} • ${item.league.round || 'Hafta'}` : 'Süper Lig',
          matchDate: item.fixture?.date || new Date().toISOString(),
          venue: item.fixture?.venue?.name ? `${item.fixture.venue.name} / ${item.fixture.venue.city || ''}` : 'Stadyum',
          status: statusParsed,
          scoreHome: item.goals?.home !== null ? Number(item.goals.home) : 0,
          scoreAway: item.goals?.away !== null ? Number(item.goals.away) : 0,
          matchPreview: "API entegrasyonu ile otomatik içe aktarılan resmi fikstür kaydı."
        };

        await dbUpsertDocument('matches', docId, payload);
        count++;
      }
      setSuccessMsg(`${count} maç fikstür kaydı senkronize edilerek 'matches' koleksiyonuna kaydedildi.`);
      loadDatabaseCounts();
    } catch (err: any) {
      setErrorMsg(`Fikstür kaydedilirken hata: ${err.message}`);
    } finally {
      setSavingKey(null);
    }
  };

  // Tab 6: Standings cetveli
  const runFetchStandings = () => {
    executeApiFetch("Puan Durumunu Çek", `/api/sports/standings?leagueId=${leagueId}&season=${season}`, (data) => {
      const resp = data.response || [];
      const table = resp[0]?.league?.standings?.[0] || [];
      setApiStandings(table);
    });
  };

  const saveStandingsToFirestore = async () => {
    if (!apiStandings || apiStandings.length === 0) return;
    if (!verifyAdminAuthentication()) return;
    setSavingKey('standings-to-db');
    try {
      const docId = `standings-api-${leagueId}-${season}`;
      const payload = {
        id: docId,
        leagueId: Number(leagueId),
        season: Number(season),
        standingsList: apiStandings.map(row => ({
          rank: row.rank,
          teamName: row.team?.name,
          teamId: row.team?.id,
          logo: row.team?.logo,
          played: row.all?.played,
          win: row.all?.win,
          draw: row.all?.draw,
          lose: row.all?.lose,
          goalsFor: row.all?.goals?.for,
          goalsAgainst: row.all?.goals?.against,
          goalsDiff: row.goalsDiff,
          points: row.points
        }))
      };

      await dbUpsertDocument('standings', docId, payload);
      setSuccessMsg(`Puan durumu cetveli '${docId}' kimliğiyle 'standings' koleksiyonuna başarıyla yazıldı.`);
      loadDatabaseCounts();
    } catch (err: any) {
      setErrorMsg(`Puan cetveli kaydedilirken hata: ${err.message}`);
    } finally {
      setSavingKey(null);
    }
  };

  // Tab 7: Match Details integration
  const runFetchSingleMatchDetails = () => {
    if (!fixtureId.trim()) {
      setErrorMsg("Lütfen geçerli bir Maç API ID giriniz.");
      return;
    }
    executeApiFetch("Maç Detaylarını Al", `/api/sports/fixtures?id=${fixtureId.trim()}`, (data) => {
      const resp = data.response?.[0] || null;
      setApiMatchDetails(resp);
    });
  };

  const saveMatchDetailsToFirestore = async () => {
    if (!apiMatchDetails) return;
    if (!verifyAdminAuthentication()) return;
    setSavingKey('match-details-to-db');
    const fId = String(apiMatchDetails.fixture?.id);
    try {
      const docId = `match-api-${fId}`;

      // 1. Save directly into `matchDetails` collection
      const detailPayload = {
        id: fId,
        fixture: apiMatchDetails.fixture || null,
        league: apiMatchDetails.league || null,
        teams: apiMatchDetails.teams || null,
        goals: apiMatchDetails.goals || null,
        score: apiMatchDetails.score || null,
        events: apiMatchDetails.events || [],
        lineups: apiMatchDetails.lineups || [],
        statistics: apiMatchDetails.statistics || [],
        players: apiMatchDetails.players || [],
        updatedAt: new Date().toISOString()
      };
      await dbUpsertDocument('matchDetails', fId, detailPayload);

      // 2. Also try to merge/update corresponding match record under matches
      const matchStatusRaw = apiMatchDetails.fixture?.status?.short || 'NS';
      let statusParsed: 'upcoming' | 'live' | 'finished' = 'upcoming';
      if (matchStatusRaw === 'FT' || matchStatusRaw === 'AET' || matchStatusRaw === 'PEN') {
        statusParsed = 'finished';
      } else if (['1H', '2H', 'HT', 'ET', 'P', 'LIVE'].includes(matchStatusRaw)) {
        statusParsed = 'live';
      }

      const matchBriefPayload = {
        id: docId,
        apiSportsId: Number(fId),
        homeTeam: apiMatchDetails.teams?.home?.name || 'Ev Sahibi',
        awayTeam: apiMatchDetails.teams?.away?.name || 'Deplasman',
        homeLogo: apiMatchDetails.teams?.home?.logo || '',
        awayLogo: apiMatchDetails.teams?.away?.logo || '',
        competition: apiMatchDetails.league?.name ? `${apiMatchDetails.league.name} • ${apiMatchDetails.league.round || 'Hafta'}` : 'Süper Lig',
        matchDate: apiMatchDetails.fixture?.date || new Date().toISOString(),
        venue: apiMatchDetails.fixture?.venue?.name ? `${apiMatchDetails.fixture.venue.name} / ${apiMatchDetails.fixture.venue.city || ''}` : 'Stadyum',
        status: statusParsed,
        scoreHome: apiMatchDetails.goals?.home !== null ? Number(apiMatchDetails.goals.home) : 0,
        scoreAway: apiMatchDetails.goals?.away !== null ? Number(apiMatchDetails.goals.away) : 0,
        matchDetails: {
          statistics: apiMatchDetails.statistics || [],
          lineups: apiMatchDetails.lineups || [],
          events: apiMatchDetails.events || []
        }
      };
      await dbUpsertDocument('matches', docId, matchBriefPayload);

      setSuccessMsg(`Maç detay analizi '${fId}' kimliğiyle 'matchDetails' koleksiyonuna kaydedildi ve '${docId}' ana maç kartıyla birleştirildi.`);
      loadDatabaseCounts();
    } catch (err: any) {
      setErrorMsg(`Maç detayı veritabanına işlenirken hata: ${err.message}`);
    } finally {
      setSavingKey(null);
    }
  };

  // Quick Action Utilities
  const selectFenerbahceQuickly = () => {
    setTeamId("611");
    setTeamSearch("Fenerbahce");
    setCountry("Turkey");
    setLeagueId("203");
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-24 text-left font-sans text-slate-200">
      
      {/* Header and Brand context */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-fb-yellow/10 border border-fb-yellow/20 rounded-full text-[10px] font-black uppercase text-fb-yellow tracking-widest mb-3">
            <Cpu className="w-3 h-3" />
            Canlı API Veri Platformu
          </div>
          <h1 className="text-3xl font-display font-black text-white italic tracking-tight uppercase">
            FUTBOL VERİ MERKEZİ
          </h1>
          <p className="text-sm text-fb-muted mt-1.5 font-semibold">
            API-Football verilerini güvenli şekilde çekin, ön izleyin, kaydedin ve site içerikleriyle senkronize edin.
          </p>
        </div>

        {/* Current Admin user login tag checks per requirements */}
        <div className="p-3.5 rounded-2xl bg-[#0e1424] border border-white/[0.05] flex items-center gap-3 text-xs w-full md:w-auto">
          <div className="w-8 h-8 rounded-full border border-fb-yellow/20 bg-fb-navy flex items-center justify-center shrink-0">
            <KeyRound className="w-4 h-4 text-fb-yellow" />
          </div>
          <div>
            <p className="font-extrabold text-[#FFD21F] uppercase font-mono tracking-wider">GİRİŞ YETKİSİ KONTROLÜ</p>
            {currentUser ? (
              <p className="text-[10px] text-emerald-400 font-bold flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 block"></span>
                Yetkili Sürücü Girişi: {currentUser.email}
              </p>
            ) : (
              <p className="text-[10px] text-rose-400 font-bold flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 block animate-pulse"></span>
                GİRİŞ YOK: Yazma kısıtlı!
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Global Status/Error Board */}
      {(errorMsg || successMsg) && (
        <div className="space-y-2">
          {errorMsg && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex gap-3 items-start shadow-lg">
              <ShieldAlert className="w-5 h-5 shrink-0 text-rose-400" />
              <div>
                <strong className="block font-black uppercase tracking-wider mb-0.5">İŞLEM KISITLANDI / HATA</strong>
                <span className="font-semibold">{errorMsg}</span>
              </div>
            </div>
          )}
          {successMsg && !errorMsg && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex gap-3 items-center shadow-lg">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
              <div>
                <strong className="block font-black uppercase tracking-wider mb-0.5">BAŞARILI EYLEM</strong>
                <span className="font-semibold">{successMsg}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Navigation Sub-Tabs bar */}
      <div className="flex border-b border-white/[0.08] text-xs font-black uppercase tracking-wider font-mono overflow-x-auto scrollbar-none gap-1 bg-[#0a0f1d]/60 p-1 rounded-xl border border-white/5">
        {[
          { id: 'status', label: 'Bağlantı & Limit', icon: Activity },
          { id: 'leagues', label: 'Lig Yönetimi', icon: Trophy },
          { id: 'teams', label: 'Takım Yönetimi', icon: Star },
          { id: 'players', label: 'Kadro / Oyuncu', icon: Users },
          { id: 'fixtures', label: 'Fikstür / Maçlar', icon: Calendar },
          { id: 'standings', label: 'Puan Durumu', icon: ListTodo },
          { id: 'details', label: 'Maç İstatistikleri', icon: FileText },
          { id: 'preview', label: 'Veritabanı İzle', icon: Database },
        ].map((tabConfig) => {
          const Icon = tabConfig.icon;
          const isSelected = activeTab === tabConfig.id;
          return (
            <button
              key={tabConfig.id}
              onClick={() => {
                setActiveTab(tabConfig.id as any);
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`px-4 py-2.5 rounded-lg flex items-center gap-2 shrink-0 transition-all cursor-pointer ${
                isSelected 
                  ? 'bg-[#FFD21F] text-fb-navy font-black shadow-[0_4px_15px_rgba(255,210,31,0.15)]' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon size={14} />
              <span>{tabConfig.label}</span>
            </button>
          );
        })}
      </div>

      {/* Primary Grid Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Parameters & Configuration Control panel Card */}
        <div className="lg:col-span-1 rounded-2xl bg-[#0e1424] border border-white/[0.06] p-6 space-y-6">
          <div className="flex justify-between items-center pb-3 border-b border-white/[0.05]">
            <h2 className="text-xs font-black uppercase text-fb-yellow tracking-widest">
              Sistem Parametreleri
            </h2>
            <button 
              onClick={selectFenerbahceQuickly}
              className="text-[10px] font-black text-fb-yellow hover:text-white bg-fb-yellow/10 hover:bg-fb-yellow/20 px-2 py-1 rounded transition-all uppercase"
            >
              Fenerbahçe Hızlı Seç
            </button>
          </div>

          <div className="space-y-4 text-xs font-medium">
            
            {/* Country flag configuration */}
            <div>
              <label className="block text-slate-400 font-black tracking-wider uppercase mb-1.5 font-mono">
                ÜLKE (COUNTRY FILTER)
              </label>
              <input 
                type="text" 
                value={country} 
                onChange={(e) => setCountry(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#060a12] border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-fb-yellow font-semibold"
                placeholder="Örn: Turkey"
              />
            </div>

            {/* Team keyword query input */}
            <div>
              <label className="block text-slate-400 font-black tracking-wider uppercase mb-1.5 font-mono">
                TAKIM ARAMA KELİMESİ (TEAM QUERY)
              </label>
              <input 
                type="text" 
                value={teamSearch} 
                onChange={(e) => setTeamSearch(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#060a12] border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-fb-yellow font-semibold"
                placeholder="Örn: Fenerbahce"
              />
            </div>

            {/* Football start season input */}
            <div>
              <label className="block text-slate-400 font-black tracking-wider uppercase mb-1.5 font-mono">
                LİG SEZON YILI (SEASON SPEC)
              </label>
              <input 
                type="text" 
                value={season} 
                onChange={(e) => setSeason(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#060a12] border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-fb-yellow font-mono font-bold"
                placeholder="Örn: 2025"
              />
              <span className="text-[10px] text-slate-500 mt-1.5 block leading-relaxed">
                * Lig başlangıç yılı kullanılır (2025/2026 sezonu için 2025).
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              
              {/* League ID code */}
              <div>
                <label className="block text-slate-400 font-extrabold tracking-wider uppercase mb-1.5 font-mono">
                  LİG ID
                </label>
                <input 
                  type="text" 
                  value={leagueId} 
                  onChange={(e) => setLeagueId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#060a12] border border-white/10 text-white focus:outline-none focus:border-fb-yellow font-mono font-bold text-center"
                  placeholder="Süper Lig: 203"
                />
              </div>

              {/* Team ID code */}
              <div>
                <label className="block text-slate-400 font-extrabold tracking-wider uppercase mb-1.5 font-mono">
                  TAKIM ID
                </label>
                <input 
                  type="text" 
                  value={teamId} 
                  onChange={(e) => setTeamId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#060a12] border border-white/10 text-white focus:outline-none focus:border-fb-yellow font-mono font-bold text-center"
                  placeholder="FB: 611"
                />
              </div>

            </div>

            {/* Quick parameter cheatsheet display */}
            <div className="p-3 rounded-xl bg-[#060a12]/80 border border-white/5 space-y-2 text-[10px] text-fb-muted leading-relaxed font-semibold">
              <span className="block font-black text-slate-400 uppercase tracking-widest font-mono border-b border-white/5 pb-1 mb-1">Popüler API Referansları</span>
              <p>⚽ Trendyol Süper Lig ID: <strong className="text-fb-yellow font-mono">203</strong></p>
              <p>🛡️ Fenerbahçe SK Takım ID: <strong className="text-fb-yellow font-mono">611</strong></p>
              <p>🇪🇺 UEFA Europa League: ID <strong className="text-fb-yellow font-mono">3</strong></p>
            </div>

          </div>
        </div>

        {/* Tab-driven workspace output screen */}
        <div className="lg:col-span-2 space-y-6">

          {/* TAB 1 CONTENT: CONNECTION & LIMITS REPORT */}
          {activeTab === 'status' && (
            <div className="rounded-2xl bg-[#0e1424] border border-white/[0.06] p-6 space-y-6">
              <div className="flex justify-between items-center pb-3 border-b border-white/[0.04]">
                <h3 className="text-xs font-black uppercase text-fb-yellow tracking-wider flex items-center gap-2">
                  <Server className="w-4 h-4 text-fb-yellow" />
                  API BAĞLANTI RAPORU VE LİMİTLER
                </h3>
                <span className="text-[10px] text-slate-500 font-mono">/status endpoint</span>
              </div>

              <div className="p-4.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex gap-4 text-xs">
                <AlertTriangle className="w-5 h-5 shrink-0 text-amber-400 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-extrabold text-white uppercase font-mono tracking-wider">GÜNLÜK request LİMİT KONTROLÜ</h4>
                  <p className="text-[11px] text-slate-300 leading-snug font-medium">
                    Free developer paketinde günlük <strong className="text-amber-400 font-mono">100 adet</strong> istek hakkınız mevcuttur. Lütfen verileri tek bir seferde çekip ön izleyin, ardından "Veritabanına Yaz" komutuyla kalıcı olarak Firestore'a aktarın.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Visual Rate cards loaded dynamically from API-Sports */}
                <div className="p-4.5 bg-[#060a12] border border-white/[0.04] rounded-2xl space-y-2.5">
                  <span className="text-[10px] text-slate-500 font-black tracking-wider uppercase block">Yapılan İstekler</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-mono font-black text-white">{rateLimitInfo?.requests || '0'}</span>
                    <span className="text-[10px] text-slate-600 uppercase font-mono font-bold">Adet</span>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-[#FFD21F] h-1.5 rounded-full transition-all duration-500" 
                      style={{ width: `${Math.min(100, (Number(rateLimitInfo?.requests || 0) / 100) * 100)}%` }}
                    />
                  </div>
                </div>

                <div className="p-4.5 bg-[#060a12] border border-white/[0.04] rounded-2xl space-y-2.5">
                  <span className="text-[10px] text-slate-500 font-black tracking-wider uppercase block">Kalan Kota Limiti</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-mono font-black text-emerald-400">{rateLimitInfo?.remaining || '100'}</span>
                    <span className="text-[10px] text-slate-600 uppercase font-mono font-bold">Kalan</span>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500" 
                      style={{ width: `${Math.min(100, (Number(rateLimitInfo?.remaining || 100) / 100) * 100)}%` }}
                    />
                  </div>
                </div>

                <div className="p-4.5 bg-[#060a12] border border-white/[0.04] rounded-2xl space-y-2.5">
                  <span className="text-[10px] text-slate-500 font-black tracking-wider uppercase block">Günlük Maksimum Sınır</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-mono font-black text-indigo-400">{rateLimitInfo?.limit || '100'}</span>
                    <span className="text-[10px] text-slate-600 uppercase font-mono font-bold">Kapasite</span>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-indigo-500 h-1.5 rounded-full w-full" />
                  </div>
                </div>

              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={runTestConnection}
                  disabled={loading !== null}
                  className="px-5 py-3 rounded-xl bg-fb-yellow hover:bg-white text-fb-navy text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading === 'Status Bağlantı Testi' ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Activity className="w-4 h-4" />
                  )}
                  API Bağlantısını Test Et
                </button>
              </div>
            </div>
          )}

          {/* TAB 2 CONTENT: LEAGUE MANAGEMENT */}
          {activeTab === 'leagues' && (
            <div className="rounded-2xl bg-[#0e1424] border border-white/[0.06] p-6 space-y-6">
              <div className="flex justify-between items-center pb-3 border-b border-white/[0.04]">
                <h3 className="text-xs font-black uppercase text-fb-yellow tracking-wider flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-fb-yellow" />
                  LİG ARAMA VE SEÇİM MERKEZİ
                </h3>
                <span className="text-[10px] text-slate-500 font-mono font-bold uppercase">{country} lig listesi</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between p-4 bg-[#060a12]/80 border border-white/5 rounded-2xl">
                <p className="text-xxs text-fb-muted font-bold tracking-wide text-left max-w-sm leading-relaxed">
                  Belirtilen ülkedeki tüm ligleri çekin, ön izleyin ve Süper Lig (203) vb. ligleri veritabanına kaydedin veya varsayılan lig olarak tanımlayın.
                </p>
                <button
                  onClick={runFetchLeagues}
                  disabled={loading !== null}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
                >
                  {loading === 'Ligleri Çek' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trophy className="w-4 h-4" />}
                  Ülke Liglerini Çek
                </button>
              </div>

              {/* League results preview */}
              <div className="space-y-4">
                {!apiLeagues ? (
                  <div className="text-slate-500 py-12 text-center text-xs font-semibold italic border border-white/[0.03] border-dashed rounded-2xl bg-[#060a12]/30">
                    Henüz veri çekilmedi. "Ülke Liglerini Çek" butonuyla listeyi yükleyin.
                  </div>
                ) : apiLeagues.length === 0 ? (
                  <div className="text-slate-400 py-12 text-center text-xs font-semibold italic">
                    Eşleşen ülke ligi bulunamadı.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-white/[0.08] text-slate-400 font-black uppercase font-mono text-[10px] tracking-wider">
                          <th className="py-3">Logo</th>
                          <th className="py-3">Lig Adı</th>
                          <th className="py-3">Lig ID</th>
                          <th className="py-3">Ülke</th>
                          <th className="py-3 text-right">Eylemler</th>
                        </tr>
                      </thead>
                      <tbody>
                        {apiLeagues.map((item, idx) => {
                          const idVal = String(item.league?.id);
                          const isDefaultNow = defaultLeagueIdSaved === idVal;
                          return (
                            <tr key={idx} className="border-b border-white/[0.03] hover:bg-white/[0.01]">
                              <td className="py-3">
                                {item.league?.logo ? (
                                  <img src={item.league.logo} alt="" referrerPolicy="no-referrer" className="w-8 h-8 object-contain rounded bg-white/5 p-0.5" />
                                ) : (
                                  <span className="text-slate-550 font-mono">-</span>
                                )}
                              </td>
                              <td className="py-3 font-semibold text-white">
                                <div className="flex items-center gap-1.5">
                                  <span>{item.league?.name || 'Lig'}</span>
                                  {isDefaultNow && (
                                    <span className="px-1.5 py-0.5 bg-fb-yellow/15 text-fb-yellow border border-fb-yellow/20 rounded text-[8px] font-black uppercase font-mono">
                                      VARSAYILAN
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="py-3 font-mono text-fb-yellow font-black">{idVal}</td>
                              <td className="py-3 text-slate-350">{item.country?.name || country}</td>
                              <td className="py-3 text-right">
                                <div className="inline-flex gap-2">
                                  <button
                                    onClick={() => makeLeagueDefault(idVal)}
                                    disabled={savingKey !== null}
                                    className="px-2 py-1 rounded bg-[#060a12] border border-white/10 hover:border-fb-yellow text-slate-200 text-[10px] font-extrabold uppercase hover:text-fb-yellow"
                                    title="Taktik portalının varsayılan ligi yap"
                                  >
                                    Varsayılan Yap
                                  </button>
                                  <button
                                    onClick={() => saveLeagueToFirestore(item)}
                                    disabled={savingKey !== null}
                                    className="px-2 py-1 rounded bg-fb-yellow hover:bg-white text-fb-navy text-[10px] font-black uppercase"
                                  >
                                    {savingKey === `league-${idVal}` ? "..." : "Kaydet"}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3 CONTENT: TEAM MANAGEMENT */}
          {activeTab === 'teams' && (
            <div className="rounded-2xl bg-[#0e1424] border border-white/[0.06] p-6 space-y-6">
              <div className="flex justify-between items-center pb-3 border-b border-white/[0.04]">
                <h3 className="text-xs font-black uppercase text-fb-yellow tracking-wider flex items-center gap-2">
                  <Star className="w-4 h-4 text-fb-yellow" />
                  DİNAMİK TAKIM ARAMA MERKEZİ
                </h3>
                <span className="text-[10px] text-slate-500 font-mono font-bold uppercase">teams endpoint</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between p-4 bg-[#060a12]/80 border border-white/5 rounded-2xl">
                <p className="text-xxs text-fb-muted font-bold tracking-wide text-left max-w-sm leading-relaxed">
                  Sol tarafa yazacağınız kelime ile API'den takımları taratın. Fenerbahçe'yi (611) ve fikstürdeki diğer rakipleri buradan aratıp veritabanına amblem ve stadyum detaylarıyla kaydedin.
                </p>
                <button
                  onClick={runSearchTeams}
                  disabled={loading !== null}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-fb-yellow hover:bg-white text-fb-navy text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
                >
                  {loading === 'Takım Ara' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  Takımları API'den Ara
                </button>
              </div>

              {/* Team list results */}
              <div className="space-y-4">
                {!apiTeams ? (
                  <div className="text-slate-500 py-12 text-center text-xs font-semibold italic border border-white/[0.03] border-dashed rounded-2xl bg-[#060a12]/30">
                    Arama yapılmadı. Parametreleri ayarlayıp "Takımları API'den Ara" butonuna basın.
                  </div>
                ) : apiTeams.length === 0 ? (
                  <div className="text-slate-400 py-12 text-center text-xs font-semibold italic">
                    Aranan kelime ile eşleşen bir takım bulunamadı.
                  </div>
                ) : (
                  <div>
                    <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-emerald-500/10 border border-[#10b981]/25 p-3.5 rounded-xl text-xs">
                      <div className="text-xxs text-slate-300 font-semibold leading-relaxed">
                        Toplam <span className="font-bold text-emerald-400 font-mono text-xs">{apiTeams.length}</span> adet takım listelendi. Rakipleri tek tek veya toplu olarak kaydedebilirsiniz.
                      </div>
                      <button
                        onClick={saveAllTeamsToFirestore}
                        disabled={savingKey !== null}
                        className="px-3.5 py-1.5 rounded-lg bg-emerald-500 text-black font-black text-[10px] uppercase hover:bg-emerald-400 font-mono transition-all disabled:opacity-50"
                      >
                        {savingKey === 'all-teams' ? "KAYDEDİLİYOR..." : "TÜMÜNÜ TOPLU KAYDET"}
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-white/[0.08] text-slate-400 font-black uppercase font-mono text-[10px] tracking-wider">
                            <th className="py-3">Logo</th>
                            <th className="py-3">Takım Adı</th>
                            <th className="py-3">Takım ID</th>
                            <th className="py-3">Kod</th>
                            <th className="py-3">Kuruluş / Venue</th>
                            <th className="py-3 text-right">Eylem</th>
                          </tr>
                        </thead>
                        <tbody>
                          {apiTeams.map((item, index) => {
                            const isFb = item.team?.id === 611;
                            const tId = String(item.team?.id);
                            return (
                              <tr key={index} className={`border-b border-white/[0.03] hover:bg-white/[0.01] ${isFb ? 'bg-fb-yellow/5' : ''}`}>
                                <td className="py-3">
                                  {item.team?.logo ? (
                                    <img src={item.team.logo} alt="" referrerPolicy="no-referrer" className="w-8 h-8 object-contain rounded bg-white/5 p-0.5" />
                                  ) : (
                                    <span className="text-slate-600">-</span>
                                  )}
                                </td>
                                <td className="py-3 font-semibold text-white">
                                  <div className="flex items-center gap-1.5">
                                    <span className={isFb ? 'text-fb-yellow font-extrabold' : ''}>{item.team?.name || 'Takım'}</span>
                                    {isFb && (
                                      <span className="px-1 py-0.5 bg-[#FFD21F] text-fb-navy rounded text-[8px] font-black font-mono">DEF. CLB</span>
                                    )}
                                  </div>
                                </td>
                                <td className="py-3 font-mono text-fb-yellow font-black">{tId}</td>
                                <td className="py-3 font-mono text-slate-400 font-bold">{item.team?.code || '-'}</td>
                                <td className="py-3 text-slate-400 text-xxs leading-snug">
                                  <p>{item.team?.founded || 'Kuruluş Belirsiz'}</p>
                                  <p className="opacity-70 truncate max-w-[130px]">{item.venue?.name || '-'}</p>
                                </td>
                                <td className="py-3 text-right">
                                  <button
                                    onClick={() => saveTeamToFirestore(item)}
                                    disabled={savingKey !== null}
                                    className="px-2.5 py-1.5 rounded bg-fb-yellow hover:bg-white text-fb-navy text-[10px] font-black uppercase cursor-pointer"
                                  >
                                    {savingKey === `team-${tId}` ? "..." : "KAYDET"}
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4 CONTENT: PLAYERS/SQUAD MANAGEMENT */}
          {activeTab === 'players' && (
            <div className="rounded-2xl bg-[#0e1424] border border-white/[0.06] p-6 space-y-6">
              <div className="flex justify-between items-center pb-3 border-b border-white/[0.04]">
                <h3 className="text-xs font-black uppercase text-fb-yellow tracking-wider flex items-center gap-2">
                  <Users className="w-4 h-4 text-fb-yellow" />
                  KADRO ENTEGRASYON MERKEZİ
                </h3>
                <span className="text-[10px] text-slate-500 font-mono font-bold uppercase">players/squads?team={teamId}</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between p-4 bg-[#060a12]/80 border border-white/5 rounded-2xl">
                <p className="text-xxs text-fb-muted font-bold tracking-wide text-left max-w-sm leading-relaxed">
                  Takım ID parametresine göre tüm kadro oyuncularını API-Sports'tan çekin, Türkçe pozisyonlara eşleyin ve mükerrer oluşmadan oyuncu veritabanına yükleyin.
                </p>
                <button
                  onClick={runFetchSquad}
                  disabled={loading !== null}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-fb-yellow hover:bg-white text-fb-navy text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
                >
                  {loading === 'Kadroyu Çek' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Users className="w-4 h-4" />}
                  Fenerbahçe Kadrosunu Çek
                </button>
              </div>

              {/* Player collection list */}
              <div className="space-y-4">
                {!apiPlayers ? (
                  <div className="text-slate-500 py-12 text-center text-xs font-semibold italic border border-white/[0.03] border-dashed rounded-2xl bg-[#060a12]/30">
                    Kadro verisi yüklenmedi. "Fenerbahçe Kadrosunu Çek" butonunu kullanarak canlı kadro havuzunu indirin.
                  </div>
                ) : apiPlayers.length === 0 ? (
                  <div className="text-slate-400 py-12 text-center text-xs font-semibold italic">
                    Belirtilen takım havuzu için oyuncu bulunamadı. ID parametrelerini kontrol edin.
                  </div>
                ) : (
                  <div>
                    <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-[#FFD21F]/10 border border-[#FFD21F]/20 p-3.5 rounded-xl text-xs">
                      <div className="text-xxs text-slate-300 font-semibold leading-relaxed">
                        Toplam <span className="font-bold text-fb-yellow font-mono text-xs">{apiPlayers.length}</span> oyuncu çekildi. Bu verileri <strong className="text-fb-yellow font-mono">'players/plyr-api-ID'</strong> formatında senkronize edin.
                      </div>
                      <button
                        onClick={saveSquadToFirestore}
                        disabled={savingKey !== null}
                        className="px-4 py-2 bg-[#FFD21F] hover:bg-white text-fb-navy font-black text-[10px] uppercase font-mono tracking-wider rounded-lg shadow-md transition-all self-end sm:self-auto shrink-0 cursor-pointer disabled:opacity-50"
                      >
                        {savingKey === 'squad-to-db' ? "YAZILIYOR..." : "KADROYU VERİTABANINA YAZ"}
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-white/[0.08] text-slate-400 font-black uppercase font-mono text-[10px] tracking-wider">
                            <th className="py-2.5">Fotoğraf</th>
                            <th className="py-2.5">Oyuncu</th>
                            <th className="py-2.5">ID</th>
                            <th className="py-2.5">No</th>
                            <th className="py-2.5">Pozisyon (Mapped)</th>
                            <th className="py-2.5">Yaş / Uyruk</th>
                          </tr>
                        </thead>
                        <tbody>
                          {apiPlayers.map((plyr, idx) => {
                            let trPos = 'Ortasaha';
                            const rawPos = plyr.position || '';
                            if (rawPos === 'Goalkeeper') trPos = 'Kaleci';
                            else if (rawPos === 'Defender') trPos = 'Defans';
                            else if (rawPos === 'Midfielder') trPos = 'Ortasaha';
                            else if (rawPos === 'Attacker') trPos = 'Forvet';

                            return (
                              <tr key={idx} className="border-b border-white/[0.03] hover:bg-white/[0.01]">
                                <td className="py-2.5">
                                  {plyr.photo ? (
                                    <img src={plyr.photo} alt="" referrerPolicy="no-referrer" className="w-8 h-8 rounded-full border border-white/5 object-cover bg-white/5" />
                                  ) : (
                                    <span className="text-slate-600">-</span>
                                  )}
                                </td>
                                <td className="py-2.5 font-semibold text-white">{plyr.name || 'Bilinmiyor'}</td>
                                <td className="py-2.5 font-mono text-slate-400">{plyr.id}</td>
                                <td className="py-2.5 font-mono text-[#FFD21F] font-black">{plyr.number || '-'}</td>
                                <td className="py-2.5 uppercase font-mono text-[10px] text-slate-300">
                                  <span className="px-1.5 py-0.5 bg-white/5 rounded block w-fit border border-white/5 font-bold">
                                    {trPos} ({rawPos})
                                  </span>
                                </td>
                                <td className="py-2.5 font-mono text-xxs text-fb-muted leading-snug">
                                  <p>{plyr.age} Yaş</p>
                                  <p className="truncate max-w-[120px]">{plyr.nationality || 'Belirsiz'}</p>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5 CONTENT: FIXTURE MANAGEMENT */}
          {activeTab === 'fixtures' && (
            <div className="rounded-2xl bg-[#0e1424] border border-white/[0.06] p-6 space-y-6">
              <div className="flex justify-between items-center pb-3 border-b border-white/[0.04]">
                <h3 className="text-xs font-black uppercase text-fb-yellow tracking-wider flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-fb-yellow" />
                  RESMİ FİKSTÜR ENTEGRASYONU
                </h3>
                <span className="text-[10px] text-slate-500 font-mono font-bold uppercase">fixtures?team={teamId}&league={leagueId}</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between p-4 bg-[#060a12]/80 border border-white/5 rounded-2xl">
                <p className="text-xxs text-fb-muted font-bold tracking-wide text-left max-w-sm leading-relaxed">
                  Lig, Takım ve Sezon kriterlerine göre fikstür listesini indirin. Gerçek amblemler, skorlar, tarihler ve stadyum bilgileriyle veritabanına asenkronize kaydedilsin.
                </p>
                <button
                  onClick={runFetchFixtures}
                  disabled={loading !== null}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
                >
                  {loading === 'Fikstürleri Çek' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Calendar className="w-4 h-4" />}
                  Fikstürü Çek
                </button>
              </div>

              {/* Fixture preview render */}
              <div className="space-y-4">
                {!apiFixtures ? (
                  <div className="text-slate-500 py-12 text-center text-xs font-semibold italic border border-white/[0.03] border-dashed rounded-2xl bg-[#060a12]/30">
                    Fikstür havuzu indirilmedi. "Fikstürü Çek" butonuyla taratın.
                  </div>
                ) : apiFixtures.length === 0 ? (
                  <div className="text-slate-400 py-12 text-center text-xs font-semibold italic">
                    Belirtilen filtreler ile eşleşen bir fikstür eşleşmesi bulunamadı.
                  </div>
                ) : (
                  <div>
                    <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-[#10b981]/10 border border-[#10b981]/25 p-3.5 rounded-xl text-xs">
                      <div className="text-xxs text-slate-300 font-semibold leading-relaxed">
                        Toplam <span className="font-bold text-emerald-400 font-mono text-xs">{apiFixtures.length}</span> maç çekildi. Tümü kalıcı olarak matches koleksiyonuna yüklenecektir.
                      </div>
                      <button
                        onClick={saveFixturesToFirestore}
                        disabled={savingKey !== null}
                        className="px-4 py-2 bg-emerald-500 text-black font-black text-[10px] uppercase font-mono tracking-wider rounded-lg hover:bg-emerald-400 transition-all cursor-pointer disabled:opacity-50"
                      >
                        {savingKey === 'fixtures-to-db' ? "YAZILIYOR..." : "FİKSTÜRÜ VERİTABANINA KAYDET"}
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-white/[0.08] text-slate-400 font-black uppercase font-mono text-[10px] tracking-wider">
                            <th className="py-3">Maç ID / Tarih</th>
                            <th className="py-3">Eşleşme (Amblemler)</th>
                            <th className="py-3">Skor</th>
                            <th className="py-3">Durum (Short)</th>
                            <th className="py-3">Stadyum</th>
                          </tr>
                        </thead>
                        <tbody>
                          {apiFixtures.slice(0, 35).map((fxt, idx) => {
                            const date = fxt.fixture?.date 
                              ? new Date(fxt.fixture.date).toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) 
                              : 'Bilinmiyor';
                            const homeTeam = fxt.teams?.home?.name;
                            const awayTeam = fxt.teams?.away?.name;
                            const homeLogo = fxt.teams?.home?.logo;
                            const awayLogo = fxt.teams?.away?.logo;
                            const shortStatus = fxt.fixture?.status?.short || 'NS';
                            const isFinished = shortStatus === 'FT';

                            return (
                              <tr key={idx} className="border-b border-white/[0.03] hover:bg-white/[0.01]">
                                <td className="py-3 text-xxs font-mono leading-snug">
                                  <p className="text-fb-yellow font-bold select-all">#{fxt.fixture?.id}</p>
                                  <p className="text-slate-500 mt-0.5">{date}</p>
                                </td>
                                <td className="py-3 font-semibold">
                                  <div className="flex items-center gap-4 text-white">
                                    <div className="flex items-center gap-1.5 font-bold">
                                      {homeLogo && <img src={homeLogo} alt="" className="w-4.5 h-4.5 object-contain" referrerPolicy="no-referrer" />}
                                      <span>{homeTeam}</span>
                                    </div>
                                    <span className="text-slate-550 text-xxs block font-mono">VS</span>
                                    <div className="flex items-center gap-1.5 font-bold">
                                      {awayLogo && <img src={awayLogo} alt="" className="w-4.5 h-4.5 object-contain" referrerPolicy="no-referrer" />}
                                      <span>{awayTeam}</span>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-3 font-mono font-black text-fb-yellow">
                                  {fxt.goals?.home !== null && fxt.goals?.away !== null 
                                    ? `${fxt.goals.home} - ${fxt.goals.away}` 
                                    : 'v-v'}
                                </td>
                                <td className="py-3 font-mono text-[10px]">
                                  <span className={`inline-block px-1.5 py-0.5 rounded font-black uppercase text-center ${
                                    isFinished ? 'bg-slate-500/10 text-slate-400' : 'bg-green-500/10 text-green-400'
                                  }`}>
                                    {shortStatus}
                                  </span>
                                </td>
                                <td className="py-3 text-slate-450 text-xxs font-mono truncate max-w-[130px]" title={fxt.fixture?.venue?.name}>
                                  {fxt.fixture?.venue?.name || 'Bilinmiyor'}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 6 CONTENT: STANDINGS */}
          {activeTab === 'standings' && (
            <div className="rounded-2xl bg-[#0e1424] border border-white/[0.06] p-6 space-y-6">
              <div className="flex justify-between items-center pb-3 border-b border-white/[0.04]">
                <h3 className="text-xs font-black uppercase text-fb-yellow tracking-wider flex items-center gap-2">
                  <ListTodo className="w-4 h-4 text-fb-yellow" />
                  PUAN DURUMU CETVELİ ENTEGRASYONU
                </h3>
                <span className="text-[10px] text-slate-500 font-mono font-bold uppercase">standings?league={leagueId}</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between p-4 bg-[#060a12]/80 border border-white/5 rounded-2xl">
                <p className="text-xxs text-fb-muted font-bold tracking-wide text-left max-w-sm leading-relaxed">
                  İlgili ligin puan durumunu API sunucusundan indirin ve anasayfa widget'larında gösterilmesi amacıyla 'standings' koleksiyonuna sabitleyin.
                </p>
                <button
                  onClick={runFetchStandings}
                  disabled={loading !== null}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-fb-yellow hover:bg-white text-fb-navy text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
                >
                  {loading === 'Puan Durumunu Çek' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ListTodo className="w-4 h-4" />}
                  Puan Durumunu Çek
                </button>
              </div>

              {/* Standings table */}
              <div className="space-y-4">
                {!apiStandings ? (
                  <div className="text-slate-500 py-12 text-center text-xs font-semibold italic border border-white/[0.03] border-dashed rounded-2xl bg-[#060a12]/30">
                    Puan tablosu bilgisi yüklenmedi. "Puan Durumunu Çek" butonunu kullanın.
                  </div>
                ) : apiStandings.length === 0 ? (
                  <div className="text-slate-400 py-12 text-center text-xs font-semibold italic">
                    Belirtilen lig/sezon filtresine uygun puan tablosu kaydı bulunamadı.
                  </div>
                ) : (
                  <div>
                    <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-fb-yellow/10 border border-[#FFD21F]/20 p-3.5 rounded-xl text-xs">
                      <div className="text-xxs text-slate-300 font-semibold leading-relaxed">
                        Puan durumu başarıyla çekildi. Bu verileri veritabanına kaydedin.
                      </div>
                      <button
                        onClick={saveStandingsToFirestore}
                        disabled={savingKey !== null}
                        className="px-4 py-2 bg-[#FFD21F] text-black font-black text-[10px] uppercase font-mono tracking-wider rounded-lg hover:bg-white transition-all cursor-pointer disabled:opacity-50"
                      >
                        {savingKey === 'standings-to-db' ? "YAZILIYOR..." : "CETVELİ VERİTABANINA YAZ"}
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-white/[0.08] text-slate-400 font-extrabold uppercase font-mono text-[10px] tracking-wider">
                            <th className="py-2.5 pl-2">Sıra</th>
                            <th className="py-2.5">Takım</th>
                            <th className="py-2.5">OM</th>
                            <th className="py-2.5">G</th>
                            <th className="py-2.5">B</th>
                            <th className="py-2.5">M</th>
                            <th className="py-2.5">AV</th>
                            <th className="py-2.5 font-black text-[#FFD21F] font-mono text-right pr-2">Puan</th>
                          </tr>
                        </thead>
                        <tbody>
                          {apiStandings.map((teamRow, index) => {
                            const tName = teamRow.team?.name;
                            const tLogo = teamRow.team?.logo;
                            const isFB = tName?.toLowerCase().includes('fenerbahce') || teamRow.team?.id === 611;

                            return (
                              <tr 
                                key={index} 
                                className={`border-b border-white/[0.03] hover:bg-white/[0.01] ${
                                  isFB 
                                    ? 'bg-fb-yellow/5 border-l-2 border-l-fb-yellow shadow-[inset_1px_0_10px_rgba(255,210,31,0.03)]' 
                                    : ''
                                }`}
                              >
                                <td className="py-2.5 font-mono font-black pl-2">{teamRow.rank}</td>
                                <td className="py-2.5">
                                  <div className="flex items-center gap-2">
                                    {tLogo && <img src={tLogo} alt="" className="w-5 h-5 object-contain" referrerPolicy="no-referrer" />}
                                    <span className={`font-semibold ${isFB ? 'text-[#FFD21F] font-black' : 'text-slate-100'}`}>
                                      {tName}
                                    </span>
                                  </div>
                                </td>
                                <td className="py-2.5 font-mono">{teamRow.all?.played}</td>
                                <td className="py-2.5 font-mono text-emerald-400">{teamRow.all?.win}</td>
                                <td className="py-2.5 font-mono text-slate-400">{teamRow.all?.draw}</td>
                                <td className="py-2.5 font-mono text-rose-400">{teamRow.all?.lose}</td>
                                <td className="py-2.5 font-mono text-slate-450">{teamRow.goalsDiff}</td>
                                <td className="py-2.5 font-mono font-black text-[#FFD21F] text-sm text-right pr-2">{teamRow.points}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 7 CONTENT: SINGLE MATCH DETAILS */}
          {activeTab === 'details' && (
            <div className="rounded-2xl bg-[#0e1424] border border-white/[0.06] p-6 space-y-6">
              <div className="flex justify-between items-center pb-3 border-b border-white/[0.04]">
                <h3 className="text-xs font-black uppercase text-fb-yellow tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4 text-fb-yellow" />
                  MAÇ DETAY ANALİZ MERKEZİ (SAYISAL İSTATİSTİK)
                </h3>
                <span className="text-[10px] text-slate-500 font-mono font-bold uppercase">fixture details</span>
              </div>

              <div className="space-y-4">
                <p className="text-xxs leading-relaxed font-semibold text-fb-muted">
                  Fikstür sayfasından veya dışarıdan kopyalayacağınız Maç ID değerini buraya girerek ilgili müsabakanın tüm detaylı istatistiklerini (şutlar, paslar vb.) ve resmi kadrolarını çekerek ilgili match belgesinin içerisine entegre edebilirsiniz.
                </p>

                <div className="flex gap-3">
                  <input
                    type="text"
                    value={fixtureId}
                    onChange={(e) => setFixtureId(e.target.value)}
                    placeholder="Örn: 1045233"
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#060a12] border border-white/10 text-white focus:outline-none focus:border-fb-yellow font-mono text-xs font-bold"
                  />
                  <button
                    onClick={runFetchSingleMatchDetails}
                    disabled={loading !== null}
                    className="px-5 py-2.5 rounded-xl bg-[#FFD21F] hover:bg-white text-fb-navy text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
                  >
                    {loading === 'Maç Detaylarını Al' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    Detayları Çek
                  </button>
                </div>
              </div>

              {/* Single Match detailed preview screen */}
              <div className="space-y-4">
                {!apiMatchDetails ? (
                  <div className="text-slate-500 py-12 text-center text-xs font-semibold italic border border-white/[0.03] border-dashed rounded-2xl bg-[#060a12]/30">
                    Müsabaka analizi yüklenmedi. Geçerli bir Maç API ID değeri yazıp "Detayları Çek" butonuna basın.
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-emerald-500/10 border border-emerald-500/25 p-3.5 rounded-xl text-xs">
                      <div className="text-xxs text-slate-300 font-semibold leading-relaxed">
                        Müsabaka ({apiMatchDetails.teams?.home?.name} vs {apiMatchDetails.teams?.away?.name}) detaylı verileri alındı. Bu verileri entegre edin.
                      </div>
                      <button
                        onClick={saveMatchDetailsToFirestore}
                        disabled={savingKey !== null}
                        className="px-4 py-2 bg-emerald-500 text-black font-black text-[10px] uppercase font-mono tracking-wider rounded-lg hover:bg-emerald-400 transition-all cursor-pointer disabled:opacity-50"
                      >
                        {savingKey === 'match-details-to-db' ? "YAZILIYOR..." : "MAÇ ANALİZİNİ VERİTABANINA YAZ"}
                      </button>
                    </div>

                    <div className="bg-[#060a12] border border-white/5 rounded-2xl p-5 space-y-4 text-xs font-medium">
                      
                      {/* Match Meta information block */}
                      <div className="flex justify-between items-center border-b border-white/5 pb-3">
                        <span className="text-[10px] font-mono text-[#FFD21F] font-bold tracking-widest uppercase">MÜSABAKA BİLGİ KARTI</span>
                        <span className="text-[10px] text-slate-500 font-mono">ID: #{apiMatchDetails.fixture?.id}</span>
                      </div>

                      <div className="flex justify-center items-center gap-8 py-4">
                        <div className="text-center space-y-2">
                          <img src={apiMatchDetails.teams?.home?.logo} alt="" className="w-12 h-12 object-contain mx-auto" referrerPolicy="no-referrer" />
                          <p className="font-extrabold text-white">{apiMatchDetails.teams?.home?.name}</p>
                        </div>
                        <div className="text-center space-y-1">
                          <p className="text-2xl font-mono font-black text-fb-yellow">{apiMatchDetails.goals?.home} - {apiMatchDetails.goals?.away}</p>
                          <p className="text-[9px] font-mono text-slate-500 uppercase font-black tracking-widest">{apiMatchDetails.fixture?.status?.long}</p>
                        </div>
                        <div className="text-center space-y-2">
                          <img src={apiMatchDetails.teams?.away?.logo} alt="" className="w-12 h-12 object-contain mx-auto" referrerPolicy="no-referrer" />
                          <p className="font-extrabold text-white">{apiMatchDetails.teams?.away?.name}</p>
                        </div>
                      </div>

                      {/* Lineups statistics previews */}
                      {apiMatchDetails.statistics && apiMatchDetails.statistics.length > 0 ? (
                        <div className="mt-4 space-y-2.5">
                          <h4 className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest">Maç İçi Kritik İstatistikler</h4>
                          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                            {apiMatchDetails.statistics[0]?.statistics?.slice(0, 8).map((statRow: any, sIdx: number) => {
                              const awayValue = apiMatchDetails.statistics[1]?.statistics?.find((s: any) => s.type === statRow.type)?.value || '0';
                              return (
                                <div key={sIdx} className="p-2.5 bg-white/[0.02] border border-white/5 rounded-xl flex justify-between items-center text-xxs font-mono">
                                  <span className="font-bold text-slate-300">{statRow.value || '0'}</span>
                                  <span className="text-slate-500 uppercase font-semibold text-center text-[9px]">{statRow.type}</span>
                                  <span className="font-bold text-slate-300">{awayValue}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        <p className="text-slate-500 py-4 text-center italic text-xxs leading-snug">
                          * Bu müsabakaya ait istatistik verisi henüz girilmemiş veya maç oynanmamış.
                        </p>
                      )}

                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 8 CONTENT: LIVE DATABASE STATUS PREVIEW */}
          {activeTab === 'preview' && (
            <div className="rounded-2xl bg-[#0e1424] border border-white/[0.06] p-6 space-y-6">
              <div className="flex justify-between items-center pb-3 border-b border-white/[0.04]">
                <h3 className="text-xs font-black uppercase text-fb-yellow tracking-wider flex items-center gap-2">
                  <Database className="w-4 h-4 text-fb-yellow" />
                  VERİTABANI AKTİF DURUM PANELİ
                </h3>
                <span className="text-[10px] text-emerald-400 font-mono font-black animate-pulse flex items-center gap-1.5 align-middle">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 block"></span>
                  GÜNCEL DURUM
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { label: "Ligler (Leagues)", count: dbStats.leagues, color: "text-fb-yellow" },
                  { label: "Takımlar (Teams)", count: dbStats.teams, color: "text-[#38bdf8]" },
                  { label: "Kadro Oyuncuları (Players)", count: dbStats.players, color: "text-[#a78bfa]" },
                  { label: "Maçlar & Fikstürler (Matches)", count: dbStats.matches, color: "text-[#f43f5e]" },
                  { label: "Puan Durumları (Standings)", count: dbStats.standings, color: "text-[#fb923c]" },
                  { label: "Maç Detay Analizleri", count: dbStats.matchDetails, color: "text-[#10b981]" },
                ].map((statBox, bIdx) => (
                  <div key={bIdx} className="p-4 bg-[#060a12]/80 border border-white/[0.04] rounded-2xl space-y-2 text-left">
                    <span className="text-[10px] text-slate-500 font-black tracking-wider uppercase block truncate leading-none">
                      {statBox.label}
                    </span>
                    <p className={`text-25 font-mono font-black ${statBox.color} leading-none`}>
                      {statBox.count}
                    </p>
                    <span className="text-[9px] text-slate-600 block font-semibold">Taranan Kayıt Sayısı</span>
                  </div>
                ))}
              </div>

              {/* Sample Database Record inspect logs */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest pt-2 flex items-center gap-2">
                  <BookmarkCheck className="w-4 h-4 text-fb-yellow" />
                  Kayıt Örnekleri İnceleme (Top 5 Samples)
                </h4>
                
                <div className="space-y-3.5 max-h-96 overflow-y-auto pr-1">
                  {['matches', 'players', 'teams', 'standings'].map((collKey) => {
                    const sampleList = dbSamples[collKey] || [];
                    return (
                      <div key={collKey} className="p-4 bg-[#060a12]/50 border border-white/5 rounded-2xl text-xs space-y-2.5">
                        <div className="flex justify-between items-center text-xxs border-b border-white/5 pb-1.5 uppercase font-mono font-black">
                          <span className="text-[#FFD21F]">{collKey} Örnekleri</span>
                          <span className="text-slate-500">{sampleList.length} Örnek Listelendi</span>
                        </div>

                        {sampleList.length === 0 ? (
                          <p className="text-slate-550 italic text-xxs py-2 font-semibold">Bu koleksiyonda henüz kayıtlı veri bulunmuyor.</p>
                        ) : (
                          <div className="space-y-2 divide-y divide-white/5">
                            {sampleList.map((item, iIdx) => (
                              <div key={iIdx} className="pt-2 flex justify-between items-center text-xxs font-semibold">
                                <span className="text-white truncate max-w-[200px]">{item.name || item.homeTeam ? `${item.homeTeam} vs ${item.awayTeam}` : item.teamName || item.id}</span>
                                <span className="text-slate-450 font-mono text-[9px] select-all">ID: {item.id}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Developer Terminal Toggle with raw response payload parser */}
      {debugInfo && (
        <div className="rounded-2xl bg-[#060a12] border border-white/[0.06] p-6 space-y-4 shadow-2xl">
          <button
            onClick={() => setShowDeveloperConsole(!showDeveloperConsole)}
            className="w-full flex items-center justify-between font-mono text-xs uppercase font-black text-rose-400 text-left"
          >
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse block"></span>
              GELİŞTİRİCİ HATA AYIKLAMA TERMİNALİ (LOG CONSOLE)
            </span>
            <span className="text-fb-yellow underline cursor-pointer text-xxs">
              {showDeveloperConsole ? "DETAYLARI GİZLE" : "DETAYLARI GÖSTER"}
            </span>
          </button>

          {showDeveloperConsole && (
            <div className="space-y-4 font-mono text-[10.5px] leading-relaxed border-t border-white/5 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xxs">
                <div className="space-y-2">
                  <p><strong className="text-slate-500 uppercase font-bold">Aksiyon Adı:</strong> <span className="text-white font-extrabold">{debugInfo.action}</span></p>
                  <p><strong className="text-slate-500 uppercase font-bold">Backend İstek Yolu:</strong> <span className="text-sky-400 font-bold">{debugInfo.backendRoute}</span></p>
                  <p><strong className="text-slate-500 uppercase font-bold">Harici API URL'si:</strong> <span className="text-indigo-400 select-all font-bold">{debugInfo.externalEndpoint}</span></p>
                </div>
                <div className="space-y-2">
                  <p><strong className="text-slate-500 uppercase font-bold">HTTP Yanıt Kodu:</strong> <span className={`font-black ${String(debugInfo.statusCode).startsWith('2') ? 'text-green-400' : 'text-rose-400'}`}>{debugInfo.statusCode}</span></p>
                  <p><strong className="text-slate-500 uppercase font-bold">İçerik Biçimi:</strong> <span className="text-slate-350">{debugInfo.contentType}</span></p>
                  {debugInfo.rateLimits && (
                    <p><strong className="text-slate-500 uppercase font-bold">API Limit Ağ Raporu:</strong> <span className="text-emerald-400 font-extrabold">{debugInfo.rateLimits.remaining} Kalan / {debugInfo.rateLimits.requests} İstek</span></p>
                  )}
                </div>
              </div>

              {debugInfo.rawResponsePreview && (
                <div className="space-y-2.5">
                  <p className="text-[9px] text-[#FFD21F] font-black uppercase tracking-wider">Müsabaka / Ham JSON Yanıtı Ön İzleme:</p>
                  <pre className="p-4 bg-[#090d16] rounded-xl border border-white/5 text-slate-300 text-xxs max-h-56 overflow-y-auto whitespace-pre-wrap leading-relaxed select-all">
                    {debugInfo.rawResponsePreview}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default AdminApiTest;
