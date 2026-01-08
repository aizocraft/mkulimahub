const mongoose = require('mongoose');

const forumCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      unique: true,
      trim: true
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    description: {
      type: String,
      default: ''
    },
    color: {
      type: String,
      default: '#4CAF50'
    },
    icon: {
      type: String,
      default: 'fa-seedling'
    },
    isActive: {
      type: Boolean,
      default: true
    },
    expertOnly: {
      type: Boolean,
      default: false
    },
    moderators: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    rules: [{
      type: String,
      default: []
    }],
    stats: {
      postCount: {
        type: Number,
        default: 0
      },
      commentCount: {
        type: Number,
        default: 0
      },
      lastActivity: {
        type: Date
      }
    }
  },
  { timestamps: true }
);

// Create slug from name
forumCategorySchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^\w\s]/gi, '')
      .replace(/\s+/g, '-');
  }
  next();
});

module.exports = mongoose.model('ForumCategory', forumCategorySchema);