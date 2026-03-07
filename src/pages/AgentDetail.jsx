import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Phone, Mail } from 'lucide-react';
import api from '../utils/api';
import PropertyCard from '../components/PropertyCard';

export default function AgentDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/agents/${id}`).then(res => setData(res.data)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" /></div>;
  if (!data) return <div className="min-h-screen flex items-center justify-center text-gray-500">Agent not found</div>;

  const { agent, properties } = data;

  return (
    <div className="page-enter bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/agents" className="flex items-center gap-2 text-gray-500 hover:text-primary-600 text-sm mb-6"><ArrowLeft size={14} />Back to Agents</Link>

        {/* Agent Profile Header */}
        <div className="bg-white rounded-2xl p-8 shadow-md mb-8">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <div className="w-24 h-24 bg-gradient-to-br from-primary-400 to-primary-700 rounded-2xl flex items-center justify-center text-white font-bold text-4xl font-display shrink-0">
              {agent.name?.charAt(0)}
            </div>
            <div className="flex-1">
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{agent.name}</h1>
              <p className="text-primary-600 font-medium mb-3">Real Estate Agent · {properties.length} Listings</p>
              {agent.bio && <p className="text-gray-500 leading-relaxed mb-4 max-w-2xl">{agent.bio}</p>}
              <div className="flex flex-wrap gap-4">
                {agent.phone && <a href={`tel:${agent.phone}`} className="flex items-center gap-2 text-sm text-gray-700 hover:text-primary-600 transition-colors"><Phone size={14} className="text-primary-500" />{agent.phone}</a>}
                <a href={`mailto:${agent.email}`} className="flex items-center gap-2 text-sm text-gray-700 hover:text-primary-600 transition-colors"><Mail size={14} className="text-primary-500" />{agent.email}</a>
              </div>
            </div>
          </div>
        </div>

        {/* Agent Listings */}
        <h2 className="font-display text-xl font-bold text-gray-900 mb-6">Properties by {agent.name}</h2>
        {properties.length === 0 ? (
          <div className="text-center py-16 text-gray-400 bg-white rounded-2xl">No listings yet</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map(p => <PropertyCard key={p._id} property={p} />)}
          </div>
        )}
      </div>
    </div>
  );
}
