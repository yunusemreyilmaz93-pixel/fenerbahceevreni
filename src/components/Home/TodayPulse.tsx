import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowRight,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  MessageSquare,
  Vote,
} from 'lucide-react';
import { castPollVote, dbGetCollection } from '../../lib/dbService';
import { ensureAnonymousUser } from '../../lib/firebase';
import { getTeamLogoPath } from '../../lib/teamLogos';
import { DataBadge, EmptyState, SignalHeading, XGCompare } from '../ui';

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
        typeof poll.votes === 'object' && poll.votes ? Number(poll.votes[o] || 0) : 0;
      return { id: o, label: o, votes };
    }
    const id = String(o.id || o.label || o.text || `opt-${i}`);
    const label = String(o.label || o.text || o.id || id);
    return { id, label, votes: Number(o.votes ?? 0) };
  });
}

/**
 * Bugünün nabzı — home.md: solda büyük editoryal, sağda maç + anket.
 * Üç eşit kart kalıbı yok.
 */
const TodayPulse: React.FC<TodayPulseProps> = ({ onNavigate, articles = [] }) => {
  const [match, setMatch] = useState<any | null>(null);
  const [poll, setPoll] = useState<any | null>(null);
  const [votedOptionId, setVotedOptionId] = useState<string | null>(null);
  const [voteError, setVoteError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const published = useMemo(() => {
    return (articles || []).filter(
      (a) => a.status === 'published' || a.status === 'active' || !a.status
    );
  }, [articles]);

  const featuredArticle = useMemo(
    () => published.find((a) => a.featured) || published[0] || null,
    [published]
  );
  const sideStories = useMemo(
    () => published.filter((a) => a !== featuredArticle).slice(0, 3),
    [published, featuredArticle]
  );

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
      if (msg.includes('daha önce')) setVotedOptionId(optionId);
      else setVoteError('Oy kaydedilemedi. Biraz sonra tekrar dene.');
    }
  };

  const isFinished = match?.status === 'finished' || match?.status === 'completed';
  const isLive = match?.status === 'live';
  const homeLogo =
    match?.homeLogo || getTeamLogoPath(match?.homeTeam || '') || '/logos/fenerbahce.png';
  const awayLogo = match?.awayLogo || getTeamLogoPath(match?.awayTeam || '') || '';

  return (
    <section
      id="bugunun-nabzi"
      aria-label="Bugünün nabzı"
      className="relative py-14 md:py-20 border-b border-[var(--fe-line-subtle)]"
    >
      <div className="fe-container">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8">
          <div>
            <SignalHeading label="Bugünün nabzı" />
            <h2
              className="text-[1.75rem] md:text-[2rem] font-semibold text-[var(--fe-text-strong)] tracking-tight leading-tight"
              style={{ fontFamily: 'var(--fe-font-editorial)' }}
            >
              Yayın masası
            </h2>
          </div>
          <p className="text-[13px] text-[var(--fe-text-faint)] max-w-xs leading-relaxed hidden md:block">
            Analiz · maç · anket — kaynak etiketli, uydurma metrik yok.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 h-72 fe-surface animate-pulse" />
            <div className="lg:col-span-5 space-y-4">
              <div className="h-36 fe-surface animate-pulse" />
              <div className="h-36 fe-surface animate-pulse" />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            {/* ── Editorial feature (7) ── */}
            <div className="lg:col-span-7 space-y-6">
              {!featuredArticle ? (
                <EmptyState
                  icon={BookOpen}
                  title="Yayında analiz yok"
                  description="Editoryal içerik yayınlandığında burada öne çıkar."
                  action={{ label: 'Analizler', onClick: () => onNavigate('analysis') }}
                />
              ) : (
                <article className="group">
                  {featuredArticle.coverImage ? (
                    <button
                      type="button"
                      onClick={() => onNavigate('analysis')}
                      className="block w-full relative mb-4 rounded-[var(--fe-radius-lg)] overflow-hidden aspect-[16/10] bg-[var(--fe-navy-950)] border border-[var(--fe-line-subtle)] cursor-pointer text-left"
                    >
                      <img
                        src={featuredArticle.coverImage}
                        alt=""
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[var(--fe-ink-950)] via-transparent to-transparent opacity-80" />
                    </button>
                  ) : null}
                  <p className="text-[12px] fe-data font-medium text-[var(--fe-yellow-400)] mb-2">
                    {featuredArticle.category || 'Analiz'}
                  </p>
                  <h3
                    className="text-2xl md:text-[1.75rem] font-semibold text-[var(--fe-text-strong)] leading-snug mb-3 group-hover:text-[var(--fe-yellow-400)] transition-colors"
                    style={{ fontFamily: 'var(--fe-font-editorial)' }}
                  >
                    <button
                      type="button"
                      onClick={() => onNavigate('analysis')}
                      className="text-left cursor-pointer"
                    >
                      {featuredArticle.title}
                    </button>
                  </h3>
                  {featuredArticle.excerpt && (
                    <p className="text-[15px] text-[var(--fe-text-muted)] leading-relaxed line-clamp-3 mb-4 max-w-xl">
                      {featuredArticle.excerpt}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="inline-flex items-center gap-1.5 text-[12px] text-[var(--fe-text-faint)] fe-data">
                      <Clock className="w-3 h-3" aria-hidden />
                      {featuredArticle.readingTime || '—'}
                      {featuredArticle.author ? ` · ${featuredArticle.author}` : ''}
                    </span>
                    <button
                      type="button"
                      onClick={() => onNavigate('analysis')}
                      className="fe-btn-tertiary !text-[13px]"
                    >
                      Oku <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </article>
              )}

              {/* Side stories — list rows, not equal cards */}
              {sideStories.length > 0 && (
                <ul className="border-t border-[var(--fe-line-subtle)] divide-y divide-[var(--fe-line-subtle)]">
                  {sideStories.map((a: any) => (
                    <li key={a.id || a.title}>
                      <button
                        type="button"
                        onClick={() => onNavigate('analysis')}
                        className="w-full text-left py-3.5 flex items-baseline justify-between gap-4 hover:text-[var(--fe-yellow-400)] transition-colors cursor-pointer group"
                      >
                        <span className="text-[14px] font-medium text-[var(--fe-text-strong)] group-hover:text-[var(--fe-yellow-400)] line-clamp-2">
                          {a.title}
                        </span>
                        <span className="text-[11px] fe-data text-[var(--fe-text-faint)] shrink-0">
                          {a.category || 'Analiz'}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* ── Data rail (5): match sheet + poll ── */}
            <div className="lg:col-span-5 space-y-5">
              {/* Match sheet */}
              <div className="fe-surface p-5 relative">
                <div className="absolute left-0 top-3 bottom-3 w-[2px] bg-[var(--fe-yellow-400)] rounded-r" />
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className="text-[12px] fe-data font-medium text-[var(--fe-text-muted)]">
                    Maç
                  </span>
                  {match && (
                    <span
                      className={`text-[11px] fe-data font-medium px-2 py-0.5 rounded-[var(--fe-radius-xs)] border ${
                        isLive
                          ? 'border-[var(--fe-live)]/40 text-[var(--fe-live)]'
                          : isFinished
                            ? 'border-[var(--fe-success)]/30 text-[var(--fe-success)]'
                            : 'border-[var(--fe-yellow-line)] text-[var(--fe-yellow-400)]'
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
                    description="Fikstür eklendiğinde burada nabız atar."
                    action={{
                      label: 'Maç merkezi',
                      onClick: () => onNavigate('match-center'),
                    }}
                  />
                ) : (
                  <>
                    <p className="text-[12px] text-[var(--fe-text-faint)] fe-data mb-3">
                      {match.competition || 'Süper Lig'} · {formatWhen(match.matchDate)}
                    </p>
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <div className="flex-1 text-center min-w-0">
                        <img
                          src={homeLogo}
                          alt=""
                          className="w-9 h-9 mx-auto object-contain mb-1.5"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                        <p className="text-[12px] font-semibold text-[var(--fe-text-strong)] truncate">
                          {match.homeTeam}
                        </p>
                      </div>
                      <div className="shrink-0 px-1 text-center">
                        {isFinished || isLive ? (
                          <p className="text-xl fe-data font-semibold text-[var(--fe-yellow-400)] tabular-nums">
                            {match.scoreHome ?? '—'} – {match.scoreAway ?? '—'}
                          </p>
                        ) : (
                          <p className="text-sm font-medium text-[var(--fe-text-muted)]">vs</p>
                        )}
                      </div>
                      <div className="flex-1 text-center min-w-0">
                        {awayLogo ? (
                          <img
                            src={awayLogo}
                            alt=""
                            className="w-9 h-9 mx-auto object-contain mb-1.5"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/logos/super-lig.png';
                            }}
                          />
                        ) : (
                          <div className="w-9 h-9 mx-auto mb-1.5 rounded bg-white/5" />
                        )}
                        <p className="text-[12px] font-semibold text-[var(--fe-text-strong)] truncate">
                          {match.awayTeam}
                        </p>
                      </div>
                    </div>
                    {(match.xGHome != null || match.xGAway != null) && (
                      <div className="mb-3">
                        <XGCompare
                          home={match.xGHome}
                          away={match.xGAway}
                          homeLabel={match.homeTeam}
                          awayLabel={match.awayTeam}
                        />
                      </div>
                    )}
                    <div className="pt-3 border-t border-[var(--fe-line-subtle)] flex flex-wrap items-center justify-between gap-2">
                      <DataBadge
                        provider={match.statsProvider}
                        fetchedAt={match.statsFetchedAt}
                        showMissing={!match.statsProvider}
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
              </div>

              {/* Poll */}
              <div className="fe-surface p-5">
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className="text-[12px] fe-data font-medium text-[var(--fe-text-muted)] inline-flex items-center gap-1.5">
                    <Vote className="w-3.5 h-3.5 text-[var(--fe-yellow-400)]" aria-hidden />
                    Anket
                  </span>
                  {totalVotes > 0 && (
                    <span className="text-[11px] fe-data text-[var(--fe-text-faint)]">
                      {totalVotes} oy
                    </span>
                  )}
                </div>

                {!poll || pollOptions.length === 0 ? (
                  <EmptyState
                    icon={MessageSquare}
                    title="Aktif anket yok"
                    description="Admin’den anket açıldığında burada akar."
                    action={{
                      label: 'Taraftar odası',
                      onClick: () => onNavigate('fan-room'),
                    }}
                  />
                ) : (
                  <>
                    <h3 className="text-[15px] font-semibold text-[var(--fe-text-strong)] leading-snug mb-4">
                      {poll.question || poll.title}
                    </h3>
                    <div className="space-y-2" role="list">
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
                            className={`relative w-full text-left rounded-[var(--fe-radius-md)] border px-3 py-2.5 overflow-hidden transition-colors cursor-pointer disabled:cursor-default min-h-[44px] ${
                              selected
                                ? 'border-[var(--fe-yellow-line)] bg-[var(--fe-yellow-soft)]'
                                : 'border-[var(--fe-line-subtle)] hover:border-[var(--fe-line)]'
                            }`}
                          >
                            {showBars && (
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${pct}%` }}
                                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                                className="absolute inset-y-0 left-0 bg-[var(--fe-yellow-soft)] z-0"
                              />
                            )}
                            <div className="relative z-10 flex items-center justify-between gap-2">
                              <span className="text-[13px] font-medium text-[var(--fe-text-strong)] flex items-center gap-2">
                                {selected && (
                                  <CheckCircle2 className="w-4 h-4 text-[var(--fe-yellow-400)] shrink-0" />
                                )}
                                {opt.label}
                              </span>
                              {showBars && (
                                <span className="text-[13px] fe-data font-semibold text-[var(--fe-yellow-400)] tabular-nums">
                                  %{pct}
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    {voteError && (
                      <p className="mt-2 text-[12px] text-[var(--fe-danger)]" role="alert">
                        {voteError}
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default TodayPulse;
