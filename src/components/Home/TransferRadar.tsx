import React, { useEffect, useState } from 'react';
import { dbGetCollection } from '../../lib/dbService';

interface TransferTarget {
  id: string;
  playerName: string;
  position: string;
  age: number;
  currentClub: string;
  fitScore: number;
  strengths: string[] | string;
  concerns: string[] | string;
  reportExcerpt?: string;
  slug?: string;
  status?: string;
  marketValue?: string;
  estimatedCost?: string;
  reliability?: string;
  transferStatus?: string;
}

interface TransferRadarProps {
  onNavigate: (view: string) => void;
}

function normalizeArray(val: string[] | string | undefined): string[] {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  return val.split(',').map(s => s.trim()).filter(Boolean);
}

function reliabilityClass(r: string) {
  if (r === 'Yüksek') return 'text-emerald-400';
  if (r === 'Orta') return 'text-[#FFD21F]';
  return 'text-slate-400';
}

function reliabilityDotClass(r: string) {
  if (r === 'Yüksek') return 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]';
  if (r === 'Orta') return 'bg-[#FFD21F] shadow-[0_0_6px_rgba(255,210,31,0.5)]';
  return 'bg-slate-500';
}

const TransferRadar: React.FC<TransferRadarProps> = ({ onNavigate }) => {
  const [targets, setTargets] = useState<TransferTarget[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const fetched = await dbGetCollection('transferReports');
        if (fetched) {
          const published = fetched.filter(
            (t: TransferTarget) =>
              t.status === 'published' || t.status === 'active' || !t.status
          );
          setTargets(published);
        }
      } catch (err) {
        console.error('TransferRadar load error:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Ana sayfada içeriksiz bölüm gösterme: boş durumlar kendi sayfasında (Transfer Radar) yaşar.
  if (!loading && targets.length === 0) return null;

  return (
    <section
      id="transfer-radar"
      className="relative overflow-hidden py-16 md:py-20 border-t border-b border-white/[0.05]"
    >
      <div className="pointer-events-none absolute -top-20 right-[5%] h-[600px] w-[600px] rounded-full bg-fb-yellow/[0.035] blur-[140px]" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-[400px] w-[400px] rounded-full bg-blue-600/[0.04] blur-[120px]" />

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <div className="h-px w-5 bg-fb-yellow opacity-70" />
              <span className="text-[11px] font-semibold tracking-wide text-fb-yellow">
                Scout & küresel izleme
              </span>
            </div>
            <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-white">
              Transfer <span className="text-fb-yellow">radar</span>
            </h2>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('transfer-radar')}
            className="group flex items-center gap-2 text-[13px] font-semibold text-fb-yellow transition-colors hover:text-white cursor-pointer"
          >
            Tüm scout raporları
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </button>
        </div>

        {loading ? (
          <div className="py-16 text-center">
            <span className="text-[13px] font-medium text-fb-yellow/70">Radar taranıyor…</span>
          </div>
        ) : targets.length === 0 ? (
          <div className="mx-auto max-w-sm rounded-2xl ui-surface p-12 text-center">
            <svg className="mx-auto mb-4 h-12 w-12 opacity-20" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="22" stroke="white" strokeWidth="1.5" />
              <path d="M16 24L24 16L32 24L24 32Z" stroke="white" strokeWidth="1.5" />
              <circle cx="24" cy="24" r="3" fill="white" />
            </svg>
            <p className="text-[13px] font-medium text-white/40">Transfer kaydı henüz eklenmedi.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {targets.slice(0, 3).map((player, idx) => {
              const strengths = normalizeArray(player.strengths);
              const concerns = normalizeArray(player.concerns);
              const cost = player.estimatedCost || player.marketValue || '—';
              const rel = player.reliability || 'Orta';
              const status = player.transferStatus || '—';
              const score = player.fitScore;

              return (
                <article
                  key={player.id}
                  onClick={() => {
                    window.location.hash = `#/transfer-radar/${player.slug || player.id}`;
                    onNavigate('transfer-radar');
                  }}
                  className="group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl ui-surface ui-surface-hover transition-all duration-300 hover:-translate-y-0.5"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div className="absolute top-0 inset-x-0 h-px ui-hairline opacity-0 group-hover:opacity-80 transition-opacity" />

                  <span className="pointer-events-none absolute right-5 top-4 select-none font-sans text-5xl font-bold text-white/[0.03]">
                    0{idx + 1}
                  </span>

                  <div className="flex-1 p-6 pb-0">
                    <div className="mb-5 flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-display mb-1.5 text-lg font-bold tracking-tight text-white transition-colors duration-200 group-hover:text-fb-yellow">
                          {player.playerName}
                        </h3>
                        <span className="text-[12px] font-semibold text-fb-yellow">
                          {player.position}
                        </span>
                      </div>

                      <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center gap-0.5 rounded-xl border border-fb-yellow/20 bg-fb-yellow/[0.06]">
                        <span className="text-[9px] font-semibold text-fb-yellow/70">Uyum</span>
                        <span className="font-mono text-[20px] font-bold leading-none text-white">
                          {typeof score === 'number' ? score.toFixed(1) : score ?? '—'}
                        </span>
                        <span className="font-mono text-[9px] text-white/25">/10</span>
                      </div>
                    </div>

                    <div className="mb-4 grid grid-cols-2 divide-x divide-white/[0.06] border-b border-t border-white/[0.06] py-3">
                      <div className="pr-3.5">
                        <span className="mb-0.5 block text-[11px] font-medium text-white/35">
                          Yaş / kulüp
                        </span>
                        <span className="block overflow-hidden text-ellipsis whitespace-nowrap text-[13px] font-semibold text-white">
                          {player.age ?? '—'} · {player.currentClub || '—'}
                        </span>
                      </div>
                      <div className="pl-3.5">
                        <span className="mb-0.5 block text-[11px] font-medium text-white/35">
                          Tahmini maliyet
                        </span>
                        <span className="block text-[13px] font-semibold text-fb-yellow">{cost}</span>
                      </div>
                    </div>

                    <div className="mb-4 flex flex-wrap gap-1.5">
                      <div className="flex items-center gap-1.5 rounded-md border border-white/[0.06] bg-white/[0.03] px-2.5 py-1">
                        <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${reliabilityDotClass(rel)}`} />
                        <span className="text-[11px] font-medium text-white/40">Güven</span>
                        <span className={`text-[11px] font-semibold ${reliabilityClass(rel)}`}>{rel}</span>
                      </div>
                      <div className="flex items-center gap-1.5 rounded-md border border-white/[0.06] bg-white/[0.03] px-2.5 py-1">
                        <span className="text-[11px] font-medium text-white/40">Durum</span>
                        <span className="max-w-[100px] overflow-hidden text-ellipsis whitespace-nowrap text-[11px] font-semibold text-white/55">
                          {status}
                        </span>
                      </div>
                    </div>

                    <p className="mb-4 line-clamp-3 rounded-xl border border-white/[0.05] bg-black/25 px-3.5 py-3 text-[12px] leading-relaxed text-white/50">
                      {player.reportExcerpt ||
                        'Scout birimimiz oyuncunun taktiksel izleme raporunu güncellemektedir.'}
                    </p>

                    <div className="grid grid-cols-2 gap-3.5">
                      {strengths.length > 0 && (
                        <div>
                          <div className="mb-2 flex items-center gap-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                            <span className="text-[11px] font-semibold text-emerald-400/80">
                              Güçlü yönler
                            </span>
                          </div>
                          <ul className="space-y-1.5">
                            {strengths.slice(0, 2).map((s, i) => (
                              <li
                                key={i}
                                className="relative pl-3 text-[12px] font-medium leading-snug text-white/55 before:absolute before:left-0 before:top-[6px] before:h-1 before:w-1 before:rounded-full before:bg-emerald-400/60"
                              >
                                {s}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {concerns.length > 0 && (
                        <div>
                          <div className="mb-2 flex items-center gap-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-fb-yellow" />
                            <span className="text-[11px] font-semibold text-fb-yellow/80">
                              Risk alanları
                            </span>
                          </div>
                          <ul className="space-y-1.5">
                            {concerns.slice(0, 2).map((c, i) => (
                              <li
                                key={i}
                                className="relative pl-3 text-[12px] font-medium leading-snug text-white/55 before:absolute before:left-0 before:top-[6px] before:h-1 before:w-1 before:rounded-full before:bg-fb-yellow/60"
                              >
                                {c}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-white/[0.06] p-6 pt-4">
                    <button
                      type="button"
                      className="w-full cursor-pointer rounded-xl border border-white/[0.08] bg-white/[0.03] py-3 text-[12px] font-semibold text-white/55 transition-all duration-200 group-hover:border-fb-yellow group-hover:bg-fb-yellow group-hover:text-fb-dark"
                    >
                      Detaylı raporu oku →
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default TransferRadar;