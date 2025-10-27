// backend/routes/index.js
const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const logRoutes = require('./logs'); // Add this line
const { requestLogger, errorLogger } = require('../middleware/logger');

// Apply request logger to all routes
router.use(requestLogger);

// API routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/logs', logRoutes); // Add this line

// Apply error logger (should be after all routes)
router.use(errorLogger);

module.exports = router;