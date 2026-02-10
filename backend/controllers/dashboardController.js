const User = require('../models/User');
const Consultation = require('../models/Consultation');
const Transaction = require('../models/Transaction');
const ForumPost = require('../models/ForumPost');
const { logger } = require('../middleware/logger');

// Get dashboard statistics
exports.getDashboardStats = async (req, res, next) => {
  try {
    logger.info('Fetching dashboard statistics', {
      requestedById: req.user.id
    });

    // Total users
    const totalUsers = await User.countDocuments({});

    // Total consultations
    const totalConsultations = await Consultation.countDocuments({});

    // Total revenue (sum of all completed transactions)
    const totalRevenue = await Transaction.aggregate([
      {
        $match: {
          status: 'completed'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);
    const revenue = totalRevenue.length > 0 ? totalRevenue[0].total : 0;

    // Forum activity (total posts + comments)
    const forumPosts = await ForumPost.countDocuments({});
    // Assuming ForumComment model exists
    const ForumComment = require('../models/ForumComment');
    const forumComments = await ForumComment.countDocuments({});
    const forumActivity = forumPosts + forumComments;

    // Calculate percentage changes compared to previous month
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    // New users this month vs previous month
    const currentMonthNewUsers = await User.countDocuments({ createdAt: { $gte: currentMonthStart } });
    const previousMonthNewUsers = await User.countDocuments({ createdAt: { $gte: previousMonthStart, $lt: currentMonthStart } });
    const totalUsersChange = previousMonthNewUsers > 0 ? ((currentMonthNewUsers - previousMonthNewUsers) / previousMonthNewUsers * 100).toFixed(2) : 0;

    // New consultations this month vs previous month
    const currentMonthNewConsultations = await Consultation.countDocuments({ createdAt: { $gte: currentMonthStart } });
    const previousMonthNewConsultations = await Consultation.countDocuments({ createdAt: { $gte: previousMonthStart, $lt: currentMonthStart } });
    const totalConsultationsChange = previousMonthNewConsultations > 0 ? ((currentMonthNewConsultations - previousMonthNewConsultations) / previousMonthNewConsultations * 100).toFixed(2) : 0;

    // Revenue this month vs previous month
    const currentMonthRevenueAgg = await Transaction.aggregate([
      { $match: { createdAt: { $gte: currentMonthStart }, status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const currentMonthRevenue = currentMonthRevenueAgg.length > 0 ? currentMonthRevenueAgg[0].total : 0;
    const previousMonthRevenueAgg = await Transaction.aggregate([
      { $match: { createdAt: { $gte: previousMonthStart, $lt: currentMonthStart }, status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const previousMonthRevenue = previousMonthRevenueAgg.length > 0 ? previousMonthRevenueAgg[0].total : 0;
    const totalRevenueChange = previousMonthRevenue > 0 ? ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue * 100).toFixed(2) : 0;

    // Forum activity this month vs previous month
    const currentMonthPosts = await ForumPost.countDocuments({ createdAt: { $gte: currentMonthStart } });
    const currentMonthComments = await ForumComment.countDocuments({ createdAt: { $gte: currentMonthStart } });
    const currentMonthActivity = currentMonthPosts + currentMonthComments;
    const previousMonthPosts = await ForumPost.countDocuments({ createdAt: { $gte: previousMonthStart, $lt: currentMonthStart } });
    const previousMonthComments = await ForumComment.countDocuments({ createdAt: { $gte: previousMonthStart, $lt: currentMonthStart } });
    const previousMonthActivity = previousMonthPosts + previousMonthComments;
    const forumActivityChange = previousMonthActivity > 0 ? ((currentMonthActivity - previousMonthActivity) / previousMonthActivity * 100).toFixed(2) : 0;

    const stats = {
      totalUsers,
      totalUsersChange: parseFloat(totalUsersChange),
      totalConsultations,
      totalConsultationsChange: parseFloat(totalConsultationsChange),
      totalRevenue: revenue,
      totalRevenueChange: parseFloat(totalRevenueChange),
      forumActivity,
      forumActivityChange: parseFloat(forumActivityChange)
    };

    logger.info('Dashboard statistics fetched successfully', {
      requestedById: req.user.id,
      stats
    });

    res.status(200).json({
      success: true,
      stats
    });
  } catch (error) {
    logger.error('Error fetching dashboard statistics', {
      error: error.message,
      requestedById: req.user.id,
      stack: error.stack
    });
    next(error);
  }
};

// Get recent activities
exports.getRecentActivities = async (req, res, next) => {
  try {
    logger.info('Fetching recent activities', {
      requestedById: req.user.id
    });

    const activities = [];

    // Recent user registrations
    const recentUsers = await User.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(2)
      .select('name createdAt');

    recentUsers.forEach(user => {
      activities.push({
        id: `user-${user._id}`,
        action: 'New farmer registered',
        user: user.name,
        time: formatTimeAgo(user.createdAt),
        type: 'user'
      });
    });

    // Recent consultations
    const recentConsultations = await Consultation.find()
      .sort({ createdAt: -1 })
      .limit(2)
      .populate('farmer', 'name')
      .populate('expert', 'name');

    recentConsultations.forEach(consultation => {
      activities.push({
        id: `consultation-${consultation._id}`,
        action: 'Expert consultation completed',
        user: consultation.expert?.name || 'Expert',
        time: formatTimeAgo(consultation.createdAt),
        type: 'consultation'
      });
    });

    // Recent forum posts
    const recentPosts = await ForumPost.find()
      .sort({ createdAt: -1 })
      .limit(2)
      .populate('author', 'name');

    recentPosts.forEach(post => {
      activities.push({
        id: `post-${post._id}`,
        action: 'New forum post created',
        user: post.author?.name || 'User',
        time: formatTimeAgo(post.createdAt),
        type: 'forum'
      });
    });

    // Sort activities by time (most recent first)
    activities.sort((a, b) => new Date(b.time) - new Date(a.time));

    // Take top 5
    const topActivities = activities.slice(0, 5);

    logger.info('Recent activities fetched successfully', {
      requestedById: req.user.id,
      count: topActivities.length
    });

    res.status(200).json({
      success: true,
      activities: topActivities
    });
  } catch (error) {
    logger.error('Error fetching recent activities', {
      error: error.message,
      requestedById: req.user.id,
      stack: error.stack
    });
    next(error);
  }
};

// Get user distribution by role
exports.getUserDistribution = async (req, res, next) => {
  try {
    logger.info('Fetching user distribution', {
      requestedById: req.user.id
    });

    // Count users by role
    const farmers = await User.countDocuments({ role: 'farmer' });
    const experts = await User.countDocuments({ role: 'expert' });
    const admins = await User.countDocuments({ role: 'admin' });
    const totalUsers = farmers + experts + admins;

    const distribution = {
      farmers,
      experts,
      admins,
      totalUsers,
      farmerPercentage: totalUsers > 0 ? (farmers / totalUsers * 100).toFixed(1) : 0,
      expertPercentage: totalUsers > 0 ? (experts / totalUsers * 100).toFixed(1) : 0,
      adminPercentage: totalUsers > 0 ? (admins / totalUsers * 100).toFixed(1) : 0
    };

    logger.info('User distribution fetched successfully', {
      requestedById: req.user.id,
      distribution
    });

    res.status(200).json({
      success: true,
      distribution
    });
  } catch (error) {
    logger.error('Error fetching user distribution', {
      error: error.message,
      requestedById: req.user.id,
      stack: error.stack
    });
    next(error);
  }
};

// Helper function to format time ago
function formatTimeAgo(date) {
  const now = new Date();
  const diffInMs = now - date;
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInHours < 1) return 'Just now';
  if (diffInHours < 24) return `${diffInHours} hours ago`;
  return `${diffInDays} days ago`;
}
