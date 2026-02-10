const ForumPost = require('../models/ForumPost');
const ForumComment = require('../models/ForumComment');
const ForumCategory = require('../models/ForumCategory');
const { logger } = require('../middleware/logger');
const NotificationService = require('../services/notificationService');

// Get posts/comments pending review
exports.getPendingReviews = async (req, res, next) => {
  try {
    const { type = 'posts', page = 1, limit = 20 } = req.query;
    const user = req.user;
    
    let items = [];
    let total = 0;
    
    if (type === 'posts' || type === 'both') {
      const posts = await ForumPost.find({ status: 'pending_review' })
        .populate('author', 'name email role profilePicture')
        .populate('category', 'name slug')
        .sort({ createdAt: 1 })
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit));
      
      items.push(...posts.map(post => ({
        type: 'post',
        item: post,
        createdAt: post.createdAt
      })));
      
      total += await ForumPost.countDocuments({ status: 'pending_review' });
    }
    
    if (type === 'comments' || type === 'both') {
      const comments = await ForumComment.find({ status: 'pending_review' })
        .populate('author', 'name email role profilePicture')
        .populate('post', 'title')
        .sort({ createdAt: 1 })
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit));
      
      items.push(...comments.map(comment => ({
        type: 'comment',
        item: comment,
        createdAt: comment.createdAt
      })));
      
      total += await ForumComment.countDocuments({ status: 'pending_review' });
    }
    
    // Sort by creation date
    items.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    
    logger.info('Pending reviews fetched', {
      moderatorId: user.id,
      type,
      count: items.length
    });
    
    res.status(200).json({
      success: true,
      count: items.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      items
    });
  } catch (error) {
    logger.error('Error fetching pending reviews:', error);
    next(error);
  }
};

// Approve post/comment
exports.approveContent = async (req, res, next) => {
  try {
    const { type, id } = req.params;
    const { reviewNotes } = req.body;
    const user = req.user;
    
    if (!['post', 'comment'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid type. Must be "post" or "comment"'
      });
    }
    
    let content;
    let model;
    
    if (type === 'post') {
      model = ForumPost;
    } else {
      model = ForumComment;
    }
    
    content = await model.findById(id);
    
    if (!content) {
      return res.status(404).json({
        success: false,
        message: `${type} not found`
      });
    }
    
    if (content.status !== 'pending_review') {
      return res.status(400).json({
        success: false,
        message: `${type} is not pending review`
      });
    }
    
    // Update moderation status
    content.status = 'published';
    content.moderationStatus = {
      reviewedBy: user.id,
      reviewedAt: new Date(),
      reviewNotes: reviewNotes || '',
      rejectionReason: null
    };
    
    await content.save();
    
    // Populate for response
    await content.populate('author', 'name email');
    
    logger.info('Content approved', {
      moderatorId: user.id,
      moderatorRole: user.role,
      contentType: type,
      contentId: id,
      authorId: content.author._id
    });
    
    res.status(200).json({
      success: true,
      message: `${type} approved successfully`,
      content
    });
  } catch (error) {
    logger.error('Error approving content:', error);
    next(error);
  }
};

// Reject post/comment
exports.rejectContent = async (req, res, next) => {
  try {
    const { type, id } = req.params;
    const { rejectionReason } = req.body;
    const user = req.user;
    
    if (!['post', 'comment'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid type. Must be "post" or "comment"'
      });
    }
    
    if (!rejectionReason) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required'
      });
    }
    
    let content;
    let model;
    
    if (type === 'post') {
      model = ForumPost;
    } else {
      model = ForumComment;
    }
    
    content = await model.findById(id);
    
    if (!content) {
      return res.status(404).json({
        success: false,
        message: `${type} not found`
      });
    }
    
    if (content.status !== 'pending_review') {
      return res.status(400).json({
        success: false,
        message: `${type} is not pending review`
      });
    }
    
    // Update moderation status
    content.status = 'rejected';
    content.moderationStatus = {
      reviewedBy: user.id,
      reviewedAt: new Date(),
      reviewNotes: null,
      rejectionReason
    };
    
    await content.save();

    // Populate for response
    await content.populate('author', 'name email');

    logger.info('Content rejected', {
      moderatorId: user.id,
      moderatorRole: user.role,
      contentType: type,
      contentId: id,
      authorId: content.author._id,
      rejectionReason
    });

    res.status(200).json({
      success: true,
      message: `${type} rejected successfully`,
      content
    });
  } catch (error) {
    logger.error('Error rejecting content:', error);
    next(error);
  }
};

// Pin/unpin post
exports.togglePinPost = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const user = req.user;
    
    const post = await ForumPost.findById(postId);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    // Toggle pin status
    post.isPinned = !post.isPinned;
    await post.save();
    
    logger.info('Post pin status toggled', {
      moderatorId: user.id,
      postId,
      isPinned: post.isPinned
    });
    
    res.status(200).json({
      success: true,
      message: post.isPinned ? 'Post pinned' : 'Post unpinned',
      isPinned: post.isPinned
    });
  } catch (error) {
    logger.error('Error toggling post pin:', error);
    next(error);
  }
};

// Lock/unlock post
exports.toggleLockPost = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const user = req.user;
    
    const post = await ForumPost.findById(postId);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    // Toggle lock status
    post.isLocked = !post.isLocked;
    await post.save();
    
    logger.info('Post lock status toggled', {
      moderatorId: user.id,
      postId,
      isLocked: post.isLocked
    });
    
    res.status(200).json({
      success: true,
      message: post.isLocked ? 'Post locked' : 'Post unlocked',
      isLocked: post.isLocked
    });
  } catch (error) {
    logger.error('Error toggling post lock:', error);
    next(error);
  }
};

// Get moderation statistics
exports.getModerationStats = async (req, res, next) => {
  try {
    const user = req.user;
    
    const stats = {
      pendingPosts: await ForumPost.countDocuments({ status: 'pending_review' }),
      pendingComments: await ForumComment.countDocuments({ status: 'pending_review' }),
      totalModerated: await ForumPost.countDocuments({
        'moderationStatus.reviewedBy': user.id
      }) + await ForumComment.countDocuments({
        'moderationStatus.reviewedBy': user.id
      }),
      recentModerations: await ForumPost.find({
        'moderationStatus.reviewedBy': user.id
      })
        .sort({ 'moderationStatus.reviewedAt': -1 })
        .limit(10)
        .populate('author', 'name'),
      topCategories: await ForumCategory.find({ moderators: user.id })
        .select('name slug stats')
    };
    
    res.status(200).json({
      success: true,
      stats
    });
  } catch (error) {
    logger.error('Error fetching moderation stats:', error);
    next(error);
  }
};

// Get user moderation history
exports.getUserModerationHistory = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    
    const [posts, comments] = await Promise.all([
      ForumPost.find({ 
        $or: [
          { 'moderationStatus.reviewedBy': userId },
          { author: userId, status: { $in: ['rejected', 'pending_review'] } }
        ]
      })
        .sort({ updatedAt: -1 })
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit))
        .populate('category', 'name slug'),
      
      ForumComment.find({
        $or: [
          { 'moderationStatus.reviewedBy': userId },
          { author: userId, status: { $in: ['rejected', 'pending_review'] } }
        ]
      })
        .sort({ updatedAt: -1 })
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit))
        .populate('post', 'title')
    ]);
    
    const history = [
      ...posts.map(post => ({
        type: 'post',
        item: post,
        date: post.moderationStatus?.reviewedAt || post.updatedAt,
        action: post.moderationStatus?.reviewedBy ? 
          (post.status === 'rejected' ? 'rejected' : 'approved') : 
          'created'
      })),
      ...comments.map(comment => ({
        type: 'comment',
        item: comment,
        date: comment.moderationStatus?.reviewedAt || comment.updatedAt,
        action: comment.moderationStatus?.reviewedBy ? 
          (comment.status === 'rejected' ? 'rejected' : 'approved') : 
          'created'
      }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    const total = await ForumPost.countDocuments({
      $or: [
        { 'moderationStatus.reviewedBy': userId },
        { author: userId, status: { $in: ['rejected', 'pending_review'] } }
      ]
    }) + await ForumComment.countDocuments({
      $or: [
        { 'moderationStatus.reviewedBy': userId },
        { author: userId, status: { $in: ['rejected', 'pending_review'] } }
      ]
    });
    
    res.status(200).json({
      success: true,
      count: history.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / (parseInt(limit) * 2)), // Since we're querying two collections
      history
    });
  } catch (error) {
    logger.error('Error fetching user moderation history:', error);
    next(error);
  }
};