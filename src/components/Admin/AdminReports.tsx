import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  ShieldAlert, 
  FileCheck,
  Award,
  Eye,
  PlusCircle,
  MinusCircle,
  FileText
} from 'lucide-react';
import { dbGetCollection, dbUpsertDocument, dbAddDocument, dbDeleteDocument } from '../../lib/dbService';
import { generateSlug, formatDate } from '../../lib/adminHelpers';
import { DeleteConfirmModal, EmptyState, PDFPreview, StatusBadge, ContentPreviewModal } from './AdminCommon';

interface AdminReportsProps {
  showToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
  initiateCreate?: boolean;
}

export const AdminReports: React.FC<AdminReportsProps> = ({ showToast, initiateCreate }) => {
  const [reports, setReports] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  // Form State
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  const [form, setForm] = useState({
    matchId: '',
    title: '',
    slug: '',
    summary: '',
    matchStory: '',
    turningPoint: '',
    tacticalPositives: '',
    tacticalNegatives: '',
    coachDecisions: '',
    fanMotm: '',
    nextMatchNotes: '',
    isPremium: true,
    pdfUrl: '',
    status: 'draft',
    scheduledAt: '',
    createdAt: '',
    updatedAt: ''
  });

  // Dynamic Ratings Array
  const [ratings, setRatings] = useState<any[]>([
    { name: '', position: '', rating: 6.0, comment: '' }
  ]);

  // Modal State triggers
  const [deleteData, setDeleteData] = useState<{ id: string; relatedMatchId: string } | null>(null);
  const [previewItem, setPreviewItem] = useState<any | null>(null);

  const loadData = async () => {
    setLoading(true);
    const list = await dbGetCollection('matchReports');
    const mList = await dbGetCollection('matches');
    setReports(list);
    setMatches(mList);
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
      const confirmLeave = window.confirm("Kaydedilmemiş değişiklikler var. Sayfadan ayrılmak istediğine emin misiniz?");
      if (!confirmLeave) return;
    }
    setFormOpen(false);
    setEditingId(null);
    setIsDirty(false);
  };

  const handleTitleChange = (title: string) => {
    setIsDirty(true);
    setForm(prev => {
      const calculatedSlug = slugManuallyEdited ? prev.slug : generateSlug(title);
      return {
        ...prev,
        title,
        slug: calculatedSlug
      };
    });
  };

  const handleSlugFieldChange = (slugValue: string) => {
    setIsDirty(true);
    setSlugManuallyEdited(true);
    setForm(prev => ({
      ...prev,
      slug: slugValue
    }));
  };

  const handleFormValueChange = (field: string, val: any) => {
    setIsDirty(true);
    setForm(prev => ({
      ...prev,
      [field]: val
    }));
  };

  const handleRatingChange = (index: number, fld: string, val: any) => {
    setIsDirty(true);
    const copy = [...ratings];
    copy[index] = { ...copy[index], [fld]: val };
    setRatings(copy);
  };

  const addRatingRow = () => {
    setIsDirty(true);
    setRatings([...ratings, { name: '', position: 'CM', rating: 6.0, comment: '' }]);
  };

  const removeRatingRow = (index: number) => {
    setIsDirty(true);
    if (ratings.length <= 1) return;
    setRatings(ratings.filter((_, idx) => idx !== index));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.matchId) {
      alert("Lütfen ilişkili maçı seçiniz.");
      return;
    }
    if (!form.title) {
      alert("Lütfen rapor başlığı girin.");
      return;
    }

    const compiledData = {
      ...form,
      playerRatings: ratings,
      updatedAt: new Date().toISOString()
    };

    try {
      if (editingId) {
        await dbUpsertDocument('matchReports', editingId, compiledData);
        if (showToast) showToast("Maç raporu başarıyla güncellendi.", "success");
      } else {
        const newId = `rep-${Math.random().toString(36).substr(2, 9)}`;
        await dbAddDocument('matchReports', {
          ...compiledData,
          id: newId,
          createdAt: new Date().toISOString()
        });

        // Update match with reportId link
        await dbUpsertDocument('matches', form.matchId, { reportId: newId });
        if (showToast) showToast("Maç raporu oluşturuldu ve karşılaşmaya bağlandı.", "success");
      }

      setFormOpen(false);
      setEditingId(null);
      setIsDirty(false);
      loadData();
    } catch (err) {
      console.error(err);
      if (showToast) showToast("Rapor kaydedilirken hata oluştu.", "error");
    }
  };

  const startEdit = (rep: any) => {
    setEditingId(rep.id);
    setSlugManuallyEdited(true);
    setForm({
      matchId: rep.matchId || '',
      title: rep.title || '',
      slug: rep.slug || '',
      summary: rep.summary || '',
      matchStory: rep.matchStory || '',
      turningPoint: rep.turningPoint || '',
      tacticalPositives: rep.tacticalPositives || '',
      tacticalNegatives: rep.tacticalNegatives || '',
      coachDecisions: rep.coachDecisions || '',
      fanMotm: rep.fanMotm || '',
      nextMatchNotes: rep.nextMatchNotes || '',
      isPremium: !!rep.isPremium,
      pdfUrl: rep.pdfUrl || '',
      status: rep.status || 'draft',
      scheduledAt: rep.scheduledAt || '',
      createdAt: rep.createdAt || '',
      updatedAt: rep.updatedAt || ''
    });
    setRatings(Array.isArray(rep.playerRatings) ? rep.playerRatings : [{ name: '', position: 'DM', rating: 6.0, comment: '' }]);
    setFormOpen(true);
    setIsDirty(false);
  };

  const openNew = () => {
    setEditingId(null);
    setSlugManuallyEdited(false);
    setForm({
      matchId: matches[0]?.id || '',
      title: '',
      slug: '',
      summary: '',
      matchStory: '',
      turningPoint: '',
      tacticalPositives: '',
      tacticalNegatives: '',
      coachDecisions: '',
      fanMotm: '',
      nextMatchNotes: '',
      isPremium: true,
      pdfUrl: '',
      status: 'draft',
      scheduledAt: '',
      createdAt: '',
      updatedAt: ''
    });
    setRatings([
      { name: 'Dominik Livaković', position: 'GK', rating: 7.0, comment: 'Kaliteli çizgide kritik kurtarışlar.' },
      { name: 'Fred', position: 'CM', rating: 8.5, comment: 'Sahanın lideriydi, pres yoğunluğunu yönetti.' }
    ]);
    setFormOpen(true);
    setIsDirty(false);
  };

  const executeDelete = async () => {
    if (!deleteData) return;
    try {
      await dbDeleteDocument('matchReports', deleteData.id);
      if (deleteData.relatedMatchId) {
        await dbUpsertDocument('matches', deleteData.relatedMatchId, { reportId: "" });
      }
      if (showToast) showToast("Maç sonu raporu başarıyla silindi.", "success");
      loadData();
    } catch (err) {
      console.error(err);
      if (showToast) showToast("Rapor silinirken bir sorun oluştu.", "error");
    } finally {
      setDeleteData(null);
    }
  };

  const filtered = reports.filter(r => {
    const matchesSearch = r.title?.toLowerCase().includes(search.toLowerCase()) || 
                          r.summary?.toLowerCase().includes(search.toLowerCase()) ||
                          r.slug?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'All' || r.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
        <div>
          <h2 className="text-xl font-display font-black text-white uppercase italic tracking-wide flex items-center gap-2">
            <ShieldAlert className="text-fb-yellow" size={20} /> Maç Sonu Analiz Raporları
          </h2>
          <p className="text-xs text-fb-muted">Oynanan karşılaşmalar için detaylı puan kartları ve taktik analiz dokümanları.</p>
        </div>
        {!formOpen && (
          <button
            onClick={openNew}
            className="px-5 py-2.5 bg-fb-yellow hover:bg-white text-fb-navy font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
          >
            <Plus size={16} /> Yeni Analiz Raporu Yaz
          </button>
        )}
      </div>

      {formOpen ? (
        <motion.form
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSave}
          className="p-6 rounded-2xl bg-fb-card border border-white/[0.08] space-y-8 text-left"
        >
          <div className="flex items-center justify-between pb-4 border-b border-white/5">
            <div className="space-y-1">
              <h3 className="text-xs font-black uppercase tracking-widest text-fb-yellow">
                {editingId ? 'MAÇ RAPORUNU GÜNCELLE' : 'YENİ DETAYLI MAÇ RAPORU YAZ'}
              </h3>
              {isDirty && (
                <span className="text-[10px] text-amber-400 font-bold tracking-wider animate-pulse">⚠️ KAYDEDİLMEMİŞ DEĞİŞİKLİKLER VAR</span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setPreviewItem({
                    title: form.title,
                    excerpt: form.summary,
                    coverImage: '',
                    content: `### MAÇ DETAYLI HİKAYESİ\n${form.matchStory}\n\n### KIRILMA NOKTASI\n${form.turningPoint}\n\n### COACH KARARLARI\n${form.coachDecisions}\n\n### MAÇIN YILDIZI\n${form.fanMotm}`,
                    category: 'Maç Sonu Raporu',
                    tags: '',
                    isPremium: form.isPremium,
                    readingTime: 'Saha Raporu'
                  });
                }}
                className="px-3.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-[10px] uppercase flex items-center gap-1 cursor-pointer"
              >
                <Eye size={12} /> Raporu Önizle
              </button>
              <button
                type="button"
                onClick={handleCloseFormAttempt}
                className="p-1 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* LHS */}
            <div className="space-y-5">
              <span className="text-[10px] font-black text-fb-yellow uppercase tracking-widest block pb-1 border-b border-white/5">1. RAPOR DETAYI VE TAKTİK NOTLAR</span>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase">İLİŞKİLİ MAÇ SEÇİMİ *</label>
                  <select
                    value={form.matchId}
                    onChange={(e) => handleFormValueChange('matchId', e.target.value)}
                    className="px-3 py-2.5 bg-fb-dark border border-white/15 rounded-xl text-xs text-white [&>option]:bg-fb-card w-full"
                  >
                    <option value="">-- Karşılaşma Seçiniz --</option>
                    {matches.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.homeTeam} vs {m.awayTeam} ({m.competition})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase">PREMIUM DURUMU</label>
                  <select
                    className="px-3 py-2.5 bg-fb-dark border border-white/15 rounded-xl text-xs text-white"
                    value={form.isPremium ? 'yes' : 'no'}
                    onChange={(e) => handleFormValueChange('isPremium', e.target.value === 'yes')}
                  >
                    <option value="yes">★ Premium Üyelere Özel</option>
                    <option value="no">Herkes Okuyabilir (Serbest)</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-slate-400 font-bold uppercase">Rapor Başlığı *</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Sezon İçi Taktik Başarı"
                  className="px-4 py-3 bg-fb-dark border border-white/15 rounded-xl text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Rapor URL Slug</label>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) => handleSlugFieldChange(e.target.value)}
                    placeholder="otomatik-slug"
                    className="px-4 py-3 bg-fb-dark border border-white/10 rounded-xl text-xs text-fb-yellow font-mono"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Sahanın Yıldızı (MOTM)</label>
                  <input
                    type="text"
                    value={form.fanMotm}
                    onChange={(e) => handleFormValueChange('fanMotm', e.target.value)}
                    placeholder="Örn: İsmail Yüksek"
                    className="px-4 py-3 bg-fb-dark border border-white/15 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-slate-400 font-bold">PDF Raporu Linki (Opsiyonel)</label>
                <input
                  type="text"
                  value={form.pdfUrl}
                  onChange={(e) => handleFormValueChange('pdfUrl', e.target.value)}
                  placeholder="https://ex.com/taktik_rapor.pdf"
                  className="px-4 py-3 bg-fb-dark border border-white/15 rounded-xl text-xs text-white font-mono"
                />
              </div>

              <PDFPreview url={form.pdfUrl} label="GİRİLEN PDF RAPORU ÖNİZLEME" />

              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-slate-400 font-bold">Özet Çıkarım (Summary)</label>
                <textarea
                  value={form.summary}
                  onChange={(e) => handleFormValueChange('summary', e.target.value)}
                  rows={2}
                  placeholder="Kritik özet analiz..."
                  className="px-4 py-3 bg-fb-dark border border-white/15 rounded-xl text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-slate-400 font-bold">Taktiksel Artılar</label>
                  <textarea
                    value={form.tacticalPositives}
                    onChange={(e) => handleFormValueChange('tacticalPositives', e.target.value)}
                    rows={2}
                    placeholder="Savunmada hatlar arası mesafe daraltıldı..."
                    className="px-4 py-3 bg-fb-dark border border-white/15 rounded-xl text-xs text-white"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-slate-400 font-bold">Taktiksel Eksiler</label>
                  <textarea
                    value={form.tacticalNegatives}
                    onChange={(e) => handleFormValueChange('tacticalNegatives', e.target.value)}
                    rows={2}
                    placeholder="Ofsayt taktiği zamanlaması..."
                    className="px-4 py-3 bg-fb-dark border border-white/15 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-slate-400 font-bold">Maç Hikayesi (Story)</label>
                <textarea
                  value={form.matchStory}
                  onChange={(e) => handleFormValueChange('matchStory', e.target.value)}
                  rows={4}
                  placeholder="Maçın taktiksel kronolojisi..."
                  className="px-4 py-3 bg-fb-dark border border-white/15 rounded-xl text-xs text-white"
                />
              </div>
            </div>

            {/* RHS */}
            <div className="space-y-5 text-left">
              <span className="text-[10px] font-black text-fb-yellow uppercase tracking-widest block pb-1 border-b border-white/5">2. DETAYLI OPTO OYUNCU PUAN KARTLARI</span>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-slate-400">OYUNCU DEĞERLENDİRME LİSTESİ ({ratings.length})</span>
                  <button
                    type="button"
                    onClick={addRatingRow}
                    className="px-3 py-1 bg-fb-yellow/10 border border-fb-yellow/30 text-fb-yellow text-[10px] font-black uppercase rounded hover:bg-fb-yellow hover:text-fb-navy transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Plus size={12} /> Oyuncu Ekle
                  </button>
                </div>

                <div className="space-y-3 max-h-[480px] overflow-y-auto pr-2 bg-fb-dark/25 p-3 rounded-xl border border-white/5">
                  {ratings.map((rate, idx) => (
                    <div key={idx} className="p-3 border border-white/5 bg-fb-dark/80 rounded-xl space-y-3">
                      <div className="grid grid-cols-12 gap-3">
                        <div className="col-span-5">
                          <label className="text-[9px] text-slate-500 font-black block mb-0.5">Oyuncu Adı</label>
                          <input
                            type="text"
                            required
                            placeholder="Örn: Fred"
                            value={rate.name}
                            onChange={(e) => handleRatingChange(idx, 'name', e.target.value)}
                            className="w-full bg-fb-card border border-white/15 rounded p-1.5 text-xs text-white font-bold"
                          />
                        </div>
                        <div className="col-span-3">
                          <label className="text-[9px] text-slate-500 font-black block mb-0.5">Pozisyon</label>
                          <input
                            type="text"
                            placeholder="CM"
                            value={rate.position}
                            onChange={(e) => handleRatingChange(idx, 'position', e.target.value)}
                            className="w-full bg-fb-card border border-white/15 rounded p-1.5 text-xs text-white"
                          />
                        </div>
                        <div className="col-span-3">
                          <label className="text-[9px] text-slate-500 font-black block mb-0.5">Maç Puanı</label>
                          <input
                            type="number"
                            step="0.1"
                            min="1"
                            max="10"
                            required
                            value={rate.rating}
                            onChange={(e) => handleRatingChange(idx, 'rating', Number(e.target.value))}
                            className="w-full bg-fb-card border border-white/15 rounded p-1.5 text-xs text-fb-yellow font-black"
                          />
                        </div>
                        <div className="col-span-1 flex items-end justify-center pb-1">
                          <button
                            type="button"
                            onClick={() => removeRatingRow(idx)}
                            disabled={ratings.length <= 1}
                            className="text-red-500 hover:text-red-400 disabled:opacity-30 cursor-pointer"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="text-[9px] text-slate-500 font-black block mb-0.5">Taktik Performans Yorumu</label>
                        <input
                          type="text"
                          value={rate.comment}
                          onChange={(e) => handleRatingChange(idx, 'comment', e.target.value)}
                          placeholder="Savunma geçişlerinde alan derinliğini korudu..."
                          className="w-full bg-fb-card border border-white/15 rounded p-1.5 text-xs text-slate-300"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-slate-400 font-bold">Maç Kırılma Noktası</label>
                  <textarea
                    value={form.turningPoint}
                    onChange={(e) => handleFormValueChange('turningPoint', e.target.value)}
                    rows={2}
                    placeholder="65. dakikadaki kırmızı kart..."
                    className="px-4 py-3 bg-fb-dark border border-white/15 rounded-xl text-xs text-white"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-slate-400 font-bold">Mourinho Kararları</label>
                  <textarea
                    value={form.coachDecisions}
                    onChange={(e) => handleFormValueChange('coachDecisions', e.target.value)}
                    rows={2}
                    placeholder="Fred'in merkeze kaydırılması oyunu dengeledi..."
                    className="px-4 py-3 bg-fb-dark border border-white/15 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-slate-400 font-bold">Gelecek Maç Taktiksel Ön Notları</label>
                <textarea
                  value={form.nextMatchNotes}
                  onChange={(e) => handleFormValueChange('nextMatchNotes', e.target.value)}
                  rows={2}
                  placeholder="Sarı kart cezalıları sebebiyle stoper kurgusu değişecek..."
                  className="px-4 py-2.5 bg-fb-dark border border-white/15 rounded-xl text-xs text-white"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-4 text-fb-muted text-[10px] font-bold">
            {form.createdAt && (
              <span>📅 Oluşturulma Tarihi: {formatDate(form.createdAt)}</span>
            )}
            {form.updatedAt && (
              <span className="md:text-right">🔄 Son Güncelleme: {formatDate(form.updatedAt)}</span>
            )}
          </div>

          <div className="pt-4 flex flex-wrap justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-black uppercase text-slate-400">YAYIN VE TASLAK AYARI:</span>
              <select
                value={form.status}
                onChange={(e) => handleFormValueChange('status', e.target.value)}
                className="px-3 py-2 bg-fb-dark border border-white/15 rounded-lg text-xs text-white"
              >
                <option value="draft">Taslak Olarak Sakla</option>
                <option value="published">Başarı bülteni yayına aç</option>
                <option value="scheduled">Zamanlanmış Taktik Paylaşımı</option>
              </select>

              {form.status === 'scheduled' && (
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-blue-400 uppercase tracking-wider">TARİH SEÇ:</span>
                  <input
                    type="datetime-local"
                    required
                    value={form.scheduledAt}
                    onChange={(e) => handleFormValueChange('scheduledAt', e.target.value)}
                    className="px-2.5 py-1.5 bg-fb-dark border border-white/15 rounded text-xs text-white"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 ml-auto">
              <button
                type="button"
                onClick={handleCloseFormAttempt}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-400 rounded-xl text-xs font-black uppercase tracking-wider"
              >
                İptal Geri Dön
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-fb-yellow hover:bg-white text-fb-navy rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 cursor-pointer shadow-md"
              >
                <Save size={14} /> RAPORU KİLİTLE VE YAYINLA
              </button>
            </div>
          </div>
        </motion.form>
      ) : (
        <div className="space-y-4 text-left">
          {/* SEARCH & FILTERS PANEL */}
          <div className="p-4 rounded-xl bg-fb-card border border-white/[0.05] flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-fb-muted" />
              <input
                type="text"
                placeholder="Rapor başlığı, takım adı veya sahanın yıldızında ara..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-fb-dark border border-white/10 text-xs text-white placeholder-fb-muted focus:outline-none"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-fb-dark border border-white/10 text-xs px-2.5 py-2 rounded-xl text-slate-300 w-full sm:w-44 focus:outline-none"
            >
              <option value="All">Tüm Maç Raporları</option>
              <option value="published">Evrende Yayında</option>
              <option value="draft">Taslakta Bekleyenler</option>
              <option value="scheduled">Zamanlanmış Yayınlar</option>
            </select>
          </div>

          {/* DYNAMIC LIST */}
          {loading ? (
            <div className="text-center py-20 text-fb-yellow text-xs font-black">OYUN RAPORLARI ALINIYOR...</div>
          ) : filtered.length === 0 ? (
            <EmptyState
              title="Kayıtlı Maç Sonu Analizi Bulunmuyor."
              text="Fenerbahçe’nin biten müsabakaları için analitik verilerle zenginleştirilmiş taktik detay sayfasını şimdi oluşturun."
              buttonLabel="Yeni Rapor Yaz"
              onButtonClick={openNew}
              icon={<ShieldAlert size={20} />}
            />
          ) : (
            <div className="rounded-2xl border border-white/[0.06] overflow-hidden bg-fb-card">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left min-w-[700px]">
                  <thead>
                    <tr className="border-b border-white/[0.06] bg-[#0c1223]/60 text-[10px] font-black uppercase text-fb-muted tracking-widest">
                      <th className="p-4 pl-6">Analiz Konusu</th>
                      <th className="p-4">Tip</th>
                      <th className="p-4">Sahanın Yıldızı (MOTM)</th>
                      <th className="p-4">Rapor Durumu</th>
                      <th className="p-4 pr-6 text-right">Eylemler</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {filtered.map((rep) => {
                      const relMatch = matches.find(m => m.id === rep.matchId);
                      return (
                        <tr key={rep.id} className="hover:bg-white/[0.01] transition-colors">
                          <td className="p-4 pl-6">
                            <div className="space-y-0.5">
                              <h4 className="text-xs font-black text-white">{rep.title}</h4>
                              <p className="text-[10px] text-fb-muted truncate max-w-sm">
                                ⚽ Karlılaşma: {relMatch ? `${relMatch.homeTeam} vs ${relMatch.awayTeam}` : 'Genel Evren Taktikleri'}
                              </p>
                            </div>
                          </td>
                          <td className="p-4">
                            {rep.isPremium ? (
                              <span className="px-2 py-0.5 rounded bg-fb-yellow/10 border border-fb-yellow/20 text-[9px] font-black text-fb-yellow uppercase leading-none">
                                ★ Premium
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded bg-white/5 border border-white/5 text-[9px] font-semibold text-slate-400 uppercase leading-none">
                                Serbest
                              </span>
                            )}
                          </td>
                          <td className="p-4">
                            <span className="text-xs font-black text-[#FFB020] uppercase">{rep.fanMotm || '-'}</span>
                          </td>
                          <td className="p-4">
                            <StatusBadge status={rep.status} scheduledAt={rep.scheduledAt} />
                          </td>
                          <td className="p-4 pr-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => {
                                  setPreviewItem({
                                    title: rep.title,
                                    excerpt: rep.summary,
                                    coverImage: '',
                                    content: `### MAÇ DETAYLI HİKAYESİ\n${rep.matchStory}\n\n### KIRILMA NOKTASI\n${rep.turningPoint}\n\n### RAPOR DETAYI\n${rep.summary}\n\n### COACH KARARLARI\n${rep.coachDecisions}\n\n### GELECEK MAÇ NOTLARI\n${rep.nextMatchNotes}`,
                                    category: 'Maç Raporu',
                                    isPremium: rep.isPremium,
                                    readingTime: 'Saha Analiz Raporu',
                                    tags: 'Post-Match, Analiz Değerleri'
                                  });
                                }}
                                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 cursor-pointer"
                                title="Sayfa Önizle"
                              >
                                <Eye size={14} />
                              </button>
                              <button
                                onClick={() => startEdit(rep)}
                                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 hover:text-fb-yellow text-slate-300 border border-white/10 cursor-pointer"
                                title="Yazıyı Düzenle"
                              >
                                <Edit size={14} />
                              </button>
                              <button
                                onClick={() => setDeleteData({ id: rep.id, relatedMatchId: rep.matchId })}
                                className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/10 cursor-pointer"
                                title="Raporu Sil"
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

      {/* DETACHED CONFIRM MODAL */}
      <DeleteConfirmModal
        isOpen={!!deleteData}
        onClose={() => setDeleteData(null)}
        onConfirm={executeDelete}
        title="Bu taktik maç sonu raporunu silmek istediğine emin misin?"
        message="Bu işlem geri alınamaz."
      />

      <ContentPreviewModal
        isOpen={!!previewItem}
        onClose={() => setPreviewItem(null)}
        title={previewItem?.title || ''}
        excerptOrSummary={previewItem?.excerpt || ''}
        content={previewItem?.content || ''}
        contentTypeLabel="MAÇ ANALİZ DETAYI"
        metadataList={[
          { label: 'Analiz Tipi', value: previewItem?.category || 'Maç Raporu' },
          { label: 'İçerik Tipi', value: previewItem?.isPremium ? '★ Premium' : 'Ücretsiz Genel' },
          { label: 'Okuma Tipi', value: previewItem?.readingTime || 'Fenerbahçe Evreni' }
        ]}
      />
    </div>
  );
};
