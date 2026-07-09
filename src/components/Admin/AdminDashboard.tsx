import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { 
  FileText, 
  Calendar, 
  BarChart3, 
  Mail, 
 
  Sparkle,
  Image,
  Award,
  PlusCircle, 
  ArrowRight,
  TrendingUp,
  Activity,
  MapPin,
  Clock,
  ChevronRight,
  Search,
  Users,
  MessageSquare
} from 'lucide-react';
import { dbGetCollection } from '../../lib/dbService';
import { formatDate } from '../../lib/adminHelpers';

interface AdminDashboardProps {
  onNavigateTab: (tabId: string) => void;
  showToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
  onQuickAction?: (tabId: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigateTab, showToast, onQuickAction }) => {
  const [metrics, setMetrics] = useState({
    totalArticles: 0,
    publishedArticles: 0,
    upcomingMatches: 0,
    activePolls: 0,
    subscribers: 0,
    premiumItems: 0,
    sponsors: 0,
    publishedToday: 0,
    publishedThisWeek: 0,
    newMessages: 0,
    sponsorRequests: 0,
    totalMessages: 0
  });

  const [upcomingNearest, setUpcomingNearest] = useState<any>(null);
  const [lastFive, setLastFive] = useState<any[]>([]);
  const [recentMessages, setRecentMessages] = useState<any[]>([]);
  const [draftsList, setDraftsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const isToday = (dateStr: string) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    const today = new Date();
    return d.getDate() === today.getDate() &&
           d.getMonth() === today.getMonth() &&
           d.getFullYear() === today.getFullYear();
  };

  const isThisWeek = (dateStr: string) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - d.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  };

  const loadDashboardData = async () => {
    try {
      const articles = await dbGetCollection('articles');
      const matches = await dbGetCollection('matches');
      const reports = await dbGetCollection('matchReports');
      const scouting = await dbGetCollection('transferReports');
      const premium = await dbGetCollection('premium');
      const polls = await dbGetCollection('polls');
      const newsletter = await dbGetCollection('newsletterSubscribers');
      const sponsors = await dbGetCollection('sponsors');
      const contacts = await dbGetCollection('contactMessages');

      // 1. Process active metrics
      const publishedArtCount = articles.filter((a: any) => a.status === 'published').length;
      const upcomingMatchCount = matches.filter((m: any) => m.status === 'upcoming').length;
      const activePollCount = polls.filter((p: any) => p.status === 'active' || p.status === 'active-poll').length;

      // 2. Nearest matchup
      const sortedUpcoming = matches
         .filter((m: any) => m.status === 'upcoming')
         .sort((a: any, b: any) => new Date(a.matchDate).getTime() - new Date(b.matchDate).getTime());
      setUpcomingNearest(sortedUpcoming[0] || null);

      // 3. Compile helper lists of all types of dynamic contents
      const compiledAll: any[] = [];
      articles.forEach((a: any) => compiledAll.push({ ...a, typeText: 'Analiz Yazısı', titleText: a.title, tab: 'articles', stamp: a.createdAt || a.updatedAt }));
      matches.forEach((m: any) => compiledAll.push({ ...m, typeText: 'Maç Fikstürü', titleText: `${m.homeTeam} vs ${m.awayTeam}`, tab: 'matches', stamp: m.createdAt || m.matchDate }));
      reports.forEach((r: any) => compiledAll.push({ ...r, typeText: 'Maç Sonu Raporu', titleText: r.title, tab: 'reports', stamp: r.createdAt || r.updatedAt }));
      scouting.forEach((s: any) => compiledAll.push({ ...s, typeText: 'Transfer Raporu', titleText: s.playerName, tab: 'transfer', stamp: s.createdAt || s.updatedAt }));
      premium.forEach((p: any) => compiledAll.push({ ...p, typeText: 'Premium İçerik', titleText: p.title, tab: 'premium', stamp: p.createdAt || p.updatedAt }));
      polls.forEach((po: any) => compiledAll.push({ ...po, typeText: 'Anket Sorusu', titleText: po.question, tab: 'polls', stamp: po.createdAt }));

      // Sort compiled by date
      const sortedAll = compiledAll.sort((a, b) => {
        const tA = a.stamp ? new Date(a.stamp).getTime() : 0;
        const tB = b.stamp ? new Date(b.stamp).getTime() : 0;
        return tB - tA; // descending
      });

      // Daily and weekly calculation
      const pubToday = sortedAll.filter((item) => {
        const isPub = item.status === 'published' || item.status === 'active' || item.status === 'active-poll';
        return isPub && isToday(item.stamp);
      }).length;

      const pubThisWeek = sortedAll.filter((item) => {
        const isPub = item.status === 'published' || item.status === 'active' || item.status === 'active-poll';
        return isPub && isThisWeek(item.stamp);
      }).length;

      // Extract Son Eklenen 5 içerik
      setLastFive(sortedAll.slice(0, 5));

      // Extract recent messages
      const sortedMessages = contacts.sort((a: any, b: any) => {
        const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return tB - tA;
      });
      setRecentMessages(sortedMessages.slice(0, 5));

      // Extract Taslakta bekleyenler (status === 'draft' or 'scheduled')
      const drafts = sortedAll.filter(item => item.status === 'draft' || item.status === 'scheduled');
      setDraftsList(drafts);

      setMetrics({
        totalArticles: articles.length,
        publishedArticles: publishedArtCount,
        upcomingMatches: upcomingMatchCount,
        activePolls: activePollCount,
        subscribers: newsletter.length,
        premiumItems: premium.length,
        sponsors: sponsors.length,
        publishedToday: pubToday,
        publishedThisWeek: pubThisWeek,
        newMessages: contacts.filter((c: any) => c.status === 'new').length,
        sponsorRequests: contacts.filter((c: any) => c.messageType === 'sponsor-reklam').length,
        totalMessages: contacts.length
      });
    } catch (err) {
      console.error("Dashboard calculation error:", err);
      if (showToast) showToast("Gösterge paneli verileri derlenirken hata oluştu.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const triggerQuickButton = (tab: string) => {
    if (onQuickAction) {
      onQuickAction(tab);
    } else {
      onNavigateTab(tab);
    }
  };

  const dashboardActions = [
    { label: 'Yeni Analiz Yazısı', tab: 'articles', color: 'border-l-blue-500' },
    { label: 'Yeni Maç Ekle', tab: 'matches', color: 'border-l-fb-yellow' },
    { label: 'Maç Raporu Yaz', tab: 'reports', color: 'border-l-purple-500' },
    { label: 'Transfer Raporu Ekle', tab: 'transfer', color: 'border-l-emerald-500' },
    { label: 'Yeni Anket Oluştur', tab: 'polls', color: 'border-l-amber-500' },
    { label: 'Sponsor Ekle', tab: 'sponsors', color: 'border-l-rose-500' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-fb-yellow text-xs font-black uppercase tracking-widest gap-2">
        <Activity className="animate-spin text-fb-yellow" size={16} /> DATA ANALİZ YAPILIYOR...
      </div>
    );
  }

  return (
    <div className="space-y-8 select-none">
      {/* Welcome Banner */}
      <div className="p-8 rounded-2xl bg-fb-card border border-white/[0.08] relative overflow-hidden bg-gradient-to-r from-fb-card to-[#0b1224]">
        <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
          <Award size={180} className="text-fb-yellow" />
        </div>
        <div className="space-y-3 relative z-10 max-w-xl">
          <div className="flex items-center gap-2">
            <Sparkle className="w-5 h-5 text-fb-yellow animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-fb-yellow">YÖNETİM SİSTEMİ</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-display font-black text-white italic tracking-tight uppercase leading-none">FENERBAHÇE EVRENİ CMS</h1>
          <p className="text-xs text-fb-muted leading-relaxed font-semibold">
            Evrenin en güçlü analiz panelindesiniz. İçerikleri anında yönetin, yeni analizler girin, anketleri güncelleyin ve site yapısını kod yazmadan şekillendirin.
          </p>
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="space-y-3 text-left">
        <h3 className="text-xs font-black uppercase tracking-widest text-[#FFB020] flex items-center gap-1.5">
          <PlusCircle size={14} /> HIZLI KONTROL TUŞLARI
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {dashboardActions.map((act, idx) => (
            <button
              key={act.tab}
              onClick={() => triggerQuickButton(act.tab)}
              className={`p-3 rounded-xl bg-fb-card border border-white/[0.04] hover:bg-white/5 border-l-4 ${act.color} text-[11px] font-black uppercase tracking-wider text-white transition-all text-left flex flex-col justify-between h-20 cursor-pointer group hover:-translate-y-0.5`}
            >
              <PlusCircle className="w-4 h-4 text-fb-yellow opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all" />
              <span className="truncate group-hover:text-fb-yellow">{act.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Today / This Week Overview Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Statistics Widgets */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Daily/Weekly feed */}
          <div className="p-6 rounded-2xl bg-fb-card border border-white/[0.06] space-y-4 text-left">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-300">BUGÜN / İLETİŞİM HUB AKIŞI</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-[#0a0f1d] border border-white/5 flex flex-col justify-between h-24">
                <span className="text-[9px] font-black uppercase tracking-wider text-fb-muted">Bugün Yayınlanan</span>
                <span className="text-2xl font-black text-fb-yellow font-display">{metrics.publishedToday} <span className="text-[10px] font-bold text-slate-400">içerik</span></span>
              </div>
              <div className="p-4 rounded-xl bg-[#0a0f1d] border border-white/5 flex flex-col justify-between h-24">
                <span className="text-[9px] font-black uppercase tracking-wider text-fb-muted">Bu Hafta Yayınlanan</span>
                <span className="text-2xl font-black text-emerald-400 font-display">{metrics.publishedThisWeek} <span className="text-[10px] font-bold text-slate-400">içerik</span></span>
              </div>
              <div className="p-4 rounded-xl bg-[#0a0f1d] border border-white/5 flex flex-col justify-between h-24 cursor-pointer hover:bg-white/[0.01] transition-all" onClick={() => onNavigateTab('messages')}>
                <span className="text-[9px] font-black uppercase tracking-wider text-emerald-400">Yeni Mesajlar</span>
                <span className="text-2xl font-black text-emerald-400 font-display">{metrics.newMessages} <span className="text-[10px] font-bold text-slate-400">mesaj</span></span>
              </div>
              <div className="p-4 rounded-xl bg-[#0a0f1d] border border-white/5 flex flex-col justify-between h-24 cursor-pointer hover:bg-white/[0.01] transition-all" onClick={() => onNavigateTab('messages')}>
                <span className="text-[9px] font-black uppercase tracking-wider text-amber-400 font-mono">Sponsor Talebi</span>
                <span className="text-2xl font-black text-amber-400 font-display">{metrics.sponsorRequests} <span className="text-[10px] font-bold text-slate-400">talep</span></span>
              </div>
            </div>
          </div>

          {/* Closest matchup */}
          <div className="p-6 rounded-2xl bg-fb-card border border-white/[0.06] space-y-4 text-left">
            <h3 className="text-xs font-black uppercase tracking-widest text-[#FFB020]">YAKLAŞAN EN YAKIN MAÇ</h3>
            {upcomingNearest ? (
              <div className="p-5 rounded-xl bg-[#090e1a] border border-fb-yellow/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase px-2.5 py-1 bg-fb-yellow/10 text-fb-yellow border border-fb-yellow/20 rounded">
                    {upcomingNearest.competition || 'Karşılaşma'}
                  </span>
                  <h4 className="text-base font-black text-white">{upcomingNearest.homeTeam} vs {upcomingNearest.awayTeam}</h4>
                  <p className="text-[10px] text-fb-muted flex items-center gap-1 font-semibold">
                    <MapPin size={12} className="text-fb-yellow" /> {upcomingNearest.venue || 'Şükrü Saracoğlu Stadyumu'}
                  </p>
                </div>
                <div className="text-center sm:text-right">
                  <div className="text-xs font-black uppercase text-slate-400">BAŞLAMA SAATİ</div>
                  <div className="text-sm font-black text-white mt-1 flex items-center justify-center sm:justify-end gap-1">
                    <Clock size={14} className="text-fb-yellow animate-pulse" />
                    {formatDate(upcomingNearest.matchDate)}
                  </div>
                  <button 
                    onClick={() => triggerQuickButton('matches')}
                    className="text-[10px] text-fb-yellow font-bold uppercase hover:underline mt-2 inline-block cursor-pointer"
                  >
                    Kadro & Taktik Düzenle
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-xl bg-[#0a0f1d] border border-white/5 text-center text-xs text-fb-muted font-bold py-8">
                Planlanmış gelecek bir müsabaka kaydı bulunmamaktadır.
              </div>
            )}
          </div>
        </div>

        {/* Community overview card */}
        <div className="space-y-6 text-left">
          <div className="p-6 rounded-2xl bg-fb-card border border-white/[0.06] h-full flex flex-col justify-between">
            <div className="space-y-4">
              <span className="text-[10px] font-black uppercase text-fb-yellow tracking-widest px-2.5 py-1 bg-fb-yellow/10 border border-fb-yellow/20 rounded inline-block">AKTİF ANKET</span>
              <h2 className="text-4xl font-black text-white font-display mt-2">{metrics.activePolls}</h2>
              <p className="text-xs font-semibold text-fb-muted leading-relaxed">
                Taraftarların katıldığı aktif nabız anket sayısı. Sonuçların kümülatif grafikleri anlık olarak taraftar odasında listelenmektedir.
              </p>
            </div>
            <button
              onClick={() => triggerQuickButton('polls')}
              className="w-full mt-6 py-3 bg-fb-yellow hover:bg-white text-fb-navy text-[11px] font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              Anket Sonuçlarını Oku <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Lists of Last items and Draft status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
        
        {/* Last Added 5 contents */}
        <div className="p-6 rounded-2xl bg-fb-card border border-white/[0.06] space-y-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-[#FFB020] flex items-center gap-1.5">
            <TrendingUp size={14} /> SON EKLENEN 5 İÇERİK
          </h3>
          <div className="space-y-3">
            {lastFive.length === 0 ? (
              <div className="p-8 rounded-xl bg-[#0a0f1d] border border-white/5 text-center text-xs text-fb-muted font-bold py-12">
                Henüz hiçbir içerik eklenmemiş.
              </div>
            ) : (
              lastFive.map((item, index) => (
                <div 
                  key={`${item.id}-${index}`}
                  className="p-3.5 rounded-xl bg-[#090e1a] hover:bg-white/[0.02] border border-white/5 flex items-center justify-between gap-3 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <span className="text-[9px] font-black px-1.5 py-0.5 bg-white/5 text-fb-yellow border border-white/5 rounded mr-2 uppercase tracking-wider">
                      {item.typeText}
                    </span>
                    <span className="text-xs font-black text-white truncate inline-block max-w-[150px] align-middle">
                      {item.titleText}
                    </span>
                    <span className="text-[10px] text-fb-muted block mt-1 font-semibold">{formatDate(item.stamp)}</span>
                  </div>
                  <button
                    onClick={() => triggerQuickButton(item.tab)}
                    className="p-1 text-fb-yellow hover:text-white transition-colors cursor-pointer"
                    title="Düzenle"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Draft Items */}
        <div className="p-6 rounded-2xl bg-fb-card border border-white/[0.06] space-y-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-300">
            TASLAKTA BEKLEYENLER ({draftsList.length})
          </h3>
          <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
            {draftsList.length === 0 ? (
              <div className="p-8 rounded-xl bg-[#0a0f1d] border border-white/5 text-center text-xs text-fb-muted font-bold py-12">
                Taslakta bekleyen bir içerik bulunmuyor!
              </div>
            ) : (
              draftsList.map((item, index) => (
                <div 
                  key={`${item.id}-${index}`}
                  className="p-3.5 rounded-xl bg-[#090e1a] border border-white/5 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <span className="text-[9px] font-black px-1.5 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded mr-2 uppercase tracking-wide">
                      {item.status === 'scheduled' ? 'PLANLI' : 'TASLAK'}
                    </span>
                    <span className="text-xs font-black text-white truncate inline-block max-w-[140px] align-middle">
                      {item.titleText}
                    </span>
                    {item.status === 'scheduled' && item.scheduledAt && (
                      <p className="text-[9px] text-fb-yellow font-semibold mt-1">🕒 Planlanan Tarih: {formatDate(item.scheduledAt)}</p>
                    )}
                  </div>
                  <button
                    onClick={() => triggerQuickButton(item.tab)}
                    className="text-[10px] font-bold text-fb-yellow hover:underline cursor-pointer"
                  >
                    Yayınla
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Son Gelen 5 Mesaj */}
        <div className="p-6 rounded-2xl bg-fb-card border border-white/[0.06] space-y-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-[#FFB020] flex items-center gap-1.5">
            <MessageSquare size={14} /> SON GELEN GÖRÜŞLER & TALEPLER
          </h3>
          <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
            {recentMessages.length === 0 ? (
              <div className="p-8 rounded-xl bg-[#0a0f1d] border border-white/5 text-center text-xs text-fb-muted font-bold py-12">
                Gelen herhangi bir iletişim mesajı bulunmuyor.
              </div>
            ) : (
              recentMessages.map((msg, index) => (
                <div 
                  key={`${msg.id}-${index}`}
                  className="p-3.5 rounded-xl bg-[#090e1a] border border-white/5 flex items-center justify-between gap-2 hover:bg-white/[0.02] transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-black px-1.5 py-0.5 bg-[#FFB020]/10 text-fb-yellow border border-[#FFB020]/20 rounded uppercase tracking-wide">
                        {msg.messageType === 'sponsor-reklam' ? 'Sponsor' : msg.messageType === 'icerik-onerisi' ? 'Öneri' : 'Genel'}
                      </span>
                      {msg.status === 'new' && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      )}
                    </div>
                    <span className="text-xs font-black text-white truncate block mt-1 font-sans">
                      {msg.name}
                    </span>
                    <p className="text-[10px] text-slate-400 font-semibold truncate mt-0.5 italic">
                      "{msg.subject || 'Mesaj detayı bulunmuyor'}"
                    </p>
                  </div>
                  <button
                    onClick={() => onNavigateTab('messages')}
                    className="text-[10px] font-bold text-fb-yellow hover:underline cursor-pointer"
                  >
                    Oku
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Live System Info status */}
      <div className="p-5 rounded-2xl bg-[#090e1a] border border-white/[0.04] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-left">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <TrendingUp size={15} />
          </div>
          <div>
            <span className="text-[9px] text-fb-muted font-black uppercase tracking-widest block">BULUT BAĞLANTISI</span>
            <span className="text-xs font-semibold text-slate-300">Firestore verileri başarıyla senkronize edildi.</span>
          </div>
        </div>
        <span className="text-[9px] font-black bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-full border border-emerald-500/20 self-start sm:self-auto uppercase tracking-widest">
          ● AKTİF BAĞLANTI
        </span>
      </div>
    </div>
  );
};
