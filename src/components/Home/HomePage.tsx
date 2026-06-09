import React from 'react';
import { motion } from 'motion/react';
import HeroSection from './HeroSection';
import MatchCenter from './MatchCenter';
import LatestAnalysis from './LatestAnalysis';
import TransferRadar from './TransferRadar';
import PlayerPerformanceZone from './PlayerPerformanceZone';
import CommunitySection from './CommunitySection';
import PremiumSection from './PremiumSection';
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

      {/* 5. Squad performance indexes and ratings */}
      {homeSettings?.showPlayerRatings !== false && (
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <PlayerPerformanceZone onNavigate={onNavigate} />
        </motion.div>
      )}

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

      {/* 7. Paid Premium listings invitation */}
      {homeSettings?.showPremiumSection !== false && (
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <PremiumSection />
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
