const path = require('path');
const fs = require('fs').promises;
const { logger } = require('../middleware/logger');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');

const ensureUploadsDir = async () => {
  try {
    await fs.mkdir(uploadsDir, { recursive: true });
  } catch (err) {
    logger.error('Error creating uploads directory:', err);
  }
};

// Initialize uploads directory on module load
ensureUploadsDir();

/**
 * Upload a file
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

    const file = req.file;
    const fileId = `${Date.now()}-${file.originalname}`;
    
    // Log the upload
    logger.info('File uploaded', {
      userId: req.user?.id || 'anonymous',
      filename: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      fileId
    });

    // Return file information
    res.json({
      success: true,
      file: {
        id: fileId,
        filename: file.originalname,
        originalName: file.originalname,
        mimeType: file.mimetype,
        fileType: file.mimetype,
        size: file.size,
        url: `/uploads/${fileId}`,
        path: `/uploads/${fileId}`,
        location: `/uploads/${fileId}`,
        fileUrl: `/uploads/${fileId}`,
        uploadedAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
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
 * Delete a file
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

    const filePath = path.join(uploadsDir, fileId);

    // Check if file exists
    try {
      await fs.access(filePath);
      await fs.unlink(filePath);

      logger.info('File deleted', {
        userId: req.user?.id || 'anonymous',
        fileId
      });

      res.json({ 
        success: true, 
        message: 'File deleted successfully' 
      });
    } catch (fileErr) {
      // File doesn't exist, but return success anyway
      res.json({ 
        success: true, 
        message: 'File not found or already deleted' 
      });
    }
  } catch (err) {
    logger.error('File deletion error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete file',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};
