// Route quản lý chuyên ngành
const express = require('express');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const CategoriesController = require('../controllers/categoriesController');

const router = express.Router();

// GET /api/categories
// Cho phép reader xem danh sách chuyên ngành để lọc sách
router.get('/', auth(['admin', 'librarian', 'reader']), CategoriesController.getAll);

// POST /api/categories
router.post('/', auth(['admin', 'librarian']), CategoriesController.create);

// POST /api/categories/import
router.post('/import', auth(['admin', 'librarian']), upload.single('file'), CategoriesController.importCsv);

// PUT /api/categories/:id
router.put('/:id', auth(['admin', 'librarian']), CategoriesController.update);

// DELETE /api/categories/:id
router.delete('/:id', auth(['admin', 'librarian']), CategoriesController.remove);

module.exports = router;
