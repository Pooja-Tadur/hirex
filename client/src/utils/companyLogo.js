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
  dell: 'dell.com',
  apple: 'apple.com',
  meta: 'meta.com',
  netflix: 'netflix.com',
  uber: 'uber.com',
  airbnb: 'airbnb.com',
  twitter: 'twitter.com',
  linkedin: 'linkedin.com',
  adobe: 'adobe.com',
  oracle: 'oracle.com',
  sap: 'sap.com',
  cognizant: 'cognizant.com',
  capgemini: 'capgemini.com',
  hcl: 'hcltech.com',
  deloitte: 'deloitte.com',
};

const brandColors = {
  google: ['#4285F4', '#34A853'],
  microsoft: ['#00A4EF', '#7FBA00'],
  amazon: ['#FF9900', '#232F3E'],
  tcs: ['#0070C0', '#003366'],
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
  dell: ['#007DB8', '#004B87'],
  apple: ['#555555', '#000000'],
  meta: ['#0082FB', '#0064C8'],
  netflix: ['#E50914', '#B00710'],
  uber: ['#000000', '#333333'],
  airbnb: ['#FF5A5F', '#FF385C'],
  twitter: ['#1DA1F2', '#0C85D0'],
  linkedin: ['#0A66C2', '#004182'],
  adobe: ['#FF0000', '#CC0000'],
  oracle: ['#F80000', '#C00000'],
  sap: ['#0070F2', '#0050C8'],
  cognizant: ['#1161D3', '#0A45A0'],
  capgemini: ['#0070AD', '#004B78'],
  hcl: ['#0066CC', '#004499'],
  deloitte: ['#86BC25', '#54801A'],
};

export const getDomain = (companyName) => {
  if (!companyName) return null;
  return domainMap[companyName.toLowerCase().trim()] || null;
};

export const getLogoSources = (companyName) => {
  const domain = getDomain(companyName);
  if (!domain) return [];
  return [
    `https://logo.clearbit.com/${domain}`,
    `https://www.google.com/s2/favicons?domain=${domain}&sz=128`,
  ];
};

export const getBrandGradient = (companyName) => {
  const key = companyName?.toLowerCase().trim();
  const colors = brandColors[key];
  if (colors) return `linear-gradient(135deg, ${colors[0]}, ${colors[1]})`;
  // Generate consistent color from company name
  const hash = key?.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) || 0;
  const hue = hash % 360;
  return `linear-gradient(135deg, hsl(${hue},70%,45%), hsl(${(hue+40)%360},70%,35%))`;
};