import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { Home, Search, Users, LogOut, LayoutDashboard, Menu, X, Shield, Heart, MessageSquare } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { unreadCount } = useSocket();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setOpen(false);
    setDropdownOpen(false);
  }, [location.pathname]);

  const handleLogout = () => { logout(); navigate('/'); };
  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/properties', label: 'Properties', icon: Search },
    { to: '/agents', label: 'Agents', icon: Users },
  ];

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <Home size={18} className="text-white" />
            </div>
            <span className="font-display text-xl font-bold text-gray-900">Real<span className="text-primary-600">Vista</span></span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label }) => (
              <Link key={to} to={to} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isActive(to) ? 'bg-primary-50 text-primary-600' : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'}`}>
                {label}
              </Link>
            ))}
          </div>

          {/* Auth buttons */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Link to="/inbox" className="relative p-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <MessageSquare size={20} className="text-gray-600" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>

                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors"
                  >
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-semibold text-sm">
                        {user.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="text-sm font-medium text-gray-700">{user.name?.split(' ')[0]}</span>
                  </button>
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-xs text-gray-500">Signed in as</p>
                        <p className="text-sm font-medium text-gray-900 truncate">{user.email}</p>
                        <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full capitalize">{user.role}</span>
                      </div>
                      {user.role === 'admin' && <Link to="/admin" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"><Shield size={14} />Admin Panel</Link>}
                      {(user.role === 'agent' || user.role === 'admin') && <Link to="/dashboard" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"><LayoutDashboard size={14} />Dashboard</Link>}
                      <Link to="/inbox" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        <MessageSquare size={14} />Messages
                        {unreadCount > 0 && <span className="ml-auto bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">{unreadCount}</span>}
                      </Link>
                      <Link to="/saved" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"><Heart size={14} />Saved Properties</Link>
                      <button onClick={() => { handleLogout(); setDropdownOpen(false); }} className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full"><LogOut size={14} />Logout</button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-primary-600 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">Login</Link>
                <Link to="/register" className="btn-primary text-sm py-2">Get Started</Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button onClick={() => setOpen(!open)} className="md:hidden p-2 rounded-lg text-gray-600">
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-2">
          {navLinks.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${isActive(to) ? 'bg-primary-50 text-primary-600' : 'text-gray-700'}`}>
              <Icon size={16} />{label}
            </Link>
          ))}
          {user ? (
            <>
              <Link to="/inbox" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700">
                <MessageSquare size={16} />Messages
                {unreadCount > 0 && <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">{unreadCount}</span>}
              </Link>
              {(user.role === 'agent' || user.role === 'admin') && <Link to="/dashboard" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700"><LayoutDashboard size={16} />Dashboard</Link>}
              {user.role === 'admin' && <Link to="/admin" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700"><Shield size={16} />Admin</Link>}
              <Link to="/saved" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700"><Heart size={16} />Saved</Link>
              <button onClick={() => { handleLogout(); }} className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 w-full"><LogOut size={16} />Logout</button>
            </>
          ) : (
            <div className="flex gap-2 pt-2">
              <Link to="/login" className="flex-1 text-center btn-outline text-sm py-2">Login</Link>
              <Link to="/register" className="flex-1 text-center btn-primary text-sm py-2">Register</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
