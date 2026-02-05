const mongoose = require('mongoose');

const forumPostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Post title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    content: {
      type: String,
      required: [true, 'Post content is required'],
      maxlength: [5000, 'Content cannot exceed 5000 characters']
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ForumCategory',
      required: true
    },
    tags: [{
      type: String,
      trim: true,
      lowercase: true
    }],
    status: {
      type: String,
      enum: ['published', 'pending_review', 'rejected', 'archived'],
      default: 'published'
    },
    isPinned: {
      type: Boolean,
      default: false
    },
    isLocked: {
      type: Boolean,
      default: false
    },
    moderationStatus: {
      reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      reviewedAt: Date,
      reviewNotes: String,
      rejectionReason: String
    },
    stats: {
      views: {
        type: Number,
        default: 0
      },
      upvotes: {
        type: Number,
        default: 0
      },
      downvotes: {
        type: Number,
        default: 0
      },
      commentCount: {
        type: Number,
        default: 0
      },
      shareCount: {
        type: Number,
        default: 0
      }
    },
    votedUsers: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      voteType: {
        type: String,
        enum: ['upvote', 'downvote']
      },
      votedAt: {
        type: Date,
        default: Date.now
      }
    }],
    attachments: [{
      fileId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'File',
        required: true
      },
      filename: String,
      originalName: String,
      mimeType: String,
      size: Number,
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }],
    metadata: {
      lastCommentAt: Date,
      lastCommentBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      trendingScore: {
        type: Number,
        default: 0
      }
    },
    deletedAt: {
      type: Date
    },
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for better query performance
forumPostSchema.index({ category: 1, createdAt: -1 });
forumPostSchema.index({ author: 1, createdAt: -1 });
forumPostSchema.index({ status: 1, createdAt: -1 });
forumPostSchema.index({ 'tags': 1 });
forumPostSchema.index({ title: 'text', content: 'text' });
forumPostSchema.index({ 'metadata.trendingScore': -1 });
forumPostSchema.index({ 'metadata.lastCommentAt': -1 });

// Virtual for vote difference
forumPostSchema.virtual('voteDifference').get(function() {
  return this.stats.upvotes - this.stats.downvotes;
});

// Virtual for checking if post is active
forumPostSchema.virtual('isActive').get(function() {
  return this.status === 'published' && !this.isLocked && !this.deletedAt;
});

// FIXED: Method to check if user can edit/delete
forumPostSchema.methods.canModify = function(userId, userRole) {
  // Check if userId exists
  if (!userId) return false;
  
  // Admins and experts can always modify
  if (userRole === 'admin' || userRole === 'expert') return true;
  
  // Regular users can only modify their own posts
  // Safely convert both IDs to strings for comparison
  const postAuthorId = this.author ? this.author.toString() : null;
  const requestingUserId = userId.toString ? userId.toString() : String(userId);
  
  return postAuthorId === requestingUserId;
};

// Update trending score method
forumPostSchema.methods.updateTrendingScore = function() {
  const hoursSinceCreation = (Date.now() - this.createdAt) / (1000 * 60 * 60);
  const commentWeight = this.stats.commentCount * 2;
  const voteWeight = this.stats.upvotes * 1.5 - this.stats.downvotes * 0.5;
  const viewWeight = this.stats.views * 0.01;
  
  // Score decays over time
  const timeDecay = Math.exp(-hoursSinceCreation / 48); // Half-life of 48 hours
  
  this.metadata.trendingScore = (commentWeight + voteWeight + viewWeight) * timeDecay;
};

// Pre-save middleware to update trending score
forumPostSchema.pre('save', function(next) {
  if (this.isModified('stats')) {
    this.updateTrendingScore();
  }
  next();
});

module.exports = mongoose.model('ForumPost', forumPostSchema);