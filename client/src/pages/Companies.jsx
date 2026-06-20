import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import CompanyLogo from '../components/CompanyLogo';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const industryMap = {
  google: 'Technology', microsoft: 'Technology', amazon: 'E-Commerce', tcs: 'IT Services',
  infosys: 'IT Services', wipro: 'IT Services', swiggy: 'Food Tech', zomato: 'Food Tech',
  razorpay: 'Fintech', paytm: 'Fintech', ibm: 'Technology', accenture: 'Consulting',
  flipkart: 'E-Commerce', 'goldman sachs': 'Finance', techcorp: 'Startup',
};

const formatLakhs = (num) => `₹${(num / 100000).toFixed(1)}L`;

const Companies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await axios.get(`${API}/jobs?limit=100`);
        const jobs = res.data.jobs;
        const grouped = {};
        jobs.forEach(job => {
          const key = job.company;
          if (!grouped[key]) {
            grouped[key] = {
              name: job.company, location: job.location, count: 0,
              totalPositions: 0, minSalary: Infinity, maxSalary: 0,
            };
          }
          grouped[key].count += 1;
          grouped[key].totalPositions += job.positions || 0;
          if (job.salary?.min) grouped[key].minSalary = Math.min(grouped[key].minSalary, job.salary.min);
          if (job.salary?.max) grouped[key].maxSalary = Math.max(grouped[key].maxSalary, job.salary.max);
        });
        setCompanies(Object.values(grouped).sort((a, b) => b.count - a.count));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCompanies();
  }, []);

  return (
    <div className="min-h-screen relative text-white" style={{background: '#020817'}}>
      <div className="fixed inset-0 -z-10">
        <img
          src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1920&auto=format&fit=crop"
          alt=""
          className="w-full h-full object-cover opacity-15"
        />
        <div className="absolute inset-0" style={{background: 'linear-gradient(180deg, rgba(2,8,23,0.8) 0%, #020817 100%)'}}></div>
      </div>

      <div className="relative py-16 px-6 overflow-hidden z-10">
        <img
          src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1600&auto=format&fit=crop"
          alt="Office"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0"
          style={{background: 'linear-gradient(180deg, rgba(2,8,23,0.6) 0%, rgba(2,8,23,0.92) 70%, #020817 100%)'}}>
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <h1 className="text-3xl md:text-5xl font-black font-display mb-4 text-white">
            Browse <span style={{
              background: 'linear-gradient(135deg, #60a5fa, #c084fc)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
            }}>Companies</span>
          </h1>
          <p className="text-gray-300 text-sm md:text-base">
            Explore top companies hiring right now, see salary ranges, and find your perfect workplace
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 pb-16 -mt-6 relative z-10">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-2xl p-6 animate-pulse"
                style={{background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', height: '160px'}}>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {companies.map((company, i) => {
              const key = company.name.toLowerCase().trim();
              return (
                <div key={i}
                  onClick={() => navigate(`/jobs?keyword=${encodeURIComponent(company.name)}`)}
                  className="rounded-2xl p-6 cursor-pointer transition-all duration-300 tilt-3d"
                  style={{background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)'}}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                    e.currentTarget.style.border = '1px solid rgba(59,130,246,0.3)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                    e.currentTarget.style.border = '1px solid rgba(255,255,255,0.08)';
                  }}>
                  <div className="flex items-center gap-4 mb-4">
                    <CompanyLogo company={company.name} size={56} />
                    <div>
                      <h3 className="text-white font-bold text-lg font-display">{company.name}</h3>
                      <p className="text-gray-500 text-sm">{industryMap[key] || 'Company'}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-3 px-3 rounded-xl mb-3"
                    style={{background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.15)'}}>
                    <span className="text-gray-400 text-xs">💰 Salary Range</span>
                    <span className="text-green-400 text-xs font-bold">
                      {company.minSalary !== Infinity ? `${formatLakhs(company.minSalary)} - ${formatLakhs(company.maxSalary)}/yr` : 'Not disclosed'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-3"
                    style={{borderTop: '1px solid rgba(255,255,255,0.06)'}}>
                    <span className="text-gray-400 text-sm">📍 {company.location}</span>
                    <div className="flex gap-2">
                      <span className="text-xs font-bold px-3 py-1 rounded-full"
                        style={{background: 'rgba(59,130,246,0.15)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.3)'}}>
                        {company.count} {company.count === 1 ? 'job' : 'jobs'}
                      </span>
                      <span className="text-xs font-bold px-3 py-1 rounded-full"
                        style={{background: 'rgba(168,85,247,0.15)', color: '#c084fc', border: '1px solid rgba(168,85,247,0.3)'}}>
                        {company.totalPositions} openings
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Companies;