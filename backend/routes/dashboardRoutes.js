const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// All dashboard routes require authentication and admin role
router.use(auth);
router.use(admin);

// Get dashboard statistics
router.get('/stats', dashboardController.getDashboardStats);

// Get recent activities
router.get('/activities', dashboardController.getRecentActivities);

// Get user distribution
router.get('/user-distribution', dashboardController.getUserDistribution);

module.exports = router;
