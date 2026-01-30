import React from 'react';
import { Search, BrainCircuit, MoreHorizontal } from 'lucide-react';

interface Session {
  id: string;
  title: string;
  date: string;
  preview: string;
}

interface SidebarProps {
  activeSessionId?: string;
  onSelectSession: (id: string) => void;
  onDeleteSession: (id: string) => void;
  onSearch?: (query: string) => void;
  sessions?: Session[];
}

const Sidebar: React.FC<SidebarProps> = ({ activeSessionId = '', onSelectSession, onDeleteSession, onSearch, sessions = [] }) => {
  return (
    <aside className="w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col h-full shrink-0">
      {/* Header */}
      <div className="h-16 flex items-center px-6 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3 group cursor-pointer transition-all">
          <div className="relative w-9 h-9 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 group-hover:-rotate-3 transition-transform duration-300">
             <BrainCircuit size={18} className="text-white relative z-10" />
             <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-white rounded-full opacity-60 animate-pulse"></div>
          </div>
          <div className="flex flex-col">
             <span className="font-extrabold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
               呆加悟
             </span>
             <span className="text-sm text-slate-400 -mt-1 group-hover:text-indigo-500 transition-colors font-artistic">
               déjà vu
             </span>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="p-4">
        <div className="relative">
          <input
            type="text"
            placeholder="搜索对话..."
            onChange={(e) => onSearch && onSearch(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />
          <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-3 space-y-1">
        <h3 className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">历史对话</h3>
        {sessions.length > 0 ? (
          sessions.map((session) => (
            <div
              key={session.id}
              onClick={() => onSelectSession(session.id)}
              className={`group p-3 rounded-lg cursor-pointer transition-all hover:bg-slate-100 dark:hover:bg-slate-800 ${
                activeSessionId === session.id ? 'bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/50' : 'border border-transparent'
              }`}
            >
              <div className="flex justify-between items-start mb-1">
              <h4 className={`font-medium text-sm truncate w-3/4 ${activeSessionId === session.id ? 'text-indigo-700 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-200'}`}>
                {session.title}
              </h4>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400">{session.date}</span>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteSession(session.id);
                  }}
                  className="text-slate-400 hover:text-red-500 transition-colors p-0.5 rounded-full hover:bg-red-50"
                  title="删除会话"
                >
                  <span className="text-xs">×</span>
                </button>
              </div>
            </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                {session.preview}
              </p>
            </div>
          ))
        ) : (
          <div className="p-6 text-center text-slate-400">
            <p>暂无历史对话</p>
            <p className="text-xs mt-1">开始新的对话吧</p>
          </div>
        )}
      </div>

      {/* User Profile */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800">
        <button className="flex items-center gap-3 w-full hover:bg-slate-50 dark:hover:bg-slate-800 p-2 rounded-lg transition-colors">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs">
            EH
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Edwin Hong</p>
            <p className="text-xs text-slate-500">Pro Plan</p>
          </div>
          <MoreHorizontal size={16} className="text-slate-400" />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;