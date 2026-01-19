const ChatMessage = require('../models/ChatMessage');
const Consultation = require('../models/Consultation');

module.exports = (io, socket) => {
  console.log(`💬 Chat handler initialized for ${socket.user._id}`);

  // Join consultation chat room
  socket.on('chat:join', async ({ consultationId }) => {
    try {
      const consultation = await Consultation.findById(consultationId)
        .populate('farmer', '_id name')
        .populate('expert', '_id name');

      if (!consultation) {
        socket.emit('error', { message: 'Consultation not found' });
        return;
      }

      // Verify user is part of consultation
      const isFarmer = consultation.farmer._id.toString() === socket.user._id.toString();
      const isExpert = consultation.expert._id.toString() === socket.user._id.toString();
      
      if (!isFarmer && !isExpert) {
        socket.emit('error', { message: 'Not authorized' });
        return;
      }

      const roomId = `chat_${consultationId}`;
      socket.join(roomId);

      console.log(`📨 User ${socket.user._id} joined chat room: ${roomId}`);

      // Load previous messages
      const messages = await ChatMessage.find({ consultation: consultationId })
        .populate('sender', 'name profilePicture role')
        .sort({ createdAt: 1 })
        .limit(50);

      socket.emit('chat:previous-messages', {
        consultationId,
        messages
      });

      // Notify others
      socket.to(roomId).emit('chat:user-joined', {
        userId: socket.user._id,
        userName: socket.user.name,
        timestamp: new Date()
      });

    } catch (error) {
      console.error('Error joining chat:', error);
      socket.emit('error', { message: 'Failed to join chat' });
    }
  });

  // Send message
  socket.on('chat:send-message', async ({ consultationId, content, type = 'text' }) => {
    try {
      // Validate message
      if (!content || content.trim().length === 0) {
        return;
      }

      // Check if consultation exists and user is authorized
      const consultation = await Consultation.findById(consultationId);
      if (!consultation) {
        socket.emit('error', { message: 'Consultation not found' });
        return;
      }

      const roomId = `chat_${consultationId}`;

      // Create and save message
      const message = new ChatMessage({
        consultation: consultationId,
        sender: socket.user._id,
        content: content.trim(),
        type, // 'text', 'file', 'image'
        readBy: [socket.user._id]
      });

      await message.save();
      
      // Populate sender info
      await message.populate('sender', 'name profilePicture role');

      // Broadcast to room
      io.to(roomId).emit('chat:new-message', {
        message,
        consultationId
      });

      // Update consultation's last activity
      consultation.updatedAt = new Date();
      await consultation.save();

      // Send notification to other user
      const otherUserId = socket.user._id.toString() === consultation.farmer.toString() 
        ? consultation.expert 
        : consultation.farmer;

      socket.to(`user_${otherUserId}`).emit('notification:new-message', {
        consultationId,
        message: {
          sender: socket.user.name,
          content: content.substring(0, 100),
          type
        },
        timestamp: new Date()
      });

    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // Mark messages as read
  socket.on('chat:mark-read', async ({ consultationId, messageIds }) => {
    try {
      await ChatMessage.updateMany(
        {
          _id: { $in: messageIds },
          consultation: consultationId,
          sender: { $ne: socket.user._id }
        },
        {
          $addToSet: { readBy: socket.user._id }
        }
      );

      socket.to(`chat_${consultationId}`).emit('chat:messages-read', {
        userId: socket.user._id,
        messageIds,
        consultationId
      });

    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  });

  // Leave chat room
  socket.on('chat:leave', ({ consultationId }) => {
    const roomId = `chat_${consultationId}`;
    socket.leave(roomId);
    
    socket.to(roomId).emit('chat:user-left', {
      userId: socket.user._id,
      userName: socket.user.name,
      timestamp: new Date()
    });
  });

  // Typing indicator
  socket.on('chat:typing', ({ consultationId, isTyping }) => {
    const roomId = `chat_${consultationId}`;
    
    socket.to(roomId).emit('chat:typing-indicator', {
      userId: socket.user._id,
      userName: socket.user.name,
      isTyping,
      timestamp: new Date()
    });
  });
};