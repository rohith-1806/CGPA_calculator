import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import { seedUsersFromExcel } from '../utils/seedExcelUsers.js';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

const getJwtSecret = () => process.env.JWT_SECRET || 'growx_super_secret_jwt_key_2026_academic_platform';

/**
 * @route   POST /api/auth/admin/login
 * @desc    Dedicated Admin Login endpoint
 * @access  Public
 */
router.post('/admin/login', async (req, res) => {
  try {
    const emailInput = (req.body.email || req.body.loginId || '').toString().trim().toLowerCase();
    const passwordInput = (req.body.password || '').toString().trim();

    if (!emailInput || !passwordInput) {
      return res.status(400).json({
        success: false,
        message: 'Admin email and password are required.'
      });
    }

    const expectedAdminEmail = (process.env.ADMIN_EMAIL || 'admin@mail.com').trim().toLowerCase();
    const expectedAdminPassword = (process.env.ADMIN_PASSWORD || 'admin@123').trim();

    if (emailInput !== expectedAdminEmail || passwordInput !== expectedAdminPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin credentials.'
      });
    }

    // Ensure Admin User document exists in MongoDB for JWT reference
    let adminUser = await User.findOne({ role: 'admin', loginId: expectedAdminEmail });
    if (!adminUser) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(expectedAdminPassword, salt);
      adminUser = await User.create({
        loginId: expectedAdminEmail,
        email: expectedAdminEmail,
        passwordHash,
        name: 'GrowX Administrator',
        rollNumber: 'ADMIN-001',
        presentYear: 'N/A',
        presentSemester: 'N/A',
        role: 'admin'
      });
    }

    const token = jwt.sign(
      { id: adminUser._id.toString(), role: 'admin' },
      getJwtSecret(),
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      success: true,
      message: 'Admin login successful',
      token,
      admin: {
        email: expectedAdminEmail,
        role: 'admin'
      },
      user: {
        _id: adminUser._id,
        name: adminUser.name,
        email: expectedAdminEmail,
        role: 'admin'
      }
    });
  } catch (error) {
    console.error('Admin login authentication error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication failed. Please check credentials.'
    });
  }
});

/**
 * @route   POST /api/auth/admin/logout
 * @desc    Admin logout endpoint
 * @access  Public
 */
router.post('/admin/logout', (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Admin logout successful'
  });
});

/**
 * @route   POST /api/auth/login
 * @desc    Student login endpoint
 * @access  Public
 */
router.post('/login', async (req, res) => {
  try {
    const rawLoginId = req.body.loginId || req.body.email || req.body.login_id;
    const password = req.body.password;

    if (!rawLoginId || !password) {
      return res.status(400).json({
        success: false,
        message: 'Invalid login credentials.'
      });
    }

    const cleanInput = rawLoginId.toString().trim().toLowerCase();
    const escapedInput = cleanInput.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const user = await User.findOne({
      $or: [
        { loginId: new RegExp(`^${escapedInput}$`, 'i') },
        { email: new RegExp(`^${escapedInput}$`, 'i') },
        { rollNumber: new RegExp(`^${escapedInput}$`, 'i') }
      ]
    });

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
      id: user._id,
      _id: user._id,
      name: user.name,
      rollNumber: user.rollNumber,
      loginId: user.loginId,
      email: user.email || user.loginId,
      role: user.role || 'student',
      presentYear: user.presentYear || '4th Year',
      presentSemester: user.presentSemester || '1st Semester',
      branch: user.branch || 'CSE',
      university: user.university || 'JNTUK',
      regulation: user.regulation || 'R20',
      courseType: user.courseType || 'B.Tech'
    };

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: userProfile
    });
  } catch (error) {
    console.error('Login processing error:', error);
    return res.status(500).json({
      success: false,
      message: 'Invalid login credentials.'
    });
  }
});

/**
 * @route   GET /api/auth/me
 * @desc    Get currently logged in user info
 * @access  Private
 */
router.get('/me', protect, async (req, res) => {
  try {
    const userProfile = {
      id: req.user._id,
      _id: req.user._id,
      name: req.user.name,
      rollNumber: req.user.rollNumber,
      loginId: req.user.loginId,
      email: req.user.email || req.user.loginId,
      role: req.user.role || 'student',
      presentYear: req.user.presentYear || '4th Year',
      presentSemester: req.user.presentSemester || '1st Semester',
      branch: req.user.branch || 'CSE',
      university: req.user.university || 'JNTUK',
      regulation: req.user.regulation || 'R20',
      courseType: req.user.courseType || 'B.Tech'
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

/**
 * @route   GET /api/auth/reseed
 * @desc    Reseed user credentials from excel
 * @access  Public / Admin
 */
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

export default router;
