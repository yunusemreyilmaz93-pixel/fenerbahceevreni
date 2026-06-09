import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { 
  Settings, 
  Save, 
  CheckCircle, 
  ShieldCheck, 
  Plus, 
  Trash2, 
  AlertTriangle 
} from 'lucide-react';
import { dbGetCollection, dbUpsertDocument } from '../../lib/dbService';
import { getAdminEmails } from '../../lib/envHelper';

export const AdminSettings: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    siteName: 'Fenerbahçe Evreni',
    tagline: 'Bağımsız Analiz ve Taraftar Topluluğu',
    metaTitle: 'Fenerbahçe Evreni - Mourinho Taktik & Scout Analizi',
    metaDescription: 'Fenerbahçe Evreni tamamen bağımsız bir spor analiz, transfer scout raporu ve muhtemel 11 veri merkezidir.',
    maintenanceMode: false,
    legalNoticeActive: true
  });

  // Whitelisted Email targets dynamically loaded from active env (Section 4 spec)
  const [emails, setEmails] = useState<string[]>(getAdminEmails());

  const [newEmail, setNewEmail] = useState('');

  useEffect(() => {
    const loadGlobalSettings = async () => {
      try {
        const settings = await dbGetCollection('siteSettings');
        const mainSettings = settings.find(s => s.id === 'general');
        if (mainSettings) {
          setForm({
            siteName: mainSettings.siteName || 'Fenerbahçe Evreni',
            tagline: mainSettings.tagline || 'Bağımsız Analiz ve Taraftar Topluluğu',
            metaTitle: mainSettings.metaTitle || 'Fenerbahçe Evreni',
            metaDescription: mainSettings.metaDescription || '',
            maintenanceMode: !!mainSettings.maintenanceMode,
            legalNoticeActive: mainSettings.legalNoticeActive === undefined ? true : !!mainSettings.legalNoticeActive
          });
          if (Array.isArray(mainSettings.whitelistedEmails)) {
            setEmails(mainSettings.whitelistedEmails);
          }
        }
      } catch (err) {
        console.error("Settings load error:", err);
      } finally {
        setLoading(false);
      }
    };
    loadGlobalSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await dbUpsertDocument('siteSettings', 'general', {
        ...form,
        whitelistedEmails: emails,
        updatedAt: new Date().toISOString()
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      alert("Genel ayarlar kaydedilirken hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmail = () => {
    if (!newEmail || !newEmail.includes('@')) {
      alert("Lütfen geçerli bir e-posta adresi yazın.");
      return;
    }
    if (emails.some(e => e.toLowerCase() === newEmail.toLowerCase())) {
      alert("Bu e-posta adresi zaten whitelist listesinde mevcut.");
      return;
    }
    setEmails([...emails, newEmail.trim()]);
    setNewEmail('');
  };

  const handleRemoveEmail = (index: number, emailAddress: string) => {
    if (emailAddress === "yunusemreyilmaz93@gmail.com") {
      alert("Bu sizin asıl yönetim e-posta adresinizdir. Kendinizi whitelist listesinden kaldıramazsınız.");
      return;
    }
    if (window.confirm(`"${emailAddress}" e-posta adresini yönetici whitelist listesinden kaldırmak istiyor musunuz?`)) {
      const list = [...emails];
      list.splice(index, 1);
      setEmails(list);
    }
  };

  return (
    <div className="space-y-6 text-left max-w-3xl mx-auto">
      <div>
        <h2 className="text-xl font-display font-black text-white uppercase italic tracking-wide">Genel Site & Güvenlik Ayarları</h2>
        <p className="text-xs text-fb-muted">Global SEO parametrelerini, giriş yetki whitelist (e-posta) listesini ve bakım modunu yönetin.</p>
      </div>

      {success && (
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center gap-2"
        >
          <CheckCircle className="shrink-0" size={16} />
          Sistem ayarları ve yeni yetki listesi başarıyla kaydedildi!
        </motion.div>
      )}

      <form onSubmit={handleSave} className="p-6 rounded-2xl bg-fb-card border border-white/[0.08] space-y-6">
        
        {/* GLOBAL SEO META */}
        <div className="space-y-4">
          <span className="text-[10px] font-black text-fb-yellow uppercase tracking-widest block pb-1 border-b border-white/5">1. SİTE ALAN ADI VE META TANIMLAMALARI</span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black text-slate-400">Patform İsmi</label>
              <input
                type="text"
                required
                value={form.siteName}
                onChange={(e) => setForm(p => ({ ...p, siteName: e.target.value }))}
                className="px-4 py-2.5 bg-fb-dark border border-white/10 rounded-xl text-xs text-white"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black text-slate-400">Platform Sloganı</label>
              <input
                type="text"
                required
                value={form.tagline}
                onChange={(e) => setForm(p => ({ ...p, tagline: e.target.value }))}
                className="px-4 py-2.5 bg-fb-dark border border-white/10 rounded-xl text-xs text-slate-300"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black text-slate-400">Arama Motoru Başlığı (Meta Title)</label>
            <input
              type="text"
              required
              value={form.metaTitle}
              onChange={(e) => setForm(p => ({ ...p, metaTitle: e.target.value }))}
              className="px-4 py-2.5 bg-fb-dark border border-white/10 rounded-xl text-xs text-white"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black text-slate-400">Raporlama ve Arama Motoru Açıklaması (Meta Description)</label>
            <textarea
              required
              rows={3}
              value={form.metaDescription}
              onChange={(e) => setForm(p => ({ ...p, metaDescription: e.target.value }))}
              className="px-4 py-2.5 bg-fb-dark border border-white/10 rounded-xl text-xs text-slate-300"
            />
          </div>
        </div>

        {/* ADMIN WHITELIST MANAGER */}
        <div className="space-y-4">
          <span className="text-[10px] font-black text-fb-yellow uppercase tracking-widest block pb-1 border-b border-white/5">2. YÖNETİCİ GİRİŞ YETKİ LİSTESİ (E-POSTA WHITELIST)</span>
          
          <div className="p-4 rounded-xl bg-[#090e1a]/70 border border-white/5 space-y-4">
            <div className="flex items-center gap-3">
              <input
                type="email"
                placeholder="Örn: editordetay93@gmail.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="flex-1 px-4 py-2 bg-fb-dark border border-white/10 rounded-xl text-xs text-slate-200"
              />
              <button
                type="button"
                onClick={handleAddEmail}
                className="px-4 py-2 bg-fb-yellow hover:bg-white text-fb-navy text-xs font-black uppercase rounded-xl flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <Plus size={14} /> Ekle
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-400 block uppercase tracking-wider">Aktif Editör & Yönetici E-postaları</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {emails.map((email, idx) => (
                  <div key={idx} className="px-3 py-2 rounded-lg bg-fb-dark border border-white/5 flex items-center justify-between text-xs">
                    <span className="text-white font-mono font-semibold">{email}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveEmail(idx, email)}
                      className="text-rose-500 hover:text-red-400 p-0.5 cursor-pointer"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* TOGGLE STATUS LEGAL Maintenance  */}
        <div className="space-y-4">
          <span className="text-[10px] font-black text-fb-yellow uppercase tracking-widest block pb-1 border-b border-white/5">3. BAKIM VE BAĞIMSIZLIK BEYAN BARAJI</span>
          
          <div className="p-4 rounded-xl bg-fb-dark/40 border border-white/5 space-y-4">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <span className="text-xs font-black text-white block">SİTE BAKIM MODU (MAINTENANCE MODE)</span>
                <span className="text-[10px] text-fb-muted font-bold block">Aktif edildiğinde tüm ziyaretçiler bakım sayfası şablonu görür.</span>
              </div>
              <input
                type="checkbox"
                checked={form.maintenanceMode}
                onChange={(e) => setForm(p => ({ ...p, maintenanceMode: e.target.checked }))}
                className="w-5 h-5 accent-fb-yellow cursor-pointer"
              />
            </label>

            <div className="h-px bg-white/5" />

            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <span className="text-xs font-black text-white block">BAĞIMSIZLIK UYARI METNİ (FOOTER LEGAL DISCLAIMER)</span>
                <span className="text-[10px] text-fb-muted font-bold block">Altbilgideki (Fenerbahçe SK ile resmî bağımız yoktur) beyanını gösterir.</span>
              </div>
              <input
                type="checkbox"
                checked={form.legalNoticeActive}
                onChange={(e) => setForm(p => ({ ...p, legalNoticeActive: e.target.checked }))}
                className="w-5 h-5 accent-fb-yellow cursor-pointer"
              />
            </label>
          </div>
        </div>

        <div className="pt-4 border-t border-white/5 flex justify-end">
          <button
            type="submit"
            className="px-6 py-3 bg-fb-yellow hover:bg-white text-fb-navy rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all cursor-pointer"
          >
            <Save size={15} /> AYARLARI KAYDET VE SİNK ET
          </button>
        </div>
      </form>
    </div>
  );
};
