import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Mail, RotateCcw, CheckCircle, ArrowLeft } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function VerifyEmail() {
  const location = useLocation();
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();

  const { userId, email } = location.state || {};

  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [verified, setVerified] = useState(false);
  const inputRefs = useRef([]);

  // Redirect if no userId in state
  useEffect(() => {
    if (!userId) navigate('/register');
  }, [userId]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown <= 0) { setCanResend(true); return; }
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleInput = (i, val) => {
    // Only accept digits
    if (!/^\d*$/.test(val)) return;
    const next = [...code];
    next[i] = val.slice(-1); // only last char
    setCode(next);
    // Auto-advance
    if (val && i < 5) inputRefs.current[i + 1]?.focus();
    // Auto-submit when all filled
    if (val && i === 5 && next.every(d => d)) {
      handleVerify(next.join(''));
    }
  };

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !code[i] && i > 0) {
      inputRefs.current[i - 1]?.focus();
    }
    if (e.key === 'ArrowLeft' && i > 0) inputRefs.current[i - 1]?.focus();
    if (e.key === 'ArrowRight' && i < 5) inputRefs.current[i + 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const next = [...code];
    for (let i = 0; i < 6; i++) next[i] = pasted[i] || '';
    setCode(next);
    const lastFilled = Math.min(pasted.length, 5);
    inputRefs.current[lastFilled]?.focus();
    if (pasted.length === 6) handleVerify(pasted);
  };

  const handleVerify = async (codeStr) => {
    const finalCode = codeStr || code.join('');
    if (finalCode.length !== 6) return toast.error('Enter all 6 digits');
    setLoading(true);
    try {
      const res = await api.post('/auth/verify-email', { userId, code: finalCode });
      setVerified(true);
      loginWithToken(res.data.user, res.data.token);
      toast.success('Email verified! Welcome to RealVista 🎉');
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid code');
      // Shake and clear on wrong code
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    setResending(true);
    try {
      await api.post('/auth/resend-code', { userId });
      toast.success('New code sent to your email');
      setCountdown(60);
      setCanResend(false);
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend');
    } finally {
      setResending(false);
    }
  };

  if (verified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-green-500" />
          </div>
          <p className="font-semibold text-gray-800 text-lg">Verified! Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8">

          {/* Icon */}
          <div className="w-14 h-14 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Mail size={26} className="text-primary-600" />
          </div>

          <h1 className="font-display text-2xl font-bold text-gray-900 text-center mb-1">
            Check your email
          </h1>
          <p className="text-sm text-gray-500 text-center mb-1">
            We sent a 6-digit code to
          </p>
          <p className="text-sm font-semibold text-primary-600 text-center mb-7">
            {email}
          </p>

          {/* Code inputs */}
          <div className="flex gap-2 justify-center mb-6" onPaste={handlePaste}>
            {code.map((digit, i) => (
              <input
                key={i}
                ref={el => inputRefs.current[i] = el}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleInput(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                className={`w-11 h-13 text-center text-xl font-bold border-2 rounded-xl transition-all focus:outline-none
                  ${digit ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 bg-gray-50 text-gray-900'}
                  focus:border-primary-500 focus:bg-white`}
                style={{ height: '52px' }}
                autoFocus={i === 0}
                disabled={loading}
              />
            ))}
          </div>

          {/* Verify button */}
          <button
            type="button"
            onClick={() => handleVerify()}
            disabled={loading || code.some(d => !d)}
            className="btn-primary w-full py-3 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Verifying...
              </span>
            ) : 'Verify Email'}
          </button>

          {/* Resend */}
          <div className="text-center mt-5">
            {canResend ? (
              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                className="flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-700 font-medium mx-auto"
              >
                <RotateCcw size={13} className={resending ? 'animate-spin' : ''} />
                {resending ? 'Sending...' : 'Resend code'}
              </button>
            ) : (
              <p className="text-sm text-gray-400">
                Resend code in <span className="font-semibold text-gray-600">{countdown}s</span>
              </p>
            )}
          </div>

          {/* Back */}
          <div className="border-t border-gray-100 mt-6 pt-5 text-center">
            <button
              type="button"
              onClick={() => navigate('/register')}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 mx-auto"
            >
              <ArrowLeft size={12} />
              Back to register
            </button>
          </div>
        </div>

        <p className="text-xs text-gray-400 text-center mt-4">
          Didn't get it? Check your spam folder.
        </p>
      </div>
    </div>
  );
}
