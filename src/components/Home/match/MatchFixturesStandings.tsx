import React from 'react';
import { motion } from 'motion/react';
import { ChevronRight } from 'lucide-react';
import { getTeamLogoPath } from '../../../lib/teamLogos';
import { TeamBadge } from './TeamBadge';
import { DataBadge } from '../../ui';

const fadeUp = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as any },
};

export type FixtureEntry =
  | { kind: 'match'; match: any }
  | { kind: 'league'; week: any };

interface MatchFixturesStandingsProps {
  visibleFixtures: FixtureEntry[];
  combinedFixturesLength: number;
  fixturePreviewCount: number;
  showAllFixtures: boolean;
  onToggleFixtures: () => void;
  fixtureFilter: string;
  onFixtureFilter: (f: string) => void;
  onSelectMatch: (match: any, tab: string) => void;
  activeMatchId?: string | null;
  getTeamLogo: (name: string, logo?: string) => string | null;
  formattedTime: (d: string) => string;
  leagueFixture: any;
  standings: any[];
  standingsMeta: { season?: string; isFinal?: boolean; source?: string } | null;
  showFullStandings: boolean;
  onToggleStandings: () => void;
  relegationStart: number;
}

const FILTERS = [
  'Tüm Maçlar',
  'Yaklaşan Maçlar',
  'Tamamlanan Maçlar',
  'Hazırlık',
  'Süper Lig',
] as const;

/**
 * Fikstür listesi + puan durumu — Maç Merkezi alt paneli.
 */
export const MatchFixturesStandings: React.FC<MatchFixturesStandingsProps> = ({
  visibleFixtures,
  combinedFixturesLength,
  fixturePreviewCount,
  showAllFixtures,
  onToggleFixtures,
  fixtureFilter,
  onFixtureFilter,
  onSelectMatch,
  activeMatchId,
  getTeamLogo,
  formattedTime,
  leagueFixture,
  standings,
  standingsMeta,
  showFullStandings,
  onToggleStandings,
  relegationStart,
}) => (
  <section
    id="fixtures-and-calendar"
    className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-2"
  >
    <motion.div {...fadeUp} className="lg:col-span-7 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-3">
        <h2 className="text-2xl md:text-3xl font-display font-bold text-white tracking-tight">
          Fikstür
        </h2>
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((filter) => {
            const isSelected = fixtureFilter === filter;
            return (
              <button
                key={filter}
                type="button"
                onClick={() => onFixtureFilter(filter)}
                className={`px-3 py-1 rounded-lg text-[10px] font-mono font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? 'bg-fb-yellow text-fb-navy'
                    : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {filter}
              </button>
            );
          })}
        </div>
      </div>

      {visibleFixtures.length > 0 ? (
        <div className="content-auto space-y-3">
          {visibleFixtures.map((entry, idx) => {
            if (entry.kind === 'league') {
              const w = entry.week;
              return (
                <motion.div
                  key={`w-${w.week}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(idx, 8) * 0.05, duration: 0.45 }}
                  className={`p-4 md:p-5 rounded-2xl border transition-all ${
                    w.derby
                      ? 'bg-gradient-to-r from-[#FFD21F]/[0.06] to-transparent border-[#FFD21F]/25'
                      : 'bg-[#0b101c] border-white/[0.05] hover:border-white/15'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="p-2.5 bg-[#05080e] rounded-xl border border-white/5 text-center min-w-[54px] font-mono shrink-0">
                      <div className="text-sm font-black text-fb-yellow">{w.week}</div>
                      <div className="text-[8px] text-slate-400 font-bold mt-0.5">Hafta</div>
                    </div>
                    <div className="flex items-center gap-3 flex-1 justify-center min-w-0">
                      <div className="flex items-center gap-2 justify-end w-[38%] min-w-0">
                        <span className="text-xs font-bold text-white truncate">
                          {w.home ? 'Fenerbahçe' : w.opponent}
                        </span>
                        <TeamBadge
                          src={
                            w.home
                              ? '/logos/fenerbahce.png'
                              : w.logo || getTeamLogoPath(w.opponent)
                          }
                          name={w.home ? 'Fenerbahçe' : w.opponent}
                          size="w-5 h-5"
                        />
                      </div>
                      <div className="font-mono text-center min-w-[56px] shrink-0">
                        <span className="text-[9px] text-slate-400 font-bold">vs</span>
                      </div>
                      <div className="flex items-center gap-2 w-[38%] min-w-0">
                        <TeamBadge
                          src={
                            w.home
                              ? w.logo || getTeamLogoPath(w.opponent)
                              : '/logos/fenerbahce.png'
                          }
                          name={w.home ? w.opponent : 'Fenerbahçe'}
                          size="w-5 h-5"
                        />
                        <span className="text-xs font-bold text-white truncate">
                          {w.home ? w.opponent : 'Fenerbahçe'}
                        </span>
                      </div>
                    </div>
                    <div className="w-4 shrink-0" />
                  </div>
                  <div className="flex items-center gap-3 mt-2.5 pl-[68px] text-[9px] text-slate-500 font-mono tracking-wide">
                    <span className="text-emerald-400/80">
                      Süper Lig • {leagueFixture?.season}
                    </span>
                    {w.derby && (
                      <span className="px-1.5 py-px rounded bg-[#FFD21F]/15 text-[#FFD21F] border border-[#FFD21F]/25 text-[8px]">
                        Derbi
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            }

            const item = entry.match;
            const matchDateObj = new Date(item.matchDate);
            const itemFinished =
              item.status === 'finished' || item.status === 'completed';
            const itemLive = item.status === 'live';
            const isActive = activeMatchId === item.id;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(idx, 8) * 0.05, duration: 0.45 }}
                onClick={() =>
                  onSelectMatch(item, itemFinished ? 'İstatistik' : 'Maç Önü')
                }
                className={`group p-4 md:p-5 rounded-2xl border cursor-pointer transition-all ${
                  isActive
                    ? 'bg-[#FFD21F]/[0.04] border-[#FFD21F]/25'
                    : 'bg-[#0b101c] border-white/[0.05] hover:border-[#FFD21F]/20 hover:bg-white/[0.015]'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="p-2.5 bg-[#05080e] rounded-xl border border-white/5 text-center min-w-[54px] font-mono shrink-0">
                    <div className="text-sm font-black text-fb-yellow">
                      {matchDateObj.getDate()}
                    </div>
                    <div className="text-[8px] text-slate-400 font-bold mt-0.5">
                      {matchDateObj.toLocaleDateString('tr-TR', { month: 'short' })}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-1 justify-center min-w-0">
                    <div className="flex items-center gap-2 justify-end w-[38%] min-w-0">
                      <span className="text-xs font-bold text-white truncate">
                        {item.homeTeam}
                      </span>
                      <TeamBadge
                        src={getTeamLogo(item.homeTeam, item.homeLogo)}
                        name={item.homeTeam}
                        size="w-5 h-5"
                      />
                    </div>
                    <div className="font-mono text-center min-w-[56px] shrink-0">
                      {itemFinished || itemLive ? (
                        <span className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg text-fb-yellow text-sm font-black">
                          {item.scoreHome} - {item.scoreAway}
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-bold">
                          {formattedTime(item.matchDate)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 w-[38%] min-w-0">
                      <TeamBadge
                        src={getTeamLogo(item.awayTeam, item.awayLogo)}
                        name={item.awayTeam}
                        size="w-5 h-5"
                      />
                      <span className="text-xs font-bold text-white truncate">
                        {item.awayTeam}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-[#FFD21F] group-hover:translate-x-0.5 transition-all shrink-0" />
                </div>
                <div className="flex items-center gap-3 mt-2.5 pl-[68px] text-[9px] text-slate-500 font-mono tracking-wide">
                  <span className="text-emerald-400/80">{item.competition}</span>
                  {itemFinished && (
                    <>
                      <span className="text-white/15">•</span>
                      <span className="text-emerald-400">MS</span>
                    </>
                  )}
                </div>
              </motion.div>
            );
          })}

          {combinedFixturesLength > fixturePreviewCount && (
            <button
              type="button"
              onClick={onToggleFixtures}
              className="w-full py-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] text-[10px] font-bold tracking-wide text-slate-300 hover:text-white transition-all cursor-pointer"
            >
              {showAllFixtures
                ? 'Daralt'
                : `Tümü (${combinedFixturesLength} karşılaşma)`}
            </button>
          )}
        </div>
      ) : (
        <div className="p-8 rounded-xl bg-white/[0.01] border border-white/5 text-center text-slate-500 text-sm">
          Seçilen filtreye uygun maç yok.
        </div>
      )}
    </motion.div>

    <motion.div
      {...fadeUp}
      transition={{ delay: 0.1, duration: 0.55 }}
      className="lg:col-span-5 space-y-5"
    >
      <div className="flex items-end justify-between border-b border-white/5 pb-3 gap-2">
        <h2 className="text-2xl md:text-3xl font-display font-bold text-white tracking-tight">
          Puan durumu
        </h2>
        {standingsMeta?.season && (
          <span className="text-[9px] font-mono font-bold text-[#FFD21F] bg-[#FFD21F]/10 border border-[#FFD21F]/20 px-2.5 py-1 rounded-lg">
            {standingsMeta.season}
            {standingsMeta.isFinal ? ' · Final' : ''}
          </span>
        )}
      </div>

      {standings && standings.length > 0 ? (
        <div className="rounded-2xl bg-[#0b101c] border border-white/[0.08] overflow-hidden shadow-xl">
          <div className="px-4 pt-4 pb-2 flex items-center justify-between gap-2">
            <span className="text-[9px] font-bold text-slate-400 tracking-wide font-mono">
              Trendyol Süper Lig
            </span>
            <DataBadge
              provider={standingsMeta?.source}
              showMissing={!standingsMeta?.source}
            />
          </div>
          <div className="px-2 pb-3">
            <div className="content-auto grid grid-cols-12 text-[9px] font-bold text-slate-500 font-mono tracking-wide border-b border-white/5 pb-1.5 px-2 text-center">
              <div className="col-span-1">#</div>
              <div className="col-span-5 text-left pl-1">Takım</div>
              <div className="col-span-1">O</div>
              <div className="col-span-1 text-emerald-400">G</div>
              <div className="col-span-1 text-slate-400">B</div>
              <div className="col-span-1 text-rose-400">M</div>
              <div className="col-span-1">AV</div>
              <div className="col-span-1 font-black text-[#FFD21F]">P</div>
            </div>
            {(showFullStandings ? standings : standings.slice(0, 10)).map(
              (row, index) => {
                const isFenerbahce =
                  row.teamName?.toLowerCase().includes('fenerbahce') ||
                  row.teamName?.toLowerCase().includes('fenerbahçe');
                const rank = row.rank || index + 1;
                const inRelegation = rank > relegationStart;
                return (
                  <div
                    key={index}
                    className={`grid grid-cols-12 items-center text-xs text-center py-2 px-2 rounded-lg border transition-all mt-0.5 ${
                      isFenerbahce
                        ? 'bg-fb-yellow/10 border-[#FFD21F]/30 text-white font-bold shadow-[inset_0_0_14px_rgba(255,210,31,0.08)]'
                        : 'bg-transparent border-transparent text-slate-300 hover:bg-white/[0.02]'
                    }`}
                  >
                    <div
                      className={`col-span-1 font-mono font-black text-[11px] ${
                        rank === 1
                          ? 'text-[#FFD21F]'
                          : inRelegation
                            ? 'text-rose-400'
                            : ''
                      }`}
                    >
                      {rank}
                    </div>
                    <div className="col-span-5 flex items-center gap-2 text-left pl-1 font-semibold min-w-0">
                      <TeamBadge
                        src={row.logo || getTeamLogoPath(row.teamName)}
                        name={row.teamName}
                        size="w-4.5 h-4.5"
                      />
                      <span
                        className={`truncate text-[11px] ${
                          isFenerbahce ? 'text-[#FFD21F]' : ''
                        }`}
                      >
                        {row.teamName || '—'}
                      </span>
                    </div>
                    <div className="col-span-1 font-mono text-[11px]">{row.played}</div>
                    <div className="col-span-1 font-mono text-[11px] text-emerald-400">
                      {row.win}
                    </div>
                    <div className="col-span-1 font-mono text-[11px] text-slate-400">
                      {row.draw}
                    </div>
                    <div className="col-span-1 font-mono text-[11px] text-rose-400">
                      {row.lose}
                    </div>
                    <div className="col-span-1 font-mono text-[10px] text-slate-400">
                      {row.goalsDiff > 0 ? `+${row.goalsDiff}` : row.goalsDiff}
                    </div>
                    <div className="col-span-1 font-mono font-black text-[#FFD21F] text-[11px]">
                      {row.points}
                    </div>
                  </div>
                );
              }
            )}
            {standings.length > 10 && (
              <button
                type="button"
                onClick={onToggleStandings}
                className="w-full mt-2 py-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 text-[10px] font-bold tracking-wide text-slate-300 transition-all cursor-pointer"
              >
                {showFullStandings
                  ? 'Daralt'
                  : `Tüm tablo (${standings.length} takım)`}
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="p-10 rounded-2xl bg-[#0b101c] border border-white/[0.08] text-center text-slate-500 text-sm">
          Puan durumu henüz yok.
        </div>
      )}
    </motion.div>
  </section>
);

export default MatchFixturesStandings;
