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
  TrendingUp, 
  TrendingDown, 
  Minus,
  Star,
  Activity,
  Calendar
} from 'lucide-react';
import { dbGetCollection, dbUpsertDocument, dbAddDocument, dbDeleteDocument } from '../../lib/dbService';
import { FirebaseImageUploader } from './AdminCommon';

export const AdminPlayers: React.FC = () => {
  const [players, setPlayers] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterSeason, setFilterSeason] = useState('All');

  // Form State
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [customSeasonInput, setCustomSeasonInput] = useState('');
  const [showCustomSeason, setShowCustomSeason] = useState(false);

  const [form, setForm] = useState({
    name: '',
    shirtNumber: 10,
    position: 'Merkez Orta Saha',
    secondaryPosition: 'On Numara',
    age: 26,
    height: 180,
    preferredFoot: 'Sağ Ayak',
    contractEndDate: '2027-06-30',
    marketValue: '€15M',
    nationality: 'Türkiye',
    photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop',
    formRating: '8.2',
    lastMatchRating: '8.5',
    trend: 'stabil',
    strengths: 'Oyun Görüşü, Kısa Pas Verimliliği',
    weaknesses: 'Fizik Mücadele Gücü',
    analysis: '',
    status: 'active', // active, injured, loaned, left, new transfer
    season: '2025/26', // 2025/26, 2026/27, Custom
    teamRelation: 'Fenerbahçe',
    firstXI: false
  });

  const loadData = async () => {
    setLoading(true);
    const list = await dbGetCollection('players');
    const teamsList = await dbGetCollection('teams');
    setPlayers(list);
    setTeams(teamsList);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) {
      alert("Lütfen oyuncu adını giriniz.");
      return;
    }

    const playerSlug = form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const activeSeason = showCustomSeason && customSeasonInput ? customSeasonInput : form.season;

    const compiledData = {
      ...form,
      season: activeSeason,
      slug: playerSlug,
      photoUrl: form.photo,
      age: Number(form.age),
      height: Number(form.height),
      shirtNumber: Number(form.shirtNumber),
      strengths: typeof form.strengths === 'string' ? form.strengths.split(',').map(s => s.trim()).filter(Boolean) : form.strengths,
      weaknesses: typeof form.weaknesses === 'string' ? form.weaknesses.split(',').map(w => w.trim()).filter(Boolean) : form.weaknesses,
      updatedAt: new Date().toISOString()
    };

    if (editingId) {
      await dbUpsertDocument('players', editingId, compiledData);
    } else {
      await dbAddDocument('players', {
        ...compiledData,
        id: `plyr-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString()
      });
    }

    setFormOpen(false);
    setEditingId(null);
    setShowCustomSeason(false);
    setCustomSeasonInput('');
    loadData();
  };

  const startEdit = (p: any) => {
    setEditingId(p.id);
    const strengthsVal = Array.isArray(p.strengths) ? p.strengths.join(', ') : (p.strengths || '');
    const weaknessesVal = Array.isArray(p.weaknesses) ? p.weaknesses.join(', ') : (p.weaknesses || '');
    
    const isCustomSeason = p.season !== '2025/26' && p.season !== '2026/27' && p.season;
    
    setForm({
      name: p.name || '',
      shirtNumber: p.shirtNumber || 10,
      position: p.position || 'Merkez Orta Saha',
      secondaryPosition: p.secondaryPosition || '',
      age: p.age || 26,
      height: p.height || 180,
      preferredFoot: p.preferredFoot || 'Sağ Ayak',
      contractEndDate: p.contractEndDate || '2027-06-30',
      marketValue: p.marketValue || '€15M',
      nationality: p.nationality || 'Türkiye',
      photo: p.photo || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop',
      formRating: p.formRating || '8.2',
      lastMatchRating: p.lastMatchRating || '8.5',
      trend: p.trend || 'stabil',
      strengths: strengthsVal,
      weaknesses: weaknessesVal,
      analysis: p.analysis || '',
      status: p.status || 'active',
      season: isCustomSeason ? 'Custom' : (p.season || '2025/26'),
      teamRelation: p.teamRelation || 'Fenerbahçe',
      firstXI: !!p.firstXI
    });

    if (isCustomSeason) {
      setShowCustomSeason(true);
      setCustomSeasonInput(p.season);
    } else {
      setShowCustomSeason(false);
    }
    setFormOpen(true);
  };

  const openNew = () => {
    setEditingId(null);
    setShowCustomSeason(false);
    setCustomSeasonInput('');
    setForm({
      name: '',
      shirtNumber: 10,
      position: 'Merkez Orta Saha',
      secondaryPosition: 'On Numara',
      age: 26,
      height: 180,
      preferredFoot: 'Sağ Ayak',
      contractEndDate: '2027-06-30',
      marketValue: '€15M',
      nationality: 'Türkiye',
      photo: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop',
      formRating: '8.2',
      lastMatchRating: '8.5',
      trend: 'stabil',
      strengths: 'Oyun Görüşü, Kısa Pas Verimliliği',
      weaknesses: 'İkili Mücadele Eşiği',
      analysis: 'Fenerbahçe orta alanı için kritik öneme sahip kreatif lider.',
      status: 'active',
      season: '2025/26',
      teamRelation: 'Fenerbahçe',
      firstXI: false
    });
    setFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Bu oyuncuyu kadro listesinden silmek istediğinizden emin misiniz?")) {
      await dbDeleteDocument('players', id);
      loadData();
    }
  };

  const filtered = players.filter(p => {
    const matchesSearch = p.name?.toLowerCase().includes(search.toLowerCase()) || 
                          p.position?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'All' || p.status === filterStatus;
    const matchesSeason = filterSeason === 'All' || p.season === filterSeason;
    return matchesSearch && matchesStatus && matchesSeason;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-display font-black text-white uppercase italic tracking-wide">Kadro / Oyuncu Yönetim Paneli</h2>
          <p className="text-xs text-fb-muted">Kadro sezonlarını arşivleyin, oyuncu sağlık, kiralık durumlarını ve birinci 11 adaylarını kod yazmadan yönetin.</p>
        </div>
        {!formOpen && (
          <button
            onClick={openNew}
            className="px-5 py-2.5 bg-fb-yellow hover:bg-white text-fb-navy font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
          >
            <Plus size={16} /> Yeni Oyuncu Ekle
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
              {editingId ? 'OYUNCU BİLGİ KARTINI DÜZENLE' : 'YENİ OYUNCU BİLGİ KARTI EKLE'}
            </h3>
            <button
              type="button"
              onClick={() => setFormOpen(false)}
              className="p-1 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black uppercase text-slate-400">Oyuncu Adı *</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: İsmail Yüksek"
                  value={form.name}
                  onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))}
                  className="px-4 py-2.5 bg-fb-dark border border-white/10 rounded-xl text-xs text-white placeholder-fb-muted focus:outline-none focus:border-fb-yellow font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">Forma Numarası</label>
                  <input
                    type="number"
                    value={form.shirtNumber}
                    onChange={(e) => setForm(p => ({ ...p, shirtNumber: Number(e.target.value) }))}
                    className="px-4 py-2.5 bg-fb-dark border border-white/10 rounded-xl text-xs text-white font-bold"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">Durumu (Status)</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm(p => ({ ...p, status: e.target.value }))}
                    className="px-3 py-2.5 bg-fb-dark border border-white/10 rounded-xl text-xs text-white cursor-pointer"
                  >
                    <option value="active">Kadroda Aktif</option>
                    <option value="injured">Sakat (Injured)</option>
                    <option value="loaned">Kiralık Gönderildi (Loaned)</option>
                    <option value="left">Takımdan Ayrıldı (Left)</option>
                    <option value="new_transfer">Yeni Transfer</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">Birincil Pozisyon</label>
                  <input
                    type="text"
                    required
                    placeholder="Kaleci, Sol Bek, Ön Libero, vs."
                    value={form.position}
                    onChange={(e) => setForm(p => ({ ...p, position: e.target.value }))}
                    className="px-4 py-2.5 bg-fb-dark border border-white/10 rounded-xl text-xs text-white"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">İkincil Pozisyon</label>
                  <input
                    type="text"
                    placeholder="Stoper, Ön Libero, vs."
                    value={form.secondaryPosition}
                    onChange={(e) => setForm(p => ({ ...p, secondaryPosition: e.target.value }))}
                    className="px-4 py-2.5 bg-fb-dark border border-white/10 rounded-xl text-xs text-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 font-semibold text-slate-300">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">Yaş</label>
                  <input
                    type="number"
                    value={form.age}
                    onChange={(e) => setForm(p => ({ ...p, age: Number(e.target.value) }))}
                    className="px-4 py-2 bg-fb-dark border border-white/10 rounded-xl text-xs text-white font-bold text-center"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">Boy (cm)</label>
                  <input
                    type="number"
                    value={form.height}
                    onChange={(e) => setForm(p => ({ ...p, height: Number(e.target.value) }))}
                    className="px-4 py-2 bg-fb-dark border border-white/10 rounded-xl text-xs text-white font-bold text-center"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">Tercih Ettiği Ayak</label>
                  <select
                    value={form.preferredFoot}
                    onChange={(e) => setForm(p => ({ ...p, preferredFoot: e.target.value }))}
                    className="px-3 py-2 bg-fb-dark border border-white/10 rounded-xl text-xs text-white"
                  >
                    <option value="Sağ Ayak">Sağ Ayak</option>
                    <option value="Sol Ayak">Sol Ayak</option>
                    <option value="İki Ayak">İki Ayak da</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">Sözleşme Bitiş Tarihi</label>
                  <input
                    type="date"
                    value={form.contractEndDate}
                    onChange={(e) => setForm(p => ({ ...p, contractEndDate: e.target.value }))}
                    className="px-4 py-2 bg-fb-dark border border-white/10 rounded-xl text-xs text-white font-mono"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">Piyasa Değeri (€)</label>
                  <input
                    type="text"
                    value={form.marketValue}
                    onChange={(e) => setForm(p => ({ ...p, marketValue: e.target.value }))}
                    placeholder="Örn: €12M"
                    className="px-4 py-2 bg-fb-dark border border-white/10 rounded-xl text-xs text-white font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">Uyruk</label>
                  <input
                    type="text"
                    value={form.nationality}
                    onChange={(e) => setForm(p => ({ ...p, nationality: e.target.value }))}
                    className="px-4 py-2 bg-fb-dark border border-white/10 rounded-xl text-xs text-white"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 font-bold text-fb-yellow animate-pulse">İlk XI Adayı Mı?</label>
                  <div className="flex items-center h-full">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.firstXI}
                        onChange={(e) => setForm(p => ({ ...p, firstXI: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-fb-yellow"></div>
                      <span className="ml-2 text-[10px] font-black text-white uppercase">{form.firstXI ? 'EVET' : 'HAYIR'}</span>
                    </label>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">İlişkili Takım</label>
                  <select
                    value={form.teamRelation}
                    onChange={(e) => setForm(p => ({ ...p, teamRelation: e.target.value }))}
                    className="px-3 py-2 bg-fb-dark border border-white/10 rounded-xl text-xs text-white cursor-pointer"
                  >
                    <option value="Fenerbahçe">Fenerbahçe</option>
                    {teams.filter(t => t.name !== 'Fenerbahçe').map(t => (
                      <option key={t.id} value={t.name}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <FirebaseImageUploader
                folderPath="player-images"
                idOrSlug={form.name ? form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : 'temp-player'}
                value={form.photo}
                onChange={(url) => setForm(p => ({ ...p, photo: url }))}
                label="Oyuncu Profil Fotoğrafı"
              />
            </div>

            <div className="space-y-4 flex flex-col justify-between">
              <div className="grid grid-cols-2 gap-4">
                {/* SEASON SELECTION SPEC */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">Kadro Sezonu</label>
                  <select
                    value={form.season}
                    onChange={(e) => {
                      setForm(p => ({ ...p, season: e.target.value }));
                      if (e.target.value === 'Custom') {
                        setShowCustomSeason(true);
                      } else {
                        setShowCustomSeason(false);
                      }
                    }}
                    className="px-3 py-2.5 bg-fb-dark border border-white/10 rounded-xl text-xs text-white font-bold cursor-pointer"
                  >
                    <option value="2025/26">2025/26 Sezonu</option>
                    <option value="2026/27">2026/27 Sezonu</option>
                    <option value="Custom">Arşiv / Yeni Özel Sezon...</option>
                  </select>
                </div>

                {showCustomSeason && (
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black uppercase text-fb-yellow">Yeni Özelleştirilmiş Sezon Yazın</label>
                    <input
                      type="text"
                      placeholder="Örn: 2024/25 veya 2027/28"
                      value={customSeasonInput}
                      onChange={(e) => setCustomSeasonInput(e.target.value)}
                      className="px-4 py-2.5 bg-fb-dark border border-fb-yellow/30 rounded-xl text-xs text-white font-bold"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">Sezon Form Ortalaması</label>
                  <input
                    type="text"
                    value={form.formRating}
                    onChange={(e) => setForm(p => ({ ...p, formRating: e.target.value }))}
                    className="px-4 py-2 bg-fb-dark border border-white/10 rounded-xl text-xs text-fb-yellow font-bold text-center"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">Son Maç Notu</label>
                  <input
                    type="text"
                    value={form.lastMatchRating}
                    onChange={(e) => setForm(p => ({ ...p, lastMatchRating: e.target.value }))}
                    className="px-4 py-2 bg-fb-dark border border-white/10 rounded-xl text-xs text-white font-bold text-center"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase text-emerald-400">Oyuncu Güçlü Yanları (Strengths - Virgülle ayırın)</label>
                  <input
                    type="text"
                    value={form.strengths}
                    onChange={(e) => setForm(p => ({ ...p, strengths: e.target.value }))}
                    placeholder="Kademeyi Üçleme, Top Kazanma, Dripling"
                    className="px-4 py-2.5 bg-fb-dark border border-white/10 rounded-xl text-xs text-white"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase text-rose-400">Zayıf Yanları (Weaknesses - Virgülle ayırın)</label>
                  <input
                    type="text"
                    value={form.weaknesses}
                    onChange={(e) => setForm(p => ({ ...p, weaknesses: e.target.value }))}
                    placeholder="Uzak Mesafe Şut, Oyun Okuma Verimsizliği"
                    className="px-4 py-2.5 bg-fb-dark border border-white/10 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black uppercase text-fb-yellow">Form Yönü</label>
                <select
                  value={form.trend}
                  onChange={(e) => setForm(p => ({ ...p, trend: e.target.value }))}
                  className="px-3 py-2.5 bg-fb-dark border border-white/10 rounded-xl text-xs text-white font-bold cursor-pointer"
                >
                  <option value="stabil">Stabil (Stabil)</option>
                  <option value="yükselişte">Yükselişte (▲ Rising)</option>
                  <option value="düşüşte">Düşüşte (▼ Falling)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1 flex-1 mt-4">
                <label className="text-[10px] font-black uppercase text-slate-400">Detaylı Taktiksel Performans Analizi</label>
                <textarea
                  value={form.analysis}
                  onChange={(e) => setForm(p => ({ ...p, analysis: e.target.value }))}
                  rows={5}
                  placeholder="Sezon içindeki rol değişimi, Fred ile uyumu, Mourinho'nun verdiği şanslar..."
                  className="px-4 py-3 bg-fb-dark border border-white/10 rounded-xl text-xs text-slate-300 leading-relaxed"
                />
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-white/5 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setFormOpen(false)}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl text-xs font-black uppercase cursor-pointer"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-fb-yellow hover:bg-white text-fb-navy rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 cursor-pointer transition-all"
            >
              <Save size={14} /> PROFİLİ VE SÖZLEŞMEYİ KAYDET
            </button>
          </div>
        </motion.form>
      ) : (
        /* LIST GRID VIEW_SQUAD */
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-fb-card border border-white/[0.05] flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-85 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-fb-muted" />
                <input
                  type="text"
                  placeholder="Oyuncu adı, pozisyon veya forma numara ara..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-fb-dark border border-white/10 text-xs text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Durum:</span>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-fb-dark border border-white/10 text-xs px-2.5 py-1.5 rounded-lg text-slate-300 focus:outline-none"
                >
                  <option value="All">Fark etmez (Tümü)</option>
                  <option value="active">Kadroda Aktif</option>
                  <option value="injured">Sakat (Injured)</option>
                  <option value="loaned">Kiralık Gönderilenler</option>
                  <option value="left">Ayrılanlar (Eski)</option>
                  <option value="new_transfer">Yeni Transferler</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Sezon Arşivi:</span>
                <select
                  value={filterSeason}
                  onChange={(e) => setFilterSeason(e.target.value)}
                  className="bg-fb-dark border border-fb-yellow/20 text-xs px-2.5 py-1.5 rounded-lg text-fb-yellow font-bold focus:outline-none cursor-pointer"
                >
                  <option value="All">Tüm Sezonlar</option>
                  <option value="2025/26">2025/26 Sezonu</option>
                  <option value="2026/27">2026/27 Sezonu</option>
                  {Array.from(new Set(players.map(p => p.season))).filter(s => s && s !== '2025/26' && s !== '2026/27' && s !== 'Custom').map(s => (
                    <option key={s} value={s}>{s} Sezonu</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-20 text-fb-yellow text-xs font-black uppercase tracking-wider">OYUNCULAR SORGULANIYOR...</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-fb-card border border-white/[0.05] text-slate-400 text-xs">
              Mevcut kriterlere uygun oyuncu datası bulunamadı.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map(p => (
                <div key={p.id} className="p-5 rounded-2xl bg-fb-card border border-white/[0.05] space-y-4 flex flex-col justify-between hover:border-fb-yellow/20 transition-all">
                  <div className="flex items-center gap-4 text-left">
                    <div className="w-14 h-14 rounded-full border-2 border-fb-yellow/30 bg-fb-navy/80 overflow-hidden shrink-0 flex items-center justify-center relative">
                      <img src={p.photo} alt={p.name} className="w-full h-full object-cover" />
                      {p.shirtNumber && (
                        <span className="absolute bottom-0 right-0 px-1 py-0.5 rounded bg-fb-yellow text-fb-navy text-[8px] font-black font-mono">
                          #{p.shirtNumber}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-sm font-black text-white truncate uppercase">{p.name}</h4>
                        {p.firstXI && (
                          <span className="shrink-0 p-0.5 bg-fb-yellow/10 border border-fb-yellow/20 text-fb-yellow rounded" title="İlk 11 Adayı">
                            <Star size={10} className="fill-fb-yellow" />
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-fb-yellow font-bold uppercase tracking-wider leading-none mt-1">
                        {p.position} {p.secondaryPosition ? `(${p.secondaryPosition})` : ''}
                      </p>
                      <p className="text-[9px] text-fb-muted font-semibold mt-1">
                        {p.age} Yaş • {p.height ? `${p.height} cm` : ''} • {p.preferredFoot}
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-fb-dark/80 border border-white/5 grid grid-cols-3 gap-2 text-center">
                    <div>
                      <span className="text-[8px] text-slate-400 font-bold block uppercase tracking-wider">Değer / Sezon</span>
                      <span className="text-[11px] font-black text-fb-yellow font-mono block truncate">{p.marketValue || 'N/A'}</span>
                      <span className="text-[7.5px] text-fb-muted block font-bold">{p.season || '2025/26'}</span>
                    </div>
                    <div>
                      <span className="text-[8px] text-slate-400 font-bold block uppercase tracking-wider">Sözleşme Bitiş</span>
                      <span className="text-xs font-black text-white font-mono block truncate">{p.contractEndDate?.substring(0, 4) || 'N/A'}</span>
                      <span className="text-[7.5px] text-slate-500 block font-bold">{p.contractEndDate || ''}</span>
                    </div>
                    <div>
                      <span className="text-[8px] text-slate-400 font-bold block uppercase tracking-wider">Trend</span>
                      <span className="text-[10px] font-black uppercase block mt-1">
                        {p.trend === 'yükselişte' ? (
                          <span className="text-emerald-400 flex items-center justify-center gap-0.5 font-bold">▲ İYİ</span>
                        ) : p.trend === 'düşüşte' ? (
                          <span className="text-rose-400 flex items-center justify-center gap-0.5 font-bold">▼ DÜŞÜŞ</span>
                        ) : (
                          <span className="text-slate-400 flex items-center justify-center gap-0.5 font-bold">● STABİL</span>
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/5 flex items-center justify-between text-left">
                    <span className="text-[9px] font-black uppercase text-fb-muted">
                      DURUM: <b className="text-[#FFB020]">{p.status?.toUpperCase().replace('_', ' ')}</b>
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(p)}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 cursor-pointer"
                      >
                        <Edit size={12} />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/10 cursor-pointer"
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
