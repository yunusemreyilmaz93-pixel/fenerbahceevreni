import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import SEO from './SEO';
import { 
  Search, 
  Lock, 
  Clock, 
  ArrowRight, 
  ChevronLeft, 
  Sparkles, 
  Mail, 
  FileText, 
  CheckCircle, 
  Calendar, 
  User, 
  TrendingUp, 
  Award, 
  ChevronRight,
  Bookmark,
  Share2,
  AlertTriangle,
  Flame,
  ThumbsUp,
  Coins,
  ShieldCheck,
  Zap,
  LayoutGrid
} from 'lucide-react';
import { dbGetCollection, dbAddDocument } from '../../lib/dbService';

interface TransferReport {
  id: string;
  playerName: string;
  slug: string;
  position: string;
  age: number;
  nationality: string;
  currentClub: string;
  estimatedCost: string;
  fitScore: number;
  strengths: string[];
  concerns: string[];
  tacticalFit: string;
  summary: string;
  image?: string;
  isPremium?: boolean;
  status: 'published' | 'draft';
  featured?: boolean;
  createdAt: string;
  updatedAt: string;
}

interface TransferRadarPageProps {
  onNavigate: (view: string) => void;
}

export const TransferRadarPage: React.FC<TransferRadarPageProps> = ({ onNavigate }) => {
  const [reports, setReports] = useState<TransferReport[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtering & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tümü'); // Tümü, Kaleci, Defans, Orta Saha, Kanat, Forvet, Premium, Öne Çıkanlar
  const [extraFilter, setExtraFilter] = useState<'all' | 'high_score' | 'low_cost' | 'high_potential'>('all');

  // Detail view state based on player slug
  const [selectedReportSlug, setSelectedReportSlug] = useState<string | null>(null);

  // Premium Waitlist signup states inside detail view
  const [premiumWaitlistEmail, setPremiumWaitlistEmail] = useState('');
  const [premiumWaitlistSubscribed, setPremiumWaitlistSubscribed] = useState(false);
  const [premiumWaitlistLoading, setPremiumWaitlistLoading] = useState(false);

  // Shared Toast states
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showLocalToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 4000);
  };

  // High-fidelity fallback mock data matching specific prompt examples
  const fallbackReports: TransferReport[] = [
    {
      id: "tgt-fallback-1",
      playerName: "Merkez 6 Profili",
      slug: "merkez-6-profili",
      position: "Merkez Orta Saha (8 Numara)",
      age: 24,
      nationality: "Fransa",
      currentClub: "Avrupa Kulübü",
      estimatedCost: "8-10M €",
      fitScore: 8.4,
      strengths: ["İlk pas kalitesi", "Pozisyon bilgisi", "Geçiş savunması"],
      concerns: ["Maaş beklentisi", "Maksimum tempo", "Lig adaptasyonu"],
      tacticalFit: "Özellikle geriden üçlü oyun kurarken ya da topsuz geçiş prese dönerken stoperlerin önünde kusursuz bir kalkan oluşturuyor. Fred'in sol iç alanda kurduğu baskıyı, savunmada derinlik sağlayarak harika tolere edebilecek nitelikte.",
      summary: "Fenerbahçe’nin savunma önü dengesini artırabilecek, topu ilk bölgede baskı altındayken bile daha temiz çıkarabilecek kusursuza yakın bir dinamik regülatör.",
      isPremium: false,
      status: "published",
      featured: true,
      createdAt: "2026-05-28T12:00:00.000Z",
      updatedAt: "2026-05-28T12:00:00.000Z"
    },
    {
      id: "tgt-fallback-2",
      playerName: "Sol Ayaklı Stoper",
      slug: "sol-ayakli-stoper-analizi",
      position: "Stoper",
      age: 26,
      nationality: "Brezilya",
      currentClub: "Güney Amerika Kulübü",
      estimatedCost: "5-7M €",
      fitScore: 7.9,
      strengths: ["Sol ayak", "Uzun diyagonal pas", "Hava topları"],
      concerns: ["Avrupa lig adaptasyonu", "Riskli derinlemesine paslar"],
      tacticalFit: "Savunma çizgisini önde kurduğumuz sekanslarda sol kanat bek bindirmelerini doğrudan destekleyen diyagonal pas yeteneğine sahip. Sol stoper bölgesinde oyun kurmayı asimetrik olarak çeşitlendiriyor.",
      summary: "Geriye yaslanan sert Anadolu rakiplerine karşı üçüncü bölgeye geçişteki pas kurulumunu dikine hızlandırabilecek kompakt bir sol stoper profili.",
      isPremium: false,
      status: "published",
      featured: false,
      createdAt: "2026-05-27T10:15:00.000Z",
      updatedAt: "2026-05-27T10:15:00.000Z"
    },
    {
      id: "tgt-fallback-3",
      playerName: "Patlayıcı Kanat",
      slug: "patlayici-kanat-forvet-raporu",
      position: "Kanat",
      age: 22,
      nationality: "Fildişi Sahili",
      currentClub: "Fransa Ligi Kulübü",
      estimatedCost: "10-12M €",
      fitScore: 8.1,
      strengths: ["Can yakıcı bire bir", "Yüksek hız", "Ceza sahası koşusu"],
      concerns: ["Son tercih karar kalitesi", "Müsabaka istikrarı"],
      tacticalFit: "Kadıköy'de kapanan 5-4-1 bloklarını delmek için gereken 'bire bir izole delme' gücüne tam uymaktadır. Topu ayağına aldığında rakip savunma dengesini tamamen bozma karakterine sahip.",
      summary: "Kapalı ve blok kurup bekleyen savunmaları açmak için bire bir tehdidi son derece yüksek, tavan potansiyeli muazzam ve yaş itibarıyla gelişim vadisi harika olan bir kanat oyuncusu.",
      isPremium: false,
      status: "published",
      featured: false,
      createdAt: "2026-05-26T18:00:00.000Z",
      updatedAt: "2026-05-26T18:00:00.000Z"
    },
    {
      id: "tgt-fallback-4",
      playerName: "Bitirici Forvet",
      slug: "bitirici-forvet-gol-makinesi",
      position: "Forvet",
      age: 27,
      nationality: "Belçika",
      currentClub: "Belçika Ligi",
      estimatedCost: "6-8M €",
      fitScore: 7.6,
      strengths: ["Ceza sahası konumlanışı", "Tek vuruş kalitesi", "Ön alan presi"],
      concerns: ["Sırtı dönük pas dağıtımı", "Sakatlık geçmişi"],
      tacticalFit: "Kendi ceza sahasına gömülen rakipler karşısında merkezde bitirici rol oynayabilir. Ancak Mourinho'nun forvetten beklediği derine inip top dağıtma rolünde belli esneklik kısıtları mevcuttur.",
      summary: "Ceza sahasında yüksek yüzdeli net bitiricilik sunabilir fakat Fenerbahçe'nin genel geçiş oyun kurulumuna katkısı taktiksel olarak ayrıca tartılmalı.",
      isPremium: false,
      status: "published",
      featured: false,
      createdAt: "2026-05-25T11:20:00.000Z",
      updatedAt: "2026-05-25T11:20:00.000Z"
    },
    {
      id: "tgt-fallback-5",
      playerName: "Box-to-box Orta Saha",
      slug: "box-to-box-orta-saha-enerjisi",
      position: "Orta Saha",
      age: 25,
      nationality: "Hollanda",
      currentClub: "Hollanda Ligi",
      estimatedCost: "7-9M €",
      fitScore: 8.0,
      strengths: ["Tükenmez enerji bütçesi", "Merkez pres şiddeti", "Top taşıma hacmi"],
      concerns: ["Pozisyon disiplini kaybı", "Yay çevresi son kilit pas"],
      tacticalFit: "Oyun temposunu çift yönlü üst düzeye fırlatıyor. Fred'in sakatlık veya cezalı olduğu haftalardaki rotasyon zayıflığını tamamen emebilecek, koşu mesafeleri ve presi eşsiz bir kutudan kutuya aktör.",
      summary: "Fenerbahçe'nin özellikle Avrupa kupası deplasmanlarında orta saha temposunu ve direncini üst seviyeye çıkartabilecek ancak sahada taktik disiplin ile kontrol edilmesi gereken bir isim.",
      isPremium: false,
      status: "published",
      featured: false,
      createdAt: "2026-05-23T14:40:00.000Z",
      updatedAt: "2026-05-23T14:40:00.000Z"
    },
    {
      id: "tgt-fallback-6",
      playerName: "Modern Sağ Bek",
      slug: "modern-sag-bek-hiz-makinesi",
      position: "Defans",
      age: 23,
      nationality: "Portekiz",
      currentClub: "Portekiz Ligi",
      estimatedCost: "4-6M €",
      fitScore: 7.8,
      strengths: ["Çizgi bindirmeleri", "Milimetrik orta kalitesi", "Sprinter hız koridoru"],
      concerns: ["Savunma yerleşim disiplini", "Fiziksel temas ikili mücadeleleri"],
      tacticalFit: "Hücumda üçüncü bölgenin asimetrik çizgi genişliğini kusursuz açar. Tadic'in içe girdiği ve oyunu yönlendirdiği senaryolarda arka kulvarı olağanüstü yüksek süratle süpürebilir.",
      summary: "Hücum katkısı takdire şayan, genişlik sağlayan ve atletizmiyle göz kamaştıran ama defansif disiplini Kadıköy'ün ağır faturalı derbilerinde test edilmesi gereken bir bek opsiyonu.",
      isPremium: false,
      status: "published",
      featured: false,
      createdAt: "2026-05-22T09:00:00.000Z",
      updatedAt: "2026-05-22T09:00:00.000Z"
    },
    {
      id: "tgt-fallback-7",
      playerName: "Yaratıcı 10 Numara",
      slug: "yaratici-10-numara-akli",
      position: "Orta Saha",
      age: 28,
      nationality: "İspanya",
      currentClub: "İspanya Ligi",
      estimatedCost: "Serbest / düşük maliyet",
      fitScore: 7.3,
      strengths: ["Kilit anahtar ara paslar", "Duran top ustatlığı", "Maksimum sahne yaratıcılığı"],
      concerns: ["Fiziksel ikili pres gücü", "Geri koşu direnci", "Kronikleşen yaş profili"],
      tacticalFit: "Saha içi beynini ve pas estetiğini üst seviyeye çeker. Sıkışan kapalı savunma kilitlerini tek pasla açabilir fakat Mourinho'nun ön alan pres ve sert savunma felsefesinde eksi yazar.",
      summary: "Kapalı ve sert kilitli Anadolu maçlarını açabilecek elit bir pas kalitesi sunar fakat Avrupa seviyesindeki yüksek ritimli maçlarda fiziksel direnç açısından dezavantaj oluşturur.",
      isPremium: false,
      status: "published",
      featured: false,
      createdAt: "2026-05-20T16:15:00.000Z",
      updatedAt: "2026-05-20T16:15:00.000Z"
    },
    {
      id: "tgt-fallback-8",
      playerName: "Premium: Nordik Dinamosu Detaylı Analizi",
      slug: "nordik-dinamosu-derin-scout-raporu",
      position: "Orta Saha",
      age: 23,
      nationality: "Danimarka",
      currentClub: "Hollanda Eredivisie",
      estimatedCost: "12-14M €",
      fitScore: 9.1,
      strengths: ["Kapsamlı oyun aklı", "İkili mücadele üstünlüğü", "Asist beklentisi (xA)"],
      concerns: ["Yüksek bonservis talebi", "Premier lig talipleriyle rekabet"],
      tacticalFit: "Hem 6 hem 8 numarada kusursuz oynayan, ısı haritasında sahanın her santimetresine dokunan, geçişlerde pas hatası yapmayan elit bir modern orta saha lideri. Mourinho'nun taktiksel rüyası rolünde.",
      summary: "Orta saha göbeğinde hem savunma sertliğini yükseltecek hem de hücum üretkenliğini en üst seviyeye çıkaracak, geleceği pırlanta gibi parlayan modern bir Nordik dinamosu.",
      isPremium: true,
      status: "published",
      featured: false,
      createdAt: "2026-05-18T14:00:00.000Z",
      updatedAt: "2026-05-18T14:00:00.000Z"
    }
  ];

  // Retrieve data from Firebase
  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
        const list = await dbGetCollection('transferReports');
        // Only show published publicly
        const published = list.filter((r: any) => r.status === 'published');
        
        const isSeeded = localStorage.getItem("cms_firebase_seeded_done") === "true" || !!localStorage.getItem("cms_articles");
        
        if (published && (published.length > 0 || isSeeded)) {
          // Normalize firebase array fields just in case they are saved as string
          const normalized = published.map((report: any) => ({
            ...report,
            strengths: Array.isArray(report.strengths) 
              ? report.strengths 
              : (typeof report.strengths === 'string' ? report.strengths.split(',').map((s: string) => s.trim()) : []),
            concerns: Array.isArray(report.concerns) 
              ? report.concerns 
              : (typeof report.concerns === 'string' ? report.concerns.split(',').map((c: string) => c.trim()) : [])
          }));
          setReports(normalized);
        } else {
          setReports(fallbackReports);
        }
      } catch (err) {
        console.error("Firebase transferReports retrieval error, fallback loaded:", err);
        setReports(fallbackReports);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  // Sync hash routing for shareability
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#/transfer-radar/')) {
        const slug = hash.replace('#/transfer-radar/', '');
        if (slug) {
          setSelectedReportSlug(slug);
        } else {
          setSelectedReportSlug(null);
        }
      } else {
        setSelectedReportSlug(null);
      }
    };
    window.addEventListener('hashchange', handleHash);
    handleHash();
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const handleSelectReport = (slug: string) => {
    window.location.hash = `#/transfer-radar/${slug}`;
    setSelectedReportSlug(slug);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToList = () => {
    window.location.hash = '#/transfer-radar';
    setSelectedReportSlug(null);
  };

  // Filtering calculations on loaded reports/mock
  const filteredReports = useMemo(() => {
    return reports.filter(r => {
      // 1. Text Search matching player name, club, position, or tags/strengths
      const lowerQuery = searchQuery.toLowerCase();
      const matchesSearch = 
        r.playerName.toLowerCase().includes(lowerQuery) || 
        r.position.toLowerCase().includes(lowerQuery) || 
        r.currentClub.toLowerCase().includes(lowerQuery) ||
        r.strengths.some(st => st.toLowerCase().includes(lowerQuery));

      // 2. Main category pill selection
      let matchesCategory = false;
      if (selectedCategory === 'Tümü') {
        matchesCategory = true;
      } else if (selectedCategory === 'Premium') {
        matchesCategory = !!r.isPremium;
      } else if (selectedCategory === 'Öne Çıkanlar') {
        matchesCategory = !!r.featured;
      } else if (selectedCategory === 'Kaleci') {
        matchesCategory = r.position.toLowerCase().includes('kaleci');
      } else if (selectedCategory === 'Defans') {
        // Matches defans, bek, stoper
        matchesCategory = 
          r.position.toLowerCase().includes('stoper') || 
          r.position.toLowerCase().includes('bek') || 
          r.position.toLowerCase().includes('defans');
      } else if (selectedCategory === 'Orta Saha') {
        matchesCategory = r.position.toLowerCase().includes('orta saha') || r.position.toLowerCase().includes('libero') || r.position.toLowerCase().includes('10 numara');
      } else if (selectedCategory === 'Kanat') {
        matchesCategory = r.position.toLowerCase().includes('kanat');
      } else if (selectedCategory === 'Forvet') {
        matchesCategory = r.position.toLowerCase().includes('forvet') || r.position.toLowerCase().includes('santrfor');
      }

      // 3. Extra granular drop side filters
      let matchesExtra = true;
      if (extraFilter === 'high_score') {
        matchesExtra = r.fitScore >= 8.0;
      } else if (extraFilter === 'low_cost') {
        // Low cost filter approximation (such as containing free, or lower numbers)
        const text = r.estimatedCost.toLowerCase();
        matchesExtra = text.includes('serbest') || text.includes('2-') || text.includes('3-') || text.includes('4-') || text.includes('5-') || text.includes('6-');
      } else if (extraFilter === 'high_potential') {
        // Based on younger age profiles (<= 24)
        matchesExtra = r.age <= 24;
      }

      return matchesSearch && matchesCategory && matchesExtra;
    });
  }, [reports, searchQuery, selectedCategory, extraFilter]);

  // Featured scout report
  const featuredReport = useMemo(() => {
    const found = reports.find(r => r.featured === true);
    if (found) return found;
    return reports.find(r => !r.isPremium) || reports[0];
  }, [reports]);

  // Selected dynamic detail report
  const currentReport = useMemo(() => {
    if (!selectedReportSlug) return null;
    return reports.find(r => r.slug === selectedReportSlug);
  }, [reports, selectedReportSlug]);

  // Premium waitlist handling
  const handlePremiumWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!premiumWaitlistEmail || !premiumWaitlistEmail.includes('@')) {
      showLocalToast('Lütfen geçerli bir e-posta adresi yazın.', 'error');
      return;
    }
    setPremiumWaitlistLoading(true);
    try {
      await dbAddDocument('newsletter', {
        email: premiumWaitlistEmail.trim(),
        source: 'premium_scout_waitlist_radar',
        subscribedAt: new Date().toISOString(),
        status: 'active',
        isPremiumWaitlist: true,
        interestedPlayerSlug: selectedReportSlug || 'general_transfer_radar'
      });
      setPremiumWaitlistSubscribed(true);
      setPremiumWaitlistEmail('');
      showLocalToast('Kayıt alındı! Premium transfer raporları bülteni yakında posta kutunda olacak. 🔔');
    } catch (err) {
      console.error(err);
      showLocalToast('Kayıt esnasında bir sorun oluştu.', 'error');
    } finally {
      setPremiumWaitlistLoading(false);
    }
  };

  // Priority needs board targets
  const transferNeeds = [
    {
      position: '6 Numara (Ön Libero / Çapa)',
      priority: 'Çok Yüksek',
      color: 'border-rose-500/20 bg-rose-500/5 text-rose-400',
      reason: 'Fred ve Szymanski\'nin orta alandaki baskısını geriden emniyete alacak ve ilk oyun kurma pas kalitesini yukarılara sırtlayacak üst kalibre bir çapa rolü elzem.'
    },
    {
      position: 'Sol Stoper (Asimetrik Kurulumcu)',
      priority: 'Yüksek',
      color: 'border-amber-500/20 bg-amber-500/5 text-amber-400',
      reason: 'Geri oyun kurulumlarında rakiplerin yoğun pres barikatını asimetrik sol ayak diyagonalleriyle bozacak, hava toplarında rakip santrforu eritecek nitelikte lider.'
    },
    {
      position: 'Patlayıcı Çizgi Kanatı (Bire Bir Tehdidi)',
      priority: 'Orta-Yüksek',
      color: 'border-fb-yellow/20 bg-fb-yellow/5 text-fb-yellow',
      reason: 'Kapalı ve 5\'li savunmalarda yaratıcılık tıkanması yaşandığı anlarda patlayıcı dribbling ivmelenmesiyle rakipleri gafil avlayacak, oyuna genişlik veren profil.'
    },
    {
      position: 'Yırtıcı Alternatif Forvet',
      priority: 'Duruma Bağlı',
      color: 'border-slate-500/20 bg-slate-500/5 text-slate-400',
      reason: 'Takımdaki olası taktik geçişlerde çift santrforlu sisteme uyacak ve hücum pres zenginliğini eksiltmeyecek sırtı dönük oynayabilen agresif bitirici.'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-fb-dark">
        <div className="space-y-4 text-center">
          <div className="w-12 h-12 border-4 border-fb-yellow border-t-transparent rounded-full animate-spin mx-auto mr-0"></div>
          <p className="text-xs font-black uppercase text-fb-yellow tracking-[0.2em] animate-pulse">GLOBAL SCOUT RADAR VERİLERİ YÜKLENİYOR...</p>
        </div>
      </div>
    );
  }

  // Active Category Pills
  const categoryPills = ['Tümü', 'Kaleci', 'Defans', 'Orta Saha', 'Kanat', 'Forvet', 'Premium', 'Öne Çıkanlar'];

  return (
    <div className="bg-fb-dark min-h-screen text-slate-100 relative overflow-hidden">
      {currentReport ? (
        <SEO 
          title={`${currentReport.playerName} Transfer Analizi | Fenerbahçe Evreni`}
          description={`${currentReport.playerName} transfer analiz raporu. Pozisyon: ${currentReport.position}, Yaş: ${currentReport.age}, Mevcut Kulüp: ${currentReport.currentClub || 'Bilinmiyor'}. Detaylı taktik uyum ve fit score verileri.`}
          canonical={`https://fenerbahceevreni.com/transfer-radar/${currentReport.slug}`}
          ogImage={currentReport.coverImage}
        />
      ) : (
        <SEO 
          title="Transfer Radar | Fenerbahçe Evreni"
          description="Fenerbahçe transfer gündemindeki oyuncular için bağımsız analiz ekibimizin taktik uyum (fit score), maliyet, yaş ve risk analiz matrisleri."
          canonical="https://fenerbahceevreni.com/transfer-radar"
        />
      )}
      
      {/* Dynamic Toast feedback */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`fixed bottom-6 right-6 z-[200] max-w-sm p-4 rounded-xl shadow-2xl border text-xs font-bold flex items-center gap-3 ${
              toastMsg.type === 'success' 
                ? 'bg-emerald-950/90 border-emerald-500/30 text-emerald-400' 
                : 'bg-rose-950/90 border-rose-500/30 text-rose-400'
            }`}
          >
            <CheckCircle size={16} className="shrink-0 animate-bounce" />
            <span>{toastMsg.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {!currentReport ? (
          /* ========================================================================= */
          /* 1. LIST ARCHIVE VIEW                                                      */
          /* ========================================================================= */
          <motion.div
            key="list-transfers"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="pb-24 text-left"
          >
            {/* HERO MODULE */}
            <header className="relative pt-28 pb-16 bg-gradient-to-b from-fb-navy/35 to-transparent border-b border-white/[0.04]">
              <div className="container mx-auto px-6 max-w-6xl space-y-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-fb-yellow/10 border border-fb-yellow/20 text-fb-yellow [font-size:10px] uppercase font-black tracking-widest">
                  <Award size={11} className="animate-spin" /> Bağımsız Scout & Analiz Departmanı
                </div>
                
                <h1 className="text-4xl md:text-5xl font-display font-black text-white italic uppercase tracking-tight leading-none">
                  Transfer Radar
                </h1>
                
                <p className="text-sm text-fb-muted max-w-2xl font-medium leading-relaxed">
                  Fenerbahçe’nin transfer gündemindeki veya potansiyel olarak takip edilen oyuncuları kuru dedikodulardan uzak; taktik rol, tahmini maliyet, savunma/hücum uyumu ve adaptasyon riskleri çerçevesinde değerlendiren profesyonel bağımsız izleme veri tabanı.
                </p>

                {/* Info summary pills in hero */}
                <div className="flex flex-wrap gap-2 pt-4">
                  {['Oyuncu Profili', 'Taktik Uyum', 'Maliyet Analizi', 'İkili Riskler', 'Fit Score', 'Premium Rapor'].map((inf) => (
                    <span key={inf} className="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-slate-300">
                      • {inf}
                    </span>
                  ))}
                </div>
              </div>
            </header>

            {/* FEATURED TRANSFER SUMMARY CARD */}
            {featuredReport && selectedCategory === 'Tümü' && !searchQuery && extraFilter === 'all' && (
              <section className="container mx-auto px-6 max-w-6xl py-12">
                <div className="mb-6">
                  <span className="text-[10px] font-black uppercase tracking-[0.25em] text-fb-yellow block">Mourinho Sistemine En Uyumlu Profil</span>
                  <h2 className="text-xl font-display font-black text-white uppercase italic">Öne Çıkan Scout Raporu</h2>
                </div>

                <div 
                  onClick={() => handleSelectReport(featuredReport.slug)}
                  className="group relative rounded-3xl bg-fb-card border border-white/[0.08] hover:border-fb-yellow/35 transition-all cursor-pointer overflow-hidden grid grid-cols-1 lg:grid-cols-12 shadow-2xl bg-gradient-to-r from-fb-card to-[#121826]"
                >
                  {/* Left portion: visual score and player stats details */}
                  <div className="lg:col-span-4 p-8 flex flex-col justify-between items-center text-center bg-fb-dark/40 border-r border-white/[0.04] relative">
                    <div className="absolute top-4 left-4">
                      {featuredReport.isPremium && (
                        <span className="px-2.5 py-1 text-[9px] font-black bg-fb-yellow text-fb-navy rounded-md uppercase tracking-wider flex items-center gap-1">
                          <Lock size={9} /> Premium
                        </span>
                      )}
                    </div>

                    <div className="py-6 space-y-4">
                      {/* Abstract Silhouette with beautiful design scale */}
                      <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-fb-navy to-fb-dark border-2 border-fb-yellow/30 flex items-center justify-center text-fb-yellow/70 text-3xl font-display italic font-black shadow-inner mx-auto group-hover:scale-105 transition-transform">
                        {featuredReport.playerName.substring(0, 2).toUpperCase()}
                      </div>

                      <div>
                        <h3 className="text-2xl font-black text-white uppercase italic group-hover:text-fb-yellow transition-colors">{featuredReport.playerName}</h3>
                        <span className="text-xs text-fb-yellow font-black uppercase tracking-wider block mt-1">{featuredReport.position}</span>
                      </div>
                    </div>

                    {/* Circular Dial Fit Score gauge representation */}
                    <div className="p-4 rounded-2xl bg-fb-dark border border-white/5 w-full flex items-center justify-between gap-4">
                      <div className="text-left">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">GENEL UYUM</span>
                        <span className="text-xs font-bold text-fb-muted">Kadro/Taktik</span>
                      </div>
                      <div className="flex items-baseline gap-0.5">
                        <span className="text-3xl font-display font-black text-fb-yellow">{featuredReport.fitScore}</span>
                        <span className="text-xs text-slate-400 font-bold">/10</span>
                      </div>
                    </div>
                  </div>

                  {/* Right portion: core data tags and excerpt summaries */}
                  <div className="lg:col-span-8 p-8 flex flex-col justify-between space-y-6">
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-4 border-b border-white/[0.04]">
                        <div>
                          <span className="text-[9px] text-fb-muted font-black uppercase tracking-wider block">YAŞ</span>
                          <span className="text-xs font-bold text-slate-100">{featuredReport.age} Yaşında</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-fb-muted font-black uppercase tracking-wider block">TEBAA / UYRUK</span>
                          <span className="text-xs font-bold text-slate-100">{featuredReport.nationality}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-fb-muted font-black uppercase tracking-wider block">MEVCUT KULÜBÜ</span>
                          <span className="text-xs font-bold text-slate-100">{featuredReport.currentClub}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-fb-muted font-black uppercase tracking-wider block">TAHMİNİ MAALİYET</span>
                          <span className="text-xs font-bold text-emerald-400">{featuredReport.estimatedCost}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <span className="text-[10px] uppercase font-black tracking-widest text-[#FFB020] flex items-center gap-1"><Sparkles size={11} /> SCOUT DEĞERLENDİRME ÖZETİ</span>
                        <p className="text-sm text-slate-300 leading-relaxed font-semibold">
                          {featuredReport.summary}
                        </p>
                      </div>

                      {/* Display a small box of tactical suitability extract */}
                      {featuredReport.tacticalFit && (
                        <p className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-fb-muted italic leading-relaxed">
                          " {featuredReport.tacticalFit} "
                        </p>
                      )}
                    </div>

                    <div className="pt-6 border-t border-white/[0.04] flex items-center justify-between flex-wrap gap-4">
                      <div className="flex gap-1.5 flex-wrap">
                        {featuredReport.strengths.slice(0, 2).map((str, i) => (
                          <span key={i} className="text-[9px] font-black uppercase bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-md">
                            + {str}
                          </span>
                        ))}
                      </div>

                      <span className="px-5 py-3 bg-fb-yellow hover:bg-white text-fb-navy text-[11px] font-black uppercase rounded-xl tracking-wider transition-all flex items-center gap-2 shadow-lg shadow-fb-yellow/5 shrink-0">
                        Detaylı Raporu Oku <ArrowRight size={13} />
                      </span>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* FILTER BAR SECTION */}
            <section className="container mx-auto px-6 max-w-6xl py-4">
              <div className="p-6 rounded-2xl bg-fb-card border border-white/[0.06] space-y-4">
                
                {/* Search & Extra subfilters inside single line widget */}
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                  {/* Search box widget */}
                  <div className="relative w-full md:w-80">
                    <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-fb-muted" />
                    <input 
                      type="text" 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Oyuncu ara (isim, mevki, kulüp...)"
                      className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-fb-dark border border-white/10 text-xs text-white focus:outline-none focus:border-fb-yellow placeholder-fb-muted font-semibold"
                    />
                  </div>

                  {/* Extra filters pills (Fit score 8+, Low cost, high potential) */}
                  <div className="flex flex-wrap gap-2 items-center justify-end w-full md:w-auto">
                    <span className="text-[10px] font-black text-fb-muted uppercase tracking-widest mr-2">Filtrele:</span>

                    <button 
                      onClick={() => setExtraFilter('all')} 
                      className={`text-[10px] font-bold px-3 py-1.5 rounded-lg border transition-all ${
                        extraFilter === 'all' 
                          ? 'bg-white/10 text-white border-white/20' 
                          : 'bg-white/[0.02] text-slate-400 border-transparent hover:border-white/10'
                      }`}
                    >
                      Tümü
                    </button>

                    <button 
                      onClick={() => setExtraFilter('high_score')} 
                      className={`text-[10px] font-bold px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1 ${
                        extraFilter === 'high_score' 
                          ? 'bg-fb-yellow/10 text-fb-yellow border-fb-yellow/35' 
                          : 'bg-white/[0.02] text-slate-400 border-transparent hover:border-fb-yellow/20'
                      }`}
                    >
                      <Zap size={11} /> Fit Score 8.0+
                    </button>

                    <button 
                      onClick={() => setExtraFilter('low_cost')} 
                      className={`text-[10px] font-bold px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1 ${
                        extraFilter === 'low_cost' 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                          : 'bg-white/[0.02] text-slate-400 border-transparent hover:border-emerald-500/15'
                      }`}
                    >
                      <Coins size={11} /> Düşük Maliyet (F/P)
                    </button>

                    <button 
                      onClick={() => setExtraFilter('high_potential')} 
                      className={`text-[10px] font-bold px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1 ${
                        extraFilter === 'high_potential' 
                          ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' 
                          : 'bg-white/[0.02] text-slate-400 border-transparent hover:border-purple-500/15'
                      }`}
                    >
                      <TrendingUp size={11} /> Genç Potansiyel (≤24)
                    </button>
                  </div>
                </div>

                {/* Main Category pill strip */}
                <div className="flex flex-wrap gap-2 pt-2 border-t border-white/[0.04]">
                  {categoryPills.map((p) => (
                    <button
                      key={p}
                      onClick={() => setSelectedCategory(p)}
                      className={`text-[9px] font-black uppercase tracking-widest px-3.5 py-2 rounded-lg border transition-all cursor-pointer ${
                        selectedCategory === p 
                          ? 'bg-fb-yellow border-fb-yellow text-fb-navy shadow-lg shadow-fb-yellow/5' 
                          : 'bg-white/5 border-white/5 text-slate-300 hover:border-fb-yellow/30 hover:bg-white/[0.08]'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>

              </div>
            </section>

            {/* TRANSFER REPORT CARDS GRID */}
            <section className="container mx-auto px-6 max-w-6xl py-8">
              {filteredReports.length === 0 ? (
                /* Empty state container */
                <div className="py-20 text-center max-w-md mx-auto space-y-6">
                  <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-fb-muted mx-auto">
                    <Search size={22} />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-lg font-black text-white italic uppercase">Eşleşen Scout Raporu Bulunamadı</h3>
                    <p className="text-xs text-fb-muted leading-relaxed">
                      Lütfen oyuncu ismini doğru yazdığınızdan emin olun veya kategori/ekstra filtre tercihlerini sıfırlayarak aramayı genişletin.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('Tümü');
                      setExtraFilter('all');
                    }}
                    className="px-5 py-2.5 bg-fb-yellow hover:bg-white text-fb-navy text-[11px] font-black uppercase rounded-lg tracking-wider transition-all"
                  >
                    Tüm Filtreleri Sıfırla
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredReports.map((report, idx) => (
                    <motion.div
                      key={report.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: Math.min(idx * 0.05, 0.4) }}
                      onClick={() => handleSelectReport(report.slug)}
                      className="group rounded-2xl bg-fb-card border border-white/[0.06] hover:border-fb-yellow/20 flex flex-col justify-between transition-all cursor-pointer overflow-hidden p-6"
                    >
                      <div className="text-left space-y-4">
                        
                        {/* Card header meta */}
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-black text-white uppercase group-hover:text-fb-yellow transition-colors italic leading-tight">
                              {report.playerName}
                            </h3>
                            <span className="text-[10px] font-bold text-fb-muted uppercase tracking-wider block mt-0.5">
                              {report.position}
                            </span>
                          </div>
                          
                          {/* Circle Badge Fit Score */}
                          <div className="px-3 py-1.5 rounded-xl bg-fb-dark border border-white/10 text-center shrink-0">
                            <div className="text-[8px] font-black text-fb-yellow uppercase leading-none tracking-widest mb-0.5">FIT</div>
                            <div className="text-sm font-black text-white leading-none">{report.fitScore}</div>
                          </div>
                        </div>

                        {/* Player specs table */}
                        <div className="grid grid-cols-3 gap-2 py-2 border-t border-b border-white/[0.04] text-[10px] font-bold text-fb-muted">
                          <div>
                            <span className="block text-[8px] text-slate-400 font-extrabold uppercase mb-0.5">YAS / KULÜP</span>
                            <span className="text-white truncate block">{report.age} • {report.currentClub}</span>
                          </div>
                          <div>
                            <span className="block text-[8px] text-slate-400 font-extrabold uppercase mb-0.5">UYRUK</span>
                            <span className="text-white truncate block">{report.nationality}</span>
                          </div>
                          <div>
                            <span className="block text-[8px] text-slate-400 font-extrabold uppercase mb-0.5">MALİYET</span>
                            <span className="text-emerald-400 truncate block">{report.estimatedCost}</span>
                          </div>
                        </div>

                        {/* Short paragraph summary excerpt */}
                        <p className="text-xs text-fb-muted leading-relaxed line-clamp-3 italic">
                          "{report.summary}"
                        </p>

                        {/* Tag badges lists */}
                        <div className="space-y-2 pt-2">
                          <div className="flex flex-wrap gap-1">
                            {report.strengths.slice(0, 2).map((st, i) => (
                              <span key={i} className="text-[8px] font-extrabold uppercase px-1.5 py-0.5 bg-emerald-500/5 text-emerald-400 border border-emerald-500/10 rounded">
                                + {st}
                              </span>
                            ))}
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {report.concerns.slice(0, 2).map((con, i) => (
                              <span key={i} className="text-[8px] font-extrabold uppercase px-1.5 py-0.5 bg-[#FFB020]/5 text-[#FFB020] border border-[#FFB020]/10 rounded">
                                - {con}
                              </span>
                            ))}
                          </div>
                        </div>

                      </div>

                      {/* Card Footer actions */}
                      <div className="pt-4 mt-6 border-t border-white/[0.04] flex items-center justify-between">
                        {report.isPremium ? (
                          <span className="px-2 py-0.5 rounded bg-fb-navy border border-fb-yellow/30 text-fb-yellow text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
                            <Lock size={9} /> Premium
                          </span>
                        ) : (
                          <span className="text-[10px] text-fb-muted font-bold">Kamuoyu Raporu</span>
                        )}
                        
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#FFB020] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                          İncele <ChevronRight size={13} />
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </section>

            {/* PRIORITY TRANSFER NEEDS BOARD */}
            <section className="container mx-auto px-6 max-w-6xl py-12 border-t border-white/[0.03]">
              <div className="mb-8 text-left">
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-fb-yellow block mb-2">Taktik Kurul İhtiyaç Şeması</span>
                <h2 className="text-2xl md:text-3xl font-display font-black text-white uppercase italic tracking-tight">Öncelikli Mevki İhtiyaçları</h2>
                <p className="text-xs text-fb-muted mt-1">Bu sezon için Fenerbahçe'nin saha içi omurgasını kuvvetlendirecek taktiksel öncelikli pozisyon hamle tablosu.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {transferNeeds.map((need, i) => (
                  <div key={i} className="p-6 rounded-2xl bg-fb-card border border-white/[0.06] flex flex-col justify-between relative overflow-hidden group">
                    <div className="space-y-3 text-left">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-black text-white uppercase truncate">{need.position}</span>
                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border tracking-widest shrink-0 ${need.color}`}>
                          {need.priority}
                        </span>
                      </div>
                      <p className="text-xs text-fb-muted leading-relaxed font-semibold">
                        {need.reason}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/[0.04] flex items-center text-[10px] text-fb-yellow font-black uppercase tracking-widest gap-1 group-hover:text-white transition-colors cursor-pointer" onClick={() => { setSelectedCategory(i === 0 ? 'Orta Saha' : (i === 1 ? 'Defans' : (i === 2 ? 'Kanat' : 'Forvet'))) }}>
                      İLİŞKİLİ OYUNCULARA BAK <ArrowRight size={11} />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* HOW THE FIT SCORE MODULE WORKS */}
            <section className="container mx-auto px-6 max-w-6xl py-12 border-t border-white/[0.03]">
              <div className="mb-8 text-left">
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-fb-yellow block mb-2">Veri Algoritması Standardı</span>
                <h2 className="text-2xl md:text-3xl font-display font-black text-white uppercase italic tracking-tight">Fit Score Nasıl Hesaplanıyor?</h2>
                <p className="text-xs text-[#8A99AD] mt-1">Bir scout raporunun üzerinde beliren Fit Score; oyuncunun sadece popülaritesi değil, 6 boyutlu bir analitik matrisin sonucudur.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  {
                    title: 'Taktiksel Uyumluluk',
                    desc: 'Mourinho\'nun geçiş savunması, blok daraltma presi, dikey pas oyunu ve bek katılım senaryolarına oyuncunun ısı haritası ve pas hacmi açısının korelasyonu.'
                  },
                  {
                    title: 'Kadro Şablonu İhtiyacı',
                    desc: 'Mevcut Fenerbahçe asıl kadrosundaki derinlik durumu, kritik sakatlık profilleri, yerli/yabancı statü esnekliği ve anlık mevki zaaf bütçeleri.'
                  },
                  {
                    title: 'Bonservis & Maliyet',
                    desc: 'Oyuncunun mevcut kulübüyle kalan kontrat süresi, tahmini serbest kalma maddesi dikey bütçe sınırları ve talep ettiği olası yıllık garanti ücret dengesi.'
                  },
                  {
                    title: 'Fiziksel Seviye / Dayanıklılık',
                    desc: 'Süper ligin sert ikili mücadele iklimine dayanabilecek kemik kalitesi, 90 dakikalık sprint tekrarlayabilme potansiyeli ve sakatlık geçmişi direnci.'
                  },
                  {
                    title: 'Yaş Profili & Potansiyel',
                    desc: 'Oyuncunun kariyer zirvesinde olup olmadığı, gelişim/scout satış değeri taşıma derecesi veya takıma katacağı yaşanmış liderlik/tecrübe dengesi.'
                  },
                  {
                    title: 'Lig & Kültür Adaptasyon Riski',
                    desc: 'Geldiği ligin karakteristik temposunun Süper Lig dinamikleriyle uyumluluğu, oyuncunun geçmişteki uyum hızı ve taraftar baskısı kaldırma mental gücü.'
                  }
                ].map((item, idx) => (
                  <div key={idx} className="p-6 rounded-2xl bg-fb-card/40 border border-white/[0.04] text-left space-y-3">
                    <span className="text-fb-yellow text-xs font-black font-display italic">0{idx+1} {item.title}</span>
                    <p className="text-xs text-fb-muted leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* NEWSLETTER CTA FOR PREMIUM LAUNCH */}
            <section className="container mx-auto px-6 max-w-6xl py-4">
              <div id="newsletter-scout" className="p-8 md:p-12 rounded-3xl bg-fb-card border border-white/[0.06] relative overflow-hidden flex flex-col md:flex-row gap-8 items-center justify-between text-left shadow-2xl bg-gradient-to-br from-fb-card to-[#121826]">
                <div className="absolute top-0 right-0 w-80 h-80 bg-fb-yellow/[0.015] rounded-full blur-[100px] pointer-events-none"></div>
                
                <div className="space-y-3 max-w-xl">
                  <div className="flex items-center gap-1.5 text-[#FFB020] font-black text-[10px] tracking-widest uppercase">
                    <Sparkles size={11} className="animate-pulse" /> Premium Transfer Dosyaları
                  </div>
                  <h3 className="text-2xl md:text-3xl font-display font-black text-white italic uppercase tracking-tight">
                    Detaylı Profesyonel Rapor Arşivine Katılın
                  </h3>
                  <p className="text-xs text-fb-muted leading-relaxed font-semibold">
                    Bazı transfer profilleri daha detaylı scout raporu formatında hazırlanır: güçlü yönler, zayıf yönler, video gözlem notları, sistem uyumu, alternatif oyuncular ve PDF rapor arşivi elimizin altında. Premium listesine katılarak ilk siz haberdar olun!
                  </p>
                </div>

                <div className="w-full md:w-auto shrink-0 min-w-[300px]">
                  <button 
                    onClick={() => onNavigate('premium')}
                    className="w-full py-4 bg-fb-yellow hover:bg-white text-fb-navy font-black text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-lg flex items-center justify-center gap-2"
                  >
                    Premium Listesine Katıl
                  </button>
                </div>
              </div>
            </section>

          </motion.div>
        ) : (
          /* ========================================================================= */
          /* 2. REPORT DETAIL VIEW (PREMIUM GATE COMPLIANT)                           */
          /* ========================================================================= */
          <motion.div
            key="detail-transfer"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="pb-24 pt-28 text-left"
          >
            {currentReport ? (
              <div className="container mx-auto px-6 max-w-4xl space-y-8">
                
                {/* Back Link */}
                <button 
                  onClick={handleBackToList}
                  className="inline-flex items-center gap-1.5 text-xs font-black text-fb-yellow hover:text-white uppercase tracking-wider transition-all cursor-pointer"
                >
                  <ChevronLeft size={16} /> Transfer Radar Listesine Geri Dön
                </button>

                {/* Profile header metadata card */}
                <div className="p-8 rounded-3xl bg-fb-card border border-white/[0.08] relative overflow-hidden my-4">
                  <div className="absolute top-5 right-5 flex gap-2">
                    {currentReport.isPremium && (
                      <span className="px-2.5 py-1 text-[9px] font-black bg-fb-yellow text-fb-navy rounded uppercase tracking-wider flex items-center gap-1 shadow-md">
                        <Lock size={9} /> Premium Rapor
                      </span>
                    )}
                    <span className="px-2.5 py-1 text-[9px] font-black bg-fb-dark text-fb-yellow border border-fb-yellow/20 rounded uppercase tracking-wider">
                      Uyum: {currentReport.fitScore}/10
                    </span>
                  </div>

                  <div className="flex flex-col md:flex-row gap-6 items-center">
                    {/* Circle initials mockup */}
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-fb-navy to-fb-dark border-2 border-fb-yellow/30 flex items-center justify-center text-fb-yellow font-display italic font-black text-2xl shadow-lg shrink-0">
                      {currentReport.playerName.substring(0, 2).toUpperCase()}
                    </div>

                    <div className="space-y-2 text-center md:text-left">
                      <span className="text-[10px] font-black bg-white/5 border border-white/5 text-[#FFB020] px-2.5 py-1 rounded">
                        Mevki: {currentReport.position}
                      </span>
                      <h1 className="text-3xl md:text-4xl font-display font-black text-white italic uppercase tracking-tight pt-1">
                        {currentReport.playerName}
                      </h1>
                      
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-fb-muted font-bold justify-center md:justify-start">
                        <span>Yaş: <strong className="text-slate-200">{currentReport.age}</strong></span>
                        <span>•</span>
                        <span>Kulüp: <strong className="text-slate-200">{currentReport.currentClub}</strong></span>
                        <span>•</span>
                        <span>Uyruk: <strong className="text-slate-200">{currentReport.nationality}</strong></span>
                        <span>•</span>
                        <span>Değer: <strong className="text-emerald-400">{currentReport.estimatedCost}</strong></span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Grid details: strengths / concerns checklist blocks */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                  
                  {/* Strengths list */}
                  <div className="p-6 rounded-2xl bg-fb-card border border-white/[0.06] text-left space-y-4">
                    <h3 className="text-xs font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2 pb-2 border-b border-white/5">
                      <ShieldCheck size={16} /> Güçlü Yönler (Scout Raporu)
                    </h3>
                    <ul className="space-y-3">
                      {currentReport.strengths.map((st, i) => (
                        <li key={i} className="text-xs text-slate-200 flex items-start gap-2 font-semibold">
                          <CheckCircle size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                          <span>{st}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Concerns list */}
                  <div className="p-6 rounded-2xl bg-fb-card border border-white/[0.06] text-left space-y-4">
                    <h3 className="text-xs font-black text-[#FFB020] uppercase tracking-widest flex items-center gap-2 pb-2 border-b border-white/5">
                      <AlertTriangle size={16} className="text-[#FFB020]" /> Tehditler & Limitasyonlar
                    </h3>
                    <ul className="space-y-3">
                      {currentReport.concerns.map((con, i) => (
                        <li key={i} className="text-xs text-slate-200 flex items-start gap-2 font-semibold">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#FFB020] shrink-0 mt-2" />
                          <span>{con}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                </div>

                {/* Rapor Detay Body */}
                <div className="p-6 md:p-8 rounded-2xl bg-fb-card border border-white/[0.06] text-left space-y-6">
                  
                  {/* Summary Block */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-black text-fb-yellow uppercase tracking-widest font-display italic">Genel Oyuncu Profili</h3>
                    <p className="text-sm font-semibold text-slate-300 leading-relaxed">
                      {currentReport.summary}
                    </p>
                  </div>

                  {/* Dynamic full reports render depending on premium status */}
                  {currentReport.isPremium ? (
                    /* PREMIUM LOCKED BLUR COVER CALLOUT */
                    <div className="space-y-6 pt-4">
                      <div className="relative pt-16 pb-2">
                        <div className="absolute inset-0 bg-gradient-to-t from-fb-dark via-fb-dark/85 to-transparent z-10"></div>
                        <p className="text-slate-400/20 filter blur-[1px] select-none text-xs">
                          Moyes sistemlerindeki savunma gömülüş tecrübesi, geriye hızlı dikey koşuları engelleyebilmek adına taktiksel bir kalkan görevi üstleniyor. Isı haritasi verileri sol yarım dalga genişliğini %78 oranında örttüğünü ispatlar nitelikte. Ancak yüksek tempolu geçişlerde stoperlerin arkasında kalan 40 metrelik boşluğa hızlı reaksiyon verebilmesi için partner eşleşmesinde mutlaka daha süratli bir...
                        </p>
                      </div>

                      {/* LOCK INTERFACE BOX */}
                      <div className="p-8 rounded-3xl bg-gradient-to-b from-[#181F30] to-fb-dark border border-fb-yellow/30 text-center space-y-6 shadow-2xl max-w-xl mx-auto my-6 relative overflow-hidden">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-fb-yellow rounded-full"></div>
                        <div className="w-12 h-12 rounded-full bg-fb-yellow/10 border border-fb-yellow/20 flex items-center justify-center text-fb-yellow mx-auto">
                          <Lock size={20} className="animate-pulse" />
                        </div>
                        
                        <div className="space-y-1.5">
                          <h3 className="text-lg font-display font-black text-white italic uppercase tracking-tight">Bu transfer raporunun tamamı Premium üyelerimize özeldir</h3>
                          <p className="text-xs text-fb-muted max-w-sm mx-auto leading-relaxed">
                            Ayrıntılı gelişmiş filtreler, hücum/savunma kıyaslama şemaları, olası sözleşme taslağı ve alternatif ucuz adayların yer aldığı tam transfer analizine ancak Premium listemizde yetki verilir.
                          </p>
                        </div>

                        <div className="pt-2 max-w-sm mx-auto w-full">
                          <button 
                            onClick={() => onNavigate('premium')}
                            className="w-full py-4 bg-fb-yellow hover:bg-white text-fb-navy font-black text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-lg flex items-center justify-center gap-2"
                          >
                            Premium Listesine Katıl
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* PUBLICLY VISIBLE REPORTS PORTION */
                    <div className="space-y-6 pt-4 border-t border-white/[0.04]">
                      
                      {/* Tactical suitability box */}
                      {currentReport.tacticalFit && (
                        <div className="space-y-2">
                          <h4 className="text-xs font-black text-[#FFB020] uppercase tracking-widest flex items-center gap-1.5 font-display italic">
                            <TrendingUp size={14} /> Fenerbahçe Taktiksel Odak & Rol Uyumu
                          </h4>
                          <p className="text-xs text-slate-300 leading-relaxed font-semibold">
                            {currentReport.tacticalFit}
                          </p>
                        </div>
                      )}

                      {/* Risk factors mock descriptions if none existed */}
                      <div className="space-y-2 pt-2">
                        <h4 className="text-xs font-black text-fb-muted uppercase tracking-widest font-display italic">
                          Mali ve Sosyal Adaptasyon Öngörüsü
                        </h4>
                        <p className="text-xs text-fb-muted leading-relaxed">
                          Söz konusu oyuncunun Kadıköy'deki yoğun taraftar bası atmosferine karşı göstereceği mental reaksiyon son derece belirleyici olacaktır. Tahmini bonservis ve imza parası bütçesinin {currentReport.estimatedCost} bandında olması, rasyonel bir yönetim yaklaşımı ile risklerin önlenebileceğini gösteriyor. Kulüp içi hiyerarşi açısından yerli oyuncu asimetrisini korumak kaydıyla harika bir rotasyaon seçeneği.
                        </p>
                      </div>

                    </div>
                  )}

                  {/* Report Footing shared links */}
                  <div className="pt-6 border-t border-white/[0.04] flex items-center justify-between flex-wrap gap-4 text-xs font-bold text-fb-muted">
                    <span>Mazeret beyan etmeksizin hazırlanan bağımsız analiz belgesidir.</span>
                    <button 
                      onClick={() => {
                        const url = window.location.href;
                        navigator.clipboard.writeText(url);
                        showLocalToast('Scout rapor linki panoya kopyalandı!');
                      }}
                      className="text-fb-yellow hover:text-white uppercase tracking-widest flex items-center gap-1"
                    >
                      Paylaş <Share2 size={13} />
                    </button>
                  </div>

                </div>

              </div>
            ) : (
              <div className="text-center py-24 text-slate-400">Aranan transfer radar analizine ulaşılamadı.</div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
