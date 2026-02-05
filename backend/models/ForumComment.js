const mongoose = require('mongoose');

const forumCommentSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: [true, 'Comment content is required'],
      maxlength: [2000, 'Comment cannot exceed 2000 characters']
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ForumPost',
      required: true
    },
    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ForumComment'
    },
    isAnswer: {
      type: Boolean,
      default: false
    },
    isExpertAnswer: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      enum: ['published', 'pending_review', 'rejected', 'deleted'],
      default: 'published'
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
    votes: {
      upvotes: {
        type: Number,
        default: 0
      },
      downvotes: {
        type: Number,
        default: 0
      },
      voters: [{
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
      }]
    },
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
    mentions: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    deletedAt: {
      type: Date
    },
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    editedAt: {
      type: Date
    },
    editHistory: [{
      content: String,
      editedAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes
forumCommentSchema.index({ post: 1, createdAt: 1 });
forumCommentSchema.index({ author: 1, createdAt: -1 });
forumCommentSchema.index({ parentComment: 1 });
forumCommentSchema.index({ isAnswer: 1 });
forumCommentSchema.index({ isExpertAnswer: 1 });
forumCommentSchema.index({ status: 1 });

// Virtual for vote difference
forumCommentSchema.virtual('voteDifference').get(function() {
  return this.votes.upvotes - this.votes.downvotes;
});

// Virtual for reply count
forumCommentSchema.virtual('replyCount', {
  ref: 'ForumComment',
  localField: '_id',
  foreignField: 'parentComment',
  count: true
});

// FIXED: Method to check if user can edit/delete
forumCommentSchema.methods.canModify = function(userId, userRole) {
  // Check if userId exists
  if (!userId) return false;
  
  // Admins and experts can always modify
  if (userRole === 'admin' || userRole === 'expert') return true;
  
  // Regular users can only modify their own comments
  // Safely convert both IDs to strings for comparison
  const commentAuthorId = this.author ? this.author.toString() : null;
  const requestingUserId = userId.toString ? userId.toString() : String(userId);
  
  return commentAuthorId === requestingUserId;
};

// FIXED: Method to check if user has voted
forumCommentSchema.methods.hasVoted = function(userId) {
  if (!userId) return false;
  
  const userIdStr = userId.toString ? userId.toString() : String(userId);
  return this.votes.voters.some(voter => {
    const voterId = voter.userId ? voter.userId.toString() : null;
    return voterId === userIdStr;
  });
};

// FIXED: Method to get user's vote type
forumCommentSchema.methods.getUserVote = function(userId) {
  if (!userId) return null;
  
  const userIdStr = userId.toString ? userId.toString() : String(userId);
  const voter = this.votes.voters.find(v => {
    const voterId = v.userId ? v.userId.toString() : null;
    return voterId === userIdStr;
  });
  
  return voter ? voter.voteType : null;
};

module.exports = mongoose.model('ForumComment', forumCommentSchema);