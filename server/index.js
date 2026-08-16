import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './config/db.js';
import { seedUsersFromExcel, ensureExcelFileExists } from './utils/seedExcelUsers.js';

import authRoutes from './routes/auth.js';
import academicRoutes from './routes/academic.js';
import profileRoutes from './routes/profile.js';
import adminRoutes from './routes/admin.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration
app.use(
  cors({
    origin: '*',
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

// Ensure login credentials.xlsx exists in server/data and root directory
const serverExcelPath = path.join(__dirname, 'data/login credentials.xlsx');
const rootExcelPath = path.join(__dirname, '../login credentials.xlsx');

ensureExcelFileExists(serverExcelPath);
ensureExcelFileExists(rootExcelPath);

const startServer = async () => {
  try {
    await connectDB();
    await seedUsersFromExcel(serverExcelPath);

    app.listen(PORT, () => {
      console.log(`=================================================`);
      console.log(`🚀 GrowX Backend Server running on port: ${PORT}`);
      console.log(`🔒 Private Login Authentication & Data Isolation ACTIVE`);
      console.log(`=================================================`);
    });
  } catch (error) {
    console.error('Server Initialization Failure:', error.message);
    process.exit(1);
  }
};

startServer();
