import React, { useState } from 'react';
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
  RefreshCw
} from 'lucide-react';
import { dbUpsertDocument } from '../../lib/dbService';

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
  // Config States
  const [country, setCountry] = useState<string>('Turkey');
  const [teamSearch, setTeamSearch] = useState<string>('Fenerbahce');
  const [season, setSeason] = useState<string>('2025');
  const [leagueId, setLeagueId] = useState<string>('203'); // default Süper Lig
  const [teamId, setTeamId] = useState<string>('611'); // default Fenerbahçe

  // Execution & Loading States
  const [loading, setLoading] = useState<string | null>(null);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Debug State
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);

  // Result States
  const [testResult, setTestResult] = useState<any | null>(null);
  const [rateLimitInfo, setRateLimitInfo] = useState<{
    remaining: string;
    limit: string;
    requests: string;
  } | null>(null);

  const [leagues, setLeagues] = useState<any[] | null>(null);
  const [teams, setTeams] = useState<any[] | null>(null);
  const [players, setPlayers] = useState<any[] | null>(null);
  const [fixtures, setFixtures] = useState<any[] | null>(null);
  const [standings, setStandings] = useState<any[] | null>(null);

  const [activeResultTab, setActiveResultTab] = useState<'status' | 'leagues' | 'teams' | 'players' | 'fixtures' | 'standings'>('status');

  // Generic request handler with content-type protection and debug capturing
  const handleApiRequest = async (
    actionKey: string, 
    endpoint: string, 
    onSuccess: (resData: any) => void
  ) => {
    setLoading(actionKey);
    setErrorMsg(null);
    setSuccessMsg(null);
    setDebugInfo(null);

    try {
      const response = await fetch(endpoint);
      const contentType = response.headers.get("content-type") || "";
      let resData: any = null;

      if (contentType.includes("application/json")) {
        resData = await response.json();
      } else {
        const rawText = await response.text();
        console.error("Backend response is not JSON:", rawText.slice(0, 200));
        
        const dbg: DebugInfo = {
          action: actionKey,
          backendRoute: endpoint,
          externalEndpoint: "Bilinmiyor (Sunucu proxy hatası)",
          statusCode: response.status,
          contentType: contentType,
          rawResponsePreview: rawText.slice(0, 300)
        };
        setDebugInfo(dbg);

        let trMsg = "API-Football yanıtı JSON formatında değil.";
        if (response.status === 404) {
          trMsg = "Backend route bulunamadı veya deploy edilmedi.";
        }
        throw new Error(trMsg);
      }

      // Populate debug information from JSON payload
      if (resData) {
        const dbg: DebugInfo = {
          action: actionKey,
          backendRoute: endpoint,
          externalEndpoint: resData.debug?.externalEndpoint || "Bilinmiyor",
          statusCode: resData.debug?.statusCode || response.status,
          contentType: resData.debug?.contentType || contentType,
          rawResponsePreview: resData.debug?.errorPreview || (resData.success ? undefined : JSON.stringify(resData, null, 2).slice(0, 300)),
          rateLimits: resData.headers ? {
            remaining: resData.headers.remaining,
            limit: resData.headers.limit,
            requests: resData.headers.requests
          } : undefined
        };
        setDebugInfo(dbg);

        if (resData.headers) {
          setRateLimitInfo({
            remaining: resData.headers.remaining,
            limit: resData.headers.limit,
            requests: resData.headers.requests
          });
        }
      }

      if (!resData.success) {
        let msg = resData.message || "API-Football verisi alınamadı.";
        
        // Match spec Turkish translations
        if (msg.toLowerCase().includes("key") || msg.toLowerCase().includes("token") || msg.toLowerCase().includes("anahtar") || resData.isApiError) {
          msg = "API anahtarı bulunamadı. APISPORTS_KEY secret ayarını kontrol edin.";
        } else if (msg.toLowerCase().includes("limit") || msg.toLowerCase().includes("exceeded")) {
          msg = "Günlük request limiti dolmuş olabilir.";
        } else if (msg.toLowerCase().includes("not found") || msg.toLowerCase().includes("endpoint")) {
          msg = "Backend route bulunamadı veya deploy edilmedi.";
        }
        throw new Error(msg);
      }

      onSuccess(resData);
      setSuccessMsg("API bağlantısı başarılı.");
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "API-Football verisi alınamadı.");
    } finally {
      setLoading(null);
    }
  };

  // Database synchronizers matching Lightweight sync strategy & Database write rule (using API IDs)
  const saveSquadToDb = async () => {
    if (!players || players.length === 0) return;
    setSavingKey('players');
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      let count = 0;
      for (const plyr of players) {
        const docId = `plyr-api-${plyr.id}`;
        let posTr = 'Ortasaha';
        const positionLong = plyr.position || '';
        if (positionLong === 'Goalkeeper') posTr = 'Kaleci';
        else if (positionLong === 'Defender') posTr = 'Defans';
        else if (positionLong === 'Midfielder') posTr = 'Ortasaha';
        else if (positionLong === 'Attacker') posTr = 'Forvet';

        const dataToSave = {
          id: docId,
          apiSportsId: Number(plyr.id),
          name: plyr.name,
          position: posTr,
          age: plyr.age || 26,
          nationality: plyr.nationality || 'Turkey',
          photo: plyr.photo || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop',
          number: plyr.number ? String(plyr.number) : '',
          formRating: "7.0",
          lastMatchRating: "7.0",
          trend: "stable",
          status: "active",
        };
        await dbUpsertDocument('players', docId, dataToSave);
        count++;
      }
      setSuccessMsg(`${count} oyuncu verisi 'players' koleksiyonuna başarıyla kaydedildi/güncellendi.`);
    } catch (e: any) {
      console.error(e);
      setErrorMsg("Kadro veritabanına kaydedilirken hata oluştu: " + e.message);
    } finally {
      setSavingKey(null);
    }
  };

  const saveFixturesToDb = async () => {
    if (!fixtures || fixtures.length === 0) return;
    setSavingKey('fixtures');
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      let count = 0;
      for (const fxt of fixtures) {
        const docId = `match-api-${fxt.fixture?.id}`;
        const venueName = fxt.fixture?.venue?.name || '';
        const venueCity = fxt.fixture?.venue?.city || '';
        const dataToSave = {
          id: docId,
          apiSportsId: Number(fxt.fixture?.id),
          homeTeam: fxt.teams?.home?.name || 'Bilinmiyor',
          awayTeam: fxt.teams?.away?.name || 'Bilinmiyor',
          homeLogo: fxt.teams?.home?.logo || '',
          awayLogo: fxt.teams?.away?.logo || '',
          competition: fxt.league?.name ? `${fxt.league.name} • ${fxt.league.round || 'Hafta'}` : 'Süper Lig',
          matchDate: fxt.fixture?.date || new Date().toISOString(),
          venue: venueCity ? `${venueName} / ${venueCity}` : venueName,
          status: fxt.fixture?.status?.short === 'FT' ? 'finished' : fxt.fixture?.status?.short === 'LIVE' || fxt.fixture?.status?.short === '1H' || fxt.fixture?.status?.short === '2H' ? 'live' : 'upcoming',
          scoreHome: fxt.goals?.home !== null ? Number(fxt.goals.home) : 0,
          scoreAway: fxt.goals?.away !== null ? Number(fxt.goals.away) : 0,
          matchPreview: "API-Football üzerinden indirilen taktik maçı.",
        };
        await dbUpsertDocument('matches', docId, dataToSave);
        count++;
      }
      setSuccessMsg(`${count} maç fikstürü 'matches' koleksiyonuna başarıyla kaydedildi/güncellendi.`);
    } catch (e: any) {
      console.error(e);
      setErrorMsg("Fikstür veritabanına kaydedilirken hata oluştu: " + e.message);
    } finally {
      setSavingKey(null);
    }
  };

  const saveStandingsToDb = async () => {
    if (!standings || standings.length === 0) return;
    setSavingKey('standings');
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const docId = `standings-api-${leagueId}-${season}`;
      const dataToSave = {
        id: docId,
        leagueId: Number(leagueId),
        season: Number(season),
        standingsList: standings.map(row => ({
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
      await dbUpsertDocument('standings', docId, dataToSave);
      setSuccessMsg(`Puan durumu '${docId}' anahtarıyla 'standings' koleksiyonuna başarıyla kaydedildi.`);
    } catch (e: any) {
      console.error(e);
      setErrorMsg("Puan durumu veritabanına kaydedilirken hata oluştu: " + e.message);
    } finally {
      setSavingKey(null);
    }
  };

  const saveTeamsToDb = async () => {
    if (!teams || teams.length === 0) return;
    setSavingKey('teams');
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      let count = 0;
      for (const item of teams) {
        const teamIdStr = `team-api-${item.team?.id}`;
        const dataToSave = {
          id: teamIdStr,
          apiSportsId: Number(item.team?.id),
          name: item.team?.name,
          shortName: item.team?.code || item.team?.name?.slice(0,3).toUpperCase(),
          logoUrl: item.team?.logo || '',
          logo: item.team?.logo || '',
          country: item.team?.country || 'Turkey',
          founded: item.team?.founded || null,
          venueName: item.venue?.name || '',
          venueCity: item.venue?.city || ''
        };
        await dbUpsertDocument('teams', teamIdStr, dataToSave);
        count++;
      }
      setSuccessMsg(`${count} takım detayı 'teams' koleksiyonuna ve logo haritalarına başarıyla kaydedildi/güncellendi.`);
    } catch (e: any) {
      console.error(e);
      setErrorMsg("Takımlar veritabanına kaydedilirken hata oluştu: " + e.message);
    } finally {
      setSavingKey(null);
    }
  };

  // 1. Connection Test
  const testConnection = () => {
    handleApiRequest('test', '/api/sports/test-connection', (res) => {
      setTestResult(res.data);
      if (res.headers) {
        setRateLimitInfo({
          remaining: res.headers.remaining,
          limit: res.headers.limit,
          requests: res.headers.requests
        });
      }
      setActiveResultTab('status');
    });
  };

  // 2. Turkey Leagues
  const fetchTurkeyLeagues = () => {
    handleApiRequest('leagues', `/api/sports/leagues?country=${encodeURIComponent(country)}`, (res) => {
      const list = res.data.response || [];
      setLeagues(list);
      setActiveResultTab('leagues');
    });
  };

  // 3. Search Fenerbahçe Team
  const findFenerbahceTeam = () => {
    handleApiRequest('teams', `/api/sports/teams?search=${encodeURIComponent(teamSearch)}&country=${encodeURIComponent(country)}`, (res) => {
      const list = res.data.response || [];
      setTeams(list);
      
      // Auto-set the discovered team ID if matches Fenerbahçe to make workflow easier
      if (list.length > 0) {
        const foundId = list[0].team?.id;
        if (foundId) {
          setTeamId(String(foundId));
        }
      }
      setActiveResultTab('teams');
    });
  };

  // 4. Fenerbahçe Squad
  const fetchFenerbahceSquad = () => {
    handleApiRequest('players', `/api/sports/squad?teamId=${teamId}`, (res) => {
      const squadData = res.data.response || [];
      // Flatten or retrieve players from response structure
      // response is usually like: [{ team: {}, players: [...] }]
      const playersList = squadData[0]?.players || [];
      setPlayers(playersList);
      setActiveResultTab('players');
    });
  };

  // 5. Fenerbahçe Fixtures
  const fetchFenerbahceFixtures = () => {
    handleApiRequest('fixtures', `/api/sports/fixtures?teamId=${teamId}&season=${season}&leagueId=${leagueId}`, (res) => {
      const list = res.data.response || [];
      setFixtures(list);
      setActiveResultTab('fixtures');
    });
  };

  // 6. Süper Lig Standings
  const fetchSuperLigStandings = () => {
    handleApiRequest('standings', `/api/sports/standings?leagueId=${leagueId}&season=${season}`, (res) => {
      const standingsData = res.data.response || [];
      // response: [{ league: { standings: [[...]] } }]
      const standingsList = standingsData[0]?.league?.standings?.[0] || [];
      setStandings(standingsList);
      setActiveResultTab('standings');
    });
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16 text-left">
      
      {/* Title block */}
      <div>
        <h1 className="text-2xl font-display font-black text-white italic tracking-tight uppercase">
          API TEST MERKEZİ
        </h1>
        <p className="text-sm text-fb-muted mt-1.5 font-semibold">
          API-Football (API-Sports) entegrasyonu için güvenli terminal ve test paneli.
        </p>
      </div>

      {/* Warnings & Limits Info Bar */}
      <div className="p-4.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 shrink-0">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <p className="text-xs font-black text-white uppercase tracking-wider font-mono">LİMİT UYARISI</p>
          <p className="text-[11px] text-slate-300 font-medium">
            Free planda günlük <strong className="text-amber-400">100 request</strong> vardır. Her test butonu bir veya birkaç request kullanabilir.
          </p>
        </div>
      </div>

      {/* Config Form and Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left column: Setup Parameters Card */}
        <div className="lg:col-span-1 rounded-2xl bg-[#0e1424] border border-white/[0.06] p-6 space-y-5">
          <h2 className="text-xs font-black uppercase text-fb-yellow tracking-widest pb-3 border-b border-white/[0.04]">
            Test Parametreleri
          </h2>

          <div className="space-y-4 text-xs">
            {/* Country */}
            <div>
              <label className="block text-slate-400 font-extrabold tracking-wider uppercase mb-1.5 font-mono">
                ÜLKE (Country)
              </label>
              <input 
                type="text" 
                value={country} 
                onChange={(e) => setCountry(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-[#060a12] border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-fb-yellow"
                placeholder="Örn: Turkey"
              />
            </div>

            {/* Team Search Keyword */}
            <div>
              <label className="block text-slate-400 font-extrabold tracking-wider uppercase mb-1.5 font-mono">
                TAKIM ARAMA KELİMESİ (Team Search)
              </label>
              <input 
                type="text" 
                value={teamSearch} 
                onChange={(e) => setTeamSearch(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-[#060a12] border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-fb-yellow"
                placeholder="Örn: Fenerbahce"
              />
            </div>

            {/* Football Season Year */}
            <div>
              <label className="block text-slate-400 font-extrabold tracking-wider uppercase mb-1.5 font-mono">
                SEZON (Season Start Year)
              </label>
              <input 
                type="text" 
                value={season} 
                onChange={(e) => setSeason(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-[#060a12] border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-fb-yellow font-mono"
                placeholder="Örn: 2025"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">API-Football'da lig başlangıç yılı kullanılır (örn. 2025/2026 için 2025).</span>
            </div>

            {/* League ID (editable) */}
            <div>
              <label className="block text-slate-400 font-extrabold tracking-wider uppercase mb-1.5 font-mono">
                LİG ID (League ID)
              </label>
              <input 
                type="text" 
                value={leagueId} 
                onChange={(e) => setLeagueId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-[#060a12] border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-fb-yellow font-mono"
                placeholder="Süper Lig: 203"
              />
            </div>

            {/* Team ID (editable) */}
            <div>
              <label className="block text-slate-400 font-extrabold tracking-wider uppercase mb-1.5 font-mono">
                TAKIM ID (Team ID)
              </label>
              <input 
                type="text" 
                value={teamId} 
                onChange={(e) => setTeamId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-[#060a12] border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-fb-yellow font-mono"
                placeholder="Fenerbahçe: 611"
              />
            </div>
          </div>
        </div>

        {/* Right column: Action Terminal and Results Grid */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Action Grid Buttons */}
          <div className="rounded-2xl bg-[#0e1424] border border-white/[0.06] p-6">
            <h2 className="text-xs font-black uppercase text-fb-yellow tracking-widest pb-4 border-b border-white/[0.04] mb-4">
              Güvenli Test Aksiyonları
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              
              {/* Button 1: Test connection */}
              <button
                onClick={testConnection}
                disabled={loading !== null}
                className="flex items-center gap-3 p-3.5 rounded-xl bg-[#060a12] border border-white/10 hover:border-fb-yellow text-left text-xs text-white font-bold transition-all hover:bg-white/[0.01] cursor-pointer disabled:opacity-50"
              >
                <div className="w-8 h-8 rounded-lg bg-[#FFD21F]/10 text-fb-yellow flex items-center justify-center shrink-0">
                  {loading === 'test' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Activity className="w-4 h-4" />}
                </div>
                <div>
                  <div className="text-white hover:text-fb-yellow transition-colors font-bold uppercase truncate">Bağlantıyı Test Et</div>
                  <div className="text-[10px] text-slate-500 font-mono">/status endpoint test</div>
                </div>
              </button>

              {/* Button 2: Turkey leagues */}
              <button
                onClick={fetchTurkeyLeagues}
                disabled={loading !== null}
                className="flex items-center gap-3 p-3.5 rounded-xl bg-[#060a12] border border-white/10 hover:border-emerald-500 text-left text-xs text-white font-bold transition-all hover:bg-white/[0.01] cursor-pointer disabled:opacity-50"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                  {loading === 'leagues' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trophy className="w-4 h-4" />}
                </div>
                <div>
                  <div className="text-white hover:text-emerald-400 transition-colors font-bold uppercase truncate">Türkiye Liglerini Çek</div>
                  <div className="text-[10px] text-slate-500 font-mono">leagues?country={country}</div>
                </div>
              </button>

              {/* Button 3: Search Fenerbahçe team */}
              <button
                onClick={findFenerbahceTeam}
                disabled={loading !== null}
                className="flex items-center gap-3 p-3.5 rounded-xl bg-[#060a12] border border-white/10 hover:border-fb-yellow text-left text-xs text-white font-bold transition-all hover:bg-white/[0.01] cursor-pointer disabled:opacity-50"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
                  {loading === 'teams' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                </div>
                <div>
                  <div className="text-white hover:text-[#FFD21F] transition-colors font-bold uppercase truncate">Fenerbahçe Takımını Bul</div>
                  <div className="text-[10px] text-slate-500 font-mono">teams?search={teamSearch}</div>
                </div>
              </button>

              {/* Button 4: Fenerbahçe squad */}
              <button
                onClick={fetchFenerbahceSquad}
                disabled={loading !== null}
                className="flex items-center gap-3 p-3.5 rounded-xl bg-[#060a12] border border-white/10 hover:border-sky-500 text-left text-xs text-white font-bold transition-all hover:bg-white/[0.01] cursor-pointer disabled:opacity-50"
              >
                <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center shrink-0">
                  {loading === 'players' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Users className="w-4 h-4" />}
                </div>
                <div>
                  <div className="text-white hover:text-sky-400 transition-colors font-bold uppercase truncate">Fenerbahçe Kadrosunu Çek</div>
                  <div className="text-[10px] text-slate-500 font-mono">players/squads?team={teamId}</div>
                </div>
              </button>

              {/* Button 5: Fenerbahçe fixtures */}
              <button
                onClick={fetchFenerbahceFixtures}
                disabled={loading !== null}
                className="flex items-center gap-3 p-3.5 rounded-xl bg-[#060a12] border border-white/10 hover:border-rose-500 text-left text-xs text-white font-bold transition-all hover:bg-white/[0.01] cursor-pointer disabled:opacity-50"
              >
                <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center shrink-0">
                  {loading === 'fixtures' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Calendar className="w-4 h-4" />}
                </div>
                <div>
                  <div className="text-white hover:text-rose-400 transition-colors font-bold uppercase truncate">Fenerbahçe Fikstürünü Çek</div>
                  <div className="text-[10px] text-slate-500 font-mono">fixtures?team={teamId}&season={season}</div>
                </div>
              </button>

              {/* Button 6: Standings */}
              <button
                onClick={fetchSuperLigStandings}
                disabled={loading !== null}
                className="flex items-center gap-3 p-3.5 rounded-xl bg-[#060a12] border border-white/10 hover:border-amber-500 text-left text-xs text-white font-bold transition-all hover:bg-white/[0.01] cursor-pointer disabled:opacity-50"
              >
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                  {loading === 'standings' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ListTodo className="w-4 h-4" />}
                </div>
                <div>
                  <div className="text-white hover:text-amber-500 transition-colors font-bold uppercase truncate">Süper Lig Puan Durumunu Çek</div>
                  <div className="text-[10px] text-slate-500 font-mono">standings?league={leagueId}&season={season}</div>
                </div>
              </button>

            </div>
          </div>

          {/* Messages Console Status Bar */}
          {(errorMsg || successMsg) && (
            <div className="p-4 rounded-xl text-xs font-semibold">
              {errorMsg && (
                <div className="flex gap-2.5 text-rose-400 items-start bg-rose-500/10 border border-rose-500/20 p-3.5 rounded-lg">
                  <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}
              {successMsg && !errorMsg && (
                <div className="flex gap-2.5 text-green-400 items-center bg-green-500/10 border border-green-500/20 p-3.5 rounded-lg">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}
            </div>
          )}

          {/* Results Viewer Output Screen */}
          <div className="rounded-2xl bg-[#0e1424] border border-white/[0.06] overflow-hidden">
            
            {/* Header Result Tabs */}
            <div className="flex border-b border-white/[0.04] bg-[#090d16] text-xxs font-black text-slate-400 uppercase tracking-widest font-mono overflow-x-auto scrollbar-none">
              <button 
                onClick={() => setActiveResultTab('status')}
                className={`px-5 py-3 border-r border-white/[0.04] shrink-0 hover:text-white transition-colors cursor-pointer ${activeResultTab === 'status' ? 'bg-[#0e1424] text-fb-yellow border-b border-b-fb-yellow' : ''}`}
              >
                Bağlantı Raporu
              </button>
              <button 
                onClick={() => setActiveResultTab('leagues')}
                className={`px-5 py-3 border-r border-white/[0.04] shrink-0 hover:text-white transition-colors cursor-pointer ${activeResultTab === 'leagues' ? 'bg-[#0e1424] text-fb-yellow border-b border-b-fb-yellow' : ''}`}
              >
                Ligler ({leagues?.length || 0})
              </button>
              <button 
                onClick={() => setActiveResultTab('teams')}
                className={`px-5 py-3 border-r border-white/[0.04] shrink-0 hover:text-white transition-colors cursor-pointer ${activeResultTab === 'teams' ? 'bg-[#0e1424] text-fb-yellow border-b border-b-fb-yellow' : ''}`}
              >
                Takımlar ({teams?.length || 0})
              </button>
              <button 
                onClick={() => setActiveResultTab('players')}
                className={`px-5 py-3 border-r border-white/[0.04] shrink-0 hover:text-white transition-colors cursor-pointer ${activeResultTab === 'players' ? 'bg-[#0e1424] text-fb-yellow border-b border-b-fb-yellow' : ''}`}
              >
                Kadro Ön İzle ({players?.length || 0})
              </button>
              <button 
                onClick={() => setActiveResultTab('fixtures')}
                className={`px-5 py-3 border-r border-white/[0.04] shrink-0 hover:text-white transition-colors cursor-pointer ${activeResultTab === 'fixtures' ? 'bg-[#0e1424] text-fb-yellow border-b border-b-fb-yellow' : ''}`}
              >
                Fikstür Ön İzle ({fixtures?.length || 0})
              </button>
              <button 
                onClick={() => setActiveResultTab('standings')}
                className={`px-5 py-3 shrink-0 hover:text-white transition-colors cursor-pointer ${activeResultTab === 'standings' ? 'bg-[#0e1424] text-fb-yellow border-b border-b-fb-yellow' : ''}`}
              >
                Puan Durumu ({standings?.length || 0})
              </button>
            </div>

            {/* Results Content Area */}
            <div className="p-6">
              
              {/* Tab 1: Connection Health & API limits metadata */}
              {activeResultTab === 'status' && (
                <div className="space-y-6">
                  {rateLimitInfo ? (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="p-4 bg-[#060a12] border border-white/[0.04] rounded-xl">
                        <span className="text-[10px] text-slate-500 font-extrabold tracking-wider uppercase block mb-1">DERS KULLANIMI</span>
                        <span className="text-xl font-mono font-black text-white">{rateLimitInfo.requests}</span>
                        <span className="text-slate-600 text-[10px] uppercase font-mono block mt-1">Yapılan İstekler</span>
                      </div>
                      <div className="p-4 bg-[#060a12] border border-white/[0.04] rounded-xl">
                        <span className="text-[10px] text-slate-500 font-extrabold tracking-wider uppercase block mb-1">KADAN KOTANIZ</span>
                        <span className="text-xl font-mono font-black text-emerald-400">{rateLimitInfo.remaining}</span>
                        <span className="text-slate-600 text-[10px] uppercase font-mono block mt-1">Kalan Limit</span>
                      </div>
                      <div className="p-4 bg-[#060a12] border border-white/[0.04] rounded-xl">
                        <span className="text-[10px] text-slate-500 font-extrabold tracking-wider uppercase block mb-1">GÜNLÜK MAX LİMİT</span>
                        <span className="text-xl font-mono font-black text-indigo-400">{rateLimitInfo.limit}</span>
                        <span className="text-slate-600 text-[10px] uppercase font-mono block mt-1">Teklif Sınırı</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-slate-500 py-8 text-center text-xs font-semibold italic">
                      Henüz bağlantı testi başlatılmadı. "Bağlantıyı Test Et" butonuna basarak API limits kontrolü yapabilirsiniz.
                    </div>
                  )}

                  {testResult && (
                    <div className="bg-[#060a12] rounded-xl border border-white/[0.04] p-4.5 space-y-3.5">
                      <div className="flex justify-between items-center text-xs pb-2 border-b border-white/[0.04]">
                        <span className="font-extrabold text-slate-400 uppercase tracking-widest font-mono">Status API Raw Response</span>
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-green-500/10 border border-green-500/20 rounded text-green-400 text-[10px] font-black font-mono">ONLINE</span>
                      </div>
                      <pre className="text-xxs font-mono text-slate-300 overflow-x-auto text-left leading-relaxed">
                        {JSON.stringify(testResult, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Leagus list template */}
              {activeResultTab === 'leagues' && (
                <div className="overflow-x-auto">
                  {!leagues ? (
                    <div className="text-slate-500 py-8 text-center text-xs font-semibold italic">
                      Haddizatında veri bulunmuyor. Yukarından "Türkiye Liglerini Çek" butonuna basın.
                    </div>
                  ) : leagues.length === 0 ? (
                    <div className="text-slate-500 py-8 text-center text-xs font-semibold italic">
                      Ülke için lig bulunamadı.
                    </div>
                  ) : (
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-white/[0.06] text-slate-400 font-extrabold uppercase font-mono text-[10px] tracking-wider">
                          <th className="py-2.5">Logo</th>
                          <th className="py-2.5">Lig Adı</th>
                          <th className="py-2.5">Lig ID</th>
                          <th className="py-2.5">Ülke</th>
                          <th className="py-2.5">Mevcut Sezon</th>
                        </tr>
                      </thead>
                      <tbody>
                        {leagues.map((item, index) => (
                          <tr key={index} className="border-b border-white/[0.03] hover:bg-white/[0.01]">
                            <td className="py-3">
                              {item.league?.logo ? (
                                <img src={item.league.logo} alt="" referrerPolicy="no-referrer" className="w-6 h-6 object-contain" />
                              ) : (
                                <span className="text-slate-600">-</span>
                              )}
                            </td>
                            <td className="py-3 font-semibold text-white">{item.league?.name || 'Belirsiz'}</td>
                            <td className="py-3 font-mono text-fb-yellow font-black">{item.league?.id}</td>
                            <td className="py-3 text-slate-300">{item.country?.name || 'Turkey'}</td>
                            <td className="py-3 font-mono">{item.seasons?.find((s: any) => s.current)?.year || item.seasons?.[item.seasons.length - 1]?.year || season}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {/* Tab 3: Teams Search result */}
              {activeResultTab === 'teams' && (
                <div className="overflow-x-auto">
                  {!teams ? (
                    <div className="text-slate-500 py-8 text-center text-xs font-semibold italic">
                      Veri bulunmuyor. "Fenerbahçe Takımını Bul" butonuna basın.
                    </div>
                  ) : teams.length === 0 ? (
                    <div className="text-slate-500 py-8 text-center text-xs font-semibold italic">
                      Arama sonucuyla eşleşen takım bulunamadı.
                    </div>
                  ) : (
                    <div>
                      <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 p-3.5 rounded-xl">
                        <div className="text-xxs text-slate-355 font-semibold uppercase tracking-wider font-mono">
                          Alınan <span className="font-bold text-emerald-400 font-mono">{teams.length}</span> takımı veritabanına kaydedebilir ve logo haritalarını senkronize edebilirsiniz.
                        </div>
                        <button
                          onClick={saveTeamsToDb}
                          disabled={savingKey !== null}
                          className="px-4 py-1.5 rounded-lg bg-emerald-500 font-black text-[10px] text-black uppercase tracking-wider hover:bg-emerald-400 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer transition-all self-end sm:self-auto shrink-0"
                        >
                          {savingKey === 'teams' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                          Veritabanına Kaydet
                        </button>
                      </div>

                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-white/[0.06] text-slate-400 font-extrabold uppercase font-mono text-[10px] tracking-wider">
                            <th className="py-2.5">Logo</th>
                            <th className="py-2.5">Takım Adı</th>
                            <th className="py-2.5">Takım ID</th>
                            <th className="py-2.5">Ülke</th>
                            <th className="py-2.5">Kuruluş</th>
                            <th className="py-2.5">Stadyum (Venue)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {teams.map((item, index) => (
                            <tr key={index} className="border-b border-white/[0.03] hover:bg-white/[0.01]">
                              <td className="py-3">
                                {item.team?.logo ? (
                                  <img src={item.team.logo} alt="" referrerPolicy="no-referrer" className="w-6 h-6 object-contain" />
                                ) : (
                                  <span className="text-slate-600">-</span>
                                )}
                              </td>
                              <td className="py-3 font-semibold text-white">{item.team?.name || 'Belirsiz'}</td>
                              <td className="py-3 font-mono text-fb-yellow font-black">{item.team?.id}</td>
                              <td className="py-3 text-slate-300">{item.team?.country}</td>
                              <td className="py-3 font-mono">{item.team?.founded || 'Bilinmiyor'}</td>
                              <td className="py-3 text-slate-400 text-xxs leading-snug">
                                {item.venue?.name} ({item.venue?.city || 'Bilinmiyor'})
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 4: Player Squad */}
              {activeResultTab === 'players' && (
                <div className="overflow-x-auto">
                  {!players ? (
                    <div className="text-slate-500 py-8 text-center text-xs font-semibold italic">
                      Kadro listesi çekilmedi. "Fenerbahçe Kadrosunu Çek" butonuna basın.
                    </div>
                  ) : players.length === 0 ? (
                    <div className="text-slate-500 py-8 text-center text-xs font-semibold italic">
                      Kadro verisi bulunmuyor veya takım ID'sini güncelleyin.
                    </div>
                  ) : (
                    <div>
                      <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-fb-yellow/10 border border-fb-yellow/20 p-3.5 rounded-xl">
                        <div className="text-xxs text-slate-350 font-semibold uppercase tracking-wider font-mono">
                          Alınan <span className="font-bold text-fb-yellow font-mono">{players.length}</span> oyuncuyu players koleksiyonuna senkronize ederek saklayın.
                        </div>
                        <button
                          onClick={saveSquadToDb}
                          disabled={savingKey !== null}
                          className="px-4 py-1.5 rounded-lg bg-[#FFD21F] font-black text-[10px] text-black uppercase tracking-wider hover:bg-[#ffe366] disabled:opacity-50 flex items-center gap-1.5 cursor-pointer transition-all self-end sm:self-auto shrink-0"
                        >
                          {savingKey === 'players' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                          Kadro Veritabanına Yaz
                        </button>
                      </div>

                      <table className="w-full text-left border-collapse text-xs font-medium">
                        <thead>
                          <tr className="border-b border-white/[0.06] text-slate-400 font-extrabold uppercase font-mono text-[10px] tracking-wider">
                            <th className="py-2.5">Fotoğraf</th>
                            <th className="py-2.5">Futbolcu</th>
                            <th className="py-2.5">Oyuncu ID</th>
                            <th className="py-2.5">Numara</th>
                            <th className="py-2.5">Pozisyon</th>
                            <th className="py-2.5">Yaş</th>
                          </tr>
                        </thead>
                        <tbody>
                          {players.map((plyr, index) => (
                            <tr key={index} className="border-b border-white/[0.03] hover:bg-white/[0.01]">
                              <td className="py-2">
                                {plyr.photo ? (
                                  <img src={plyr.photo} alt="" referrerPolicy="no-referrer" className="w-8 h-8 rounded-full bg-white/[0.02] border border-white/5 object-cover" />
                                ) : (
                                  <span className="text-slate-600">-</span>
                                )}
                              </td>
                              <td className="py-2 font-semibold text-white">{plyr.name || 'Bilinmiyor'}</td>
                              <td className="py-2 font-mono text-slate-400">{plyr.id}</td>
                              <td className="py-2 font-mono text-fb-yellow font-black">{plyr.number || '-'}</td>
                              <td className="py-2 uppercase font-mono text-xxs">{plyr.position || '-'}</td>
                              <td className="py-2 font-mono">{plyr.age || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 5: Fixtures */}
              {activeResultTab === 'fixtures' && (
                <div className="overflow-x-auto">
                  {!fixtures ? (
                    <div className="text-slate-500 py-8 text-center text-xs font-semibold italic">
                      Fikstür çekilmedi. "Fenerbahçe Fikstürünü Çek" butonuna basın.
                    </div>
                  ) : fixtures.length === 0 ? (
                    <div className="text-slate-500 py-8 text-center text-xs font-semibold italic">
                      Belirtilen parametreler ve sezon için fikstür bulunamadı.
                    </div>
                  ) : (
                    <div>
                      <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 p-3.5 rounded-xl">
                        <div className="text-xxs text-slate-350 font-semibold uppercase tracking-wider font-mono">
                          Alınan <span className="font-bold text-emerald-400 font-mono">{fixtures.length}</span> maçı matches koleksiyonuna yükleyerek fikstür analizi için hazırlayabilirsiniz.
                        </div>
                        <button
                          onClick={saveFixturesToDb}
                          disabled={savingKey !== null}
                          className="px-4 py-1.5 rounded-lg bg-emerald-500 font-black text-[10px] text-black uppercase tracking-wider hover:bg-emerald-400 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer transition-all self-end sm:self-auto shrink-0"
                        >
                          {savingKey === 'fixtures' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                          Fikstürü Kaydet
                        </button>
                      </div>

                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-white/[0.06] text-slate-400 font-extrabold uppercase font-mono text-[10px] tracking-wider">
                            <th className="py-2.5">Künye</th>
                            <th className="py-2.5">Rakip / Eşleşme</th>
                            <th className="py-2.5">Skor</th>
                            <th className="py-2.5">Durum (Status)</th>
                            <th className="py-2.5">Stadyum</th>
                          </tr>
                        </thead>
                        <tbody>
                          {fixtures.slice(0, 30).map((fxt, index) => {
                            const date = fxt.fixture?.date ? new Date(fxt.fixture.date).toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Bilinmiyor';
                            const leagueName = fxt.league?.name || 'Lig';
                            const venueName = fxt.fixture?.venue?.name || 'Bilinmiyor';
                            
                            const homeTeam = fxt.teams?.home?.name;
                            const awayTeam = fxt.teams?.away?.name;

                            const homeLogo = fxt.teams?.home?.logo;
                            const awayLogo = fxt.teams?.away?.logo;

                            const homeGoals = fxt.goals?.home;
                            const awayGoals = fxt.goals?.away;
                            
                            const isFinished = fxt.fixture?.status?.short === 'FT';

                            return (
                              <tr key={index} className="border-b border-white/[0.03] hover:bg-white/[0.01]">
                                <td className="py-3 text-[10px] font-mono leading-relaxed space-y-0.5">
                                  <p className="text-[#FFD21F] font-bold">{leagueName}</p>
                                  <p className="text-slate-500">{date}</p>
                                </td>
                                <td className="py-3">
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold text-white flex items-center gap-1">
                                      {homeLogo && <img src={homeLogo} alt="" className="w-4 h-4 object-contain inline" referrerPolicy="no-referrer" />} {homeTeam}
                                    </span>
                                    <span className="text-slate-600 text-xxs font-bold">vs</span>
                                    <span className="font-semibold text-white flex items-center gap-1">
                                      {awayLogo && <img src={awayLogo} alt="" className="w-4 h-4 object-contain inline" referrerPolicy="no-referrer" />} {awayTeam}
                                    </span>
                                  </div>
                                </td>
                                <td className="py-3 font-mono font-black text-fb-yellow">
                                  {homeGoals !== null && awayGoals !== null ? `${homeGoals} - ${awayGoals}` : 'Oynanmadı'}
                                </td>
                                <td className="py-3">
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-black uppercase font-mono ${
                                    isFinished ? 'bg-slate-500/10 text-slate-300' : 'bg-green-500/10 text-green-400'
                                  }`}>
                                    {fxt.fixture?.status?.long || 'Bilinmiyor'}
                                  </span>
                                </td>
                                <td className="py-3 text-slate-400 text-xxs select-all max-w-[140px] truncate">{venueName}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 6: Standings Table */}
              {activeResultTab === 'standings' && (
                <div className="overflow-x-auto">
                  {!standings ? (
                    <div className="text-slate-500 py-8 text-center text-xs font-semibold italic">
                      Puan durumu analizi yapılmadı. "Süper Lig Puan Durumunu Çek" butonuna basın.
                    </div>
                  ) : standings.length === 0 ? (
                    <div className="text-slate-500 py-8 text-center text-xs font-semibold italic">
                      Gönderilen parametre ve sezona uygun puan durumu tablosu verisi alınamadı.
                    </div>
                  ) : (
                    <div>
                      <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-[#FFD21F]/10 border border-[#FFD21F]/20 p-3.5 rounded-xl">
                        <div className="text-xxs text-slate-350 font-semibold uppercase tracking-wider font-mono">
                          Alınan lig puan cetvelini site anasayfası ve puan durumu tablosu için 'standings' koleksiyonuna sabitleyin.
                        </div>
                        <button
                          onClick={saveStandingsToDb}
                          disabled={savingKey !== null}
                          className="px-4 py-1.5 rounded-lg bg-[#FFD21F] font-black text-[10px] text-black uppercase tracking-wider hover:bg-[#ffe366] disabled:opacity-50 flex items-center gap-1.5 cursor-pointer transition-all self-end sm:self-auto shrink-0"
                        >
                          {savingKey === 'standings' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                          Cetveli Veritabanına Yaz
                        </button>
                      </div>

                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-white/[0.06] text-slate-400 font-extrabold uppercase font-mono text-[10px] tracking-wider">
                            <th className="py-2.5">Sıra</th>
                            <th className="py-2.5">Takım</th>
                            <th className="py-2.5">O</th>
                            <th className="py-2.5">G</th>
                            <th className="py-2.5">B</th>
                            <th className="py-2.5">M</th>
                            <th className="py-2.5">A</th>
                            <th className="py-2.5">Y</th>
                            <th className="py-2.5 font-black text-fb-yellow font-mono">Puan</th>
                          </tr>
                        </thead>
                        <tbody>
                          {standings.map((teamRow, index) => {
                            const tName = teamRow.team?.name;
                            const tLogo = teamRow.team?.logo;
                            const isFB = tName?.toLowerCase().includes('fenerbahce') || teamRow.team?.id === 611;

                            return (
                              <tr key={index} className={`border-b border-white/[0.03] hover:bg-white/[0.01] ${isFB ? 'bg-fb-yellow/5 border-l-2 border-l-fb-yellow' : ''}`}>
                                <td className="py-2.5 font-mono font-black pl-1">{teamRow.rank}</td>
                                <td className="py-2.5">
                                  <div className="flex items-center gap-2">
                                    {tLogo && <img src={tLogo} alt="" className="w-4 h-4 object-contain" referrerPolicy="no-referrer" />}
                                    <span className={`font-semibold ${isFB ? 'text-fb-yellow font-black' : 'text-white'}`}>{tName}</span>
                                  </div>
                                </td>
                                <td className="py-2.5 font-mono">{teamRow.all?.played}</td>
                                <td className="py-2.5 font-mono text-green-400">{teamRow.all?.win}</td>
                                <td className="py-2.5 font-mono text-slate-400">{teamRow.all?.draw}</td>
                                <td className="py-2.5 font-mono text-rose-400">{teamRow.all?.lose}</td>
                                <td className="py-2.5 font-mono text-slate-400">{teamRow.all?.goals?.for}</td>
                                <td className="py-2.5 font-mono text-slate-400">{teamRow.all?.goals?.against}</td>
                                <td className="py-2.5 font-mono font-black text-fb-yellow text-sm">{teamRow.points}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

            </div>

          </div>

          {/* Core Debug and Telemetry Console */}
          {debugInfo && (
            <div className="rounded-2xl bg-[#060a12] border border-white/[0.06] p-6 space-y-4 font-mono text-xs shadow-xl">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 text-xxs tracking-wider uppercase font-black text-rose-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse font-sans"></span>
                  TERMİNAL HATA AYIKLAMA (DEBUG TERMINAL)
                </span>
                <span className="text-slate-500">ADMIN SECURE INFO</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xxs leading-relaxed">
                <div className="space-y-2">
                  <p><strong className="text-slate-500 uppercase font-bold">Tetiklenen Aksiyon:</strong> <span className="text-white font-black">{debugInfo.action}</span></p>
                  <p><strong className="text-slate-500 uppercase font-bold">Yapılan Backend Route:</strong> <span className="text-sky-400">{debugInfo.backendRoute}</span></p>
                  <p><strong className="text-slate-500 uppercase font-bold">Gerçekleşen Dış API:</strong> <span className="text-indigo-400 select-all">{debugInfo.externalEndpoint}</span></p>
                </div>
                <div className="space-y-2">
                  <p><strong className="text-slate-500 uppercase font-bold">HTTP Status Code:</strong> <span className={`font-black ${String(debugInfo.statusCode).startsWith('2') ? 'text-green-400' : 'text-rose-400'}`}>{debugInfo.statusCode}</span></p>
                  <p><strong className="text-slate-500 uppercase font-bold">Giriş/İçerik Tipi:</strong> <span className="text-slate-350 font-semibold">{debugInfo.contentType}</span></p>
                  {debugInfo.rateLimits && (
                    <p><strong className="text-slate-500 uppercase font-bold">Sunucu API Limitleri:</strong> <span className="text-emerald-400 font-black">{debugInfo.rateLimits.remaining} Kalan / {debugInfo.rateLimits.requests} Yapılan ({debugInfo.rateLimits.limit} Limit)</span></p>
                  )}
                </div>
              </div>

              {debugInfo.rawResponsePreview && (
                <div className="mt-3.5 space-y-1.5 leading-relaxed">
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Ham Yanıt Ön İzleme (HTTP Payload / Error Body Preview):</p>
                  <pre className="p-3.5 bg-[#0c1220] rounded-xl border border-white/5 text-slate-300 text-[10px] select-all max-h-48 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                    {debugInfo.rawResponsePreview}
                  </pre>
                </div>
              )}
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
