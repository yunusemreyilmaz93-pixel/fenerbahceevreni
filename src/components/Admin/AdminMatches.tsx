import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { 
  Calendar, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Users, 
  Play, 
  CheckCircle,
  Clock,
  Briefcase,
  Sliders,
  Sparkle,
  Star
} from 'lucide-react';
import { dbGetCollection, dbUpsertDocument, dbAddDocument, dbDeleteDocument } from '../../lib/dbService';
import { DeleteConfirmModal, EmptyState, StatusBadge } from './AdminCommon';
import { formatDate } from '../../lib/adminHelpers';

interface AdminMatchesProps {
  showToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
  initiateCreate?: boolean;
}

export const AdminMatches: React.FC<AdminMatchesProps> = ({ showToast, initiateCreate }) => {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  // Form states
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  // Modal actions
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [form, setForm] = useState({
    homeTeam: 'Fenerbahçe',
    awayTeam: '',
    competition: 'Trendyol Süper Lig • 36. Hafta',
    matchDate: '2026-05-30T20:00:00',
    venue: 'Ülker Stadyumu Şükrü Saracoğlu Spor Kompleksi / Kadıköy',
    status: 'upcoming',
    scoreHome: 0,
    scoreAway: 0,
    matchPreview: '',
    featured: false,
    // Lineups
    formation: '4-2-3-1',
    GK: 'Dominik Livaković',
    RB: 'Bright Osayi-Samuel',
    CB1: 'Alexander Djiku',
    CB2: 'Çağlar Söyüncü',
    LB: 'Ferdi Kadıoğlu',
    DM1: 'İsmail Yüksek',
    DM2: 'Fred',
    RW: 'İrfan Can Kahveci',
    AM: 'Sebastian Szymański',
    LW: 'Dušan Tadić',
    CF: 'Edin Džeko'
  });

  const loadData = async () => {
    setLoading(true);
    const list = await dbGetCollection('matches');
    setMatches(list);
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

  const handleFormChange = (field: string, val: any) => {
    setIsDirty(true);
    setForm(prev => ({
      ...prev,
      [field]: val
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.awayTeam) {
      alert("Lütfen rakip takım adını giriniz.");
      return;
    }

    const compiledData = {
      homeTeam: form.homeTeam,
      awayTeam: form.awayTeam,
      competition: form.competition,
      matchDate: form.matchDate,
      venue: form.venue,
      status: form.status,
      scoreHome: Number(form.scoreHome),
      scoreAway: Number(form.scoreAway),
      matchPreview: form.matchPreview,
      featured: !!form.featured,
      probableXI: {
        formation: form.formation,
        GK: form.GK,
        RB: form.RB,
        CB1: form.CB1,
        CB2: form.CB2,
        LB: form.LB,
        DM1: form.DM1,
        DM2: form.DM2,
        RW: form.RW,
        AM: form.AM,
        LW: form.LW,
        CF: form.CF
      },
      updatedAt: new Date().toISOString()
    };

    try {
      if (editingId) {
        await dbUpsertDocument('matches', editingId, compiledData);
        if (showToast) showToast("Maç detayları ve taktik kadro kaydedildi.", "success");
      } else {
        await dbAddDocument('matches', {
          ...compiledData,
          id: `match-${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date().toISOString()
        });
        if (showToast) showToast("Yeni maç fikstürü başarıyla eklendi.", "success");
      }

      setFormOpen(false);
      setEditingId(null);
      setIsDirty(false);
      loadData();
    } catch (err) {
      console.error(err);
      if (showToast) showToast("Maç kaydedilirken hata oluştur.", "error");
    }
  };

  const startEdit = (m: any) => {
    setEditingId(m.id);
    const xi = m.probableXI || {};
    setForm({
      homeTeam: m.homeTeam || 'Fenerbahçe',
      awayTeam: m.awayTeam || '',
      competition: m.competition || 'Trendyol Süper Lig • 36. Hafta',
      matchDate: m.matchDate || '2026-05-30T20:00:00',
      venue: m.venue || 'Ülker Stadyumu Kadıköy',
      status: m.status || 'upcoming',
      scoreHome: m.scoreHome || 0,
      scoreAway: m.scoreAway || 0,
      matchPreview: m.matchPreview || '',
      featured: !!m.featured,
      formation: xi.formation || '4-2-3-1',
      GK: xi.GK || 'Dominik Livaković',
      RB: xi.RB || 'Bright Osayi-Samuel',
      CB1: xi.CB1 || 'Alexander Djiku',
      CB2: xi.CB2 || 'Çağlar Söyüncü',
      LB: xi.LB || 'Ferdi Kadıoğlu',
      DM1: xi.DM1 || 'İsmail Yüksek',
      DM2: xi.DM2 || 'Fred',
      RW: xi.RW || 'İrfan Can Kahveci',
      AM: xi.AM || 'Sebastian Szymański',
      LW: xi.LW || 'Dušan Tadić',
      CF: xi.CF || 'Edin Džeko'
    });
    setFormOpen(true);
    setIsDirty(false);
  };

  const openNew = () => {
    setEditingId(null);
    setForm({
      homeTeam: 'Fenerbahçe',
      awayTeam: '',
      competition: 'Trendyol Süper Lig • 36. Hafta',
      matchDate: '2026-05-30T20:00:00',
      venue: 'Ülker Stadyumu Şükrü Saracoğlu Spor Kompleksi / Kadıköy',
      status: 'upcoming',
      scoreHome: 0,
      scoreAway: 0,
      matchPreview: '',
      featured: false,
      formation: '4-2-3-1',
      GK: 'Dominik Livaković',
      RB: 'Bright Osayi-Samuel',
      CB1: 'Alexander Djiku',
      CB2: 'Çağlar Söyüncü',
      LB: 'Ferdi Kadıoğlu',
      DM1: 'İsmail Yüksek',
      DM2: 'Fred',
      RW: 'İrfan Can Kahveci',
      AM: 'Sebastian Szymański',
      LW: 'Dušan Tadić',
      CF: 'Edin Džeko'
    });
    setFormOpen(true);
    setIsDirty(false);
  };

  const executeDelete = async () => {
    if (!deleteId) return;
    try {
      await dbDeleteDocument('matches', deleteId);
      if (showToast) showToast("Müsabaka fikstürü sistemden silindi.", "success");
      loadData();
    } catch (err) {
      console.error(err);
      if (showToast) showToast("Silme işlemi gerçekleşemedi.", "error");
    } finally {
      setDeleteId(null);
    }
  };

  const toggleFeatured = async (matchItem: any) => {
    const nextFeatured = !matchItem.featured;
    try {
      await dbUpsertDocument('matches', matchItem.id, { featured: nextFeatured });
      if (showToast) showToast(nextFeatured ? "Karşılaşma öne çıkarıldı." : "Müsabaka öne çıkarılması kaldırıldı.", "success");
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const filtered = matches.filter(m => {
    const matchesSearch = m.awayTeam?.toLowerCase().includes(search.toLowerCase()) || 
                          m.homeTeam?.toLowerCase().includes(search.toLowerCase()) ||
                          m.competition?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'All' || m.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
        <div>
          <h2 className="text-xl font-display font-black text-white uppercase italic tracking-wide flex items-center gap-2">
            <Calendar className="text-fb-yellow" size={20} /> Maç Merkezi Karşılaşma Yönetimi
          </h2>
          <p className="text-xs text-[#8e9bb8]">Fikstürleri, güncel skorları ve muhtemel taktik 11'leri yönetin.</p>
        </div>
        {!formOpen && (
          <button
            onClick={openNew}
            className="px-5 py-2.5 bg-fb-yellow hover:bg-white text-fb-navy font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
          >
            <Plus size={16} /> Yeni Karşılaşma Ekle
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
              {editingId ? 'MÜSABAKA VE KADRO GÜNCELLEME' : 'YENİ KARŞILAŞMA VE ANALİZ EKLE'}
            </h3>
            <button
              type="button"
              onClick={handleCloseFormAttempt}
              className="p-1 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* LHS: Match details */}
            <div className="space-y-4">
              <span className="text-[10px] font-black text-fb-yellow tracking-widest uppercase block pb-1 border-b border-white/5">1. KARŞILAŞMA VE SAHA BİLGİLERİ</span>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Ev Sahibi Takım *</label>
                  <input
                    type="text"
                    required
                    value={form.homeTeam}
                    onChange={(e) => handleFormChange('homeTeam', e.target.value)}
                    className="px-4 py-2.5 bg-fb-dark border border-white/15 rounded-xl text-xs text-white"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Deplasman Takım *</label>
                  <input
                    type="text"
                    required
                    value={form.awayTeam}
                    onChange={(e) => handleFormChange('awayTeam', e.target.value)}
                    placeholder="Rakip Kulüp Adı"
                    className="px-4 py-2.5 bg-fb-dark border border-white/15 rounded-xl text-xs text-white font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Turnuva / Lig Seviyesi</label>
                  <input
                    type="text"
                    value={form.competition}
                    onChange={(e) => handleFormChange('competition', e.target.value)}
                    className="px-4 py-2.5 bg-fb-dark border border-white/15 rounded-xl text-xs text-white"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Maç Tarihi ve Saati</label>
                  <input
                    type="datetime-local"
                    value={form.matchDate}
                    onChange={(e) => handleFormChange('matchDate', e.target.value)}
                    className="px-4 py-2.5 bg-fb-dark border border-white/15 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-slate-400 font-bold uppercase">Stadyum / Yerleşke</label>
                <input
                  type="text"
                  value={form.venue}
                  onChange={(e) => handleFormChange('venue', e.target.value)}
                  className="px-4 py-2.5 bg-fb-dark border border-white/15 rounded-xl text-xs text-white"
                />
              </div>

              <div className="p-4 rounded-xl bg-fb-dark/30 border border-white/5 space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="flex flex-col gap-1 col-span-1">
                    <label className="text-[10px] text-slate-400 font-bold uppercase">Maç Durumu</label>
                    <select
                      value={form.status}
                      onChange={(e) => handleFormChange('status', e.target.value)}
                      className="px-2 py-2.5 bg-fb-dark border border-white/15 rounded-lg text-xs text-white [&>option]:bg-fb-card"
                    >
                      <option value="upcoming">Gelecek Maç (Upcoming)</option>
                      <option value="live">Canlı Oynanıyor (Live)</option>
                      <option value="completed">Bitti (Completed)</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1 col-span-1">
                    <label className="text-[10px] text-slate-400 font-bold uppercase">Ev Sahibi Skor</label>
                    <input
                      type="number"
                      min="0"
                      value={form.scoreHome}
                      onChange={(e) => handleFormChange('scoreHome', e.target.value)}
                      className="px-2 py-2 bg-fb-dark border border-white/15 rounded-lg text-xs text-white font-bold"
                    />
                  </div>

                  <div className="flex flex-col gap-1 col-span-1">
                    <label className="text-[10px] text-slate-400 font-bold uppercase">Deplasman Skor</label>
                    <input
                      type="number"
                      min="0"
                      value={form.scoreAway}
                      onChange={(e) => handleFormChange('scoreAway', e.target.value)}
                      className="px-2 py-2 bg-fb-dark border border-white/15 rounded-lg text-xs text-white font-bold"
                    />
                  </div>
                </div>

                <div className="h-px bg-white/5" />

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) => handleFormChange('featured', e.target.checked)}
                    className="w-4 h-4 accent-fb-yellow cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-black text-white block">HAFTANIN EN ÖNEMLİ MAÇI</span>
                    <span className="text-[10px] text-[#8e9bb8] font-semibold">Maç merkezi sayfasında en üst kısma dev banner olarak kilitler.</span>
                  </div>
                </label>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-slate-400 font-bold uppercase">Maç Önü Analiz Notları (Previews / Key info)</label>
                <textarea
                  value={form.matchPreview}
                  onChange={(e) => handleFormChange('matchPreview', e.target.value)}
                  rows={4}
                  placeholder="Kritik taktiksel planlar, rakibin zayıf yönleri ve eksik oyuncu listeleri..."
                  className="px-4 py-3 bg-fb-dark border border-white/15 rounded-xl text-xs text-slate-300 leading-relaxed focus:outline-none focus:border-fb yellow"
                />
              </div>
            </div>

            {/* RHS: Kadrolar (Lineups) */}
            <div className="space-y-4">
              <span className="text-[10px] font-black text-fb-yellow tracking-widest uppercase block pb-1 border-b border-white/5">2. TARAFTAR MUHTEMEL 11 & TAKTİK DİZİLİŞ</span>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-slate-400 font-bold uppercase">Saha Formasyonu (Diziliş)</label>
                <select
                  value={form.formation}
                  onChange={(e) => handleFormChange('formation', e.target.value)}
                  className="px-3 py-2.5 bg-fb-dark border border-white/15 rounded-xl text-xs text-white focus:outline-none"
                >
                  <option value="4-2-3-1">4-2-3-1 (Jose Mourinho Klasik)</option>
                  <option value="4-3-3">4-3-3 (Ofansif Pres)</option>
                  <option value="3-5-2">3-5-2 (Çift Forvetli Kanat Baskısı)</option>
                  <option value="4-4-2">4-4-2 (Klasik Dengeli Yapı)</option>
                </select>
              </div>

              <div className="p-4 rounded-xl bg-fb-dark/40 border border-white/5 grid grid-cols-2 gap-3.5">
                <div className="flex flex-col gap-0.5 col-span-2">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">KALECİ & DEFANS KADROSU</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <label className="text-[9px] text-[#8e9bb8]">GK (Kaleci)</label>
                  <input type="text" value={form.GK} onChange={(e) => handleFormChange('GK', e.target.value)} className="bg-fb-card text-xs text-white p-1.5 rounded border border-white/10" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <label className="text-[9px] text-[#8e9bb8]">RB (Sağ Bek)</label>
                  <input type="text" value={form.RB} onChange={(e) => handleFormChange('RB', e.target.value)} className="bg-fb-card text-xs text-white p-1.5 rounded border border-white/10" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <label className="text-[9px] text-[#8e9bb8]">CB1 (Sol Stoper)</label>
                  <input type="text" value={form.CB1} onChange={(e) => handleFormChange('CB1', e.target.value)} className="bg-fb-card text-xs text-white p-1.5 rounded border border-white/10" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <label className="text-[9px] text-[#8e9bb8]">CB2 (Sağ Stoper)</label>
                  <input type="text" value={form.CB2} onChange={(e) => handleFormChange('CB2', e.target.value)} className="bg-fb-card text-xs text-white p-1.5 rounded border border-white/10" />
                </div>
                <div className="flex flex-col gap-0.5 col-span-2">
                  <label className="text-[9px] text-[#8e9bb8]">LB (Sol Bek)</label>
                  <input type="text" value={form.LB} onChange={(e) => handleFormChange('LB', e.target.value)} className="bg-fb-card text-xs text-white p-1.5 rounded border border-white/10 w-full" />
                </div>

                <div className="flex flex-col gap-0.5 col-span-2 mt-2 pt-2 border-t border-white/5">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">ORTA SAHA & KOORDİNASYON</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <label className="text-[9px] text-[#8e9bb8]">DM1 (Defansif Merkez 1)</label>
                  <input type="text" value={form.DM1} onChange={(e) => handleFormChange('DM1', e.target.value)} className="bg-fb-card text-xs text-white p-1.5 rounded border border-white/10" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <label className="text-[9px] text-[#8e9bb8]">DM2 (Defansif Merkez 2)</label>
                  <input type="text" value={form.DM2} onChange={(e) => handleFormChange('DM2', e.target.value)} className="bg-fb-card text-xs text-white p-1.5 rounded border border-white/10" />
                </div>
                <div className="flex flex-col gap-0.5 col-span-2">
                  <label className="text-[9px] text-[#8e9bb8]">AM (Ofansif Merkez On Numara)</label>
                  <input type="text" value={form.AM} onChange={(e) => handleFormChange('AM', e.target.value)} className="bg-fb-card text-xs text-white p-1.5 rounded border border-white/10 w-full" />
                </div>

                <div className="flex flex-col gap-0.5 col-span-2 mt-2 pt-2 border-t border-white/5">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">HÜCUM HATTI</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <label className="text-[9px] text-[#8e9bb8]">RW (Sağ Açık)</label>
                  <input type="text" value={form.RW} onChange={(e) => handleFormChange('RW', e.target.value)} className="bg-fb-card text-xs text-white p-1.5 rounded border border-white/10" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <label className="text-[9px] text-[#8e9bb8]">LW (Sol Açık)</label>
                  <input type="text" value={form.LW} onChange={(e) => handleFormChange('LW', e.target.value)} className="bg-fb-card text-xs text-white p-1.5 rounded border border-white/10" />
                </div>
                <div className="flex flex-col gap-0.5 col-span-2">
                  <label className="text-[9px] text-[#8e9bb8]">CF (Merkez Santrafor/Forvet)</label>
                  <input type="text" value={form.CF} onChange={(e) => handleFormChange('CF', e.target.value)} className="bg-fb-card text-xs text-white p-1.5 rounded border border-white/10 w-full" />
                </div>

              </div>

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
              <Save size={14} /> FİKSTÜRÜ KAYDET VE SENKRONİZE ET
            </button>
          </div>
        </motion.form>
      ) : (
        <div className="space-y-4 text-left">
          
          {/* FILTER AND SEARCH CONTROLS */}
          <div className="p-4 rounded-xl bg-fb-card border border-white/[0.05] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-fb-muted" />
              <input
                type="text"
                placeholder="Takım adı veya turnuva grubunda ara..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-fb-dark border border-white/10 text-xs text-white placeholder-fb-muted focus:outline-none"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-fb-dark border border-white/10 text-xs px-2.5 py-2 rounded-xl text-slate-300 w-full focus:outline-none"
            >
              <option value="All">Tüm Maçlar</option>
              <option value="upcoming">Gelecek Fikstürler</option>
              <option value="live">Canlı Mücadeleler</option>
              <option value="completed">Oynanıp Bitenler</option>
            </select>
          </div>

          {/* DYNAMIC LIST */}
          {loading ? (
            <div className="text-center py-20 text-fb-yellow text-xs font-black">OYUN FİKSTÜRLERİ YÜKLENİYOR...</div>
          ) : filtered.length === 0 ? (
            <EmptyState
              title="Karşılaşma bulunamadı."
              text="Maç Merkezi sayfasında listelenecek bir müsabaka kaydı mevcut değil. Yeni bir tane ekleyin!"
              buttonLabel="Yeni Karşılaşma Ekle"
              onButtonClick={openNew}
              icon={<Calendar size={20} />}
            />
          ) : (
            <div className="rounded-2xl border border-white/[0.06] overflow-hidden bg-fb-card">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left min-w-[750px]">
                  <thead>
                    <tr className="border-b border-white/[0.06] bg-[#0c1223]/60 text-[10px] font-black uppercase text-fb-muted tracking-widest">
                      <th className="p-4 pl-6">Müsabaka Eşleşmesi</th>
                      <th className="p-4">Turnuva Seviyesi</th>
                      <th className="p-4">Tarih</th>
                      <th className="p-4">Maç Durumu</th>
                      <th className="p-4 text-center">Öne Çıkar</th>
                      <th className="p-4 pr-6 text-right">Eylemler</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {filtered.map((m) => (
                      <tr key={m.id} className="hover:bg-white/[0.01] transition-colors">
                        <td className="p-4 pl-6">
                          <div className="space-y-0.5">
                            <h4 className="text-xs font-black text-white">{m.homeTeam} vs {m.awayTeam}</h4>
                            <p className="text-[10px] text-fb-muted">📍 {m.venue || 'Şükrü Saracoğlu Spor Kompleksi'}</p>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="text-[10px] font-black uppercase text-slate-300">{m.competition}</span>
                        </td>
                        <td className="p-4">
                          <span className="text-xs text-slate-300 font-mono font-semibold">{formatDate(m.matchDate)}</span>
                        </td>
                        <td className="p-4">
                          {m.status === 'live' ? (
                            <span className="px-2 py-1 rounded bg-red-500/10 border border-red-500/20 text-[9px] font-black text-red-400 uppercase tracking-widest animate-pulse">
                              ● Canlı {m.scoreHome} - {m.scoreAway}
                            </span>
                          ) : m.status === 'completed' ? (
                            <span className="px-2 py-1 rounded bg-[#10b981]/15 border border-[#10b981]/25 text-[9px] font-black text-emerald-400 uppercase tracking-widest whitespace-nowrap">
                              Skor: {m.scoreHome} - {m.scoreAway} (Bitti)
                            </span>
                          ) : (
                            <span className="px-2 py-1 rounded bg-blue-500/10 border border-blue-500/20 text-[9px] font-black text-blue-400 uppercase tracking-widest whitespace-nowrap">
                              Gelecek Maç
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          <button
                            type="button"
                            onClick={() => toggleFeatured(m)}
                            className={`p-1.5 rounded-lg border cursor-pointer transition-all ${
                              m.featured
                                ? 'bg-fb-yellow/10 border-fb-yellow/20 text-fb-yellow'
                                : 'bg-transparent border-white/5 text-slate-500 hover:text-white'
                            }`}
                            title="Haftanın Maçı Olarak Belirle ve Banner Yap"
                          >
                            <Star size={14} className={m.featured ? 'fill-fb-yellow' : ''} />
                          </button>
                        </td>
                        <td className="p-4 pr-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => startEdit(m)}
                              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 hover:text-fb-yellow text-slate-300 border border-white/10 cursor-pointer"
                              title="Detaylı Kadro ve Bilgileri Düzenle"
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              onClick={() => setDeleteId(m.id)}
                              className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/10 cursor-pointer"
                              title="Maçı Fikstürden Kaldır"
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

      {/* REUSABLE DELETE MODAL */}
      <DeleteConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={executeDelete}
        title="Bu maçı fikstürden kalıcı olarak silmek istediğine emin misin?"
        message="Bu işlem geri alınamaz ve tüm ilişkili maç özellikleri kaldırılır."
      />
    </div>
  );
};
