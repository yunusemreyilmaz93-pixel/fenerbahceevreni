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
 * D2 Homepage — world-class taraftar nabzı.
 * Üst: hero (kısa) → Bugünün nabzı (maç+analiz+anket) → ikincil derinlik.
 * Uzun scroll / tekrarlayan maç blokları kaldırıldı.
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
    <div className="bg-fb-dark min-h-screen overflow-x-hidden">
      <SEO
        title="Fenerbahçe Evreni | Bağımsız Fenerbahçe Analiz ve Taraftar Platformu"
        description="Fenerbahçe maç analizleri, transfer radarları, oyuncu performansları, taraftar anketleri ve premium raporları barındıran bağımsız analiz ve medya platformu."
        canonical="https://fenerbahceevreni.com"
        schema={homepageSchema}
      />

      {/* 1. Hero — marka + maç teaser (kısa) */}
      <HeroSection
        onNavigate={onNavigate}
        onEnterUniverse={onEnterUniverse}
        homeSettings={homeSettings}
      />

      {/* 2. Hızlı erişim — sade */}
      <nav
        aria-label="Hızlı erişim"
        className="bg-[#0B0F19] py-3 border-b border-white/[0.04] relative z-20"
      >
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="flex items-center justify-start md:justify-center gap-2 overflow-x-auto pb-0.5 scrollbar-none">
            {[
              { label: 'Maç Merkezi', view: 'match-center', icon: Calendar },
              { label: 'Analizler', view: 'analysis', icon: BookOpen },
              { label: 'Kadro', view: 'players', icon: Users },
              { label: 'Taraftar', view: 'fan-room', icon: MessageSquare },
              { label: 'Transfer', view: 'transfer-radar', icon: Radar },
            ].map((item) => (
              <button
                key={item.view}
                type="button"
                onClick={() => onNavigate(item.view)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#111625] border border-white/[0.05] hover:border-fb-yellow/30 hover:bg-[#151C30] text-slate-300 hover:text-fb-yellow font-black text-[10px] uppercase tracking-wider shrink-0 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fb-yellow focus-visible:ring-offset-2 focus-visible:ring-offset-fb-dark"
              >
                <item.icon aria-hidden className="w-3.5 h-3.5 text-fb-yellow" />
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* 3. BUGÜNÜN NABZI — core product moment */}
      <TodayPulse onNavigate={onNavigate} articles={articles} />

      {/* 4. Fraksiyon / evren CTA — tek şerit, abartısız */}
      <section className="py-10 md:py-12 border-b border-white/[0.04] bg-[#0B0F19]">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="rounded-2xl border border-white/[0.07] bg-gradient-to-r from-[#111625] via-[#0E1526] to-[#111625] p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-fb-yellow/10 border border-fb-yellow/20 flex items-center justify-center shrink-0">
                <Sparkles className="w-6 h-6 text-fb-yellow" aria-hidden />
              </div>
              <div>
                <p className="text-[10px] font-mono font-black uppercase tracking-[0.2em] text-fb-yellow mb-1">
                  Fraksiyon evreni
                </p>
                <h2 className="text-xl md:text-2xl font-display font-black text-white uppercase italic tracking-tight">
                  Hangi fraksiyondansın?
                </h2>
                <p className="mt-1.5 text-xs text-slate-400 max-w-lg leading-relaxed">
                  Camianın taktik lobilerini keşfet — quiz ile profilini çıkar, haritayı gez.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 shrink-0">
              <button
                type="button"
                onClick={onStartQuiz}
                className="px-5 py-2.5 rounded-xl bg-fb-yellow text-fb-dark text-[11px] font-black uppercase tracking-wider hover:bg-white transition-colors cursor-pointer"
              >
                Quiz’e başla
              </button>
              <button
                type="button"
                onClick={onEnterUniverse}
                className="px-5 py-2.5 rounded-xl border border-white/10 text-slate-200 text-[11px] font-black uppercase tracking-wider hover:border-fb-yellow/40 hover:text-fb-yellow transition-colors cursor-pointer inline-flex items-center gap-1.5"
              >
                Evreni aç <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 5. İkincil derinlik — transfer / kadro (kısa py) */}
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
