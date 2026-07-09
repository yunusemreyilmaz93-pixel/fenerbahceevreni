import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import SEO from './SEO';
import { getTeamLogoPath } from '../../lib/teamLogos';
import {
  Calendar,
  MapPin,
  ChevronRight,
  Vote,
  FileText,
  User,
  Flag,
  Tv,
  Activity,
  ArrowRight,
  BarChart3,
  AlertCircle,
  Trophy,
  Shirt,
  Timer,
  Quote
} from 'lucide-react';
import { dbGetCollection } from '../../lib/dbService';
import ShotmapPitch from './ShotmapPitch';

interface MacMerkeziPageProps {
  onNavigate: (view: string) => void;
}

/* ------------------------------------------------------------------ */
/* Küçük yardımcı bileşenler                                           */
/* ------------------------------------------------------------------ */

const getInitials = (name: string) => {
  if (!name) return 'FB';
  return name
    .split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 3)
    .toUpperCase();
};

const TeamBadge: React.FC<{ src: string | null; name: string; size?: string }> = ({ src, name, size = 'w-12 h-12' }) => (
  src ? (
    <img src={src} alt={name} className={`${size} object-contain drop-shadow-[0_6px_18px_rgba(0,0,0,0.55)]`} referrerPolicy="no-referrer" />
  ) : (
    <div className={`${size} rounded-full bg-slate-800/80 border border-white/10 flex items-center justify-center text-xs font-black font-mono text-slate-300`}>
      {getInitials(name)}
    </div>
  )
);

/** Gerçek gol verisinden 0-90 dakika zaman çizelgesi (SVG). */
const GoalTimeline: React.FC<{ goals: any[]; homeTeam: string; awayTeam: string }> = ({ goals, homeTeam, awayTeam }) => {
  const W = 720, H = 132, PAD = 28;
  const axisY = H / 2 + 6;
  const minX = (m: number) => PAD + (Math.min(m, 95) / 95) * (W - PAD * 2);
  const sorted = [...goals].sort((a, b) => a.minute - b.minute);
  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full min-w-[520px]" role="img" aria-label="Gol zaman çizelgesi">
        {/* eksen */}
        <line x1={PAD} y1={axisY} x2={W - PAD} y2={axisY} stroke="rgba(255,255,255,0.14)" strokeWidth={2} />
        {[0, 15, 30, 45, 60, 75, 90].map(t => (
          <g key={t}>
            <line x1={minX(t)} y1={axisY - 4} x2={minX(t)} y2={axisY + 4} stroke="rgba(255,255,255,0.25)" strokeWidth={1.5} />
            <text x={minX(t)} y={axisY + 20} textAnchor="middle" fontSize={10} fontFamily="monospace" fill="rgba(148,163,184,0.8)">{t}'</text>
          </g>
        ))}
        {/* devre arası */}
        <line x1={minX(45)} y1={axisY - 26} x2={minX(45)} y2={axisY + 8} stroke="rgba(255,210,31,0.25)" strokeWidth={1} strokeDasharray="3 3" />
        <text x={minX(45)} y={axisY - 32} textAnchor="middle" fontSize={8.5} fontFamily="monospace" fill="rgba(255,210,31,0.55)">İY</text>
        {/* goller */}
        {sorted.map((g, i) => {
          const x = minX(g.minute);
          const isHome = g.team === 'home';
          const y = isHome ? axisY - 14 : axisY + 14;
          const labelY = isHome ? axisY - 40 - (i % 2) * 14 : axisY + 44 + (i % 2) * 14;
          const own = /kendi kalesine|k\.k\./i.test(g.scorer || '');
          const shortName = (g.scorer || '').replace(/\s*\(kendi kalesine\)/i, '').split(' ').slice(-1)[0];
          return (
            <g key={i}>
              <line x1={x} y1={isHome ? axisY - 6 : axisY + 6} x2={x} y2={y} stroke={isHome ? '#FFD21F' : '#94a3b8'} strokeWidth={1.5} opacity={0.6} />
              <circle cx={x} cy={y} r={6.5} fill={own ? '#0b101c' : isHome ? '#FFD21F' : '#94a3b8'} stroke={isHome ? '#FFD21F' : '#94a3b8'} strokeWidth={own ? 2 : 0} />
              <text x={x} y={isHome ? y - 12 : y + 4 + 14} textAnchor="middle" fontSize={9.5} fontWeight={800} fill={isHome ? '#FFD21F' : '#cbd5e1'}>{g.minute}'</text>
              <text x={x} y={labelY} textAnchor="middle" fontSize={9.5} fontWeight={700} fill="rgba(226,232,240,0.92)">
                {shortName}{own ? ' (k.k.)' : ''}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="flex items-center justify-center gap-5 text-[9px] font-mono font-bold uppercase tracking-widest text-slate-400 pb-1">
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#FFD21F] inline-block" /> {homeTeam}</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-slate-400 inline-block" /> {awayTeam}</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full border-2 border-[#FFD21F] inline-block" /> Kendi kalesine</span>
      </div>
    </div>
  );
};

/** Gerçek gol verisinden kümülatif skor akışı (adım grafiği, SVG). */
const ScoreFlow: React.FC<{ goals: any[]; homeTeam: string; awayTeam: string; finalHome: number; finalAway: number }> = ({ goals, homeTeam, awayTeam, finalHome, finalAway }) => {
  const W = 720, H = 190, PADX = 34, PADY = 22;
  const maxGoals = Math.max(finalHome, finalAway, 1);
  const x = (m: number) => PADX + (Math.min(m, 95) / 95) * (W - PADX * 2);
  const y = (g: number) => H - PADY - (g / maxGoals) * (H - PADY * 2);
  const sorted = [...goals].sort((a, b) => a.minute - b.minute);

  const buildPath = (team: 'home' | 'away') => {
    let cur = 0;
    let d = `M ${x(0)} ${y(0)}`;
    sorted.forEach(g => {
      if (g.team === team) {
        d += ` L ${x(g.minute)} ${y(cur)} L ${x(g.minute)} ${y(cur + 1)}`;
        cur += 1;
      }
    });
    d += ` L ${x(95)} ${y(cur)}`;
    return d;
  };

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full min-w-[520px]" role="img" aria-label="Skor akışı grafiği">
        {/* yatay kılavuzlar */}
        {Array.from({ length: maxGoals + 1 }, (_, i) => (
          <g key={i}>
            <line x1={PADX} y1={y(i)} x2={W - PADX} y2={y(i)} stroke="rgba(255,255,255,0.05)" strokeWidth={1} />
            <text x={PADX - 8} y={y(i) + 3} textAnchor="end" fontSize={9} fontFamily="monospace" fill="rgba(148,163,184,0.7)">{i}</text>
          </g>
        ))}
        {[0, 45, 90].map(t => (
          <text key={t} x={x(t)} y={H - 4} textAnchor="middle" fontSize={9} fontFamily="monospace" fill="rgba(148,163,184,0.7)">{t}'</text>
        ))}
        <path d={buildPath('away')} fill="none" stroke="#64748b" strokeWidth={2} strokeLinejoin="round" />
        <path d={buildPath('home')} fill="none" stroke="#FFD21F" strokeWidth={2.5} strokeLinejoin="round" />
        {sorted.map((g, i) => {
          let cum = 0;
          sorted.slice(0, i + 1).forEach(gg => { if (gg.team === g.team) cum += 1; });
          return <circle key={i} cx={x(g.minute)} cy={y(cum)} r={4} fill={g.team === 'home' ? '#FFD21F' : '#94a3b8'} stroke="#0b101c" strokeWidth={2} />;
        })}
      </svg>
      <div className="flex items-center justify-center gap-5 text-[9px] font-mono font-bold uppercase tracking-widest text-slate-400 pb-1">
        <span className="flex items-center gap-1.5"><span className="w-4 h-[3px] bg-[#FFD21F] inline-block rounded" /> {homeTeam}</span>
        <span className="flex items-center gap-1.5"><span className="w-4 h-[3px] bg-slate-500 inline-block rounded" /> {awayTeam}</span>
      </div>
    </div>
  );
};

/** Yükleme iskeleti — sayfa verisi gelene dek. */
const HeroSkeleton: React.FC = () => (
  <div className="rounded-3xl border border-white/[0.05] bg-[#0b101c] p-8 md:p-12 space-y-8 animate-pulse">
    <div className="h-4 w-40 bg-white/5 rounded" />
    <div className="grid grid-cols-3 items-center gap-4">
      <div className="flex flex-col items-center gap-3">
        <div className="w-20 h-20 rounded-2xl bg-white/5" />
        <div className="h-3 w-24 bg-white/5 rounded" />
      </div>
      <div className="h-14 w-32 bg-white/5 rounded-xl mx-auto" />
      <div className="flex flex-col items-center gap-3">
        <div className="w-20 h-20 rounded-2xl bg-white/5" />
        <div className="h-3 w-24 bg-white/5 rounded" />
      </div>
    </div>
    <div className="h-3 w-3/4 bg-white/5 rounded mx-auto" />
    <div className="h-10 w-full bg-white/5 rounded-xl" />
  </div>
);

// Not: whileInView yerine mount animasyonu — arka plan sekmelerinde/kısıtlı
// rAF ortamlarında içeriğin opacity:0'da asılı kalmasını önler.
const fadeUp = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as any }
};

/* ------------------------------------------------------------------ */
/* Ana bileşen                                                         */
/* ------------------------------------------------------------------ */

export const MacMerkeziPage: React.FC<MacMerkeziPageProps> = ({ onNavigate }) => {
  const [matches, setMatches] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [standings, setStandings] = useState<any[]>([]);
  const [standingsMeta, setStandingsMeta] = useState<{ season?: string; isFinal?: boolean; source?: string } | null>(null);
  const [matchReports, setMatchReports] = useState<any[]>([]);
  const [dbPlayers, setDbPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeMatch, setActiveMatch] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<string>('Maç Önü');
  const [selectedXIPosition, setSelectedXIPosition] = useState<string>('CF');
  const [fixtureFilter, setFixtureFilter] = useState<string>('Tüm Maçlar');
  const [showAllFixtures, setShowAllFixtures] = useState(false);
  const [showFullStandings, setShowFullStandings] = useState(false);

  const [leagueFixture, setLeagueFixture] = useState<any | null>(null);

  const [pollVotes, setPollVotes] = useState({ home: 0, draw: 0, away: 0, voted: false, selectedOption: '' });
  const [scoreVotes, setScoreVotes] = useState({ homeScore: 0, awayScore: 0, voted: false, submits: 0, mostPredicted: '' });

  const [liveSim, setLiveSim] = useState<{
    isRunning: boolean;
    minute: number;
    homeScore: number;
    awayScore: number;
    events: { min: number; txt: string; type: 'goal' | 'card' | 'info' | 'whistle' }[];
    possession: number;
    shotsHome: number;
    shotsAway: number;
  }>({ isRunning: false, minute: 0, homeScore: 0, awayScore: 0, events: [], possession: 50, shotsHome: 0, shotsAway: 0 });

  const [countdown, setCountdown] = useState({ gün: 0, saat: 0, dakika: 0, saniye: 0 });

  /* ---------------- Simülasyon motoru (yalnızca oynanmamış maçlar) --- */
  useEffect(() => {
    let interval: any = null;
    if (liveSim.isRunning) {
      interval = setInterval(() => {
        setLiveSim(prev => {
          if (prev.minute >= 90) {
            clearInterval(interval);
            return {
              ...prev,
              minute: 90,
              isRunning: false,
              events: [{ min: 90, txt: 'Simülasyon sona erdi.', type: 'whistle' }, ...prev.events]
            };
          }
          const nextMinute = prev.minute + 15;
          const randomChance = Math.random();
          let newHomeScore = prev.homeScore;
          let newAwayScore = prev.awayScore;
          let newEventTxt = '';
          let eventType: 'goal' | 'card' | 'info' | 'whistle' = 'info';
          let changePossession = Math.floor(prev.possession + (Math.random() * 10 - 5));
          if (changePossession < 40) changePossession = 42;
          if (changePossession > 75) changePossession = 71;
          let changeShotsHome = prev.shotsHome + Math.floor(Math.random() * 3);
          let changeShotsAway = prev.shotsAway + Math.floor(Math.random() * 2);

          if (nextMinute === 15) {
            newEventTxt = 'Maç tempolu başladı, Fenerbahçe orta alanda hakimiyet kurmaya çalışıyor.';
          } else if (nextMinute === 30) {
            if (randomChance > 0.4) {
              newHomeScore += 1;
              newEventTxt = 'GOL! Fenerbahçe simülasyonda öne geçiyor.';
              eventType = 'goal';
              changeShotsHome += 1;
            } else {
              newEventTxt = 'Kritik pozisyon! Son anda savunma araya giriyor.';
            }
          } else if (nextMinute === 45) {
            newEventTxt = 'İlk yarı sona erdi.';
            eventType = 'whistle';
          } else if (nextMinute === 60) {
            if (randomChance > 0.6) {
              newEventTxt = 'Sarı kart! Sert bir müdahale sonrası hakem cebine gidiyor.';
              eventType = 'card';
            } else {
              newEventTxt = 'Kenar yönetimi hamle hazırlığında, tempo yükseliyor.';
            }
          } else if (nextMinute === 75) {
            if (randomChance > 0.5) {
              newHomeScore += 1;
              newEventTxt = 'GOL! Fark ikiye çıkıyor.';
              eventType = 'goal';
              changeShotsHome += 1;
            } else {
              newAwayScore += randomChance < 0.25 ? 1 : 0;
              newEventTxt = newAwayScore > prev.awayScore ? 'GOL! Rakip farkı kapatıyor.' : 'Muhteşem kurtarış! Skor korunuyor.';
              eventType = newAwayScore > prev.awayScore ? 'goal' : 'info';
              changeShotsAway += 1;
            }
          } else if (nextMinute === 90) {
            newEventTxt = 'Uzatma dakikalarına giriliyor.';
          }

          const newEvent = newEventTxt ? [{ min: nextMinute, txt: newEventTxt, type: eventType }] : [];
          return {
            ...prev,
            minute: nextMinute,
            homeScore: newHomeScore,
            awayScore: newAwayScore,
            events: [...newEvent, ...prev.events],
            possession: changePossession,
            shotsHome: changeShotsHome,
            shotsAway: changeShotsAway
          };
        });
      }, 1800);
    }
    return () => clearInterval(interval);
  }, [liveSim.isRunning]);

  const startLiveSimulationEngine = () => {
    setLiveSim({
      isRunning: true,
      minute: 0,
      homeScore: 0,
      awayScore: 0,
      events: [{ min: 0, txt: 'Simülasyon başladı. (Bu akış gerçek maç verisi değildir.)', type: 'whistle' }],
      possession: 55,
      shotsHome: 0,
      shotsAway: 0
    });
  };

  /* ---------------- Veri yükleme ------------------------------------ */
  useEffect(() => {
    const loadDbData = async () => {
      try {
        setLoading(true);
        const matchesList = await dbGetCollection('matches');
        const teamsList = await dbGetCollection('teams');
        const standingsDocList = await dbGetCollection('standings');
        const reportsList = await dbGetCollection('match_reports');
        const playersList = await dbGetCollection('players');

        setMatches(matchesList || []);
        setTeams(teamsList || []);
        setMatchReports(reportsList || []);
        setDbPlayers(playersList || []);

        if (standingsDocList && standingsDocList.length > 0) {
          const docWithList = standingsDocList.find(d => Array.isArray(d.standingsList));
          if (docWithList) {
            setStandings(docWithList.standingsList);
            setStandingsMeta({ season: docWithList.season, isFinal: docWithList.isFinal, source: docWithList.source });
          } else {
            setStandings([]);
          }
        } else {
          setStandings([]);
        }

        const featured = matchesList.find(m => m.featured);
        const upcoming = matchesList.find(m => m.status === 'upcoming');
        const live = matchesList.find(m => m.status === 'live');
        const completed = matchesList.find(m => m.status === 'finished' || m.status === 'completed');
        const chosenMatch = featured || live || upcoming || completed || null;
        setActiveMatch(chosenMatch);
        if (chosenMatch && (chosenMatch.status === 'finished' || chosenMatch.status === 'completed')) {
          setActiveTab('Maç Sonu');
        }
      } catch (err) {
        console.error('Error loading Match Center dynamic data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadDbData();
  }, []);

  // Resmi lig fikstürü (statik gerçek veri dosyası)
  useEffect(() => {
    fetch('/data/league-fixture.json')
      .then(r => (r.ok ? r.json() : null))
      .then(d => { if (d && Array.isArray(d.weeks) && d.weeks.length > 0) setLeagueFixture(d); })
      .catch(() => {});
  }, []);

  // Biten maçta canlı akış / açık anket yok; o sekmelerden çık
  useEffect(() => {
    const finished = activeMatch?.status === 'finished' || activeMatch?.status === 'completed';
    if (finished && (activeTab === 'Canlı' || activeTab === 'Taraftar Tahmini')) {
      setActiveTab('Maç Sonu');
    }
  }, [activeMatch, activeTab]);

  // Geri sayım — yalnızca gerçek maç tarihi varken
  useEffect(() => {
    const computeCountdown = () => {
      const target = activeMatch?.matchDate ? new Date(activeMatch.matchDate).getTime() : NaN;
      const diff = target - Date.now();
      if (!Number.isFinite(diff) || diff <= 0) {
        setCountdown({ gün: 0, saat: 0, dakika: 0, saniye: 0 });
        return;
      }
      const totalSec = Math.floor(diff / 1000);
      setCountdown({
        gün: Math.floor(totalSec / 86400),
        saat: Math.floor((totalSec % 86400) / 3600),
        dakika: Math.floor((totalSec % 3600) / 60),
        saniye: totalSec % 60
      });
    };
    computeCountdown();
    const timer = setInterval(computeCountdown, 1000);
    return () => clearInterval(timer);
  }, [activeMatch?.matchDate]);

  /* ---------------- Türetilmiş veriler ------------------------------ */
  const handleVote = (option: 'home' | 'draw' | 'away') => {
    if (pollVotes.voted) return;
    setPollVotes(prev => {
      const copy = { ...prev };
      copy[option] = copy[option] + 1;
      copy.voted = true;
      copy.selectedOption = option === 'home' ? 'Fenerbahçe' : option === 'draw' ? 'Beraberlik' : (activeMatch?.awayTeam || 'Rakip');
      return copy;
    });
  };

  const totalVotes = Math.max(pollVotes.home + pollVotes.draw + pollVotes.away, 1);
  const homePct = Math.round((pollVotes.home / totalVotes) * 100);
  const drawPct = Math.round((pollVotes.draw / totalVotes) * 100);
  const awayPct = Math.round((pollVotes.away / totalVotes) * 100);

  const getTeamLogo = (teamName: string, defaultLogo?: string) => {
    if (defaultLogo) return defaultLogo;
    if (!teamName) return null;
    const found = teams.find(t => t.name?.toLowerCase() === teamName?.toLowerCase() || t.shortName?.toLowerCase() === teamName?.toLowerCase());
    if (found?.logoUrl) return found.logoUrl;
    if (found?.logo) return found.logo;
    return getTeamLogoPath(teamName);
  };

  // Sahte fallback maç yok: veri yoksa şık boş durum (ürün kuralı).
  // FotMob advanced overlay (API veya entity map sonrası match alanları)
  const [advancedOverlay, setAdvancedOverlay] = useState<any>(null);
  const [shotmapShots, setShotmapShots] = useState<any[]>([]);

  useEffect(() => {
    setAdvancedOverlay(null);
    setShotmapShots([]);
    const m = activeMatch;
    if (!m) return;

    const fotmobId = m.providerIds?.fotmob;
    const advDoc = m.advancedMatchDocumentId;
    // Stats zaten match'te olsa bile shotmap için advanced API dene
    if (!fotmobId && !advDoc) return;

    const id = advDoc || `fotmob-${fotmobId}`;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/v1/matches/${encodeURIComponent(id)}/advanced?provider=fotmob`);
        if (!res.ok) return;
        const json = await res.json();
        if (cancelled || !json.success || !json.data) return;
        const adv = Array.isArray(json.data) ? json.data[0] : json.data;
        const tm = adv.teamMetrics || {};
        const homeM = tm.home || {};
        const awayM = tm.away || {};
        const flipped = !!m.statsFlippedFromProvider;
        const H = flipped ? awayM : homeM;
        const A = flipped ? homeM : awayM;
        const num = (obj: any, keys: string[]) => {
          for (const k of keys) {
            if (obj[k] != null && obj[k] !== '') {
              const n = parseFloat(String(obj[k]).replace(/[^\d.]/g, ''));
              if (!Number.isNaN(n)) return n;
            }
            const found = Object.keys(obj).find(ok => ok.toLowerCase().includes(k.toLowerCase()));
            if (found != null) {
              const n = parseFloat(String(obj[found]).replace(/[^\d.]/g, ''));
              if (!Number.isNaN(n)) return n;
            }
          }
          return null;
        };
        // Match'te yoksa overlay ile doldur
        if (m.possessionHome == null && m.xGHome == null) {
          setAdvancedOverlay({
            possessionHome: num(H, ['Ball possession', 'possession']),
            possessionAway: num(A, ['Ball possession', 'possession']),
            shotsHome: num(H, ['Total shots', 'Shots']),
            shotsAway: num(A, ['Total shots', 'Shots']),
            shotsOnTargetHome: num(H, ['Shots on target']),
            shotsOnTargetAway: num(A, ['Shots on target']),
            cornersHome: num(H, ['Corners']),
            cornersAway: num(A, ['Corners']),
            foulsHome: num(H, ['Fouls committed', 'Fouls']),
            foulsAway: num(A, ['Fouls committed', 'Fouls']),
            xGHome: num(H, ['expectedGoals', 'Expected goals', 'xG']),
            xGAway: num(A, ['expectedGoals', 'Expected goals', 'xG']),
            statsProvider: 'fotmob',
            shotmapCount: Array.isArray(adv.shotmap) ? adv.shotmap.length : 0,
          });
        } else {
          setAdvancedOverlay({
            statsProvider: m.statsProvider || 'fotmob',
            shotmapCount: Array.isArray(adv.shotmap) ? adv.shotmap.length : m.shotmapCount,
          });
        }
        if (Array.isArray(adv.shotmap) && adv.shotmap.length) {
          setShotmapShots(adv.shotmap);
        }
      } catch {
        /* sessiz */
      }
    })();
    return () => { cancelled = true; };
  }, [activeMatch?.id, activeMatch?.providerIds?.fotmob, activeMatch?.advancedMatchDocumentId]);

  const resolvedActiveMatch = useMemo(() => {
    if (!activeMatch) return null;
    const merged: any = { ...activeMatch, ...(advancedOverlay || {}) };
    if ((merged.xGHome != null || merged.xGAway != null) && !merged.xG) {
      merged.xG = `${merged.xGHome ?? '—'} – ${merged.xGAway ?? '—'}`;
    }
    return merged;
  }, [activeMatch, advancedOverlay]);
  const isLive = resolvedActiveMatch?.status === 'live';
  const isCompleted = resolvedActiveMatch?.status === 'finished' || resolvedActiveMatch?.status === 'completed';

  const formattedDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch {
      return '—';
    }
  };
  const formattedTime = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '—';
    }
  };

  const currentXI = resolvedActiveMatch?.probableXI || null;

  const baseNameNormalize = (nameStr: string) => nameStr.toLowerCase()
    .replace(/ı/g, 'i').replace(/ş/g, 's').replace(/ç/g, 'c')
    .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ö/g, 'o')
    .replace(/ć/g, 'c').replace(/š/g, 's').replace(/ž/g, 'z')
    .replace(/đ/g, 'd').replace(/é/g, 'e').replace(/ã/g, 'a');

  const findDbPlayer = (name: string) => {
    if (!dbPlayers || dbPlayers.length === 0 || !name) return null;
    const clean = baseNameNormalize(name);
    return dbPlayers.find(p => {
      if (!p.name) return false;
      const pn = baseNameNormalize(p.name);
      return pn.includes(clean) || clean.includes(pn);
    }) || null;
  };

  const getPlayerFromDb = (fallbackName: string) => {
    const found = findDbPlayer(fallbackName);
    if (found) {
      const resolvedNo = parseInt(found.shirtNumber || found.no || '') || null;
      return { name: found.name, no: resolvedNo ?? '—', role: found.mainPosition || found.position || 'Oyuncu' };
    }
    return null;
  };

  const squadXI_Dynamic = currentXI ? (Object.fromEntries(
    ['GK', 'RB', 'CB1', 'CB2', 'LB', 'DM1', 'DM2', 'AM', 'RW', 'LW', 'CF'].map(pos => {
      const name = currentXI[pos] || '';
      const db = name ? getPlayerFromDb(name) : null;
      return [pos, db || (name ? { name, no: '—', role: 'Oyuncu' } : null)];
    })
  ) as Record<string, { name: string; no: number | string; role: string } | null>) : null;

  const upcomingMatches = matches.filter(m => m.status === 'upcoming').sort((a, b) => new Date(a.matchDate).getTime() - new Date(b.matchDate).getTime());
  const completedMatches = matches.filter(m => m.status === 'finished' || m.status === 'completed').sort((a, b) => new Date(b.matchDate).getTime() - new Date(a.matchDate).getTime());
  const nextMatchItem = upcomingMatches[0] || null;
  const lastMatchItem = completedMatches[0] || null;
  const fenerbahceStanding = standings.find(t => t.teamName?.toLowerCase().includes('fenerbahce') || t.teamName?.toLowerCase().includes('fenerbahçe'));

  // Birleşik fikstür: planlı/oynanmış maçlar + resmi lig fikstürü haftaları TEK listede.
  // Lig haftalarının tarihi henüz açıklanmadığından hafta sırasıyla, tarihi belli
  // hazırlık maçlarının ardından listelenir (sezon onlardan sonra başlıyor).
  type FixtureEntry = { kind: 'match'; match: any } | { kind: 'league'; week: any };
  const combinedFixtures: FixtureEntry[] = (() => {
    const matchEntries: FixtureEntry[] = [...matches]
      .sort((a, b) => new Date(a.matchDate).getTime() - new Date(b.matchDate).getTime())
      .map(m => ({ kind: 'match' as const, match: m }));
    const leagueEntries: FixtureEntry[] = (leagueFixture?.weeks || []).map((w: any) => ({ kind: 'league' as const, week: w }));
    if (fixtureFilter === 'Süper Lig') return leagueEntries;
    if (fixtureFilter === 'Hazırlık') return matchEntries.filter(e => e.kind === 'match' && e.match.competition?.toLowerCase().includes('hazırlık'));
    if (fixtureFilter === 'Tamamlanan Maçlar') return matchEntries.filter(e => e.kind === 'match' && (e.match.status === 'finished' || e.match.status === 'completed'));
    if (fixtureFilter === 'Yaklaşan Maçlar') {
      return [
        ...matchEntries.filter(e => e.kind === 'match' && e.match.status === 'upcoming'),
        ...leagueEntries
      ];
    }
    return [...matchEntries, ...leagueEntries];
  })();
  const FIXTURE_PREVIEW_COUNT = 8;
  const visibleFixtures = showAllFixtures ? combinedFixtures : combinedFixtures.slice(0, FIXTURE_PREVIEW_COUNT);

  const handleSelectFixture = (match: any, tabTarget: string) => {
    setActiveMatch(match);
    const finished = match.status === 'finished' || match.status === 'completed';
    if (finished && (tabTarget === 'Canlı' || tabTarget === 'Taraftar Tahmini')) tabTarget = 'Maç Sonu';
    setActiveTab(tabTarget);
    const element = document.getElementById('featured-match-section');
    if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const activeReport = resolvedActiveMatch
    ? matchReports.find(r => r.matchId === resolvedActiveMatch.id) || null
    : null;

  const activeGoals: any[] = Array.isArray(resolvedActiveMatch?.goals) ? resolvedActiveMatch.goals : [];
  const hasDetailedStats =
    (resolvedActiveMatch?.possessionHome !== undefined && resolvedActiveMatch?.possessionHome !== null) ||
    (resolvedActiveMatch?.xGHome !== undefined && resolvedActiveMatch?.xGHome !== null) ||
    (resolvedActiveMatch?.shotsHome !== undefined && resolvedActiveMatch?.shotsHome !== null);
  const homeGoals = activeGoals.filter(g => g.team === 'home').sort((a, b) => a.minute - b.minute);
  const awayGoals = activeGoals.filter(g => g.team === 'away').sort((a, b) => a.minute - b.minute);

  const visibleTabs = isCompleted
    ? ['Maç Önü', 'Maç Sonu', 'İstatistik']
    : ['Maç Önü', 'Canlı', 'İstatistik', 'Taraftar Tahmini'];

  const relegationStart = standings.length >= 18 ? standings.length - 3 : Infinity;

  /* ================================================================== */
  /* Render                                                             */
  /* ================================================================== */
  return (
    <div id="mac-merkezi-index" className="space-y-14 pb-24 text-left">
      <SEO
        title="Maç Merkezi | Fenerbahçe Evreni"
        description="Fenerbahçe maç merkezi: skorlar, gol zaman çizelgesi, kadrolar, taktik analiz raporları ve Süper Lig puan durumu."
        canonical="https://fenerbahceevreni.com/mac-merkezi"
      />

      {/* ============ 1. SİNEMATİK SAYFA GİRİŞİ ============ */}
      <section className="relative -mx-4 md:-mx-8 px-4 md:px-8 pt-10 pb-2 overflow-hidden">
        {/* katmanlı arka plan */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 -left-32 w-[560px] h-[560px] bg-[#002F6C]/25 rounded-full blur-[130px]" />
          <div className="absolute -top-24 right-0 w-[420px] h-[420px] bg-[#FFD21F]/[0.05] rounded-full blur-[110px]" />
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'repeating-linear-gradient(115deg, #fff 0px, #fff 1px, transparent 1px, transparent 14px)' }} />
        </div>

        <div className="relative z-10 space-y-3 max-w-4xl">
          <div className="flex items-center gap-3">
            {isLive && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full text-[10px] font-black uppercase text-red-400 tracking-widest animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Canlı veri aktif
              </span>
            )}
            <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">2026-27 Sezonu • Hazırlık Dönemi</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-display font-black text-white uppercase tracking-tight leading-[0.9] italic">
            Maç <span className="inline-block pr-3 text-transparent bg-clip-text bg-gradient-to-r from-[#FFD21F] to-[#ffe680]">Merkezi</span>
          </h1>
        </div>

        {/* özet şeridi */}
        <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mt-10">
          {[
            {
              label: 'SIRADAKİ MAÇ', icon: Calendar, accent: 'text-[#FFD21F]',
              main: nextMatchItem ? `vs ${nextMatchItem.awayTeam === 'Fenerbahçe' ? nextMatchItem.homeTeam : nextMatchItem.awayTeam}` : null,
              sub: nextMatchItem ? `${formattedDate(nextMatchItem.matchDate)} • ${formattedTime(nextMatchItem.matchDate)}` : null,
              empty: 'Planlı maç bulunmuyor'
            },
            {
              label: 'SON MAÇ', icon: Trophy, accent: 'text-emerald-400',
              main: lastMatchItem ? `${lastMatchItem.scoreHome} - ${lastMatchItem.scoreAway}` : null,
              sub: lastMatchItem ? `vs ${lastMatchItem.homeTeam === 'Fenerbahçe' ? lastMatchItem.awayTeam : lastMatchItem.homeTeam}` : null,
              empty: 'Oynanmış maç bulunmuyor'
            },
            {
              label: standingsMeta?.season ? `PUAN DURUMU (${standingsMeta.season}${standingsMeta.isFinal ? ' FİNAL' : ''})` : 'PUAN DURUMU', icon: BarChart3, accent: 'text-sky-400',
              main: fenerbahceStanding ? `${fenerbahceStanding.rank}. Sıra` : null,
              sub: fenerbahceStanding ? `${fenerbahceStanding.points} Puan • ${fenerbahceStanding.played} Maç • Avr +${fenerbahceStanding.goalsDiff}` : null,
              empty: 'Sezon henüz başlamadı'
            },
            {
              label: 'MAÇ RAPORLARI', icon: FileText, accent: 'text-[#FFD21F]',
              main: matchReports.length > 0 ? `${matchReports.length} Analiz` : null,
              sub: matchReports.length > 0 ? 'Uzun-form taktik rapor' : null,
              empty: 'Henüz rapor eklenmedi'
            }
          ].map((box, i) => (
            <motion.div
              key={box.label}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 * i, duration: 0.5 }}
              className="bg-[#0b101c]/80 backdrop-blur border border-white/[0.06] p-4 rounded-2xl shadow-lg hover:border-[#FFD21F]/20 transition-colors group"
            >
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[8.5px] font-black tracking-widest text-slate-400 uppercase font-mono">{box.label}</span>
                <box.icon className={`w-3.5 h-3.5 ${box.accent} opacity-60 group-hover:opacity-100 transition-opacity`} />
              </div>
              {box.main ? (
                <div className="space-y-0.5">
                  <div className="text-base font-display font-black text-white italic leading-none truncate">{box.main}</div>
                  <div className="text-[10px] text-slate-400 font-mono truncate">{box.sub}</div>
                </div>
              ) : (
                <div className="text-xs text-slate-500 font-bold italic">{box.empty}</div>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* ============ 2. MAÇ SAHNESİ ============ */}
      {loading ? (
        <section id="featured-match-section"><HeroSkeleton /></section>
      ) : !resolvedActiveMatch ? (
        <section id="featured-match-section" className="pt-2">
          <div className="relative overflow-hidden rounded-3xl border border-white/[0.06] bg-gradient-to-br from-[#0E1526] via-[#0B0F19] to-[#0E1526] p-10 md:p-16 text-center shadow-2xl">
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[420px] h-[420px] bg-[#002F6C]/20 rounded-full blur-[110px] pointer-events-none" />
            <div className="relative z-10 max-w-xl mx-auto space-y-6">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-[#FFD21F]/10 border border-[#FFD21F]/20 flex items-center justify-center">
                <Calendar className="w-8 h-8 text-[#FFD21F]" />
              </div>
              <div className="content-auto space-y-3">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#FFD21F] font-mono block">Maç Merkezi</span>
                <h2 className="text-2xl md:text-3xl font-display font-black text-white uppercase italic tracking-tight">Henüz maç verisi yüklenmedi</h2>
                <p className="text-sm text-slate-400 leading-relaxed font-medium">
                  Fikstür, kadrolar, istatistikler ve taktik analizler; veri girişi yapıldığında burada görüntülenecek.
                </p>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <>
          <motion.section id="featured-match-section" {...fadeUp} className="space-y-0">
            <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] shadow-2xl">
              {/* arka plan sahnesi */}
              <div className="absolute inset-0 bg-gradient-to-b from-[#0A1428] via-[#0B0F1B] to-[#080B12]" />
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[720px] h-[340px] bg-[#002F6C]/40 rounded-[100%] blur-[90px]" />
                <div className="absolute -bottom-32 left-8 w-72 h-72 bg-[#FFD21F]/[0.05] rounded-full blur-[80px]" />
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#FFD21F]/60 to-transparent" />
                {/* saha çizgisi silueti */}
                <svg className="absolute bottom-0 inset-x-0 w-full opacity-[0.05]" viewBox="0 0 720 120" preserveAspectRatio="none">
                  <ellipse cx="360" cy="120" rx="200" ry="70" fill="none" stroke="#fff" strokeWidth="1.5" />
                  <line x1="0" y1="119" x2="720" y2="119" stroke="#fff" strokeWidth="1.5" />
                </svg>
              </div>

              <div className="relative z-10 p-6 md:p-10 space-y-8">
                {/* üst meta */}
                <div className="flex flex-wrap justify-between items-center gap-3">
                  <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg ${isLive ? 'bg-red-500/10 text-red-500 animate-pulse border border-red-500/20' : isCompleted ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/15' : 'bg-[#FFD21F]/10 text-[#FFD21F] border border-[#FFD21F]/15'}`}>
                    {isLive ? '● CANLI' : isCompleted ? 'MAÇ SONUCU' : 'MAÇ ÖNÜ'}
                  </span>
                  <div className="flex items-center gap-4 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                    <span>{resolvedActiveMatch.competition}</span>
                    <span className="hidden sm:flex items-center gap-1"><Calendar className="w-3 h-3 text-[#FFD21F]" /> {formattedDate(resolvedActiveMatch.matchDate)}</span>
                  </div>
                </div>

                {/* skor tahtası */}
                <div className="grid grid-cols-3 items-center gap-2 md:gap-8">
                  <div className="flex flex-col items-center gap-4">
                    <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.15, duration: 0.5 }}>
                      <TeamBadge src={getTeamLogo(resolvedActiveMatch.homeTeam, resolvedActiveMatch.homeLogo)} name={resolvedActiveMatch.homeTeam} size="w-20 h-20 md:w-28 md:h-28" />
                    </motion.div>
                    <span className="text-sm md:text-lg font-display font-black text-white uppercase tracking-wide italic text-center leading-tight">{resolvedActiveMatch.homeTeam}</span>
                  </div>

                  <div className="flex flex-col items-center gap-2">
                    {isLive || isCompleted ? (
                      <>
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.25, duration: 0.5 }}
                          className="text-6xl md:text-8xl font-display font-black text-white italic tracking-tighter leading-none"
                          style={{ textShadow: '0 0 60px rgba(255,210,31,0.25)' }}
                        >
                          {resolvedActiveMatch.scoreHome}<span className="text-[#FFD21F] mx-1.5 md:mx-3">–</span>{resolvedActiveMatch.scoreAway}
                        </motion.div>
                        <span className={`text-[10px] font-mono font-black tracking-[0.3em] uppercase ${isLive ? 'text-red-500 animate-pulse' : 'text-slate-400'}`}>
                          {isLive ? '● Canlı' : 'Maç Sonu'}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-[9px] text-[#FFD21F] font-black tracking-[0.3em] uppercase font-mono">Başlama Saati</span>
                        <span className="text-5xl md:text-6xl font-display font-black italic text-white font-mono">{formattedTime(resolvedActiveMatch.matchDate)}</span>
                        {(countdown.gün + countdown.saat + countdown.dakika + countdown.saniye) > 0 && (
                          <div className="flex gap-2 mt-1">
                            {[{ v: countdown.gün, l: 'GÜN' }, { v: countdown.saat, l: 'SA' }, { v: countdown.dakika, l: 'DK' }, { v: countdown.saniye, l: 'SN' }].map(c => (
                              <div key={c.l} className="bg-white/[0.04] border border-white/10 rounded-lg px-2 py-1 text-center min-w-[42px]">
                                <div className="text-sm font-black font-mono text-[#FFD21F]">{c.v.toString().padStart(2, '0')}</div>
                                <div className="text-[7px] text-slate-500 font-black">{c.l}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  <div className="flex flex-col items-center gap-4">
                    <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.15, duration: 0.5 }}>
                      <TeamBadge src={getTeamLogo(resolvedActiveMatch.awayTeam, resolvedActiveMatch.awayLogo)} name={resolvedActiveMatch.awayTeam} size="w-20 h-20 md:w-28 md:h-28" />
                    </motion.div>
                    <span className="text-sm md:text-lg font-display font-black text-white uppercase tracking-wide italic text-center leading-tight">{resolvedActiveMatch.awayTeam}</span>
                  </div>
                </div>

                {/* golcüler */}
                {(homeGoals.length > 0 || awayGoals.length > 0) && (
                  <div className="grid grid-cols-2 gap-6 max-w-2xl mx-auto text-[11px] font-semibold">
                    <div className="space-y-1 text-right border-r border-white/[0.07] pr-6">
                      {homeGoals.map((g, i) => (
                        <div key={i} className="text-slate-200">
                          <span className="text-white">{g.scorer}</span> <span className="text-[#FFD21F] font-mono font-black">{g.minute}'</span>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-1 pl-6">
                      {awayGoals.length > 0 ? awayGoals.map((g, i) => (
                        <div key={i} className="text-slate-200">
                          <span className="text-[#FFD21F] font-mono font-black">{g.minute}'</span> <span className="text-white">{g.scorer}</span>
                        </div>
                      )) : <div className="text-slate-500 font-mono">—</div>}
                    </div>
                  </div>
                )}

                {/* gol zaman çizelgesi — gerçek veri */}
                {isCompleted && activeGoals.length > 0 && (
                  <div className="pt-2 border-t border-white/[0.06]">
                    <GoalTimeline goals={activeGoals} homeTeam={resolvedActiveMatch.homeTeam} awayTeam={resolvedActiveMatch.awayTeam} />
                  </div>
                )}

                {/* alt meta şeridi */}
                <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 pt-4 border-t border-white/[0.06] text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                  {resolvedActiveMatch.venue && <span className="flex items-center gap-1.5"><MapPin className="w-3 h-3 text-[#FFD21F]" /> {resolvedActiveMatch.venue}</span>}
                  <span className="flex items-center gap-1.5"><Tv className="w-3 h-3 text-[#FFD21F]" /> {resolvedActiveMatch.broadcasterTarget || '—'}</span>
                  {resolvedActiveMatch.referee && resolvedActiveMatch.referee !== '-' && (
                    <span className="flex items-center gap-1.5"><Flag className="w-3 h-3 text-[#FFD21F]" /> {resolvedActiveMatch.referee}</span>
                  )}
                  {resolvedActiveMatch.analysisNote && (
                    <span className="flex items-center gap-1.5 normal-case tracking-normal text-slate-500 italic"><AlertCircle className="w-3 h-3" /> {resolvedActiveMatch.analysisNote}</span>
                  )}
                </div>
              </div>
            </div>
          </motion.section>

          {/* ============ 3. SEKMELER ============ */}
          <motion.section id="match-details-tabs-hub" {...fadeUp} className="space-y-8">
            <div className="sticky top-16 z-30 -mx-4 md:mx-0 px-4 md:px-0">
              <div className="bg-[#080B12]/85 backdrop-blur-xl border border-white/[0.07] rounded-2xl px-2 py-1.5 flex overflow-x-auto no-scrollbar shadow-xl">
                {visibleTabs.map(tab => {
                  const isActive = activeTab === tab;
                  return (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`relative flex-1 whitespace-nowrap px-4 md:px-6 py-2.5 text-[11px] md:text-xs font-black uppercase tracking-wider rounded-xl transition-colors cursor-pointer ${isActive ? 'text-fb-navy' : 'text-slate-400 hover:text-white'}`}
                    >
                      {isActive && (
                        <motion.div layoutId="activeMatchTabPill" className="absolute inset-0 bg-[#FFD21F] rounded-xl shadow-[0_4px_20px_rgba(255,210,31,0.35)]" transition={{ type: 'spring', bounce: 0.18, duration: 0.5 }} />
                      )}
                      <span className="relative z-10">{tab}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ---------- MAÇ ÖNÜ ---------- */}
            {activeTab === 'Maç Önü' && (
              <div className="space-y-8 animate-fade-in">
                {resolvedActiveMatch.matchPreview && (
                  <div className="p-6 rounded-2xl bg-[#0b101c] border border-white/[0.06] space-y-2">
                    <span className="text-[10px] font-black text-fb-yellow uppercase tracking-widest flex items-center gap-1.5 font-mono">
                      <Flag className="w-3.5 h-3.5 text-[#FFD21F]" /> Maç Notu
                    </span>
                    <p className="text-sm text-slate-300 leading-relaxed font-semibold max-w-3xl">{resolvedActiveMatch.matchPreview}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                  {/* Saha dizilimi — premium çim + fotoğraflı oyuncu çipleri */}
                  <div className="lg:col-span-8 relative rounded-3xl overflow-hidden border border-white/[0.08] shadow-2xl min-h-[560px] md:min-h-[620px] flex flex-col">
                    {/* çim zemini: biçim şeritleri + ışık + vinyet */}
                    <div className="absolute inset-0 bg-[#07130c]" />
                    <div className="absolute inset-0" style={{ background: 'repeating-linear-gradient(0deg, rgba(66,160,94,0.11) 0px, rgba(66,160,94,0.11) 46px, rgba(30,86,50,0.11) 46px, rgba(30,86,50,0.11) 92px)' }} />
                    <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 95% 75% at 50% 40%, rgba(52,168,96,0.18), transparent 72%)' }} />
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(2,7,4,0.6) 0%, transparent 20%, transparent 74%, rgba(2,7,4,0.8) 100%)' }} />
                    {/* saha çizgileri */}
                    <svg className="absolute inset-0 w-full h-full opacity-[0.22]" viewBox="0 0 400 560" preserveAspectRatio="none" aria-hidden="true">
                      <rect x="18" y="18" width="364" height="524" fill="none" stroke="#fff" strokeWidth="1.6" rx="2" />
                      <line x1="18" y1="280" x2="382" y2="280" stroke="#fff" strokeWidth="1.6" />
                      <circle cx="200" cy="280" r="46" fill="none" stroke="#fff" strokeWidth="1.6" />
                      <circle cx="200" cy="280" r="2.5" fill="#fff" />
                      <rect x="110" y="18" width="180" height="66" fill="none" stroke="#fff" strokeWidth="1.6" />
                      <rect x="152" y="18" width="96" height="26" fill="none" stroke="#fff" strokeWidth="1.6" />
                      <circle cx="200" cy="66" r="2.5" fill="#fff" />
                      <path d="M 158 84 A 48 48 0 0 0 242 84" fill="none" stroke="#fff" strokeWidth="1.6" />
                      <rect x="110" y="476" width="180" height="66" fill="none" stroke="#fff" strokeWidth="1.6" />
                      <rect x="152" y="516" width="96" height="26" fill="none" stroke="#fff" strokeWidth="1.6" />
                      <circle cx="200" cy="494" r="2.5" fill="#fff" />
                      <path d="M 158 476 A 48 48 0 0 1 242 476" fill="none" stroke="#fff" strokeWidth="1.6" />
                      <path d="M 18 30 A 12 12 0 0 0 30 18" fill="none" stroke="#fff" strokeWidth="1.4" />
                      <path d="M 370 18 A 12 12 0 0 0 382 30" fill="none" stroke="#fff" strokeWidth="1.4" />
                      <path d="M 30 542 A 12 12 0 0 0 18 530" fill="none" stroke="#fff" strokeWidth="1.4" />
                      <path d="M 382 530 A 12 12 0 0 0 370 542" fill="none" stroke="#fff" strokeWidth="1.4" />
                    </svg>

                    {/* üst bilgi çubuğu */}
                    <div className="relative z-20 flex flex-wrap justify-between items-center gap-2 p-4 md:p-5">
                      <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-black/50 backdrop-blur-md border border-white/15 text-[10px] font-black tracking-widest text-white uppercase font-mono">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#FFD21F]" />
                        {(currentXI && currentXI.formation) || '—'} • {isCompleted ? 'İlk 11' : 'Muhtemel 11'}
                      </span>
                      <span className="hidden sm:inline px-3 py-1.5 rounded-xl bg-black/35 backdrop-blur border border-white/10 text-[9px] text-slate-300 font-bold uppercase tracking-wider">Oyuncuya dokun, kartını incele</span>
                    </div>

                    {squadXI_Dynamic ? (
                      <div className="relative z-20 flex-1 flex flex-col justify-between px-3 md:px-10 pb-8 pt-1 gap-2">
                        {[['CF'], ['LW', 'AM', 'RW'], ['DM1', 'DM2'], ['LB', 'CB1', 'CB2', 'RB'], ['GK']].map((row, ri) => (
                          <div key={ri} className={`flex items-end ${row.length === 1 ? 'justify-center' : row.length === 2 ? 'justify-center gap-20 md:gap-28' : row.length === 3 ? 'justify-around px-4 md:px-10' : 'justify-between px-0 md:px-2'}`}>
                            {row.map((pos, pi) => {
                              const p = squadXI_Dynamic[pos];
                              if (!p) return <div key={pos} className="w-14" />;
                              const sel = selectedXIPosition === pos;
                              const db = findDbPlayer(p.name);
                              const lastName = p.name.split(' ').slice(-1)[0];
                              return (
                                <motion.button
                                  key={pos}
                                  initial={{ opacity: 0, y: 14 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 0.08 * ri + 0.05 * pi, duration: 0.45 }}
                                  onClick={() => setSelectedXIPosition(pos)}
                                  className="group flex flex-col items-center gap-1.5 cursor-pointer focus:outline-none"
                                  title={p.name}
                                >
                                  <span className={`relative block transition-transform duration-300 ${sel ? 'scale-110' : 'group-hover:scale-105'}`}>
                                    <span className={`block w-12 h-12 md:w-16 md:h-16 rounded-full overflow-hidden border-2 transition-all duration-300 ${sel ? 'border-[#FFD21F] shadow-[0_0_30px_rgba(255,210,31,0.55)]' : 'border-white/30 shadow-[0_10px_24px_rgba(0,0,0,0.55)] group-hover:border-[#FFD21F]/70'}`}>
                                      {db?.photo ? (
                                        <img src={db.photo} alt={p.name} className="w-full h-full object-cover object-top bg-[#0a1322]" loading="lazy"/>
                                      ) : (
                                        <span className="w-full h-full flex items-center justify-center bg-gradient-to-b from-[#132340] to-[#0a1322] text-[10px] font-black font-mono text-slate-300">{getInitials(p.name)}</span>
                                      )}
                                    </span>
                                    <span className={`absolute -bottom-1 -right-1.5 min-w-[20px] h-5 md:min-w-[24px] md:h-6 px-1 rounded-full flex items-center justify-center text-[9px] md:text-[10px] font-black font-mono border-2 border-[#07130c] transition-colors ${sel ? 'bg-[#FFD21F] text-fb-navy' : 'bg-fb-navy text-[#FFD21F]'}`}>{p.no}</span>
                                  </span>
                                  <span className={`max-w-[76px] md:max-w-[110px] truncate px-2 py-0.5 rounded-md text-[8.5px] md:text-[10px] font-black uppercase tracking-wide backdrop-blur-md transition-all ${sel ? 'bg-[#FFD21F] text-fb-navy shadow-[0_2px_14px_rgba(255,210,31,0.45)]' : 'bg-black/55 text-white border border-white/10'}`}>{lastName}</span>
                                </motion.button>
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="relative z-20 flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-300">
                        <AlertCircle className="w-10 h-10 text-slate-400 mb-2" />
                        <div className="text-sm font-black">Kadro dizilimi henüz eklenmedi.</div>
                        <p className="text-xs text-slate-400 mt-1">İlk 11 yayınlandığında interaktif saha dizilimi burada etkinleşecek.</p>
                      </div>
                    )}
                  </div>

                  {/* Rol paneli */}
                  <div className="lg:col-span-4 flex flex-col text-left">
                    <div className="p-5 rounded-2xl bg-[#0b101c] border border-white/[0.08] space-y-4 flex-1">
                      <div className="flex items-center gap-2 text-fb-yellow border-b border-white/5 pb-2.5">
                        <User className="w-4 h-4 text-fb-yellow" />
                        <span className="text-[10px] font-black uppercase tracking-wider font-mono">Oyuncu Kartı</span>
                      </div>

                      {squadXI_Dynamic && squadXI_Dynamic[selectedXIPosition] ? (
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={selectedXIPosition}
                            initial={{ opacity: 0, x: 8 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -8 }}
                            className="space-y-4"
                          >
                            {(() => {
                              const p = squadXI_Dynamic[selectedXIPosition]!;
                              const db = findDbPlayer(p.name);
                              return (
                                <>
                                  <div className="flex items-center gap-4">
                                    {db?.photo ? (
                                      <img src={db.photo} alt={p.name} className="w-16 h-16 rounded-2xl object-cover border border-white/10 bg-[#060a12]" />
                                    ) : (
                                      <div className="w-16 h-16 rounded-2xl bg-[#060a12] border border-white/10 flex items-center justify-center">
                                        <Shirt className="w-7 h-7 text-slate-500" />
                                      </div>
                                    )}
                                    <div>
                                      <div className="text-base font-display font-black text-white italic leading-tight">{p.name}</div>
                                      <div className="text-[11px] font-mono font-bold text-[#FFD21F]">#{p.no} • {p.role}</div>
                                    </div>
                                  </div>
                                  {db && (
                                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                                      {db.age && <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5"><span className="text-slate-500 block text-[8px] font-mono uppercase">Yaş</span><span className="text-white font-bold">{db.age}</span></div>}
                                      {db.nationality && <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5"><span className="text-slate-500 block text-[8px] font-mono uppercase">Uyruk</span><span className="text-white font-bold truncate block">{db.nationality}</span></div>}
                                      {db.height && <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5"><span className="text-slate-500 block text-[8px] font-mono uppercase">Boy</span><span className="text-white font-bold">{db.height}</span></div>}
                                      {db.marketValue && <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5"><span className="text-slate-500 block text-[8px] font-mono uppercase">Piyasa Değeri</span><span className="text-[#FFD21F] font-bold font-mono">{db.marketValue}</span></div>}
                                    </div>
                                  )}
                                  {db?.scout?.overview && (
                                    <div className="pt-3 border-t border-white/[0.05]">
                                      <span className="text-[8px] text-slate-400 font-black uppercase tracking-wider font-mono block mb-1.5">Scout Özeti</span>
                                      <p className="text-xs text-slate-300 leading-relaxed font-medium line-clamp-4">{db.scout.overview}</p>
                                    </div>
                                  )}
                                  <button
                                    onClick={() => onNavigate('oyuncular')}
                                    className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-1.5"
                                  >
                                    Oyuncu Profiline Git <ArrowRight className="w-3 h-3" />
                                  </button>
                                </>
                              );
                            })()}
                          </motion.div>
                        </AnimatePresence>
                      ) : (
                        <div className="py-12 text-center text-slate-500 text-xs italic">Kadro verisi bulunmuyor.</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Taktik notlar — gerçek veri */}
                <div className="p-6 rounded-2xl bg-[#0b101c] border border-white/[0.06] space-y-4">
                  <h3 className="text-sm font-black text-white uppercase tracking-wider border-b border-white/5 pb-2 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-fb-yellow" /> Taktik Notlar
                  </h3>
                  {Array.isArray(resolvedActiveMatch.tacticalNotes) && resolvedActiveMatch.tacticalNotes.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {resolvedActiveMatch.tacticalNotes.map((note: any, idx: number) => (
                        <motion.div key={idx} {...fadeUp} transition={{ delay: idx * 0.08, duration: 0.5 }} className="p-4 rounded-xl bg-white/[0.015] border border-white/5 space-y-1.5 hover:border-[#FFD21F]/20 transition-colors">
                          <span className="text-[9px] font-black text-fb-yellow font-mono uppercase tracking-wider">{note.title}</span>
                          <p className="text-xs text-slate-300 leading-relaxed font-semibold">{note.text}</p>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-4 text-slate-500 text-xs italic font-semibold">Bu maç için taktik analiz notu henüz eklenmedi.</div>
                  )}
                </div>
              </div>
            )}

            {/* ---------- CANLI (yalnızca oynanmamış maç) ---------- */}
            {activeTab === 'Canlı' && !isCompleted && (
              <div className="space-y-8 animate-fade-in">
                {!liveSim.isRunning && liveSim.minute === 0 ? (
                  <div className="p-12 rounded-2xl bg-[#0b101c] border border-white/[0.08] text-center space-y-6 max-w-xl mx-auto">
                    <div className="w-16 h-16 rounded-full bg-fb-yellow/10 border border-fb-yellow/20 flex items-center justify-center mx-auto text-fb-yellow animate-pulse">
                      <Activity className="w-8 h-8" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-display font-black text-white uppercase italic">Canlı Simülasyon Odası</h3>
                      <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed font-semibold">
                        Maç henüz başlamadı. Bu interaktif araç olası maç akışını simüle eder. <strong className="text-[#FFD21F]">Simülasyon amaçlıdır, gerçek maç verisi değildir.</strong>
                      </p>
                    </div>
                    <button
                      onClick={startLiveSimulationEngine}
                      className="px-6 py-3 bg-fb-yellow hover:bg-[#ffe05c] text-fb-navy font-black text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-[0_4px_20px_rgba(255,210,31,0.15)] inline-flex items-center gap-2"
                    >
                      Mücadeleyi Simüle Et <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                    <div className="lg:col-span-5 rounded-2xl bg-[#0e1320] border border-white/[0.08] p-6 flex flex-col justify-between space-y-6 relative overflow-hidden shadow-xl">
                      <div className="absolute top-0 inset-x-0 h-[2px] bg-red-500" />
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-red-500/10 border border-red-500/20 rounded text-[9px] font-black uppercase tracking-widest text-red-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" /> SİMÜLASYON
                          </span>
                          <div className="text-xl font-mono font-black italic text-fb-yellow flex items-center gap-1">
                            <Timer className="w-4 h-4 text-fb-yellow" /> {liveSim.minute}'
                          </div>
                        </div>
                        <div className="bg-[#05080e] rounded-xl p-4 border border-white/5 flex items-center justify-around text-center">
                          <div>
                            <div className="text-xs font-black text-white uppercase">{resolvedActiveMatch.homeTeam.slice(0, 3)}</div>
                            <div className="text-3xl font-display font-black text-[#FFD21F] mt-1 font-mono">{liveSim.homeScore}</div>
                          </div>
                          <div className="text-slate-500 font-mono text-sm uppercase">VS</div>
                          <div>
                            <div className="text-xs font-black text-white uppercase">{resolvedActiveMatch.awayTeam.slice(0, 3)}</div>
                            <div className="text-3xl font-display font-black text-white mt-1 font-mono">{liveSim.awayScore}</div>
                          </div>
                        </div>
                        <div className="space-y-4 pt-2">
                          <div className="space-y-1">
                            <div className="flex justify-between text-[11px] font-bold text-slate-300">
                              <span>Simüle Topa Sahip Olma</span>
                              <span className="font-mono text-fb-yellow font-black">{liveSim.possession}% - {100 - liveSim.possession}%</span>
                            </div>
                            <div className="h-2 rounded-full bg-white/5 overflow-hidden flex">
                              <div className="bg-[#FFD21F] rounded-l-full" style={{ width: `${liveSim.possession}%` }} />
                              <div className="bg-slate-600 rounded-r-full" style={{ width: `${100 - liveSim.possession}%` }} />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between text-[11px] font-bold text-slate-300">
                              <span>Simüle Şut Sayısı</span>
                              <span className="font-mono text-white font-black">{liveSim.shotsHome} - {liveSim.shotsAway}</span>
                            </div>
                            <div className="h-2 rounded-full bg-white/5 overflow-hidden flex">
                              <div className="bg-[#FFD21F]" style={{ width: `${(liveSim.shotsHome / (liveSim.shotsHome + liveSim.shotsAway || 1)) * 100}%` }} />
                              <div className="bg-slate-600" style={{ width: `${(liveSim.shotsAway / (liveSim.shotsHome + liveSim.shotsAway || 1)) * 100}%` }} />
                            </div>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={startLiveSimulationEngine}
                        className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-lg text-xxs font-black uppercase tracking-widest transition-all cursor-pointer border border-white/10"
                      >
                        Simülasyonu Yeniden Başlat
                      </button>
                    </div>

                    <div className="lg:col-span-7 rounded-2xl bg-[#0b101c] border border-white/[0.08] p-6 flex flex-col justify-between text-left space-y-4">
                      <div>
                        <span className="text-[10px] font-black text-fb-yellow tracking-widest uppercase block border-b border-white/5 pb-2.5 font-mono">SİMÜLASYON AKIŞI</span>
                        <div className="divide-y divide-white/5 max-h-[360px] overflow-y-auto pr-2 space-y-3.5 mt-3">
                          {liveSim.events.map((ev, idx) => (
                            <div key={idx} className={`pt-3.5 flex items-start gap-3 ${ev.type === 'goal' ? 'bg-fb-yellow/5 p-3 rounded-lg border border-[#FFD21F]/15' : ev.type === 'card' ? 'bg-rose-500/5 p-3 rounded-lg border border-rose-500/15' : ''}`}>
                              <span className="text-[11px] font-mono font-black text-fb-yellow min-w-[28px] text-right shrink-0">{ev.min}'</span>
                              <p className={`text-xs leading-relaxed font-semibold flex-1 ${ev.type === 'goal' ? 'text-[#FFD21F] font-black' : 'text-slate-300'}`}>{ev.txt}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono text-center border-t border-white/5 pt-3">
                        Bu akış bir simülasyondur; gerçek maç verisi içermez.
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ---------- MAÇ SONU: UZUN-FORM EDİTORYAL RAPOR ---------- */}
            {activeTab === 'Maç Sonu' && (
              <div className="animate-fade-in">
                {activeReport ? (
                  <article className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-b from-[#0d1322] to-[#080b12] shadow-2xl">
                    <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-transparent via-[#FFD21F] to-transparent" />
                    <div className="p-6 md:p-14 max-w-4xl mx-auto space-y-10">
                      {/* başlık bloğu */}
                      <header className="space-y-5 text-center">
                        <span className="inline-flex items-center gap-2 text-[10px] text-[#FFD21F] font-black uppercase tracking-[0.35em] font-mono">
                          <span className="w-8 h-px bg-[#FFD21F]/40" /> Taktik Analiz Raporu <span className="w-8 h-px bg-[#FFD21F]/40" />
                        </span>
                        <h2 className="text-3xl md:text-5xl font-display font-black text-white uppercase leading-[0.95] italic tracking-tight">
                          {activeReport.title}
                        </h2>
                        <div className="flex items-center justify-center gap-4 text-[10px] text-slate-500 font-mono uppercase tracking-widest">
                          <span>{formattedDate(activeReport.createdAt)}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-600" />
                          <span>Fenerbahçe Evreni Analiz</span>
                        </div>
                      </header>

                      {/* standfirst */}
                      {activeReport.summary && (
                        <p className="text-base md:text-lg text-slate-200 leading-relaxed font-semibold text-center max-w-2xl mx-auto border-y border-white/[0.06] py-6 italic">
                          {activeReport.summary}
                        </p>
                      )}

                      {/* maç hikayesi — drop cap */}
                      {activeReport.matchStory && (
                        <div className="space-y-4">
                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] font-mono">Maç Hikayesi</h4>
                          <p className="text-sm md:text-[15px] text-slate-300 leading-[1.9] font-medium first-letter:text-6xl first-letter:font-display first-letter:font-black first-letter:text-[#FFD21F] first-letter:float-left first-letter:mr-3 first-letter:leading-[0.8] first-letter:italic">
                            {activeReport.matchStory}
                          </p>
                        </div>
                      )}

                      {/* pull quote — dönüm noktası */}
                      {activeReport.turningPoint && (
                        <blockquote className="relative py-8 px-6 md:px-14 text-center">
                          <Quote className="w-8 h-8 text-[#FFD21F]/25 absolute top-2 left-2" />
                          <p className="text-lg md:text-2xl font-display font-black text-white italic leading-snug">
                            "{activeReport.turningPoint}"
                          </p>
                          <span className="block mt-4 text-[9px] text-[#FFD21F] font-black uppercase tracking-[0.3em] font-mono">Kritik Dönüm Noktası</span>
                        </blockquote>
                      )}

                      {/* artılar / eksiler */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="p-6 rounded-2xl bg-emerald-500/[0.04] border border-emerald-500/15 space-y-2">
                          <span className="text-[9px] font-black text-[#5adea9] font-mono uppercase tracking-widest">✓ Taktiksel Artılar</span>
                          <p className="text-sm text-slate-300 font-semibold leading-relaxed">{activeReport.tacticalPositives || '—'}</p>
                        </div>
                        <div className="p-6 rounded-2xl bg-rose-500/[0.04] border border-rose-500/15 space-y-2">
                          <span className="text-[9px] font-black text-rose-400 font-mono uppercase tracking-widest">✕ Gelişim Alanları</span>
                          <p className="text-sm text-slate-300 font-semibold leading-relaxed">{activeReport.tacticalNegatives || '—'}</p>
                        </div>
                      </div>

                      {/* gol akışı — dikey zaman çizelgesi */}
                      {activeGoals.length > 0 && (
                        <div className="p-6 md:p-8 rounded-2xl bg-[#0b101c] border border-white/[0.06] space-y-5">
                          <span className="text-[10px] font-black text-slate-400 font-mono uppercase tracking-[0.3em]">Gol Akışı</span>
                          <div className="relative pl-2">
                            <div className="absolute left-[38px] top-2 bottom-2 w-px bg-gradient-to-b from-[#FFD21F]/40 via-white/10 to-white/5" />
                            <div className="space-y-1">
                              {(() => {
                                let h = 0, a = 0;
                                return [...activeGoals].sort((x, y) => x.minute - y.minute).map((g, i) => {
                                  if (g.team === 'home') h += 1; else a += 1;
                                  const own = /kendi kalesine|k\.k\./i.test(g.scorer || '');
                                  const cleanName = (g.scorer || '').replace(/\s*\(kendi kalesine\)/i, '');
                                  return (
                                    <div key={i} className="relative flex items-center gap-4 py-2.5 group">
                                      <div className={`relative z-10 w-[52px] shrink-0 text-center py-1.5 rounded-xl border font-mono font-black text-sm ${g.team === 'home' ? 'bg-[#FFD21F]/10 border-[#FFD21F]/25 text-[#FFD21F]' : 'bg-white/[0.04] border-white/10 text-slate-300'}`}>
                                        {g.minute}'
                                      </div>
                                      <div className="flex-1 min-w-0 flex items-center justify-between gap-3">
                                        <div className="min-w-0">
                                          <div className="text-sm md:text-base font-display font-black text-white italic truncate">
                                            {cleanName}
                                            {own && <span className="ml-2 text-[9px] font-mono font-black text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded px-1.5 py-0.5 align-middle not-italic">K.K.</span>}
                                          </div>
                                          <div className="text-[10px] text-slate-400 font-mono uppercase tracking-wider mt-0.5">
                                            {g.team === 'home' ? resolvedActiveMatch.homeTeam : resolvedActiveMatch.awayTeam}{g.minute <= 45 ? ' • İlk Yarı' : ' • İkinci Yarı'}
                                          </div>
                                        </div>
                                        <div className="shrink-0 font-mono font-black text-base md:text-lg text-white bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-1.5">
                                          {h}<span className="text-slate-500 mx-1">–</span>{a}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                });
                              })()}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* oyuncu puanları — yalnızca gerçek veri varsa */}
                      {activeReport.playerRatings && activeReport.playerRatings.length > 0 && (
                        <div className="space-y-3.5">
                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] font-mono">Oyuncu Puanlamaları</h4>
                          <div className="divide-y divide-white/5">
                            {activeReport.playerRatings.map((rating: any, rIdx: number) => (
                              <div key={rIdx} className="py-2.5 flex items-start justify-between text-xs gap-4">
                                <div>
                                  <div className="font-bold text-white uppercase">{rating.name} <span className="font-mono text-[9px] text-[#FFD21F] bg-white/5 px-1.5 py-0.5 rounded ml-1.5 font-normal">{rating.position}</span></div>
                                  <p className="text-[11px] text-slate-400 leading-normal mt-0.5">{rating.comment}</p>
                                </div>
                                <div className="text-sm font-black text-fb-yellow font-mono">{rating.rating.toFixed(1)}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* MOTM — yalnızca gerçek veri varsa */}
                      {activeReport.fanMotm && (
                        <div className="p-6 rounded-2xl bg-[#FFD21F]/[0.05] border border-[#FFD21F]/20 text-center space-y-1">
                          <span className="text-[9px] text-[#FFD21F] font-black uppercase tracking-[0.3em] font-mono">Taraftarın Seçimi — Maçın Oyuncusu</span>
                          <div className="text-xl font-display font-black text-white italic">{activeReport.fanMotm}</div>
                        </div>
                      )}
                    </div>
                  </article>
                ) : (
                  <div className="p-12 rounded-2xl bg-[#0b101c] border border-white/[0.08] text-center space-y-4 max-w-xl mx-auto">
                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto text-slate-400">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-base font-black text-white uppercase">Maç sonu raporu henüz eklenmedi.</h3>
                      <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                        Bu karşılaşmanın detaylı analizi karşılaşma bittikten kısa süre sonra yayınlanacaktır.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ---------- İSTATİSTİK ---------- */}
            {activeTab === 'İstatistik' && (
              <div className="space-y-8 animate-fade-in">
                {isCompleted && activeGoals.length > 0 ? (
                  <>
                    {/* Gerçek maç kaydından türetilen özet kartlar */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {(() => {
                        const firstHalf = activeGoals.filter(g => g.minute <= 45).length;
                        const secondHalf = activeGoals.length - firstHalf;
                        const ownGoals = activeGoals.filter(g => /kendi kalesine|k\.k\./i.test(g.scorer || '')).length;
                        const cleanSheet = (resolvedActiveMatch.scoreAway || 0) === 0;
                        return [
                          { label: 'Toplam Gol', value: String(activeGoals.length) },
                          { label: 'İY / 2Y Dağılımı', value: `${firstHalf} / ${secondHalf}` },
                          { label: 'Kalesini Gole Kapattı', value: cleanSheet ? 'Evet ✓' : 'Hayır' },
                          { label: 'Kendi Kalesine', value: String(ownGoals) }
                        ].map(s => (
                          <div key={s.label} className="p-4 rounded-2xl bg-[#0b101c] border border-white/[0.06] text-center">
                            <div className="text-xl md:text-2xl font-display font-black italic text-[#FFD21F]">{s.value}</div>
                            <div className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-1 font-mono">{s.label}</div>
                          </div>
                        ));
                      })()}
                    </div>

                    {/* Gol zaman çizelgesi + skor akışı — tamamı gerçek veri */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <motion.div {...fadeUp} className="p-6 rounded-2xl bg-[#0b101c] border border-white/[0.06] space-y-4">
                        <h3 className="text-[10px] font-black text-[#FFD21F] uppercase tracking-widest font-mono flex items-center gap-2">
                          <Timer className="w-3.5 h-3.5" /> Gol Zaman Çizelgesi
                        </h3>
                        <GoalTimeline goals={activeGoals} homeTeam={resolvedActiveMatch.homeTeam} awayTeam={resolvedActiveMatch.awayTeam} />
                      </motion.div>
                      <motion.div {...fadeUp} transition={{ delay: 0.1, duration: 0.5 }} className="p-6 rounded-2xl bg-[#0b101c] border border-white/[0.06] space-y-4">
                        <h3 className="text-[10px] font-black text-[#FFD21F] uppercase tracking-widest font-mono flex items-center gap-2">
                          <Activity className="w-3.5 h-3.5" /> Skor Akışı
                        </h3>
                        <ScoreFlow
                          goals={activeGoals}
                          homeTeam={resolvedActiveMatch.homeTeam}
                          awayTeam={resolvedActiveMatch.awayTeam}
                          finalHome={resolvedActiveMatch.scoreHome || 0}
                          finalAway={resolvedActiveMatch.scoreAway || 0}
                        />
                      </motion.div>
                    </div>
                  </>
                ) : null}

                {/* Detaylı istatistik — varsa gerçek, yoksa dürüst boş durum */}
                {hasDetailedStats ? (
                  <div className="p-6 md:p-8 rounded-2xl bg-[#0b101c] border border-white/[0.08] space-y-5 max-w-3xl">
                    <span className="text-[10px] font-black text-[#FFD21F] tracking-widest uppercase block border-b border-white/5 pb-2.5 font-mono">Maç İstatistikleri</span>
                    {[
                      { label: 'Topa Sahip Olma (%)', h: resolvedActiveMatch.possessionHome, a: resolvedActiveMatch.possessionAway, pct: true },
                      { label: 'Toplam Şut', h: resolvedActiveMatch.shotsHome, a: resolvedActiveMatch.shotsAway },
                      { label: 'İsabetli Şut', h: resolvedActiveMatch.shotsOnTargetHome, a: resolvedActiveMatch.shotsOnTargetAway },
                      { label: 'Pas İsabeti (%)', h: resolvedActiveMatch.passAccuracyHome, a: resolvedActiveMatch.passAccuracyAway, pct: true },
                      { label: 'Korner', h: resolvedActiveMatch.cornersHome, a: resolvedActiveMatch.cornersAway },
                      { label: 'Faul', h: resolvedActiveMatch.foulsHome, a: resolvedActiveMatch.foulsAway }
                    ].filter(s => s.h !== undefined && s.h !== null).map(s => {
                      const total = (Number(s.h) || 0) + (Number(s.a) || 0) || 1;
                      const hw = s.pct ? Number(s.h) : (Number(s.h) / total) * 100;
                      return (
                        <div key={s.label} className="space-y-1.5">
                          <div className="flex justify-between text-xs font-bold text-slate-300">
                            <span className="font-mono text-white font-black">{s.h}</span>
                            <span>{s.label}</span>
                            <span className="font-mono text-white font-black">{s.a}</span>
                          </div>
                          <div className="h-2 rounded-full bg-white/5 overflow-hidden flex">
                            <div className="bg-[#FFD21F]" style={{ width: `${hw}%` }} />
                            <div className="bg-slate-600" style={{ width: `${100 - hw}%` }} />
                          </div>
                        </div>
                      );
                    })}
                    {(resolvedActiveMatch.xGHome != null || resolvedActiveMatch.xGAway != null || resolvedActiveMatch.xG) && (
                      <div className="p-3 bg-emerald-500/10 rounded-lg space-y-1">
                        <div className="text-xs uppercase text-emerald-400 font-black">Gol Beklentisi (xG)</div>
                        <div className="text-xl font-mono font-black text-white mt-1">
                          {resolvedActiveMatch.xGHome != null || resolvedActiveMatch.xGAway != null
                            ? `${resolvedActiveMatch.xGHome ?? '—'} – ${resolvedActiveMatch.xGAway ?? '—'}`
                            : resolvedActiveMatch.xG}
                        </div>
                        {resolvedActiveMatch.statsProvider && (
                          <div className="text-[9px] font-mono text-emerald-500/80 uppercase tracking-wider">
                            Kaynak: {resolvedActiveMatch.statsProvider}
                            {resolvedActiveMatch.shotmapCount ? ` · ${resolvedActiveMatch.shotmapCount} şut haritası noktası` : ''}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-6 rounded-2xl bg-[#0b101c] border border-white/[0.06] flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 text-slate-400">
                      <BarChart3 className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-sm font-black text-white uppercase">Detaylı istatistik verisi bulunmuyor</h3>
                      <p className="text-xs text-slate-400 leading-relaxed max-w-xl">
                        Bu karşılaşma için topa sahip olma, şut ve xG gibi detaylı istatistikler veri sağlayıcılar tarafından yayınlanmadı.
                        {isCompleted && activeGoals.length > 0 ? ' Yukarıdaki gol zaman çizelgesi ve skor akışı gerçek maç kayıtlarından üretilmiştir.' : ''}
                      </p>
                    </div>
                  </div>
                )}

                {/* Şut haritası (FotMob advanced) */}
                {shotmapShots.length > 0 && resolvedActiveMatch && (
                  <motion.div {...fadeUp} className="max-w-4xl">
                    <ShotmapPitch
                      shots={shotmapShots}
                      homeTeam={resolvedActiveMatch.homeTeam}
                      awayTeam={resolvedActiveMatch.awayTeam}
                    />
                  </motion.div>
                )}

                {/* İki takım kadroları — gerçek ilk 11'ler */}
                {(Array.isArray(resolvedActiveMatch.lineupHome) && resolvedActiveMatch.lineupHome.length > 0) && (
                  <motion.div {...fadeUp} className="p-6 rounded-2xl bg-[#0b101c] border border-white/[0.06] space-y-5">
                    <h3 className="text-[10px] font-black text-[#FFD21F] uppercase tracking-widest font-mono flex items-center gap-2">
                      <Shirt className="w-3.5 h-3.5" /> İlk 11'ler
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Fenerbahçe */}
                      <div className="space-y-2.5">
                        <div className="flex items-center gap-2 pb-2 border-b border-[#FFD21F]/15">
                          <TeamBadge src={getTeamLogo(resolvedActiveMatch.homeTeam, resolvedActiveMatch.homeLogo)} name={resolvedActiveMatch.homeTeam} size="w-6 h-6" />
                          <span className="text-xs font-display font-black text-white uppercase italic">{resolvedActiveMatch.homeTeam}</span>
                        </div>
                        {resolvedActiveMatch.lineupHome.map((name: string, i: number) => {
                          const db = findDbPlayer(name);
                          const scored = homeGoals.some(g => baseNameNormalize(g.scorer || '').includes(baseNameNormalize(name.split(' ').slice(-1)[0])));
                          return (
                            <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/[0.02] transition-colors group">
                              {db?.photo ? (
                                <img src={db.photo} alt={name} className="w-8 h-8 rounded-lg object-cover border border-white/10 bg-[#060a12]" />
                              ) : (
                                <div className="w-8 h-8 rounded-lg bg-[#060a12] border border-white/10 flex items-center justify-center text-[9px] font-mono font-black text-slate-500">
                                  {getInitials(name)}
                                </div>
                              )}
                              <span className="text-[8px] font-mono font-black text-[#FFD21F] w-6 text-center shrink-0">{db?.shirtNumber || db?.no || '—'}</span>
                              <span className="text-xs font-bold text-white flex-1 truncate">{name}</span>
                              {scored && <span className="text-[10px]" title="Gol attı">⚽</span>}
                              {db?.mainPosition && <span className="text-[9px] text-slate-500 font-mono uppercase hidden sm:inline">{db.mainPosition}</span>}
                            </div>
                          );
                        })}
                      </div>
                      {/* Rakip */}
                      <div className="space-y-2.5">
                        <div className="flex items-center gap-2 pb-2 border-b border-white/10">
                          <TeamBadge src={getTeamLogo(resolvedActiveMatch.awayTeam, resolvedActiveMatch.awayLogo)} name={resolvedActiveMatch.awayTeam} size="w-6 h-6" />
                          <span className="text-xs font-display font-black text-white uppercase italic">{resolvedActiveMatch.awayTeam}</span>
                        </div>
                        {Array.isArray(resolvedActiveMatch.lineupAway) && resolvedActiveMatch.lineupAway.length > 0 ? (
                          resolvedActiveMatch.lineupAway.map((name: string, i: number) => (
                            <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/[0.02] transition-colors">
                              <div className="w-8 h-8 rounded-lg bg-[#060a12] border border-white/10 flex items-center justify-center text-[9px] font-mono font-black text-slate-500">
                                {getInitials(name)}
                              </div>
                              <span className="text-xs font-bold text-slate-300 flex-1 truncate">{name}</span>
                            </div>
                          ))
                        ) : (
                          <div className="text-xs text-slate-500 italic py-4">Rakip kadro bilgisi eklenmedi.</div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}

                {!isCompleted && activeGoals.length === 0 && !hasDetailedStats && !(Array.isArray(resolvedActiveMatch.lineupHome) && resolvedActiveMatch.lineupHome.length > 0) && (
                  <div className="p-12 rounded-2xl bg-[#0b101c] border border-white/[0.08] text-center space-y-4 max-w-xl mx-auto">
                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto text-slate-400">
                      <BarChart3 className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-base font-black text-white uppercase">Bu maç için istatistik verisi henüz bulunmuyor.</h3>
                      <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">Veriler karşılaşma oynandığında bu sekmede görüntülenecek.</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ---------- TARAFTAR TAHMİNİ (yalnızca oynanmamış maç) ---------- */}
            {activeTab === 'Taraftar Tahmini' && !isCompleted && (
              <div className="space-y-8 animate-fade-in">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch max-w-5xl mx-auto">
                  {/* Kazanan anketi */}
                  <div className="rounded-2xl bg-[#0b101c] border border-white/[0.06] p-6 text-left space-y-6 flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-fb-yellow">
                        <Vote className="w-4 h-4 text-fb-yellow" />
                        <span className="text-[10px] font-black uppercase tracking-widest font-mono">Maç Sonucu Anketi</span>
                      </div>
                      <h3 className="text-lg font-display font-black text-white italic uppercase">{resolvedActiveMatch.homeTeam} vs {resolvedActiveMatch.awayTeam}</h3>
                      {!pollVotes.voted ? (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
                          <button onClick={() => handleVote('home')} className="p-3.5 rounded-xl bg-white/5 border border-white/10 hover:border-fb-yellow font-black text-xxs text-center text-white transition-all hover:scale-[1.01] cursor-pointer">{resolvedActiveMatch.homeTeam}</button>
                          <button onClick={() => handleVote('draw')} className="p-3.5 rounded-xl bg-white/5 border border-white/10 hover:border-fb-yellow font-black text-xxs text-center text-white transition-all hover:scale-[1.01] cursor-pointer">Beraberlik</button>
                          <button onClick={() => handleVote('away')} className="p-3.5 rounded-xl bg-white/5 border border-white/10 hover:border-fb-yellow font-black text-xxs text-center text-[#ffea8c] transition-all hover:scale-[1.01] cursor-pointer">{resolvedActiveMatch.awayTeam}</button>
                        </div>
                      ) : (
                        <div className="space-y-4 pt-2">
                          <div className="text-xxs text-emerald-400 font-bold flex items-center gap-2 uppercase font-mono">
                            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Kayıt Edildi: <span className="text-white font-black">"{pollVotes.selectedOption}"</span>
                          </div>
                          <div className="content-auto space-y-3">
                            {[
                              { label: `${resolvedActiveMatch.homeTeam} Galibiyeti`, pct: homePct, color: 'bg-fb-yellow' },
                              { label: 'Beraberlik', pct: drawPct, color: 'bg-slate-400' },
                              { label: `${resolvedActiveMatch.awayTeam} Galibiyeti`, pct: awayPct, color: 'bg-rose-500' }
                            ].map(row => (
                              <div key={row.label}>
                                <div className="flex justify-between text-slate-300 text-[10px] font-bold mb-1">
                                  <span>{row.label}</span><span>{row.pct}%</span>
                                </div>
                                <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                                  <motion.div initial={{ width: 0 }} animate={{ width: `${row.pct}%` }} className={`h-full ${row.color} rounded-full`} />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="text-[9px] text-slate-500 italic pt-4 border-t border-white/5 flex justify-between font-mono mt-4">
                      <span>Kazanan Anketi</span>
                      <span>Toplam Oy: {totalVotes}</span>
                    </div>
                  </div>

                  {/* Skor tahmini */}
                  <div className="rounded-2xl bg-[#0b101c] border border-white/[0.06] p-6 text-left space-y-6 flex flex-col justify-between relative overflow-hidden">
                    <div className="space-y-4">
                      <span className="text-[10px] font-black uppercase tracking-widest font-mono text-fb-yellow">Skor Tahmini</span>
                      <h3 className="text-lg font-display font-black text-white italic uppercase">Net Skorunu Belirle</h3>
                      {!scoreVotes.voted ? (
                        <div className="space-y-5 pt-2">
                          <div className="flex items-center justify-center gap-6 bg-[#05080f] rounded-xl p-4 border border-white/5">
                            {(['homeScore', 'awayScore'] as const).map((k, i) => (
                              <React.Fragment key={k}>
                                {i === 1 && <span className="text-slate-500 font-bold text-lg font-mono leading-none mt-4">-</span>}
                                <div className="text-center space-y-1.5">
                                  <span className="text-[9px] font-black text-slate-400 block uppercase tracking-wider">{(i === 0 ? resolvedActiveMatch.homeTeam : resolvedActiveMatch.awayTeam).slice(0, 8)}</span>
                                  <div className="flex items-center gap-2">
                                    <button type="button" onClick={() => setScoreVotes(p => ({ ...p, [k]: Math.max(0, p[k] - 1) }))} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 active:scale-95 text-white font-black text-sm flex items-center justify-center cursor-pointer border border-white/10">-</button>
                                    <span className="text-2xl font-mono font-black text-white w-8 text-center">{scoreVotes[k]}</span>
                                    <button type="button" onClick={() => setScoreVotes(p => ({ ...p, [k]: p[k] + 1 }))} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 active:scale-95 text-white font-black text-sm flex items-center justify-center cursor-pointer border border-white/10">+</button>
                                  </div>
                                </div>
                              </React.Fragment>
                            ))}
                          </div>
                          <button
                            onClick={() => setScoreVotes(prev => ({ ...prev, voted: true, submits: prev.submits + 1 }))}
                            className="w-full py-3 bg-fb-yellow hover:bg-[#ffe05c] text-fb-navy font-black text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-[0_4px_20px_rgba(255,210,31,0.15)]"
                          >
                            Skor Tahminini Gönder
                          </button>
                        </div>
                      ) : (
                        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-2">
                          <span className="text-[10px] text-emerald-400 font-black uppercase font-mono tracking-wider">Tahmininiz alındı</span>
                          <div className="text-2xl font-mono font-black text-white italic">{scoreVotes.homeScore} - {scoreVotes.awayScore}</div>
                        </div>
                      )}
                    </div>
                    <div className="text-[9px] text-slate-500 italic pt-4 border-t border-white/5 flex justify-between font-mono mt-4">
                      <span>Skor Tahmin Anketi</span>
                      <span>Katılım: {scoreVotes.submits}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.section>
        </>
      )}

      {/* ============ 4. FİKSTÜR + PUAN DURUMU ============ */}
      <section id="fixtures-and-calendar" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-2">
        {/* Fikstür */}
        <motion.div {...fadeUp} className="lg:col-span-7 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-3">
            <h2 className="text-2xl md:text-3xl font-display font-black text-white italic uppercase tracking-tight">Fikstür</h2>
            <div className="flex flex-wrap gap-1.5">
              {['Tüm Maçlar', 'Yaklaşan Maçlar', 'Tamamlanan Maçlar', 'Hazırlık', 'Süper Lig'].map(filter => {
                const isSelected = fixtureFilter === filter;
                return (
                  <button
                    key={filter}
                    onClick={() => setFixtureFilter(filter)}
                    className={`px-3 py-1 rounded-lg text-[10px] font-mono font-black uppercase transition-all whitespace-nowrap cursor-pointer ${isSelected ? 'bg-fb-yellow text-fb-navy' : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'}`}
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
                      className={`p-4 md:p-5 rounded-2xl border transition-all ${w.derby ? 'bg-gradient-to-r from-[#FFD21F]/[0.06] to-transparent border-[#FFD21F]/25' : 'bg-[#0b101c] border-white/[0.05] hover:border-white/15'}`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="p-2.5 bg-[#05080e] rounded-xl border border-white/5 text-center min-w-[54px] font-mono shrink-0">
                          <div className="text-sm font-black italic text-fb-yellow">{w.week}</div>
                          <div className="text-[8px] text-slate-400 font-extrabold uppercase mt-0.5">Hafta</div>
                        </div>

                        <div className="flex items-center gap-3 flex-1 justify-center min-w-0">
                          <div className="flex items-center gap-2 justify-end w-[38%] min-w-0">
                            <span className="text-xs font-black text-white uppercase truncate">{w.home ? 'Fenerbahçe' : w.opponent}</span>
                            <TeamBadge src={w.home ? '/logos/fenerbahce.png' : (w.logo || getTeamLogoPath(w.opponent))} name={w.home ? 'Fenerbahçe' : w.opponent} size="w-5 h-5" />
                          </div>
                          <div className="font-mono text-center min-w-[56px] shrink-0">
                            <span className="text-[9px] text-slate-400 font-bold uppercase">vs</span>
                          </div>
                          <div className="flex items-center gap-2 w-[38%] min-w-0">
                            <TeamBadge src={w.home ? (w.logo || getTeamLogoPath(w.opponent)) : '/logos/fenerbahce.png'} name={w.home ? w.opponent : 'Fenerbahçe'} size="w-5 h-5" />
                            <span className="text-xs font-black text-white uppercase truncate">{w.home ? w.opponent : 'Fenerbahçe'}</span>
                          </div>
                        </div>

                        <div className="w-4 shrink-0" />
                      </div>
                      <div className="flex items-center gap-3 mt-2.5 pl-[68px] text-[9px] text-slate-500 font-mono uppercase tracking-wider">
                        <span className="text-emerald-400/80">Trendyol Süper Lig • {leagueFixture?.season}</span>
                        <span className="text-white/15">•</span>
                        <span className={w.home ? 'text-emerald-400' : 'text-sky-400'}>{w.home ? '⌂ İç Saha' : '✈ Deplasman'}</span>
                        {w.derby && <span className="px-1.5 py-px rounded bg-[#FFD21F]/15 text-[#FFD21F] border border-[#FFD21F]/25 text-[8px]">DERBİ</span>}
                        <span className="text-white/15">•</span>
                        <span>Tarih açıklanacak</span>
                      </div>
                    </motion.div>
                  );
                }

                const item = entry.match;
                const matchDateObj = new Date(item.matchDate);
                const itemFinished = item.status === 'finished' || item.status === 'completed';
                const itemLive = item.status === 'live';
                const isActive = resolvedActiveMatch?.id === item.id;
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(idx, 8) * 0.05, duration: 0.45 }}
                    onClick={() => handleSelectFixture(item, itemFinished ? 'Maç Sonu' : 'Maç Önü')}
                    className={`group p-4 md:p-5 rounded-2xl border cursor-pointer transition-all ${isActive ? 'bg-[#FFD21F]/[0.04] border-[#FFD21F]/25' : 'bg-[#0b101c] border-white/[0.05] hover:border-[#FFD21F]/20 hover:bg-white/[0.015]'}`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="p-2.5 bg-[#05080e] rounded-xl border border-white/5 text-center min-w-[54px] font-mono shrink-0">
                        <div className="text-sm font-black italic text-fb-yellow">{matchDateObj.getDate()}</div>
                        <div className="text-[8px] text-slate-400 font-extrabold uppercase mt-0.5">{matchDateObj.toLocaleDateString('tr-TR', { month: 'short' })}</div>
                      </div>

                      <div className="flex items-center gap-3 flex-1 justify-center min-w-0">
                        <div className="flex items-center gap-2 justify-end w-[38%] min-w-0">
                          <span className="text-xs font-black text-white uppercase truncate">{item.homeTeam}</span>
                          <TeamBadge src={getTeamLogo(item.homeTeam, item.homeLogo)} name={item.homeTeam} size="w-5 h-5" />
                        </div>
                        <div className="font-mono text-center min-w-[56px] shrink-0">
                          {itemFinished || itemLive ? (
                            <span className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg text-fb-yellow text-sm font-black italic">{item.scoreHome} - {item.scoreAway}</span>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-bold">{formattedTime(item.matchDate)}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 w-[38%] min-w-0">
                          <TeamBadge src={getTeamLogo(item.awayTeam, item.awayLogo)} name={item.awayTeam} size="w-5 h-5" />
                          <span className="text-xs font-black text-white uppercase truncate">{item.awayTeam}</span>
                        </div>
                      </div>

                      <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-[#FFD21F] group-hover:translate-x-0.5 transition-all shrink-0" />
                    </div>
                    <div className="flex items-center gap-3 mt-2.5 pl-[68px] text-[9px] text-slate-500 font-mono uppercase tracking-wider">
                      <span className="text-emerald-400/80">{item.competition}</span>
                      {item.venue && <><span className="text-white/15">•</span><span className="truncate">{item.venue.split('/')[0]}</span></>}
                      {itemFinished && <><span className="text-white/15">•</span><span className="text-emerald-400">MS</span></>}
                    </div>
                  </motion.div>
                );
              })}

              {combinedFixtures.length > FIXTURE_PREVIEW_COUNT && (
                <button
                  onClick={() => setShowAllFixtures(v => !v)}
                  className="w-full py-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] text-[10px] font-black uppercase tracking-widest text-slate-300 hover:text-white transition-all cursor-pointer"
                >
                  {showAllFixtures ? 'Daralt' : `Tamamını Gör (${combinedFixtures.length} Karşılaşma)`}
                </button>
              )}
            </div>
          ) : (
            <div className="p-8 rounded-xl bg-white/[0.01] border border-white/5 text-center text-slate-500 text-xs italic">
              Seçilen kıstasa uygun maç kaydı bulunamadı.
            </div>
          )}
        </motion.div>

        {/* Puan Durumu — gerçek 18 takım */}
        <motion.div {...fadeUp} transition={{ delay: 0.1, duration: 0.55 }} className="lg:col-span-5 space-y-5">
          <div className="flex items-end justify-between border-b border-white/5 pb-3">
            <h2 className="text-2xl md:text-3xl font-display font-black text-white italic uppercase tracking-tight">Puan Durumu</h2>
            {standingsMeta?.season && (
              <span className="text-[9px] font-mono font-black text-[#FFD21F] bg-[#FFD21F]/10 border border-[#FFD21F]/20 px-2.5 py-1 rounded-lg uppercase tracking-wider">
                {standingsMeta.season}{standingsMeta.isFinal ? ' • Final' : ''}
              </span>
            )}
          </div>

          {standings && standings.length > 0 ? (
            <div className="rounded-2xl bg-[#0b101c] border border-white/[0.08] overflow-hidden shadow-xl">
              <div className="px-4 pt-4 pb-2 flex items-center justify-between">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest font-mono">Trendyol Süper Lig</span>
                {standingsMeta?.source && <span className="text-[8px] text-slate-500 font-mono uppercase">Kaynak: {standingsMeta.source}</span>}
              </div>
              <div className="px-2 pb-3">
                <div className="content-auto grid grid-cols-12 text-[9px] font-extrabold uppercase text-slate-500 font-mono tracking-wider border-b border-white/5 pb-1.5 px-2 text-center">
                  <div className="col-span-1">#</div>
                  <div className="col-span-5 text-left pl-1">Takım</div>
                  <div className="col-span-1">O</div>
                  <div className="col-span-1 text-emerald-400">G</div>
                  <div className="col-span-1 text-slate-400">B</div>
                  <div className="col-span-1 text-rose-400">M</div>
                  <div className="col-span-1">AV</div>
                  <div className="col-span-1 font-black text-[#FFD21F]">P</div>
                </div>
                {(showFullStandings ? standings : standings.slice(0, 10)).map((row, index) => {
                  const isFenerbahce = row.teamName?.toLowerCase().includes('fenerbahce') || row.teamName?.toLowerCase().includes('fenerbahçe');
                  const rank = row.rank || index + 1;
                  const inRelegation = rank > relegationStart;
                  return (
                    <div
                      key={index}
                      className={`grid grid-cols-12 items-center text-xs text-center py-2 px-2 rounded-lg border transition-all mt-0.5 ${
                        isFenerbahce
                          ? 'bg-fb-yellow/10 border-[#FFD21F]/30 text-white font-black shadow-[inset_0_0_14px_rgba(255,210,31,0.08)]'
                          : 'bg-transparent border-transparent text-slate-300 hover:bg-white/[0.02]'
                      }`}
                    >
                      <div className={`col-span-1 font-mono font-black text-[11px] ${rank === 1 ? 'text-[#FFD21F]' : inRelegation ? 'text-rose-400' : ''}`}>{rank}</div>
                      <div className="col-span-5 flex items-center gap-2 text-left pl-1 font-semibold min-w-0">
                        <TeamBadge src={row.logo || getTeamLogoPath(row.teamName)} name={row.teamName} size="w-4.5 h-4.5" />
                        <span className={`truncate text-[11px] ${isFenerbahce ? 'text-[#FFD21F]' : ''}`}>{row.teamName || '—'}</span>
                      </div>
                      <div className="col-span-1 font-mono text-[11px]">{row.played}</div>
                      <div className="col-span-1 font-mono text-[11px] text-emerald-400">{row.win}</div>
                      <div className="col-span-1 font-mono text-[11px] text-slate-400">{row.draw}</div>
                      <div className="col-span-1 font-mono text-[11px] text-rose-400">{row.lose}</div>
                      <div className="col-span-1 font-mono text-[10px] text-slate-400">{row.goalsDiff > 0 ? `+${row.goalsDiff}` : row.goalsDiff}</div>
                      <div className="col-span-1 font-mono font-black text-[#FFD21F] text-[11px]">{row.points}</div>
                    </div>
                  );
                })}
                {standings.length > 10 && (
                  <button
                    onClick={() => setShowFullStandings(v => !v)}
                    className="w-full mt-2 py-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 text-[10px] font-black uppercase tracking-widest text-slate-300 transition-all cursor-pointer"
                  >
                    {showFullStandings ? 'Daralt' : `Tüm Tabloyu Gör (${standings.length} Takım)`}
                  </button>
                )}
                {standingsMeta?.isFinal && (
                  <div className="mt-3 px-2 flex items-center gap-2 text-[9px] text-slate-500 font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400/60 inline-block" /> Son 3 sıra küme düştü • {standingsMeta.season} sezonu final tablosu
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-10 rounded-2xl bg-[#0b101c] border border-white/[0.08] text-center text-slate-500 text-xs italic font-semibold leading-relaxed">
              Puan durumu verisi henüz eklenmedi.
            </div>
          )}
        </motion.div>
      </section>

      {/* ============ 5. SON MAÇ RAPORLARI ============ */}
      <motion.section {...fadeUp} className="space-y-6 pt-2">
        <div className="border-b border-white/5 pb-3">
          <h2 className="text-2xl md:text-3xl font-display font-black text-white italic uppercase tracking-tight">Son Maç Raporları</h2>
        </div>

        {matchReports && matchReports.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matchReports.slice(0, 3).map((report, idx) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08, duration: 0.5 }}
                className="bg-[#0e1320] rounded-2xl border border-white/[0.08] p-5 flex flex-col justify-between hover:border-fb-yellow/25 hover:-translate-y-0.5 transition-all shadow-lg text-left group"
              >
                <div className="space-y-3.5">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-mono px-2 py-0.5 bg-fb-yellow/10 text-fb-yellow border border-fb-yellow/20 rounded font-bold uppercase">Maç Sonu Analizi</span>
                    <span className="text-[10px] text-slate-500 font-mono">{formattedDate(report.createdAt)}</span>
                  </div>
                  <h4 className="text-sm font-black text-white group-hover:text-fb-yellow transition-colors uppercase leading-tight line-clamp-2 italic">{report.title}</h4>
                  {report.summary && <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">{report.summary}</p>}
                </div>
                <div className="pt-5 border-t border-white/5 mt-5 flex items-center justify-between">
                  <span className="text-[10px] font-mono font-black text-[#3DDC97]">{report.fanMotm ? `● ${report.fanMotm} MVP` : ''}</span>
                  <button
                    onClick={() => {
                      const relatedMatch = matches.find(m => m.id === report.matchId);
                      if (relatedMatch) setActiveMatch(relatedMatch);
                      setActiveTab('Maç Sonu');
                      const el = document.getElementById('match-details-tabs-hub');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="text-xs font-black text-[#FFD21F] hover:text-white transition-all flex items-center gap-1 cursor-pointer font-mono"
                  >
                    Raporu Oku <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="p-10 rounded-xl bg-[#0b101c] border border-white/[0.08] text-center text-slate-500 text-xs italic font-semibold leading-relaxed">
            Henüz maç raporu eklenmedi.
          </div>
        )}
      </motion.section>

      {/* ============ 6. BÜLTEN CTA ============ */}
      <motion.section {...fadeUp} id="match-newsletter-cta" className="pt-2">
        <div className="rounded-3xl bg-gradient-to-r from-[#0d131f] to-[#121825] border border-fb-yellow/20 p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-fb-yellow/5 rounded-full blur-[70px] pointer-events-none" />
          <div className="space-y-2 max-w-xl text-left relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-fb-yellow/10 border border-fb-yellow/30 text-[10px] font-black uppercase text-fb-yellow tracking-widest font-mono">
              Haftalık Bülten
            </div>
            <h2 className="text-2xl md:text-3xl font-display font-black text-white uppercase italic leading-none">Maç analizlerini kaçırma</h2>
            <p className="text-sm text-slate-400 leading-relaxed">Her hafta profesyonelce hazırlanan Fenerbahçe analiz bültenini e-postana getirelim. Reklam yok, sadece analiz.</p>
          </div>
          <button
            onClick={() => onNavigate('bulten')}
            className="relative z-10 shrink-0 px-6 py-3.5 bg-fb-yellow hover:bg-white text-fb-dark text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer"
          >
            Bültene Kayıt Ol →
          </button>
        </div>
      </motion.section>
    </div>
  );
};

export default MacMerkeziPage;
