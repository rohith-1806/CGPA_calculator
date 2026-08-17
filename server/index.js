import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config({ path: path.join(__dirname, '../.env') });

import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db.js';
import { seedUsersFromExcel, ensureExcelFileExists } from './utils/seedExcelUsers.js';

import authRoutes from './routes/auth.js';
import academicRoutes from './routes/academic.js';
import profileRoutes from './routes/profile.js';
import adminRoutes from './routes/admin.js';

const app = express();
const PORT = process.env.PORT || 5000;

console.log('Starting GrowX backend...');

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration
const allowedOrigins = [
  'https://cgpa-site.vercel.app',
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'http://localhost:5173',
  'http://localhost:3000'
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app') || process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// Security & Header middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Routes registration
app.use('/api/auth', authRoutes);
app.use('/api/academic', academicRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    app: 'GrowX API Server',
    timestamp: new Date().toISOString()
  });
});

// Absolute file paths using __dirname
const serverExcelPath = path.join(__dirname, 'data/login credentials.xlsx');
const rootExcelPath = path.join(__dirname, '../login credentials.xlsx');

ensureExcelFileExists(serverExcelPath);
ensureExcelFileExists(rootExcelPath);

// Startup Flow: Connect DB first, seed initial accounts, then listen
connectDB()
  .then(() => seedUsersFromExcel(serverExcelPath))
  .then(() => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`GrowX backend running on port ${PORT}`);
      console.log(`=================================================`);
      console.log(`🚀 GrowX Backend Server active on 0.0.0.0:${PORT}`);
      console.log(`🔒 Private Login Authentication & Data Isolation ACTIVE`);
      console.log(`=================================================`);
    });
  })
  .catch((err) => {
    console.error('MongoDB Initialization Error:', err.message || err);
    process.exit(1);
  });
