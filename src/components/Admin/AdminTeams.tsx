import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Palette,
  ShieldAlert,
  MapPin,
  UserCheck
} from 'lucide-react';
import { dbGetCollection, dbUpsertDocument, dbAddDocument, dbDeleteDocument } from '../../lib/dbService';
import { FirebaseImageUploader, EmptyState } from './AdminCommon';

export const AdminTeams: React.FC = () => {
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Form State
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    slug: '',
    shortName: '',
    logoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop',
    logo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop',
    primaryColor: '#F5C400',
    secondaryColor: '#002F6C',
    league: 'Trendyol Süper Lig',
    country: 'Türkiye',
    stadium: 'Ülker Stadyumu Şükrü Saracoğlu Spor Kompleksi',
    coach: 'Jose Mourinho',
    status: 'active' // active, passive
  });

  const loadData = async () => {
    setLoading(true);
    const list = await dbGetCollection('teams');
    setTeams(list);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleNameChange = (nameVal: string) => {
    const generatedSlug = nameVal.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    setForm(prev => ({
      ...prev,
      name: nameVal,
      slug: generatedSlug
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.shortName) {
      alert("Lütfen takım adı ve kısa adını doldurunuz.");
      return;
    }

    const teamSlug = form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const compiledData = {
      ...form,
      slug: teamSlug,
      logo: form.logoUrl, // both for fallback compatibility
      updatedAt: new Date().toISOString()
    };

    if (editingId) {
      await dbUpsertDocument('teams', editingId, compiledData);
    } else {
      const finalId = `team-${Math.random().toString(36).substr(2, 9)}`;
      await dbUpsertDocument('teams', finalId, {
        ...compiledData,
        id: finalId,
        createdAt: new Date().toISOString()
      });
    }

    setFormOpen(false);
    setEditingId(null);
    loadData();
  };

  const startEdit = (t: any) => {
    setEditingId(t.id);
    setForm({
      name: t.name || '',
      slug: t.slug || '',
      shortName: t.shortName || '',
      logoUrl: t.logoUrl || t.logo || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop',
      logo: t.logo || t.logoUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop',
      primaryColor: t.primaryColor || '#F5C400',
      secondaryColor: t.secondaryColor || '#002F6C',
      league: t.league || 'Trendyol Süper Lig',
      country: t.country || 'Türkiye',
      stadium: t.stadium || 'Ülker Stadyumu Şükrü Saracoğlu Spor Kompleksi',
      coach: t.coach || 'Jose Mourinho',
      status: t.status || 'active'
    });
    setFormOpen(true);
  };

  const openNew = () => {
    setEditingId(null);
    setForm({
      name: '',
      slug: '',
      shortName: '',
      logoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop',
      logo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop',
      primaryColor: '#F5C400',
      secondaryColor: '#002F6C',
      league: 'Trendyol Süper Lig',
      country: 'Türkiye',
      stadium: '',
      coach: '',
      status: 'active'
    });
    setFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Bu takımı tamamen silmek istediğinizden emin misiniz?")) {
      await dbDeleteDocument('teams', id);
      loadData();
    }
  };

  const filtered = teams.filter(t => t.name?.toLowerCase().includes(search.toLowerCase()) || t.shortName?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
        <div>
          <h2 className="text-xl font-display font-black text-white uppercase italic tracking-wide">Takımlar & Kulüp Bilgileri</h2>
          <p className="text-xs text-fb-muted">Maç fikstürü kurmak ve analizleri güncellemek için rakipleri, stadyum, hoca ve lig bilgilerini yönetin.</p>
        </div>
        {!formOpen && (
          <button
            onClick={openNew}
            className="px-5 py-2.5 bg-fb-yellow hover:bg-white text-fb-navy font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
          >
            <Plus size={16} /> Yeni Takım Ekle
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
              {editingId ? 'TAKIMI DÜZENLE' : 'YENİ KULÜP TANIMLA'}
            </h3>
            <button
              type="button"
              onClick={() => setFormOpen(false)}
              className="p-1 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1 col-span-2">
              <label className="text-[10px] font-black uppercase text-slate-400">Takım/Kulüp İsmi *</label>
              <input
                type="text"
                required
                placeholder="Örn: Galatasaray, Beşiktaş, Trabzonspor"
                value={form.name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="px-4 py-2.5 bg-fb-dark border border-white/10 rounded-xl text-xs text-white placeholder-fb-muted focus:border-fb-yellow focus:outline-none font-bold"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black uppercase text-slate-400">Kısa Kod (Short Name) *</label>
              <input
                type="text"
                required
                placeholder="Örn: GS, BJK, FB"
                value={form.shortName}
                onChange={(e) => setForm(p => ({ ...p, shortName: e.target.value }))}
                className="px-4 py-2.5 bg-fb-dark border border-white/10 rounded-xl text-xs text-white uppercase font-bold"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black uppercase text-slate-400">Durumu (Status)</label>
              <select
                value={form.status}
                onChange={(e) => setForm(p => ({ ...p, status: e.target.value }))}
                className="px-3 py-2.5 bg-fb-dark border border-white/10 rounded-xl text-xs text-white cursor-pointer"
              >
                <option value="active">Aktif Lig / Fikstür Rakibi</option>
                <option value="passive">Pasif / Arşiv Takımı</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black uppercase text-slate-400">Bulunduğu Lig</label>
              <input
                type="text"
                placeholder="Örn: Trendyol Süper Lig"
                value={form.league}
                onChange={(e) => setForm(p => ({ ...p, league: e.target.value }))}
                className="px-4 py-2.5 bg-fb-dark border border-white/10 rounded-xl text-xs text-white"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black uppercase text-slate-400">Ülke</label>
              <input
                type="text"
                placeholder="Örn: Türkiye, İspanya, İtalya"
                value={form.country}
                onChange={(e) => setForm(p => ({ ...p, country: e.target.value }))}
                className="px-4 py-2.5 bg-fb-dark border border-white/10 rounded-xl text-xs text-white"
              />
            </div>

            <div className="flex flex-col gap-1 col-span-2">
              <label className="text-[10px] font-black uppercase text-slate-400">Stadyum</label>
              <input
                type="text"
                placeholder="Örn: Rams Park, Vodafone Park"
                value={form.stadium}
                onChange={(e) => setForm(p => ({ ...p, stadium: e.target.value }))}
                className="px-4 py-2.5 bg-fb-dark border border-white/10 rounded-xl text-xs text-white"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black uppercase text-slate-400">Teknik Direktör (Coach)</label>
              <input
                type="text"
                placeholder="Örn: Jose Mourinho, Okan Buruk"
                value={form.coach}
                onChange={(e) => setForm(p => ({ ...p, coach: e.target.value }))}
                className="px-4 py-2.5 bg-fb-dark border border-white/10 rounded-xl text-xs text-white"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black uppercase text-slate-400">Slug Adresi</label>
              <input
                type="text"
                readOnly
                value={form.slug}
                className="px-4 py-2.5 bg-fb-dark/40 border border-white/5 rounded-xl text-xs text-slate-400 font-mono"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1">
                <Palette size={10} /> Birincil Renk (Primary Color)
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={form.primaryColor}
                  onChange={(e) => setForm(p => ({ ...p, primaryColor: e.target.value }))}
                  className="w-10 h-10 bg-transparent border border-white/10 rounded cursor-pointer shrink-0"
                />
                <input
                  type="text"
                  value={form.primaryColor}
                  onChange={(e) => setForm(p => ({ ...p, primaryColor: e.target.value }))}
                  className="flex-1 px-4 py-2 bg-fb-dark border border-white/10 rounded-xl text-xs text-white font-mono"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1">
                <Palette size={10} /> İkincil Renk (Secondary Color)
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={form.secondaryColor}
                  onChange={(e) => setForm(p => ({ ...p, secondaryColor: e.target.value }))}
                  className="w-10 h-10 bg-transparent border border-white/10 rounded cursor-pointer shrink-0"
                />
                <input
                  type="text"
                  value={form.secondaryColor}
                  onChange={(e) => setForm(p => ({ ...p, secondaryColor: e.target.value }))}
                  className="flex-1 px-4 py-2 bg-fb-dark border border-white/10 rounded-xl text-xs text-white font-mono"
                />
              </div>
            </div>
          </div>

          {/* Logo Uploader Component */}
          <FirebaseImageUploader
            folderPath="team-logos"
            idOrSlug={form.slug || 'temp-team'}
            value={form.logoUrl}
            onChange={(url) => setForm(p => ({ ...p, logoUrl: url, logo: url }))}
            label="Kulüp Logosu / Arma Görseli"
          />

          <div className="pt-6 border-t border-white/5 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setFormOpen(false)}
              className="px-4 py-2 bg-white/5 text-slate-300 rounded-xl text-xs font-black uppercase cursor-pointer"
            >
              İptal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-fb-yellow hover:bg-white text-fb-navy rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 cursor-pointer transition-all"
            >
              <Save size={14} /> KAYDET VE YAYINLA
            </button>
          </div>
        </motion.form>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-2 max-w-md bg-fb-dark/60 rounded-xl border border-white/10 px-3.5 py-1.5 shrink-0">
            <Search className="text-fb-muted" size={14} fill="none" />
            <input
              type="text"
              placeholder="Kulüp adı, şehri, hocası veya koduyla filtrele..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent border-0 text-white placeholder-fb-muted text-xs focus:outline-none w-full"
            />
          </div>

          {loading ? (
            <div className="text-center py-20 text-fb-yellow text-xs font-black">TAKIMLAR YÜKLENİYOR...</div>
          ) : filtered.length === 0 ? (
            <EmptyState 
              title="KULÜP BULUNAMADI" 
              text="Fikstürler kurmak ve analizleri geliştirmek için ilk kulüp kartını ekleyin."
              buttonLabel="Hemen Ekle"
              onButtonClick={openNew}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {filtered.map(t => (
                <div key={t.id} className="p-5 rounded-2xl bg-fb-card border border-white/[0.05] hover:border-fb-yellow/20 transition-all flex flex-col justify-between gap-4 text-left">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-4">
                      <div 
                        className="w-12 h-12 rounded-lg p-2 bg-[#0a0f1d] border flex items-center justify-center shrink-0"
                        style={{ borderColor: `${t.primaryColor || '#ffffff'}30` }}
                      >
                        <img src={t.logoUrl || t.logo} alt="" className="w-full h-full object-contain" />
                      </div>
                      <div className="text-left">
                        <h4 className="text-sm font-black text-white uppercase">{t.name}</h4>
                        <span className="text-[10px] text-fb-muted font-bold font-mono">Short: {t.shortName}</span>
                      </div>
                    </div>
                    <span className={`text-[8px] font-black px-1.5 py-0.5 rounded ${t.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-white/5 text-slate-400 border border-white/5'}`}>
                      {t.status === 'active' ? 'AKTİF' : 'ARŞİV'}
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-fb-dark/80 border border-white/5 space-y-1.5 text-[10px] text-slate-300 font-semibold">
                    <div className="flex items-center gap-1.5">
                      <MapPin size={11} className="text-fb-yellow shrink-0" />
                      <span className="truncate">{t.stadium || 'Stadyum girilmemiş'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <UserCheck size={11} className="text-fb-yellow shrink-0" />
                      <span className="truncate">Hoca: {t.coach || 'Bilinmiyor'}</span>
                    </div>
                    <div className="text-[9px] text-fb-muted text-right mt-1 font-bold italic">
                      {t.league} • {t.country}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                    <div className="flex gap-1">
                      <div className="w-4 h-4 rounded-full border border-white/10" style={{ backgroundColor: t.primaryColor }} title="Primary Color" />
                      <div className="w-4 h-4 rounded-full border border-white/10" style={{ backgroundColor: t.secondaryColor }} title="Secondary Color" />
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(t)}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition-colors border border-white/10 cursor-pointer"
                      >
                        <Edit size={12} />
                      </button>
                      <button
                        onClick={() => handleDelete(t.id)}
                        className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-colors border border-red-500/10 cursor-pointer"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
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
