import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, ChevronDown, MapPin, Search } from 'lucide-react';
import { FactionNode } from '../types';
import { toTurkishUppercase } from '../lib/stringUtils';

interface HierarchyMenuProps {
  data: FactionNode;
  onSelect: (node: FactionNode) => void;
  onClose?: () => void;
}

const HierarchyMenu: React.FC<HierarchyMenuProps> = ({ data, onSelect, onClose }) => {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set([data.id]));
  const [searchTerm, setSearchTerm] = useState('');

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedNodes(newExpanded);
  };

  const renderNode = (node: FactionNode, depth: number = 0) => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children && node.children.length > 0;
    
    // Simple search filtering
    const matchesSearch = node.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      node.children?.some(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

    if (searchTerm && !matchesSearch && depth > 0) return null;

    return (
      <div key={node.id} className="select-none">
        <div 
          onClick={() => {
            onSelect(node);
            if (window.innerWidth < 768 && onClose) onClose();
          }}
          className={`
            flex items-center gap-2 py-2 px-3 rounded-lg cursor-pointer transition-all
            ${depth === 0 ? 'bg-fb-yellow/5 border border-fb-yellow/10 mb-2' : 'hover:bg-white/5'}
          `}
          style={{ marginLeft: `${depth * 12}px` }}
        >
          {hasChildren ? (
            <button 
              onClick={(e) => toggleExpand(node.id, e)}
              className="p-1 hover:bg-white/10 rounded-md transition-colors"
            >
              {isExpanded ? <ChevronDown className="w-3 h-3 text-fb-yellow" /> : <ChevronRight className="w-3 h-3 text-slate-500" />}
            </button>
          ) : (
            <div className="w-5 flex justify-center">
              <div className="w-1 h-1 rounded-full bg-fb-yellow/40" />
            </div>
          )}
          
          <span className={`
            text-sm tracking-tight
            ${depth === 0 ? 'font-black text-fb-yellow uppercase' : depth === 1 ? 'font-bold text-slate-200' : 'text-slate-400'}
          `}>
            {depth === 0 ? toTurkishUppercase(node.name) : node.name}
          </span>

          <MapPin className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 text-fb-yellow transition-opacity" />
        </div>

        <AnimatePresence>
          {isExpanded && hasChildren && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="overflow-hidden"
            >
              {node.children?.map(child => renderNode(child, depth + 1))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input 
          type="text"
          placeholder="FRAKSİYON ARA..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-xs font-bold tracking-widest text-white focus:outline-none focus:border-fb-yellow/50 transition-all"
        />
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-1">
        {renderNode(data)}
      </div>
    </div>
  );
};

export default HierarchyMenu;
