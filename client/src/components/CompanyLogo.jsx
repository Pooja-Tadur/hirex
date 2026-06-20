import { useState, useEffect } from 'react';
import { getLogoSources, getBrandGradient } from '../utils/companyLogo';

const CompanyLogo = ({ company, size = 48, rounded = 'rounded-xl' }) => {
  const [sourceIndex, setSourceIndex] = useState(0);
  const sources = getLogoSources(company);

  useEffect(() => {
    setSourceIndex(0);
  }, [company]);

  const showImage = sourceIndex < sources.length;
  const currentSrc = sources[sourceIndex];

  return (
    <div
      className={`${rounded} flex items-center justify-center text-white font-black flex-shrink-0 overflow-hidden`}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.4,
        background: showImage ? '#ffffff' : getBrandGradient(company),
        boxShadow: '0 8px 20px rgba(0,0,0,0.25)'
      }}
    >
      {showImage ? (
        <img
          key={currentSrc}
          src={currentSrc}
          alt={company}
          className="w-full h-full object-contain"
          style={{ padding: size * 0.15 }}
          onError={() => setSourceIndex(i => i + 1)}
        />
      ) : (
        company?.charAt(0).toUpperCase()
      )}
    </div>
  );
};

export default CompanyLogo;