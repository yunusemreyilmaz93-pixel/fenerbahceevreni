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

  return (
    <section
      id="transfer-radar"
      className="relative overflow-hidden py-20 bg-[#090D16] border-t border-b border-white/[0.03]"
    >
      {/* Atmospheric glow */}
      <div className="pointer-events-none absolute -top-20 right-[5%] h-[600px] w-[600px] rounded-full bg-[#FFD21F]/[0.035] blur-[140px]" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-[400px] w-[400px] rounded-full bg-blue-600/[0.04] blur-[120px]" />

      <div className="relative z-10 mx-auto max-w-7xl px-10">

        {/* ── Header ── */}
        <div className="mb-14 flex items-end justify-between">
          <div>
            <div className="mb-2.5 flex items-center gap-2.5">
              <div className="h-px w-6 bg-[#FFD21F] opacity-70" />
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-[#FFD21F] opacity-85">
                Scout &amp; Küresel İzleme Ofisi
              </span>
            </div>
            <h2 className="font-display text-4xl font-black italic uppercase tracking-tight text-white">
              Transfer <span className="text-[#FFD21F]">Radar</span>
            </h2>
          </div>

          <button
            onClick={() => onNavigate('transfer-radar')}
            className="group flex items-center gap-2 font-mono text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#FFD21F] transition-colors hover:text-white"
          >
            Tüm Scout Raporları
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </button>
        </div>

        {/* ── States ── */}
        {loading ? (
          <div className="py-20 text-center">
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-[#FFD21F] opacity-70">
              Radar Taranıyor...
            </span>
          </div>
        ) : targets.length === 0 ? (
          <div className="mx-auto max-w-sm rounded-2xl border border-white/[0.06] bg-[#0E1420] p-16 text-center">
            <svg className="mx-auto mb-4 h-12 w-12 opacity-20" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="22" stroke="white" strokeWidth="1.5" />
              <path d="M16 24L24 16L32 24L24 32Z" stroke="white" strokeWidth="1.5" />
              <circle cx="24" cy="24" r="3" fill="white" />
            </svg>
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.15em] text-white/30">
              Transfer kaydı henüz eklenmedi.
            </p>
          </div>
        ) : (
          /* ── Cards Grid ── */
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
                  className="group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0E1420] transition-all duration-300 hover:-translate-y-1 hover:border-[#FFD21F]/25 hover:shadow-[0_20px_60px_rgba(0,0,0,0.35),0_0_0_1px_rgba(255,210,31,0.08)]"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  {/* Top shimmer on hover */}
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-transparent to-transparent transition-all duration-300 group-hover:via-[#FFD21F]/40" />

                  {/* Watermark index */}
                  <span className="pointer-events-none absolute right-5 top-4 select-none font-sans text-6xl font-black italic text-white/[0.025]">
                    0{idx + 1}
                  </span>

                  <div className="flex-1 p-6 pb-0">

                    {/* Player name + fit score */}
                    <div className="mb-5 flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-display mb-1.5 text-xl font-black italic uppercase tracking-tight text-white transition-colors duration-200 group-hover:text-[#FFD21F]">
                          {player.playerName}
                        </h3>
                        <span className="font-mono text-[9px] font-extrabold uppercase tracking-[0.2em] text-[#FFD21F]">
                          {player.position}
                        </span>
                      </div>

                      <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center gap-0.5 rounded-xl border border-[#FFD21F]/15 bg-[#FFD21F]/[0.06]">
                        <span className="font-mono text-[7px] font-bold uppercase tracking-[0.15em] text-[#FFD21F]/60">
                          Uyum
                        </span>
                        <span className="font-mono text-[22px] font-black leading-none text-white">
                          {typeof score === 'number' ? score.toFixed(1) : score ?? '—'}
                        </span>
                        <span className="font-mono text-[9px] text-white/25">/10</span>
                      </div>
                    </div>

                    {/* Meta row */}
                    <div className="mb-4.5 grid grid-cols-2 divide-x divide-white/[0.04] border-b border-t border-white/[0.04] py-3">
                      <div className="pr-3.5">
                        <span className="font-mono mb-0.5 block text-[8px] font-bold uppercase tracking-[0.18em] text-white/25">
                          Yaş / Kulüp
                        </span>
                        <span className="block overflow-hidden text-ellipsis whitespace-nowrap text-xs font-extrabold text-white">
                          {player.age ?? '—'} · {player.currentClub || '—'}
                        </span>
                      </div>
                      <div className="pl-3.5">
                        <span className="font-mono mb-0.5 block text-[8px] font-bold uppercase tracking-[0.18em] text-white/25">
                          Tahmini Maliyet
                        </span>
                        <span className="block text-xs font-extrabold text-[#FFD21F]">
                          {cost}
                        </span>
                      </div>
                    </div>

                    {/* Status badges */}
                    <div className="mb-4 flex flex-wrap gap-1.5">
                      <div className="flex items-center gap-1.5 rounded-md border border-white/[0.05] bg-white/[0.025] px-2.5 py-1">
                        <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${reliabilityDotClass(rel)}`} />
                        <span className="font-mono text-[8px] font-bold uppercase tracking-[0.15em] text-white/30">
                          Güven
                        </span>
                        <span className={`font-mono text-[9px] font-extrabold uppercase tracking-[0.12em] ${reliabilityClass(rel)}`}>
                          {rel}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 rounded-md border border-white/[0.05] bg-white/[0.025] px-2.5 py-1">
                        <span className="font-mono text-[8px] font-bold uppercase tracking-[0.15em] text-white/30">
                          Durum
                        </span>
                        <span className="font-mono max-w-[100px] overflow-hidden text-ellipsis whitespace-nowrap text-[9px] font-extrabold uppercase tracking-[0.12em] text-white/50">
                          {status}
                        </span>
                      </div>
                    </div>

                    {/* Excerpt */}
                    <p className="mb-4 line-clamp-3 rounded-xl border border-white/[0.04] bg-black/25 px-3.5 py-3 text-[11.5px] italic leading-relaxed text-white/45">
                      "{player.reportExcerpt || 'Scout birimimiz oyuncunun taktiksel izleme raporunu güncellemektedir.'}"
                    </p>

                    {/* Strengths / Concerns */}
                    <div className="grid grid-cols-2 gap-3.5">
                      {strengths.length > 0 && (
                        <div>
                          <div className="mb-2 flex items-center gap-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                            <span className="font-mono text-[8px] font-extrabold uppercase tracking-[0.18em] text-emerald-400/75">
                              Güçlü Yönler
                            </span>
                          </div>
                          <ul className="space-y-1.5">
                            {strengths.slice(0, 2).map((s, i) => (
                              <li
                                key={i}
                                className="relative pl-3 text-[11px] font-medium leading-snug text-white/55 before:absolute before:left-0 before:top-[6px] before:h-1 before:w-1 before:rounded-full before:bg-emerald-400/60"
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
                            <span className="h-1.5 w-1.5 rounded-full bg-[#FFD21F]" />
                            <span className="font-mono text-[8px] font-extrabold uppercase tracking-[0.18em] text-[#FFD21F]/75">
                              Risk Alanları
                            </span>
                          </div>
                          <ul className="space-y-1.5">
                            {concerns.slice(0, 2).map((c, i) => (
                              <li
                                key={i}
                                className="relative pl-3 text-[11px] font-medium leading-snug text-white/55 before:absolute before:left-0 before:top-[6px] before:h-1 before:w-1 before:rounded-full before:bg-[#FFD21F]/60"
                              >
                                {c}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Footer CTA */}
                  <div className="border-t border-white/[0.04] p-6 pt-4">
                    <button className="font-mono w-full cursor-pointer rounded-xl border border-white/[0.07] bg-white/[0.03] py-3 text-[10px] font-extrabold uppercase tracking-[0.18em] text-white/50 transition-all duration-200 group-hover:border-[#FFD21F] group-hover:bg-[#FFD21F] group-hover:text-[#090D16]">
                      Detaylı Raporu Oku →
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