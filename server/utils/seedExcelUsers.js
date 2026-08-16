import fs from 'fs';
import path from 'path';
import xlsx from 'xlsx';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import AcademicRecord from '../models/AcademicRecord.js';

export const SEED_CREDENTIALS = [
  { sno: 1, name: "VETTI AMBIKA", loginId: "vettiambika1@gmail.com", rollNumber: "23351A6101", password: "23351a6101" },
  { sno: 2, name: "TOTAKURA AMRUTHA VARSHINI", loginId: "amruthathotakura66@gmail.com", rollNumber: "23351A6102", password: "23351a6102" },
  { sno: 3, name: "NUKATHOTI ANITHA", loginId: "nukathotipothaiah126@gmail.com", rollNumber: "23351A6103", password: "23351a6103" },
  { sno: 4, name: "MULINTI DAVAMSHU SHASHANK", loginId: "davamshushashank383@gmail.com", rollNumber: "23351A6105", password: "23351a6105" },
  { sno: 5, name: "GUDURU DHARANI", loginId: "dharaniguduru156@gmail.com", rollNumber: "23351A6106", password: "23351a6106" },
  { sno: 6, name: "CHILAKALA HARI KRISHNA", loginId: "chilakalaharikrishna7@gmail.com", rollNumber: "23351A6107", password: "23351a6107" },
  { sno: 7, name: "OBANNAGARI HEMARAJ", loginId: "hemrajo897@gmail.com", rollNumber: "23351A6108", password: "23351a6108" },
  { sno: 8, name: "PALLEPOGU KAVITHA", loginId: "kavithapallepogu06@gmail.com", rollNumber: "23351A6109", password: "23351a6109" },
  { sno: 9, name: "NUKATHOTI LAKSHMI PUJITHA", loginId: "nlakshmipoojitha21@gmail.com", rollNumber: "23351A6110", password: "23351a6110" },
  { sno: 10, name: "BIRRE MADHAVI", loginId: "madhavibirre@gmail.com", rollNumber: "23351A6111", password: "23351a6111" },
  { sno: 11, name: "DUGGINENI NAGESWARI", loginId: "dnageswari06@gmail.com", rollNumber: "23351A6112", password: "23351a6112" },
  { sno: 12, name: "ADDIKAM PAVAN KALYAN", loginId: "pavanaddikam005@gmail.com", rollNumber: "23351A6113", password: "23351a6113" },
  { sno: 13, name: "PERUMALLA ROHITH", loginId: "rohith46181@gmail.com", rollNumber: "23351A6115", password: "23351a6115" },
  { sno: 14, name: "BODDU SAILAJA", loginId: "boddusailaja1@gmail.com", rollNumber: "23351A6116", password: "23351a6116" },
  { sno: 15, name: "SHAIK TASLEEM SULTHANA", loginId: "tasleemsulthanashaik77@gmail.com", rollNumber: "23351A6117", password: "23351a6117" },
  { sno: 16, name: "YABUTAM UMA DEVI", loginId: "yabutamumadevi9@gmail.com", rollNumber: "23351A6118", password: "23351a6118" },
  { sno: 17, name: "H VASANTHA", loginId: "vasanthavasantha2701@gmail.com", rollNumber: "23351A6119", password: "23351a6119" }
];

export const ensureExcelFileExists = (targetPath) => {
  const dir = path.dirname(targetPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const excelData = SEED_CREDENTIALS.map((item) => ({
    'S.NO': item.sno,
    NAME: item.name,
    'LOGIN ID': item.loginId,
    'ROLL NUMBER': item.rollNumber,
    PASSWORD: item.password
  }));

  const worksheet = xlsx.utils.json_to_sheet(excelData);
  const workbook = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(workbook, worksheet, 'Credentials');

  xlsx.writeFile(workbook, targetPath);
};

export const seedUsersFromExcel = async (filePath) => {
  try {
    ensureExcelFileExists(filePath);

    let createdCount = 0;
    let updatedCount = 0;

    const validLoginIds = SEED_CREDENTIALS.map(c => c.loginId.toLowerCase());

    for (const item of SEED_CREDENTIALS) {
      const cleanLoginId = item.loginId.toLowerCase();
      let user = await User.findOne({
        $or: [
          { loginId: cleanLoginId },
          { email: cleanLoginId },
          { rollNumber: item.rollNumber }
        ]
      });

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(item.password, salt);

      if (!user) {
        user = await User.create({
          loginId: cleanLoginId,
          email: cleanLoginId,
          passwordHash,
          name: item.name,
          rollNumber: item.rollNumber,
          presentYear: '4th Year',
          presentSemester: '1st Semester',
          role: 'student'
        });
        createdCount++;
      } else {
        user.name = item.name;
        user.loginId = cleanLoginId;
        user.email = cleanLoginId;
        user.rollNumber = item.rollNumber;
        user.passwordHash = passwordHash;
        await user.save();
        updatedCount++;
      }

      // Ensure every user has an AcademicRecord document
      const rec = await AcademicRecord.findOne({ userId: user._id });
      if (!rec) {
        await AcademicRecord.create({ userId: user._id, semesters: [] });
      }
    }

    console.log(`JSON Seed Engine: Successfully seeded all ${SEED_CREDENTIALS.length} approved GrowX student accounts into MongoDB (${createdCount} created, ${updatedCount} updated).`);
    return { createdCount, updatedCount };
  } catch (error) {
    console.error('Error seeding users from JSON:', error.message);
    throw error;
  }
};
