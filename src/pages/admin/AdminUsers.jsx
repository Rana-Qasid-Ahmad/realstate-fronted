import { useState, useEffect, useCallback } from 'react';
import { Users, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../utils/api';
import { timeAgo } from '../../utils/helpers';
import toast from 'react-hot-toast';

const ROLES = ['all', 'buyer', 'agent', 'admin'];
const roleColors = { admin: 'bg-red-100 text-red-700', agent: 'bg-purple-100 text-purple-700', buyer: 'bg-blue-100 text-blue-700' };

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [pagination, setPagination] = useState({ total: 0, pages: 1, currentPage: 1 });

  const fetchUsers = useCallback((page = 1) => {
    setLoading(true);
    api.get('/admin/users', { params: { page, limit: 20, role: filter, search } })
      .then(res => {
        setUsers(res.data.users);
        setPagination({ total: res.data.total, pages: res.data.pages, currentPage: res.data.currentPage });
      })
      .catch(() => toast.error('Failed to load users'))
      .finally(() => setLoading(false));
  }, [filter, search]);

  useEffect(() => { fetchUsers(1); }, [fetchUsers]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

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

  return (
    <div className="page-enter bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-gray-900 mb-8">Manage Users</h1>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex gap-2 flex-wrap">
            {ROLES.map(r => (
              <button key={r} onClick={() => setFilter(r)} className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${filter === r ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'}`}>
                {r}
              </button>
            ))}
          </div>
          <div className="relative sm:ml-auto">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search name or email..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              className="input pl-9 w-full sm:w-64"
            />
          </div>
        </div>

        <p className="text-sm text-gray-500 mb-4">
          {loading ? 'Loading...' : <><span className="font-semibold text-gray-900">{pagination.total}</span> users found</>}
        </p>

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
                  {users.length === 0 ? (
                    <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400">No users found</td></tr>
                  ) : users.map(u => (
                    <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold text-sm shrink-0">
                            {u.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{u.name}</p>
                            <p className="text-xs text-gray-400">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={u.role}
                          onChange={e => changeRole(u._id, e.target.value)}
                          className={`text-xs font-semibold px-2 py-1 rounded-full border-0 cursor-pointer ${roleColors[u.role]}`}
                        >
                          <option value="buyer">buyer</option>
                          <option value="agent">agent</option>
                          <option value="admin">admin</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${u.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                          {u.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-400 text-xs">{timeAgo(u.createdAt)}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleUser(u._id)}
                          className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${u.isActive ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                        >
                          {u.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                <p className="text-xs text-gray-500">Page {pagination.currentPage} of {pagination.pages}</p>
                <div className="flex gap-2">
                  <button onClick={() => fetchUsers(pagination.currentPage - 1)} disabled={pagination.currentPage === 1} className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40">
                    <ChevronLeft size={14} />
                  </button>
                  <button onClick={() => fetchUsers(pagination.currentPage + 1)} disabled={pagination.currentPage === pagination.pages} className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40">
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
