const ForumPost = require('../models/ForumPost');
const ForumComment = require('../models/ForumComment');
const ForumCategory = require('../models/ForumCategory');
const { logger } = require('./logger');

// Check if user can post in category
exports.checkPostPermissions = async (req, res, next) => {
  try {
    const { category } = req.body;  // Fixed: Changed from categoryId to category
    
    if (!category) {
      return res.status(400).json({
        success: false,
        message: 'Category is required'
      });
    }

    const categoryDoc = await ForumCategory.findById(category);
    
    if (!categoryDoc) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check if category is active
    if (!categoryDoc.isActive) {
      return res.status(400).json({
        success: false,
        message: 'This category is not active'
      });
    }

    // Check if expert-only category
    if (categoryDoc.expertOnly && req.user.role !== 'expert' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only experts can post in this category'
      });
    }

    req.category = categoryDoc;
    next();
  } catch (error) {
    logger.error('Forum permission check error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error checking permissions'
    });
  }
};

// Check if user can moderate
exports.checkModerationRights = (req, res, next) => {
  try {
    const user = req.user;
    
    // Admins and experts can moderate
    if (user.role !== 'admin' && user.role !== 'expert') {
      return res.status(403).json({
        success: false,
        message: 'Only admins and experts can perform moderation'
      });
    }

    next();
  } catch (error) {
    logger.error('Moderation rights check error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error checking moderation rights'
    });
  }
};

// Check if post exists and user can access it
exports.checkPostAccess = async (req, res, next) => {
  try {
    const postId = req.params.postId || req.params.id;
    const user = req.user;
    
    const post = await ForumPost.findById(postId)
      .populate('author', 'name email role profilePicture')
      .populate('category', 'name slug expertOnly');
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if post is published or user has access
    if (post.status !== 'published') {
      // Only author, experts, and admins can see non-published posts
      const canAccess = user && (
        user.role === 'admin' || 
        user.role === 'expert' || 
        (post.author && post.author._id && post.author._id.toString() === user.id)
      );
      
      if (!canAccess) {
        return res.status(404).json({
          success: false,
          message: 'Post not found'
        });
      }
    }

    // Check if category is expert-only
    if (post.category && post.category.expertOnly && user.role !== 'expert' && user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access restricted to experts only'
      });
    }

    req.post = post;
    next();
  } catch (error) {
    logger.error('Post access check error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error checking post access'
    });
  }
};

// Check if comment exists and user can access it
exports.checkCommentAccess = async (req, res, next) => {
  try {
    const commentId = req.params.commentId || req.params.id;
    const user = req.user;
    
    const comment = await ForumComment.findById(commentId)
      .populate('author', 'name email role profilePicture')
      .populate('post', 'title category isLocked');
    
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Check if comment is published or user has access
    if (comment.status !== 'published') {
      const canAccess = user && (
        user.role === 'admin' || 
        user.role === 'expert' || 
        (comment.author && comment.author._id && comment.author._id.toString() === user.id)
      );
      
      if (!canAccess) {
        return res.status(404).json({
          success: false,
          message: 'Comment not found'
        });
      }
    }

    // Check if post is locked
    if (comment.post && comment.post.isLocked) {
      return res.status(400).json({
        success: false,
        message: 'This post is locked and cannot be commented on'
      });
    }

    req.comment = comment;
    next();
  } catch (error) {
    logger.error('Comment access check error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error checking comment access'
    });
  }
};

// Rate limiting for posts/comments
exports.rateLimit = (limit = 10, windowMs = 60 * 60 * 1000) => {
  const requests = new Map();
  
  return (req, res, next) => {
    try {
      const userId = req.user.id;
      const now = Date.now();
      
      if (!requests.has(userId)) {
        requests.set(userId, []);
      }
      
      const userRequests = requests.get(userId);
      
      // Clean old requests
      const recentRequests = userRequests.filter(time => now - time < windowMs);
      requests.set(userId, recentRequests);
      
      if (recentRequests.length >= limit) {
        return res.status(429).json({
          success: false,
          message: `Too many requests. Please try again in ${Math.ceil(windowMs / (60 * 1000))} minutes`
        });
      }
      
      recentRequests.push(now);
      next();
    } catch (error) {
      logger.error('Rate limit error:', error);
      // Don't block requests if rate limiting fails
      next();
    }
  };
};