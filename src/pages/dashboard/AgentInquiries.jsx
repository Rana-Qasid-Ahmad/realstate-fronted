import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, MessageSquare, Mail, Phone } from 'lucide-react';
import api from '../../utils/api';
import { timeAgo } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function AgentInquiries() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/inquiries/agent').then(res => setInquiries(res.data)).finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id, status) => {
    try {
      const res = await api.put(`/inquiries/${id}/status`, { status });
      setInquiries(prev => prev.map(i => i._id === id ? res.data : i));
      toast.success('Status updated');
    } catch { toast.error('Failed to update'); }
  };

  const statusColors = { new: 'bg-blue-100 text-blue-700', read: 'bg-gray-100 text-gray-700', replied: 'bg-emerald-100 text-emerald-700' };

  return (
    <div className="page-enter bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/dashboard" className="flex items-center gap-2 text-gray-500 hover:text-primary-600 text-sm mb-6"><ArrowLeft size={14} />Back to Dashboard</Link>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-gray-900 mb-8">Inquiries</h1>

        {loading ? (
          <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-gray-200 rounded-2xl animate-pulse" />)}</div>
        ) : inquiries.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-2xl text-gray-400">
            <MessageSquare size={40} className="mx-auto mb-3 opacity-30" />
            <p>No inquiries yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {inquiries.map(inq => (
              <div key={inq._id} className="bg-white rounded-2xl p-6 shadow-md">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-gray-900">{inq.name}</p>
                      <span className={`badge ${statusColors[inq.status]}`}>{inq.status}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <a href={`mailto:${inq.email}`} className="flex items-center gap-1 hover:text-primary-600"><Mail size={12} />{inq.email}</a>
                      {inq.phone && <span className="flex items-center gap-1"><Phone size={12} />{inq.phone}</span>}
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 shrink-0">{timeAgo(inq.createdAt)}</p>
                </div>

                {inq.property && (
                  <div className="text-xs text-primary-600 mb-3 bg-primary-50 px-3 py-1.5 rounded-lg inline-block">
                    📍 Re: {inq.property.title}
                  </div>
                )}

                <p className="text-sm text-gray-700 bg-gray-50 rounded-xl p-4 leading-relaxed">{inq.message}</p>

                <div className="flex gap-2 mt-4">
                  {['new', 'read', 'replied'].map(s => (
                    <button key={s} onClick={() => updateStatus(inq._id, s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize border transition-all ${inq.status === s ? 'bg-primary-600 text-white border-primary-600' : 'border-gray-200 text-gray-500 hover:border-primary-300'}`}>
                      {s}
                    </button>
                  ))}
                  <a href={`mailto:${inq.email}?subject=Re: Your inquiry about ${inq.property?.title}`} className="ml-auto btn-primary text-xs py-1.5 px-4">Reply via Email</a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
