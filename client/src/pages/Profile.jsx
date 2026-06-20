import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Ensure URL has https:// prefix
const ensureHttps = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return 'https://' + url;
};

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const photoInputRef = useRef();
  const resumeInputRef = useRef();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [resumeUploading, setResumeUploading] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [profileData, setProfileData] = useState({
    name: '', bio: '', skills: [], company: '', location: '',
    website: '', linkedin: '', github: '', experience: '',
    education: '', profilePicture: '', resume: ''
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        bio: user.bio || '',
        skills: user.skills || [],
        company: user.company || '',
        location: user.location || '',
        website: user.website || '',
        linkedin: user.linkedin || '',
        github: user.github || '',
        experience: user.experience || '',
        education: user.education || '',
        profilePicture: user.profilePicture || '',
        resume: user.resume || ''
      });
    }
  }, [user]);

  const handleChange = (e) => setProfileData({ ...profileData, [e.target.name]: e.target.value });

  const addSkill = (e) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault();
      if (!profileData.skills.includes(skillInput.trim())) {
        setProfileData({ ...profileData, skills: [...profileData.skills, skillInput.trim()] });
      }
      setSkillInput('');
    }
  };

  const removeSkill = (skill) => {
    setProfileData({ ...profileData, skills: profileData.skills.filter(s => s !== skill) });
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Please upload an image file'); return; }
    setPhotoUploading(true);
    toast.loading('Uploading photo...', { id: 'photo' });
    try {
      const formData = new FormData();
      formData.append('photo', file);
      const res = await axios.post(`${API}/upload/profile-photo`, formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const newData = { ...profileData, profilePicture: res.data.url };
      setProfileData(newData);
      await axios.put(`${API}/auth/profile`, newData, { withCredentials: true });
      toast.success('Profile photo updated! ✅', { id: 'photo' });
      window.location.reload();
    } catch {
      toast.error('Failed to upload photo', { id: 'photo' });
    } finally {
      setPhotoUploading(false);
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type !== 'application/pdf') { toast.error('Please upload a PDF file'); return; }
    setResumeUploading(true);
    toast.loading('Uploading resume...', { id: 'resumeUp' });
    try {
      const formData = new FormData();
      formData.append('resume', file);
      const res = await axios.post(`${API}/upload/resume`, formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (!res.data.url) throw new Error('No URL returned');
      const newData = { ...profileData, resume: res.data.url };
      setProfileData(newData);
      await axios.put(`${API}/auth/profile`, newData, { withCredentials: true });
      toast.success('Resume uploaded! ✅', { id: 'resumeUp' });
      window.location.reload();
    } catch {
      toast.error('Failed to upload resume', { id: 'resumeUp' });
    } finally {
      setResumeUploading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Ensure all URLs have https:// before saving
      const dataToSave = {
        ...profileData,
        linkedin: ensureHttps(profileData.linkedin),
        github: ensureHttps(profileData.github),
        website: ensureHttps(profileData.website),
      };
      await axios.put(`${API}/auth/profile`, dataToSave, { withCredentials: true });
      setProfileData(dataToSave);
      toast.success('Profile updated successfully! ✅');
      setEditing(false);
      window.location.reload();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' };
  const inputClass = "w-full px-4 py-3 rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none transition-all";
  const initial = user?.name?.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen relative text-white py-10 px-6" style={{background: '#020817'}}>
      <div className="fixed inset-0 -z-10">
        <img
          src="https://images.unsplash.com/photo-1573164713988-8665fc963095?q=80&w=1920&auto=format&fit=crop"
          alt="" className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0" style={{background: 'linear-gradient(180deg, rgba(2,8,23,0.75) 0%, #020817 100%)'}}></div>
      </div>

      <div className="max-w-4xl mx-auto relative z-10">

        <button onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-8 transition">
          ← Back to Dashboard
        </button>

        {/* Header Card */}
        <div className="rounded-3xl p-8 mb-6 relative overflow-hidden tilt-3d"
          style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.15) 0%, rgba(124,58,237,0.15) 100%)', border: '1px solid rgba(255,255,255,0.08)' }}>

          <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10 blur-3xl pointer-events-none"
            style={{background: 'radial-gradient(circle, #7c3aed, transparent)'}}></div>

          <div className="flex items-start justify-between gap-6 relative z-10 flex-wrap">
            <div className="flex items-center gap-6">

              {/* Avatar */}
              <div className="relative group">
                {profileData.profilePicture ? (
                  <img src={profileData.profilePicture} alt="avatar"
                    className="w-24 h-24 rounded-2xl object-cover"
                    style={{border: '3px solid rgba(59,130,246,0.5)'}}
                  />
                ) : (
                  <div className="w-24 h-24 rounded-2xl flex items-center justify-center text-white font-black text-3xl"
                    style={{background: 'linear-gradient(135deg, #3b82f6, #7c3aed)', border: '3px solid rgba(59,130,246,0.5)'}}>
                    {initial}
                  </div>
                )}
                <div onClick={() => photoInputRef.current?.click()}
                  className="absolute inset-0 rounded-2xl flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-all"
                  style={{background: 'rgba(0,0,0,0.6)'}}>
                  {photoUploading ? (
                    <svg className="animate-spin h-6 w-6 text-white" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                  ) : (
                    <span className="text-white text-xs font-bold text-center">📷<br/>Change</span>
                  )}
                </div>
                <input ref={photoInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                <div className="absolute -bottom-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs"
                  style={{background: 'linear-gradient(135deg, #3b82f6, #7c3aed)'}}>
                  {user?.role === 'recruiter' ? '🏢' : '👨‍💼'}
                </div>
              </div>

              <div>
                <h1 className="text-3xl font-black font-display text-white mb-1">{user?.name}</h1>
                <p className="text-blue-400 text-sm font-semibold mb-2">{user?.email}</p>
                <div className="flex items-center gap-3">
                  <span className="text-xs px-3 py-1 rounded-full font-semibold"
                    style={{
                      background: user?.role === 'recruiter' ? 'rgba(168,85,247,0.15)' : 'rgba(59,130,246,0.15)',
                      color: user?.role === 'recruiter' ? '#c084fc' : '#60a5fa',
                      border: user?.role === 'recruiter' ? '1px solid rgba(168,85,247,0.3)' : '1px solid rgba(59,130,246,0.3)'
                    }}>
                    {user?.role === 'recruiter' ? '🏢 Recruiter' : '👨‍💼 Job Seeker'}
                  </span>
                  {profileData.location && <span className="text-gray-400 text-xs">📍 {profileData.location}</span>}
                </div>
                <p className="text-gray-500 text-xs mt-2">Hover over photo to change it</p>
              </div>
            </div>

            <button
              onClick={() => editing ? handleSave() : setEditing(true)}
              disabled={loading}
              className="px-6 py-3 rounded-xl font-bold text-white text-sm transition-all flex-shrink-0"
              style={{
                background: editing ? 'linear-gradient(135deg, #22c55e, #16a34a)' : 'linear-gradient(135deg, #3b82f6, #7c3aed)',
                boxShadow: '0 4px 15px rgba(59,130,246,0.3)'
              }}>
              {loading ? '⏳ Saving...' : editing ? '✅ Save Profile' : '✏️ Edit Profile'}
            </button>
          </div>

          {!editing && profileData.bio && (
            <p className="text-gray-300 text-sm mt-4 leading-relaxed relative z-10">{profileData.bio}</p>
          )}

          {/* Social Links — fixed with ensureHttps */}
          {!editing && (
            <div className="flex flex-wrap gap-3 mt-4 relative z-10">
              {profileData.linkedin && (
                <a href={ensureHttps(profileData.linkedin)} target="_blank" rel="noreferrer"
                  className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg transition hover:opacity-80"
                  style={{background: 'rgba(59,130,246,0.1)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.2)'}}>
                  💼 LinkedIn ↗
                </a>
              )}
              {profileData.github && (
                <a href={ensureHttps(profileData.github)} target="_blank" rel="noreferrer"
                  className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg transition hover:opacity-80"
                  style={{background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.08)'}}>
                  🐙 GitHub ↗
                </a>
              )}
              {profileData.website && (
                <a href={ensureHttps(profileData.website)} target="_blank" rel="noreferrer"
                  className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg transition hover:opacity-80"
                  style={{background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.08)'}}>
                  🌐 Website ↗
                </a>
              )}
              {profileData.resume && (
                <button onClick={() => window.open(profileData.resume, '_blank')}
                  className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg transition hover:opacity-80"
                  style={{background: 'rgba(34,197,94,0.1)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.2)'}}>
                  📄 View Resume ↗
                </button>
              )}
            </div>
          )}
        </div>

        {/* Edit Form */}
        {editing && (
          <div className="rounded-3xl p-8 mb-6"
            style={{background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)'}}>
            <h2 className="text-white font-bold text-lg font-display mb-6">Edit Profile</h2>
            <div className="space-y-5">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Full Name</label>
                  <input name="name" value={profileData.name} onChange={handleChange}
                    placeholder="Your full name" className={inputClass} style={inputStyle}
                    onFocus={e => e.target.style.border = '1px solid rgba(59,130,246,0.6)'}
                    onBlur={e => e.target.style.border = '1px solid rgba(255,255,255,0.08)'}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Location</label>
                  <input name="location" value={profileData.location} onChange={handleChange}
                    placeholder="e.g. Bangalore, India" className={inputClass} style={inputStyle}
                    onFocus={e => e.target.style.border = '1px solid rgba(59,130,246,0.6)'}
                    onBlur={e => e.target.style.border = '1px solid rgba(255,255,255,0.08)'}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Bio</label>
                <textarea name="bio" value={profileData.bio} onChange={handleChange}
                  placeholder="Tell recruiters about yourself..." rows={3}
                  className={inputClass} style={{...inputStyle, resize: 'none'}}
                  onFocus={e => e.target.style.border = '1px solid rgba(59,130,246,0.6)'}
                  onBlur={e => e.target.style.border = '1px solid rgba(255,255,255,0.08)'}
                />
              </div>

              {user?.role === 'recruiter' ? (
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Company</label>
                  <input name="company" value={profileData.company} onChange={handleChange}
                    placeholder="Your company name" className={inputClass} style={inputStyle}
                    onFocus={e => e.target.style.border = '1px solid rgba(59,130,246,0.6)'}
                    onBlur={e => e.target.style.border = '1px solid rgba(255,255,255,0.08)'}
                  />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Experience</label>
                    <input name="experience" value={profileData.experience} onChange={handleChange}
                      placeholder="e.g. 2 years in React" className={inputClass} style={inputStyle}
                      onFocus={e => e.target.style.border = '1px solid rgba(59,130,246,0.6)'}
                      onBlur={e => e.target.style.border = '1px solid rgba(255,255,255,0.08)'}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Education</label>
                    <input name="education" value={profileData.education} onChange={handleChange}
                      placeholder="e.g. B.Tech Computer Science" className={inputClass} style={inputStyle}
                      onFocus={e => e.target.style.border = '1px solid rgba(59,130,246,0.6)'}
                      onBlur={e => e.target.style.border = '1px solid rgba(255,255,255,0.08)'}
                    />
                  </div>
                </div>
              )}

              {user?.role === 'jobseeker' && (
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">
                    Skills <span className="text-gray-600 normal-case font-normal">(Press Enter to add)</span>
                  </label>
                  <input
                    value={skillInput}
                    onChange={e => setSkillInput(e.target.value)}
                    onKeyDown={addSkill}
                    placeholder="Type a skill and press Enter..."
                    className={inputClass} style={inputStyle}
                    onFocus={e => e.target.style.border = '1px solid rgba(59,130,246,0.6)'}
                    onBlur={e => e.target.style.border = '1px solid rgba(255,255,255,0.08)'}
                  />
                  {profileData.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {profileData.skills.map((skill, i) => (
                        <span key={i} className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-xl"
                          style={{background: 'rgba(59,130,246,0.15)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.3)'}}>
                          {skill}
                          <button type="button" onClick={() => removeSkill(skill)} className="hover:text-white transition">×</button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">LinkedIn URL</label>
                  <input name="linkedin" value={profileData.linkedin} onChange={handleChange}
                    placeholder="https://linkedin.com/in/yourname" className={inputClass} style={inputStyle}
                    onFocus={e => e.target.style.border = '1px solid rgba(59,130,246,0.6)'}
                    onBlur={e => e.target.style.border = '1px solid rgba(255,255,255,0.08)'}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">GitHub URL</label>
                  <input name="github" value={profileData.github} onChange={handleChange}
                    placeholder="https://github.com/yourusername" className={inputClass} style={inputStyle}
                    onFocus={e => e.target.style.border = '1px solid rgba(59,130,246,0.6)'}
                    onBlur={e => e.target.style.border = '1px solid rgba(255,255,255,0.08)'}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Website URL</label>
                  <input name="website" value={profileData.website} onChange={handleChange}
                    placeholder="https://yourportfolio.com" className={inputClass} style={inputStyle}
                    onFocus={e => e.target.style.border = '1px solid rgba(59,130,246,0.6)'}
                    onBlur={e => e.target.style.border = '1px solid rgba(255,255,255,0.08)'}
                  />
                </div>

                {user?.role === 'jobseeker' && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">
                      Resume {profileData.resume?.includes('cloudinary') && <span className="text-green-400 normal-case font-normal">✓ PDF uploaded</span>}
                    </label>
                    <div className="flex gap-2 mb-2">
                      <button type="button" onClick={() => resumeInputRef.current?.click()}
                        disabled={resumeUploading}
                        className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
                        style={{background: 'rgba(34,197,94,0.1)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.2)'}}>
                        {resumeUploading ? (
                          <>
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                            </svg>
                            Uploading...
                          </>
                        ) : '📁 Upload Resume PDF'}
                      </button>
                    </div>
                    <input ref={resumeInputRef} type="file" accept=".pdf" onChange={handleResumeUpload} className="hidden" />
                    <p className="text-gray-600 text-xs mb-2">Recommended — works instantly with AI Resume Grader.</p>
                    <input name="resume" value={profileData.resume} onChange={handleChange}
                      placeholder="Or paste resume link here..." className={inputClass} style={inputStyle}
                      onFocus={e => e.target.style.border = '1px solid rgba(59,130,246,0.6)'}
                      onBlur={e => e.target.style.border = '1px solid rgba(255,255,255,0.08)'}
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setEditing(false)}
                  className="flex-1 py-3 rounded-xl font-semibold text-sm text-gray-400 transition"
                  style={{background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)'}}>
                  Cancel
                </button>
                <button onClick={handleSave} disabled={loading}
                  className="flex-1 py-3 rounded-xl font-bold text-white text-sm transition-all"
                  style={{background: 'linear-gradient(135deg, #22c55e, #16a34a)', boxShadow: '0 4px 15px rgba(34,197,94,0.3)'}}>
                  {loading ? '⏳ Saving...' : '✅ Save Changes'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Info Cards */}
        {!editing && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {user?.role === 'jobseeker' && (
              <div className="rounded-2xl p-6 tilt-3d"
                style={{background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)'}}>
                <h3 className="text-white font-bold mb-4">⚡ Skills</h3>
                {profileData.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {profileData.skills.map((skill, i) => (
                      <span key={i} className="text-xs px-3 py-1.5 rounded-xl font-medium"
                        style={{background: 'rgba(59,130,246,0.1)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.2)'}}>
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No skills added yet. Click Edit Profile!</p>
                )}
              </div>
            )}

            <div className="rounded-2xl p-6 tilt-3d"
              style={{background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)'}}>
              <h3 className="text-white font-bold mb-4">
                {user?.role === 'recruiter' ? '🏢 Company Info' : '💼 Experience'}
              </h3>
              <div className="space-y-3">
                {user?.role === 'recruiter' ? (
                  <>
                    {profileData.company && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 text-sm">Company</span>
                        <span className="text-white text-sm font-semibold">{profileData.company}</span>
                      </div>
                    )}
                    {profileData.location && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 text-sm">Location</span>
                        <span className="text-white text-sm">{profileData.location}</span>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {profileData.experience && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 text-sm">Experience</span>
                        <span className="text-white text-sm">{profileData.experience}</span>
                      </div>
                    )}
                    {profileData.education && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 text-sm">Education</span>
                        <span className="text-white text-sm">{profileData.education}</span>
                      </div>
                    )}
                  </>
                )}
                {!profileData.company && !profileData.experience && (
                  <p className="text-gray-500 text-sm">No info added yet. Click Edit Profile!</p>
                )}
              </div>
            </div>

            <div className="rounded-2xl p-6 tilt-3d"
              style={{background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)'}}>
              <h3 className="text-white font-bold mb-4">👤 Account Info</h3>
              <div className="space-y-3">
                {[
                  { label: 'Email', value: user?.email },
                  { label: 'Role', value: user?.role === 'recruiter' ? '🏢 Recruiter' : '👨‍💼 Job Seeker' },
                  { label: 'Member since', value: new Date(user?.createdAt).toLocaleDateString('en-IN', {day:'numeric', month:'long', year:'numeric'}) },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-gray-500 text-sm">{item.label}</span>
                    <span className="text-white text-sm font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl p-6 tilt-3d"
              style={{background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)'}}>
              <h3 className="text-white font-bold mb-4">🚀 Quick Actions</h3>
              <div className="space-y-3">
                <button onClick={() => navigate('/dashboard')}
                  className="w-full py-3 rounded-xl text-sm font-semibold text-left px-4 transition"
                  style={{background: 'rgba(59,130,246,0.1)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.2)'}}>
                  📊 Go to Dashboard →
                </button>
                {user?.role === 'jobseeker' && (
                  <button onClick={() => navigate('/jobs')}
                    className="w-full py-3 rounded-xl text-sm font-semibold text-left px-4 transition"
                    style={{background: 'rgba(34,197,94,0.1)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.2)'}}>
                    💼 Browse Jobs →
                  </button>
                )}
                {user?.role === 'recruiter' && (
                  <button onClick={() => navigate('/post-job')}
                    className="w-full py-3 rounded-xl text-sm font-semibold text-left px-4 transition"
                    style={{background: 'rgba(168,85,247,0.1)', color: '#c084fc', border: '1px solid rgba(168,85,247,0.2)'}}>
                    ➕ Post New Job →
                  </button>
                )}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;