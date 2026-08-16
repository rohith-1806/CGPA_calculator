import bcrypt from 'bcryptjs';
import { SEED_CREDENTIALS } from './seedExcelUsers.js';

export const inMemoryUsers = new Map();
export const inMemoryAcademicRecords = new Map();

export const initInMemoryStore = () => {
  inMemoryUsers.clear();
  inMemoryAcademicRecords.clear();

  SEED_CREDENTIALS.forEach((item) => {
    const userId = `mem_user_${item.rollNumber}`;
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(item.password, salt);

    const userObj = {
      _id: userId,
      name: item.name,
      loginId: item.loginId.toLowerCase(),
      email: item.loginId.toLowerCase(),
      rollNumber: item.rollNumber,
      passwordHash,
      presentYear: '4th Year',
      presentSemester: '1st Semester',
      role: 'student'
    };

    inMemoryUsers.set(userId, userObj);

    // Initial state: EMPTY academic record (0 semesters)
    inMemoryAcademicRecords.set(userId, {
      _id: `mem_academic_${item.rollNumber}`,
      userId: userId,
      semesters: []
    });
  });

  console.log(`In-Memory Fallback Store Initialized with ${inMemoryUsers.size} student accounts (All starting empty).`);
};

initInMemoryStore();
