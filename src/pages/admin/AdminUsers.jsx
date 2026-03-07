import { useState, useEffect } from 'react';
import { Users, UserCheck, UserX } from 'lucide-react';
import api from '../../utils/api';
import { timeAgo } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    api.get('/admin/users').then(res => setUsers(res.data)).finally(() => setLoading(false));
  }, []);

  const toggleUser = async (id) => {
    try {
      const res = await api.put(`/admin/users/${id}/toggle`);
      setUsers(prev => prev.map(u => u._id === id ? { ...u, isActive: res.data.isActive } : u));
      toast.success(res.data.message);
    } catch { toast.error('Failed'); }
  };

  const changeRole = async (id, role) => {
    try {
      const res = await api.put(`/admin/users/${id}/role`, { role });
      setUsers(prev => prev.map(u => u._id === id ? res.data : u));
      toast.success('Role updated');
    } catch { toast.error('Failed'); }
  };

  const filtered = filter === 'all' ? users : users.filter(u => u.role === filter);
  const roleColors = { admin: 'bg-red-100 text-red-700', agent: 'bg-purple-100 text-purple-700', buyer: 'bg-blue-100 text-blue-700' };

  return (
    <div className="page-enter bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-gray-900 mb-8">Manage Users</h1>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6">
          {['all', 'buyer', 'agent', 'admin'].map(r => (
            <button key={r} onClick={() => setFilter(r)} className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${filter === r ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'}`}>
              {r} {r === 'all' ? `(${users.length})` : `(${users.filter(u => u.role === r).length})`}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-gray-200 rounded-2xl animate-pulse" />)}</div>
        ) : (
          <div className="bg-white rounded-2xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3 text-left">User</th>
                    <th className="px-6 py-3 text-left">Role</th>
                    <th className="px-6 py-3 text-left">Status</th>
                    <th className="px-6 py-3 text-left">Joined</th>
                    <th className="px-6 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map(u => (
                    <tr key={u._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-semibold text-sm">{u.name?.charAt(0)}</div>
                          <div>
                            <p className="font-medium text-gray-900">{u.name}</p>
                            <p className="text-xs text-gray-400">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <select value={u.role} onChange={e => changeRole(u._id, e.target.value)} className={`badge ${roleColors[u.role]} border-0 cursor-pointer`}>
                          <option value="buyer">Buyer</option>
                          <option value="agent">Agent</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`badge ${u.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                          {u.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-400 text-xs">{timeAgo(u.createdAt)}</td>
                      <td className="px-6 py-4">
                        <button onClick={() => toggleUser(u._id)} className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border transition-colors ${u.isActive ? 'text-red-600 border-red-200 hover:bg-red-50' : 'text-emerald-600 border-emerald-200 hover:bg-emerald-50'}`}>
                          {u.isActive ? <><UserX size={12} />Deactivate</> : <><UserCheck size={12} />Activate</>}
                        </button>
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
