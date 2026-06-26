import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import CompanyLogo from '../components/CompanyLogo';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const statusColors = {
  'Pending':     { bg: 'rgba(251,191,36,0.15)',  color: '#fbbf24', border: 'rgba(251,191,36,0.3)'  },
  'Reviewed':    { bg: 'rgba(59,130,246,0.15)',  color: '#60a5fa', border: 'rgba(59,130,246,0.3)'  },
  'Shortlisted': { bg: 'rgba(34,197,94,0.15)',   color: '#4ade80', border: 'rgba(34,197,94,0.3)'   },
  'Rejected':    { bg: 'rgba(239,68,68,0.15)',   color: '#f87171', border: 'rgba(239,68,68,0.3)'   },
};

const formatSalary = (min, max) => {
  if (!min && !max) return 'Not disclosed';
  if (max >= 100000) return `₹${(min/100000).toFixed(1)}L - ₹${(max/100000).toFixed(1)}L/yr`;
  return `₹${min?.toLocaleString()} - ₹${max?.toLocaleString()}/mo`;
};

// Predictive score: heuristic model based on status progression + time elapsed
const getPredictiveScore = (app) => {
  const daysSinceApplied = Math.floor((new Date() - new Date(app.createdAt)) / (1000 * 60 * 60 * 24));

  if (app.status === 'Rejected') return { score: 0, label: 'Rejected', color: '#f87171', tip: 'This application was rejected. Apply again with updated skills.' };
  if (app.status === 'Shortlisted') return { score: 92, label: 'Very High', color: '#4ade80', tip: 'You\'re shortlisted! Prepare for the interview round.' };

  if (app.status === 'Reviewed') {
    if (daysSinceApplied <= 3) return { score: 72, label: 'High', color: '#4ade80', tip: 'Recruiter reviewed your profile quickly — strong signal!' };
    if (daysSinceApplied <= 7) return { score: 58, label: 'Moderate', color: '#fbbf24', tip: 'Under active consideration. Follow up professionally.' };
    return { score: 35, label: 'Low', color: '#fb923c', tip: 'Reviewed but no update. Consider applying to similar roles.' };
  }

  if (app.status === 'Pending') {
    if (daysSinceApplied <= 2) return { score: 55, label: 'Moderate', color: '#fbbf24', tip: 'Recently applied — recruiter likely hasn\'t reviewed yet.' };
    if (daysSinceApplied <= 7) return { score: 40, label: 'Watch', color: '#fb923c', tip: 'Pending for a week. Many applicants compete for this role.' };
    return { score: 20, label: 'Low', color: '#f87171', tip: 'Pending for long. Focus energy on newer applications.' };
  }

  return { score: 30, label: 'Unknown', color: '#6b7280', tip: 'Status unclear.' };
};

const ScoreRing = ({ score, color }) => {
  const r = 20;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;

  return (
    <svg width="52" height="52" className="flex-shrink-0">
      <circle cx="26" cy="26" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
      <circle cx="26" cy="26" r={r} fill="none" stroke={color} strokeWidth="4"
        strokeDasharray={`${dash} ${circ}`}
        strokeDashoffset={circ * 0.25}
        strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 0.8s ease' }}
      />
      <text x="26" y="31" textAnchor="middle" fill={color} fontSize="11" fontWeight="bold">{score}</text>
    </svg>
  );
};

const SeekDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'analytics'

  useEffect(() => { fetchApplications(); }, []);

  const fetchApplications = async () => {
    try {
      const res = await axios.get(`${API}/applications/my/applications`, { withCredentials: true });
      setApplications(res.data.applications);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleLogout = async () => { await logout(); navigate('/login'); };

  const filtered = activeTab === 'all'
    ? applications
    : applications.filter(a => a.status.toLowerCase() === activeTab);

  const stats = [
    { label: 'Total Applied',  value: applications.length,                                         icon: '📋', color: '#60a5fa' },
    { label: 'Pending',        value: applications.filter(a => a.status === 'Pending').length,     icon: '⏳', color: '#fbbf24' },
    { label: 'Shortlisted',   value: applications.filter(a => a.status === 'Shortlisted').length, icon: '✅', color: '#4ade80' },
    { label: 'Rejected',      value: applications.filter(a => a.status === 'Rejected').length,    icon: '❌', color: '#f87171' },
  ];

  // Analytics calculations
  const avgScore = applications.length
    ? Math.round(applications.reduce((sum, a) => sum + getPredictiveScore(a).score, 0) / applications.length)
    : 0;

  const topApp = applications.length
    ? applications.reduce((best, a) => getPredictiveScore(a).score > getPredictiveScore(best).score ? a : best, applications[0])
    : null;

  const statusDist = ['Pending', 'Reviewed', 'Shortlisted', 'Rejected'].map(s => ({
    label: s,
    count: applications.filter(a => a.status === s).length,
    color: statusColors[s].color,
    bg: statusColors[s].bg,
  }));

  return (
    <div className="min-h-screen relative text-white" style={{background: '#020817'}}>
      <div className="fixed inset-0 -z-10">
        <img
          src="https://images.unsplash.com/photo-1551434678-e076c223a692?q=80&w=1920&auto=format&fit=crop"
          alt=""
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0" style={{background: 'linear-gradient(180deg, rgba(2,8,23,0.75) 0%, #020817 100%)'}}></div>
      </div>

      <nav className="sticky top-0 z-50 px-8 py-4 flex justify-between items-center flex-wrap gap-3"
        style={{background: 'rgba(2,8,23,0.95)', borderBottom: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)'}}>
        <span className="text-2xl font-black font-display text-white">
          Mploy<span className="text-blue-400">Now</span>
        </span>
        <div className="flex items-center gap-4 flex-wrap">
          <span className="text-gray-400 text-sm">
            Hi, <span className="text-white font-semibold">{user?.name}</span>
          </span>
          <button onClick={() => navigate('/jobs')}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-blue-400 transition"
            style={{background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)'}}>
            Browse Jobs
          </button>
          <button onClick={() => navigate('/resume-grader')}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-green-400 transition"
            style={{background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)'}}>
            🤖 AI Resume Grader
          </button>
          <button onClick={() => navigate('/profile')}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-purple-400 transition"
            style={{background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)'}}>
            👤 My Profile
          </button>
          <button onClick={handleLogout}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-red-400 transition"
            style={{background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)'}}>
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-10 relative z-10">

        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-xl"
              style={{background: 'linear-gradient(135deg, #3b82f6, #7c3aed)'}}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl font-black font-display text-white">My Dashboard</h1>
              <p className="text-gray-400 text-sm">Track and predict your job applications</p>
            </div>
          </div>

          <div className="flex gap-2 p-1 rounded-xl"
            style={{background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)'}}>
            <button onClick={() => setViewMode('list')}
              className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
              style={viewMode === 'list' ? { background: 'linear-gradient(135deg, #3b82f6, #7c3aed)', color: 'white' } : { color: '#6b7280' }}>
              📋 Applications
            </button>
            <button onClick={() => setViewMode('analytics')}
              className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
              style={viewMode === 'analytics' ? { background: 'linear-gradient(135deg, #3b82f6, #7c3aed)', color: 'white' } : { color: '#6b7280' }}>
              📊 AI Analytics
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((s, i) => (
            <div key={i} className="rounded-2xl p-5 tilt-3d"
              style={{background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)'}}>
              <div className="text-3xl mb-2">{s.icon}</div>
              <div className="text-3xl font-black mb-1" style={{color: s.color}}>{s.value}</div>
              <div className="text-gray-500 text-sm">{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── ANALYTICS VIEW ── */}
        {viewMode === 'analytics' && (
          <div className="space-y-6">

            {applications.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">📊</div>
                <h3 className="text-white text-xl font-bold mb-2">No data yet</h3>
                <p className="text-gray-400 mb-6">Apply to jobs first to see your predictive analytics</p>
                <button onClick={() => navigate('/jobs')}
                  className="px-6 py-3 rounded-xl font-semibold text-white text-sm"
                  style={{background: 'linear-gradient(135deg, #3b82f6, #7c3aed)'}}>
                  Browse Jobs →
                </button>
              </div>
            ) : (
              <>
                {/* Summary cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="rounded-2xl p-6 tilt-3d text-center"
                    style={{background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.2)'}}>
                    <div className="text-4xl font-black font-display text-blue-400 mb-1">{avgScore}</div>
                    <div className="text-white font-semibold text-sm mb-1">Average Prediction Score</div>
                    <div className="text-gray-500 text-xs">across all your applications</div>
                  </div>

                  <div className="rounded-2xl p-6 tilt-3d text-center"
                    style={{background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)'}}>
                    <div className="text-4xl font-black font-display text-green-400 mb-1">
                      {applications.filter(a => a.status === 'Shortlisted').length}
                    </div>
                    <div className="text-white font-semibold text-sm mb-1">Shortlisted</div>
                    <div className="text-gray-500 text-xs">
                      {applications.length > 0
                        ? `${Math.round((applications.filter(a => a.status === 'Shortlisted').length / applications.length) * 100)}% success rate`
                        : '—'}
                    </div>
                  </div>

                  <div className="rounded-2xl p-6 tilt-3d text-center"
                    style={{background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.2)'}}>
                    <div className="text-4xl font-black font-display text-yellow-400 mb-1">
                      {topApp ? getPredictiveScore(topApp).score : 0}
                    </div>
                    <div className="text-white font-semibold text-sm mb-1">Best Application Score</div>
                    <div className="text-gray-500 text-xs truncate px-2">
                      {topApp ? `${topApp.job?.title} @ ${topApp.job?.company}` : '—'}
                    </div>
                  </div>
                </div>

                {/* Status distribution bar */}
                <div className="rounded-2xl p-6 tilt-3d"
                  style={{background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)'}}>
                  <h3 className="text-white font-bold font-display mb-4">Application Status Distribution</h3>
                  <div className="flex rounded-xl overflow-hidden h-5 mb-4">
                    {statusDist.map((s, i) => (
                      s.count > 0 && (
                        <div key={i}
                          className="transition-all duration-700"
                          style={{
                            width: `${(s.count / applications.length) * 100}%`,
                            background: s.color,
                            opacity: 0.8
                          }}
                          title={`${s.label}: ${s.count}`}>
                        </div>
                      )
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-4">
                    {statusDist.map((s, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{background: s.color}}></div>
                        <span className="text-gray-400 text-xs">{s.label}: <span className="text-white font-bold">{s.count}</span></span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Per-application prediction scores */}
                <div className="rounded-2xl p-6 tilt-3d"
                  style={{background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)'}}>
                  <h3 className="text-white font-bold font-display mb-2">🔮 Predictive Scores</h3>
                  <p className="text-gray-500 text-xs mb-5">AI-calculated likelihood of progressing — based on status, recruiter response time, and days elapsed.</p>

                  <div className="space-y-4">
                    {[...applications]
                      .sort((a, b) => getPredictiveScore(b).score - getPredictiveScore(a).score)
                      .map(app => {
                        const pred = getPredictiveScore(app);
                        const s = statusColors[app.status];
                        return (
                          <div key={app._id} className="flex items-start gap-4 p-4 rounded-xl"
                            style={{background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)'}}>

                            <ScoreRing score={pred.score} color={pred.color} />

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <span className="text-white font-semibold text-sm truncate">{app.job?.title}</span>
                                <span className="text-gray-500 text-xs">@ {app.job?.company}</span>
                                <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                                  style={{background: s.bg, color: s.color, border: `1px solid ${s.border}`}}>
                                  {app.status}
                                </span>
                              </div>
                              <div className="w-full rounded-full h-1.5 mb-2" style={{background: 'rgba(255,255,255,0.06)'}}>
                                <div className="h-1.5 rounded-full transition-all duration-700"
                                  style={{width: `${pred.score}%`, background: pred.color}}></div>
                              </div>
                              <p className="text-gray-500 text-xs">💡 {pred.tip}</p>
                            </div>

                            <button onClick={() => navigate('/jobs/' + app.job?._id)}
                              className="text-xs px-3 py-1.5 rounded-lg flex-shrink-0 transition"
                              style={{background: 'rgba(59,130,246,0.1)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.2)'}}>
                              View →
                            </button>
                          </div>
                        );
                      })}
                  </div>
                </div>

                {/* AI Tip banner */}
                <div className="rounded-2xl p-5"
                  style={{background: 'linear-gradient(135deg, rgba(59,130,246,0.08), rgba(124,58,237,0.08))', border: '1px solid rgba(59,130,246,0.2)'}}>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">🤖</span>
                    <div>
                      <p className="text-white font-bold text-sm mb-1">AI Recommendation</p>
                      <p className="text-gray-400 text-xs leading-relaxed">
                        {applications.filter(a => a.status === 'Shortlisted').length > 0
                          ? `🎯 You have ${applications.filter(a => a.status === 'Shortlisted').length} shortlisted application${applications.filter(a => a.status === 'Shortlisted').length > 1 ? 's' : ''}. Prioritise interview preparation now using the AI Interview Prep feature on those job pages.`
                          : applications.filter(a => a.status === 'Reviewed').length > 0
                          ? `⚡ Your application was reviewed — stay active on MployNow, update your profile skills, and use the AI Resume Grader to strengthen your next application.`
                          : applications.filter(a => a.status === 'Pending').length >= 3
                          ? `📊 You have ${applications.filter(a => a.status === 'Pending').length} pending applications. While you wait, use the AI Resume Grader to get instant ATS feedback.`
                          : `🚀 Apply to more jobs to increase your chances. Use the AI Job Match score to find roles where you have the strongest fit.`}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── LIST VIEW ── */}
        {viewMode === 'list' && (
          <>
            <div className="flex gap-2 mb-6 p-1 rounded-xl w-fit flex-wrap"
              style={{background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)'}}>
              {['all', 'pending', 'reviewed', 'shortlisted', 'rejected'].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className="px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-all"
                  style={activeTab === tab ? { background: 'linear-gradient(135deg, #3b82f6, #7c3aed)', color: 'white' } : { color: '#6b7280' }}>
                  {tab}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="flex justify-center py-20">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">📭</div>
                <h3 className="text-white text-xl font-bold mb-2">No applications yet</h3>
                <p className="text-gray-400 mb-6">Start applying to jobs to see them here</p>
                <button onClick={() => navigate('/jobs')}
                  className="px-6 py-3 rounded-xl font-semibold text-white text-sm"
                  style={{background: 'linear-gradient(135deg, #3b82f6, #7c3aed)'}}>
                  Browse Jobs →
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filtered.map(app => {
                  const pred = getPredictiveScore(app);
                  const s = statusColors[app.status];
                  return (
                    <div key={app._id} className="rounded-2xl p-6 flex items-center gap-4 flex-wrap tilt-3d"
                      style={{background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)'}}>

                      <CompanyLogo company={app.job?.company} size={48} />

                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-bold text-base">{app.job?.title}</h3>
                        <p className="text-blue-400 text-sm">{app.job?.company}</p>
                        <div className="flex flex-wrap gap-3 mt-2">
                          <span className="text-gray-500 text-xs">📍 {app.job?.location}</span>
                          <span className="text-gray-500 text-xs">💰 {formatSalary(app.job?.salary?.min, app.job?.salary?.max)}</span>
                          <span className="text-gray-500 text-xs">📅 Applied {new Date(app.createdAt).toLocaleDateString('en-IN', {day:'numeric', month:'short', year:'numeric'})}</span>
                        </div>

                        {/* Inline prediction bar */}
                        <div className="flex items-center gap-2 mt-3">
                          <div className="flex-1 rounded-full h-1.5" style={{background: 'rgba(255,255,255,0.06)'}}>
                            <div className="h-1.5 rounded-full transition-all duration-700"
                              style={{width: `${pred.score}%`, background: pred.color}}></div>
                          </div>
                          <span className="text-xs font-bold flex-shrink-0" style={{color: pred.color}}>
                            {pred.score}% {pred.label}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="text-xs font-semibold px-4 py-2 rounded-full"
                          style={{background: s.bg, color: s.color, border: '1px solid ' + s.border}}>
                          {app.status}
                        </span>
                        <button onClick={() => navigate('/jobs/' + app.job?._id)}
                          className="text-xs px-3 py-2 rounded-lg text-gray-400 hover:text-white transition"
                          style={{background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)'}}>
                          View Job
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SeekDashboard;