import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import HeroSection from './HeroSection';
import TodayPulse from './TodayPulse';
import TransferRadar from './TransferRadar';
import SquadShowcase from './SquadShowcase';
import LeagueStrip from './LeagueStrip';
import NewsletterSection from './NewsletterSection';
import Footer from './Footer';
import SEO from './SEO';
interface HomePageProps {
  onEnterUniverse: () => void;
  onStartQuiz: () => void;
  onNavigate: (view: any) => void;
  articles?: any[];
  transferReports?: any[];
  playersList?: any[];
  pollValue?: any;
  homeSettings?: any;
}

/**
 * Ana sayfa — FE Signal / home.md
 * Yayın vitrini: hero → gündem hattı → nabız → derinlik.
 */
const HomePage: React.FC<HomePageProps> = ({
  onEnterUniverse,
  onStartQuiz,
  onNavigate,
  articles = [],
  homeSettings,
}) => {
  const homepageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Fenerbahçe Evreni',
    url: 'https://fenerbahceevreni.com',
    description:
      'Fenerbahçe maç analizleri, transfer radarları, oyuncu performansları ve taraftar nabzı için bağımsız yayın platformu.',
  };

  const showTransfer = homeSettings?.showScoutRadar !== false;
  const showSquad = homeSettings?.showPlayerRatings !== false;
  const showNewsletter = homeSettings?.showNewsletter !== false;

  const featuredArticle = useMemo(() => {
    const published = (articles || []).filter(
      (a) => a.status === 'published' || a.status === 'active' || !a.status
    );
    return published.find((a) => a.featured) || published[0] || null;
  }, [articles]);

  const todayLabel = new Intl.DateTimeFormat('tr-TR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date());

  return (
    <div className="fe-canvas min-h-screen overflow-x-hidden">
      <SEO
        title="Fenerbahçe Evreni | Bağımsız Fenerbahçe Analiz ve Taraftar Platformu"
        description="Fenerbahçe maç analizleri, transfer radarları, oyuncu performansları, taraftar anketleri ve premium raporları barındıran bağımsız analiz ve medya platformu."
        canonical="https://fenerbahceevreni.com"
        schema={homepageSchema}
      />

      <HeroSection
        onNavigate={onNavigate}
        onEnterUniverse={onEnterUniverse}
        homeSettings={homeSettings}
      />

      {/* Sarı Sinyal Gündem Hattı — home signature */}
      <div className="fe-agenda-line">
        <div className="fe-container py-3 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">
          <div className="flex items-stretch gap-3 min-w-0 flex-1">
            <div className="fe-signal-bar shrink-0" aria-hidden />
            <div className="min-w-0">
              <p className="text-[11px] fe-data font-medium text-[var(--fe-text-faint)] mb-0.5">
                Gündem · {todayLabel}
              </p>
              <p className="text-[14px] font-semibold text-[var(--fe-text-strong)] truncate">
                {featuredArticle?.title ||
                  'Bugünün nabzı: maç, analiz ve taraftar oyu tek bakışta'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 shrink-0 pl-3 sm:pl-0">
            <button
              type="button"
              onClick={() => onNavigate('match-center')}
              className="fe-btn-tertiary !text-[12px]"
            >
              Maç merkezi
            </button>
            <button
              type="button"
              onClick={() => onNavigate('analysis')}
              className="fe-btn-tertiary !text-[12px]"
            >
              Analizler
            </button>
          </div>
        </div>
      </div>

      {/* Hızlı erişim — metin rail, chip grid değil */}
      <nav
        aria-label="Yayın bölümleri"
        className="border-b border-[var(--fe-line-subtle)] py-2.5"
      >
        <div className="fe-container">
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
            {[
              { label: 'Maç merkezi', view: 'match-center' },
              { label: 'Analizler', view: 'analysis' },
              { label: 'Oyuncular', view: 'players' },
              { label: 'Taraftar', view: 'fan-room' },
              { label: 'Transfer', view: 'transfer-radar' },
            ].map((item) => (
              <button
                key={item.view}
                type="button"
                onClick={() => onNavigate(item.view)}
                className="shrink-0 px-3 py-2 text-[13px] font-medium text-[var(--fe-text-muted)] hover:text-[var(--fe-text-strong)] border-b-2 border-transparent hover:border-[var(--fe-yellow-line)] transition-colors cursor-pointer min-h-[44px]"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <TodayPulse onNavigate={onNavigate} articles={articles} />

      {showTransfer && (
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          viewport={{ once: true, margin: '-60px' }}
          className="[&_section]:!py-14"
        >
          <TransferRadar onNavigate={onNavigate} />
        </motion.div>
      )}

      {showSquad && (
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          viewport={{ once: true, margin: '-60px' }}
          className="[&_section]:!py-14"
        >
          <SquadShowcase onNavigate={onNavigate} />
        </motion.div>
      )}

      <div className="[&_section]:!py-10">
        <LeagueStrip onNavigate={onNavigate} />
      </div>

      {/* Fraksiyon — akışı kesmeyen, kontrollü davet */}
      <section className="py-14 md:py-16 border-y border-[var(--fe-line-subtle)]">
        <div className="fe-container">
          <div className="fe-surface p-6 md:p-8 relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[var(--fe-yellow-400)]" />
            {/* Subtle node hint */}
            <svg
              className="absolute right-4 top-1/2 -translate-y-1/2 opacity-[0.12] pointer-events-none hidden md:block"
              width="160"
              height="100"
              aria-hidden
            >
              <circle cx="30" cy="50" r="4" fill="var(--fe-yellow-400)" />
              <circle cx="80" cy="25" r="3" fill="var(--fe-text-muted)" />
              <circle cx="80" cy="75" r="3" fill="var(--fe-text-muted)" />
              <circle cx="130" cy="50" r="4" fill="var(--fe-text-muted)" />
              <line x1="34" y1="50" x2="76" y2="25" stroke="var(--fe-line)" />
              <line x1="34" y1="50" x2="76" y2="75" stroke="var(--fe-line)" />
              <line x1="84" y1="25" x2="126" y2="50" stroke="var(--fe-line)" />
              <line x1="84" y1="75" x2="126" y2="50" stroke="var(--fe-line)" />
            </svg>
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="max-w-lg">
                <div className="fe-signal-heading">
                  <span className="fe-signal-dot" />
                  <span className="fe-signal-line" />
                  <span className="fe-signal-label">Fraksiyon evreni</span>
                </div>
                <h2
                  className="text-xl md:text-2xl font-semibold text-[var(--fe-text-strong)] tracking-tight"
                  style={{ fontFamily: 'var(--fe-font-editorial)' }}
                >
                  Hangi fraksiyondansın?
                </h2>
                <p className="mt-2 text-[14px] text-[var(--fe-text-muted)] leading-relaxed">
                  Camianın taktik lobilerini keşfet — quiz ile profilini çıkar, haritayı gez.
                </p>
              </div>
              <div className="flex flex-wrap gap-2.5">
                <button type="button" onClick={onStartQuiz} className="fe-btn-primary">
                  Quiz’e başla
                </button>
                <button type="button" onClick={onEnterUniverse} className="fe-btn-secondary">
                  Evreni aç <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {showNewsletter && (
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          viewport={{ once: true, margin: '-60px' }}
          className="[&_section]:!py-14"
        >
          <NewsletterSection />
        </motion.div>
      )}

      <Footer onNavigate={onNavigate} />
    </div>
  );
};

export default HomePage;
