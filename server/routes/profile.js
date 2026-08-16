import express from 'express';
import User from '../models/User.js';
import AcademicRecord from '../models/AcademicRecord.js';
import { protect } from '../middleware/auth.js';
import { calculateAcademicSummary } from '../utils/calculations.js';
import { inMemoryAcademicRecords } from '../utils/memoryFallbackStore.js';

const router = express.Router();

router.get('/', protect, async (req, res) => {
  try {
    let semesters = [];
    if (req.user._id) {
      const record = await AcademicRecord.findOne({ userId: req.user._id });
      if (record) semesters = record.semesters;
      else {
        const memRecord = inMemoryAcademicRecords.get(req.user._id.toString());
        if (memRecord) semesters = memRecord.semesters;
      }
    }
    const summary = calculateAcademicSummary(semesters);

    const userJson = typeof req.user.toPublicJSON === 'function' ? req.user.toPublicJSON() : {
      _id: req.user._id,
      name: req.user.name,
      rollNumber: req.user.rollNumber,
      loginId: req.user.loginId,
      email: req.user.loginId,
      presentSemester: '4th Year – 1st Semester'
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
