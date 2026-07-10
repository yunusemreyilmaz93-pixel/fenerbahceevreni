import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Users, ChevronRight, ShieldCheck } from 'lucide-react';
import { dbGetCollection } from '../../lib/dbService';
import { SectionHeader, EmptyState, SkeletonCard } from '../ui';

interface SquadShowcaseProps {
  onNavigate: (view: string) => void;
}

interface SquadPlayer {
  id: string;
  name: string;
  slug: string;
  position: string;
  age?: number;
  nationality?: string;
  photo?: string;
  shirtNumber?: number | null;
  marketValue?: string | null;
  contractEndDate?: string | null;
}

/** "27.00 mil. €" / "800 bin €" → EUR sayısına çevirir (yalnızca gerçek veriden toplam üretmek için). */
const parseMarketValue = (mv?: string | null): number => {
  if (!mv) return 0;
  const m = mv.replace(',', '.').match(/([\d.]+)\s*(mil|bin)?/i);
  if (!m) return 0;
  const n = parseFloat(m[1]);
  if (Number.isNaN(n)) return 0;
  if (/mil/i.test(mv)) return n * 1_000_000;
  if (/bin/i.test(mv)) return n * 1_000;
  return n;
};

const formatEur = (v: number): string => {
  if (v >= 1_000_000) return `€${(v / 1_000_000).toFixed(v % 1_000_000 === 0 ? 0 : 1)}M`;
  if (v >= 1_000) return `€${Math.round(v / 1_000)}K`;
  return `€${v}`;
};

const SquadShowcase: React.FC<SquadShowcaseProps> = ({ onNavigate }) => {
  const [players, setPlayers] = useState<SquadPlayer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const list = await dbGetCollection('players');
        setPlayers((list || []).filter((p: any) => p.status === 'active'));
      } catch (err) {
        console.error('SquadShowcase load error:', err);
        setPlayers([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const topByValue = useMemo(
    () =>
      [...players]
        .filter((p) => parseMarketValue(p.marketValue) > 0)
        .sort((a, b) => parseMarketValue(b.marketValue) - parseMarketValue(a.marketValue))
        .slice(0, 5),
    [players]
  );

  const totals = useMemo(() => {
    const withValue = players.filter((p) => parseMarketValue(p.marketValue) > 0);
    const totalValue = withValue.reduce((acc, p) => acc + parseMarketValue(p.marketValue), 0);
    const withAge = players.filter((p) => (p.age || 0) > 0);
    const avgAge = withAge.length > 0 ? withAge.reduce((a, p) => a + (p.age || 0), 0) / withAge.length : null;
    return {
      size: players.length,
      totalValue: totalValue > 0 ? formatEur(totalValue) : null,
      avgAge: avgAge !== null ? avgAge.toFixed(1) : null,
    };
  }, [players]);

  return (
    <section className="py-14 md:py-16 border-t border-[var(--fe-line-subtle)] relative">
      <div className="fe-container relative z-10">
        <SectionHeader
          kicker="Kadro atlası"
          title="Piyasa değeri liderleri"
          action={{ label: 'Tüm kadro', onClick: () => onNavigate('players') }}
          className="mb-8"
          editorial
        />

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonCard key={i} lines={4} />
            ))}
          </div>
        ) : topByValue.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Kadro verisi henüz yüklenmedi"
            description="Sezon kadrosu içe aktarıldığında oyuncu vitrini burada yayınlanır."
            action={{ label: 'Oyuncular sayfası', onClick: () => onNavigate('players') }}
          />
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-2.5 mb-8">
              {[
                { label: 'Kadro', val: `${totals.size} oyuncu` },
                totals.avgAge ? { label: 'Yaş ort.', val: totals.avgAge } : null,
                totals.totalValue ? { label: 'Piyasa', val: totals.totalValue } : null,
              ]
                .filter(Boolean)
                .map((s: any, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.03] border border-white/[0.07]"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-fb-yellow" aria-hidden />
                    <span className="text-[11px] font-medium text-slate-500">{s.label}</span>
                    <span className="text-[13px] font-display font-bold text-white">{s.val}</span>
                  </div>
                ))}
              <span className="text-[11px] text-slate-600 font-medium ml-auto hidden md:block">
                Kaynak: Transfermarkt · 26/27
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-5">
              {topByValue.map((p, i) => (
                <motion.button
                  key={p.id}
                  type="button"
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: i * 0.07 }}
                  viewport={{ once: true }}
                  onClick={() => onNavigate('players')}
                  className="group relative rounded-2xl ui-surface ui-surface-hover overflow-hidden text-left cursor-pointer hover:-translate-y-0.5"
                >
                  <div className="relative h-40 md:h-44 bg-gradient-to-b from-[#121a2e] to-transparent flex items-end justify-center overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(255,210,31,0.08),transparent_60%)]" />
                    {p.photo ? (
                      <img
                        src={p.photo}
                        alt={p.name}
                        className="h-32 md:h-36 object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <Users className="w-12 h-12 text-slate-700 mb-10" />
                    )}
                    {p.shirtNumber ? (
                      <span className="absolute top-3 right-3 text-2xl font-display font-bold text-white/10 group-hover:text-fb-yellow/25 transition-colors">
                        #{p.shirtNumber}
                      </span>
                    ) : null}
                  </div>

                  <div className="p-4 space-y-1.5">
                    <span className="text-[11px] font-semibold text-fb-yellow block">{p.position}</span>
                    <h3 className="text-sm font-display font-bold text-white leading-tight truncate group-hover:text-fb-yellow transition-colors">
                      {p.name}
                    </h3>
                    <div className="flex items-center justify-between pt-1.5 border-t border-white/[0.06]">
                      <span className="text-[11px] text-slate-500 font-medium">
                        {p.age ? `${p.age} yaş` : ''}
                      </span>
                      {p.marketValue && (
                        <span className="text-[12px] font-mono font-bold text-emerald-400">
                          {p.marketValue}
                        </span>
                      )}
                    </div>
                  </div>

                  <span className="absolute bottom-3.5 right-3.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ChevronRight className="w-3.5 h-3.5 text-fb-yellow" />
                  </span>
                </motion.button>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default SquadShowcase;
