import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/client';
import { socket } from '../socket';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext.jsx';

export default function Chat() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [filter, setFilter] = useState('');
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const [searchParams] = useSearchParams();

  async function loadConversations() {
    const res = await api.get('/api/chat/conversations');
    setConversations(res.data.conversations);
    if (!activeId && res.data.conversations[0]) setActiveId(res.data.conversations[0]._id);
  }

  async function loadMessages(id) {
    const res = await api.get(`/api/chat/conversations/${id}/messages`);
    setMessages(res.data.messages);
    // scroll to bottom after loading
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 0);
  }

  useEffect(() => {
    loadConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Open conversation from query param
  useEffect(() => {
    const openId = searchParams.get('open');
    if (openId) setActiveId(openId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    if (!activeId) return;
    loadMessages(activeId);
    socket.connect();
    socket.emit('join', activeId);
    const handler = (payload) => {
      if (payload.conversationId === activeId) {
        setMessages((prev) => {
          const next = { _id: payload.message.id, body: payload.message.body, sender: payload.message.sender, createdAt: payload.message.createdAt };
          if (prev.length && prev[prev.length - 1]._id === next._id) return prev; // ignore duplicate
          return [...prev, next];
        });
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    };
    socket.on('chat:message', handler);
    return () => {
      socket.off('chat:message', handler);
      socket.disconnect();
    };
  }, [activeId]);

  async function send() {
    if (!text.trim() || !activeId) return;
    const res = await api.post(`/api/chat/conversations/${activeId}/messages`, { body: text.trim() });
    setText('');
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    inputRef.current?.focus();
  }

  const filtered = filter
    ? conversations.filter((c) => (c.product?.title || 'Chat').toLowerCase().includes(filter.toLowerCase()))
    : conversations;

  return (
    <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-4 min-h-[560px]">
      {/* Sidebar */}
      <aside className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden flex flex-col">
        <div className="p-3 border-b border-gray-200 dark:border-gray-800">
          <Input placeholder="Search chats" value={filter} onChange={(e) => setFilter(e.target.value)} />
        </div>
        <div className="flex-1 overflow-auto">
          {filtered.map((c) => (
            <button
              key={c._id}
              onClick={() => setActiveId(c._id)}
              className={`w-full text-left px-3 py-2 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 ${activeId === c._id ? 'bg-gray-50 dark:bg-gray-800' : ''}`}
            >
              <div className="text-sm font-medium line-clamp-1 text-gray-900 dark:text-gray-100">{c.product?.title || 'Chat'}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{new Date(c.updatedAt).toLocaleString()}</div>
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="p-3 text-sm text-gray-500 dark:text-gray-400">No conversations</div>
          )}
        </div>
      </aside>

      {/* Conversation */}
      <section className="bg-[#efeae2] dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg flex flex-col">
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <div className="font-medium text-gray-900 dark:text-gray-100">{conversations.find((c) => c._id === activeId)?.product?.title || 'Messages'}</div>
        </div>
        <div className="flex-1 overflow-auto p-4 space-y-3">
          {messages.map((m) => {
            const myId = user?._id || user?.id;
            const senderId = typeof m?.sender === 'string' ? m.sender : (m?.sender?._id || m?.sender?.id);
            const mine = senderId === myId;
            return (
              <div key={m._id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] ${mine ? 'text-right' : 'text-left'}`}>
                  <div className="text-[11px] text-gray-500 dark:text-gray-400">{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                  <div
                    className={`mt-0.5 inline-block rounded-2xl px-3 py-2 text-[15px] shadow ${
                      mine
                        ? 'bg-[#d9fdd3] text-black rounded-br-none'
                        : 'bg-white text-gray-900 border border-gray-200 dark:bg-gray-800 dark:text-white dark:border-gray-700 rounded-bl-none'
                    }`}
                  >
                    {m.body}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
        <div className="p-3 border-t border-gray-200 dark:border-gray-800 flex gap-2 sticky bottom-0 bg-[#efeae2] dark:bg-gray-900">
          <Input
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="Message"
            className="flex-1 rounded-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 px-4"
          />
          <Button onClick={send} className="bg-green-500 hover:bg-green-600 text-white rounded-full px-5">Send</Button>
        </div>
      </section>
    </div>
  );
}
