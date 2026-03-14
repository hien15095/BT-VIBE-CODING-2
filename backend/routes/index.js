// Tổng hợp route chính
const express = require('express');

const authRoutes = require('./authRoutes');
const readerAuthRoutes = require('./readerAuthRoutes');
const readersRoutes = require('./readersRoutes');
const categoriesRoutes = require('./categoriesRoutes');
const booksRoutes = require('./booksRoutes');
const copiesRoutes = require('./copiesRoutes');
const borrowRoutes = require('./borrowRoutes');
const returnRoutes = require('./returnRoutes');
const reportsRoutes = require('./reportsRoutes');
const usersRoutes = require('./usersRoutes');
const readerPortalRoutes = require('./readerPortalRoutes');
const borrowRequestsRoutes = require('./borrowRequestsRoutes');

const router = express.Router();

// Các nhóm route
router.use('/auth', authRoutes);
router.use('/reader-auth', readerAuthRoutes);
router.use('/readers', readersRoutes);
router.use('/categories', categoriesRoutes);
router.use('/books', booksRoutes);
router.use('/copies', copiesRoutes);
router.use('/borrow', borrowRoutes);
router.use('/return', returnRoutes);
router.use('/borrow-requests', borrowRequestsRoutes);
router.use('/reports', reportsRoutes);
router.use('/users', usersRoutes);
router.use('/reader', readerPortalRoutes);

module.exports = router;
