import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MessageSquare, Search, Plus } from 'lucide-react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { timeAgo } from '../../utils/helpers';

export default function Inbox() {
  const { user } = useAuth();
  const { socket, unreadCount, setUnreadCount, fetchUnreadCount } = useSocket();
  const [conversations, setConversations] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showNewChat, setShowNewChat] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchConversations();
    if (user?.role === 'buyer') fetchAgents();
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on('unread_update', () => fetchConversations());
    return () => socket.off('unread_update');
  }, [socket]);

  const fetchConversations = async () => {
    try {
      const res = await api.get('/chat/conversations');
      setConversations(res.data);
      fetchUnreadCount();
    } catch {}
    finally { setLoading(false); }
  };

  const fetchAgents = async () => {
    try {
      const res = await api.get('/chat/agents');
      setAgents(res.data);
    } catch {}
  };

  const startChat = async (recipientId) => {
    try {
      const res = await api.post('/chat/conversations', { recipientId });
      setShowNewChat(false);
      navigate(`/chat/${res.data._id}`);
    } catch {}
  };

  const getOtherParticipant = (conv) => conv.participants?.find(p => p._id !== user?._id);

  const getUnread = (conv) => conv.unreadCount?.[user?._id] || 0;

  const filtered = conversations.filter(c => {
    const other = getOtherParticipant(c);
    return other?.name?.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="page-enter bg-gray-50 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-gray-900">Messages</h1>
            {unreadCount > 0 && <p className="text-sm text-primary-600 font-medium mt-1">{unreadCount} unread message{unreadCount > 1 ? 's' : ''}</p>}
          </div>
          <button onClick={() => setShowNewChat(!showNewChat)} className="btn-primary flex items-center gap-2 text-sm">
            <Plus size={16} />New Chat
          </button>
        </div>

        {/* New Chat Panel */}
        {showNewChat && (
          <div className="bg-white rounded-2xl shadow-md p-5 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Start a new conversation</h3>
            <div className="space-y-2 max-h-56 overflow-y-auto">
              {agents.length === 0 && <p className="text-sm text-gray-400">No agents available</p>}
              {agents.map(agent => (
                <button key={agent._id} onClick={() => startChat(agent._id)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors text-left">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold shrink-0">
                    {agent.name?.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{agent.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{agent.role}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Search */}
        <div className="relative mb-4">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="input pl-9 bg-white" placeholder="Search conversations..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {/* Conversations List */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-gray-200 rounded-2xl animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-2xl text-gray-400">
            <MessageSquare size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-lg font-medium">No conversations yet</p>
            <p className="text-sm mt-1">Click "New Chat" to start messaging</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(conv => {
              const other = getOtherParticipant(conv);
              const unread = getUnread(conv);
              const lastMsg = conv.lastMessage;
              return (
                <Link key={conv._id} to={`/chat/${conv._id}`}
                  className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${unread > 0 ? 'bg-primary-50 border border-primary-100' : 'bg-white hover:bg-gray-50'} shadow-sm`}>
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-700 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {other?.name?.charAt(0)}
                    </div>
                    {unread > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {unread > 9 ? '9+' : unread}
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className={`font-semibold text-sm truncate ${unread > 0 ? 'text-primary-700' : 'text-gray-900'}`}>
                        {other?.name}
                      </p>
                      <p className="text-xs text-gray-400 shrink-0 ml-2">{timeAgo(conv.lastMessageAt)}</p>
                    </div>
                    {conv.property && (
                      <p className="text-xs text-primary-500 mb-0.5 truncate">📍 {conv.property?.title}</p>
                    )}
                    <p className={`text-xs truncate ${unread > 0 ? 'text-gray-700 font-medium' : 'text-gray-400'}`}>
                      {lastMsg ? lastMsg.text : 'No messages yet'}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
