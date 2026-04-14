import React, { useState, useEffect, useRef } from 'react';
import { motion, useAnimationFrame, AnimatePresence } from 'motion/react';
import { Calendar, MapPin, Trophy, ChevronRight, Zap, Clock } from 'lucide-react';
import { NEXT_MATCH } from '../../constants/homeData';

// ─── Types ─────────────────────────────────────────────────────────────────

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function calcTimeLeft(target: number): TimeLeft {
  const dist = Math.max(0, target - Date.now());
  return {
    days:    Math.floor(dist / 86_400_000),
    hours:   Math.floor((dist % 86_400_000) / 3_600_000),
    minutes: Math.floor((dist % 3_600_000)  / 60_000),
    seconds: Math.floor((dist % 60_000)     / 1_000),
  };
}

// ─── Animated digit ─────────────────────────────────────────────────────────

const Digit: React.FC<{ value: number; label: string }> = ({ value, label }) => {
  const display = String(value).padStart(2, '0');
  const prevRef = useRef(display);
  const changed = prevRef.current !== display;
  useEffect(() => { prevRef.current = display; });

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Card */}
      <div className="relative w-[72px] md:w-[88px] h-[80px] md:h-[96px] overflow-hidden rounded-2xl"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>

        {/* Subtle top shine */}
        <div className="absolute inset-x-0 top-0 h-[1px]"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(245,197,24,0.4), transparent)' }} />

        {/* Fold line */}
        <div className="absolute inset-x-0 top-1/2 h-[1px]"
          style={{ background: 'rgba(0,0,0,0.35)', zIndex: 2 }} />

        <AnimatePresence mode="popLayout">
          <motion.div
            key={display}
            initial={{ y: changed ? -40 : 0, opacity: changed ? 0 : 1 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <span
              className="text-3xl md:text-4xl font-black tabular-nums"
              style={{
                fontFamily: "'Barlow Condensed', 'Arial Narrow', Arial, sans-serif",
                color: '#FFFFFF',
                fontStyle: 'italic',
                letterSpacing: '-1px',
                lineHeight: 1,
              }}
            >
              {display}
            </span>
          </motion.div>
        </AnimatePresence>
      </div>

      <span
        className="text-[9px] font-black tracking-[0.25em]"
        style={{ color: '#64748B', fontFamily: 'Arial, sans-serif' }}
      >
        {label}
      </span>
    </div>
  );
};

// ─── Pulsing live dot ────────────────────────────────────────────────────────

const LiveDot: React.FC = () => (
  <span className="relative inline-flex h-2 w-2">
    <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
      style={{ background: '#22C55E' }} />
    <span className="relative inline-flex rounded-full h-2 w-2"
      style={{ background: '#22C55E' }} />
  </span>
);

// ─── Team card ───────────────────────────────────────────────────────────────

const TeamCard: React.FC<{
  name: string;
  logoUrl: string;
  side: 'home' | 'away';
  delay: number;
}> = ({ name, logoUrl, side, delay }) => (
  <motion.div
    initial={{ opacity: 0, x: side === 'home' ? -32 : 32 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay, type: 'spring', stiffness: 180, damping: 22 }}
    className="flex flex-col items-center gap-4 group"
  >
    {/* Logo ring */}
    <div
      className="relative w-28 h-28 md:w-36 md:h-36 rounded-full p-[2px] transition-all duration-500 group-hover:scale-105"
      style={{
        background: 'linear-gradient(135deg, rgba(245,197,24,0.4) 0%, rgba(245,197,24,0.05) 50%, transparent 100%)',
      }}
    >
      <div
        className="w-full h-full rounded-full flex items-center justify-center p-4"
        style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(12px)' }}
      >
        <img
          src={logoUrl}
          alt={name}
          className="w-full h-full object-contain drop-shadow-lg"
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
      </div>

      {/* Glow on hover */}
      <div
        className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: 'radial-gradient(circle, rgba(245,197,24,0.12) 0%, transparent 70%)' }}
      />
    </div>

    <span
      className="text-lg md:text-xl font-black uppercase italic text-center leading-tight"
      style={{
        fontFamily: "'Barlow Condensed', 'Arial Narrow', Arial, sans-serif",
        letterSpacing: '-0.5px',
      }}
    >
      {name}
    </span>
  </motion.div>
);

// ─── Meta pill ───────────────────────────────────────────────────────────────

const MetaPill: React.FC<{ icon: React.ReactNode; text: string }> = ({ icon, text }) => (
  <div
    className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
    style={{
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.08)',
      color: '#94A3B8',
    }}
  >
    <span style={{ color: '#F5C518' }}>{icon}</span>
    {text}
  </div>
);

// ─── Scanning line animation (broadcast feel) ────────────────────────────────

const ScanLine: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const pos = useRef(0);

  useAnimationFrame((_, delta) => {
    if (!ref.current) return;
    pos.current = (pos.current + delta * 0.03) % 100;
    ref.current.style.top = `${pos.current}%`;
  });

  return (
    <div
      ref={ref}
      className="absolute inset-x-0 pointer-events-none"
      style={{
        height: '1px',
        background: 'linear-gradient(90deg, transparent 0%, rgba(245,197,24,0.12) 30%, rgba(245,197,24,0.25) 50%, rgba(245,197,24,0.12) 70%, transparent 100%)',
        zIndex: 1,
      }}
    />
  );
};

// ─── Main component ──────────────────────────────────────────────────────────

interface MatchCenterProps {
  onNavigate?: (view: 'home' | 'universe' | 'match-center' | 'news') => void;
}

const MatchCenter: React.FC<MatchCenterProps> = ({ onNavigate }) => {
  const targetMs = useRef(new Date(NEXT_MATCH.date).getTime());
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => calcTimeLeft(targetMs.current));
  const [isLive, setIsLive] = useState(false);

  // Precise 1s tick
  useEffect(() => {
    const tick = () => {
      const tl = calcTimeLeft(targetMs.current);
      setTimeLeft(tl);
      const allZero = tl.days === 0 && tl.hours === 0 && tl.minutes === 0 && tl.seconds === 0;
      setIsLive(allZero);
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const matchDate = new Date(NEXT_MATCH.date);
  const dateStr = matchDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
  const timeStr = matchDate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

  return (
    <section className="py-20 md:py-28 relative overflow-hidden">

      {/* ── Background atmospherics ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 70% 60% at 50% 100%, rgba(245,197,24,0.05) 0%, transparent 70%)',
        }}
      />

      {/* Diagonal lines texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.5) 0px, rgba(255,255,255,0.5) 1px, transparent 1px, transparent 12px)',
          backgroundSize: '17px 17px',
        }}
      />

      <div className="container mx-auto px-6">

        {/* ── Section header ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col md:flex-row items-start md:items-end justify-between mb-10 gap-4"
        >
          <div>
            <div className="flex items-center gap-2 mb-2">
              {isLive ? (
                <>
                  <LiveDot />
                  <span className="text-[10px] font-black tracking-[0.25em]" style={{ color: '#22C55E' }}>
                    CANLI · MAÇ DEVAM EDİYOR
                  </span>
                </>
              ) : (
                <span
                  className="intelligence-label text-[10px]"
                  style={{ color: '#F5C518', letterSpacing: '0.2em' }}
                >
                  SIRADAKİ MAÇ
                </span>
              )}
            </div>
            <h2
              className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter leading-none"
              style={{ fontFamily: "'Barlow Condensed', 'Arial Narrow', Arial, sans-serif" }}
            >
              MAÇ MERKEZİ
            </h2>
          </div>

          <button 
            onClick={() => onNavigate?.('match-center')}
            className="group flex items-center gap-2 text-sm font-bold transition-colors"
            style={{ color: '#64748B' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#F5C518')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#64748B')}
          >
            TÜM MAÇLAR
            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </motion.div>

        {/* ── Main card ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 160, damping: 22 }}
          className="relative overflow-hidden rounded-[2rem] md:rounded-[2.5rem]"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <ScanLine />

          {/* Top yellow gradient wash */}
          <div
            className="absolute top-0 inset-x-0 h-[2px]"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(245,197,24,0.6) 40%, rgba(245,197,24,0.6) 60%, transparent 100%)',
            }}
          />

          {/* Right side ambient */}
          <div
            className="absolute top-0 right-0 w-1/2 h-full pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse 80% 80% at 100% 50%, rgba(245,197,24,0.04) 0%, transparent 70%)',
            }}
          />

          {/* Competition badge — top center */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10">
            <div
              className="px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase"
              style={{
                background: 'rgba(245,197,24,0.1)',
                border: '1px solid rgba(245,197,24,0.25)',
                color: '#F5C518',
              }}
            >
              {NEXT_MATCH.competition}
            </div>
          </div>

          <div className="p-8 md:p-12 pt-16 md:pt-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16 items-center">

              {/* ── Left: Teams ── */}
              <div>
                <div className="flex items-center justify-between gap-4 md:gap-8">
                  <TeamCard
                    name="FENERBAHÇE"
                    logoUrl="https://upload.wikimedia.org/wikipedia/tr/f/ff/Fenerbah%C3%A7e_SK.png"
                    side="home"
                    delay={0.2}
                  />

                  {/* VS separator */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3, type: 'spring', stiffness: 200, damping: 18 }}
                    className="flex flex-col items-center gap-2 shrink-0"
                  >
                    <div
                      className="text-5xl md:text-6xl font-black italic"
                      style={{
                        fontFamily: "'Barlow Condensed', Arial, sans-serif",
                        color: '#F5C518',
                        lineHeight: 1,
                        textShadow: '0 0 40px rgba(245,197,24,0.4)',
                      }}
                    >
                      VS
                    </div>
                    {/* Decorative dots */}
                    <div className="flex gap-1.5">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ background: 'rgba(245,197,24,0.3)' }}
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 1.5, delay: i * 0.2, repeat: Infinity }}
                        />
                      ))}
                    </div>
                  </motion.div>

                  <TeamCard
                    name={NEXT_MATCH.opponent}
                    logoUrl={NEXT_MATCH.opponentLogo}
                    side="away"
                    delay={0.2}
                  />
                </div>

                {/* Meta info row */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 }}
                  className="flex flex-wrap items-center justify-center gap-3 mt-8"
                >
                  <MetaPill icon={<Calendar className="w-3.5 h-3.5" />} text={`${dateStr} · ${timeStr}`} />
                  <MetaPill icon={<MapPin className="w-3.5 h-3.5" />} text={NEXT_MATCH.venue} />
                  <MetaPill icon={<Trophy className="w-3.5 h-3.5" />} text="Süper Lig" />
                </motion.div>
              </div>

              {/* ── Right: Countdown ── */}
              <motion.div
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25, type: 'spring', stiffness: 160, damping: 22 }}
                className="flex flex-col items-center lg:items-end gap-6"
              >
                {/* Label */}
                <div className="flex items-center gap-2.5">
                  <Zap className="w-4 h-4" style={{ color: '#F5C518' }} />
                  <span
                    className="text-[10px] font-black tracking-[0.3em] uppercase"
                    style={{ color: '#64748B' }}
                  >
                    {isLive ? 'MAÇ OYNANIYOR' : 'MAÇA KALAN SÜRE'}
                  </span>
                  {isLive && <LiveDot />}
                </div>

                {/* Digit grid */}
                <div className="grid grid-cols-4 gap-3 md:gap-4">
                  <Digit value={timeLeft.days}    label="GÜN"   />
                  <Digit value={timeLeft.hours}   label="SAAT"  />
                  <Digit value={timeLeft.minutes} label="DAKİKA" />
                  <Digit value={timeLeft.seconds} label="SANİYE" />
                </div>

                {/* Separator dots between digits — decorative */}
                <div
                  className="flex items-center gap-3 text-sm font-black italic"
                  style={{
                    color: 'rgba(245,197,24,0.25)',
                    fontFamily: "'Barlow Condensed', Arial, sans-serif",
                    letterSpacing: '2px',
                  }}
                >
                  <Clock className="w-4 h-4" style={{ color: 'rgba(245,197,24,0.3)' }} />
                  <span>{dateStr} SAAT {timeStr}</span>
                </div>

                {/* CTA */}
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => onNavigate?.('match-center')}
                  className="flex items-center gap-3 px-7 py-4 rounded-2xl font-black uppercase italic text-sm transition-all"
                  style={{
                    background: '#F5C518',
                    color: '#000',
                    fontFamily: "'Barlow Condensed', Arial, sans-serif",
                    letterSpacing: '1px',
                    boxShadow: '0 0 32px rgba(245,197,24,0.25)',
                  }}
                >
                  <Zap className="w-4 h-4" />
                  MAÇ ANALİZİNE GİT
                  <ChevronRight className="w-4 h-4" />
                </motion.button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default MatchCenter;