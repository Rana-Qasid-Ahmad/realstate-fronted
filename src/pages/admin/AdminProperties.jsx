import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Star, Trash2, Eye } from 'lucide-react';
import api from '../../utils/api';
import { formatPrice, timeAgo } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function AdminProperties() {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/properties/pending').then(res => setPending(res.data)).finally(() => setLoading(false));
  }, []);

  const approve = async (id) => {
    try {
      await api.put(`/admin/properties/${id}/approve`);
      setPending(prev => prev.filter(p => p._id !== id));
      toast.success('Property approved and now live!');
    } catch { toast.error('Failed to approve'); }
  };

  const feature = async (id) => {
    try {
      await api.put(`/admin/properties/${id}/feature`);
      toast.success('Featured status toggled!');
    } catch { toast.error('Failed'); }
  };

  const del = async (id) => {
    if (!confirm('Delete this property?')) return;
    try {
      await api.delete(`/properties/${id}`);
      setPending(prev => prev.filter(p => p._id !== id));
      toast.success('Deleted');
    } catch { toast.error('Delete failed'); }
  };

  return (
    <div className="page-enter bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-gray-900 mb-8">Pending Properties</h1>

        {loading ? (
          <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-gray-200 rounded-2xl animate-pulse" />)}</div>
        ) : pending.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-2xl text-gray-400">
            <CheckCircle size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-lg">All caught up! No pending properties.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <p className="text-sm text-gray-500">{pending.length} properties pending review</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3 text-left">Property</th>
                    <th className="px-6 py-3 text-left">Agent</th>
                    <th className="px-6 py-3 text-left">Price</th>
                    <th className="px-6 py-3 text-left">Submitted</th>
                    <th className="px-6 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {pending.map(p => (
                    <tr key={p._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900 line-clamp-1">{p.title}</p>
                          <p className="text-xs text-gray-400">{p.location?.city} · {p.type}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{p.agent?.name}<br /><span className="text-xs text-gray-400">{p.agent?.email}</span></td>
                      <td className="px-6 py-4 font-semibold text-primary-600">{formatPrice(p.price)}</td>
                      <td className="px-6 py-4 text-gray-400 text-xs">{timeAgo(p.createdAt)}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <Link to={`/properties/${p._id}`} target="_blank" className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Preview"><Eye size={14} /></Link>
                          <button onClick={() => approve(p._id)} className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Approve"><CheckCircle size={14} /></button>
                          <button onClick={() => feature(p._id)} className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" title="Feature"><Star size={14} /></button>
                          <button onClick={() => del(p._id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
