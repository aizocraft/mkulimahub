const ForumPost = require('../models/ForumPost');
const ForumComment = require('../models/ForumComment');
const ForumCategory = require('../models/ForumCategory');
const User = require('../models/User');
const File = require('../models/File');
const { logger } = require('../middleware/logger');
const multer = require('multer');
const path = require('path');

// Helper function to generate post response - FIXED VERSION
const generatePostResponse = (post, user) => {
  const canModify = user ? post.canModify(user.id, user.role) : false;

  // Get user's vote on this post
  const userVote = user ? (post.votedUsers || []).find(
    v => v.userId && v.userId.toString() === user.id.toString()
  ) : null;
  
  const response = {
    id: post._id,
    title: post.title,
    content: post.content,
    author: post.author,
    category: post.category,
    tags: post.tags || [],
    status: post.status,
    isPinned: post.isPinned || false,
    isLocked: post.isLocked || false,
    stats: post.stats || { views: 0, upvotes: 0, downvotes: 0, commentCount: 0 },
    attachments: post.attachments || [],
    metadata: post.metadata || {},
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    canEdit: canModify,
    canDelete: canModify,
    voteDifference: (post.stats?.upvotes || 0) - (post.stats?.downvotes || 0),
    isActive: post.isActive !== false,
    userVote: userVote?.voteType || null
  };
  
  return response;
};

// Also fix the generateCommentResponse function similarly:
const generateCommentResponse = (comment, user) => {
  const canModify = user ? comment.canModify(user.id, user.role) : false;
  
  const response = {
    id: comment._id,
    content: comment.content,
    author: comment.author,
    post: comment.post,
    parentComment: comment.parentComment,
    isAnswer: comment.isAnswer || false,
    isExpertAnswer: comment.isExpertAnswer || false,
    status: comment.status,
    votes: comment.votes || { upvotes: 0, downvotes: 0, voters: [] },
    attachments: comment.attachments || [],
    mentions: comment.mentions || [],
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
    editedAt: comment.editedAt,
    canEdit: canModify,
    canDelete: canModify,
    voteDifference: (comment.votes?.upvotes || 0) - (comment.votes?.downvotes || 0),
    hasVoted: user ? (comment.votes?.voters || []).some(v => v.userId?.toString() === user.id) : false,
    userVote: user ? (comment.votes?.voters || []).find(v => v.userId?.toString() === user.id)?.voteType : null
  };
  
  return response;
};
// Get all categories
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await ForumCategory.find({ isActive: true })
      .sort({ name: 1 })
      .select('-moderators -rules');
    
    logger.info('Forum categories fetched', {
      userId: req.user?.id,
      count: categories.length
    });
    
    res.status(200).json({
      success: true,
      count: categories.length,
      categories
    });
  } catch (error) {
    logger.error('Error fetching categories:', error);
    next(error);
  }
};

// Get posts with filtering
exports.getPosts = async (req, res, next) => {
  try {
    const {
      category,
      tag,
      author,
      status = 'published',
      sortBy = 'newest',
      search,
      page = 1,
      limit = 20,
      expertOnly = false
    } = req.query;
    
    const filter = {};
    const user = req.user;
    
    // Apply filters
    if (category) filter.category = category;
    if (tag) filter.tags = tag;
    if (author) filter.author = author;
    
    // Status filter based on user role
    if (user && (user.role === 'admin' || user.role === 'expert')) {
      filter.status = status;
    } else {
      filter.status = 'published';
    }
    
    // Expert-only filter
    if (expertOnly === 'true') {
      const expertCategories = await ForumCategory.find({ expertOnly: true }).select('_id');
      filter.category = { $in: expertCategories.map(c => c._id) };
    }
    
    // Search filter
    if (search) {
      filter.$text = { $search: search };
    }
    
    // Sort options
    let sort = {};
    switch (sortBy) {
      case 'trending':
        sort = { 'metadata.trendingScore': -1 };
        break;
      case 'most_commented':
        sort = { 'stats.commentCount': -1 };
        break;
      case 'most_viewed':
        sort = { 'stats.views': -1 };
        break;
      case 'most_voted':
        sort = { voteDifference: -1 };
        break;
      case 'newest':
      default:
        sort = { createdAt: -1 };
        break;
    }
    
    const posts = await ForumPost.find(filter)
      .populate('author', 'name email role profilePicture')
      .populate('category', 'name slug color icon')
      .sort(sort)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    
    const total = await ForumPost.countDocuments(filter);
    
    logger.info('Forum posts fetched', {
      userId: user?.id,
      filters: { category, tag, status, sortBy, search },
      count: posts.length,
      total
    });
    
    res.status(200).json({
      success: true,
      count: posts.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      posts: posts.map(post => generatePostResponse(post, user))
    });
  } catch (error) {
    logger.error('Error fetching posts:', error);
    next(error);
  }
};

// Get single post with comments
exports.getPost = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const user = req.user;
    
    // Increment view count
    await ForumPost.findByIdAndUpdate(postId, {
      $inc: { 'stats.views': 1 }
    });
    
    const post = await ForumPost.findById(postId)
      .populate('author', 'name email role profilePicture bio expertise yearsOfExperience farmSize mainCrops')
      .populate('category', 'name slug description color icon rules')
      .populate('moderationStatus.reviewedBy', 'name role');
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    // Get comments for this post
    const comments = await ForumComment.find({
      post: postId,
      parentComment: null,
      status: user && (user.role === 'admin' || user.role === 'expert') ? { $in: ['published', 'pending_review'] } : 'published'
    })
      .populate('author', 'name email role profilePicture bio expertise')
      .sort({ isAnswer: -1, isExpertAnswer: -1, voteDifference: -1, createdAt: 1 });
    
    // Get nested replies
    const commentIds = comments.map(c => c._id);
    const replies = await ForumComment.find({
      parentComment: { $in: commentIds },
      status: user && (user.role === 'admin' || user.role === 'expert') ? { $in: ['published', 'pending_review'] } : 'published'
    })
      .populate('author', 'name email role profilePicture')
      .sort({ createdAt: 1 });
    
    // Build comment tree
    const commentMap = new Map();
    comments.forEach(comment => {
      commentMap.set(comment._id.toString(), {
        ...generateCommentResponse(comment, user),
        replies: []
      });
    });
    
    replies.forEach(reply => {
      const parent = commentMap.get(reply.parentComment?.toString());
      if (parent) {
        parent.replies.push(generateCommentResponse(reply, user));
      }
    });
    
    const commentTree = Array.from(commentMap.values());
    
    logger.info('Forum post fetched', {
      userId: user?.id,
      postId,
      views: (post.stats?.views || 0) + 1,
      commentCount: comments.length + replies.length
    });
    
    res.status(200).json({
      success: true,
      post: generatePostResponse(post, user),
      comments: commentTree,
      commentCount: comments.length + replies.length
    });
  } catch (error) {
    logger.error('Error fetching post:', error);
    next(error);
  }
};

// Create new post
exports.createPost = async (req, res, next) => {
  try {
    const { title, content, category, tags, attachments } = req.body;
    const user = req.user;
    
    console.log('Creating post with data:', { title, content, category, tags, attachments });
    console.log('User:', user);
    
    // Validate input
    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Post title is required'
      });
    }
    
    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Post content is required'
      });
    }
    
    if (!category) {
      return res.status(400).json({
        success: false,
        message: 'Category is required'
      });
    }
    
    // Check user status
    if (user.isActive === false) {
      return res.status(403).json({
        success: false,
        message: 'Your account is deactivated'
      });
    }
    
    // Check if category exists and is active
    const categoryExists = await ForumCategory.findById(category);
    if (!categoryExists) {
      return res.status(400).json({
        success: false,
        message: 'Selected category does not exist'
      });
    }
    
    if (!categoryExists.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Selected category is not active'
      });
    }
    
    // Check if user can post in expert-only category
    if (categoryExists.expertOnly && user.role !== 'expert' && user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to post in expert-only categories'
      });
    }
    
    // Determine post status based on user role
    let status = 'published';
    if (user.role === 'farmer') {
      status = 'pending_review'; // Farmer posts need expert review
    }

    // Process attachments - now expecting file IDs from separate uploads
    const cleanedAttachments = [];
    if (attachments && attachments.length > 0) {
      for (const att of attachments) {
        if (att.fileId) {
          // Verify file exists and user can access it
          const fileDoc = await File.findById(att.fileId);
          if (fileDoc && fileDoc.uploadedBy.toString() === user.id.toString()) {
            cleanedAttachments.push({
              fileId: att.fileId,
              filename: fileDoc.originalName,
              originalName: fileDoc.originalName,
              mimeType: fileDoc.mimeType,
              size: fileDoc.size,
              uploadedAt: fileDoc.createdAt
            });

            // Update file's attachedTo reference
            await File.findByIdAndUpdate(att.fileId, {
              attachedTo: {
                model: 'ForumPost',
                id: null // Will be set after post creation
              }
            });
          }
        }
      }
    }
    
    const postData = {
      title: title.trim(),
      content: content.trim(),
      author: user.id,
      category,
      tags: tags ? tags.map(tag => tag.trim().toLowerCase()) : [],
      status,
      attachments: cleanedAttachments,
      stats: {
        views: 0,
        upvotes: 0,
        downvotes: 0,
        commentCount: 0
      },
      metadata: {
        trendingScore: 0,
        lastCommentAt: null,
        lastCommentBy: null
      }
    };
    
    const post = new ForumPost(postData);
    await post.save();
    
    // Update category stats
    await ForumCategory.findByIdAndUpdate(category, {
      $inc: { 'stats.postCount': 1 },
      $set: { 'stats.lastActivity': new Date() }
    });
    
    // Populate author info
    await post.populate('author', 'name email role profilePicture');
    await post.populate('category', 'name slug');
    
    logger.info('Forum post created', {
      userId: user.id,
      postId: post._id,
      category,
      status
    });
    
    res.status(201).json({
      success: true,
      message: status === 'pending_review' 
        ? 'Post created successfully and sent for expert review' 
        : 'Post created successfully',
      post: generatePostResponse(post, user),
      requiresReview: status === 'pending_review'
    });
  } catch (error) {
    console.error('Error creating post:', error);
    
    // Handle specific Mongoose errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: messages
      });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Duplicate post detected'
      });
    }
    
    logger.error('Error creating post:', error);
    next(error);
  }
};

// Update post
exports.updatePost = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const { title, content, category, tags, attachments } = req.body;
    const user = req.user;

    const post = await ForumPost.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check permissions
    if (!post.canModify || !post.canModify(user.id, user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to edit this post'
      });
    }

    // Update fields
    const updates = {};
    if (title) updates.title = title.trim();
    if (content) updates.content = content.trim();
    if (category) updates.category = category;
    if (tags) updates.tags = tags.map(tag => tag.trim().toLowerCase());

    // Process attachments - similar to createPost
    if (attachments) {
      const cleanedAttachments = [];
      for (const att of attachments) {
        const fileId = att.fileId || att.id;
        if (fileId) {
          // Verify file exists and user can access it
          const fileDoc = await File.findById(fileId);
          if (fileDoc && fileDoc.uploadedBy.toString() === user.id.toString()) {
            cleanedAttachments.push({
              fileId: fileId,
              filename: fileDoc.originalName,
              originalName: fileDoc.originalName,
              mimeType: fileDoc.mimeType,
              size: fileDoc.size,
              uploadedAt: fileDoc.createdAt
            });
          }
        }
      }
      updates.attachments = cleanedAttachments;
    }

    // If farmer edits, send back for review
    if (user.role === 'farmer' && post.status === 'published') {
      updates.status = 'pending_review';
      updates.moderationStatus = {
        reviewedBy: null,
        reviewedAt: null,
        reviewNotes: null
      };
    }

    updates.updatedAt = new Date();

    const updatedPost = await ForumPost.findByIdAndUpdate(
      postId,
      updates,
      { new: true, runValidators: true }
    ).populate('author', 'name email role profilePicture');

    logger.info('Forum post updated', {
      userId: user.id,
      postId,
      updatedFields: Object.keys(updates)
    });

    res.status(200).json({
      success: true,
      message: updatedPost.status === 'pending_review'
        ? 'Post updated and sent for review'
        : 'Post updated successfully',
      post: generatePostResponse(updatedPost, user)
    });
  } catch (error) {
    logger.error('Error updating post:', error);
    next(error);
  }
};

// Delete post (soft delete)
exports.deletePost = async (req, res, next) => {
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
    
    // Check permissions
    if (!post.canModify || !post.canModify(user.id, user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this post'
      });
    }
    
    // Soft delete
    post.deletedAt = new Date();
    post.deletedBy = user.id;
    post.status = 'archived';
    await post.save();
    
    // Update category stats
    await ForumCategory.findByIdAndUpdate(post.category, {
      $inc: { 'stats.postCount': -1 }
    });
    
    logger.info('Forum post deleted', {
      userId: user.id,
      postId,
      deletedAt: post.deletedAt
    });
    
    res.status(200).json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting post:', error);
    next(error);
  }
};

// Create comment
exports.createComment = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const { content, parentComment, attachments = [], mentions = [] } = req.body;
    const user = req.user;
    
    // Validate content
    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Comment content is required'
      });
    }
    
    if (content.length > 2000) {
      return res.status(400).json({
        success: false,
        message: 'Comment cannot exceed 2000 characters'
      });
    }
    
    const post = await ForumPost.findById(postId);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    // Check if post is locked
    if (post.isLocked && user.role !== 'admin' && user.role !== 'expert') {
      return res.status(400).json({
        success: false,
        message: 'This post is locked and cannot be commented on'
      });
    }
    
    // Validate parent comment if replying
    if (parentComment) {
      const parentCommentDoc = await ForumComment.findById(parentComment);
      if (!parentCommentDoc) {
        return res.status(404).json({
          success: false,
          message: 'Parent comment not found'
        });
      }
    }
    
    // Determine comment status based on user role
    let status = 'published';
    if (user.role === 'farmer') {
      status = 'pending_review'; // Farmer comments need expert review
    }
    
    // Process attachments - validate and sanitize
    const processedAttachments = attachments.map(att => ({
      filename: att.filename || 'Attachment',
      fileType: att.fileType || 'unknown',
      size: att.size || 0,
      data: att.data, // Binary data from multer memory storage
      uploadedAt: new Date()
    })).filter(att => att.data);
    
    const commentData = {
      content: content.trim(),
      author: user.id,
      post: postId,
      parentComment: parentComment || null,
      isExpertAnswer: user.role === 'expert' || user.role === 'admin',
      status,
      attachments: processedAttachments,
      mentions: mentions.filter(m => m), // Remove empty mentions
      votes: {
        upvotes: 0,
        downvotes: 0,
        voters: []
      }
    };
    
    const comment = new ForumComment(commentData);
    await comment.save();
    
    // Populate author info
    await comment.populate('author', 'name email role profilePicture');
    
    // Update post stats
    if (!post.stats) post.stats = { views: 0, upvotes: 0, downvotes: 0, commentCount: 0 };
    post.stats.commentCount = (post.stats.commentCount || 0) + 1;
    if (!post.metadata) post.metadata = {};
    post.metadata.lastCommentAt = new Date();
    post.metadata.lastCommentBy = user.id;
    await post.save();
    
    // Update category stats
    await ForumCategory.findByIdAndUpdate(post.category, {
      $inc: { 'stats.commentCount': 1 },
      $set: { 'stats.lastActivity': new Date() }
    });
    
    logger.info('Forum comment created', {
      userId: user.id,
      postId,
      commentId: comment._id,
      parentComment: parentComment || 'none',
      status,
      attachmentCount: processedAttachments.length
    });
    
    res.status(201).json({
      success: true,
      message: status === 'pending_review'
        ? 'Comment created and sent for expert review'
        : 'Comment created successfully',
      comment: generateCommentResponse(comment, user),
      requiresReview: status === 'pending_review',
      attachments: processedAttachments
    });
  } catch (error) {
    logger.error('Error creating comment:', error);
    next(error);
  }
};

// Update comment
exports.updateComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const { content, attachments } = req.body;
    const user = req.user;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Comment content is required'
      });
    }

    const comment = await ForumComment.findById(commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Check permissions
    if (!comment.canModify || !comment.canModify(user.id, user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to edit this comment'
      });
    }

    // Save edit history
    const editHistory = comment.editHistory || [];
    editHistory.push({
      content: comment.content,
      editedAt: comment.editedAt || comment.updatedAt
    });

    // Process attachments - validate and sanitize
    const processedAttachments = (attachments || []).map(att => ({
      url: att.url || '',
      filename: att.filename || 'Attachment',
      fileType: att.fileType || 'unknown',
      size: att.size || 0,
      uploadedAt: att.uploadedAt || new Date()
    })).filter(att => att.url);

    // Update comment
    comment.content = content.trim();
    comment.attachments = processedAttachments;
    comment.editedAt = new Date();
    comment.editHistory = editHistory;

    // If farmer edits, send back for review
    if (user.role === 'farmer' && comment.status === 'published') {
      comment.status = 'pending_review';
      comment.moderationStatus = {
        reviewedBy: null,
        reviewedAt: null,
        reviewNotes: null,
        rejectionReason: null
      };
    }

    await comment.save();
    await comment.populate('author', 'name email role profilePicture');

    logger.info('Forum comment updated', {
      userId: user.id,
      commentId,
      editCount: editHistory.length + 1,
      attachmentCount: processedAttachments.length
    });

    res.status(200).json({
      success: true,
      message: comment.status === 'pending_review'
        ? 'Comment updated and sent for review'
        : 'Comment updated successfully',
      comment: generateCommentResponse(comment, user)
    });
  } catch (error) {
    logger.error('Error updating comment:', error);
    next(error);
  }
};

// Delete comment (soft delete)
exports.deleteComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const user = req.user;
    
    const comment = await ForumComment.findById(commentId);
    
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }
    
    // Check permissions
    if (!comment.canModify || !comment.canModify(user.id, user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this comment'
      });
    }
    
    // Soft delete
    comment.status = 'deleted';
    comment.deletedAt = new Date();
    comment.deletedBy = user.id;
    await comment.save();
    
    // Update post stats
    await ForumPost.findByIdAndUpdate(comment.post, {
      $inc: { 'stats.commentCount': -1 }
    });
    
    logger.info('Forum comment deleted', {
      userId: user.id,
      commentId,
      deletedAt: comment.deletedAt
    });
    
    res.status(200).json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting comment:', error);
    next(error);
  }
};

// Vote on post
exports.votePost = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const { voteType } = req.body; // 'upvote', 'downvote', or null to remove
    const user = req.user;

    if (voteType && !['upvote', 'downvote'].includes(voteType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid vote type. Must be "upvote", "downvote", or null'
      });
    }

    // Get post
    const post = await ForumPost.findById(postId).populate('author', 'id name role');

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Initialize votedUsers array if not present
    if (!post.votedUsers) {
      post.votedUsers = [];
    }

    const existingVoteIndex = post.votedUsers.findIndex(
      v => v.userId && String(v.userId) === String(user.id)
    );

    let action = 'none';
    let previousVoteType = null;

    if (existingVoteIndex > -1) {
      previousVoteType = post.votedUsers[existingVoteIndex].voteType;

      if (!voteType) {
        // Remove vote
        post.votedUsers.splice(existingVoteIndex, 1);
        action = 'removed';
      } else if (previousVoteType === voteType) {
        // Same vote type - remove it
        post.votedUsers.splice(existingVoteIndex, 1);
        action = 'removed';
      } else {
        // Change vote type
        post.votedUsers[existingVoteIndex].voteType = voteType;
        post.votedUsers[existingVoteIndex].votedAt = new Date();
        action = 'changed';
      }
    } else if (voteType) {
      // New vote
      post.votedUsers.push({
        userId: String(user.id),
        voteType,
        votedAt: new Date()
      });
      action = 'added';
    }

    // Recalculate stats from votedUsers
    post.stats = post.stats || { upvotes: 0, downvotes: 0, views: 0, commentCount: 0 };
    post.stats.upvotes = post.votedUsers.filter(v => v.voteType === 'upvote').length;
    post.stats.downvotes = post.votedUsers.filter(v => v.voteType === 'downvote').length;

    await post.save();

    // Get user's current vote
    const userVote = post.votedUsers.find(
      v => v.userId && String(v.userId) === String(user.id)
    );

    let message = 'Vote updated successfully';
    if (action === 'added') {
      message = `Vote ${voteType}d successfully`;
    } else if (action === 'removed') {
      message = 'Vote removed successfully';
    } else if (action === 'changed') {
      message = `Vote changed to ${voteType}`;
    }

    logger.info('Forum post voted', {
      userId: user.id,
      postId,
      voteType,
      action,
      previousVoteType,
      upvotes: post.stats.upvotes,
      downvotes: post.stats.downvotes
    });

    res.status(200).json({
      success: true,
      message,
      stats: post.stats,
      voteDifference: post.stats.upvotes - post.stats.downvotes,
      userVote: userVote?.voteType || null
    });
  } catch (error) {
    logger.error('Error voting on post:', error);
    next(error);
  }
};

// Vote on comment
exports.voteComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const { voteType } = req.body; // 'upvote' or 'downvote'
    const user = req.user;
    
    if (!['upvote', 'downvote'].includes(voteType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid vote type. Must be "upvote" or "downvote"'
      });
    }
    
    const comment = await ForumComment.findById(commentId);
    
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }
    
    // Check if user can vote (not the author)
    if (comment.author.toString() === user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot vote on your own comment'
      });
    }
    
    // Initialize votes if not present
    if (!comment.votes) {
      comment.votes = { upvotes: 0, downvotes: 0, voters: [] };
    }
    
    // Check if user has already voted
    const existingVoteIndex = comment.votes.voters.findIndex(
      v => v.userId && v.userId.toString() === user.id
    );
    
    if (existingVoteIndex > -1) {
      const existingVote = comment.votes.voters[existingVoteIndex];
      
      // If same vote type, remove vote
      if (existingVote.voteType === voteType) {
        comment.votes.voters.splice(existingVoteIndex, 1);
        if (voteType === 'upvote') {
          comment.votes.upvotes -= 1;
        } else {
          comment.votes.downvotes -= 1;
        }
      } else {
        // Change vote type
        existingVote.voteType = voteType;
        existingVote.votedAt = new Date();
        
        if (voteType === 'upvote') {
          comment.votes.upvotes += 1;
          comment.votes.downvotes -= 1;
        } else {
          comment.votes.downvotes += 1;
          comment.votes.upvotes -= 1;
        }
      }
    } else {
      // New vote
      comment.votes.voters.push({
        userId: user.id,
        voteType,
        votedAt: new Date()
      });
      
      if (voteType === 'upvote') {
        comment.votes.upvotes += 1;
      } else {
        comment.votes.downvotes += 1;
      }
    }
    
    await comment.save();
    
    logger.info('Forum comment voted', {
      userId: user.id,
      commentId,
      voteType,
      upvotes: comment.votes.upvotes,
      downvotes: comment.votes.downvotes
    });
    
    res.status(200).json({
      success: true,
      message: 'Vote recorded successfully',
      votes: comment.votes,
      voteDifference: comment.votes.upvotes - comment.votes.downvotes,
      userVote: voteType
    });
  } catch (error) {
    logger.error('Error voting on comment:', error);
    next(error);
  }
};

// Mark comment as answer
exports.markAsAnswer = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const user = req.user;
    
    const comment = await ForumComment.findById(commentId).populate('post');
    
    if (!comment || !comment.post) {
      return res.status(404).json({
        success: false,
        message: 'Comment or associated post not found'
      });
    }
    
    // Only post author or experts can mark as answer
    const canMarkAnswer = 
      comment.post.author.toString() === user.id ||
      user.role === 'expert' ||
      user.role === 'admin';
    
    if (!canMarkAnswer) {
      return res.status(403).json({
        success: false,
        message: 'Only the post author or experts can mark an answer'
      });
    }
    
    // Toggle answer status
    comment.isAnswer = !comment.isAnswer;
    comment.isExpertAnswer = user.role === 'expert' || user.role === 'admin';
    
    await comment.save();
    await comment.populate('author', 'name email role profilePicture');
    
    logger.info('Forum comment answer status toggled', {
      userId: user.id,
      commentId,
      isAnswer: comment.isAnswer,
      isExpertAnswer: comment.isExpertAnswer
    });
    
    res.status(200).json({
      success: true,
      message: comment.isAnswer ? 'Marked as answer' : 'Unmarked as answer',
      comment: generateCommentResponse(comment, user)
    });
  } catch (error) {
    logger.error('Error marking comment as answer:', error);
    next(error);
  }
};

// Get user's posts
exports.getUserPosts = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const user = req.user;
    
    const filter = { author: userId };
    
    // Regular users can only see published posts
    if (!user || (user.id !== userId && user.role !== 'admin' && user.role !== 'expert')) {
      filter.status = 'published';
    }
    
    const posts = await ForumPost.find(filter)
      .populate('category', 'name slug')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    
    const total = await ForumPost.countDocuments(filter);
    
    logger.info('User forum posts fetched', {
      requestedBy: user?.id,
      userId,
      count: posts.length
    });
    
    res.status(200).json({
      success: true,
      count: posts.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      posts: posts.map(post => generatePostResponse(post, user))
    });
  } catch (error) {
    logger.error('Error fetching user posts:', error);
    next(error);
  }
};

// Search posts and comments
exports.searchForum = async (req, res, next) => {
  try {
    const { q, type = 'both', page = 1, limit = 20, category = '' } = req.query;
    const user = req.user;
    
    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters'
      });
    }
    
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
    const skip = (pageNum - 1) * limitNum;
    
    const results = {
      posts: [],
      comments: [],
      total: 0,
      page: pageNum,
      limit: limitNum
    };
    
    // Build status filter based on user role
    const statusFilter = user && (user.role === 'admin' || user.role === 'expert') 
      ? { $in: ['published', 'pending_review'] } 
      : 'published';
    
    // Base filter
    const baseFilter = {
      status: statusFilter,
      ...(category && { category })
    };
    
    // Search posts
    if (type === 'posts' || type === 'both') {
      // Search using text index for title and content
      const postFilter = {
        ...baseFilter,
        $or: [
          { title: { $regex: q, $options: 'i' } },
          { content: { $regex: q, $options: 'i' } },
          { tags: { $regex: q, $options: 'i' } }
        ]
      };
      
      const postCount = await ForumPost.countDocuments(postFilter);
      
      const posts = await ForumPost.find(postFilter)
        .populate('author', 'name role profilePicture')
        .populate('category', 'name slug')
        .sort({ 
          'stats.upvotes': -1,
          'metadata.lastCommentAt': -1,
          createdAt: -1 
        })
        .limit(limitNum)
        .skip(skip)
        .lean();
      
      results.posts = posts.map(post => ({
        ...generatePostResponse(post, user),
        matchType: 'post',
        relevanceScore: calculateRelevance(post, q)
      }));
      
      results.totalPosts = postCount;
    }
    
    // Search comments
    if (type === 'comments' || type === 'both') {
      const commentFilter = {
        ...baseFilter,
        content: { $regex: q, $options: 'i' }
      };
      
      const commentCount = await ForumComment.countDocuments(commentFilter);
      
      const comments = await ForumComment.find(commentFilter)
        .populate('author', 'name role profilePicture')
        .populate('post', 'title')
        .sort({ 
          'votes.upvotes': -1,
          createdAt: -1 
        })
        .limit(limitNum)
        .skip(skip)
        .lean();
      
      results.comments = comments.map(comment => ({
        ...generateCommentResponse(comment, user),
        postTitle: comment.post?.title || 'Deleted Post',
        matchType: 'comment',
        relevanceScore: calculateRelevance(comment, q)
      }));
      
      results.totalComments = commentCount;
    }
    
    // Combine and sort by relevance
    const combined = [...results.posts, ...results.comments]
      .sort((a, b) => b.relevanceScore - a.relevanceScore);
    
    results.total = results.totalPosts + results.totalComments;
    results.combined = combined.slice(0, limitNum);
    
    logger.info('Forum search performed', {
      userId: user?.id,
      query: q,
      type,
      postResults: results.posts.length,
      commentResults: results.comments.length,
      totalResults: results.total
    });
    
    res.status(200).json({
      success: true,
      query: q,
      results,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: results.total,
        pages: Math.ceil(results.total / limitNum)
      }
    });
  } catch (error) {
    logger.error('Error searching forum:', error);
    next(error);
  }
};

// Helper function to calculate relevance score
const calculateRelevance = (doc, query) => {
  let score = 0;
  const lowerQuery = query.toLowerCase();
  
  if (doc.title) {
    const titleLower = doc.title.toLowerCase();
    if (titleLower.includes(lowerQuery)) {
      score += titleLower === lowerQuery ? 100 : 50; // Exact match gets higher score
    }
  }
  
  if (doc.content) {
    const contentLower = doc.content.toLowerCase();
    if (contentLower.includes(lowerQuery)) {
      score += 30;
    }
  }
  
  if (doc.tags && Array.isArray(doc.tags)) {
    doc.tags.forEach(tag => {
      if (tag.toLowerCase().includes(lowerQuery)) score += 40;
    });
  }
  
  // Boost score for popular posts/comments
  if (doc.stats?.upvotes) score += doc.stats.upvotes * 2;
  if (doc.votes?.upvotes) score += doc.votes.upvotes * 2;
  
  return score;
};

// Get forum statistics
exports.getForumStats = async (req, res, next) => {
  try {
    const stats = {
      totalPosts: await ForumPost.countDocuments({ status: 'published' }),
      totalComments: await ForumComment.countDocuments({ status: 'published' }),
      totalUsers: await User.countDocuments({ isActive: true }),
      postsToday: await ForumPost.countDocuments({
        status: 'published',
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      }),
      topCategories: await ForumCategory.aggregate([
        { $sort: { 'stats.postCount': -1 } },
        { $limit: 5 },
        { $project: { name: 1, slug: 1, postCount: '$stats.postCount', commentCount: '$stats.commentCount' } }
      ]),
      recentActivity: await ForumPost.find({ status: 'published' })
        .populate('author', 'name role profilePicture')
        .populate('category', 'name slug')
        .sort({ 'metadata.lastCommentAt': -1 })
        .limit(5)
    };
    
    res.status(200).json({
      success: true,
      stats
    });
  } catch (error) {
    logger.error('Error fetching forum stats:', error);
    next(error);
  }
};