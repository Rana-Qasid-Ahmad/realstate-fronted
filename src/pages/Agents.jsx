import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, Home, Users } from 'lucide-react';
import api from '../utils/api';

export default function Agents() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/agents').then(res => setAgents(res.data)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-enter bg-gray-50 min-h-screen">
      <div className="bg-white border-b border-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2"><Home size={14} /><span>/</span><span className="text-primary-600 font-medium">Agents</span></div>
          <h1 className="text-3xl font-display font-bold text-gray-900">Our Expert Agents</h1>
          <p className="text-gray-500 mt-1">Work with experienced professionals to find your perfect property</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => <div key={i} className="h-52 bg-gray-200 rounded-2xl animate-pulse" />)}
          </div>
        ) : agents.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <Users size={48} className="mx-auto mb-4 opacity-30" />
            <p className="text-lg">No agents registered yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {agents.map(agent => (
              <div key={agent._id} className="card p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-700 rounded-xl flex items-center justify-center text-white font-bold text-2xl font-display shrink-0">
                    {agent.name?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display font-semibold text-gray-900 text-lg">{agent.name}</h3>
                    <p className="text-primary-600 text-sm font-medium">{agent.propertyCount} Properties</p>
                    {agent.bio && <p className="text-gray-500 text-xs mt-1 line-clamp-2">{agent.bio}</p>}
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  {agent.phone && <div className="flex items-center gap-2 text-sm text-gray-600"><Phone size={13} className="text-primary-500" />{agent.phone}</div>}
                  <div className="flex items-center gap-2 text-sm text-gray-600"><Mail size={13} className="text-primary-500" /><span className="truncate">{agent.email}</span></div>
                </div>
                <Link to={`/agents/${agent._id}`} className="btn-primary w-full block text-center text-sm py-2">View Profile & Listings</Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
