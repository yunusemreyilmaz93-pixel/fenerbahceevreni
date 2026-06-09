import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Globe, 
  Lock, 
  Star, 
  Clock, 
  Save, 
  X,
  AlertCircle,
  TrendingUp,
  Eye,
  Calendar
} from 'lucide-react';
import { dbGetCollection, dbUpsertDocument, dbAddDocument, dbDeleteDocument } from '../../lib/dbService';
import { generateSlug, calculateReadingTime, formatDate } from '../../lib/adminHelpers';
import { DeleteConfirmModal, EmptyState, ImagePreview, StatusBadge, ContentPreviewModal } from './AdminCommon';

const CATEGORIES = ["Taktik Analiz", "Maç Raporu", "Orta Saha Analiz", "Rotasyon Analizi", "Transfer Scout", "Köşe Yazısı"];

interface AdminArticlesProps {
  showToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
  initiateCreate?: boolean;
}

export const AdminArticles: React.FC<AdminArticlesProps> = ({ showToast, initiateCreate }) => {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterFeatured, setFilterFeatured] = useState('All');
  const [filterPremium, setFilterPremium] = useState('All');

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  // Form Fields
  const [form, setForm] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category: 'Taktik Analiz',
    tags: 'Mourinho, Taktik',
    coverImage: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600&auto=format&fit=crop',
    author: 'Yunus Emre Yılmaz',
    status: 'draft',
    scheduledAt: '',
    isPremium: false,
    featured: false,
    readingTime: 'Yaklaşık okuma süresi: 1 dakika',
    seoTitle: '',
    seoDescription: '',
    createdAt: '',
    updatedAt: ''
  });

  // Modal states
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [previewItem, setPreviewItem] = useState<any | null>(null);

  const loadData = async () => {
    setLoading(true);
    const list = await dbGetCollection('articles');
    setArticles(list);
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

  // Handle Unsaved Changes before leaving edit/create
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

  const handleContentChange = (content: string) => {
    setIsDirty(true);
    const calcTime = calculateReadingTime(content);
    setForm(prev => ({
      ...prev,
      content,
      readingTime: calcTime
    }));
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title) {
      alert("Lütfen başlık giriniz.");
      return;
    }

    const tagsArray = typeof form.tags === 'string' 
      ? form.tags.split(',').map(tag => tag.trim()).filter(Boolean)
      : form.tags;

    const finalData = {
      ...form,
      tags: tagsArray,
      updatedAt: new Date().toISOString()
    };

    try {
      if (editingId) {
        await dbUpsertDocument('articles', editingId, finalData);
        if (showToast) showToast("İçerik başarıyla güncellendi.", "success");
      } else {
        const newId = `art-${Math.random().toString(36).substr(2, 9)}`;
        await dbAddDocument('articles', {
          ...finalData,
          id: newId,
          createdAt: new Date().toISOString()
        });
        if (showToast) showToast("İçerik başarıyla yayınlandı.", "success");
      }
      setFormOpen(false);
      setEditingId(null);
      setIsDirty(false);
      loadData();
    } catch (err) {
      console.error(err);
      if (showToast) showToast("İçerik kaydedilirken bir hata oluştu.", "error");
    }
  };

  const executeDelete = async () => {
    if (!deleteId) return;
    try {
      await dbDeleteDocument('articles', deleteId);
      if (showToast) showToast("İçerik silindi.", "success");
      loadData();
    } catch (err) {
      console.error(err);
      if (showToast) showToast("Silme işleminde hata oluştu.", "error");
    } finally {
      setDeleteId(null);
    }
  };

  const startEdit = (art: any) => {
    setEditingId(art.id);
    setSlugManuallyEdited(true);
    setForm({
      title: art.title || '',
      slug: art.slug || '',
      excerpt: art.excerpt || '',
      content: art.content || '',
      category: art.category || 'Taktik Analiz',
      tags: Array.isArray(art.tags) ? art.tags.join(', ') : (art.tags || ''),
      coverImage: art.coverImage || 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600&auto=format&fit=crop',
      author: art.author || 'Yunus Emre Yılmaz',
      status: art.status || 'draft',
      scheduledAt: art.scheduledAt || '',
      isPremium: !!art.isPremium,
      featured: !!art.featured,
      readingTime: art.readingTime || 'Yaklaşık okuma süresi: 1 dakika',
      seoTitle: art.seoTitle || '',
      seoDescription: art.seoDescription || '',
      createdAt: art.createdAt || '',
      updatedAt: art.updatedAt || ''
    });
    setFormOpen(true);
    setIsDirty(false);
  };

  const openNew = () => {
    setEditingId(null);
    setSlugManuallyEdited(false);
    setForm({
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      category: 'Taktik Analiz',
      tags: 'Mourinho, Taktik',
      coverImage: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600&auto=format&fit=crop',
      author: 'Yunus Emre Yılmaz',
      status: 'draft',
      scheduledAt: '',
      isPremium: false,
      featured: false,
      readingTime: 'Yaklaşık okuma süresi: 1 dakika',
      seoTitle: '',
      seoDescription: '',
      createdAt: '',
      updatedAt: ''
    });
    setFormOpen(true);
    setIsDirty(false);
  };

  const toggleFeatured = async (art: any) => {
    const nextFeatured = !art.featured;
    await dbUpsertDocument('articles', art.id, { featured: nextFeatured });
    if (showToast) {
      showToast(nextFeatured ? "İçerik öne çıkarıldı." : "İçerik öne çıkarması kaldırıldı.", "success");
    }
    loadData();
  };

  const togglePublish = async (art: any) => {
    const nextStatus = art.status === 'published' ? 'draft' : 'published';
    await dbUpsertDocument('articles', art.id, { 
      status: nextStatus, 
      publishedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    if (showToast) {
      showToast(nextStatus === 'published' ? "İçerik başarıyla yayınlandı." : "İçerik taslağa geri çekildi.", "success");
    }
    loadData();
  };

  const filtered = articles.filter(art => {
    const matchesSearch = art.title?.toLowerCase().includes(search.toLowerCase()) || 
                          art.excerpt?.toLowerCase().includes(search.toLowerCase()) ||
                          art.slug?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = filterCategory === 'All' || art.category === filterCategory;
    const matchesStatus = filterStatus === 'All' || art.status === filterStatus;
    const matchesFeatured = filterFeatured === 'All' || (filterFeatured === 'Yes' && art.featured) || (filterFeatured === 'No' && !art.featured);
    const matchesPremium = filterPremium === 'All' || (filterPremium === 'Yes' && art.isPremium) || (filterPremium === 'No' && !art.isPremium);
    return matchesSearch && matchesCategory && matchesStatus && matchesFeatured && matchesPremium;
  });

  return (
    <div className="space-y-6">
      {/* Module Title Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
        <div>
          <h2 className="text-xl font-display font-black text-white uppercase italic tracking-wide flex items-center gap-2">
            <FileText className="text-fb-yellow" size={20} /> Yazı & Taktik Analizler
          </h2>
          <p className="text-xs text-fb-muted">Köşe yazılarını, taktik antrenman incelemelerini ve analizleri yönetin.</p>
        </div>
        {!formOpen && (
          <button
            onClick={openNew}
            className="px-5 py-2.5 bg-fb-yellow hover:bg-white text-fb-navy font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
          >
            <Plus size={16} /> Yeni Analiz Ekle
          </button>
        )}
      </div>

      {formOpen ? (
        /* EDITOR FORM */
        <motion.form
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSave}
          className="p-6 rounded-2xl bg-fb-card border border-white/[0.08] space-y-6 text-left"
        >
          <div className="flex items-center justify-between pb-4 border-b border-white/5">
            <div className="space-y-1">
              <h3 className="text-xs font-black uppercase tracking-widest text-fb-yellow">
                {editingId ? 'YAZI DÜZENLEME' : 'YENİ YAZI OLUŞTURMA'}
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
                    excerpt: form.excerpt,
                    coverImage: form.coverImage,
                    content: form.content,
                    category: form.category,
                    tags: form.tags,
                    isPremium: form.isPremium,
                    readingTime: form.readingTime
                  });
                }}
                className="px-3.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-[10px] uppercase flex items-center gap-1 cursor-pointer"
              >
                <Eye size={12} /> Hızlı Önizle
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Yazı Başlığı *</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Örn: Fenerbahçe’nin Orta Saha Kurgusu"
                  className="px-4 py-3 bg-fb-dark/80 border border-white/15 rounded-xl text-xs text-white placeholder-fb-muted focus:outline-none focus:border-fb-yellow font-bold"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">URL Slug (Otomatik / Düzenlenebilir)</label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => handleSlugFieldChange(e.target.value)}
                  placeholder="slug-adresi"
                  className="px-4 py-3 bg-fb-dark/40 border border-white/10 rounded-xl text-xs text-fb-yellow/70 focus:outline-none font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Kategori</label>
                  <select
                    value={form.category}
                    onChange={(e) => handleFormValueChange('category', e.target.value)}
                    className="px-3 py-3 bg-fb-dark border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-fb-yellow font-bold [&>option]:bg-fb-card"
                  >
                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Okuma Süresi (Otomatik Hesaplanır)</label>
                  <input
                    type="text"
                    readOnly
                    value={form.readingTime}
                    className="px-4 py-3 bg-fb-dark/30 border border-white/10 rounded-xl text-xs text-fb-muted focus:outline-none font-semibold cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Kapak Görseli Linki</label>
                <input
                  type="text"
                  value={form.coverImage}
                  onChange={(e) => handleFormValueChange('coverImage', e.target.value)}
                  className="px-4 py-3 bg-fb-dark border border-white/15 rounded-xl text-xs text-white font-mono focus:outline-none"
                />
              </div>

              {/* Dynamic visual preview block */}
              <ImagePreview url={form.coverImage} label="KAPAK GÖRSELİ ÖNİZLEME" />

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Etiketler (Virgülle Ayırın)</label>
                <input
                  type="text"
                  value={form.tags}
                  onChange={(e) => handleFormValueChange('tags', e.target.value)}
                  placeholder="Mourinho, Fred, Orta Saha"
                  className="px-4 py-3 bg-fb-dark border border-white/15 rounded-xl text-xs text-white focus:outline-none"
                />
              </div>

              {/* Checkboxes Group */}
              <div className="p-4 rounded-xl bg-fb-dark/30 border border-white/5 space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isPremium}
                    onChange={(e) => handleFormValueChange('isPremium', e.target.checked)}
                    className="w-4 h-4 accent-fb-yellow cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-black text-white block">PREMIUM İÇERİK</span>
                    <span className="text-[10px] text-fb-muted font-semibold">Sadece Premium üyelere özel kilitli yazı bülteni haline getirir.</span>
                  </div>
                </label>

                <div className="h-px bg-white/5" />

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) => handleFormValueChange('featured', e.target.checked)}
                    className="w-4 h-4 accent-fb-yellow cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-black text-white block">ANA SAYFA ÖNE ÇIKARILANLAR</span>
                    <span className="text-[10px] text-fb-muted font-semibold">Yazıyı ana sayfadaki öne çıkan vitrine dahil eder.</span>
                  </div>
                </label>
              </div>
            </div>

            <div className="space-y-4 flex flex-col justify-between">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Özet (Excerpt - Maks 2 Cümle)</label>
                <textarea
                  value={form.excerpt}
                  onChange={(e) => handleFormValueChange('excerpt', e.target.value)}
                  rows={2}
                  placeholder="Kısa liste içi özet metni..."
                  className="px-4 py-3 bg-fb-dark border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-fb-yellow"
                />
              </div>

              <div className="flex flex-col gap-1 flex-1 mt-1">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Ana İçerik Gövdesi *</label>
                <textarea
                  required
                  value={form.content}
                  onChange={(e) => handleContentChange(e.target.value)}
                  rows={12}
                  placeholder="Taktik analizinizi buraya detaylarıyla yazın..."
                  className="px-4 py-3 bg-fb-dark border border-white/15 rounded-xl text-xs text-white font-semibold leading-relaxed focus:outline-none focus:border-fb-yellow"
                />
              </div>

              <div className="p-4 rounded-xl bg-fb-dark/30 border border-white/5 mt-4 space-y-4">
                <span className="text-[10px] font-black uppercase text-fb-yellow tracking-wider block">SEO AYARLARI (İSTEĞE BAĞLI)</span>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-slate-400 font-bold">SEO Başlığı</label>
                    <input
                      type="text"
                      value={form.seoTitle}
                      onChange={(e) => handleFormValueChange('seoTitle', e.target.value)}
                      className="px-3 py-2 bg-fb-dark border border-white/10 rounded-lg text-xs text-slate-300"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-slate-400 font-bold">SEO Açıklaması</label>
                    <input
                      type="text"
                      value={form.seoDescription}
                      onChange={(e) => handleFormValueChange('seoDescription', e.target.value)}
                      className="px-3 py-2 bg-fb-dark border border-white/10 rounded-lg text-xs text-slate-300"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Audit Metadata display */}
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
                <option value="draft">Taslak Olarak Kaydet</option>
                <option value="published">Anında Yayınla</option>
                <option value="scheduled">Zamanla (Planlı)</option>
              </select>

              {form.status === 'scheduled' && (
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-blue-400 uppercase tracking-wider">TARİH SEÇ:</span>
                  <input
                    type="datetime-local"
                    required
                    value={form.scheduledAt}
                    onChange={(e) => handleFormValueChange('scheduledAt', e.target.value)}
                    className="px-2.5 py-1.5 bg-fb-dark border border-white/15 rounded text-xs text-white font-mono"
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
                <Save size={14} /> ANALİZİ KAYDET
              </button>
            </div>
          </div>
        </motion.form>
      ) : (
        /* TABLE LIST VIEW */
        <div className="space-y-4 text-left">
          {/* SEARCH & FILTERS PANEL */}
          <div className="p-4 rounded-xl bg-fb-card border border-white/[0.05] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="relative col-span-1 lg:col-span-2">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-fb-muted" />
              <input
                type="text"
                placeholder="Yazı veya url sluglarında ara..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-fb-dark border border-white/10 text-xs text-white placeholder-fb-muted focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">KATEGORİ</span>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="bg-fb-dark border border-white/10 text-xs px-2.5 py-2 rounded-xl text-slate-300 w-full"
              >
                <option value="All">Tüm Kategoriler</option>
                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">YAYIN DURUMU</span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-fb-dark border border-white/10 text-xs px-2.5 py-2 rounded-xl text-slate-300 w-full"
              >
                <option value="All">Tüm Durumlar</option>
                <option value="published">Yayındakiler</option>
                <option value="draft">Taslaklar</option>
                <option value="scheduled">Zamanlanmışlar</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">HEDEF SEVİYESİ</span>
              <select
                value={filterPremium}
                onChange={(e) => setFilterPremium(e.target.value)}
                className="bg-fb-dark border border-white/10 text-xs px-2.5 py-2 rounded-xl text-slate-300 w-full"
              >
                <option value="All">Hepsi</option>
                <option value="Yes">★ Premium İçerik</option>
                <option value="No">Serbest Genel</option>
              </select>
            </div>
          </div>

          {/* DYNAMIC LIST */}
          {loading ? (
            <div className="text-center py-20 text-fb-yellow text-xs font-black">YAZILAR KONTROL EDİLİYOR...</div>
          ) : filtered.length === 0 ? (
            <EmptyState
              title="Henüz analiz yazısı yok."
              text="İlk analiz yazını ekleyerek Fenerbahçe Evreni’ni içerikle doldurmaya başlayabilirsin."
              buttonLabel="Yeni Analiz Yazısı Ekle"
              onButtonClick={openNew}
              icon={<FileText size={20} />}
            />
          ) : (
            <div className="rounded-2xl border border-white/[0.06] overflow-hidden bg-fb-card">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left min-w-[800px]">
                  <thead>
                    <tr className="border-b border-white/[0.06] bg-[#0c1223]/60 text-[10px] font-black uppercase text-fb-muted tracking-widest">
                      <th className="p-4 pl-6">Analiz Detayı</th>
                      <th className="p-4">Kategori</th>
                      <th className="p-4">Hücre Tipi</th>
                      <th className="p-4">Yayın Durumu</th>
                      <th className="p-4 text-center">Öne Çıkarma</th>
                      <th className="p-4 pr-6 text-right">Eylemler</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {filtered.map((art) => (
                      <tr key={art.id} className="hover:bg-white/[0.01] transition-all">
                        <td className="p-4 pl-6">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-fb-dark overflow-hidden border border-white/5 shrink-0">
                              <img referrerPolicy="no-referrer" src={art.coverImage} alt="" className="w-full h-full object-cover" />
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-xs font-black text-white truncate max-w-sm">{art.title}</h4>
                              <p className="text-[10px] text-fb-muted truncate max-w-xs mt-0.5">{art.excerpt || 'Özet açıklama girilmemiş'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="text-[10px] font-black uppercase text-slate-300">{art.category}</span>
                        </td>
                        <td className="p-4">
                          {art.isPremium ? (
                            <span className="px-2 py-1 select-none rounded bg-fb-yellow/10 border border-fb-yellow/20 text-[9px] font-black text-fb-yellow uppercase">
                              ★ Premium
                            </span>
                          ) : (
                            <span className="px-2 py-1 select-none rounded bg-white/5 border border-white/5 text-[9px] font-semibold text-slate-400 uppercase">
                              Serbest
                            </span>
                          )}
                        </td>
                        <td className="p-4">
                          <StatusBadge status={art.status} scheduledAt={art.scheduledAt} />
                        </td>
                        <td className="p-4 text-center">
                          <button
                            type="button"
                            onClick={() => toggleFeatured(art)}
                            className={`p-1.5 rounded-lg border cursor-pointer transition-all ${
                              art.featured
                                ? 'bg-fb-yellow/10 border-fb-yellow/20 text-fb-yellow'
                                : 'bg-transparent border-white/5 text-slate-500 hover:text-white'
                            }`}
                            title="Ana Sayfada Öne Çıkar"
                          >
                            <Star size={14} className={art.featured ? 'fill-fb-yellow' : ''} />
                          </button>
                        </td>
                        <td className="p-4 pr-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setPreviewItem({
                                  title: art.title,
                                  excerpt: art.excerpt,
                                  coverImage: art.coverImage,
                                  content: art.content,
                                  category: art.category,
                                  tags: Array.isArray(art.tags) ? art.tags.join(', ') : art.tags,
                                  isPremium: art.isPremium,
                                  readingTime: art.readingTime
                                });
                              }}
                              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 cursor-pointer"
                              title="Detaylı Önizle"
                            >
                              <Eye size={14} />
                            </button>
                            <button
                              onClick={() => startEdit(art)}
                              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 hover:text-fb-yellow text-slate-300 border border-white/10 cursor-pointer"
                              title="Düzenle"
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              onClick={() => setDeleteId(art.id)}
                              className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/10 cursor-pointer"
                              title="Sil"
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

      {/* REUSABLE LIGHTWEIGHT MODAL SYSTEMS */}
      <DeleteConfirmModal 
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={executeDelete}
        title="Bu yazıyı kalıcı olarak silmek istediğine emin misin?"
        message="Bu işlem geri alınamaz."
      />

      <ContentPreviewModal
        isOpen={!!previewItem}
        onClose={() => setPreviewItem(null)}
        title={previewItem?.title || ''}
        excerptOrSummary={previewItem?.excerpt || ''}
        coverImage={previewItem?.coverImage || ''}
        content={previewItem?.content || ''}
        contentTypeLabel="TAKTİK NOT ÖNİZLEMESİ"
        metadataList={[
          { label: 'Kategori', value: previewItem?.category || 'Analiz' },
          { label: 'Okuma Süresi', value: previewItem?.readingTime || '1 dk' },
          { label: 'Bülten Tipi', value: previewItem?.isPremium ? '★ Premium Kilitli' : 'Genel Serbest' },
          { label: 'Etiketler', value: previewItem?.tags || 'Sarı Lacivert' }
        ]}
      />
    </div>
  );
};
