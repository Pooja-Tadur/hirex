import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import CompanyLogo from '../components/CompanyLogo';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const jobTypeColors = {
  'Full-time':  { bg: 'rgba(59,130,246,0.15)',  color: '#60a5fa', border: 'rgba(59,130,246,0.3)'  },
  'Internship': { bg: 'rgba(168,85,247,0.15)',  color: '#c084fc', border: 'rgba(168,85,247,0.3)'  },
  'Remote':     { bg: 'rgba(34,197,94,0.15)',   color: '#4ade80', border: 'rgba(34,197,94,0.3)'   },
  'Part-time':  { bg: 'rgba(251,146,60,0.15)',  color: '#fb923c', border: 'rgba(251,146,60,0.3)'  },
  'Contract':   { bg: 'rgba(251,191,36,0.15)',  color: '#fbbf24', border: 'rgba(251,191,36,0.3)'  },
};

const formatSalary = (min, max) => {
  if (!min && !max) return 'Not disclosed';
  if (max >= 100000) return `₹${(min/100000).toFixed(1)}L - ₹${(max/100000).toFixed(1)}L per year`;
  return `₹${min?.toLocaleString()} - ₹${max?.toLocaleString()} per month`;
};

const calculateMatch = (jobSkills, userSkills) => {
  if (!jobSkills?.length || !userSkills?.length) return 0;
  const jobSkillsLower = jobSkills.map(s => s.toLowerCase());
  const userSkillsLower = userSkills.map(s => s.toLowerCase());
  const matched = jobSkillsLower.filter(s => userSkillsLower.includes(s));
  return Math.round((matched.length / jobSkillsLower.length) * 100);
};

const JobDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [matchScore, setMatchScore] = useState(0);
  const [resumeMode, setResumeMode] = useState('upload');
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeLink, setResumeLink] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [aiInsight, setAiInsight] = useState(null);
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [interviewData, setInterviewData] = useState(null);
  const [loadingInterview, setLoadingInterview] = useState(false);
  const [showInterviewModal, setShowInterviewModal] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await axios.get(`${API}/jobs/${id}`);
        setJob(res.data.job);
        if (user?.skills?.length) {
          setMatchScore(calculateMatch(res.data.job.skills, user.skills));
        }
      } catch {
        toast.error('Job not found');
        navigate('/jobs');
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id]);

  const getAIInsight = async () => {
    setLoadingInsight(true);
    try {
      const res = await axios.post(`${API}/ai/semantic-match`, { jobId: id }, { withCredentials: true });
      setAiInsight(res.data.result);
    } catch {
      toast.error('Could not generate AI insight');
    } finally {
      setLoadingInsight(false);
    }
  };

  const getInterviewPrep = async () => {
    setLoadingInterview(true);
    setShowInterviewModal(true);
    try {
      const res = await axios.post(`${API}/ai/interview-prep`, { jobId: id }, { withCredentials: true });
      setInterviewData(res.data.result);
    } catch {
      toast.error('Could not generate interview prep');
      setShowInterviewModal(false);
    } finally {
      setLoadingInterview(false);
    }
  };

  const handleApply = () => {
    if (!user) {
      toast.error('Please login to apply');
      navigate('/login');
      return;
    }
    if (user.role === 'recruiter') {
      toast.error('Recruiters cannot apply to jobs');
      return;
    }
    setShowModal(true);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
      setResumeFile(file);
    } else {
      toast.error('Please upload a PDF file only');
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setResumeFile(file);
    } else {
      toast.error('Please upload a PDF file only');
    }
  };

  const submitApplication = async () => {
    if (resumeMode === 'upload' && !resumeFile) {
      toast.error('Please upload your resume PDF');
      return;
    }
    if (resumeMode === 'link' && !resumeLink.trim()) {
      toast.error('Please enter your resume link');
      return;
    }

    setApplying(true);
    let finalResumeUrl = resumeLink;

    try {
      if (resumeMode === 'upload' && resumeFile) {
        setUploading(true);
        toast.loading('Uploading resume...', { id: 'upload' });

        const formData = new FormData();
        formData.append('resume', resumeFile);

        const uploadRes = await axios.post(`${API}/upload/resume`, formData, {
          withCredentials: true,
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        if (!uploadRes.data.url) {
          toast.error('Resume upload failed. Please try again.', { id: 'upload' });
          setApplying(false);
          setUploading(false);
          return;
        }

        finalResumeUrl = uploadRes.data.url;
        toast.success('Resume uploaded! ✅', { id: 'upload' });
        setUploading(false);
      }

      if (!finalResumeUrl) {
        toast.error('Please upload your resume first');
        setApplying(false);
        return;
      }

      await axios.post(`${API}/applications/${id}`, { resume: finalResumeUrl, coverLetter }, { withCredentials: true });

      toast.success('Application submitted successfully! 🎉');
      setShowModal(false);
      setAlreadyApplied(true);
      setResumeFile(null);
      setResumeLink('');
      setCoverLetter('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to apply');
    } finally {
      setApplying(false);
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{background: '#020817'}}>
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!job) return null;

  const colors = jobTypeColors[job.jobType] || jobTypeColors['Full-time'];

  return (
    <div className="min-h-screen relative text-white py-10 px-6" style={{background: '#020817'}}>
      <div className="fixed inset-0 -z-10">
        <img
          src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1920&auto=format&fit=crop"
          alt=""
          className="w-full h-full object-cover opacity-10"
        />
        <div className="absolute inset-0" style={{background: 'linear-gradient(180deg, rgba(2,8,23,0.85) 0%, #020817 100%)'}}></div>
      </div>

      <div className="max-w-4xl mx-auto relative z-10">

        <button onClick={() => navigate('/jobs')}
          className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-8 transition">
          ← Back to Jobs
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <div className="lg:col-span-2 space-y-6">

            <div className="rounded-2xl p-8 tilt-3d"
              style={{background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)'}}>
              <div className="flex items-start gap-4 mb-6">
                <CompanyLogo company={job.company} size={64} rounded="rounded-2xl" />
                <div className="flex-1">
                  <h1 className="text-2xl font-black text-white font-display mb-1">{job.title}</h1>
                  <p className="text-blue-400 font-semibold text-lg">{job.company}</p>
                  <div className="flex flex-wrap gap-3 mt-3">
                    <span className="text-xs font-medium px-3 py-1 rounded-full"
                      style={{background: colors.bg, color: colors.color, border: `1px solid ${colors.border}`}}>
                      {job.jobType}
                    </span>
                    <span className="text-xs px-3 py-1 rounded-full"
                      style={{background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.08)'}}>
                      📍 {job.location}
                    </span>
                    <span className="text-xs px-3 py-1 rounded-full"
                      style={{background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.08)'}}>
                      💼 {job.experience}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 p-4 rounded-xl mb-4"
                style={{background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)'}}>
                <div className="text-center">
                  <div className="text-green-400 font-bold text-sm">{formatSalary(job.salary?.min, job.salary?.max)}</div>
                  <div className="text-gray-500 text-xs mt-1">Salary</div>
                </div>
                <div className="text-center"
                  style={{borderLeft: '1px solid rgba(255,255,255,0.06)', borderRight: '1px solid rgba(255,255,255,0.06)'}}>
                  <div className="text-white font-bold text-sm">{job.positions}</div>
                  <div className="text-gray-500 text-xs mt-1">Openings</div>
                </div>
                <div className="text-center">
                  <div className="text-white font-bold text-sm">{job.applications?.length || 0}</div>
                  <div className="text-gray-500 text-xs mt-1">Applicants</div>
                </div>
              </div>

              {user?.role === 'jobseeker' && user?.skills?.length > 0 && (
                <div className="p-4 rounded-xl"
                  style={{background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)'}}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400 text-sm font-semibold">🎯 Your Match Score</span>
                    <span className="text-sm font-black"
                      style={{color: matchScore >= 70 ? '#4ade80' : matchScore >= 40 ? '#fbbf24' : '#f87171'}}>
                      {matchScore}%
                    </span>
                  </div>
                  <div className="w-full rounded-full h-2 mb-2" style={{background: 'rgba(255,255,255,0.08)'}}>
                    <div className="h-2 rounded-full transition-all duration-500"
                      style={{
                        width: matchScore + '%',
                        background: matchScore >= 70
                          ? 'linear-gradient(90deg, #22c55e, #4ade80)'
                          : matchScore >= 40
                          ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
                          : 'linear-gradient(90deg, #ef4444, #f87171)'
                      }}>
                    </div>
                  </div>
                  <p className="text-gray-600 text-xs">
                    {matchScore >= 70 ? '🎯 Excellent match! You are highly qualified for this role.'
                      : matchScore >= 40 ? '⚡ Good match! You meet several requirements.'
                      : matchScore > 0 ? '📚 Low match. Consider building more required skills.'
                      : '💡 Add skills to your profile to see your match score!'}
                  </p>

                  {!aiInsight ? (
                    <button onClick={getAIInsight} disabled={loadingInsight}
                      className="w-full mt-3 py-2 rounded-lg text-xs font-semibold transition"
                      style={{background: 'rgba(124,58,237,0.1)', color: '#c084fc', border: '1px solid rgba(124,58,237,0.2)'}}>
                      {loadingInsight ? '🧠 Thinking...' : '🤖 Get AI Insight'}
                    </button>
                  ) : (
                    <div className="mt-3 p-3 rounded-lg" style={{background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.15)'}}>
                      <p className="text-purple-400 text-xs font-bold mb-1">🤖 AI Fit Score: {aiInsight.fitScore}%</p>
                      <p className="text-gray-300 text-xs mb-1">{aiInsight.verdict}</p>
                      <p className="text-gray-500 text-xs mb-2">{aiInsight.reasoning}</p>
                      <p className="text-purple-300 text-xs">💡 {aiInsight.suggestion}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="rounded-2xl p-8 tilt-3d"
              style={{background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)'}}>
              <h2 className="text-white font-bold text-lg font-display mb-4">Job Description</h2>
              <p className="text-gray-400 leading-relaxed">{job.description}</p>
            </div>

            <div className="rounded-2xl p-8 tilt-3d"
              style={{background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)'}}>
              <h2 className="text-white font-bold text-lg font-display mb-4">Required Skills</h2>
              <div className="flex flex-wrap gap-3">
                {job.skills?.map((skill, i) => {
                  const hasSkill = user?.skills?.map(s => s.toLowerCase()).includes(skill.toLowerCase());
                  return (
                    <span key={i} className="px-4 py-2 rounded-xl text-sm font-medium"
                      style={{
                        background: hasSkill ? 'rgba(34,197,94,0.15)' : 'rgba(59,130,246,0.1)',
                        color: hasSkill ? '#4ade80' : '#60a5fa',
                        border: hasSkill ? '1px solid rgba(34,197,94,0.3)' : '1px solid rgba(59,130,246,0.2)'
                      }}>
                      {hasSkill ? '✓ ' : ''}{skill}
                    </span>
                  );
                })}
              </div>
              {user?.role === 'jobseeker' && (
                <p className="text-gray-600 text-xs mt-3">✅ Green skills = skills you have on your profile</p>
              )}
            </div>
          </div>

          <div>
            <div className="rounded-2xl p-6 sticky top-24 tilt-3d"
              style={{background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)'}}>
              <div className="text-green-400 font-bold text-xl mb-1">
                {formatSalary(job.salary?.min, job.salary?.max)}
              </div>
              <p className="text-gray-500 text-xs mb-6">Estimated salary range</p>

              {alreadyApplied ? (
                <div className="w-full py-3 rounded-xl text-center text-sm font-semibold mb-3"
                  style={{background: 'rgba(34,197,94,0.1)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.3)'}}>
                  ✅ Application Submitted
                </div>
              ) : user?.role !== 'recruiter' ? (
                <button onClick={handleApply}
                  className="w-full py-4 rounded-xl font-bold text-white text-sm mb-3 transition-all"
                  style={{background: 'linear-gradient(135deg, #3b82f6, #7c3aed)', boxShadow: '0 8px 25px rgba(59,130,246,0.3)'}}>
                  🚀 Apply Now
                </button>
              ) : (
                <div className="w-full py-3 rounded-xl text-center text-xs text-gray-500 mb-3"
                  style={{background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)'}}>
                  You posted this job as a recruiter
                </div>
              )}

              <button className="w-full py-3 rounded-xl font-semibold text-sm mb-3"
                style={{background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.08)'}}>
                🔖 Save Job
              </button>

              {user?.role !== 'recruiter' && (
                <button onClick={getInterviewPrep}
                  className="w-full py-3 rounded-xl font-semibold text-sm transition-all"
                  style={{background: 'rgba(124,58,237,0.1)', color: '#c084fc', border: '1px solid rgba(124,58,237,0.2)'}}>
                  🎤 AI Interview Prep
                </button>
              )}

              <div className="mt-6 space-y-3 pt-6" style={{borderTop: '1px solid rgba(255,255,255,0.06)'}}>
                {[
                  { label: 'Posted by', value: job.postedBy?.name },
                  { label: 'Posted on', value: new Date(job.createdAt).toLocaleDateString('en-IN', {day:'numeric', month:'short', year:'numeric'}) },
                  { label: 'Positions', value: `${job.positions} opening${job.positions > 1 ? 's' : ''}` },
                ].map((item, i) => (
                  <div key={i} className="flex justify-between">
                    <span className="text-gray-500 text-xs">{item.label}</span>
                    <span className="text-gray-300 text-xs font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)'}}>
          <div className="w-full max-w-lg rounded-3xl p-8"
            style={{ background: '#0a1628', border: '1px solid rgba(255,255,255,0.1)', maxHeight: '90vh', overflowY: 'auto' }}>

            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-white font-black text-xl font-display">Apply for Job</h3>
                <p className="text-gray-400 text-sm mt-1">{job.title} at {job.company}</p>
              </div>
              <button onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-white text-2xl transition w-8 h-8 flex items-center justify-center rounded-lg"
                style={{background: 'rgba(255,255,255,0.05)'}}>×</button>
            </div>

            {matchScore > 0 && (
              <div className="mb-6 p-4 rounded-xl"
                style={{
                  background: matchScore >= 70 ? 'rgba(34,197,94,0.1)' : matchScore >= 40 ? 'rgba(251,191,36,0.1)' : 'rgba(239,68,68,0.1)',
                  border: matchScore >= 70 ? '1px solid rgba(34,197,94,0.2)' : matchScore >= 40 ? '1px solid rgba(251,191,36,0.2)' : '1px solid rgba(239,68,68,0.2)'
                }}>
                <p className="text-sm font-semibold"
                  style={{color: matchScore >= 70 ? '#4ade80' : matchScore >= 40 ? '#fbbf24' : '#f87171'}}>
                  🎯 You match {matchScore}% of required skills
                </p>
              </div>
            )}

            <div className="mb-6">
              <label className="block text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wider">Resume *</label>

              <div className="flex gap-2 mb-4 p-1 rounded-xl"
                style={{background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)'}}>
                <button
                  onClick={() => { setResumeMode('upload'); setResumeLink(''); }}
                  className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all"
                  style={resumeMode === 'upload' ? { background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: 'white' } : { color: '#6b7280' }}>
                  📁 Upload PDF
                </button>
                <button
                  onClick={() => { setResumeMode('link'); setResumeFile(null); }}
                  className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all"
                  style={resumeMode === 'link' ? { background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: 'white' } : { color: '#6b7280' }}>
                  🔗 Paste Link
                </button>
              </div>

              {resumeMode === 'upload' && (
                <div>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    className="rounded-2xl p-8 text-center cursor-pointer transition-all"
                    style={{
                      border: dragOver ? '2px dashed #3b82f6' : resumeFile ? '2px dashed #4ade80' : '2px dashed rgba(255,255,255,0.12)',
                      background: dragOver ? 'rgba(59,130,246,0.08)' : resumeFile ? 'rgba(34,197,94,0.05)' : 'rgba(255,255,255,0.02)',
                    }}>
                    {resumeFile ? (
                      <div>
                        <div className="text-4xl mb-3">📄</div>
                        <p className="text-green-400 font-semibold text-sm">{resumeFile.name}</p>
                        <p className="text-gray-500 text-xs mt-1">{(resumeFile.size / 1024 / 1024).toFixed(2)} MB</p>
                        <button onClick={(e) => { e.stopPropagation(); setResumeFile(null); }}
                          className="mt-3 text-xs text-red-400 hover:text-red-300 transition">
                          Remove file ×
                        </button>
                      </div>
                    ) : (
                      <div>
                        <div className="text-4xl mb-3">☁️</div>
                        <p className="text-white font-semibold text-sm mb-1">Drag & drop your resume here</p>
                        <p className="text-gray-500 text-xs mb-3">or click to browse</p>
                        <span className="text-xs px-3 py-1 rounded-full"
                          style={{background: 'rgba(59,130,246,0.1)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.2)'}}>
                          PDF only • Max 5MB
                        </span>
                      </div>
                    )}
                  </div>
                  <input ref={fileInputRef} type="file" accept=".pdf" onChange={handleFileSelect} className="hidden" />
                </div>
              )}

              {resumeMode === 'link' && (
                <div>
                  <input
                    type="url"
                    placeholder="https://drive.google.com/file/your-resume"
                    value={resumeLink}
                    onChange={e => setResumeLink(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none transition-all"
                    style={{background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)'}}
                    onFocus={e => e.target.style.border = '1px solid rgba(59,130,246,0.6)'}
                    onBlur={e => e.target.style.border = '1px solid rgba(255,255,255,0.08)'}
                  />
                  <p className="text-gray-600 text-xs mt-2">
                    💡 Upload to Google Drive → Share → Anyone with link → Copy → Paste here
                  </p>
                </div>
              )}
            </div>

            <div className="mb-6">
              <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">
                Cover Letter <span className="text-gray-600 normal-case font-normal">(optional)</span>
              </label>
              <textarea
                placeholder="Tell the recruiter why you're a great fit..."
                value={coverLetter}
                onChange={e => setCoverLetter(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none transition-all"
                style={{background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', resize: 'none'}}
                onFocus={e => e.target.style.border = '1px solid rgba(59,130,246,0.6)'}
                onBlur={e => e.target.style.border = '1px solid rgba(255,255,255,0.08)'}
              />
            </div>

            {uploading && (
              <div className="mb-4 px-4 py-3 rounded-xl flex items-center gap-3"
                style={{background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)'}}>
                <svg className="animate-spin h-4 w-4 text-blue-400 flex-shrink-0" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                <span className="text-blue-400 text-sm">Uploading resume to cloud...</span>
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => setShowModal(false)}
                className="flex-1 py-3 rounded-xl font-semibold text-sm text-gray-400 transition"
                style={{background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)'}}>
                Cancel
              </button>
              <button onClick={submitApplication} disabled={applying}
                className="flex-1 py-3 rounded-xl font-bold text-white text-sm transition-all"
                style={{background: 'linear-gradient(135deg, #3b82f6, #7c3aed)'}}>
                {applying ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Submitting...
                  </span>
                ) : '🚀 Submit Application'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showInterviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)'}}>
          <div className="w-full max-w-2xl rounded-3xl p-8"
            style={{ background: '#0a1628', border: '1px solid rgba(255,255,255,0.1)', maxHeight: '85vh', overflowY: 'auto' }}>

            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-white font-black text-xl font-display flex items-center gap-2">
                  🎤 AI Interview Prep
                </h3>
                <p className="text-gray-400 text-sm mt-1">{job.title} at {job.company}</p>
              </div>
              <button onClick={() => setShowInterviewModal(false)}
                className="text-gray-500 hover:text-white text-2xl transition w-8 h-8 flex items-center justify-center rounded-lg"
                style={{background: 'rgba(255,255,255,0.05)'}}>×</button>
            </div>

            {loadingInterview ? (
              <div className="flex flex-col items-center justify-center py-16 gap-4">
                <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-400 text-sm">Generating tailored interview questions...</p>
              </div>
            ) : interviewData ? (
              <div className="space-y-4">
                {interviewData.generalTip && (
                  <div className="p-4 rounded-xl mb-2"
                    style={{background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)'}}>
                    <p className="text-purple-300 text-sm">💡 <span className="font-semibold">Tip:</span> {interviewData.generalTip}</p>
                  </div>
                )}

                {interviewData.questions?.map((q, i) => (
                  <div key={i} className="rounded-xl p-5"
                    style={{background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)'}}>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <p className="text-white font-semibold text-sm flex-1">
                        {i + 1}. {q.question}
                      </p>
                      <span className="text-xs px-2 py-1 rounded-full flex-shrink-0"
                        style={{
                          background: q.type === 'Technical' ? 'rgba(59,130,246,0.15)' : 'rgba(34,197,94,0.15)',
                          color: q.type === 'Technical' ? '#60a5fa' : '#4ade80'
                        }}>
                        {q.type}
                      </span>
                    </div>
                    <div className="pl-4" style={{borderLeft: '2px solid rgba(124,58,237,0.3)'}}>
                      <p className="text-gray-400 text-xs leading-relaxed">
                        <span className="text-purple-400 font-semibold">Model answer: </span>
                        {q.modelAnswer}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-10">No data generated. Please try again.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDetail;