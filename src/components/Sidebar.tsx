import React from 'react';
import { Shield, Activity, Database, Menu as MenuIcon, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import HierarchyMenu from './HierarchyMenu';
import { FactionNode } from '../types';
import { toTurkishUppercase } from '../lib/stringUtils';

interface SidebarProps {
  data: FactionNode;
  onSelectFaction: (node: FactionNode) => void;
  isOpen: boolean;
  onToggle: () => void;
  onOpenPredictor: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ data, onSelectFaction, isOpen, onToggle, onOpenPredictor }) => {
  return (
    <>
      {/* Mobile Toggle Button */}
      <button 
        onClick={onToggle}
        className="fixed left-6 top-6 z-50 w-12 h-12 rounded-2xl bg-fb-navy/80 backdrop-blur-md border border-fb-yellow/30 flex items-center justify-center lg:hidden shadow-[0_0_20px_rgba(0,0,0,0.5)]"
      >
        {isOpen ? <X className="w-6 h-6 text-fb-yellow" /> : <MenuIcon className="w-6 h-6 text-fb-yellow" />}
      </button>

      <AnimatePresence>
        {(isOpen || window.innerWidth >= 1024) && (
          <motion.div 
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 250 }}
            className="fixed left-0 lg:left-12 top-0 lg:top-12 bottom-0 lg:bottom-12 w-full lg:w-80 z-40 flex flex-col gap-6 lg:gap-8 pointer-events-none p-6 lg:p-0"
          >
            {/* Branding Section */}
            <div className="pointer-events-auto space-y-2 hidden lg:block">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.1)] overflow-hidden p-1">
                  <img 
                    src="https://images.seeklogo.com/logo-png/44/2/fenerbahce-spor-kulubu-5-yildizli-arma-concept-logo-png_seeklogo-440737.png" 
                    alt="FB" 
                    className="w-full h-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <h1 className="text-3xl font-black font-display tracking-tighter fb-gradient-text leading-none">FB ATLAS</h1>
                </div>
              </div>
            </div>

            {/* Hierarchy Menu Section */}
            <div className="glass-panel p-6 lg:p-8 rounded-[2rem] pointer-events-auto flex-1 flex flex-col gap-6 overflow-hidden">
              <div className="space-y-1">
                <h3 className="intelligence-label text-fb-yellow">{toTurkishUppercase('Fraksiyon Atlası')}</h3>
                <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">HİYERARŞİK KEŞİF</p>
              </div>
              
              <div className="flex-1 overflow-hidden">
                <HierarchyMenu 
                  data={data} 
                  onSelect={onSelectFaction} 
                  onClose={onToggle}
                />
              </div>

              {/* Predictor Shortcut */}
              <button 
                onClick={() => {
                  onOpenPredictor();
                  onToggle();
                }}
                className="w-full mt-4 p-4 rounded-2xl bg-fb-yellow text-fb-navy font-black italic uppercase text-sm flex items-center justify-between group hover:scale-[1.02] transition-all shadow-[0_10px_20px_rgba(254,221,0,0.1)]"
              >
                <span>ŞAMPİYONLUK YOLU</span>
                <Activity className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
