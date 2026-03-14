// Route trả sách (theo yêu cầu POST /return)
const express = require('express');
const auth = require('../middleware/auth');
const BorrowController = require('../controllers/borrowController');

const router = express.Router();

// POST /api/return
router.post('/', auth(['librarian']), BorrowController.returnBook);

module.exports = router;