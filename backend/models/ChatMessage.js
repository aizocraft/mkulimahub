const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  consultation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Consultation',
    required: true,
    index: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  type: {
    type: String,
    enum: ['text', 'image', 'file', 'system'],
    default: 'text'
  },
  fileUrl: String,
  fileName: String,
  fileSize: Number,
  readBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  deleted: {
    type: Boolean,
    default: false
  },
  deletedAt: Date,
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index for faster queries
chatMessageSchema.index({ consultation: 1, createdAt: 1 });
chatMessageSchema.index({ sender: 1, createdAt: 1 });
chatMessageSchema.index({ consultation: 1, readBy: 1 });

// Pre-save to ensure content is trimmed
chatMessageSchema.pre('save', function(next) {
  if (this.content) {
    this.content = this.content.trim();
  }
  next();
});

module.exports = mongoose.model('ChatMessage', chatMessageSchema);