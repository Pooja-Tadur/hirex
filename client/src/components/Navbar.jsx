import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
    setMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 px-6 py-4"
      style={{background: 'rgba(2,8,23,0.95)', borderBottom: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)'}}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">

        <Link to="/" onClick={() => setMenuOpen(false)}>
          <Logo size="md" />
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link to="/jobs" className="text-gray-300 hover:text-white text-sm transition">Browse Jobs</Link>
          <Link to="/companies" className="text-gray-300 hover:text-white text-sm transition">Companies</Link>
          <Link to="/salary-insights" className="text-gray-300 hover:text-white text-sm transition">Salary Insights</Link>
          <Link to="/about" className="text-gray-300 hover:text-white text-sm transition">About</Link>
        </div>

        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <span className="text-gray-400 text-sm">
                Hi, <span className="text-white font-semibold">{user.name}</span>
                <span className="ml-2 text-xs px-2 py-0.5 rounded-full"
                  style={{
                    background: user.role === 'recruiter' ? 'rgba(168,85,247,0.15)' : 'rgba(59,130,246,0.15)',
                    color: user.role === 'recruiter' ? '#c084fc' : '#60a5fa',
                    border: user.role === 'recruiter' ? '1px solid rgba(168,85,247,0.3)' : '1px solid rgba(59,130,246,0.3)'
                  }}>
                  {user.role}
                </span>
              </span>
              <button onClick={() => navigate('/dashboard')}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-blue-400 transition"
                style={{background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)'}}>
                Dashboard
              </button>
              <button onClick={handleLogout}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-red-400 transition"
                style={{background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)'}}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login"
                className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-300 hover:text-white transition">
                Login
              </Link>
              <Link to="/register"
                className="px-5 py-2 rounded-lg text-sm font-bold text-white transition"
                style={{background: 'linear-gradient(135deg, #3b82f6, #7c3aed)', boxShadow: '0 4px 15px rgba(59,130,246,0.3)'}}>
                Get Started
              </Link>
            </>
          )}
        </div>

        <button className="md:hidden text-gray-400 hover:text-white transition"
          onClick={() => setMenuOpen(!menuOpen)}>
          <div className="w-6 flex flex-col gap-1.5">
            <span className={`block h-0.5 bg-current transition-all ${menuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
            <span className={`block h-0.5 bg-current transition-all ${menuOpen ? 'opacity-0' : ''}`}></span>
            <span className={`block h-0.5 bg-current transition-all ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
          </div>
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden mt-4 pb-4 space-y-2"
          style={{borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '16px'}}>
          {[
            { to: '/jobs', label: 'Browse Jobs' },
            { to: '/companies', label: 'Companies' },
            { to: '/salary-insights', label: 'Salary Insights' },
            { to: '/about', label: 'About' },
          ].map(link => (
            <Link key={link.to} to={link.to}
              onClick={() => setMenuOpen(false)}
              className="block px-4 py-2 text-gray-300 hover:text-white text-sm transition rounded-lg hover:bg-white/5">
              {link.label}
            </Link>
          ))}
          {user ? (
            <>
              <Link to="/dashboard" onClick={() => setMenuOpen(false)}
                className="block px-4 py-2 text-blue-400 text-sm transition rounded-lg"
                style={{background: 'rgba(59,130,246,0.1)'}}>
                Dashboard
              </Link>
              <button onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-red-400 text-sm transition rounded-lg"
                style={{background: 'rgba(239,68,68,0.1)'}}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)}
                className="block px-4 py-2 text-gray-300 text-sm rounded-lg hover:bg-white/5">
                Login
              </Link>
              <Link to="/register" onClick={() => setMenuOpen(false)}
                className="block px-4 py-2 text-white text-sm font-bold rounded-lg text-center"
                style={{background: 'linear-gradient(135deg, #3b82f6, #7c3aed)'}}>
                Get Started
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;