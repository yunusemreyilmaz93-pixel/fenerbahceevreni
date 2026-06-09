import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { HeartPulse, CheckCircle, AlertTriangle, AlertCircle, RefreshCw, Layers } from 'lucide-react';
import { dbGetCollection } from '../../lib/dbService';

interface HealthIssue {
  id: string;
  type: 'error' | 'warning' | 'info';
  module: string;
  message: string;
  fixHint: string;
}

interface AdminContentHealthProps {}

export const AdminContentHealth: React.FC<AdminContentHealthProps> = () => {
  const [loading, setLoading] = useState(true);
  const [issues, setIssues] = useState<HealthIssue[]>([]);
  const [healthScore, setHealthScore] = useState(100);

  const runDiagnostics = async () => {
    setLoading(true);
    const discoveredIssues: HealthIssue[] = [];

    try {
      // 1. Check players
      const players = await dbGetCollection('players');
      players.forEach((p: any) => {
        if (!p.photoUrl || p.photoUrl.trim() === '') {
          discoveredIssues.push({
            id: `p-img-${p.id}`,
            type: 'warning',
            module: 'Oyuncular',
            message: `"${p.name || p.playerName || 'Bilinmeyen Oyuncu'}" isimli oyuncunun profil görseli/fotoğrafı eksik.`,
            fixHint: 'Oyuncu Yönetimi sekmesinden fotoğraf yükleyin veya geçerli bir URL tanımlayın.'
          });
        }
        if (!p.marketValue || p.marketValue.trim() === '') {
          discoveredIssues.push({
            id: `p-val-${p.id}`,
            type: 'info',
            module: 'Oyuncular',
            message: `"${p.name || p.playerName}" piyasa değeri boş bırakılmış.`,
            fixHint: 'Oyuncunun tahmini bonservis bedelini ekleyebilirsiniz.'
          });
        }
      });

      // 2. Check teams
      const teams = await dbGetCollection('teams');
      teams.forEach((t: any) => {
        if (!t.logoUrl || t.logoUrl.trim() === '') {
          discoveredIssues.push({
            id: `t-logo-${t.id}`,
            type: 'error',
            module: 'Kulüpler & Takımlar',
            message: `"${t.name || 'Bilinmeyen Takım'}" kulübünün logosu eklenmemiş.`,
            fixHint: 'Takım Listesi formunda logo görseli yükleyin.'
          });
        }
      });

      // 3. Check articles / news
      const articles = await dbGetCollection('articles');
      articles.forEach((a: any) => {
        if (!a.imageUrl && !a.coverImageUrl) {
          discoveredIssues.push({
            id: `a-img-${a.id}`,
            type: 'warning',
            module: 'Makaleler / Haberler',
            message: `"${a.title || 'Başlıksız Yazı'}" analizi için kapak resmi tanımlanmamış.`,
            fixHint: 'Vitrinde kırpılma sorunu yaşamamak için 16:9 oranlı bir WebP kapak görseli bağlayın.'
          });
        }
        if (a.status === 'draft') {
          discoveredIssues.push({
            id: `a-draft-${a.id}`,
            type: 'info',
            module: 'Makaleler / Haberler',
            message: `"${a.title || 'Taslak Yazı'}" şu anda taslak durumunda kaydedilmiş.`,
            fixHint: 'Yayına almak için editoryal iş akışından "published/active" durumuna yükseltin.'
          });
        }
        if (!a.seoTitle || a.seoTitle.length < 10) {
          discoveredIssues.push({
            id: `a-seo-${a.id}`,
            type: 'warning',
            module: 'Makaleler / Haberler',
            message: `"${a.title || 'Başlıksız'}" haberi için SEO Başlığı eksik veya çok kısa.`,
            fixHint: 'Google aramalarında bulunabilirlik için en az 20 karakterlik SEO Başlığı tanımlatmalısınız.'
          });
        }
      });

      // 4. Check transfer targets
      const transfers = await dbGetCollection('transferReports');
      transfers.forEach((tr: any) => {
        if (!tr.scoutNotes || tr.scoutNotes.trim().length < 20) {
          discoveredIssues.push({
            id: `tr-note-${tr.id}`,
            type: 'warning',
            module: 'Transfer Radar',
            message: `"${tr.playerName}" scout raporu detay notu yetersiz.`,
            fixHint: 'Taktik analistler için oyuncunun güçlü/zayıf yönlerini detaylandırın.'
          });
        }
      });

      // 5. Check matches
      const matches = await dbGetCollection('matches');
      matches.forEach((m: any) => {
        if (!m.homeTeam || !m.awayTeam) {
          discoveredIssues.push({
            id: `m-team-${m.id}`,
            type: 'error',
            module: 'Fikstür / Maçlar',
            message: `Oynanacak müsabakada takımlardan biri ataması hatalı. ID: ${m.id}`,
            fixHint: 'Fikstür modülünden maçın takımlarını tekrar kontrol edin.'
          });
        }
      });

      // Calculate score
      const errorCount = discoveredIssues.filter(i => i.type === 'error').length;
      const warningCount = discoveredIssues.filter(i => i.type === 'warning').length;
      const calculatedScore = Math.max(10, 100 - (errorCount * 15) - (warningCount * 5));
      setHealthScore(calculatedScore);
      setIssues(discoveredIssues);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5';
    if (score >= 70) return 'text-fb-yellow border-fb-yellow/20 bg-fb-yellow/5';
    return 'text-rose-500 border-rose-500/20 bg-rose-500/5';
  };

  return (
    <div className="space-y-6 text-left max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-display font-black text-white uppercase italic tracking-wide flex items-center gap-2">
            <HeartPulse className="text-fb-yellow" size={20} /> Sağlık & Veri Checkup Kontrolü
          </h2>
          <p className="text-xs text-fb-muted">
            Doğru ve profesyonel bir ön yüz (frontend) deneyimi sunmak amacıyla eksik fotoğrafları, SEO başlıklarını, boş kalmış alanları tarayıp raporlar.
          </p>
        </div>
        <button
          onClick={runDiagnostics}
          disabled={loading}
          className="self-start sm:self-auto px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 font-black text-xs uppercase tracking-wider rounded-xl border border-white/10 flex items-center gap-2 transition-all cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          YENİDEN TARA
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center rounded-2xl bg-fb-card border border-white/[0.05] text-fb-yellow text-xs font-black uppercase tracking-widest">
          SİSTEM VERİLERİ ANALİZ EDİLİYOR... LÜTFEN BEKLEYİN
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Health Score Gauge card */}
          <div className={`md:col-span-4 p-6 rounded-2xl border text-center flex flex-col justify-between ${getScoreColor(healthScore)}`}>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest block mb-1 opacity-70">GENEL SAĞLIK PUANI</span>
              <div className="my-6">
                <span className="text-7xl font-display font-black italic tracking-tighter block">{healthScore}</span>
                <span className="text-xs font-bold uppercase tracking-wider mt-1 block">/ 100 limit</span>
              </div>
            </div>
            
            <div className="text-left font-semibold text-[10px] space-y-1 pt-4 border-t border-white/5 opacity-85">
              <div>• {issues.filter(i => i.type === 'error').length} Kritik Hata (Kırmızı)</div>
              <div>• {issues.filter(i => i.type === 'warning').length} Uyarı (Sarı)</div>
              <div>• {issues.filter(i => i.type === 'info').length} Editoryal Tavsiye (Mavi)</div>
            </div>
          </div>

          {/* Detailed Issues list */}
          <div className="md:col-span-8 p-5 rounded-2xl bg-fb-card border border-white/[0.08] space-y-4">
            <span className="text-[10px] font-black text-fb-yellow uppercase tracking-widest block pb-1 border-b border-white/5">
              BULGULAR VE DÜZELTME ÖNERİLERİ ({issues.length})
            </span>

            {issues.length === 0 ? (
              <div className="p-8 text-center space-y-3">
                <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto" />
                <h4 className="text-xs font-black text-white uppercase">MÜKEMMEL DURUM!</h4>
                <p className="text-[11px] text-fb-muted font-bold max-w-sm mx-auto">
                  Tebrikler, portal veri tabanında hiçbir kritiğin eksik olmadığı, tüm logo, oyuncu resimleri ve SEO optimizasyonlarının eksiksiz olduğu tespit edildi.
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                {issues.map(issue => (
                  <div
                    key={issue.id}
                    className={`p-3.5 rounded-xl border text-left flex gap-3.5 items-start transition-all ${
                      issue.type === 'error'
                        ? 'border-red-500/20 bg-red-500/5'
                        : issue.type === 'warning'
                          ? 'border-fb-yellow/20 bg-fb-yellow/5'
                          : 'border-blue-500/20 bg-blue-500/5'
                    }`}
                  >
                    <div className="shrink-0 mt-0.5">
                      {issue.type === 'error' ? (
                        <AlertCircle className="w-4 h-4 text-rose-500" />
                      ) : issue.type === 'warning' ? (
                        <AlertTriangle className="w-4 h-4 text-fb-yellow" />
                      ) : (
                        <Layers className="w-4 h-4 text-blue-400" />
                      )}
                    </div>
                    
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-white/5 text-slate-300 border border-white/5">
                          {issue.module}
                        </span>
                        <span className={`text-[8px] font-black uppercase tracking-wider ${
                          issue.type === 'error' ? 'text-red-400' : issue.type === 'warning' ? 'text-fb-yellow' : 'text-blue-400'
                        }`}>
                          {issue.type === 'error' ? 'Kritik Düzeltme' : issue.type === 'warning' ? 'Uyarı / Eksiklik' : 'Öneri'}
                        </span>
                      </div>
                      
                      <p className="text-xs font-black text-slate-200 leading-normal">
                        {issue.message}
                      </p>
                      
                      <p className="text-[10px] text-fb-muted italic font-semibold">
                        💡 Öneri: {issue.fixHint}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminContentHealth;
