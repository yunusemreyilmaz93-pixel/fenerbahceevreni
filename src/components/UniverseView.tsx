import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowLeft, Compass, Layers3, Sparkles, Zap } from 'lucide-react';
import TreeVisualization from './TreeVisualization';
import FactionDetail from './FactionDetail';
import Sidebar from './Sidebar';
import QuizContainer from './Quiz/QuizContainer';
import { FactionNode } from '../types';
import { toTurkishUppercase } from '../lib/stringUtils';

interface UniverseViewProps {
  treeData: FactionNode;
  isQuizOpen: boolean;
  setIsQuizOpen: (open: boolean) => void;
  onBack: () => void;
}

const countTree = (node: FactionNode): { total: number; leaves: number } => {
  if (!node.children || node.children.length === 0) {
    return { total: 1, leaves: 1 };
  }

  return node.children.reduce(
    (acc, child) => {
      const nested = countTree(child);
      return {
        total: acc.total + nested.total,
        leaves: acc.leaves + nested.leaves,
      };
    },
    { total: 1, leaves: 0 },
  );
};

const UniverseView: React.FC<UniverseViewProps> = ({ treeData, isQuizOpen, setIsQuizOpen, onBack }) => {
  const [selectedFaction, setSelectedFaction] = useState<FactionNode | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [zoomToNodeId, setZoomToNodeId] = useState<string | null>(null);

  const stats = useMemo(() => countTree(treeData), [treeData]);

  const handleSelectFaction = (node: FactionNode) => {
    setSelectedFaction(node);
    setZoomToNodeId(node.id);
    setTimeout(() => setZoomToNodeId(null), 1500);
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-fb-dark">
      <div className="absolute inset-0 galaxy-bg" />
      <div className="absolute inset-0 stars-overlay" />
      <div className="absolute inset-x-0 top-0 h-[220px] bg-gradient-to-b from-fb-navy/35 to-transparent" />

      <header className="absolute left-1/2 top-5 z-40 w-[min(1100px,92vw)] -translate-x-1/2">
        <div className="rounded-3xl border border-white/10 bg-black/45 p-4 backdrop-blur-xl md:p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-black tracking-[0.15em] text-white transition hover:border-fb-yellow/60 hover:text-fb-yellow"
            >
              <ArrowLeft className="h-4 w-4" />
              ANA SAYFA
            </button>

            <div className="text-center">
              <p className="text-[10px] font-black tracking-[0.28em] text-fb-yellow">PREMIUM DISCOVERY MODE</p>
              <h1 className="galaxy-title text-2xl md:text-4xl">{toTurkishUppercase('Fenerbahçe Evren Haritası')}</h1>
            </div>

            <button
              onClick={() => setIsQuizOpen(true)}
              className="inline-flex items-center gap-2 rounded-full bg-fb-yellow px-4 py-2 text-xs font-black tracking-[0.14em] text-fb-navy transition hover:scale-[1.02]"
            >
              <Zap className="h-4 w-4 fill-current" />
              FRAKSİYON TESTİ
            </button>
          </div>

          <div className="mt-4 grid gap-2 md:grid-cols-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <p className="text-[10px] font-black tracking-[0.18em] text-slate-400">TOPLAM DÜĞÜM</p>
              <p className="mt-1 text-2xl font-black text-fb-yellow">{stats.total}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <p className="text-[10px] font-black tracking-[0.18em] text-slate-400">ALT FRAKSİYON</p>
              <p className="mt-1 text-2xl font-black text-fb-yellow">{Math.max(stats.total - 1, 0)}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <p className="text-[10px] font-black tracking-[0.18em] text-slate-400">YAPRAK NOD</p>
              <p className="mt-1 text-2xl font-black text-fb-yellow">{stats.leaves}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <p className="text-[10px] font-black tracking-[0.18em] text-slate-400">SEÇİLİ FRAKSİYON</p>
              <p className="mt-1 truncate text-sm font-black text-white">{selectedFaction?.name || 'Henüz seçilmedi'}</p>
            </div>
          </div>
        </div>
      </header>

      <Sidebar
        data={treeData}
        onSelectFaction={handleSelectFaction}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <div className="absolute inset-0 z-10">
        <TreeVisualization
          data={treeData}
          onNodeClick={setSelectedFaction}
          selectedNodeId={selectedFaction?.id}
          zoomToNodeId={zoomToNodeId}
        />
      </div>

      <div className="pointer-events-none absolute bottom-6 left-1/2 z-40 w-[min(980px,92vw)] -translate-x-1/2">
        <div className="grid gap-3 md:grid-cols-3">
          {[
            {
              icon: Compass,
              title: 'Akıllı Keşif',
              text: 'Zoom ile derinleş, sidebar ile hedef fraksiyona tek tıkla git.',
            },
            {
              icon: Layers3,
              title: 'Hiyerarşi Odaklı',
              text: 'Alt fraksiyon ilişkilerini aynı anda gör ve yolunu takip et.',
            },
            {
              icon: Sparkles,
              title: 'Premium Detay',
              text: 'Her fraksiyon için özet, ton, temsil ve ilişkili kollar detayda.',
            },
          ].map((item) => (
            <div key={item.title} className="rounded-2xl border border-white/10 bg-black/50 p-4 backdrop-blur-md">
              <item.icon className="mb-2 h-4 w-4 text-fb-yellow" />
              <p className="text-sm font-black text-white">{item.title}</p>
              <p className="mt-1 text-xs text-slate-300">{item.text}</p>
            </div>
          ))}
        </div>
      </div>

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

      <div className="pointer-events-none absolute inset-0 z-20 vignette" />
    </div>
  );
};

export default UniverseView;
