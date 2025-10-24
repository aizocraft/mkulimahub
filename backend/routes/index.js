const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const logger = require('../middleware/logger');

// Apply logger to all routes
router.use(logger);

// API routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);

module.exports = router;