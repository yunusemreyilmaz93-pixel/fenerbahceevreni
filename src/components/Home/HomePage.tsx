import React from 'react';
import { motion } from 'motion/react';
import {
  Calendar,
  BookOpen,
  Users,
  MessageSquare,
  Radar,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
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
 * Ana sayfa — hero → nabız → derinlik.
 * Premium surface dili; sahte spor verisi yok.
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
      'Fenerbahçe maç analizleri, transfer radarları, oyuncu performansları, taraftar anketleri ve premium raporlar için bağımsız analiz platformu.',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://fenerbahceevreni.com/analizler?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  };

  const showTransfer = homeSettings?.showScoutRadar !== false;
  const showSquad = homeSettings?.showPlayerRatings !== false;
  const showNewsletter = homeSettings?.showNewsletter !== false;

  return (
    <div className="ui-page-bg min-h-screen overflow-x-hidden">
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

      {/* Hızlı erişim */}
      <nav
        aria-label="Hızlı erişim"
        className="py-3.5 border-b border-white/[0.06] relative z-20 bg-[#060a12]/70 backdrop-blur-md"
      >
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="flex items-center justify-start md:justify-center gap-2 overflow-x-auto pb-0.5 scrollbar-none">
            {[
              { label: 'Maç merkezi', view: 'match-center', icon: Calendar },
              { label: 'Analizler', view: 'analysis', icon: BookOpen },
              { label: 'Kadro', view: 'players', icon: Users },
              { label: 'Taraftar', view: 'fan-room', icon: MessageSquare },
              { label: 'Transfer', view: 'transfer-radar', icon: Radar },
            ].map((item) => (
              <button
                key={item.view}
                type="button"
                onClick={() => onNavigate(item.view)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.03] border border-white/[0.07] hover:border-fb-yellow/35 hover:bg-fb-yellow/[0.06] text-slate-300 hover:text-fb-yellow font-semibold text-[12px] shrink-0 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fb-yellow focus-visible:ring-offset-2 focus-visible:ring-offset-fb-dark"
              >
                <item.icon aria-hidden className="w-3.5 h-3.5 text-fb-yellow" />
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      <TodayPulse onNavigate={onNavigate} articles={articles} />

      {/* Fraksiyon CTA */}
      <section className="py-12 md:py-14 border-b border-white/[0.05]">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="ui-surface relative overflow-hidden rounded-2xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="absolute top-0 inset-x-0 h-px ui-hairline opacity-70" />
            <div className="absolute -right-16 -top-16 w-56 h-56 bg-fb-yellow/[0.05] rounded-full blur-3xl pointer-events-none" />
            <div className="flex items-start gap-4 relative z-10">
              <div className="w-12 h-12 rounded-xl bg-fb-yellow/10 border border-fb-yellow/20 flex items-center justify-center shrink-0 shadow-[0_0_28px_-6px_rgba(255,210,31,0.35)]">
                <Sparkles className="w-6 h-6 text-fb-yellow" aria-hidden />
              </div>
              <div>
                <p className="text-[11px] font-semibold tracking-wide text-fb-yellow mb-1">
                  Fraksiyon evreni
                </p>
                <h2 className="text-xl md:text-2xl font-display font-bold text-white tracking-tight">
                  Hangi fraksiyondansın?
                </h2>
                <p className="mt-1.5 text-[13px] text-slate-400 max-w-lg leading-relaxed">
                  Camianın taktik lobilerini keşfet — quiz ile profilini çıkar, haritayı gez.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2.5 shrink-0 relative z-10">
              <button
                type="button"
                onClick={onStartQuiz}
                className="px-5 py-2.5 rounded-xl bg-fb-yellow text-fb-dark text-[13px] font-bold hover:bg-white transition-colors cursor-pointer"
              >
                Quiz’e başla
              </button>
              <button
                type="button"
                onClick={onEnterUniverse}
                className="px-5 py-2.5 rounded-xl border border-white/12 text-slate-200 text-[13px] font-semibold hover:border-fb-yellow/40 hover:text-fb-yellow transition-colors cursor-pointer inline-flex items-center gap-1.5"
              >
                Evreni aç <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {showTransfer && (
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true, margin: '-80px' }}
          className="[&_section]:!py-14"
        >
          <TransferRadar onNavigate={onNavigate} />
        </motion.div>
      )}

      {showSquad && (
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true, margin: '-80px' }}
          className="[&_section]:!py-14"
        >
          <SquadShowcase onNavigate={onNavigate} />
        </motion.div>
      )}

      <div className="[&_section]:!py-10">
        <LeagueStrip onNavigate={onNavigate} />
      </div>

      {showNewsletter && (
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true, margin: '-80px' }}
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
