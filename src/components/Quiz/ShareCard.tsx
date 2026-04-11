import React, { forwardRef } from 'react';
import { FACTION_PROFILES } from '../../constants/factionProfiles';

interface ShareCardProps {
  mainFactionName: string;
  nearbyFactions: string[];
  isHybrid: boolean;
  hybridFaction?: string;
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
  };
  return accents[name] || YELLOW;
};

const toUpperTR = (str: string): string =>
  str.replace(/i/g, 'İ').replace(/ı/g, 'I').toUpperCase();

const ShareCard = forwardRef<HTMLDivElement, ShareCardProps>(
  ({ mainFactionName, nearbyFactions, isHybrid, hybridFaction }, ref) => {
    const profile = FACTION_PROFILES[mainFactionName];
    const accent = getFactionAccent(mainFactionName);
    const displayNearby = nearbyFactions.slice(0, isHybrid ? 2 : 3);

    // Dynamic font size for long faction names
    const nameLength = mainFactionName.length;
    const nameFontSize = nameLength > 20 ? 64 : nameLength > 14 ? 80 : 96;

    return (
      <div
        ref={ref}
        style={{
          width: '1080px',
          height: '1080px',
          backgroundColor: DARK,
          borderRadius: '32px',
          display: 'flex',
          flexDirection: 'column',
          padding: '64px',
          position: 'relative',
          overflow: 'hidden',
          fontFamily: "'Arial Black', 'Arial Bold', Gadget, sans-serif",
          boxSizing: 'border-box',
        }}
      >
        {/* Accent glow — top left */}
        <div style={{
          position: 'absolute',
          top: '-100px',
          left: '-100px',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${accent}18 0%, transparent 70%)`,
          pointerEvents: 'none',
        }} />

        {/* Accent glow — bottom right */}
        <div style={{
          position: 'absolute',
          bottom: '-100px',
          right: '-100px',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${accent}10 0%, transparent 70%)`,
          pointerEvents: 'none',
        }} />

        {/* Vertical accent bar — left edge */}
        <div style={{
          position: 'absolute',
          left: 0,
          top: '20%',
          height: '60%',
          width: '4px',
          background: `linear-gradient(to bottom, transparent, ${accent}, transparent)`,
        }} />

        {/* ZONE 1 — Top bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '32px',
        }}>
          <div>
            <div style={{
              fontSize: '28px',
              fontWeight: '900',
              color: YELLOW,
              letterSpacing: '4px',
              lineHeight: 1,
              fontFamily: "'Arial Black', sans-serif",
            }}>
              FENERBAHÇE EVRENİ
            </div>
          </div>

          {/* Trophy badge */}
          <div style={{
            width: '72px',
            height: '72px',
            backgroundColor: '#1A2333',
            borderRadius: '16px',
            border: `1px solid ${YELLOW}30`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '32px',
          }}>
            🏆
          </div>
        </div>

        {/* ZONE 2 — Subtitle */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{
            fontSize: '16px',
            fontWeight: '700',
            color: MUTED,
            letterSpacing: '6px',
            textTransform: 'uppercase',
            fontFamily: 'Arial, sans-serif',
          }}>
            FRAKSİYON KİMLİK KARTI
          </div>
          <div style={{
            height: '1px',
            backgroundColor: MUTED,
            opacity: 0.15,
            marginTop: '16px',
          }} />
        </div>

        {/* ZONE 3 — Main result */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{
            fontSize: '15px',
            fontWeight: '700',
            color: MUTED,
            letterSpacing: '5px',
            textTransform: 'uppercase',
            marginBottom: '16px',
            fontFamily: 'Arial, sans-serif',
          }}>
            EVRENDEKİ YERLEŞİMİN
          </div>

          {/* Faction name */}
          <div style={{
            fontSize: `${nameFontSize}px`,
            fontWeight: '900',
            color: WHITE,
            lineHeight: 0.92,
            fontStyle: 'italic',
            textTransform: 'uppercase',
            fontFamily: "'Arial Black', sans-serif",
            letterSpacing: '-2px',
            wordBreak: 'break-word',
          }}>
            {toUpperTR(mainFactionName)}
          </div>

          {/* Accent underline */}
          <div style={{
            width: '80px',
            height: '4px',
            backgroundColor: accent,
            marginTop: '24px',
            borderRadius: '2px',
          }} />

          {/* ZONE 4 — Description */}
          {profile?.shortSummary && (
            <div style={{ marginTop: '40px', maxWidth: '880px' }}>
              <div style={{
                fontSize: '26px',
                color: WHITE,
                lineHeight: 1.5,
                fontStyle: 'italic',
                fontWeight: '500',
                opacity: 0.85,
                fontFamily: 'Arial, sans-serif',
              }}>
                "{profile.shortSummary}"
              </div>
            </div>
          )}
        </div>

        {/* ZONE 5 — Bottom section */}
        <div style={{ paddingTop: '40px' }}>
          <div style={{
            height: '1px',
            backgroundColor: MUTED,
            opacity: 0.15,
            marginBottom: '32px',
          }} />

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
          }}>
            {/* Nearby factions */}
            <div>
              <div style={{
                fontSize: '14px',
                fontWeight: '700',
                color: MUTED,
                letterSpacing: '4px',
                textTransform: 'uppercase',
                marginBottom: '16px',
                fontFamily: 'Arial, sans-serif',
              }}>
                YAKIN DAMARLAR
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {displayNearby.map((name) => (
                  <div key={name} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: accent,
                      flexShrink: 0,
                    }} />
                    <span style={{
                      fontSize: '22px',
                      color: WHITE,
                      fontWeight: '700',
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

            {/* Hybrid badge OR empty */}
            {isHybrid && hybridFaction && (
              <div style={{
                padding: '16px 24px',
                borderRadius: '16px',
                backgroundColor: `${YELLOW}08`,
                border: `1px solid ${YELLOW}25`,
                maxWidth: '280px',
              }}>
                <div style={{
                  fontSize: '12px',
                  fontWeight: '700',
                  color: YELLOW,
                  letterSpacing: '3px',
                  textTransform: 'uppercase',
                  marginBottom: '8px',
                  fontFamily: 'Arial, sans-serif',
                }}>
                  KARMA PROFİL
                </div>
                <div style={{
                  fontSize: '20px',
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

            {/* Social handle */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              gap: '6px',
            }}>
              <div style={{
                fontSize: '16px',
                fontWeight: '700',
                color: MUTED,
                fontFamily: 'Arial, sans-serif',
                letterSpacing: '1px',
              }}>
                @BasitBiOyun
              </div>
              <div style={{
                fontSize: '18px',
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
      </div>
    );
  }
);

ShareCard.displayName = 'ShareCard';
export default ShareCard;