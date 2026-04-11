import React, { forwardRef } from 'react';
import { FACTION_PROFILES } from '../../constants/factionProfiles';
import { FactionNode } from '../../types';

interface ShareCardProps {
  mode?: 'result' | 'dossier';
  mainFactionName: string;
  nearbyFactions?: string[];
  isHybrid?: boolean;
  hybridFaction?: string;
  faction?: FactionNode;
}

// Fully inline-styled, export-safe ShareCard.
// No Tailwind classes. No Lucide icons. No blur effects.
// Designed to be rendered at exactly 1080x1080px and captured with html-to-image.

const YELLOW = '#F5C518';
const DARK = '#0D1117';
const NAVY = '#0F1923';
const MUTED = '#8B9BB4';
const WHITE = '#FFFFFF';

const getFactionAccent = (name: string): string => {
  const accents: Record<string, string> = {
    'Balkan Lobisi': '#DC2626',
    'Alman Ekolücüler': '#3B82F6',
    'Portekiz Lobisi': '#D97706',
    'Camia Evladıcılar': '#F5C518',
    'Ahrazbahçeliler': '#9333EA',
    'Ütopikçiler': '#06B6D4',
    'Anadolu İrfanı': '#EA580C',
    'Hollanda Lobisi': '#F97316',
    'İsim Takıntılıları': '#10B981',
    'Hacı İsmail Kartalcılar': '#F5C518',
    'Aykutçular': '#64748B',
    'Düz Fenerbahçeliler': '#1E3A5F',
    'Esporcular': '#00F2FF',
    'Basket Tayfa': '#FF6B00',
    'Voleybol Tayfa': '#FF007A',
    'Arjantin Lobisi': '#75AADB',
    'Brezilya Lobisi': '#009739',
  };
  return accents[name] || YELLOW;
};

const getFactionIcon = (name: string): string => {
  if (name.includes('Balkan')) return '⚔️';
  if (name.includes('Alman')) return '⚙️';
  if (name.includes('Portekiz')) return '🍷';
  if (name.includes('Hollanda')) return '🌷';
  if (name.includes('Brezilya')) return '⚽';
  if (name.includes('Arjantin')) return '🧉';
  if (name.includes('Basket')) return '🏀';
  if (name.includes('Voleybol')) return '🏐';
  if (name.includes('Espor')) return '🎮';
  if (name.includes('İsim')) return '💎';
  if (name.includes('Ütopik')) return '🚀';
  if (name.includes('Anadolu')) return '🌾';
  if (name.includes('Aykut')) return '📐';
  if (name.includes('Camia')) return '🏠';
  if (name.includes('İsmail')) return '📿';
  return '🛡️';
};

const getRadarData = (name: string) => {
  // Deterministic values based on name for variety
  const s = name.length;
  return [
    { label: 'KAOS', value: 30 + (s * 7) % 70 },
    { label: 'ROMANTİZM', value: 20 + (s * 13) % 80 },
    { label: 'TAKTIK', value: 40 + (s * 3) % 60 },
    { label: 'NOSTALJI', value: 10 + (s * 17) % 90 },
    { label: 'REALIZM', value: 20 + (s * 5) % 80 },
  ];
};

const RadarChart = ({ data, color }: { data: { label: string, value: number }[], color: string }) => {
  const size = 300;
  const center = size / 2;
  const radius = size * 0.35;
  const angleStep = (Math.PI * 2) / data.length;

  const points = data.map((d, i) => {
    const r = (d.value / 100) * radius;
    const x = center + r * Math.cos(i * angleStep - Math.PI / 2);
    const y = center + r * Math.sin(i * angleStep - Math.PI / 2);
    return `${x},${y}`;
  }).join(' ');

  const gridLevels = [0.25, 0.5, 0.75, 1];

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ overflow: 'visible' }}>
        {/* Grid lines */}
        {gridLevels.map(level => (
          <polygon
            key={level}
            points={data.map((_, i) => {
              const r = radius * level;
              const x = center + r * Math.cos(i * angleStep - Math.PI / 2);
              const y = center + r * Math.sin(i * angleStep - Math.PI / 2);
              return `${x},${y}`;
            }).join(' ')}
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="1"
          />
        ))}
        {/* Axis lines */}
        {data.map((_, i) => {
          const x = center + radius * Math.cos(i * angleStep - Math.PI / 2);
          const y = center + radius * Math.sin(i * angleStep - Math.PI / 2);
          return <line key={i} x1={center} y1={center} x2={x} y2={y} stroke="rgba(255,255,255,0.1)" strokeWidth="1" />;
        })}
        {/* Data polygon */}
        <polygon
          points={points}
          fill={`${color}33`}
          stroke={color}
          strokeWidth="3"
        />
        {/* Labels */}
        {data.map((d, i) => {
          const r = radius + 35;
          const x = center + r * Math.cos(i * angleStep - Math.PI / 2);
          const y = center + r * Math.sin(i * angleStep - Math.PI / 2);
          return (
            <text
              key={i}
              x={x}
              y={y}
              fill={MUTED}
              fontSize="12"
              fontWeight="900"
              textAnchor="middle"
              alignmentBaseline="middle"
              style={{ fontFamily: 'Arial, sans-serif', letterSpacing: '1px' }}
            >
              {d.label}
            </text>
          );
        })}
      </svg>
    </div>
  );
};

const toUpperTR = (str: string): string =>
  str.replace(/i/g, 'İ').replace(/ı/g, 'I').toUpperCase();

const ShareCard = forwardRef<HTMLDivElement, ShareCardProps>(
  ({ mode = 'result', mainFactionName, nearbyFactions = [], isHybrid = false, hybridFaction, faction }, ref) => {
    const profile = faction || FACTION_PROFILES[mainFactionName];
    const accent = getFactionAccent(mainFactionName);
    const displayNearby = nearbyFactions.slice(0, isHybrid ? 2 : 3);
    const isDossier = mode === 'dossier';
    const radarData = getRadarData(mainFactionName);

    // Dynamic font size for long faction names
    const nameLength = mainFactionName.length;
    const nameFontSize = isDossier ? (nameLength > 20 ? 48 : 64) : (nameLength > 20 ? 64 : nameLength > 14 ? 80 : 96);

    return (
      <div
        ref={ref}
        style={{
          width: '1080px',
          height: isDossier ? '1920px' : '1080px',
          backgroundColor: DARK,
          borderRadius: isDossier ? '0' : '32px',
          display: 'flex',
          flexDirection: 'column',
          padding: '80px',
          position: 'relative',
          overflow: 'hidden',
          fontFamily: "'Arial Black', 'Arial Bold', Gadget, sans-serif",
          boxSizing: 'border-box',
        }}
      >
        {/* Background Pattern */}
        <div style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.03,
          backgroundImage: `radial-gradient(${accent} 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
          pointerEvents: 'none',
        }} />

        {/* Accent glow — top left */}
        <div style={{
          position: 'absolute',
          top: '-100px',
          left: '-100px',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${accent}25 0%, transparent 70%)`,
          pointerEvents: 'none',
        }} />

        {/* Accent glow — bottom right */}
        <div style={{
          position: 'absolute',
          bottom: '-100px',
          right: '-100px',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${accent}20 0%, transparent 70%)`,
          pointerEvents: 'none',
        }} />

        {/* ZONE 1 — Top bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '48px',
          zIndex: 10,
        }}>
          <div>
            <div style={{
              fontSize: '32px',
              fontWeight: '900',
              color: YELLOW,
              letterSpacing: '6px',
              lineHeight: 1,
              fontFamily: "'Arial Black', sans-serif",
            }}>
              FENERBAHÇE EVRENİ
            </div>
            <div style={{
              fontSize: '14px',
              color: MUTED,
              marginTop: '12px',
              letterSpacing: '4px',
              fontWeight: '700',
            }}>
              {isDossier ? 'STRATEJİK İSTİHBARAT DOSYASI' : 'FRAKSİYON KİMLİK KARTI'}
            </div>
          </div>

          <div style={{
            width: '100px',
            height: '100px',
            backgroundColor: '#1A2333',
            borderRadius: '24px',
            border: `2px solid ${accent}40`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '50px',
            boxShadow: `0 0 40px ${accent}15`,
          }}>
            {getFactionIcon(mainFactionName)}
          </div>
        </div>

        <div style={{
          height: '4px',
          background: `linear-gradient(to right, ${accent}, ${accent}33, transparent)`,
          marginBottom: '60px',
          borderRadius: '2px',
        }} />

        {/* ZONE 3 — Main result / Faction Name */}
        <div style={{ 
          marginBottom: isDossier ? '60px' : '0', 
          flex: isDossier ? 'none' : 1, 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: isDossier ? 'flex-start' : 'center',
          zIndex: 10,
        }}>
          <div style={{
            fontSize: '18px',
            fontWeight: '900',
            color: accent,
            letterSpacing: '8px',
            textTransform: 'uppercase',
            marginBottom: '24px',
            fontFamily: 'Arial, sans-serif',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}>
            <div style={{ width: '40px', height: '2px', backgroundColor: accent }} />
            {isDossier ? 'FRAKSİYON TANIMI' : 'EVRENDEKİ YERLEŞİMİN'}
          </div>

          <div style={{
            fontSize: `${nameFontSize}px`,
            fontWeight: '900',
            color: WHITE,
            lineHeight: 0.9,
            fontStyle: 'italic',
            textTransform: 'uppercase',
            fontFamily: "'Arial Black', sans-serif",
            letterSpacing: '-3px',
            textShadow: `0 10px 30px rgba(0,0,0,0.5)`,
          }}>
            {toUpperTR(mainFactionName)}
          </div>

          {profile?.motto && (
            <div style={{
              marginTop: '32px',
              fontSize: '28px',
              color: YELLOW,
              fontWeight: '900',
              fontStyle: 'italic',
              letterSpacing: '3px',
              backgroundColor: 'rgba(0,0,0,0.3)',
              padding: '12px 20px',
              borderRadius: '8px',
              display: 'inline-block',
              alignSelf: 'flex-start',
            }}>
              "{toUpperTR(profile.motto)}"
            </div>
          )}
        </div>

        {isDossier ? (
          /* DOSSIER MODE CONTENT */
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '48px', zIndex: 10 }}>
            {/* Identity Grid & Radar */}
            <div style={{ display: 'flex', gap: '48px', alignItems: 'flex-start' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '32px' }}>
                <div style={{ padding: '32px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ fontSize: '14px', color: MUTED, fontWeight: '900', marginBottom: '16px', letterSpacing: '3px' }}>KARAKTER / VIBE</div>
                  <div style={{ fontSize: '24px', color: WHITE, fontWeight: '900', textTransform: 'uppercase' }}>{profile.vibe || 'BİLİNMİYOR'}</div>
                </div>
                <div style={{ padding: '32px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ fontSize: '14px', color: MUTED, fontWeight: '900', marginBottom: '16px', letterSpacing: '3px' }}>GENEL TON</div>
                  <div style={{ fontSize: '24px', color: WHITE, fontWeight: '900', textTransform: 'uppercase' }}>{profile.tone || 'BİLİNMİYOR'}</div>
                </div>
              </div>
              
              <div style={{ 
                padding: '40px', 
                backgroundColor: 'rgba(0,0,0,0.4)', 
                borderRadius: '32px', 
                border: `1px solid ${accent}33`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}>
                <div style={{ fontSize: '14px', color: accent, fontWeight: '900', marginBottom: '24px', letterSpacing: '4px' }}>AURA HARİTASI</div>
                <RadarChart data={radarData} color={accent} />
              </div>
            </div>

            {/* Representation */}
            {profile.representation && (
              <div style={{ padding: '40px', backgroundColor: `${accent}08`, borderRadius: '24px', border: `1px solid ${accent}20`, position: 'relative' }}>
                <div style={{ position: 'absolute', top: '20px', right: '30px', fontSize: '60px', opacity: 0.1, color: accent }}>"</div>
                <div style={{ fontSize: '14px', color: accent, fontWeight: '900', marginBottom: '20px', letterSpacing: '4px' }}>TEMSİLİYET</div>
                <div style={{ fontSize: '24px', color: WHITE, fontWeight: '500', fontStyle: 'italic', lineHeight: 1.5 }}>
                  {profile.representation}
                </div>
              </div>
            )}

            {/* Philosophy & Highlights */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px' }}>
              {profile.philosophy && (
                <div style={{ padding: '32px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '24px', borderLeft: `8px solid ${YELLOW}` }}>
                  <div style={{ fontSize: '16px', color: YELLOW, fontWeight: '900', letterSpacing: '4px', marginBottom: '20px' }}>FELSEFESİ</div>
                  <div style={{ fontSize: '22px', color: WHITE, lineHeight: 1.6, fontStyle: 'italic', opacity: 0.9 }}>
                    {profile.philosophy}
                  </div>
                </div>
              )}
              {profile.highlights && (
                <div style={{ padding: '32px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '24px', borderLeft: `8px solid ${accent}` }}>
                  <div style={{ fontSize: '16px', color: accent, fontWeight: '900', letterSpacing: '4px', marginBottom: '20px' }}>ÖNE ÇIKANLAR</div>
                  <div style={{ fontSize: '22px', color: WHITE, lineHeight: 1.5, fontWeight: '800' }}>
                    {profile.highlights}
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            {profile.description && (
              <div style={{ padding: '40px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: '16px', color: YELLOW, fontWeight: '900', letterSpacing: '4px', marginBottom: '20px' }}>ANALİZ VE DETAYLAR</div>
                <div style={{ fontSize: '24px', color: MUTED, lineHeight: 1.6 }}>
                  {profile.description}
                </div>
              </div>
            )}

            {/* Relations */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px' }}>
              <div style={{ padding: '32px', backgroundColor: 'rgba(34, 197, 94, 0.05)', borderRadius: '24px', border: '1px solid rgba(34, 197, 94, 0.1)' }}>
                <div style={{ fontSize: '16px', color: '#22C55E', fontWeight: '900', letterSpacing: '3px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#22C55E' }} />
                  MÜTTEFİK / BENZER
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {profile.relatedFactions?.similar?.map(name => (
                    <div key={name} style={{ fontSize: '20px', color: WHITE, fontWeight: '800' }}>{toUpperTR(name)}</div>
                  ))}
                </div>
              </div>
              <div style={{ padding: '32px', backgroundColor: 'rgba(239, 68, 68, 0.05)', borderRadius: '24px', border: '1px solid rgba(239, 68, 68, 0.1)' }}>
                <div style={{ fontSize: '16px', color: '#EF4444', fontWeight: '900', letterSpacing: '3px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#EF4444' }} />
                  EZELİ RAKİP / ZIT
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {profile.relatedFactions?.opposite?.map(name => (
                    <div key={name} style={{ fontSize: '20px', color: WHITE, fontWeight: '800' }}>{toUpperTR(name)}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* RESULT MODE CONTENT (Existing) */
          <>
            {/* ZONE 4 — Description */}
            {profile?.shortSummary && (
              <div style={{ marginTop: '40px', maxWidth: '880px', zIndex: 10 }}>
                <div style={{
                  fontSize: '32px',
                  color: WHITE,
                  lineHeight: 1.4,
                  fontStyle: 'italic',
                  fontWeight: '500',
                  opacity: 0.9,
                  fontFamily: 'Arial, sans-serif',
                  borderLeft: `12px solid ${accent}`,
                  paddingLeft: '40px',
                }}>
                  "{profile.shortSummary}"
                </div>
              </div>
            )}
            
            <div style={{ flex: 1 }} />

            {/* ZONE 5 — Bottom section */}
            <div style={{ paddingTop: '40px', zIndex: 10 }}>
              <div style={{
                height: '2px',
                backgroundColor: MUTED,
                opacity: 0.1,
                marginBottom: '48px',
              }} />

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
              }}>
                {/* Nearby factions */}
                <div>
                  <div style={{
                    fontSize: '16px',
                    fontWeight: '900',
                    color: MUTED,
                    letterSpacing: '5px',
                    textTransform: 'uppercase',
                    marginBottom: '24px',
                    fontFamily: 'Arial, sans-serif',
                  }}>
                    YAKIN DAMARLAR
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {displayNearby.map((name) => (
                      <div key={name} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          backgroundColor: accent,
                          flexShrink: 0,
                          boxShadow: `0 0 15px ${accent}`,
                        }} />
                        <span style={{
                          fontSize: '28px',
                          color: WHITE,
                          fontWeight: '900',
                          textTransform: 'uppercase',
                          letterSpacing: '-0.5px',
                          fontFamily: "'Arial Black', sans-serif",
                        }}>
                          {toUpperTR(name)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Hybrid badge */}
                {isHybrid && hybridFaction && (
                  <div style={{
                    padding: '24px 32px',
                    borderRadius: '24px',
                    backgroundColor: `${YELLOW}10`,
                    border: `2px solid ${YELLOW}30`,
                    maxWidth: '350px',
                    boxShadow: `0 10px 40px rgba(0,0,0,0.3)`,
                  }}>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: '900',
                      color: YELLOW,
                      letterSpacing: '4px',
                      textTransform: 'uppercase',
                      marginBottom: '12px',
                      fontFamily: 'Arial, sans-serif',
                    }}>
                      KARMA PROFİL
                    </div>
                    <div style={{
                      fontSize: '28px',
                      fontWeight: '900',
                      color: YELLOW,
                      fontStyle: 'italic',
                      textTransform: 'uppercase',
                      fontFamily: "'Arial Black', sans-serif",
                    }}>
                      {toUpperTR(hybridFaction)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Footer — Common for both */}
        <div style={{ marginTop: '60px', zIndex: 10 }}>
          <div style={{
            height: '2px',
            backgroundColor: MUTED,
            opacity: 0.1,
            marginBottom: '40px',
          }} />
          
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <div style={{ display: 'flex', gap: '32px' }}>
              {isDossier && profile.tags?.slice(0, 4).map(tag => (
                <div key={tag} style={{ 
                  fontSize: '18px', 
                  color: WHITE, 
                  fontWeight: '900', 
                  letterSpacing: '2px',
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  padding: '8px 16px',
                  borderRadius: '8px',
                }}>#{toUpperTR(tag)}</div>
              ))}
            </div>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              gap: '8px',
            }}>
              <div style={{
                fontSize: '18px',
                fontWeight: '900',
                color: MUTED,
                fontFamily: 'Arial, sans-serif',
                letterSpacing: '2px',
              }}>
                @BasitBiOyun
              </div>
              <div style={{
                fontSize: '22px',
                fontWeight: '900',
                color: YELLOW,
                fontFamily: "'Arial Black', sans-serif",
                letterSpacing: '1px',
              }}>
                fenerbahceevreni.com
              </div>
            </div>
          </div>
        </div>

        {/* Dossier Stamp */}
        {isDossier && (
          <div style={{
            position: 'absolute',
            top: '400px',
            right: '80px',
            width: '250px',
            height: '100px',
            border: `6px solid ${accent}44`,
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: `${accent}44`,
            fontSize: '40px',
            fontWeight: '900',
            transform: 'rotate(-15deg)',
            pointerEvents: 'none',
            letterSpacing: '8px',
            fontFamily: "'Arial Black', sans-serif",
          }}>
            ONAYLANDI
          </div>
        )}
      </div>
    );
  }
);

ShareCard.displayName = 'ShareCard';
export default ShareCard;