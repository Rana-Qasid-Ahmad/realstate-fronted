import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Eye, Edit, Trash2, Home, MessageSquare, CheckCircle, Clock } from 'lucide-react';
import api from '../../utils/api';
import { formatPrice, timeAgo } from '../../utils/helpers';
import { TableRowSkeleton } from '../../components/Skeleton';
import ConfirmDialog from '../../components/ConfirmDialog';
import toast from 'react-hot-toast';

export default function AgentDashboard() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null); // id to delete
  const [inquiryCount, setInquiryCount] = useState(0);

  useEffect(() => {
    Promise.all([
      api.get('/properties/agent/my'),
      api.get('/inquiries/agent'),
    ]).then(([propRes, inqRes]) => {
      setProperties(propRes.data);
      setInquiryCount(inqRes.data.filter(i => i.status === 'new').length);
    }).catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  const confirmDelete = async () => {
    try {
      await api.delete(`/properties/${deleteTarget}`);
      setProperties(prev => prev.filter(p => p._id !== deleteTarget));
      toast.success('Property deleted');
    } catch { toast.error('Delete failed'); }
    finally { setDeleteTarget(null); }
  };

  const approved = properties.filter(p => p.isApproved);
  const pending = properties.filter(p => !p.isApproved);

  return (
    <div className="page-enter bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-gray-900">Agent Dashboard</h1>
            <p className="text-gray-500 mt-1">Manage your property listings</p>
          </div>
          <Link to="/dashboard/add" className="btn-primary flex items-center gap-2 text-sm">
            <Plus size={16} />Add Property
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Listings', val: properties.length, icon: Home, color: 'bg-blue-50 text-blue-600' },
            { label: 'Approved', val: approved.length, icon: CheckCircle, color: 'bg-emerald-50 text-emerald-600' },
            { label: 'Pending Review', val: pending.length, icon: Clock, color: 'bg-amber-50 text-amber-600' },
            { label: 'Total Views', val: properties.reduce((a, p) => a + (p.views || 0), 0), icon: Eye, color: 'bg-purple-50 text-purple-600' },
          ].map(({ label, val, icon: Icon, color }) => (
            <div key={label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center mb-3`}><Icon size={18} /></div>
              <p className="text-2xl font-bold text-gray-900">{val}</p>
              <p className="text-xs text-gray-500 mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Quick Links */}
        <div className="flex gap-3 mb-8">
          <Link to="/dashboard/inquiries"
            className="relative flex items-center gap-2 bg-white px-4 py-3 rounded-xl shadow-sm border border-gray-100 text-sm font-medium text-gray-700 hover:border-primary-300 transition-colors">
            <MessageSquare size={16} className="text-primary-600" />
            View Inquiries
            {inquiryCount > 0 && (
              <span className="w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {inquiryCount > 9 ? '9+' : inquiryCount}
              </span>
            )}
          </Link>
        </div>

        {/* Properties Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-display font-semibold text-gray-900">My Listings</h2>
            <Link to="/dashboard/add" className="text-sm text-primary-600 hover:underline font-medium">+ Add New</Link>
          </div>

          {loading ? (
            <table className="w-full"><tbody>{[...Array(4)].map((_, i) => <TableRowSkeleton key={i} cols={6} />)}</tbody></table>
          ) : properties.length === 0 ? (
            <div className="p-16 text-center">
              <Home size={40} className="mx-auto mb-3 text-gray-300" />
              <p className="text-gray-500 mb-4">No properties yet</p>
              <Link to="/dashboard/add" className="btn-primary inline-block text-sm">Add Your First Property</Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3 text-left">Property</th>
                    <th className="px-6 py-3 text-left">Price</th>
                    <th className="px-6 py-3 text-left">Status</th>
                    <th className="px-6 py-3 text-left">Views</th>
                    <th className="px-6 py-3 text-left">Listed</th>
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
                      <td className="px-6 py-4 font-semibold text-primary-600">{formatPrice(p.price)}</td>
                      <td className="px-6 py-4">
                        <span className={`badge ${p.isApproved ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                          {p.isApproved ? 'Approved' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{p.views || 0}</td>
                      <td className="px-6 py-4 text-gray-400">{timeAgo(p.createdAt)}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-1">
                          <Link to={`/properties/${p._id}`} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View"><Eye size={14} /></Link>
                          <Link to={`/dashboard/edit/${p._id}`} className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors" title="Edit"><Edit size={14} /></Link>
                          <button onClick={() => setDeleteTarget(p._id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete"><Trash2 size={14} /></button>
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
        message="This will permanently delete the listing and all associated data. This cannot be undone."
        confirmText="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
