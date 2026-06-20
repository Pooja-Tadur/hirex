import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ResumeGrader = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const runGrading = async () => {
    if (!user?.resume) {
      toast.error('Add a resume link to your profile first');
      navigate('/profile');
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const res = await axios.post(`${API}/ai/grade-resume`, {}, { withCredentials: true });
      setResult(res.data.result);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to grade resume');
    } finally {
      setLoading(false);
    }
  };

  const scoreColor = (score) => score >= 70 ? '#4ade80' : score >= 40 ? '#fbbf24' : '#f87171';

  return (
    <div className="min-h-screen relative text-white py-10 px-6" style={{ background: '#020817' }}>
      <div className="fixed inset-0 -z-10">
        <img src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=1920&auto=format&fit=crop"
          alt="" className="w-full h-full object-cover opacity-15" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(2,8,23,0.8) 0%, #020817 100%)' }}></div>
      </div>

      <div className="max-w-3xl mx-auto relative z-10">
        <button onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-8 transition">
          ← Back to Dashboard
        </button>

        <div className="mb-8 text-center">
          <h1 className="text-3xl font-black font-display text-white mb-2">🤖 AI Resume Grader</h1>
          <p className="text-gray-400">Get instant ATS-style feedback powered by AI</p>
        </div>

        <div className="rounded-3xl p-8 mb-6 tilt-3d text-center"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <p className="text-gray-400 text-sm mb-4">
            {user?.resume ? 'Using the resume linked on your profile.' : 'No resume found — add one to your profile first.'}
          </p>
          <button onClick={runGrading} disabled={loading}
            className="px-8 py-4 rounded-xl font-bold text-white text-sm transition-all"
            style={{ background: loading ? 'rgba(59,130,246,0.5)' : 'linear-gradient(135deg, #3b82f6, #7c3aed)', boxShadow: '0 8px 25px rgba(59,130,246,0.3)' }}>
            {loading ? '🧠 Analyzing your resume...' : '🚀 Analyze My Resume'}
          </button>
        </div>

        {result && (
          <div className="space-y-6">
            <div className="rounded-3xl p-8 text-center tilt-3d"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <p className="text-gray-400 text-sm mb-2">Overall Resume Score</p>
              <div className="text-6xl font-black font-display mb-2" style={{ color: scoreColor(result.score) }}>
                {result.score}<span className="text-2xl text-gray-500">/100</span>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed max-w-xl mx-auto">{result.summary}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-2xl p-6 tilt-3d" style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)' }}>
                <h3 className="text-green-400 font-bold mb-3">✅ Strengths</h3>
                <ul className="space-y-2">
                  {result.strengths?.map((s, i) => <li key={i} className="text-gray-300 text-sm">• {s}</li>)}
                </ul>
              </div>

              <div className="rounded-2xl p-6 tilt-3d" style={{ background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.2)' }}>
                <h3 className="text-yellow-400 font-bold mb-3">⚡ Improvements</h3>
                <ul className="space-y-2">
                  {result.improvements?.map((s, i) => <li key={i} className="text-gray-300 text-sm">• {s}</li>)}
                </ul>
              </div>
            </div>

            {result.missingKeywords?.length > 0 && (
              <div className="rounded-2xl p-6 tilt-3d" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}>
                <h3 className="text-red-400 font-bold mb-3">🔍 Missing Keywords</h3>
                <div className="flex flex-wrap gap-2">
                  {result.missingKeywords.map((k, i) => (
                    <span key={i} className="text-xs px-3 py-1.5 rounded-lg"
                      style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>
                      {k}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeGrader;