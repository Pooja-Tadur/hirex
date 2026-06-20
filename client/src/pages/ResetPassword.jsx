import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      toast.error('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${API}/auth/reset-password`, { token, password });
      toast.success('Password reset! Please login.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset link is invalid or expired');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{background: '#020817'}}>
      <div className="w-full max-w-md rounded-3xl p-8 glass-card">
        <h2 className="text-3xl font-display font-black text-white mb-2">Reset Password</h2>
        <p className="text-gray-400 text-sm mb-6">Enter your new password below.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password" required value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="New password"
            className="w-full px-4 py-3 rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none"
            style={{background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)'}}
          />
          <input
            type="password" required value={confirm}
            onChange={e => setConfirm(e.target.value)}
            placeholder="Confirm new password"
            className="w-full px-4 py-3 rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none"
            style={{background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)'}}
          />
          <button type="submit" disabled={loading}
            className="w-full py-4 rounded-xl font-bold text-white text-sm transition-all"
            style={{background: 'linear-gradient(135deg, #3b82f6, #7c3aed)'}}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>

        <p className="text-center text-gray-500 text-sm mt-6">
          <Link to="/login" className="text-blue-400 hover:text-blue-300 transition">← Back to Login</Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;