const Logo = ({ size = 'md' }) => {
  const sizes = {
    sm: { box: 32, text: 'text-lg' },
    md: { box: 40, text: 'text-xl' },
    lg: { box: 52, text: 'text-3xl' },
  };
  const s = sizes[size] || sizes.md;

  return (
    <div className="flex items-center gap-2.5">
      <svg width={s.box} height={s.box} viewBox="0 0 52 52" fill="none">
        <defs>
          <linearGradient id="mployGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
        </defs>
        <rect x="2" y="2" width="48" height="48" rx="14" fill="url(#mployGrad)" />
        <path d="M12 38 L12 16 L20 16 L26 28 L32 16 L40 16 L40 38" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="M34 32 L40 38" stroke="#fbbf24" strokeWidth="3.5" strokeLinecap="round" />
        <circle cx="40" cy="32" r="3" fill="#fbbf24" />
      </svg>
      <span className={`font-display font-black tracking-tight ${s.text}`}>
        <span className="text-white">Mploy</span>
        <span style={{
          background: 'linear-gradient(135deg, #60a5fa, #c084fc)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>Now</span>
      </span>
    </div>
  );
};

export default Logo;