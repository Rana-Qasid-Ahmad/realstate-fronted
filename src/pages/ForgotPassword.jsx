import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Home, ArrowLeft } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [userId, setUserId] = useState(null);

  const handleSubmit = async () => {
    if (!email) return toast.error('Enter your email address');
    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email });
      setSent(true);
      if (res.data.userId) setUserId(res.data.userId);
      toast.success('Reset code sent if this email exists');
    } catch {
      toast.error('Failed to send reset email. Try again.');
    } finally { setLoading(false); }
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <Mail size={26} className="text-green-600" />
          </div>
          <h2 className="font-display text-xl font-bold text-gray-900 mb-2">Check your email</h2>
          <p className="text-sm text-gray-500 mb-6">
            If <strong>{email}</strong> is registered, we've sent a 6-digit reset code.
          </p>
          {userId && (
            <button onClick={() => navigate('/reset-password', { state: { userId, email } })}
              className="btn-primary w-full mb-3">
              Enter Reset Code
            </button>
          )}
          <Link to="/login" className="text-sm text-primary-600 hover:underline">Back to login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
              <Home size={20} className="text-white" />
            </div>
            <span className="font-display text-2xl font-bold">Real<span className="text-primary-600">Vista</span></span>
          </Link>
          <h1 className="font-display text-2xl font-bold text-gray-900">Forgot Password?</h1>
          <p className="text-gray-500 mt-2 text-sm">Enter your email and we'll send you a reset code</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              className="input"
              placeholder="ahmed@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              autoFocus
            />
          </div>
          <button type="button" onClick={handleSubmit} disabled={loading} className="btn-primary w-full disabled:opacity-60">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Sending...
              </span>
            ) : 'Send Reset Code'}
          </button>

          <Link to="/login" className="flex items-center justify-center gap-1 mt-5 text-sm text-gray-500 hover:text-gray-700">
            <ArrowLeft size={14} /> Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
