import { ChatSession, Message, TreeNode } from './types';

export const MOCK_SESSIONS: ChatSession[] = [
  { id: '1', title: '系统架构优化方案', date: '10:42', preview: '针对当前微服务架构的高并发瓶颈，建议引入Redis集群...', tags: ['Architecture', 'Redis'], model: 'GPT-4' },
  { id: '2', title: 'Python 数据分析脚本', date: '昨天', preview: '使用Pandas处理CSV文件中的缺失值...', model: 'Claude 3' },
  { id: '3', title: 'SQL 查询优化', date: '1月09日', preview: '这个Left Join查询在数据量达到百万级时非常慢...', model: 'GPT-4' },
];

// Graph Nodes Positioned manually to match the "Tree Topology" screenshot
export const TREE_NODES: TreeNode[] = [
  {
    id: 'msg-1',
    x: 50,
    y: 350,
    data: { id: 'msg-1', role: 'user', content: '我想创建一个 Python 后端项目，有什么建议？', timestamp: '10:00 AM', childrenIds: ['msg-2'], isActivePath: true }
  },
  {
    id: 'msg-2',
    x: 350,
    y: 350,
    data: { id: 'msg-2', role: 'assistant', content: 'Python 有很多优秀的框架。最流行的是 Flask 和 FastAPI。Flask 轻量灵活，FastAPI 性能极高且自带文档。', timestamp: '10:01 AM', parentId: 'msg-1', childrenIds: ['msg-3a', 'msg-3b', 'msg-3c'], isActivePath: true }
  },
  // Branch A: Flask
  {
    id: 'msg-3a',
    x: 750,
    y: 150,
    data: { id: 'msg-3a', role: 'user', content: '给我看一个 Flask 的 Hello World 例子。', timestamp: '10:05 AM', parentId: 'msg-2', childrenIds: ['msg-4a'], isActivePath: false, branchId: 'Flask' }
  },
  {
    id: 'msg-4a',
    x: 1050,
    y: 150,
    data: { id: 'msg-4a', role: 'assistant', content: '好的，这是一个最简单的 Flask 应用代码...', timestamp: '10:05 AM', parentId: 'msg-3a', childrenIds: [], isActivePath: false }
  },
  // Branch B: FastAPI (Main Path)
  {
    id: 'msg-3b',
    x: 750,
    y: 350,
    data: { id: 'msg-3b', role: 'user', content: '我听说 FastAPI 性能更好，请给我展示 FastAPI 的例子。', timestamp: '10:06 AM', parentId: 'msg-2', childrenIds: ['msg-4b'], isActivePath: true, branchId: 'FastAPI' }
  },
  {
    id: 'msg-4b',
    x: 1050,
    y: 350,
    data: { id: 'msg-4b', role: 'assistant', content: '没问题！FastAPI 是一个现代、快速（高性能）的 Web 框架。\n\n```python\nfrom fastapi import FastAPI\napp = FastAPI()\n\n@app.get("/")\ndef read_root():\n    return {"Hello": "World"}\n```', timestamp: 'Just now', parentId: 'msg-3b', childrenIds: [], isActivePath: true }
  },
  // Branch C: Django
  {
    id: 'msg-3c',
    x: 750,
    y: 550,
    data: { id: 'msg-3c', role: 'user', content: 'Django 怎么样？会不会太重了？', timestamp: '10:08 AM', parentId: 'msg-2', childrenIds: [], isActivePath: false, branchId: 'Django' }
  },
];
