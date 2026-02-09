const express = require('express');
const multer = require('multer');
const uploadController = require('../controllers/uploadController');
const auth = require('../middleware/auth');

const router = express.Router();

// Configure multer for memory storage (files stored in buffer for MongoDB)
const storage = multer.memoryStorage();

// File filter - allow various file types
const fileFilter = (req, file, cb) => {
  // Allow common file types for forum posts
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv',
    'video/mp4',
    'video/quicktime',
    'audio/mpeg',
    'audio/wav'
  ];

  if (allowedTypes.includes(file.mimetype) || allowedTypes.some(type => file.mimetype.startsWith(type.split('/')[0]))) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} is not allowed`), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Routes
router.post('/', auth, upload.single('file'), uploadController.uploadFile);
router.get('/:fileId', uploadController.getFile); // Serve files from MongoDB
router.delete('/:fileId', auth, uploadController.deleteFile);

module.exports = router;
