import express from 'express';
import User from '../models/User.js';
import AcademicRecord from '../models/AcademicRecord.js';
import { protect } from '../middleware/auth.js';
import { calculateAcademicSummary } from '../utils/calculations.js';

const router = express.Router();

router.get('/', protect, async (req, res) => {
  try {
    let semesters = [];
    if (req.user._id) {
      let record = await AcademicRecord.findOne({ userId: req.user._id });
      if (!record) {
        record = await AcademicRecord.create({ userId: req.user._id, semesters: [] });
      }
      semesters = record.semesters || [];
    }
    const summary = calculateAcademicSummary(semesters);

    const userJson = typeof req.user.toPublicJSON === 'function' ? req.user.toPublicJSON() : {
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
      user: userJson,
      academicSummary: summary
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving profile.'
    });
  }
});

export default router;
