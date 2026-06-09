import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { 
  BarChart3, 
  Plus, 
  Trash2, 
  Save, 
  X, 
  RefreshCcw, 
  CheckCircle, 
  PlusCircle, 
  MinusCircle,
  HelpCircle,
  Search,
  Edit
} from 'lucide-react';
import { dbGetCollection, dbUpsertDocument, dbAddDocument, dbDeleteDocument } from '../../lib/dbService';
import { DeleteConfirmModal, EmptyState, StatusBadge } from './AdminCommon';
import { formatDate } from '../../lib/adminHelpers';

interface AdminPollsProps {
  showToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
  initiateCreate?: boolean;
}

export const AdminPolls: React.FC<AdminPollsProps> = ({ showToast, initiateCreate }) => {
  const [polls, setPolls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  // Form State
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [question, setQuestion] = useState('');
  const [status, setStatus] = useState('active');
  const [options, setOptions] = useState<string[]>(['Galibiyet', 'Beraberlik', 'Mağlubiyet']);
  const [isDirty, setIsDirty] = useState(false);

  // Modals state
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [resetPollId, setResetPollId] = useState<any | null>(null);

  const loadData = async () => {
    setLoading(true);
    const list = await dbGetCollection('polls');
    setPolls(list);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (initiateCreate && !formOpen) {
      openNew();
    }
  }, [initiateCreate]);

  const handleCloseFormAttempt = () => {
    if (isDirty) {
      const leave = window.confirm("Kaydedilmemiş değişiklikler var. Sayfadan ayrılmak istediğine emin misiniz?");
      if (!leave) return;
    }
    setFormOpen(false);
    setEditingId(null);
    setIsDirty(false);
  };

  const handleAddOption = () => {
    setIsDirty(true);
    setOptions([...options, '']);
  };

  const handleRemoveOption = (idx: number) => {
    setIsDirty(true);
    const list = [...options];
    list.splice(idx, 1);
    setOptions(list);
  };

  const handleOptionTextChange = (idx: number, val: string) => {
    setIsDirty(true);
    const list = [...options];
    list[idx] = val;
    setOptions(list);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question) {
      alert("Lütfen anket sorusunu yazın.");
      return;
    }

    const filteredOptions = options.map(o => o.trim()).filter(Boolean);
    if (filteredOptions.length < 2) {
      alert("En az 2 geçerli seçenek eklemelisiniz.");
      return;
    }

    const defaultVotesArray = filteredOptions.map(() => 0);

    const compiledData = {
      question,
      status,
      options: filteredOptions,
      votes: editingId ? (polls.find(p => p.id === editingId)?.votes || defaultVotesArray) : defaultVotesArray,
      voters: editingId ? (polls.find(p => p.id === editingId)?.voters || []) : [],
      updatedAt: new Date().toISOString()
    };

    if (compiledData.votes.length !== compiledData.options.length) {
      compiledData.votes = compiledData.options.map(() => 0);
      compiledData.voters = [];
    }

    try {
      if (editingId) {
        await dbUpsertDocument('polls', editingId, compiledData);
        if (showToast) showToast("Anket başarıyla güncellendi.", "success");
      } else {
        await dbAddDocument('polls', {
          ...compiledData,
          id: `poll-${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date().toISOString()
        });
        if (showToast) showToast("Yeni anket başarıyla oluşturuldu.", "success");
      }

      setFormOpen(false);
      setEditingId(null);
      setIsDirty(false);
      loadData();
    } catch (err) {
      console.error(err);
      if (showToast) showToast("Anket kaydedilirken hata oluştu.", "error");
    }
  };

  const startEdit = (p: any) => {
    setEditingId(p.id);
    setQuestion(p.question || '');
    setStatus(p.status || 'active');
    setOptions(Array.isArray(p.options) ? p.options : ['']);
    setFormOpen(true);
    setIsDirty(false);
  };

  const openNew = () => {
    setEditingId(null);
    setQuestion('');
    setStatus('active');
    setOptions(['Karşılaşmayı Kazanırız', 'Berabere Biter', 'Şanssız Bir Mağlubiyet Alırız']);
    setFormOpen(true);
    setIsDirty(false);
  };

  const executeDelete = async () => {
    if (!deleteId) return;
    try {
      await dbDeleteDocument('polls', deleteId);
      if (showToast) showToast("Anket başarıyla kaldırıldı.", "success");
      loadData();
    } catch (err) {
      console.error(err);
      if (showToast) showToast("Anket silinirken hata oluştu.", "error");
    } finally {
      setDeleteId(null);
    }
  };

  const executeResetVotes = async () => {
    if (!resetPollId) return;
    try {
      const poll = polls.find(p => p.id === resetPollId);
      if (!poll) return;
      const clearedVotes = poll.options.map(() => 0);
      await dbUpsertDocument('polls', resetPollId, {
        votes: clearedVotes,
        voters: []
      });
      if (showToast) showToast("Anket oyları başarıyla sıfırlandı.", "info");
      loadData();
      
      // If we are currently editing this poll, reload the states too
      if (editingId === resetPollId) {
        setIsDirty(false);
      }
    } catch (err) {
      console.error(err);
      if (showToast) showToast("Sıfırlama işlemi başarısız.", "error");
    } finally {
      setResetPollId(null);
    }
  };

  const togglePollStatus = async (poll: any) => {
    const nextStatus = poll.status === 'active' ? 'closed' : 'active';
    try {
      await dbUpsertDocument('polls', poll.id, { status: nextStatus });
      if (showToast) {
        showToast(nextStatus === 'active' ? "Anket yeniden açıldı." : "Anket oylamaya kapatıldı.", "success");
      }
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const filtered = polls.filter(p => {
    const matchesSearch = p.question?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'All' || p.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
        <div>
          <h2 className="text-xl font-display font-black text-white uppercase italic tracking-wide flex items-center gap-2">
            <BarChart3 className="text-fb-yellow" size={20} /> Taraftar Nabzı & Anketler
          </h2>
          <p className="text-xs text-slate-400">Taraftarların katıldığı anlık nabız anketlerini, seçenekleri ve oyları yönetin.</p>
        </div>
        {!formOpen && (
          <button
            onClick={openNew}
            className="px-5 py-2.5 bg-fb-yellow hover:bg-white text-fb-navy font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
          >
            <Plus size={16} /> Yeni Anket Oluştur
          </button>
        )}
      </div>

      {formOpen ? (
        <motion.form
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSave}
          className="p-6 rounded-2xl bg-fb-card border border-white/[0.08] space-y-6 text-left"
        >
          <div className="flex items-center justify-between pb-4 border-b border-white/5">
            <h3 className="text-xs font-black uppercase tracking-widest text-fb-yellow">
              {editingId ? 'ANKET SORUSU VE PARAMETLERİ DÜZENLE' : 'YENİ TARAFTAR ANKETİ OLUŞTUR'}
            </h3>
            <button
              type="button"
              onClick={handleCloseFormAttempt}
              className="p-1 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black uppercase text-slate-400">Anket Sorusu / Başlık *</label>
              <input
                type="text"
                required
                value={question}
                onChange={(e) => {
                  setIsDirty(true);
                  setQuestion(e.target.value);
                }}
                placeholder="Örn: Sizce Mourinho orta sahada kime şans vermeli?"
                className="px-4 py-3 bg-fb-dark border border-white/15 rounded-xl text-xs text-white placeholder-slate-500 font-bold"
              />
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] font-black uppercase text-slate-400">Oylama Seçenekleri (En Az 2 Adet)</label>
                <button
                  type="button"
                  onClick={handleAddOption}
                  className="text-fb-yellow hover:underline text-[10px] font-bold uppercase cursor-pointer"
                >
                  + Yeni Seçenek Ekle
                </button>
              </div>

              <div className="space-y-2">
                {options.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <span className="text-xs text-fb-muted font-bold w-6">{idx + 1}.</span>
                    <input
                      type="text"
                      required
                      value={opt}
                      onChange={(e) => handleOptionTextChange(idx, e.target.value)}
                      placeholder={`Seçenek ${idx + 1}`}
                      className="flex-1 px-4 py-2 bg-fb-dark border border-white/10 rounded-lg text-xs text-white"
                    />
                    <button
                      type="button"
                      disabled={options.length <= 2}
                      onClick={() => handleRemoveOption(idx)}
                      className="p-2 text-red-500 hover:text-red-400 disabled:opacity-30 cursor-pointer"
                    >
                      <MinusCircle size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black uppercase text-slate-400">Anket Durumu</label>
                <select
                  value={status}
                  onChange={(e) => {
                    setIsDirty(true);
                    setStatus(e.target.value);
                  }}
                  className="px-3 py-2.5 bg-fb-dark border border-white/15 rounded-xl text-xs text-white [&>option]:bg-fb-card w-full"
                >
                  <option value="active">Aktif (Oy Verilebilir)</option>
                  <option value="closed">Kapalı (Sadece Sonuçları Göster)</option>
                </select>
              </div>

              {editingId && (
                <div className="flex flex-col justify-end">
                  <button
                    type="button"
                    onClick={() => setResetPollId(editingId)}
                    className="py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/10 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <RefreshCcw size={14} /> Taraftar Oylarını Sıfırla
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-white/5 flex justify-end gap-3.5">
            <button
              type="button"
              onClick={handleCloseFormAttempt}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-400 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer"
            >
              İptal Geri Dön
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-fb-yellow hover:bg-white text-fb-navy rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 cursor-pointer shadow-md"
            >
              <Save size={14} /> ANKETİ KAYDET
            </button>
          </div>
        </motion.form>
      ) : (
        <div className="space-y-4 text-left">
          {/* SEARCH & FILTERS */}
          <div className="p-4 rounded-xl bg-fb-card border border-white/[0.05] flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-fb-muted" />
              <input
                type="text"
                placeholder="Anket sorusunda ara..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-fb-dark border border-white/10 text-xs text-white placeholder-fb-muted focus:outline-none"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-fb-dark border border-[#ffffff]/10 text-xs px-2.5 py-2 rounded-xl text-slate-300 w-full sm:w-44 focus:outline-none"
            >
              <option value="All">Tüm Anketler</option>
              <option value="active">Oylaması Aktifler</option>
              <option value="closed">Pasif Sonlanmışlar</option>
            </select>
          </div>

          {/* DYNAMIC LIST */}
          {loading ? (
            <div className="text-center py-20 text-fb-yellow text-xs font-black">ANKETLER ALINIYOR...</div>
          ) : filtered.length === 0 ? (
            <EmptyState
              title="Aktif anket bulunmuyor."
              text="Taraftarların katılım sağlayacağı ilk nabız veya eşleşme tahmin anketini şimdi yayınlayın."
              buttonLabel="Hemen Anket Oluştur"
              onButtonClick={openNew}
              icon={<BarChart3 size={20} />}
            />
          ) : (
            <div className="rounded-2xl border border-white/[0.06] overflow-hidden bg-fb-card">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left min-w-[700px]">
                  <thead>
                    <tr className="border-b border-white/[0.06] bg-[#0c1223]/60 text-[10px] font-black uppercase text-fb-muted tracking-widest">
                      <th className="p-4 pl-6">Anket Sorusu / Başlık</th>
                      <th className="p-4">Seçenek Sayısı</th>
                      <th className="p-4">Toplam Oy</th>
                      <th className="p-4">Durum</th>
                      <th className="p-4 text-center">Hızlı İşlem</th>
                      <th className="p-4 pr-6 text-right">Eylemler</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {filtered.map((poll) => {
                      const totalVotes = Array.isArray(poll.votes) 
                        ? poll.votes.reduce((a: number, b: number) => a + b, 0)
                        : 0;
                      return (
                        <tr key={poll.id} className="hover:bg-white/[0.01] transition-all">
                          <td className="p-4 pl-6">
                            <div>
                              <h4 className="text-xs font-black text-white">{poll.question}</h4>
                              <p className="text-[10px] text-fb-muted mt-0.5">ID: {poll.id}</p>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="text-xs font-black text-slate-300">
                              {Array.isArray(poll.options) ? poll.options.length : 0} Seçenek
                            </span>
                          </td>
                          <td className="p-4">
                            <span className="text-xs text-fb-yellow font-black font-mono">{totalVotes} Taraftar</span>
                          </td>
                          <td className="p-4">
                            <StatusBadge status={poll.status} />
                          </td>
                          <td className="p-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                type="button"
                                onClick={() => togglePollStatus(poll)}
                                className={`px-2 py-1 text-[9px] font-black uppercase border rounded transition-colors ${
                                  poll.status === 'active'
                                    ? 'bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/20'
                                    : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20'
                                }`}
                              >
                                {poll.status === 'active' ? 'Kapat' : 'Tekrar Aç'}
                              </button>
                              <button
                                type="button"
                                onClick={() => setResetPollId(poll.id)}
                                className="p-1 rounded bg-white/5 border border-white/10 text-slate-300 hover:bg-red-500/10 hover:text-red-400 cursor-pointer"
                                title="Oyları Temizle"
                              >
                                <RefreshCcw size={12} />
                              </button>
                            </div>
                          </td>
                          <td className="p-4 pr-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => startEdit(poll)}
                                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 hover:text-fb-yellow text-slate-300 border border-white/10 cursor-pointer"
                                title="Seçenekleri Düzenle"
                              >
                                <Edit size={14} />
                              </button>
                              <button
                                onClick={() => setDeleteId(poll.id)}
                                className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/10 cursor-pointer"
                                title="Anketi Kaldır"
                              >
                                <Trash2 size={14} />
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
        </div>
      )}

      {/* CONFIRMATION DRAWER */}
      <DeleteConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={executeDelete}
        title="Bu anketi taraftar odasından kaldırmak istediğine emin misin?"
        message="Bu işlem geri alınamaz ve tüm kümülatif oy birikimleri silinecektir."
      />

      {/* RESET CONFIRMATION */}
      <DeleteConfirmModal
        isOpen={!!resetPollId}
        onClose={() => setResetPollId(null)}
        onConfirm={executeResetVotes}
        title="Anket oylarını sıfırlamak istediğine emin misin?"
        message="Bu işlem ile tüm taraftarların vermiş olduğu oylar sıfırlanacak ve adaylar oy hakkını yeniden kazanacaktır."
      />
    </div>
  );
};
export default AdminPolls;
