
import React from 'react';
import { motion } from 'motion/react';
import HeroSection from './HeroSection';
import MatchCenter from './MatchCenter';
import FanPulse from './FanPulse';
import NewsFeed from './NewsFeed';
import VideoShelf from './VideoShelf';
import UniverseEntry from './UniverseEntry';
import Footer from './Footer';
import PlatformVision from './PlatformVision';

interface HomePageProps {
  onEnterUniverse: () => void;
  onStartQuiz: () => void;
  onNavigate: (view: 'home' | 'universe' | 'match-center' | 'news') => void;
}

const HomePage: React.FC<HomePageProps> = ({ onEnterUniverse, onStartQuiz, onNavigate }) => {
  return (
    <div className="bg-fb-dark min-h-screen overflow-x-hidden">
      <HeroSection onEnterUniverse={onEnterUniverse} onStartQuiz={onStartQuiz} />

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
      >
        <PlatformVision />
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
      >
        <div id="mac-merkezi">
          <MatchCenter onNavigate={onNavigate} />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
      >
        <FanPulse />
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
      >
        <UniverseEntry onEnter={onEnterUniverse} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
      >
        <div id="haberler">
          <NewsFeed />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
      >
        <div id="videolar">
          <VideoShelf />
        </div>
      </motion.div>

      <Footer />
    </div>
  );
};

export default HomePage;
