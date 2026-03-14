// Route quản lý yêu cầu mượn sách (staff)
const express = require('express');
const auth = require('../middleware/auth');
const BorrowRequestsController = require('../controllers/borrowRequestsController');

const router = express.Router();

// GET /api/borrow-requests
router.get('/', auth(['admin', 'librarian']), BorrowRequestsController.getAll);

// POST /api/borrow-requests/:id/approve
router.post('/:id/approve', auth(['admin', 'librarian']), BorrowRequestsController.approve);

// POST /api/borrow-requests/:id/reject
router.post('/:id/reject', auth(['admin', 'librarian']), BorrowRequestsController.reject);

module.exports = router;
