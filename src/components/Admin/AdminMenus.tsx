import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Menu, Plus, Trash2, Edit2, Save, MoveUp, MoveDown, Check, X, SlidersHorizontal, Eye, EyeOff } from 'lucide-react';
import { dbGetCollection, dbUpsertDocument, dbDeleteDocument } from '../../lib/dbService';

interface MenuItem {
  id: string;
  label: string;
  view: string;
  url: string;
  order: number;
  enabled: boolean;
  menuType: 'header' | 'footer' | 'mobile'; // which menu this belongs to
}

interface AdminMenusProps {
  showToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const AdminMenus: React.FC<AdminMenusProps> = ({ showToast }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [activeMenuType, setActiveMenuType] = useState<'header' | 'footer' | 'mobile'>('header');

  const [form, setForm] = useState({
    id: '',
    label: '',
    view: 'home',
    url: '',
    enabled: true,
  });

  const [editingId, setEditingId] = useState<string | null>(null);

  const availableViewRoutes = [
    { value: 'home', label: 'Ana Sayfa' },
    { value: 'match-center', label: 'Maç Merkezi' },
    { value: 'analysis', label: 'Analizler / Raporlar' },
    { value: 'transfer-radar', label: 'Transfer Radar' },
    { value: 'players', label: 'Oyuncuar / Kadro' },
    { value: 'fan-room', label: 'Taraftar Odası' },
    { value: 'premium', label: 'Premium Üyelik' },
    { value: 'about', label: 'Hakkımızda' },
    { value: 'contact', label: 'İletişim' },
    { value: 'bulten', label: 'E-Bülten Gazetesi' },
    { value: 'custom', label: 'Özel URL / Web Adresi' },
  ];

  const loadMenus = async () => {
    setLoading(true);
    try {
      const fetched = await dbGetCollection('menus');
      if (fetched && fetched.length > 0) {
        setMenuItems(fetched);
      } else {
        // Default seeding of menus if completely empty
        const defaultMenus: MenuItem[] = [
          // Header Primary items
          { id: 'h-1', label: 'ANA SAYFA', view: 'home', url: '', order: 1, enabled: true, menuType: 'header' },
          { id: 'h-2', label: 'MAÇ MERKEZİ', view: 'match-center', url: '', order: 2, enabled: true, menuType: 'header' },
          { id: 'h-3', label: 'ANALİZLER', view: 'analysis', url: '', order: 3, enabled: true, menuType: 'header' },
          { id: 'h-4', label: 'TRANSFER RADAR', view: 'transfer-radar', url: '', order: 4, enabled: true, menuType: 'header' },
          { id: 'h-5', label: 'OYUNCULAR', view: 'players', url: '', order: 5, enabled: true, menuType: 'header' },
          { id: 'h-6', label: 'TARAFTAR ODASI', view: 'fan-room', url: '', order: 6, enabled: true, menuType: 'header' },
          
          // Footer Items
          { id: 'f-1', label: 'Ana Sayfa', view: 'home', url: '', order: 1, enabled: true, menuType: 'footer' },
          { id: 'f-2', label: 'Hakkında', view: 'about', url: '', order: 2, enabled: true, menuType: 'footer' },
          { id: 'f-3', label: 'Analizler', view: 'analysis', url: '', order: 3, enabled: true, menuType: 'footer' },
          { id: 'f-4', label: 'Maç Merkezi', view: 'match-center', url: '', order: 4, enabled: true, menuType: 'footer' },
          { id: 'f-5', label: 'Transfer Radar', view: 'transfer-radar', url: '', order: 5, enabled: true, menuType: 'footer' },
          { id: 'f-6', label: 'İletişim', view: 'contact', url: '', order: 6, enabled: true, menuType: 'footer' },
        ];
        
        // Seed into db
        for (const m of defaultMenus) {
          await dbUpsertDocument('menus', m.id, m);
        }
        setMenuItems(defaultMenus);
      }
    } catch (err) {
      console.error(err);
      if (showToast) showToast('Menüler yüklenirken hata oluştu.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMenus();
  }, []);

  const filteredItems = menuItems
    .filter(item => item.menuType === activeMenuType)
    .sort((a, b) => a.order - b.order);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const isNew = !form.id;
      const finalId = form.id || `menu-${activeMenuType}-${Math.random().toString(36).substr(2, 9)}`;
      
      const newOrder = isNew 
        ? (menuItems.filter(i => i.menuType === activeMenuType).length + 1)
        : filteredItems.find(i => i.id === form.id)?.order || 1;

      const updatedItem: MenuItem = {
        id: finalId,
        label: form.label,
        view: form.view,
        url: form.view === 'custom' ? form.url : '',
        order: newOrder,
        enabled: form.enabled,
        menuType: activeMenuType
      };

      await dbUpsertDocument('menus', finalId, updatedItem);
      
      if (isNew) {
        setMenuItems(prev => [...prev, updatedItem]);
        if (showToast) showToast('Yeni menü elemanı eklendi.', 'success');
      } else {
        setMenuItems(prev => prev.map(i => i.id === finalId ? updatedItem : i));
        if (showToast) showToast('Menü elemanı güncellendi.', 'success');
        setEditingId(null);
      }

      setForm({ id: '', label: '', view: 'home', url: '', enabled: true });
    } catch (err) {
      console.error(err);
      if (showToast) showToast('Menü kaydedilirken bir hata oluştu.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item: MenuItem) => {
    setEditingId(item.id);
    setForm({
      id: item.id,
      label: item.label,
      view: item.view,
      url: item.url,
      enabled: item.enabled
    });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bu menü elemanını silmek istediğinizden emin misiniz?')) return;
    try {
      await dbDeleteDocument('menus', id);
      setMenuItems(prev => prev.filter(i => i.id !== id));
      if (showToast) showToast('Menü elemanı silindi.', 'success');
    } catch (err) {
      console.error(err);
      if (showToast) showToast('Menü silinirken hata oluştu.', 'error');
    }
  };

  const handleToggle = async (item: MenuItem) => {
    const updated = { ...item, enabled: !item.enabled };
    setMenuItems(prev => prev.map(i => i.id === item.id ? updated : i));
    await dbUpsertDocument('menus', item.id, updated);
    if (showToast) showToast(updated.enabled ? 'Eleman etkinleştirildi.' : 'Eleman devre dışı bırakıldı.', 'info');
  };

  const handleMove = async (item: MenuItem, direction: 'up' | 'down') => {
    const sorted = [...filteredItems];
    const index = sorted.findIndex(i => i.id === item.id);
    if (index === -1) return;
    
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= sorted.length) return;

    // Swap order values
    const tempOrder = sorted[index].order;
    sorted[index].order = sorted[targetIdx].order;
    sorted[targetIdx].order = tempOrder;

    // Save both
    await dbUpsertDocument('menus', sorted[index].id, sorted[index]);
    await dbUpsertDocument('menus', sorted[targetIdx].id, sorted[targetIdx]);

    // Update state
    setMenuItems(prev => {
      const remaining = prev.filter(i => i.menuType !== activeMenuType);
      return [...remaining, sorted[index], sorted[targetIdx]];
    });

    if (showToast) showToast('Sıralama güncellendi.', 'success');
  };

  if (loading) {
    return <div className="text-center py-10 text-fb-yellow text-xs font-black uppercase">MENÜLER ÇEKİLİYOR...</div>;
  }

  return (
    <div className="space-y-6 text-left max-w-4xl mx-auto">
      <div>
        <h2 className="text-xl font-display font-black text-white uppercase italic tracking-wide flex items-center gap-2">
          <Menu className="text-fb-yellow" size={20} /> Menü ve Navigasyon Yönetimi
        </h2>
        <p className="text-xs text-fb-muted">
          Header, Footer ve Mobil görünüm linklerini sürükleme/reorder mantığıyla yönetin. Kod düzenlemeden rota ekleyip çıkartabilirsiniz.
        </p>
      </div>

      {/* Main Tab Links */}
      <div className="flex border-b border-white/5">
        {(['header', 'footer', 'mobile'] as const).map(type => (
          <button
            key={type}
            onClick={() => {
              setActiveMenuType(type);
              setEditingId(null);
              setForm({ id: '', label: '', view: 'home', url: '', enabled: true });
            }}
            className={`px-5 py-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
              activeMenuType === type 
                ? 'border-fb-yellow text-fb-yellow bg-fb-yellow/5' 
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            {type === 'header' ? '💻 Üst Menü (Header)' : type === 'footer' ? '🗂️ Alt Menü (Footer)' : '📱 Mobil Menü'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Form panel */}
        <form onSubmit={handleSubmit} className="md:col-span-5 p-5 rounded-2xl bg-fb-card border border-white/[0.08] h-fit space-y-4">
          <span className="text-[10px] font-black text-fb-yellow uppercase tracking-widest block pb-1 border-b border-white/5">
            {editingId ? 'ELEMANI DÜZENLE' : 'YENİ ELEMAN EKLE'}
          </span>

          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-bold text-slate-400">GÖSTERİLECEK BAŞLIK / ETİKET</label>
            <input
              type="text"
              required
              placeholder="Örn: TAKTİK TAHTASI"
              value={form.label}
              onChange={e => setForm(p => ({ ...p, label: e.target.value }))}
              className="px-3.5 py-2 bg-fb-dark border border-white/10 rounded-xl text-xs text-white"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-bold text-slate-400">YÖNLENDİRİLECEK ROTA (VIEW)</label>
            <select
              value={form.view}
              onChange={e => setForm(p => ({ ...p, view: e.target.value }))}
              className="px-3.5 py-2 bg-fb-dark border border-white/10 rounded-xl text-xs text-white focus:outline-none"
            >
              {availableViewRoutes.map(opt => (
                <option key={opt.value} value={opt.value} className="bg-fb-card">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {form.view === 'custom' && (
            <div className="flex flex-col gap-1 animate-fade-in">
              <label className="text-[9px] font-bold text-slate-400">ÖZEL BAĞLANTI URL'Sİ</label>
              <input
                type="url"
                required
                placeholder="https://example.com/xyz"
                value={form.url}
                onChange={e => setForm(p => ({ ...p, url: e.target.value }))}
                className="px-3.5 py-2 bg-fb-dark border border-white/10 rounded-xl text-xs text-white"
              />
            </div>
          )}

          <label className="flex items-center gap-3 cursor-pointer pt-2">
            <input
              type="checkbox"
              checked={form.enabled}
              onChange={e => setForm(p => ({ ...p, enabled: e.target.checked }))}
              className="w-4 h-4 accent-fb-yellow"
            />
            <span className="text-xs font-semibold text-slate-300">Menüde Aktif Olarak Göster</span>
          </label>

          <div className="pt-2 flex gap-2">
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setForm({ id: '', label: '', view: 'home', url: '', enabled: true });
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
              {editingId ? 'GÜNCELLE' : 'EKLE'}
            </button>
          </div>
        </form>

        {/* List panel */}
        <div className="md:col-span-7 p-5 rounded-2xl bg-fb-card border border-white/[0.08] space-y-4">
          <span className="text-[10px] font-black text-fb-yellow uppercase tracking-widest block pb-1 border-b border-white/5">
            MEVCUT {activeMenuType.toUpperCase()} ELEMANLARI ({filteredItems.length})
          </span>

          {filteredItems.length === 0 ? (
            <div className="text-center py-10 text-fb-muted text-xs font-semibold">Bu menü altına henüz link eklenmemiş.</div>
          ) : (
            <div className="space-y-2">
              {filteredItems.map((item, index) => (
                <div
                  key={item.id}
                  className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-left transition-colors ${
                    item.enabled ? 'bg-fb-dark/40 border-white/10' : 'bg-fb-dark/10 border-white/[0.03] opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-mono text-fb-muted">#{item.order}</span>
                    <div>
                      <span className="text-xs font-black text-white uppercase block">{item.label}</span>
                      <span className="text-[9px] text-fb-yellow font-bold uppercase tracking-wider">
                        {item.view === 'custom' ? `Özel URL: ${item.url}` : `İç Görünüm: ${item.view}`}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* Reorder Buttons */}
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => handleMove(item, 'up')}
                      className="p-1 rounded bg-white/5 hover:bg-white/10 text-slate-400 hover:text-fb-yellow disabled:opacity-30 disabled:pointer-events-none"
                      title="Yukarı Taşı"
                    >
                      <MoveUp size={12} />
                    </button>
                    <button
                      type="button"
                      disabled={index === filteredItems.length - 1}
                      onClick={() => handleMove(item, 'down')}
                      className="p-1 rounded bg-white/5 hover:bg-white/10 text-slate-400 hover:text-fb-yellow disabled:opacity-30 disabled:pointer-events-none"
                      title="Aşağı Taşı"
                    >
                      <MoveDown size={12} />
                    </button>

                    <div className="w-px h-3.5 bg-white/10" />

                    {/* Enable Toggle */}
                    <button
                      type="button"
                      onClick={() => handleToggle(item)}
                      className={`p-1 rounded ${item.enabled ? 'text-emerald-400 hover:bg-emerald-500/10' : 'text-slate-500 hover:bg-white/10'}`}
                      title={item.enabled ? 'Görünürlüğü Kapat' : 'Görünürlüğü Aç'}
                    >
                      {item.enabled ? <Eye size={13} /> : <EyeOff size={13} />}
                    </button>

                    {/* Edit */}
                    <button
                      type="button"
                      onClick={() => handleEdit(item)}
                      className="p-1 rounded text-blue-400 hover:bg-blue-500/10"
                      title="Düzenle"
                    >
                      <Edit2 size={13} />
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="p-1 rounded text-rose-400 hover:bg-rose-500/10"
                      title="Sil"
                    >
                      <Trash2 size={13} />
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
