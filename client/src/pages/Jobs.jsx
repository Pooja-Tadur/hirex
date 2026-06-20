import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import CompanyLogo from '../components/CompanyLogo';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const jobTypeColors = {
  'Full-time': { bg: 'rgba(59,130,246,0.15)', color: '#60a5fa', border: 'rgba(59,130,246,0.3)' },
  'Internship': { bg: 'rgba(168,85,247,0.15)', color: '#c084fc', border: 'rgba(168,85,247,0.3)' },
  'Remote': { bg: 'rgba(34,197,94,0.15)', color: '#4ade80', border: 'rgba(34,197,94,0.3)' },
  'Part-time': { bg: 'rgba(251,146,60,0.15)', color: '#fb923c', border: 'rgba(251,146,60,0.3)' },
  'Contract': { bg: 'rgba(251,191,36,0.15)', color: '#fbbf24', border: 'rgba(251,191,36,0.3)' },
};

const formatSalary = (min, max) => {
  if (!min && !max) return 'Not disclosed';
  if (max >= 100000) return `₹${(min/100000).toFixed(1)}L - ₹${(max/100000).toFixed(1)}L/yr`;
  return `₹${min?.toLocaleString()} - ₹${max?.toLocaleString()}/mo`;
};

const timeAgo = (date) => {
  const diff = Math.floor((new Date() - new Date(date)) / 1000);
  if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
  return `${Math.floor(diff/86400)}d ago`;
};

const calculateMatch = (jobSkills, userSkills) => {
  if (!jobSkills?.length || !userSkills?.length) return 0;
  const jobSkillsLower = jobSkills.map(s => s.toLowerCase());
  const userSkillsLower = userSkills.map(s => s.toLowerCase());
  const matched = jobSkillsLower.filter(s => userSkillsLower.includes(s));
  return Math.round((matched.length / jobSkillsLower.length) * 100);
};

const JobCard = ({ job, onClick, userSkills }) => {
  const colors = jobTypeColors[job.jobType] || jobTypeColors['Full-time'];
  const matchScore = calculateMatch(job.skills, userSkills);

  return (
    <div onClick={onClick} className="group cursor-pointer rounded-2xl p-6 transition-all duration-300 tilt-3d"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
      onMouseEnter={e => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
        e.currentTarget.style.border = '1px solid rgba(59,130,246,0.3)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
        e.currentTarget.style.border = '1px solid rgba(255,255,255,0.08)';
      }}>

      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <CompanyLogo company={job.company} size={48} />
          <div>
            <h3 className="text-white font-bold text-base leading-tight font-display">{job.title}</h3>
            <p className="text-gray-400 text-sm">{job.company}</p>
          </div>
        </div>
        <span className="text-xs font-medium px-3 py-1 rounded-full flex-shrink-0"
          style={{background: colors.bg, color: colors.color, border: `1px solid ${colors.border}`}}>
          {job.jobType}
        </span>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <span className="text-gray-400 text-xs">📍 {job.location}</span>
        <span className="text-gray-400 text-xs">💼 {job.experience}</span>
        <span className="text-gray-400 text-xs">👥 {job.positions} position{job.positions > 1 ? 's' : ''}</span>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {job.skills?.slice(0, 3).map((skill, i) => (
          <span key={i} className="text-xs px-2 py-1 rounded-lg"
            style={{background: 'rgba(255,255,255,0.06)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.08)'}}>
            {skill}
          </span>
        ))}
        {job.skills?.length > 3 && (
          <span className="text-xs px-2 py-1 rounded-lg"
            style={{background: 'rgba(255,255,255,0.06)', color: '#94a3b8'}}>
            +{job.skills.length - 3} more
          </span>
        )}
      </div>

      <div className="flex items-center justify-between pt-4"
        style={{borderTop: '1px solid rgba(255,255,255,0.06)'}}>
        <div className="flex items-center gap-3">
          <span className="text-green-400 font-semibold text-sm">
            {formatSalary(job.salary?.min, job.salary?.max)}
          </span>
          {matchScore > 0 && (
            <span className="text-xs font-bold px-2 py-1 rounded-lg"
              style={{
                background: matchScore >= 70 ? 'rgba(34,197,94,0.15)' : matchScore >= 40 ? 'rgba(251,191,36,0.15)' : 'rgba(239,68,68,0.15)',
                color: matchScore >= 70 ? '#4ade80' : matchScore >= 40 ? '#fbbf24' : '#f87171'
              }}>
              {matchScore}% match
            </span>
          )}
        </div>
        <span className="text-gray-600 text-xs">{timeAgo(job.createdAt)}</span>
      </div>
    </div>
  );
};

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({ keyword: '', location: '', jobType: '', experience: '' });
  const [applied, setApplied] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const fetchJobs = async (pageNum = 1, currentFilters = filters) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pageNum,
        limit: 9,
        ...Object.fromEntries(Object.entries(currentFilters).filter(([_, v]) => v))
      });
      const res = await axios.get(`${API}/jobs?${params}`);
      setJobs(res.data.jobs);
      setTotal(res.data.total);
      setPages(res.data.pages);
      setCurrentPage(res.data.currentPage);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const keyword = params.get('keyword') || '';
    const initialFilters = { ...filters, keyword };
    setFilters(initialFilters);
    if (keyword) setApplied(true);
    fetchJobs(1, initialFilters);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setApplied(true);
    fetchJobs(1, filters);
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    setApplied(Object.values(newFilters).some(v => v));
    fetchJobs(1, newFilters);
  };

  const clearFilters = () => {
    const empty = { keyword: '', location: '', jobType: '', experience: '' };
    setFilters(empty);
    setApplied(false);
    fetchJobs(1, empty);
  };

  return (
    <div className="min-h-screen relative text-white" style={{background: '#020817'}}>
      <div className="fixed inset-0 -z-10">
        <img
          src="https://images.unsplash.com/photo-1551434678-e076c223a692?q=80&w=1920&auto=format&fit=crop"
          alt=""
          className="w-full h-full object-cover opacity-10"
        />
        <div className="absolute inset-0" style={{background: 'linear-gradient(180deg, rgba(2,8,23,0.85) 0%, #020817 100%)'}}></div>
      </div>

      <div className="relative py-12 px-6 overflow-hidden z-10">
        <img
          src="https://images.unsplash.com/photo-1551434678-e076c223a692?q=80&w=1600&auto=format&fit=crop"
          alt="Workspace"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0"
          style={{background: 'linear-gradient(180deg, rgba(2,8,23,0.85) 0%, rgba(2,8,23,0.75) 50%, #020817 100%)'}}>
        </div>

        <div className="max-w-4xl mx-auto relative z-10">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-black font-display text-white mb-3">
              Find Your <span style={{
                background: 'linear-gradient(90deg, #60a5fa, #a78bfa)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>Perfect Job</span>
            </h1>
            <p className="text-gray-300 mb-4">{total} jobs available right now</p>

            {/* ✅ SALARY INSIGHTS BUTTON — added here */}
            <button
              onClick={() => navigate('/salary-insights')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, rgba(34,197,94,0.15), rgba(16,185,129,0.1))',
                border: '1px solid rgba(34,197,94,0.3)',
                color: '#4ade80',
                boxShadow: '0 4px 15px rgba(34,197,94,0.1)'
              }}>
              💰 View Salary Insights
            </button>
          </div>

          <form onSubmit={handleSearch}>
            <div className="flex flex-col sm:flex-row gap-3 p-2 rounded-2xl"
              style={{background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)'}}>
              <div className="relative flex-1">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">🔍</span>
                <input
                  type="text"
                  placeholder="Job title, skills or company..."
                  value={filters.keyword}
                  onChange={e => setFilters({...filters, keyword: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-white text-sm placeholder-gray-400 focus:outline-none"
                  style={{background: 'transparent'}}
                />
              </div>
              <div className="relative sm:w-48">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">📍</span>
                <input
                  type="text"
                  placeholder="Location..."
                  value={filters.location}
                  onChange={e => setFilters({...filters, location: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-white text-sm placeholder-gray-400 focus:outline-none"
                  style={{background: 'transparent'}}
                />
              </div>
              <button type="submit"
                className="px-8 py-3 rounded-xl font-bold text-white text-sm transition-all"
                style={{background: 'linear-gradient(135deg, #3b82f6, #7c3aed)', boxShadow: '0 4px 15px rgba(59,130,246,0.3)'}}>
                Search Jobs
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 relative z-10">
        <div className="flex gap-8">

          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24 rounded-2xl p-6"
              style={{background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)'}}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-white font-bold font-display">Filters</h3>
                {applied && (
                  <button onClick={clearFilters}
                    className="text-xs text-blue-400 hover:text-blue-300 transition">
                    Clear all
                  </button>
                )}
              </div>

              <div className="mb-6">
                <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">Job Type</p>
                <div className="space-y-2">
                  {['Full-time', 'Part-time', 'Internship', 'Remote', 'Contract'].map(type => (
                    <label key={type} className="flex items-center gap-3 cursor-pointer group">
                      <input type="radio" name="jobType"
                        checked={filters.jobType === type}
                        onChange={() => handleFilterChange('jobType', filters.jobType === type ? '' : type)}
                        className="accent-blue-500"
                      />
                      <span className="text-gray-400 text-sm group-hover:text-white transition">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">Experience</p>
                <div className="space-y-2">
                  {['Fresher', '1-2 years', '2-5 years', '5+ years'].map(exp => (
                    <label key={exp} className="flex items-center gap-3 cursor-pointer group">
                      <input type="radio" name="experience"
                        checked={filters.experience === exp}
                        onChange={() => handleFilterChange('experience', filters.experience === exp ? '' : exp)}
                        className="accent-blue-500"
                      />
                      <span className="text-gray-400 text-sm group-hover:text-white transition">{exp}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* ✅ SALARY INSIGHTS in sidebar too */}
              <div style={{borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '20px'}}>
                <button
                  onClick={() => navigate('/salary-insights')}
                  className="w-full py-3 rounded-xl text-sm font-semibold transition-all"
                  style={{
                    background: 'linear-gradient(135deg, rgba(34,197,94,0.1), rgba(16,185,129,0.08))',
                    border: '1px solid rgba(34,197,94,0.2)',
                    color: '#4ade80'
                  }}>
                  💰 Salary Insights →
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <p className="text-gray-400 text-sm">
                Showing <span className="text-white font-semibold">{jobs.length}</span> of <span className="text-white font-semibold">{total}</span> jobs
              </p>
              <div className="flex gap-2 flex-wrap">
                {Object.entries(filters).filter(([_, v]) => v).map(([k, v]) => (
                  <span key={k} className="text-xs px-3 py-1 rounded-full flex items-center gap-1"
                    style={{background: 'rgba(59,130,246,0.15)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.3)'}}>
                    {v}
                    <button onClick={() => handleFilterChange(k, '')} className="ml-1 hover:text-white">×</button>
                  </span>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="rounded-2xl p-6 animate-pulse"
                    style={{background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', height: '220px'}}>
                  </div>
                ))}
              </div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-white text-xl font-bold mb-2">No jobs found</h3>
                <p className="text-gray-400 mb-4">Try adjusting your search or filters</p>
                <button onClick={clearFilters}
                  className="px-6 py-2 rounded-xl text-sm font-semibold text-blue-400 transition"
                  style={{background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)'}}>
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {jobs.map(job => (
                  <JobCard
                    key={job._id}
                    job={job}
                    userSkills={user?.skills || []}
                    onClick={() => navigate(`/jobs/${job._id}`)}
                  />
                ))}
              </div>
            )}

            {pages > 1 && (
              <div className="flex justify-center gap-2 mt-10">
                {[...Array(pages)].map((_, i) => (
                  <button key={i}
                    onClick={() => fetchJobs(i + 1)}
                    className="w-10 h-10 rounded-xl text-sm font-semibold transition-all"
                    style={currentPage === i + 1 ? {
                      background: 'linear-gradient(135deg, #3b82f6, #7c3aed)',
                      color: 'white'
                    } : {
                      background: 'rgba(255,255,255,0.05)',
                      color: '#6b7280',
                      border: '1px solid rgba(255,255,255,0.08)'
                    }}>
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Jobs;