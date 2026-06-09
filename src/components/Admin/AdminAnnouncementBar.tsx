import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Megaphone, Save, CheckCircle, Eye, EyeOff, Calendar } from 'lucide-react';
import { dbGetCollection, dbUpsertDocument } from '../../lib/dbService';

interface Announcement {
  id: string;
  title: string;
  text: string;
  link: string;
  startDate: string;
  endDate: string;
  active: boolean;
}

interface AdminAnnouncementBarProps {
  showToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const AdminAnnouncementBar: React.FC<AdminAnnouncementBarProps> = ({ showToast }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState(false);

  const [form, setForm] = useState<Announcement>({
    id: 'main',
    title: 'FLAŞ KANAT TRANSFERİ',
    text: 'Fenerbahçe, Belçikalı yıldız sol bek için kulübü KRC Genk ile görüşmelere başlandığını KAP’a bildirdi!',
    link: '#/transfer-radar/modern-sag-bek-hiz-makinesi',
    startDate: '2026-06-01',
    endDate: '2026-06-30',
    active: true,
  });

  useEffect(() => {
    const loadAnnouncement = async () => {
      setLoading(true);
      try {
        const list = await dbGetCollection('announcements');
        const main = list.find(a => a.id === 'main');
        if (main) {
          setForm({
            id: 'main',
            title: main.title || '',
            text: main.text || '',
            link: main.link || '',
            startDate: main.startDate || '',
            endDate: main.endDate || '',
            active: main.active !== false
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadAnnouncement();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await dbUpsertDocument('announcements', 'main', {
        ...form,
        updatedAt: new Date().toISOString()
      });
      setStatusMsg(true);
      if (showToast) showToast('Duyuru Barı ayarları başarıyla kaydedildi.', 'success');
      setTimeout(() => setStatusMsg(false), 3000);
    } catch (err) {
      console.error(err);
      if (showToast) showToast('Ayarlar kaydedilirken hata oluştu.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-10 text-fb-yellow text-xs font-black uppercase">DUYURULAR ÇEKİLİYOR...</div>;
  }

  return (
    <div className="space-y-6 text-left max-w-4xl mx-auto">
      <div>
        <h2 className="text-xl font-display font-black text-white uppercase italic tracking-wide flex items-center gap-2">
          <Megaphone className="text-fb-yellow" size={20} /> Site Geneli Duyuru Barı (Announcement Bar)
        </h2>
        <p className="text-xs text-fb-muted">
          Futbol portalının en üstünde yer alan acil gelişmeler, breaking haberler veya premium duyuruları yönetin.
        </p>
      </div>

      {statusMsg && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold"
        >
          ✓ Değişiklikler başarıyla kaydedildi. Duyuru barı güncellendi ve yayına alındı!
        </motion.div>
      )}

      <form onSubmit={handleSave} className="p-6 rounded-2xl bg-fb-card border border-white/[0.08] space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-black text-slate-400">ÖN BAŞLIK (ETİKET)</label>
            <input
              type="text"
              required
              placeholder="Örn: TRANSFER DUYURUSU"
              value={form.title}
              onChange={e => setForm(p => ({ ...p, title: e.target.value.toUpperCase() }))}
              className="px-4 py-2.5 bg-fb-dark border border-white/10 rounded-xl text-xs text-white font-heavy uppercase"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-black text-slate-400">YÖNLENDİRİLECEK BAĞLANTI (URL / LİNK)</label>
            <input
              type="text"
              placeholder="Örn: #/transfer-radar veya https://fenerbahce.org"
              value={form.link}
              onChange={e => setForm(p => ({ ...p, link: e.target.value }))}
              className="px-4 py-2.5 bg-fb-dark border border-white/10 rounded-xl text-xs text-white"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[9px] font-black text-slate-400">ACİL DUYURU / DETAY METNİ</label>
          <textarea
            required
            rows={2}
            maxLength={180}
            placeholder="Yalnızca bir satıra sığacak, kısa ve net duyuru cümlesi girin..."
            value={form.text}
            onChange={e => setForm(p => ({ ...p, text: e.target.value }))}
            className="px-4 py-2 bg-fb-dark border border-white/10 rounded-xl text-xs text-slate-200 resize-none font-medium"
          />
          <div className="text-right text-[9px] text-fb-muted">Maksimum 180 karakter önerilir.</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-black text-slate-400 flex items-center gap-1">
              <Calendar size={12} /> Başlangıç Tarihi
            </label>
            <input
              type="date"
              required
              value={form.startDate}
              onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))}
              className="px-4 py-2 bg-fb-dark border border-white/10 rounded-xl text-xs text-white"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-black text-slate-400 flex items-center gap-1">
              <Calendar size={12} /> Bitiş Tarihi
            </label>
            <input
              type="date"
              required
              value={form.endDate}
              onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))}
              className="px-4 py-2 bg-fb-dark border border-white/10 rounded-xl text-xs text-white"
            />
          </div>
        </div>

        <div className="pt-2 border-t border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${form.active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
              {form.active ? <Eye size={18} /> : <EyeOff size={18} />}
            </div>
            <div>
              <span className="text-xs font-black text-white block">Aktiflik Durumu</span>
              <span className="text-[10px] text-fb-muted block">Görünürlüğü anında açıp kapatın.</span>
            </div>
          </div>

          <input
            type="checkbox"
            checked={form.active}
            onChange={e => setForm(p => ({ ...p, active: e.target.checked }))}
            className="w-5 h-5 accent-fb-yellow cursor-pointer"
          />
        </div>

        <div className="pt-4 border-t border-white/5 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-fb-yellow hover:bg-white text-fb-navy rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-3 transition-all cursor-pointer shadow-lg"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-fb-navy border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save size={15} />
            )}
            <span>YAYINA AL VE KAYDET</span>
          </button>
        </div>
      </form>
    </div>
  );
};
