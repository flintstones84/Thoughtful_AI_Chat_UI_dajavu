export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  parentId?: string | null;
  childrenIds: string[];
  branchId?: string;
  isActivePath?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  date: string;
  preview: string;
  tags?: string[];
  model?: string;
}

export interface TreeNode {
  id: string;
  x: number;
  y: number;
  data: Message;
}

export interface AppState {
  currentView: 'chat' | 'tree' | 'search';
  activeSessionId: string;
  sidebarOpen: boolean;
}
