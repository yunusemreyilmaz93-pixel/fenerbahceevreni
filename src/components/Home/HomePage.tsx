import React from 'react';
import { motion } from 'motion/react';
import { Calendar, BookOpen, Search, Users, MessageSquare, Mail } from 'lucide-react';
import HeroSection from './HeroSection';
import MatchCenter from './MatchCenter';
import LatestAnalysis from './LatestAnalysis';
import TransferRadar from './TransferRadar';
import SquadShowcase from './SquadShowcase';
import LeagueStrip from './LeagueStrip';
import CommunitySection from './CommunitySection';
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

const HomePage: React.FC<HomePageProps> = ({ 
  onEnterUniverse, 
  onStartQuiz, 
  onNavigate,
  articles = [],
  transferReports = [],
  playersList = [],
  pollValue,
  homeSettings
}) => {
  const homepageSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Fenerbahçe Evreni",
    "url": "https://fenerbahceevreni.com",
    "description": "Fenerbahçe maç analizleri, transfer radarları, oyuncu performansları, taraftar anketleri ve premium raporlar için bağımsız analiz platformu.",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://fenerbahceevreni.com/analizler?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <div className="bg-fb-dark min-h-screen overflow-x-hidden">
      <SEO 
        title="Fenerbahçe Evreni | Bağımsız Fenerbahçe Analiz ve Taraftar Platformu"
        description="Fenerbahçe maç analizleri, transfer radarları, oyuncu performansları, taraftar anketleri ve premium raporları barındıran bağımsız analiz ve medya platformu."
        canonical="https://fenerbahceevreni.com"
        schema={homepageSchema}
      />
      
      {/* 1. Hero banner */}
      <HeroSection onNavigate={onNavigate} onEnterUniverse={onEnterUniverse} homeSettings={homeSettings} />

      {/* Quick access: primary tasks only */}
      <nav aria-label="Hızlı erişim" className="bg-[#0B0F19] py-4 border-b border-white/[0.04] relative z-20">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-start md:justify-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {[
              { label: 'Maç Merkezi', view: 'match-center', icon: Calendar },
              { label: 'Son Analiz', view: 'analysis', icon: BookOpen },
              { label: 'Kadro', view: 'players', icon: Users },
              { label: 'Taraftarın Sesi', view: 'fan-room', icon: MessageSquare }
            ].map((item) => (
              <button
                key={item.view}
                type="button"
                onClick={() => onNavigate(item.view)}
                className="ui-button ui-button-secondary flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#111625] border border-white/[0.05] hover:border-[#FFD21F]/30 hover:bg-[#151C30] text-slate-300 hover:text-[#FFD21F] font-black text-[11px] uppercase tracking-wider shrink-0 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fb-yellow focus-visible:ring-offset-2 focus-visible:ring-offset-fb-dark"
              >
                <item.icon aria-hidden="true" className="w-4 h-4 text-[#FFD21F]" />
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* 2. Featured Match center */}
      {homeSettings?.showMatchCenter !== false && (
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <MatchCenter onNavigate={onNavigate} />
        </motion.div>
      )}

      {/* 3. Latest tactical analysis reports */}
      {homeSettings?.showAnalysis !== false && (
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <LatestAnalysis onNavigate={onNavigate} />
        </motion.div>
      )}

      {/* 4. Scouting / Transfer targets radar */}
      {homeSettings?.showScoutRadar !== false && (
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <TransferRadar onNavigate={onNavigate} />
        </motion.div>
      )}

      {/* 5. Squad showcase — gerçek 2026-27 kadrosu (foto + piyasa değeri) */}
      {homeSettings?.showPlayerRatings !== false && (
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <SquadShowcase onNavigate={onNavigate} />
        </motion.div>
      )}

      {/* 5b. Süper Lig 2026-27 katılımcı şeridi — 18 gerçek kulüp arması */}
      <LeagueStrip onNavigate={onNavigate} />

      {/* 6. Active community interactions (Polls, MVP & Atlas access) */}
      {homeSettings?.showCommunityPolls !== false && (
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <CommunitySection onNavigate={onNavigate} onStartQuiz={onStartQuiz} />
        </motion.div>
      )}

      {/* 8. Newsletter Subscription panel */}
      {homeSettings?.showNewsletter !== false && (
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <NewsletterSection />
        </motion.div>
      )}

      {/* 9. Footers & Disclaimers */}
      <Footer onNavigate={onNavigate} />
    </div>
  );
};

export default HomePage;
