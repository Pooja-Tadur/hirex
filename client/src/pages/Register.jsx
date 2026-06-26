import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import Logo from '../components/Logo';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'jobseeker' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await register(formData.name, formData.email, formData.password, formData.role);
      toast.success('Account created successfully!');
      navigate(user.role === 'recruiter' ? '/dashboard' : '/jobs');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{background: '#020817'}}>

      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1600&auto=format&fit=crop"
          alt="Team"
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
            Land Your<br/>
            <span style={{
              background: 'linear-gradient(135deg, #60a5fa, #c084fc)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>Dream Career</span><br/>
            Faster
          </h1>
          <p className="text-gray-200 text-lg max-w-md mb-8">
            Join 50,000+ professionals who found their perfect job through MployNow.
          </p>

          <div className="grid grid-cols-2 gap-3 mb-6">
            {[
              { icon: '💼', num: '10,000+', label: 'Active Jobs' },
              { icon: '🏢', num: '5,000+', label: 'Companies' },
              { icon: '👥', num: '50,000+', label: 'Job Seekers' },
              { icon: '✅', num: '8,000+', label: 'Hired' },
            ].map((s, i) => (
              <div key={i} className="rounded-2xl p-4 flex items-center gap-3 glass-card">
                <span className="text-2xl">{s.icon}</span>
                <div>
                  <div className="text-white font-bold text-sm">{s.num}</div>
                  <div className="text-gray-300 text-xs">{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-2xl p-5 glass-card">
            <div className="flex gap-1 mb-2">
              {[...Array(5)].map((_, i) => <span key={i} className="text-yellow-400 text-sm">★</span>)}
            </div>
            <p className="text-gray-200 text-sm italic mb-3">
              "Got my dream job at a top MNC within 3 weeks. The platform is incredibly easy to use!"
            </p>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">PS</div>
              <div>
                <div className="text-white text-xs font-semibold">Priya Sharma</div>
                <div className="text-gray-300 text-xs">SDE at Google • Bangalore</div>
              </div>
            </div>
          </div>

          <p className="text-gray-500 text-xs mt-10">© 2025 MployNow. All rights reserved.</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-10 relative">
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-10 blur-3xl pointer-events-none"
          style={{background: 'radial-gradient(circle, #3b82f6, transparent)'}}></div>

        <div className="w-full max-w-md relative z-10">

          <div className="lg:hidden mb-8 flex justify-center">
            <Logo size="lg" />
          </div>

          <div className="rounded-3xl p-8 glass-card tilt-3d" style={{boxShadow: '0 25px 50px rgba(0,0,0,0.5)'}}>

            <div className="mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium text-blue-400 mb-4"
                style={{background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)'}}>
                ✨ Free Forever
              </div>
              <h2 className="text-3xl font-display font-black text-white mb-2">Create Account</h2>
              <p className="text-gray-500 text-sm">Start your career journey today</p>
            </div>

            <div className="flex gap-2 mb-6 p-1 rounded-xl"
              style={{background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)'}}>
              {['jobseeker', 'recruiter'].map((r) => (
                <button key={r} type="button"
                  onClick={() => setFormData({ ...formData, role: r })}
                  className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200"
                  style={formData.role === r ? {
                    background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: 'white', boxShadow: '0 4px 15px rgba(59,130,246,0.3)'
                  } : { color: '#6b7280' }}>
                  {r === 'jobseeker' ? '👨‍💼 Job Seeker' : '🏢 Recruiter'}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Full Name</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">👤</span>
                  <input
                    type="text" name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    required
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none transition-all"
                    style={{background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)'}}
                    onFocus={e => e.target.style.border = '1px solid rgba(59,130,246,0.6)'}
                    onBlur={e => e.target.style.border = '1px solid rgba(255,255,255,0.08)'}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">✉️</span>
                  <input
                    type="email" name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    required
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none transition-all"
                    style={{background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)'}}
                    onFocus={e => e.target.style.border = '1px solid rgba(59,130,246,0.6)'}
                    onBlur={e => e.target.style.border = '1px solid rgba(255,255,255,0.08)'}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Password</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">🔒</span>
                  <input
                    type={showPass ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Min 6 characters"
                    required
                    className="w-full pl-11 pr-12 py-3.5 rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none transition-all"
                    style={{background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)'}}
                    onFocus={e => e.target.style.border = '1px solid rgba(59,130,246,0.6)'}
                    onBlur={e => e.target.style.border = '1px solid rgba(255,255,255,0.08)'}
                  />
                  <button type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 text-sm transition">
                    {showPass ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-xl font-bold text-white text-sm transition-all duration-200 mt-2"
                style={{
                  background: loading ? 'rgba(59,130,246,0.5)' : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #7c3aed 100%)',
                  boxShadow: loading ? 'none' : '0 8px 25px rgba(59,130,246,0.35)',
                }}>
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Creating Account...
                  </span>
                ) : '🚀 Create Free Account'}
              </button>
            </form>

            <div className="flex items-center gap-4 my-5">
              <div className="flex-1 h-px" style={{background: 'rgba(255,255,255,0.06)'}}></div>
              <span className="text-gray-600 text-xs">or</span>
              <div className="flex-1 h-px" style={{background: 'rgba(255,255,255,0.06)'}}></div>
            </div>

            <p className="text-center text-gray-500 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-400 font-semibold hover:text-blue-300 transition">
                Sign in here →
              </Link>
            </p>
          </div>

          <p className="text-center text-gray-700 text-xs mt-4">
            By creating an account you agree to our Terms of Service & Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;