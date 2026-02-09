// controllers/transactionController.js
const Transaction = require('../models/Transaction');
const Consultation = require('../models/Consultation');
const User = require('../models/User');
const { logger } = require('../middleware/logger');

// ==================== TRANSACTION CONTROLLERS ====================

// 1. Get single transaction by ID
exports.getTransaction = async (req, res, next) => {
  try {
    const { transactionId } = req.params;
    const userId = req.user.id;

    console.log(`Getting transaction ${transactionId} for user ${userId}`);

    const transaction = await Transaction.findById(transactionId)
      .populate('farmer', 'name email phone')
      .populate('expert', 'name email')
      .populate('consultation', 'topic bookingDate status');

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    // Check authorization - user must be farmer, expert, or admin
    const isFarmer = transaction.farmer._id.toString() === userId;
    const isExpert = transaction.expert._id.toString() === userId;
    const isAdmin = req.user.role === 'admin';
    
    if (!isFarmer && !isExpert && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this transaction'
      });
    }

    res.status(200).json({
      success: true,
      data: transaction
    });

  } catch (error) {
    logger.error('Error fetching transaction:', {
      error: error.message,
      transactionId: req.params.transactionId,
      userId: req.user.id,
      stack: error.stack
    });
    
    // Handle CastError (invalid ObjectId)
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid transaction ID format'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transaction'
    });
  }
};

// 2. Get user's transactions
exports.getUserTransactions = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { 
      type, 
      status, 
      startDate, 
      endDate, 
      page = 1, 
      limit = 20 
    } = req.query;

    console.log(`Getting transactions for user ${userId}, filters:`, {
      type, status, startDate, endDate, page, limit
    });

    // Build query - user can be either farmer or expert
    let query = {
      $or: [
        { farmer: userId },
        { expert: userId }
      ]
    };

    // Apply filters
    if (type) query.type = type;
    if (status) query.status = status;
    
    // Date range filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const transactions = await Transaction.find(query)
      .populate('farmer', 'name email')
      .populate('expert', 'name email')
      .populate('consultation', 'topic bookingDate')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((page - 1) * limit);

    const total = await Transaction.countDocuments(query);

    // Calculate summary statistics
    const summary = await Transaction.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          totalTransactions: { $sum: 1 },
          pendingCount: { 
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } 
          },
          completedCount: { 
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } 
          },
          failedCount: { 
            $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] } 
          }
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
        summary: summary[0] || {
          totalAmount: 0,
          totalTransactions: 0,
          pendingCount: 0,
          completedCount: 0,
          failedCount: 0
        }
      }
    });

  } catch (error) {
    logger.error('Error fetching user transactions:', {
      error: error.message,
      userId: req.user.id,
      stack: error.stack
    });
    
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transactions'
    });
  }
};

// 3. Admin: Get all transactions
exports.getAllTransactions = async (req, res, next) => {
  try {
    // Check admin role (admin middleware already did this, but keeping for safety)
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const { 
      startDate, 
      endDate, 
      type, 
      status, 
      paymentMethod,
      page = 1, 
      limit = 50 
    } = req.query;

    console.log('Admin fetching all transactions with filters:', {
      startDate, endDate, type, status, paymentMethod, page, limit
    });

    let query = {};

    // Apply filters
    if (type) query.type = type;
    if (status) query.status = status;
    if (paymentMethod) query.paymentMethod = paymentMethod;
    
    // Date range filter
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
          totalNetEarnings: { $sum: '$fees.netAmount' },
          transactionCount: { $sum: 1 },
          completedCount: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          pendingCount: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          failedCount: { $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] } }
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
          totalNetEarnings: 0,
          transactionCount: 0,
          completedCount: 0,
          pendingCount: 0,
          failedCount: 0
        }
      }
    });

  } catch (error) {
    logger.error('Error fetching all transactions:', {
      error: error.message,
      userId: req.user.id,
      stack: error.stack
    });
    
    res.status(500).json({
      success: false,
      message: 'Failed to fetch all transactions'
    });
  }
};

// 4. Export transactions (CSV format)
exports.exportTransactions = async (req, res, next) => {
  try {
    // Check admin role (admin middleware already did this, but keeping for safety)
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const { startDate, endDate, format = 'csv' } = req.query;

    console.log('Exporting transactions as', format, 'from', startDate, 'to', endDate);

    let query = {};
    
    // Date range filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const transactions = await Transaction.find(query)
      .populate('farmer', 'name email')
      .populate('expert', 'name email')
      .populate('consultation', 'topic')
      .sort({ createdAt: -1 })
      .limit(1000); // Limit exports to 1000 records

    if (format === 'csv') {
      // Convert to CSV
      const csvData = transactions.map(t => ({
        'Transaction ID': t._id,
        'Date': t.createdAt.toISOString(),
        'Farmer': t.farmer?.name || 'N/A',
        'Expert': t.expert?.name || 'N/A',
        'Type': t.type,
        'Status': t.status,
        'Amount': t.amount,
        'Currency': t.currency,
        'Payment Method': t.paymentMethod,
        'MPesa Receipt': t.mpesa?.mpesaReceiptNumber || 'N/A',
        'Topic': t.consultation?.topic || 'N/A',
        'Platform Fee': t.fees.platformFee,
        'Processing Fee': t.fees.processingFee,
        'Net Amount': t.fees.netAmount
      }));

      // Generate CSV
      const csv = convertToCSV(csvData);
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=transactions_${new Date().toISOString().split('T')[0]}.csv`);
      return res.send(csv);
    }

    // Default to JSON
    res.status(200).json({
      success: true,
      data: {
        transactions,
        count: transactions.length,
        exportedAt: new Date(),
        filters: { startDate, endDate }
      }
    });

  } catch (error) {
    logger.error('Error exporting transactions:', {
      error: error.message,
      userId: req.user.id,
      stack: error.stack
    });
    
    res.status(500).json({
      success: false,
      message: 'Failed to export transactions'
    });
  }
};

// 5. Get transaction statistics (for dashboard)
exports.getTransactionStats = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { period = 'month' } = req.query; // day, week, month, year

    console.log(`Getting transaction stats for user ${userId}, period: ${period}`);

    // Calculate date range based on period
    const now = new Date();
    let startDate;
    
    switch (period) {
      case 'day':
        startDate = new Date(now.setDate(now.getDate() - 1));
        break;
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case 'year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        startDate = new Date(now.setMonth(now.getMonth() - 1));
    }

    // User query - can be farmer or expert
    const userQuery = {
      $or: [
        { farmer: userId },
        { expert: userId }
      ],
      createdAt: { $gte: startDate }
    };

    // Get statistics
    const stats = await Transaction.aggregate([
      { $match: userQuery },
      {
        $group: {
          _id: {
            type: '$type',
            status: '$status'
          },
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          avgAmount: { $avg: '$amount' }
        }
      },
      {
        $sort: { '_id.type': 1, '_id.status': 1 }
      }
    ]);

    // Format statistics
    const formattedStats = {
      period: period,
      startDate: startDate,
      endDate: new Date(),
      totalTransactions: 0,
      totalAmount: 0,
      byType: {},
      byStatus: {}
    };

    stats.forEach(stat => {
      const type = stat._id.type;
      const status = stat._id.status;
      
      // Initialize type if not exists
      if (!formattedStats.byType[type]) {
        formattedStats.byType[type] = {
          count: 0,
          totalAmount: 0
        };
      }
      
      // Initialize status if not exists
      if (!formattedStats.byStatus[status]) {
        formattedStats.byStatus[status] = {
          count: 0,
          totalAmount: 0
        };
      }
      
      // Update totals
      formattedStats.byType[type].count += stat.count;
      formattedStats.byType[type].totalAmount += stat.totalAmount;
      
      formattedStats.byStatus[status].count += stat.count;
      formattedStats.byStatus[status].totalAmount += stat.totalAmount;
      
      formattedStats.totalTransactions += stat.count;
      formattedStats.totalAmount += stat.totalAmount;
    });

    res.status(200).json({
      success: true,
      data: formattedStats
    });

  } catch (error) {
    logger.error('Error getting transaction stats:', {
      error: error.message,
      userId: req.user.id,
      stack: error.stack
    });
    
    res.status(500).json({
      success: false,
      message: 'Failed to get transaction statistics'
    });
  }
};

// Helper function to convert to CSV
function convertToCSV(data) {
  if (data.length === 0) return '';
  
  const headers = Object.keys(data[0]);
  const csvRows = [];
  
  // Add headers
  csvRows.push(headers.join(','));
  
  // Add rows
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header];
      // Escape quotes and wrap in quotes if contains comma
      const escaped = String(value).replace(/"/g, '""');
      return /[,"\n]/.test(escaped) ? `"${escaped}"` : escaped;
    });
    csvRows.push(values.join(','));
  }
  
  return csvRows.join('\n');
}