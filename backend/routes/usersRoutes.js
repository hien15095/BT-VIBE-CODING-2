// Route quản lý user (admin)
const express = require('express');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const UsersController = require('../controllers/usersController');

const router = express.Router();

// GET /api/users
router.get('/', auth(['admin']), UsersController.getAll);

// POST /api/users
router.post('/', auth(['admin']), UsersController.create);

// POST /api/users/import
router.post('/import', auth(['admin']), upload.single('file'), UsersController.importCsv);

// PUT /api/users/:id
router.put('/:id', auth(['admin']), UsersController.update);

// DELETE /api/users/:id
router.delete('/:id', auth(['admin']), UsersController.remove);

module.exports = router;