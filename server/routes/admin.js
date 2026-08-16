import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { protect, adminOnly } from '../middleware/auth.js';
import { seedUsersFromExcel } from '../utils/seedExcelUsers.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
      message: `User import successful: ${result.createdCount} created, ${result.skippedCount} existing skipped.`,
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
