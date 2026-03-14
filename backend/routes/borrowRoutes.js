// Route mượn/trả sách
const express = require('express');
const auth = require('../middleware/auth');
const BorrowController = require('../controllers/borrowController');

const router = express.Router();

// POST /api/borrow
router.post('/', auth(['librarian']), BorrowController.borrow);

// POST /api/borrow/return
router.post('/return', auth(['librarian']), BorrowController.returnBook);

module.exports = router;