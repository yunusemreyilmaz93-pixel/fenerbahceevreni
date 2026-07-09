import React, { useState, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { toPng } from 'html-to-image';
import { INITIAL_STANDINGS, FIXTURES, Match, TeamStanding } from '../../constants/predictorData';
import { Download, Share2, Home, Plane, Check, Minus, X, RefreshCw, Trophy, TrendingUp } from 'lucide-react';

// ─── Constants ───────────────────────────────────────────────────────────────

const YELLOW = '#F5C518';
const DARK   = '#080D18';
const NAVY   = '#0D1525';
const PANEL  = '#111827';
const MUTED  = '#64748B';
const WHITE  = '#FFFFFF';

type PredictionResult = 'H' | 'D' | 'A' | null;

interface MatchPrediction {
  result: PredictionResult;
  homeScore: string;
  awayScore: string;
}

const TEAMS = ['GALATASARAY', 'FENERBAHÇE', 'TRABZONSPOR'] as const;
type TeamName = typeof TEAMS[number];

const TEAM_COLORS: Record<TeamName, string> = {
  GALATASARAY:  '#E8261A',
  'FENERBAHÇE': '#F5C518',
  TRABZONSPOR:  '#751E1E',
};

const TEAM_LOGOS: Record<TeamName, string> = {
  GALATASARAY: '/logos/galatasaray.svg',
  'FENERBAHÇE': '/logos/fenerbahce.png',
  TRABZONSPOR: '/logos/trabzonspor.png',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function calcStandings(predictions: Record<string, MatchPrediction>): TeamStanding[] {
  const standings = JSON.parse(JSON.stringify(INITIAL_STANDINGS)) as Record<string, TeamStanding>;
  FIXTURES.forEach((match) => {
    const pred = predictions[match.id];
    if (!pred || !pred.result) return;
    const result = pred.result;
    if (TEAMS.includes(match.homeTeam as TeamName)) {
      if (result === 'H') standings[match.homeTeam].points += 3;
      else if (result === 'D') standings[match.homeTeam].points += 1;
    }
    if (TEAMS.includes(match.awayTeam as TeamName)) {
      if (result === 'A') standings[match.awayTeam].points += 3;
      else if (result === 'D') standings[match.awayTeam].points += 1;
    }
  });
  return Object.values(standings).sort((a, b) => b.points - a.points);
}

function predictedPoints(teamName: string, predictions: Record<string, MatchPrediction>): number {
  let pts = 0;
  FIXTURES.forEach((m) => {
    const pred = predictions[m.id];
    if (!pred || !pred.result) return;
    const r = pred.result;
    const isHome = m.homeTeam === teamName;
    const isAway = m.awayTeam === teamName;
    if (!isHome && !isAway) return;
    if ((isHome && r === 'H') || (isAway && r === 'A')) pts += 3;
    else if (r === 'D') pts += 1;
  });
  return pts;
}

const toUpperTR = (s: string) => s.replace(/i/g, 'İ').replace(/ı/g, 'I').toUpperCase();

// ─── Main Page ────────────────────────────────────────────────────────────────

const PredictorPage: React.FC = () => {
  const [predictions, setPredictions] = useState<Record<string, MatchPrediction>>({});
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const exportCardRef = useRef<HTMLDivElement>(null);

  const currentStandings = useMemo(() => calcStandings(predictions), [predictions]);

  const handlePredict = useCallback((matchId: string, result: PredictionResult) => {
    setPredictions((prev) => {
      const current = prev[matchId] || { result: null, homeScore: '', awayScore: '' };
      return {
        ...prev,
        [matchId]: {
          ...current,
          result: current.result === result ? null : result,
        },
      };
    });
  }, []);

  const handleScoreChange = useCallback((matchId: string, side: 'home' | 'away', val: string) => {
    setPredictions((prev) => {
      const current = prev[matchId] || { result: null, homeScore: '', awayScore: '' };
      const next = { ...current, [side === 'home' ? 'homeScore' : 'awayScore']: val };
      
      // Auto-calculate result if both scores are present
      if (next.homeScore !== '' && next.awayScore !== '') {
        const h = parseInt(next.homeScore);
        const a = parseInt(next.awayScore);
        if (!isNaN(h) && !isNaN(a)) {
          if (h > a) next.result = 'H';
          else if (a > h) next.result = 'A';
          else next.result = 'D';
        }
      }
      
      return { ...prev, [matchId]: next };
    });
  }, []);

  const handleExport = async () => {
    if (!exportCardRef.current) return;
    setIsExporting(true);
    try {
      const dataUrl = await toPng(exportCardRef.current, {
        quality: 0.95,
        pixelRatio: 2,
        cacheBust: true,
      });
      const link = document.createElement('a');
      link.download = `fenerbahce-sampiyonluk-senaryom-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleShareX = async () => {
    if (!exportCardRef.current) return;
    setIsExporting(true);
    try {
      const dataUrl = await toPng(exportCardRef.current, {
        quality: 0.9,
        pixelRatio: 1.5,
      });
      // In a real app, you'd upload this to a server and get a URL.
      // For now, we'll just open X with a text.
      const text = encodeURIComponent("Fenerbahçe için şampiyonluk senaryom hazır! 💛💙 #Fenerbahçe #ŞampiyonlukYolu");
      window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
    } catch (err) {
      console.error('Share failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const totalPredicted = Object.values(predictions).filter((p: MatchPrediction) => p.result).length;

  return (
    <>
      {/* Hidden export card — off-screen, exact 1920×1080, no transforms */}
      <div
        style={{
          position: 'fixed', left: '-99999px', top: 0,
          width: '1920px', height: '1080px',
          zIndex: -1, pointerEvents: 'none',
        }}
        aria-hidden="true"
      >
        <ShareCard
          ref={exportCardRef}
          predictions={predictions}
          currentStandings={currentStandings}
        />
      </div>

      {/* Page */}
      <div className="min-h-screen text-white" style={{ background: DARK, fontFamily: "'Barlow Condensed', 'Arial Narrow', Arial, sans-serif" }}>

        {/* Ambient background */}
        <div style={{
          position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
          background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(245,197,24,0.07) 0%, transparent 70%)',
        }} />

        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-10">

          {/* Header */}
          <motion.header
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-6"
            style={{ borderBottom: '1px solid rgba(245,197,24,0.15)' }}
          >
            <div>
              <div className="text-xs font-bold tracking-[0.3em] mb-2" style={{ color: MUTED }}>
                FENERBAHÇE EVRENİ · 2025–2026
              </div>
              <h1 style={{
                fontSize: 'clamp(28px, 5vw, 52px)',
                fontWeight: 900, fontStyle: 'italic',
                color: YELLOW, lineHeight: 0.92,
                letterSpacing: '-0.02em',
                textTransform: 'uppercase',
              }}>
                Şampİyonluk<br />Senaryom
              </h1>
              <p className="text-sm mt-3 font-medium" style={{ color: MUTED }}>
                Kalan maçların sonuçlarını tahmin et, puan durumunu şekillendir.
              </p>
              <span className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: MUTED }}>
                ⚗️ Kurgusal senaryo simülasyonu — canlı lig verisi değildir
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* Progress pill */}
              <div className="px-4 py-2 rounded-full text-xs font-bold tracking-widest"
                style={{ background: 'rgba(245,197,24,0.08)', border: '1px solid rgba(245,197,24,0.2)', color: YELLOW }}>
                {totalPredicted} / {FIXTURES.length} TAHMİN
              </div>

              <button
                onClick={handleShareX}
                className="flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-black uppercase tracking-wide transition-all hover:scale-[1.03] active:scale-[0.97]"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: WHITE }}
              >
                <Share2 className="w-4 h-4" />
                Paylaş
              </button>

              <button
                onClick={handleExport}
                disabled={isExporting}
                className="flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wide transition-all hover:scale-[1.03] active:scale-[0.97] disabled:opacity-50 disabled:hover:scale-100"
                style={{
                  background: YELLOW, color: '#000',
                  boxShadow: '0 0 24px rgba(245,197,24,0.25)',
                }}
              >
                {isExporting ? <RefreshCw className="w-4 h-4 animate-spin" /> :
                 exportSuccess ? <Check className="w-4 h-4" /> :
                 <Download className="w-4 h-4" />}
                {isExporting ? 'Hazırlanıyor...' : exportSuccess ? 'İndirildi!' : 'Kart İNDİR'}
              </button>
            </div>
          </motion.header>

          {/* Live standings strip */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="grid grid-cols-3 gap-3 mb-8"
          >
            {currentStandings.map((team, i) => {
              const color = TEAM_COLORS[team.name as TeamName] ?? YELLOW;
              const added = predictedPoints(team.name, predictions);
              return (
                <motion.div
                  key={team.name}
                  layout
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  className="relative overflow-hidden rounded-2xl p-4 flex items-center gap-4"
                  style={{
                    background: `linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)`,
                    border: `1px solid ${i === 0 ? `${color}40` : 'rgba(255,255,255,0.07)'}`,
                    boxShadow: i === 0 ? `0 0 32px ${color}15` : 'none',
                  }}
                >
                  {/* rank */}
                  <div className="text-4xl font-black italic" style={{ color: i === 0 ? color : MUTED, opacity: i === 0 ? 1 : 0.4, lineHeight: 1 }}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold tracking-widest" style={{ color: MUTED }}>
                      {team.name}
                    </div>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <motion.span
                        key={team.points}
                        initial={{ scale: 1.2, color: color }}
                        animate={{ scale: 1, color: WHITE }}
                        transition={{ duration: 0.3 }}
                        className="text-2xl font-black"
                        style={{ lineHeight: 1 }}
                      >
                        {team.points}
                      </motion.span>
                      <span className="text-xs font-bold" style={{ color: MUTED }}>puan</span>
                      {added > 0 && (
                        <motion.span
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-xs font-black"
                          style={{ color }}
                        >
                          +{added}
                        </motion.span>
                      )}
                    </div>
                  </div>
                  {i === 0 && (
                    <Trophy className="w-5 h-5 opacity-60" style={{ color }} />
                  )}
                </motion.div>
              );
            })}
          </motion.div>

          {/* Main grid — one column per team */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {(TEAMS as readonly TeamName[]).map((teamName, ti) => {
              const teamFixtures = FIXTURES.filter(
                (m) => m.homeTeam === teamName || m.awayTeam === teamName
              );
              const color = TEAM_COLORS[teamName];
              const teamStanding = currentStandings.find((s) => s.name === teamName);
              const rank = currentStandings.findIndex((s) => s.name === teamName) + 1;

              return (
                <motion.div
                  key={teamName}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + ti * 0.08, type: 'spring', stiffness: 200, damping: 24 }}
                  className="rounded-3xl overflow-hidden"
                  style={{ border: `1px solid rgba(255,255,255,0.07)` }}
                >
                  {/* Team header */}
                  <div className="relative p-5 pb-4"
                    style={{ background: `linear-gradient(135deg, ${color}18 0%, rgba(255,255,255,0.02) 100%)` }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 flex items-center justify-center rounded-2xl"
                        style={{ background: 'rgba(0,0,0,0.3)' }}>
                        <img
                          src={TEAM_LOGOS[teamName]}
                          alt={teamName}
                          className="w-11 h-11 object-contain"
                          crossOrigin="anonymous"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="text-xs font-bold tracking-[0.2em]" style={{ color }}>
                          {rank}. SIRA
                        </div>
                        <div className="text-xl font-black italic uppercase" style={{ lineHeight: 1.1 }}>
                          {teamName}
                        </div>
                      </div>
                      <motion.div
                        key={teamStanding?.points}
                        animate={{ scale: [1.15, 1] }}
                        transition={{ duration: 0.25 }}
                        className="text-right"
                      >
                        <div className="text-3xl font-black italic" style={{ color, lineHeight: 1 }}>
                          {teamStanding?.points}
                        </div>
                        <div className="text-[10px] font-bold tracking-widest" style={{ color: MUTED }}>PUAN</div>
                      </motion.div>
                    </div>
                  </div>

                  {/* Fixtures */}
                  <div className="p-3 space-y-2" style={{ background: NAVY }}>
                    <AnimatePresence>
                      {teamFixtures.map((match, mi) => (
                        <motion.div
                          key={match.id}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: mi * 0.04 }}
                        >
                          <MatchCard
                            teamName={teamName}
                            match={match}
                            prediction={predictions[match.id]}
                            teamColor={color}
                            onPredict={handlePredict}
                            onScoreChange={handleScoreChange}
                          />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="mt-10 text-center text-xs font-bold tracking-widest" style={{ color: MUTED, opacity: 0.5 }}>
            FENERBAHÇE EVRENİ · @BASİTBİOYUN · FENERBAHCEEVRENI.COM
          </div>
        </div>
      </div>
    </>
  );
};

// ─── Match Card ───────────────────────────────────────────────────────────────

const MatchCard: React.FC<{
  teamName: string;
  match: Match;
  prediction: MatchPrediction | undefined;
  teamColor: string;
  onPredict: (id: string, res: PredictionResult) => void;
  onScoreChange: (id: string, side: 'home' | 'away', val: string) => void;
}> = ({ teamName, match, prediction, teamColor, onPredict, onScoreChange }) => {
  const isHome = match.homeTeam === teamName;
  const opponent = isHome ? match.awayTeam : match.homeTeam;
  const winResult: PredictionResult = isHome ? 'H' : 'A';
  const lossResult: PredictionResult = isHome ? 'A' : 'H';

  const result = prediction?.result ?? null;
  const isWin  = result === winResult;
  const isDraw = result === 'D';
  const isLoss = result === lossResult;

  return (
    <div
      className="rounded-xl p-3 transition-all"
      style={{
        background: match.isDerby ? 'rgba(245,197,24,0.04)' : 'rgba(255,255,255,0.02)',
        border: match.isDerby ? '1px solid rgba(245,197,24,0.2)' : '1px solid rgba(255,255,255,0.04)',
      }}
    >
      <div className="flex items-center gap-3">
        {/* Home/Away icon */}
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: 'rgba(255,255,255,0.04)' }}>
          {isHome
            ? <Home className="w-4 h-4" style={{ color: '#60A5FA' }} />
            : <Plane className="w-4 h-4" style={{ color: '#FB923C' }} />}
        </div>

        {/* Opponent + week */}
        <div className="flex-1 min-w-0">
          <div className="text-[9px] font-bold tracking-widest" style={{ color: MUTED }}>
            {isHome ? 'İÇ SAHA' : 'DEPLASMAN'} · H{match.week}
            {match.isDerby && <span style={{ color: YELLOW }}> · DERBİ</span>}
          </div>
          <div className="text-sm font-black italic uppercase" style={{ lineHeight: 1.2 }}>
            {opponent}
          </div>
        </div>

        {/* Score Inputs */}
        <div className="flex items-center gap-1 bg-black/20 rounded-lg p-1 border border-white/5">
          <input
            type="text"
            inputMode="numeric"
            placeholder="-"
            value={prediction?.homeScore ?? ''}
            onChange={(e) => onScoreChange(match.id, 'home', e.target.value.replace(/\D/g, '').slice(0, 2))}
            className="w-7 h-7 bg-transparent text-center text-xs font-black focus:outline-none text-white placeholder:text-white/20"
          />
          <span className="text-[10px] font-bold opacity-30">:</span>
          <input
            type="text"
            inputMode="numeric"
            placeholder="-"
            value={prediction?.awayScore ?? ''}
            onChange={(e) => onScoreChange(match.id, 'away', e.target.value.replace(/\D/g, '').slice(0, 2))}
            className="w-7 h-7 bg-transparent text-center text-xs font-black focus:outline-none text-white placeholder:text-white/20"
          />
        </div>

        {/* Prediction buttons */}
        <div className="flex gap-1 shrink-0">
          <PredictBtn
            active={isWin}
            color="#22C55E"
            onClick={() => onPredict(match.id, winResult)}
            title="Galibiyet"
          >
            <Check className="w-3 h-3" />
          </PredictBtn>
          <PredictBtn
            active={isDraw}
            color={YELLOW}
            onClick={() => onPredict(match.id, 'D')}
            title="Beraberlik"
          >
            <Minus className="w-3 h-3" />
          </PredictBtn>
          <PredictBtn
            active={isLoss}
            color="#EF4444"
            onClick={() => onPredict(match.id, lossResult)}
            title="Mağlubiyet"
          >
            <X className="w-3 h-3" />
          </PredictBtn>
        </div>
      </div>
    </div>
  );
};

const PredictBtn: React.FC<{
  active: boolean;
  color: string;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}> = ({ active, color, onClick, title, children }) => (
  <motion.button
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
    animate={active ? { scale: [1.15, 1] } : {}}
    transition={{ duration: 0.2 }}
    onClick={onClick}
    title={title}
    className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
    style={{
      background: active ? color : 'rgba(255,255,255,0.05)',
      border: `1px solid ${active ? color : 'rgba(255,255,255,0.08)'}`,
      color: active ? (color === YELLOW ? '#000' : WHITE) : MUTED,
    }}
  >
    {children}
  </motion.button>
);

// ─── Share Card — 1920×1080, fully inline-styled ──────────────────────────────

const ShareCard = React.forwardRef<
  HTMLDivElement,
  { predictions: Record<string, MatchPrediction>; currentStandings: TeamStanding[] }
>(({ predictions, currentStandings }, ref) => {

  const NOISE = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E")`;

  const cell = (content: React.ReactNode, style?: React.CSSProperties) => (
    <div style={{ boxSizing: 'border-box', ...style }}>{content}</div>
  );

  return (
    <div
      ref={ref}
      style={{
        width: '1920px', height: '1080px',
        backgroundColor: DARK,
        position: 'relative', overflow: 'hidden',
        fontFamily: "'Barlow Condensed', 'Arial Narrow', Arial, sans-serif",
        boxSizing: 'border-box',
        display: 'flex', flexDirection: 'column',
        padding: '52px 64px 48px',
      }}
    >
      {/* Noise */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: NOISE, backgroundSize: '200px 200px', zIndex: 1, pointerEvents: 'none', opacity: 0.6 }} />
      {/* Top glow */}
      <div style={{ position: 'absolute', top: '-200px', left: '50%', transform: 'translateX(-50%)', width: '1200px', height: '400px', borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(245,197,24,0.10) 0%, transparent 70%)', zIndex: 0, pointerEvents: 'none' }} />
      {/* Left accent bar */}
      <div style={{ position: 'absolute', left: 0, top: '12%', height: '76%', width: '4px', background: `linear-gradient(to bottom, transparent, ${YELLOW}, transparent)`, zIndex: 2 }} />

      {/* All content above layers */}
      <div style={{ position: 'relative', zIndex: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>

        {/* Header row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '28px', paddingBottom: '24px', borderBottom: '1px solid rgba(245,197,24,0.18)' }}>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: MUTED, letterSpacing: '5px', textTransform: 'uppercase', marginBottom: '6px', fontFamily: 'Arial, sans-serif' }}>
              FENERBAHÇE EVRENİ · 2025–2026
            </div>
            <div style={{ fontSize: '54px', fontWeight: 900, fontStyle: 'italic', color: YELLOW, lineHeight: 0.9, letterSpacing: '-1px', textTransform: 'uppercase' }}>
              Şampİyonluk Senaryom
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '22px', fontWeight: 900, color: YELLOW, letterSpacing: '1px' }}>FENERBAHCEEVRENI.COM</div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: MUTED, marginTop: '4px', letterSpacing: '2px', fontFamily: 'Arial, sans-serif' }}>@BASİTBİOYUN</div>
          </div>
        </div>

        {/* Body — standings + 3 team columns */}
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '220px 1fr 1fr 1fr', gap: '24px', minHeight: 0 }}>

          {/* Standings panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: MUTED, letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '4px', fontFamily: 'Arial, sans-serif' }}>PUAN DURUMU</div>
            {currentStandings.map((team, i) => {
              const color = TEAM_COLORS[team.name as TeamName] ?? YELLOW;
              const isFirst = i === 0;
              return (
                <div key={team.name} style={{
                  padding: '14px 16px', borderRadius: '16px',
                  background: isFirst ? `${color}15` : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${isFirst ? `${color}40` : 'rgba(255,255,255,0.07)'}`,
                  display: 'flex', alignItems: 'center', gap: '12px',
                }}>
                  <div style={{ fontSize: '28px', fontWeight: 900, fontStyle: 'italic', color: isFirst ? color : MUTED, opacity: isFirst ? 1 : 0.5, lineHeight: 1, width: '22px' }}>{i + 1}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: MUTED, letterSpacing: '2px', textTransform: 'uppercase', fontFamily: 'Arial, sans-serif' }}>{team.name}</div>
                    <div style={{ fontSize: '26px', fontWeight: 900, fontStyle: 'italic', color: isFirst ? color : WHITE, lineHeight: 1 }}>{team.points}</div>
                  </div>
                  {isFirst && <div style={{ fontSize: '20px' }}>🏆</div>}
                </div>
              );
            })}

            {/* Divider + legend */}
            <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
              {[
                { color: '#22C55E', label: 'G — Galibiyet' },
                { color: YELLOW,   label: 'B — Beraberlik' },
                { color: '#EF4444', label: 'M — Mağlubiyet' },
                { color: MUTED,    label: '? — Tahmin yok' },
              ].map(({ color, label }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: color, flexShrink: 0 }} />
                  <span style={{ fontSize: '13px', color: MUTED, fontFamily: 'Arial, sans-serif', fontWeight: 600 }}>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Team columns */}
          {(TEAMS as readonly TeamName[]).map((teamName) => {
            const teamFixtures = FIXTURES.filter((m) => m.homeTeam === teamName || m.awayTeam === teamName);
            const color = TEAM_COLORS[teamName];
            const standing = currentStandings.find((s) => s.name === teamName);
            const rank = currentStandings.findIndex((s) => s.name === teamName) + 1;
            const added = predictedPoints(teamName, predictions);

            return (
              <div key={teamName} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {/* Team header */}
                <div style={{
                  padding: '18px 20px', borderRadius: '20px',
                  background: `linear-gradient(135deg, ${color}18 0%, rgba(255,255,255,0.02) 100%)`,
                  border: `1px solid ${color}30`,
                  display: 'flex', alignItems: 'center', gap: '16px',
                }}>
                  <div style={{ width: '56px', height: '56px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img src={TEAM_LOGOS[teamName]} alt={teamName} style={{ width: '100%', height: '100%', objectFit: 'contain' }} crossOrigin="anonymous" referrerPolicy="no-referrer" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color, letterSpacing: '3px', textTransform: 'uppercase', fontFamily: 'Arial, sans-serif' }}>{rank}. SIRA</div>
                    <div style={{ fontSize: '26px', fontWeight: 900, fontStyle: 'italic', textTransform: 'uppercase', color: WHITE, lineHeight: 1, letterSpacing: '-0.5px' }}>{teamName}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '38px', fontWeight: 900, fontStyle: 'italic', color, lineHeight: 1 }}>{standing?.points}</div>
                    {added > 0 && <div style={{ fontSize: '14px', fontWeight: 700, color, opacity: 0.7, fontFamily: 'Arial, sans-serif' }}>+{added}</div>}
                  </div>
                </div>

                {/* Fixture rows */}
                {teamFixtures.map((match) => {
                  const isHome = match.homeTeam === teamName;
                  const opponent = isHome ? match.awayTeam : match.homeTeam;
                  const p = predictions[match.id];
                  const isWin  = p && p.result && ((isHome && p.result === 'H') || (!isHome && p.result === 'A'));
                  const isDraw = p && p.result === 'D';
                  const isLoss = p && p.result && ((isHome && p.result === 'A') || (!isHome && p.result === 'H'));

                  const badge = !p || !p.result
                    ? { bg: 'rgba(100,116,139,0.12)', border: 'rgba(100,116,139,0.25)', color: MUTED, label: '?' }
                    : isWin
                    ? { bg: 'rgba(34,197,94,0.15)',  border: 'rgba(34,197,94,0.35)',  color: '#22C55E', label: 'G' }
                    : isDraw
                    ? { bg: 'rgba(245,197,24,0.15)', border: 'rgba(245,197,24,0.35)', color: YELLOW,   label: 'B' }
                    : { bg: 'rgba(239,68,68,0.15)',  border: 'rgba(239,68,68,0.35)',  color: '#EF4444', label: 'M' };

                  return (
                    <div key={match.id} style={{
                      display: 'grid', gridTemplateColumns: '44px 1fr 48px',
                      alignItems: 'center', gap: '12px',
                      padding: '12px 14px', borderRadius: '14px',
                      background: match.isDerby ? 'rgba(245,197,24,0.04)' : 'rgba(255,255,255,0.025)',
                      border: `1px solid ${match.isDerby ? 'rgba(245,197,24,0.25)' : 'rgba(255,255,255,0.06)'}`,
                    }}>
                      <div style={{
                        width: '44px', height: '44px', borderRadius: '12px',
                        background: 'rgba(255,255,255,0.05)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '20px',
                      }}>
                        {isHome ? '🏠' : '✈️'}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: '11px', fontWeight: 700, color: MUTED, letterSpacing: '2px', textTransform: 'uppercase', fontFamily: 'Arial, sans-serif', marginBottom: '2px' }}>
                          {isHome ? 'İç Saha' : 'Deplasman'}
                          {match.isDerby && <span style={{ color: YELLOW }}> · DERBİ</span>}
                        </div>
                        <div style={{ fontSize: '22px', fontWeight: 900, fontStyle: 'italic', textTransform: 'uppercase', color: WHITE, lineHeight: 1, letterSpacing: '-0.3px' }}>
                          {opponent}
                        </div>
                      </div>
                      
                      {/* Score display in card */}
                      {p && p.homeScore !== '' && p.awayScore !== '' && (
                        <div style={{
                          display: 'flex', alignItems: 'center', gap: '4px',
                          background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: '8px',
                          fontSize: '18px', fontWeight: 900, color: YELLOW, fontFamily: 'Arial, sans-serif'
                        }}>
                          <span>{isHome ? p.homeScore : p.awayScore}</span>
                          <span style={{ opacity: 0.3 }}>-</span>
                          <span>{isHome ? p.awayScore : p.homeScore}</span>
                        </div>
                      )}

                      <div style={{
                        width: '48px', height: '48px', borderRadius: '12px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: badge.bg, border: `1px solid ${badge.border}`,
                        color: badge.color, fontSize: '22px', fontWeight: 900, fontStyle: 'italic',
                      }}>
                        {badge.label}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});

ShareCard.displayName = 'PredictorShareCard';

export default PredictorPage;