import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
    this.user = null;
    this.isInitializing = false;
  }

  initialize(token, userId) {
    if (this.isInitializing) {
      console.log('Socket initialization in progress...');
      return this.socket;
    }
    
    if (this.socket?.connected) {
      console.log('Socket already connected');
      return this.socket;
    }

    let finalUserId = userId;
    if (!finalUserId) {
      console.warn('User ID not provided. Trying to get from localStorage...');
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          const parsedUser = JSON.parse(userData);
          finalUserId = parsedUser._id || parsedUser.id;
        } catch (e) {
          console.error('Failed to parse user data:', e);
        }
      }
    }

    if (!finalUserId) {
      console.error('User ID is required for socket connection');
      return null;
    }

    try {
      this.isInitializing = true;
      this.user = { id: finalUserId.toString() };
      
      const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
      
      console.log(`Initializing socket for user: ${finalUserId}`);
      
      this.socket = io(SOCKET_URL, {
        auth: { 
          token: token || 'dummy-token',
          userId: finalUserId.toString()
        },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
      });

      this.setupEventListeners();
      
      console.log('Socket initialized successfully');
      this.isInitializing = false;
      return this.socket;
    } catch (error) {
      console.error('Failed to initialize socket:', error);
      this.isInitializing = false;
      return null;
    }
  }

  setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Socket connected with ID:', this.socket.id);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  }

  joinVideoRoom(consultationId) {
    return new Promise((resolve, reject) => {
      if (!this.socket?.connected) {
        reject(new Error('Socket not connected'));
        return;
      }

      console.log(`Joining video room for consultation: ${consultationId}`);
      
      const timeout = setTimeout(() => {
        reject(new Error('Join operation timed out'));
      }, 10000);

      this.socket.emit('video-call:join', { consultationId }, (response) => {
        clearTimeout(timeout);
        
        if (response?.error) {
          console.error('Error joining room:', response.error);
          reject(new Error(response.error));
        } else {
          console.log('Successfully joined room');
          resolve(response);
        }
      });
    });
  }

  leaveVideoRoom(roomId) {
    if (!this.socket?.connected) {
      console.log('Socket not connected, cannot leave room');
      return;
    }
    this.socket.emit('video-call:leave', { roomId });
  }

  endCall(roomId, consultationId) {
    if (!this.socket?.connected) return;
    this.socket.emit('video-call:end', { roomId, consultationId });
  }

  sendOffer(roomId, offer, targetUserId) {
    if (!this.socket?.connected) return;
    this.socket.emit('video-call:offer', { roomId, offer, targetUserId });
  }

  sendAnswer(roomId, answer, targetUserId) {
    if (!this.socket?.connected) return;
    this.socket.emit('video-call:answer', { roomId, answer, targetUserId });
  }

  sendIceCandidate(roomId, candidate, targetUserId) {
    if (!this.socket?.connected) return;
    this.socket.emit('video-call:ice-candidate', { roomId, candidate, targetUserId });
  }

  toggleMedia(roomId, mediaType, isEnabled) {
    if (!this.socket?.connected) return;
    this.socket.emit('video-call:toggle-media', { roomId, mediaType, isEnabled });
  }

  sendConnectionEstablished(roomId) {
    if (!this.socket?.connected) return;
    this.socket.emit('video-call:connected', { roomId });
  }

  on(event, callback) {
    if (!this.socket) return;
    this.socket.on(event, callback);
  }

  off(event, callback) {
    if (!this.socket) return;
    if (callback) {
      this.socket.off(event, callback);
    } else {
      this.socket.off(event);
    }
  }

  isConnected() {
    return this.socket?.connected || false;
  }

  getSocketId() {
    return this.socket?.id || null;
  }

  getUserId() {
    return this.user?.id || null;
  }
}

const socketService = new SocketService();
export default socketService;