import React, { useState } from 'react';
import { Settings, Sliders, FileText, Database, GitBranch, Zap, Sparkles, Plus, Trash2, Edit3, ToggleLeft, ToggleRight } from 'lucide-react';

interface ModelSettings {
  temperature: number;
  topP: number;
  maxTokens: number;
}

interface SettingsPanelProps {
  onSwitchView: (view: 'chat' | 'tree') => void;
  onNewChat: () => void;
  modelSettings: ModelSettings;
  onModelSettingsChange: (settings: ModelSettings) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ onSwitchView, onNewChat, modelSettings, onModelSettingsChange }) => {
  const [globalMemoryEnabled, setGlobalMemoryEnabled] = useState(true);
  
  // 使用外部传入的modelSettings参数，并在用户调整时更新外部状态
  const handleTemperatureChange = (value: number) => {
    onModelSettingsChange({ ...modelSettings, temperature: value });
  };
  
  const handleTopPChange = (value: number) => {
    onModelSettingsChange({ ...modelSettings, topP: value });
  };
  
  const handleMaxTokensChange = (value: number) => {
    onModelSettingsChange({ ...modelSettings, maxTokens: value });
  };

  return (
    <aside className="w-80 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col h-full shrink-0 overflow-y-auto">
      {/* New Chat Button */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800">
        <button 
            onClick={onNewChat}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-2.5 rounded-lg font-medium shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
        >
          <Plus size={18} />
          <span>新建会话 (New Chat)</span>
        </button>
      </div>

      <div className="p-5 space-y-8">
        
        {/* Model Settings */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Sliders size={14} />
              会话设置 (SETTINGS)
            </h3>
            <Settings size={14} className="text-slate-400 cursor-pointer hover:text-slate-600" />
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700 space-y-5">
            {/* Model Select */}
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">模型 (Model)</label>
              <div className="relative">
                <select className="w-full appearance-none bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-xs py-2 px-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-slate-700 dark:text-slate-200">
                  <option>DeepSeek</option>
                </select>
                <div className="absolute right-3 top-2.5 pointer-events-none text-slate-500">
                  <Settings size={14} />
                </div>
              </div>
            </div>

            {/* Temperature */}
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-[10px] font-medium text-slate-500">Temperature</label>
                <span className="text-[10px] text-indigo-600 font-mono bg-indigo-50 px-1.5 rounded">{modelSettings.temperature}</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.1" 
                value={modelSettings.temperature} 
                onChange={(e) => handleTemperatureChange(parseFloat(e.target.value))} 
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" 
              />
              <div className="flex justify-between text-[8px] text-slate-400 mt-1">
                <span>Precise</span>
                <span>Creative</span>
              </div>
            </div>

            {/* Top-P */}
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-[10px] font-medium text-slate-500">Top-P</label>
                <span className="text-[10px] text-indigo-600 font-mono bg-indigo-50 px-1.5 rounded">{modelSettings.topP}</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.1" 
                value={modelSettings.topP} 
                onChange={(e) => handleTopPChange(parseFloat(e.target.value))} 
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" 
              />
            </div>

            {/* Max Tokens */}
            <div>
               <div className="flex justify-between mb-2">
                <label className="text-[10px] font-medium text-slate-500">Max Tokens</label>
                <span className="text-[10px] text-indigo-600 font-mono bg-indigo-50 px-1.5 rounded">{modelSettings.maxTokens}</span>
              </div>
              <div className="flex items-center gap-3">
                 <input 
                   type="range" 
                   min="0" 
                   max="8192" 
                   step="128" 
                   value={modelSettings.maxTokens} 
                   onChange={(e) => handleMaxTokensChange(parseInt(e.target.value))} 
                   className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" 
                 />
                 <div className="w-6 h-6 rounded bg-amber-100 flex items-center justify-center text-amber-500 shrink-0 shadow-sm border border-amber-200">
                    <Zap size={12} fill="currentColor" />
                 </div>
              </div>
            </div>
          </div>
        </section>

        {/* Knowledge & Branching */}
        <section>
           <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Database size={14} />
                知识库 (KNOWLEDGE)
              </h3>
              <button className="text-[10px] text-indigo-600 hover:bg-indigo-50 px-2 py-0.5 rounded flex items-center gap-1 transition-colors">
                 <Plus size={10} /> Add
              </button>
           </div>
            
           {/* Scrollable Container for Knowledge Items */}
           <div className="space-y-2 max-h-48 overflow-y-auto pr-1 scrollbar-hide">
             {/* Knowledge Item 1 */}
             <div className="group bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 flex items-start gap-3 shadow-sm hover:border-indigo-300 transition-colors">
                <div className="pt-0.5">
                   <input type="checkbox" defaultChecked className="w-3.5 h-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600" />
                </div>
                <div className="flex-1 min-w-0">
                   <div className="flex items-center gap-2 mb-0.5">
                      <FileText size={12} className="text-blue-500" />
                      <div className="text-xs font-medium text-slate-700 dark:text-slate-200 truncate">Global Engineering Docs</div>
                   </div>
                   <div className="text-[10px] text-slate-400">2.4 MB • Updated 2h ago</div>
                </div>
                <button className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1">
                   <Trash2 size={12} />
                </button>
             </div>

             {/* Knowledge Item 2 */}
              <div className="group bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 flex items-start gap-3 shadow-sm hover:border-indigo-300 transition-colors">
                <div className="pt-0.5">
                   <input type="checkbox" className="w-3.5 h-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600" />
                </div>
                <div className="flex-1 min-w-0">
                   <div className="flex items-center gap-2 mb-0.5">
                      <FileText size={12} className="text-emerald-500" />
                      <div className="text-xs font-medium text-slate-700 dark:text-slate-200 truncate">System_Architecture_v2.pdf</div>
                   </div>
                   <div className="text-[10px] text-slate-400">5.1 MB • Uploaded yesterday</div>
                </div>
                <button className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1">
                   <Trash2 size={12} />
                </button>
             </div>

             {/* Mock Item 3 for scrolling demo */}
             <div className="group bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 flex items-start gap-3 shadow-sm hover:border-indigo-300 transition-colors">
                <div className="pt-0.5">
                   <input type="checkbox" className="w-3.5 h-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600" />
                </div>
                <div className="flex-1 min-w-0">
                   <div className="flex items-center gap-2 mb-0.5">
                      <FileText size={12} className="text-orange-500" />
                      <div className="text-xs font-medium text-slate-700 dark:text-slate-200 truncate">Q3_Marketing_Report.docx</div>
                   </div>
                   <div className="text-[10px] text-slate-400">1.2 MB • Uploaded 3d ago</div>
                </div>
                <button className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1">
                   <Trash2 size={12} />
                </button>
             </div>
           </div>
        </section>

        {/* Mini Branch Map */}
        <section>
           <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <GitBranch size={14} />
              MINI TOPOLOGY
            </h3>
            <button 
                onClick={() => onSwitchView('tree')}
                className="text-[10px] text-indigo-600 cursor-pointer hover:underline"
            >
                View Full
            </button>
          </div>
          <div className="h-32 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 relative overflow-hidden flex items-center justify-center cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => onSwitchView('tree')}>
             {/* Abstract representation of the tree */}
             <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#4f46e5_1px,transparent_1px)] [background-size:16px_16px]"></div>
             <div className="flex items-center gap-2 scale-90">
                <div className="w-2 h-2 rounded-full bg-slate-400"></div>
                <div className="w-8 h-px bg-slate-300"></div>
                <div className="w-2 h-2 rounded-full bg-indigo-500 ring-4 ring-indigo-100"></div>
                <div className="w-8 h-px bg-slate-300"></div>
                 <div className="flex flex-col gap-2">
                    <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                    <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                 </div>
             </div>
          </div>
        </section>

        {/* Memories */}
        <section className="space-y-3">
           <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/30 rounded-lg p-3 relative flex items-center justify-between">
              <div className="flex items-center gap-2">
                 <div className="bg-amber-100 text-amber-600 p-1 rounded">
                    <Zap size={14} /> 
                 </div>
                 <span className="text-xs font-bold text-amber-700 dark:text-amber-500 uppercase">
                  全局记忆 (Global Memory)
                 </span>
              </div>
              <button onClick={() => setGlobalMemoryEnabled(!globalMemoryEnabled)} className="text-amber-600 hover:text-amber-700 transition-colors">
                  {globalMemoryEnabled ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
              </button>
           </div>

           <div className="bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800/30 rounded-lg p-3 relative group">
              <div className="flex justify-between items-center mb-1">
                 <span className="text-[10px] font-bold text-indigo-600/70 uppercase flex items-center gap-1">
                  <Sparkles size={12} /> 会话记忆
                </span>
                <button className="text-indigo-400 hover:text-indigo-600 transition-colors p-1 bg-white/50 rounded-md hover:bg-white">
                    <Edit3 size={12} />
                </button>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3">
                已建议使用 Caffeine + Redis 二级缓存方案。
              </p>
           </div>
        </section>

      </div>
    </aside>
  );
};

export default SettingsPanel;