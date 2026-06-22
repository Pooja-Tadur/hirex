import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AnimatedBackground from '../components/AnimatedBackground';

const stats = [
  { number: '10,000+', label: 'Jobs Posted' },
  { number: '50,000+', label: 'Job Seekers' },
  { number: '5,000+', label: 'Companies' },
  { number: '8,000+', label: 'Hired Successfully' },
];

const categories = [
  { icon: '💻', title: 'Technology', count: '2,341 jobs' },
  { icon: '📊', title: 'Finance', count: '1,872 jobs' },
  { icon: '🎨', title: 'Design', count: '983 jobs' },
  { icon: '📢', title: 'Marketing', count: '1,205 jobs' },
  { icon: '🏥', title: 'Healthcare', count: '756 jobs' },
  { icon: '📚', title: 'Education', count: '634 jobs' },
];

const steps = [
  { step: '01', title: 'Create Account', desc: 'Sign up as a Job Seeker or Recruiter in seconds' },
  { step: '02', title: 'Build Your Profile', desc: 'Add your skills, experience and upload your resume' },
  { step: '03', title: 'Apply to Jobs', desc: 'Browse thousands of jobs and apply with one click' },
  { step: '04', title: 'Get Hired', desc: 'Track your applications and land your dream job' },
];

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen relative text-white" style={{background: '#020817'}}>
      <AnimatedBackground />

      <section className="relative overflow-hidden py-20 md:py-32 px-6">
        <img
          src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?q=80&w=1920&auto=format&fit=crop"
          alt="Team collaborating"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0"
          style={{background: 'linear-gradient(180deg, rgba(2,8,23,0.55) 0%, rgba(2,8,23,0.8) 60%, #020817 100%)'}}>
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <span className="inline-block text-blue-300 text-xs md:text-sm font-medium px-4 py-2 rounded-full mb-6 glass-card">
            🚀 #1 MployNow for Fresh Graduates
          </span>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-black leading-tight mb-6">
            Find Your
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
              {' '}Dream Job{' '}
            </span>
            Today
          </h1>

          <p className="text-gray-200 text-base md:text-xl mb-10 max-w-2xl mx-auto">
            Connect with top companies, apply to thousands of jobs, and take the next step in your career journey.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto mb-10 p-2 rounded-2xl glass-card">
            <input type="text" placeholder="Job title, skills or company..."
              className="flex-1 px-4 py-3 rounded-xl text-white placeholder-gray-400 focus:outline-none bg-transparent" />
            <input type="text" placeholder="Location..."
              className="sm:w-40 px-4 py-3 rounded-xl text-white placeholder-gray-400 focus:outline-none bg-transparent" />
            <Link to="/jobs"
              className="px-8 py-3 rounded-xl font-semibold text-white text-center transition-all"
              style={{background: 'linear-gradient(135deg, #3b82f6, #7c3aed)', boxShadow: '0 4px 15px rgba(59,130,246,0.3)'}}>
              Search
            </Link>
          </div>

          {!user ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register"
                className="px-8 py-4 rounded-xl font-semibold text-lg text-center transition-all"
                style={{background: 'linear-gradient(135deg, #3b82f6, #7c3aed)', boxShadow: '0 4px 15px rgba(59,130,246,0.3)'}}>
                Get Started Free →
              </Link>
              <Link to="/login"
                className="px-8 py-4 rounded-xl font-semibold text-lg text-center transition-all glass-card">
                Login to Account
              </Link>
            </div>
          ) : (
            <Link to="/jobs"
              className="inline-block px-8 py-4 rounded-xl font-semibold text-lg transition-all"
              style={{background: 'linear-gradient(135deg, #3b82f6, #7c3aed)'}}>
              Browse Jobs →
            </Link>
          )}
        </div>
      </section>

      <section className="py-12 px-6 relative z-10"
        style={{borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)'}}>
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {stats.map((s, i) => (
            <div key={i}>
              <div className="text-2xl md:text-4xl font-display font-black text-blue-400 mb-2">{s.number}</div>
              <div className="text-gray-400 text-xs md:text-sm">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-16 md:py-20 px-6 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-4xl font-display font-black mb-4">Browse by Category</h2>
            <p className="text-gray-400">Explore jobs across top industries</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            {categories.map((cat, i) => (
              <Link to="/jobs" key={i}
                className="p-4 md:p-6 rounded-2xl cursor-pointer transition-all duration-300 tilt-3d"
                style={{background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)'}}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(59,130,246,0.1)';
                  e.currentTarget.style.border = '1px solid rgba(59,130,246,0.3)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                  e.currentTarget.style.border = '1px solid rgba(255,255,255,0.1)';
                }}>
                <div className="text-2xl md:text-3xl mb-2 md:mb-3">{cat.icon}</div>
                <div className="font-semibold text-sm md:text-lg mb-1">{cat.title}</div>
                <div className="text-blue-400 text-xs md:text-sm">{cat.count}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-16 md:py-20 px-6 overflow-hidden z-10">
        <img
          src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=1920&auto=format&fit=crop"
          alt="Office workspace"
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0" style={{background: 'rgba(2,8,23,0.85)'}}></div>

        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-4xl font-display font-black mb-4">How It Works</h2>
            <p className="text-gray-400">Get hired in 4 simple steps</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {steps.map((s, i) => (
              <div key={i} className="text-center p-4 md:p-6 rounded-2xl tilt-3d glass-card">
                <div className="text-4xl md:text-5xl font-display font-black text-blue-500 opacity-40 mb-3 md:mb-4">{s.step}</div>
                <div className="font-semibold text-sm md:text-lg mb-2">{s.title}</div>
                <div className="text-gray-400 text-xs md:text-sm">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 px-6 relative z-10">
        <div className="max-w-3xl mx-auto text-center rounded-3xl p-8 md:p-12 tilt-3d"
          style={{background: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(124,58,237,0.15))', border: '1px solid rgba(59,130,246,0.3)'}}>
          <h2 className="text-2xl md:text-4xl font-display font-black mb-4">Ready to Start Your Journey?</h2>
          <p className="text-gray-400 mb-8 text-sm md:text-base">
            Join thousands of professionals who found their dream job through MployNow
          </p>
          <Link to="/register"
            className="inline-block px-8 py-4 rounded-xl font-semibold text-lg transition-all"
            style={{background: 'linear-gradient(135deg, #3b82f6, #7c3aed)', boxShadow: '0 4px 15px rgba(59,130,246,0.3)'}}>
            Create Free Account →
          </Link>
        </div>
      </section>

      <footer className="px-6 py-8 text-center text-gray-500 text-sm relative z-10"
        style={{borderTop: '1px solid rgba(255,255,255,0.06)'}}>
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="text-xl font-display font-black text-white">
            Mploy<span className="text-blue-400">Now</span>
          </span>
          <p>© 2025 MployNow. Built with MERN Stack + AI.</p>
          <div className="flex gap-6 text-gray-500">
            <Link to="/about" className="hover:text-white transition">About</Link>
            <Link to="/companies" className="hover:text-white transition">Companies</Link>
            <Link to="/jobs" className="hover:text-white transition">Jobs</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;