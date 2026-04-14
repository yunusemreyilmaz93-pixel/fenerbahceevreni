export interface LiveFixtureItem {
  date: string;
  home: string;
  away: string;
  competition: string;
  note?: string;
}

export interface LiveMatchSnapshot {
  nextMatch?: {
    date: string;
    venue?: string;
    homeTeam: string;
    awayTeam: string;
    competition: string;
  };
  fixtures: LiveFixtureItem[];
}

const ESPN_SCHEDULE_URL = 'https://site.api.espn.com/apis/site/v2/sports/soccer/tur.1/teams/436/schedule';

function mapEvent(event: any): LiveFixtureItem | null {
  const competition = event?.competitions?.[0];
  const competitors = competition?.competitors;
  if (!Array.isArray(competitors) || competitors.length < 2) {
    return null;
  }

  const home = competitors.find((c: any) => c.homeAway === 'home')?.team?.displayName;
  const away = competitors.find((c: any) => c.homeAway === 'away')?.team?.displayName;

  if (!home || !away) {
    return null;
  }

  return {
    date: event?.date,
    home,
    away,
    competition: event?.league?.name || 'Süper Lig',
    note: event?.status?.type?.description || undefined,
  };
}

export async function fetchLiveFenerbahceSchedule(): Promise<LiveMatchSnapshot> {
  const response = await fetch(ESPN_SCHEDULE_URL);
  if (!response.ok) {
    throw new Error(`ESPN schedule error: ${response.status}`);
  }

  const data = await response.json();
  const events: any[] = Array.isArray(data?.events) ? data.events : [];
  const upcoming = events.filter((event) => new Date(event?.date).getTime() > Date.now());

  const mapped = upcoming
    .map(mapEvent)
    .filter((item): item is LiveFixtureItem => item !== null)
    .slice(0, 6);

  const first = mapped[0];

  return {
    nextMatch: first
      ? {
          date: first.date,
          venue: data?.events?.[0]?.competitions?.[0]?.venue?.fullName,
          homeTeam: first.home,
          awayTeam: first.away,
          competition: first.competition,
        }
      : undefined,
    fixtures: mapped,
  };
}
