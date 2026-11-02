import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import AcademicRecord from '../models/AcademicRecord.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { gradeToPoint, calculateAcademicSummary } from '../utils/calculations.js';

const router = express.Router();

/**
 * Helper to ensure student has an AcademicRecord document in MongoDB
 */
const getRecord = async (userId) => {
  let rec = await AcademicRecord.findOne({ userId });
  if (!rec) rec = await AcademicRecord.create({ userId, semesters: [] });
  return rec;
};

/**
 * @route   GET /api/students/me
 * @desc    Get currently logged in student profile and MongoDB academic record
 * @access  Private (Student/Admin)
 */
router.get('/me', protect, async (req, res) => {
  try {
    const record = await getRecord(req.user._id);
    const summary = calculateAcademicSummary(record.semesters);

    const userProfile = typeof req.user.toPublicJSON === 'function' ? req.user.toPublicJSON() : {
      _id: req.user._id,
      name: req.user.name,
      rollNumber: req.user.rollNumber,
      loginId: req.user.loginId,
      email: req.user.email || req.user.loginId,
      branch: req.user.branch || 'CSE',
      presentYear: req.user.presentYear || '4th Year',
      presentSemester: req.user.presentSemester || '1st Semester',
      university: req.user.university || 'JNTUK',
      regulation: req.user.regulation || 'R20',
      courseType: req.user.courseType || 'B.Tech',
      role: req.user.role || 'student'
    };

    return res.status(200).json({
      success: true,
      user: userProfile,
      student: userProfile,
      academicRecord: record,
      academicRecords: record.semesters,
      summary
    });
  } catch (error) {
    console.error('Error fetching student profile & records:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve student data from MongoDB.'
    });
  }
});

/**
 * @route   PUT /api/students/me/academic-records
 * @desc    Update current student's academic records in MongoDB
 * @access  Private (Student)
 */
router.put('/me/academic-records', protect, async (req, res) => {
  try {
    const record = await getRecord(req.user._id);

    // Accept semesters or academicRecords payload
    const inputSemesters = req.body.semesters || req.body.academicRecords || req.body.records;

    if (Array.isArray(inputSemesters)) {
      record.semesters = inputSemesters.map((sem) => ({
        semesterName: sem.semesterName || sem.semester || 'Semester',
        subjects: Array.isArray(sem.subjects)
          ? sem.subjects.map((sub) => {
              const gradeStr = (sub.grade || 'A').toString().trim().toUpperCase();
              return {
                subjectName: sub.subjectName || sub.name || 'Subject',
                grade: gradeStr,
                gradePoint: sub.gradePoint !== undefined ? sub.gradePoint : gradeToPoint(gradeStr),
                credits: Number(sub.credits) >= 0 ? Number(sub.credits) : 3,
                status: sub.status || 'Regular'
              };
            })
          : []
      }));

      await record.save();
    }

    const summary = calculateAcademicSummary(record.semesters);

    return res.status(200).json({
      success: true,
      message: 'Academic records updated successfully in MongoDB.',
      academicRecord: record,
      academicRecords: record.semesters,
      summary
    });
  } catch (error) {
    console.error('Error updating academic records:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update academic records in MongoDB.'
    });
  }
});

/**
 * @route   PUT /api/students/:studentId/academic-records
 * @desc    Update specific student's academic records in MongoDB with Student Isolation check
 * @access  Private (Student or Admin)
 */
router.put('/:studentId/academic-records', protect, async (req, res) => {
  try {
    const { studentId } = req.params;

    // Student Data Isolation Enforcement
    if (req.user.role !== 'admin' && req.user._id.toString() !== studentId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You cannot modify another student\'s record.'
      });
    }

    const record = await getRecord(studentId);
    const inputSemesters = req.body.semesters || req.body.academicRecords || req.body.records;

    if (Array.isArray(inputSemesters)) {
      record.semesters = inputSemesters.map((sem) => ({
        semesterName: sem.semesterName || sem.semester || 'Semester',
        subjects: Array.isArray(sem.subjects)
          ? sem.subjects.map((sub) => {
              const gradeStr = (sub.grade || 'A').toString().trim().toUpperCase();
              return {
                subjectName: sub.subjectName || sub.name || 'Subject',
                grade: gradeStr,
                gradePoint: sub.gradePoint !== undefined ? sub.gradePoint : gradeToPoint(gradeStr),
                credits: Number(sub.credits) >= 0 ? Number(sub.credits) : 3,
                status: sub.status || 'Regular'
              };
            })
          : []
      }));

      await record.save();
    }

    const summary = calculateAcademicSummary(record.semesters);

    return res.status(200).json({
      success: true,
      message: 'Student academic records updated successfully in MongoDB.',
      academicRecord: record,
      academicRecords: record.semesters,
      summary
    });
  } catch (error) {
    console.error('Error updating student academic records:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update student academic records in MongoDB.'
    });
  }
});

/**
 * @route   GET /api/students/:studentId
 * @desc    Get specific student profile & academic records with isolation check
 * @access  Private (Student or Admin)
 */
router.get('/:studentId', protect, async (req, res) => {
  try {
    const { studentId } = req.params;

    if (req.user.role !== 'admin' && req.user._id.toString() !== studentId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You cannot view another student\'s profile.'
      });
    }

    const studentUser = await User.findById(studentId).select('-passwordHash');
    if (!studentUser) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    const record = await getRecord(studentId);
    const summary = calculateAcademicSummary(record.semesters);

    return res.status(200).json({
      success: true,
      student: studentUser.toPublicJSON(),
      academicRecord: record,
      summary
    });
  } catch (error) {
    console.error('Error fetching student by ID:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve student details.'
    });
  }
});

/**
 * @route   POST /api/students
 * @desc    Admin endpoint to create a student in MongoDB
 * @access  Private/Admin
 */
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const {
      name,
      rollNumber,
      email,
      password,
      university,
      regulation,
      branch,
      courseType,
      presentYear,
      presentSemester
    } = req.body;

    if (!name || !rollNumber || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, Roll Number, Email, and Password are required.'
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanRoll = rollNumber.trim().toUpperCase();

    const existingUser = await User.findOne({
      $or: [
        { loginId: cleanEmail },
        { email: cleanEmail },
        { rollNumber: cleanRoll }
      ]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: `Student with email "${cleanEmail}" or Roll Number "${cleanRoll}" already exists.`
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password.trim(), salt);

    const newUser = await User.create({
      loginId: cleanEmail,
      email: cleanEmail,
      passwordHash,
      name: name.trim(),
      rollNumber: cleanRoll,
      university: (university || 'JNTUK').trim(),
      regulation: (regulation || 'R20').trim(),
      branch: (branch || 'CSE').trim(),
      courseType: (courseType || 'B.Tech').trim(),
      presentYear: (presentYear || '1st Year').trim(),
      presentSemester: (presentSemester || '1st Semester').trim(),
      role: 'student'
    });

    await AcademicRecord.create({
      userId: newUser._id,
      semesters: []
    });

    return res.status(201).json({
      success: true,
      message: 'Student created successfully in MongoDB.',
      student: newUser.toPublicJSON()
    });
  } catch (error) {
    console.error('Error creating student:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create student account.'
    });
  }
});

export default router;
