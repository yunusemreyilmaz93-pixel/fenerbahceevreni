export interface Article {
  id: string;
  category: string;
  title: string;
  excerpt: string;
  readingTime: string;
  author: string;
  date: string;
  content?: string;
}

export interface TransferTarget {
  id: string;
  name: string;
  position: string;
  age: number;
  currentClub: string;
  fitScore: number;
  strengths: string[];
  concerns: string[];
  image?: string;
  reportExcerpt?: string;
}

export interface PlayerPerformance {
  id: string;
  name: string;
  position: string;
  formRating: number;
  lastMatchRating: number;
  trend: 'yükselişte' | 'düşüşte' | 'stabil';
  shortAnalysis: string;
  image?: string;
}

export interface MatchCenterData {
  id: string;
  matchTitle: string;
  date: string;
  time: string;
  competition: string;
  opponent: string;
  opponentLogo: string;
  homeTeam: string;
  homeLogo: string;
  awayTeam: string;
  awayLogo: string;
  probableXI: string[];
  previewText: string;
  postMatchReport?: string;
  predictionPoll: {
    homeWinPct: number;
    drawPct: number;
    awayWinPct: number;
    totalVotes: number;
  };
}

export interface Poll {
  id: string;
  question: string;
  options: { id: string; text: string; votes: number }[];
  totalVotes: number;
  featuredComment?: {
    username: string;
    comment: string;
    likes: number;
  };
}

export const latestArticles: Article[] = [
  {
    id: "art-1",
    category: "Taktik Analiz",
    title: "Fenerbahçe’nin oyun planında asıl problem ne?",
    excerpt: "Mourinho dönemindeki pozisyon oyunu ve hücum geçişlerindeki yavaş kalma nedenlerini, sayısal veriler ve taktik tahtası üzerindeki incelemelerle ele alıyoruz.",
    readingTime: "6 dk okuma",
    author: "Bora Karaca",
    date: "25 May 2026"
  },
  {
    id: "art-2",
    category: "Maç Raporu",
    title: "Maçın kırılma anı: tempo neden birden düştü?",
    excerpt: "İç sahada oynanan son karşılaşmada, 60. dakikadan sonra fiziksel direncin azalmasının arkasındaki rotasyon tercihlerini ve metrik analizleri inceliyoruz.",
    readingTime: "4 dk okuma",
    author: "Caner Yılmaz",
    date: "24 May 2026"
  },
  {
    id: "art-3",
    category: "Orta Saha Analiz",
    title: "Orta saha dengesi: doğru üçlü kombinasyon hangisi?",
    excerpt: "Savunma güvenliği, top dağıtımı ve kreatif aksiyonların maksimum verim sağlaması için üç orta saha oyuncusunun en uyumlu olduğu formülleri modelliyoruz.",
    readingTime: "5 dk okuma",
    author: "Doğukan Özen",
    date: "22 May 2026"
  },
  {
    id: "art-4",
    category: "Rotasyon Analizi",
    title: "Bek rotasyonu Fenerbahçe’yi nasıl etkiliyor?",
    excerpt: "Kanat beklerinin hücum aksiyonlarındaki ısı haritaları, bindirme sayıları ve savunma geçişlerindeki kritik pozisyon kayıplarının detaylı incelemesi.",
    readingTime: "5 dk okuma",
    author: "Onur Şahin",
    date: "19 May 2026"
  }
];

export const transferTargets: TransferTarget[] = [
  {
    id: "tgt-1",
    name: "Lander Heeren",
    position: "Sol Bek / Sol Kanat Bek",
    age: 23,
    currentClub: "KRC Genk",
    fitScore: 8.8,
    strengths: ["Crossover kesme kalitesi", "Maksimum sprint hızı", "Yüksek pas isabeti"],
    concerns: ["Sert ikili mücadelelerde fizik eksikliği", "Defansif pozisyon hataları"],
    reportExcerpt: "Modern oyun kurucu kanat bek rolü için kusursuz bir profil. Sol koridoru tek başına domine etme yeteneğine sahip."
  },
  {
    id: "tgt-2",
    name: "Ademola Solanke",
    position: "Merkez Orta Saha (8 Numara)",
    age: 25,
    currentClub: "Lorient",
    fitScore: 8.2,
    strengths: ["Top taşıma kabiliyeti", "Pres kırma becerisi", "Pres yoğunluğu"],
    concerns: ["Sakatlık geçmişi", "Uzak mesafe şut verimsizliği"],
    reportExcerpt: "Hem pres gücü yüksek hem de rakip ceza sahasına topsuz süzülebilen aranan çift yönlü modern 8 numara profili."
  },
  {
    id: "tgt-3",
    name: "Martin Zubeldia",
    position: "Defansif Orta Saha (6 Numara)",
    age: 26,
    currentClub: "Real Sociedad (Takipte)",
    fitScore: 9.1,
    strengths: ["Oyun okuma ve kesicilik", "Konumsal farkındalık", "Liderlik karakteri"],
    concerns: ["Yüksek piyasa değeri", "Sadece derin oyun kurucu rolünde konfor arayışı"],
    reportExcerpt: "Süper Lig standartlarının çok üzerinde bir regülatör. Orta sahaya şampiyonluk getirecek bir defansif akıl katar."
  }
];

export const playerPerformances: PlayerPerformance[] = [
  {
    id: "plyr-1",
    name: "Ferdi Kadıoğlu",
    position: "Sol Bek",
    formRating: 9.2,
    lastMatchRating: 8.7,
    trend: "yükselişte",
    shortAnalysis: "Isı haritasında tüm sol kanadı tamamen kapsayan bir performans gösterdi. Defansif geçişlerde de kritik 4 top kesti."
  },
  {
    id: "plyr-2",
    name: "Sebastian Szymański",
    position: "On Numara / Pres Gücü",
    formRating: 7.8,
    lastMatchRating: 8.1,
    trend: "stabil",
    shortAnalysis: "Merkez preste takımın en iyisiydi. Skor üretkenliğinde şanssız olsa da yarattığı 3 net gol fırsatı takdir kazandı."
  },
  {
    id: "plyr-3",
    name: "Fred",
    position: "Merkez Dinamo",
    formRating: 8.5,
    lastMatchRating: 6.9,
    trend: "düşüşte",
    shortAnalysis: "Kapasitesinin altında kalan yorgun bir oyun çıkardı ancak topla çıkışlardaki kilit rolü takımı ayakta tutmaya yetti."
  },
  {
    id: "plyr-4",
    name: "Rodrigo Becão",
    position: "Stoper",
    formRating: 8.9,
    lastMatchRating: 9.0,
    trend: "yükselişte",
    shortAnalysis: "Hava toplarında geçit vermedi. Son maçtaki kritik blokları ve ikili mücadele kazanma oranı zirvedeydi."
  }
];

export const matchCenter: MatchCenterData = {
  id: "mc-upcoming",
  matchTitle: "Fenerbahçe - Beşiktaş",
  date: "30 May 2026",
  time: "20:00",
  competition: "Trendyol Süper Lig • 36. Hafta",
  opponent: "Beşiktaş",
  opponentLogo: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Besiktas_Logo_Watermarked.svg/1024px-Besiktas_Logo_Watermarked.svg.png",
  homeTeam: "Fenerbahçe",
  homeLogo: "https://upload.wikimedia.org/wikipedia/tr/f/ff/Fenerbah%C3%A7e_SK.png",
  awayTeam: "Beşiktaş",
  awayLogo: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Besiktas_Logo_Watermarked.svg/1024px-Besiktas_Logo_Watermarked.svg.png",
  probableXI: [
    "Dominik Livaković",
    "Osayi-Samuel",
    "Alexander Djiku",
    "Rodrigo Becão",
    "Ferdi Kadıoğlu",
    "İsmail Yüksek",
    "Fred",
    "Sebastian Szymański",
    "İrfan Can Kahveci",
    "Dušan Tadić",
    "Edin Džeko"
  ],
  previewText: "Ligin şampiyonluk yarışını tayin edecek en kritik derbi maçı. Fenerbahçe'nin iç saha baskısı ve ön alan presi ana strateji olacakken Beşiktaş kontrataklar ile açık arayacak.",
  predictionPoll: {
    homeWinPct: 58,
    drawPct: 24,
    awayWinPct: 18,
    totalVotes: 3240
  }
};

export const communityPoll: Poll = {
  id: "poll-1",
  question: "Beşiktaş derbisinde orta sahadaki üçüncü isim kim olmalı?",
  options: [
    { id: "opt-1", text: "İsmail Yüksek (Defansif güvenlik için)", votes: 1420 },
    { id: "opt-2", text: "Sofyan Amrabat (Derin oyun kurucu rolünde)", votes: 980 },
    { id: "opt-3", text: "Mert Hakan Yandaş (Ön alan presi ve enerji için)", votes: 410 }
  ],
  totalVotes: 2810,
  featuredComment: {
    username: "TaktikSevdalisi",
    comment: "İç saha baskısını kurmak istiyorsak İsmail Yüksek savunma sigortası olarak şart. Fred'in ön alana rahat sızabilmesi için arkasında sert bir kesiciye ihtiyacımız var.",
    likes: 84
  }
};

/**
 * FIREBASE ROADMAP & COLLECTION STRUCTURE (For future Firebase migrations):
 * 
 * 1. Collection: 'articles'
 *    - Fields: { id, title, category, excerpt, content, author, date, readingTime, fitScore, likes }
 * 
 * 2. Collection: 'matches'
 *    - Fields: { id, homeTeam, awayTeam, homeLogo, awayLogo, date, time, competition, probableXI[], previewText, postMatchReport }
 * 
 * 3. Collection: 'players'
 *    - Fields: { id, name, position, formRating, lastMatchRating, trend, shortAnalysis }
 * 
 * 4. Collection: 'transfer_reports'
 *    - Fields: { id, name, position, age, currentClub, fitScore, strengths[], concerns[], reportExcerpt }
 * 
 * 5. Collection: 'polls'
 *    - Fields: { id, question, options: [{ id, text, votes }], totalVotes }
 * 
 * 6. Collection: 'newsletter_subscribers'
 *    - Fields: { email, signupDate }
 * 
 * 7. Collection: 'premium_subscribers'
 *    - Fields: { email, status, stripeUserId }
 */
