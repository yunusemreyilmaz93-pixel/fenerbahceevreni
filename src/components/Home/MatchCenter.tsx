import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import {
  AlertTriangle,
  Calendar,
  ChevronRight,
  Clock3,
  ExternalLink,
  MapPin,
  ShieldAlert,
  Users,
} from 'lucide-react';
import { MATCH_CENTER_DATA, type SquadNote } from '../../constants/homeData';
import { fetchLiveFenerbahceSchedule, type LiveFixtureItem } from '../../lib/matchService';

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

const statusColor: Record<SquadNote['status'], string> = {
  OUT: 'bg-rose-500/15 text-rose-300 border-rose-500/40',
  ŞÜPHELİ: 'bg-amber-500/15 text-amber-300 border-amber-500/40',
  SINIRDA: 'bg-sky-500/15 text-sky-300 border-sky-500/40',
};

const statusLabel: Record<SquadNote['status'], string> = {
  OUT: 'YOK',
  ŞÜPHELİ: 'ŞÜPHELİ',
  SINIRDA: 'SINIRDA',
};

const TeamAvailability: React.FC<{ title: string; notes: SquadNote[] }> = ({ title, notes }) => (
  <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
    <h4 className="mb-4 text-lg font-black tracking-tight text-white">{title}</h4>
    <div className="space-y-3">
      {notes.map((note) => (
        <div key={`${title}-${note.player}`} className="rounded-2xl border border-white/10 bg-fb-navy/60 p-4">
          <div className="mb-2 flex items-center justify-between gap-3">
            <strong className="text-white">{note.player}</strong>
            <span className={`rounded-full border px-2.5 py-1 text-[10px] font-black tracking-wide ${statusColor[note.status]}`}>
              {statusLabel[note.status]}
            </span>
          </div>
          <p className="text-sm text-slate-300">{note.reason}</p>
          <p className="mt-1 text-xs text-slate-400">{note.detail}</p>
        </div>
      ))}
    </div>
  </div>
);

const MatchCenter: React.FC<{ onNavigate?: (view: 'home' | 'universe' | 'match-center' | 'news') => void }> = ({
  onNavigate,
}) => {
  const [nextMatchDate, setNextMatchDate] = useState(MATCH_CENTER_DATA.date);
  const [liveFixtures, setLiveFixtures] = useState<LiveFixtureItem[]>(MATCH_CENTER_DATA.fixtureFocus);
  const [isLiveLoading, setIsLiveLoading] = useState(true);
  const targetMs = useRef(new Date(nextMatchDate).getTime());
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => calcTimeLeft(targetMs.current));

  useEffect(() => {
    targetMs.current = new Date(nextMatchDate).getTime();
    setTimeLeft(calcTimeLeft(targetMs.current));
  }, [nextMatchDate]);

  useEffect(() => {
    let mounted = true;
    fetchLiveFenerbahceSchedule()
      .then((snapshot) => {
        if (!mounted) return;
        if (snapshot.nextMatch?.date) {
          setNextMatchDate(snapshot.nextMatch.date);
        }
        if (snapshot.fixtures.length > 0) {
          setLiveFixtures(snapshot.fixtures);
        }
      })
      .catch(() => {
        // fallback uses static constants
      })
      .finally(() => {
        if (mounted) setIsLiveLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const id = setInterval(() => setTimeLeft(calcTimeLeft(targetMs.current)), 1000);
    return () => clearInterval(id);
  }, []);

  const localDate = useMemo(
    () => new Date(nextMatchDate).toLocaleString('tr-TR', { dateStyle: 'full', timeStyle: 'short' }),
    [nextMatchDate],
  );

  const updatedDate = useMemo(
    () => new Date(MATCH_CENTER_DATA.updatedAt).toLocaleString('tr-TR', { dateStyle: 'medium', timeStyle: 'short' }),
    [],
  );

  return (
    <section className="relative overflow-hidden py-16 md:py-24">
      <div className="container mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <p className="mb-2 text-xs font-black tracking-[0.25em] text-fb-yellow">SIRADAKİ MAÇ · CANLI DOSYA</p>
          <h2
            className="text-4xl font-black uppercase italic tracking-tighter text-white md:text-5xl"
            style={{ fontFamily: "'Barlow Condensed', 'Arial Narrow', Arial, sans-serif" }}
          >
            MAÇ MERKEZİ
          </h2>
          <p className="mt-3 max-w-4xl text-slate-300">{MATCH_CENTER_DATA.summary}</p>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-7 backdrop-blur">
            <div className="mb-5 flex flex-wrap items-center gap-3 text-xs text-slate-300">
              <span className="rounded-full border border-fb-yellow/40 bg-fb-yellow/10 px-3 py-1 font-bold text-fb-yellow">
                {MATCH_CENTER_DATA.competition}
              </span>
              <span className="inline-flex items-center gap-2">
                <Calendar size={14} /> {localDate}
              </span>
              <span className="inline-flex items-center gap-2">
                <MapPin size={14} /> {MATCH_CENTER_DATA.venue}
              </span>
              <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-[10px] font-black tracking-[0.15em] text-emerald-300">
                {isLiveLoading ? 'CANLI API BAĞLANIYOR' : 'CANLI API AKTİF'}
              </span>
            </div>

            <div className="mb-6 grid items-center gap-4 text-center md:grid-cols-[1fr_auto_1fr]">
              <div>
                <img src={MATCH_CENTER_DATA.homeLogo} alt={MATCH_CENTER_DATA.homeTeam} className="mx-auto mb-2 h-20 w-20 object-contain" />
                <p className="text-2xl font-black italic text-white">{MATCH_CENTER_DATA.homeTeam}</p>
                <p className="mt-1 text-xs text-slate-400">{MATCH_CENTER_DATA.scoreboardContext.fenerbahce}</p>
              </div>
              <div className="text-4xl font-black italic text-fb-yellow">VS</div>
              <div>
                <img src={MATCH_CENTER_DATA.awayLogo} alt={MATCH_CENTER_DATA.awayTeam} className="mx-auto mb-2 h-20 w-20 object-contain" />
                <p className="text-2xl font-black italic text-white">{MATCH_CENTER_DATA.awayTeam}</p>
                <p className="mt-1 text-xs text-slate-400">{MATCH_CENTER_DATA.scoreboardContext.rizespor}</p>
              </div>
            </div>

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

            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {MATCH_CENTER_DATA.keyInsights.map((item) => (
                <div key={item} className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-slate-300">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-7">
            <div className="mb-4 flex items-center gap-2 text-fb-yellow">
              <Clock3 size={16} />
              <span className="text-xs font-black tracking-[0.2em]">2025-2026 SÜPER LİG KALAN FİKSTÜR</span>
            </div>
            <div className="space-y-2">
              {liveFixtures.map((item) => {
                const matchDate = new Date(item.date).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' });
                return (
                  <div key={`${item.date}-${item.home}`} className="rounded-xl border border-white/10 bg-fb-navy/60 p-3">
                    <p className="text-xs text-slate-400">{matchDate} · {item.competition}</p>
                    <p className="font-bold text-white">{item.home} - {item.away}</p>
                    {item.note && <p className="text-xs text-fb-yellow">{item.note}</p>}
                  </div>
                );
              })}
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

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <TeamAvailability title="Fenerbahçe · Sakat/Ceza Durumu" notes={MATCH_CENTER_DATA.fenerbahceAvailability} />
          <TeamAvailability title="Çaykur Rizespor · Sakat/Ceza Durumu" notes={MATCH_CENTER_DATA.rizesporAvailability} />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h4 className="mb-4 inline-flex items-center gap-2 text-lg font-black text-white"><Users size={18} /> Muhtemel 11 · Fenerbahçe</h4>
            <ol className="grid gap-2 text-sm text-slate-200 md:grid-cols-2">
              {MATCH_CENTER_DATA.predictedLineups.fenerbahce.map((player, index) => (
                <li key={player} className="rounded-xl border border-white/10 bg-fb-navy/60 px-3 py-2">
                  <span className="mr-2 text-fb-yellow">{index + 1}.</span>
                  {player}
                </li>
              ))}
            </ol>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h4 className="mb-4 inline-flex items-center gap-2 text-lg font-black text-white"><Users size={18} /> Muhtemel 11 · Ç. Rizespor</h4>
            <ol className="grid gap-2 text-sm text-slate-200 md:grid-cols-2">
              {MATCH_CENTER_DATA.predictedLineups.rizespor.map((player, index) => (
                <li key={player} className="rounded-xl border border-white/10 bg-fb-navy/60 px-3 py-2">
                  <span className="mr-2 text-fb-yellow">{index + 1}.</span>
                  {player}
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <ShieldAlert size={18} className="text-fb-yellow" />
            <h4 className="text-lg font-black text-white">Veri Notu ve Kaynaklar</h4>
          </div>
          <p className="mb-3 text-sm text-slate-300">
            Son veri güncellemesi: <strong>{updatedDate}</strong>. Bu sayfa canlı bahis/medya akışına göre değil,
            derlenmiş maç önü bilgi ekranı olarak tasarlanmıştır. Son resmi kadrolar maç gününde kulüp hesaplarından teyit edilmelidir.
          </p>
          <ul className="space-y-2 text-sm text-slate-300">
            {MATCH_CENTER_DATA.sources.map((source) => (
              <li key={source.url}>
                <a href={source.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:text-fb-yellow">
                  <ExternalLink size={14} />
                  {source.label}
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-3 inline-flex items-center gap-2 text-xs text-amber-300">
            <AlertTriangle size={14} />
            Muhtemel 11 ve kart/sakatlık değerlendirmesi editöryel tahmindir; resmi maç kadrosu değildir.
          </p>
        </div>
      </div>
    </section>
  );
};

export default MatchCenter;
