// models/Consultation.js - UPDATED & FIXED
const mongoose = require('mongoose');

const consultationSchema = new mongoose.Schema({
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  expert: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  bookingDate: {
    type: Date,
    required: true,
    index: true
  },
  startTime: {
    type: String, // HH:MM format
    required: true
  },
  duration: { // in minutes
    type: Number,
    required: true,
    min: 15,
    max: 240 // 4 hours max
  },
  endTime: {
    type: String,
    required: true
  },
  topic: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'completed', 'cancelled', 'no_show'],
    default: 'pending',
    index: true
  },
  // Payment fields
  payment: {
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending'
    },
    amount: {
      type: Number,
      default: 0
    },
    hourlyRate: {
      type: Number,
      default: 0
    },
    totalHours: {
      type: Number,
      default: 0
    },
    isFree: {
      type: Boolean,
      default: false
    },
    mpesaRequestID: String,
    mpesaCheckoutID: String,
    mpesaPhone: String,
    transactionID: String,
    paymentMethod: {
      type: String,
      enum: ['mpesa', 'card', 'cash'],
      default: 'mpesa'
    },
    mpesaCode: String,
    paidAt: Date
  },
  // Video call fields
  meetingLink: String,
  meetingId: String,
  // Chat fields
  chatSession: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChatSession'
  },
  // Rating and review
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  review: {
    type: String,
    maxlength: 500
  },
  reviewedAt: Date,
  // Cancellation
  cancelledBy: {
    type: String,
    enum: ['farmer', 'expert', 'system']
  },
  cancellationReason: String,
  cancelledAt: Date,
  // Rescheduling
  rescheduledFrom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Consultation'
  },
  isRescheduled: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Compound indexes for efficient queries
consultationSchema.index({ expert: 1, status: 1 });
consultationSchema.index({ farmer: 1, status: 1 });
consultationSchema.index({ bookingDate: 1, startTime: 1 });
consultationSchema.index({ expert: 1, bookingDate: 1, status: 1 });

// Pre-save hook to calculate endTime ONLY
consultationSchema.pre('save', function(next) {
  // Calculate end time
  if (this.startTime && this.duration) {
    const [hours, minutes] = this.startTime.split(':').map(Number);
    const startInMinutes = hours * 60 + minutes;
    const endInMinutes = startInMinutes + this.duration;
    
    const endHours = Math.floor(endInMinutes / 60) % 24;
    const endMinutes = endInMinutes % 60;
    
    this.endTime = `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
  }

  next();
});

// Method to check if consultation can be cancelled
consultationSchema.methods.canCancel = function() {
  const consultationTime = new Date(this.bookingDate);
  const [hours, minutes] = this.startTime.split(':').map(Number);
  consultationTime.setHours(hours, minutes, 0, 0);
  
  const now = new Date();
  const hoursDifference = (consultationTime - now) / (1000 * 60 * 60);
  
  return hoursDifference > 24; // Can cancel if more than 24 hours before
};

module.exports = mongoose.model('Consultation', consultationSchema);