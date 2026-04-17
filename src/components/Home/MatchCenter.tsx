import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import {
  Calendar,
  ChevronRight,
  Clock3,
  MapPin,
  Radio,
  RefreshCcw,
  Sparkles,
  Trophy,
  Users,
} from 'lucide-react';
import {
  fetchLiveFenerbahceSchedule,
  type LiveFixtureItem,
  type LineupPlayer,
  type LiveMatchSnapshot,
  type MatchEventItem,
  type MatchStatItem,
  type PlayerLeaderItem,
  type TeamLineup,
} from '../../lib/matchService';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const calcTimeLeft = (target: number): TimeLeft => {
  const dist = Math.max(0, target - Date.now());
  return {
    days: Math.floor(dist / 86_400_000),
    hours: Math.floor((dist % 86_400_000) / 3_600_000),
    minutes: Math.floor((dist % 3_600_000) / 60_000),
    seconds: Math.floor((dist % 60_000) / 1_000),
  };
};

const statusTone: Record<'pre' | 'in' | 'post', string> = {
  pre: 'border-sky-400/35 bg-sky-400/10 text-sky-200',
  in: 'border-emerald-400/35 bg-emerald-400/10 text-emerald-200',
  post: 'border-fb-yellow/35 bg-fb-yellow/10 text-fb-yellow',
};

const eventTone = (type: string) => {
  if (type.includes('Gol')) return 'border-emerald-400/35 bg-emerald-400/10 text-emerald-200';
  if (type.includes('Kırmızı')) return 'border-rose-400/35 bg-rose-400/10 text-rose-200';
  if (type.includes('Sarı')) return 'border-amber-400/35 bg-amber-400/10 text-amber-200';
  return 'border-white/15 bg-white/5 text-slate-200';
};

const formatLocalDate = (value?: string, includeWeekday = true) => {
  if (!value) return 'Tarih güncelleniyor';

  return new Date(value).toLocaleString('tr-TR', {
    weekday: includeWeekday ? 'long' : undefined,
    day: '2-digit',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Istanbul',
  });
};

const fixtureDateLabel = (value: string) =>
  new Date(value).toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: 'short',
    weekday: 'short',
    timeZone: 'Europe/Istanbul',
  });

const buildHeadline = (snapshot?: LiveMatchSnapshot) => {
  const match = snapshot?.currentMatch;
  if (!match) {
    return 'Fenerbahçe için güncel maç verileri yükleniyor.';
  }

  if (match.statusState === 'post' && match.homeScore != null && match.awayScore != null) {
    return `${match.homeTeam} - ${match.awayTeam} maçının sonucu: ${match.homeScore}-${match.awayScore}. İlk 11, olay akışı, lider oyuncular ve puan tablosu etkisi aşağıda.`;
  }

  if (match.statusState === 'in') {
    return `${match.homeTeam} - ${match.awayTeam} karşılaşması canlı durumda. Skor, istatistikler, oyuncu liderleri ve maç olayları otomatik güncelleniyor.`;
  }

  return `${match.homeTeam} - ${match.awayTeam} maçı öncesi tüm kritik bilgiler tek ekranda: saat, stat, form durumu, puan tablosu bağlamı ve ilk 11 açıklandığında kadrolar.`;
};

const scorelineLabel = (match?: LiveMatchSnapshot['currentMatch']) => {
  if (!match) return 'VS';
  if (match.homeScore == null || match.awayScore == null) return 'VS';
  return `${match.homeScore} - ${match.awayScore}`;
};

const chunkLineup = (players: LineupPlayer[]) => {
  if (players.length === 0) return [] as LineupPlayer[][];
  if (players.length === 11) {
    return [players.slice(0, 1), players.slice(1, 5), players.slice(5, 8), players.slice(8, 11)];
  }
  if (players.length === 10) {
    return [players.slice(0, 1), players.slice(1, 4), players.slice(4, 7), players.slice(7, 10)];
  }
  if (players.length === 9) {
    return [players.slice(0, 1), players.slice(1, 4), players.slice(4, 6), players.slice(6, 9)];
  }

  const rows: LineupPlayer[][] = [];
  const firstRow = players.slice(0, 1);
  const remaining = players.slice(1);
  const rowCount = Math.min(4, Math.max(2, Math.ceil(remaining.length / 3)));
  const rowSize = Math.ceil(remaining.length / rowCount);
  rows.push(firstRow);

  for (let index = 0; index < remaining.length; index += rowSize) {
    rows.push(remaining.slice(index, index + rowSize));
  }

  return rows;
};

const TeamLineupCard: React.FC<{
  title: string;
  lineup?: TeamLineup;
}> = ({ title, lineup }) => {
  const starters = lineup?.starters ?? [];
  const rows = chunkLineup(starters);

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h4 className="inline-flex items-center gap-2 text-lg font-black text-white">
          <Users size={18} /> {title}
        </h4>
        {lineup?.formation ? (
          <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[10px] font-black tracking-[0.16em] text-slate-300">
            DİZİLİŞ {lineup.formation}
          </span>
        ) : null}
      </div>

      {starters.length > 0 ? (
        <div className="relative overflow-hidden rounded-[2rem] border border-emerald-400/20 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.2),_rgba(3,7,18,0.95)_58%)] p-5">
          <div className="pointer-events-none absolute inset-4 rounded-[1.5rem] border border-white/10" />
          <div className="pointer-events-none absolute inset-x-[18%] top-4 h-[18%] rounded-b-[999px] border border-white/10 border-t-0" />
          <div className="pointer-events-none absolute inset-x-[18%] bottom-4 h-[18%] rounded-t-[999px] border border-white/10 border-b-0" />
          <div className="pointer-events-none absolute left-1/2 top-4 bottom-4 w-px -translate-x-1/2 bg-white/10" />
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/15" />

          <div className="relative z-10 flex min-h-[520px] flex-col justify-between gap-6 py-3">
            {rows.map((row, rowIndex) => (
              <div key={`${title}-row-${rowIndex}`} className="flex items-center justify-center gap-3 md:gap-5">
                {row.map((player, index) => (
                  <div
                    key={`${title}-${player.name}-${index}`}
                    className="w-[88px] rounded-2xl border border-white/15 bg-fb-navy/70 px-2 py-3 text-center shadow-[0_8px_24px_rgba(2,6,23,0.35)] backdrop-blur"
                  >
                    <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-fb-yellow text-sm font-black text-fb-navy">
                      {player.jersey || rowIndex + index + 1}
                    </div>
                    <p className="text-[11px] font-black leading-tight text-white">{player.name}</p>
                    {player.position ? <p className="mt-1 text-[10px] tracking-[0.14em] text-slate-300">{player.position}</p> : null}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-white/15 bg-fb-navy/40 p-4 text-sm text-slate-300">
          İlk 11 henüz açıklanmadı. Kadrolar yayınlandığında bu alan otomatik güncellenecek.
        </div>
      )}
    </div>
  );
};

const MatchStatCard: React.FC<{ stat: MatchStatItem; homeTeam?: string; awayTeam?: string }> = ({ stat, homeTeam, awayTeam }) => (
  <div className="rounded-2xl border border-white/10 bg-fb-navy/55 p-4">
    <p className="text-[10px] font-black tracking-[0.16em] text-slate-400">{stat.label}</p>
    <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
      <div>
        <p className="text-xs text-slate-400">{homeTeam || 'Ev Sahibi'}</p>
        <p className="text-2xl font-black text-white">{stat.homeValue}</p>
      </div>
      <span className="text-xs font-black tracking-[0.16em] text-slate-500">VS</span>
      <div className="text-right">
        <p className="text-xs text-slate-400">{awayTeam || 'Deplasman'}</p>
        <p className="text-2xl font-black text-white">{stat.awayValue}</p>
      </div>
    </div>
  </div>
);

const MatchEventCard: React.FC<{ event: MatchEventItem }> = ({ event }) => (
  <div className="rounded-2xl border border-white/10 bg-fb-navy/55 p-4">
    <div className="mb-2 flex items-center justify-between gap-3">
      <span className="text-lg font-black text-fb-yellow">{event.minute}</span>
      <span className={`rounded-full border px-2.5 py-1 text-[10px] font-black tracking-[0.16em] ${eventTone(event.type)}`}>
        {event.type}
      </span>
    </div>
    <p className="text-sm font-bold text-white">{event.team || 'Maç Merkezi'}</p>
    <p className="mt-1 text-sm text-slate-300">{event.text}</p>
  </div>
);

const FixtureCard: React.FC<{ item: LiveFixtureItem }> = ({ item }) => {
  const hasScore = item.homeScore != null && item.awayScore != null;

  return (
    <div className="rounded-2xl border border-white/10 bg-fb-navy/60 p-4">
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="text-xs text-slate-400">{fixtureDateLabel(item.date)} · {item.competition}</p>
        <span className="rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[10px] font-black tracking-[0.14em] text-slate-300">
          {item.status}
        </span>
      </div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-bold text-white">{item.home}</p>
          <p className="font-bold text-white">{item.away}</p>
        </div>
        <div className="text-right">
          <p className="text-xl font-black text-fb-yellow">{hasScore ? `${item.homeScore}-${item.awayScore}` : 'VS'}</p>
          {item.note ? <p className="text-xs text-slate-400">{item.note}</p> : null}
        </div>
      </div>
    </div>
  );
};

const LeaderCard: React.FC<{ leader: PlayerLeaderItem }> = ({ leader }) => (
  <div className="rounded-2xl border border-white/10 bg-fb-navy/55 p-4">
    <p className="text-[10px] font-black tracking-[0.16em] text-slate-400">{leader.label}</p>
    <div className="mt-3 space-y-3">
      {leader.players.map((player, index) => (
        <div key={`${leader.key}-${player.name}-${index}`} className="rounded-2xl border border-white/10 bg-white/5 p-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-bold text-white">{player.name}</p>
              <p className="text-xs text-slate-400">{player.team}</p>
            </div>
            <span className="text-lg font-black text-fb-yellow">{player.value}</span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const MatchCenter: React.FC<{ onNavigate?: (view: 'home' | 'universe' | 'match-center' | 'news') => void }> = ({
  onNavigate,
}) => {
  const [snapshot, setSnapshot] = useState<LiveMatchSnapshot | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const targetMs = useRef(Date.now());
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => calcTimeLeft(targetMs.current));

  useEffect(() => {
    let mounted = true;

    const loadData = async (showLoader = false) => {
      if (showLoader && mounted) {
        setIsLoading(true);
      }

      try {
        const liveSnapshot = await fetchLiveFenerbahceSchedule();
        if (!mounted) return;
        setSnapshot(liveSnapshot);
        setHasError(false);
        if (liveSnapshot.currentMatch?.date) {
          targetMs.current = new Date(liveSnapshot.currentMatch.date).getTime();
          setTimeLeft(calcTimeLeft(targetMs.current));
        }
      } catch {
        if (!mounted) return;
        setHasError(true);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    loadData(true);
    const refreshId = setInterval(() => void loadData(false), 60_000);

    return () => {
      mounted = false;
      clearInterval(refreshId);
    };
  }, []);

  useEffect(() => {
    const id = setInterval(() => setTimeLeft(calcTimeLeft(targetMs.current)), 1000);
    return () => clearInterval(id);
  }, []);

  const currentMatch = snapshot?.currentMatch;
  const headline = useMemo(() => buildHeadline(snapshot ?? undefined), [snapshot]);
  const updatedDate = useMemo(
    () => (snapshot?.updatedAt ? new Date(snapshot.updatedAt).toLocaleString('tr-TR', { dateStyle: 'medium', timeStyle: 'short' }) : 'Güncelleniyor'),
    [snapshot?.updatedAt],
  );

  const summaryCards = useMemo(() => {
    if (!currentMatch) return [];

    return [
      {
        label: 'Durum',
        value: currentMatch.statusText,
      },
      {
        label: 'Organizasyon',
        value: currentMatch.competition,
      },
      {
        label: 'Stat',
        value: currentMatch.venue || 'Stat bilgisi bekleniyor',
      },
      {
        label: 'Form',
        value: `${currentMatch.homeTeam}: ${currentMatch.formHome || '-'} | ${currentMatch.awayTeam}: ${currentMatch.formAway || '-'}`,
      },
    ];
  }, [currentMatch]);

  return (
    <section id="match-center" className="relative overflow-hidden py-16 md:py-24">
      <div className="container mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <p className="mb-2 text-xs font-black tracking-[0.25em] text-fb-yellow">MAÇ GÜNÜ · CANLI VERİ KATMANI</p>
          <h2
            className="text-4xl font-black uppercase italic tracking-tighter text-white md:text-5xl"
            style={{ fontFamily: "'Barlow Condensed', 'Arial Narrow', Arial, sans-serif" }}
          >
            MAÇ MERKEZİ
          </h2>
          <p className="mt-3 max-w-4xl text-slate-300">{headline}</p>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-400">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
              <RefreshCcw size={14} /> Son güncelleme: {updatedDate}
            </span>
            <span className={`rounded-full border px-3 py-1.5 font-black tracking-[0.14em] ${statusTone[currentMatch?.statusState || 'pre']}`}>
              {currentMatch?.statusState === 'in' ? 'CANLI' : currentMatch?.statusText || 'GÜNCELLENİYOR'}
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">Tamamen Türkçe canlı veri akışı</span>
          </div>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-7 backdrop-blur">
            <div className="mb-5 flex flex-wrap items-center gap-3 text-xs text-slate-300">
              <span className="rounded-full border border-fb-yellow/40 bg-fb-yellow/10 px-3 py-1 font-bold text-fb-yellow">
                {currentMatch?.competition || 'Süper Lig'}
              </span>
              <span className="inline-flex items-center gap-2">
                <Calendar size={14} /> {formatLocalDate(currentMatch?.date)}
              </span>
              <span className="inline-flex items-center gap-2">
                <MapPin size={14} /> {currentMatch?.venue || 'Stat bilgisi güncelleniyor'}
              </span>
              <span className="rounded-full border border-white/20 bg-white/5 px-3 py-1 text-[10px] font-black tracking-[0.15em] text-slate-300">
                TSİ
              </span>
            </div>

            <div className="mb-6 grid items-center gap-4 text-center md:grid-cols-[1fr_auto_1fr]">
              <div>
                {currentMatch?.homeLogo ? (
                  <img src={currentMatch.homeLogo} alt={currentMatch.homeTeam} className="mx-auto mb-2 h-20 w-20 object-contain" />
                ) : null}
                <p className="text-2xl font-black italic text-white">{currentMatch?.homeTeam || 'Fenerbahçe'}</p>
                <p className="mt-1 text-xs text-slate-400">Genel derece: {currentMatch?.homeRecord || '-'}</p>
              </div>
              <div>
                <div className="text-4xl font-black italic text-fb-yellow">{scorelineLabel(currentMatch)}</div>
                <p className="mt-2 text-xs font-black tracking-[0.16em] text-slate-400">{currentMatch?.statusText || 'GÜNCELLENİYOR'}</p>
              </div>
              <div>
                {currentMatch?.awayLogo ? (
                  <img src={currentMatch.awayLogo} alt={currentMatch.awayTeam} className="mx-auto mb-2 h-20 w-20 object-contain" />
                ) : null}
                <p className="text-2xl font-black italic text-white">{currentMatch?.awayTeam || 'Rakip'}</p>
                <p className="mt-1 text-xs text-slate-400">Genel derece: {currentMatch?.awayRecord || '-'}</p>
              </div>
            </div>

            {currentMatch?.statusState === 'pre' ? (
              <div className="grid grid-cols-2 gap-3 rounded-2xl border border-white/10 bg-fb-navy/60 p-4 text-center md:grid-cols-4">
                {[
                  ['GÜN', timeLeft.days],
                  ['SAAT', timeLeft.hours],
                  ['DAKİKA', timeLeft.minutes],
                  ['SANİYE', timeLeft.seconds],
                ].map(([label, value]) => (
                  <div key={label as string}>
                    <div className="text-3xl font-black text-white">{String(value).padStart(2, '0')}</div>
                    <div className="text-[10px] font-black tracking-[0.18em] text-slate-400">{label}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-white/10 bg-fb-navy/60 p-4">
                <div className="grid gap-3 md:grid-cols-3">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-[10px] font-black tracking-[0.16em] text-slate-400">MAÇ DURUMU</p>
                    <p className="mt-2 text-xl font-black text-white">{currentMatch?.statusText || 'Güncelleniyor'}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-[10px] font-black tracking-[0.16em] text-slate-400">SKOR</p>
                    <p className="mt-2 text-xl font-black text-white">{scorelineLabel(currentMatch)}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-[10px] font-black tracking-[0.16em] text-slate-400">GÜNCELLEME</p>
                    <p className="mt-2 text-xl font-black text-white">{updatedDate}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {summaryCards.map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-[10px] font-black tracking-[0.16em] text-slate-400">{item.label}</p>
                  <p className="mt-2 text-sm leading-relaxed text-white">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-7">
            <div className="mb-4 flex items-center gap-2 text-fb-yellow">
              <Clock3 size={16} />
              <span className="text-xs font-black tracking-[0.2em]">FENERBAHÇE FİKSTÜR AKIŞI</span>
            </div>
            <div className="space-y-3">
              {(snapshot?.fixtures || []).map((item) => (
                <FixtureCard key={item.id} item={item} />
              ))}
              {!snapshot?.fixtures?.length ? (
                <div className="rounded-2xl border border-dashed border-white/15 bg-fb-navy/40 p-4 text-sm text-slate-300">
                  Fikstür akışı yükleniyor.
                </div>
              ) : null}
            </div>
            <button
              onClick={() => onNavigate?.('match-center')}
              className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-slate-300 transition hover:text-fb-yellow"
            >
              Detaylı maç sayfasına git
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1fr]">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="mb-4 flex items-center gap-2">
              <Trophy size={18} className="text-fb-yellow" />
              <h4 className="text-lg font-black text-white">Temel İstatistikler</h4>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {(snapshot?.stats || []).map((stat) => (
                <MatchStatCard
                  key={stat.key}
                  stat={stat}
                  homeTeam={currentMatch?.homeTeam}
                  awayTeam={currentMatch?.awayTeam}
                />
              ))}
              {!snapshot?.stats?.length ? (
                <div className="rounded-2xl border border-dashed border-white/15 bg-fb-navy/40 p-4 text-sm text-slate-300 md:col-span-2">
                  Maç istatistikleri henüz oluşmadı. Karşılaşma başladığında bu alan otomatik güncellenecek.
                </div>
              ) : null}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="mb-4 flex items-center gap-2">
              <Radio size={18} className="text-fb-yellow" />
              <h4 className="text-lg font-black text-white">Maç Olayları</h4>
            </div>
            <div className="space-y-3">
              {(snapshot?.events || []).map((event) => (
                <MatchEventCard key={event.id} event={event} />
              ))}
              {!snapshot?.events?.length ? (
                <div className="rounded-2xl border border-dashed border-white/15 bg-fb-navy/40 p-4 text-sm text-slate-300">
                  Olay akışı henüz oluşmadı. Maç başladığında gol, kart ve oyuncu değişiklikleri burada görünecek.
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1fr]">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="mb-4 flex items-center gap-2">
              <Sparkles size={18} className="text-fb-yellow" />
              <h4 className="text-lg font-black text-white">Oyuncu Liderleri</h4>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {(snapshot?.leaders || []).map((leader) => (
                <LeaderCard key={leader.key} leader={leader} />
              ))}
              {!snapshot?.leaders?.length ? (
                <div className="rounded-2xl border border-dashed border-white/15 bg-fb-navy/40 p-4 text-sm text-slate-300 md:col-span-2">
                  Oyuncu liderleri henüz yayınlanmadı. Maç akışı oluştuğunda bu alan otomatik güncellenecek.
                </div>
              ) : null}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="mb-4 flex items-center gap-2">
              <Trophy size={18} className="text-fb-yellow" />
              <h4 className="text-lg font-black text-white">Puan Durumu Etkisi</h4>
            </div>
            {snapshot?.standingsImpact ? (
              <>
                <p className="rounded-2xl border border-white/10 bg-fb-navy/55 p-4 text-sm leading-relaxed text-slate-200">
                  {snapshot.standingsImpact.summary}
                </p>
                <div className="mt-4 space-y-3">
                  {snapshot.standingsImpact.table.map((entry) => (
                    <div key={`${entry.rank}-${entry.team}`} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-black text-white">{entry.rank}. {entry.team}</p>
                          <p className="text-xs text-slate-400">Oynanan maç: {entry.played}{entry.goalDiff ? ` · Averaj: ${entry.goalDiff}` : ''}</p>
                        </div>
                        <span className="text-2xl font-black text-fb-yellow">{entry.points}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="rounded-2xl border border-dashed border-white/15 bg-fb-navy/40 p-4 text-sm text-slate-300">
                Puan tablosu bağlamı henüz yüklenmedi.
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <TeamLineupCard title={`İlk 11 · ${currentMatch?.homeTeam || 'Fenerbahçe'}`} lineup={snapshot?.lineups?.home} />
          <TeamLineupCard title={`İlk 11 · ${currentMatch?.awayTeam || 'Rakip'}`} lineup={snapshot?.lineups?.away} />
        </div>

        {hasError ? (
          <div className="mt-6 rounded-3xl border border-rose-400/30 bg-rose-400/10 p-4 text-sm text-rose-200">
            Canlı veri akışında geçici bir hata oluştu. Sayfayı yenilediğinde veya birkaç saniye sonra yeniden denendiğinde veriler geri gelecektir.
          </div>
        ) : null}
      </div>
    </section>
  );
};

export default MatchCenter;
