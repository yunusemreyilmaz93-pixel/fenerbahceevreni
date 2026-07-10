import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
  Activity,
  ArrowRight,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  MessageSquare,
  Sparkles,
  Vote,
} from 'lucide-react';
import { castPollVote, dbGetCollection } from '../../lib/dbService';
import { ensureAnonymousUser } from '../../lib/firebase';
import { getTeamLogoPath } from '../../lib/teamLogos';
import { DataBadge, EmptyState, XGCompare } from '../ui';

interface TodayPulseProps {
  onNavigate: (view: string) => void;
  articles?: any[];
}

const dateFmt = new Intl.DateTimeFormat('tr-TR', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
});

function formatWhen(iso?: string) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return dateFmt.format(d);
}

function pickPulseMatch(list: any[]) {
  if (!Array.isArray(list) || list.length === 0) return null;
  return (
    list.find((m) => m.featured) ||
    list.find((m) => m.status === 'live') ||
    list.find((m) => m.status === 'upcoming') ||
    list.find((m) => m.status === 'finished' || m.status === 'completed') ||
    list[0]
  );
}

function normalizePollOptions(poll: any): { id: string; label: string; votes: number }[] {
  if (!poll) return [];
  const raw = poll.options;
  if (!Array.isArray(raw)) return [];
  return raw.map((o: any, i: number) => {
    if (typeof o === 'string') {
      const votes =
        typeof poll.votes === 'object' && poll.votes
          ? Number(poll.votes[o] || 0)
          : 0;
      return { id: o, label: o, votes };
    }
    const id = String(o.id || o.label || o.text || `opt-${i}`);
    const label = String(o.label || o.text || o.id || id);
    const votes = Number(o.votes ?? 0);
    return { id, label, votes };
  });
}

/**
 * D2 — Bugünün nabzı: 1 maç + 1 analiz + 1 anket.
 * World-class: tek bakışta “bugün ne var?”, kaynak etiketi, sahte veri yok.
 */
const TodayPulse: React.FC<TodayPulseProps> = ({ onNavigate, articles = [] }) => {
  const [match, setMatch] = useState<any | null>(null);
  const [poll, setPoll] = useState<any | null>(null);
  const [votedOptionId, setVotedOptionId] = useState<string | null>(null);
  const [voteError, setVoteError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const featuredArticle = useMemo(() => {
    const published = (articles || []).filter(
      (a) => a.status === 'published' || a.status === 'active' || !a.status
    );
    const featured = published.find((a) => a.featured);
    return featured || published[0] || null;
  }, [articles]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [matches, polls] = await Promise.all([
          dbGetCollection('matches'),
          dbGetCollection('polls'),
        ]);
        if (cancelled) return;
        setMatch(pickPulseMatch(matches));
        const active =
          (polls || []).find((p: any) => p.status === 'active') || (polls || [])[0] || null;
        setPoll(active);
      } catch (e) {
        console.warn('TodayPulse load failed', e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const pollOptions = useMemo(() => normalizePollOptions(poll), [poll]);
  const totalVotes = useMemo(() => {
    if (poll?.totalVotes != null) return Number(poll.totalVotes) || 0;
    return pollOptions.reduce((s, o) => s + (o.votes || 0), 0);
  }, [poll, pollOptions]);

  const handleVote = async (optionId: string) => {
    if (!poll?.id || votedOptionId) return;
    setVoteError(null);
    try {
      const user = await ensureAnonymousUser();
      await castPollVote(poll.id, optionId, user.uid);
      setVotedOptionId(optionId);
      setPoll((prev: any) => {
        if (!prev) return prev;
        const options = Array.isArray(prev.options)
          ? prev.options.map((o: any) => {
              if (typeof o === 'string') return o;
              if ((o.id || o.label) === optionId) {
                return { ...o, votes: (o.votes || 0) + 1 };
              }
              return o;
            })
          : prev.options;
        return {
          ...prev,
          options,
          totalVotes: (prev.totalVotes || totalVotes || 0) + 1,
        };
      });
    } catch (err: any) {
      const msg = String(err?.message || err || '');
      if (msg.includes('daha önce')) {
        setVotedOptionId(optionId);
      } else {
        setVoteError('Oy kaydedilemedi. Biraz sonra tekrar dene.');
      }
    }
  };

  const isFinished =
    match?.status === 'finished' || match?.status === 'completed';
  const isLive = match?.status === 'live';
  const homeLogo =
    match?.homeLogo || getTeamLogoPath(match?.homeTeam || '') || '/logos/fenerbahce.png';
  const awayLogo =
    match?.awayLogo || getTeamLogoPath(match?.awayTeam || '') || '';

  const todayLabel = new Intl.DateTimeFormat('tr-TR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date());

  return (
    <section
      id="bugunun-nabzi"
      aria-label="Bugünün nabzı"
      className="relative py-14 md:py-18 border-y border-white/[0.05]"
    >
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 left-1/4 w-[420px] h-[420px] bg-fb-yellow/[0.045] rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[360px] h-[360px] bg-[#002F6C]/22 rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-fb-yellow" aria-hidden />
              <span className="text-[11px] font-semibold tracking-wide text-fb-yellow">
                Bugünün nabzı
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-display font-bold text-white tracking-tight">
              Tek bakışta camia
            </h2>
            <p className="mt-1.5 text-[13px] text-slate-400 font-medium capitalize">{todayLabel}</p>
          </div>
          <p className="text-[12px] text-slate-500 max-w-xs leading-relaxed hidden md:block">
            Maç · analiz · anket — uydurma skor yok, kaynak etiketi var.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="lg:col-span-4 h-64 rounded-2xl ui-surface animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-5 items-stretch">
            {/* ── 1. MAÇ ─────────────────────────────────────────── */}
            <motion.article
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45 }}
              className="lg:col-span-4 ui-surface ui-surface-hover rounded-2xl p-5 md:p-6 flex flex-col relative overflow-hidden"
            >
              <div className="absolute top-0 inset-x-0 h-px ui-hairline opacity-60" />
              <div className="flex items-center justify-between gap-2 mb-5">
                <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-slate-400">
                  <Activity className="w-3.5 h-3.5 text-fb-yellow" aria-hidden />
                  Maç
                </span>
                {match && (
                  <span
                    className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border ${
                      isLive
                        ? 'bg-red-500/10 border-red-500/25 text-red-400'
                        : isFinished
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                          : 'bg-fb-yellow/10 border-fb-yellow/25 text-fb-yellow'
                    }`}
                  >
                    {isLive ? 'Canlı' : isFinished ? 'Maç sonu' : 'Yaklaşan'}
                  </span>
                )}
              </div>

              {!match ? (
                <EmptyState
                  icon={Calendar}
                  title="Öne çıkan maç yok"
                  description="Fikstür veya featured maç eklendiğinde burada nabız atar."
                  action={{ label: 'Maç Merkezi', onClick: () => onNavigate('match-center') }}
                />
              ) : (
                <>
                  <p className="text-[12px] text-slate-500 font-medium mb-4">
                    {match.competition || 'Süper Lig'} · {formatWhen(match.matchDate)}
                  </p>

                  <div className="flex items-center justify-between gap-3 mb-5">
                    <div className="flex-1 text-center space-y-2 min-w-0">
                      <img
                        src={homeLogo}
                        alt=""
                        className="w-11 h-11 mx-auto object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      <p className="text-[12px] font-bold text-white truncate leading-tight">
                        {match.homeTeam}
                      </p>
                    </div>
                    <div className="shrink-0 px-2 text-center">
                      {isFinished || isLive ? (
                        <p className="text-2xl md:text-3xl font-mono font-bold text-fb-yellow tabular-nums">
                          {match.scoreHome ?? '—'}
                          <span className="text-slate-500 mx-1">–</span>
                          {match.scoreAway ?? '—'}
                        </p>
                      ) : (
                        <p className="text-sm font-semibold text-slate-400 tracking-wide">vs</p>
                      )}
                    </div>
                    <div className="flex-1 text-center space-y-2 min-w-0">
                      {awayLogo ? (
                        <img
                          src={awayLogo}
                          alt=""
                          className="w-11 h-11 mx-auto object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/logos/super-lig.png';
                          }}
                        />
                      ) : (
                        <div className="w-11 h-11 mx-auto rounded-xl bg-white/5 border border-white/10" />
                      )}
                      <p className="text-[12px] font-bold text-white truncate leading-tight">
                        {match.awayTeam}
                      </p>
                    </div>
                  </div>

                  {(match.xGHome != null || match.xGAway != null) && (
                    <div className="mb-4">
                      <XGCompare
                        home={match.xGHome}
                        away={match.xGAway}
                        homeLabel={match.homeTeam}
                        awayLabel={match.awayTeam}
                      />
                    </div>
                  )}

                  <div className="mt-auto pt-3 flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.06]">
                    <DataBadge
                      provider={match.statsProvider}
                      fetchedAt={match.statsFetchedAt}
                      showMissing={!match.statsProvider}
                    />
                    <button
                      type="button"
                      onClick={() => onNavigate('match-center')}
                      className="inline-flex items-center gap-1 text-[12px] font-semibold text-fb-yellow hover:text-white transition-colors cursor-pointer"
                    >
                      Maç merkezi <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </>
              )}
            </motion.article>

            {/* ── 2. ANALİZ ───────────────────────────────────────── */}
            <motion.article
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: 0.06 }}
              className="lg:col-span-4 ui-surface ui-surface-hover rounded-2xl p-5 md:p-6 flex flex-col relative overflow-hidden"
            >
              <div className="absolute top-0 inset-x-0 h-px ui-hairline opacity-60" />
              <div className="flex items-center justify-between gap-2 mb-5">
                <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-slate-400">
                  <BookOpen className="w-3.5 h-3.5 text-fb-yellow" aria-hidden />
                  Analiz
                </span>
              </div>

              {!featuredArticle ? (
                <EmptyState
                  icon={BookOpen}
                  title="Yayında analiz yok"
                  description="Editoryal içerik yayınlandığında burada öne çıkar."
                  action={{ label: 'Analizler', onClick: () => onNavigate('analysis') }}
                />
              ) : (
                <>
                  {featuredArticle.coverImage ? (
                    <div className="relative mb-4 rounded-xl overflow-hidden aspect-[16/9] bg-[#0B0F19] border border-white/[0.05]">
                      <img
                        src={featuredArticle.coverImage}
                        alt=""
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#111625] via-transparent to-transparent" />
                    </div>
                  ) : (
                    <div className="mb-4 h-28 rounded-xl bg-gradient-to-br from-fb-navy/40 to-fb-yellow/5 border border-white/[0.05] flex items-center justify-center">
                      <BookOpen className="w-8 h-8 text-fb-yellow/40" aria-hidden />
                    </div>
                  )}
                  <p className="text-[11px] font-semibold text-fb-yellow mb-2">
                    {featuredArticle.category || 'Analiz'}
                  </p>
                  <h3 className="text-lg font-display font-bold text-white leading-snug mb-2 line-clamp-3">
                    {featuredArticle.title}
                  </h3>
                  {featuredArticle.excerpt && (
                    <p className="text-[13px] text-slate-400 leading-relaxed line-clamp-3 mb-4">
                      {featuredArticle.excerpt}
                    </p>
                  )}
                  <div className="mt-auto pt-3 flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.06]">
                    <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-500">
                      <Clock className="w-3 h-3" aria-hidden />
                      {featuredArticle.readingTime || '—'}
                      {featuredArticle.author ? ` · ${featuredArticle.author}` : ''}
                    </span>
                    <button
                      type="button"
                      onClick={() => onNavigate('analysis')}
                      className="inline-flex items-center gap-1 text-[12px] font-semibold text-fb-yellow hover:text-white transition-colors cursor-pointer"
                    >
                      Oku <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </>
              )}
            </motion.article>

            {/* ── 3. ANKET ────────────────────────────────────────── */}
            <motion.article
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: 0.12 }}
              className="lg:col-span-4 ui-surface ui-surface-hover rounded-2xl p-5 md:p-6 flex flex-col relative overflow-hidden"
            >
              <div className="absolute top-0 inset-x-0 h-px ui-hairline opacity-60" />
              <div className="flex items-center justify-between gap-2 mb-5">
                <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-slate-400">
                  <Vote className="w-3.5 h-3.5 text-fb-yellow" aria-hidden />
                  Anket
                </span>
                {totalVotes > 0 && (
                  <span className="text-[11px] text-slate-500 font-medium">{totalVotes} oy</span>
                )}
              </div>

              {!poll || pollOptions.length === 0 ? (
                <EmptyState
                  icon={MessageSquare}
                  title="Aktif anket yok"
                  description="Admin’den anket açıldığında taraftar nabzı burada akar."
                  action={{ label: 'Taraftar odası', onClick: () => onNavigate('fan-room') }}
                />
              ) : (
                <>
                  <h3 className="text-base md:text-lg font-display font-bold text-white leading-snug mb-5">
                    {poll.question || poll.title}
                  </h3>
                  <div className="space-y-2.5 flex-1" role="list">
                    {pollOptions.map((opt) => {
                      const pct =
                        totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
                      const selected = votedOptionId === opt.id;
                      const showBars = !!votedOptionId;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          role="listitem"
                          disabled={!!votedOptionId}
                          onClick={() => handleVote(opt.id)}
                          className={`relative w-full text-left rounded-xl border px-3.5 py-3 overflow-hidden transition-all cursor-pointer disabled:cursor-default focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fb-yellow ${
                            selected
                              ? 'border-fb-yellow/50 bg-fb-yellow/10'
                              : 'border-white/[0.07] bg-white/[0.025] hover:border-white/15 hover:bg-white/[0.05]'
                          }`}
                        >
                          {showBars && (
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                              className="absolute inset-y-0 left-0 bg-fb-yellow/15 z-0"
                            />
                          )}
                          <div className="relative z-10 flex items-center justify-between gap-2">
                            <span className="text-[13px] font-semibold text-white flex items-center gap-2">
                              {selected && (
                                <CheckCircle2 className="w-4 h-4 text-fb-yellow shrink-0" />
                              )}
                              {opt.label}
                            </span>
                            {showBars && (
                              <span className="text-[13px] font-mono font-bold text-fb-yellow tabular-nums">
                                %{pct}
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  {voteError && (
                    <p className="mt-3 text-[12px] text-rose-400 font-medium" role="alert">
                      {voteError}
                    </p>
                  )}
                  <div className="mt-4 pt-3 border-t border-white/[0.06] flex justify-end">
                    <button
                      type="button"
                      onClick={() => onNavigate('fan-room')}
                      className="inline-flex items-center gap-1 text-[12px] font-semibold text-fb-yellow hover:text-white transition-colors cursor-pointer"
                    >
                      Taraftar odası <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </>
              )}
            </motion.article>
          </div>
        )}
      </div>
    </section>
  );
};

export default TodayPulse;
