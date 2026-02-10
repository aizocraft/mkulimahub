const express = require('express');
const router = express.Router();
const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createNotification,
  getNotificationsByType
} = require('../controllers/notificationController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// All notification routes require authentication
router.use(auth);

// User routes
router.get('/', getNotifications);
router.get('/unread-count', getUnreadCount);
router.put('/read-all', markAllAsRead);
router.put('/:notificationId/read', markAsRead);
router.delete('/:notificationId', deleteNotification);

// Admin routes
router.post('/', admin, createNotification);
router.get('/type/:type', admin, getNotificationsByType);

module.exports = router;
