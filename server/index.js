import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import jobRoutes from './routes/jobRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import aiRoutes from './routes/aiRoutes.js';

const app = express();
app.set('trust proxy', 1);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());

// ✅ Fixed CORS — correct domain + covers localhost variants
const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://192.168.1.3:5173',
  'https://hirex-phi.vercel.app',       // ✅ Your actual Vercel URL
  'https://mploynow.vercel.app',         // In case you rebrand/redeploy
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (Postman, mobile apps, curl)
    if (!origin) return callback(null, true);

    // Allow any Vercel preview deploy (e.g. hirex-abc123-pooja.vercel.app)
    if (/\.vercel\.app$/.test(origin)) return callback(null, true);

    if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);

    console.warn(`🚫 CORS blocked origin: ${origin}`);
    return callback(new Error(`CORS not allowed for origin: ${origin}`));
  },
  credentials: true,
}));

// ✅ Health check — also wakes up Render on cold start
app.get('/', (req, res) => {
  res.json({ message: 'MployNow API running ✅', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/ai', aiRoutes);

// ✅ Global error handler — catches unhandled errors and returns JSON (not HTML)
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ message: 'Internal server error. Please try again.' });
});

connectDB().then(() => {
  app.listen(process.env.PORT || 5000, () => {
    console.log(`🚀 Server running on port ${process.env.PORT || 5000}`);
  });
});