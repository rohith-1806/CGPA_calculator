export const GRADE_DETAILS = {
  S: { label: 'S (Superior)', point: 10, marks: '90 & above', color: '#10B981', bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.4)' },
  A: { label: 'A (Excellent)', point: 9, marks: '80–89', color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.15)', border: 'rgba(59, 130, 246, 0.4)' },
  B: { label: 'B (Very Good)', point: 8, marks: '70–79', color: '#6366F1', bg: 'rgba(99, 102, 241, 0.15)', border: 'rgba(99, 102, 241, 0.4)' },
  C: { label: 'C (Good)', point: 7, marks: '60–69', color: '#06B6D4', bg: 'rgba(6, 182, 212, 0.15)', border: 'rgba(6, 182, 212, 0.4)' },
  D: { label: 'D (Average)', point: 6, marks: '50–59', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.4)' },
  E: { label: 'E (Pass)', point: 5, marks: '40–49', color: '#D97706', bg: 'rgba(217, 119, 6, 0.15)', border: 'rgba(217, 119, 6, 0.4)' },
  F: { label: 'F (Fail)', point: 0, marks: 'Below 40', color: '#F43F5E', bg: 'rgba(244, 63, 94, 0.15)', border: 'rgba(244, 63, 94, 0.4)' },
  Ab: { label: 'Ab (Absent)', point: 0, marks: 'Absent', color: '#EF4444', bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.4)' }
};

export const getGradeConfig = (grade = '') => {
  const g = grade.trim().toUpperCase();
  if (g === 'AB') return GRADE_DETAILS.Ab;
  return GRADE_DETAILS[g] || GRADE_DETAILS.A;
};

export const calculatePercentage = (cgpa) => {
  const num = Number(cgpa) || 0;
  if (num === 0) return 0;
  const pct = (num - 0.5) * 10;
  return Number(Math.max(0, pct).toFixed(2));
};

export const getClassAwarded = (cgpa, backlogs = 0) => {
  const val = Number(cgpa) || 0;
  if (val < 5.0 || backlogs > 0) {
    return backlogs > 0 ? `Fail (${backlogs} Backlog${backlogs > 1 ? 's' : ''})` : 'Fail / Below 5.0';
  }
  if (val >= 7.5) return 'First Class with Distinction';
  if (val >= 6.5) return 'First Class';
  if (val >= 5.5) return 'Second Class';
  if (val >= 5.0) return 'Pass Class';
  return 'Fail';
};
