import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { 
  Mail, 
  Trash2, 
  Download, 
  Search, 
  CheckCircle2, 
  AlertCircle,
  XCircle,
  Filter,
  UserCheck,
  UserX,
  Plus
} from 'lucide-react';
import { dbGetCollection, dbDeleteDocument, dbUpsertDocument } from '../../lib/dbService';
import { exportToCSV, formatDate } from '../../lib/adminHelpers';
import { DeleteConfirmModal, EmptyState } from './AdminCommon';

interface AdminNewsletterProps {
  showToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const AdminNewsletter: React.FC<AdminNewsletterProps> = ({ showToast }) => {
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filtering and Searching states
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'unsubscribed'>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [interestFilter, setInterestFilter] = useState<string>('all');

  // Confirmation Modal state
  const [deleteData, setDeleteData] = useState<{ id: string; email: string } | null>(null);

  const loadData = async () => {
    setLoading(true);
    const list = await dbGetCollection('newsletterSubscribers');
    // If empty fallback or migration, let's load what is in 'newsletterSubscribers'
    setSubscribers(list);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTriggerDelete = (id: string, email: string) => {
    setDeleteData({ id, email });
  };

  const executeDelete = async () => {
    if (!deleteData) return;
    try {
      await dbDeleteDocument('newsletterSubscribers', deleteData.id);
      if (showToast) showToast(`"${deleteData.email}" abonesi kalıcı olarak silindi.`, "success");
      loadData();
    } catch (err) {
      console.error(err);
      if (showToast) showToast("Abone silinirken hata oluştu.", "error");
    } finally {
      setDeleteData(null);
    }
  };

  const handleUpdateStatus = async (id: string, email: string, newStatus: 'active' | 'unsubscribed') => {
    try {
      const sub = subscribers.find(s => s.id === id);
      if (!sub) return;

      const updatedSub = {
        ...sub,
        status: newStatus,
        unsubscribedAt: newStatus === 'unsubscribed' ? new Date().toISOString() : null,
        updatedAt: new Date().toISOString()
      };

      await dbUpsertDocument('newsletterSubscribers', id, updatedSub);
      
      const successMsg = newStatus === 'active' 
        ? `"${email}" abonesi tekrar aktif edildi.` 
        : `"${email}" abonesi abonelikten çıkarıldı.`;

      if (showToast) showToast(successMsg, "success");
      loadData();
    } catch (err) {
      console.error(err);
      if (showToast) showToast("Durum güncellenirken hata oluştu.", "error");
    }
  };

  const handleExportCSV = () => {
    if (subscribers.length === 0) {
      if (showToast) showToast("İndirilecek abone kaydı bulunmamaktadır.", "error");
      return;
    }

    try {
      const fieldsToExport = ['id', 'name', 'email', 'source', 'status', 'interests', 'subscribedAt'];
      const downloadFilename = `fenerbahce-evreni-bulten-aboneleri-${new Date().toISOString().slice(0, 10)}.csv`;
      
      // Map interests array into comma-spaced strings for readable CSV output
      const csvData = subscribers.map(s => ({
        ...s,
        interests: Array.isArray(s.interests) ? s.interests.join(', ') : (s.interests || '')
      }));

      exportToCSV(csvData, fieldsToExport, downloadFilename);
      if (showToast) showToast("CSV Abone Listesi başarıyla indirildi.", "success");
    } catch (e) {
      console.error(e);
      if (showToast) showToast("Dosya dışa aktarılırken hata oluştu.", "error");
    }
  };

  // Get dynamic filter options
  const uniqueSources = Array.from(new Set(subscribers.map(s => s.source || 'unknown').filter(Boolean)));
  const uniqueInterests = Array.from(new Set(subscribers.flatMap(s => Array.isArray(s.interests) ? s.interests : [])));

  // Weekly stats
  const activeCount = subscribers.filter(s => s.status === 'active').length;
  
  const getNewThisWeekCount = () => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return subscribers.filter(s => {
      if (!s.subscribedAt) return false;
      return new Date(s.subscribedAt) >= sevenDaysAgo;
    }).length;
  };

  const filtered = subscribers.filter(s => {
    // Search
    const searchMatch = !search || 
      s.email?.toLowerCase().includes(search.toLowerCase()) ||
      s.name?.toLowerCase().includes(search.toLowerCase());

    // Status filter
    const statusMatch = statusFilter === 'all' || s.status === statusFilter;

    // Source filter
    const sourceMatch = sourceFilter === 'all' || s.source === sourceFilter;

    // Interest filter
    const interestMatch = interestFilter === 'all' || 
      (Array.isArray(s.interests) && s.interests.includes(interestFilter));

    return searchMatch && statusMatch && sourceMatch && interestMatch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
        <div>
          <h2 className="text-xl font-display font-black text-white uppercase italic tracking-wide flex items-center gap-2">
            <Mail className="text-fb-yellow" size={20} /> E-Posta Bülten Aboneleri
          </h2>
          <p className="text-xs text-fb-muted">Haftalık Fenerbahçe Evreni analiz bültenine kayıtlı taraftar kitlesini yönetin ve filtreleyin.</p>
        </div>
        <button
          onClick={handleExportCSV}
          disabled={filtered.length === 0}
          className="px-5 py-2.5 bg-fb-yellow disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white text-fb-navy font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
        >
          <Download size={14} /> CSV LİSTESİNİ İNDİR
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
        <div className="p-4 rounded-xl bg-fb-card border border-white/[0.05] border-l-4 border-l-fb-yellow flex flex-col justify-between">
          <div>
            <span className="text-[10px] text-fb-muted font-black uppercase tracking-wider block">Toplam Abone</span>
            <div className="text-2xl font-black text-white mt-1 font-display">{subscribers.length} Kayıt</div>
          </div>
          <span className="text-[9px] text-[#FFB020] font-bold block uppercase tracking-wider mt-1">Aktif ve Pasif Tüm Mailler</span>
        </div>

        <div className="p-4 rounded-xl bg-fb-card border border-white/[0.05] border-l-4 border-l-emerald-500 flex flex-col justify-between">
          <div>
            <span className="text-[10px] text-fb-muted font-black uppercase tracking-wider block">Toplam Aktif Kitle</span>
            <div className="text-2xl font-black text-white mt-1 font-display">{activeCount} Abone</div>
          </div>
          <span className="text-[9px] text-emerald-400 font-bold block uppercase tracking-wider mt-1">Bülten Gönderilecek Kitle</span>
        </div>

        <div className="p-4 rounded-xl bg-fb-card border border-white/[0.05] border-l-4 border-l-blue-500 flex flex-col justify-between">
          <div>
            <span className="text-[10px] text-fb-muted font-black uppercase tracking-wider block">Bu Hafta Yeni Katılanlar</span>
            <div className="text-2xl font-black text-white mt-1 font-display">+{getNewThisWeekCount()} Yeni</div>
          </div>
          <span className="text-[9px] text-blue-400 font-bold block uppercase tracking-wider mt-1">Son 7 günde eklenenler</span>
        </div>
      </div>

      {/* Searching and Multi-Filters */}
      <div className="p-5 rounded-xl bg-fb-card border border-white/[0.05] space-y-4 text-left">
        <div className="flex flex-col lg:flex-row gap-4">
          
          {/* Main Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 w-4 h-4 text-fb-muted" />
            <input
              type="text"
              placeholder="Abonelerde isim veya e-posta ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#080d1a] border border-white/10 text-xs text-white placeholder-fb-muted focus:outline-none focus:border-fb-yellow"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 shrink-0">
            {/* Status Filter */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e: any) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#080d1a] border border-white/10 text-xs text-white focus:outline-none focus:border-fb-yellow appearance-none cursor-pointer pr-8 font-bold"
              >
                <option value="all">Durum: Tümü</option>
                <option value="active">Aktif Aboneler</option>
                <option value="unsubscribed">Ayrılan Aboneler</option>
              </select>
              <Filter className="absolute right-3 top-3.5 w-3.5 h-3.5 text-fb-muted pointer-events-none" />
            </div>

            {/* Source Filter */}
            <div className="relative">
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#080d1a] border border-white/10 text-xs text-white focus:outline-none focus:border-fb-yellow appearance-none cursor-pointer pr-8 font-bold"
              >
                <option value="all">Kaynak: Tümü</option>
                {uniqueSources.map(src => (
                  <option key={src} value={src}>{src}</option>
                ))}
              </select>
              <Filter className="absolute right-3 top-3.5 w-3.5 h-3.5 text-fb-muted pointer-events-none" />
            </div>

            {/* Interest Filter */}
            <div className="relative">
              <select
                value={interestFilter}
                onChange={(e) => setInterestFilter(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#080d1a] border border-white/10 text-xs text-white focus:outline-none focus:border-fb-yellow appearance-none cursor-pointer pr-8 font-bold"
              >
                <option value="all">İlgi Alanı: Tümü</option>
                {uniqueInterests.map(interest => (
                  <option key={interest} value={interest}>{interest}</option>
                ))}
              </select>
              <Filter className="absolute right-3 top-3.5 w-3.5 h-3.5 text-fb-muted pointer-events-none" />
            </div>
          </div>

        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-fb-yellow text-xs font-black">YÜKLENİYOR...</div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="Kayıtlı bülten abonesi yok."
          text="Henüz kriterlerinize uygun bülten abonesi bulunamadı."
          icon={<Mail size={20} />}
        />
      ) : (
        <div className="rounded-2xl border border-white/[0.06] overflow-hidden bg-fb-card text-left">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[750px]">
              <thead>
                <tr className="border-b border-white/[0.06] bg-[#0c1223]/60 text-[10px] font-black uppercase text-fb-muted tracking-widest">
                  <th className="p-4 pl-6">Abone Adı</th>
                  <th className="p-4">E-posta adresi</th>
                  <th className="p-4">İlgi Alanları</th>
                  <th className="p-4">Kaynak</th>
                  <th className="p-4">Durum</th>
                  <th className="p-4">Kayıt Tarihi</th>
                  <th className="p-4 text-right pr-6">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filtered.map(s => (
                  <tr key={s.id} className="hover:bg-white/[0.01] transition-colors">
                    <td className="p-4 pl-6 text-xs font-black text-white">{s.name || '-'}</td>
                    <td className="p-4 text-xs font-semibold text-slate-300">{s.email}</td>
                    <td className="p-4 text-xs">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {Array.isArray(s.interests) && s.interests.length > 0 ? (
                          s.interests.map((interest: string, i: number) => (
                            <span key={i} className="text-[10px] bg-slate-800 text-slate-300 font-bold px-1.5 py-0.5 rounded">
                              {interest}
                            </span>
                          ))
                        ) : (
                          <span className="text-fb-muted text-[10px]">-</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-xs font-mono text-fb-muted">{s.source || '-'}</td>
                    <td className="p-4 text-xs">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        s.status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {s.status === 'active' ? 'AKTİF' : 'AYRILDI'}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-slate-300 font-mono font-semibold">
                      {s.subscribedAt ? formatDate(s.subscribedAt) : 'Belirtilmemiş'}
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {s.status === 'active' ? (
                          <button
                            onClick={() => handleUpdateStatus(s.id, s.email, 'unsubscribed')}
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/10 cursor-pointer"
                            title="Abonelikten Çıkar"
                          >
                            <UserX size={13} />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUpdateStatus(s.id, s.email, 'active')}
                            className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/10 cursor-pointer"
                            title="Yeniden Aktifleştir"
                          >
                            <UserCheck size={13} />
                          </button>
                        )}
                        <button
                          onClick={() => handleTriggerDelete(s.id, s.email)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-500/20 text-red-500 border border-white/5 cursor-pointer"
                          title="Kalıcı Sil"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CONFIRMATION DRAWER */}
      <DeleteConfirmModal
        isOpen={!!deleteData}
        onClose={() => setDeleteData(null)}
        onConfirm={executeDelete}
        title="Bu aboneyi kalıcı olarak silmek istediğine emin misin?"
        message={`"${deleteData?.email}" adresi veritabanından kalıcı olarak silinecektir. Bu eylem geri alınamaz.`}
      />
    </div>
  );
};
