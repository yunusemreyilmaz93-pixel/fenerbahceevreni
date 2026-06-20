import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  FileText, 
  Calendar, 
  Award, 
  Users, 
  Search, 
  BarChart3, 
  Sparkles, 
  Mail, 
  Send,
  Image, 
  Home, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  ShieldCheck,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  Info,
  MessagesSquare,
  HeartPulse,
  Megaphone,
  Layers,
  HardDrive,
  Activity,
  Database
} from 'lucide-react';
import { logoutAdmin } from '../../lib/firebase';

// Subcomponents - separated into their own custom files for maximum modularity
import { AdminDashboard } from './AdminDashboard';
import { AdminArticles } from './AdminArticles';
import { AdminMatches } from './AdminMatches';
import { AdminReports } from './AdminReports';
import { AdminPlayers } from './AdminPlayers';
import { AdminTransfer } from './AdminTransfer';
import { AdminPolls } from './AdminPolls';
import { AdminPremium } from './AdminPremium';
import { AdminNewsletter } from './AdminNewsletter';
import { AdminNewsletterIssues } from './AdminNewsletterIssues';
import { AdminSponsors } from './AdminSponsors';
import { AdminHomepage } from './AdminHomepage';
import { AdminSettings } from './AdminSettings';
import { AdminMessages } from './AdminMessages';
import { AdminTeams } from './AdminTeams';
import { AdminMedia } from './AdminMedia';
import { AdminMenus } from './AdminMenus';
import { AdminCategories } from './AdminCategories';
import { AdminAnnouncementBar } from './AdminAnnouncementBar';
import { AdminSources } from './AdminSources';
import { AdminContentHealth } from './AdminContentHealth';
import { AdminImportExport } from './AdminImportExport';
import { AdminApiTest } from './AdminApiTest';
import { AdminDataIntegration } from './AdminDataIntegration';

interface AdminLayoutProps {
  adminUser: any;
  onLogout: () => void;
  onExitAdmin: () => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ adminUser, onLogout, onExitAdmin }) => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  // Global Toast State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [toastTimeoutId, setToastTimeoutId] = useState<any>(null);

  // Quick Create Trigger State
  const [initiateCreateTab, setInitiateCreateTab] = useState<string | null>(null);
  const [quickActionTrigger, setQuickActionTrigger] = useState<number>(0);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    if (toastTimeoutId) {
      clearTimeout(toastTimeoutId);
    }
    setToast({ message, type });
    const id = setTimeout(() => {
      setToast(null);
    }, 4000);
    setToastTimeoutId(id);
  };

  const handleQuickAction = (tabId: string) => {
    setInitiateCreateTab(tabId);
    setActiveTab(tabId);
    setQuickActionTrigger(prev => prev + 1);
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'articles', label: 'Yazılar / Analizler', icon: FileText },
    { id: 'matches', label: 'Maç Merkezi', icon: Calendar },
    { id: 'reports', label: 'Maç Raporları', icon: Award },
    { id: 'players', label: 'Oyuncular', icon: Users },
    { id: 'teams', label: 'Takımlar', icon: ShieldCheck },
    { id: 'transfer', label: 'Transfer Radar', icon: Search },
    { id: 'polls', label: 'Anketler', icon: BarChart3 },
    { id: 'premium', label: 'Premium İçerikler', icon: Sparkles },
    { id: 'newsletter', label: 'Bülten Aboneleri', icon: Mail },
    { id: 'newsletter_issues', label: 'Bülten Sayıları', icon: Send },
    { id: 'media', label: 'Medya Kütüphanesi', icon: Image },
    { id: 'sponsors', label: 'Sponsorlar / Reklamlar', icon: Image },
    { id: 'messages', label: 'Mesajlar', icon: MessagesSquare },
    { id: 'menus', label: 'Menü Yönetimi', icon: Menu },
    { id: 'categories', label: 'Kategoriler', icon: Layers },
    { id: 'announcement_bar', label: 'Duyuru Barı', icon: Megaphone },
    { id: 'sources', label: 'Haber Kaynakları', icon: ShieldCheck },
    { id: 'content_health', label: 'İçerik Sağlığı', icon: HeartPulse },
    { id: 'import_export', label: 'İçe / Dışa Aktar', icon: HardDrive },
    { id: 'data_integration', label: 'Veri Entegrasyonu', icon: Database },
    { id: 'homepage', label: 'Ana Sayfa Yönetimi', icon: Home },
    { id: 'settings', label: 'Site Ayarları', icon: Settings },
    { id: 'api_test', label: 'FUTBOL VERİ MERKEZİ', icon: Activity },
  ];

  const handleLogoutClick = async () => {
    if (window.confirm("Yönetici oturumunu kapatmak istediğinizden emin misiniz?")) {
      await logoutAdmin();
      onLogout();
    }
  };

  const renderActiveTabContent = () => {
    const isArticlesInit = initiateCreateTab === 'articles' ? quickActionTrigger : undefined;
    const isMatchesInit = initiateCreateTab === 'matches' ? quickActionTrigger : undefined;
    const isReportsInit = initiateCreateTab === 'reports' ? quickActionTrigger : undefined;
    const isTransferInit = initiateCreateTab === 'transfer' ? quickActionTrigger : undefined;
    const isPollsInit = initiateCreateTab === 'polls' ? quickActionTrigger : undefined;
    const isSponsorsInit = initiateCreateTab === 'sponsors' ? quickActionTrigger : undefined;

    switch (activeTab) {
      case 'dashboard':
        return (
          <AdminDashboard 
            onNavigateTab={setActiveTab} 
            showToast={showToast} 
            onQuickAction={handleQuickAction}
          />
        );
      case 'articles':
        return <AdminArticles showToast={showToast} initiateCreate={!!isArticlesInit} />;
      case 'matches':
        return <AdminMatches showToast={showToast} initiateCreate={!!isMatchesInit} />;
      case 'reports':
        return <AdminReports showToast={showToast} initiateCreate={!!isReportsInit} />;
      case 'players':
        return <AdminPlayers />;
      case 'teams':
        return <AdminTeams />;
      case 'media':
        return <AdminMedia />;
      case 'transfer':
        return <AdminTransfer showToast={showToast} initiateCreate={!!isTransferInit} />;
      case 'polls':
        return <AdminPolls showToast={showToast} initiateCreate={!!isPollsInit} />;
      case 'premium':
        return <AdminPremium />;
      case 'newsletter':
        return <AdminNewsletter showToast={showToast} />;
      case 'newsletter_issues':
        return <AdminNewsletterIssues showToast={showToast} />;
      case 'sponsors':
        return <AdminSponsors showToast={showToast} initiateCreate={!!isSponsorsInit} />;
      case 'messages':
        return <AdminMessages showToast={showToast} />;
      case 'menus':
        return <AdminMenus showToast={showToast} />;
      case 'categories':
        return <AdminCategories showToast={showToast} />;
      case 'announcement_bar':
        return <AdminAnnouncementBar showToast={showToast} />;
      case 'sources':
        return <AdminSources showToast={showToast} />;
      case 'content_health':
        return <AdminContentHealth />;
      case 'import_export':
        return <AdminImportExport showToast={showToast} />;
      case 'data_integration':
        return <AdminDataIntegration showToast={showToast} adminUser={adminUser} />;
      case 'homepage':
        return <AdminHomepage showToast={showToast} />;
      case 'settings':
        return <AdminSettings showToast={showToast} />;
      case 'api_test':
        return <AdminApiTest />;
      default:
        return (
          <AdminDashboard 
            onNavigateTab={setActiveTab} 
            showToast={showToast} 
            onQuickAction={handleQuickAction}
          />
        );
    }
  };

  const activeLabel = menuItems.find(item => item.id === activeTab)?.label || 'Yönetim Paneli';

  return (
    <div className="min-h-screen bg-[#060a12] text-slate-200 font-sans flex text-left relative overflow-hidden">
      
      {/* Desktop Sidebar */}
      <aside className="hidden xl:flex flex-col w-72 bg-[#0a0f1d] border-r border-white/[0.05] shrink-0 fixed top-0 bottom-0 left-0 z-40">
        {/* Sidebar Header Brand */}
        <div className="p-6 border-b border-white/[0.05] flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-fb-yellow flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(255,176,32,0.2)]">
            <span className="text-fb-navy font-black text-lg italic font-display">FE</span>
          </div>
          <div>
            <h2 className="font-display font-black text-sm text-white uppercase tracking-tight leading-none">FENERBAHÇE EVRENİ</h2>
            <span className="text-[9px] text-fb-yellow font-bold tracking-wider uppercase">CMS PANELİ</span>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1 scrollbar-thin scrollbar-thumb-white/10 text-left">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setInitiateCreateTab(null); // click resets auto forms
                  setActiveTab(item.id);
                }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-fb-yellow text-fb-navy font-black shadow-[0_4px_15px_rgba(255,210,31,0.15)]' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={16} className="shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer User Info */}
        <div className="p-4 border-t border-white/[0.05] bg-[#0c1224] space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border border-fb-yellow/30 bg-fb-navy overflow-hidden flex items-center justify-center shrink-0">
              {adminUser?.photoURL ? (
                <img referrerPolicy="no-referrer" src={adminUser?.photoURL} alt="admin" className="w-full h-full object-cover" />
              ) : (
                <UserCheck className="w-5 h-5 text-fb-yellow" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-black text-white truncate uppercase">{adminUser?.displayName || 'Yonetici'}</h4>
              <p className="text-[10px] text-fb-yellow truncate font-bold">{adminUser?.email || 'admin@fenerbahce.com'}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={onExitAdmin}
              className="flex-1 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-[10px] uppercase text-center cursor-pointer transition-all border border-white/5"
            >
              Uygulamayı Aç
            </button>
            <button
              onClick={handleLogoutClick}
              className="px-3 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold text-[10px] uppercase cursor-pointer transition-all flex items-center justify-center border border-red-500/10"
              title="Çıkış Yap"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Container Wrapper */}
      <div className="flex-1 flex flex-col xl:pl-72 min-w-0">
        {/* Topbar navigation */}
        <header className="h-16 border-b border-white/[0.05] bg-[#0a0f1d]/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            {/* Mobile menu burger */}
            <button 
              onClick={() => setIsMobileSidebarOpen(true)}
              className="xl:hidden w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white cursor-pointer"
            >
              <Menu size={18} />
            </button>
            <span className="text-xs font-black uppercase text-fb-yellow tracking-[0.2em]">{activeLabel}</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[9px] font-black text-fb-yellow px-2 py-1 bg-fb-yellow/10 border border-fb-yellow/20 rounded uppercase tracking-widest hidden sm:inline-block">
              Yazar Yetkisi Aktif
            </span>
            <span className="text-xs font-bold text-fb-muted hidden md:inline-block">Fenerbahçe Evreni CMS</span>
            <div className="h-4 w-px bg-white/10 hidden md:inline-block" />
            <button 
              onClick={onExitAdmin} 
              className="px-3.5 py-1.5 rounded-lg bg-fb-yellow hover:bg-white text-fb-navy text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer"
            >
              Bağımsız Siteyi Gör
            </button>
          </div>
        </header>

        {/* Scrollable Workspace panel */}
        <main className="flex-1 p-6 md:p-8 space-y-8 overflow-x-hidden">
          {renderActiveTabContent()}
        </main>
      </div>

      {/* Mobile Sidebar (Slide-Out Drawer) */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileSidebarOpen(false)}
              className="fixed inset-0 bg-black z-50 xl:hidden"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-80 bg-[#0a0f1d] border-r border-white/10 z-[60] xl:hidden flex flex-col justify-between"
            >
              <div>
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-fb-yellow flex items-center justify-center">
                      <span className="text-fb-navy font-black text-base italic font-display">FE</span>
                    </div>
                    <span className="font-display font-black text-xs text-white">FENERBAHÇE EVRENİ</span>
                  </div>
                  <button 
                    onClick={() => setIsMobileSidebarOpen(false)}
                    className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400 cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>

                <nav className="py-4 px-4 space-y-1 text-left">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setInitiateCreateTab(null);
                          setActiveTab(item.id);
                          setIsMobileSidebarOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                          isActive 
                            ? 'bg-fb-yellow text-fb-navy font-black' 
                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <Icon size={15} />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Mobile Drawer Footer */}
              <div className="p-4 border-t border-white/5 bg-[#0c1224] space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full border border-fb-yellow/30 bg-fb-navy overflow-hidden flex items-center justify-center">
                    <UserCheck className="w-4 h-4 text-fb-yellow" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-black text-white truncate uppercase">{adminUser?.displayName || 'Yonetici'}</h4>
                    <p className="text-[10px] text-fb-yellow truncate font-bold font-mono">{adminUser?.email || 'admin@fenerbahce.com'}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={onExitAdmin}
                    className="flex-1 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 font-black text-[10px] uppercase text-center"
                  >
                    SİTEYE GİT
                  </button>
                  <button
                    onClick={handleLogoutClick}
                    className="px-2.5 py-1.5 rounded-lg bg-red-500/10 text-red-400 font-bold text-[10px] uppercase flex items-center justify-center border border-red-500/10"
                  >
                    <LogOut size={13} />
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Floating Global Toast Notification Container */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 30, x: 0 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-6 right-6 z-[200] max-w-sm"
          >
            <div className={`p-4 rounded-xl border shadow-[0_10px_35px_rgba(0,0,0,0.4)] flex items-center gap-3 text-left ${
              toast.type === 'error'
                ? 'bg-[#180a0f] border-red-500/20 text-red-200'
                : toast.type === 'info'
                ? 'bg-[#0a111a] border-blue-500/20 text-blue-200'
                : 'bg-[#0a1811] border-emerald-500/20 text-emerald-200'
            }`}>
              <div className="shrink-0">
                {toast.type === 'error' ? (
                  <AlertCircle className="w-5 h-5 text-red-400" />
                ) : toast.type === 'info' ? (
                  <Info className="w-5 h-5 text-blue-400" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 animate-bounce" />
                )}
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-black uppercase tracking-wider block opacity-70">
                  {toast.type === 'error' ? 'SİSTEM UYARISI' : toast.type === 'info' ? 'BİLGİLENDİRME' : 'EYLEM BAŞARILI'}
                </span>
                <p className="text-xs font-black">{toast.message}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
