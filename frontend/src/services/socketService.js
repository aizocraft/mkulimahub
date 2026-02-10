// src/services/socketService.js 
import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
    this.user = null;
    this.isInitializing = false;
    this.isConnected = false;
    this.initialized = false;
  }

  initialize(token, userId) {
    //  Prevent multiple initializations
    if (this.socket && this.socket.connected) {
      console.log('✅ Socket already connected, reusing existing connection');
      return this.socket;
    }

    if (this.isInitializing) {
      console.log('⏳ Socket initialization already in progress, waiting...');
      return this.socket;
    }

    if (this.initialized) {
      console.log('✅ Socket already initialized, reusing existing connection');
      return this.socket;
    }

    let finalUserId = userId;
    if (!finalUserId) {
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
      console.error('❌ User ID is required for socket connection');
      return null;
    }

    try {
      this.isInitializing = true;
      this.user = { id: finalUserId.toString() };

      const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

      console.log(`🔌 Initializing socket for user: ${finalUserId}`);

      // Disconnect existing socket if any
      if (this.socket) {
        console.log('🔄 Cleaning up old socket connection');
        this.socket.removeAllListeners();
        this.socket.disconnect();
        this.socket = null;
      }

      this.socket = io(SOCKET_URL, {
        auth: {
          token: token || 'dummy-token',
          userId: finalUserId.toString()
        },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
        autoConnect: true, // Auto-connect on initialization
      });

      this.setupEventListeners();

      console.log('✅ Socket initialization completed');
      this.isInitializing = false;
      this.initialized = true;
      return this.socket;
    } catch (error) {
      console.error('❌ Failed to initialize socket:', error);
      this.isInitializing = false;
      this.isConnected = false;
      return null;
    }
  }

  setupEventListeners() {
    if (!this.socket) return;

    // Remove any existing listeners first
    this.socket.removeAllListeners();

    this.socket.on('connect', () => {
      this.isConnected = true;
      this.isInitializing = false;
      console.log('✅ Socket connected with ID:', this.socket.id);
    });

    this.socket.on('disconnect', (reason) => {
      this.isConnected = false;
      console.log('⚠️ Socket disconnected:', reason);

      // Only try to reconnect if it wasn't a manual disconnect
      if (reason === 'io server disconnect') {
        // Server disconnected, manually reconnect
        this.socket.connect();
      }
    });

    this.socket.on('connect_error', (error) => {
      this.isConnected = false;
      this.isInitializing = false;
      console.error('❌ Socket connection error:', error.message);
    });

    this.socket.on('error', (error) => {
      console.error('❌ Socket error:', error);
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`🔄 Socket reconnected after ${attemptNumber} attempts`);
      this.isConnected = true;
    });

    this.socket.on('reconnect_attempt', (attemptNumber) => {
      console.log(`🔄 Reconnection attempt ${attemptNumber}`);
    });

    this.socket.on('reconnect_failed', () => {
      console.error('❌ Socket reconnection failed');
      this.isConnected = false;
    });
  }

  // ========== VIDEO CALL FUNCTIONS ==========
  joinVideoRoom(consultationId) {
    return new Promise((resolve, reject) => {
      if (!this.socket?.connected) {
        reject(new Error('Socket not connected'));
        return;
      }

      console.log(`📹 Joining video room for consultation: ${consultationId}`);

      const timeout = setTimeout(() => {
        reject(new Error('Join operation timed out'));
      }, 10000);

      this.socket.emit('video-call:join', { consultationId }, (response) => {
        clearTimeout(timeout);

        if (response?.error) {
          console.error('❌ Error joining room:', response.error);
          reject(new Error(response.error));
        } else {
          console.log('✅ Successfully joined room');
          resolve(response);
        }
      });
    });
  }

  leaveVideoRoom(roomId) {
    if (!this.socket?.connected) {
      console.log('⚠️ Socket not connected, cannot leave room');
      return;
    }
    console.log(`👋 Leaving video room: ${roomId}`);
    this.socket.emit('video-call:leave', { roomId });
  }

  endCall(roomId, consultationId) {
    if (!this.socket?.connected) return;
    console.log(`📞 Ending call for room: ${roomId}`);
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

  sendConnectionEstablished(roomId) {
    if (!this.socket?.connected) return;
    this.socket.emit('video-call:connected', { roomId });
  }

  toggleMedia(roomId, mediaType, isEnabled) {
    if (!this.socket?.connected) return;
    this.socket.emit('video-call:toggle-media', { roomId, mediaType, isEnabled });
  }

  raiseHand(roomId, isRaised) {
    if (!this.socket?.connected) return;
    this.socket.emit('video-call:raise-hand', { roomId, isRaised });
  }

  sendReaction(roomId, reaction) {
    if (!this.socket?.connected) return;
    this.socket.emit('video-call:reaction', { roomId, reaction });
  }

  // ========== CHAT FUNCTIONS ==========
  joinChat(consultationId) {
    if (!this.socket?.connected) return;
    this.socket.emit('chat:join', { consultationId });
  }

  sendMessage(consultationId, content, type = 'text') {
    if (!this.socket?.connected) return;
    this.socket.emit('chat:send-message', { consultationId, content, type });
  }

  typingIndicator(consultationId, isTyping) {
    if (!this.socket?.connected) return;
    this.socket.emit('chat:typing', { consultationId, isTyping });
  }

  leaveChat(consultationId) {
    if (!this.socket?.connected) return;
    this.socket.emit('chat:leave', { consultationId });
  }

  markMessagesAsRead(consultationId, messageIds) {
    if (!this.socket?.connected) return;
    this.socket.emit('chat:mark-read', { consultationId, messageIds });
  }

  // ========== FORUM FUNCTIONS ==========
  joinForum() {
    if (!this.socket?.connected) return;
    this.socket.emit('forum:join');
  }

  votePost(postId, voteType) {
    if (!this.socket?.connected) return;
    this.socket.emit('forum:vote', { postId, voteType });
  }

  reactToPost(postId, reactionType) {
    if (!this.socket?.connected) return;
    this.socket.emit('forum:react', { postId, reactionType });
  }

  leaveForum() {
    if (!this.socket?.connected) return;
    this.socket.emit('forum:leave');
  }

  // ========== UTILITY FUNCTIONS ==========
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

  isSocketConnected() {
    return (this.isConnected && this.socket?.connected) || false;
  }

  /** Wait for socket to be connected, with timeout. Resolves when connected or rejects on timeout. */
  waitForConnection(timeoutMs = 8000) {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not initialized. Please refresh the page and ensure you are logged in.'));
        return;
      }
      if (this.socket.connected) {
        resolve();
        return;
      }
      const onConnect = () => {
        clearTimeout(timeout);
        this.socket?.off('connect', onConnect);
        resolve();
      };
      const timeout = setTimeout(() => {
        this.socket?.off('connect', onConnect);
        reject(new Error('Connection timeout. Please refresh the page and try again.'));
      }, timeoutMs);
      this.socket.on('connect', onConnect);
    });
  }

  getSocketId() {
    return this.socket?.id || null;
  }

  getUserId() {
    return this.user?.id || null;
  }

  disconnect() {
    if (this.socket) {
      console.log('👋 Disconnecting socket');
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.isInitializing = false;
      this.initialized = false;
    }
  }

  // Helper method to ensure single instance
  static getInstance() {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }
}

// Export a singleton instance
const socketService = SocketService.getInstance();
export default socketService;
