// routes/mpesaRoutes.js
const express = require('express');
const router = express.Router();
const mpesaController = require('../controllers/mpesaController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// ==================== FARMER ROUTES ====================
// Initiate STK Push payment
router.post('/stk-push', auth, mpesaController.initiatePayment);

// Query payment status
router.get('/status/:consultationId', auth, mpesaController.queryPaymentStatus);

// Get farmer's payment history
router.get('/history/farmer', auth, mpesaController.getFarmerPayments);

// ==================== EXPERT ROUTES ====================
// Get expert's earnings 
router.get('/earnings/expert', auth, mpesaController.getExpertEarnings);

// Process refund 
router.post('/refund/:consultationId', auth, mpesaController.processRefund);

// ==================== ADMIN ROUTES ====================
// Get all payments (admin only)
router.get('/admin/all-payments', auth, admin, mpesaController.getAllPayments);

// ==================== MPESA CALLBACK (Webhook) ====================
// M-Pesa callback (no authentication - called by Safaricom)
router.post('/callback', mpesaController.handleCallback);

module.exports = router;