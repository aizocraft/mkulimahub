const { v4: uuidv4 } = require('uuid');
const Consultation = require('../models/Consultation');

module.exports = (io, socket) => {
  console.log(`🎥 Video call handler initialized for ${socket.user._id}`);

  // Create or join video room
  socket.on('video-call:join', async ({ consultationId }) => {
    try {
      // Verify consultation exists and user is authorized
      const consultation = await Consultation.findById(consultationId)
        .populate('farmer', '_id name')
        .populate('expert', '_id name');

      if (!consultation) {
        socket.emit('error', { message: 'Consultation not found' });
        return;
      }

      // Check if user is part of this consultation
      const isFarmer = consultation.farmer._id.toString() === socket.user._id.toString();
      const isExpert = consultation.expert._id.toString() === socket.user._id.toString();
      
      if (!isFarmer && !isExpert) {
        socket.emit('error', { message: 'Not authorized' });
        return;
      }

      // Check consultation status
      if (consultation.status !== 'accepted') {
        socket.emit('error', { message: 'Consultation must be accepted first' });
        return;
      }

      const roomId = `consultation_${consultationId}`;
      
      // Join the room
      socket.join(roomId);
      console.log(`🎬 User ${socket.user._id} joined video room: ${roomId}`);

      // Get room info
      const room = io.sockets.adapter.rooms.get(roomId);
      const usersInRoom = room ? Array.from(room) : [];
      const connectedUsers = usersInRoom.map(socketId => {
        const clientSocket = io.sockets.sockets.get(socketId);
        return clientSocket ? {
          userId: clientSocket.user._id,
          name: clientSocket.user.name
        } : null;
      }).filter(Boolean);

      // Notify user they joined successfully
      socket.emit('video-call:joined', {
        roomId,
        consultationId,
        user: socket.user,
        connectedUsers,
        isCallActive: connectedUsers.length > 1
      });

      // Notify others in the room
      socket.to(roomId).emit('video-call:user-joined', {
        userId: socket.user._id,
        userName: socket.user.name,
        roomId,
        timestamp: new Date()
      });

      // If this is the second person joining, notify both to start call
      if (connectedUsers.length === 2) {
        io.to(roomId).emit('video-call:ready', {
          roomId,
          users: connectedUsers,
          consultationId
        });
      }

    } catch (error) {
      console.error('Error joining video call:', error);
      socket.emit('error', { message: 'Failed to join video call' });
    }
  });

  // WebRTC Signaling - Offer
  socket.on('video-call:offer', ({ roomId, offer, targetUserId }) => {
    console.log(`📤 Offer from ${socket.user._id} to ${targetUserId}`);
    socket.to(roomId).emit('video-call:offer', {
      offer,
      fromUserId: socket.user._id,
      fromUserName: socket.user.name
    });
  });

  // WebRTC Signaling - Answer
  socket.on('video-call:answer', ({ roomId, answer, targetUserId }) => {
    console.log(`📥 Answer from ${socket.user._id} to ${targetUserId}`);
    socket.to(roomId).emit('video-call:answer', {
      answer,
      fromUserId: socket.user._id,
      fromUserName: socket.user.name
    });
  });

  // WebRTC Signaling - ICE Candidate
  socket.on('video-call:ice-candidate', ({ roomId, candidate, targetUserId }) => {
    socket.to(roomId).emit('video-call:ice-candidate', {
      candidate,
      fromUserId: socket.user._id
    });
  });

  // Toggle video/audio
  socket.on('video-call:toggle-media', ({ roomId, mediaType, isEnabled }) => {
    socket.to(roomId).emit('video-call:media-toggled', {
      userId: socket.user._id,
      mediaType, // 'video' or 'audio'
      isEnabled,
      userName: socket.user.name
    });
  });

  // Send screen share signal
  socket.on('video-call:screen-share', ({ roomId, streamId, isStarting }) => {
    socket.to(roomId).emit('video-call:screen-sharing', {
      userId: socket.user._id,
      userName: socket.user.name,
      streamId,
      isStarting,
      timestamp: new Date()
    });
  });

  // Leave video call
  socket.on('video-call:leave', ({ roomId }) => {
    console.log(`🚪 User ${socket.user._id} leaving room: ${roomId}`);
    
    socket.leave(roomId);
    
    socket.to(roomId).emit('video-call:user-left', {
      userId: socket.user._id,
      userName: socket.user.name,
      timestamp: new Date()
    });

    socket.emit('video-call:left', { roomId });
  });

  // End call for everyone
  socket.on('video-call:end', async ({ roomId, consultationId }) => {
    try {
      // Verify user is part of this consultation
      const consultation = await Consultation.findById(consultationId);
      if (consultation) {
        const isFarmer = consultation.farmer.toString() === socket.user._id.toString();
        const isExpert = consultation.expert.toString() === socket.user._id.toString();
        
        if (isFarmer || isExpert) {
          // Notify all in room to end call
          io.to(roomId).emit('video-call:ended', {
            endedBy: socket.user._id,
            endedByName: socket.user.name,
            timestamp: new Date()
          });
          
          // Kick all users from room
          const room = io.sockets.adapter.rooms.get(roomId);
          if (room) {
            room.forEach(socketId => {
              io.sockets.sockets.get(socketId)?.leave(roomId);
            });
          }
        }
      }
    } catch (error) {
      console.error('Error ending call:', error);
    }
  });

  // Raise hand feature
  socket.on('video-call:raise-hand', ({ roomId, isRaised }) => {
    socket.to(roomId).emit('video-call:hand-raised', {
      userId: socket.user._id,
      userName: socket.user.name,
      isRaised,
      timestamp: new Date()
    });
  });

  // Send reaction
  socket.on('video-call:reaction', ({ roomId, reaction }) => {
    socket.to(roomId).emit('video-call:reaction-sent', {
      userId: socket.user._id,
      userName: socket.user.name,
      reaction, // 'like', 'clap', 'heart', etc.
      timestamp: new Date()
    });
  });
};