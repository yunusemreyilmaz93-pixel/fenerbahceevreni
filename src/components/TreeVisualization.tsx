import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { FactionNode } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface TreeVisualizationProps {
  data: FactionNode;
  onNodeClick: (node: FactionNode) => void;
  selectedNodeId?: string;
  zoomToNodeId?: string | null;
}

interface GalaxyNode extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  depth: number;
  data: FactionNode;
  parent?: string;
}

interface GalaxyLink extends d3.SimulationLinkDatum<GalaxyNode> {
  source: string;
  target: string;
}

const TreeVisualization: React.FC<TreeVisualizationProps> = ({
  data,
  onNodeClick,
  selectedNodeId,
  zoomToNodeId,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [zoomLevel, setZoomLevel] = useState(1);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };
    updateDimensions();
    const observer = new ResizeObserver(updateDimensions);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!svgRef.current || dimensions.width === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = dimensions.width;
    const height = dimensions.height;

    // Flatten data for force simulation
    const nodes: GalaxyNode[] = [];
    const links: GalaxyLink[] = [];

    function flatten(node: FactionNode, parentId?: string) {
      const galaxyNode: GalaxyNode = {
        id: node.id,
        name: node.name,
        depth: node.depth,
        data: node,
        parent: parentId,
        x: parentId ? undefined : 0, // Root at center
        y: parentId ? undefined : 0,
      };
      nodes.push(galaxyNode);
      if (parentId) {
        links.push({ source: parentId, target: node.id });
      }
      node.children?.forEach(child => flatten(child, node.id));
    }
    flatten(data);

    // Filters for premium effects
    const defs = svg.append('defs');
    
    // Arrowhead marker
    defs.append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '-0 -5 10 10')
      .attr('refX', 20)
      .attr('refY', 0)
      .attr('orient', 'auto')
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('xoverflow', 'visible')
      .append('svg:path')
      .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
      .attr('fill', '#FEDD00')
      .style('stroke', 'none');

    const glowFilter = defs.append('filter')
      .attr('id', 'glow')
      .attr('x', '-100%')
      .attr('y', '-100%')
      .attr('width', '300%')
      .attr('height', '300%');
    
    glowFilter.append('feGaussianBlur')
      .attr('stdDeviation', '6')
      .attr('result', 'blur');
    glowFilter.append('feComposite')
      .attr('in', 'SourceGraphic')
      .attr('in2', 'blur')
      .attr('operator', 'over');

    const mainG = svg.append('g');
    const g = mainG.append('g');

    // Zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 5])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
        setZoomLevel(event.transform.k);
        
        g.selectAll('.node-label')
          .style('opacity', function(d: any) {
            if (d.id === selectedNodeId) return 1;
            if (d.depth === 1) return 1;
            return event.transform.k > 1.5 ? 1 : 0;
          });
      });

    svg.call(zoom as any);
    
    // Initial zoom to center - Adaptive for mobile
    const initialScale = width < 768 ? 0.4 : 0.6;
    svg.call(zoom.transform as any, d3.zoomIdentity.translate(width / 2, height / 2).scale(initialScale));

    // Force Simulation for "Cloud Network" Feel
    const simulation = d3.forceSimulation<GalaxyNode>(nodes)
      .alphaDecay(0.05) // Slower decay for smoother initial settle
      .velocityDecay(0.3)
      .force('link', d3.forceLink<GalaxyNode, GalaxyLink>(links).id(d => d.id).distance(l => {
        const source = l.source as unknown as GalaxyNode;
        const baseDist = width < 768 ? 1.2 : 1.8;
        if (source.depth === 0) return 450 * baseDist;
        return 180 * baseDist;
      }).strength(1))
      .force('charge', d3.forceManyBody<GalaxyNode>().strength(d => d.depth === 0 ? -10000 : -1500))
      .force('center', d3.forceCenter(0, 0))
      .force('x', d3.forceX().strength(0.1))
      .force('y', d3.forceY().strength(0.1))
      .force('collision', d3.forceCollide<GalaxyNode>().radius(d => {
        if (d.depth === 0) return width < 768 ? 200 : 300;
        if (d.depth === 1) return width < 768 ? 120 : 180;
        return 80;
      }));

    // Links
    const link = g.append('g')
      .attr('fill', 'none')
      .selectAll('path')
      .data(links)
      .join('path')
      .attr('class', 'link-path')
      .attr('stroke', '#FEDD00')
      .attr('stroke-opacity', 0.8)
      .attr('stroke-width', 1.5)
      .attr('marker-end', 'url(#arrowhead)');

    // Nodes
    const node = g.append('g')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .attr('class', 'node-group')
      .on('click', (event, d) => {
        onNodeClick(d.data);
      })
      .style('cursor', 'pointer');

    // Node circles (Celestial Design)
    node.append('circle')
      .attr('fill', (d) => {
        if (d.depth === 0) return 'transparent';
        if (d.id === selectedNodeId) return '#FEDD00';
        return d.depth === 1 ? '#FEDD00' : '#002D72';
      })
      .attr('stroke', (d) => d.depth === 0 ? 'transparent' : '#FEDD00')
      .attr('stroke-width', (d) => d.depth === 1 ? 2 : 1)
      .attr('r', (d) => {
        const scale = width < 768 ? 0.8 : 1;
        if (d.depth === 0) return 80 * scale;
        if (d.depth === 1) return 16 * scale;
        if (d.depth === 2) return 8 * scale;
        return 4 * scale;
      })
      .attr('class', 'node-circle')
      .style('filter', (d) => {
        if (d.id === selectedNodeId) return 'url(#glow)';
        return d.depth === 1 ? 'drop-shadow(0 0 10px rgba(254, 221, 0, 0.5))' : 'none';
      });

    // Node labels (Progressive Disclosure)
    node.append('text')
      .attr('dy', '0.31em')
      .attr('x', (d) => d.depth === 1 ? (width < 768 ? 18 : 22) : 12)
      .text((d) => d.depth === 0 ? '' : d.name)
      .attr('fill', (d) => d.id === selectedNodeId ? '#FEDD00' : '#ffffff')
      .style('font-size', (d) => d.depth === 1 ? (width < 768 ? '14px' : '16px') : '11px')
      .style('font-weight', (d) => d.depth === 1 ? '800' : '500')
      .style('opacity', (d) => {
        if (d.id === selectedNodeId) return 1;
        if (d.depth === 1) return 1;
        return zoomLevel > 1.5 ? 1 : 0;
      })
      .attr('class', 'node-label');

    // Centerpiece (The Sun)
    const center = g.append('g')
      .attr('class', 'center-logo')
      .on('click', () => onNodeClick(data))
      .style('cursor', 'pointer');

    const centerScale = width < 768 ? 1.4 : 2.2;

    // Core - Just a subtle glow
    center.append('circle')
      .attr('r', 65 * centerScale)
      .attr('fill', 'rgba(254, 221, 0, 0.05)')
      .style('filter', 'url(#glow)');

    center.append('image')
      .attr('xlink:href', '/fb-evreni-logo.png')
      .attr('x', -60 * centerScale)
      .attr('y', -60 * centerScale)
      .attr('width', 120 * centerScale)
      .attr('height', 120 * centerScale)
      .attr('referrerpolicy', 'no-referrer');

    // Simulation Ticks
    simulation.on('tick', () => {
      link.attr('d', (d: any) => `M${d.source.x},${d.source.y}L${d.target.x},${d.target.y}`);
      node.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
      
      // Tie center to root node
      const root = nodes.find(n => n.depth === 0);
      if (root) {
        center.attr('transform', `translate(${root.x},${root.y})`);
      }
    });

    // Run some initial ticks for a better starting position
    for (let i = 0; i < 100; ++i) simulation.tick();

    // Handle Active Path
    if (selectedNodeId) {
      const activePathIds = new Set<string>();
      let curr = nodes.find(n => n.id === selectedNodeId);
      while (curr) {
        activePathIds.add(curr.id);
        curr = nodes.find(n => n.id === curr?.parent);
      }

      link.attr('stroke', (d: any) => activePathIds.has(d.target.id) && activePathIds.has(d.source.id) ? '#FEDD00' : 'rgba(254, 221, 0, 0.03)')
          .attr('stroke-width', (d: any) => activePathIds.has(d.target.id) && activePathIds.has(d.source.id) ? 2 : 1)
          .style('opacity', (d: any) => activePathIds.has(d.target.id) && activePathIds.has(d.source.id) ? 1 : 0.2);
          
      node.style('opacity', (d: any) => activePathIds.has(d.id) || d.parent === selectedNodeId ? 1 : 0.2);
    }

    // Programmatic Zoom to Node
    if (zoomToNodeId) {
      const targetNode = nodes.find(n => n.id === zoomToNodeId);
      if (targetNode) {
        const scale = targetNode.depth === 1 ? 1.2 : 2;
        svg.transition()
          .duration(800) // Snappier zoom
          .ease(d3.easeCubicOut)
          .call(zoom.transform as any, d3.zoomIdentity
            .translate(width / 2, height / 2)
            .scale(scale)
            .translate(-targetNode.x!, -targetNode.y!)
          );
      }
    }

    return () => simulation.stop();

  }, [dimensions, data, selectedNodeId, onNodeClick, zoomToNodeId]);

  return (
    <div ref={containerRef} className="w-full h-full relative overflow-hidden galaxy-bg">
      <div className="absolute inset-0 stars-overlay" />
      <svg
        ref={svgRef}
        className="w-full h-full"
        style={{ touchAction: 'none' }}
      />
      
      {/* Cinematic Overlays */}
      <div className="absolute inset-0 vignette pointer-events-none" />
      
      {/* Zoom Indicator */}
      <div className="absolute bottom-6 right-6 md:bottom-12 md:right-12 glass-panel px-4 md:px-6 py-2 md:py-3 rounded-full pointer-events-none border-white/10">
        <span className="intelligence-label text-fb-yellow font-mono text-[8px] md:text-[10px]">Atlas Zoom: {Math.round(zoomLevel * 100)}%</span>
      </div>
    </div>
  );
};

export default TreeVisualization;
