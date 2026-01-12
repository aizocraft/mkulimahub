// backend/routes/index.js
const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const bookingRoutes = require('./bookingRoutes');
const logRoutes = require('./logs');  
const dbRoutes = require('./dbRoutes');
const forumRoutes = require('./forumRoutes');

const { requestLogger, errorLogger } = require('../middleware/logger');

// Apply request logger to all routes
router.use(requestLogger);

// API routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/booking', bookingRoutes);
router.use('/logs', logRoutes); 
router.use('/db', dbRoutes); 
router.use('/forum', forumRoutes);

// Apply error logger (should be after all routes)
router.use(errorLogger);

module.exports = router;