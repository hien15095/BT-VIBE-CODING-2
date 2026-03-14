// Route quản lý đầu sách
const express = require('express');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const BooksController = require('../controllers/booksController');

const router = express.Router();

// GET /api/books
router.get('/', auth(['admin', 'librarian']), BooksController.getAll);

// POST /api/books
router.post('/', auth(['admin', 'librarian']), BooksController.create);

// POST /api/books/import
router.post('/import', auth(['admin', 'librarian']), upload.single('file'), BooksController.importCsv);

// PUT /api/books/:id
router.put('/:id', auth(['admin', 'librarian']), BooksController.update);

// DELETE /api/books/:id
router.delete('/:id', auth(['admin', 'librarian']), BooksController.remove);

module.exports = router;