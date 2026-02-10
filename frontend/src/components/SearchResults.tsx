import React from 'react';
import { MessageSquare, FileText, Filter, Calendar } from 'lucide-react';

interface Session {
  id: string;
  title: string;
  date: string;
  preview: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: React.ReactNode;
  time: string;
  model?: string;
}

interface SearchResultItem {
  id: number;
  type: 'message' | 'file';
  title: string;
  content: string;
  date: string;
  session?: string;
  sessionId: string;
  size?: string;
}

interface SearchResultsProps {
  query: string;
  onResultClick: (result: SearchResultItem) => void;
  sessions?: Session[];
  messagesMap?: { [key: string]: Message[] };
}

const SearchResults: React.FC<SearchResultsProps> = ({ query, onResultClick, sessions = [], messagesMap = {} }) => {
  // Generate search results from real sessions and messages
  const generateSearchResults = (): SearchResultItem[] => {
    const results: SearchResultItem[] = [];
    let id = 1;
    
    sessions.forEach(session => {
      // Add session itself as a result
      results.push({
        id: id++,
        type: 'message',
        title: session.title,
        content: session.preview,
        date: session.date,
        session: session.title,
        sessionId: session.id
      });
      
      // Add messages for each session
      const messages = messagesMap[session.id] || [];
      messages.forEach(message => {
        // Extract text from message text (simplified for demo)
        let messageText = '';
        if (typeof message.text === 'string') {
          messageText = message.text;
        } else if (React.isValidElement(message.text)) {
          // For React elements, we'll use a placeholder
          messageText = 'Message content';
        }
        
        results.push({
          id: id++,
          type: 'message',
          title: message.role === 'user' ? 'User Message' : 'AI Response',
          content: messageText,
          date: message.time,
          session: session.title,
          sessionId: session.id
        });
      });
    });
    
    return results;
  };

  const mockData = generateSearchResults();

  const results = mockData.filter(item => 
    item.content.toLowerCase().includes(query.toLowerCase()) || 
    item.title.toLowerCase().includes(query.toLowerCase()) ||
    (item.session && item.session.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <div className="flex-1 bg-slate-50 dark:bg-slate-950 p-6 md:p-10 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
           <div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                 搜索结果
                 <span className="text-base font-normal text-slate-500">for "{query}"</span>
              </h2>
              <p className="text-sm text-slate-500 mt-1">Found {results.length} matching items</p>
           </div>
           
           <div className="flex bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 p-1 self-start">
              <button className="px-4 py-1.5 text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-md shadow-sm transition-all">全部 (All)</button>
              <button className="px-4 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-md transition-all">会话 (Chats)</button>
              <button className="px-4 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-md transition-all">文件 (Files)</button>
           </div>
        </div>
        
        <div className="space-y-4">
           {results.length > 0 ? results.map(result => (
             <div 
                key={result.id} 
                onClick={() => onResultClick(result)}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-5 hover:border-indigo-400 dark:hover:border-indigo-500 transition-all cursor-pointer group shadow-sm hover:shadow-md"
             >
                <div className="flex items-start justify-between mb-2">
                   <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-lg ${result.type === 'message' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'}`}>
                        {result.type === 'message' ? <MessageSquare size={16} /> : <FileText size={16} />}
                      </div>
                      <div>
                          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {result.title}
                          </h3>
                          {result.session && <div className="text-xs text-slate-400 flex items-center gap-1">in <span className="font-medium">{result.session}</span></div>}
                          {result.size && <div className="text-xs text-slate-400">{result.size}</div>}
                      </div>
                   </div>
                   <div className="flex items-center gap-1 text-xs text-slate-400 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded">
                      <Calendar size={12} />
                      {result.date}
                   </div>
                </div>
                
                <div className="pl-[52px]">
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800" dangerouslySetInnerHTML={{
                        __html: result.content.replace(new RegExp(query, 'gi'), (match) => `<span class="bg-yellow-200 dark:bg-yellow-900/50 text-slate-900 dark:text-slate-100 font-medium px-0.5 rounded">${match}</span>`)
                    }}></p>
                </div>
             </div>
           )) : (
             <div className="flex flex-col items-center justify-center py-20 text-slate-400 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                    <Filter size={32} className="opacity-50" />
                </div>
                <h3 className="text-lg font-medium text-slate-700 dark:text-slate-200">No results found</h3>
                <p className="text-sm max-w-xs text-center mt-2">We couldn't find anything matching "{query}". Try different keywords or filters.</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default SearchResults;