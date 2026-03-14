// Route báo cáo thống kê
const express = require('express');
const auth = require('../middleware/auth');
const ReportsController = require('../controllers/reportsController');

const router = express.Router();

// GET /api/reports/most-borrowed
router.get('/most-borrowed', auth(['admin', 'leader', 'librarian']), ReportsController.mostBorrowed);

// GET /api/reports/unreturned
router.get('/unreturned', auth(['admin', 'leader', 'librarian']), ReportsController.unreturned);

// GET /api/reports/summary
router.get('/summary', auth(['admin', 'leader', 'librarian']), ReportsController.summary);

// GET /api/reports/borrow-trend
router.get('/borrow-trend', auth(['admin', 'leader', 'librarian']), ReportsController.borrowTrend);

module.exports = router;
