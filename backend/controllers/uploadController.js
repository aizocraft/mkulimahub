const { logger } = require('../middleware/logger');
const File = require('../models/File');
const ForumPost = require('../models/ForumPost');
const ForumComment = require('../models/ForumComment');

/**
 * Upload a file and store in MongoDB as a separate File document
 * POST /api/uploads
 */
exports.uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file provided'
      });
    }

    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required to upload files'
      });
    }

    const file = req.file;

    // Create new File document
    const fileDoc = new File({
      filename: `${Date.now()}-${file.originalname}`,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      data: file.buffer,
      uploadedBy: req.user.id,
      // attachedTo will be set when the file is attached to a post/comment
      attachedTo: null
    });

    await fileDoc.save();

    // Log the upload
    logger.info('File uploaded to MongoDB', {
      userId: req.user.id,
      filename: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      fileId: fileDoc._id
    });

    // Return file information
    res.json({
      success: true,
      file: {
        id: fileDoc._id,
        filename: fileDoc.filename,
        originalName: fileDoc.originalName,
        mimeType: fileDoc.mimeType,
        size: fileDoc.size,
        url: fileDoc.url,
        uploadedAt: fileDoc.createdAt
      }
    });
  } catch (err) {
    logger.error('File upload error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to upload file',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

/**
 * Serve a file from MongoDB File collection
 * GET /api/uploads/:fileId
 */
exports.getFile = async (req, res, next) => {
  try {
    const { fileId } = req.params;

    if (!fileId) {
      return res.status(400).json({
        success: false,
        message: 'File ID is required'
      });
    }

    // Find the file document by ID
    const fileDoc = await File.findById(fileId);

    if (!fileDoc || !fileDoc.data) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Check if user can access this file
    if (req.user?.id && fileDoc.uploadedBy.toString() !== req.user.id.toString()) {
      // Additional permission checks could be added here
      // For now, allow access if user is authenticated
    }

    // Set appropriate headers
    res.set({
      'Content-Type': fileDoc.mimeType || 'application/octet-stream',
      'Content-Length': fileDoc.size,
      'Content-Disposition': `attachment; filename="${fileDoc.originalName}"`,
      'Cache-Control': 'public, max-age=31536000' // Cache for 1 year
    });

    // Send the binary data
    res.send(fileDoc.data);

    logger.info('File served from MongoDB', {
      fileId,
      filename: fileDoc.originalName,
      size: fileDoc.size,
      uploadedBy: fileDoc.uploadedBy
    });

  } catch (err) {
    logger.error('File serving error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to serve file',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

/**
 * Delete a file from MongoDB File collection
 * DELETE /api/uploads/:fileId
 */
exports.deleteFile = async (req, res, next) => {
  try {
    const { fileId } = req.params;

    if (!fileId) {
      return res.status(400).json({
        success: false,
        message: 'File ID is required'
      });
    }

    // Find and delete the file document
    const fileDoc = await File.findById(fileId);

    if (!fileDoc) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Check if user can delete this file
    if (req.user?.id && fileDoc.uploadedBy.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own files'
      });
    }

    await File.findByIdAndDelete(fileId);

    logger.info('File deleted from MongoDB', {
      userId: req.user?.id || 'anonymous',
      fileId,
      filename: fileDoc.originalName
    });

    res.json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (err) {
    logger.error('File deletion error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to delete file',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};
