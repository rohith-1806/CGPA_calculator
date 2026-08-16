import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import { inMemoryUsers } from '../utils/memoryFallbackStore.js';
import { seedUsersFromExcel } from '../utils/seedExcelUsers.js';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

const getJwtSecret = () => process.env.JWT_SECRET || 'growx_secret_key_2026';

router.get('/reseed', async (req, res) => {
  try {
    const excelPath = path.join(__dirname, '../data/login credentials.xlsx');
    const result = await seedUsersFromExcel(excelPath);
    return res.status(200).json({
      success: true,
      message: 'Reseed complete',
      result
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { loginId, password } = req.body;

    if (!loginId || !password) {
      return res.status(400).json({
        success: false,
        message: 'Invalid login credentials.'
      });
    }

    const cleanInput = loginId.toString().trim().toLowerCase();
    let user = null;

    if (mongoose.connection.readyState === 1) {
      user = await User.findOne({
        $or: [
          { loginId: cleanInput },
          { email: cleanInput },
          { rollNumber: cleanInput.toUpperCase() }
        ]
      });
    } else {
      // In-memory fallback lookup
      for (const u of inMemoryUsers.values()) {
        if (
          u.loginId.toLowerCase() === cleanInput ||
          u.email.toLowerCase() === cleanInput ||
          u.rollNumber.toLowerCase() === cleanInput
        ) {
          user = u;
          break;
        }
      }
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid login credentials.'
      });
    }

    const isMatch = await bcrypt.compare(password.toString().trim(), user.passwordHash);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid login credentials.'
      });
    }

    const token = jwt.sign(
      { id: user._id.toString(), role: user.role },
      getJwtSecret(),
      { expiresIn: '7d' }
    );

    const userProfile = {
      _id: user._id,
      name: user.name,
      rollNumber: user.rollNumber,
      loginId: user.loginId,
      email: user.email || user.loginId,
      presentYear: user.presentYear || '4th Year',
      presentSemester: user.presentSemester || '1st Semester'
    };

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: userProfile
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Invalid login credentials.'
    });
  }
});

router.get('/me', protect, async (req, res) => {
  try {
    const userProfile = {
      _id: req.user._id,
      name: req.user.name,
      rollNumber: req.user.rollNumber,
      loginId: req.user.loginId,
      email: req.user.email || req.user.loginId,
      presentYear: req.user.presentYear || '4th Year',
      presentSemester: req.user.presentSemester || '1st Semester'
    };

    return res.status(200).json({
      success: true,
      user: userProfile
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to authenticate user.'
    });
  }
});

export default router;
