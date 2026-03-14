// Route đăng nhập cho sinh viên
const express = require('express');
const ReaderAuthController = require('../controllers/readerAuthController');

const router = express.Router();

// POST /api/reader-auth/login
router.post('/login', ReaderAuthController.login);

module.exports = router;