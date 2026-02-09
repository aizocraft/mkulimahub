const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  consultation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Consultation',
    required: true,
    index: true
  },
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  expert: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['payment', 'refund', 'payout', 'commission'],
    default: 'payment'
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'reversed'],
    default: 'pending'
  },
  amount: {
    type: Number,
    required: true,
    min: 1
  },
  currency: {
    type: String,
    default: 'KES'
  },
  paymentMethod: {
    type: String,
    enum: ['mpesa', 'card', 'bank'],
    default: 'mpesa'
  },
  
  // M-Pesa specific fields
  mpesa: {
    merchantRequestID: String,
    checkoutRequestID: String,
    resultCode: String,
    resultDesc: String,
    mpesaReceiptNumber: String,
    phoneNumber: String,
    transactionDate: Date,
    accountReference: String,
    callbackMetadata: {
      type: Map,
      of: mongoose.Schema.Types.Mixed
    }
  },
  
  // Platform fees
  fees: {
    platformFee: { type: Number, default: 0 },
    processingFee: { type: Number, default: 0 },
    totalFees: { type: Number, default: 0 },
    netAmount: { type: Number, default: 0 }
  },
  
  // Timestamps
  initiatedAt: { type: Date, default: Date.now },
  processedAt: Date,
  completedAt: Date,
  
  // Metadata
  notes: String,
  ipAddress: String,
  userAgent: String
}, {
  timestamps: true
});

// Indexes
transactionSchema.index({ farmer: 1, status: 1 });
transactionSchema.index({ expert: 1, status: 1 });
transactionSchema.index({ 'mpesa.mpesaReceiptNumber': 1 });
transactionSchema.index({ createdAt: -1 });

// Pre-save to calculate fees (15% platform commission)
transactionSchema.pre('save', function(next) {
  if (this.isModified('amount') && this.amount > 0) {
    this.fees.platformFee = this.amount * 0.15; // 15% platform fee
    this.fees.processingFee = this.amount * 0.02; // 2% processing fee
    this.fees.totalFees = this.fees.platformFee + this.fees.processingFee;
    this.fees.netAmount = this.amount - this.fees.totalFees;
  }
  
  // Update timestamps based on status
  if (this.isModified('status')) {
    const now = new Date();
    if (this.status === 'processing') this.processedAt = now;
    if (this.status === 'completed') this.completedAt = now;
  }
  
  next();
});

module.exports = mongoose.model('Transaction', transactionSchema);