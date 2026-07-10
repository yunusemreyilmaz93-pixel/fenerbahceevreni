import React from 'react';

/** Gerçek gol verisinden 0-90 dakika zaman çizelgesi (SVG). */
export const GoalTimeline: React.FC<{
  goals: any[];
  homeTeam: string;
  awayTeam: string;
}> = ({ goals, homeTeam, awayTeam }) => {
  const W = 720,
    H = 132,
    PAD = 28;
  const axisY = H / 2 + 6;
  const minX = (m: number) => PAD + (Math.min(m, 95) / 95) * (W - PAD * 2);
  const sorted = [...goals].sort((a, b) => a.minute - b.minute);
  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full min-w-[520px]" role="img" aria-label="Gol zaman çizelgesi">
        <line x1={PAD} y1={axisY} x2={W - PAD} y2={axisY} stroke="rgba(255,255,255,0.14)" strokeWidth={2} />
        {[0, 15, 30, 45, 60, 75, 90].map((t) => (
          <g key={t}>
            <line x1={minX(t)} y1={axisY - 4} x2={minX(t)} y2={axisY + 4} stroke="rgba(255,255,255,0.25)" strokeWidth={1.5} />
            <text x={minX(t)} y={axisY + 20} textAnchor="middle" fontSize={10} fontFamily="monospace" fill="rgba(148,163,184,0.8)">
              {t}'
            </text>
          </g>
        ))}
        <line x1={minX(45)} y1={axisY - 26} x2={minX(45)} y2={axisY + 8} stroke="rgba(255,210,31,0.25)" strokeWidth={1} strokeDasharray="3 3" />
        <text x={minX(45)} y={axisY - 32} textAnchor="middle" fontSize={8.5} fontFamily="monospace" fill="rgba(255,210,31,0.55)">
          İY
        </text>
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
              <text x={x} y={isHome ? y - 12 : y + 4 + 14} textAnchor="middle" fontSize={9.5} fontWeight={800} fill={isHome ? '#FFD21F' : '#cbd5e1'}>
                {g.minute}'
              </text>
              <text x={x} y={labelY} textAnchor="middle" fontSize={9.5} fontWeight={700} fill="rgba(226,232,240,0.92)">
                {shortName}
                {own ? ' (k.k.)' : ''}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="flex items-center justify-center gap-5 text-[9px] font-mono font-bold uppercase tracking-widest text-slate-400 pb-1">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FFD21F] inline-block" /> {homeTeam}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-400 inline-block" /> {awayTeam}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full border-2 border-[#FFD21F] inline-block" /> Kendi kalesine
        </span>
      </div>
    </div>
  );
};

/** Gerçek gol verisinden kümülatif skor akışı (adım grafiği, SVG). */
export const ScoreFlow: React.FC<{
  goals: any[];
  homeTeam: string;
  awayTeam: string;
  finalHome: number;
  finalAway: number;
}> = ({ goals, homeTeam, awayTeam, finalHome, finalAway }) => {
  const W = 720,
    H = 190,
    PADX = 34,
    PADY = 22;
  const maxGoals = Math.max(finalHome, finalAway, 1);
  const x = (m: number) => PADX + (Math.min(m, 95) / 95) * (W - PADX * 2);
  const y = (g: number) => H - PADY - (g / maxGoals) * (H - PADY * 2);
  const sorted = [...goals].sort((a, b) => a.minute - b.minute);

  const buildPath = (team: 'home' | 'away') => {
    let cur = 0;
    let d = `M ${x(0)} ${y(0)}`;
    sorted.forEach((g) => {
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
        {Array.from({ length: maxGoals + 1 }, (_, i) => (
          <g key={i}>
            <line x1={PADX} y1={y(i)} x2={W - PADX} y2={y(i)} stroke="rgba(255,255,255,0.05)" strokeWidth={1} />
            <text x={PADX - 8} y={y(i) + 3} textAnchor="end" fontSize={9} fontFamily="monospace" fill="rgba(148,163,184,0.7)">
              {i}
            </text>
          </g>
        ))}
        {[0, 45, 90].map((t) => (
          <text key={t} x={x(t)} y={H - 4} textAnchor="middle" fontSize={9} fontFamily="monospace" fill="rgba(148,163,184,0.7)">
            {t}'
          </text>
        ))}
        <path d={buildPath('away')} fill="none" stroke="#64748b" strokeWidth={2} strokeLinejoin="round" />
        <path d={buildPath('home')} fill="none" stroke="#FFD21F" strokeWidth={2.5} strokeLinejoin="round" />
        {sorted.map((g, i) => {
          let cum = 0;
          sorted.slice(0, i + 1).forEach((gg) => {
            if (gg.team === g.team) cum += 1;
          });
          return (
            <circle
              key={i}
              cx={x(g.minute)}
              cy={y(cum)}
              r={4}
              fill={g.team === 'home' ? '#FFD21F' : '#94a3b8'}
              stroke="#0b101c"
              strokeWidth={2}
            />
          );
        })}
      </svg>
      <div className="flex items-center justify-center gap-5 text-[9px] font-mono font-bold uppercase tracking-widest text-slate-400 pb-1">
        <span className="flex items-center gap-1.5">
          <span className="w-4 h-[3px] bg-[#FFD21F] inline-block rounded" /> {homeTeam}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-4 h-[3px] bg-slate-500 inline-block rounded" /> {awayTeam}
        </span>
      </div>
    </div>
  );
};
