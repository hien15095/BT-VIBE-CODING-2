// Route cho sinh viên (reader portal)
const express = require('express');
const auth = require('../middleware/auth');
const ReaderPortalController = require('../controllers/readerPortalController');

const router = express.Router();

// GET /api/reader/books
router.get('/books', auth(['reader']), ReaderPortalController.listBooks);

// GET /api/reader/borrow
router.get('/borrow', auth(['reader']), ReaderPortalController.myBorrow);

// POST /api/reader/requests
router.post('/requests', auth(['reader']), ReaderPortalController.requestBorrow);

// GET /api/reader/requests
router.get('/requests', auth(['reader']), ReaderPortalController.myRequests);

// DELETE /api/reader/requests/:id
router.delete('/requests/:id', auth(['reader']), ReaderPortalController.cancelRequest);

// GET /api/reader/profile
router.get('/profile', auth(['reader']), ReaderPortalController.profile);

// POST /api/reader/change-password
router.post('/change-password', auth(['reader']), ReaderPortalController.changePassword);

// GET /api/reader/summary
router.get('/summary', auth(['reader']), ReaderPortalController.summary);

module.exports = router;
