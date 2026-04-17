export interface LiveFixtureItem {
  id: string;
  date: string;
  home: string;
  away: string;
  competition: string;
  note?: string;
  status: string;
  homeScore?: string;
  awayScore?: string;
}

export interface MatchStatItem {
  key: string;
  label: string;
  homeValue: string;
  awayValue: string;
}

export interface MatchEventItem {
  id: string;
  minute: string;
  team: string;
  type: string;
  text: string;
}

export interface LineupPlayer {
  name: string;
  jersey?: string;
  position?: string;
}

export interface TeamLineup {
  teamName: string;
  formation?: string;
  starters: LineupPlayer[];
  bench: LineupPlayer[];
}

export interface PlayerLeaderItem {
  key: string;
  label: string;
  players: {
    name: string;
    team: string;
    value: string;
  }[];
}

export interface StandingsImpact {
  summary: string;
  table: {
    rank: string;
    team: string;
    points: string;
    played: string;
    goalDiff?: string;
  }[];
  note?: string;
}

export interface LiveMatchSnapshot {
  updatedAt: string;
  currentMatch?: {
    id: string;
    date: string;
    competition: string;
    venue?: string;
    homeTeam: string;
    awayTeam: string;
    homeLogo?: string;
    awayLogo?: string;
    homeScore?: string;
    awayScore?: string;
    statusText: string;
    statusState: 'pre' | 'in' | 'post';
    formHome?: string;
    formAway?: string;
    homeRecord?: string;
    awayRecord?: string;
  };
  fixtures: LiveFixtureItem[];
  stats: MatchStatItem[];
  events: MatchEventItem[];
  leaders: PlayerLeaderItem[];
  standingsImpact?: StandingsImpact;
  lineups?: {
    home?: TeamLineup;
    away?: TeamLineup;
  };
  sources: { label: string; url: string }[];
}

const TEAM_ID = '436';
const LEAGUE_SLUG = 'tur.1';
const ESPN_SCHEDULE_URL = `https://site.api.espn.com/apis/site/v2/sports/soccer/${LEAGUE_SLUG}/teams/${TEAM_ID}/schedule`;
const ESPN_SUMMARY_URL = (eventId: string) =>
  `https://site.api.espn.com/apis/site/v2/sports/soccer/${LEAGUE_SLUG}/summary?event=${eventId}`;

const teamNameMap: Record<string, string> = {
  Fenerbahce: 'Fenerbahçe',
  'Caykur Rizespor': 'Çaykur Rizespor',
  Galatasaray: 'Galatasaray',
  'Istanbul Basaksehir': 'İstanbul Başakşehir',
  Basaksehir: 'Başakşehir',
  Konyaspor: 'Konyaspor',
  Eyupspor: 'Eyüpspor',
  Besiktas: 'Beşiktaş',
  'Fatih Karagumruk': 'Fatih Karagümrük',
  Goztepe: 'Göztepe',
  Samsunspor: 'Samsunspor',
  Genclerbirligi: 'Gençlerbirliği',
  'Gençlerbirliği': 'Gençlerbirliği',
  Kayserispor: 'Kayserispor',
  'Gaziantep FK': 'Gaziantep FK',
};

const statusMap: Record<string, string> = {
  FT: 'Maç Sonu',
  'Full Time': 'Maç Sonu',
  Scheduled: 'Planlandı',
  STATUS_SCHEDULED: 'Planlandı',
  'In Progress': 'Canlı',
  Halftime: 'Devre Arası',
  HT: 'Devre Arası',
  Postponed: 'Ertelendi',
  Cancelled: 'İptal',
  Final: 'Maç Sonu',
};

const statLabelMap: Record<string, string> = {
  possessionPct: 'Topa Sahip Olma',
  totalShots: 'Şut',
  shotsOnTarget: 'İsabetli Şut',
  wonCorners: 'Korner',
  yellowCards: 'Sarı Kart',
  redCards: 'Kırmızı Kart',
  foulsCommitted: 'Faul',
  saves: 'Kurtarış',
};

const eventTypeMap: Record<string, string> = {
  Goal: 'Gol',
  'Yellow Card': 'Sarı Kart',
  'Red Card': 'Kırmızı Kart',
  Substitution: 'Oyuncu Değişikliği',
  Penalty: 'Penaltı',
};

const leaderLabelMap: Record<string, string> = {
  goals: 'Gol Liderleri',
  assists: 'Asist Liderleri',
  shotsOnTarget: 'İsabetli Şut Liderleri',
  saves: 'Kurtarış Liderleri',
  yellowCards: 'Kart Liderleri',
  rating: 'Reyting Liderleri',
};

function trText(value?: string): string {
  if (!value) return '';
  const trimmed = value.replace(/\s+/g, ' ').trim();
  return teamNameMap[trimmed] || trimmed;
}

function trStatus(value?: string): string {
  if (!value) return 'Güncelleniyor';
  return statusMap[value] || value;
}

function trEventType(value?: string): string {
  if (!value) return 'Maç Olayı';
  return eventTypeMap[value] || value;
}

function trLeaderLabel(value?: string): string {
  if (!value) return 'Oyuncu Liderleri';
  return leaderLabelMap[value] || trText(value);
}

function findCompetitor(event: any, side: 'home' | 'away') {
  return event?.competitions?.[0]?.competitors?.find((item: any) => item.homeAway === side);
}

function mapFixture(event: any): LiveFixtureItem | null {
  const competition = event?.competitions?.[0];
  const home = findCompetitor(event, 'home');
  const away = findCompetitor(event, 'away');

  if (!competition || !home?.team?.displayName || !away?.team?.displayName) {
    return null;
  }

  const statusDetail = competition?.status?.type?.shortDetail || competition?.status?.type?.detail || competition?.status?.type?.description;

  return {
    id: String(event?.id || competition?.id || `${event?.date}-${home.team.displayName}`),
    date: event?.date || competition?.date,
    home: trText(home.team.displayName),
    away: trText(away.team.displayName),
    competition: trText(event?.league?.name || 'Süper Lig'),
    note: statusDetail ? trStatus(statusDetail) : undefined,
    status: trStatus(statusDetail || competition?.status?.type?.description),
    homeScore: home?.score?.displayValue,
    awayScore: away?.score?.displayValue,
  };
}

function pickTargetEvent(events: any[]): any | undefined {
  const liveEvent = events.find((event) => event?.competitions?.[0]?.status?.type?.state === 'in');
  if (liveEvent) return liveEvent;

  const recentEvent = events.find((event) => {
    const state = event?.competitions?.[0]?.status?.type?.state;
    const dateValue = new Date(event?.date || 0).getTime();
    return state === 'post' && Date.now() - dateValue < 1000 * 60 * 60 * 72;
  });
  if (recentEvent) return recentEvent;

  return events.find((event) => new Date(event?.date || 0).getTime() >= Date.now()) || events[0];
}

function mapLineupTeam(rosterItem: any): TeamLineup | undefined {
  const players = Array.isArray(rosterItem?.roster) ? rosterItem.roster : [];
  if (players.length === 0) return undefined;

  const starters = players
    .filter((item: any) => item?.starter)
    .map((item: any) => ({
      name: trText(item?.athlete?.displayName || item?.athlete?.fullName),
      jersey: item?.jersey,
      position: trText(item?.position?.abbreviation || item?.position?.displayName),
    }));

  const bench = players
    .filter((item: any) => !item?.starter)
    .slice(0, 12)
    .map((item: any) => ({
      name: trText(item?.athlete?.displayName || item?.athlete?.fullName),
      jersey: item?.jersey,
      position: trText(item?.position?.abbreviation || item?.position?.displayName),
    }));

  return {
    teamName: trText(rosterItem?.team?.displayName),
    formation: rosterItem?.formation,
    starters,
    bench,
  };
}

function mapStats(summary: any): MatchStatItem[] {
  const teams = Array.isArray(summary?.boxscore?.teams) ? summary.boxscore.teams : [];
  const homeStats = Array.isArray(teams[0]?.statistics) ? teams[0].statistics : [];
  const awayStats = Array.isArray(teams[1]?.statistics) ? teams[1].statistics : [];

  return Object.entries(statLabelMap)
    .map(([key, label]) => {
      const home = homeStats.find((item: any) => item?.name === key)?.displayValue;
      const away = awayStats.find((item: any) => item?.name === key)?.displayValue;
      if (home == null || away == null) return null;
      return {
        key,
        label,
        homeValue: key === 'possessionPct' ? `${home}%` : String(home),
        awayValue: key === 'possessionPct' ? `${away}%` : String(away),
      };
    })
    .filter((item): item is MatchStatItem => item !== null);
}

function mapEvents(summary: any): MatchEventItem[] {
  const commentary = Array.isArray(summary?.commentary) ? summary.commentary : [];

  return commentary.slice(-8).reverse().map((item: any) => {
    const athleteNames = Array.isArray(item?.play?.participants)
      ? item.play.participants
          .map((participant: any) => trText(participant?.athlete?.displayName))
          .filter(Boolean)
          .join(', ')
      : '';

    return {
      id: String(item?.play?.id || item?.time?.displayValue || Math.random()),
      minute: item?.time?.displayValue || item?.play?.clock?.displayValue || '-',
      team: trText(item?.play?.team?.displayName || item?.team?.displayName),
      type: trEventType(item?.play?.type?.text),
      text: athleteNames || trText(item?.text),
    };
  });
}

function mapLeaders(summary: any): PlayerLeaderItem[] {
  const groups = Array.isArray(summary?.leaders) ? summary.leaders : [];

  return groups
    .map((group: any, index: number) => {
      const leaders = Array.isArray(group?.leaders) ? group.leaders : [];
      const players = leaders
        .slice(0, 3)
        .map((entry: any) => ({
          name: trText(entry?.athlete?.displayName || entry?.leaders?.[0]?.athlete?.displayName),
          team: trText(entry?.team?.displayName || group?.team?.displayName),
          value: String(entry?.displayValue || entry?.value || '-'),
        }))
        .filter((entry) => entry.name);

      if (players.length === 0) {
        return null;
      }

      return {
        key: String(group?.name || group?.displayName || index),
        label: trLeaderLabel(group?.displayName || group?.name),
        players,
      };
    })
    .filter((item): item is PlayerLeaderItem => item !== null)
    .slice(0, 4);
}

function findStandingsEntries(node: any): any[] {
  if (!node) return [];

  if (Array.isArray(node)) {
    if (node.some((item) => item?.team && Array.isArray(item?.stats))) {
      return node;
    }

    for (const item of node) {
      const nested = findStandingsEntries(item);
      if (nested.length > 0) {
        return nested;
      }
    }

    return [];
  }

  if (typeof node === 'object') {
    for (const value of Object.values(node)) {
      const nested = findStandingsEntries(value);
      if (nested.length > 0) {
        return nested;
      }
    }
  }

  return [];
}

function readStat(stats: any[], candidates: string[]): string | undefined {
  const found = stats.find((item: any) =>
    candidates.some((candidate) =>
      [item?.name, item?.displayName, item?.shortDisplayName, item?.abbreviation, item?.description]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase() === candidate.toLowerCase()),
    ),
  );

  if (!found) return undefined;
  if (found.displayValue != null) return String(found.displayValue);
  if (found.value != null) return String(found.value);
  return undefined;
}

function buildStandingsImpact(summary: any, currentMatch?: LiveMatchSnapshot['currentMatch']): StandingsImpact | undefined {
  const entries = findStandingsEntries(summary?.standings);
  if (entries.length === 0) return undefined;

  const mapped = entries
    .map((entry: any) => {
      const stats = Array.isArray(entry?.stats) ? entry.stats : [];
      return {
        rank: String(readStat(stats, ['rank']) || entry?.stats?.find?.((item: any) => item?.name === 'rank')?.displayValue || '-'),
        team: trText(entry?.team?.displayName),
        points: readStat(stats, ['points', 'pts']) || '-',
        played: readStat(stats, ['gamesPlayed', 'gp']) || '-',
        goalDiff: readStat(stats, ['pointDifferential', 'goalDifferential', 'gd']),
      };
    })
    .filter((entry) => entry.team);

  if (mapped.length === 0) return undefined;

  const focusTeams = mapped.filter(
    (entry) => entry.team === currentMatch?.homeTeam || entry.team === currentMatch?.awayTeam || entry.team === 'Fenerbahçe' || entry.team === 'Galatasaray',
  );

  const table = (focusTeams.length > 0 ? focusTeams : mapped.slice(0, 4)).slice(0, 4);
  const fenerEntry = mapped.find((entry) => entry.team === 'Fenerbahçe');

  let summaryText = 'Puan tablosu güncel veriyle yenilendi.';
  if (fenerEntry) {
    summaryText = `Fenerbahçe şu anda ${fenerEntry.rank}. sırada ${fenerEntry.points} puanla yer alıyor.`;
  }

  return {
    summary: summaryText,
    table,
    note: 'Puan durumu verisi yayıncı akışına göre birkaç dakika gecikmeli güncellenebilir.',
  };
}

function mapSources(summary: any, eventId: string) {
  const links = Array.isArray(summary?.header?.links) ? summary.header.links : [];
  const preferred = links.filter((item: any) => ['summary', 'stats', 'commentary', 'lineups'].some((rel) => item?.rel?.includes?.(rel)));

  if (preferred.length > 0) {
    return preferred.slice(0, 4).map((item: any) => ({
      label: trText(item?.text || 'Kaynak'),
      url: item?.href,
    }));
  }

  return [
    {
      label: 'ESPN Maç Özeti',
      url: `https://www.espn.com/soccer/match/_/gameId/${eventId}`,
    },
  ];
}

export async function fetchLiveFenerbahceSchedule(): Promise<LiveMatchSnapshot> {
  const scheduleResponse = await fetch(ESPN_SCHEDULE_URL);
  if (!scheduleResponse.ok) {
    throw new Error(`ESPN schedule error: ${scheduleResponse.status}`);
  }

  const scheduleData = await scheduleResponse.json();
  const events: any[] = Array.isArray(scheduleData?.events) ? scheduleData.events : [];
  const fixtures = events.map(mapFixture).filter((item): item is LiveFixtureItem => item !== null).slice(0, 6);
  const targetEvent = pickTargetEvent(events);

  if (!targetEvent) {
    return {
      updatedAt: new Date().toISOString(),
      fixtures,
      stats: [],
      events: [],
      leaders: [],
      sources: [],
    };
  }

  const summaryResponse = await fetch(ESPN_SUMMARY_URL(String(targetEvent.id)));
  if (!summaryResponse.ok) {
    throw new Error(`ESPN summary error: ${summaryResponse.status}`);
  }

  const summaryData = await summaryResponse.json();
  const headerCompetition = summaryData?.header?.competitions?.[0];
  const home = headerCompetition?.competitors?.find((item: any) => item?.homeAway === 'home');
  const away = headerCompetition?.competitors?.find((item: any) => item?.homeAway === 'away');
  const rosters = Array.isArray(summaryData?.rosters) ? summaryData.rosters : [];
  const homeRoster = rosters.find((item: any) => item?.homeAway === 'home');
  const awayRoster = rosters.find((item: any) => item?.homeAway === 'away');

  const currentMatch = {
    id: String(targetEvent?.id),
    date: headerCompetition?.date || targetEvent?.date,
    competition: trText(summaryData?.header?.season?.name || targetEvent?.league?.name || 'Süper Lig'),
    venue: trText(targetEvent?.competitions?.[0]?.venue?.fullName || summaryData?.gameInfo?.venue?.fullName),
    homeTeam: trText(home?.team?.displayName),
    awayTeam: trText(away?.team?.displayName),
    homeLogo: home?.team?.logos?.[0]?.href,
    awayLogo: away?.team?.logos?.[0]?.href,
    homeScore: home?.score,
    awayScore: away?.score,
    statusText: trStatus(headerCompetition?.status?.type?.shortDetail || headerCompetition?.status?.type?.detail || headerCompetition?.status?.type?.description),
    statusState: headerCompetition?.status?.type?.state || 'pre',
    formHome: home?.team?.form,
    formAway: away?.team?.form,
    homeRecord: home?.record?.find((item: any) => item?.type === 'total')?.displayValue,
    awayRecord: away?.record?.find((item: any) => item?.type === 'total')?.displayValue,
  };

  return {
    updatedAt: new Date().toISOString(),
    currentMatch,
    fixtures,
    stats: mapStats(summaryData),
    events: mapEvents(summaryData),
    leaders: mapLeaders(summaryData),
    standingsImpact: buildStandingsImpact(summaryData, currentMatch),
    lineups: {
      home: mapLineupTeam(homeRoster),
      away: mapLineupTeam(awayRoster),
    },
    sources: mapSources(summaryData, String(targetEvent?.id)),
  };
}
