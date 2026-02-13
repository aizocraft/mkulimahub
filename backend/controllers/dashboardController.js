const User = require('../models/User');
const Consultation = require('../models/Consultation');
const Transaction = require('../models/Transaction');
const ForumPost = require('../models/ForumPost');
const ForumComment = require('../models/ForumComment');
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

// Get expert dashboard statistics
exports.getExpertStats = async (req, res, next) => {
  try {
    const expertId = req.user.id;
    logger.info('Fetching expert dashboard statistics', {
      expertId
    });

    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
    const currentWeekStart = new Date(now.setDate(now.getDate() - now.getDay()));
    currentWeekStart.setHours(0, 0, 0, 0);
    const previousWeekStart = new Date(currentWeekStart);
    previousWeekStart.setDate(previousWeekStart.getDate() - 7);
    const previousWeekEnd = new Date(currentWeekStart);
    previousWeekEnd.setMilliseconds(-1);

    // Total Consultations (completed)
    const totalConsultations = await Consultation.countDocuments({
      expert: expertId,
      status: 'completed'
    });

    // Total Forum Posts
    const totalForumPosts = await ForumPost.countDocuments({
      author: expertId
    });

    // Total Comments
    const totalComments = await ForumComment.countDocuments({
      author: expertId
    });

    // Earnings
    const mongoose = require('mongoose');
    const expertObjectId = new mongoose.Types.ObjectId(expertId);

    const totalEarningsAgg = await Transaction.aggregate([
      { $match: { expert: expertObjectId, status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalEarnings = totalEarningsAgg.length > 0 ? totalEarningsAgg[0].total : 0;

    const monthlyEarningsAgg = await Transaction.aggregate([
      { $match: { expert: expertObjectId, status: 'completed', createdAt: { $gte: currentMonthStart } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const monthlyEarnings = monthlyEarningsAgg.length > 0 ? monthlyEarningsAgg[0].total : 0;

    const last3MonthsEarningsAgg = await Transaction.aggregate([
      { $match: { expert: expertObjectId, status: 'completed', createdAt: { $gte: threeMonthsAgo } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const last3MonthsEarnings = last3MonthsEarningsAgg.length > 0 ? last3MonthsEarningsAgg[0].total : 0;

    // Average Rating (fetch from user model)
    const expert = await User.findById(expertId).select('rating');
    const avgRating = expert?.rating?.average || 0;
    const ratingCount = expert?.rating?.count || 0;

    // Percentage Changes
    // Consultations: current month vs previous month
    const currentMonthConsultations = await Consultation.countDocuments({
      expert: expertId,
      status: 'completed',
      createdAt: { $gte: currentMonthStart }
    });
    const previousMonthConsultations = await Consultation.countDocuments({
      expert: expertId,
      status: 'completed',
      createdAt: { $gte: previousMonthStart, $lt: currentMonthStart }
    });
    const consultationsChange = previousMonthConsultations > 0 ? ((currentMonthConsultations - previousMonthConsultations) / previousMonthConsultations * 100).toFixed(0) : (currentMonthConsultations > 0 ? 100 : 0);

    // Forum posts: current week vs previous week
    const currentWeekPosts = await ForumPost.countDocuments({
      author: expertId,
      createdAt: { $gte: currentWeekStart }
    });
    const previousWeekPosts = await ForumPost.countDocuments({
      author: expertId,
      createdAt: { $gte: previousWeekStart, $lt: currentWeekStart }
    });
    const postsChange = previousWeekPosts > 0 ? ((currentWeekPosts - previousWeekPosts) / previousWeekPosts * 100).toFixed(0) : (currentWeekPosts > 0 ? 100 : 0);

    // Monthly Earnings: current month vs previous month
    const previousMonthEarningsAgg = await Transaction.aggregate([
      { $match: { expert: expertId, status: 'completed', createdAt: { $gte: previousMonthStart, $lt: currentMonthStart } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const previousMonthEarnings = previousMonthEarningsAgg.length > 0 ? previousMonthEarningsAgg[0].total : 0;
    console.log('Previous Month Earnings Aggregation:', previousMonthEarningsAgg);
    console.log('Previous Month Earnings:', previousMonthEarnings);
    const earningsChange = previousMonthEarnings > 0 ? ((monthlyEarnings - previousMonthEarnings) / previousMonthEarnings * 100).toFixed(0) : (monthlyEarnings > 0 ? 100 : 0);

    const stats = {
      totalConsultations,
      totalConsultationsChange: parseInt(consultationsChange),
      totalForumPosts,
      totalForumPostsChange: parseInt(postsChange),
      totalComments,
      monthlyEarnings,
      monthlyEarningsChange: parseInt(earningsChange),
      last3MonthsEarnings,
      totalEarnings,
      averageRating: parseFloat(avgRating),
      ratingCount
    };

    logger.info('Expert dashboard statistics fetched successfully', {
      expertId,
      stats
    });

    res.status(200).json({
      success: true,
      stats
    });
  } catch (error) {
    logger.error('Error fetching expert dashboard statistics', {
      error: error.message,
      expertId: req.user.id,
      stack: error.stack
    });
    next(error);
  }
};

// Get expert reviews
exports.getExpertReviews = async (req, res, next) => {
  try {
    const expertId = req.user.id;
    logger.info('Fetching expert reviews', {
      expertId
    });

    // Get all completed consultations with reviews for this expert
    const consultations = await Consultation.find({
      expert: expertId,
      status: 'completed',
      rating: { $exists: true, $ne: null }
    })
      .populate('farmer', 'name')
      .sort({ reviewedAt: -1 });

    // Transform the data to match the frontend expected format
    const reviews = consultations.map(consultation => {
      const farmer = consultation.farmer;
      const farmerName = farmer?.name || 'Unknown Client';
      const farmerInitials = farmerName
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

      return {
        id: consultation._id,
        clientName: farmerName,
        clientInitials: farmerInitials,
        rating: consultation.rating,
        comment: consultation.review || '',
        date: consultation.reviewedAt ? consultation.reviewedAt.toISOString().split('T')[0] : consultation.updatedAt.toISOString().split('T')[0],
        consultationType: consultation.topic
      };
    });

    // Calculate stats
    const totalReviews = reviews.length;
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalReviews > 0 ? (totalRating / totalReviews).toFixed(1) : 0;

    const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(review => {
      if (ratingDistribution[review.rating] !== undefined) {
        ratingDistribution[review.rating]++;
      }
    });

    const stats = {
      averageRating: parseFloat(averageRating),
      totalReviews,
      ratingDistribution
    };

    logger.info('Expert reviews fetched successfully', {
      expertId,
      count: reviews.length
    });

    res.status(200).json({
      success: true,
      reviews,
      stats
    });
  } catch (error) {
    logger.error('Error fetching expert reviews', {
      error: error.message,
      expertId: req.user.id,
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

// Get analytics data for charts
exports.getAnalyticsData = async (req, res, next) => {
  try {
    logger.info('Fetching analytics data for charts', {
      requestedById: req.user.id
    });

    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const months = [];
    
    // Generate month labels for last 6 months
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        start: new Date(monthDate.getFullYear(), monthDate.getMonth(), 1),
        end: new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0),
        label: monthDate.toLocaleString('default', { month: 'short' })
      });
    }

    // Get monthly user registrations
    const userGrowth = await Promise.all(
      months.map(async (month) => {
        const count = await User.countDocuments({
          createdAt: { $gte: month.start, $lte: month.end }
        });
        return { month: month.label, users: count };
      })
    );

    // Get monthly consultation counts
    const consultations = await Promise.all(
      months.map(async (month) => {
        const count = await Consultation.countDocuments({
          createdAt: { $gte: month.start, $lte: month.end }
        });
        return { month: month.label, count };
      })
    );

    // Get monthly revenue
    const revenue = await Promise.all(
      months.map(async (month) => {
        const result = await Transaction.aggregate([
          {
            $match: {
              createdAt: { $gte: month.start, $lte: month.end },
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
        return { month: month.label, amount: result.length > 0 ? result[0].total : 0 };
      })
    );

    // Get activity distribution
    const totalUsers = await User.countDocuments({});
    const experts = await User.countDocuments({ role: 'expert' });
    const totalConsultations = await Consultation.countDocuments({});
    const totalTransactions = await Transaction.countDocuments({ status: 'completed' });

    const activity = [
      { name: 'Users', value: totalUsers, color: '#8884d8' },
      { name: 'Experts', value: experts, color: '#82ca9d' },
      { name: 'Consultations', value: totalConsultations, color: '#ffc658' },
      { name: 'Transactions', value: totalTransactions, color: '#ff7300' }
    ];

    // Get key metrics for cards
    const totalRevenueResult = await Transaction.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalRevenue = totalRevenueResult.length > 0 ? totalRevenueResult[0].total : 0;

    // Get active sessions (users active in last 24 hours)
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const activeSessions = await User.countDocuments({
      lastActive: { $gte: oneDayAgo }
    });

    const analyticsData = {
      userGrowth,
      consultations,
      revenue,
      activity,
      metrics: {
        totalUsers,
        totalConsultations,
        totalRevenue,
        activeSessions: activeSessions || Math.floor(totalUsers * 0.4) // Fallback estimate if lastActive not tracked
      }
    };

    logger.info('Analytics data fetched successfully', {
      requestedById: req.user.id,
      analyticsData
    });

    res.status(200).json({
      success: true,
      data: analyticsData
    });
  } catch (error) {
    logger.error('Error fetching analytics data', {
      error: error.message,
      requestedById: req.user.id,
      stack: error.stack
    });
    next(error);
  }
};
