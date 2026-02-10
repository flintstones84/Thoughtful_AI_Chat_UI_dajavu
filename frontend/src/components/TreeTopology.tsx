import React, { useRef, useState, useEffect } from 'react';
import { User, Bot, GitBranch, Maximize2, Pencil, Copy, Share2, XSquare, Minimize2 } from 'lucide-react';
import { TREE_NODES } from '../constants';

const TreeTopology: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  
  // Ref for dragging logic to avoid closure staleness and for click detection
  const dragInfo = useRef({
      isDown: false,
      startX: 0,
      startY: 0,
      scrollLeft: 0,
      scrollTop: 0,
      hasMoved: false
  });

  // Helper to generate SVG path connecting two points
  const getPath = (start: {x: number, y: number}, end: {x: number, y: number}) => {
    // Curvier bezier for a "mind map" feel
    const controlPoint1 = { x: (start.x + end.x) / 2, y: start.y };
    const controlPoint2 = { x: (start.x + end.x) / 2, y: end.y };
    return `M ${start.x + 100} ${start.y + 25} C ${controlPoint1.x} ${controlPoint1.y}, ${controlPoint2.x} ${controlPoint2.y}, ${end.x} ${end.y + 25}`;
  };

  // Find connections
  const connections = TREE_NODES.map(node => {
    if (!node.data.parentId) return null;
    const parent = TREE_NODES.find(p => p.id === node.data.parentId);
    if (!parent) return null;
    return {
      start: { x: parent.x + 150, y: parent.y }, // Output from right side of card
      end: { x: node.x - 10, y: node.y }, // Input to left side of card
      active: node.data.isActivePath
    };
  }).filter(Boolean);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (selectedNodeId) return; // Don't drag if modal is open (though modal covers it)
    
    dragInfo.current = {
        isDown: true,
        startX: e.clientX,
        startY: e.clientY,
        scrollLeft: containerRef.current?.scrollLeft || 0,
        scrollTop: containerRef.current?.scrollTop || 0,
        hasMoved: false
    };

    window.addEventListener('mousemove', handleWindowMouseMove);
    window.addEventListener('mouseup', handleWindowMouseUp);
  };

  const handleWindowMouseMove = (e: MouseEvent) => {
    if (!dragInfo.current.isDown || !containerRef.current) return;
    
    const dx = e.clientX - dragInfo.current.startX;
    const dy = e.clientY - dragInfo.current.startY;
    
    // Threshold to start "dragging" state (visuals)
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        if (!dragInfo.current.hasMoved) {
            dragInfo.current.hasMoved = true;
            setIsDragging(true);
            document.body.style.cursor = 'grabbing';
        }
        
        containerRef.current.scrollLeft = dragInfo.current.scrollLeft - dx;
        containerRef.current.scrollTop = dragInfo.current.scrollTop - dy;
    }
  };

  const handleWindowMouseUp = () => {
    dragInfo.current.isDown = false;
    // Don't reset hasMoved immediately if we want to block clicks, 
    // but here we just use it for state. 
    // We'll reset state, but `hasMoved` stays in ref for the click handler to check.
    
    setIsDragging(false);
    document.body.style.cursor = 'default';
    
    window.removeEventListener('mousemove', handleWindowMouseMove);
    window.removeEventListener('mouseup', handleWindowMouseUp);
  };

  const handleNodeClick = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      // Only select if we didn't drag
      if (!dragInfo.current.hasMoved) {
         setSelectedNodeId(id);
      }
      // Reset hasMoved for next interaction
      dragInfo.current.hasMoved = false;
  };

  const selectedNode = TREE_NODES.find(n => n.id === selectedNodeId);

  return (
    <div className="flex-1 bg-slate-50 dark:bg-slate-950 relative overflow-hidden flex flex-col select-none">
       <div className="absolute top-4 left-4 z-10 flex gap-2 pointer-events-none">
         <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-indigo-200 dark:border-indigo-700/50 rounded-2xl px-4 py-2 shadow-lg shadow-indigo-500/10 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2 pointer-events-auto transition-all hover:scale-105 ring-1 ring-indigo-500/20 group cursor-default">
             <div className="relative flex items-center justify-center w-5 h-5 bg-indigo-100 dark:bg-indigo-900/50 rounded-full group-hover:bg-indigo-200 dark:group-hover:bg-indigo-800 transition-colors">
                <div className="absolute w-2 h-2 bg-indigo-500 rounded-full animate-ping opacity-75"></div>
                <div className="relative w-2 h-2 bg-indigo-500 rounded-full"></div>
             </div>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">系统拓扑结构</span>
         </div>
       </div>

       {/* Detail Modal for Selected Node */}
       {selectedNode && (
         <div className="absolute inset-0 z-50 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setSelectedNodeId(null)}>
            <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                    <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-sm ${selectedNode.data.role === 'user' ? 'bg-purple-100 text-purple-600' : 'bg-indigo-100 text-indigo-600'}`}>
                           {selectedNode.data.role === 'user' ? <User size={18} /> : <Bot size={18} />}
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800 dark:text-slate-100">{selectedNode.data.role === 'user' ? '用户 (User)' : 'DeepChat AI'}</h3>
                            <div className="text-xs text-slate-500">{selectedNode.data.timestamp}</div>
                        </div>
                    </div>
                    <button onClick={() => setSelectedNodeId(null)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-slate-500 transition-colors">
                        <Minimize2 size={18} />
                    </button>
                </div>
                <div className="p-6 overflow-y-auto bg-white dark:bg-slate-900">
                    <div className="prose prose-slate dark:prose-invert max-w-none">
                        <p className="whitespace-pre-wrap leading-relaxed text-slate-700 dark:text-slate-300 text-base">{selectedNode.data.content}</p>
                    </div>
                    {/* Visual Code Block Representation */}
                    {selectedNode.data.content.includes('```') && (
                        <div className="mt-4 p-4 bg-slate-950 rounded-lg border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto">
                           <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-800">
                               <span className="text-slate-500">Code Snippet</span>
                               <Copy size={12} className="cursor-pointer hover:text-white" />
                           </div>
                           <pre>
                               {selectedNode.data.content.split('```')[1]?.replace(/python|javascript|java/g, '').trim()}
                           </pre>
                        </div>
                    )}
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                    <button onClick={() => setSelectedNodeId(null)} className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800 rounded-md transition-colors">关闭</button>
                    <button className="px-3 py-1.5 text-xs font-medium bg-indigo-600 text-white hover:bg-indigo-700 rounded-md transition-colors shadow-sm shadow-indigo-200">在对话中查看</button>
                </div>
            </div>
         </div>
       )}

      <div 
        ref={containerRef}
        className={`flex-1 overflow-auto relative ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        onMouseDown={handleMouseDown}
      >
        <div className="min-w-[1400px] min-h-[1000px] relative p-10">
            
            {/* Grid Background */}
            <div className="absolute inset-0 pointer-events-none" 
                 style={{
                    backgroundImage: 'linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px)',
                    backgroundSize: '40px 40px',
                    opacity: 0.5
                 }}>
            </div>

            {/* SVG Lines Layer */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
               <defs>
                 <linearGradient id="activeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#4f46e5" />
                    <stop offset="100%" stopColor="#818cf8" />
                 </linearGradient>
               </defs>
               {connections.map((conn, i) => (
                   <path 
                     key={i}
                     d={`M ${conn!.start.x} ${conn!.start.y + 25} C ${conn!.start.x + 50} ${conn!.start.y + 25}, ${conn!.end.x - 50} ${conn!.end.y + 25}, ${conn!.end.x} ${conn!.end.y + 25}`}
                     fill="none"
                     stroke={conn!.active ? "url(#activeGradient)" : "#cbd5e1"}
                     strokeWidth={conn!.active ? 3 : 2}
                     strokeDasharray={conn!.active ? "none" : "5,5"}
                   />
               ))}
            </svg>

            {/* Nodes */}
            {TREE_NODES.map((node) => (
                <div 
                  key={node.id}
                  onClick={(e) => handleNodeClick(e, node.id)}
                  className={`absolute w-64 p-3 rounded-xl border transition-all duration-200 hover:-translate-y-1 hover:shadow-lg group cursor-pointer
                    ${node.data.isActivePath 
                        ? 'bg-white dark:bg-slate-900 border-indigo-500 ring-2 ring-indigo-100 dark:ring-indigo-900/30 shadow-md' 
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 border-dashed opacity-80 hover:opacity-100'
                    }
                    ${selectedNodeId === node.id ? 'ring-4 ring-indigo-200 dark:ring-indigo-800 border-indigo-600 z-10' : ''}
                  `}
                  style={{ left: node.x, top: node.y }}
                >
                    {/* Branch Label if exists */}
                    {node.data.branchId && (
                        <div className="absolute -top-6 left-0 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                            <GitBranch size={10} />
                            分支: {node.data.branchId}
                        </div>
                    )}
                    
                    {/* Header with Buttons */}
                    <div className="flex items-center gap-2 mb-2">
                        <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0
                            ${node.data.role === 'user' ? 'bg-purple-100 text-purple-600' : 'bg-indigo-100 text-indigo-600'}
                        `}>
                            {node.data.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                        </div>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                            {node.data.role === 'user' ? '用户' : 'DeepChat'}
                        </span>
                        
                        {/* Action Buttons Group */}
                        <div className="ml-auto flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-50 dark:bg-slate-800 rounded-md px-1 py-0.5 border border-slate-100 dark:border-slate-700">
                           <button className="p-1 text-slate-400 hover:text-indigo-600 rounded" title="修改" onClick={(e) => e.stopPropagation()}><Pencil size={10} /></button>
                           <button className="p-1 text-slate-400 hover:text-indigo-600 rounded" title="复制" onClick={(e) => e.stopPropagation()}><Copy size={10} /></button>
                           <button className="p-1 text-slate-400 hover:text-indigo-600 rounded" title="转发" onClick={(e) => e.stopPropagation()}><Share2 size={10} /></button>
                           <button className="p-1 text-slate-400 hover:text-red-500 rounded" title="删除" onClick={(e) => e.stopPropagation()}><XSquare size={10} /></button>
                        </div>
                    </div>

                    {/* Content */}
                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 font-medium leading-relaxed mb-2 pointer-events-none">
                        {node.data.content}
                    </p>

                    {/* Code Snippet Preview (Visual Flair) */}
                    {node.data.content.includes('```') && (
                        <div className="mt-2 mb-2 h-1.5 w-full bg-slate-200 rounded-full overflow-hidden pointer-events-none">
                            <div className="h-full bg-indigo-400 w-2/3"></div>
                        </div>
                    )}
                    
                    {/* Timestamp Footer */}
                    <div className="flex justify-end pt-1 border-t border-slate-50 dark:border-slate-800/50 pointer-events-none">
                       <span className="text-[9px] text-slate-400">{node.data.timestamp}</span>
                    </div>

                    {/* Active Indicator */}
                    {node.data.isActivePath && (
                         <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white border-2 border-indigo-500 rounded-full flex items-center justify-center z-20 shadow-sm">
                            <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                         </div>
                    )}
                </div>
            ))}
        </div>
      </div>
      
      {/* Controls */}
      <div className="absolute bottom-6 right-6 flex flex-col gap-2 z-20">
         <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-1.5 flex flex-col gap-1">
             <button className="p-2 hover:bg-slate-100 rounded text-slate-500"><Maximize2 size={16} /></button>
             <button className="p-2 hover:bg-slate-100 rounded text-slate-500"><GitBranch size={16} /></button>
         </div>
      </div>
    </div>
  );
};

export default TreeTopology;