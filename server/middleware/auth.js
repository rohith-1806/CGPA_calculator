import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';
import { inMemoryUsers } from '../utils/memoryFallbackStore.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized. Access denied.'
    });
  }

  try {
    const secret = process.env.JWT_SECRET || 'growx_super_secret_jwt_key_2026_academic_platform';
    const decoded = jwt.verify(token, secret);

    let user = null;

    if (mongoose.connection.readyState === 1) {
      user = await User.findById(decoded.id).select('-passwordHash');
    }

    if (!user) {
      // Check in memory store fallback
      for (const u of inMemoryUsers.values()) {
        if (u._id === decoded.id) {
          user = u;
          break;
        }
      }
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User no longer exists.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('JWT Authentication Error:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Session expired or invalid token. Please log in again.'
    });
  }
};

export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Access restricted to administrators only.'
    });
  }
};
