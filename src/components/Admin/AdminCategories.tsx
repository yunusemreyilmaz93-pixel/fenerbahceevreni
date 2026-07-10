import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Layers, Plus, Trash2, Edit2, Save, X, Settings } from 'lucide-react';
import { dbGetCollection, dbUpsertDocument, dbDeleteDocument } from '../../lib/dbService';

interface Category {
  id: string;
  name: string;
  slug: string;
  type: 'news' | 'transfers' | 'media' | 'pages'; // which entity classification this is
  description?: string;
  color?: string; // custom chip color hex or tailwind class
  createdAt?: string;
}

interface AdminCategoriesProps {
  showToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const AdminCategories: React.FC<AdminCategoriesProps> = ({ showToast }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeType, setActiveType] = useState<'news' | 'transfers' | 'media' | 'pages'>('news');

  const [form, setForm] = useState({
    id: '',
    name: '',
    slug: '',
    description: '',
    color: 'emerald',
  });

  const [editingId, setEditingId] = useState<string | null>(null);

  const colors = [
    { name: 'Sarı (FB)', value: 'yellow' },
    { name: 'Mavi (FB)', value: 'blue' },
    { name: 'Yeşil', value: 'emerald' },
    { name: 'Kırmızı', value: 'rose' },
    { name: 'Mor', value: 'purple' },
    { name: 'Gri', value: 'slate' },
  ];

  const loadCategories = async () => {
    setLoading(true);
    try {
      const fetched = await dbGetCollection('categories');
      if (fetched && fetched.length > 0) {
        setCategories(fetched);
      } else {
        // Seed default categories
        const defaultCats: Category[] = [
          // News
          { id: 'cat-n1', name: 'Taktik Analiz', slug: 'taktik-analiz', type: 'news', description: 'Takım diziliş ve set hücum incelemeleri.', color: 'blue' },
          { id: 'cat-n2', name: 'Maç Raporu', slug: 'mac-raporu', type: 'news', description: 'Karşılaşma sonrası oyuncu ısı haritalı analizler.', color: 'rose' },
          { id: 'cat-n3', name: 'Köşe Yazısı', slug: 'kose-yazisi', type: 'news', description: 'Yazar kadrosundan camia bültenleri.', color: 'yellow' },
          
          // Transfers
          { id: 'cat-t1', name: 'Scout Tarama', slug: 'scout-tarama', type: 'transfers', description: 'Yabancı veya yerli alt lig yetenekleri.', color: 'emerald' },
          { id: 'cat-t2', name: 'Maliyet Analizi', slug: 'maliyet-analizi', type: 'transfers', description: 'Finansal bütçe ve bonservis değerlemeleri.', color: 'slate' },
          
          // Media
          { id: 'cat-m1', name: 'Maç Özetleri', slug: 'mac-ozetleri', type: 'media', description: 'Önemli YouTube ve BeinSport video kesitleri.', color: 'purple' },
          { id: 'cat-m2', name: 'Antrenman', slug: 'antrenman', type: 'media', description: 'Samandıra kampı görsel galerileri ve taktik sırlar.', color: 'yellow' },
          
          // Pages
          { id: 'cat-p1', name: 'Kurumsal', slug: 'kurumsal', type: 'pages', description: 'Hakımızda, Künye, Vizyon ana sayfaları.', color: 'blue' },
        ];
        for (const cat of defaultCats) {
          await dbUpsertDocument('categories', cat.id, cat);
        }
        setCategories(defaultCats);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const filteredCategories = categories.filter(cat => cat.type === activeType);

  const handleNameChange = (name: string) => {
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
    setForm(p => ({ ...p, name, slug }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const finalId = form.id || `cat-${activeType}-${Math.random().toString(36).substr(2, 9)}`;
      const updatedCat: Category = {
        id: finalId,
        name: form.name,
        slug: form.slug,
        type: activeType,
        description: form.description,
        color: form.color,
        createdAt: new Date().toISOString()
      };

      await dbUpsertDocument('categories', finalId, updatedCat);
      
      if (!form.id) {
        setCategories(prev => [...prev, updatedCat]);
        if (showToast) showToast('Yeni kategori başarıyla oluşturuldu.', 'success');
      } else {
        setCategories(prev => prev.map(c => c.id === finalId ? updatedCat : c));
        if (showToast) showToast('Kategori güncellendi.', 'success');
        setEditingId(null);
      }

      setForm({ id: '', name: '', slug: '', description: '', color: 'emerald' });
    } catch (err) {
      console.error(err);
      if (showToast) showToast('Kategori kaydedilirken hata oluştu.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bu kategoriyi silmek istediğinizden emin misiniz?')) return;
    try {
      await dbDeleteDocument('categories', id);
      setCategories(prev => prev.filter(c => c.id !== id));
      if (showToast) showToast('Kategori silindi.', 'success');
    } catch (err) {
      console.error(err);
      if (showToast) showToast('Kategori silinirken hata oluştu.', 'error');
    }
  };

  const handleEdit = (cat: Category) => {
    setEditingId(cat.id);
    setForm({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
      color: cat.color || 'emerald'
    });
  };

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'yellow': return 'bg-fb-yellow/10 text-fb-yellow border-fb-yellow/20';
      case 'blue': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'rose': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'purple': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'slate': return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
      case 'emerald':
      default:
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    }
  };

  if (loading) {
    return <div className="text-center py-10 text-fb-yellow text-xs font-black uppercase">KATEGORİLER ALINIYOR...</div>;
  }

  return (
    <div className="space-y-6 text-left max-w-4xl mx-auto">
      <div>
        <h2 className="text-xl font-display font-black text-white uppercase italic tracking-wide flex items-center gap-2">
          <Layers className="text-fb-yellow" size={20} /> Kategori Yönetim Merkezi
        </h2>
        <p className="text-xs text-fb-muted">
          Yazılar, transferler, medya kartları ve özel sayfalar için dinamik kırılım kategorileri belirleyin. Haber girmeden önce buradan etiket düzenleyebilirsiniz.
        </p>
      </div>

      {/* Selector type buttons */}
      <div className="flex border-b border-white/5">
        {(['news', 'transfers', 'media', 'pages'] as const).map(type => (
          <button
            key={type}
            onClick={() => {
              setActiveType(type);
              setEditingId(null);
              setForm({ id: '', name: '', slug: '', description: '', color: 'emerald' });
            }}
            className={`px-5 py-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
              activeType === type 
                ? 'border-fb-yellow text-fb-yellow bg-fb-yellow/5' 
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            {type === 'news' ? '✍️ Yazı Sınıfları' : type === 'transfers' ? '🔍 Transfer Klasları' : type === 'media' ? '📸 Medya Albümleri' : '📄 Özel Sayfalar'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Form */}
        <form onSubmit={handleSubmit} className="md:col-span-5 p-5 rounded-2xl bg-fb-card border border-white/[0.08] h-fit space-y-4">
          <span className="text-[10px] font-black text-fb-yellow uppercase tracking-widest block pb-1 border-b border-white/5">
            {editingId ? 'KATEGORİYİ DÜZENLE' : 'YENİ KATEGORİ TANIMI'}
          </span>

          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-bold text-slate-400">KANTAR / SINIF ADI</label>
            <input
              type="text"
              required
              placeholder="Örn: Taktik Araştırma"
              value={form.name}
              onChange={e => handleNameChange(e.target.value)}
              className="px-3.5 py-2 bg-fb-dark border border-white/10 rounded-xl text-xs text-white"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-bold text-slate-400 font-mono">SEOLİK SLUG (OTOMATİK)</label>
            <input
              type="text"
              required
              readOnly
              value={form.slug}
              className="px-3.5 py-2 bg-fb-dark/60 border border-white/5 rounded-xl text-xs text-slate-500 font-mono focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-bold text-slate-400">BİLGİ EXCERPT / NOTU</label>
            <textarea
              rows={2}
              placeholder="Kapsam detaylarını açıklayan kısa not..."
              value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              className="px-3.5 py-2 bg-fb-dark border border-white/10 rounded-xl text-xs text-white resize-none"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-bold text-slate-400">CHIP RENK DETAYI</label>
            <div className="grid grid-cols-3 gap-2">
              {colors.map(c => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setForm(p => ({ ...p, color: c.value }))}
                  className={`py-1.5 rounded-lg border text-[10px] font-black transition-all cursor-pointer ${
                    form.color === c.value
                      ? 'border-fb-yellow bg-fb-yellow/15 text-white'
                      : 'border-white/10 bg-fb-dark/40 text-slate-400 hover:border-white/20'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 flex gap-2">
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setForm({ id: '', name: '', slug: '', description: '', color: 'emerald' });
                }}
                className="flex-1 py-2 bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-xs uppercase rounded-xl transition-all"
              >
                Vazgeç
              </button>
            )}
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2 bg-fb-yellow hover:bg-white text-fb-navy font-black text-xs uppercase tracking-wider rounded-xl transition-all"
            >
              Uygula
            </button>
          </div>
        </form>

        {/* List */}
        <div className="md:col-span-7 p-5 rounded-2xl bg-fb-card border border-white/[0.08] space-y-4">
          <span className="text-[10px] font-black text-fb-yellow uppercase tracking-widest block pb-1 border-b border-white/5">
            AKTİF {activeType.toUpperCase()} GRUPLARI ({filteredCategories.length})
          </span>

          {filteredCategories.length === 0 ? (
            <div className="text-center py-10 text-fb-muted text-xs font-semibold">Bu altta henüz kategori kaydı bulunmuyor.</div>
          ) : (
            <div className="space-y-2">
              {filteredCategories.map(cat => (
                <div
                  key={cat.id}
                  className="p-3.5 rounded-xl border border-white/10 bg-fb-dark/40 flex items-start justify-between gap-4 text-left"
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border select-none ${getColorClasses(cat.color || 'emerald')}`}>
                        {cat.name}
                      </span>
                      <span className="text-[10px] text-zinc-500 font-mono">slug: {cat.slug}</span>
                    </div>
                    {cat.description && (
                      <p className="text-[11px] text-fb-muted font-bold leading-normal truncate max-w-sm">
                        {cat.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleEdit(cat)}
                      className="p-1 rounded bg-white/5 hover:bg-white/10 text-blue-400 cursor-pointer"
                      title="Düzenle"
                    >
                      <Edit2 size={12} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(cat.id)}
                      className="p-1 rounded bg-white/5 hover:bg-white/10 text-rose-400 cursor-pointer"
                      title="Kaldır"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
