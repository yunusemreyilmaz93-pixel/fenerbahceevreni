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
  };
  return accents[name] || YELLOW;
};

const toUpperTR = (str: string): string =>
  str.replace(/i/g, 'İ').replace(/ı/g, 'I').toUpperCase();

const ShareCard = forwardRef<HTMLDivElement, ShareCardProps>(
  ({ mode = 'result', mainFactionName, nearbyFactions = [], isHybrid = false, hybridFaction, faction }, ref) => {
    const profile = faction || FACTION_PROFILES[mainFactionName];
    const accent = getFactionAccent(mainFactionName);
    const displayNearby = nearbyFactions.slice(0, isHybrid ? 2 : 3);
    const isDossier = mode === 'dossier';

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
        {/* Accent glow — top left */}
        <div style={{
          position: 'absolute',
          top: '-100px',
          left: '-100px',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${accent}20 0%, transparent 70%)`,
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
          background: `radial-gradient(circle, ${accent}15 0%, transparent 70%)`,
          pointerEvents: 'none',
        }} />

        {/* ZONE 1 — Top bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '48px',
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
            width: '80px',
            height: '80px',
            backgroundColor: '#1A2333',
            borderRadius: '20px',
            border: `1px solid ${YELLOW}30`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '40px',
          }}>
            {isDossier ? '📁' : '🏆'}
          </div>
        </div>

        <div style={{
          height: '2px',
          background: `linear-gradient(to right, ${accent}, transparent)`,
          marginBottom: '60px',
          opacity: 0.5,
        }} />

        {/* ZONE 3 — Main result / Faction Name */}
        <div style={{ marginBottom: isDossier ? '60px' : '0', flex: isDossier ? 'none' : 1, display: 'flex', flexDirection: 'column', justifyContent: isDossier ? 'flex-start' : 'center' }}>
          <div style={{
            fontSize: '18px',
            fontWeight: '700',
            color: accent,
            letterSpacing: '6px',
            textTransform: 'uppercase',
            marginBottom: '20px',
            fontFamily: 'Arial, sans-serif',
          }}>
            {isDossier ? 'FRAKSİYON TANIMI' : 'EVRENDEKİ YERLEŞİMİN'}
          </div>

          <div style={{
            fontSize: `${nameFontSize}px`,
            fontWeight: '900',
            color: WHITE,
            lineHeight: 1,
            fontStyle: 'italic',
            textTransform: 'uppercase',
            fontFamily: "'Arial Black', sans-serif",
            letterSpacing: '-2px',
          }}>
            {toUpperTR(mainFactionName)}
          </div>

          {profile?.motto && (
            <div style={{
              marginTop: '24px',
              fontSize: '24px',
              color: YELLOW,
              fontWeight: '900',
              fontStyle: 'italic',
              letterSpacing: '2px',
            }}>
              "{toUpperTR(profile.motto)}"
            </div>
          )}
        </div>

        {isDossier ? (
          /* DOSSIER MODE CONTENT */
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '48px' }}>
            {/* Identity Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
              <div style={{ padding: '24px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: '14px', color: MUTED, fontWeight: '700', marginBottom: '12px', letterSpacing: '2px' }}>KARAKTER / VIBE</div>
                <div style={{ fontSize: '20px', color: WHITE, fontWeight: '700' }}>{profile.vibe || 'BİLİNMİYOR'}</div>
              </div>
              <div style={{ padding: '24px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: '14px', color: MUTED, fontWeight: '700', marginBottom: '12px', letterSpacing: '2px' }}>GENEL TON</div>
                <div style={{ fontSize: '20px', color: WHITE, fontWeight: '700' }}>{profile.tone || 'BİLİNMİYOR'}</div>
              </div>
            </div>

            {/* Representation */}
            {profile.representation && (
              <div style={{ padding: '24px', backgroundColor: 'rgba(254, 221, 0, 0.03)', borderRadius: '16px', border: `1px solid ${YELLOW}20` }}>
                <div style={{ fontSize: '14px', color: YELLOW, fontWeight: '900', marginBottom: '12px', letterSpacing: '2px' }}>TEMSİLİYET</div>
                <div style={{ fontSize: '20px', color: WHITE, fontWeight: '500', fontStyle: 'italic', lineHeight: 1.4 }}>
                  "{profile.representation}"
                </div>
              </div>
            )}

            {/* Philosophy */}
            {profile.philosophy && (
              <div style={{ spaceY: '16px' }}>
                <div style={{ fontSize: '16px', color: YELLOW, fontWeight: '900', letterSpacing: '4px', marginBottom: '16px' }}>FELSEFESİ</div>
                <div style={{ fontSize: '24px', color: WHITE, lineHeight: 1.6, fontStyle: 'italic', opacity: 0.9 }}>
                  "{profile.philosophy}"
                </div>
              </div>
            )}

            {/* Highlights */}
            {profile.highlights && (
              <div style={{ spaceY: '16px' }}>
                <div style={{ fontSize: '16px', color: YELLOW, fontWeight: '900', letterSpacing: '4px', marginBottom: '16px' }}>ÖNE ÇIKANLAR</div>
                <div style={{ fontSize: '24px', color: WHITE, lineHeight: 1.4, fontWeight: '800' }}>
                  {profile.highlights}
                </div>
              </div>
            )}

            {/* Description */}
            {profile.description && (
              <div style={{ spaceY: '16px' }}>
                <div style={{ fontSize: '16px', color: YELLOW, fontWeight: '900', letterSpacing: '4px', marginBottom: '16px' }}>ANALİZ VE DETAYLAR</div>
                <div style={{ fontSize: '22px', color: MUTED, lineHeight: 1.6 }}>
                  {profile.description}
                </div>
              </div>
            )}

            {/* Relations */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
              <div>
                <div style={{ fontSize: '14px', color: '#22C55E', fontWeight: '900', letterSpacing: '2px', marginBottom: '16px' }}>YAKIN / BENZER</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {profile.relatedFactions?.similar?.map(name => (
                    <div key={name} style={{ fontSize: '18px', color: WHITE, fontWeight: '700' }}>• {name}</div>
                  ))}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '14px', color: '#EF4444', fontWeight: '900', letterSpacing: '2px', marginBottom: '16px' }}>UZAK / ZIT</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {profile.relatedFactions?.opposite?.map(name => (
                    <div key={name} style={{ fontSize: '18px', color: WHITE, fontWeight: '700' }}>• {name}</div>
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
            
            <div style={{ flex: 1 }} />

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

                {/* Hybrid badge */}
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
              </div>
            </div>
          </>
        )}

        {/* Footer — Common for both */}
        <div style={{ marginTop: '60px' }}>
          <div style={{
            height: '1px',
            backgroundColor: MUTED,
            opacity: 0.15,
            marginBottom: '32px',
          }} />
          
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <div style={{ display: 'flex', gap: '24px' }}>
              {isDossier && profile.tags?.slice(0, 3).map(tag => (
                <div key={tag} style={{ fontSize: '16px', color: MUTED, fontWeight: '700' }}>#{toUpperTR(tag)}</div>
              ))}
            </div>

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