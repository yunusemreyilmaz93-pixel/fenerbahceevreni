import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import SEO from './SEO';
import { 
  Search, 
  Lock, 
  Clock, 
  ArrowRight, 
  ChevronLeft, 
 
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
import { DataBadge } from '../ui';
import {
  ArchiveEmpty,
  ArticleTitle,
  LoadingScreen,
  PageKicker,
  PageLead,
  PageTitle,
  ReadingProgress,
} from './reading/ReadingChrome';

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

  // Elite interactive features
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeScenario, setActiveScenario] = useState<'press' | 'transition' | 'lowBlock'>('press');
  const [userVote, setUserVote] = useState<string | null>(null);
  const [votes, setVotes] = useState({ agree: 0, disagree: 0, neutral: 0 });

  // Scroll reader tracking
  useEffect(() => {
    if (!selectedArticleSlug) {
      setScrollProgress(0);
      return;
    }
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight > 0) {
        const progress = (window.scrollY / scrollHeight) * 100;
        setScrollProgress(progress);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [selectedArticleSlug]);

  const handleVote = (type: 'agree' | 'disagree' | 'neutral') => {
    if (userVote) {
      showLocalToast('Bu taktik analiz için zaten oy kullandınız!', 'error');
      return;
    }
    setUserVote(type);
    setVotes(prev => ({
      ...prev,
      [type]: prev[type] + 1
    }));
    showLocalToast('Geri bildiriminiz kaydedildi, teşekkürler!');
  };

  const showLocalToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMsg({ text, type });
    setTimeout(() => {
      setToastMsg(null);
    }, 4000);
  };

  // Product rule: no fabricated articles. Empty DB -> premium empty state in UI.
  const fallbackArticles: Article[] = [];

  // Load Articles on mount
  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      try {
        const fetched = await dbGetCollection('articles');
        // Only show published articles on public page (A5: no localStorage seed heuristic)
        const publishedOnly = fetched.filter(art => art.status === 'published');
        setArticles(publishedOnly.length > 0 ? publishedOnly : fallbackArticles);
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
    return <LoadingScreen label="Analiz arşivi yükleniyor…" />;
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
            <header className="relative pt-28 pb-12 bg-gradient-to-b from-fb-navy/30 to-transparent border-b border-white/[0.04]">
              <div className="container mx-auto px-6 max-w-6xl text-left relative z-10 space-y-4">
                <PageKicker>Taktik akıl & veri</PageKicker>
                <PageTitle>Analizler</PageTitle>
                <PageLead>
                  Fenerbahçe’ye dair maç sonu okumaları, taktik çözümlemeler, oyuncu değerlendirmeleri ve transfer yorumları. Kadıköy havası, modern futbol teorisi ile harmanlanıyor.
                </PageLead>

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
                    {featuredArticle.coverImage ? (
                      <img loading="lazy"
                        src={featuredArticle.coverImage} 
                        alt={featuredArticle.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#0E1A36] via-[#0B0F19] to-[#132347] flex items-center justify-center">
                        <img loading="lazy"src="/logos/fenerbahce.png" alt="" className="w-24 h-24 object-contain opacity-20" />
                      </div>
                    )}
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
                <ArchiveEmpty
                  icon={FileText}
                  title="Uygun analiz bulunamadı"
                  description="Seçilen kategori veya arama için yayınlanmış içerik yok. Filtreleri sıfırlayın veya arşivi yeniden tarayın — uydurma yazı basılmaz."
                  onReset={() => {
                    setSearchQuery('');
                    setSelectedCategory('Tümü');
                  }}
                />
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
                            {art.coverImage ? (
                              <img loading="lazy"
                                src={art.coverImage} 
                                alt={art.title} 
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-[#0E1A36] via-[#0B0F19] to-[#132347] flex items-center justify-center">
                                <img loading="lazy"src="/logos/fenerbahce.png" alt="" className="w-14 h-14 object-contain opacity-20" />
                              </div>
                            )}
                            
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

                            <h3 className="text-lg font-bold text-white group-hover:text-fb-yellow leading-snug transition-colors line-clamp-2 tracking-tight">
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
                <div className="p-6 rounded-2xl bg-fb-card border border-white/[0.06] text-left space-y-4 relative overflow-hidden group hover:border-[#FFD21F]/20 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
                    <BookOpen size={18} />
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-[9px] font-black uppercase tracking-widest text-orange-400">Tactical Chronology</span>
                    <h3 className="text-base font-black text-white italic uppercase">Maçın Hikayesi & Oyun Seti</h3>
                    <p className="text-xs text-fb-muted leading-relaxed">
                      Geriden üçlü oyun kurma denemeleri ve beklendiği gibi topsuz dar alan presiyle orta sahayı sıkıştıran teknik heyet organizasyon şablonunun detayları.
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
                      Sağ kanat rotasyonlarında İrfan Can'ın topsuz koşuları ve Fred'in sahadaki bağlantı başarı oranının gelişmiş analitik karnesi. Szymański preste yine devleşti.
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
            className="pb-24 pt-28 text-left relative"
          >
            <ReadingProgress progress={scrollProgress} />
            {currentArticle ? (
              <div className="container mx-auto px-6 max-w-3xl space-y-8">
                
                {/* Back to Archive button */}
                <button 
                  onClick={handleBackToList}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-400 hover:text-fb-yellow transition-colors cursor-pointer"
                >
                  <ChevronLeft size={16} /> Arşive dön
                </button>

                {/* Meta details & headers — calm reading hierarchy */}
                <div className="space-y-5">
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className="px-2.5 py-1 rounded-md bg-fb-yellow/15 text-fb-yellow text-[11px] font-semibold tracking-wide">
                      {currentArticle.category}
                    </span>
                    {currentArticle.isPremium && (
                      <span className="px-2.5 py-1 rounded-md border border-fb-yellow/25 text-fb-yellow text-[11px] font-semibold flex items-center gap-1">
                        <Lock size={10} /> Premium
                      </span>
                    )}
                    <span className="text-xs text-slate-500 font-medium pl-1 flex items-center gap-1">
                      <Clock size={13} /> {currentArticle.readingTime || '—'}
                    </span>
                    <DataBadge provider="editoryal" fetchedAt={currentArticle.publishedAt || currentArticle.createdAt} />
                  </div>

                  <ArticleTitle>{currentArticle.title}</ArticleTitle>

                  {currentArticle.excerpt && (
                    <p className="text-base md:text-lg text-slate-400 font-medium leading-relaxed border-l-2 border-fb-yellow/40 pl-4">
                      {currentArticle.excerpt}
                    </p>
                  )}

                  <div className="flex items-center justify-between py-4 border-t border-b border-white/[0.06]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-fb-yellow font-bold text-sm">
                        {currentArticle.author.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-white block">{currentArticle.author}</span>
                        <span className="text-xs text-slate-500 font-medium block">
                          {new Date(currentArticle.publishedAt || currentArticle.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
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
                  {currentArticle.coverImage ? (
                    <img loading="lazy"
                      src={currentArticle.coverImage} 
                      alt={currentArticle.title} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#0E1A36] via-[#0B0F19] to-[#132347] flex items-center justify-center">
                      <img loading="lazy"src="/logos/fenerbahce.png" alt="" className="w-20 h-20 object-contain opacity-20" />
                    </div>
                  )}
                </div>

                {/* 🔬 INTERACTIVE TACTICAL LAB CARD */}
                <div className="p-6 md:p-8 rounded-3xl bg-fb-card border border-white/[0.06] text-left space-y-6 shadow-2xl relative overflow-hidden bg-gradient-to-b from-fb-card to-fb-navy/20">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-fb-yellow/[0.015] rounded-full blur-[80px] pointer-events-none"></div>
                  
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-200/90 text-[10px] font-semibold tracking-wide">
                        Şematik demo · canlı kadro değil
                      </div>
                      <h3 className="text-xl font-display font-bold text-white tracking-tight">
                        Taktik laboratuvarı
                      </h3>
                      <p className="text-sm text-slate-400 max-w-lg leading-relaxed">
                        Okuma deneyimini bozmayan şematik senaryolar. İsimler örnek formasyondur; gerçek kadro ve advanced maç verisi Maç Merkezi / Oyuncular’dadır.
                      </p>
                    </div>

                    <div className="flex flex-wrap md:flex-col gap-1.5 shrink-0 self-start md:self-auto">
                      {(['press', 'transition', 'lowBlock'] as const).map((sc) => (
                        <button
                          key={sc}
                          onClick={() => setActiveScenario(sc)}
                          className={`px-3.5 py-2 rounded-xl text-[11px] font-semibold text-left border transition-all cursor-pointer ${
                            activeScenario === sc
                              ? 'bg-fb-yellow border-fb-yellow text-fb-navy shadow-lg shadow-fb-yellow/15'
                              : 'bg-white/5 border-white/5 text-slate-300 hover:bg-white/10 hover:border-fb-yellow/30'
                          }`}
                        >
                          {sc === 'press' && 'Ön alan baskı'}
                          {sc === 'transition' && 'Asimetrik geçiş'}
                          {sc === 'lowBlock' && 'Derin blok'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Pitch representation */}
                  <div className="relative w-full h-[380px] md:h-[460px] bg-slate-950 rounded-2xl border border-white/5 overflow-hidden shadow-2xl">
                    {/* Visual grass pattern look */}
                    <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#ffd21f_1px,transparent_1px)] [background-size:16px_16px]"></div>
                    
                    {/* Pitch markings */}
                    <div className="absolute inset-0 p-4">
                      <div className="w-full h-full border border-white/10 rounded-xl relative">
                        {/* Halfway line */}
                        <div className="absolute top-1/2 left-0 w-full h-px bg-white/10"></div>
                        {/* Center Circle */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full border border-white/10"></div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white/20"></div>
                        
                        {/* Penalty Area Top */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-20 border-b border-l border-r border-white/10"></div>
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[30%] h-8 border-b border-l border-r border-white/10"></div>
                        {/* Penalty Area Bottom */}
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[60%] h-20 border-t border-l border-r border-white/10"></div>
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[30%] h-8 border-t border-l border-r border-white/10"></div>
                      </div>
                    </div>

                    {/* SVG Vector Line graphics for flow direction */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
                      {activeScenario === 'press' && (
                        <>
                          <path d="M 120 180 Q 200 150 280 180" fill="none" stroke="#FFD21F" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.6" />
                          <path d="M 480 180 Q 400 150 320 180" fill="none" stroke="#FFD21F" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.6" />
                        </>
                      )}
                      {activeScenario === 'transition' && (
                        <>
                          {/* Run vector arrows */}
                          <path d="M 400 240 Q 450 160 440 80" fill="none" stroke="#FFD21F" strokeWidth="2" strokeDasharray="3 3" opacity="0.8" />
                        </>
                      )}
                      {activeScenario === 'lowBlock' && (
                        <>
                          {/* Squeeze Area */}
                          <rect x="25%" y="65%" width="50%" height="22%" fill="#FFD21F" fillOpacity="0.04" stroke="#FFD21F" strokeWidth="1" strokeDasharray="5 5" strokeOpacity="0.4" rx="12" />
                        </>
                      )}
                    </svg>

                    {/* Render Player Nodes */}
                    {activeScenario === 'press' && [
                      { id: 'GK', name: 'Livakovic', x: 50, y: 88, pos: 'K' },
                      { id: 'LB', name: 'Oosterwolde', x: 22, y: 72, pos: 'DS' },
                      { id: 'CB1', name: 'Djiku', x: 40, y: 76, pos: 'DF' },
                      { id: 'CB2', name: 'Çağlar', x: 60, y: 76, pos: 'DF' },
                      { id: 'RB', name: 'Osayi', x: 78, y: 72, pos: 'DS' },
                      { id: 'DM1', name: 'İsmail', x: 38, y: 55, pos: 'OS' },
                      { id: 'DM2', name: 'Fred', x: 62, y: 55, pos: 'OS' },
                      { id: 'LW', name: 'Tadic', x: 20, y: 32, pos: 'FO' },
                      { id: 'AM', name: 'Szymanski', x: 50, y: 36, pos: 'OS' },
                      { id: 'RW', name: 'İrfan Can', x: 80, y: 32, pos: 'FO' },
                      { id: 'CF', name: 'Dzeko', x: 50, y: 16, pos: 'ST' },
                    ].map(plyr => (
                      <div
                        key={plyr.id}
                        style={{ left: `${plyr.x}%`, top: `${plyr.y}%`, transform: 'translate(-50%, -50%)' }}
                        className="absolute flex flex-col items-center justify-center z-20 cursor-pointer group transition-all duration-1000 ease-in-out"
                      >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-fb-navy to-[#181F30] border-2 border-fb-yellow flex items-center justify-center text-[10px] font-black text-white shadow-lg shadow-black/80 group-hover:scale-110 transition-transform">
                          {plyr.pos}
                        </div>
                        <span className="text-[9px] font-black tracking-tight text-white/90 bg-slate-900/95 hover:bg-slate-950 px-1.5 py-0.5 rounded border border-white/5 mt-1 whitespace-nowrap">
                          {plyr.name}
                        </span>
                      </div>
                    ))}

                    {activeScenario === 'transition' && [
                      { id: 'GK', name: 'Livakovic', x: 50, y: 88, pos: 'K' },
                      { id: 'LB', name: 'Oosterwolde', x: 18, y: 68, pos: 'DS' },
                      { id: 'CB1', name: 'Djiku', x: 38, y: 75, pos: 'DF' },
                      { id: 'CB2', name: 'Çağlar', x: 58, y: 75, pos: 'DF' },
                      { id: 'RB', name: 'Osayi', x: 88, y: 36, pos: 'DS' },
                      { id: 'DM1', name: 'İsmail', x: 32, y: 50, pos: 'OS' },
                      { id: 'DM2', name: 'Fred', x: 62, y: 44, pos: 'OS' },
                      { id: 'LW', name: 'Tadic', x: 15, y: 26, pos: 'FO' },
                      { id: 'AM', name: 'Szymanski', x: 44, y: 28, pos: 'OS' },
                      { id: 'RW', name: 'İrfan Can', x: 74, y: 20, pos: 'FO' },
                      { id: 'CF', name: 'Dzeko', x: 46, y: 14, pos: 'ST' },
                    ].map(plyr => (
                      <div
                        key={plyr.id}
                        style={{ left: `${plyr.x}%`, top: `${plyr.y}%`, transform: 'translate(-50%, -50%)' }}
                        className="absolute flex flex-col items-center justify-center z-20 cursor-pointer group transition-all duration-1000 ease-in-out"
                      >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-fb-navy to-[#181F30] border-2 border-fb-yellow flex items-center justify-center text-[10px] font-black text-white shadow-lg shadow-black/80 group-hover:scale-110 transition-transform">
                          {plyr.pos}
                        </div>
                        <span className="text-[9px] font-black tracking-tight text-white/90 bg-slate-900/95 hover:bg-slate-950 px-1.5 py-0.5 rounded border border-white/5 mt-1 whitespace-nowrap">
                          {plyr.name}
                        </span>
                      </div>
                    ))}

                    {activeScenario === 'lowBlock' && [
                      { id: 'GK', name: 'Livakovic', x: 50, y: 92, pos: 'K' },
                      { id: 'LB', name: 'Oosterwolde', x: 26, y: 81, pos: 'DS' },
                      { id: 'CB1', name: 'Djiku', x: 42, y: 83, pos: 'DF' },
                      { id: 'CB2', name: 'Çağlar', x: 58, y: 83, pos: 'DF' },
                      { id: 'RB', name: 'Osayi', x: 74, y: 81, pos: 'DS' },
                      { id: 'DM1', name: 'İsmail', x: 36, y: 71, pos: 'OS' },
                      { id: 'DM2', name: 'Fred', x: 64, y: 71, pos: 'OS' },
                      { id: 'LW', name: 'Tadic', x: 22, y: 58, pos: 'FO' },
                      { id: 'AM', name: 'Szymanski', x: 50, y: 64, pos: 'OS' },
                      { id: 'RW', name: 'İrfan Can', x: 78, y: 58, pos: 'FO' },
                      { id: 'CF', name: 'Dzeko', x: 50, y: 44, pos: 'ST' },
                    ].map(plyr => (
                      <div
                        key={plyr.id}
                        style={{ left: `${plyr.x}%`, top: `${plyr.y}%`, transform: 'translate(-50%, -50%)' }}
                        className="absolute flex flex-col items-center justify-center z-20 cursor-pointer group transition-all duration-1000 ease-in-out"
                      >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-fb-navy to-[#181F30] border-2 border-fb-yellow flex items-center justify-center text-[10px] font-black text-white shadow-lg shadow-black/80 group-hover:scale-110 transition-transform">
                          {plyr.pos}
                        </div>
                        <span className="text-[9px] font-black tracking-tight text-white/90 bg-slate-900/95 hover:bg-slate-950 px-1.5 py-0.5 rounded border border-white/5 mt-1 whitespace-nowrap">
                          {plyr.name}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Scenario Info Box */}
                  <div className="p-4 rounded-2xl bg-fb-dark border border-white/5 space-y-1">
                    <span className="text-[10px] font-semibold text-fb-yellow tracking-wide">Senaryo notu</span>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      {activeScenario === 'press' && "Ön alan baskı: 1-4-2-3-1 esnek ön blok ile rakip stoperlere pas-kanal baskısı. Orta saha çizgisi kontra ilk pasını kesmeye çalışır. (Şematik demo)"}
                      {activeScenario === 'transition' && "Asimetrik geçiş: bir bek bindirir, diğeri denge tutar; boşalan iç koridora sızma koşuları. (Şematik demo)"}
                      {activeScenario === 'lowBlock' && "Derin blok: skor avantajında 4-5-1 türevi kompakt duruş; blok mesafeleri kısa tutulur. (Şematik demo)"}
                    </p>
                  </div>
                </div>

                {/* CONTENT BODY — calm prose */}
                <div className="reading-prose max-w-none">
                  {currentArticle.isPremium ? (
                    <div className="space-y-6">
                      <p>
                        {currentArticle.content.split('\n\n')[0] || currentArticle.excerpt || ''}
                      </p>
                      <div className="relative pt-20 pb-4">
                        <div className="absolute inset-0 bg-gradient-to-t from-fb-dark via-fb-dark/80 to-transparent z-10" />
                        <p className="text-slate-500/40 select-none blur-[0.5px]">
                          Premium devamı, yayınlanan teaser sonrası kilitli kalır — dolgu metin gerçek maç verisi değildir.
                        </p>
                      </div>
                      <div className="p-8 rounded-2xl bg-[#121826] border border-fb-yellow/25 text-center space-y-4 max-w-xl mx-auto">
                        <Lock size={20} className="text-fb-yellow mx-auto" />
                        <h3 className="text-lg font-display font-bold text-white tracking-tight">
                          Premium üyelere özel devam
                        </h3>
                        <p className="text-sm text-slate-400 max-w-sm mx-auto leading-relaxed">
                          Tam dosya, ek diyagram ve scout notları bekleme listesi üzerinden duyurulur.
                        </p>
                        <button 
                          onClick={() => onNavigate('bulten')}
                          className="w-full max-w-xs mx-auto py-3 bg-fb-yellow hover:bg-white text-fb-navy font-bold text-sm rounded-xl transition-colors cursor-pointer"
                        >
                          Bekleme listesine katıl
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      {currentArticle.content.split('\n\n').map((paragraph, index) => (
                        paragraph.startsWith('## ') ? (
                          <h2 key={index}>
                            {paragraph.replace(/^## /, '')}
                          </h2>
                        ) : (
                          <p key={index}>{paragraph}</p>
                        )
                      ))}
                    </div>
                  )}
                </div>

                {/* USER REACTION */}
                <div className="p-6 rounded-2xl bg-fb-card border border-white/[0.06] text-center space-y-4">
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold text-white">Bu analize katılıyor musun?</h4>
                    <p className="text-xs text-slate-400">Görüşün yalnızca bu oturumda saklanır; sahte oy sayısı basılmaz.</p>
                  </div>

                  <div className="flex flex-wrap justify-center gap-3">
                    <button 
                      onClick={() => handleVote('agree')}
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border cursor-pointer ${
                        userVote === 'agree' 
                          ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/40 font-black' 
                          : 'bg-white/5 text-slate-300 border-white/5 hover:bg-white/10'
                      }`}
                    >
                      <span>👍 Katılıyorum</span>
                      <span className="font-mono text-[10px] bg-white/5 px-1.5 py-0.5 rounded text-fb-muted">
                        {votes.agree}
                      </span>
                    </button>

                    <button 
                      onClick={() => handleVote('neutral')}
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border cursor-pointer ${
                        userVote === 'neutral' 
                          ? 'bg-amber-950/80 text-amber-400 border-amber-500/40 font-black' 
                          : 'bg-white/5 text-slate-300 border-white/5 hover:bg-white/10'
                      }`}
                    >
                      <span>😐 Kararsızım</span>
                      <span className="font-mono text-[10px] bg-white/5 px-1.5 py-0.5 rounded text-fb-muted">
                        {votes.neutral}
                      </span>
                    </button>

                    <button 
                      onClick={() => handleVote('disagree')}
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border cursor-pointer ${
                        userVote === 'disagree' 
                          ? 'bg-rose-950/80 text-rose-400 border-rose-500/40 font-black' 
                          : 'bg-white/5 text-slate-300 border-white/5 hover:bg-white/10'
                      }`}
                    >
                      <span>👎 Katılmıyorum</span>
                      <span className="font-mono text-[10px] bg-white/5 px-1.5 py-0.5 rounded text-fb-muted">
                        {votes.disagree}
                      </span>
                    </button>
                  </div>
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
