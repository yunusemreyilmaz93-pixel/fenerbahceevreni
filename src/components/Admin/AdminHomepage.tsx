import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { 
  Home, 
  Save, 
  CheckCircle, 
  Eye, 
  EyeOff,
  Activity,
  Award,
  Calendar,
  FileText
} from 'lucide-react';
import { dbGetCollection, dbUpsertDocument } from '../../lib/dbService';

interface AdminHomepageProps {
  showToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const AdminHomepage: React.FC<AdminHomepageProps> = ({ showToast }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  // Content databases for selectors
  const [articles, setArticles] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [transferReports, setTransferReports] = useState<any[]>([]);

  const [form, setForm] = useState({
    heroTitle: 'FENERBAHÇE’NİN TAKTİKSEL EVRENİNE HOŞ GELDİNİZ',
    heroSubtext: 'Fenerbahçe Evreni, bağımsız bir analiz ve taraftar platformudur. Taktik raporlar, muhtemel XI ve scout analizleri ile Kadıköy rüzgarı burada.',
    heroCtaText: 'TAKTİK EVRENİNE GİRİŞ YAP',
    showMatchCenter: true,
    showAnalysis: true,
    showScoutRadar: true,
    showPlayerRatings: true,
    showCommunityPolls: true,
    showPremiumSection: true,
    showNewsletter: true,
    // Featured IDs pinned by the editor
    pinnedArticleId: '',
    pinnedMatchId: '',
    pinnedTransferId: ''
  });

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      try {
        // 1. Fetch collections
        const fetchedArticles = await dbGetCollection('articles');
        const fetchedMatches = await dbGetCollection('matches');
        const fetchedTransfers = await dbGetCollection('transferReports');

        setArticles(fetchedArticles);
        setMatches(fetchedMatches);
        setTransferReports(fetchedTransfers);

        // 2. Load settings configuration
        const homes = await dbGetCollection('homeSettings');
        const mainConfig = homes.find(h => h.id === 'main');
        if (mainConfig) {
          setForm({
            heroTitle: mainConfig.heroTitle || '',
            heroSubtext: mainConfig.heroSubtext || '',
            heroCtaText: mainConfig.heroCtaText || '',
            showMatchCenter: mainConfig.showMatchCenter === undefined ? true : !!mainConfig.showMatchCenter,
            showAnalysis: mainConfig.showAnalysis === undefined ? true : !!mainConfig.showAnalysis,
            showScoutRadar: mainConfig.showScoutRadar === undefined ? true : !!mainConfig.showScoutRadar,
            showPlayerRatings: mainConfig.showPlayerRatings === undefined ? true : !!mainConfig.showPlayerRatings,
            showCommunityPolls: mainConfig.showCommunityPolls === undefined ? true : !!mainConfig.showCommunityPolls,
            showPremiumSection: mainConfig.showPremiumSection === undefined ? true : !!mainConfig.showPremiumSection,
            showNewsletter: mainConfig.showNewsletter === undefined ? true : !!mainConfig.showNewsletter,
            pinnedArticleId: mainConfig.pinnedArticleId || '',
            pinnedMatchId: mainConfig.pinnedMatchId || '',
            pinnedTransferId: mainConfig.pinnedTransferId || ''
          });
        }
      } catch (err) {
        console.error("Home configuration load error:", err);
      } finally {
        setLoading(false);
      }
    };
    loadAll();
  }, []);

  const safeFormSet = (field: string, val: any) => {
    setForm(p => ({ ...p, [field]: val }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await dbUpsertDocument('homeSettings', 'main', {
        ...form,
        updatedAt: new Date().toISOString()
      });
      setSuccessMsg(true);
      if (showToast) showToast("Ana Sayfa vitrin ayarları başarıyla kaydedildi.", "success");
      setTimeout(() => setSuccessMsg(false), 3000);
    } catch (err) {
      console.error(err);
      if (showToast) showToast("Seçim ayarları kaydedilirken hata oluştu doğrulanıyor.", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-20 text-fb-yellow text-xs font-black uppercase tracking-wider">
        ANA SAYFA YAPILANDIRMASI GÜNCELLEŞTİRİLİYOR...
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left max-w-4xl mx-auto">
      <div>
        <h2 className="text-xl font-display font-black text-white uppercase italic tracking-wide flex items-center gap-2">
          <Home className="text-fb-yellow" size={20} /> Ana Sayfa Vitrini & Bölüm Ayarları
        </h2>
        <p className="text-xs text-fb-muted">Manşet sloganlarını, aktif bento kartlarını ve vitrinde öne çıkacak yazıları/müsabakaları düzenleyin.</p>
      </div>

      {successMsg && (
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center gap-2"
        >
          <CheckCircle className="shrink-0" size={16} />
          Ana sayfa görünüm ve öne çıkarılan içerik ayarları başarıyla kaydedildi!
        </motion.div>
      )}

      <form onSubmit={handleSave} className="p-6 rounded-2xl bg-fb-card border border-white/[0.08] space-y-6">
        
        {/* HERO SECTION BLOCK */}
        <div className="space-y-4">
          <span className="text-[10px] font-black text-fb-yellow uppercase tracking-widest block pb-1 border-b border-white/5">1. SARI-LACİVERT ANA MANŞET AYARLARI (HERO SECTION)</span>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black text-slate-400">İŞTAH KABARTAN ANA BAŞLIK</label>
            <input
              type="text"
              required
              value={form.heroTitle}
              onChange={(e) => safeFormSet('heroTitle', e.target.value)}
              className="px-4 py-2.5 bg-fb-dark border border-white/10 rounded-xl text-xs text-white uppercase font-black"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black text-slate-400">SLOGAN/YARDIMCI AÇIKLAMA METNİ</label>
            <textarea
              required
              rows={3}
              value={form.heroSubtext}
              onChange={(e) => safeFormSet('heroSubtext', e.target.value)}
              className="px-4 py-2.5 bg-fb-dark border border-white/10 rounded-xl text-xs text-slate-300 font-semibold"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black text-slate-400">SARI AKSİYON TONLU BUTON METNİ (CTA BUTTON)</label>
            <input
              type="text"
              required
              value={form.heroCtaText}
              onChange={(e) => safeFormSet('heroCtaText', e.target.value)}
              className="px-4 py-2.5 bg-fb-dark border border-white/10 rounded-xl text-xs text-white"
            />
          </div>
        </div>

        {/* PINNED (FEATURED) CONTENT SELECTOR */}
        <div className="space-y-4">
          <span className="text-[10px] font-black text-fb-yellow uppercase tracking-widest block pb-1 border-b border-white/5">2. ÖNE ÇIKARILAN SABİT İÇERİKLER (PINNED CONTENT)</span>
          <p className="text-[10px] text-fb-muted">Manşet veya bento grid dâhilinde taraftarlara özel olarak vurgulanacak ve birinci sırada listelenecek içerikler.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* PINNED ARTICLE */}
            <div className="flex flex-col gap-1 p-3.5 rounded-xl bg-fb-dark/40 border border-white/5">
              <label className="text-[9px] font-black text-fb-yellow uppercase flex items-center gap-1">
                <FileText size={12} /> Vitrin Başyazısı / Analizi
              </label>
              <select
                value={form.pinnedArticleId}
                onChange={(e) => safeFormSet('pinnedArticleId', e.target.value)}
                className="mt-1.5 px-3 py-2 bg-fb-dark border border-white/15 rounded-lg text-xs text-white focus:outline-none focus:border-fb-yellow [&>option]:bg-fb-card w-full"
              >
                <option value="">-- En son yazılardan otomatik seç --</option>
                {articles.map(art => (
                  <option key={art.id} value={art.id}>
                    {art.title?.substring(0, 45)}{art.title?.length > 45 ? '...' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* PINNED MATCH */}
            <div className="flex flex-col gap-1 p-3.5 rounded-xl bg-fb-dark/40 border border-white/5">
              <label className="text-[9px] font-black text-fb-yellow uppercase flex items-center gap-1">
                <Calendar size={12} /> Vitrin Maç Merkezi Fikstürü
              </label>
              <select
                value={form.pinnedMatchId}
                onChange={(e) => safeFormSet('pinnedMatchId', e.target.value)}
                className="mt-1.5 px-3 py-2 bg-fb-dark border border-white/15 rounded-lg text-xs text-white focus:outline-none focus:border-fb-yellow [&>option]:bg-fb-card w-full"
              >
                <option value="">-- En yakın gelecek maçtan çek --</option>
                {matches.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.homeTeam} vs {m.awayTeam} ({m.competition?.split('•')[0]})
                  </option>
                ))}
              </select>
            </div>

            {/* PINNED SCOUT REPORT */}
            <div className="flex flex-col gap-1 p-3.5 rounded-xl bg-fb-dark/40 border border-white/5">
              <label className="text-[9px] font-black text-fb-yellow uppercase flex items-center gap-1">
                <Award size={12} /> Vitrin Scout Radar Raporu
              </label>
              <select
                value={form.pinnedTransferId}
                onChange={(e) => safeFormSet('pinnedTransferId', e.target.value)}
                className="mt-1.5 px-3 py-2 bg-fb-dark border border-white/15 rounded-lg text-xs text-white focus:outline-none focus:border-fb-yellow [&>option]:bg-fb-card w-full"
              >
                <option value="">-- En son scout taramasından al --</option>
                {transferReports.map(tr => (
                  <option key={tr.id} value={tr.id}>
                    {tr.playerName} - {tr.position} ({tr.fitScore}/10)
                  </option>
                ))}
              </select>
            </div>

          </div>
        </div>

        {/* SECTION TOGGLES */}
        <div className="space-y-4">
          <span className="text-[10px] font-black text-fb-yellow uppercase tracking-widest block pb-1 border-b border-white/5">3. BENTO-GRİD GÖRÜNÜRLÜK (VISIBILITY TOGGLES)</span>
          
          <div className="p-4 rounded-xl bg-fb-dark/40 border border-white/5 space-y-4">
            {[
              { key: 'showMatchCenter', label: 'Maç Merkezi Paneli', desc: 'Süper lig muhtemel 11 ve yaklaşan fikstür kartı widget\'ı.' },
              { key: 'showAnalysis', label: 'En Son Taktik Analizler', desc: 'Yazarların makale listesi şeridi.' },
              { key: 'showScoutRadar', label: 'Transfer Scout Radar Kartı', desc: 'Süper lig potansiteller analiz radar kartları şeridi.' },
              { key: 'showPlayerRatings', label: 'Oyuncu Performans Puan Tablosu', desc: 'Kadro form yönü analizi.' },
              { key: 'showCommunityPolls', label: 'Anketler & Taraftar Nabız Bölümü', desc: 'Voter destekli online anket listesi.' },
              { key: 'showPremiumSection', label: 'Premium Özel Bültenci Bölümü', desc: 'Katma değerli PDF şablonu kitlesel görsel daveti.' },
              { key: 'showNewsletter', label: 'E-bülten Post Kutusu', desc: 'Email sign-up kutucuk formu.' }
            ].map((toggle) => (
              <label key={toggle.key} className="flex items-center justify-between cursor-pointer group">
                <div className="flex items-start gap-3 text-left">
                  <div className="p-1 rounded bg-white/5 text-slate-400 group-hover:text-fb-yellow">
                    {(form as any)[toggle.key] ? <Eye size={14} /> : <EyeOff size={14} />}
                  </div>
                  <div>
                    <span className="text-xs font-black text-white block">{toggle.label}</span>
                    <span className="text-[9px] text-fb-muted block">{toggle.desc}</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={!!(form as any)[toggle.key]}
                  onChange={(e) => safeFormSet(toggle.key, e.target.checked)}
                  className="w-5 h-5 accent-fb-yellow cursor-pointer"
                />
              </label>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-white/5 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-fb-yellow hover:bg-white text-fb-navy rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-3 transition-all cursor-pointer shadow-lg disabled:opacity-50"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-fb-navy border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save size={15} />
            )}
            <span>DEĞİŞİKLİKLERİ KAYDET VE UYGULA</span>
          </button>
        </div>
      </form>
    </div>
  );
};
