import React from 'react';
import { motion } from 'motion/react';
import { Activity, BarChart3, Timer } from 'lucide-react';
import ShotmapPitch from '../ShotmapPitch';
import { DataBadge, EmptyState, XGCompare } from '../../ui';
import { GoalTimeline, ScoreFlow } from './MatchGoalViz';
import { hasDetailedStats } from '../../../lib/matchAdvanced';

const fadeUp = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as any },
};

export interface MatchStatsTabProps {
  match: any;
  goals: any[];
  shotmapShots: any[];
  advancedLoading?: boolean;
}

/**
 * D3 — İstatistik sekmesi (world-class).
 * Gol viz · provider stats · xG · shotmap · dürüst empty states · DataBadge.
 */
export const MatchStatsTab: React.FC<MatchStatsTabProps> = ({
  match,
  goals,
  shotmapShots,
  advancedLoading,
}) => {
  if (!match) return null;

  const isCompleted = match.status === 'finished' || match.status === 'completed';
  const detailed = hasDetailedStats(match);
  const firstHalf = goals.filter((g) => g.minute <= 45).length;
  const secondHalf = goals.length - firstHalf;
  const ownGoals = goals.filter((g) => /kendi kalesine|k\.k\./i.test(g.scorer || '')).length;
  // FB clean sheet: if FB is home, away score 0; if away, home score 0
  const fbIsHome = /fenerbah/i.test(match.homeTeam || '');
  const cleanSheet = fbIsHome
    ? Number(match.scoreAway || 0) === 0
    : Number(match.scoreHome || 0) === 0;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Section hierarchy label */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-mono font-black uppercase tracking-[0.22em] text-fb-yellow mb-1">
            Veri katmanı
          </p>
          <h2 className="text-xl md:text-2xl font-display font-black text-white uppercase italic tracking-tight">
            İstatistik & advanced
          </h2>
        </div>
        <DataBadge
          provider={match.statsProvider}
          fetchedAt={match.statsFetchedAt}
          extra={
            advancedLoading
              ? 'yükleniyor…'
              : shotmapShots.length
                ? `${shotmapShots.length} şut`
                : null
          }
          showMissing={!match.statsProvider && isCompleted}
        />
      </div>

      {/* Goal-derived cards — only real goals array */}
      {isCompleted && goals.length > 0 && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Toplam Gol', value: String(goals.length) },
              { label: 'İY / 2Y', value: `${firstHalf} / ${secondHalf}` },
              { label: 'FB Clean Sheet', value: cleanSheet ? 'Evet' : 'Hayır' },
              { label: 'Kendi Kalesine', value: String(ownGoals) },
            ].map((s) => (
              <div
                key={s.label}
                className="p-4 rounded-2xl bg-[#0b101c] border border-white/[0.06] text-center"
              >
                <div className="text-xl md:text-2xl font-display font-black italic text-[#FFD21F]">
                  {s.value}
                </div>
                <div className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-1 font-mono">
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div {...fadeUp} className="p-6 rounded-2xl bg-[#0b101c] border border-white/[0.06] space-y-4">
              <h3 className="text-[10px] font-black text-[#FFD21F] uppercase tracking-widest font-mono flex items-center gap-2">
                <Timer className="w-3.5 h-3.5" /> Gol Zaman Çizelgesi
              </h3>
              <GoalTimeline goals={goals} homeTeam={match.homeTeam} awayTeam={match.awayTeam} />
            </motion.div>
            <motion.div
              {...fadeUp}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="p-6 rounded-2xl bg-[#0b101c] border border-white/[0.06] space-y-4"
            >
              <h3 className="text-[10px] font-black text-[#FFD21F] uppercase tracking-widest font-mono flex items-center gap-2">
                <Activity className="w-3.5 h-3.5" /> Skor Akışı
              </h3>
              <ScoreFlow
                goals={goals}
                homeTeam={match.homeTeam}
                awayTeam={match.awayTeam}
                finalHome={match.scoreHome || 0}
                finalAway={match.scoreAway || 0}
              />
            </motion.div>
          </div>
        </>
      )}

      {/* Provider detailed stats */}
      {detailed ? (
        <div className="p-6 md:p-8 rounded-2xl bg-[#0b101c] border border-white/[0.08] space-y-5 max-w-3xl">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-2.5">
            <span className="text-[10px] font-black text-[#FFD21F] tracking-widest uppercase font-mono">
              Maç İstatistikleri
            </span>
            <DataBadge
              provider={match.statsProvider}
              fetchedAt={match.statsFetchedAt}
              extra={match.shotmapCount ? `${match.shotmapCount} şut noktası` : null}
            />
          </div>
          {[
            { label: 'Topa sahip olma (%)', h: match.possessionHome, a: match.possessionAway, pct: true },
            { label: 'Toplam şut', h: match.shotsHome, a: match.shotsAway },
            { label: 'İsabetli şut', h: match.shotsOnTargetHome, a: match.shotsOnTargetAway },
            { label: 'Büyük şans', h: match.bigChancesHome, a: match.bigChancesAway },
            { label: 'Kaçan büyük şans', h: match.bigChancesMissedHome, a: match.bigChancesMissedAway },
            { label: 'Rakip ceza sahası teması', h: match.touchesOppBoxHome, a: match.touchesOppBoxAway },
            { label: 'Pas isabeti (%)', h: match.passAccuracyHome, a: match.passAccuracyAway, pct: true },
            { label: 'Korner', h: match.cornersHome, a: match.cornersAway },
            { label: 'Faul', h: match.foulsHome, a: match.foulsAway },
          ]
            .filter((s) => s.h !== undefined && s.h !== null)
            .map((s) => {
              const total = (Number(s.h) || 0) + (Number(s.a) || 0) || 1;
              const hw = s.pct ? Number(s.h) : (Number(s.h) / total) * 100;
              return (
                <div key={s.label} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-slate-300">
                    <span className="font-mono text-white font-bold tabular-nums">{s.h}</span>
                    <span className="text-slate-400">{s.label}</span>
                    <span className="font-mono text-white font-bold tabular-nums">{s.a}</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/5 overflow-hidden flex">
                    <div className="bg-[#FFD21F]" style={{ width: `${hw}%` }} />
                    <div className="bg-slate-600" style={{ width: `${100 - hw}%` }} />
                  </div>
                </div>
              );
            })}
          {match.xGHome != null || match.xGAway != null ? (
            <XGCompare
              home={match.xGHome}
              away={match.xGAway}
              homeLabel={match.homeTeam}
              awayLabel={match.awayTeam}
            />
          ) : (
            <div className="p-3 rounded-xl border border-dashed border-white/10 bg-white/[0.02]">
              <p className="text-[12px] text-slate-500 font-medium leading-relaxed">
                xG bu maç için sağlayıcıda yok
                {/hazırlık|friendly|summer series/i.test(match.competition || '')
                  ? ' (hazırlık maçlarında sık görülür).'
                  : '.'}{' '}
                Sahte xG basılmıyor.
              </p>
            </div>
          )}
        </div>
      ) : (
        <EmptyState
          icon={BarChart3}
          title="Detaylı istatistik verisi yok"
          description={
            isCompleted && goals.length > 0
              ? 'Topa sahip olma, şut ve xG sağlayıcıdan gelmedi. Gol çizelgesi gerçek kayıttan — uydurma metrik yok.'
              : advancedLoading
                ? 'Advanced paket yükleniyor…'
                : 'Bu karşılaşma için detaylı istatistik henüz yok.'
          }
          className="max-w-3xl"
        />
      )}

      {/* Shotmap */}
      {shotmapShots.length > 0 ? (
        <motion.div {...fadeUp} className="max-w-4xl space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-[13px] font-semibold text-fb-yellow tracking-wide">
              Şut haritası
            </span>
            <DataBadge
              provider={match.statsProvider || 'fotmob'}
              fetchedAt={match.statsFetchedAt}
              extra={`${shotmapShots.length} nokta`}
            />
          </div>
          <ShotmapPitch
            shots={shotmapShots}
            homeTeam={match.homeTeam}
            awayTeam={match.awayTeam}
          />
        </motion.div>
      ) : isCompleted ? (
        <EmptyState
          icon={Activity}
          title="Şut haritası yok"
          description={
            /hazırlık|friendly|summer series/i.test(match.competition || '')
              ? 'Hazırlık maçında FotMob shotmap/xG genelde yayınlamıyor. İstatistik çubukları (şut, possession) varsa onlar gerçek veridir.'
              : 'Shotmap koordinatları sağlayıcıda yok veya henüz çekilmedi. Sıfır uydurma nokta basılmaz.'
          }
          className="max-w-3xl"
        />
      ) : null}

      {!isCompleted && goals.length === 0 && !detailed && (
        <EmptyState
          icon={BarChart3}
          title="Maç henüz oynanmadı"
          description="İstatistikler ve şut haritası maç bittikten sonra advanced sync ile dolar."
          className="max-w-xl mx-auto"
        />
      )}
    </div>
  );
};

export default MatchStatsTab;
