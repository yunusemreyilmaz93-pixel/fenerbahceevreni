
export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  image: string;
  category: string;
  date: string;
}

export interface VideoItem {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  category: string;
}

export interface Poll {
  id: string;
  question: string;
  options: { id: string; text: string; votes: number }[];
  totalVotes: number;
}

export const NEXT_MATCH = {
  opponent: 'Galatasaray',
  opponentLogo: 'https://img.api-football.com/football/teams/610.png',
  competition: 'Trendyol Süper Lig',
  date: '2026-04-20T19:00:00Z',
  venue: 'Ülker Stadyumu',
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
  },
  {
    id: '2',
    title: 'Yeni Nesil Fraksiyonlar: Evren Genişliyor',
    summary: 'Fenerbahçe Evreni haritasına 12 yeni alt fraksiyon eklendi. Kendi yerini bulmaya hazır mısın?',
    image: 'https://picsum.photos/seed/universe/800/450',
    category: 'EVREN',
    date: '5 Saat Önce',
  },
  {
    id: '3',
    title: 'Basketbol Şubesinde Hedef Final Four',
    summary: 'EuroLeague çeyrek final serisi öncesi takımda moraller yerinde.',
    image: 'https://picsum.photos/seed/basket/800/450',
    category: 'BASKETBOL',
    date: '1 Gün Önce',
  },
];

export const VIDEOS: VideoItem[] = [
  {
    id: 'v1',
    title: 'Maç Önü Analizi: Derbiye Doğru',
    thumbnail: 'https://picsum.photos/seed/vid1/400/225',
    duration: '12:45',
    category: 'ANALİZ',
  },
  {
    id: 'v2',
    title: 'Tadic ile Bir Gün: Samandıra Günlükleri',
    thumbnail: 'https://picsum.photos/seed/vid2/400/225',
    duration: '08:20',
    category: 'ÖZEL',
  },
  {
    id: 'v3',
    title: 'Unutulmaz Derbi Golleri',
    thumbnail: 'https://picsum.photos/seed/vid3/400/225',
    duration: '15:00',
    category: 'ARŞİV',
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
