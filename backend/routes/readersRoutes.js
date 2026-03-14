// Route quản lý độc giả
const express = require('express');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const ReadersController = require('../controllers/readersController');

const router = express.Router();

// GET /api/readers
router.get('/', auth(['admin', 'librarian']), ReadersController.getAll);

// POST /api/readers
router.post('/', auth(['admin', 'librarian']), ReadersController.create);

// POST /api/readers/import
router.post('/import', auth(['admin', 'librarian']), upload.single('file'), ReadersController.importCsv);

// PUT /api/readers/:id
router.put('/:id', auth(['admin', 'librarian']), ReadersController.update);

// DELETE /api/readers/:id
router.delete('/:id', auth(['admin', 'librarian']), ReadersController.remove);

module.exports = router;
