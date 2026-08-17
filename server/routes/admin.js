import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import User from '../models/User.js';
import AcademicRecord from '../models/AcademicRecord.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { gradeToPoint, calculateAcademicSummary } from '../utils/calculations.js';
import { seedUsersFromExcel } from '../utils/seedExcelUsers.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const getJwtSecret = () => process.env.JWT_SECRET || 'growx_super_secret_jwt_key_2026_academic_platform';

/**
 * @route   POST /api/admin/login
 * @desc    Admin login route
 * @access  Public
 */
router.post('/login', async (req, res) => {
  try {
    const emailInput = (req.body.email || req.body.loginId || req.body.username || '').toString().trim().toLowerCase();
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
    let adminUser = null;
    if (mongoose.connection.readyState === 1 || mongoose.connection.readyState === 2) {
      adminUser = await User.findOne({ role: 'admin', loginId: expectedAdminEmail });
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
    }

    const adminId = adminUser ? adminUser._id.toString() : 'admin_default_id';
    const token = jwt.sign(
      { id: adminId, role: 'admin' },
      getJwtSecret(),
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      success: true,
      message: 'Admin login successful',
      token,
      user: {
        _id: adminId,
        name: adminUser ? adminUser.name : 'GrowX Administrator',
        email: expectedAdminEmail,
        role: 'admin'
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred during admin authentication.'
    });
  }
});

/**
 * @route   GET /api/admin/me
 * @desc    Get authenticated admin profile
 * @access  Private/Admin
 */
router.get('/me', protect, adminOnly, async (req, res) => {
  return res.status(200).json({
    success: true,
    user: {
      _id: req.user._id,
      name: req.user.name || 'GrowX Administrator',
      email: req.user.email || req.user.loginId || 'admin@mail.com',
      role: 'admin'
    }
  });
});

/**
 * @route   GET /api/admin/stats
 * @desc    Get dashboard metrics from MongoDB
 * @access  Private/Admin
 */
router.get('/stats', protect, adminOnly, async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: { $ne: 'admin' } });

    const records = await AcademicRecord.find({});
    let totalSemesters = 0;
    let totalSubjects = 0;
    let activeStudentsCount = 0;

    records.forEach((rec) => {
      if (rec.semesters && rec.semesters.length > 0) {
        activeStudentsCount++;
        totalSemesters += rec.semesters.length;
        rec.semesters.forEach((sem) => {
          if (sem.subjects) {
            totalSubjects += sem.subjects.length;
          }
        });
      }
    });

    return res.status(200).json({
      success: true,
      stats: {
        totalStudents,
        activeStudents: totalStudents,
        totalSemestersRecorded: totalSemesters,
        totalSubjectsRecorded: totalSubjects
      }
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to compute dashboard stats.'
    });
  }
});

/**
 * @route   GET /api/admin/students
 * @desc    Get all students with academic overview
 * @access  Private/Admin
 */
router.get('/students', protect, adminOnly, async (req, res) => {
  try {
    const studentUsers = await User.find({ role: { $ne: 'admin' } }).sort({ createdAt: -1 });

    const studentIds = studentUsers.map((u) => u._id);
    const academicRecords = await AcademicRecord.find({ userId: { $in: studentIds } });

    const recordsMap = new Map();
    academicRecords.forEach((rec) => {
      recordsMap.set(rec.userId.toString(), rec);
    });

    const studentsWithData = studentUsers.map((user) => {
      const rec = recordsMap.get(user._id.toString());
      const semesters = rec ? rec.semesters || [] : [];
      const summary = calculateAcademicSummary(semesters);

      // Latest SGPA if available
      let latestSgpa = 0;
      if (summary.semesters && summary.semesters.length > 0) {
        latestSgpa = summary.semesters[summary.semesters.length - 1].sgpa;
      }

      return {
        _id: user._id,
        name: user.name,
        rollNumber: user.rollNumber,
        email: user.email || user.loginId,
        loginId: user.loginId,
        presentYear: user.presentYear || '4th Year',
        presentSemester: user.presentSemester || '1st Semester',
        university: user.university || 'JNTUK',
        regulation: user.regulation || 'R20',
        branch: user.branch || 'CSE',
        courseType: user.courseType || 'B.Tech',
        status: user.createdAt ? 'Active' : 'Active',
        createdAt: user.createdAt,
        cgpa: summary.cgpa,
        sgpa: latestSgpa,
        backlogs: summary.backlogs,
        passedSubjects: summary.passed,
        totalSubjects: summary.totalSubjects,
        totalCredits: summary.totalCredits,
        classAwarded: summary.classAwarded
      };
    });

    return res.status(200).json({
      success: true,
      students: studentsWithData
    });
  } catch (error) {
    console.error('Error fetching students list:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve students list.'
    });
  }
});

/**
 * @route   POST /api/admin/students
 * @desc    Create a new student with empty academic record
 * @access  Private/Admin
 */
router.post('/students', protect, adminOnly, async (req, res) => {
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

    // Create fresh academic record with 0 semesters / subjects
    await AcademicRecord.create({
      userId: newUser._id,
      semesters: []
    });

    return res.status(201).json({
      success: true,
      message: 'Student account created successfully.',
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

/**
 * @route   GET /api/admin/students/:id
 * @desc    Get detailed student profile and academic record
 * @access  Private/Admin
 */
router.get('/students/:id', protect, adminOnly, async (req, res) => {
  try {
    const studentId = req.params.id;
    const student = await User.findById(studentId);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found.'
      });
    }

    let academicRecord = await AcademicRecord.findOne({ userId: studentId });
    if (!academicRecord) {
      academicRecord = await AcademicRecord.create({ userId: studentId, semesters: [] });
    }

    const summary = calculateAcademicSummary(academicRecord.semesters);

    return res.status(200).json({
      success: true,
      student: student.toPublicJSON(),
      academicRecord,
      summary
    });
  } catch (error) {
    console.error('Error fetching student details:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch student details.'
    });
  }
});

/**
 * @route   PUT /api/admin/students/:id
 * @desc    Update student profile fields
 * @access  Private/Admin
 */
router.put('/students/:id', protect, adminOnly, async (req, res) => {
  try {
    const studentId = req.params.id;
    const student = await User.findById(studentId);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found.'
      });
    }

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

    if (name !== undefined) student.name = name.trim();
    if (rollNumber !== undefined) student.rollNumber = rollNumber.trim().toUpperCase();
    if (email !== undefined) {
      const cleanEmail = email.trim().toLowerCase();
      student.loginId = cleanEmail;
      student.email = cleanEmail;
    }
    if (university !== undefined) student.university = university.trim();
    if (regulation !== undefined) student.regulation = regulation.trim();
    if (branch !== undefined) student.branch = branch.trim();
    if (courseType !== undefined) student.courseType = courseType.trim();
    if (presentYear !== undefined) student.presentYear = presentYear.trim();
    if (presentSemester !== undefined) student.presentSemester = presentSemester.trim();

    if (password && password.trim() !== '') {
      const salt = await bcrypt.genSalt(10);
      student.passwordHash = await bcrypt.hash(password.trim(), salt);
    }

    await student.save();

    return res.status(200).json({
      success: true,
      message: 'Student profile updated successfully.',
      student: student.toPublicJSON()
    });
  } catch (error) {
    console.error('Error updating student profile:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update student profile.'
    });
  }
});

/**
 * @route   DELETE /api/admin/students/:id
 * @desc    Delete student account and academic records safely
 * @access  Private/Admin
 */
router.delete('/students/:id', protect, adminOnly, async (req, res) => {
  try {
    const studentId = req.params.id;

    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found.'
      });
    }

    await User.findByIdAndDelete(studentId);
    await AcademicRecord.deleteOne({ userId: studentId });

    return res.status(200).json({
      success: true,
      message: `Student ${student.name} (${student.rollNumber}) deleted successfully.`
    });
  } catch (error) {
    console.error('Error deleting student:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete student record.'
    });
  }
});

/**
 * @route   GET /api/admin/students/:id/academic
 * @desc    Get student academic records
 * @access  Private/Admin
 */
router.get('/students/:id/academic', protect, adminOnly, async (req, res) => {
  try {
    const studentId = req.params.id;
    let record = await AcademicRecord.findOne({ userId: studentId });
    if (!record) {
      record = await AcademicRecord.create({ userId: studentId, semesters: [] });
    }

    const summary = calculateAcademicSummary(record.semesters);

    return res.status(200).json({
      success: true,
      academicRecord: record,
      summary
    });
  } catch (error) {
    console.error('Error fetching student academic record:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve academic records.'
    });
  }
});

/**
 * @route   POST /api/admin/students/:id/academic/semesters
 * @desc    Add a semester to student record
 * @access  Private/Admin
 */
router.post('/students/:id/academic/semesters', protect, adminOnly, async (req, res) => {
  try {
    const studentId = req.params.id;
    const { semesterName } = req.body;

    if (!semesterName || !semesterName.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Semester name is required.'
      });
    }

    let record = await AcademicRecord.findOne({ userId: studentId });
    if (!record) {
      record = await AcademicRecord.create({ userId: studentId, semesters: [] });
    }

    const cleanName = semesterName.trim();
    const exists = record.semesters.some(
      (s) => s.semesterName.toLowerCase() === cleanName.toLowerCase()
    );

    if (exists) {
      return res.status(400).json({
        success: false,
        message: `Semester "${cleanName}" already exists.`
      });
    }

    record.semesters.push({
      semesterName: cleanName,
      subjects: []
    });

    await record.save();
    const summary = calculateAcademicSummary(record.semesters);

    return res.status(201).json({
      success: true,
      message: 'Semester added successfully',
      academicRecord: record,
      summary
    });
  } catch (error) {
    console.error('Error adding semester via admin:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to add semester.'
    });
  }
});

/**
 * @route   PUT /api/admin/students/:id/academic/semesters/:semesterId
 * @desc    Edit semester name
 * @access  Private/Admin
 */
router.put('/students/:id/academic/semesters/:semesterId', protect, adminOnly, async (req, res) => {
  try {
    const { id: studentId, semesterId } = req.params;
    const { semesterName } = req.body;

    if (!semesterName || !semesterName.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Semester name is required.'
      });
    }

    const record = await AcademicRecord.findOne({ userId: studentId });
    if (!record) {
      return res.status(404).json({ success: false, message: 'Academic record not found.' });
    }

    const sem = record.semesters.id(semesterId);
    if (!sem) {
      return res.status(404).json({ success: false, message: 'Semester not found.' });
    }

    sem.semesterName = semesterName.trim();
    await record.save();

    const summary = calculateAcademicSummary(record.semesters);

    return res.status(200).json({
      success: true,
      message: 'Semester renamed successfully',
      academicRecord: record,
      summary
    });
  } catch (error) {
    console.error('Error renaming semester:', error);
    return res.status(500).json({ success: false, message: 'Failed to rename semester.' });
  }
});

/**
 * @route   DELETE /api/admin/students/:id/academic/semesters/:semesterId
 * @desc    Delete a semester from student record
 * @access  Private/Admin
 */
router.delete('/students/:id/academic/semesters/:semesterId', protect, adminOnly, async (req, res) => {
  try {
    const { id: studentId, semesterId } = req.params;

    const record = await AcademicRecord.findOne({ userId: studentId });
    if (!record) {
      return res.status(404).json({ success: false, message: 'Academic record not found.' });
    }

    const semIndex = record.semesters.findIndex((s) => s._id.toString() === semesterId);
    if (semIndex === -1) {
      return res.status(404).json({ success: false, message: 'Semester not found.' });
    }

    record.semesters.splice(semIndex, 1);
    await record.save();

    const summary = calculateAcademicSummary(record.semesters);

    return res.status(200).json({
      success: true,
      message: 'Semester deleted successfully',
      academicRecord: record,
      summary
    });
  } catch (error) {
    console.error('Error deleting semester:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete semester.' });
  }
});

/**
 * @route   POST /api/admin/students/:id/academic/semesters/:semesterId/subjects
 * @desc    Add a subject to a student's semester
 * @access  Private/Admin
 */
router.post('/students/:id/academic/semesters/:semesterId/subjects', protect, adminOnly, async (req, res) => {
  try {
    const { id: studentId, semesterId } = req.params;
    const { subjectName, grade, credits, status } = req.body;

    if (!subjectName || !subjectName.trim()) {
      return res.status(400).json({ success: false, message: 'Subject name is required.' });
    }

    const record = await AcademicRecord.findOne({ userId: studentId });
    if (!record) {
      return res.status(404).json({ success: false, message: 'Academic record not found.' });
    }

    const sem = record.semesters.id(semesterId);
    if (!sem) {
      return res.status(404).json({ success: false, message: 'Semester not found.' });
    }

    const cleanGrade = (grade || 'A').toString().trim().toUpperCase();
    const numCredits = Number(credits) >= 0 ? Number(credits) : 3;
    const gPoint = gradeToPoint(cleanGrade);

    sem.subjects.push({
      subjectName: subjectName.trim(),
      grade: cleanGrade,
      gradePoint: gPoint,
      credits: numCredits,
      status: status || 'Regular'
    });

    await record.save();
    const summary = calculateAcademicSummary(record.semesters);

    return res.status(201).json({
      success: true,
      message: 'Subject added successfully',
      academicRecord: record,
      summary
    });
  } catch (error) {
    console.error('Error adding subject via admin:', error);
    return res.status(500).json({ success: false, message: 'Failed to add subject.' });
  }
});

/**
 * @route   PUT /api/admin/students/:id/academic/subjects/:subjectId
 * @desc    Edit a subject in a student's academic record
 * @access  Private/Admin
 */
router.put('/students/:id/academic/subjects/:subjectId', protect, adminOnly, async (req, res) => {
  try {
    const { id: studentId, subjectId } = req.params;
    const { subjectName, grade, credits, status } = req.body;

    const record = await AcademicRecord.findOne({ userId: studentId });
    if (!record) {
      return res.status(404).json({ success: false, message: 'Academic record not found.' });
    }

    let targetSubject = null;
    for (const sem of record.semesters) {
      const sub = sem.subjects.id(subjectId);
      if (sub) {
        targetSubject = sub;
        break;
      }
    }

    if (!targetSubject) {
      return res.status(404).json({ success: false, message: 'Subject not found.' });
    }

    if (subjectName !== undefined) targetSubject.subjectName = subjectName.trim();
    if (grade !== undefined) {
      const cleanGrade = grade.toString().trim().toUpperCase();
      targetSubject.grade = cleanGrade;
      targetSubject.gradePoint = gradeToPoint(cleanGrade);
    }
    if (credits !== undefined) {
      targetSubject.credits = Number(credits) >= 0 ? Number(credits) : 0;
    }
    if (status !== undefined) {
      targetSubject.status = status;
    }

    await record.save();
    const summary = calculateAcademicSummary(record.semesters);

    return res.status(200).json({
      success: true,
      message: 'Subject updated successfully',
      academicRecord: record,
      summary
    });
  } catch (error) {
    console.error('Error updating subject via admin:', error);
    return res.status(500).json({ success: false, message: 'Failed to update subject.' });
  }
});

/**
 * @route   DELETE /api/admin/students/:id/academic/subjects/:subjectId
 * @desc    Delete a subject from a student's semester
 * @access  Private/Admin
 */
router.delete('/students/:id/academic/subjects/:subjectId', protect, adminOnly, async (req, res) => {
  try {
    const { id: studentId, subjectId } = req.params;

    const record = await AcademicRecord.findOne({ userId: studentId });
    if (!record) {
      return res.status(404).json({ success: false, message: 'Academic record not found.' });
    }

    let found = false;
    for (const sem of record.semesters) {
      const subIndex = sem.subjects.findIndex((s) => s._id.toString() === subjectId);
      if (subIndex !== -1) {
        sem.subjects.splice(subIndex, 1);
        found = true;
        break;
      }
    }

    if (!found) {
      return res.status(404).json({ success: false, message: 'Subject not found.' });
    }

    await record.save();
    const summary = calculateAcademicSummary(record.semesters);

    return res.status(200).json({
      success: true,
      message: 'Subject deleted successfully',
      academicRecord: record,
      summary
    });
  } catch (error) {
    console.error('Error deleting subject via admin:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete subject.' });
  }
});

/**
 * @route   POST /api/admin/import-users
 * @desc    Import users from login credentials.xlsx
 * @access  Private/Admin
 */
router.post('/import-users', protect, adminOnly, async (req, res) => {
  try {
    const excelPath = path.join(__dirname, '../data/login credentials.xlsx');
    const result = await seedUsersFromExcel(excelPath);

    return res.status(200).json({
      success: true,
      message: `User import successful: ${result.createdCount} created, ${result.updatedCount || 0} existing updated.`,
      result
    });
  } catch (error) {
    console.error('Error importing users via admin route:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to import users from Excel.'
    });
  }
});

export default router;
