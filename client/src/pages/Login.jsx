import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import Logo from '../components/Logo';

const Login = () => {
  const [role, setRole] = useState('jobseeker');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back! 🎉');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{background: '#020817'}}>

      {/* Left — background image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1600&auto=format&fit=crop"
          alt="Team working"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0"
          style={{background: 'linear-gradient(180deg, rgba(2,8,23,0.3) 0%, rgba(2,8,23,0.55) 60%, rgba(2,8,23,0.95) 100%)'}}>
        </div>

        <div className="relative z-10 flex flex-col justify-end p-12 text-white h-full">
          <div className="mb-6">
            <Logo size="lg" />
          </div>
          <h1 className="text-5xl font-display font-black leading-tight mb-4">
            Your next<br/>
            <span style={{
              background: 'linear-gradient(135deg, #60a5fa, #c084fc)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>opportunity</span><br/>
            awaits you
          </h1>
          <p className="text-gray-200 text-lg max-w-md">
            Thousands of new jobs added every day. Login and apply now!
          </p>

          <div className="mt-10 space-y-4">
            {[
              { icon: '📊', text: 'Track all applications in one dashboard' },
              { icon: '🎯', text: 'AI-powered job match scores' },
              { icon: '⚡', text: 'One-click apply to thousands of jobs' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg glass-card">
                  {item.icon}
                </div>
                <span className="text-gray-200 text-sm">{item.text}</span>
              </div>
            ))}
          </div>

          <p className="text-gray-500 text-xs mt-10">
            © 2025 MployNow. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right — login form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10 blur-3xl pointer-events-none"
          style={{background: 'radial-gradient(circle, #3b82f6, transparent)'}}></div>

        <div className="w-full max-w-md relative z-10">

          <div className="lg:hidden mb-8 flex justify-center">
            <Logo size="lg" />
          </div>

          <div className="rounded-3xl p-8 glass-card tilt-3d"
            style={{boxShadow: '0 20px 60px rgba(0,0,0,0.4)'}}>

            <span className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full mb-4"
              style={{background: 'rgba(34,197,94,0.1)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.2)'}}>
              🔒 Secure Login
            </span>

            <h2 className="text-3xl font-display font-black text-white mb-1">Welcome Back</h2>
            <p className="text-gray-400 text-sm mb-6">Login to continue your journey</p>

            <div className="flex gap-2 mb-6 p-1 rounded-xl"
              style={{background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)'}}>
              <button type="button" onClick={() => setRole('jobseeker')}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2"
                style={role === 'jobseeker' ? {
                  background: 'linear-gradient(135deg, #3b82f6, #7c3aed)', color: 'white'
                } : { color: '#6b7280' }}>
                👤 Job Seeker
              </button>
              <button type="button" onClick={() => setRole('recruiter')}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2"
                style={role === 'recruiter' ? {
                  background: 'linear-gradient(135deg, #3b82f6, #7c3aed)', color: 'white'
                } : { color: '#6b7280' }}>
                🏢 Recruiter
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">✉️</span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder={role === 'recruiter' ? 'recruiter@techcorp.com' : 'you@example.com'}
                    className="w-full pl-12 pr-4 py-3 rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none transition-all"
                    style={{background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)'}}
                    onFocus={e => e.target.style.border = '1px solid rgba(59,130,246,0.6)'}
                    onBlur={e => e.target.style.border = '1px solid rgba(255,255,255,0.08)'}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Password
                  </label>
                  <Link to="/forgot-password" className="text-xs text-blue-400 hover:text-blue-300 transition">Forgot password?</Link>
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">🔒</span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-12 py-3 rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none transition-all"
                    style={{background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)'}}
                    onFocus={e => e.target.style.border = '1px solid rgba(59,130,246,0.6)'}
                    onBlur={e => e.target.style.border = '1px solid rgba(255,255,255,0.08)'}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition">
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <div className="px-4 py-3 rounded-xl text-xs"
                style={{background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)', color: '#94a3b8'}}>
                {role === 'recruiter'
                  ? '🏢 Logging in as Recruiter — you can post jobs and manage applicants'
                  : '👤 Logging in as Job Seeker — apply to jobs and track applications'}
              </div>

              <button type="submit" disabled={loading}
                className="w-full py-4 rounded-xl font-bold text-white text-sm transition-all flex items-center justify-center gap-2"
                style={{
                  background: loading ? 'rgba(59,130,246,0.5)' : 'linear-gradient(135deg, #3b82f6, #7c3aed)',
                  boxShadow: loading ? 'none' : '0 8px 25px rgba(59,130,246,0.3)'
                }}>
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Logging in...
                  </>
                ) : (
                  <>🔓 Login as {role === 'recruiter' ? 'Recruiter' : 'Job Seeker'}</>
                )}
              </button>
            </form>

            <p className="text-center text-gray-500 text-sm mt-6">
              Don't have an account?{' '}
              <Link to="/register" className="text-blue-400 hover:text-blue-300 font-semibold transition">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;