// routes/transactionRoutes.js
const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// ==================== TRANSACTION ROUTES ====================

// Get transaction by ID
router.get('/:transactionId', auth, transactionController.getTransaction);

// Get user's transactions
router.get('/user/transactions', auth, transactionController.getUserTransactions);

// Get transaction statistics
router.get('/stats', auth, transactionController.getTransactionStats);

// ==================== ADMIN TRANSACTION ROUTES ====================

// Get all transactions (admin only)
router.get('/admin/all-transactions', auth, admin, transactionController.getAllTransactions);

// Export transactions (admin only)
router.get('/admin/export', auth, admin, transactionController.exportTransactions);

module.exports = router;