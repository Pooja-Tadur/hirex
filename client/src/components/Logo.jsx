const sizes = {
  md: { box: 40, text: 'text-xl' },
  lg: { box: 56, text: 'text-3xl' },
};

const Logo = ({ size = 'md' }) => {
  const s = sizes[size] || sizes.md;
  return (
    <div className="flex items-center gap-3">
      <svg width={s.box} height={s.box} viewBox="0 0 48 48" style={{ transform: 'rotate(-6deg)' }}>
        <defs>
          <linearGradient id="hirexGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
        </defs>
        <rect x="2" y="2" width="44" height="44" rx="12" fill="url(#hirexGrad)" />
        <path d="M14 12 V36 M14 24 H34 M34 12 V36" stroke="white" strokeWidth="4" strokeLinecap="round" fill="none" />
        <circle cx="38" cy="12" r="3" fill="#fbbf24" />
      </svg>
      <span className={`font-display font-black text-white ${s.text}`}>
        Hire<span style={{
          background: 'linear-gradient(135deg, #60a5fa, #c084fc)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>X</span>
      </span>
    </div>
  );
};

export default Logo;