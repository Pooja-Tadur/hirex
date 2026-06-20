import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const PostJob = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [formData, setFormData] = useState({
    title: '', description: '', company: '',
    location: '', jobType: 'Full-time',
    salaryMin: '', salaryMax: '',
    skills: [], experience: 'Fresher',
    positions: 1, blindHiring: false
  });

  const handleChange = (e) => setFormData({...formData, [e.target.name]: e.target.value});

  const addSkill = (e) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault();
      if (!formData.skills.includes(skillInput.trim())) {
        setFormData({...formData, skills: [...formData.skills, skillInput.trim()]});
      }
      setSkillInput('');
    }
  };

  const removeSkill = (skill) => setFormData({...formData, skills: formData.skills.filter(s => s !== skill)});

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.skills.length === 0) { toast.error('Add at least one skill'); return; }
    setLoading(true);
    try {
      await axios.post(`${API}/jobs`, {
        title: formData.title,
        description: formData.description,
        company: formData.company,
        location: formData.location,
        jobType: formData.jobType,
        salary: { min: Number(formData.salaryMin), max: Number(formData.salaryMax) },
        skills: formData.skills,
        experience: formData.experience,
        positions: Number(formData.positions),
        blindHiring: formData.blindHiring,
      }, { withCredentials: true });
      toast.success('Job posted successfully! 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post job');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' };
  const inputClass = "w-full px-4 py-3 rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none transition-all";

  return (
    <div className="min-h-screen relative text-white py-10 px-6" style={{background: '#020817'}}>
      <div className="fixed inset-0 -z-10">
        <img src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1920&auto=format&fit=crop"
          alt="" className="w-full h-full object-cover opacity-20" />
        <div className="absolute inset-0" style={{background: 'linear-gradient(180deg, rgba(2,8,23,0.75) 0%, #020817 100%)'}}></div>
      </div>

      <div className="max-w-3xl mx-auto relative z-10">
        <button onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-8 transition">
          ← Back to Dashboard
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-black font-display text-white mb-2">Post a New Job</h1>
          <p className="text-gray-400">Fill in the details to attract the right candidates</p>
        </div>

        <div className="rounded-3xl p-8 tilt-3d"
          style={{background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)'}}>
          <form onSubmit={handleSubmit} className="space-y-6">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Job Title *</label>
                <input name="title" value={formData.title} onChange={handleChange}
                  placeholder="e.g. Frontend Developer" required
                  className={inputClass} style={inputStyle}
                  onFocus={e => e.target.style.border = '1px solid rgba(59,130,246,0.6)'}
                  onBlur={e => e.target.style.border = '1px solid rgba(255,255,255,0.08)'}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Company Name *</label>
                <input name="company" value={formData.company} onChange={handleChange}
                  placeholder="e.g. Google" required
                  className={inputClass} style={inputStyle}
                  onFocus={e => e.target.style.border = '1px solid rgba(59,130,246,0.6)'}
                  onBlur={e => e.target.style.border = '1px solid rgba(255,255,255,0.08)'}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Location *</label>
                <input name="location" value={formData.location} onChange={handleChange}
                  placeholder="e.g. Bangalore / Remote" required
                  className={inputClass} style={inputStyle}
                  onFocus={e => e.target.style.border = '1px solid rgba(59,130,246,0.6)'}
                  onBlur={e => e.target.style.border = '1px solid rgba(255,255,255,0.08)'}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Job Type *</label>
                <select name="jobType" value={formData.jobType} onChange={handleChange}
                  className={inputClass} style={{...inputStyle, color: 'white'}}>
                  {['Full-time','Part-time','Internship','Remote','Contract'].map(t => (
                    <option key={t} value={t} style={{background: '#0a1628'}}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Min Salary (₹)</label>
                <input name="salaryMin" type="number" value={formData.salaryMin} onChange={handleChange}
                  placeholder="e.g. 500000" className={inputClass} style={inputStyle}
                  onFocus={e => e.target.style.border = '1px solid rgba(59,130,246,0.6)'}
                  onBlur={e => e.target.style.border = '1px solid rgba(255,255,255,0.08)'}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Max Salary (₹)</label>
                <input name="salaryMax" type="number" value={formData.salaryMax} onChange={handleChange}
                  placeholder="e.g. 1000000" className={inputClass} style={inputStyle}
                  onFocus={e => e.target.style.border = '1px solid rgba(59,130,246,0.6)'}
                  onBlur={e => e.target.style.border = '1px solid rgba(255,255,255,0.08)'}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Experience *</label>
                <select name="experience" value={formData.experience} onChange={handleChange}
                  className={inputClass} style={{...inputStyle, color: 'white'}}>
                  {['Fresher','1-2 years','2-5 years','5+ years'].map(e => (
                    <option key={e} value={e} style={{background: '#0a1628'}}>{e}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">No. of Positions *</label>
                <input name="positions" type="number" min="1" value={formData.positions} onChange={handleChange}
                  className={inputClass} style={inputStyle}
                  onFocus={e => e.target.style.border = '1px solid rgba(59,130,246,0.6)'}
                  onBlur={e => e.target.style.border = '1px solid rgba(255,255,255,0.08)'}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">
                Required Skills * <span className="text-gray-600 normal-case">(Press Enter to add)</span>
              </label>
              <input value={skillInput} onChange={e => setSkillInput(e.target.value)}
                onKeyDown={addSkill} placeholder="Type a skill and press Enter..."
                className={inputClass} style={inputStyle}
                onFocus={e => e.target.style.border = '1px solid rgba(59,130,246,0.6)'}
                onBlur={e => e.target.style.border = '1px solid rgba(255,255,255,0.08)'}
              />
              {formData.skills.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {formData.skills.map((skill, i) => (
                    <span key={i} className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-xl"
                      style={{background: 'rgba(59,130,246,0.15)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.3)'}}>
                      {skill}
                      <button type="button" onClick={() => removeSkill(skill)} className="hover:text-white transition text-xs">×</button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Job Description *</label>
              <textarea name="description" value={formData.description} onChange={handleChange}
                placeholder="Describe the role, responsibilities, requirements..."
                required rows={5} className={inputClass} style={{...inputStyle, resize: 'none'}}
                onFocus={e => e.target.style.border = '1px solid rgba(59,130,246,0.6)'}
                onBlur={e => e.target.style.border = '1px solid rgba(255,255,255,0.08)'}
              />
            </div>

            {/* ✅ BLIND HIRING TOGGLE */}
            <div className="rounded-2xl p-5 transition-all"
              style={{
                background: formData.blindHiring ? 'rgba(139,92,246,0.08)' : 'rgba(255,255,255,0.03)',
                border: formData.blindHiring ? '1px solid rgba(139,92,246,0.3)' : '1px solid rgba(255,255,255,0.08)'
              }}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">🙈</span>
                    <h3 className="text-white font-bold text-sm">Blind Hiring Mode</h3>
                    {formData.blindHiring && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                        style={{background: 'rgba(139,92,246,0.2)', color: '#c084fc', border: '1px solid rgba(139,92,246,0.3)'}}>
                        ON
                      </span>
                    )}
                  </div>
                  <p className="text-gray-500 text-xs leading-relaxed">
                    When enabled, candidate names, photos and emails are hidden from you during review.
                    You evaluate purely on <span style={{color: '#c084fc'}}>skills, experience and cover letter</span> — reducing unconscious bias.
                  </p>
                  {formData.blindHiring && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {['✅ Name hidden', '✅ Photo hidden', '✅ Email hidden', '✅ Resume hidden', '✅ Skills visible', '✅ Experience visible'].map((tag, i) => (
                        <span key={i} className="text-xs px-2 py-1 rounded-lg"
                          style={{
                            background: tag.startsWith('✅ Skills') || tag.startsWith('✅ Experience')
                              ? 'rgba(34,197,94,0.1)' : 'rgba(139,92,246,0.1)',
                            color: tag.startsWith('✅ Skills') || tag.startsWith('✅ Experience')
                              ? '#4ade80' : '#c084fc'
                          }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Toggle Switch */}
                <button
                  type="button"
                  onClick={() => setFormData({...formData, blindHiring: !formData.blindHiring})}
                  className="relative flex-shrink-0 w-12 h-6 rounded-full transition-all duration-300"
                  style={{background: formData.blindHiring ? 'linear-gradient(135deg, #7c3aed, #6d28d9)' : 'rgba(255,255,255,0.1)'}}>
                  <div className="absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-300"
                    style={{left: formData.blindHiring ? '28px' : '4px'}}></div>
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-4 rounded-xl font-bold text-white text-sm transition-all"
              style={{
                background: loading ? 'rgba(59,130,246,0.5)' : 'linear-gradient(135deg, #3b82f6, #7c3aed)',
                boxShadow: loading ? 'none' : '0 8px 25px rgba(59,130,246,0.3)'
              }}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Posting Job...
                </span>
              ) : '🚀 Post Job'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PostJob;