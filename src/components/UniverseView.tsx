
import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { X, Zap, ArrowLeft } from 'lucide-react';
import TreeVisualization from './TreeVisualization';
import FactionDetail from './FactionDetail';
import Sidebar from './Sidebar';
import QuizContainer from './Quiz/QuizContainer';
import PredictorPage from './Predictor/PredictorPage';
import { FactionNode } from '../types';
import { toTurkishUppercase } from '../lib/stringUtils';

interface UniverseViewProps {
  treeData: FactionNode;
  isQuizOpen: boolean;
  setIsQuizOpen: (open: boolean) => void;
  onBack: () => void;
}

const UniverseView: React.FC<UniverseViewProps> = ({ treeData, isQuizOpen, setIsQuizOpen, onBack }) => {
  const [selectedFaction, setSelectedFaction] = useState<FactionNode | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [zoomToNodeId, setZoomToNodeId] = useState<string | null>(null);

  const handleSelectFaction = (node: FactionNode) => {
    setSelectedFaction(node);
    setZoomToNodeId(node.id);
    setTimeout(() => setZoomToNodeId(null), 1500);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-fb-dark">
      {/* Galaxy Background Elements */}
      <div className="absolute inset-0 galaxy-bg" />
      <div className="absolute inset-0 stars-overlay" />
      
      {/* Main Header - Optimized for Mobile */}
      <motion.header 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", damping: 20, stiffness: 100 }}
        className="absolute top-2 md:top-4 left-1/2 -translate-x-1/2 z-30 text-center pointer-events-none w-full px-4"
      >
        <h1 className="galaxy-title fb-gradient-text text-3xl md:text-5xl lg:text-6xl">{toTurkishUppercase('Fenerbahçe Evreni')}</h1>
      </motion.header>

      {/* Back Button */}
      <motion.button
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        onClick={onBack}
        className="absolute top-8 left-8 z-[100] flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 rounded-full text-white text-xs font-bold transition-all pointer-events-auto"
      >
        <ArrowLeft className="w-4 h-4" />
        ANA SAYFAYA DÖN
      </motion.button>

      {/* Sidebar with Hierarchy Menu */}
      <Sidebar 
        data={treeData} 
        onSelectFaction={handleSelectFaction}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Quiz Trigger Button */}
      <motion.div
        initial={{ x: 50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.5, type: "spring", damping: 20, stiffness: 100 }}
        className="absolute bottom-8 right-8 z-40"
      >
        <button
          onClick={() => setIsQuizOpen(true)}
          className="group relative flex items-center gap-4 p-1 pr-6 rounded-full bg-fb-navy/80 backdrop-blur-md border border-fb-yellow/30 hover:border-fb-yellow transition-all shadow-[0_0_30px_rgba(0,0,0,0.5)]"
        >
          <div className="w-12 h-12 rounded-full bg-fb-yellow flex items-center justify-center shadow-[0_0_20px_rgba(254,221,0,0.3)] group-hover:scale-110 transition-transform">
            <Zap className="w-6 h-6 text-fb-navy fill-fb-navy" />
          </div>
          <div className="text-left">
            <span className="intelligence-label text-fb-yellow text-[8px] block leading-none mb-1">KİMLİK ANALİZİ</span>
            <span className="text-xs font-black text-white uppercase tracking-tighter">HANGİ FRAKSİYONDASIN?</span>
          </div>
        </button>
      </motion.div>

      {/* Visualization Layer */}
      <div className="absolute inset-0 z-10">
        {/* Credit Card */}
        <div className="fixed top-6 right-6 z-30 hidden md:block">
          <div className="bg-white p-5 rounded-2xl border-2 border-fb-yellow shadow-[0_0_30px_rgba(254,221,0,0.3)] max-w-[300px] space-y-3">
            <p className="text-[14px] text-fb-navy font-black uppercase tracking-tight leading-tight">
              @caglarnefreti'nin fraksiyon görseli temel alınarak hazırlanmıştır.
            </p>
            <div className="h-0.5 bg-fb-navy/10 w-full" />
            <div className="space-y-1">
              <p className="text-[14px] text-fb-navy font-bold">
                Hazırlayan: <span className="font-black text-fb-accent">Yunus Emre YILMAZ</span>
              </p>
              <a 
                href="https://x.com/BasitBiOyun" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[14px] text-fb-accent font-black hover:underline flex items-center gap-1 transition-all"
              >
                x.com/basitbioyun
              </a>
            </div>
          </div>
        </div>

        <TreeVisualization
          data={treeData}
          onNodeClick={setSelectedFaction}
          selectedNodeId={selectedFaction?.id}
          zoomToNodeId={zoomToNodeId}
        />
      </div>

      {/* Detail Panel */}
      <AnimatePresence mode="wait">
        {selectedFaction && (
          <FactionDetail
            faction={selectedFaction}
            onClose={() => setSelectedFaction(null)}
            onFactionClick={(name) => {
              const findNode = (node: FactionNode): FactionNode | null => {
                if (node.name === name) return node;
                if (node.children) {
                  for (const child of node.children) {
                    const found = findNode(child);
                    if (found) return found;
                  }
                }
                return null;
              };
              const target = findNode(treeData);
              if (target) handleSelectFaction(target);
            }}
          />
        )}
      </AnimatePresence>

      {/* Quiz Overlay */}
      <AnimatePresence>
        {isQuizOpen && (
          <QuizContainer 
            onClose={() => setIsQuizOpen(false)} 
            onExplore={(factionName) => {
              const findNode = (node: FactionNode): FactionNode | null => {
                if (node.name === factionName) return node;
                if (node.children) {
                  for (const child of node.children) {
                    const found = findNode(child);
                    if (found) return found;
                  }
                }
                return null;
              };
              const target = findNode(treeData);
              if (target) {
                handleSelectFaction(target);
                setIsQuizOpen(false);
              }
            }}
          />
        )}
      </AnimatePresence>

      {/* Ambient Overlays */}
      <div className="absolute inset-0 vignette pointer-events-none z-20" />
    </div>
  );
};

export default UniverseView;
