import React, { useState, useEffect, useRef } from 'react';
import { Bot, User, Send, Paperclip, Image, Copy, MoreHorizontal, Pencil, Share2, XSquare, GitBranch, Maximize2, Minimize2, ThumbsUp, ThumbsDown, Volume2, RefreshCw, Trash2, Cpu, Code2, ArrowRight, GripHorizontal } from 'lucide-react';

interface Session {
  id: string;
  title: string;
  date: string;
  preview: string;
}

interface ChatAreaProps {
  onSwitchView: (view: 'chat' | 'tree') => void;
  activeSessionId?: string;
  sessions?: Session[];
  messagesMap?: MessagesMap;
  setMessagesMap?: React.Dispatch<React.SetStateAction<MessagesMap>>;
  onCreateSession?: (session: Session) => void;
  modelSettings?: {
    temperature: number;
    topP: number;
    maxTokens: number;
  };
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

const DEMO_MESSAGES: Message[] = [
    {
        id: 'msg-1',
        role: 'user',
        time: '10:42 AM',
        text: <p>请帮我设计一个高并发系统的缓存策略。目前的痛点是数据库在高峰期负载过高，主要读操作集中在几个热点表上。</p>
    },
    {
        id: 'msg-2',
        role: 'assistant',
        time: '10:42 AM',
        model: 'GPT-4',
        text: (
            <>
                <p className="mb-3">针对您描述的高并发读操作导致数据库负载过高的问题，我建议采用 <strong>多级缓存策略 (Multi-Level Caching)</strong>，具体方案如下：</p>
                
                <div className="pl-4 border-l-2 border-indigo-100 dark:border-indigo-900 space-y-2 mb-3">
                   <div>
                      <h4 className="font-bold text-indigo-700 dark:text-indigo-400">1. 本地缓存 (L1 Cache)</h4>
                      <p className="text-slate-500">使用 Caffeine 或 Guava。优势是速度极快，无网络开销。适用于极热点数据（如 Top 10 榜单）。</p>
                   </div>
                   <div>
                      <h4 className="font-bold text-indigo-700 dark:text-indigo-400">2. 分布式缓存 (L2 Cache)</h4>
                      <p className="text-slate-500">引入 Redis Cluster。使用 Cache Aside Pattern（旁路缓存模式）。</p>
                   </div>
                </div>

                <p>您是否需要我提供具体的 Spring Boot 集成 Redis 的配置代码示例？</p>
            </>
        )
    },
    {
        id: 'msg-3',
        role: 'user',
        time: '10:45 AM',
        text: <p>好的，请提供 Spring Boot 集成 Redis 的配置代码，最好包含连接池的配置。</p>
    },
    {
        id: 'msg-4',
        role: 'assistant',
        time: '10:45 AM',
        model: 'GPT-4',
        text: (
            <>
                 <p className="mb-3">没问题，这是基于 Spring Boot 3.0 和 Lettuce 客户端的 Redis 配置示例，包含了连接池 (GenericObjectPoolConfig) 的优化设置。</p>
                 <div className="bg-slate-900 text-slate-200 p-4 rounded-lg font-mono text-xs my-2 overflow-x-auto border border-slate-700 shadow-inner">
                    <div className="flex justify-between items-center mb-2 border-b border-slate-700 pb-2">
                        <span className="text-slate-400 font-bold">RedisConfig.java</span>
                        <Copy size={12} className="cursor-pointer hover:text-white" />
                    </div>
                    <pre>{`@Configuration
public class RedisConfig {

    @Bean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory factory) {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(factory);
        // JSON 序列化配置...
        return template;
    }
}`}</pre>
                 </div>
                 <p className="text-xs text-slate-500 mt-2">建议根据实际机器的 CPU 核心数调整 io-threads 参数。</p>
            </>
        )
    },
    {
        id: 'msg-5',
        role: 'user',
        time: '10:48 AM',
        text: <p>如果我的热点数据更新很频繁，如何保证本地缓存和 Redis 的一致性？</p>
    },
     {
        id: 'msg-6',
        role: 'assistant',
        time: '10:49 AM',
        model: 'GPT-4',
        text: (
             <>
                <p className="mb-2">对于更新频繁的热点数据，保证一致性是一个经典难题。推荐使用 <strong>Redis Pub/Sub 广播机制</strong>。</p>
                <p>当某个节点修改数据并更新 Redis 后，发布一个消息。其他所有节点订阅该频道，收到消息后删除本地缓存 (Invalidate)，下次读取时重新加载。</p>
            </>
        )
    },
    {
        id: 'msg-7',
        role: 'user',
        time: '10:52 AM',
        text: <p>除了 Pub/Sub，还有没有更轻量级的方法？比如设置过期时间？</p>
    },
    {
        id: 'msg-8',
        role: 'assistant',
        time: '10:52 AM',
        model: 'GPT-4',
        text: (
             <>
                <p>是的，您可以为本地缓存设置一个极短的 TTL（例如 1-5 秒）。这样虽然会有短暂的不一致窗口，但对于大多数非金融级业务（如商品详情页、评论列表）是可以接受的，且实现极其简单。</p>
            </>
        )
    },
    {
        id: 'msg-9',
        role: 'user',
        time: '10:55 AM',
        text: <p>那关于缓存击穿（Hotspot Invalid）有什么好的预防方案？</p>
    },
    {
        id: 'msg-10',
        role: 'assistant',
        time: '10:56 AM',
        model: 'GPT-4',
        text: (
             <>
                <p className="mb-2">缓存击穿是指热点 Key 过期瞬间，大量请求打到数据库。</p>
                <ul className="list-disc pl-5 space-y-1">
                    <li><strong>互斥锁 (Mutex Lock):</strong> Redis SETNX，只让一个线程查 DB 写缓存，其他等待。</li>
                    <li><strong>逻辑过期:</strong> 缓存永不过期，Key 中包含过期时间戳。业务层判断是否“逻辑过期”，如果是，异步启动线程去更新缓存，当前请求返回旧值。</li>
                </ul>
            </>
        )
    }
];

const DEMO_MESSAGES_PYTHON: Message[] = [
  {
    id: 'msg-p-1',
    role: 'user',
    time: 'Yesterday',
    text: <p>我有一个 sales_data.csv 文件，里面有很多缺失值（NaN），我该怎么用 Pandas 处理它们？</p>
  },
  {
    id: 'msg-p-2',
    role: 'assistant',
    time: 'Yesterday',
    model: 'Claude 3',
    text: (
        <>
            <p className="mb-3">处理 Pandas 中的缺失值主要有两种策略：<strong>删除 (Dropping)</strong> 和 <strong>填充 (Filling)</strong>。</p>
            <div className="bg-slate-900 text-slate-300 p-4 rounded-lg font-mono text-xs border border-slate-800 overflow-x-auto">
                <div className="flex justify-between items-center mb-2 border-b border-slate-700 pb-2">
                    <span className="text-slate-400 font-bold">pandas_demo.py</span>
                    <Copy size={12} className="cursor-pointer hover:text-white" />
                </div>
                <pre>{`import pandas as pd

# 读取数据
df = pd.read_csv('sales_data.csv')

# 1. 删除包含缺失值的行
df_dropped = df.dropna()

# 2. 用特定值填充 (例如 0)
df_filled_zero = df.fillna(0)

# 3. 用平均值填充
df['amount'] = df['amount'].fillna(df['amount'].mean())

print("处理完成")`}</pre>
            </div>
        </>
    )
  }
];

const DEMO_MESSAGES_SQL: Message[] = [
   {
    id: 'msg-s-1',
    role: 'user',
    time: 'Jan 09',
    text: <p>我有一个百万级数据的 Left Join 查询，执行非常慢。SQL 如下：<br/><code>SELECT * FROM orders o LEFT JOIN users u ON o.user_id = u.id</code></p>
  },
  {
    id: 'msg-s-2',
    role: 'assistant',
    time: 'Jan 09',
    model: 'GPT-4',
    text: (
         <>
            <p className="mb-2">对于百万级数据的 Join 操作，慢查询通常是因为<strong>缺少索引</strong>。</p>
            <p>请检查以下几点：</p>
            <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-300">
                <li>确保 <code>orders.user_id</code> 和 <code>users.id</code> 都有索引。</li>
                <li>如果是 MySQL，检查 Explain 计划，看是否走了 Index。</li>
                <li>尽量避免 <code>SELECT *</code>，只查询需要的字段，减少 I/O 开销。</li>
            </ul>
        </>
    )
  }
];

const ChatArea: React.FC<ChatAreaProps> = ({ onSwitchView, activeSessionId = '', sessions = [], messagesMap = {}, setMessagesMap = (prev) => prev, onCreateSession, modelSettings = { temperature: 0.0, topP: 0.9, maxTokens: 1000 } }) => {
  const [isMaximized, setIsMaximized] = useState(false);
  const [activeMessageId, setActiveMessageId] = useState<string>('');
  const [maximizedMessage, setMaximizedMessage] = useState<Message | null>(null);
  
  // Tab Management
  const [chatTabs, setChatTabs] = useState<{id: string, title: string}[]>([]);
  const [activeTabId, setActiveTabId] = useState<string>('');
  const [showTabDropdown, setShowTabDropdown] = useState(false);
  
  // Editing State
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [editContent, setEditContent] = useState('');
  
  // Input Area State
  const [inputHeight, setInputHeight] = useState(140); // Initial height including padding
  const [isInputExpanded, setIsInputExpanded] = useState(false); // Toggle state
  const [isDragging, setIsDragging] = useState(false);
  const [inputMessage, setInputMessage] = useState(''); // User input message
  const [isLoading, setIsLoading] = useState(false); // Loading state for API calls

  // Resize Logic
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
        if (isDragging) {
            // Calculate new height from bottom of screen
            // Height = Window Height - Mouse Y position
            const newHeight = window.innerHeight - e.clientY;
            // Clamp height (min 100, max 80% of screen)
            const minHeight = 100;
            const maxHeight = window.innerHeight * 0.8;
            const clampedHeight = Math.max(minHeight, Math.min(maxHeight, newHeight));
            
            setInputHeight(clampedHeight);
            setIsInputExpanded(clampedHeight > 200); // Auto toggle expanded state visual if large
        }
    };
    const handleMouseUp = () => {
        setIsDragging(false);
        document.body.style.cursor = 'default';
        document.body.style.userSelect = 'auto';
    };

    if (isDragging) {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = 'row-resize';
        document.body.style.userSelect = 'none';
    }
    return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = 'default';
        document.body.style.userSelect = 'auto';
    };
  }, [isDragging]);

  const handleMouseDown = (e: React.MouseEvent) => {
      e.preventDefault();
      setIsDragging(true);
  };

  const toggleExpand = () => {
      if (isInputExpanded) {
          setInputHeight(140); // Reset to default
          setIsInputExpanded(false);
      } else {
          setInputHeight(500); // Large expanded size
          setIsInputExpanded(true);
      }
  };

  // Effect to handle new session or external session change
  useEffect(() => {
    if (activeSessionId) {
        // If the session ID matches an existing tab, switch to it
        const existingTab = chatTabs.find(t => t.id === activeSessionId);
        if (existingTab) {
            setActiveTabId(activeSessionId);
        } else {
            // Find the session in the sessions list to get its title
            const session = sessions.find(s => s.id === activeSessionId);
            const tabTitle = session ? session.title : 'New Conversation';
            
            // Create a new tab for the session
            const newTab = { id: activeSessionId, title: tabTitle };
            setChatTabs(prev => [...prev, newTab]);
            
            // Only initialize empty messages array if it doesn't already exist
            setMessagesMap(prev => {
                if (prev[activeSessionId]) {
                    // Messages already exist, keep them
                    return prev;
                } else {
                    // Initialize empty messages array for the session
                    return {
                        ...prev,
                        [activeSessionId]: []
                    };
                }
            });
            
            setActiveTabId(activeSessionId);
        }
    }
  }, [activeSessionId, sessions]);

  // Derive messages based on active tab
  const currentMessages = messagesMap[activeTabId] || [];

  const scrollToMessage = (id: string) => {
    setActiveMessageId(id);
    const element = document.getElementById(id);
    if (element) {
      // Offset for header
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      
      // We use scrollIntoView with block: 'start' to snap to top as requested
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleMaximize = (msg: Message) => {
      setMaximizedMessage(msg);
      setIsMaximized(true);
  }

  const handleCloseTab = (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      setChatTabs(prev => prev.filter(t => t.id !== id));
      if (activeTabId === id) {
          setActiveTabId(chatTabs[0]?.id || '');
      }
  };
  
  const handleEditClick = (msg: Message) => {
    let content = '';
    // Simple text extraction for demo purposes
    if (typeof msg.text === 'string') {
        content = msg.text;
    } else if (React.isValidElement(msg.text)) {
        // Cast to ReactElement with children props to avoid "Property 'children' does not exist on type 'unknown'"
        const element = msg.text as React.ReactElement<{children?: React.ReactNode}>;
        if (element.props.children) {
            if (typeof element.props.children === 'string') {
                content = element.props.children;
            } else if (Array.isArray(element.props.children)) {
                content = element.props.children.map(child => 
                    typeof child === 'string' ? child : ''
                ).join('');
            }
        }
    }
    setEditContent(content);
    setEditingMessage(msg);
  };

  const handleSaveEdit = () => {
    if (!editingMessage) return;
    
    setMessagesMap(prev => {
        const updatedMessages = (prev[activeTabId] || []).map(m => 
            m.id === editingMessage.id 
            ? { ...m, text: <p>{editContent}</p> } 
            : m
        );
        return { ...prev, [activeTabId]: updatedMessages };
    });
    setEditingMessage(null);
  };

  // Send message function
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;
    
    const messageText = inputMessage.trim();
    setInputMessage(''); // Clear input field
    
    // Check if there's an active tab, if not, create a new session
    let currentTabId = activeTabId;
    if (!currentTabId) {
      // Generate a new session ID
      currentTabId = `new-${Date.now()}`;
      
      // Create a new tab for the session
      const newTab = { id: currentTabId, title: 'New Conversation' };
      setChatTabs(prev => [...prev, newTab]);
      
      // Initialize empty messages array for new session
      setMessagesMap(prev => ({
        ...prev,
        [currentTabId]: []
      }));
      
      // Create a new session object for the history
      const newSession: Session = {
        id: currentTabId,
        title: 'New Conversation',
        date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        preview: messageText.substring(0, 50) + (messageText.length > 50 ? '...' : '')
      };
      
      // Call onCreateSession to add the new session to the history
      if (onCreateSession) {
        onCreateSession(newSession);
      }
      
      // Update active tab ID
      setActiveTabId(currentTabId);
    }
    
    // Add user message to the chat
    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      text: <p>{messageText}</p>,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessagesMap(prev => ({
      ...prev,
      [currentTabId]: [...(prev[currentTabId] || []), userMessage]
    }));
    
    // Update session ID for API call
    const sessionId = currentTabId;
    
    setIsLoading(true);
    
    try {
      // Call the backend API
      const response = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: messageText,
          session_id: sessionId,
          model_settings: modelSettings
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        const aiMessage: Message = {
          id: `msg-${Date.now() + 1}`,
          role: 'assistant',
          text: <p>{data.response}</p>,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          model: 'DeepSeek'
        };
        
        setMessagesMap(prev => ({
          ...prev,
          [sessionId]: [...(prev[sessionId] || []), aiMessage]
        }));
      } else {
        throw new Error('API call failed');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Add error message to chat
      const errorMessage: Message = {
        id: `msg-${Date.now() + 2}`,
        role: 'assistant',
        text: <p>Sorry, there was an error processing your message. Please try again later.</p>,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        model: 'System'
      };
      
      setMessagesMap(prev => ({
          ...prev,
          [sessionId]: [...(prev[sessionId] || []), errorMessage]
        }));
    } finally {
      setIsLoading(false);
    }
  };

  // Handle file upload
  const handleFileUpload = async (files: FileList) => {
    if (!files.length) return;
    
    const formData = new FormData();
    
    // Add files to form data
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }
    
    // Add session ID
    formData.append('session_id', activeTabId);
    
    try {
      setIsLoading(true);
      
      // Upload files to backend
      const response = await fetch('http://localhost:8000/upload', {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Add file upload message to chat
        const fileMessage: Message = {
          id: `msg-${Date.now()}`,
          role: 'user',
          text: <p>上传了 {files.length} 个文件: {Array.from(files).map(f => f.name).join(', ')}</p>,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        
        setMessagesMap(prev => ({
          ...prev,
          [activeTabId]: [...(prev[activeTabId] || []), fileMessage]
        }));
        
        // Add AI response about file upload
        const aiMessage: Message = {
          id: `msg-${Date.now() + 1}`,
          role: 'assistant',
          text: <p>文件上传成功！我已经收到了以下文件：{Array.from(files).map(f => f.name).join(', ')}。请问您希望我对这些文件做什么？</p>,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          model: 'DeepSeek'
        };
        
        setMessagesMap(prev => ({
          ...prev,
          [activeTabId]: [...(prev[activeTabId] || []), aiMessage]
        }));
      } else {
        throw new Error('文件上传失败');
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      // Add error message to chat
      const errorMessage: Message = {
        id: `msg-${Date.now() + 2}`,
        role: 'assistant',
        text: <p>文件上传失败，请重试。</p>,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        model: 'System'
      };
      
      setMessagesMap(prev => ({
        ...prev,
        [activeTabId]: [...(prev[activeTabId] || []), errorMessage]
      }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950 relative h-full min-w-0">
        {/* Full Screen Message Modal */}
        {isMaximized && maximizedMessage && (
            <div className="absolute inset-0 z-50 bg-white dark:bg-slate-950 flex flex-col animate-in fade-in duration-200">
                {/* Header */}
                <div className="h-16 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 bg-white/90 dark:bg-slate-900/90 backdrop-blur sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white shadow-md">
                            <Bot size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">ProMind AI Response</h3>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-500">{maximizedMessage.time}</span>
                                {maximizedMessage.model && <span className="text-[10px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded border border-indigo-100">{maximizedMessage.model}</span>}
                            </div>
                        </div>
                    </div>
                    <button 
                        onClick={() => setIsMaximized(false)}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300 transition-colors font-medium text-sm"
                    >
                        <Minimize2 size={16} />
                        <span>最小化 (Minimize)</span>
                    </button>
                </div>
                
                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 lg:p-12">
                    <div className="max-w-4xl mx-auto">
                         <div className="prose prose-slate dark:prose-invert max-w-none">
                             <div className="text-base md:text-lg leading-relaxed text-slate-700 dark:text-slate-200 space-y-6">
                                {maximizedMessage.text}
                             </div>
                         </div>
                    </div>
                </div>
            </div>
        )}
        
        {/* Edit Modal */}
        {editingMessage && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-[2px] p-4 animate-in fade-in duration-200">
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 dark:border-slate-700 animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                     <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex justify-between items-center">
                         <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                             <Pencil size={16} className="text-indigo-600" />
                             编辑消息
                         </h3>
                         <button onClick={() => setEditingMessage(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                             <XSquare size={20} />
                         </button>
                     </div>
                     <div className="p-6">
                         <label className="block text-xs font-medium text-slate-500 mb-2">Message Content</label>
                         <textarea 
                            value={editContent}
                            onChange={e => setEditContent(e.target.value)}
                            className="w-full h-40 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none text-sm text-slate-700 dark:text-slate-200 leading-relaxed shadow-sm"
                            autoFocus
                         />
                     </div>
                     <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                         <button onClick={() => setEditingMessage(null)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-700 rounded-lg transition-colors">取消</button>
                         <button onClick={handleSaveEdit} className="px-4 py-2 text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg shadow-md shadow-indigo-200 transition-colors">保存更新</button>
                     </div>
                </div>
            </div>
        )}

        {/* Header Tabs */}
        <div className="h-12 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center px-4 gap-2 z-20 shrink-0">
            {/* Tabs Container with Horizontal Scroll */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide flex-1">
                {chatTabs.map(tab => (
                    <div 
                        key={tab.id}
                        onClick={() => setActiveTabId(tab.id)}
                        className={`
                            px-3 py-1.5 rounded-md text-xs font-medium cursor-pointer flex items-center gap-2 border transition-all shrink-0
                            ${activeTabId === tab.id 
                                ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 shadow-sm' 
                                : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 border-transparent'
                            }
                        `}
                    >
                        <span>{tab.title}</span>
                        <button onClick={(e) => handleCloseTab(tab.id, e)} className="text-slate-400 hover:text-red-500 rounded-full p-0.5 hover:bg-slate-200 dark:hover:bg-slate-700">
                            <XSquare size={12} />
                        </button>
                    </div>
                ))}
            </div>
            {/* More Button with Dropdown */}
            <div className="flex items-center gap-2 ml-2 relative">
                <button 
                    onClick={() => setShowTabDropdown(!showTabDropdown)}
                    className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Tab List"
                >
                    <MoreHorizontal size={18} />
                </button>
                
                {/* Tab Dropdown */}
                {showTabDropdown && (
                    <div className="absolute right-0 top-full mt-1 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-1 w-64 z-50 animate-in fade-in duration-200">
                        {chatTabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => {
                                    setActiveTabId(tab.id);
                                    setShowTabDropdown(false);
                                }}
                                className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex justify-between items-center
                                    ${activeTabId === tab.id ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-200'}
                                `}
                            >
                                <span>{tab.title}</span>
                                {activeTabId === tab.id && (
                                    <span className="w-2 h-2 bg-indigo-600 dark:bg-indigo-400 rounded-full"></span>
                                )}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>

        {/* Content Wrapper */}
        <div className="flex-1 flex overflow-hidden relative">
            
            {/* Messages List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 scroll-smooth pb-20">
                
                {currentMessages.length > 0 ? (
                    currentMessages.map((msg) => (
                    <div 
                        key={msg.id} 
                        id={msg.id}
                        className={`group flex gap-4 scroll-mt-24 transition-all duration-500 ${msg.role === 'user' ? 'flex-row-reverse' : ''} ${activeMessageId === msg.id ? 'opacity-100' : 'opacity-90'}`}
                    >
                       <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white shadow-sm shrink-0 ${msg.role === 'user' ? 'bg-emerald-500' : 'bg-indigo-600'}`}>
                          {msg.role === 'user' ? <User size={18} /> : <Bot size={18} />}
                       </div>
                       <div className={`max-w-[85%] ${msg.role === 'user' ? '' : 'w-full'}`}>
                          <div className={`flex items-center gap-2 mb-1 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                             {msg.role === 'assistant' && <span className="font-semibold text-xs text-indigo-600 dark:text-indigo-400">ProMind AI</span>}
                             <span className="text-[10px] text-slate-400">{msg.time}</span>
                             {msg.role === 'user' && <span className="font-semibold text-xs text-slate-700 dark:text-slate-300">User</span>}
                             {msg.model && <span className="text-[10px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded border border-indigo-100">{msg.model}</span>}
                          </div>
                          <div className={`
                                bg-white dark:bg-slate-800 border transition-all duration-500 p-5 shadow-sm text-slate-700 dark:text-slate-200 text-sm leading-relaxed
                                ${msg.role === 'user' ? 'rounded-2xl rounded-tr-sm' : 'rounded-2xl rounded-tl-sm'}
                                ${activeMessageId === msg.id 
                                    ? (msg.role === 'user' ? 'border-emerald-300 dark:border-emerald-700 shadow-md ring-1 ring-emerald-100' : 'border-indigo-300 dark:border-indigo-700 shadow-md ring-1 ring-indigo-100')
                                    : 'border-slate-200 dark:border-slate-700'
                                }
                          `}>
                             {msg.text}
                          </div>
                          
                          {/* Action Buttons */}
                          <div className={`flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                              {msg.role === 'assistant' ? (
                                <>
                                  <button onClick={() => onSwitchView('tree')} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-md transition-colors" title="View in Topology"><GitBranch size={15} /></button>
                                  <button onClick={() => handleMaximize(msg)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-md transition-colors" title="放大"><Maximize2 size={15} /></button>
                                  <div className="w-px h-3 bg-slate-200 mx-1"></div>
                                  <button className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-md transition-colors"><ThumbsUp size={15} /></button>
                                  <button className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-md transition-colors"><ThumbsDown size={15} /></button>
                                  <button className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-md transition-colors"><Volume2 size={15} /></button>
                                  <button className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-md transition-colors"><RefreshCw size={15} /></button>
                                  <div className="w-px h-3 bg-slate-200 mx-1"></div>
                                  <button className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-md transition-colors"><Copy size={15} /></button>
                                </>
                              ) : (
                                <>
                                  <button onClick={() => handleEditClick(msg)} className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded transition-colors" title="修改"><Pencil size={14} /></button>
                                  <button className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded transition-colors" title="复制"><Copy size={14} /></button>
                                  <button className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors" title="删除"><Trash2 size={14} /></button>
                                </>
                              )}
                          </div>
                       </div>
                    </div>
                ))) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400">
                        <Bot size={48} className="mb-4 text-slate-300" />
                        <p>Start a new conversation</p>
                    </div>
                )}

                {/* Thinking State */}
                 {isLoading && (
                 <div className="flex gap-4 opacity-50">
                   <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white shadow-sm shrink-0">
                      <Bot size={18} />
                   </div>
                   <div className="bg-slate-100 dark:bg-slate-800/50 p-3 rounded-lg flex items-center gap-2">
                       <div className="flex gap-1">
                          <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></span>
                          <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-75"></span>
                          <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-150"></span>
                       </div>
                       <span className="text-xs text-indigo-500 font-medium">DeepChat is thinking...</span>
                   </div>
                </div>
                )}
            </div>

             {/* Revised Light & Compact Right Navigation Sidebar */}
             <div className="w-14 bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm border-l border-slate-200 dark:border-slate-800 flex flex-col items-center py-4 relative shrink-0 z-30 shadow-sm overflow-y-auto overflow-x-hidden scrollbar-hide">
                
                <div className="flex flex-col gap-3 w-full items-center relative z-10">
                    
                    {/* Start Node */}
                     <div className="w-1.5 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mb-1"></div>

                    {currentMessages.map((msg, index) => {
                        const isLast = index === currentMessages.length - 1;
                        return (
                        <div key={msg.id} className="relative group flex flex-col items-center gap-1">
                             {/* Vertical Connector Line */}
                             {!isLast && (
                                <div className="absolute top-7 left-1/2 -translate-x-1/2 w-px h-6 bg-slate-200 dark:bg-slate-800 -z-10"></div>
                             )}

                             {/* Node Item */}
                             <button 
                                onClick={() => scrollToMessage(msg.id)}
                                className={`
                                    relative flex items-center justify-center transition-all duration-300
                                    ${activeMessageId === msg.id 
                                        ? 'w-8 h-8 ring-2 ring-indigo-500/30 shadow-md z-20 scale-110' 
                                        : 'w-6 h-6 opacity-60 hover:opacity-100 hover:scale-110'
                                    }
                                    ${msg.role === 'user' 
                                        ? 'bg-emerald-500 rounded-full text-white' 
                                        : 'bg-indigo-600 rounded-lg text-white'
                                    }
                                `}
                            >
                                {msg.role === 'user' ? <User size={12} /> : <Bot size={12} />}
                                
                                {/* Active Dot */}
                                {activeMessageId === msg.id && (
                                    <span className="absolute -right-0.5 -top-0.5 flex h-2 w-2">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                      <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                                    </span>
                                )}
                            </button>
                            
                            {/* Hover Tooltip (Styled as Tech Popout) */}
                            <div className="absolute right-10 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 bg-slate-800 border border-slate-700 text-slate-200 text-[9px] px-2 py-1 rounded-md whitespace-nowrap z-50 shadow-xl translate-x-2 group-hover:translate-x-0 flex items-center gap-1.5">
                                <span className={msg.role === 'user' ? 'text-emerald-400' : 'text-indigo-400'}>
                                    {msg.role === 'user' ? '●' : '■'}
                                </span>
                                {msg.role === 'user' ? 'User Question' : 'AI Response'}
                            </div>
                        </div>
                    )})}
                    
                    {/* Thinking/Next Placeholder */}
                    <div className="mt-3 relative group cursor-wait">
                        <div className="w-6 h-6 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-center shadow-sm">
                            <div className="w-1 h-1 bg-indigo-500 rounded-full animate-ping"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Input Area with Drag Handle */}
        <div 
            className={`bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 z-40 relative shrink-0 flex flex-col ${isDragging ? 'select-none' : ''}`}
            style={{ height: inputHeight }}
        >
             {/* Drag Handle */}
             <div 
                onMouseDown={handleMouseDown}
                className="w-full h-2 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 cursor-row-resize absolute top-0 z-50 flex items-center justify-center group opacity-0 hover:opacity-100 transition-opacity"
             >
                <div className="w-12 h-1 bg-slate-300 dark:bg-slate-600 rounded-full"></div>
             </div>

             <div className="p-4 h-full flex flex-col relative">
                 <div className={`relative group flex-1 rounded-xl transition-all ${isInputExpanded || isDragging ? 'border border-dashed border-indigo-300 dark:border-indigo-700' : ''}`}>
                    <textarea 
                        className={`w-full h-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-4 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 resize-none text-sm scrollbar-hide`}
                        placeholder="输入消息... (Shift+Enter 换行)"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage();
                            }
                        }}
                    ></textarea>
                    
                    {/* Expand/Collapse Button */}
                    <button 
                        onClick={toggleExpand}
                        className="absolute right-3 top-3 text-slate-400 hover:text-indigo-600 p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        title={isInputExpanded ? "缩小" : "放大"}
                    >
                        {isInputExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                    </button>

                    <div className="absolute left-3 bottom-3 flex gap-2">
                        <button 
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            onClick={() => {
                                const input = document.createElement('input');
                                input.type = 'file';
                                input.accept = '.pdf,.doc,.docx';
                                input.multiple = true;
                                input.onchange = (e) => {
                                    const target = e.target as HTMLInputElement;
                                    if (target.files) {
                                        handleFileUpload(target.files);
                                    }
                                };
                                input.click();
                            }}
                        >
                            <Paperclip size={18} />
                        </button>
                        <button className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"><Image size={18} /></button>
                    </div>

                    <button 
                        onClick={handleSendMessage}
                        disabled={isLoading}
                        className={`absolute right-3 bottom-3 bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-lg shadow-md shadow-indigo-200 transition-all active:scale-95 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {isLoading ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <Send size={18} />
                        )}
                    </button>
                 </div>
                 {!isInputExpanded && inputHeight < 200 && <p className="text-center text-[10px] text-slate-400 mt-2">AI 生成的内容可能不准确，请核实重要信息。</p>}
             </div>
        </div>
    </div>
  );
};

export default ChatArea;