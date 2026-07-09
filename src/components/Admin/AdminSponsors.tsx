import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { 
  Image, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Eye, 
  ToggleLeft, 
  ToggleRight
} from 'lucide-react';
import { dbGetCollection, dbUpsertDocument, dbAddDocument, dbDeleteDocument } from '../../lib/dbService';
import { FirebaseImageUploader } from './AdminCommon';

export const AdminSponsors: React.FC = () => {
  const [sponsors, setSponsors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    logo: '',
    link: '',
    position: 'footer',
    active: true
  });

  const loadData = async () => {
    setLoading(true);
    const list = await dbGetCollection('sponsors');
    setSponsors(list);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.link) {
      alert("Lütfen sponsor adını ve bağlantı URL adresini giriniz.");
      return;
    }

    const compiledData = {
      ...form,
      logoUrl: form.logo,
      updatedAt: new Date().toISOString()
    };

    if (editingId) {
      await dbUpsertDocument('sponsors', editingId, compiledData);
    } else {
      await dbAddDocument('sponsors', {
        ...compiledData,
        id: `spn-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString()
      });
    }

    setFormOpen(false);
    setEditingId(null);
    loadData();
  };

  const startEdit = (s: any) => {
    setEditingId(s.id);
    setForm({
      name: s.name || '',
      logo: s.logo || '',
      link: s.link || '',
      position: s.position || 'footer',
      active: !!s.active
    });
    setFormOpen(true);
  };

  const openNew = () => {
    setEditingId(null);
    setForm({
      name: '',
      logo: '',
      link: 'https://',
      position: 'footer',
      active: true
    });
    setFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Bu sponsor/reklam kaydını tamamen kaldırmak istediğinizden emin misiniz?")) {
      await dbDeleteDocument('sponsors', id);
      loadData();
    }
  };

  const toggleCampaignActive = async (s: any) => {
    await dbUpsertDocument('sponsors', s.id, { active: !s.active });
    loadData();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
        <div>
          <h2 className="text-xl font-display font-black text-white uppercase italic tracking-wide">Sponsorlar & Reklam Yönetimi</h2>
          <p className="text-xs text-fb-muted">Menü, altbilgi (footer) ve yan panel reklam kampanyaları ile sponsor firma yönlendirmelerini düzenleyin.</p>
        </div>
        {!formOpen && (
          <button
            onClick={openNew}
            className="px-5 py-2.5 bg-fb-yellow hover:bg-white text-fb-navy font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
          >
            <Plus size={16} /> Yeni Sponsor Ekle
          </button>
        )}
      </div>

      {formOpen ? (
        <motion.form
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSave}
          className="p-6 rounded-2xl bg-fb-card border border-white/[0.08] space-y-6 text-left max-w-2xl mx-auto"
        >
          <div className="flex items-center justify-between pb-4 border-b border-white/5">
            <h3 className="text-xs font-black uppercase tracking-widest text-fb-yellow">
              {editingId ? 'SPONSOR AYARLARINI DÜZENLE' : 'YENİ REKLAM/SPONSOR KAMPANYASI AÇ'}
            </h3>
            <button
              type="button"
              onClick={() => setFormOpen(false)}
              className="p-1 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black uppercase text-slate-400">Marka / Sponsor İsmi *</label>
              <input
                type="text"
                required
                placeholder="Örn: Puma, Nesine..."
                value={form.name}
                onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))}
                className="px-4 py-2.5 bg-fb-dark border border-white/15 rounded-xl text-xs text-white placeholder-fb-muted focus:border-fb-yellow focus:outline-none font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black uppercase text-slate-400">Sayfa Yerleşimi (Pozisyon)</label>
                <select
                  value={form.position}
                  onChange={(e) => setForm(p => ({ ...p, position: e.target.value }))}
                  className="px-3 py-2.5 bg-fb-dark border border-white/15 rounded-xl text-xs text-white"
                >
                  <option value="footer">Altbilgi (Footer Logo)</option>
                  <option value="sidebar">Yan Menü Banners (Sidebar)</option>
                  <option value="header">Üst Menü Banners (Header)</option>
                </select>
              </div>

              <div className="flex items-center gap-3 pt-6">
                <input
                  type="checkbox"
                  id="sponActive"
                  checked={form.active}
                  onChange={(e) => setForm(p => ({ ...p, active: e.target.checked }))}
                  className="w-4 h-4 accent-fb-yellow cursor-pointer"
                />
                <label htmlFor="sponActive" className="text-xs font-black uppercase text-white cursor-pointer select-none">Kampanya Aktif olsun</label>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black uppercase text-slate-400">Hedef Yönlendirme Bağlantısı (Link URL) *</label>
              <input
                type="text"
                required
                placeholder="https://sporsponsoru.com/kampanya"
                value={form.link}
                onChange={(e) => setForm(p => ({ ...p, link: e.target.value }))}
                className="px-4 py-2.5 bg-fb-dark border border-white/15 rounded-xl text-xs text-fb-yellow focus:border-fb-yellow focus:outline-none"
              />
            </div>

            <FirebaseImageUploader
              folderPath="sponsor-logos"
              idOrSlug={editingId || `spn-${Math.random().toString(36).substr(2, 5)}`}
              value={form.logo}
              onChange={(url) => setForm(p => ({ ...p, logo: url }))}
              label="Sponsor Logo / Banner Görseli"
            />
          </div>

          <div className="pt-6 border-t border-white/5 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setFormOpen(false)}
              className="px-4 py-2 bg-white/5 text-slate-300 rounded-xl text-xs font-black uppercase"
            >
              İptal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-fb-yellow hover:bg-white text-fb-navy rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 cursor-pointer"
            >
              <Save size={14} /> SPONSORU DIŞA AKTAR
            </button>
          </div>
        </motion.form>
      ) : (
        /* SPONSORS LIST */
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-20 text-fb-yellow text-xs font-black">SPONSORLAR YÜKLENİYOR...</div>
          ) : sponsors.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-fb-card border border-white/[0.05] text-slate-400 text-xs gap-3">
              Mevcut sponsor firma kaydı bulunmamaktadır.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sponsors.map(s => (
                <div key={s.id} className="p-5 rounded-2xl bg-fb-card border border-white/[0.05] space-y-4 text-left flex flex-col justify-between">
                  <div className="flex justify-between items-start gap-4">
                    <span className="text-[10px] font-black text-fb-yellow uppercase tracking-widest">YERLEŞİM: {s.position}</span>
                    <button
                      onClick={() => toggleCampaignActive(s)}
                      className="cursor-pointer"
                    >
                      {s.active ? (
                        <span className="px-2.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-black text-emerald-400">● Kampanya Aktif</span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded bg-red-500/10 border border-red-500/20 text-[9px] font-black text-red-400">○ Pasif</span>
                      )}
                    </button>
                  </div>

                  <div className="flex items-center gap-4 py-1">
                    <div className="w-12 h-12 rounded-lg bg-[#070b13] border border-white/10 flex items-center justify-center p-1.5 shrink-0">
                      <img src={s.logo} alt="" className="w-full h-full object-contain" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-black text-white truncate max-w-[150px]">{s.name}</h4>
                      <p className="text-[10px] text-fb-muted truncate max-w-[150px] font-mono mt-0.5">{s.link}</p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/5 flex justify-end gap-2">
                    <button
                      onClick={() => startEdit(s)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10"
                    >
                      <Edit size={12} />
                    </button>
                    <button
                      onClick={() => handleDelete(s.id)}
                      className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/10"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
