import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { 
  Image as ImageIcon, 
  Plus, 
  Trash2, 
  Copy, 
  Check, 
  Search, 
  Filter, 
  ExternalLink,
  Tag
} from 'lucide-react';
import { dbGetCollection, dbUpsertDocument, dbDeleteDocument } from '../../lib/dbService';
import { FirebaseImageUploader } from './AdminCommon';

interface MediaItem {
  id: string;
  title: string;
  url: string;
  altText: string;
  category: 'logo' | 'player' | 'news' | 'gallery' | 'sponsor' | 'general';
  createdAt: string;
}

export const AdminMedia: React.FC = () => {
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form state
  const [formOpen, setFormOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [altText, setAltText] = useState('');
  const [category, setCategory] = useState<'logo' | 'player' | 'news' | 'gallery' | 'sponsor' | 'general'>('general');

  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const loadMedia = async () => {
    setLoading(true);
    const data = await dbGetCollection('media');
    setMediaList(data);
    setLoading(false);
  };

  useEffect(() => {
    loadMedia();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) {
      alert('Lütfen bir görsel yükleyin veya görsel adresi belirtin.');
      return;
    }

    const newId = `media-${Math.random().toString(36).substring(2, 9)}`;
    const newItem: MediaItem = {
      id: newId,
      title: title || 'İsimsiz Görsel',
      url,
      altText: altText || title || 'Görsel açıklaması',
      category,
      createdAt: new Date().toISOString()
    };

    await dbUpsertDocument('media', newId, newItem);
    setFormOpen(false);
    setTitle('');
    setUrl('');
    setAltText('');
    setCategory('general');
    loadMedia();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bu görsel kaydını kütüphaneden silmek istediğinize emin misiniz?')) {
      await dbDeleteDocument('media', id);
      loadMedia();
    }
  };

  const handleCopyUrl = (itemUrl: string, itemId: string) => {
    navigator.clipboard.writeText(itemUrl);
    setCopiedId(itemId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredMedia = mediaList.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.altText.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-display font-black text-white uppercase italic tracking-wide">Medya Kütüphanesi & Bulut Depolama</h2>
          <p className="text-xs text-fb-muted">Görseller yükleyin, organize edin ve kopyaladığınız bağlantıları diğer yönetim formlarında kullanın.</p>
        </div>
        {!formOpen && (
          <button
            onClick={() => setFormOpen(true)}
            className="px-5 py-2.5 bg-fb-yellow hover:bg-white text-fb-navy font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
          >
            <Plus size={16} /> Medyaya Yeni Yükleme Yap
          </button>
        )}
      </div>

      {formOpen && (
        <motion.form
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSave}
          className="p-6 rounded-2xl bg-fb-card border border-white/[0.08] space-y-4 max-w-xl mx-auto"
        >
          <h3 className="text-xs font-black uppercase tracking-widest text-[#FFB020] border-b border-white/5 pb-2">
            GÖRSEL YÜKLE & KAYDET
          </h3>

          <div className="space-y-4">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black uppercase text-slate-400">Görsel İsmi / Başlık</label>
              <input
                type="text"
                required
                placeholder="Örn: İsmail Kartal Basın Toplantısı"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="px-4 py-2.5 bg-fb-dark border border-white/10 rounded-xl text-xs text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black uppercase text-slate-400">Kategori</label>
                <select
                  value={category}
                  onChange={(e: any) => setCategory(e.target.value)}
                  className="px-3 py-2.5 bg-fb-dark border border-white/10 rounded-xl text-xs text-white focus:outline-none"
                >
                  <option value="general">Genel / Diğer</option>
                  <option value="logo">Takım Logosu</option>
                  <option value="player">Oyuncu Fotoğrafı</option>
                  <option value="news">Haber / Analiz Kapak</option>
                  <option value="gallery">Galeri Görseli</option>
                  <option value="sponsor">Sponsor / Reklam</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black uppercase text-slate-400">Alt Açıklama (Alt Text)</label>
                <input
                  type="text"
                  placeholder="Alt açıklama yazısı"
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  className="px-4 py-2.5 bg-fb-dark border border-white/10 rounded-xl text-xs text-slate-300"
                />
              </div>
            </div>

            {/* Dynamic Firebase Loader */}
            <FirebaseImageUploader
              folderPath="article-covers"
              idOrSlug={title ? title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : 'uploaded-image'}
              value={url}
              onChange={(uploadedUrl) => setUrl(uploadedUrl)}
              label="Dosya Seç / Sürükle Bırak"
            />
          </div>

          <div className="pt-4 border-t border-white/5 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setFormOpen(false)}
              className="px-4 py-2 bg-white/5 text-slate-300 rounded-xl text-xs font-black uppercase"
            >
              İptal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-fb-yellow hover:bg-white text-fb-navy rounded-xl text-xs font-black uppercase tracking-widest"
            >
              Kütüphaneye Ekle
            </button>
          </div>
        </motion.form>
      )}

      {/* FILTER AND SEARCH ROW */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex items-center gap-2 max-w-sm w-full bg-fb-dark/60 rounded-xl border border-white/10 px-3 py-1.5">
          <Search size={14} className="text-fb-muted shrink-0" />
          <input
            type="text"
            placeholder="Kütüphanede ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-0 text-white placeholder-fb-muted text-xs focus:outline-none w-full"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Filter size={12} className="text-fb-muted" />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-1.5 bg-fb-dark border border-white/10 rounded-lg text-xs text-white cursor-pointer"
          >
            <option value="all">Tüm Kategoriler</option>
            <option value="news">Haber & Kapak</option>
            <option value="player">Oyuncu Profil</option>
            <option value="logo">Logolar</option>
            <option value="sponsor">Sponsorlar</option>
            <option value="general">Müteferrik / Genel</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-24 text-fb-yellow font-black text-xs">MEDYA KÜTÜPHANESİ YÜKLENİYOR...</div>
      ) : filteredMedia.length === 0 ? (
        <div className="p-12 text-center text-fb-muted font-bold text-xs bg-fb-card border border-white/5 rounded-2xl">
          Medya dosyanız bulunmamaktadır.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {filteredMedia.map(item => (
            <div key={item.id} className="rounded-xl border border-white/[0.06] bg-fb-card overflow-hidden group flex flex-col justify-between">
              <div className="relative aspect-video bg-fb-dark overflow-hidden flex items-center justify-center">
                <img
                  referrerPolicy="no-referrer"
                  src={item.url}
                  alt={item.altText}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-2 left-2 text-[8px] font-black px-1.5 py-0.5 rounded bg-black/60 text-fb-yellow uppercase tracking-wider backdrop-blur-sm border border-white/10">
                  {item.category}
                </span>
              </div>

              <div className="p-3 text-left space-y-2">
                <span className="text-[10px] font-black text-white truncate block">{item.title}</span>
                <span className="text-[9px] text-fb-muted block font-mono truncate">{item.url}</span>

                <div className="flex gap-1">
                  <button
                    onClick={() => handleCopyUrl(item.url, item.id)}
                    className="flex-1 py-1.5 bg-white/5 hover:bg-white/10 rounded text-[9px] font-black uppercase text-slate-300 flex items-center justify-center gap-1 cursor-pointer"
                  >
                    {copiedId === item.id ? (
                      <>
                        <Check size={10} className="text-emerald-400" /> Kopyalandı!
                      </>
                    ) : (
                      <>
                        <Copy size={10} /> Bağlantıyı Al
                      </>
                    )}
                  </button>

                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-slate-400"
                    title="Yeni pencerede aç"
                  >
                    <ExternalLink size={10} />
                  </a>

                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 rounded bg-red-500/15 hover:bg-red-500/20 text-red-400 cursor-pointer"
                    title="Görseli sil"
                  >
                    <Trash2 size={10} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
