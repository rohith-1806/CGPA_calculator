import express from 'express';
import mongoose from 'mongoose';
import AcademicRecord from '../models/AcademicRecord.js';
import { protect } from '../middleware/auth.js';
import { gradeToPoint, calculateAcademicSummary } from '../utils/calculations.js';

const router = express.Router();

const getRecord = async (userId) => {
  let rec = await AcademicRecord.findOne({ userId });
  if (!rec) rec = await AcademicRecord.create({ userId, semesters: [] });
  return rec;
};

router.get('/', protect, async (req, res) => {
  try {
    const record = await getRecord(req.user._id);
    const summary = calculateAcademicSummary(record.semesters);

    return res.status(200).json({
      success: true,
      academicRecord: record,
      summary
    });
  } catch (error) {
    console.error('Error fetching academic record:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving academic records.'
    });
  }
});

router.post('/semesters', protect, async (req, res) => {
  try {
    const { semesterName } = req.body;
    if (!semesterName || !semesterName.trim()) {
      return res.status(400).json({ success: false, message: 'Semester name is required.' });
    }

    const record = await getRecord(req.user._id);
    const cleanSemName = semesterName.trim();

    const exists = record.semesters.some(
      (s) => s.semesterName.toLowerCase() === cleanSemName.toLowerCase()
    );

    if (exists) {
      return res.status(400).json({
        success: false,
        message: `Semester "${cleanSemName}" already exists.`
      });
    }

    record.semesters.push({
      semesterName: cleanSemName,
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
    console.error('Error adding semester:', error);
    return res.status(500).json({ success: false, message: 'Failed to create semester.' });
  }
});

router.delete('/semesters/:semesterId', protect, async (req, res) => {
  try {
    const { semesterId } = req.params;
    const record = await getRecord(req.user._id);

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

router.post('/semesters/:semesterId/subjects', protect, async (req, res) => {
  try {
    const { semesterId } = req.params;
    const { subjectName, grade, credits, status } = req.body;

    if (!subjectName || !subjectName.trim()) {
      return res.status(400).json({ success: false, message: 'Subject name is required.' });
    }

    const record = await getRecord(req.user._id);
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
    console.error('Error adding subject:', error);
    return res.status(500).json({ success: false, message: 'Failed to add subject.' });
  }
});

router.put('/subjects/:subjectId', protect, async (req, res) => {
  try {
    const { subjectId } = req.params;
    const { subjectName, grade, credits, status } = req.body;

    const record = await getRecord(req.user._id);
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
    console.error('Error updating subject:', error);
    return res.status(500).json({ success: false, message: 'Failed to update subject.' });
  }
});

router.delete('/subjects/:subjectId', protect, async (req, res) => {
  try {
    const { subjectId } = req.params;
    const record = await getRecord(req.user._id);

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
    console.error('Error deleting subject:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete subject.' });
  }
});

export default router;
