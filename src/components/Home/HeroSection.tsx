import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ChevronRight, Calendar } from 'lucide-react';
import { dbGetCollection } from '../../lib/dbService';
import { DataBadge } from '../ui';

interface HeroSectionProps {
  onEnterUniverse?: () => void;
  onNavigate: (view: any) => void;
  homeSettings?: any;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onNavigate }) => {
  const [match, setMatch] = useState<any>(null);
  const [opponentLogo, setOpponentLogo] = useState('');
  const [topPlayers, setTopPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHeroMatchAndTeams = async () => {
      try {
        const matchesList = await dbGetCollection('matches');
        const teamsList = await dbGetCollection('teams');
        const activeMatch =
          matchesList.find((m: any) => m.featured) ||
          matchesList.find((m: any) => m.status === 'live' || m.status === 'upcoming') ||
          matchesList.find((m: any) => m.status === 'finished' || m.status === 'completed') ||
          matchesList[0];

        if (activeMatch) {
          setMatch(activeMatch);
          const oppName =
            activeMatch.awayTeam === 'Fenerbahçe' ? activeMatch.homeTeam : activeMatch.awayTeam;
          const oppTeam = teamsList.find(
            (t: any) =>
              t.name?.toLowerCase().includes(oppName.toLowerCase()) ||
              t.shortName?.toLowerCase().includes(oppName.toLowerCase())
          );
          setOpponentLogo(
            oppTeam?.logoUrl ||
              oppTeam?.logo ||
              activeMatch.awayLogo ||
              activeMatch.homeLogo ||
              activeMatch.opponentLogo ||
              ''
          );
        }
      } catch (err) {
        console.error('Hero match fetching failed:', err);
      } finally {
        setLoading(false);
      }
    };

    const fetchTopSquad = async () => {
      try {
        const parseMv = (mv?: string | null): number => {
          if (!mv) return 0;
          const m = mv.replace(',', '.').match(/([\d.]+)/);
          if (!m) return 0;
          const n = parseFloat(m[1]);
          if (Number.isNaN(n)) return 0;
          if (/mil/i.test(mv)) return n * 1_000_000;
          if (/bin/i.test(mv)) return n * 1_000;
          return n;
        };
        const plist = await dbGetCollection('players');
        const tops = (plist || [])
          .filter((p: any) => p.status === 'active' && p.photo && parseMv(p.marketValue) > 0)
          .sort((a: any, b: any) => parseMv(b.marketValue) - parseMv(a.marketValue))
          .slice(0, 3);
        setTopPlayers(tops);
      } catch {
        setTopPlayers([]);
      }
    };

    fetchHeroMatchAndTeams();
    fetchTopSquad();
  }, []);

  const statusLabel = match
    ? match.status === 'live'
      ? 'Canlı'
      : match.status === 'finished' || match.status === 'completed'
        ? 'Son maç'
        : 'Sıradaki maç'
    : 'Kadro vitrini';

  const isFinished = match?.status === 'finished' || match?.status === 'completed';

  return (
    <section className="relative pt-24 pb-10 md:pb-14 fe-canvas overflow-hidden">
      {/* Controlled navy wash — no multi-glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 55% 45% at 70% 20%, rgba(16, 38, 65, 0.55), transparent 70%)',
        }}
      />
      <div className="absolute top-0 inset-x-0 h-px ui-hairline opacity-60" />

      <div className="fe-container relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left — brand thesis */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-5"
            >
              <div className="fe-signal-heading !mb-0">
                <span className="fe-signal-dot" aria-hidden />
                <span className="fe-signal-line" aria-hidden />
                <span className="fe-signal-label">Bağımsız yayın</span>
              </div>

              <h1
                className="text-[2.15rem] sm:text-5xl lg:text-[3.25rem] font-semibold tracking-tight text-[var(--fe-text-strong)] leading-[1.05]"
                style={{ fontFamily: 'var(--fe-font-editorial)' }}
              >
                Fenerbahçe’ye
                <br />
                <span className="text-[var(--fe-yellow-400)]">daha yakından</span> bak.
              </h1>

              <p className="text-[var(--fe-text)] text-[15px] md:text-base max-w-lg leading-relaxed">
                Maç verisi, editoryal analiz ve taraftar nabzı — kaynak etiketli, uydurma skor
                yok. Kadıköy gecesinin netliği.
              </p>

              <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-1">
                <button
                  id="hero-cta-primary"
                  type="button"
                  className="fe-btn-primary w-full sm:w-auto"
                  onClick={() => onNavigate('match-center')}
                >
                  Maç merkezini aç
                  <ChevronRight className="w-4 h-4" aria-hidden />
                </button>
                <button
                  id="hero-cta-secondary"
                  type="button"
                  className="fe-btn-tertiary w-full sm:w-auto justify-center sm:justify-start"
                  onClick={() => onNavigate('analysis')}
                >
                  Analizleri oku →
                </button>
              </div>
            </motion.div>
          </div>

          {/* Right — match module (Match Sheet) */}
          <div className="lg:col-span-5 w-full">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="fe-surface-raised p-5 md:p-6 relative"
            >
              <div className="absolute left-0 top-4 bottom-4 w-[3px] bg-[var(--fe-yellow-400)] rounded-r-sm" />

              <div className="flex justify-between items-center mb-5 pb-3 border-b border-[var(--fe-line-subtle)]">
                <span className="inline-flex items-center gap-1.5 text-[12px] font-medium fe-data text-[var(--fe-yellow-400)]">
                  {match?.status === 'live' && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--fe-live)] animate-pulse" />
                  )}
                  {statusLabel}
                </span>
                <span className="text-[12px] text-[var(--fe-text-muted)] font-medium">
                  {match?.competition || 'Trendyol Süper Lig'}
                </span>
              </div>

              {loading ? (
                <div className="py-12 space-y-3 animate-pulse">
                  <div className="h-3 w-28 mx-auto rounded bg-white/5" />
                  <div className="h-8 w-40 mx-auto rounded bg-white/5" />
                </div>
              ) : !match ? (
                topPlayers.length > 0 ? (
                  <div className="space-y-4">
                    <p className="text-[12px] text-[var(--fe-text-faint)] fe-data">
                      Öne çıkan maç yok · kadro vitrini
                    </p>
                    <div className="flex items-end justify-center gap-2">
                      {topPlayers.map((p: any, i: number) => (
                        <button
                          key={p.id || i}
                          type="button"
                          onClick={() => onNavigate('players')}
                          className={`group rounded-[var(--fe-radius-md)] overflow-hidden border border-[var(--fe-line-subtle)] bg-[var(--fe-navy-950)] hover:border-[var(--fe-yellow-line)] transition-colors cursor-pointer ${
                            i === 1 ? 'w-[38%]' : 'w-[30%]'
                          }`}
                        >
                          <div className="h-24 flex items-end justify-center pt-2">
                            <img
                              src={p.photo}
                              alt={p.name}
                              className="h-20 object-contain"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <div className="p-2 text-center border-t border-[var(--fe-line-subtle)]">
                            <span className="text-[11px] font-semibold text-[var(--fe-text-strong)] block truncate">
                              {(p.name || '').split(' ').slice(-1)[0]}
                            </span>
                            <span className="text-[10px] fe-data text-[var(--fe-success)]">
                              {p.marketValue}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => onNavigate('players')}
                      className="fe-btn-secondary w-full !text-[12px]"
                    >
                      Kadroyu gör
                    </button>
                  </div>
                ) : (
                  <div className="py-10 text-center space-y-2">
                    <Calendar className="w-8 h-8 text-[var(--fe-text-faint)] mx-auto" />
                    <p className="text-sm text-[var(--fe-text-muted)]">
                      Yaklaşan maç bilgisi henüz eklenmedi.
                    </p>
                  </div>
                )
              ) : (
                <>
                  <div className="flex items-center justify-between gap-2 py-1">
                    <div className="flex-1 text-center min-w-0">
                      <div className="w-12 h-12 mx-auto mb-2 rounded-[var(--fe-radius-md)] fe-surface-inset flex items-center justify-center p-1.5">
                        <img
                          src={
                            /fenerbah/i.test(match.homeTeam || '')
                              ? '/logos/fenerbahce.png'
                              : match.homeLogo || opponentLogo || '/logos/fenerbahce.png'
                          }
                          alt=""
                          className="w-9 h-9 object-contain"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <p className="text-[13px] font-semibold text-[var(--fe-text-strong)] truncate">
                        {match.homeTeam}
                      </p>
                    </div>

                    <div className="shrink-0 px-2 text-center">
                      {isFinished || match.status === 'live' ? (
                        <p className="text-2xl md:text-3xl fe-data font-semibold text-[var(--fe-yellow-400)] tabular-nums">
                          {match.scoreHome ?? '—'}
                          <span className="text-[var(--fe-text-faint)] mx-1">–</span>
                          {match.scoreAway ?? '—'}
                        </p>
                      ) : (
                        <p className="text-xl fe-data font-semibold text-[var(--fe-yellow-400)]">
                          {match.matchDate
                            ? new Date(match.matchDate).toLocaleTimeString('tr-TR', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : match.time || '—'}
                        </p>
                      )}
                      <p className="text-[11px] text-[var(--fe-text-faint)] mt-0.5 fe-data">
                        {match.matchDate
                          ? new Date(match.matchDate).toLocaleDateString('tr-TR', {
                              day: 'numeric',
                              month: 'short',
                            })
                          : ''}
                      </p>
                    </div>

                    <div className="flex-1 text-center min-w-0">
                      <div className="w-12 h-12 mx-auto mb-2 rounded-[var(--fe-radius-md)] fe-surface-inset flex items-center justify-center p-1.5">
                        {opponentLogo || match.awayLogo ? (
                          <img
                            src={
                              /fenerbah/i.test(match.awayTeam || '')
                                ? '/logos/fenerbahce.png'
                                : match.awayLogo || opponentLogo
                            }
                            alt=""
                            className="w-9 h-9 object-contain"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <span className="text-[var(--fe-yellow-400)] font-semibold text-sm">
                            FE
                          </span>
                        )}
                      </div>
                      <p className="text-[13px] font-semibold text-[var(--fe-text-strong)] truncate">
                        {match.awayTeam}
                      </p>
                    </div>
                  </div>

                  {match.venue && (
                    <p className="text-[12px] text-[var(--fe-text-faint)] text-center mt-3">
                      {match.venue}
                    </p>
                  )}

                  <div className="mt-4 pt-3 border-t border-[var(--fe-line-subtle)] flex flex-wrap items-center justify-between gap-2">
                    <DataBadge
                      provider={match.statsProvider}
                      fetchedAt={match.statsFetchedAt}
                      showMissing={!match.statsProvider && isFinished}
                    />
                    <button
                      type="button"
                      onClick={() => onNavigate('match-center')}
                      className="fe-btn-tertiary !text-[12px]"
                    >
                      Maç merkezi →
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
