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
    <nav className="sticky top-0 z-50"
      style={{background: 'rgba(2,8,23,0.95)', borderBottom: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)'}}>
      <div className="px-6 py-4 flex justify-between items-center max-w-7xl mx-auto">

        {/* Logo */}
       <Link to="/">
  <Logo />
</Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8 text-gray-400 text-sm font-medium">
          <Link to="/jobs" className="hover:text-white transition">Browse Jobs</Link>
          <Link to="/companies" className="hover:text-white transition">Companies</Link>
          <Link to="/about" className="hover:text-white transition">About</Link>
        </div>

        {/* Desktop auth buttons */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <>
              <span className="text-gray-300 text-sm">
                Hi, <span className="font-semibold text-white">{user.name}</span>
                <span className="ml-2 text-xs px-2 py-1 rounded-full"
                  style={{
                    background: user.role === 'recruiter' ? 'rgba(168,85,247,0.15)' : 'rgba(59,130,246,0.15)',
                    color: user.role === 'recruiter' ? '#c084fc' : '#60a5fa',
                    border: user.role === 'recruiter' ? '1px solid rgba(168,85,247,0.3)' : '1px solid rgba(59,130,246,0.3)'
                  }}>
                  {user.role}
                </span>
              </span>
              <Link to="/dashboard"
                className="text-sm text-gray-400 hover:text-white transition">
                Dashboard
              </Link>
              <button onClick={handleLogout}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-red-400 transition"
                style={{background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)'}}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login"
                className="text-gray-400 hover:text-white text-sm font-medium transition">
                Login
              </Link>
              <Link to="/register"
                className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition"
                style={{background: 'linear-gradient(135deg, #3b82f6, #7c3aed)'}}>
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden flex flex-col gap-1.5 p-2"
          aria-label="Toggle menu">
          <span className="block w-6 h-0.5 bg-white transition-all"
            style={{transform: menuOpen ? 'rotate(45deg) translate(4px, 4px)' : 'none'}}></span>
          <span className="block w-6 h-0.5 bg-white transition-all"
            style={{opacity: menuOpen ? 0 : 1}}></span>
          <span className="block w-6 h-0.5 bg-white transition-all"
            style={{transform: menuOpen ? 'rotate(-45deg) translate(4px, -4px)' : 'none'}}></span>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden px-6 pb-6 space-y-3"
          style={{borderTop: '1px solid rgba(255,255,255,0.06)'}}>
          <Link to="/jobs" onClick={() => setMenuOpen(false)}
            className="block py-3 text-gray-300 hover:text-white text-sm transition">
            Browse Jobs
          </Link>
          <Link to="/companies" onClick={() => setMenuOpen(false)}
            className="block py-3 text-gray-300 hover:text-white text-sm transition">
            Companies
          </Link>
          <Link to="/about" onClick={() => setMenuOpen(false)}
            className="block py-3 text-gray-300 hover:text-white text-sm transition">
            About
          </Link>
          <Link to="/salary-insights" className="text-gray-300 hover:text-white transition">
  Salary Insights
</Link>

          {user ? (
            <>
              <Link to="/dashboard" onClick={() => setMenuOpen(false)}
                className="block py-3 text-gray-300 hover:text-white text-sm transition">
                Dashboard
              </Link>
              <button onClick={handleLogout}
                className="w-full py-3 rounded-xl text-sm font-semibold text-red-400 text-left transition"
                style={{background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', padding: '12px 16px'}}>
                Logout
              </button>
            </>
          ) : (
            <div className="flex gap-3 pt-2">
              <Link to="/login" onClick={() => setMenuOpen(false)}
                className="flex-1 py-3 rounded-xl text-sm font-semibold text-center text-gray-300 transition"
                style={{background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)'}}>
                Login
              </Link>
              <Link to="/register" onClick={() => setMenuOpen(false)}
                className="flex-1 py-3 rounded-xl text-sm font-semibold text-center text-white transition"
                style={{background: 'linear-gradient(135deg, #3b82f6, #7c3aed)'}}>
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;