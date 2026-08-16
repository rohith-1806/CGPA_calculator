export const gradeToPoint = (grade) => {
  if (!grade) return 0;
  const g = grade.toString().trim().toUpperCase();
  switch (g) {
    case 'S': return 10;
    case 'A': return 9;
    case 'B': return 8;
    case 'C': return 7;
    case 'D': return 6;
    case 'E': return 5;
    case 'F': return 0;
    case 'AB': return 0;
    default: return 0;
  }
};

export const getClassAwarded = (cgpa, backlogs) => {
  if (backlogs > 0 || !cgpa || cgpa <= 0) return 'Not Eligible / Fail';
  if (cgpa >= 7.5) return 'First Class with Distinction';
  if (cgpa >= 6.5) return 'First Class';
  if (cgpa >= 5.5) return 'Second Class';
  if (cgpa >= 5.0) return 'Pass Class';
  return 'Not Eligible / Fail';
};

export const calculateAcademicSummary = (semesters = []) => {
  if (!Array.isArray(semesters) || semesters.length === 0) {
    return {
      totalSubjects: 0,
      passed: 0,
      backlogs: 0,
      totalCredits: 0,
      totalSemesters: 0,
      cgpa: 0,
      percentage: 0,
      classAwarded: 'Not Available',
      semesters: []
    };
  }

  let totalWeightedPoints = 0;
  let totalCredits = 0;
  let totalSubjects = 0;
  let passedCount = 0;
  let backlogsCount = 0;

  const semesterSummaries = semesters.map((sem) => {
    let semWeightedPoints = 0;
    let semCredits = 0;
    const subjects = sem.subjects || [];

    subjects.forEach((sub) => {
      totalSubjects++;
      const credits = Number(sub.credits) >= 0 ? Number(sub.credits) : 0;
      const gPoint = sub.gradePoint !== undefined ? sub.gradePoint : gradeToPoint(sub.grade);

      const upperGrade = (sub.grade || '').toString().trim().toUpperCase();
      if (upperGrade === 'F' || upperGrade === 'AB') {
        backlogsCount++;
      } else {
        passedCount++;
      }

      semWeightedPoints += credits * gPoint;
      semCredits += credits;
    });

    totalWeightedPoints += semWeightedPoints;
    totalCredits += semCredits;

    const sgpa = semCredits > 0 ? Number((semWeightedPoints / semCredits).toFixed(2)) : 0;

    return {
      _id: sem._id,
      semesterName: sem.semesterName,
      sgpa,
      credits: semCredits,
      subjectCount: subjects.length
    };
  });

  const cgpa = totalCredits > 0 ? Number((totalWeightedPoints / totalCredits).toFixed(2)) : 0;
  const percentage = cgpa > 0 ? Number(((cgpa - 0.5) * 10).toFixed(2)) : 0;
  const classAwarded = getClassAwarded(cgpa, backlogsCount);

  return {
    totalSubjects,
    passed: passedCount,
    backlogs: backlogsCount,
    totalCredits,
    totalSemesters: semesters.length,
    cgpa,
    percentage,
    classAwarded: totalSubjects > 0 ? classAwarded : 'Not Available',
    semesters: semesterSummaries
  };
};
