import { useState, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Lock, Home, Eye, EyeOff } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const { userId, email } = location.state || {};

  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef([]);

  if (!userId) {
    navigate('/forgot-password');
    return null;
  }

  const handleInput = (i, val) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...code];
    next[i] = val.slice(-1);
    setCode(next);
    if (val && i < 5) inputRefs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !code[i] && i > 0) inputRefs.current[i - 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const next = [...code];
    for (let i = 0; i < 6; i++) next[i] = pasted[i] || '';
    setCode(next);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleSubmit = async () => {
    const codeStr = code.join('');
    if (codeStr.length !== 6) return toast.error('Enter the 6-digit code');
    if (password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { userId, code: codeStr, password });
      toast.success('Password reset successfully!');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed');
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally { setLoading(false); }
  };

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
          <h1 className="font-display text-2xl font-bold text-gray-900">Reset Password</h1>
          <p className="text-gray-500 mt-1 text-sm">Enter the code sent to <strong>{email}</strong></p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-5">
          {/* Code input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Verification Code</label>
            <div className="flex gap-2 justify-center" onPaste={handlePaste}>
              {code.map((digit, i) => (
                <input key={i} ref={el => inputRefs.current[i] = el}
                  type="text" inputMode="numeric" maxLength={1} value={digit}
                  onChange={e => handleInput(i, e.target.value)}
                  onKeyDown={e => handleKeyDown(i, e)}
                  className={`w-11 text-center text-xl font-bold border-2 rounded-xl focus:outline-none transition-all
                    ${digit ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 bg-gray-50'}
                    focus:border-primary-500`}
                  style={{ height: '50px' }}
                  autoFocus={i === 0}
                />
              ))}
            </div>
          </div>

          {/* New password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <div className="relative">
              <input type={showPass ? 'text' : 'password'} className="input pr-10"
                placeholder="Min. 6 characters" value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="button" onClick={handleSubmit} disabled={loading} className="btn-primary w-full disabled:opacity-60">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Resetting...
              </span>
            ) : 'Reset Password'}
          </button>

          <Link to="/login" className="block text-center text-sm text-gray-500 hover:text-gray-700">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
