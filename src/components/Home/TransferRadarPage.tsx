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
  Flame,
  ThumbsUp,
  Coins,
  ShieldCheck,
  Zap,
  LayoutGrid
} from 'lucide-react';
import { dbGetCollection, dbAddDocument } from '../../lib/dbService';
import { DataBadge } from '../ui';
import { parseOptionalMetric, hasRating, formatRating } from '../../lib/playerMetrics';
import {
  ArchiveEmpty,
  ArticleTitle,
  LoadingScreen,
  PageKicker,
  PageLead,
  PageTitle,
} from './reading/ReadingChrome';

interface TransferReport {
  id: string;
  playerName: string;
  slug: string;
  position: string;
  age: number;
  nationality: string;
  currentClub: string;
  estimatedCost: string;
  fitScore: number | null;
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
  // Product rule: no fabricated transfer targets. Empty DB -> premium empty state.
  const fallbackReports: TransferReport[] = [];

  // Retrieve data from Firebase
  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
        const list = await dbGetCollection('transferReports');
        // Only show published publicly (A5: no localStorage seed heuristic)
        const published = list.filter((r: any) => r.status === 'published');
        if (published.length > 0) {
          const normalized = published.map((report: any) => ({
            ...report,
            fitScore: parseOptionalMetric(report.fitScore),
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
        matchesExtra = hasRating(r.fitScore) && (r.fitScore as number) >= 8.0;
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

  // Mevki ihtiyaç panosu: yalnızca gerçek (admin/JSON) veriden beslenir — uydurma editoryal yok.
  const [transferNeeds, setTransferNeeds] = useState<{
    position: string; priority: string; color: string; reason: string; category?: string;
  }[]>([]);
  useEffect(() => {
    (async () => {
      try {
        const needs = await dbGetCollection('transferNeeds');
        setTransferNeeds(Array.isArray(needs) ? needs : []);
      } catch { setTransferNeeds([]); }
    })();
  }, []);

  if (loading) {
    return <LoadingScreen label="Transfer radar yükleniyor…" />;
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
            {/* HERO — calm archive */}
            <header className="relative pt-28 pb-12 bg-gradient-to-b from-fb-navy/35 to-transparent border-b border-white/[0.04]">
              <div className="container mx-auto px-6 max-w-6xl space-y-4">
                <PageKicker>
                  <Award size={12} aria-hidden /> Bağımsız scout
                </PageKicker>
                <PageTitle>Transfer radar</PageTitle>
                <PageLead>
                  Kuru dedikodu değil: taktik uyum, tahmini maliyet ve risk notları. Fit skoru yalnızca admin/scout kaynağından geldiğinde gösterilir — yoksa “veri yok”.
                </PageLead>
              </div>
            </header>

            {/* FEATURED TRANSFER SUMMARY CARD */}
            {featuredReport && selectedCategory === 'Tümü' && !searchQuery && extraFilter === 'all' && (
              <section className="container mx-auto px-6 max-w-6xl py-12">
                <div className="mb-6">
                  <span className="text-[10px] font-semibold tracking-wide text-fb-yellow block mb-1">Öne çıkan</span>
                  <h2 className="text-xl font-display font-bold text-white tracking-tight">Scout raporu</h2>
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
                        <h3 className="text-2xl font-bold text-white tracking-tight group-hover:text-fb-yellow transition-colors">{featuredReport.playerName}</h3>
                        <span className="text-xs text-fb-yellow font-semibold tracking-wide block mt-1">{featuredReport.position}</span>
                      </div>
                    </div>

                    {/* Circular Dial Fit Score gauge representation */}
                    <div className="p-4 rounded-2xl bg-fb-dark border border-white/5 w-full flex items-center justify-between gap-4">
                      <div className="text-left">
                        <span className="text-[10px] font-semibold text-slate-400 tracking-wide block">Fit skoru</span>
                        <span className="text-xs font-bold text-fb-muted">Kadro/Taktik</span>
                      </div>
                      <div className="flex items-baseline gap-0.5">
                        <span className="text-3xl font-display font-black text-fb-yellow">{formatRating(featuredReport.fitScore)}</span>
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
                        <span className="text-[10px] uppercase font-black tracking-widest text-[#FFD21F] flex items-center gap-1"> SCOUT DEĞERLENDİRME ÖZETİ</span>
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
                    <h3 className="text-lg font-bold text-white tracking-tight">Eşleşen scout raporu yok</h3>
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
                            <h3 className="text-lg font-bold text-white group-hover:text-fb-yellow transition-colors leading-tight tracking-tight">
                              {report.playerName}
                            </h3>
                            <span className="text-[10px] font-bold text-fb-muted uppercase tracking-wider block mt-0.5">
                              {report.position}
                            </span>
                          </div>
                          
                          {/* Circle Badge Fit Score */}
                          <div className="px-3 py-1.5 rounded-xl bg-fb-dark border border-white/10 text-center shrink-0">
                            <div className="text-[8px] font-black text-fb-yellow uppercase leading-none tracking-widest mb-0.5">FIT</div>
                            <div className="text-sm font-black text-white leading-none">{formatRating(report.fitScore)}</div>
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
                              <span key={i} className="text-[8px] font-extrabold uppercase px-1.5 py-0.5 bg-[#FFD21F]/5 text-[#FFD21F] border border-[#FFD21F]/10 rounded">
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
                        
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#FFD21F] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
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

              {transferNeeds.length === 0 && (
                <div className="p-8 rounded-2xl bg-white/[0.015] border border-dashed border-white/[0.08] text-center space-y-2">
                  <p className="text-[11px] text-slate-400 font-black uppercase tracking-widest font-mono">
                    Mevki ihtiyaç şeması henüz yayınlanmadı
                  </p>
                  <p className="text-[10px] text-slate-500 italic">
                    Taktik kurulun sezon içi ihtiyaç değerlendirmesi eklendiğinde bu pano aktifleşir.
                  </p>
                </div>
              )}
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
                    desc: 'İsmail Kartal\'nun geçiş savunması, blok daraltma presi, dikey pas oyunu ve bek katılım senaryolarına oyuncunun ısı haritası ve pas hacmi açısının korelasyonu.'
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
                  <div className="flex items-center gap-1.5 text-[#FFD21F] font-black text-[10px] tracking-widest uppercase">
                     Premium Transfer Dosyaları
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
              <div className="container mx-auto px-6 max-w-3xl space-y-8">
                
                <button 
                  onClick={handleBackToList}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-400 hover:text-fb-yellow transition-colors cursor-pointer"
                >
                  <ChevronLeft size={16} /> Radara dön
                </button>

                <div className="p-6 md:p-8 rounded-2xl bg-fb-card border border-white/[0.08] relative overflow-hidden">
                  <div className="absolute top-4 right-4 flex flex-wrap gap-2 justify-end max-w-[50%]">
                    {currentReport.isPremium && (
                      <span className="px-2.5 py-1 text-[11px] font-semibold bg-fb-yellow text-fb-navy rounded-md flex items-center gap-1">
                        <Lock size={9} /> Premium
                      </span>
                    )}
                    <span className="px-2.5 py-1 text-[11px] font-semibold bg-fb-dark text-fb-yellow border border-fb-yellow/20 rounded-md">
                      Fit: {hasRating(currentReport.fitScore) ? `${formatRating(currentReport.fitScore)}/10` : '—'}
                    </span>
                    <DataBadge provider="scout" fetchedAt={currentReport.updatedAt || currentReport.createdAt} />
                  </div>

                  <div className="flex flex-col md:flex-row gap-6 items-center">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-fb-navy to-fb-dark border-2 border-fb-yellow/30 flex items-center justify-center text-fb-yellow font-display font-bold text-2xl shadow-lg shrink-0">
                      {currentReport.playerName.substring(0, 2).toUpperCase()}
                    </div>

                    <div className="space-y-2 text-center md:text-left pt-8 md:pt-0">
                      <span className="text-[10px] font-black bg-white/5 border border-white/5 text-[#FFD21F] px-2.5 py-1 rounded">
                        Mevki: {currentReport.position}
                      </span>
                      <ArticleTitle className="pt-1 text-3xl md:text-4xl">{currentReport.playerName}</ArticleTitle>
                      
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-400 font-medium justify-center md:justify-start">
                        <span>Yaş: <strong className="text-slate-200 font-semibold">{currentReport.age || '—'}</strong></span>
                        <span className="text-slate-600">·</span>
                        <span>Kulüp: <strong className="text-slate-200 font-semibold">{currentReport.currentClub || '—'}</strong></span>
                        <span className="text-slate-600">·</span>
                        <span>Uyruk: <strong className="text-slate-200 font-semibold">{currentReport.nationality || '—'}</strong></span>
                        <span className="text-slate-600">·</span>
                        <span>Maliyet: <strong className="text-emerald-400 font-semibold">{currentReport.estimatedCost || '—'}</strong></span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 rounded-2xl bg-fb-card border border-white/[0.06] text-left space-y-4">
                    <h3 className="text-sm font-semibold text-emerald-400 flex items-center gap-2 pb-2 border-b border-white/5">
                      <ShieldCheck size={16} /> Güçlü yönler
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
                    <h3 className="text-xs font-black text-[#FFD21F] uppercase tracking-widest flex items-center gap-2 pb-2 border-b border-white/5">
                      <AlertTriangle size={16} className="text-[#FFD21F]" /> Tehditler & Limitasyonlar
                    </h3>
                    <ul className="space-y-3">
                      {currentReport.concerns.map((con, i) => (
                        <li key={i} className="text-xs text-slate-200 flex items-start gap-2 font-semibold">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#FFD21F] shrink-0 mt-2" />
                          <span>{con}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                </div>

                {/* Rapor Detay Body */}
                <div className="p-6 md:p-8 rounded-2xl bg-fb-card border border-white/[0.06] text-left space-y-6">
                  
                  <div className="space-y-2 reading-prose">
                    <h2 className="!mt-0">Profil özeti</h2>
                    <p>{currentReport.summary || 'Özet henüz eklenmedi.'}</p>
                  </div>

                  {currentReport.isPremium ? (
                    <div className="p-8 rounded-2xl bg-[#121826] border border-fb-yellow/25 text-center space-y-4 max-w-xl mx-auto">
                      <Lock size={20} className="text-fb-yellow mx-auto" />
                      <h3 className="text-lg font-display font-bold text-white tracking-tight">
                        Premium scout dosyası
                      </h3>
                      <p className="text-sm text-slate-400 max-w-sm mx-auto leading-relaxed">
                        Tam rapor, alternatif adaylar ve sözleşme notları bekleme listesi üzerinden duyurulur. Blur dolgu metin gerçek veri değildir.
                      </p>
                      <button 
                        onClick={() => onNavigate('premium')}
                        className="w-full max-w-xs mx-auto py-3 bg-fb-yellow hover:bg-white text-fb-navy font-bold text-sm rounded-xl transition-colors cursor-pointer"
                      >
                        Bekleme listesine katıl
                      </button>
                    </div>
                  ) : (
                    /* PUBLICLY VISIBLE REPORTS PORTION */
                    <div className="space-y-6 pt-4 border-t border-white/[0.04]">
                      
                      {/* Tactical suitability box */}
                      {currentReport.tacticalFit && (
                        <div className="space-y-2">
                          <h4 className="text-xs font-black text-[#FFD21F] uppercase tracking-widest flex items-center gap-1.5 font-display italic">
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
