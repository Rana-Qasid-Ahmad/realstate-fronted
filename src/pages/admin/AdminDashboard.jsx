import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Home, Users, Clock, MessageSquare, CheckCircle, Shield } from 'lucide-react';
import api from '../../utils/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats').then(res => setStats(res.data)).finally(() => setLoading(false));
  }, []);

  const cards = stats ? [
    { label: 'Buyers', val: stats.totalUsers, icon: Users, color: 'bg-blue-50 text-blue-600', link: '/admin/users' },
    { label: 'Agents', val: stats.totalAgents, icon: Users, color: 'bg-purple-50 text-purple-600', link: '/admin/users' },
    { label: 'Live Properties', val: stats.totalProperties, icon: Home, color: 'bg-emerald-50 text-emerald-600', link: '/admin/properties' },
    { label: 'Pending Approval', val: stats.pendingProperties, icon: Clock, color: 'bg-amber-50 text-amber-600', link: '/admin/properties' },
    { label: 'Total Inquiries', val: stats.totalInquiries, icon: MessageSquare, color: 'bg-pink-50 text-pink-600', link: '#' },
  ] : [];

  const quickLinks = [
    { to: '/admin/properties', label: 'Review Pending Properties', icon: Clock, desc: `${stats?.pendingProperties || 0} awaiting approval` },
    { to: '/admin/users', label: 'Manage Users & Agents', icon: Users, desc: `${(stats?.totalUsers || 0) + (stats?.totalAgents || 0)} total users` },
  ];

  return (
    <div className="page-enter bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center"><Shield size={20} className="text-primary-600" /></div>
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-500 text-sm">Manage the RealVista platform</p>
          </div>
        </div>

        {/* Stats */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8">{[...Array(5)].map((_, i) => <div key={i} className="h-28 bg-gray-200 rounded-2xl animate-pulse" />)}</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8">
            {cards.map(({ label, val, icon: Icon, color, link }) => (
              <Link key={label} to={link} className="bg-white rounded-2xl p-5 shadow-md hover:shadow-lg transition-shadow">
                <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center mb-3`}><Icon size={18} /></div>
                <p className="text-2xl font-bold text-gray-900">{val}</p>
                <p className="text-xs text-gray-500 mt-1">{label}</p>
              </Link>
            ))}
          </div>
        )}

        {/* Quick actions */}
        <h2 className="font-display font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {quickLinks.map(({ to, label, icon: Icon, desc }) => (
            <Link key={to} to={to} className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow flex items-center gap-4 group">
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center group-hover:bg-primary-600 transition-colors">
                <Icon size={20} className="text-primary-600 group-hover:text-white transition-colors" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">{label}</p>
                <p className="text-sm text-gray-500">{desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
