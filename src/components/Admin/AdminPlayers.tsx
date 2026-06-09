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
  Star
} from 'lucide-react';
import { dbGetCollection, dbUpsertDocument, dbAddDocument, dbDeleteDocument } from '../../lib/dbService';

export const AdminPlayers: React.FC = () => {
  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  // Form State
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    position: 'Merkez Orta Saha',
    age: 26,
    nationality: 'Türkiye',
    photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop',
    formRating: '8.2',
    lastMatchRating: '8.5',
    trend: 'stabil',
    strengths: 'Oyun Görüşü, Kısa Pas Verimliliği',
    weaknesses: 'Fizik Mücadele Gücü',
    analysis: '',
    status: 'active'
  });

  const loadData = async () => {
    setLoading(true);
    const list = await dbGetCollection('players');
    setPlayers(list);
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

    const compiledData = {
      ...form,
      age: Number(form.age),
      strengths: form.strengths.split(',').map(s => s.trim()).filter(Boolean),
      weaknesses: form.weaknesses.split(',').map(w => w.trim()).filter(Boolean),
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
    loadData();
  };

  const startEdit = (p: any) => {
    setEditingId(p.id);
    setForm({
      name: p.name || '',
      position: p.position || 'Merkez Orta Saha',
      age: p.age || 26,
      nationality: p.nationality || 'Türkiye',
      photo: p.photo || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop',
      formRating: p.formRating || '8.2',
      lastMatchRating: p.lastMatchRating || '8.5',
      trend: p.trend || 'stabil',
      strengths: Array.isArray(p.strengths) ? p.strengths.join(', ') : (p.strengths || ''),
      weaknesses: Array.isArray(p.weaknesses) ? p.weaknesses.join(', ') : (p.weaknesses || ''),
      analysis: p.analysis || '',
      status: p.status || 'active'
    });
    setFormOpen(true);
  };

  const openNew = () => {
    setEditingId(null);
    setForm({
      name: '',
      position: 'Merkez Orta Saha',
      age: 26,
      nationality: 'Türkiye',
      photo: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop',
      formRating: '8.2',
      lastMatchRating: '8.5',
      trend: 'stabil',
      strengths: 'Oyun Görüşü, Kısa Pas Verimliliği',
      weaknesses: 'İkili Mücadele Eşiği',
      analysis: 'Fenerbahçe orta alanı için kritik öneme sahip kreatif lider.',
      status: 'active'
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
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-display font-black text-white uppercase italic tracking-wide">Oyuncular & Analiz Kartları</h2>
          <p className="text-xs text-fb-muted">Kadro performans puanlarını, form rüzgarlarını ve form grafiklerini yönetin.</p>
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
              {editingId ? 'OYUNCU DOSYASINI DÜZENLE' : 'YENİ OYUNCU DOSYASI EKLE'}
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
                  <label className="text-[10px] font-black uppercase text-slate-400">Pozisyon</label>
                  <input
                    type="text"
                    value={form.position}
                    onChange={(e) => setForm(p => ({ ...p, position: e.target.value }))}
                    className="px-4 py-2.5 bg-fb-dark border border-white/10 rounded-xl text-xs text-white"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">Durum (Kadro)</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm(p => ({ ...p, status: e.target.value }))}
                    className="px-3 py-2.5 bg-fb-dark border border-white/10 rounded-xl text-xs text-white"
                  >
                    <option value="active">Kadroda Aktif (Active)</option>
                    <option value="loan">Kiralık Gönderilen (Loan)</option>
                    <option value="former">Eski Oyuncu (Former)</option>
                    <option value="target">Girişim Hedefi (Target)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
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
                  <label className="text-[10px] font-black uppercase text-slate-400">Uyruk</label>
                  <input
                    type="text"
                    value={form.nationality}
                    onChange={(e) => setForm(p => ({ ...p, nationality: e.target.value }))}
                    className="px-4 py-2 bg-fb-dark border border-white/10 rounded-xl text-xs text-white"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">Form Yönü</label>
                  <select
                    value={form.trend}
                    onChange={(e) => setForm(p => ({ ...p, trend: e.target.value }))}
                    className="px-3 py-2.5 bg-fb-dark border border-white/10 rounded-xl text-xs text-white font-bold"
                  >
                    <option value="stabil">Stabil (Stabil)</option>
                    <option value="yükselişte">Yükselişte (▲ Rising)</option>
                    <option value="düşüşte">Düşüşte (▼ Falling)</option>
                  </select>
                </div>
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

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black uppercase text-slate-400">Oyuncu Profil Fotoğrafı (Görsel URL)</label>
                <input
                  type="text"
                  value={form.photo}
                  onChange={(e) => setForm(p => ({ ...p, photo: e.target.value }))}
                  className="px-4 py-2.5 bg-fb-dark border border-white/10 rounded-xl text-xs text-white font-mono"
                />
              </div>
            </div>

            <div className="space-y-4 flex flex-col justify-between">
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

              <div className="flex flex-col gap-1 flex-1 mt-4">
                <label className="text-[10px] font-black uppercase text-slate-400">Detaylı Taktiksel Performans Analizi</label>
                <textarea
                  value={form.analysis}
                  onChange={(e) => setForm(p => ({ ...p, analysis: e.target.value }))}
                  rows={6}
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
              className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-400 rounded-xl text-xs font-black uppercase"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-fb-yellow hover:bg-white text-fb-navy rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2"
            >
              <Save size={14} /> PROFİLİ KAYDET
            </button>
          </div>
        </motion.form>
      ) : (
        /* LIST GRID VIEW */
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-fb-card border border-white/[0.05] flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-fb-muted" />
              <input
                type="text"
                placeholder="Oyuncu adı veya pozisyon ara..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-fb-dark border border-white/10 text-xs text-white focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Kadroya Göre:</span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-fb-dark border border-white/10 text-xs px-2 py-1/5 rounded-lg text-slate-300"
              >
                <option value="All">Herkes</option>
                <option value="active">Kadroda Aktifler</option>
                <option value="loan">Kiralık Gidenler</option>
                <option value="former">Ayrılanlar (Eski)</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-20 text-fb-yellow text-xs font-black">OYUNCULAR YÜKLENİYOR...</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-fb-card border border-white/[0.05] text-slate-400 text-xs">
              Mevcut kriterlere uygun oyuncu bulunamadı.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map(p => (
                <div key={p.id} className="p-5 rounded-2xl bg-fb-card border border-white/[0.05] space-y-4 flex flex-col justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full border-2 border-fb-yellow/30 bg-fb-navy/80 overflow-hidden shrink-0 flex items-center justify-center">
                      <img src={p.photo} alt={p.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-black text-white truncate uppercase">{p.name}</h4>
                      <p className="text-[10px] text-fb-yellow font-bold uppercase tracking-wider leading-none mt-1">{p.position}</p>
                      <p className="text-[9px] text-fb-muted font-semibold mt-1">{p.age} Yaş • {p.nationality}</p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-fb-dark/80 border border-white/5 grid grid-cols-3 gap-2 text-center">
                    <div>
                      <span className="text-[8px] text-slate-400 font-bold block uppercase tracking-wider">Form Rating</span>
                      <span className="text-sm font-black text-fb-yellow font-mono">{p.formRating}</span>
                    </div>
                    <div>
                      <span className="text-[8px] text-slate-400 font-bold block uppercase tracking-wider">Son Karşılaşma</span>
                      <span className="text-sm font-black text-white font-mono">{p.lastMatchRating}</span>
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

                  <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                    <span className="text-[9px] font-black uppercase text-fb-muted">KADRO DURUMU: <b className="text-white">{p.status}</b></span>
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
