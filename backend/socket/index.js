const socketIO = require('socket.io');
const videoCallHandler = require('./videoCallHandler');
const chatHandler = require('./chatHandler');
const notificationHandler = require('./notificationHandler');
const Consultation = require('../models/Consultation');
const User = require('../models/User');

let io;

const initializeSocket = (server) => {
  io = socketIO(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true
    },
    transports: ['websocket', 'polling']
  });

  // Socket middleware for authentication
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error'));
      }

      // Verify JWT token (using your existing passport/jwt strategy)
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get user from database
      const user = await User.findById(decoded.id).select('_id name role email profilePicture');
      
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.user = user;
      next();
    } catch (error) {
      console.error('Socket authentication error:', error.message);
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`✅ Socket connected: ${socket.id} - User: ${socket.user._id}`);

    // Join user's personal room
    socket.join(`user_${socket.user._id}`);

    // Initialize handlers
    videoCallHandler(io, socket);
    chatHandler(io, socket);
    notificationHandler(io, socket);

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`❌ Socket disconnected: ${socket.id}`);
      
      // Notify all rooms user was in
      socket.rooms.forEach(room => {
        if (room !== socket.id) {
          socket.to(room).emit('user-disconnected', {
            userId: socket.user._id,
            userName: socket.user.name,
            timestamp: new Date()
          });
        }
      });
    });

    // Error handling
    socket.on('error', (error) => {
      console.error(`Socket error for ${socket.id}:`, error);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
};

module.exports = { initializeSocket, getIO };