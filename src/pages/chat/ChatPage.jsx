import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Send, Home, MoreVertical } from 'lucide-react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';

export default function ChatPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { socket, fetchUnreadCount, isOnline } = useSocket();
  const [messages, setMessages] = useState([]);
  const [conversation, setConversation] = useState(null);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [typing, setTyping] = useState(null);
  const messagesContainerRef = useRef(null);
  const typingTimeout = useRef(null);
  const textareaRef = useRef(null);
  const justSentRef = useRef(false);

  // Scroll ONLY the chat container, never the page
  const scrollToBottom = (behavior = 'smooth') => {
    const el = messagesContainerRef.current;
    if (!el) return;
    if (behavior === 'instant') {
      el.scrollTop = el.scrollHeight;
    } else {
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    }
  };

  const isNearBottom = () => {
    const el = messagesContainerRef.current;
    if (!el) return false;
    return el.scrollHeight - el.scrollTop - el.clientHeight < 100;
  };

  useEffect(() => {
    fetchMessages();
    return () => { if (socket) socket.emit('leave_conversation', id); };
  }, [id]);

  useEffect(() => {
    if (!socket) return;
    socket.emit('join_conversation', id);

    socket.on('new_message', (msg) => {
      setMessages(prev => prev.find(m => m._id === msg._id) ? prev : [...prev, msg]);
      fetchUnreadCount();
      setTimeout(() => {
        if (isNearBottom() || justSentRef.current) scrollToBottom();
        justSentRef.current = false;
      }, 30);
    });

    socket.on('user_typing', ({ name }) => setTyping(name));
    socket.on('user_stop_typing', () => setTyping(null));

    return () => {
      socket.off('new_message');
      socket.off('user_typing');
      socket.off('user_stop_typing');
    };
  }, [socket, id]);

  useEffect(() => {
    if (!loading) scrollToBottom('instant');
  }, [loading]);

  const fetchMessages = async () => {
    try {
      const [msgRes, convRes] = await Promise.all([
        api.get(`/chat/conversations/${id}/messages`),
        api.get('/chat/conversations'),
      ]);
      setMessages(msgRes.data);
      setConversation(convRes.data.find(c => c._id === id));
      fetchUnreadCount();
    } catch {}
    finally { setLoading(false); }
  };

  const sendMessage = () => {
    if (!text.trim() || !socket) return;
    justSentRef.current = true;
    socket.emit('send_message', { conversationId: id, text: text.trim() });
    setText('');
    if (textareaRef.current) textareaRef.current.style.height = '38px';
    socket.emit('stop_typing', { conversationId: id });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const handleTyping = (e) => {
    setText(e.target.value);
    e.target.style.height = '38px';
    e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px';
    if (!socket) return;
    socket.emit('typing', { conversationId: id });
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => socket.emit('stop_typing', { conversationId: id }), 1500);
  };

  const other = conversation?.participants?.find(p => p._id !== user?._id);
  const formatTime = (d) => new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const groupedMessages = messages.reduce((groups, msg) => {
    const date = new Date(msg.createdAt).toDateString();
    if (!groups[date]) groups[date] = [];
    groups[date].push(msg);
    return groups;
  }, {});

  return (
    <div style={{ height: 'calc(100vh - 64px)' }} className="flex items-stretch justify-center bg-gray-100 overflow-hidden">
      <div className="flex flex-col w-full max-w-xl bg-white shadow-xl overflow-hidden min-h-0">

        {/* Header */}
        <div className="shrink-0 bg-white border-b border-gray-200 px-3 py-2.5 flex items-center gap-2">
          <Link to="/inbox" className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors shrink-0">
            <ArrowLeft size={16} className="text-gray-600" />
          </Link>
          {other && (
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="relative shrink-0">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {other.name?.charAt(0).toUpperCase()}
                </div>
                <span className={`absolute bottom-0 right-0 w-2 h-2 border-2 border-white rounded-full ${isOnline(other?._id) ? 'bg-emerald-400' : 'bg-gray-300'}`} />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-gray-900 text-sm truncate leading-tight">{other.name}</p>
                <p className="text-xs text-emerald-500">{isOnline(other?._id) ? 'Online' : 'Offline'}</p>
              </div>
            </div>
          )}
          {conversation?.property && (
            <Link to={`/properties/${conversation.property._id}`}
              className="flex items-center gap-1 text-xs text-primary-600 bg-primary-50 border border-primary-100 px-2 py-1 rounded-lg hover:bg-primary-100 transition-colors max-w-32 shrink-0">
              <Home size={10} className="shrink-0" />
              <span className="truncate">{conversation.property.title}</span>
            </Link>
          )}
          <button className="p-1.5 hover:bg-gray-100 rounded-lg shrink-0">
            <MoreVertical size={16} className="text-gray-400" />
          </button>
        </div>

        {/* Messages */}
        <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-3 py-3 min-h-0 bg-gray-50">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="w-6 h-6 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-2 text-center">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                <Send size={16} className="text-primary-600" />
              </div>
              <p className="font-medium text-gray-700 text-sm">Start the conversation</p>
              <p className="text-xs text-gray-400">Say hello to {other?.name} 👋</p>
            </div>
          ) : (
            <div className="space-y-0.5">
              {Object.entries(groupedMessages).map(([date, msgs]) => (
                <div key={date}>
                  <div className="flex items-center gap-2 my-3">
                    <div className="flex-1 h-px bg-gray-200" />
                    <span className="text-xs text-gray-400 bg-gray-200 px-2.5 py-0.5 rounded-full">
                      {date === new Date().toDateString() ? 'Today' : date}
                    </span>
                    <div className="flex-1 h-px bg-gray-200" />
                  </div>
                  {msgs.map((msg, i) => {
                    const isMe = msg.sender?._id === user?._id;
                    const isFirst = i === 0 || msgs[i - 1]?.sender?._id !== msg.sender?._id;
                    const isLast = i === msgs.length - 1 || msgs[i + 1]?.sender?._id !== msg.sender?._id;
                    return (
                      <div key={msg._id} className={`flex items-end gap-1.5 ${isMe ? 'flex-row-reverse' : 'flex-row'} ${isFirst ? 'mt-2' : 'mt-0.5'}`}>
                        {!isMe && (
                          <div className="w-5 shrink-0">
                            {isLast && (
                              <div className="w-5 h-5 bg-gradient-to-br from-primary-400 to-primary-700 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                {msg.sender?.name?.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                        )}
                        <div className={`flex flex-col max-w-[70%] ${isMe ? 'items-end' : 'items-start'}`}>
                          <div className={`px-3 py-1.5 text-sm leading-relaxed break-words
                            ${isMe
                              ? `bg-primary-600 text-white ${isFirst && isLast ? 'rounded-2xl' : isFirst ? 'rounded-2xl rounded-br-sm' : isLast ? 'rounded-2xl rounded-tr-sm' : 'rounded-l-2xl rounded-r-sm'}`
                              : `bg-white text-gray-900 shadow-sm border border-gray-100 ${isFirst && isLast ? 'rounded-2xl' : isFirst ? 'rounded-2xl rounded-bl-sm' : isLast ? 'rounded-2xl rounded-tl-sm' : 'rounded-r-2xl rounded-l-sm'}`
                            }`}>
                            {msg.text}
                          </div>
                          {isLast && (
                            <p className="text-xs text-gray-400 mt-0.5 mx-1">{formatTime(msg.createdAt)}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}

              {typing && (
                <div className="flex items-end gap-1.5 mt-2">
                  <div className="w-5 h-5 bg-gradient-to-br from-primary-400 to-primary-700 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {other?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="bg-white rounded-2xl rounded-bl-sm px-3 py-2 shadow-sm border border-gray-100">
                    <div className="flex gap-1 items-center">
                      {[0, 150, 300].map(d => (
                        <span key={d} className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Input */}
        <div className="shrink-0 bg-white border-t border-gray-200 px-3 py-2">
          <div className="flex items-end gap-2">
            <textarea
              ref={textareaRef}
              rows={1}
              className="flex-1 bg-gray-100 rounded-2xl px-3 py-2 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary-300 resize-none transition-all"
              placeholder="Type a message..."
              value={text}
              onChange={handleTyping}
              onKeyDown={handleKeyDown}
              style={{ height: '38px', maxHeight: '100px' }}
            />
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={sendMessage}
              disabled={!text.trim()}
              className="w-8 h-8 bg-primary-600 hover:bg-primary-700 active:scale-95 disabled:opacity-40 text-white rounded-full flex items-center justify-center transition-all shrink-0 shadow-md"
            >
              <Send size={13} className="translate-x-0.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
