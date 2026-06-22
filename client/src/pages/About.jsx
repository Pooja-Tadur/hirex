import AnimatedBackground from '../components/AnimatedBackground';

const About = () => {
  const team = [
    { name: 'Rahul Sharma', role: 'CEO & Founder', initial: 'R' },
    { name: 'Priya Patel', role: 'CTO', initial: 'P' },
    { name: 'Arjun Mehta', role: 'Head of Product', initial: 'A' },
    { name: 'Sneha Reddy', role: 'Lead Designer', initial: 'S' },
  ];

  const stats = [
    { num: '10K+', label: 'Jobs Posted' },
    { num: '50K+', label: 'Job Seekers' },
    { num: '5K+', label: 'Companies' },
    { num: '8K+', label: 'Successfully Hired' },
  ];

  return (
    <div className="min-h-screen relative text-white" style={{background: '#020817'}}>
      <AnimatedBackground />

      <div className="fixed inset-0 -z-10">
        <img
          src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1920&auto=format&fit=crop"
          alt=""
          className="w-full h-full object-cover opacity-10"
        />
        <div className="absolute inset-0" style={{background: 'linear-gradient(180deg, rgba(2,8,23,0.85) 0%, #020817 100%)'}}></div>
      </div>

      <section className="py-20 px-6 text-center relative z-10">
        <div className="max-w-3xl mx-auto">
          <span className="inline-block text-blue-400 text-sm font-semibold tracking-widest uppercase mb-4">About Us</span>
          <h1 className="text-5xl font-black font-display text-white mb-6 leading-tight">
            We Connect <span style={{background: 'linear-gradient(90deg, #60a5fa, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>Talent</span> With <span style={{background: 'linear-gradient(90deg, #a78bfa, #60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>Opportunity</span>
          </h1>
          <p className="text-gray-400 text-lg leading-relaxed">
            MployNow is India's fastest growing AI-powered job platform, helping freshers and experienced professionals find their dream careers. We believe everyone deserves a job they love.
          </p>
        </div>
      </section>

      <section className="py-12 px-6 relative z-10" style={{borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)'}}>
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((s, i) => (
            <div key={i}>
              <div className="text-4xl font-black font-display text-blue-400 mb-2">{s.num}</div>
              <div className="text-gray-400 text-sm">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-20 px-6 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { icon: '🎯', title: 'Our Mission', desc: 'To democratize access to career opportunities for every graduate and professional in India, regardless of background or location.' },
              { icon: '👁️', title: 'Our Vision', desc: 'A world where every person can find meaningful work that aligns with their skills, passion and lifestyle goals.' },
              { icon: '💡', title: 'Our Values', desc: 'Transparency, merit-based hiring, diversity and inclusion. We believe great talent comes from everywhere.' },
              { icon: '🚀', title: 'Our Impact', desc: 'Over 8,000 successful placements in the last year alone, with a 98% satisfaction rate from both candidates and recruiters.' },
            ].map((item, i) => (
              <div key={i} className="rounded-2xl p-6 tilt-3d"
                style={{background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)'}}>
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="text-white font-bold text-xl font-display mb-3">{item.title}</h3>
                <p className="text-gray-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 relative z-10" style={{background: 'rgba(255,255,255,0.02)'}}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black font-display text-white mb-4">Meet Our Team</h2>
            <p className="text-gray-400">The people behind MployNow</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {team.map((member, i) => (
              <div key={i} className="text-center p-6 rounded-2xl tilt-3d"
                style={{background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)'}}>
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-black text-2xl mx-auto mb-4"
                  style={{background: 'linear-gradient(135deg, #3b82f6, #7c3aed)'}}>
                  {member.initial}
                </div>
                <h3 className="text-white font-bold text-sm">{member.name}</h3>
                <p className="text-gray-500 text-xs mt-1">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;