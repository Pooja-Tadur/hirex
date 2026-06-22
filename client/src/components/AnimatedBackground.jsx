const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 -z-20 overflow-hidden pointer-events-none">
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />
      <div className="orb orb-4" />
      <div className="orb orb-5" />

      <div className="particles">
        {[...Array(20)].map((_, i) => (
          <div key={i} className="particle" style={{
            left: `${(i * 5.1 + 3) % 100}%`,
            top: `${(i * 7.3 + 10) % 100}%`,
            animationDelay: `${(i * 0.4) % 6}s`,
            animationDuration: `${4 + (i % 4)}s`,
            width: i % 3 === 0 ? '3px' : '2px',
            height: i % 3 === 0 ? '3px' : '2px',
            opacity: i % 4 === 0 ? 0.4 : 0.2,
          }} />
        ))}
      </div>

      <div className="grid-overlay" />
    </div>
  );
};

export default AnimatedBackground;