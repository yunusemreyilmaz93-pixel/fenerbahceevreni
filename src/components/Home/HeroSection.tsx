import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { BarChart3, Shield, Users, Trophy, ChevronRight, Calendar } from 'lucide-react';
import { dbGetCollection } from '../../lib/dbService';

interface HeroSectionProps {
  onEnterUniverse?: () => void;
  onNavigate: (view: any) => void;
  homeSettings?: any;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onNavigate }) => {
  const [match, setMatch] = useState<any>(null);
  const [opponentLogo, setOpponentLogo] = useState<string>('');
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

          if (oppTeam) {
            setOpponentLogo(oppTeam.logoUrl || oppTeam.logo || '');
          } else {
            setOpponentLogo(activeMatch.awayLogo || activeMatch.opponentLogo || '');
          }
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
      ? 'Canlı maç'
      : match.status === 'finished' || match.status === 'completed'
        ? 'Son maç'
        : 'Sıradaki maç'
    : 'Kadro vitrini';

  return (
    <section className="relative min-h-[min(78vh,700px)] flex items-center justify-center overflow-hidden pt-24 pb-10 md:pb-14 ui-page-bg">
      <div className="absolute inset-0 ui-grain pointer-events-none" aria-hidden />

      {/* Soft pitch grid */}
      <div className="absolute inset-0 opacity-[0.035] pointer-events-none z-0">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="tactical-grid" width="48" height="48" patternUnits="userSpaceOnUse">
              <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#FFFFFF" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#tactical-grid)" />
          <circle cx="50%" cy="50%" r="140" fill="none" stroke="#FFFFFF" strokeWidth="1.5" />
          <line
            x1="50%"
            y1="0"
            x2="50%"
            y2="100%"
            stroke="#FFFFFF"
            strokeWidth="1.5"
            strokeDasharray="5,5"
          />
        </svg>
      </div>

      <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#060a12]/50 via-transparent to-[#060a12]" />
      <div className="absolute top-[-8%] left-[15%] w-[520px] h-[520px] bg-fb-yellow/[0.04] rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-12%] right-[10%] w-[600px] h-[600px] bg-[#002F6C]/[0.28] rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-px ui-hairline z-10 opacity-80" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left copy */}
          <div className="lg:col-span-7 space-y-7 text-left">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55 }}
              className="space-y-5"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08]">
                <span className="w-1.5 h-1.5 rounded-full bg-fb-yellow shadow-[0_0_8px_rgba(255,210,31,0.7)]" />
                <span className="text-[11px] font-semibold text-slate-300 tracking-wide">
                  Bağımsız analiz & taraftar atlası
                </span>
              </div>

              <h1 className="text-[2.35rem] sm:text-5xl lg:text-[3.35rem] font-display font-bold tracking-tight text-white leading-[1.05]">
                Fenerbahçe’ye
                <br />
                <span className="text-fb-yellow drop-shadow-[0_2px_20px_rgba(255,210,31,0.18)]">
                  daha yakından
                </span>{' '}
                bak.
              </h1>

              <p className="text-slate-300/95 text-[15px] md:text-base max-w-xl font-medium leading-relaxed">
                Maç raporları, transfer profilleri, oyuncu metrikleri ve taraftar nabzı — tek merkezde,
                kaynak etiketli, uydurma skor yok.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
                <button
                  id="hero-cta-primary"
                  type="button"
                  className="w-full sm:w-auto px-7 py-3.5 bg-fb-yellow hover:bg-white text-fb-dark font-bold rounded-xl shadow-[0_4px_28px_rgba(255,210,31,0.28)] flex items-center justify-center gap-2 group transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fb-yellow focus-visible:ring-offset-2 focus-visible:ring-offset-fb-dark"
                  onClick={() => onNavigate('match-center')}
                >
                  <span className="text-sm tracking-wide">Maç merkezini aç</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>

                <button
                  id="hero-cta-secondary"
                  type="button"
                  className="w-full sm:w-auto px-7 py-3.5 bg-white/[0.04] hover:bg-white/[0.08] text-white font-semibold rounded-xl border border-white/[0.1] hover:border-fb-yellow/35 transition-all cursor-pointer"
                  onClick={() => onNavigate('analysis')}
                >
                  <span className="text-sm tracking-wide">Analizleri oku</span>
                </button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.15 }}
              className="pt-6 border-t border-white/[0.06]"
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                {[
                  { label: 'Maç raporları', icon: BarChart3 },
                  { label: 'Transfer radar', icon: Shield },
                  { label: 'Oyuncu form', icon: Trophy },
                  { label: 'Taraftar nabzı', icon: Users },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/[0.025] border border-white/[0.06]"
                  >
                    <div className="w-8 h-8 rounded-lg bg-fb-yellow/10 flex items-center justify-center text-fb-yellow shrink-0">
                      <item.icon className="w-4 h-4" aria-hidden />
                    </div>
                    <span className="text-[12px] font-semibold text-slate-300 leading-tight">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right match card */}
          <div className="lg:col-span-5 w-full">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.65, delay: 0.2 }}
              className="ui-surface relative overflow-hidden rounded-2xl p-5 md:p-6 text-left"
            >
              <div className="absolute top-0 inset-x-0 h-px ui-hairline" />
              <div className="absolute -top-20 -right-16 w-48 h-48 bg-fb-yellow/[0.06] rounded-full blur-3xl pointer-events-none" />

              <div className="relative flex justify-between items-center mb-5 pb-4 border-b border-white/[0.06]">
                <span className="text-[11px] font-semibold tracking-wide text-fb-yellow bg-fb-yellow/10 px-2.5 py-1 rounded-md border border-fb-yellow/20">
                  {match?.status === 'live' && (
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5 animate-pulse align-middle" />
                  )}
                  {statusLabel}
                </span>
                <span className="text-[12px] text-slate-400 font-medium">
                  {match?.competition || 'Trendyol Süper Lig'}
                </span>
              </div>

              {loading ? (
                <div className="py-14 text-center space-y-3">
                  <div className="h-3 w-32 mx-auto rounded bg-white/[0.06] animate-pulse" />
                  <div className="h-10 w-48 mx-auto rounded bg-white/[0.04] animate-pulse" />
                  <p className="text-xs text-slate-500 font-medium">Maç bilgisi yükleniyor…</p>
                </div>
              ) : !match ? (
                topPlayers.length > 0 ? (
                  <div className="py-2 space-y-5">
                    <div className="flex items-end justify-center gap-2.5">
                      {topPlayers.map((p: any, i: number) => (
                        <button
                          key={p.id || i}
                          type="button"
                          onClick={() => onNavigate('players')}
                          className={`group relative rounded-2xl overflow-hidden border border-white/[0.08] bg-gradient-to-b from-[#121a30] to-[#0a0e18] hover:border-fb-yellow/40 transition-all cursor-pointer ${
                            i === 1 ? 'w-[38%] -translate-y-2' : 'w-[31%]'
                          }`}
                        >
                          <div className="relative pt-3 flex items-end justify-center h-28 md:h-32 overflow-hidden">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_15%,rgba(255,210,31,0.1),transparent_60%)]" />
                            <img
                              src={p.photo}
                              alt={p.name}
                              width={112}
                              height={112}
                              className="h-24 md:h-28 object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)] group-hover:scale-105 transition-transform duration-500"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <div className="p-2.5 text-center bg-black/35">
                            <span className="text-[11px] font-bold text-white block truncate leading-tight">
                              {(p.name || '').split(' ').slice(-1)[0]}
                            </span>
                            <span className="text-[10px] font-mono font-semibold text-emerald-400">
                              {p.marketValue}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => onNavigate('players')}
                      className="w-full py-3 bg-white/[0.04] hover:bg-fb-yellow text-slate-300 hover:text-fb-dark text-[12px] font-bold rounded-xl transition-all cursor-pointer border border-white/[0.08]"
                    >
                      2026-27 kadrosunu keşfet →
                    </button>
                  </div>
                ) : (
                  <div className="py-12 px-4 text-center space-y-3">
                    <Calendar className="w-9 h-9 text-slate-500 mx-auto opacity-70" />
                    <p className="text-sm text-slate-400 font-medium max-w-sm mx-auto leading-relaxed">
                      Yaklaşan maç bilgisi henüz eklenmedi.
                    </p>
                  </div>
                )
              ) : (
                <>
                  <div className="flex items-center justify-between py-1 text-center relative">
                    <div className="flex flex-col items-center flex-1 min-w-0">
                      <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-[#0a0e18] border border-white/[0.07] flex items-center justify-center p-2 mb-2.5 shadow-inner">
                        <img
                          src="/logos/fenerbahce.png"
                          alt="Fenerbahçe"
                          width={48}
                          height={48}
                          className="w-11 h-11 object-contain"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <span className="text-[13px] font-bold text-white truncate max-w-full">
                        {match.homeTeam}
                      </span>
                    </div>

                    <div className="px-3 flex flex-col items-center shrink-0">
                      {match.status === 'finished' || match.status === 'completed' ? (
                        <>
                          <span className="text-[10px] text-slate-500 font-semibold tracking-wider">
                            MS
                          </span>
                          <div className="text-2xl md:text-3xl font-display font-bold text-fb-yellow font-mono tabular-nums my-0.5">
                            {match.scoreHome ?? 0} – {match.scoreAway ?? 0}
                          </div>
                        </>
                      ) : (
                        <>
                          <span className="text-[10px] text-slate-500 font-semibold tracking-wider">
                            VS
                          </span>
                          <div className="text-xl md:text-2xl font-display font-bold text-fb-yellow font-mono my-0.5">
                            {match.matchDate
                              ? new Date(match.matchDate).toLocaleTimeString('tr-TR', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : match.time || '—'}
                          </div>
                        </>
                      )}
                      <span className="text-[11px] text-slate-400 font-medium">
                        {match.matchDate
                          ? new Date(match.matchDate).toLocaleDateString('tr-TR', {
                              day: 'numeric',
                              month: 'short',
                            })
                          : match.date || ''}
                      </span>
                    </div>

                    <div className="flex flex-col items-center flex-1 min-w-0">
                      <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-[#0a0e18] border border-white/[0.07] flex items-center justify-center p-2 mb-2.5 shadow-inner">
                        {opponentLogo ? (
                          <img
                            src={opponentLogo}
                            alt={
                              match.awayTeam === 'Fenerbahçe' ? match.homeTeam : match.awayTeam
                            }
                            width={48}
                            height={48}
                            className="w-11 h-11 object-contain"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-11 h-11 rounded-xl bg-white/5 flex items-center justify-center">
                            <span className="text-fb-yellow font-bold text-lg font-display">
                              FE
                            </span>
                          </div>
                        )}
                      </div>
                      <span className="text-[13px] font-bold text-white truncate max-w-full">
                        {match.awayTeam === 'Fenerbahçe' ? match.homeTeam : match.awayTeam}
                      </span>
                    </div>
                  </div>

                  {(match.status === 'finished' || match.status === 'completed') &&
                    Array.isArray(match.goals) &&
                    match.goals.length > 0 && (
                      <div className="flex flex-wrap justify-center gap-1.5 mt-3 mb-1">
                        {[...match.goals]
                          .sort((a: any, b: any) => a.minute - b.minute)
                          .map((g: any, i: number) => (
                            <span
                              key={i}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.07] text-[11px] font-medium text-slate-300"
                            >
                              <span className="font-mono font-bold text-fb-yellow">{g.minute}'</span>
                              {(g.scorer || '')
                                .replace(/\s*\(kendi kalesine\)/i, ' (k.k.)')
                                .split(' ')
                                .slice(-2)
                                .join(' ')}
                            </span>
                          ))}
                      </div>
                    )}

                  <div className="bg-[#0a0e18]/70 border border-white/[0.05] rounded-xl p-3.5 my-4 text-[12px] text-slate-300 space-y-1.5">
                    <div className="flex justify-between gap-3">
                      <span className="text-slate-500 font-medium">Stadyum</span>
                      <span className="font-semibold text-white text-right truncate max-w-[200px]">
                        {match.venue || '—'}
                      </span>
                    </div>
                    {match.referee && (
                      <div className="flex justify-between gap-3">
                        <span className="text-slate-500 font-medium">Hakem</span>
                        <span className="font-semibold text-white text-right">{match.referee}</span>
                      </div>
                    )}
                  </div>

                  <p className="text-[13px] text-slate-400 leading-relaxed border-t border-white/[0.05] pt-4 mb-4">
                    {match.matchPreview || 'Bu karşılaşma için analiz henüz yayınlanmadı.'}
                  </p>

                  <div className="flex gap-2.5 pt-0.5">
                    <button
                      type="button"
                      onClick={() => onNavigate('match-center')}
                      className="flex-1 py-3 text-center bg-fb-yellow hover:bg-white text-fb-dark text-[12px] font-bold rounded-xl transition-all cursor-pointer shadow-lg"
                    >
                      Maç merkezini aç
                    </button>
                    {(match.status === 'finished' || match.status === 'completed') ? (
                      <button
                        type="button"
                        onClick={() => onNavigate('match-center')}
                        className="py-3 px-4 text-center bg-white/[0.04] hover:bg-white/[0.08] text-white text-[12px] font-semibold rounded-xl transition-all border border-white/[0.08] cursor-pointer"
                      >
                        Maç raporu
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onNavigate('fan-room')}
                        className="py-3 px-4 text-center bg-white/[0.04] hover:bg-white/[0.08] text-white text-[12px] font-semibold rounded-xl transition-all border border-white/[0.08] cursor-pointer"
                      >
                        Tahmin yap
                      </button>
                    )}
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
