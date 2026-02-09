const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

// Public routes
router.post('/register', authController.registerUser);
router.post('/login', authController.loginUser);
router.post('/check-email', authController.checkEmail);

// Google OAuth routes
router.get('/google', authController.googleAuth);
router.get('/google/callback', authController.googleCallback);
// Add to public routes
router.post('/exchange-token', authController.exchangeToken);

// TEST ENDPOINT - Add this
router.get('/test-profile', auth, authController.getProfile);

// Protected routes (require authentication)
router.use(auth); // applies the auth middleware to all routes below

// User profile routes
router.get('/profile', authController.getProfile);
router.put('/profile', authController.updateProfile);
router.put('/change-password', authController.changePassword);
router.put('/deactivate', authController.deactivateAccount);
router.put('/profile/role', auth, authController.updateMyRole);
module.exports = router;