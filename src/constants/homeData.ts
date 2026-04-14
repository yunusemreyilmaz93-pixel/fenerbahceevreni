export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  image: string;
  category: string;
  date: string;
  url?: string;
}

export interface VideoItem {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  category: string;
  url?: string;
}

export interface Poll {
  id: string;
  question: string;
  options: { id: string; text: string; votes: number }[];
  totalVotes: number;
}

export interface MatchSource {
  label: string;
  url: string;
}

export interface SquadNote {
  player: string;
  reason: string;
  status: 'OUT' | 'ŞÜPHELİ' | 'SINIRDA';
  detail: string;
}

export interface MatchFixtureItem {
  date: string;
  home: string;
  away: string;
  competition: string;
  note?: string;
}

export interface MatchCenterData {
  competition: string;
  date: string;
  venue: string;
  homeTeam: string;
  awayTeam: string;
  homeLogo: string;
  awayLogo: string;
  summary: string;
  updatedAt: string;
  scoreboardContext: {
    fenerbahce: string;
    rizespor: string;
  };
  keyInsights: string[];
  fenerbahceAvailability: SquadNote[];
  rizesporAvailability: SquadNote[];
  predictedLineups: {
    fenerbahce: string[];
    rizespor: string[];
  };
  fixtureFocus: MatchFixtureItem[];
  sources: MatchSource[];
}

export const MATCH_CENTER_DATA: MatchCenterData = {
  competition: 'Trendyol Süper Lig · 30. Hafta',
  date: '2026-04-17T17:00:00Z',
  venue: 'Ülker Stadyumu (Kadıköy)',
  homeTeam: 'Fenerbahçe',
  awayTeam: 'Çaykur Rizespor',
  homeLogo: 'https://upload.wikimedia.org/wikipedia/tr/f/ff/Fenerbah%C3%A7e_SK.png',
  awayLogo: 'https://upload.wikimedia.org/wikipedia/tr/thumb/4/4f/%C3%87aykur_Rizespor_Logo.svg/1200px-%C3%87aykur_Rizespor_Logo.svg.png',
  summary:
    '17 Nisan Cuma günü Kadıköy’de oynanacak maç, şampiyonluk yarışı ve Avrupa potası dengesi açısından iki takım için de yüksek kritik düzeyde.',
  updatedAt: '2026-04-14T10:30:00Z',
  scoreboardContext: {
    fenerbahce: '29 maç · 19G 9B 1M · 66 puan (2.)',
    rizespor: '29 maç · 9G 9B 11M · 36 puan (8.)',
  },
  keyInsights: [
    'Fenerbahçe, ligin en yüksek gol farklarından birine sahip (+38) ve iç sahada yüksek tempo ile başlıyor.',
    'Çaykur Rizespor deplasmanda geçiş hücumlarıyla etkili; özellikle ilk 30 dakikadaki direkt oyunları kritik.',
    'Bir sonraki hafta deplasmanda Galatasaray derbisi olduğu için kart sınırındaki oyuncu yönetimi teknik ekip için belirleyici olabilir.',
  ],
  fenerbahceAvailability: [
    {
      player: 'Levent Mercan',
      reason: 'Kısmi adale yırtığı',
      status: 'ŞÜPHELİ',
      detail: 'Beklenen dönüş: 20 Nisan 2026 (maç günü kadroya girme ihtimali düşük).',
    },
    {
      player: 'Nélson Semedo',
      reason: 'Kart sınırı riski',
      status: 'SINIRDA',
      detail: '7 sarı kart; bu maçta kart görmesi halinde sonraki lig maçı için ceza riski var.',
    },
    {
      player: 'Kerem Aktürkoğlu',
      reason: 'Kart sınırı riski',
      status: 'SINIRDA',
      detail: '3 sarı kart; bir sonraki haftayı etkileyebilecek sınır bandında.',
    },
    {
      player: 'Mattéo Guendouzi',
      reason: 'Kart sınırı riski',
      status: 'SINIRDA',
      detail: '3 sarı kart; orta saha sertlik-dozaj dengesi kritik.',
    },
  ],
  rizesporAvailability: [
    {
      player: 'Khusniddin Alikulov',
      reason: 'Çapraz bağ sakatlığı',
      status: 'OUT',
      detail: 'Beklenen dönüş: 19 Ekim 2026.',
    },
    {
      player: 'Loide Augusto',
      reason: 'Belirsiz sakatlık',
      status: 'ŞÜPHELİ',
      detail: 'Maç kadrosu kararı son antrenman sonrası netleşebilir.',
    },
    {
      player: 'Qazim Laci',
      reason: 'Kart sınırı riski',
      status: 'SINIRDA',
      detail: '3 sarı kart; merkezde agresif baskı rolünde dikkat.',
    },
    {
      player: 'Attila Mocsi',
      reason: 'Kart sınırı riski',
      status: 'SINIRDA',
      detail: '3 sarı kart; bire bir savunma eşleşmelerinde temkin gerektiriyor.',
    },
  ],
  predictedLineups: {
    fenerbahce: [
      'Dominik Livaković',
      'Mert Müldür',
      'Milan Škriniar',
      'Jayden Oosterwolde',
      'Archie Brown',
      'Fred',
      'Mattéo Guendouzi',
      'Marco Asensio',
      'Anderson Talisca',
      'Kerem Aktürkoğlu',
      'Dorgeles Nene',
    ],
    rizespor: [
      'Tarık Çetin',
      'Taha Şahin',
      'Attila Mocsi',
      'Samet Akaydın',
      'Casper Höjer',
      'Giannis Papanikolaou',
      'Qazim Laci',
      'Ibrahim Olawoyin',
      'Altin Zeqiri',
      'Vaclav Jurecka',
      'Ali Sowe',
    ],
  },
  fixtureFocus: [
    {
      date: '2026-04-17T17:00:00Z',
      home: 'Fenerbahçe',
      away: 'Çaykur Rizespor',
      competition: 'Süper Lig',
      note: 'Sıradaki maç',
    },
    {
      date: '2026-04-26T17:00:00Z',
      home: 'Galatasaray',
      away: 'Fenerbahçe',
      competition: 'Süper Lig',
      note: 'Derbi (deplasman)',
    },
    {
      date: '2026-05-03T16:00:00Z',
      home: 'Fenerbahçe',
      away: 'Başakşehir',
      competition: 'Süper Lig',
      note: 'İç saha',
    },
    {
      date: '2026-05-10T16:00:00Z',
      home: 'Konyaspor',
      away: 'Fenerbahçe',
      competition: 'Süper Lig',
      note: 'Deplasman',
    },
    {
      date: '2026-05-17T16:00:00Z',
      home: 'Fenerbahçe',
      away: 'Eyüpspor',
      competition: 'Süper Lig',
      note: 'Son hafta',
    },
  ],
  sources: [
    {
      label: 'ESPN – Fenerbahçe vs Çaykur Rizespor maç bilgisi ve puan durumu bağlamı',
      url: 'https://www.espn.com/soccer/match/_/gameId/750181/caykur-rizespor-fenerbahce',
    },
    {
      label: 'ESPN – Fenerbahçe 2025-26 Süper Lig fikstürü (Nisan-Mayıs)',
      url: 'https://www.espn.com/soccer/team/fixtures/_/id/436/league/TUR.1',
    },
    {
      label: 'Transfermarkt – Fenerbahçe sakat/ceza riski',
      url: 'https://www.transfermarkt.us/fenerbahce/sperrenundverletzungen/verein/36/plus/1',
    },
    {
      label: 'Transfermarkt – Çaykur Rizespor sakat/ceza riski',
      url: 'https://www.transfermarkt.com/caykur-rizespor/sperrenundverletzungen/verein/126/plus/1',
    },
    {
      label: 'TFF – 2025-26 sezon planlaması haberi (sezon bitiş tarihi referansı)',
      url: 'https://www.tff.org/default.aspx?2707pg=6&ftxtID=47720&pageID=204',
    },
  ],
};

export const NEXT_MATCH = {
  opponent: MATCH_CENTER_DATA.awayTeam,
  opponentLogo: MATCH_CENTER_DATA.awayLogo,
  competition: MATCH_CENTER_DATA.competition,
  date: MATCH_CENTER_DATA.date,
  venue: MATCH_CENTER_DATA.venue,
  isHome: true,
};

export const LATEST_NEWS: NewsItem[] = [
  {
    id: '1',
    title: 'Mourinho: "Bu Taraftar Her Şeyin En İyisini Hak Ediyor"',
    summary: 'Teknik direktörümüz Jose Mourinho, antrenman sonrası basın mensuplarına açıklamalarda bulundu.',
    image: 'https://picsum.photos/seed/mou/800/450',
    category: 'TAKIM',
    date: '2 Saat Önce',
    url: 'https://www.fenerbahce.org/haberler/futbol',
  },
  {
    id: '2',
    title: 'Yeni Nesil Fraksiyonlar: Evren Genişliyor',
    summary: 'Fenerbahçe Evreni haritasına 12 yeni alt fraksiyon eklendi. Kendi yerini bulmaya hazır mısın?',
    image: 'https://picsum.photos/seed/universe/800/450',
    category: 'EVREN',
    date: '5 Saat Önce',
    url: '/universe',
  },
  {
    id: '3',
    title: 'Basketbol Şubesinde Hedef Final Four',
    summary: 'EuroLeague çeyrek final serisi öncesi takımda moraller yerinde.',
    image: 'https://picsum.photos/seed/basket/800/450',
    category: 'BASKETBOL',
    date: '1 Gün Önce',
    url: 'https://www.fenerbahce.org/haberler/basketbol',
  },
];

export const VIDEOS: VideoItem[] = [
  {
    id: 'v1',
    title: 'Maç Önü Analizi: Derbiye Doğru',
    thumbnail: 'https://picsum.photos/seed/vid1/400/225',
    duration: '12:45',
    category: 'ANALİZ',
    url: 'https://www.youtube.com/@fenerbahce',
  },
  {
    id: 'v2',
    title: 'Tadic ile Bir Gün: Samandıra Günlükleri',
    thumbnail: 'https://picsum.photos/seed/vid2/400/225',
    duration: '08:20',
    category: 'ÖZEL',
    url: 'https://www.youtube.com/@fenerbahce',
  },
  {
    id: 'v3',
    title: 'Unutulmaz Derbi Golleri',
    thumbnail: 'https://picsum.photos/seed/vid3/400/225',
    duration: '15:00',
    category: 'ARŞİV',
    url: 'https://www.youtube.com/@fenerbahce',
  },
];

export const WEEKLY_POLL: Poll = {
  id: 'p1',
  question: 'Derbi maçında ilk 11\'de kimi görmek istersiniz?',
  options: [
    { id: 'o1', text: 'İrfan Can Kahveci', votes: 4500 },
    { id: 'o2', text: 'Allan Saint-Maximin', votes: 3200 },
    { id: 'o3', text: 'En-Nesyri', votes: 2800 },
  ],
  totalVotes: 10500,
};
