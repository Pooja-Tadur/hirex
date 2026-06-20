import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const formatLakhs = (num) => `₹${(num / 100000).toFixed(1)}L`;

const SalaryInsights = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('role');

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const res = await axios.get(`${API}/jobs/salary-insights`);
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchInsights();
  }, []);

  const expOrder = ['Fresher', '1-2 years', '2-5 years', '5+ years'];
  const sortedExperience = data?.byExperience
    ? [...data.byExperience].sort((a, b) => expOrder.indexOf(a.experience) - expOrder.indexOf(b.experience))
    : [];

  const currentList = view === 'role' ? data?.byRole : view === 'experience' ? sortedExperience : data?.byCompany;
  const maxValue = currentList?.length ? Math.max(...currentList.map(d => d.max)) : 1;

  return (
    <div className="min-h-screen relative text-white py-10 px-6" style={{ background: '#020817' }}>
      <div className="fixed inset-0 -z-10">
        <img
          src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1920&auto=format&fit=crop"
          alt=""
          className="w-full h-full object-cover opacity-15"
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(2,8,23,0.8) 0%, #020817 100%)' }}></div>
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        <button onClick={() => navigate('/jobs')}
          className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-8 transition">
          ← Back to Jobs
        </button>

        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-black font-display text-white mb-3">
            💰 Salary <span style={{
              background: 'linear-gradient(135deg, #60a5fa, #c084fc)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
            }}>Insights</span>
          </h1>
          <p className="text-gray-400 text-sm md:text-base">
            Real salary ranges from live job listings — filter by role, experience, or company
          </p>
        </div>

        <div className="flex gap-2 mb-8 p-1 rounded-xl w-fit mx-auto"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
          {[
            { key: 'role', label: '💼 By Role' },
            { key: 'experience', label: '📈 By Experience' },
            { key: 'company', label: '🏢 By Company' },
          ].map(tab => (
            <button key={tab.key} onClick={() => setView(tab.key)}
              className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
              style={view === tab.key ? { background: 'linear-gradient(135deg, #3b82f6, #7c3aed)', color: 'white' } : { color: '#6b7280' }}>
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : !currentList?.length ? (
          <div className="text-center py-20 text-gray-400">No salary data available yet.</div>
        ) : (
          <div className="space-y-4">
            {currentList.map((item, i) => {
              const label = view === 'role' ? item.title : view === 'experience' ? item.experience : item.company;
              const minPct = (item.min / maxValue) * 100;
              const maxPct = (item.max / maxValue) * 100;

              return (
                <div key={i} className="rounded-2xl p-5 tilt-3d"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                    <h3 className="text-white font-bold font-display">{label}</h3>
                    <div className="flex items-center gap-3">
                      <span className="text-xs px-3 py-1 rounded-full"
                        style={{ background: 'rgba(59,130,246,0.1)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.2)' }}>
                        {item.count} {item.count === 1 ? 'job' : 'jobs'}
                      </span>
                      <span className="text-green-400 font-bold text-sm">
                        {formatLakhs(item.min)} – {formatLakhs(item.max)}
                      </span>
                    </div>
                  </div>

                  <div className="relative w-full h-3 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <div className="absolute h-full rounded-full transition-all duration-500"
                      style={{
                        left: `${minPct}%`,
                        width: `${maxPct - minPct}%`,
                        background: 'linear-gradient(90deg, #3b82f6, #7c3aed)'
                      }}>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-10 p-5 rounded-2xl text-center" style={{ background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.15)' }}>
          <p className="text-purple-300 text-sm">
            💡 Data is calculated live from {data ? (data.byRole?.reduce((sum, r) => sum + r.count, 0) || 0) : 0} active job listings on HireX.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SalaryInsights;