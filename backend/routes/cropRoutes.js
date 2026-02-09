const express = require('express');
const router = express.Router();
const cropController = require('../controllers/cropController');
const auth = require('../middleware/auth');

// All crop routes require authentication
router.use(auth);

// Get all crops for authenticated farmer
router.get('/', cropController.getFarmerCrops);

// Get crop statistics
router.get('/stats', cropController.getCropStats);

// Get single crop by ID
router.get('/:id', cropController.getCropById);

// Create new crop
router.post('/', cropController.createCrop);

// Update crop
router.put('/:id', cropController.updateCrop);

// Update crop progress/health
router.patch('/:id/progress', cropController.updateCropProgress);

// Delete crop
router.delete('/:id', cropController.deleteCrop);

module.exports = router;
