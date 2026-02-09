const express = require('express');
const router = express.Router();
const forumController = require('../controllers/forumController');
const moderationController = require('../controllers/moderationController');
const forumMiddleware = require('../middleware/forumMiddleware');
const auth = require('../middleware/auth');

// Public routes
router.get('/categories', forumController.getCategories);
router.get('/posts', forumController.getPosts);
router.get('/posts/:postId', forumController.getPost);
router.get('/stats', forumController.getForumStats);
router.get('/users/:userId/posts', forumController.getUserPosts);
router.get('/search', forumController.searchForum);

// Protected routes (require authentication)
router.use(auth);

// Post routes
router.post('/posts', 
  forumMiddleware.checkPostPermissions,
  forumMiddleware.rateLimit(5, 60 * 60 * 1000), // 5 posts per hour
  forumController.createPost
);

router.put('/posts/:postId', 
  forumMiddleware.checkPostAccess,
  forumController.updatePost
);

router.delete('/posts/:postId', 
  forumMiddleware.checkPostAccess,
  forumController.deletePost
);

// Comment routes
router.post('/posts/:postId/comments', 
  forumMiddleware.checkPostAccess,
  forumMiddleware.rateLimit(20, 60 * 60 * 1000), // 20 comments per hour
  forumController.createComment
);

router.put('/comments/:commentId', 
  forumMiddleware.checkCommentAccess,
  forumController.updateComment
);

router.delete('/comments/:commentId', 
  forumMiddleware.checkCommentAccess,
  forumController.deleteComment
);

// Vote routes
router.post('/posts/:postId/vote', 
  forumMiddleware.checkPostAccess,
  forumController.votePost
);

router.post('/comments/:commentId/vote', 
  forumMiddleware.checkCommentAccess,
  forumController.voteComment
);

// Answer routes
router.post('/comments/:commentId/answer', 
  forumMiddleware.checkCommentAccess,
  forumController.markAsAnswer
);

// Moderation routes (experts and admins only)
router.use(forumMiddleware.checkModerationRights);

// Moderation routes
router.get('/moderation/pending', moderationController.getPendingReviews);
router.post('/moderation/:type/:id/approve', moderationController.approveContent);
router.post('/moderation/:type/:id/reject', moderationController.rejectContent);
router.post('/posts/:postId/pin', moderationController.togglePinPost);
router.post('/posts/:postId/lock', moderationController.toggleLockPost);
router.get('/moderation/stats', moderationController.getModerationStats);
router.get('/moderation/users/:userId/history', moderationController.getUserModerationHistory);

module.exports = router;