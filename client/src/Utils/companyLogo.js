const domainMap = {
  google: 'google.com',
  microsoft: 'microsoft.com',
  amazon: 'amazon.com',
  tcs: 'tcs.com',
  infosys: 'infosys.com',
  wipro: 'wipro.com',
  swiggy: 'swiggy.com',
  zomato: 'zomato.com',
  razorpay: 'razorpay.com',
  paytm: 'paytm.com',
  ibm: 'ibm.com',
  accenture: 'accenture.com',
  flipkart: 'flipkart.com',
  'goldman sachs': 'goldmansachs.com',
  techcorp: 'techcorp.com',
};

const brandColors = {
  google: ['#4285F4', '#34A853'],
  microsoft: ['#00A4EF', '#7FBA00'],
  amazon: ['#FF9900', '#232F3E'],
  
  infosys: ['#007CC3', '#00ADEF'],
  wipro: ['#341858', '#7B68EE'],
  swiggy: ['#FC8019', '#FF5722'],
  zomato: ['#E23744', '#CB202D'],
  razorpay: ['#3395FF', '#0C2451'],
  paytm: ['#00BAF2', '#002970'],
  ibm: ['#0F62FE', '#003A6B'],
  accenture: ['#A100FF', '#460073'],
  flipkart: ['#2874F0', '#1A4FB4'],
  'goldman sachs': ['#7399C6', '#1F3A5F'],
  techcorp: ['#3b82f6', '#7c3aed'],
};

export const getDomain = (companyName) => {
  if (!companyName) return null;
  return domainMap[companyName.toLowerCase().trim()] || null;
};

export const getLogoSources = (companyName) => {
  const domain = getDomain(companyName);
  if (!domain) return [];
  // Google's favicon service only — Clearbit's free tier is unreliable/blocked on many networks
  return [
    `https://www.google.com/s2/favicons?domain=${domain}&sz=128`,
  ];
};

export const getBrandGradient = (companyName) => {
  const key = companyName?.toLowerCase().trim();
  const colors = brandColors[key];
  if (colors) return `linear-gradient(135deg, ${colors[0]}, ${colors[1]})`;
  return 'linear-gradient(135deg, #3b82f6, #7c3aed)';
};