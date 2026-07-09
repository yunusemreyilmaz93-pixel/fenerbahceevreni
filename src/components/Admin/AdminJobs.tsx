import React, { useEffect, useState, useCallback } from 'react';
import { Play, RefreshCw, CheckCircle2, XCircle, Clock, Terminal, Loader2, ShieldCheck } from 'lucide-react';
import { getAdminAuthHeaders } from '../../lib/adminAuth';

interface AdminJobsProps {
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  adminUser?: any;
}

type JobType =
  | 'health_probe'
  | 'sync_standings'
  | 'sync_squad'
  | 'sync_match_advanced'
  | 'sync_player_season_stats'
  | 'sync_entity_ids';

const JOB_DEFS: { type: JobType; label: string; desc: string; seasonHint?: string }[] = [
  { type: 'health_probe', label: 'Sağlık kontrolü', desc: 'Dosya ve contracts smoke test' },
  { type: 'sync_standings', label: 'Puan durumu (TM)', desc: 'Transfermarkt Super Lig tablosu', seasonHint: '2025' },
  { type: 'sync_squad', label: 'Kadro (TM)', desc: 'Fenerbahçe kadro + foto', seasonHint: '2026' },
  { type: 'sync_match_advanced', label: 'Maç advanced (FotMob)', desc: 'xG, shotmap, rating — team 8695', seasonHint: '2025-26' },
  { type: 'sync_player_season_stats', label: 'Sezon stats (FBref→FotMob)', desc: 'FBref veya xG table fallback', seasonHint: '2025-26' },
  { type: 'sync_entity_ids', label: 'Entity map', desc: 'FotMob ↔ site maç/oyuncu eşleştir + stats yaz' },
];

interface JobLog {
  id: string;
  jobType?: string;
  status?: string;
  recordsWritten?: number;
  errorSummary?: string | null;
  startedAt?: string;
  finishedAt?: string;
  provider?: string | string[];
}

export const AdminJobs: React.FC<AdminJobsProps> = ({ showToast }) => {
  const [logs, setLogs] = useState<JobLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<string>('');

  const loadLogs = useCallback(async () => {
    setLoading(true);
    try {
      const headers = await getAdminAuthHeaders();
      const res = await fetch('/api/admin/jobs', { headers });
      const json = await res.json();
      if (json.success) {
        setLogs(json.data || []);
      } else {
        showToast(json.message || 'Job listesi alınamadı', 'error');
      }
    } catch (e: any) {
      showToast(e?.message || 'Job API erişilemedi (oturum / sunucu?)', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const runJob = async (type: JobType, season?: string) => {
    setRunning(type);
    setLastResult('');
    try {
      const headers = await getAdminAuthHeaders();
      const res = await fetch('/api/admin/jobs/run', {
        method: 'POST',
        headers,
        body: JSON.stringify({ type, season: season || undefined }),
      });
      const json = await res.json();
      if (json.success) {
        showToast(`${type} tamamlandı (${json.data?.status || 'ok'})`, 'success');
        setLastResult(JSON.stringify(json.data, null, 2));
      } else {
        showToast(json.message || 'Job başarısız', 'error');
        setLastResult(JSON.stringify(json, null, 2));
      }
      await loadLogs();
    } catch (e: any) {
      showToast(e?.message || 'Job çalıştırılamadı', 'error');
    } finally {
      setRunning(null);
    }
  };

  const statusIcon = (s?: string) => {
    if (s === 'success') return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
    if (s === 'failed') return <XCircle className="w-4 h-4 text-rose-400" />;
    if (s === 'running') return <Loader2 className="w-4 h-4 text-fb-yellow animate-spin" />;
    return <Clock className="w-4 h-4 text-slate-500" />;
  };

  return (
    <div className="space-y-8 text-left max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-fb-yellow font-mono block mb-2">
            Data pipeline
          </span>
          <h1 className="text-2xl font-display font-black text-white uppercase italic">Scraper Jobs</h1>
          <p className="text-xs text-slate-400 mt-2 max-w-xl font-medium">
            Tek tıkla veri çek. Tüm istekler <strong className="text-white">checkAdmin</strong> ile korunur (Bearer token).
            Loglar <code className="text-fb-yellow">data-worker/output/scrapeJobs</code>.
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-[10px] font-mono text-emerald-400/90">
            <ShieldCheck className="w-3.5 h-3.5" /> Auth: Firebase ID token
          </div>
        </div>
        <button
          type="button"
          onClick={loadLogs}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-black uppercase tracking-wider hover:border-fb-yellow/40 transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Yenile
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {JOB_DEFS.map((j) => (
          <div
            key={j.type}
            className="p-5 rounded-2xl bg-[#0b101c] border border-white/[0.06] flex flex-col gap-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wide">{j.label}</h3>
                <p className="text-[11px] text-slate-400 mt-1 font-medium leading-relaxed">{j.desc}</p>
                <code className="text-[10px] text-slate-500 font-mono mt-2 block">{j.type}</code>
              </div>
              <button
                type="button"
                disabled={!!running}
                onClick={() => runJob(j.type, j.seasonHint)}
                className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-fb-yellow text-fb-navy text-[10px] font-black uppercase tracking-wider hover:bg-white transition-colors cursor-pointer disabled:opacity-50"
              >
                {running === j.type ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Play className="w-3.5 h-3.5" />
                )}
                Çalıştır
              </button>
            </div>
          </div>
        ))}
      </div>

      {lastResult && (
        <div className="p-4 rounded-2xl bg-black/40 border border-white/10">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-fb-yellow mb-2">
            <Terminal className="w-3.5 h-3.5" /> Son sonuç
          </div>
          <pre className="text-[11px] text-slate-300 font-mono overflow-x-auto whitespace-pre-wrap max-h-48 overflow-y-auto">
            {lastResult}
          </pre>
        </div>
      )}

      <div className="space-y-3">
        <h2 className="text-xs font-black uppercase tracking-widest text-slate-400">Son job logları</h2>
        {logs.length === 0 && !loading && (
          <p className="text-xs text-slate-500">Henüz log yok. Bir job çalıştır.</p>
        )}
        <div className="space-y-2">
          {logs.slice(0, 15).map((log) => (
            <div
              key={log.id}
              className="flex items-center gap-3 p-3 rounded-xl bg-[#0b101c] border border-white/[0.05] text-xs"
            >
              {statusIcon(log.status)}
              <div className="flex-1 min-w-0">
                <div className="font-black text-white truncate">{log.jobType || log.id}</div>
                <div className="text-[10px] text-slate-500 font-mono truncate">
                  {log.id} · written={log.recordsWritten ?? '—'} · {log.finishedAt || log.startedAt || ''}
                </div>
                {log.errorSummary && (
                  <div className="text-[10px] text-rose-400 mt-0.5 truncate">{log.errorSummary}</div>
                )}
              </div>
              <span
                className={`text-[9px] font-black uppercase px-2 py-1 rounded-lg ${
                  log.status === 'success'
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : log.status === 'failed'
                      ? 'bg-rose-500/10 text-rose-400'
                      : 'bg-white/5 text-slate-400'
                }`}
              >
                {log.status || '—'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminJobs;

