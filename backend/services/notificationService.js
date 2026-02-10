const Notification = require('../models/Notification');
const User = require('../models/User');

class NotificationService {
  // Create a notification for a specific user
  static async createNotification(userId, type, title, message, data = {}, priority = 'medium') {
    try {
      const notification = await Notification.createNotification(userId, type, title, message, data, priority);
      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  // Create notification for multiple users (e.g., all farmers or experts)
  static async createBulkNotifications(userIds, type, title, message, data = {}, priority = 'medium') {
    try {
      const notifications = await Promise.all(
        userIds.map(userId =>
          Notification.createNotification(userId, type, title, message, data, priority)
        )
      );
      return notifications;
    } catch (error) {
      console.error('Error creating bulk notifications:', error);
      throw error;
    }
  }

  // Create notification for all users with a specific role
  static async createRoleBasedNotification(role, type, title, message, data = {}, priority = 'medium') {
    try {
      const users = await User.find({ role, isActive: true });
      const userIds = users.map(user => user._id);
      return this.createBulkNotifications(userIds, type, title, message, data, priority);
    } catch (error) {
      console.error('Error creating role-based notification:', error);
      throw error;
    }
  }

  // Create consultation-related notification
  static async createConsultationNotification(consultationId, userId, type, title, message, data = {}) {
    try {
      const notificationData = {
        consultationId,
        ...data
      };
      return this.createNotification(userId, 'consultation', title, message, notificationData, 'high');
    } catch (error) {
      console.error('Error creating consultation notification:', error);
      throw error;
    }
  }

  // Create forum-related notification
  static async createForumNotification(userId, title, message, data = {}) {
    try {
      return this.createNotification(userId, 'forum', title, message, data, 'medium');
    } catch (error) {
      console.error('Error creating forum notification:', error);
      throw error;
    }
  }

  // Create weather alert notification
  static async createWeatherAlert(userId, title, message, data = {}) {
    try {
      return this.createNotification(userId, 'weather', title, message, data, 'urgent');
    } catch (error) {
      console.error('Error creating weather alert:', error);
      throw error;
    }
  }

  // Create system notification
  static async createSystemNotification(userId, title, message, data = {}) {
    try {
      return this.createNotification(userId, 'system', title, message, data, 'medium');
    } catch (error) {
      console.error('Error creating system notification:', error);
      throw error;
    }
  }

  // Create admin notification
  static async createAdminNotification(userId, title, message, data = {}) {
    try {
      return this.createNotification(userId, 'admin', title, message, data, 'high');
    } catch (error) {
      console.error('Error creating admin notification:', error);
      throw error;
    }
  }

  // Get user notifications with filters
  static getUserNotifications(userId, filters = {}) {
    const query = { user: userId, ...filters };

    // Exclude expired notifications
    query.$or = [
      { expiresAt: { $exists: false } },
      { expiresAt: { $gt: new Date() } }
    ];

    return Notification.find(query);
  }

  // Mark notification as read
  static async markAsRead(notificationId, userId) {
    try {
      const notification = await Notification.findOneAndUpdate(
        { _id: notificationId, user: userId },
        { read: true, readAt: new Date() },
        { new: true }
      );
      return notification;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  // Delete notification
  static async deleteNotification(notificationId, userId) {
    try {
      const notification = await Notification.findOneAndDelete({
        _id: notificationId,
        user: userId
      });
      return notification;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }

  // Clean up expired notifications
  static async cleanupExpiredNotifications() {
    try {
      const result = await Notification.deleteMany({
        expiresAt: { $lt: new Date() }
      });
      console.log(`Cleaned up ${result.deletedCount} expired notifications`);
      return result;
    } catch (error) {
      console.error('Error cleaning up expired notifications:', error);
      throw error;
    }
  }
}

module.exports = NotificationService;
