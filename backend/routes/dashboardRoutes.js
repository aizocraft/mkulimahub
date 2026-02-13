const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// All dashboard routes require authentication
router.use(auth);

// Expert stats (requires auth only)
router.get('/expert-stats', dashboardController.getExpertStats);

// All other routes require admin role
router.use(admin);

// Get dashboard statistics
router.get('/stats', dashboardController.getDashboardStats);

// Get recent activities
router.get('/activities', dashboardController.getRecentActivities);

// Get user distribution
router.get('/user-distribution', dashboardController.getUserDistribution);

// Get analytics data for charts (admin only)
router.get('/analytics', dashboardController.getAnalyticsData);

module.exports = router;
