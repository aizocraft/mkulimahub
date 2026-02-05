const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema(
  {
    filename: {
      type: String,
      required: true,
      trim: true
    },
    originalName: {
      type: String,
      required: true
    },
    mimeType: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true
    },
    data: {
      type: Buffer,
      required: true
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    // Reference to the document this file is attached to
    attachedTo: {
      model: {
        type: String,
        enum: ['ForumPost', 'ForumComment']
      },
      id: {
        type: mongoose.Schema.Types.ObjectId
      }
    },
    // Optional metadata
    metadata: {
      width: Number, // For images
      height: Number, // For images
      duration: Number, // For videos/audio
      encoding: String
    }
  },
  {
    timestamps: true
  }
);

// Indexes for better query performance
fileSchema.index({ uploadedBy: 1, createdAt: -1 });
fileSchema.index({ 'attachedTo.model': 1, 'attachedTo.id': 1 });
fileSchema.index({ filename: 'text' });

// Virtual for file URL
fileSchema.virtual('url').get(function() {
  return `/api/uploads/${this._id}`;
});

// Method to check if user can access this file
fileSchema.methods.canAccess = function(userId, userRole) {
  // File uploader can always access
  if (this.uploadedBy.toString() === userId.toString()) {
    return true;
  }

  // Admins can access all files
  if (userRole === 'admin') {
    return true;
  }

  // For forum files, check if user can access the parent document
  // This would require additional logic based on forum permissions
  return true; // Simplified for now
};

module.exports = mongoose.model('File', fileSchema);
