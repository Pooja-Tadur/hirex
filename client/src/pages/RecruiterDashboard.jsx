import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import CompanyLogo from '../components/CompanyLogo';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const statusColors = {
  'Pending':     { bg: 'rgba(251,191,36,0.15)',  color: '#fbbf24', border: 'rgba(251,191,36,0.3)'  },
  'Reviewed':    { bg: 'rgba(59,130,246,0.15)',  color: '#60a5fa', border: 'rgba(59,130,246,0.3)'  },
  'Shortlisted': { bg: 'rgba(34,197,94,0.15)',   color: '#4ade80', border: 'rgba(34,197,94,0.3)'   },
  'Rejected':    { bg: 'rgba(239,68,68,0.15)',   color: '#f87171', border: 'rgba(239,68,68,0.3)'   },
};

const columns = ['Pending', 'Reviewed', 'Shortlisted', 'Rejected'];

const RecruiterDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [isBlindJob, setIsBlindJob] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [loadingApplicants, setLoadingApplicants] = useState(false);
  const [draggedId, setDraggedId] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchStats();
    fetchMyJobs();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API}/applications/recruiter/stats`, { withCredentials: true });
      setStats(res.data.stats);
    } catch (err) { console.error(err); }
  };

  const fetchMyJobs = async () => {
    try {
      const res = await axios.get(`${API}/jobs/myjobs`, { withCredentials: true });
      setJobs(res.data.jobs);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchApplicants = async (jobId, jobTitle) => {
    setLoadingApplicants(true);
    setSelectedJob(jobTitle);
    setActiveTab('applicants');
    try {
      const res = await axios.get(`${API}/applications/job/${jobId}`, { withCredentials: true });
      setApplicants(res.data.applications);
      setIsBlindJob(res.data.blindHiring || false);
    } catch (err) { console.error(err); }
    finally { setLoadingApplicants(false); }
  };

  const updateStatus = async (appId, status) => {
    setUpdatingId(appId);
    try {
      await axios.put(`${API}/applications/${appId}/status`, { status }, { withCredentials: true });
      setApplicants(prev => prev.map(a => a._id === appId ? { ...a, status } : a));
      toast.success('Moved to ' + status + ' ✅');
      fetchStats();
    } catch {
      toast.error('Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleLogout = async () => { await logout(); navigate('/login'); };
  const openResume = (url) => window.open(url, '_blank');
  const handleDragStart = (appId) => setDraggedId(appId);
  const handleDragEnd = () => { setDraggedId(null); setDragOverColumn(null); };

  const handleDropOnColumn = (status) => {
    if (draggedId) {
      const app = applicants.find(a => a._id === draggedId);
      if (app && app.status !== status) updateStatus(draggedId, status);
    }
    setDraggedId(null);
    setDragOverColumn(null);
  };

  const statCards = [
    { label: 'Jobs Posted',      value: stats?.totalJobs || 0,   icon: '💼', color: '#60a5fa' },
    { label: 'Total Applicants', value: stats?.total || 0,       icon: '👥', color: '#a78bfa' },
    { label: 'Shortlisted',      value: stats?.shortlisted || 0, icon: '✅', color: '#4ade80' },
    { label: 'Pending Review',   value: stats?.pending || 0,     icon: '⏳', color: '#fbbf24' },
  ];

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
        <span className="text-2xl font-black font-display text-white cursor-pointer" onClick={() => navigate('/')}>
          Hire<span className="text-blue-400">X</span>
        </span>
        <div className="flex items-center gap-4 flex-wrap">
          <span className="text-gray-400 text-sm">
            Hi, <span className="text-white font-semibold">{user?.name}</span>
            <span className="ml-2 text-xs px-2 py-1 rounded-full"
              style={{background: 'rgba(168,85,247,0.15)', color: '#c084fc', border: '1px solid rgba(168,85,247,0.3)'}}>
              recruiter
            </span>
          </span>
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

      <div className="max-w-7xl mx-auto px-6 py-10 relative z-10">

        <div className="flex items-center justify-between mb-10 flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-xl"
              style={{background: 'linear-gradient(135deg, #7c3aed, #3b82f6)'}}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl font-black font-display text-white">Recruiter Dashboard</h1>
              <p className="text-gray-400 text-sm">Manage your jobs and applicants</p>
            </div>
          </div>
          <button onClick={() => navigate('/post-job')}
            className="px-6 py-3 rounded-xl font-bold text-white text-sm transition-all"
            style={{background: 'linear-gradient(135deg, #3b82f6, #7c3aed)', boxShadow: '0 4px 15px rgba(59,130,246,0.3)'}}>
            + Post New Job
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {statCards.map((s, i) => (
            <div key={i} className="rounded-2xl p-5 tilt-3d"
              style={{background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)'}}>
              <div className="text-3xl mb-2">{s.icon}</div>
              <div className="text-3xl font-black mb-1" style={{color: s.color}}>{s.value}</div>
              <div className="text-gray-500 text-sm">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="flex gap-2 mb-6 p-1 rounded-xl w-fit"
          style={{background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)'}}>
          {['overview', 'applicants'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className="px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-all"
              style={activeTab === tab ? { background: 'linear-gradient(135deg, #3b82f6, #7c3aed)', color: 'white' } : { color: '#6b7280' }}>
              {tab === 'overview' ? '💼 My Jobs' : '🗂️ Pipeline' + (selectedJob ? ' — ' + selectedJob : '')}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          loading ? (
            <div className="flex justify-center py-20">
              <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-white text-xl font-bold mb-2">No jobs posted yet</h3>
              <p className="text-gray-400 mb-6">Post your first job to start receiving applications</p>
              <button onClick={() => navigate('/post-job')}
                className="px-6 py-3 rounded-xl font-semibold text-white text-sm"
                style={{background: 'linear-gradient(135deg, #3b82f6, #7c3aed)'}}>
                Post a Job →
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.map(job => (
                <div key={job._id} className="rounded-2xl p-6 flex items-center justify-between gap-4 flex-wrap tilt-3d"
                  style={{background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)'}}>
                  <div className="flex items-center gap-4">
                    <CompanyLogo company={job.company} size={48} />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-white font-bold">{job.title}</h3>
                        {job.blindHiring && (
                          <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                            style={{background: 'rgba(139,92,246,0.2)', color: '#c084fc', border: '1px solid rgba(139,92,246,0.3)'}}>
                            🙈 Blind
                          </span>
                        )}
                      </div>
                      <p className="text-gray-400 text-sm">{job.company} • {job.location}</p>
                      <div className="flex gap-3 mt-1 flex-wrap">
                        <span className="text-gray-500 text-xs">👥 {job.applications?.length || 0} applicants</span>
                        <span className="text-gray-500 text-xs">📅 {new Date(job.createdAt).toLocaleDateString('en-IN', {day:'numeric', month:'short'})}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full"
                          style={{
                            background: job.isActive ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                            color: job.isActive ? '#4ade80' : '#f87171'
                          }}>
                          {job.isActive ? 'Active' : 'Closed'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => fetchApplicants(job._id, job.title)}
                    className="px-5 py-2 rounded-xl text-sm font-semibold text-white transition-all flex-shrink-0"
                    style={{background: 'linear-gradient(135deg, #3b82f6, #7c3aed)', boxShadow: '0 4px 10px rgba(59,130,246,0.2)'}}>
                    View Pipeline →
                  </button>
                </div>
              ))}
            </div>
          )
        )}

        {activeTab === 'applicants' && (
          loadingApplicants ? (
            <div className="flex justify-center py-20">
              <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : applicants.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">👥</div>
              <h3 className="text-white text-xl font-bold mb-2">No applicants yet</h3>
              <p className="text-gray-400">Share the job link to attract candidates</p>
            </div>
          ) : (
            <div>
              {isBlindJob && (
                <div className="mb-4 px-4 py-3 rounded-xl flex items-center gap-3"
                  style={{background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.25)'}}>
                  <span className="text-lg">🙈</span>
                  <p className="text-purple-300 text-sm">
                    <span className="font-bold">Blind Hiring Mode is ON.</span> You see name, email, LinkedIn, GitHub, skills and resume only — photo, bio, education and experience are hidden to reduce unconscious bias.
                  </p>
                </div>
              )}

              <p className="text-gray-500 text-xs mb-4">
                💡 Drag a candidate card between columns to update their status
              </p>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pb-4">
                {columns.map(col => {
                  const colApplicants = applicants.filter(a => a.status === col);
                  const c = statusColors[col];
                  const isDragOver = dragOverColumn === col;

                  return (
                    <div key={col}
                      onDragOver={(e) => { e.preventDefault(); setDragOverColumn(col); }}
                      onDragLeave={() => setDragOverColumn(null)}
                      onDrop={() => handleDropOnColumn(col)}
                      className="rounded-2xl p-3 min-h-[200px] transition-all"
                      style={{
                        background: isDragOver ? c.bg : 'rgba(255,255,255,0.02)',
                        border: isDragOver ? `2px dashed ${c.color}` : '1px solid rgba(255,255,255,0.08)'
                      }}>

                      <div className="flex items-center justify-between mb-3 px-1">
                        <span className="text-sm font-bold" style={{color: c.color}}>{col}</span>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                          style={{background: c.bg, color: c.color, border: `1px solid ${c.border}`}}>
                          {colApplicants.length}
                        </span>
                      </div>

                      <div className="space-y-3">
                        {colApplicants.map(app => {
                          const showBlind = isBlindJob;

                          return (
                            <div key={app._id}
                              draggable
                              onDragStart={() => handleDragStart(app._id)}
                              onDragEnd={handleDragEnd}
                              className="rounded-xl p-4 cursor-grab active:cursor-grabbing transition-all"
                              style={{
                                background: showBlind ? 'rgba(139,92,246,0.06)' : 'rgba(255,255,255,0.04)',
                                border: showBlind ? '1px solid rgba(139,92,246,0.2)' : '1px solid rgba(255,255,255,0.08)',
                                opacity: draggedId === app._id ? 0.4 : 1,
                                position: 'relative'
                              }}>

                              {updatingId === app._id && (
                                <div className="absolute inset-0 rounded-xl flex items-center justify-center z-10"
                                  style={{background: 'rgba(2,8,23,0.75)', backdropFilter: 'blur(2px)'}}>
                                  <div className="flex flex-col items-center gap-2">
                                    <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                                    <span className="text-xs text-blue-400 font-medium">Updating...</span>
                                  </div>
                                </div>
                              )}

                              <div className="flex items-center gap-2 mb-2">
                                {showBlind ? (
                                  <div className="w-10 h-10 rounded-lg flex items-center justify-center text-purple-400 font-bold text-sm flex-shrink-0"
                                    style={{background: 'rgba(139,92,246,0.15)', border: '1px dashed rgba(139,92,246,0.4)'}}>
                                    {app.applicant?.name?.charAt(0).toUpperCase()}
                                  </div>
                                ) : app.applicant?.profilePicture ? (
                                  <img src={app.applicant.profilePicture} alt=""
                                    className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                                    style={{border: '1px solid rgba(59,130,246,0.4)'}}
                                  />
                                ) : (
                                  <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                                    style={{background: 'linear-gradient(135deg, #3b82f6, #7c3aed)'}}>
                                    {app.applicant?.name?.charAt(0).toUpperCase()}
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="text-white font-semibold text-xs truncate">{app.applicant?.name}</p>
                                  <p className="text-gray-500 text-xs truncate">{app.applicant?.email}</p>
                                  {showBlind && (
                                    <p className="text-xs" style={{color: 'rgba(196,132,252,0.6)'}}>🙈 Minimal profile mode</p>
                                  )}
                                </div>
                              </div>

                              {!showBlind && app.applicant?.bio && (
                                <p className="text-gray-500 text-xs mb-2 italic line-clamp-2">"{app.applicant.bio}"</p>
                              )}

                              {!showBlind && (app.applicant?.experience || app.applicant?.education) && (
                                <div className="mb-2">
                                  {app.applicant.experience && (
                                    <p className="text-gray-500 text-xs flex items-center gap-1">💼 {app.applicant.experience}</p>
                                  )}
                                  {app.applicant.education && (
                                    <p className="text-gray-500 text-xs flex items-center gap-1">🎓 {app.applicant.education}</p>
                                  )}
                                </div>
                              )}

                              {app.applicant?.skills?.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-2">
                                  {app.applicant.skills.slice(0, 3).map((skill, i) => (
                                    <span key={i} className="text-xs px-1.5 py-0.5 rounded"
                                      style={{background: 'rgba(59,130,246,0.1)', color: '#60a5fa'}}>
                                      {skill}
                                    </span>
                                  ))}
                                  {app.applicant.skills.length > 3 && (
                                    <span className="text-xs px-1.5 py-0.5 rounded"
                                      style={{background: 'rgba(255,255,255,0.05)', color: '#6b7280'}}>
                                      +{app.applicant.skills.length - 3}
                                    </span>
                                  )}
                                </div>
                              )}

                              {(app.applicant?.linkedin || app.applicant?.github) && (
                                <div className="flex flex-wrap gap-2 mb-2">
                                  {app.applicant.linkedin && (
                                    <a href={app.applicant.linkedin} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}
                                      className="text-xs px-2 py-0.5 rounded-lg transition"
                                      style={{background: 'rgba(59,130,246,0.1)', color: '#60a5fa'}}>
                                      💼 LinkedIn
                                    </a>
                                  )}
                                  {app.applicant.github && (
                                    <a href={app.applicant.github} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}
                                      className="text-xs px-2 py-0.5 rounded-lg transition"
                                      style={{background: 'rgba(255,255,255,0.05)', color: '#94a3b8'}}>
                                      🐙 GitHub
                                    </a>
                                  )}
                                </div>
                              )}

                              {app.coverLetter && (
                                <p className="text-gray-600 text-xs mb-2 italic line-clamp-2">
                                  "{app.coverLetter.slice(0, 80)}..."
                                </p>
                              )}

                              <div className="flex items-center justify-between mt-2 pt-2"
                                style={{borderTop: '1px solid rgba(255,255,255,0.06)'}}>
                                {app.resume ? (
                                  <button
                                    onClick={() => openResume(app.resume)}
                                    className="text-xs px-2 py-1 rounded-lg font-medium transition"
                                    style={{background: 'rgba(34,197,94,0.15)', color: '#4ade80'}}>
                                    📄 Resume
                                  </button>
                                ) : (
                                  <span className="text-xs text-gray-600">No resume</span>
                                )}
                                <span className="text-gray-600 text-xs">
                                  {new Date(app.createdAt).toLocaleDateString('en-IN', {day:'numeric', month:'short'})}
                                </span>
                              </div>
                            </div>
                          );
                        })}

                        {colApplicants.length === 0 && (
                          <div className="text-center py-8 text-gray-600 text-xs">
                            Drop a candidate here
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default RecruiterDashboard;
