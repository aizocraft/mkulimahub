// controllers/consultationController.js
const Consultation = require('../models/Consultation');
const User = require('../models/User');
const { logger } = require('../middleware/logger');
const NotificationService = require('../services/notificationService');

exports.bookConsultation = async (req, res, next) => {
  try {
    console.log('=== BOOKING REQUEST ===');
    console.log('Request user:', req.user);
    console.log('Request body:', req.body);
    
    const { 
      expertId, 
      date, 
      startTime, 
      duration, 
      topic, 
      description 
    } = req.body;
    
    // Get farmer ID from authenticated user
    const farmerId = req.user._id;
    
    console.log('Farmer ID:', farmerId);
    console.log('Expert ID:', expertId);

    // Basic validation
    if (!expertId || !date || !startTime || !duration || !topic) {
      console.log('Validation failed: Missing required fields');
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: expertId, date, startTime, duration, topic'
      });
    }

    // Check if expert exists
    const expert = await User.findById(expertId);
    console.log('Expert found:', !!expert);
    
    if (!expert) {
      console.log('Expert not found with ID:', expertId);
      return res.status(404).json({
        success: false,
        message: 'Expert not found'
      });
    }
    
    if (expert.role !== 'expert') {
      console.log('User is not an expert:', expert.role);
      return res.status(400).json({
        success: false,
        message: 'Selected user is not an expert'
      });
    }

    // Validate future date
    const bookingDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (bookingDate < today) {
      console.log('Cannot book for past date:', bookingDate);
      return res.status(400).json({
        success: false,
        message: 'Cannot book for past dates'
      });
    }

    // Calculate cost
    const hourlyRate = expert.hourlyRate || 0;
    const totalHours = duration / 60;
    const amount = totalHours * hourlyRate;
    const isFree = hourlyRate === 0;

    console.log('Payment calculation:', {
      hourlyRate,
      duration,
      totalHours,
      amount,
      isFree
    });

    // Calculate end time
    const [hours, minutes] = startTime.split(':').map(Number);
    const startInMinutes = hours * 60 + minutes;
    const endInMinutes = startInMinutes + duration;
    const endHours = Math.floor(endInMinutes / 60) % 24;
    const endMinutes = endInMinutes % 60;
    const endTime = `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;

    console.log('Time calculation:', {
      startTime,
      duration,
      endTime
    });

    // Create consultation
    const consultation = new Consultation({
      farmer: farmerId,
      expert: expertId,
      bookingDate: bookingDate,
      startTime: startTime,
      endTime: endTime,
      duration: duration,
      topic: topic,
      description: description || '',
      status: 'pending', // Farmer proposes, expert reviews
      payment: {
        status: isFree ? 'paid' : 'pending',
        amount: amount,
        hourlyRate: hourlyRate,
        totalHours: totalHours,
        isFree: isFree
      }
    });

    console.log('Consultation object before save:', {
      farmer: consultation.farmer,
      expert: consultation.expert,
      bookingDate: consultation.bookingDate,
      startTime: consultation.startTime,
      endTime: consultation.endTime
    });

    // Save consultation
    await consultation.save();
    console.log('Consultation saved successfully');

    // Populate details for response
    await consultation.populate('farmer', 'name email profilePicture');
    await consultation.populate('expert', 'name email profilePicture expertise');

    console.log('Booking successful, returning response');
    
    res.status(201).json({
      success: true,
      message: 'Consultation requested. Expert will review.',
      consultation: consultation
    });
    
  } catch (error) {
    console.error('=== BOOKING ERROR ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Error name:', error.name);
    console.error('Full error object:', JSON.stringify(error, null, 2));
    
    // Check for specific MongoDB errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors
      });
    }
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID format'
      });
    }
    
    // General error
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Helper function to generate unique meeting ID
const generateMeetingId = () => {
  // Generate a unique meeting ID using timestamp + random string
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 8);
  return `meeting_${timestamp}_${randomPart}`.toUpperCase();
};

// Expert accepts consultation
exports.acceptConsultation = async (req, res, next) => {
  try {
    const { consultationId } = req.params;
    const expertId = req.user.id;

    logger.info('Expert accepting consultation', {
      expertId,
      consultationId
    });

    const consultation = await Consultation.findById(consultationId)
      .populate('expert', '_id hourlyRate')
      .populate('farmer', 'name email');

    if (!consultation) {
      return res.status(404).json({
        success: false,
        message: 'Consultation not found'
      });
    }

    // Check if consultation has valid expert data
    if (!consultation.expert) {
      return res.status(400).json({
        success: false,
        message: 'Invalid consultation data'
      });
    }

    // Check if expert owns this consultation
    if (consultation.expert._id.toString() !== expertId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to accept this consultation'
      });
    }

    // Check if consultation is still pending
    if (consultation.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Consultation is already ${consultation.status}`
      });
    }

    consultation.status = 'accepted';

    // Generate unique meeting ID and meeting link
    const meetingId = generateMeetingId();
    const meetingLink = `https://mhvideocall.vercel.app/${meetingId}`;
    
    consultation.meetingId = meetingId;
    consultation.meetingLink = meetingLink;

    logger.info('Meeting generated', {
      consultationId,
      meetingId,
      meetingLink
    });

    // Notify farmer that they can now initiate video call
    if (consultation.payment.isFree || consultation.payment.status === 'paid') {
      const io = require('../socket').getIO();
      io.to(`user_${consultation.farmer._id}`).emit('notification:consultation-ready', {
        type: 'consultation_accepted_ready',
        consultationId: consultation._id,
        expert: {
          id: consultation.expert._id,
          name: consultation.expert.name
        },
        meetingId: meetingId,
        meetingLink: meetingLink,
        message: 'Consultation accepted! You can now start video call.',
        timestamp: new Date()
      });
    }

    await consultation.save();

    // Send notification to farmer
    await NotificationService.createConsultationNotification(
      consultation._id,
      consultation.farmer._id,
      'consultation_accepted',
      'Consultation Accepted',
      `Your consultation request with ${consultation.expert.name} has been accepted. Topic: "${consultation.topic}". Scheduled for ${new Date(consultation.bookingDate).toLocaleDateString()} at ${consultation.startTime}. You can now start the video call.`,
      {
        expertId: consultation.expert._id,
        expertName: consultation.expert.name,
        topic: consultation.topic,
        bookingDate: consultation.bookingDate,
        startTime: consultation.startTime,
        endTime: consultation.endTime,
        duration: consultation.duration,
        paymentAmount: consultation.payment.amount,
        isFree: consultation.payment.isFree
      }
    );

    logger.info('Consultation accepted', {
      consultationId,
      expertId,
      isFree: consultation.payment.isFree
    });

    // TODO: Generate meeting link

    res.status(200).json({
      success: true,
      message: 'Consultation accepted successfully',
      consultation,
      paymentStatus: consultation.payment.status
    });
  } catch (error) {
    logger.error('Error accepting consultation', {
      error: error.message,
      expertId: req.user.id,
      consultationId: req.params.consultationId,
      stack: error.stack
    });
    next(error);
  }
};

// Expert rejects consultation
exports.rejectConsultation = async (req, res, next) => {
  try {
    const { consultationId } = req.params;
    const { reason } = req.body;
    const expertId = req.user.id;

    logger.info('Expert rejecting consultation', {
      expertId,
      consultationId,
      reason
    });

    const consultation = await Consultation.findById(consultationId)
      .populate('expert', '_id')
      .populate('farmer', 'name email');

    if (!consultation) {
      return res.status(404).json({
        success: false,
        message: 'Consultation not found'
      });
    }

    // Check if consultation has valid expert data
    if (!consultation.expert) {
      return res.status(400).json({
        success: false,
        message: 'Invalid consultation data'
      });
    }

    // Check if expert owns this consultation

    // Check if consultation is still pending
    if (consultation.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot reject consultation with status: ${consultation.status}`
      });
    }

    consultation.status = 'rejected';
    consultation.cancelledBy = 'expert';
    consultation.cancellationReason = reason || 'Rejected by expert';
    consultation.cancelledAt = new Date();
    
    // Refund if payment was made
    if (consultation.payment.status === 'paid') {
      consultation.payment.status = 'refunded';
    }
    
    await consultation.save();

    logger.info('Consultation rejected', {
      consultationId,
      expertId,
      reason: consultation.cancellationReason
    });

    // TODO: Send notification to farmer
    // TODO: Process refund if payment was made

    res.status(200).json({
      success: true,
      message: 'Consultation rejected successfully',
      consultation
    });
  } catch (error) {
    logger.error('Error rejecting consultation', {
      error: error.message,
      expertId: req.user.id,
      consultationId: req.params.consultationId,
      stack: error.stack
    });
    next(error);
  }
};

// Get expert's consultations
exports.getExpertConsultations = async (req, res, next) => {
  try {
    const expertId = req.user.id;
    const { status, date, page = 1, limit = 10 } = req.query;

    logger.info('Expert fetching consultations', {
      expertId,
      status,
      date
    });

    let query = { expert: expertId };
    
    if (status) {
      if (status === 'pending_payment') {
        query.status = 'accepted';
        query['payment.status'] = 'pending';
        query['payment.isFree'] = false;
      } else {
        query.status = status;
      }
    }
    
    if (date) {
      query.bookingDate = new Date(date);
    }

    const consultations = await Consultation.find(query)
      .populate('farmer', 'name')
      .sort({ bookingDate: 1, startTime: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Consultation.countDocuments(query);

    logger.info('Consultations fetched for expert', {
      expertId,
      count: consultations.length,
      total
    });

    res.status(200).json({
      success: true,
      count: consultations.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      consultations
    });
  } catch (error) {
    logger.error('Error fetching expert consultations', {
      error: error.message,
      expertId: req.user.id,
      stack: error.stack
    });
    next(error);
  }
};

// Get farmer's consultations
exports.getFarmerConsultations = async (req, res, next) => {
  try {
    const farmerId = req.user.id;
    const { status, date, page = 1, limit = 10 } = req.query;

    logger.info('Farmer fetching consultations', {
      farmerId,
      status,
      date
    });

    let query = { farmer: farmerId };

    if (status) {
      if (status === 'upcoming') {
        query.status = 'accepted';
      } else if (status === 'past') {
        query.status = { $in: ['completed', 'cancelled'] };
      } else if (status === 'pending') {
        query.status = 'pending';
      } else if (status === 'rejected') {
        query.status = 'rejected';
      } else if (status === 'pending_payment') {
        query.status = 'accepted';
        query['payment.status'] = 'pending';
        query['payment.isFree'] = false;
      } else if (status === 'all') {
        // No status filter for 'all'
      } else {
        query.status = status;
      }
    }

    if (date) {
      query.bookingDate = new Date(date);
    }

    const consultations = await Consultation.find(query)
      .populate('expert', 'name rating hourlyRate')
      .sort({ bookingDate: 1, startTime: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Consultation.countDocuments(query);

    logger.info('Consultations fetched for farmer', {
      farmerId,
      count: consultations.length,
      total
    });

    res.status(200).json({
      success: true,
      count: consultations.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      consultations
    });
  } catch (error) {
    logger.error('Error fetching farmer consultations', {
      error: error.message,
      farmerId: req.user.id,
      stack: error.stack
    });
    next(error);
  }
};

// Cancel consultation
exports.cancelConsultation = async (req, res, next) => {
  try {
    const { consultationId } = req.params;
    const { reason } = req.body;
    const userId = req.user.id;

    logger.info('User cancelling consultation', {
      userId,
      consultationId,
      reason
    });

    const consultation = await Consultation.findById(consultationId)
      .populate('farmer', '_id')
      .populate('expert', '_id');

    if (!consultation) {
      return res.status(404).json({
        success: false,
        message: 'Consultation not found'
      });
    }

    // Check if user is either farmer or expert
    const isFarmer = consultation.farmer._id.toString() === userId;
    const isExpert = consultation.expert._id.toString() === userId;
    
    if (!isFarmer && !isExpert) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this consultation'
      });
    }

    // Check if consultation can be cancelled
    if (!consultation.canCancel()) {
      return res.status(400).json({
        success: false,
        message: 'Consultation cannot be cancelled less than 24 hours before'
      });
    }

    // Update consultation
    consultation.status = 'cancelled';
    consultation.cancelledBy = isFarmer ? 'farmer' : 'expert';
    consultation.cancellationReason = reason || 'Cancelled by user';
    consultation.cancelledAt = new Date();

    // Refund if payment was made
    if (consultation.payment.status === 'paid') {
      consultation.payment.status = 'refunded';
    }

    await consultation.save();

    logger.info('Consultation cancelled', {
      consultationId,
      cancelledBy: consultation.cancelledBy
    });

    // TODO: Send notification to other party
    // TODO: Process refund if needed

    res.status(200).json({
      success: true,
      message: 'Consultation cancelled successfully',
      consultation
    });
  } catch (error) {
    logger.error('Error cancelling consultation', {
      error: error.message,
      userId: req.user.id,
      consultationId: req.params.consultationId,
      stack: error.stack
    });
    next(error);
  }
};

// Complete consultation (expert marks as completed)
exports.completeConsultation = async (req, res, next) => {
  try {
    const { consultationId } = req.params;
    const expertId = req.user.id;

    logger.info('Expert completing consultation', {
      expertId,
      consultationId
    });

    const consultation = await Consultation.findById(consultationId);

    if (!consultation) {
      return res.status(404).json({
        success: false,
        message: 'Consultation not found'
      });
    }

    // Check if expert owns this consultation
    if (consultation.expert.toString() !== expertId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to complete this consultation'
      });
    }

    // Check if consultation is accepted
    if (consultation.status !== 'accepted') {
      return res.status(400).json({
        success: false,
        message: `Cannot complete consultation with status: ${consultation.status}`
      });
    }

    consultation.status = 'completed';
    await consultation.save();

    logger.info('Consultation marked as completed', {
      consultationId,
      expertId
    });

    res.status(200).json({
      success: true,
      message: 'Consultation marked as completed',
      consultation
    });
  } catch (error) {
    logger.error('Error completing consultation', {
      error: error.message,
      expertId: req.user.id,
      consultationId: req.params.consultationId,
      stack: error.stack
    });
    next(error);
  }
};

// Add review and rating
exports.addReview = async (req, res, next) => {
  try {
    const { consultationId } = req.params;
    const { rating, review } = req.body;
    const userId = req.user.id;

    logger.info('User adding review', {
      userId,
      consultationId,
      rating
    });

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    const consultation = await Consultation.findById(consultationId)
      .populate('farmer', '_id')
      .populate('expert', '_id');

    if (!consultation) {
      return res.status(404).json({
        success: false,
        message: 'Consultation not found'
      });
    }

    // Check if user is the farmer who booked this consultation
    if (consultation.farmer._id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only the farmer can review this consultation'
      });
    }

    // Check if consultation is completed
    if (consultation.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Can only review completed consultations'
      });
    }

    // Check if already reviewed
    if (consultation.rating) {
      return res.status(400).json({
        success: false,
        message: 'Consultation already reviewed'
      });
    }

    consultation.rating = rating;
    consultation.review = review;
    consultation.reviewedAt = new Date();
    await consultation.save();

    // Update expert's average rating
    await updateExpertRating(consultation.expert._id);

    logger.info('Review added successfully', {
      consultationId,
      userId,
      rating
    });

    res.status(200).json({
      success: true,
      message: 'Review added successfully',
      consultation
    });
  } catch (error) {
    logger.error('Error adding review', {
      error: error.message,
      userId: req.user.id,
      consultationId: req.params.consultationId,
      stack: error.stack
    });
    next(error);
  }
};

// Edit review and rating
exports.editReview = async (req, res, next) => {
  try {
    const { consultationId } = req.params;
    const { rating, review } = req.body;
    const userId = req.user.id;

    logger.info('User editing review', {
      userId,
      consultationId,
      rating
    });

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    const consultation = await Consultation.findById(consultationId)
      .populate('farmer', '_id')
      .populate('expert', '_id');

    if (!consultation) {
      return res.status(404).json({
        success: false,
        message: 'Consultation not found'
      });
    }

    // Check if user is the farmer who booked this consultation
    if (consultation.farmer._id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only the farmer can edit this review'
      });
    }

    // Check if consultation is completed
    if (consultation.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Can only edit reviews for completed consultations'
      });
    }

    // Check if review exists
    if (!consultation.rating) {
      return res.status(400).json({
        success: false,
        message: 'No review found to edit'
      });
    }

    consultation.rating = rating;
    consultation.review = review;
    consultation.reviewedAt = new Date();
    await consultation.save();

    // Update expert's average rating
    await updateExpertRating(consultation.expert._id);

    logger.info('Review edited successfully', {
      consultationId,
      userId,
      rating
    });

    res.status(200).json({
      success: true,
      message: 'Review edited successfully',
      consultation
    });
  } catch (error) {
    logger.error('Error editing review', {
      error: error.message,
      userId: req.user.id,
      consultationId: req.params.consultationId,
      stack: error.stack
    });
    next(error);
  }
};

// Helper function to update expert's average rating
const updateExpertRating = async (expertId) => {
  try {
    // Get all completed consultations for this expert that have ratings
    const consultations = await Consultation.find({
      expert: expertId,
      status: 'completed',
      rating: { $exists: true, $ne: null }
    });

    if (consultations.length === 0) {
      // No ratings, reset to default
      await User.findByIdAndUpdate(expertId, {
        'rating.average': 0,
        'rating.count': 0
      });
      return;
    }

    // Calculate average rating
    const totalRating = consultations.reduce((sum, cons) => sum + cons.rating, 0);
    const averageRating = totalRating / consultations.length;

    // Update expert's rating
    await User.findByIdAndUpdate(expertId, {
      'rating.average': Math.round(averageRating * 10) / 10, // Round to 1 decimal
      'rating.count': consultations.length
    });

    logger.info('Expert rating updated', {
      expertId,
      averageRating: Math.round(averageRating * 10) / 10,
      count: consultations.length
    });
  } catch (error) {
    logger.error('Error updating expert rating', {
      expertId,
      error: error.message
    });
  }
};

// Get farmer pending consultation count
exports.getFarmerPendingConsultationCount = async (req, res, next) => {
  try {
    const farmerId = req.user.id;

    const count = await Consultation.countDocuments({
      farmer: farmerId,
      status: 'pending'
    });

    res.status(200).json({
      success: true,
      count
    });
  } catch (error) {
    logger.error('Error fetching farmer pending consultation count', {
      error: error.message,
      farmerId: req.user.id,
      stack: error.stack
    });
    next(error);
  }
};

// Get expert pending consultation count
exports.getExpertPendingConsultationCount = async (req, res, next) => {
  try {
    const expertId = req.user.id;

    const count = await Consultation.countDocuments({
      expert: expertId,
      status: 'pending'
    });

    res.status(200).json({
      success: true,
      count
    });
  } catch (error) {
    logger.error('Error fetching expert pending consultation count', {
      error: error.message,
      expertId: req.user.id,
      stack: error.stack
    });
    next(error);
  }
};

// Helper method to calculate end time
exports.calculateEndTime = function(startTime, duration) {
  const [hours, minutes] = startTime.split(':').map(Number);
  const startInMinutes = hours * 60 + minutes;
  const endInMinutes = startInMinutes + duration;

  const endHours = Math.floor(endInMinutes / 60) % 24;
  const endMinutes = endInMinutes % 60;

  return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
};
