import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mail, 
  Trash2, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  MessageSquare, 
  Filter, 
  Eye, 
  Archive, 
  Check, 
  CornerUpLeft, 
  ExternalLink, 
  Clock, 
  Briefcase, 
  DollarSign, 
  Globe, 
  X 
} from 'lucide-react';
import { dbGetCollection, dbDeleteDocument, dbUpsertDocument } from '../../lib/dbService';
import { formatDate } from '../../lib/adminHelpers';
import { DeleteConfirmModal, EmptyState } from './AdminCommon';

interface AdminMessagesProps {
  showToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const AdminMessages: React.FC<AdminMessagesProps> = ({ showToast }) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMsg, setSelectedMsg] = useState<any | null>(null);

  // Search and Filters
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all'); // all, genel, geri-bildirim, icerik-onerisi, sponsor-reklam, is-birligi, premium
  const [statusFilter, setStatusFilter] = useState('all'); // all, new, read, replied, archived

  // Delete Confirmation Modal
  const [deleteData, setDeleteData] = useState<{ id: string; name: string } | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const list = await dbGetCollection('contactMessages');
      setMessages(list);
    } catch (err) {
      console.error("Error loading contact messages:", err);
      if (showToast) showToast("Mesaj kayıtları yüklenirken hata oluştu.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await dbUpsertDocument('contactMessages', id, { 
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
      if (showToast) {
        const text = newStatus === 'read' ? 'Okundu işaretlendi' : 
                     newStatus === 'replied' ? 'Cevaplandı işaretlendi' : 'Arşivlendi';
        showToast(`Mesaj durumu '${text}' olarak güncellendi.`, "success");
      }
      loadData();
      if (selectedMsg && selectedMsg.id === id) {
        setSelectedMsg((prev: any) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      console.error(err);
      if (showToast) showToast("Mesaj durumu güncellenirken hata oluştu.", "error");
    }
  };

  const executeDelete = async () => {
    if (!deleteData) return;
    try {
      await dbDeleteDocument('contactMessages', deleteData.id);
      if (showToast) showToast(`"${deleteData.name}" adlı kullanıcının mesajı başarıyla silindi.`, "success");
      loadData();
      if (selectedMsg && selectedMsg.id === deleteData.id) {
        setSelectedMsg(null);
      }
    } catch (err) {
      console.error(err);
      if (showToast) showToast("Mesaj silinirken hata oluştu.", "error");
    } finally {
      setDeleteData(null);
    }
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case 'genel': return 'Genel Mesaj';
      case 'geri-bildirim': return 'Geri Bildirim';
      case 'icerik-onerisi': return 'İçerik Önerisi';
      case 'sponsor-reklam': return 'Sponsor / Reklam';
      case 'is-birligi': return 'İş Birliği';
      case 'premium': return 'Premium Hakkında';
      default: return type || 'Genel';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return (
          <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
            Yeni
          </span>
        );
      case 'read':
        return (
          <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/25">
            Okundu
          </span>
        );
      case 'replied':
        return (
          <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg bg-fb-yellow/10 text-[#FFB020] border border-fb-yellow/20">
            Cevaplandı
          </span>
        );
      case 'archived':
        return (
          <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg bg-white/5 text-slate-400 border border-white/5">
            Arşivlendi
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg bg-white/5 text-slate-300">
            {status}
          </span>
        );
    }
  };

  // Filter messages
  const filtered = messages.filter(m => {
    const matchesSearch = 
      m.name?.toLowerCase().includes(search.toLowerCase()) ||
      m.email?.toLowerCase().includes(search.toLowerCase()) ||
      m.subject?.toLowerCase().includes(search.toLowerCase()) ||
      m.message?.toLowerCase().includes(search.toLowerCase());

    const matchesType = typeFilter === 'all' || m.messageType === typeFilter;
    const matchesStatus = statusFilter === 'all' || m.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
        <div>
          <h2 className="text-xl font-display font-black text-white uppercase italic tracking-wide flex items-center gap-2">
            <MessageSquare className="text-fb-yellow" size={20} /> İletişim / Geri Bildirim Mesajları
          </h2>
          <p className="text-xs text-fb-muted">Kullanıcıların, sponsorların ve iş ortaklarının portalımıza gönderdiği tüm talepleri yönetin.</p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
        <div className="p-4 rounded-xl bg-fb-card border border-white/[0.04] border-l-4 border-l-emerald-400">
          <span className="text-[10px] text-fb-muted font-black uppercase tracking-wider block">Yeni Yanıtlanmamış</span>
          <div className="text-2xl font-black text-white mt-1 font-display">
            {messages.filter(m => m.status === 'new').length} Mesaj
          </div>
        </div>

        <div className="p-4 rounded-xl bg-fb-card border border-white/[0.04] border-l-4 border-l-fb-yellow">
          <span className="text-[10px] text-fb-muted font-black uppercase tracking-wider block">Sponsor / Reklam</span>
          <div className="text-2xl font-black text-white mt-1 font-display">
            {messages.filter(m => m.messageType === 'sponsor-reklam').length} Talep
          </div>
        </div>

        <div className="p-4 rounded-xl bg-fb-card border border-white/[0.04] border-l-4 border-l-blue-400">
          <span className="text-[10px] text-fb-muted font-black uppercase tracking-wider block">Cevaplanan Mesaj</span>
          <div className="text-2xl font-black text-white mt-1 font-display">
            {messages.filter(m => m.status === 'replied').length} Adet
          </div>
        </div>

        <div className="p-4 rounded-xl bg-fb-card border border-white/[0.04]">
          <span className="text-[10px] text-fb-muted font-black uppercase tracking-wider block">Toplam Mesaj</span>
          <div className="text-2xl font-black text-white mt-1 font-display">
            {messages.length} Kayıt
          </div>
        </div>
      </div>

      {/* Filters Area */}
      <div className="p-5 rounded-2xl bg-fb-card border border-white/[0.05] flex flex-col md:flex-row gap-4 items-center text-left">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-3 w-4 h-4 text-fb-muted" />
          <input
            type="text"
            placeholder="İsim, mail veya başlıkta ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-fb-dark border border-white/10 text-xs text-white placeholder-fb-muted focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap gap-3 items-center w-full md:w-auto">
          {/* Message Type Filter */}
          <div className="flex items-center gap-1.5 bg-fb-dark px-3 py-1.5 rounded-xl border border-white/10">
            <Filter size={11} className="text-fb-yellow" />
            <span className="text-[10px] font-black text-slate-400 uppercase font-mono">TÜR:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-transparent text-xs text-white focus:outline-none pr-1 font-bold cursor-pointer"
            >
              <option value="all">Tüm Türler</option>
              <option value="genel">Genel Mesaj</option>
              <option value="geri-bildirim">Geri Bildirim</option>
              <option value="icerik-onerisi">İçerik Önerisi</option>
              <option value="sponsor-reklam">Sponsor / Reklam</option>
              <option value="is-birligi">İş Birliği</option>
              <option value="premium">Premium Hakkında</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-fb-dark px-3 py-1.5 rounded-xl border border-white/10">
            <CheckCircle2 size={11} className="text-fb-yellow" />
            <span className="text-[10px] font-black text-slate-400 uppercase font-mono">DURUM:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-xs text-white focus:outline-none pr-1 font-bold cursor-pointer"
            >
              <option value="all">Tüm Durumlar</option>
              <option value="new">Yeni</option>
              <option value="read">Okundu</option>
              <option value="replied">Cevaplandı</option>
              <option value="archived">Arşivlendi</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Data Table */}
      {loading ? (
        <div className="text-center py-24 text-fb-yellow text-xs font-black uppercase tracking-widest">YÜKLENİYOR...</div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="Gelen mesaj bulunamadı."
          text="Arama kriterinize uygun veya sisteme kayıtlı bir iletişim mesajı bulunmamaktadır."
          icon={<MessageSquare size={20} />}
        />
      ) : (
        <div className="rounded-2xl border border-white/[0.06] overflow-hidden bg-fb-card text-left">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[900px]">
              <thead>
                <tr className="border-b border-white/[0.06] bg-[#0c1223]/60 text-[10px] font-black uppercase text-fb-muted tracking-widest h-12">
                  <th className="p-4 pl-6">Gönderen</th>
                  <th className="p-4">Mesaj Türü</th>
                  <th className="p-4">Konu Başlığı</th>
                  <th className="p-4">Gönderim Tarihi</th>
                  <th className="p-4">Durum</th>
                  <th className="p-4 text-right pr-6 w-[240px]">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filtered.map(m => {
                  const isNew = m.status === 'new';
                  return (
                    <tr 
                      key={m.id} 
                      className={`hover:bg-white/[0.01] transition-colors ${isNew ? 'bg-fb-yellow/[0.01] border-l-2 border-l-fb-yellow' : ''}`}
                    >
                      {/* Submittor */}
                      <td className="p-4 pl-6 text-xs text-slate-200">
                        <div className="font-black text-white">{m.name}</div>
                        <div className="text-[10px] text-fb-muted font-mono font-semibold mt-0.5">{m.email}</div>
                      </td>

                      {/* Type */}
                      <td className="p-4 text-xs font-bold text-slate-300">
                        <span className="px-2 py-1 rounded bg-white/5 border border-white/5 text-[10px]">
                          {getTypeName(m.messageType)}
                        </span>
                      </td>

                      {/* Subject */}
                      <td className="p-4 text-xs font-black text-white truncate max-w-[200px]">
                        {m.subject || 'Destek Talebi'}
                      </td>

                      {/* Date */}
                      <td className="p-4 text-xs text-slate-300 font-mono font-semibold">
                        {formatDate(m.createdAt)}
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        {getStatusBadge(m.status)}
                      </td>

                      {/* Actions */}
                      <td className="p-4 pr-6 text-right w-[240px]">
                        <div className="flex items-center gap-2 justify-end">
                          <button
                            onClick={() => {
                              setSelectedMsg(m);
                              if (m.status === 'new') {
                                handleUpdateStatus(m.id, 'read');
                              }
                            }}
                            className="p-1.5 rounded-lg bg-fb-yellow/5 hover:bg-fb-yellow/10 text-fb-yellow border border-fb-yellow/10 cursor-pointer text-[10px] font-bold uppercase tracking-wider flex items-center gap-1"
                            title="Detayları Oku"
                          >
                            <Eye size={12} /> OKU
                          </button>

                          {m.status !== 'replied' && (
                            <button
                              onClick={() => handleUpdateStatus(m.id, 'replied')}
                              className="p-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/10 cursor-pointer"
                              title="Cevaplandı İşaretle"
                            >
                              <Check size={12} />
                            </button>
                          )}

                          {m.status !== 'archived' && (
                            <button
                              onClick={() => handleUpdateStatus(m.id, 'archived')}
                              className="p-1.5 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/10 cursor-pointer"
                              title="Arşive Kaldır"
                            >
                              <Archive size={12} />
                            </button>
                          )}

                          <button
                            onClick={() => setDeleteData({ id: m.id, name: m.name })}
                            className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/10 cursor-pointer"
                            title="Mesajı Sil"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Message Modal Detail view */}
      <AnimatePresence>
        {selectedMsg && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-fb-card border border-white/[0.08] rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl text-left"
            >
              {/* Header */}
              <div className="p-6 border-b border-white/[0.05] bg-[#0c1223]/55 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono font-black text-fb-yellow uppercase tracking-widest">{getTypeName(selectedMsg.messageType)}</span>
                  <h3 className="text-base font-black text-white uppercase mt-1">{selectedMsg.subject || 'Destek Talebi'}</h3>
                </div>
                <button 
                  onClick={() => setSelectedMsg(null)}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                
                {/* Meta details */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-fb-dark border border-white/5 space-y-1">
                    <span className="text-[9px] text-fb-muted font-black uppercase block font-mono">GÖNDEREN BİLGİSİ</span>
                    <div className="text-xs font-black text-white">{selectedMsg.name}</div>
                    <div className="text-[10px] text-fb-yellow font-mono break-all">{selectedMsg.email}</div>
                  </div>

                  <div className="p-4 rounded-xl bg-fb-dark border border-white/5 space-y-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[9px] text-fb-muted font-black block font-mono">TARİH & SAAT</span>
                      <div className="text-xs font-semibold text-slate-300 font-mono mt-1">{formatDate(selectedMsg.createdAt)}</div>
                    </div>
                    <div className="flex gap-2.5 items-center mt-2 pt-1 border-t border-white/[0.03]">
                      <span className="text-[10px] text-fb-muted font-semibold">Mevcut Durum:</span> 
                      {getStatusBadge(selectedMsg.status)}
                    </div>
                  </div>
                </div>

                {/* Conditional Corporate section */}
                {selectedMsg.messageType === 'sponsor-reklam' && (
                  <div className="p-5 rounded-2xl bg-fb-yellow/5 border border-fb-yellow/15 space-y-3">
                    <div className="text-xs font-black text-fb-yellow uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-fb-yellow/10">
                      <Briefcase size={14} /> KURUMSAL REKLAM DETAYI
                    </div>
                    <div className="grid sm:grid-cols-3 gap-4">
                      <div>
                        <span className="text-[9px] text-fb-muted font-black block uppercase">Şirket Adı</span>
                        <span className="text-xs font-black text-white mt-1 block">{selectedMsg.companyName || 'Belirtilmemiş'}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-fb-muted font-black block uppercase">Web Sitesi</span>
                        {selectedMsg.websiteUrl ? (
                          <a href={selectedMsg.websiteUrl} target="_blank" rel="noreferrer" className="text-xs font-bold text-[#FFB020] hover:underline mt-1 block flex items-center gap-1 leading-none font-mono">
                            Link <ExternalLink size={10} />
                          </a>
                        ) : (
                          <span className="text-xs text-slate-500 mt-1 block">Yok</span>
                        )}
                      </div>
                      <div>
                        <span className="text-[9px] text-fb-muted font-black block uppercase">Tahmini Bütçe</span>
                        <span className="text-xs font-black text-white mt-1 block flex items-center gap-1 text-emerald-400">
                          {selectedMsg.budgetRange || 'Bilinmiyor'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Actual Message Text */}
                <div className="space-y-2">
                  <span className="text-[9px] text-fb-muted font-black uppercase block font-mono">GÖNDERİLEN MESAJ METNİ</span>
                  <div className="p-5 rounded-2xl bg-fb-dark border border-white/5 text-xs text-slate-200 leading-relaxed max-h-[300px] overflow-y-auto whitespace-pre-line text-justify font-semibold">
                    {selectedMsg.message}
                  </div>
                </div>

              </div>

              {/* Footer CTA */}
              <div className="p-6 border-t border-white/[0.05] bg-[#0c1223]/55 flex flex-wrap gap-3 justify-between items-center">
                
                {/* Status action switches */}
                <div className="flex gap-2">
                  {selectedMsg.status !== 'replied' && (
                    <button
                      onClick={() => handleUpdateStatus(selectedMsg.id, 'replied')}
                      className="px-3 py-1.5 bg-fb-yellow/10 hover:bg-fb-yellow/20 text-[#FFB020] border border-fb-yellow/20 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer"
                    >
                      Cevaplandı Yap
                    </button>
                  )}
                  {selectedMsg.status !== 'archived' && (
                    <button
                      onClick={() => handleUpdateStatus(selectedMsg.id, 'archived')}
                      className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-400 border border-white/5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer"
                    >
                      Arşivle
                    </button>
                  )}
                </div>

                {/* Email Reply button */}
                <a 
                  href={`mailto:${selectedMsg.email}?subject=Re: ${encodeURIComponent(selectedMsg.subject || 'Fenerbahçe Evreni Destek')}&body=Merhaba ${encodeURIComponent(selectedMsg.name)},%0D%0A%0D%0AFenerbahçe Evreni portalına iletmiş olduğunuz mesajınızı aldık.%0D%0A%0D%0A---%0D%0AYazmış olduğunuz mesaj:%0D%0A"${encodeURIComponent(selectedMsg.message)}"%0D%0A---%0D%0A%0D%0A`}
                  className="px-5 py-2.5 bg-fb-yellow hover:bg-white text-fb-navy font-black text-[11px] uppercase tracking-widest rounded-xl transition-all shadow-md flex items-center gap-2"
                >
                  <CornerUpLeft size={13} /> E-POSTA İLE CEVAPLA
                </a>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal */}
      {deleteData && (
        <DeleteConfirmModal
          title="Mesajı Sil"
          text={`"${deleteData.name}" adlı kullanıcının göndermiş olduğu bu mesajı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`}
          onConfirm={executeDelete}
          onCancel={() => setDeleteData(null)}
        />
      )}

    </div>
  );
};
