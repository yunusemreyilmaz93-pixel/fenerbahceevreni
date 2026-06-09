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
  orderBy
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import { latestArticles, transferTargets, playerPerformances } from '../constants/mockData';

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

// Default Seed Data Generator helper if localStorage/database is blank
const seedDatabaseLocal = () => {
  // Articles seed
  if (!localStorage.getItem("cms_articles")) {
    const formattedArticles = latestArticles.map(a => ({
      id: a.id,
      title: a.title,
      slug: a.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      excerpt: a.excerpt,
      content: `Fenerbahçe camiasının son dönemde yaşadığı taktiksel değişimler mercek altında. Bu yazıda, özellikle teknik heyetin oyuncu tercihleri ve üçüncü bölgede üretilen hücum varyasyonlarının kalitesi irdelenmektedir.\n\n${a.excerpt}\n\nDetaylı pas bağlantı şemaları, geçiş grafikleri ve her bölgeden kazanılan top yüzdelerini incelediğimizde, Fenerbahçe'nin oyunu özellikle orta sahasının dinamizmine dayanmaktadır. Fred'in sahada olduğu anlardaki hücum verimliliği ile olmadığı anlardaki durağanlık, Mourinho'nun sisteminin en büyük kilit noktalarından biridir.\n\nFenerbahçe taraftarının beklentisi her zaman dominant oynamak olduğundan, bu verimli setleri daha sık tekrarlamak zorundayız.`,
      category: a.category,
      tags: ["Mourinho", "Taktik", "Sanal Kurul"],
      coverImage: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600&auto=format&fit=crop",
      author: a.author,
      status: "published",
      isPremium: true,
      featured: true,
      readingTime: a.readingTime,
      publishedAt: new Date(2026, 4, 25).toISOString(),
      createdAt: new Date(2026, 4, 25).toISOString(),
      updatedAt: new Date(2026, 4, 25).toISOString(),
      seoTitle: a.title,
      seoDescription: a.excerpt
    }));
    localStorage.setItem("cms_articles", JSON.stringify(formattedArticles));
  }

  // Matches seed
  if (!localStorage.getItem("cms_matches")) {
    const initialMatches = [
      {
        id: "match-1",
        homeTeam: "Fenerbahçe",
        awayTeam: "Beşiktaş",
        competition: "Trendyol Süper Lig • 36. Hafta",
        matchDate: "2026-05-30T20:00:00",
        venue: "Ülker Stadyumu Şükrü Saracoğlu Spor Kompleksi / Kadıköy",
        status: "upcoming",
        scoreHome: 0,
        scoreAway: 0,
        matchPreview: "Fenerbahçe bu karşılaşmada yüksek yoğunluklu ön alan baskısı yaparak oyun temposunu erkenden eline almak, merkez orta sahada geçiş savunmasını dengede tutmak ve kanat bindirmeleriyle ceza sahasını beslemek zorundadır.",
        tacticalNotes: [
          { title: "Merkezde Denge", text: "Fenerbahçe’nin topa sahip olduğu anlarda iki merkez oyuncusundan birinin mutlaka savunma emniyetini alması gerekiyor." },
          { title: "Kanat Bağlantıları", text: "Sağ ve sol kanatta bek-kanat uyumu maçın hücum kalitesini belirleyebilir." },
          { title: "Ön Alan Baskısı", text: "Rakibin geriden oyun kurmasına izin verilirse merkez blok geriye yaslanıp tempo kaybedebilir." }
        ],
        probableXI: {
          formation: "4-2-3-1",
          GK: "Dominik Livaković",
          RB: "Bright Osayi-Samuel",
          CB1: "Alexander Djiku",
          CB2: "Çağlar Söyüncü",
          LB: "Ferdi Kadıoğlu",
          DM1: "İsmail Yüksek",
          DM2: "Fred",
          RW: "İrfan Can Kahveci",
          AM: "Sebastian Szymański",
          LW: "Dušan Tadić",
          CF: "Edin Džeko"
        },
        keyPlayers: [
          { name: "Sebastian Szymański", role: "Pres Lideri", score: "9.3", reason: "Hücum hattındaki pres dinamizmini yönetiyor." },
          { name: "Ferdi Kadıoğlu", role: "Kreatif Sol Bek", score: "9.1", reason: "İçe kat ederek oyunu üçleyen yapısı en büyük kozumuz." }
        ],
        featured: true,
        createdAt: new Date().toISOString()
      },
      {
        id: "match-2",
        homeTeam: "Fenerbahçe",
        awayTeam: "Kasımpaşa",
        competition: "Trendyol Süper Lig • 35. Hafta",
        matchDate: "2026-05-25T19:00:00",
        venue: "Ülker Stadyumu Kadıköy",
        status: "finished",
        scoreHome: 2,
        scoreAway: 1,
        matchPreview: "Liderlik mücadelesinde evimizde hata yapmamamız gereken kritik mücadele.",
        tacticalNotes: [],
        probableXI: {},
        keyPlayers: [],
        featured: false,
        reportId: "rep-1",
        createdAt: new Date(2026, 4, 25).toISOString()
      }
    ];
    localStorage.setItem("cms_matches", JSON.stringify(initialMatches));
  }

  // Match Reports seed
  if (!localStorage.getItem("cms_match_reports")) {
    const initialReports = [
      {
        id: "rep-1",
        matchId: "match-2",
        title: "Fenerbahçe 2-1 Kasımpaşa | Taktik Maç Raporu",
        slug: "fenerbahce-2-1-kasimpasa-taktik-mac-raporu",
        summary: "Fenerbahçe oyunun bazı bölümlerinde kontrolü kaybetse de Fred'in oyuna girişiyle bireysel kalite ve doğru alan organizasyonuyla geriden gelerek kazanmayı bildirdi.",
        matchStory: "Karşılaşmaya baskılı başlayan sarı-lacivertliler 15. dakikada şok bir kontra golüyle geriye düştü. İkinci yarıda Mourinho'nun çift forvetli baskı sistemine geçmesiyle goller peş peşe geldi.",
        turningPoint: "Fred'in 60. dakikada orta sahayı toparlamak üzere oyuna girmesi maçın kaderini değiştirdi.",
        tacticalPositives: "Hücumda kanatların daha etkin kullanılması ve merkez pres başarısı.",
        tacticalNegatives: "Savunma arkasına atılan ani toplardaki kademe paylaşım sorunları.",
        coachDecisions: "Mourinho maça Szymanski-Tadic hattıyla yerleşik başladı, son çeyrekte ise çift santrafora dönerek Kasımpaşa stoperlerini hataya zorladı.",
        playerRatings: [
          { name: "Dominik Livakovic", position: "GK", rating: 7.5, comment: "Kontra golde çaresizdi ama devrede kritik kurtarışlarla takımı oyunda tuttu." },
          { name: "Fred", position: "CM", rating: 9.0, comment: "Maçın çehresini değiştirdi, sahada basmadık yer bırakmadı." },
          { name: "Edin Dzeko", position: "CF", rating: 8.0, comment: "Geri dönüş golünün mimarı ve hava toplarında mutlak hakim." }
        ],
        fanMotm: "Fred (#35)",
        nextMatchNotes: "Derbi öncesi bek kart limitlerine dikkat edilmesi büyük kazanç oldu.",
        isPremium: true,
        pdfUrl: "",
        status: "published",
        createdAt: new Date(2026, 4, 25).toISOString()
      }
    ];
    localStorage.setItem("cms_match_reports", JSON.stringify(initialReports));
  }

  // Players seed
  if (!localStorage.getItem("cms_players")) {
    const initialPlayers = playerPerformances.map(p => ({
      id: p.id,
      name: p.name,
      position: p.position,
      age: p.id === 'plyr-1' ? 24 : p.id === 'plyr-2' ? 37 : 31,
      nationality: p.id === 'plyr-2' ? "Sırbistan" : "Türkiye",
      photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop",
      formRating: p.formRating.toString(),
      lastMatchRating: p.lastMatchRating.toString(),
      trend: p.trend,
      strengths: ["Hücum Bindirmeleri", "Kıvrak Top Taşıma", "Sağlam Fizik Kondisyon"],
      weaknesses: ["Derin Defans Kademesi", "Hava Topları"],
      analysis: p.shortAnalysis,
      status: "active",
      createdAt: new Date().toISOString()
    }));
    localStorage.setItem("cms_players", JSON.stringify(initialPlayers));
  }

  // Transfer Radar seed
  if (!localStorage.getItem("cms_transfer_reports")) {
    const initialTransfers = transferTargets.map(t => ({
      id: t.id,
      playerName: t.name,
      position: t.position,
      age: t.age,
      nationality: "Belçika",
      currentClub: t.currentClub,
      estimatedCost: "€12M - €15M",
      fitScore: t.fitScore,
      strengths: t.strengths,
      concerns: t.concerns,
      tacticalFit: t.reportExcerpt + " Bu oyuncunun sistem içerisindeki hareket kabiliyeti özellikle bek rotasyonuna inanılmaz bir seviye atlatacaktır.",
      summary: t.reportExcerpt,
      isPremium: true,
      status: "published",
      createdAt: new Date().toISOString()
    }));
    localStorage.setItem("cms_transfer_reports", JSON.stringify(initialTransfers));
  }

  // Polls seed
  if (!localStorage.getItem("cms_polls")) {
    const initialPolls = [
      {
        id: "poll-1",
        question: "Beşiktaş derbisinde kim gol atar?",
        options: ["Edin Džeko", "Sebastian Szymański", "İrfan Can Kahveci", "Kendi kalesine / Diğer"],
        votes: { "Edin Džeko": 154, "Sebastian Szymański": 82, "İrfan Can Kahveci": 112, "Kendi kalesine / Diğer": 34 },
        relatedMatchId: "match-1",
        status: "active",
        createdAt: new Date().toISOString()
      },
      {
        id: "poll-2",
        question: "Şampiyonluk Predictor tahminine göre şansımız kaç?",
        options: ["%90 ve üzeri", "%75 - %89", "%50 - %74", "%50 altı"],
        votes: { "%90 ve üzeri": 451, "%75 - %89": 312, "%50 - %74": 119, "%50 altı": 25 },
        status: "active",
        createdAt: new Date().toISOString()
      }
    ];
    localStorage.setItem("cms_polls", JSON.stringify(initialPolls));
  }

  // newsletter
  if (!localStorage.getItem("cms_newsletter")) {
    const initialSubs = [
      { id: "sub-1", email: "ahmetyilmaz@gmail.com", source: "homepage", subscribedAt: new Date().toISOString(), status: "active" },
      { id: "sub-2", email: "fenerli98@mynet.com", source: "match-center", subscribedAt: new Date().toISOString(), status: "active" }
    ];
    localStorage.setItem("cms_newsletter", JSON.stringify(initialSubs));
  }

  // PremiumContent seed
  if (!localStorage.getItem("cms_premium")) {
    const initialPrem = [
      {
        id: "prem-1",
        title: "Modern Sol Bek Hücum Isı Haritası & PDF",
        contentType: "pdf",
        description: "Ferdi Kadıoğlu'nun 25.04.2026 itibarıyla son 10 iç saha maçında çizdiği içe kat etme koridoru ve Opta verileri.",
        content: "Bu özel araştırmada sol kanat bekimizin sahadaki tüm aksiyonları ve pas varyasyon kilitleri yer almaktadır.",
        pdfUrl: "#",
        accessLevel: "premium_member",
        status: "published",
        createdAt: new Date().toISOString()
      }
    ];
    localStorage.setItem("cms_premium", JSON.stringify(initialPrem));
  }

  // Premium Waitlist seed
  if (!localStorage.getItem("cms_premiumWaitlist")) {
    const initialWaitlist = [
      { id: "wt-1", name: "Alp Gürsoy", email: "alp_gursoy91@hotmail.com", planInterest: "Analiz", interestDetail: "Maç raporları", source: "premium-page", createdAt: new Date(2026, 4, 28, 14, 20).toISOString(), status: "contacted" },
      { id: "wt-2", name: "Cem Tanrıverdi", email: "cem.tanriverdi@outlook.com", planInterest: "Evren", interestDetail: "Hepsi", source: "premium-page", createdAt: new Date(2026, 4, 29, 10, 15).toISOString(), status: "pending" },
      { id: "wt-3", name: "Merve Şen", email: "merve_fb_1907@gmail.com", planInterest: "Destekçi", interestDetail: "Oyuncu analizleri", source: "premium-page", createdAt: new Date(2026, 4, 30, 0, 5).toISOString(), status: "pending" }
    ];
    localStorage.setItem("cms_premiumWaitlist", JSON.stringify(initialWaitlist));
  }

  // Sponsors
  if (!localStorage.getItem("cms_sponsors")) {
    const initialSponsors = [
      {
        id: "spon-1",
        brandName: "Acıbadem Health Group",
        logo: "https://upload.wikimedia.org/wikipedia/commons/d/df/Ac%C4%B1badem_Logo.png",
        websiteUrl: "https://www.acibadem.com.tr",
        placement: "global",
        active: true,
        startDate: "2026-01-01",
        endDate: "2026-12-31",
        notes: "Resmi sağlık ve analiz data sponsoru işbirliği vizyonu.",
        createdAt: new Date().toISOString()
      }
    ];
    localStorage.setItem("cms_sponsors", JSON.stringify(initialSponsors));
  }

  // Homepage Settings
  if (!localStorage.getItem("cms_homepage_settings")) {
    const initialHps = {
      featuredArticleIds: ["art-1", "art-2"],
      featuredMatchId: "match-1",
      featuredTransferReportIds: ["tgt-1"],
      heroTitle: "BAĞIMSIZ FENERBAHÇE ANALİZ ATLASI",
      heroSubtitle: "Camianın taktik rüzgarlarını tarafsız analiz dosyaları, scout haritaları ve interaktif fraksiyon şemalarıyla analiz eden bağımsız futbol bülteni.",
      heroPrimaryButtonText: "Taktik Haritayı Aç",
      heroSecondaryButtonText: "Maç Merkezi",
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem("cms_homepage_settings", JSON.stringify(initialHps));
  }

  // Site Settings
  if (!localStorage.getItem("cms_site_settings")) {
    const initialSettings = {
      siteTitle: "Fenerbahçe Evreni - Bağımsız Analiz Portalı",
      siteDescription: "Fenerbahçe taktik analiz, scout bülteni, taraftar fraksiyonları ve maç merkezi portalı.",
      contactEmail: "iletisim@fenerbahceevreni.com",
      socialLinks: { twitter: "@FenerEvreni", instagram: "fenerbahceevreni", youtube: "fenerbahceevrenitv" },
      disclaimerText: "Fenerbahçe Evreni, bağımsız bir taraftar ve analiz platformudur. Ticari ya da hukuki olarak Fenerbahçe SK ya da bağlı şirketleri ile herhangi bir resmi organik bağı veya ortaklığı bulunmamaktadır.",
      newsletterEnabled: true,
      premiumEnabled: true,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem("cms_site_settings", JSON.stringify(initialSettings));
  }
};

// Seed storage straight away
seedDatabaseLocal();


// Generic high-performance local/cloud operations
export const dbGetCollection = async (collectionName: string): Promise<any[]> => {
  if (isFirebaseConfigured && db) {
    try {
      const snap = await getDocs(collection(db, collectionName));
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, collectionName);
      return [];
    }
  } else {
    const dataStr = localStorage.getItem(`cms_${collectionName}`);
    return dataStr ? JSON.parse(dataStr) : [];
  }
};

export const dbUpsertDocument = async (collectionName: string, id: string, data: any): Promise<void> => {
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

export const dbAddDocument = async (collectionName: string, data: any): Promise<string> => {
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

export const dbDeleteDocument = async (collectionName: string, id: string): Promise<void> => {
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
