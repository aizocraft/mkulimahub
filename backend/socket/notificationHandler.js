const Consultation = require('../models/Consultation');

module.exports = (io, socket) => {
  console.log(`🔔 Notification handler initialized for ${socket.user._id}`);

  // Send consultation notification
  socket.on('notification:consultation-request', async ({ consultationId, toUserId }) => {
    try {
      const consultation = await Consultation.findById(consultationId)
        .populate('farmer', 'name profilePicture')
        .populate('expert', 'name profilePicture');

      if (!consultation) return;

      // Send notification to expert
      io.to(`user_${toUserId}`).emit('notification:new-consultation', {
        type: 'consultation_request',
        consultationId,
        fromUser: {
          id: consultation.farmer._id,
          name: consultation.farmer.name,
          profilePicture: consultation.farmer.profilePicture
        },
        consultation: {
          topic: consultation.topic,
          bookingDate: consultation.bookingDate,
          startTime: consultation.startTime,
          duration: consultation.duration
        },
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error sending consultation notification:', error);
    }
  });

  // Send acceptance notification
  socket.on('notification:consultation-accepted', async ({ consultationId, toUserId }) => {
    try {
      const consultation = await Consultation.findById(consultationId)
        .populate('expert', 'name profilePicture');

      io.to(`user_${toUserId}`).emit('notification:consultation-update', {
        type: 'consultation_accepted',
        consultationId,
        expert: {
          id: consultation.expert._id,
          name: consultation.expert.name,
          profilePicture: consultation.expert.profilePicture
        },
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error sending acceptance notification:', error);
    }
  });

  // Video call notification
  socket.on('notification:video-call-incoming', ({ consultationId, toUserId, callerName }) => {
    io.to(`user_${toUserId}`).emit('notification:incoming-call', {
      type: 'incoming_video_call',
      consultationId,
      callerName,
      timestamp: new Date()
    });
  });

  // Custom notification
  socket.on('notification:send', ({ toUserId, type, title, message, data }) => {
    io.to(`user_${toUserId}`).emit('notification:custom', {
      type,
      title,
      message,
      data,
      timestamp: new Date()
    });
  });
};