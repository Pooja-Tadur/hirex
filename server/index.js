
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
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://192.168.1.3:5173',
    'https://hirex-phi.vercel.app',
    /\.vercel\.app$/
  ],
  credentials: true
}));

app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/ai', aiRoutes);

// TEMPORARY ROUTE — delete after use
app.get('/api/clear', async (req, res) => {
  const Job = (await import('./models/Job.js')).default;
  await Job.updateMany({}, { $set: { applications: [] } });
  res.json({ message: 'All job application counts cleared!' });
});

app.get('/', (req, res) => {
  res.json({ message: 'HireX API running ✅' });
});

connectDB().then(() => {
  app.listen(process.env.PORT || 5000, () => {
    console.log(`Server running on port ${process.env.PORT || 5000}`);
  });
});