import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { 
 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  FileDown, 
  CheckCircle,
  AlertOctagon,
  Users,
  Check,
  UserCheck
} from 'lucide-react';
import { dbGetCollection, dbUpsertDocument, dbAddDocument, dbDeleteDocument } from '../../lib/dbService';
import { exportToCSV, formatDate } from '../../lib/adminHelpers';

export const AdminPremium: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'files' | 'waitlist'>('files');
  const [premiumItems, setPremiumItems] = useState<any[]>([]);
  const [waitlistItems, setWaitlistItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [waitlistSearch, setWaitlistSearch] = useState('');

  // Form State for Premium files
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    coverImage: '',
    downloadUrl: '',
    category: 'Taktik Rehber',
    status: 'published'
  });

  const loadData = async () => {
    setLoading(true);
    // Load Files
    const list = await dbGetCollection('premium');
    setPremiumItems(list);

    // Load Waitlist Entries
    const waitlist = await dbGetCollection('premiumWaitlist');
    setWaitlistItems(waitlist);

    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.downloadUrl) {
      alert("Lütfen başlık ve indirme PDF adresini giriniz.");
      return;
    }

    const compiledData = {
      ...form,
      updatedAt: new Date().toISOString()
    };

    if (editingId) {
      await dbUpsertDocument('premium', editingId, compiledData);
    } else {
      await dbAddDocument('premium', {
        ...compiledData,
        id: `prm-${Math.random().toString(36).substr(2, 9)}`,
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
      title: p.title || '',
      description: p.description || '',
      coverImage: p.coverImage || '',
      downloadUrl: p.downloadUrl || '',
      category: p.category || 'Taktik Rehber',
      status: p.status || 'published'
    });
    setFormOpen(true);
  };

  const openNew = () => {
    setEditingId(null);
    setForm({
      title: '',
      description: '',
      coverImage: '',
      downloadUrl: '',
      category: 'Taktik Rehber',
      status: 'published'
    });
    setFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Bu premium içeriği kütüphaneden silmek istediğinizden emin misiniz?")) {
      await dbDeleteDocument('premium', id);
      loadData();
    }
  };

  const handleWaitlistDelete = async (id: string) => {
    if (window.confirm("Bu bekleme listesi kaydını silmek istediğinizden emin misiniz?")) {
      await dbDeleteDocument('premiumWaitlist', id);
      loadData();
    }
  };

  const handleWaitlistStatusToggle = async (p: any) => {
    const nextStatus = p.status === 'contacted' ? 'pending' : 'contacted';
    await dbUpsertDocument('premiumWaitlist', p.id, {
      ...p,
      status: nextStatus
    });
    loadData();
  };

  const handleExportWaitlist = () => {
    if (waitlistItems.length === 0) {
      alert("Dışa aktarılacak kayıt yok.");
      return;
    }
    exportToCSV(waitlistItems, ['name', 'email', 'planInterest', 'interestDetail', 'source', 'createdAt', 'status'], `premium_waitlist_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  // Filter lists
  const filteredFiles = premiumItems.filter(p => {
    return p.title?.toLowerCase().includes(search.toLowerCase()) || 
           p.category?.toLowerCase().includes(search.toLowerCase());
  });

  const filteredWaitlist = waitlistItems.filter(w => {
    return (w.name || '').toLowerCase().includes(waitlistSearch.toLowerCase()) ||
           (w.email || '').toLowerCase().includes(waitlistSearch.toLowerCase()) ||
           (w.planInterest || '').toLowerCase().includes(waitlistSearch.toLowerCase());
  });

  return (
    <div className="space-y-6">
      
      {/* Tab Switcher at the top of AdminPremium */}
      <div className="flex border-b border-white/5 pb-2 gap-4">
        <button
          onClick={() => { setActiveTab('files'); setFormOpen(false); }}
          className={`pb-2.5 text-xs font-black uppercase tracking-widest border-b-2 transition-all cursor-pointer ${
            activeTab === 'files' ? 'text-fb-yellow border-fb-yellow' : 'text-slate-400 border-transparent hover:text-white'
          }`}
        >
          Premium İçerik & PDF Portföyü ({premiumItems.length})
        </button>
        <button
          onClick={() => { setActiveTab('waitlist'); setFormOpen(false); }}
          className={`pb-2.5 text-xs font-black uppercase tracking-widest border-b-2 transition-all cursor-pointer ${
            activeTab === 'waitlist' ? 'text-fb-yellow border-fb-yellow' : 'text-slate-400 border-transparent hover:text-white'
          }`}
        >
          Bekleme Listesi Başvuruları ({waitlistItems.length})
        </button>
      </div>

      {activeTab === 'files' ? (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-display font-black text-white uppercase italic tracking-wide">Premium Özel İçerikler & Kitapçıklar (PDFs)</h2>
              <p className="text-xs text-fb-muted">Katma değerli taktik rehberleri ve özel PDF bülten indirme kartlarını girin.</p>
            </div>
            {!formOpen && (
              <button
                onClick={openNew}
                className="px-5 py-2.5 bg-fb-yellow hover:bg-white text-fb-navy font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
              >
                <Plus size={16} /> Yeni Premium Dosya Ekle
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
                  {editingId ? 'PREMIUM DOSYAYI DÜZENLE' : 'YENİ PREMIUM ANALİZ KARTI EKLE'}
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
                  <label className="text-[10px] font-black uppercase text-slate-400">Rehber Kitapçık Başlığı *</label>
                  <input
                    type="text"
                    required
                    placeholder="Örn: İsmail Kartal 4-2-3-1 Hücum Mekanizmaları Analiz Kitapçığı"
                    value={form.title}
                    onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))}
                    className="px-4 py-2.5 bg-fb-dark border border-white/15 rounded-xl text-xs text-white placeholder-fb-muted focus:border-fb-yellow focus:outline-none font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black uppercase text-slate-400">Kategori</label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm(p => ({ ...p, category: e.target.value }))}
                      className="px-3 py-2.5 bg-fb-dark border border-white/15 rounded-xl text-xs text-white"
                    >
                      <option value="Taktik Rehber">Taktik Rehber</option>
                      <option value="Sezonluk Analiz">Sezonluk Analiz</option>
                      <option value="Rakip Mercek Altında">Rakip Mercek Altında</option>
                      <option value="Özel Rapor">Özel Rapor</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black uppercase text-slate-400">Yayın Durumu</label>
                    <select
                      value={form.status}
                      onChange={(e) => setForm(p => ({ ...p, status: e.target.value }))}
                      className="px-3 py-2.5 bg-fb-dark border border-white/15 rounded-xl text-xs text-white"
                    >
                      <option value="published">Anında Yayınla (Published)</option>
                      <option value="draft">Taslakta Kalsın (Draft)</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">İndirme Linki (PDF veya Rapor URL'si) *</label>
                  <input
                    type="text"
                    required
                    placeholder="https://fenerbahceevreni.com/files/taktik-rehber-v1.pdf"
                    value={form.downloadUrl}
                    onChange={(e) => setForm(p => ({ ...p, downloadUrl: e.target.value }))}
                    className="px-4 py-2.5 bg-fb-dark border border-white/15 rounded-xl text-xs text-fb-yellow focus:border-fb-yellow focus:outline-none font-mono"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">Kapak Resmi URL adresi</label>
                  <input
                    type="text"
                    value={form.coverImage}
                    onChange={(e) => setForm(p => ({ ...p, coverImage: e.target.value }))}
                    className="px-4 py-2.5 bg-fb-dark border border-white/15 rounded-xl text-xs text-white font-mono"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">Detaylı İçerik Açıklaması</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))}
                    rows={4}
                    placeholder="Bu şablon neleri içeriyor? Sayfa sayısı, analiz kapsamı nedir?"
                    className="px-4 py-2.5 bg-fb-dark border border-white/15 rounded-xl text-xs text-slate-300 leading-relaxed"
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-white/5 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  className="px-4 py-2 bg-white/5 text-slate-300 rounded-xl text-xs font-black uppercase"
                >
                  İptal et
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-fb-yellow hover:bg-white text-fb-navy rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2"
                >
                  <Save size={14} /> DOSYAYI KAYDET
                </button>
              </div>
            </motion.form>
          ) : (
            /* TABLE LIST FILES */
            <div className="space-y-4 text-left">
              <div className="p-4 rounded-xl bg-fb-card border border-white/[0.05] flex items-center">
                <div className="relative w-72">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-fb-muted" />
                  <input
                    type="text"
                    placeholder="Rehber başlıklarında ara..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-fb-dark border border-white/10 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              {loading ? (
                <div className="text-center py-20 text-fb-yellow text-xs font-black">PREMIUM DOSYALARI YÜKLENİYOR...</div>
              ) : filteredFiles.length === 0 ? (
                <div className="p-12 text-center rounded-2xl bg-fb-card border border-white/[0.05] text-slate-400 text-xs">
                  Mevcut herhangi bir premium analiz dosyası bulunamadı.
                </div>
              ) : (
                <div className="rounded-2xl border border-white/[0.06] overflow-hidden bg-fb-card">
                  <table className="w-full text-left font-sans">
                    <thead>
                      <tr className="border-b border-white/[0.06] bg-[#0c1223]/60 text-[10px] font-black uppercase text-fb-muted tracking-widest">
                        <th className="p-4 pl-6">Kitapçık / Rapor Detayı</th>
                        <th className="p-4">Kategori</th>
                        <th className="p-4">Yayın Durumu</th>
                        <th className="p-4">Güvenli İndirme Linki</th>
                        <th className="p-4 text-right pr-6">Eylemler</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04]">
                      {filteredFiles.map(p => (
                        <tr key={p.id}>
                          <td className="p-4 pl-6">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-14 bg-fb-dark border border-white/10 rounded overflow-hidden shrink-0 hidden sm:block">
                                <img src={p.coverImage} alt="" className="w-full h-full object-cover" />
                              </div>
                              <div>
                                <span className="text-xs font-black text-white uppercase">{p.title}</span>
                                <span className="text-[10px] text-fb-muted block mt-0.5 truncate max-w-xs">{p.description}</span>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-xs font-semibold text-slate-300">{p.category}</td>
                          <td className="p-4">
                            {p.status === 'published' ? (
                              <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-black text-emerald-400">YAYINDA</span>
                            ) : (
                              <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-[9px] font-black text-amber-400">TASLAK</span>
                            )}
                          </td>
                          <td className="p-4 text-xs font-mono text-fb-yellow max-w-xs truncate">{p.downloadUrl}</td>
                          <td className="p-4 pr-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => startEdit(p)}
                                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 hover:text-fb-yellow text-slate-300 border border-white/10 cursor-pointer"
                              >
                                <Edit size={14} />
                              </button>
                              <button
                                onClick={() => handleDelete(p.id)}
                                className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/10 cursor-pointer"
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
              )}
            </div>
          )}
        </>
      ) : (
        /* PREMIUM WAITLIST COMPONENT SECTION */
        <div className="space-y-4 text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-display font-black text-white uppercase italic tracking-wide">Fenerbahçe Evreni Premium Erken Erişim Listesi</h2>
              <p className="text-xs text-fb-muted">Kayıtlı taraftarları, plan tercihlerini ve ilgi duydukları içerikleri buradan anlık takip edebilirsiniz.</p>
            </div>
            <button
              onClick={handleExportWaitlist}
              className="px-5 py-2.5 bg-[#FFB020]/10 hover:bg-white/10 text-fb-yellow border border-fb-yellow/20 hover:border-white/10 font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <FileDown size={15} /> Waitlist CSV İndir
            </button>
          </div>

          <div className="p-4 rounded-xl bg-fb-card border border-white/[0.05] flex items-center">
            <div className="relative w-72">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-fb-muted" />
              <input
                type="text"
                placeholder="İsim, e-posta veya plan ara..."
                value={waitlistSearch}
                onChange={(e) => setWaitlistSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-fb-dark border border-white/10 text-xs text-white focus:outline-none"
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-20 text-fb-yellow text-xs font-black">YOL ALINIYOR...</div>
          ) : filteredWaitlist.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-fb-card border border-white/[0.05] text-slate-400 text-xs">
              Mevcut herhangi bir bekleme sırası kaydı bulunamadı.
            </div>
          ) : (
            <div className="rounded-2xl border border-white/[0.06] overflow-hidden bg-fb-card">
              <table className="w-full text-left font-sans">
                <thead>
                  <tr className="border-b border-white/[0.06] bg-[#0c1223]/60 text-[10px] font-black uppercase text-fb-muted tracking-widest">
                    <th className="p-4 pl-6">Kaydolan Taraftar</th>
                    <th className="p-4 font-mono">E-posta</th>
                    <th className="p-4">Tercih Ettiği Plan</th>
                    <th className="p-4">Duygusal İlgi Alanı</th>
                    <th className="p-4">Kayıt Tarihi</th>
                    <th className="p-4">Destek Durumu</th>
                    <th className="p-4 text-right pr-6">Eylemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {filteredWaitlist.map((w, idx) => {
                    const planBadgeColor = 
                      w.planInterest === 'Evren' ? 'border-[#FFB020]/20 bg-fb-yellow/10 text-fb-yellow' :
                      w.planInterest === 'Analiz' ? 'border-sky-500/20 bg-sky-500/10 text-sky-400' :
                      'border-white/10 bg-white/5 text-slate-300';

                    return (
                      <tr key={w.id || idx}>
                        <td className="p-4 pl-6">
                          <span className="text-xs font-black text-white uppercase block">{w.name || 'Bilinmeyen'}</span>
                          <span className="text-[9px] text-fb-muted font-bold block uppercase mt-0.5">Sanal Kaynak: {w.source || 'Premium'}</span>
                        </td>
                        <td className="p-4 text-xs font-mono text-slate-300">{w.email}</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded border text-[9px] font-black uppercase ${planBadgeColor}`}>
                            {w.planInterest || 'Seçilmedi'}
                          </span>
                        </td>
                        <td className="p-4 text-xs font-semibold text-slate-400">{w.interestDetail || 'Hepsi'}</td>
                        <td className="p-4 text-xs text-fb-muted font-bold font-mono">{formatDate(w.createdAt)}</td>
                        <td className="p-4">
                          {w.status === 'contacted' ? (
                            <button 
                              onClick={() => handleWaitlistStatusToggle(w)}
                              className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-black text-emerald-400 hover:bg-emerald-500/20 transition-all flex items-center gap-1 cursor-pointer"
                            >
                              <CheckCircle className="w-3 h-3 text-emerald-400" /> İrtibata Geçildi
                            </button>
                          ) : (
                            <button 
                              onClick={() => handleWaitlistStatusToggle(w)}
                              className="px-2 py-0.5 rounded bg-slate-500/10 border border-white/5 text-[9px] font-black text-slate-400 hover:bg-white/5 transition-all flex items-center gap-1 cursor-pointer"
                            >
                              <AlertOctagon className="w-3 h-3 text-fb-muted" /> Beklemede
                            </button>
                          )}
                        </td>
                        <td className="p-4 pr-6 text-right">
                          <button
                            onClick={() => handleWaitlistDelete(w.id)}
                            className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/10 cursor-pointer"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
