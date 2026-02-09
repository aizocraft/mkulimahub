const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// Public routes
router.get('/experts', userController.getExperts);
router.get('/farmers', userController.getFarmers);

// Apply auth middleware to all routes below
router.use(auth);

// User profile routes (authenticated users can access their own profile)
router.get('/profile', (req, res) => {
  req.params.id = req.user.id;
  userController.getUserById(req, res);
});

router.put('/profile', (req, res) => {
  req.params.id = req.user.id;
  userController.updateUserProfile(req, res);
});

// Account management routes (authenticated users)
router.put('/reactivate', userController.reactivateAccount);
router.delete('/delete-account', userController.deleteAccountPermanently);

// Admin only routes
router.get('/', admin, userController.getAllUsers);
router.post('/', admin, userController.createUser);
router.get('/:id', admin, userController.getUserById);
router.put('/:id/role', admin, userController.updateUserRole);
router.put('/:id/profile', admin, userController.updateUserProfile);
router.put('/:id/verify', admin, userController.toggleVerification);
router.put('/:id/active', admin, userController.toggleActiveStatus);
router.delete('/:id', admin, userController.deleteUser);

module.exports = router;