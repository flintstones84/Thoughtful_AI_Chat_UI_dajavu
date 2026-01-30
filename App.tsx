import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import SettingsPanel from './components/SettingsPanel';
import TreeTopology from './components/TreeTopology';
import SearchResults from './components/SearchResults';
import { MessageSquare, GitBranch } from 'lucide-react';

interface AppState {
  activeView: 'chat' | 'tree';
  activeSessionId: string;
  searchQuery: string;
}

interface Session {
  id: string;
  title: string;
  date: string;
  preview: string;
}

interface ModelSettings {
  temperature: number;
  topP: number;
  maxTokens: number;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: React.ReactNode;
  time: string;
  model?: string;
}

interface MessagesMap {
  [key: string]: Message[];
}

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    activeView: 'chat',
    activeSessionId: '',
    searchQuery: ''
  });

  const [sessions, setSessions] = useState<Session[]>([]);
  const [messagesMap, setMessagesMap] = useState<MessagesMap>({});
  const [modelSettings, setModelSettings] = useState<ModelSettings>({
    temperature: 0.0,
    topP: 0.9,
    maxTokens: 1000
  });

  const handleNewChat = () => {
      // Generate a simple ID
      const newId = `new-${Date.now()}`;
      const newSession: Session = {
        id: newId,
        title: 'New Conversation',
        date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        preview: 'Start a new conversation'
      };
      
      // Add new session to sessions list
      setSessions(prev => [newSession, ...prev]);
      
      setState(prev => ({
        ...prev,
        activeSessionId: newId,
        activeView: 'chat', // Ensure we are in chat view
        searchQuery: '' // Clear search if starting new chat
      }));
  };

  const handleSearch = (query: string) => {
      setState(prev => ({
        ...prev,
        searchQuery: query
      }));
  };

  const handleResultClick = (result: any) => {
    if (result.sessionId) {
        setState(prev => ({
          ...prev,
          activeSessionId: result.sessionId,
          activeView: 'chat',
          searchQuery: '' // Clear search query to show the chat view
        }));
    }
  };

  const handleSwitchView = (view: 'chat' | 'tree') => {
    setState(prev => ({
      ...prev,
      activeView: view
    }));
  };

  const handleSelectSession = (id: string) => {
    setState(prev => ({
      ...prev,
      activeSessionId: id,
      searchQuery: ''
    }));
  };

  const handleDeleteSession = (id: string) => {
    // Remove session from sessions list
    setSessions(prev => prev.filter(session => session.id !== id));
    
    // Remove messages for this session
    setMessagesMap(prev => {
      const newMessagesMap = { ...prev };
      delete newMessagesMap[id];
      return newMessagesMap;
    });
    
    // If the deleted session was the active one, clear active session ID
    if (state.activeSessionId === id) {
      setState(prev => ({
        ...prev,
        activeSessionId: ''
      }));
    }
  };

  const handleCreateSession = (session: Session) => {
    // Add new session to the beginning of the sessions list
    setSessions(prev => [session, ...prev]);
  };

  const renderMainContent = () => {
      if (state.searchQuery) {
          return <SearchResults query={state.searchQuery} onResultClick={handleResultClick} sessions={sessions} messagesMap={messagesMap} />;
      }
      
      if (state.activeView === 'chat') {
          return <ChatArea onSwitchView={handleSwitchView} activeSessionId={state.activeSessionId} sessions={sessions} messagesMap={messagesMap} setMessagesMap={setMessagesMap} onCreateSession={handleCreateSession} modelSettings={modelSettings} />;
      }
      
      return <TreeTopology />;
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100">
      <Sidebar 
        activeSessionId={state.activeSessionId} 
        onSelectSession={handleSelectSession} 
        onDeleteSession={handleDeleteSession}
        onSearch={handleSearch}
        sessions={sessions}
      />
      
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Navigation Bar for View Switching */}
        <div className="h-14 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between px-6 shrink-0 z-20">
           <div className="flex items-center gap-4">
              <h2 className="font-semibold text-lg flex items-center gap-2">
                 {state.activeView === 'tree' && !state.searchQuery ? (
                    <>
                       <GitBranch className="text-indigo-600" size={20} />
                       <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 font-bold">Conversation Topology</span>
                    </>
                 ) : state.searchQuery ? (
                     <>
                        <span className="text-slate-500">Search Results</span>
                     </>
                 ) : (
                    <>
                       <MessageSquare className="text-indigo-600" size={20} />
                       <span>Chat Interface</span>
                    </>
                 )}
              </h2>
           </div>

           {!state.searchQuery && (
           <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
              <button 
                onClick={() => handleSwitchView('chat')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${state.activeView === 'chat' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <MessageSquare size={14} />
                Chat
              </button>
              <button 
                onClick={() => handleSwitchView('tree')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${state.activeView === 'tree' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <GitBranch size={14} />
                Topology
              </button>
           </div>
           )}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex relative overflow-hidden">
           {renderMainContent()}
        </div>
      </main>

      <SettingsPanel 
        onSwitchView={handleSwitchView} 
        onNewChat={handleNewChat}
        modelSettings={modelSettings}
        onModelSettingsChange={setModelSettings}
      />
    </div>
  );
};

export default App;