import React, { useEffect, useState } from 'react';
import { Link2, RefreshCw, Users, Calendar } from 'lucide-react';
import { getAdminAuthHeaders } from '../../lib/adminAuth';

interface AdminEntityMapProps {
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const AdminEntityMap: React.FC<AdminEntityMapProps> = ({ showToast }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/entity-map');
      const json = await res.json();
      if (json.success) setData(json.data);
      else {
        setData(null);
        showToast(json.message || 'Entity map yok', 'info');
      }
    } catch {
      showToast('entity-map okunamadı', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const runSync = async () => {
    setSyncing(true);
    try {
      const headers = await getAdminAuthHeaders();
      const res = await fetch('/api/admin/jobs/run', {
        method: 'POST',
        headers,
        body: JSON.stringify({ type: 'sync_entity_ids' }),
      });
      const json = await res.json();
      if (json.success) {
        showToast('Entity map güncellendi', 'success');
        await load();
      } else showToast(json.message || 'Sync başarısız', 'error');
    } catch (e: any) {
      showToast(e?.message || 'Sync hatası', 'error');
    } finally {
      setSyncing(false);
    }
  };

  const mappings = data?.matchMappings || [];
  const playerCount = data?.playerMappingsCount ?? data?.playerMappings?.length ?? 0;

  return (
    <div className="space-y-6 max-w-4xl text-left">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-fb-yellow font-mono block mb-2">
            Entity resolver
          </span>
          <h1 className="text-2xl font-display font-black text-white uppercase italic">ID Eşleştirme</h1>
          <p className="text-xs text-slate-400 mt-2 max-w-lg font-medium">
            Site maç/oyuncu kayıtları ↔ FotMob (ve ileride FBref) ID haritası. Kod yazmadan sync.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={load}
            className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 inline ${loading ? 'animate-spin' : ''}`} /> Yenile
          </button>
          <button
            type="button"
            disabled={syncing}
            onClick={runSync}
            className="px-4 py-2 rounded-xl bg-fb-yellow text-fb-navy text-[10px] font-black uppercase cursor-pointer disabled:opacity-50"
          >
            {syncing ? 'Sync…' : 'Entity sync çalıştır'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 rounded-2xl bg-[#0b101c] border border-white/[0.06]">
          <Calendar className="w-4 h-4 text-fb-yellow mb-2" />
          <div className="text-2xl font-display font-black text-white">{mappings.length}</div>
          <div className="text-[10px] uppercase tracking-wider text-slate-500 font-black">Maç eşleşmesi</div>
        </div>
        <div className="p-4 rounded-2xl bg-[#0b101c] border border-white/[0.06]">
          <Users className="w-4 h-4 text-fb-yellow mb-2" />
          <div className="text-2xl font-display font-black text-white">{playerCount}</div>
          <div className="text-[10px] uppercase tracking-wider text-slate-500 font-black">Oyuncu map</div>
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
          <Link2 className="w-3.5 h-3.5" /> Maç mapleri
        </h2>
        {mappings.length === 0 && (
          <p className="text-xs text-slate-500">Henüz eşleşme yok. Önce FotMob advanced, sonra entity sync.</p>
        )}
        {mappings.map((m: any) => (
          <div
            key={m.siteMatchId}
            className="p-3 rounded-xl bg-[#0b101c] border border-white/[0.05] text-xs flex flex-col sm:flex-row sm:items-center gap-2 justify-between"
          >
            <div>
              <div className="font-black text-white">{m.siteMatchId}</div>
              <div className="text-slate-400">
                {m.homeTeam} – {m.awayTeam}
              </div>
            </div>
            <div className="font-mono text-[10px] text-fb-yellow">
              fotmob:{m.providerMatchId}
            </div>
          </div>
        ))}
      </div>

      {data?.fetchedAt && (
        <p className="text-[10px] text-slate-600 font-mono">Son sync: {data.fetchedAt}</p>
      )}
    </div>
  );
};

export default AdminEntityMap;
