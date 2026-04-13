
export interface Match {
  id: string;
  week: number;
  homeTeam: string;
  awayTeam: string;
  isDerby?: boolean;
}

export interface TeamStanding {
  name: string;
  points: number;
}

export const INITIAL_STANDINGS: Record<string, TeamStanding> = {
  'GALATASARAY': { name: 'GALATASARAY', points: 68 },
  'FENERBAHÇE': { name: 'FENERBAHÇE', points: 66 },
  'TRABZONSPOR': { name: 'TRABZONSPOR', points: 64 },
};

export const FIXTURES: Match[] = [
  // Week 30
  { id: 'w30-fb', week: 30, homeTeam: 'FENERBAHÇE', awayTeam: 'Ç. RİZESPOR' },
  { id: 'w30-gs', week: 30, homeTeam: 'GENÇLERBİRLİĞİ', awayTeam: 'GALATASARAY' },
  { id: 'w30-ts', week: 30, homeTeam: 'TRABZONSPOR', awayTeam: 'RAMS BAŞAKŞEHİR' },
  
  // Week 31
  { id: 'w31-derby', week: 31, homeTeam: 'GALATASARAY', awayTeam: 'FENERBAHÇE', isDerby: true },
  { id: 'w31-ts', week: 31, homeTeam: 'KONYASPOR', awayTeam: 'TRABZONSPOR' },
  
  // Week 32
  { id: 'w32-fb', week: 32, homeTeam: 'FENERBAHÇE', awayTeam: 'RAMS BAŞAKŞEHİR' },
  { id: 'w32-gs', week: 32, homeTeam: 'SAMSUNSPOR', awayTeam: 'GALATASARAY' },
  { id: 'w32-ts', week: 32, homeTeam: 'TRABZONSPOR', awayTeam: 'GÖZTEPE' },
  
  // Week 33
  { id: 'w33-fb', week: 33, homeTeam: 'KONYASPOR', awayTeam: 'FENERBAHÇE' },
  { id: 'w33-gs', week: 33, homeTeam: 'GALATASARAY', awayTeam: 'ANTALYASPOR' },
  { id: 'w33-ts', week: 33, homeTeam: 'BEŞİKTAŞ', awayTeam: 'TRABZONSPOR', isDerby: true },
  
  // Week 34
  { id: 'w34-fb', week: 34, homeTeam: 'FENERBAHÇE', awayTeam: 'EYÜPSPOR' },
  { id: 'w34-gs', week: 34, homeTeam: 'KASIMPAŞA', awayTeam: 'GALATASARAY' },
  { id: 'w34-ts', week: 34, homeTeam: 'TRABZONSPOR', awayTeam: 'GENÇLERBİRLİĞİ' },
];
