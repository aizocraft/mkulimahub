// socket/videoCallHandler.js - COMPLETE FIX
const Consultation = require('../models/Consultation');

// Store active rooms and peer connections
const activeRooms = new Map(); // roomId -> { users: [], offers: {}, answers: {} }
const userSocketMap = new Map(); // userId -> socket

// Helper method: Handle user leaving
const handleUserLeave = (socket, roomId) => {
  if (activeRooms.has(roomId)) {
    const room = activeRooms.get(roomId);
    const userId = socket.user?._id?.toString();
    
    if (userId) {
      // Remove user from room
      room.users = room.users.filter(u => u.userId !== userId);
      
      if (room.users.length === 0) {
        // Room is empty, delete it
        activeRooms.delete(roomId);
        console.log(`Room ${roomId} deleted (empty)`);
      } else {
        // Notify remaining users
        room.users.forEach(user => {
          const userSocket = userSocketMap.get(user.userId);
          if (userSocket) {
            userSocket.emit('video-call:user-left', {
              userId,
              userName: socket.user?.name || 'User',
              timestamp: new Date(),
              remainingUsers: room.users.length
            });
          }
        });
      }
    }
  }
  
  // Leave the socket room
  socket.leave(roomId);
  
  // Confirm to user
  socket.emit('video-call:left', { roomId });
};

// Helper method: Handle call end
const handleCallEnd = (io, socket, roomId, consultationId) => {
  if (activeRooms.has(roomId)) {
    const room = activeRooms.get(roomId);
    
    // Notify all users in room
    room.users.forEach(user => {
      const userSocket = userSocketMap.get(user.userId);
      if (userSocket) {
        userSocket.emit('video-call:ended', {
          endedBy: socket.user._id.toString(),
          endedByName: socket.user.name,
          roomId,
          consultationId,
          timestamp: new Date()
        });
        
        // Make them leave the room
        userSocket.leave(roomId);
      }
    });
    
    // Clean up room
    activeRooms.delete(roomId);
    console.log(`Room ${roomId} cleaned up`);
  }
};

module.exports = (io, socket) => {
  console.log(`🎥 Video call handler connected: ${socket.id}, User: ${socket.user?._id}`);

  // Store user socket mapping
  if (socket.user?._id) {
    const userId = socket.user._id.toString();
    userSocketMap.set(userId, socket);
    console.log(`User ${userId} mapped to socket ${socket.id}`);
  }

  // Create or join video room
  socket.on('video-call:join', async ({ consultationId }, callback) => {
    try {
      // Ensure we have a valid callback for Socket.IO acknowledgement
      const cb = typeof callback === 'function' ? callback : () => {};

      if (!consultationId) {
        cb({ error: 'Consultation ID is required' });
        return;
      }

      // Strip 'consultation_' prefix if client sent roomId by mistake
      const rawId = String(consultationId).replace(/^consultation_/, '');

      console.log(`📞 User ${socket.user?._id} joining consultation: ${rawId}`);

      // Validate user
      if (!socket.user?._id) {
        cb({ error: 'User not authenticated' });
        return;
      }

      const userId = socket.user._id.toString();
      const userName = socket.user.name || 'User';

      // Verify consultation
      const consultation = await Consultation.findById(rawId)
        .populate('farmer expert', '_id name');

      if (!consultation) {
        cb({ error: 'Consultation not found' });
        return;
      }

      // Check authorization
      const isFarmer = consultation.farmer?._id?.toString() === userId;
      const isExpert = consultation.expert?._id?.toString() === userId;

      if (!isFarmer && !isExpert) {
        cb({ error: 'Not authorized to join this consultation' });
        return;
      }

      const roomId = `consultation_${consultation._id}`;
      
      // Join the socket room
      await socket.join(roomId);
      
      // Initialize room if not exists
      if (!activeRooms.has(roomId)) {
        activeRooms.set(roomId, {
          consultationId,
          users: [],
          offers: new Map(),
          answers: new Map(),
          iceCandidates: new Map(),
          createdAt: new Date()
        });
      }

      const room = activeRooms.get(roomId);
      const userInfo = {
        userId,
        socketId: socket.id,
        userName,
        role: isFarmer ? 'farmer' : 'expert',
        joinedAt: new Date(),
        isConnected: true
      };

      // Add/update user in room
      const existingUserIndex = room.users.findIndex(u => u.userId === userId);
      if (existingUserIndex === -1) {
        room.users.push(userInfo);
      } else {
        room.users[existingUserIndex] = userInfo;
      }

      // Get other users (excluding current user)
      const otherUsers = room.users.filter(u => u.userId !== userId);
      
      console.log(`✅ User ${userId} joined room ${roomId}. Total users: ${room.users.length}`);

      // Determine if user is initiator (first person in room)
      const isInitiator = otherUsers.length === 0;

      // Prepare response
      const responseData = {
        roomId,
        consultationId: consultation._id.toString(),
        user: userInfo,
        connectedUsers: otherUsers,
        isInitiator,
        isCallActive: room.users.length >= 2,
        otherUser: otherUsers.length > 0 ? otherUsers[0] : null
      };

      // Send success response (Socket.IO acknowledgement)
      cb(responseData);
      
      // Also emit event for consistency
      socket.emit('video-call:joined', responseData);

      // Send user-joined event to all other users immediately
      if (otherUsers.length > 0) {
        otherUsers.forEach(otherUser => {
          const otherSocket = userSocketMap.get(otherUser.userId);
          if (otherSocket) {
            otherSocket.emit('video-call:user-joined', {
              userId,
              userName,
              socketId: socket.id,
              timestamp: new Date(),
              shouldCreateOffer: true // Tell the other user to create offer
            });
            
            // If this is the second user joining, send ready event
            if (room.users.length === 2) {
              // Notify both users that call is ready
              io.to(roomId).emit('video-call:ready', {
                roomId,
                users: room.users,
                consultationId,
                timestamp: new Date()
              });
              
              console.log(`🚀 Call is ready in room ${roomId} with 2 users`);
            }
          }
        });
      }

    } catch (error) {
      console.error('Error joining video call:', error);
      const cb = typeof callback === 'function' ? callback : () => {};
      cb({ error: error.message || 'Failed to join video call' });
    }
  });

  // WebRTC Signaling - Offer
  socket.on('video-call:offer', ({ roomId, offer, targetUserId }) => {
    console.log(`📤 Offer from ${socket.user._id} to ${targetUserId}`);
    
    const fromUserId = socket.user._id.toString();
    const fromUserName = socket.user.name;
    
    // Store offer for later use
    const room = activeRooms.get(roomId);
    if (room) {
      room.offers.set(`${fromUserId}_${targetUserId}`, offer);
    }
    
    if (targetUserId) {
      // Send to specific user
      const targetSocket = userSocketMap.get(targetUserId);
      if (targetSocket) {
        targetSocket.emit('video-call:offer', {
          offer,
          fromUserId,
          fromUserName,
          roomId,
          timestamp: new Date()
        });
      } else {
        console.warn(`Target user ${targetUserId} not found`);
      }
    } else {
      // Broadcast to all in room except sender
      socket.to(roomId).emit('video-call:offer', {
        offer,
        fromUserId,
        fromUserName,
        roomId,
        timestamp: new Date()
      });
    }
  });

  // WebRTC Signaling - Answer
  socket.on('video-call:answer', ({ roomId, answer, targetUserId }) => {
    console.log(`📥 Answer from ${socket.user._id} to ${targetUserId}`);
    
    const fromUserId = socket.user._id.toString();
    const fromUserName = socket.user.name;
    
    // Store answer
    const room = activeRooms.get(roomId);
    if (room) {
      room.answers.set(`${fromUserId}_${targetUserId}`, answer);
    }
    
    if (targetUserId) {
      const targetSocket = userSocketMap.get(targetUserId);
      if (targetSocket) {
        targetSocket.emit('video-call:answer', {
          answer,
          fromUserId,
          fromUserName,
          roomId,
          timestamp: new Date()
        });
      }
    }
  });

  // WebRTC Signaling - ICE Candidate
  socket.on('video-call:ice-candidate', ({ roomId, candidate, targetUserId }) => {
    const fromUserId = socket.user._id.toString();
    
    // Store ICE candidate
    const room = activeRooms.get(roomId);
    if (room) {
      const key = `${fromUserId}_${targetUserId}`;
      if (!room.iceCandidates.has(key)) {
        room.iceCandidates.set(key, []);
      }
      room.iceCandidates.get(key).push(candidate);
    }
    
    if (targetUserId) {
      const targetSocket = userSocketMap.get(targetUserId);
      if (targetSocket) {
        targetSocket.emit('video-call:ice-candidate', {
          candidate,
          fromUserId,
          roomId,
          timestamp: new Date()
        });
      }
    } else {
      socket.to(roomId).emit('video-call:ice-candidate', {
        candidate,
        fromUserId,
        roomId,
        timestamp: new Date()
      });
    }
  });

  // Send connection established event
  socket.on('video-call:connected', ({ roomId }) => {
    console.log(`✅ User ${socket.user._id} connected in room ${roomId}`);
    
    // Notify other users in room
    socket.to(roomId).emit('video-call:peer-connected', {
      userId: socket.user._id.toString(),
      userName: socket.user.name,
      roomId,
      timestamp: new Date()
    });
  });

  // User leaving room
  socket.on('video-call:leave', ({ roomId }) => {
    console.log(`🚪 User ${socket.user._id} leaving room: ${roomId}`);
    
    handleUserLeave(socket, roomId); // Fixed: Use the function directly
  });

  // End call for everyone
  socket.on('video-call:end', ({ roomId, consultationId }) => {
    console.log(`⛔ Call ended in room ${roomId} by ${socket.user._id}`);
    
    handleCallEnd(io, socket, roomId, consultationId); // Fixed: Use the function directly
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`🔌 Socket disconnected: ${socket.id}`);
    
    const userId = socket.user?._id?.toString();
    
    // Remove from user map
    if (userId) {
      userSocketMap.delete(userId);
    }
    
    // Remove user from all rooms
    activeRooms.forEach((room, roomId) => {
      handleUserLeave(socket, roomId); // Fixed: Use the function directly
    });
  });
};