// socket/videoCallHandler.js - COMPLETE WORKING VERSION
const Consultation = require('../models/Consultation');

// Store active rooms
const activeRooms = new Map(); // roomId -> { users: [], consultationId }
const userSocketMap = new Map(); // userId -> socket

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
      console.log(`User ${socket.user?._id} joining consultation: ${consultationId}`);

      // Validate user
      if (!socket.user?._id) {
        if (callback) callback({ error: 'User not authenticated' });
        return;
      }

      const userId = socket.user._id.toString();

      // Verify consultation exists
      const consultation = await Consultation.findById(consultationId)
        .populate('farmer', '_id name')
        .populate('expert', '_id name');

      if (!consultation) {
        if (callback) callback({ error: 'Consultation not found' });
        return;
      }

      // Check authorization
      const isFarmer = consultation.farmer._id.toString() === userId;
      const isExpert = consultation.expert._id.toString() === userId;
      
      if (!isFarmer && !isExpert) {
        if (callback) callback({ error: 'Not authorized' });
        return;
      }

      // Check consultation status
      if (consultation.status !== 'accepted') {
        if (callback) callback({ error: 'Consultation must be accepted first' });
        return;
      }

      const roomId = `consultation_${consultationId}`;
      const userName = socket.user.name || 'User';
      
      // Join the socket room
      await socket.join(roomId);
      
      // Initialize room if not exists
      if (!activeRooms.has(roomId)) {
        activeRooms.set(roomId, {
          consultationId,
          users: [],
          createdAt: new Date()
        });
      }

      const room = activeRooms.get(roomId);
      const userInfo = {
        userId,
        socketId: socket.id,
        userName,
        role: isFarmer ? 'farmer' : 'expert',
        joinedAt: new Date()
      };

      // Add user to room if not already present
      const existingUserIndex = room.users.findIndex(u => u.userId === userId);
      if (existingUserIndex === -1) {
        room.users.push(userInfo);
      } else {
        // Update socket ID if reconnecting
        room.users[existingUserIndex].socketId = socket.id;
      }

      // Get other users (excluding current user)
      const otherUsers = room.users.filter(u => u.userId !== userId);
      
      console.log(`✅ User ${userId} joined room ${roomId}. Total users: ${room.users.length}`);

      // Determine if user is initiator (first person)
      const isInitiator = otherUsers.length === 0;

      // Prepare response data
      const responseData = {
        roomId,
        consultationId,
        user: userInfo,
        connectedUsers: otherUsers,
        isInitiator,
        isCallActive: otherUsers.length > 0,
        otherUser: otherUsers.length > 0 ? otherUsers[0] : null
      };

      // Send success response
      if (callback) callback(responseData);
      
      // Also emit event for consistency
      socket.emit('video-call:joined', responseData);

      // Notify other users in the room
      if (otherUsers.length > 0) {
        otherUsers.forEach(otherUser => {
          const otherSocket = userSocketMap.get(otherUser.userId);
          if (otherSocket) {
            otherSocket.emit('video-call:user-joined', {
              userId,
              userName,
              socketId: socket.id,
              timestamp: new Date()
            });
            
            // If this is the second user joining, notify initiator to create offer
            if (room.users.length === 2) {
              const initiator = room.users.find(u => u.userId !== userId);
              if (initiator) {
                const initiatorSocket = userSocketMap.get(initiator.userId);
                if (initiatorSocket) {
                  initiatorSocket.emit('video-call:ready', {
                    roomId,
                    newUser: userInfo,
                    consultationId
                  });
                }
              }
            }
          }
        });
      }

    } catch (error) {
      console.error('Error joining video call:', error);
      if (callback) callback({ error: 'Failed to join video call' });
    }
  });

  // WebRTC Signaling - Offer
  socket.on('video-call:offer', ({ roomId, offer, targetUserId }) => {
    console.log(`📤 Offer from ${socket.user._id} to ${targetUserId || 'all'}`);
    
    const fromUserId = socket.user._id.toString();
    const fromUserName = socket.user.name;
    
    if (targetUserId) {
      // Send to specific user
      const targetSocket = userSocketMap.get(targetUserId);
      if (targetSocket) {
        targetSocket.emit('video-call:offer', {
          offer,
          fromUserId,
          fromUserName,
          roomId
        });
      }
    } else {
      // Broadcast to all in room except sender
      socket.to(roomId).emit('video-call:offer', {
        offer,
        fromUserId,
        fromUserName,
        roomId
      });
    }
  });

  // WebRTC Signaling - Answer
  socket.on('video-call:answer', ({ roomId, answer, targetUserId }) => {
    console.log(`📥 Answer from ${socket.user._id} to ${targetUserId}`);
    
    const fromUserId = socket.user._id.toString();
    const fromUserName = socket.user.name;
    
    if (targetUserId) {
      const targetSocket = userSocketMap.get(targetUserId);
      if (targetSocket) {
        targetSocket.emit('video-call:answer', {
          answer,
          fromUserId,
          fromUserName,
          roomId
        });
      }
    }
  });

  // WebRTC Signaling - ICE Candidate
  socket.on('video-call:ice-candidate', ({ roomId, candidate, targetUserId }) => {
    const fromUserId = socket.user._id.toString();
    
    if (targetUserId) {
      const targetSocket = userSocketMap.get(targetUserId);
      if (targetSocket) {
        targetSocket.emit('video-call:ice-candidate', {
          candidate,
          fromUserId,
          roomId
        });
      }
    } else {
      socket.to(roomId).emit('video-call:ice-candidate', {
        candidate,
        fromUserId,
        roomId
      });
    }
  });

  // User leaving room
  socket.on('video-call:leave', ({ roomId }) => {
    console.log(`🚪 User ${socket.user._id} leaving room: ${roomId}`);
    
    if (activeRooms.has(roomId)) {
      const room = activeRooms.get(roomId);
      const userId = socket.user._id.toString();
      
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
              userName: socket.user.name,
              timestamp: new Date()
            });
          }
        });
      }
    }
    
    // Leave the socket room
    socket.leave(roomId);
    
    // Confirm to user
    socket.emit('video-call:left', { roomId });
  });

  // End call for everyone
  socket.on('video-call:end', ({ roomId, consultationId }) => {
    console.log(`⛔ Call ended in room ${roomId} by ${socket.user._id}`);
    
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
      const userIndex = room.users.findIndex(u => u.socketId === socket.id);
      if (userIndex > -1) {
        const user = room.users[userIndex];
        room.users.splice(userIndex, 1);
        
        if (room.users.length === 0) {
          activeRooms.delete(roomId);
        } else {
          // Notify others in the room
          room.users.forEach(remainingUser => {
            const remainingSocket = userSocketMap.get(remainingUser.userId);
            if (remainingSocket) {
              remainingSocket.emit('video-call:user-left', {
                userId: user.userId,
                userName: user.userName,
                timestamp: new Date()
              });
            }
          });
        }
      }
    });
  });
};