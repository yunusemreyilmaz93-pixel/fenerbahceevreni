import React, { useMemo } from 'react';

export interface ShotEventViz {
  x: number | null;
  y: number | null;
  xG?: number | null;
  playerName?: string | null;
  outcome?: string | null;
  minute?: number | null;
  isHome?: boolean | null;
  teamId?: string | number | null;
}

interface ShotmapPitchProps {
  shots: ShotEventViz[];
  homeTeam?: string;
  awayTeam?: string;
  /** FotMob shot coords often 0-100; some 0-105 pitch */
  className?: string;
}

/**
 * Basit SVG saha + şut haritası.
 * Koordinat: x yatay (0-100 sol→sağ), y dikey (0-100 üst→alt) varsayımı.
 * isHome=false şutlar ayna (rakip yönü) çizilir.
 */
export const ShotmapPitch: React.FC<ShotmapPitchProps> = ({
  shots,
  homeTeam = 'Ev',
  awayTeam = 'Dep',
  className = '',
}) => {
  const W = 680;
  const H = 440;
  const PAD = 16;

  const points = useMemo(() => {
    return (shots || [])
      .map((s, i) => {
        let x = s.x;
        let y = s.y;
        if (x == null || y == null || Number.isNaN(Number(x)) || Number.isNaN(Number(y))) {
          return null;
        }
        let nx = Number(x);
        let ny = Number(y);
        // normalize if 0-1
        if (nx <= 1.5 && ny <= 1.5) {
          nx *= 100;
          ny *= 100;
        }
        // FotMob bazen 0-105 / 0-68 — 100'e sıkıştır
        if (nx > 100 || ny > 100) {
          nx = (nx / 105) * 100;
          ny = (ny / 68) * 100;
        }
        // Away shots: mirror so both attack same visual direction optional —
        // keep raw; color by isHome
        const isHome = s.isHome !== false;
        const cx = PAD + (nx / 100) * (W - PAD * 2);
        const cy = PAD + (ny / 100) * (H - PAD * 2);
        const xg = s.xG != null ? Number(s.xG) : 0;
        const r = 4 + Math.min(14, xg * 18);
        return { ...s, i, cx, cy, r, isHome, xg };
      })
      .filter(Boolean) as Array<
      ShotEventViz & { i: number; cx: number; cy: number; r: number; isHome: boolean; xg: number }
    >;
  }, [shots]);

  if (!points.length) {
    return (
      <div className={`p-6 rounded-2xl bg-[#0b101c] border border-white/[0.06] text-center ${className}`}>
        <p className="text-xs text-slate-500 font-semibold">Bu maç için şut haritası noktası yok.</p>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl bg-[#0b101c] border border-white/[0.06] overflow-hidden ${className}`}>
      <div className="px-4 py-3 border-b border-white/[0.05] flex flex-wrap items-center justify-between gap-2">
        <span className="text-[10px] font-black uppercase tracking-widest text-[#FFD21F] font-mono">
          Şut haritası · {points.length} şut
        </span>
        <div className="flex items-center gap-4 text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FFD21F] inline-block" /> {homeTeam}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400 inline-block" /> {awayTeam}
          </span>
          <span className="text-slate-500 normal-case">daire boyutu ≈ xG</span>
        </div>
      </div>
      <div className="p-3 md:p-4 overflow-x-auto">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full min-w-[300px] max-h-[420px]"
          role="img"
          aria-label="Maç şut haritası"
        >
          {/* pitch */}
          <rect x={0} y={0} width={W} height={H} fill="#0a3d1f" />
          <rect
            x={PAD}
            y={PAD}
            width={W - PAD * 2}
            height={H - PAD * 2}
            fill="#0d4a26"
            stroke="rgba(255,255,255,0.35)"
            strokeWidth={2}
          />
          {/* halfway */}
          <line
            x1={W / 2}
            y1={PAD}
            x2={W / 2}
            y2={H - PAD}
            stroke="rgba(255,255,255,0.3)"
            strokeWidth={1.5}
          />
          <circle cx={W / 2} cy={H / 2} r={48} fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth={1.5} />
          <circle cx={W / 2} cy={H / 2} r={3} fill="rgba(255,255,255,0.4)" />
          {/* boxes */}
          <rect
            x={PAD}
            y={H * 0.28}
            width={70}
            height={H * 0.44}
            fill="none"
            stroke="rgba(255,255,255,0.28)"
            strokeWidth={1.5}
          />
          <rect
            x={W - PAD - 70}
            y={H * 0.28}
            width={70}
            height={H * 0.44}
            fill="none"
            stroke="rgba(255,255,255,0.28)"
            strokeWidth={1.5}
          />
          {/* shots */}
          {points.map((p) => (
            <g key={p.i}>
              <circle
                cx={p.cx}
                cy={p.cy}
                r={p.r}
                fill={p.isHome ? 'rgba(255,210,31,0.75)' : 'rgba(56,189,248,0.7)'}
                stroke={p.isHome ? '#FFD21F' : '#38bdf8'}
                strokeWidth={1.2}
                opacity={0.9}
              >
                <title>
                  {[
                    p.playerName || 'Oyuncu',
                    p.minute != null ? `${p.minute}'` : '',
                    p.xg ? `xG ${p.xg.toFixed(2)}` : '',
                    p.outcome || '',
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </title>
              </circle>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
};

export default ShotmapPitch;
