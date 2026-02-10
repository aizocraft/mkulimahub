// backend/routes/index.js
const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const bookingRoutes = require('./bookingRoutes');
const logRoutes = require('./logs');  
const dbRoutes = require('./dbRoutes');
const forumRoutes = require('./forumRoutes');
const weatherRoutes = require('./weatherRoutes');
const videoCallRoutes = require('./videoCallRoutes');
const aiChatRoutes = require('./aiChatRoutes');
const uploadRoutes = require('./uploadRoutes');
const cropRoutes = require('./cropRoutes');
const mpesaRoutes = require('./mpesaRoutes');
const transactionRoutes = require('./transactionRoutes');
const dashboardRoutes = require('./dashboardRoutes');
const notificationRoutes = require('./notificationRoutes');

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
router.use('/weather', weatherRoutes);
router.use('/video', videoCallRoutes);
router.use('/ai', aiChatRoutes);
router.use('/uploads', uploadRoutes);
router.use('/crops', cropRoutes);
router.use('/mpesa', mpesaRoutes); 
router.use('/transactions', transactionRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/notifications', notificationRoutes);

// Apply error logger
router.use(errorLogger);

module.exports = router;