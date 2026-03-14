// Route quản lý bản sao sách
const express = require('express');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const CopiesController = require('../controllers/copiesController');

const router = express.Router();

// GET /api/copies
router.get('/', auth(['admin', 'librarian']), CopiesController.getAll);

// POST /api/copies
router.post('/', auth(['admin', 'librarian']), CopiesController.create);

// POST /api/copies/import
router.post('/import', auth(['admin', 'librarian']), upload.single('file'), CopiesController.importCsv);

// PUT /api/copies/:id
router.put('/:id', auth(['admin', 'librarian']), CopiesController.update);

// DELETE /api/copies/:id
router.delete('/:id', auth(['admin', 'librarian']), CopiesController.remove);

module.exports = router;