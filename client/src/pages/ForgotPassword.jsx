import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(
        `${API}/auth/forgot-password`,
        { email },
        { timeout: 25000 }
      );
      setSent(true);
      toast.success('Reset link sent! Check your inbox.');
    } catch (err) {
      if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        toast.error('Request timed out. Please try again.');
      } else {
        const msg = err?.response?.data?.message;
        toast.error(msg || 'Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: '#020817' }}>
      <div className="w-full max-w-md rounded-3xl p-8 glass-card">
        <h2 className="text-3xl font-display font-black text-white mb-2">Forgot Password</h2>
        <p className="text-gray-400 text-sm mb-6">Enter your email and we'll send you a reset link.</p>

        {sent ? (
          <div className="text-center py-6">
            <div className="text-5xl mb-4">📧</div>
            <p className="text-green-400 font-semibold mb-2">Email sent!</p>
            <p className="text-gray-400 text-sm">
              Check your inbox (and spam folder) for the reset link. It expires in 30 minutes.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-3 rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl font-bold text-white text-sm transition-all flex items-center justify-center gap-2"
              style={{
                background: loading
                  ? 'rgba(59,130,246,0.4)'
                  : 'linear-gradient(135deg, #3b82f6, #7c3aed)',
              }}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Sending... (may take ~15s)
                </>
              ) : (
                'Send Reset Link'
              )}
            </button>
          </form>
        )}

        <p className="text-center text-gray-500 text-sm mt-6">
          <Link to="/login" className="text-blue-400 hover:text-blue-300 transition">
            ← Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;