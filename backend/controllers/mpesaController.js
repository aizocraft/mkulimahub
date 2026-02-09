// controllers/mpesaController.js
const axios = require('axios');
const crypto = require('crypto');
const Consultation = require('../models/Consultation');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const { logger } = require('../middleware/logger');

// M-Pesa Configuration
const MPESA_CONFIG = {
  consumerKey: process.env.MPESA_CONSUMER_KEY,
  consumerSecret: process.env.MPESA_CONSUMER_SECRET,
  shortCode: process.env.MPESA_SHORT_CODE,
  passkey: process.env.MPESA_PASSKEY,
  callbackURL: process.env.MPESA_CALLBACK_URL,
  environment: process.env.MPESA_ENVIRONMENT || 'sandbox'
};

// Generate access token
const getAccessToken = async () => {
  try {
    const url = MPESA_CONFIG.environment === 'production' 
      ? 'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials'
      : 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials';

    const auth = Buffer.from(`${MPESA_CONFIG.consumerKey}:${MPESA_CONFIG.consumerSecret}`).toString('base64');
    
    const response = await axios.get(url, {
      headers: { 'Authorization': `Basic ${auth}` }
    });

    return response.data.access_token;
  } catch (error) {
    logger.error('Error getting MPesa access token:', error.message);
    throw new Error('Failed to get MPesa access token');
  }
};

// Generate password for STK Push
const generatePassword = (shortcode, passkey, timestamp) => {
  const data = Buffer.from(shortcode + passkey + timestamp).toString('base64');
  return data;
};

// Format phone number (e.g., 0712345678 -> 254712345678)
const formatPhoneNumber = (phone) => {
  let formatted = phone.toString().trim();
  if (formatted.startsWith('0')) {
    formatted = '254' + formatted.substring(1);
  } else if (formatted.startsWith('+254')) {
    formatted = formatted.substring(1);
  } else if (!formatted.startsWith('254')) {
    formatted = '254' + formatted;
  }
  return formatted;
};

// ==================== MAIN CONTROLLERS ====================

// 1. Initiate STK Push Payment
const initiatePayment = async (req, res, next) => {
  try {
    const { consultationId, phoneNumber } = req.body;
    const farmerId = req.user.id;

    // Validate input
    if (!consultationId || !phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Consultation ID and phone number are required'
      });
    }

    // Format phone number
    const formattedPhone = formatPhoneNumber(phoneNumber);
    
    // Find consultation
    const consultation = await Consultation.findById(consultationId)
      .populate('farmer', '_id name')
      .populate('expert', '_id name hourlyRate');

    if (!consultation) {
      return res.status(404).json({
        success: false,
        message: 'Consultation not found'
      });
    }

    // Verify consultation belongs to farmer
    if (consultation.farmer._id.toString() !== farmerId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to pay for this consultation'
      });
    }

    // Check consultation status
    if (consultation.status !== 'accepted') {
      return res.status(400).json({
        success: false,
        message: 'Consultation must be accepted by expert before payment'
      });
    }

    // Check if already paid
    if (consultation.payment.status === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Consultation already paid'
      });
    }

    // Get access token
    const accessToken = await getAccessToken();
    
    // Generate timestamp (YYYYMMDDHHmmss)
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
    
    // Generate password
    const password = generatePassword(MPESA_CONFIG.shortCode, MPESA_CONFIG.passkey, timestamp);

    // Prepare STK Push payload
    const stkPushPayload = {
      BusinessShortCode: MPESA_CONFIG.shortCode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: Math.ceil(consultation.payment.amount), // Round up to whole number
      PartyA: formattedPhone,
      PartyB: MPESA_CONFIG.shortCode,
      PhoneNumber: formattedPhone,
      CallBackURL: MPESA_CONFIG.callbackURL,
      AccountReference: `CONSULT-${consultationId.toString().slice(-6)}`,
      TransactionDesc: `Consultation with ${consultation.expert.name}`
    };

    // Make STK Push request
    const stkPushUrl = MPESA_CONFIG.environment === 'production'
      ? 'https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest'
      : 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest';

    const response = await axios.post(stkPushUrl, stkPushPayload, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    const mpesaResponse = response.data;

    // Create transaction record
    const transaction = new Transaction({
      consultation: consultationId,
      farmer: farmerId,
      expert: consultation.expert._id,
      type: 'payment',
      status: 'pending',
      amount: consultation.payment.amount,
      paymentMethod: 'mpesa',
      mpesa: {
        merchantRequestID: mpesaResponse.MerchantRequestID,
        checkoutRequestID: mpesaResponse.CheckoutRequestID,
        resultCode: mpesaResponse.ResponseCode,
        resultDesc: mpesaResponse.ResponseDescription,
        phoneNumber: formattedPhone,
        accountReference: stkPushPayload.AccountReference
      },
      initiatedAt: new Date()
    });

    await transaction.save();

    // Update consultation with MPesa details
    consultation.payment.mpesaRequestID = mpesaResponse.MerchantRequestID;
    consultation.payment.mpesaCheckoutID = mpesaResponse.CheckoutRequestID;
    consultation.payment.mpesaPhone = formattedPhone;
    await consultation.save();

    logger.info('STK Push initiated', {
      consultationId,
      transactionId: transaction._id,
      amount: consultation.payment.amount,
      phone: formattedPhone
    });

    res.status(200).json({
      success: true,
      message: 'Payment request sent to your phone. Please check your M-Pesa to complete payment.',
      data: {
        transactionId: transaction._id,
        merchantRequestID: mpesaResponse.MerchantRequestID,
        checkoutRequestID: mpesaResponse.CheckoutRequestID,
        amount: consultation.payment.amount
      }
    });

  } catch (error) {
    logger.error('Error initiating STK Push:', {
      error: error.message,
      consultationId: req.body.consultationId,
      userId: req.user.id,
      stack: error.stack
    });

    // Handle specific errors
    let errorMessage = 'Failed to initiate payment';
    if (error.response?.data?.errorMessage) {
      errorMessage = `M-Pesa Error: ${error.response.data.errorMessage}`;
    }

    res.status(500).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// 2. Handle M-Pesa Callback (Webhook)
const handleCallback = async (req, res, next) => {
  try {
    const callbackData = req.body;
    
    logger.info('M-Pesa Callback Received', {
      callbackType: 'STKPush',
      body: JSON.stringify(callbackData)
    });

    // Validate callback structure
    if (!callbackData.Body?.stkCallback) {
      logger.warn('Invalid callback format');
      return res.status(400).json({ ResultCode: 1, ResultDesc: 'Invalid callback format' });
    }

    const stkCallback = callbackData.Body.stkCallback;
    
    // Find consultation by MerchantRequestID or CheckoutRequestID
    const consultation = await Consultation.findOne({
      $or: [
        { 'payment.mpesaRequestID': stkCallback.MerchantRequestID },
        { 'payment.mpesaCheckoutID': stkCallback.CheckoutRequestID }
      ]
    }).populate('farmer expert');

    if (!consultation) {
      logger.error('Consultation not found for callback', {
        merchantRequestID: stkCallback.MerchantRequestID,
        checkoutRequestID: stkCallback.CheckoutRequestID
      });
      return res.status(200).json({ ResultCode: 1, ResultDesc: 'Consultation not found' });
    }

    // Find transaction
    const transaction = await Transaction.findOne({
      'mpesa.merchantRequestID': stkCallback.MerchantRequestID
    });

    if (!transaction) {
      logger.error('Transaction not found for callback');
      return res.status(200).json({ ResultCode: 1, ResultDesc: 'Transaction not found' });
    }

    // Handle based on result code
    if (stkCallback.ResultCode === 0) {
      // PAYMENT SUCCESSFUL
      
      // Extract callback metadata
      const metadataItems = stkCallback.CallbackMetadata?.Item || [];
      const metadata = {};
      metadataItems.forEach(item => {
        metadata[item.Name] = item.Value;
      });

      // Update transaction
      transaction.status = 'completed';
      transaction.mpesa.mpesaReceiptNumber = metadata.MpesaReceiptNumber;
      transaction.mpesa.phoneNumber = metadata.PhoneNumber;
      transaction.mpesa.transactionDate = new Date(
        metadata.TransactionDate.toString().replace(
          /(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/,
          '$1-$2-$3T$4:$5:$6'
        )
      );
      transaction.mpesa.callbackMetadata = metadata;
      transaction.completedAt = new Date();
      
      await transaction.save();

      // Update consultation
      consultation.payment.status = 'paid';
      consultation.payment.mpesaCode = metadata.MpesaReceiptNumber;
      consultation.payment.paidAt = new Date();
      consultation.status = 'accepted'; // Ensure status is accepted
      await consultation.save();

      logger.info('Payment completed successfully', {
        consultationId: consultation._id,
        transactionId: transaction._id,
        mpesaReceipt: metadata.MpesaReceiptNumber,
        amount: consultation.payment.amount
      });

      // Emit socket events for real-time updates
      const io = require('../socket').getIO();
      
      // Notify farmer
      io.to(`user_${consultation.farmer._id}`).emit('payment:success', {
        consultationId: consultation._id,
        amount: consultation.payment.amount,
        mpesaReceipt: metadata.MpesaReceiptNumber,
        timestamp: new Date(),
        message: 'Payment successful! Consultation confirmed.'
      });

      // Notify expert
      io.to(`user_${consultation.expert._id}`).emit('payment:received', {
        consultationId: consultation._id,
        farmerName: consultation.farmer.name,
        amount: consultation.payment.amount,
        netAmount: transaction.fees.netAmount,
        timestamp: new Date(),
        message: 'Payment received for consultation'
      });

    } else {
      // PAYMENT FAILED
      transaction.status = 'failed';
      transaction.mpesa.resultCode = stkCallback.ResultCode.toString();
      transaction.mpesa.resultDesc = stkCallback.ResultDesc;
      await transaction.save();

      consultation.payment.status = 'failed';
      await consultation.save();

      logger.error('Payment failed', {
        consultationId: consultation._id,
        resultCode: stkCallback.ResultCode,
        resultDesc: stkCallback.ResultDesc
      });

      // Notify farmer
      const io = require('../socket').getIO();
      io.to(`user_${consultation.farmer._id}`).emit('payment:failed', {
        consultationId: consultation._id,
        reason: stkCallback.ResultDesc,
        timestamp: new Date(),
        message: 'Payment failed. Please try again.'
      });
    }

    // Always return success to M-Pesa
    res.status(200).json({ ResultCode: 0, ResultDesc: 'Success' });

  } catch (error) {
    logger.error('Error processing MPesa callback:', {
      error: error.message,
      stack: error.stack
    });
    
    res.status(200).json({ ResultCode: 1, ResultDesc: 'Error processing callback' });
  }
};

// 3. Query Payment Status
const queryPaymentStatus = async (req, res, next) => {
  try {
    const { consultationId } = req.params;
    const userId = req.user.id;

    const consultation = await Consultation.findById(consultationId)
      .populate('farmer', '_id')
      .populate('expert', '_id');

    if (!consultation) {
      return res.status(404).json({
        success: false,
        message: 'Consultation not found'
      });
    }

    // Check authorization
    const isFarmer = consultation.farmer._id.toString() === userId;
    const isExpert = consultation.expert._id.toString() === userId;
    const isAdmin = req.user.role === 'admin';
    
    if (!isFarmer && !isExpert && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view payment status'
      });
    }

    // Find transaction
    const transaction = await Transaction.findOne({
      consultation: consultationId,
      type: 'payment'
    }).sort({ createdAt: -1 });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'No payment transaction found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        consultationId: consultation._id,
        consultationStatus: consultation.status,
        paymentStatus: consultation.payment.status,
        transaction: {
          id: transaction._id,
          status: transaction.status,
          amount: transaction.amount,
          mpesaReceiptNumber: transaction.mpesa.mpesaReceiptNumber,
          initiatedAt: transaction.initiatedAt,
          completedAt: transaction.completedAt
        },
        paymentDetails: consultation.payment
      }
    });

  } catch (error) {
    logger.error('Error querying payment status:', {
      error: error.message,
      consultationId: req.params.consultationId,
      userId: req.user.id
    });
    
    res.status(500).json({
      success: false,
      message: 'Failed to query payment status'
    });
  }
};

// 4. Get Farmer's Payment History
const getFarmerPayments = async (req, res, next) => {
  try {
    // Check if user is farmer or admin
    if (req.user.role !== 'farmer' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Farmer privileges required.'
      });
    }

    const farmerId = req.user.id;
    const { startDate, endDate, status, page = 1, limit = 20 } = req.query;

    let query = { farmer: farmerId, type: 'payment' };
    
    // Date range filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    
    // Status filter
    if (status) {
      query.status = status;
    }

    const transactions = await Transaction.find(query)
      .populate('consultation', 'topic bookingDate status')
      .populate('expert', 'name expertise')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((page - 1) * limit);

    const total = await Transaction.countDocuments(query);

    // Calculate totals
    const totalSpent = await Transaction.aggregate([
      { $match: { farmer: farmerId, type: 'payment', status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        transactions,
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        summary: {
          totalTransactions: total,
          totalSpent: totalSpent[0]?.total || 0,
          pendingPayments: await Transaction.countDocuments({ 
            farmer: farmerId, 
            type: 'payment', 
            status: 'pending' 
          })
        }
      }
    });

  } catch (error) {
    logger.error('Error fetching farmer payments:', {
      error: error.message,
      userId: req.user.id
    });
    
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment history'
    });
  }
};

// 5. Get Expert's Earnings
const getExpertEarnings = async (req, res, next) => {
  try {
    // Check if user is expert or admin
    if (req.user.role !== 'expert' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Expert or admin privileges required.'
      });
    }

    const expertId = req.user.id;
    const { startDate, endDate, page = 1, limit = 20 } = req.query;

    let query = { expert: expertId, type: 'payment', status: 'completed' };
    
    // Date range filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const transactions = await Transaction.find(query)
      .populate('consultation', 'topic bookingDate')
      .populate('farmer', 'name')
      .sort({ completedAt: -1 })
      .limit(parseInt(limit))
      .skip((page - 1) * limit);

    const total = await Transaction.countDocuments(query);

    // Calculate earnings
    const earnings = await Transaction.aggregate([
      { $match: { expert: expertId, type: 'payment', status: 'completed' } },
      { 
        $group: { 
          _id: null, 
          totalEarnings: { $sum: '$fees.netAmount' },
          totalRevenue: { $sum: '$amount' },
          totalPlatformFees: { $sum: '$fees.platformFee' },
          totalProcessingFees: { $sum: '$fees.processingFee' }
        } 
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        transactions,
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        earnings: earnings[0] || {
          totalEarnings: 0,
          totalRevenue: 0,
          totalPlatformFees: 0,
          totalProcessingFees: 0
        }
      }
    });

  } catch (error) {
    logger.error('Error fetching expert earnings:', {
      error: error.message,
      userId: req.user.id
    });
    
    res.status(500).json({
      success: false,
      message: 'Failed to fetch earnings'
    });
  }
};

// 6. Admin: Get All Payments
const getAllPayments = async (req, res, next) => {
  try {
    // Check admin role (admin middleware already did this, but keeping for safety)
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const { startDate, endDate, status, paymentMethod, page = 1, limit = 50 } = req.query;

    let query = { type: 'payment' };
    
    // Apply filters
    if (status) query.status = status;
    if (paymentMethod) query.paymentMethod = paymentMethod;
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const transactions = await Transaction.find(query)
      .populate('farmer', 'name email phone')
      .populate('expert', 'name email')
      .populate('consultation', 'topic bookingDate')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((page - 1) * limit);

    const total = await Transaction.countDocuments(query);

    // Platform statistics
    const stats = await Transaction.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$amount' },
          totalPlatformFees: { $sum: '$fees.platformFee' },
          totalProcessingFees: { $sum: '$fees.processingFee' },
          completedPayments: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          pendingPayments: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          failedPayments: { $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] } }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        transactions,
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        statistics: stats[0] || {
          totalRevenue: 0,
          totalPlatformFees: 0,
          totalProcessingFees: 0,
          completedPayments: 0,
          pendingPayments: 0,
          failedPayments: 0
        }
      }
    });

  } catch (error) {
    logger.error('Error fetching all payments:', {
      error: error.message,
      userId: req.user.id
    });
    
    res.status(500).json({
      success: false,
      message: 'Failed to fetch all payments'
    });
  }
};

// 7. Process Refund
const processRefund = async (req, res, next) => {
  try {
    const { consultationId } = req.params;
    const { reason } = req.body;
    const userId = req.user.id;

    // Find consultation
    const consultation = await Consultation.findById(consultationId)
      .populate('farmer expert');

    if (!consultation) {
      return res.status(404).json({
        success: false,
        message: 'Consultation not found'
      });
    }

    // Check authorization (admin or expert)
    const isExpert = consultation.expert._id.toString() === userId && req.user.role === 'expert';
    const isAdmin = req.user.role === 'admin';
    
    if (!isExpert && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to process refund'
      });
    }

    // Check if payment was made
    if (consultation.payment.status !== 'paid') {
      return res.status(400).json({
        success: false,
        message: 'No payment to refund'
      });
    }

    // Find original transaction
    const originalTransaction = await Transaction.findOne({
      consultation: consultationId,
      type: 'payment',
      status: 'completed'
    });

    if (!originalTransaction) {
      return res.status(404).json({
        success: false,
        message: 'Original transaction not found'
      });
    }

    // Create refund transaction
    const refundTransaction = new Transaction({
      consultation: consultationId,
      farmer: consultation.farmer._id,
      expert: consultation.expert._id,
      type: 'refund',
      status: 'pending',
      amount: originalTransaction.amount,
      paymentMethod: originalTransaction.paymentMethod,
      notes: `Refund: ${reason || 'Customer refund'}`,
      initiatedBy: isAdmin ? 'admin' : 'expert'
    });

    await refundTransaction.save();

    // Update original transaction
    originalTransaction.status = 'reversed';
    await originalTransaction.save();

    // Update consultation
    consultation.payment.status = 'refunded';
    consultation.status = 'cancelled';
    consultation.cancelledBy = isAdmin ? 'admin' : 'expert';
    consultation.cancellationReason = reason || 'Payment refunded';
    await consultation.save();

    logger.info('Refund processed', {
      consultationId,
      transactionId: refundTransaction._id,
      amount: refundTransaction.amount,
      processedBy: userId
    });

    // Notify farmer via socket
    const io = require('../socket').getIO();
    io.to(`user_${consultation.farmer._id}`).emit('payment:refunded', {
      consultationId: consultation._id,
      amount: refundTransaction.amount,
      reason: reason || 'Payment refunded',
      timestamp: new Date(),
      message: 'Your payment has been refunded'
    });

    res.status(200).json({
      success: true,
      message: 'Refund processed successfully',
      data: {
        refundId: refundTransaction._id,
        amount: refundTransaction.amount,
        consultationId: consultation._id
      }
    });

  } catch (error) {
    logger.error('Error processing refund:', {
      error: error.message,
      consultationId: req.params.consultationId,
      userId: req.user.id
    });
    
    res.status(500).json({
      success: false,
      message: 'Failed to process refund'
    });
  }
};

module.exports = {
  initiatePayment,
  handleCallback,
  queryPaymentStatus,
  getFarmerPayments,
  getExpertEarnings,
  getAllPayments,
  processRefund
};