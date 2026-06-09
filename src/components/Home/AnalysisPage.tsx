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
  BookOpen
} from 'lucide-react';
import { dbGetCollection, dbAddDocument } from '../../lib/dbService';
import { subscribeToNewsletter } from '../../lib/newsletterService';

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  coverImage?: string;
  author: string;
  status: 'published' | 'draft';
  isPremium: boolean;
  featured: boolean;
  readingTime: string;
  publishedAt: string;
  createdAt: string;
  seoTitle?: string;
  seoDescription?: string;
}

interface AnalysisPageProps {
  onNavigate: (view: string) => void;
}

export const AnalysisPage: React.FC<AnalysisPageProps> = ({ onNavigate }) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filtering & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tümü');
  
  // Detail View State
  const [selectedArticleSlug, setSelectedArticleSlug] = useState<string | null>(null);

  // Newsletter Subscription
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
  const [newsletterError, setNewsletterError] = useState('');
  const [submittingNewsletter, setSubmittingNewsletter] = useState(false);

  // Premium Sign up inside Article Detail
  const [premiumEmail, setPremiumEmail] = useState('');
  const [premiumSuccess, setPremiumSuccess] = useState(false);

  // Custom visual feedback toast
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showLocalToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMsg({ text, type });
    setTimeout(() => {
      setToastMsg(null);
    }, 4000);
  };

  // Hardcoded premium quality fallbacks if firebase/database is temporarily blank or unsynced
  const fallbackArticles: Article[] = [
    {
      id: "fb-art-1",
      title: "Fenerbahçe’nin oyun planında asıl problem ne?",
      slug: "fenerbahce-oyun-plani-problem",
      category: "Taktik",
      excerpt: "Topa sahip olmak her zaman oyunu kontrol etmek anlamına gelmez. Fenerbahçe’nin son maçlarda yaşadığı temel sorun, topun nerede ve hangi hızda dolaştığıyla ilgili.",
      content: "Fenerbahçe’nin son haftalardaki performans grafiği incelendiğinde, sahadaki taktik diziliş ile pratik yerleşim arasında ciddi bir kopukluk göze çarpıyor. Topun mülkiyetine sahip olma oranlarımız %60 seviyelerine ulaşmasına rağmen, üçüncü bölgedeki üretkenlik endekslerimiz lig ortalamasının gerisinde kalıyor.\n\nTemel problem, orta alan ile hücum hattı arasındaki geçiş hızının düşüklüğüdür. Top geriden çıkarken stoperlerin gereğinden fazla yatay pas yapması, rakip savunma bloklarının yerleşmesine ve kaymalarını kusursuz yapmasına olanak tanıyor. Fred'in üstlendiği kilit oyun kurucu ve dinamo rolünün alternatifinin bulunmayışı, takımın ritmini doğrudan etkiliyor. \n\nMourinho'nun dikey pas öncelikli felsefesini sahaya yansıtabilmek adına oyuncularımızın topsuz alan koşularını artırması gerekmektedir. Özellikle beklerin hücum çizgisine ulaştığı anlarda kanat forvetlerimizin iç koridorlara girmemesi ön tarafta sayısal çoğunluğu kaybetmemize yol açıyor. Gelecek haftalardaki derbilerde, geçiş savunmasındaki zafiyetlerin giderilmesi birinci öncelik olacaktır.",
      tags: ["Mourinho", "Taktik", "Gelişim", "Analiz"],
      coverImage: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1200&auto=format&fit=crop",
      author: "Bora Karaca",
      status: "published",
      isPremium: false,
      featured: true,
      readingTime: "6 dakika",
      publishedAt: "2026-05-28T12:00:00.000Z",
      createdAt: "2026-05-28T12:00:00.000Z"
    },
    {
      id: "fb-art-2",
      title: "Fenerbahçe neden bazı maçlarda tempoyu kaybediyor?",
      slug: "fenerbahce-neden-tempoyu-kaybediyor",
      category: "Taktik",
      excerpt: "İlk bölümde kurulan baskının sürdürülememesi, orta saha bağlantıları ve kenar oyuncularının pozisyon alışlarıyla doğrudan ilişkili.",
      content: "Fiziksel dayanıklılık seviyeleri ve oyuncu rotasyon sıklığı modern futbolda tempoyu korumanın iki temel taşıdır. Fenerbahçe'nin ilk 30 dakikada rakip kaleye uyguladığı bunaltıcı baskının, ikinci yarının ortalarına doğru düşmesinin rasyonel nedenlerini bu yazıda masaya yatırıyoruz.\n\nAnaliz ekibimizin topladığı koşu mesafeleri verilerine göre, ön alan presinde harcanan yüksek enerji bütçesi, 60. dakikadan sonra takımdaki pas isabet oranının %12 oranında gerilemesine neden oluyor. Bloklar arası mesafenin 40 metrenin üzerine çıkmasıyla rakiplerimiz merkezde geniş boşluklar bulabiliyor.",
      tags: ["Tempo", "Rotasyon", "Fiziksel", "Pres"],
      coverImage: "https://images.unsplash.com/photo-1544698310-74ea9d1c8258?w=800&auto=format&fit=crop",
      author: "Caner Yılmaz",
      status: "published",
      isPremium: false,
      featured: false,
      readingTime: "5 dakika",
      publishedAt: "2026-05-27T15:30:00.000Z",
      createdAt: "2026-05-27T15:30:00.000Z"
    },
    {
      id: "fb-art-3",
      title: "Maçın kırılma anı: ikinci yarıdaki baskı sekansı",
      slug: "macin-kirilma-ani-baski-sekansi",
      category: "Maç Sonu",
      excerpt: "Skoru değiştiren bölüm sadece gol pozisyonu değil, ondan önceki üç dakikalık baskı zinciriydi.",
      content: "Maçın taktiksel kronolojisine baktığımızda, tabelanın 1-1 gittiği ve oyunun kör düğüm olduğu 72. dakikada kulübenin yaptığı hamlelerin hemen sonrasında gelen fırtınayı analiz ediyoruz. Top kapma başarısı ve kanat bindirmelerinin birbirini tamamladığı 180 saniyelik sekans, galibiyetin anahtarıydı.",
      tags: ["Maç Raporu", "Analiz", "Kırılma Noktası"],
      coverImage: "https://images.unsplash.com/photo-1518063319789-7217e6706b04?w=800&auto=format&fit=crop",
      author: "Doğukan Özen",
      status: "published",
      isPremium: false,
      featured: false,
      readingTime: "4 dakika",
      publishedAt: "2026-05-26T22:15:00.000Z",
      createdAt: "2026-05-26T22:15:00.000Z"
    },
    {
      id: "fb-art-4",
      title: "Orta sahada doğru üçlü hangisi?",
      slug: "orta-sahada-dogru-uclu-kombinasyonu",
      category: "Oyuncu Analizi",
      excerpt: "Fenerbahçe’nin oyun ritmini belirleyen asıl konu, merkezde hangi oyuncuların birlikte oynadığı.",
      content: "Amrabat, İsmail Yüksek, Fred, Szymański ve Mert Hakan Yandaş... Fenerbahçe'nin zengin orta saha havuzunda, her rakibin taktiğine uygun olan en verimli üçlü eşleşmeleri formülize ettik. Defansif sertlik seviyesi ile kreatif dikey pas kalitesini maksimize eden ideal şablonları keşfedin.",
      tags: ["Orta Saha", "Fred", "Amrabat", "Szymanski"],
      coverImage: "https://images.unsplash.com/photo-1519766304817-4f37bda74a27?w=800&auto=format&fit=crop",
      author: "Onur Şahin",
      status: "published",
      isPremium: false,
      featured: false,
      readingTime: "5 dakika",
      publishedAt: "2026-05-25T09:00:00.000Z",
      createdAt: "2026-05-25T09:00:00.000Z"
    },
    {
      id: "fb-art-5",
      title: "Transfer profili: Fenerbahçe nasıl bir 6 numara aramalı?",
      slug: "transfer-profili-ideali-kriterler",
      category: "Transfer",
      excerpt: "Savunma önü oyuncusu sadece top kazanan değil, aynı zamanda ilk pas kalitesini yükselten bir profil olmalı.",
      content: "Camianın uzun yıllardır eksikliğini hissettiği ve modern futbolda oyunun merkezini yönetecek kusursuz 6 numara arayışı sürüyor. Scout ekibimiz, hem savunma geçişlerinde duvar olabilecek hem de geriden oyun kurarken pres altındayken bile top kaybetmeyecek 3 global adayı listeledi.",
      tags: ["Scouting", "Transfer", "6 Numara", "Opta"],
      coverImage: "https://images.unsplash.com/photo-1431324155629-1a6edd1d226a?w=800&auto=format&fit=crop",
      author: "Serhat Akıncı",
      status: "published",
      isPremium: false,
      featured: false,
      readingTime: "7 dakika",
      publishedAt: "2026-05-23T14:40:00.000Z",
      createdAt: "2026-05-23T14:40:00.000Z"
    },
    {
      id: "fb-art-6",
      title: "Kanat rotasyonu hücum aklını nasıl etkiliyor?",
      slug: "kanat-rotasyonu-hucum-akli",
      category: "Taktik",
      excerpt: "Çizgiye basan kanatlarla iç koridora giren kanatlar arasındaki fark, Fenerbahçe’nin hücum çeşitliliğini doğrudan değiştiriyor.",
      content: "Tadić'in solda başlattığı yaratıcı iç koridor oyunları ile sağ tarafta İrfan Can veya Cengiz'in içe kat ederek açtığı şut koridorlarının taktik varyasyon farklarını inceliyoruz. Hangi formül ceza sahasında daha çok topla buluşma sağlıyor?",
      tags: ["Kanat", "Tadic", "Irfan Can", "Taktik"],
      coverImage: "https://images.unsplash.com/photo-1524015368236-bbf6f72545b6?w=800&auto=format&fit=crop",
      author: "Bora Karaca",
      status: "published",
      isPremium: false,
      featured: false,
      readingTime: "5 dakika",
      publishedAt: "2026-05-22T10:15:00.000Z",
      createdAt: "2026-05-22T10:15:00.000Z"
    },
    {
      id: "fb-art-7",
      title: "Fenerbahçe’de liderlik problemi var mı?",
      slug: "fenerbahcede-liderlik-ve-mental-kontrol",
      category: "Köşe Yazısı",
      excerpt: "Bazı maçlarda mesele taktikten çok oyunun duygusal kontrolüyle ilgili hale geliyor.",
      content: "Kadıköy'ün benzersiz baskı ikliminde oyunun psikolojik ve duygusal boyutu çoğu zaman taktiğin önüne geçiyor. Kriz anlarında sorumluluk alan saha içi liderlerin eksikliği, kritik şampiyonluk virajlarında alınan beklenmedik sonuçların asıl sebebi mi?",
      tags: ["Köşe Yazısı", "Mental", "Liderlik", "Kriz Yönetimi"],
      coverImage: "https://images.unsplash.com/photo-1540747737956-378724044602?w=800&auto=format&fit=crop",
      author: "Murat Özkan",
      status: "published",
      isPremium: false,
      featured: false,
      readingTime: "4 dakika",
      publishedAt: "2026-05-20T17:00:00.000Z",
      createdAt: "2026-05-20T17:00:00.000Z"
    },
    {
      id: "fb-art-8",
      title: "Premium: Detaylı Beşiktaş Derbisi taktik raporu ve oyuncu puanları",
      slug: "premium-detayli-besiktas-derbisi-raporu",
      category: "Premium",
      excerpt: "Maçın tüm taktik kırılmaları, rakip zayıf yön analizleri, kilit kilit oyuncu eşleşmeleri ve bir sonraki maç için kritik galibiyet anahtarı.",
      content: "Derbinin anahtarı orta sahadaki pres yoğunluğunda gizli. Beşiktaş'ın kilit oyun kurucusu Rafa Silva'yı durdurmak için İsmail Yüksek'in yapacağı gölge markaj, savunma hattımızın derinliğini doğrudan koruyacaktır. Bu yazıda her iki takımın son 5 maçlık Opta verileri ve geçiş haritaları karşılaştırılmaktadır.\n\nYanal hücum organizasyonlarında Beşiktaş'ın bek arkasında bıraktığı koridorlar, Tadić'in milimetrik pasları ve Ferdi'nin bindirmeleri için muazzam fırsatlar barındırıyor. Ancak orta saha merkez bloklarında yaşanacak basit top kayıpları hızlı kontra ataklara kapı aralayabilir. Şampiyonluk yolunda kritik 3 puanı getirecek tüm mikro taktikler ve oyuncu rollerine ait özel ısı tabloları bu raporun ekinde yer almaktadır.",
      tags: ["Derbi", "Beşiktaş", "Isı Haritası", "Opta Rapor"],
      coverImage: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop",
      author: "Taktik Kurulu",
      status: "published",
      isPremium: true,
      featured: false,
      readingTime: "10 dakika",
      publishedAt: "2026-05-18T19:30:00.000Z",
      createdAt: "2026-05-18T19:30:00.000Z"
    }
  ];

  // Load Articles on mount
  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      try {
        const fetched = await dbGetCollection('articles');
        // Only show published articles on public page
        const publishedOnly = fetched.filter(art => art.status === 'published');
        
        if (publishedOnly && publishedOnly.length > 0) {
          setArticles(publishedOnly);
        } else {
          // If Firestore is empty, use elegant fallback mock data
          setArticles(fallbackArticles);
        }
      } catch (e) {
        console.error("Firestore articles retrieval error, fallbacks loaded:", e);
        setArticles(fallbackArticles);
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, []);

  // Listen for hash route or direct address manipulation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#/analizler/')) {
        const slug = hash.replace('#/analizler/', '');
        if (slug) {
          setSelectedArticleSlug(slug);
        } else {
          setSelectedArticleSlug(null);
        }
      } else {
        setSelectedArticleSlug(null);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    // Initial check
    handleHashChange();

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Set Slug state and update Hash gracefully
  const handleSelectArticle = (slug: string) => {
    window.location.hash = `#/analizler/${slug}`;
    setSelectedArticleSlug(slug);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToList = () => {
    window.location.hash = '#/analizler';
    setSelectedArticleSlug(null);
  };

  // Filter and search logic
  const filteredArticles = useMemo(() => {
    return articles.filter(art => {
      const matchesSearch = 
        art.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        art.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        art.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        art.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      let matchesCategory = false;
      if (selectedCategory === 'Tümü') {
        matchesCategory = true;
      } else if (selectedCategory === 'Premium') {
        matchesCategory = art.isPremium === true;
      } else {
        // Handle variations (e.g. "Taktik" matches "Taktik Analiz" and "Taktik")
        matchesCategory = 
          art.category.toLowerCase().includes(selectedCategory.toLowerCase()) || 
          selectedCategory.toLowerCase().includes(art.category.toLowerCase());
      }

      return matchesSearch && matchesCategory;
    });
  }, [articles, searchQuery, selectedCategory]);

  // Featured Article Selection
  const featuredArticle = useMemo(() => {
    const found = articles.find(art => art.featured === true);
    if (found) return found;
    // If no featured flag, return the first non-premium article or any article
    return articles.find(art => !art.isPremium) || articles[0];
  }, [articles]);

  // Selected Article Object
  const currentArticle = useMemo(() => {
    if (!selectedArticleSlug) return null;
    return articles.find(art => art.slug === selectedArticleSlug);
  }, [articles, selectedArticleSlug]);

  // Newsletter Submit
  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) {
      setNewsletterError('Lütfen geçerli bir e-posta adresi yazın.');
      return;
    }
    setSubmittingNewsletter(true);
    setNewsletterError('');
    try {
      const res = await subscribeToNewsletter(newsletterEmail, '', 'newsletter_ctr_analysis_page');
      if (res.success) {
        setNewsletterSubscribed(true);
        setNewsletterEmail('');
        showLocalToast('Haftalık analiz bültenine üyeliğiniz başarıyla tamamlandı!');
      } else {
        setNewsletterError(res.message);
      }
    } catch (err) {
      console.error(err);
      setNewsletterError('Hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setSubmittingNewsletter(false);
    }
  };

  // Premium Waitlist Submit in Teaser
  const handlePremiumSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!premiumEmail || !premiumEmail.includes('@')) {
      return;
    }
    try {
      const res = await subscribeToNewsletter(premiumEmail, '', 'premium_waitlist_analysis_details');
      if (res.success) {
        setPremiumSuccess(true);
        setPremiumEmail('');
        showLocalToast('Premium ve bülten bekleme listesine katılımınız alındı! 🎉');
      } else {
        showLocalToast(res.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-fb-dark">
        <div className="space-y-4 text-center">
          <div className="w-12 h-12 border-4 border-fb-yellow border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-black uppercase text-fb-yellow tracking-[0.2em] animate-pulse">TAKTİK VERİLERİ GÜNCELLENİYOR...</p>
        </div>
      </div>
    );
  }

  // Categories list matching standard pills
  const categories = ['Tümü', 'Taktik', 'Maç Sonu', 'Oyuncu Analizi', 'Transfer', 'Köşe Yazısı', 'Premium'];

  return (
    <div className="bg-fb-dark min-h-screen text-slate-100 relative overflow-hidden">
      {currentArticle ? (
        <SEO 
          title={`${currentArticle.seoTitle || currentArticle.title} | Fenerbahçe Evreni`}
          description={currentArticle.seoDescription || currentArticle.excerpt}
          canonical={`https://fenerbahceevreni.com/analizler/${currentArticle.slug}`}
          ogType="article"
          ogImage={currentArticle.coverImage}
          schema={{
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": currentArticle.title,
            "description": currentArticle.excerpt,
            "datePublished": currentArticle.publishedAt || currentArticle.createdAt,
            "author": {
              "@type": "Person",
              "name": currentArticle.author
            },
            "publisher": {
              "@type": "Organization",
              "name": "Fenerbahçe Evreni"
            },
            "image": currentArticle.coverImage || "https://i.hizliresim.com/cjtn8ay.png"
          }}
        />
      ) : (
        <SEO 
          title="Analizler | Fenerbahçe Evreni"
          description="Fenerbahçe maç sonu okumaları, taktik çözümlemeler, oyuncu değerlendirmeleri ve transfer yorumları. Kadıköy havası, modern futbol teorisi ile harmanlanıyor."
          canonical="https://fenerbahceevreni.com/analizler"
        />
      )}
      
      {/* Toast Notification Container */}
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
            <CheckCircle size={16} className="shrink-0" />
            <span>{toastMsg.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {!currentArticle ? (
          /* ========================================================================= */
          /* 1. LIST VIEW: ARCHIVE PORTAL                                              */
          /* ========================================================================= */
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="pb-24"
          >
            {/* HERO SECTION */}
            <header className="relative pt-28 pb-16 bg-gradient-to-b from-fb-navy/30 to-transparent border-b border-white/[0.04]">
              <div className="container mx-auto px-6 max-w-6xl text-left relative z-10 space-y-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-fb-yellow/10 border border-fb-yellow/20 text-fb-yellow [font-size:10px] uppercase font-black tracking-widest">
                  <Sparkles size={11} /> Taktik Akıl & Veri Analizi
                </div>
                <h1 className="text-4xl md:text-5xl font-display font-black text-white italic uppercase tracking-tight leading-none">
                  Analizler
                </h1>
                <p className="text-sm text-fb-muted max-w-2xl font-medium leading-relaxed">
                  Fenerbahçe’ye dair maç sonu okumaları, taktik çözümlemeler, oyuncu değerlendirmeleri ve transfer yorumları. Kadıköy havası, modern futbol teorisi ile harmanlanıyor.
                </p>

                {/* Animated category chips directly under hero */}
                <div className="flex flex-wrap gap-2 pt-4">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        setSelectedCategory(cat);
                        // Fast scroll to filtering section
                        const el = document.getElementById('archive-filters');
                        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }}
                      className={`text-[10px] font-black px-3.5 py-2 rounded-lg border uppercase tracking-widest transition-all cursor-pointer ${
                        selectedCategory === cat 
                          ? 'bg-fb-yellow border-fb-yellow text-fb-navy' 
                          : 'bg-white/5 border-white/5 text-slate-300 hover:border-fb-yellow/30 hover:bg-white/[0.08]'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </header>

            {/* FEATURED ANALYSIS SECTION */}
            {featuredArticle && selectedCategory === 'Tümü' && !searchQuery && (
              <section className="container mx-auto px-6 max-w-6xl py-12">
                <div className="mb-6">
                  <span className="text-[10px] font-black uppercase tracking-[0.25em] text-fb-yellow block">Editörün Manşeti</span>
                  <h2 className="text-xl font-display font-black text-white uppercase italic">Öne Çıkarılan Analiz</h2>
                </div>

                <div 
                  onClick={() => handleSelectArticle(featuredArticle.slug)}
                  className="group relative rounded-3xl bg-fb-card border border-white/[0.08] hover:border-fb-yellow/30 transition-all cursor-pointer overflow-hidden grid grid-cols-1 lg:grid-cols-12 shadow-2xl"
                >
                  {/* cover image */}
                  <div className="lg:col-span-7 relative h-64 lg:h-full min-h-[300px] overflow-hidden bg-fb-dark">
                    <img 
                      src={featuredArticle.coverImage || "https://images.unsplash.com/photo-1544698310-74ea9d1c8258?w=1200&auto=format&fit=crop"} 
                      alt={featuredArticle.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-fb-dark via-fb-dark/40 to-transparent"></div>
                    
                    {/* Badge */}
                    <div className="absolute top-5 left-5 flex gap-2">
                      <span className="px-3 py-1 rounded bg-fb-yellow text-fb-navy text-[10px] font-black uppercase tracking-wider">
                        {featuredArticle.category}
                      </span>
                      {featuredArticle.isPremium && (
                        <span className="px-3 py-1 rounded bg-fb-navy border border-fb-yellow/30 text-fb-yellow text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                          <Lock size={10} /> Premium
                        </span>
                      )}
                    </div>
                  </div>

                  {/* meta details */}
                  <div className="lg:col-span-5 p-8 lg:p-10 flex flex-col justify-between text-left space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-xs text-fb-muted font-semibold">
                        <span className="flex items-center gap-1"><User size={13} className="text-fb-yellow" /> {featuredArticle.author}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1"><Clock size={13} /> {featuredArticle.readingTime}</span>
                      </div>
                      
                      <h3 className="text-2xl md:text-3xl font-display font-black text-white italic uppercase tracking-tight group-hover:text-fb-yellow transition-colors leading-tight">
                        {featuredArticle.title}
                      </h3>
                      
                      <p className="text-sm text-fb-muted font-medium leading-relaxed">
                        {featuredArticle.excerpt}
                      </p>
                    </div>

                    <div className="pt-6 border-t border-white/[0.06] flex items-center justify-between">
                      <span className="text-xs text-fb-muted font-bold">
                        {new Date(featuredArticle.publishedAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                      <span className="px-5 py-2.5 bg-fb-yellow hover:bg-white text-fb-navy text-[11px] font-black uppercase rounded-xl tracking-wider transition-all flex items-center gap-1.5 shadow-lg shadow-fb-yellow/10">
                        Analizi Oku <ArrowRight size={13} />
                      </span>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* SEARCH AND FILTER BAR AREA */}
            <section id="archive-filters" className="container mx-auto px-6 max-w-6xl py-4">
              <div className="p-6 rounded-2xl bg-fb-card border border-white/[0.06] flex flex-col md:flex-row gap-4 items-center justify-between">
                
                {/* Search Input widget */}
                <div className="relative w-full md:w-96">
                  <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-fb-muted" />
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Analizlerde ara (yazar, başlık, taktik...)"
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-fb-dark border border-white/10 text-xs text-white focus:outline-none focus:border-fb-yellow placeholder-fb-muted transition-all font-semibold"
                  />
                </div>

                {/* Grid vs Category helper summary */}
                <div className="text-[10px] font-bold text-fb-muted uppercase tracking-wider text-right w-full md:w-auto">
                  {filteredArticles.length} içerik listeleniyor {selectedCategory !== 'Tümü' && <span>• Kategori: <strong className="text-fb-yellow">{selectedCategory}</strong></span>}
                </div>
              </div>
            </section>

            {/* ARTICLES GRID */}
            <section className="container mx-auto px-6 max-w-6xl py-8">
              {filteredArticles.length === 0 ? (
                /* EMPTY STATE */
                <div className="py-20 text-center space-y-6 max-w-md mx-auto">
                  <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-fb-muted mx-auto">
                    <FileText size={24} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-black text-white italic uppercase">Henüz yayınlanmış analiz yok</h3>
                    <p className="text-xs text-fb-muted leading-relaxed">
                      Seçilen kategori veya arama filtresine uygun herhangi bir analiz bulunamadı. Lütfen filtrelerinizi sıfırlayın.
                    </p>
                  </div>
                  <button 
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('Tümü');
                    }}
                    className="px-4 py-2 bg-fb-yellow hover:bg-white text-fb-navy text-[10px] font-black uppercase rounded-lg tracking-wider transition-all"
                  >
                    Filtreleri Sıfırla
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredArticles.map((art, index) => {
                    const isPremiumArticle = art.isPremium;
                    return (
                      <motion.article
                        key={art.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.4) }}
                        onClick={() => handleSelectArticle(art.slug)}
                        className={`group rounded-2xl bg-fb-card border border-white/[0.06] hover:border-fb-yellow/20 flex flex-col justify-between transition-all cursor-pointer overflow-hidden ${
                          isPremiumArticle ? 'shadow-[0_8px_30px_rgb(255,210,31,0.03)]' : ''
                        }`}
                      >
                        <div className="text-left">
                          {/* Card image container */}
                          <div className="relative h-44 overflow-hidden bg-fb-dark">
                            <img 
                              src={art.coverImage || "https://images.unsplash.com/photo-1544698310-74ea9d1c8258?w=800&auto=format&fit=crop"} 
                              alt={art.title} 
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103"
                              referrerPolicy="no-referrer"
                            />
                            
                            {/* Categories Badges */}
                            <div className="absolute top-3 left-3 flex gap-1.5 z-10">
                              <span className="px-2.5 py-1 text-[9px] font-black bg-fb-dark/90 text-fb-yellow border border-fb-yellow/20 rounded uppercase tracking-wider">
                                {art.category}
                              </span>
                              {isPremiumArticle && (
                                <span className="px-2.5 py-1 text-[9px] font-black bg-fb-yellow text-fb-navy rounded flex items-center gap-1 uppercase tracking-wider">
                                  <Lock size={9} /> Premium
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="p-5 space-y-3">
                            <div className="flex justify-between items-center text-[10px] text-fb-muted font-semibold">
                              <span className="flex items-center gap-1.5"><User size={11} className="text-fb-yellow" /> {art.author}</span>
                              <span className="flex items-center gap-1"><Clock size={11} /> {art.readingTime}</span>
                            </div>

                            <h3 className="text-lg font-black text-white group-hover:text-fb-yellow leading-snug transition-colors italic uppercase line-clamp-2">
                              {art.title}
                            </h3>

                            <p className="text-fb-muted text-xs leading-relaxed line-clamp-3">
                              {art.excerpt}
                            </p>

                            {/* Tags list */}
                            {art.tags && art.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 pt-2">
                                {art.tags.slice(0, 3).map((tag, i) => (
                                  <span key={i} className="text-[9px] font-bold px-1.5 py-0.5 bg-white/5 border border-white/5 text-slate-400 rounded">
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="p-5 pt-0">
                          <div className="pt-3 border-t border-white/[0.04] flex items-center justify-between">
                            <span className="text-[10px] text-fb-muted font-bold">
                              {new Date(art.publishedAt || art.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                            <span className="text-[10px] font-black uppercase tracking-wider text-fb-yellow flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                              Oku <ChevronRight size={13} />
                            </span>
                          </div>
                        </div>
                      </motion.article>
                    );
                  })}
                </div>
              )}
            </section>

            {/* LATEST MATCH ANALYSIS STRIP (HORIZONTAL SECTION) */}
            <section className="container mx-auto px-6 max-w-6xl py-12 border-t border-white/[0.03]">
              <div className="mb-8 text-left">
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-fb-yellow block mb-2">Taktik Kurul Odasından</span>
                <h2 className="text-2xl md:text-3xl font-display font-black text-white uppercase italic tracking-tight">Son Maç Analizleri</h2>
                <p className="text-xs text-fb-muted mt-1">En son oynanan müsabakanın veriler, bireysel karneler ve artılar/eksiler ile derinlemesine incelemesi.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* STRIP CARD 1: STORY */}
                <div className="p-6 rounded-2xl bg-fb-card border border-white/[0.06] text-left space-y-4 relative overflow-hidden group hover:border-[#FFB020]/20 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
                    <BookOpen size={18} />
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-[9px] font-black uppercase tracking-widest text-orange-400">Tactical Chronology</span>
                    <h3 className="text-base font-black text-white italic uppercase">Maçın Hikayesi & Oyun Seti</h3>
                    <p className="text-xs text-fb-muted leading-relaxed">
                      Geriden üçlü oyun kurma denemeleri ve beklendiği gibi topsuz dar alan presiyle orta sahayı sıkıştıran Mourinho organizasyon şablonunun detayları.
                    </p>
                  </div>
                </div>

                {/* STRIP CARD 2: RATINGS */}
                <div className="p-6 rounded-2xl bg-fb-card border border-white/[0.06] text-left space-y-4 relative overflow-hidden group hover:border-fb-yellow/20 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-fb-yellow/10 border border-fb-yellow/20 flex items-center justify-center text-fb-yellow">
                    <Award size={18} />
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-[9px] font-black uppercase tracking-widest text-fb-yellow">Performance Index</span>
                    <h3 className="text-base font-black text-white italic uppercase">Oyuncu Performans Puanları</h3>
                    <p className="text-xs text-fb-muted leading-relaxed">
                      Sağ kanat rotasyonlarında İrfan Can'ın topsuz koşuları ve Fred'in sahadaki bağlantı başarı oranının Opta destekli karnesi. Szymański preste yine devleşti.
                    </p>
                  </div>
                </div>

                {/* STRIP CARD 3: PROS & CONS */}
                <div className="p-6 rounded-2xl bg-fb-card border border-white/[0.06] text-left space-y-4 relative overflow-hidden group hover:border-emerald-500/20 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <TrendingUp size={18} />
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400">Tactic Pros & Cons</span>
                    <h3 className="text-base font-black text-white italic uppercase">Taktik Artılar & Eksiler</h3>
                    <p className="text-xs text-fb-muted leading-relaxed">
                      <strong>Artı:</strong> Hızlı dikey paslarda %84 isabet başarısı. <br />
                      <strong>Eksi:</strong> Bek bindirmelerinde stoper kademelerinin arkada bıraktığı geniş alan zafiyeti.
                    </p>
                  </div>
                </div>

              </div>
            </section>

            {/* NEWSLETTER CTA */}
            <section className="container mx-auto px-6 max-w-6xl py-4">
              <div className="p-8 md:p-12 rounded-3xl bg-fb-card border border-white/[0.06] relative overflow-hidden flex flex-col md:flex-row gap-8 items-center justify-between text-left shadow-2xl bg-gradient-to-br from-fb-card to-[#121826]">
                <div className="absolute top-0 right-0 w-80 h-80 bg-fb-yellow/[0.015] rounded-full blur-[100px] pointer-events-none"></div>
                
                <div className="space-y-3 max-w-xl">
                  <div className="flex items-center gap-1.5 text-fb-yellow font-black text-[10px] tracking-widest uppercase">
                    <Mail size={12} /> Haftalık Taktik Bülteni
                  </div>
                  <h3 className="text-2xl md:text-3xl font-display font-black text-white italic uppercase tracking-tight">
                    Haftalık analiz bültenine katıl
                  </h3>
                  <p className="text-xs text-fb-muted leading-relaxed font-semibold">
                    Her hafta öne çıkan maç notları, derinlemesine transfer değerlendirmeleri, oyuncu karneleri ve başka yerde bulamayacağınız özel analizleri e-postana gönderelim. Camianın aklını kaçırma!
                  </p>
                </div>

                <div className="w-full md:w-auto shrink-0 min-w-[300px]">
                  {newsletterSubscribed ? (
                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold text-center flex items-center justify-center gap-2">
                      <CheckCircle size={16} />
                      Bültene başarıyla katıldın! Teşekkürler.
                    </div>
                  ) : (
                    <form onSubmit={handleNewsletterSubmit} className="space-y-2">
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input 
                          type="email" 
                          required
                          value={newsletterEmail}
                          onChange={(e) => setNewsletterEmail(e.target.value)}
                          placeholder="E-posta adresin"
                          className="px-4 py-3 bg-fb-dark border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-fb-yellow placeholder-fb-muted w-full sm:w-64 font-semibold"
                        />
                        <button 
                          type="submit"
                          disabled={submittingNewsletter}
                          className="px-6 py-3 bg-fb-yellow hover:bg-white text-fb-navy text-[11px] font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-lg shrink-0 disabled:opacity-50"
                        >
                          {submittingNewsletter ? '...' : 'BÜLTENE KATIL'}
                        </button>
                      </div>
                      {newsletterError && (
                        <p className="text-[10px] font-bold text-rose-400 text-left pl-1">{newsletterError}</p>
                      )}
                    </form>
                  )}
                </div>
              </div>
            </section>

          </motion.div>
        ) : (
          /* ========================================================================= */
          /* 2. DYNAMIC ARTICLE DETAIL VIEW: PREMIUM-READY LAYOUT                      */
          /* ========================================================================= */
          <motion.div
            key="detail"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="pb-24 pt-28 text-left"
          >
            {currentArticle ? (
              <div className="container mx-auto px-6 max-w-4xl space-y-8">
                
                {/* Back to Archive button */}
                <button 
                  onClick={handleBackToList}
                  className="inline-flex items-center gap-1.5 text-xs font-black text-fb-yellow hover:text-white uppercase tracking-wider transition-all cursor-pointer"
                >
                  <ChevronLeft size={16} /> Analiz Arşivine Geri Dön
                </button>

                {/* Meta details & headers */}
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className="px-3 py-1 rounded bg-fb-yellow text-fb-navy text-[10px] font-black uppercase tracking-wider">
                      {currentArticle.category}
                    </span>
                    {currentArticle.isPremium && (
                      <span className="px-3 py-1 rounded bg-fb-navy border border-fb-yellow/30 text-fb-yellow text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                        <Lock size={10} /> Premium Rapor
                      </span>
                    )}
                    <span className="text-xs text-fb-muted font-bold pl-2 flex items-center gap-1">
                      <Clock size={13} /> {currentArticle.readingTime}
                    </span>
                  </div>

                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-black text-white italic uppercase tracking-tight leading-tight">
                    {currentArticle.title}
                  </h1>

                  <p className="text-base text-fb-muted font-medium leading-relaxed border-l-2 border-fb-yellow/30 pl-4 py-1">
                    {currentArticle.excerpt}
                  </p>

                  <div className="flex items-center justify-between py-4 border-t border-b border-white/[0.06] mt-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-fb-yellow font-black font-display italic text-sm">
                        {currentArticle.author.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <span className="text-xs font-black text-white block">{currentArticle.author}</span>
                        <span className="text-[10px] text-fb-muted font-bold block">
                          Yayınlanma: {new Date(currentArticle.publishedAt || currentArticle.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
                      </div>
                    </div>

                    {/* Shared CTA widgets */}
                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          const url = window.location.href;
                          navigator.clipboard.writeText(url);
                          showLocalToast('Yazı linki panoya kopyalandı!');
                        }}
                        className="p-2 border border-white/10 rounded-lg text-slate-300 hover:text-fb-yellow hover:border-fb-yellow/30 transition-all cursor-pointer"
                        title="Metni kopyala"
                      >
                        <Share2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Big cover Image */}
                <div className="h-64 md:h-96 rounded-2xl overflow-hidden bg-fb-dark border border-white/10 relative shadow-2xl">
                  <img 
                    src={currentArticle.coverImage || "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1200&auto=format&fit=crop"} 
                    alt={currentArticle.title} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>

                {/* CONTENT BODY */}
                <div className="prose prose-invert max-w-none space-y-6 text-sm text-slate-300 font-semibold leading-relaxed">
                  {currentArticle.isPremium ? (
                    /* PREMIUM LOCK CONTENT PREVIEW */
                    <div className="space-y-6">
                      {/* First couple of paragraphs rendered */}
                      <p>
                        {currentArticle.content.split('\n\n')[0] || "Beşiktaş derbisine giden şampiyonluk yolunda kritik teknik hazırlıklar bitti. Mourinho'nun sahada uygulayacağı özel setler, ısı tablosunda belirgin bir baskı vadediyor..."}
                      </p>
                      
                      {/* Gradient Teaser overlay block */}
                      <div className="relative pt-24 pb-4">
                        <div className="absolute inset-0 bg-gradient-to-t from-fb-dark via-fb-dark/80 to-transparent z-10"></div>
                        <p className="text-slate-400/30 filter blur-[1px] select-none">
                          Orta alan pres hatlarında Beşiktaş’ın derin stoper kaymalarını bozmak adına Fred’in sürpriz ceza sahası koşuları kritik önem taşıyor. Eğer topsuz preste rakibi gafil avlayabilirsek ilk 20 dakikada tabelayı bulmamız işten bile değil. Opta ısı matrisi verilerine göre rakibimizin en çok zaaf verdiği bölge sol yarım iç koridor...
                        </p>
                      </div>

                      {/* PREMIUM CALLOUT UI */}
                      <div className="p-8 rounded-3xl bg-gradient-to-b from-[#181F30] to-fb-dark border border-fb-yellow/30 text-center space-y-6 shadow-2xl max-w-xl mx-auto my-12 relative overflow-hidden">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-fb-yellow rounded-full"></div>
                        <div className="w-12 h-12 rounded-full bg-fb-yellow/10 border border-fb-yellow/20 flex items-center justify-center text-fb-yellow mx-auto">
                          <Lock size={20} className="animate-pulse" />
                        </div>
                        
                        <div className="space-y-2">
                          <h3 className="text-xl font-display font-black text-white italic uppercase tracking-tight">Bu içerik Fenerbahçe Evreni Premium üyeleri için hazırlanmıştır</h3>
                          <p className="text-xs text-fb-muted max-w-sm mx-auto leading-relaxed">
                            Bu analiz ve verinin devamı, kapsamlı taktik dosyaları, Opta ısı haritaları ve scouting metrik bültenimize üye olan taraftarlarımıza özeldir.
                          </p>
                        </div>

                        <div className="pt-2 max-w-sm mx-auto">
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
                    /* REGULAR NON-PREMIUM FULL TEXT BODY */
                    <div className="space-y-6">
                      {currentArticle.content.split('\n\n').map((paragraph, index) => (
                        <p key={index} className="text-slate-300 font-medium text-justify">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  )}
                </div>

                {/* Related Articles Section */}
                <div className="pt-12 border-t border-white/[0.06] text-left space-y-6">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.25em] text-fb-yellow block">İlginizi Çekebilir</span>
                    <h2 className="text-xl md:text-2xl font-display font-black text-white uppercase italic">Benzer Analizler</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {articles
                      .filter(art => art.id !== currentArticle.id)
                      .slice(0, 2)
                      .map(art => (
                        <div 
                          key={art.id}
                          onClick={() => handleSelectArticle(art.slug)}
                          className="p-5 rounded-2xl bg-fb-card border border-white/[0.06] hover:border-fb-yellow/20 transition-all cursor-pointer text-left space-y-3 flex flex-col justify-between"
                        >
                          <div className="space-y-2">
                            <span className="text-[9px] font-black uppercase tracking-widest text-fb-yellow block">
                              {art.category}
                            </span>
                            <h3 className="text-base font-black text-white italic uppercase line-clamp-2">
                              {art.title}
                            </h3>
                            <p className="text-xs text-fb-muted leading-relaxed line-clamp-2">
                              {art.excerpt}
                            </p>
                          </div>
                          
                          <div className="flex justify-between items-center pt-4 border-t border-white/[0.04]">
                            <span className="text-[10px] text-fb-muted font-bold">{art.author}</span>
                            <span className="text-[10px] font-black uppercase text-fb-yellow flex items-center gap-1">
                              Oku <ChevronRight size={12} />
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Secondary details back to list trigger */}
                <div className="pt-8 text-center">
                  <button 
                    onClick={handleBackToList}
                    className="px-6 py-3 border border-white/10 hover:border-fb-yellow hover:text-fb-yellow rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer inline-flex items-center gap-2"
                  >
                    <ChevronLeft size={15} /> TÜM ANALİZ ARŞİVİNE GERİ DÖN
                  </button>
                </div>

              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-fb-warning text-xs font-black uppercase tracking-widest">Makale bulunamadı.</p>
                <button onClick={handleBackToList} className="mt-4 text-xs font-black text-fb-yellow uppercase underline">Arşive geri dön</button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
