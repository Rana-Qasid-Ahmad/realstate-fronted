import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Star, Trash2, Eye, XCircle, Filter } from 'lucide-react';
import api from '../../utils/api';
import { formatPrice, timeAgo } from '../../utils/helpers';
import { TableRowSkeleton } from '../../components/Skeleton';
import ConfirmDialog from '../../components/ConfirmDialog';
import toast from 'react-hot-toast';

const FILTERS = ['all', 'pending', 'approved', 'featured'];

export default function AdminProperties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    setLoading(true);
    api.get('/admin/properties', { params: { filter } })
      .then(res => setProperties(res.data))
      .catch(() => toast.error('Failed to load properties'))
      .finally(() => setLoading(false));
  }, [filter]);

  const approve = async (id) => {
    try {
      await api.put(`/admin/properties/${id}/approve`);
      setProperties(prev => prev.map(p => p._id === id ? { ...p, isApproved: true } : p));
      toast.success('Property approved and live!');
    } catch { toast.error('Failed to approve'); }
  };

  const disapprove = async (id) => {
    try {
      await api.put(`/admin/properties/${id}/disapprove`);
      setProperties(prev => prev.map(p => p._id === id ? { ...p, isApproved: false, isFeatured: false } : p));
      toast.success('Property unpublished');
    } catch { toast.error('Failed to disapprove'); }
  };

  const toggleFeature = async (id) => {
    try {
      await api.put(`/admin/properties/${id}/feature`);
      setProperties(prev => prev.map(p => p._id === id ? { ...p, isFeatured: !p.isFeatured } : p));
      toast.success('Featured status updated');
    } catch { toast.error('Failed to update'); }
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/admin/properties/${deleteTarget}`);
      setProperties(prev => prev.filter(p => p._id !== deleteTarget));
      toast.success('Property deleted');
    } catch { toast.error('Delete failed'); }
    finally { setDeleteTarget(null); }
  };

  return (
    <div className="page-enter bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-gray-900">Properties</h1>
          <span className="text-sm text-gray-500">{properties.length} results</span>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium capitalize whitespace-nowrap transition-colors
                ${filter === f ? 'bg-primary-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-primary-300'}`}>
              {f}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <table className="w-full"><tbody>{[...Array(5)].map((_, i) => <TableRowSkeleton key={i} cols={5} />)}</tbody></table>
          ) : properties.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <Filter size={36} className="mx-auto mb-3 opacity-30" />
              <p>No properties found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3 text-left">Property</th>
                    <th className="px-6 py-3 text-left">Agent</th>
                    <th className="px-6 py-3 text-left">Price</th>
                    <th className="px-6 py-3 text-left">Status</th>
                    <th className="px-6 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {properties.map(p => (
                    <tr key={p._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900 line-clamp-1">{p.title}</p>
                        <p className="text-xs text-gray-400">{p.location?.city} · {p.type}</p>
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-xs">
                        <p className="font-medium text-sm">{p.agent?.name}</p>
                        <p className="text-gray-400">{p.agent?.email}</p>
                      </td>
                      <td className="px-6 py-4 font-semibold text-primary-600">{formatPrice(p.price)}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          <span className={`badge text-xs ${p.isApproved ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                            {p.isApproved ? 'Live' : 'Pending'}
                          </span>
                          {p.isFeatured && <span className="badge text-xs bg-yellow-100 text-yellow-700">Featured</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-1">
                          <Link to={`/properties/${p._id}`} target="_blank"
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Preview">
                            <Eye size={14} />
                          </Link>
                          {!p.isApproved && (
                            <button onClick={() => approve(p._id)}
                              className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Approve">
                              <CheckCircle size={14} />
                            </button>
                          )}
                          {p.isApproved && (
                            <button onClick={() => disapprove(p._id)}
                              className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors" title="Unpublish">
                              <XCircle size={14} />
                            </button>
                          )}
                          {p.isApproved && (
                            <button onClick={() => toggleFeature(p._id)}
                              className={`p-2 rounded-lg transition-colors ${p.isFeatured ? 'text-yellow-500 bg-yellow-50' : 'text-gray-400 hover:text-yellow-500 hover:bg-yellow-50'}`} title="Toggle Feature">
                              <Star size={14} />
                            </button>
                          )}
                          <button onClick={() => setDeleteTarget(p._id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Property"
        message="This will permanently delete the property listing. This cannot be undone."
        confirmText="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
