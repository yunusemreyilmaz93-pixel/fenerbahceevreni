import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
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
  TrendingUp,
  Globe,
  Sliders,
  Eye
} from 'lucide-react';
import { dbGetCollection, dbUpsertDocument, dbAddDocument, dbDeleteDocument } from '../../lib/dbService';
import { generateSlug, formatDate } from '../../lib/adminHelpers';
import { DeleteConfirmModal, EmptyState, StatusBadge, ContentPreviewModal } from './AdminCommon';

interface AdminTransferProps {
  showToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
  initiateCreate?: boolean;
}

export const AdminTransfer: React.FC<AdminTransferProps> = ({ showToast, initiateCreate }) => {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  // Form State
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  // Form Field defaults
  const [form, setForm] = useState({
    playerName: '',
    slug: '',
    position: 'Merkez Orta Saha (8 Numara)',
    age: 23,
    nationality: 'Fransa',
    currentClub: '',
    estimatedCost: '€10M',
    fitScore: 8.5,
    strengths: 'Pres Yoğunluğu, Dribbling Kalitesi',
    concerns: 'Sert Lig Deneyimi Yoksunluğu',
    tacticalFit: '',
    summary: '',
    isPremium: true,
    status: 'draft',
    scheduledAt: '',
    createdAt: '',
    updatedAt: ''
  });

  // Modal actions
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [previewItem, setPreviewItem] = useState<any | null>(null);

  const loadData = async () => {
    setLoading(true);
    const list = await dbGetCollection('transferReports');
    setReports(list);
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

  const handlePlayerNameChange = (nameValue: string) => {
    setIsDirty(true);
    setForm(prev => {
      const calculatedSlug = slugManuallyEdited ? prev.slug : generateSlug(nameValue);
      return {
        ...prev,
        playerName: nameValue,
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

  const handleFormChange = (field: string, val: any) => {
    setIsDirty(true);
    setForm(prev => ({
      ...prev,
      [field]: val
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.playerName || !form.position) {
      alert("Lütfen oyuncu adı ve pozisyonunu doldurun.");
      return;
    }

    const compiledData = {
      ...form,
      age: Number(form.age),
      fitScore: Number(form.fitScore),
      strengths: typeof form.strengths === 'string' 
        ? form.strengths.split(',').map(s => s.trim()).filter(Boolean)
        : form.strengths,
      concerns: typeof form.concerns === 'string'
        ? form.concerns.split(',').map(c => c.trim()).filter(Boolean)
        : form.concerns,
      updatedAt: new Date().toISOString()
    };

    try {
      if (editingId) {
        await dbUpsertDocument('transferReports', editingId, compiledData);
        if (showToast) showToast("Scout transfer raporu başarıyla güncellendi.", "success");
      } else {
        await dbAddDocument('transferReports', {
          ...compiledData,
          id: `tgt-${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date().toISOString()
        });
        if (showToast) showToast("Yeni oyuncu radar raporu başarıyla eklendi.", "success");
      }

      setFormOpen(false);
      setEditingId(null);
      setIsDirty(false);
      loadData();
    } catch (err) {
      console.error(err);
      if (showToast) showToast("Scout verisi kaydedilirken sorun oluştu.", "error");
    }
  };

  const startEdit = (t: any) => {
    setEditingId(t.id);
    setSlugManuallyEdited(true);
    setForm({
      playerName: t.playerName || '',
      slug: t.slug || '',
      position: t.position || 'Merkez Orta Saha',
      age: t.age || 23,
      nationality: t.nationality || 'Fransa',
      currentClub: t.currentClub || '',
      estimatedCost: t.estimatedCost || '€10M',
      fitScore: t.fitScore || 8.5,
      strengths: Array.isArray(t.strengths) ? t.strengths.join(', ') : (t.strengths || ''),
      concerns: Array.isArray(t.concerns) ? t.concerns.join(', ') : (t.concerns || ''),
      tacticalFit: t.tacticalFit || '',
      summary: t.summary || '',
      isPremium: !!t.isPremium,
      status: t.status || 'draft',
      scheduledAt: t.scheduledAt || '',
      createdAt: t.createdAt || '',
      updatedAt: t.updatedAt || ''
    });
    setFormOpen(true);
    setIsDirty(false);
  };

  const openNew = () => {
    setEditingId(null);
    setSlugManuallyEdited(false);
    setForm({
      playerName: '',
      slug: '',
      position: 'Sol Bek',
      age: 22,
      nationality: 'Hollanda',
      currentClub: 'Heerenveen',
      estimatedCost: '€6M - €8M',
      fitScore: 8.4,
      strengths: 'Sprint Hızı, Çizgi Hücum Enerjisi',
      concerns: 'Alan Paylaşım Hataları',
      tacticalFit: 'Derin yerleşik savunmaları açmak için ideal hücum beki çözümü.',
      summary: 'Gelecek vaat eden yüksek tempo sol bek alternatifi.',
      isPremium: true,
      status: 'draft',
      scheduledAt: '',
      createdAt: '',
      updatedAt: ''
    });
    setFormOpen(true);
    setIsDirty(false);
  };

  const executeDelete = async () => {
    if (!deleteId) return;
    try {
      await dbDeleteDocument('transferReports', deleteId);
      if (showToast) showToast("Scout analiz raporu radardan silindi.", "success");
      loadData();
    } catch (err) {
      console.error(err);
      if (showToast) showToast("Silme işlemi gerçekleşemedi.", "error");
    } finally {
      setDeleteId(null);
    }
  };

  const filtered = reports.filter(r => {
    const matchesSearch = r.playerName?.toLowerCase().includes(search.toLowerCase()) || 
                          r.position?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'All' || r.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
        <div>
          <h2 className="text-xl font-display font-black text-white uppercase italic tracking-wide flex items-center gap-2">
            <Award className="text-fb-yellow" size={20} /> Scout & Transfer Radar Raporları
          </h2>
          <p className="text-xs text-slate-400">Oyuncu hedeflerini, gelişmiş uyumluluk skorlarını ve detaylı transfer dosyalarını yönetin.</p>
        </div>
        {!formOpen && (
          <button
            onClick={openNew}
            className="px-5 py-2.5 bg-fb-yellow hover:bg-white text-fb-navy font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
          >
            <Plus size={16} /> Yeni Scout Raporu Ekle
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
            <div className="space-y-1">
              <h3 className="text-xs font-black uppercase tracking-widest text-fb-yellow">
                {editingId ? 'TRANSFER RADAR RAPORUNU DÜZENLE' : 'YENİ COG BAĞLANTILI SCOUT RAPORU EKLE'}
              </h3>
              {isDirty && (
                <span className="text-[10px] text-amber-400 font-bold tracking-wider animate-pulse">⚠️ KAYDEDİLMEMİŞ DEĞİŞİKLİKLER VAR</span>
              )}
            </div>
            <button
              type="button"
              onClick={handleCloseFormAttempt}
              className="p-1 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black uppercase text-slate-400">OYUNCU ADI *</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Lander Heeren"
                  value={form.playerName}
                  onChange={(e) => handlePlayerNameChange(e.target.value)}
                  className="px-4 py-2.5 bg-fb-dark border border-white/10 rounded-xl text-xs text-white font-bold"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black uppercase text-slate-400">URL SLUG (Otomatik)</label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => handleSlugFieldChange(e.target.value)}
                  placeholder="otomatik-slug"
                  className="px-4 py-2.5 bg-fb-dark/30 border border-white/10 rounded-xl text-xs text-fb-yellow font-mono focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">Hedef Pozisyon</label>
                  <input
                    type="text"
                    value={form.position}
                    onChange={(e) => handleFormChange('position', e.target.value)}
                    className="px-4 py-2.5 bg-[#070b13] border border-white/10 rounded-xl text-xs text-white"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">Şu Anki Kulübü</label>
                  <input
                    type="text"
                    value={form.currentClub}
                    onChange={(e) => handleFormChange('currentClub', e.target.value)}
                    className="px-4 py-2.5 bg-[#070b13] border border-white/10 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 font-bold">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">Yaş</label>
                  <input
                    type="number"
                    value={form.age}
                    onChange={(e) => handleFormChange('age', Number(e.target.value))}
                    className="px-4 py-2 bg-fb-dark border border-white/10 rounded-xl text-xs text-white font-mono text-center"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">Bütçe Gideri</label>
                  <input
                    type="text"
                    value={form.estimatedCost}
                    onChange={(e) => handleFormChange('estimatedCost', e.target.value)}
                    className="px-4 py-2 bg-fb-dark border border-white/10 rounded-xl text-xs text-white font-mono text-center"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">Fit Skor (10 üzerinden)</label>
                  <input
                    type="number"
                    step={0.1}
                    max={10}
                    value={form.fitScore}
                    onChange={(e) => handleFormChange('fitScore', Number(e.target.value))}
                    className="px-4 py-2 bg-fb-dark border border-white/10 rounded-xl text-xs text-fb-yellow font-mono text-center"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black uppercase text-slate-400">Uyruğu (Ülkesi)</label>
                <input
                  type="text"
                  value={form.nationality}
                  onChange={(e) => handleFormChange('nationality', e.target.value)}
                  className="px-4 py-2.5 bg-fb-dark border border-white/10 rounded-xl text-xs text-white"
                />
              </div>

              <div className="p-4 rounded-xl bg-[#090e1a]/80 border border-white/5 space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isPremium}
                    onChange={(e) => handleFormChange('isPremium', e.target.checked)}
                    className="w-4 h-4 accent-fb-yellow"
                  />
                  <div>
                    <span className="text-xs font-black text-white block">PREMIUM KİLİTLİ SEVİYE</span>
                    <span className="text-[10px] text-slate-400 font-semibold">Sadece premium üyelerin görüntüleyebileceği derin analiz raporu yapar.</span>
                  </div>
                </label>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase text-[#10b981]">ÖNE ÇIKAN GÜÇLÜ YÖNLER (VİRGÜLLE AYIRIN)</label>
                  <textarea
                    value={form.strengths}
                    onChange={(e) => handleFormChange('strengths', e.target.value)}
                    rows={2}
                    placeholder="Hızlı geçiş yönetimi, topsuz topsuz penetrasyon..."
                    className="px-4 py-3 bg-fb-dark border border-white/15 rounded-xl text-xs text-slate-200"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase text-red-400">ZAFİYETLER / KAYGILAR (VİRGÜLLE AYIRIN)</label>
                  <textarea
                    value={form.concerns}
                    onChange={(e) => handleFormChange('concerns', e.target.value)}
                    rows={2}
                    placeholder="Hava mücadelelerindeki zayıflık..."
                    className="px-4 py-3 bg-fb-dark border border-white/15 rounded-xl text-xs text-slate-200"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black uppercase text-slate-400">KISA ÖZET (RADAR RADYO NOTU)</label>
                <textarea
                  value={form.summary}
                  onChange={(e) => handleFormChange('summary', e.target.value)}
                  rows={2}
                  placeholder="Geleceğe yönelik potansiyel lider..."
                  className="px-4 py-3 bg-fb-dark border border-white/15 rounded-xl text-xs text-white"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black uppercase text-slate-400">MOURINHO SİSTEMİNE TAKTİKSEL UYUMU</label>
                <textarea
                  value={form.tacticalFit}
                  onChange={(e) => handleFormChange('tacticalFit', e.target.value)}
                  rows={5}
                  placeholder="Geçiş oyunlarında pres lideri olarak çift pivotun solunda değerlendirilebilir..."
                  className="px-4 py-3 bg-fb-dark border border-white/15 rounded-xl text-xs text-slate-300 leading-relaxed font-semibold focus:outline-none focus:border-fb-yellow"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-4 text-fb-muted text-[10px] font-bold">
            {form.createdAt && (
              <span>📅 Radara Giriş: {formatDate(form.createdAt)}</span>
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
                onChange={(e) => handleFormChange('status', e.target.value)}
                className="px-3 py-2 bg-fb-dark border border-white/15 rounded-lg text-xs text-white"
              >
                <option value="draft">Taslak Radar Notu (Gizli)</option>
                <option value="published">Anında Radar Sayfasına Aç</option>
                <option value="scheduled">Zamanlanmış Scout Paylaşımı</option>
              </select>

              {form.status === 'scheduled' && (
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-blue-400 uppercase tracking-wider">TARİH SEÇ:</span>
                  <input
                    type="datetime-local"
                    required
                    value={form.scheduledAt}
                    onChange={(e) => handleFormChange('scheduledAt', e.target.value)}
                    className="px-2.5 py-1.5 bg-fb-dark border border-white/15 rounded text-xs text-white"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 ml-auto">
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
                <Save size={14} /> RAPORU RADARA KAYDET
              </button>
            </div>
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
                placeholder="Oyuncu adı veya pozisyonda ara..."
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
              <option value="All">Tüm Durumlar</option>
              <option value="published">Radar Ekranında</option>
              <option value="draft">Taslak Radar Notları</option>
              <option value="scheduled">Zamanlanmış Dosyalar</option>
            </select>
          </div>

          {/* DYNAMIC LIST */}
          {loading ? (
            <div className="text-center py-20 text-fb-yellow text-xs font-black">RADAR BİLGİLERİ SENKRONİZE EDİLİYOR...</div>
          ) : filtered.length === 0 ? (
            <EmptyState
              title="Radar Araştırması Bulunmuyor."
              text="Fenerbahçe Evreni transfer hedefleri scout araştırmasını başlatın."
              buttonLabel="İlk Scout Raporunu Yaz"
              onButtonClick={openNew}
              icon={<Award size={20} />}
            />
          ) : (
            <div className="rounded-2xl border border-white/[0.06] overflow-hidden bg-fb-card">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left min-w-[700px]">
                  <thead>
                    <tr className="border-b border-white/[0.06] bg-[#0c1223]/60 text-[10px] font-black uppercase text-fb-muted tracking-widest">
                      <th className="p-4 pl-6">Oyuncu Detayı</th>
                      <th className="p-4">Pozisyon / Kulüp</th>
                      <th className="p-4">Gider / Yaş</th>
                      <th className="p-4">Bülten Durumu</th>
                      <th className="p-4">Sistem Uyumluluğu</th>
                      <th className="p-4 pr-6 text-right">Eylemler</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {filtered.map((r) => (
                      <tr key={r.id} className="hover:bg-white/[0.01] transition-all">
                        <td className="p-4 pl-6">
                          <div>
                            <h4 className="text-xs font-black text-white">{r.playerName}</h4>
                            <p className="text-[10px] font-mono text-fb-yellow mt-0.5">{r.slug || 'otomatik-atama'}</p>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="space-y-0.5">
                            <span className="text-[10px] font-black uppercase text-slate-300">{r.position}</span>
                            <span className="text-[10px] text-fb-muted block font-semibold">🏢 {r.currentClub || '-'} ({r.nationality})</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="space-y-0.5">
                            <span className="text-xs font-semibold text-slate-300 font-mono">{r.estimatedCost || 'Bilinmiyor'}</span>
                            <span className="text-[9px] text-fb-muted block font-bold">{r.age} Yaş</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col gap-1 items-start">
                            {r.isPremium ? (
                              <span className="px-1.5 py-0.5 rounded bg-fb-yellow/10 border border-fb-yellow/20 text-[9px] font-black text-fb-yellow uppercase leading-none mb-1">★ Premium</span>
                            ) : (
                              <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/5 text-[9px] font-semibold text-slate-400 uppercase leading-none mb-1">Serbest</span>
                            )}
                            <StatusBadge status={r.status} scheduledAt={r.scheduledAt} />
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="text-sm font-black text-[#FFB020] font-mono">{r.fitScore} <span className="text-[10px] text-slate-500 font-bold">/10</span></span>
                        </td>
                        <td className="p-4 pr-6 text-right font-semibold">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setPreviewItem({
                                  title: `${r.playerName} Scout Raporu`,
                                  excerpt: r.summary,
                                  isPremium: r.isPremium,
                                  content: `### OYUNCU DETAYLARI\n- Yas: ${r.age}\n- Kulup: ${r.currentClub}\n- Uyruk: ${r.nationality}\n- Maliyet Tahmini: ${r.estimatedCost}\n\n### COG RAPOR DEĞERLENDİRMESİ\n${r.summary}\n\n### SISTEMSEL UYUM DETAYI\n${r.tacticalFit}`,
                                  category: 'Transfer / Scout Raporu',
                                  readingTime: `Uyum Skoru: ${r.fitScore}`
                                });
                              }}
                              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 cursor-pointer"
                              title="Sayfa Önizle"
                            >
                              <Eye size={14} />
                            </button>
                            <button
                              onClick={() => startEdit(r)}
                              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 hover:text-fb-yellow text-slate-300 border border-white/10 cursor-pointer"
                              title="Radar Girişini Düzenle"
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              onClick={() => setDeleteId(r.id)}
                              className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/10 cursor-pointer"
                              title="Oyuncuyu Sil"
                            >
                              <Trash2 size={14} />
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
        </div>
      )}

      {/* DETACHED CONFIRM RADAR DELETE */}
      <DeleteConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={executeDelete}
        title="Bu oyuncuyu radardan kalıcı olarak silmek istediğine emin misin?"
        message="Bu işlem geri alınamaz."
      />

      <ContentPreviewModal
        isOpen={!!previewItem}
        onClose={() => setPreviewItem(null)}
        title={previewItem?.title || ''}
        excerptOrSummary={previewItem?.excerpt || ''}
        content={previewItem?.content || ''}
        contentTypeLabel="TRANSFER SCOUT RAPORU"
        metadataList={[
          { label: 'Rapor Kategorisi', value: previewItem?.category || 'Scout' },
          { label: 'Uyelik Limit', value: previewItem?.isPremium ? '★ Premium' : 'Serbest Okuma' },
          { label: 'Metrik', value: previewItem?.readingTime || '-' }
        ]}
      />
    </div>
  );
};
