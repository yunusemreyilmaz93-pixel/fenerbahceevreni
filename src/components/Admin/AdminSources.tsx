import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Plus, Trash2, Edit2, Link as LinkIcon, Star, HelpCircle } from 'lucide-react';
import { dbGetCollection, dbUpsertDocument } from '../../lib/dbService';
import { FirebaseImageUploader } from './AdminCommon';

interface AgencySource {
  id: string;
  name: string;
  url: string;
  tier: 1 | 2 | 3; // Reliability level: Tier 1 (Excellent), Tier 2 (Good), Tier 3 (Speculative)
  logoUrl?: string;
  description?: string;
  createdAt?: string;
}

interface AdminSourcesProps {
  showToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const AdminSources: React.FC<AdminSourcesProps> = ({ showToast }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sources, setSources] = useState<AgencySource[]>([]);

  const [form, setForm] = useState({
    id: '',
    name: '',
    url: '',
    tier: 2 as 1 | 2 | 3,
    logoUrl: '',
    description: '',
  });

  const [editingId, setEditingId] = useState<string | null>(null);

  const loadSources = async () => {
    setLoading(true);
    try {
      const list = await dbGetCollection('sources');
      if (list && list.length > 0) {
        setSources(list);
      } else {
        // Seed default sources
        const defaultSources: AgencySource[] = [
          { id: 'src-1', name: 'Yağız Sabuncuoğlu (Sports Digitale)', url: 'https://twitter.com/yagosabuncuoglu', tier: 1, logoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop', description: 'Fenerbahçe haberleri için en güvenilir yerel Tier 1 kaynak.' },
          { id: 'src-2', name: 'Sercan Hamzaoğlu (Haber Global)', url: 'https://twitter.com/sercanhamzaolu', tier: 1, logoUrl: '', description: 'Güvenilir Samandıra muhabiri. Tier 1.' },
          { id: 'src-3', name: 'Fabrizio Romano', url: 'https://twitter.com/FabrizioRomano', tier: 1, logoUrl: '', description: 'Uluslararası transfer gelişmeleri - Here We Go.' },
          { id: 'src-4', name: 'TRT Spor Duyumu', url: 'https://trtspor.com.tr', tier: 2, logoUrl: '', description: 'Geleneksel basın, resmi gelişmeler.' },
        ];
        for (const src of defaultSources) {
          await dbUpsertDocument('sources', src.id, src);
        }
        setSources(defaultSources);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSources();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const finalId = form.id || `src-${Math.random().toString(36).substr(2, 9)}`;
      const updatedSource: AgencySource = {
        id: finalId,
        name: form.name,
        url: form.url,
        tier: form.tier,
        logoUrl: form.logoUrl,
        description: form.description,
        createdAt: new Date().toISOString()
      };

      await dbUpsertDocument('sources', finalId, updatedSource);

      if (!form.id) {
        setSources(prev => [...prev, updatedSource]);
        if (showToast) showToast('Yeni güvenilir kaynak eklendi.', 'success');
      } else {
        setSources(prev => prev.map(s => s.id === finalId ? updatedSource : s));
        if (showToast) showToast('Kaynak başarıyla güncellendi.', 'success');
        setEditingId(null);
      }

      setForm({ id: '', name: '', url: '', tier: 2, logoUrl: '', description: '' });
    } catch (err) {
      console.error(err);
      if (showToast) showToast('Kaynak kaydedilirken hata oluştu.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (src: AgencySource) => {
    setEditingId(src.id);
    setForm({
      id: src.id,
      name: src.name,
      url: src.url,
      tier: src.tier,
      logoUrl: src.logoUrl || '',
      description: src.description || '',
    });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bu kaynağı silmek istediğinizden emin misiniz?')) return;
    try {
      const stored = await dbGetCollection('sources');
      const remains = stored.filter((s: any) => s.id !== id);
      localStorage.setItem('cms_sources', JSON.stringify(remains));
      
      setSources(prev => prev.filter(s => s.id !== id));
      if (showToast) showToast('Kaynak silindi.', 'success');
    } catch (err) {
      console.error(err);
    }
  };

  const getTierBadge = (tier: number) => {
    switch (tier) {
      case 1:
        return <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-black text-emerald-400 uppercase tracking-widest">TIER 1 (YÜKSEK GÜVENİLİR)</span>;
      case 2:
        return <span className="px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-[9px] font-black text-blue-400 uppercase tracking-widest">TIER 2 (ORTA SEVİYE)</span>;
      case 3:
      default:
        return <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-[9px] font-black text-amber-400 uppercase tracking-widest">TIER 3 (SPEKÜLATİF / SARI BASIN)</span>;
    }
  };

  if (loading) {
    return <div className="text-center py-10 text-fb-yellow text-xs font-black uppercase">KAYNAKLAR ÇEKİLİYOR...</div>;
  }

  return (
    <div className="space-y-6 text-left max-w-4xl mx-auto">
      <div>
        <h2 className="text-xl font-display font-black text-white uppercase italic tracking-wide flex items-center gap-2">
          <ShieldCheck className="text-fb-yellow" size={20} /> Güvenilir Haber ve Transfer Kaynakları
        </h2>
        <p className="text-xs text-fb-muted">
          Transfer dedikodularının ve haberlerin doğruluk payını yönetmek için muhabir / basın kaynağı profilleri oluşturun.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Form */}
        <form onSubmit={handleSubmit} className="md:col-span-5 p-5 rounded-2xl bg-fb-card border border-white/[0.08] h-fit space-y-4">
          <span className="text-[10px] font-black text-fb-yellow uppercase tracking-widest block pb-1 border-b border-white/5">
            {editingId ? 'KAYNAĞI DÜZENLE' : 'YENİ HABER KAYNAĞI EKLE'}
          </span>

          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-bold text-slate-400">MUHABİR / KURUM ADI</label>
            <input
              type="text"
              required
              placeholder="Örn: Yağız Sabuncuoğlu"
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              className="px-3.5 py-2 bg-fb-dark border border-white/10 rounded-xl text-xs text-white"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-bold text-slate-400">MUHABİR SOSYAL MEDYA / BÜLTEN ADRESİ</label>
            <input
              type="url"
              placeholder="https://twitter.com/kullaniciadi"
              value={form.url}
              onChange={e => setForm(p => ({ ...p, url: e.target.value }))}
              className="px-3.5 py-2 bg-fb-dark border border-white/10 rounded-xl text-xs text-white"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-bold text-slate-400">GÜVENİLİRLİK NOTU (TIER LEVEL)</label>
            <select
              value={form.tier}
              onChange={e => setForm(p => ({ ...p, tier: Number(e.target.value) as 1 | 2 | 3 }))}
              className="px-3.5 py-2 bg-fb-dark border border-white/10 rounded-xl text-xs text-white focus:outline-none"
            >
              <option value={1} className="bg-fb-card text-emerald-400">Tier 1: Tamamen Güvenli (Kulübe Yakın)</option>
              <option value={2} className="bg-fb-card text-blue-400">Tier 2: İkincil Basın / Teyite Muhtaç</option>
              <option value={3} className="bg-fb-card text-amber-400">Tier 3: Spekülasyon Odaklı (Sarı Basın)</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-bold text-slate-400 font-mono">SEOLİK LOGO URL'Sİ (OPSİYONEL)</label>
            <input
              type="text"
              placeholder="Örn: https://uploads.com/logo.png"
              value={form.logoUrl}
              onChange={e => setForm(p => ({ ...p, logoUrl: e.target.value }))}
              className="px-3.5 py-2 bg-fb-dark border border-white/10 rounded-xl text-xs text-white font-mono"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-bold text-slate-400">KAYNAK DEKLARASYON NOTU</label>
            <textarea
              rows={2}
              placeholder="Hangi mecrada aktif olduğu, duyum kalitesi gibi ufak detaylar..."
              value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              className="px-3.5 py-2 bg-fb-dark border border-white/10 rounded-xl text-xs text-white resize-none"
            />
          </div>

          <div className="pt-2 flex gap-2">
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setForm({ id: '', name: '', url: '', tier: 2, logoUrl: '', description: '' });
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
            MUKAYESE TABLOSU ({sources.length})
          </span>

          {sources.length === 0 ? (
            <div className="text-center py-10 text-fb-muted text-xs font-semibold">Kayıtlı muhabir veya kaynak bulunmuyor.</div>
          ) : (
            <div className="space-y-3.5">
              {sources.map(src => (
                <div
                  key={src.id}
                  className="p-3.5 rounded-xl border border-white/10 bg-fb-dark/40 flex items-start gap-4 text-left justify-between"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0 overflow-hidden text-fb-yellow font-bold text-xs font-display">
                      {src.logoUrl && src.logoUrl.startsWith('http') ? (
                        <img referrerPolicy="no-referrer" src={src.logoUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        src.name.substring(0, 2).toUpperCase()
                      )}
                    </div>
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-black text-white block truncate max-w-[200px]" title={src.name}>{src.name}</span>
                        {getTierBadge(src.tier)}
                      </div>
                      {src.description && (
                        <p className="text-[11px] text-fb-muted font-bold leading-normal">
                          {src.description}
                        </p>
                      )}
                      {src.url && (
                        <a
                          href={src.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] text-fb-yellow hover:underline flex items-center gap-1 font-mono font-bold"
                        >
                          <LinkIcon size={10} /> {src.url}
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleEdit(src)}
                      className="p-1 rounded bg-white/5 hover:bg-white/10 text-blue-400"
                      title="Düzenle"
                    >
                      <Edit2 size={12} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(src.id)}
                      className="p-1 rounded bg-white/5 hover:bg-white/10 text-rose-400"
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
