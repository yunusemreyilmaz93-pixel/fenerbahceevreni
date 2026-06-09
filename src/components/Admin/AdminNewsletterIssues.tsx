import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, 
  Plus, 
  Trash2, 
  CheckCircle, 
  Calendar, 
  Edit, 
  Eye, 
  Send, 
  Search, 
  Clock,
  Sparkles,
  ChevronRight,
  ArrowLeft,
  Briefcase,
  ExternalLink,
  ChevronDown,
  Info
} from 'lucide-react';
import { dbGetCollection, dbAddDocument, dbUpsertDocument, dbDeleteDocument } from '../../lib/dbService';
import { formatDate } from '../../lib/adminHelpers';
import { EmptyState, DeleteConfirmModal } from './AdminCommon';

interface AdminNewsletterIssuesProps {
  showToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
}

interface NewsletterSection {
  heading: string;
  bodyText: string;
  articleLink?: string;
  ctaText?: string;
  ctaUrl?: string;
}

interface NewsletterIssue {
  id?: string;
  title: string;
  subject: string;
  intro: string;
  sections: NewsletterSection[];
  status: 'draft' | 'scheduled' | 'sent';
  scheduledAt?: string | null;
  sentAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export const AdminNewsletterIssues: React.FC<AdminNewsletterIssuesProps> = ({ showToast }) => {
  const [issues, setIssues] = useState<NewsletterIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'draft' | 'scheduled' | 'sent'>('all');
  
  // Editor mode state
  const [isEditing, setIsEditing] = useState(false);
  const [currentIssue, setCurrentIssue] = useState<NewsletterIssue | null>(null);

  // Preview state
  const [isPreviewing, setIsPreviewing] = useState<NewsletterIssue | null>(null);

  // Delete modal state
  const [deleteIssueId, setDeleteIssueId] = useState<string | null>(null);

  const loadIssues = async () => {
    setLoading(true);
    const list = await dbGetCollection('newsletterIssues');
    setIssues(list);
    setLoading(false);
  };

  useEffect(() => {
    loadIssues();
  }, []);

  const handleCreateIssue = () => {
    const newIssue: NewsletterIssue = {
      title: 'Haftalık Analiz Dosyası - Sayı #' + (issues.length + 1),
      subject: 'Fenerbahçe Evreni: Taktiksel Çözümler ve Son Gelişmeler',
      intro: 'Fenerbahçe Evreni bülteninin yeni sayısına hoş geldiniz! Bu hafta Mourinho’nun yeni formasyon denemelerini ve transfer haberlerini inceliyoruz.',
      sections: [
        {
          heading: '1. Haftanın Taktik Hamlesi',
          bodyText: 'Mourinho’nun orta saha yerleşimi üzerine kurguladığı yeni geçiş savunması taktiksel başarımızı doğrudan yükseltiyor.',
          ctaText: 'Analizi İncele',
          ctaUrl: '#'
        }
      ],
      status: 'draft',
      scheduledAt: null,
      sentAt: null
    };
    setCurrentIssue(newIssue);
    setIsEditing(true);
  };

  const handleEditIssue = (issue: NewsletterIssue) => {
    // Clone to prevent direct mutate style
    setCurrentIssue(JSON.parse(JSON.stringify(issue)));
    setIsEditing(true);
  };

  const handleDeleteIssueClick = (id: string) => {
    setDeleteIssueId(id);
  };

  const executeDeleteIssue = async () => {
    if (!deleteIssueId) return;
    try {
      await dbDeleteDocument('newsletterIssues', deleteIssueId);
      if (showToast) showToast('Bülten sayısı başarıyla silindi.', 'success');
      loadIssues();
    } catch (err) {
      console.error(err);
      if (showToast) showToast('Silme işlemi başarısız oldu.', 'error');
    } finally {
      setDeleteIssueId(null);
    }
  };

  const handleSaveIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentIssue) return;

    if (!currentIssue.title || !currentIssue.subject || !currentIssue.intro) {
      if (showToast) showToast('Lütfen zorunlu alanları doldurun.', 'error');
      return;
    }

    try {
      if (currentIssue.id) {
        // Update
        const payload = {
          ...currentIssue,
          updatedAt: new Date().toISOString()
        };
        await dbUpsertDocument('newsletterIssues', currentIssue.id, payload);
        if (showToast) showToast('Bülten başarıyla güncellendi.', 'success');
      } else {
        // Create
        const payload = {
          ...currentIssue,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        await dbAddDocument('newsletterIssues', payload);
        if (showToast) showToast('Bülten başarıyla oluşturuldu.', 'success');
      }
      setIsEditing(false);
      setCurrentIssue(null);
      loadIssues();
    } catch (err) {
      console.error(err);
      if (showToast) showToast('Fiziksel kayıt başarısız.', 'error');
    }
  };

  const handleAddSection = () => {
    if (!currentIssue) return;
    const updatedSections = [...currentIssue.sections];
    updatedSections.push({
      heading: 'Yeni Bölüm Başlığı',
      bodyText: 'Lütfen bu bölüme ait detaylı metni girin.'
    });
    setCurrentIssue({ ...currentIssue, sections: updatedSections });
  };

  const handleRemoveSection = (index: number) => {
    if (!currentIssue) return;
    const updatedSections = currentIssue.sections.filter((_, i) => i !== index);
    setCurrentIssue({ ...currentIssue, sections: updatedSections });
  };

  const handleSectionChange = (index: number, field: keyof NewsletterSection, value: string) => {
    if (!currentIssue) return;
    const updatedSections = [...currentIssue.sections];
    updatedSections[index] = {
      ...updatedSections[index],
      [field]: value
    };
    setCurrentIssue({ ...currentIssue, sections: updatedSections });
  };

  const handleDirectMarkAsSent = async (issue: NewsletterIssue) => {
    if (!issue.id) return;
    try {
      const payload = {
        ...issue,
        status: 'sent' as const,
        sentAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await dbUpsertDocument('newsletterIssues', issue.id, payload);
      if (showToast) {
        showToast('Bülten sayısı "Gönderildi" olarak işaretlendi 🎉', 'success');
        showToast('E-posta entegrasyonu tamamlandığında tüm kullanıcılara gönderilecektir.', 'info');
      }
      loadIssues();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredIssues = issues.filter(issue => {
    if (activeTab === 'all') return true;
    return issue.status === activeTab;
  });

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {/* EDIT/CREATE DIALOG PANEL */}
        {isEditing && currentIssue && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="p-6 rounded-2xl bg-fb-card border border-white/[0.06] shadow-2xl text-left space-y-6 relative"
          >
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
              <button 
                onClick={() => { setIsEditing(false); setCurrentIssue(null); }}
                className="flex items-center gap-1.5 text-xs text-fb-muted hover:text-white font-bold transition-colors cursor-pointer"
              >
                <ArrowLeft size={14} /> Çık ve Geri Dön
              </button>
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                {currentIssue.id ? 'Bülten Sayısını Düzenle' : 'Yeni Bülten Sayısı Hazırla'}
              </h3>
            </div>

            <form onSubmit={handleSaveIssue} className="space-y-6">
              
              {/* Top metadata */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-300">İç Başlık (Seçim Paneli İçin)</label>
                  <input
                    type="text"
                    required
                    value={currentIssue.title}
                    onChange={(e) => setCurrentIssue({ ...currentIssue, title: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg bg-fb-dark border border-white/10 text-white placeholder-fb-muted text-xs font-semibold focus:outline-none focus:border-fb-yellow"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-300">Durum / Durumu Değiştir</label>
                  <select
                    value={currentIssue.status}
                    onChange={(e) => setCurrentIssue({ ...currentIssue, status: e.target.value as any })}
                    className="w-full px-3 py-2.5 rounded-lg bg-fb-dark border border-white/10 text-white text-xs font-black uppercase focus:outline-none focus:border-fb-yellow cursor-pointer"
                  >
                    <option value="draft">Taslak (Draft)</option>
                    <option value="scheduled">Zamanlanmış (Scheduled)</option>
                    <option value="sent">Gönderildi (Sent)</option>
                  </select>
                </div>
              </div>

              {/* Subject details */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-300">E-Posta Gönderi Konusu (Email Subject)</label>
                <input
                  type="text"
                  required
                  placeholder="Okuyucuların e-posta kutusunda göreceği ana başlık konusu"
                  value={currentIssue.subject}
                  onChange={(e) => setCurrentIssue({ ...currentIssue, subject: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg bg-fb-dark border border-white/10 text-white placeholder-fb-muted text-xs font-semibold focus:outline-none focus:border-fb-yellow"
                />
              </div>

              {/* Schedule time if status is scheduled */}
              {currentIssue.status === 'scheduled' && (
                <div className="p-4 rounded-xl bg-fb-yellow/5 border border-fb-yellow/20 space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-fb-yellow block">Gönderi Zamanlama Tarihi / Saati</label>
                  <input
                    type="datetime-local"
                    required
                    value={currentIssue.scheduledAt || ''}
                    onChange={(e) => setCurrentIssue({ ...currentIssue, scheduledAt: e.target.value })}
                    className="px-4 py-2.5 rounded-lg bg-fb-dark border border-fb-yellow/30 text-white text-xs font-bold focus:outline-none focus:border-fb-yellow cursor-pointer"
                  />
                </div>
              )}

              {/* Intro Text */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-300">Giriş / Karşılama Yazısı (Intro Message)</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Sevgili okurlar, bu haftaki bültenimizde..."
                  value={currentIssue.intro}
                  onChange={(e) => setCurrentIssue({ ...currentIssue, intro: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg bg-fb-dark border border-white/10 text-white placeholder-fb-muted text-xs font-semibold focus:outline-none focus:border-fb-yellow"
                />
              </div>

              {/* Sections list editor */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-t border-white/[0.06] pt-4">
                  <h4 className="text-xs font-black text-white uppercase tracking-wider">BÜLTEN BAĞLANTI BLOKLARI / PARAGRAFLAR</h4>
                  <button
                    type="button"
                    onClick={handleAddSection}
                    className="px-3 py-1.5 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/20 text-[10px] font-black uppercase tracking-wider rounded-lg flex items-center gap-1 cursor-pointer"
                  >
                    <Plus size={12} /> YENİ BLOK EKLE
                  </button>
                </div>

                <div className="space-y-4">
                  {currentIssue.sections.map((section, idx) => (
                    <div 
                      key={idx}
                      className="p-4 rounded-xl bg-[#090e1b] border border-white/[0.04] space-y-4 relative"
                    >
                      <button
                        type="button"
                        onClick={() => handleRemoveSection(idx)}
                        disabled={currentIssue.sections.length <= 1}
                        className="absolute top-3 right-3 text-rose-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                        title="Bloğu Çıkar"
                      >
                        <Trash2 size={13} />
                      </button>

                      <span className="text-[10px] font-black text-fb-yellow uppercase tracking-wider">Blok #{idx + 1}</span>

                      <div className="space-y-3">
                        {/* Heading */}
                        <div className="space-y-1">
                          <label className="text-[9px] font-black uppercase tracking-widest text-[#94a3b8]">Küçük Başlık</label>
                          <input
                            type="text"
                            required
                            placeholder="Örn: 1. Haftanın maç analizinden kilitler"
                            value={section.heading}
                            onChange={(e) => handleSectionChange(idx, 'heading', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-fb-card border border-white/5 text-xs text-white focus:outline-none focus:border-fb-yellow"
                          />
                        </div>

                        {/* Body Text */}
                        <div className="space-y-1">
                          <label className="text-[9px] font-black uppercase tracking-widest text-[#94a3b8]">Blok Detay İçerik Metni</label>
                          <textarea
                            rows={3}
                            required
                            placeholder="Sayfalarımızdan veya analizlerimizden koku barındıran paragraf"
                            value={section.bodyText}
                            onChange={(e) => handleSectionChange(idx, 'bodyText', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-fb-card border border-white/5 text-xs text-white focus:outline-none focus:border-fb-yellow"
                          />
                        </div>

                        {/* Optional buttons */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase tracking-widest text-[#94a3b8]">Buton Metni (CTA Text)</label>
                            <input
                              type="text"
                              placeholder="Örn: Rapora Git (İsteğe Bağlı)"
                              value={section.ctaText || ''}
                              onChange={(e) => handleSectionChange(idx, 'ctaText', e.target.value)}
                              className="w-full px-3 py-2 rounded-lg bg-fb-card border border-white/5 text-xs text-slate-300 focus:outline-none focus:border-fb-yellow"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase tracking-widest text-[#94a3b8]">Buton Linki (CTA URL)</label>
                            <input
                              type="text"
                              placeholder="Örn: # / sitemizdeki link"
                              value={section.ctaUrl || ''}
                              onChange={(e) => handleSectionChange(idx, 'ctaUrl', e.target.value)}
                              className="w-full px-3 py-2 rounded-lg bg-fb-card border border-white/5 text-xs text-slate-400 focus:outline-none focus:border-fb-yellow"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Save & Cancel action buttons */}
              <div className="pt-4 border-t border-white/[0.06] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => { setIsEditing(false); setCurrentIssue(null); }}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold uppercase rounded-lg border border-white/5 transition-all"
                >
                  İptal Et
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-fb-yellow hover:bg-white text-fb-navy text-xs font-black uppercase tracking-wider rounded-lg transition-all"
                >
                  DEĞİŞİKLİKLERİ KAYDET
                </button>
              </div>

            </form>
          </motion.div>
        )}

        {/* PREVIEW VISUAL MODAL */}
        {isPreviewing && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-fb-dark/80 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-[#0b101f] border border-white/[0.1] rounded-2xl max-w-2xl w-full p-6 text-left space-y-6 max-h-[85vh] overflow-y-auto shadow-2xl relative"
            >
              <button 
                onClick={() => setIsPreviewing(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white bg-white/5 p-1.5 rounded-lg cursor-pointer"
              >
                ✕
              </button>

              <div className="space-y-1">
                <span className="text-[10px] text-fb-yellow font-black uppercase tracking-widest block">HAFTALIK BÜLTEN ŞABLON ÖNİZLEMESİ</span>
                <h4 className="text-base font-black text-white">{isPreviewing.title}</h4>
              </div>

              {/* Fake Email Envelope Header */}
              <div className="p-4 rounded-xl bg-fb-dark/70 border border-white/5 space-y-1 text-xs">
                <div><span className="text-fb-muted font-bold">Kime:</span> Sevgili Fenerbahçe Evreni Abonesi</div>
                <div><span className="text-fb-muted font-bold">Konu:</span> {isPreviewing.subject}</div>
                <div><span className="text-fb-muted font-bold">Zamanlama:</span> {isPreviewing.status === 'scheduled' ? formatDate(isPreviewing.scheduledAt || '') : isPreviewing.status === 'sent' ? 'Yayımlandı' : 'Taslak'}</div>
              </div>

              {/* Email Content Body */}
              <div className="space-y-6 text-xs text-slate-300 leading-relaxed font-sans font-semibold">
                <p className="text-slate-200 italic font-semibold">{isPreviewing.intro}</p>

                {isPreviewing.sections.map((section, sIdx) => (
                  <div key={sIdx} className="p-4 rounded-xl bg-white/[0.01] border border-white/5 space-y-2">
                    <h5 className="font-black text-fb-yellow text-xs uppercase tracking-wider">{section.heading}</h5>
                    <p className="text-slate-300 text-xs whitespace-pre-line">{section.bodyText}</p>
                    {section.ctaText && (
                      <div className="pt-2">
                        <span className="inline-block px-3 py-1.5 bg-fb-yellow text-fb-navy text-[10px] uppercase font-black tracking-wider rounded">
                          {section.ctaText}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Provider notes */}
              <div className="p-4 rounded-xl bg-fb-navy/30 border border-blue-500/20 text-[11px] text-slate-400 space-y-1">
                <p className="font-bold text-fb-yellow">⚙️ YAŞAMSAL ENTEGRASYON NOTLARI (TODO)</p>
                <p>E-posta gönderimi Resend veya Firebase Cloud Functions üzerinden otomatik tetiklenecek şekilde tasarlanmıştır.</p>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-white/[0.05]">
                <button
                  onClick={() => setIsPreviewing(null)}
                  className="px-5 py-2 bg-slate-800 text-slate-300 font-bold text-xs uppercase rounded-lg border border-white/5 cursor-pointer"
                >
                  Önizlemeyi Kapat
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Issues Control Page if not editor mode */}
      {!isEditing && (
        <div className="space-y-6">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
            <div>
              <h2 className="text-xl font-display font-black text-white uppercase italic tracking-wide flex items-center gap-2">
                <FileText className="text-fb-yellow" size={20} /> E-Posta Bülten Sayıları & Gönderimleri
              </h2>
              <p className="text-xs text-fb-muted">Yeni bülten taslakları hazırlayın, zamanlayın ve geçmiş gönderimleri inceleyin.</p>
            </div>
            
            <button
              onClick={handleCreateIssue}
              className="px-5 py-2.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg flex items-center gap-1.5 cursor-pointer self-start"
            >
              <Plus size={15} /> YENİ BÜLTEN HAZIRLA
            </button>
          </div>

          {/* Email integration reminder info strip */}
          <div className="p-4 rounded-xl bg-[#000000]/20 border border-white/[0.05] text-left text-xs leading-relaxed font-semibold text-slate-300 flex items-start gap-3">
            <Info size={16} className="text-fb-yellow shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="text-white block uppercase tracking-wide">E-posta Gönderim Altyapısı Bilgilendirmesi</strong>
              <p className="text-slate-400">
                Resmi bülten gönderimleri henüz aktif değildir. Hazırladığınız bülten sayıları Firebase/Local DB şemalarında taslak, zamanlanmış veya gönderilmiş olarak tutulur. 
                Gelecekte **Mailchimp, Brevo, Resend veya ConvertKit** entegrasyonu yapmak için `newsletterIssues` koleksiyonu hazırdır. 
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-white/[0.06] text-left">
            {[
              { id: 'all', label: 'Tümü' },
              { id: 'draft', label: 'Taslaklar' },
              { id: 'scheduled', label: 'Zamanlanmışlar' },
              { id: 'sent', label: 'Gönderilenler' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-5 py-3 text-xs uppercase tracking-widest font-black border-b-2 transition-all cursor-pointer ${
                  activeTab === tab.id 
                    ? 'border-fb-yellow text-fb-yellow font-black' 
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Issues table */}
          {loading ? (
            <div className="text-center py-20 text-fb-yellow text-xs font-black">YÜKLENİYOR...</div>
          ) : filteredIssues.length === 0 ? (
            <EmptyState
              title="Kayıtlı bülten sayısı bulunmuyor."
              text="Bu sekmede listelenebilecek hiçbir bülten sayısı yoktur. 'YENİ BÜLTEN HAZIRLA' diyerek ilk bülten taslağınızı oluşturabilirsiniz."
              icon={<FileText size={20} />}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              {filteredIssues.map((issue) => (
                <div 
                  key={issue.id} 
                  className={`p-6 rounded-2xl bg-fb-card border transition-all flex flex-col justify-between space-y-4 hover:translate-y-[-2px] duration-200 ${
                    issue.status === 'sent' 
                      ? 'border-emerald-500/20 bg-gradient-to-br from-fb-card to-emerald-950/5' 
                      : issue.status === 'scheduled'
                      ? 'border-yellow-500/20 bg-gradient-to-br from-fb-card to-yellow-950/5'
                      : 'border-white/[0.04]'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2 border-b border-white/[0.05] pb-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                        issue.status === 'sent'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : issue.status === 'scheduled'
                          ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                          : 'bg-slate-800 text-slate-300'
                      }`}>
                        {issue.status === 'sent' ? 'GÖNDERİLDİ' : issue.status === 'scheduled' ? 'ZAMANLANDI' : 'TASLAK'}
                      </span>
                      <span className="text-[10px] text-fb-muted font-bold">Blok Sayısı: {issue.sections?.length || 0}</span>
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-sm font-black text-white hover:text-fb-yellow transition-colors">{issue.title}</h4>
                      <p className="text-xs text-[#FFB020] font-bold line-clamp-1">Konu: {issue.subject}</p>
                      <p className="text-[11px] text-slate-400 line-clamp-3 font-semibold">{issue.intro}</p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/[0.05] flex items-center justify-between gap-3 flex-wrap">
                    <span className="text-[10px] text-fb-muted font-bold font-mono">
                      {issue.status === 'sent' && issue.sentAt && (
                        <span>Gönderim: {formatDate(issue.sentAt)}</span>
                      )}
                      {issue.status === 'scheduled' && issue.scheduledAt && (
                        <span className="flex items-center gap-1 text-yellow-400">
                          <Clock size={11} /> {formatDate(issue.scheduledAt)}
                        </span>
                      )}
                      {issue.status === 'draft' && (
                        <span>Taslak Kayıt</span>
                      )}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setIsPreviewing(issue)}
                        className="p-1.5 rounded bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
                        title="Önizlemeyi Gör"
                      >
                        <Eye size={12} />
                      </button>

                      {issue.status === 'draft' && (
                        <>
                          <button
                            onClick={() => handleEditIssue(issue)}
                            className="p-1.5 rounded bg-slate-800 text-slate-300 hover:text-fb-yellow transition-colors cursor-pointer"
                            title="Düzenle"
                          >
                            <Edit size={12} />
                          </button>
                          <button
                            onClick={() => handleDirectMarkAsSent(issue)}
                            className="p-1.5 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/10 cursor-pointer"
                            title="Gönderildi Olarak İşaretle"
                          >
                            <Send size={11} />
                          </button>
                        </>
                      )}

                      <button
                        onClick={() => issue.id && handleDeleteIssueClick(issue.id)}
                        className="p-1.5 rounded bg-red-500/15 text-rose-500 hover:bg-red-500/30 transition-colors cursor-pointer"
                        title="Sil"
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

      {/* CONFIRMATION DRAWER */}
      <DeleteConfirmModal
        isOpen={!!deleteIssueId}
        onClose={() => setDeleteIssueId(null)}
        onConfirm={executeDeleteIssue}
        title="Bu bülten sayısını kalıcı olarak silmek istediğine emin misin?"
        message="Seçtiğiniz bülten sayısı ve içindeki içerik blokları kalıcı olarak kaldırılacaktır."
      />
    </div>
  );
};
export default AdminNewsletterIssues;
