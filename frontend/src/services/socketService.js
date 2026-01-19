// src/services/socketService.js
import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.user = null;
  }

  // Initialize socket connection
  initialize(token, userId) {
    if (this.socket?.connected) {
      console.log('Socket already connected');
      return this.socket;
    }

    try {
      const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
      
      this.socket = io(SOCKET_URL, {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
      });

      this.setupEventListeners();
      this.user = { id: userId };
      
      console.log('Socket initialized for user:', userId);
      return this.socket;
    } catch (error) {
      console.error('Failed to initialize socket:', error);
      throw error;
    }
  }

  // Setup event listeners
  setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('✅ Socket connected:', this.socket.id);
      this.reconnectAttempts = 0;
      
      // Rejoin rooms if user exists
      if (this.user) {
        this.socket.emit('join-user-room', { userId: this.user.id });
      }
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
      
      if (reason === 'io server disconnect') {
        // Server initiated disconnect, try to reconnect
        this.socket.connect();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
      }
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  }

  // Join a video call room
  joinVideoRoom(consultationId) {
    return new Promise((resolve, reject) => {
      if (!this.socket?.connected) {
        reject(new Error('Socket not connected'));
        return;
      }

      this.socket.emit('video-call:join', { consultationId }, (response) => {
        if (response?.error) {
          reject(new Error(response.error));
        } else {
          resolve(response);
        }
      });
    });
  }

  // Leave a video call room
  leaveVideoRoom(roomId) {
    if (!this.socket?.connected) return;
    this.socket.emit('video-call:leave', { roomId });
  }

  // End call for everyone
  endCall(roomId, consultationId) {
    if (!this.socket?.connected) return;
    this.socket.emit('video-call:end', { roomId, consultationId });
  }

  // Send WebRTC offer
  sendOffer(roomId, offer, targetUserId) {
    if (!this.socket?.connected) return;
    this.socket.emit('video-call:offer', { roomId, offer, targetUserId });
  }

  // Send WebRTC answer
  sendAnswer(roomId, answer, targetUserId) {
    if (!this.socket?.connected) return;
    this.socket.emit('video-call:answer', { roomId, answer, targetUserId });
  }

  // Send ICE candidate
  sendIceCandidate(roomId, candidate, targetUserId) {
    if (!this.socket?.connected) return;
    this.socket.emit('video-call:ice-candidate', { roomId, candidate, targetUserId });
  }

  // Toggle media (video/audio)
  toggleMedia(roomId, mediaType, isEnabled) {
    if (!this.socket?.connected) return;
    this.socket.emit('video-call:toggle-media', { roomId, mediaType, isEnabled });
  }

  // Screen sharing
  toggleScreenShare(roomId, streamId, isStarting) {
    if (!this.socket?.connected) return;
    this.socket.emit('video-call:screen-share', { roomId, streamId, isStarting });
  }

  // Raise hand
  raiseHand(roomId, isRaised) {
    if (!this.socket?.connected) return;
    this.socket.emit('video-call:raise-hand', { roomId, isRaised });
  }

  // Send reaction
  sendReaction(roomId, reaction) {
    if (!this.socket?.connected) return;
    this.socket.emit('video-call:reaction', { roomId, reaction });
  }

  // CHAT FUNCTIONS
  joinChat(consultationId) {
    if (!this.socket?.connected) return;
    this.socket.emit('chat:join', { consultationId });
  }

  sendMessage(consultationId, content, type = 'text') {
    if (!this.socket?.connected) return;
    this.socket.emit('chat:send-message', { consultationId, content, type });
  }

  markMessagesAsRead(consultationId, messageIds) {
    if (!this.socket?.connected) return;
    this.socket.emit('chat:mark-read', { consultationId, messageIds });
  }

  leaveChat(consultationId) {
    if (!this.socket?.connected) return;
    this.socket.emit('chat:leave', { consultationId });
  }

  typingIndicator(consultationId, isTyping) {
    if (!this.socket?.connected) return;
    this.socket.emit('chat:typing', { consultationId, isTyping });
  }

  // NOTIFICATION FUNCTIONS
  sendConsultationRequest(consultationId, toUserId) {
    if (!this.socket?.connected) return;
    this.socket.emit('notification:consultation-request', { consultationId, toUserId });
  }

  sendConsultationAccepted(consultationId, toUserId) {
    if (!this.socket?.connected) return;
    this.socket.emit('notification:consultation-accepted', { consultationId, toUserId });
  }

  sendVideoCallNotification(consultationId, toUserId, callerName) {
    if (!this.socket?.connected) return;
    this.socket.emit('notification:video-call-incoming', { 
      consultationId, 
      toUserId, 
      callerName 
    });
  }

  // Event listeners management
  on(event, callback) {
    if (!this.socket) return;
    
    this.socket.on(event, callback);
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (!this.socket) return;
    
    if (callback) {
      this.socket.off(event, callback);
    } else {
      this.socket.off(event);
    }
    
    if (this.listeners.has(event)) {
      const listeners = this.listeners.get(event);
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  // Clean up all listeners
  removeAllListeners() {
    if (!this.socket) return;
    
    this.listeners.forEach((callbacks, event) => {
      callbacks.forEach(callback => {
        this.socket.off(event, callback);
      });
    });
    this.listeners.clear();
  }

  // Disconnect socket
  disconnect() {
    if (this.socket) {
      this.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
      this.user = null;
      console.log('Socket disconnected');
    }
  }

  // Check if connected
  isConnected() {
    return this.socket?.connected || false;
  }

  // Get socket ID
  getSocketId() {
    return this.socket?.id;
  }
}

// Create singleton instance
const socketService = new SocketService();
export default socketService;