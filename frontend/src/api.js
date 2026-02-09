// src/api.js - COMPLETE WITH ALL ENDPOINTS INCLUDING VIDEO CALL
import axios from 'axios';

// Base URL from environment or fallback
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle unauthorized access
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ========== AUTH API ==========
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  checkEmail: (email) => api.post('/auth/check-email', { email }),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (userData) => api.put('/auth/profile', userData),
  changePassword: (passwordData) => api.put('/auth/change-password', passwordData),
  deactivateAccount: () => api.put('/auth/deactivate'),
  updateMyRole: (roleData) => api.put('/auth/profile/role', roleData),

  // Google OAuth
  getGoogleAuthUrl: () => `${API_BASE_URL}/auth/google`,
  exchangeToken: (shortToken) => api.post('/auth/exchange-token', { token: shortToken }),
};

// ========== USER MANAGEMENT API ==========
export const userAPI = {
  // Admin routes
  getAllUsers: (params = {}) => api.get('/users', { params }),
  getUserById: (id) => api.get(`/users/${id}`),
  createUser: (userData) => api.post('/users', userData),
  updateUserRole: (id, roleData) => api.put(`/users/${id}/role`, roleData),
  updateUserProfile: (id, userData) => api.put(`/users/${id}/profile`, userData),
  deleteUser: (id) => api.delete(`/users/${id}`),
  toggleVerification: (id) => api.put(`/users/${id}/verify`),
  toggleActiveStatus: (id) => api.put(`/users/${id}/active`),

  // Account management (authenticated users)
  reactivateAccount: () => api.put('/users/reactivate'),
  deleteAccountPermanently: (password) => api.delete('/users/delete-account', { data: { password } }),

  // Public access
  getExperts: (params = {}) => api.get('/users/experts', { params }),
  getFarmers: (params = {}) => api.get('/users/farmers', { params }),
};

// ========== BOOKING & CONSULTATION API ==========
export const bookingAPI = {
  // Direct booking 
  bookConsultation: (consultationData) => api.post('/booking/book', consultationData),

  // Consultation management
  getExpertConsultations: (params = {}) => api.get('/booking/expert/my', { params }),
  getFarmerConsultations: (params = {}) => api.get('/booking/farmer/my', { params }),
  acceptConsultation: (consultationId) => api.patch(`/booking/${consultationId}/accept`),
  rejectConsultation: (consultationId, reason) => api.patch(`/booking/${consultationId}/reject`, { reason }),
  cancelConsultation: (consultationId, reason) => api.patch(`/booking/${consultationId}/cancel`, { reason }),
  completeConsultation: (consultationId) => api.patch(`/booking/${consultationId}/complete`),
  addReview: (consultationId, reviewData) => api.post(`/booking/${consultationId}/review`, reviewData),

  // Quick booking functions
  getExpertDetailsForBooking: (expertId) => api.get(`/users/${expertId}`),
};

// ========== VIDEO CALL API ==========
export const videoCallAPI = {
  // Get WebRTC configuration
  getCallConfig: () => api.get('/video/config/webrtc'),
  
  // Initiate video call
  initiateVideoCall: (consultationId) => 
    api.post(`/video/consultations/${consultationId}/video-call`),
  
  // Get consultation chat
  getConsultationChat: (consultationId) => 
    api.get(`/video/consultations/${consultationId}/chat`),
  
  // Send message
  sendMessage: (consultationId, messageData) => 
    api.post(`/video/consultations/${consultationId}/chat/messages`, messageData),
  
  getChatMessages: (consultationId) => 
    api.get(`/video/consultations/${consultationId}/chat`),
  
  markMessagesAsRead: (consultationId, messageIds) => 
    api.post(`/video/consultations/${consultationId}/chat/read`, { messageIds }),
};

// ========== FORUM API ==========
export const forumAPI = {
  // Categories
  getCategories: () => api.get('/forum/categories'),
  
  // Posts
  getPosts: (params = {}) => api.get('/forum/posts', { params }),
  getPost: (postId) => api.get(`/forum/posts/${postId}`),
  createPost: (postData) => api.post('/forum/posts', postData),
  updatePost: (postId, postData) => api.put(`/forum/posts/${postId}`, postData),
  deletePost: (postId) => api.delete(`/forum/posts/${postId}`),
  votePost: (postId, voteType) => api.post(`/forum/posts/${postId}/vote`, { voteType }),
  
  // Comments
  createComment: (postId, commentData) => api.post(`/forum/posts/${postId}/comments`, commentData),
  updateComment: (commentId, commentData) => api.put(`/forum/comments/${commentId}`, commentData),
  deleteComment: (commentId) => api.delete(`/forum/comments/${commentId}`),
  voteComment: (commentId, voteType) => api.post(`/forum/comments/${commentId}/vote`, { voteType }),
  markAsAnswer: (commentId) => api.post(`/forum/comments/${commentId}/answer`),
  
  // User posts
  getUserPosts: (userId, params = {}) => api.get(`/forum/users/${userId}/posts`, { params }),
  
  // Search
  searchForum: (params = {}) => api.get('/forum/search', { params }),
  
  // Statistics
  getForumStats: () => api.get('/forum/stats'),
  
  // Moderation endpoints (experts/admins only)
  getPendingReviews: (params = {}) => api.get('/forum/moderation/pending', { params }),
  approveContent: (type, id, reviewNotes) => 
    api.post(`/forum/moderation/${type}/${id}/approve`, { reviewNotes }),
  rejectContent: (type, id, rejectionReason) => 
    api.post(`/forum/moderation/${type}/${id}/reject`, { rejectionReason }),
  togglePinPost: (postId) => api.post(`/forum/posts/${postId}/pin`),
  toggleLockPost: (postId) => api.post(`/forum/posts/${postId}/lock`),
  getModerationStats: () => api.get('/forum/moderation/stats'),
  getUserModerationHistory: (userId, params = {}) =>
    api.get(`/forum/moderation/users/${userId}/history`, { params }),
};

// ========== MPESA API ==========
export const mpesaAPI = {
  initiatePayment: (paymentData) => api.post('/mpesa/stk-push', paymentData),
  queryPaymentStatus: (consultationId) => api.get(`/mpesa/status/${consultationId}`),
  getFarmerPayments: (params = {}) => api.get('/mpesa/history/farmer', { params }),
  getExpertEarnings: (params = {}) => api.get('/mpesa/earnings/expert', { params }),
  processRefund: (consultationId, refundData) => api.post(`/mpesa/refund/${consultationId}`, refundData),
  getAllPayments: (params = {}) => api.get('/mpesa/admin/all-payments', { params }),
};

// ========== TRANSACTION API ==========
export const transactionAPI = {
  getTransaction: (transactionId) => api.get(`/transactions/${transactionId}`),
  getUserTransactions: (params = {}) => api.get('/transactions/user/transactions', { params }),
  getTransactionStats: () => api.get('/transactions/stats'),
  getAllTransactions: (params = {}) => api.get('/transactions/admin/all-transactions', { params }),
  exportTransactions: (params = {}) => api.get('/transactions/admin/export', { params }),
};

// ========== CROP API ==========
export const cropAPI = {
  // Get all crops for farmer
  getFarmerCrops: () => api.get('/crops'),

  // Get crop statistics
  getCropStats: () => api.get('/crops/stats'),

  // Get single crop
  getCropById: (cropId) => api.get(`/crops/${cropId}`),

  // Create new crop
  createCrop: (cropData) => api.post('/crops', cropData),

  // Update crop
  updateCrop: (cropId, cropData) => api.put(`/crops/${cropId}`, cropData),

  // Update crop progress/health
  updateCropProgress: (cropId, progressData) => api.patch(`/crops/${cropId}/progress`, progressData),

  // Delete crop
  deleteCrop: (cropId) => api.delete(`/crops/${cropId}`),
};

// ========== UPLOAD API ==========
export const uploadAPI = {
  uploadFile: (file, onUploadProgress) => {
    const formData = new FormData();
    formData.append('file', file);

    return api.post('/uploads', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    });
  },

  deleteFile: (fileId) => api.delete(`/uploads/${fileId}`),
};

// ========== NOTIFICATION API ==========
export const notificationAPI = {
  getAll: (params = {}) => api.get('/notifications', { params }),
  markAsRead: (notificationId) => api.put(`/notifications/${notificationId}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  delete: (notificationId) => api.delete(`/notifications/${notificationId}`),
  getUnreadCount: () => api.get('/notifications/unread-count'),
};

// ========== UTILITY FUNCTIONS ==========
export const apiUtils = {
  // Error handling
  handleError: (error) => {
    if (error.response) {
      return {
        success: false,
        message: error.response.data.message || 'An error occurred',
        status: error.response.status,
        data: error.response.data,
      };
    } else if (error.request) {
      return {
        success: false,
        message: 'Network error. Please check your connection.',
        status: 0,
      };
    } else {
      return {
        success: false,
        message: error.message || 'An unexpected error occurred',
        status: -1,
      };
    }
  },

  // Success handling
  handleSuccess: (response) => ({
    success: true,
    data: response.data,
    status: response.status,
  }),
  
  // Booking utilities
  booking: {
    formatTimeSlot: (slot) => {
      if (!slot.startTime) return '';
      const start = new Date(`2000-01-01T${slot.startTime}`);
      const end = new Date(start.getTime() + (slot.duration || 60) * 60000);
      
      return `${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    },
    
    formatBookingDate: (dateString) => {
      const date = new Date(dateString);
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      if (date.toDateString() === now.toDateString()) {
        return 'Today';
      } else if (date.toDateString() === tomorrow.toDateString()) {
        return 'Tomorrow';
      } else {
        return date.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric'
        });
      }
    },
    
    calculateEndTime: (startTime, duration) => {
      const [hours, minutes] = startTime.split(':').map(Number);
      const start = new Date();
      start.setHours(hours, minutes, 0, 0);
      const end = new Date(start.getTime() + duration * 60000);
      
      return end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    },
    
    validateBooking: (bookingData) => {
      const errors = [];
      
      if (!bookingData.expertId) errors.push('Expert is required');
      if (!bookingData.date) errors.push('Date is required');
      if (!bookingData.startTime) errors.push('Time is required');
      if (!bookingData.duration || bookingData.duration < 15) 
        errors.push('Duration must be at least 15 minutes');
      if (!bookingData.topic || bookingData.topic.trim().length < 5)
        errors.push('Topic must be at least 5 characters');
      
      return errors;
    },
    
    getStatusColor: (status) => {
      const colors = {
        pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
        confirmed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
        accepted: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
        rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
        completed: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
        cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      };
      return colors[status] || colors.pending;
    },
    
    getStatusIcon: (status) => {
      const icons = {
        pending: '⏳',
        confirmed: '✅',
        accepted: '👍',
        rejected: '❌',
        completed: '🏁',
        cancelled: '🚫',
      };
      return icons[status] || '⏳';
    },
    
    formatConsultation: (consultation) => {
      return {
        ...consultation,
        formattedDate: apiUtils.booking.formatBookingDate(consultation.bookingDate),
        formattedTime: `${consultation.startTime} - ${apiUtils.booking.calculateEndTime(consultation.startTime, consultation.duration)}`,
        statusColor: apiUtils.booking.getStatusColor(consultation.status),
        statusIcon: apiUtils.booking.getStatusIcon(consultation.status),
      };
    },
  },
  
  // Video call utilities
  videoCall: {
    // Get WebRTC configuration
    getRTCPeerConnectionConfig: async () => {
      try {
        const response = await videoCallAPI.getCallConfig();
        return response.data.rtcConfig || {
          iceServers: [
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' }
          ],
          iceCandidatePoolSize: 10
        };
      } catch (error) {
        console.warn('Failed to get WebRTC config, using defaults', error);
        return {
          iceServers: [
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' }
          ],
          iceCandidatePoolSize: 10
        };
      }
    },

    // Get media constraints
    getMediaConstraints: () => ({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      },
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        frameRate: { ideal: 30 }
      }
    }),

    // Get screen share constraints
    getScreenShareConstraints: () => ({
      video: {
        cursor: 'always',
        displaySurface: 'monitor'
      },
      audio: false
    }),

    // Format duration
    formatDuration: (seconds) => {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;
      
      if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
      }
      return `${minutes}:${secs.toString().padStart(2, '0')}`;
    },

    // Check browser support
    checkBrowserSupport: () => {
      const supported = {
        getUserMedia: !!navigator.mediaDevices?.getUserMedia,
        RTCPeerConnection: !!window.RTCPeerConnection,
        screenShare: !!navigator.mediaDevices?.getDisplayMedia
      };
      
      return {
        ...supported,
        allSupported: supported.getUserMedia && supported.RTCPeerConnection,
        message: !supported.allSupported ? 
          'Your browser does not fully support video calls. Please use Chrome, Firefox, or Edge.' : 
          'Your browser supports video calls.'
      };
    },

    // Validate consultation for video call
    validateConsultationForVideoCall: (consultation) => {
      const errors = [];
      
      if (!consultation) {
        errors.push('Consultation not found');
        return { isValid: false, errors };
      }
      
      if (consultation.status !== 'accepted') {
        errors.push('Consultation must be accepted before starting video call');
      }
      
      const payment = consultation.payment;
      if (payment && !payment.isFree && payment.status !== 'paid') {
        errors.push('Payment must be completed before starting video call');
      }
      
      const consultationTime = new Date(consultation.bookingDate);
      const [hours, minutes] = consultation.startTime.split(':').map(Number);
      consultationTime.setHours(hours, minutes, 0, 0);
      const now = new Date();
      
    
      
      return {
        isValid: errors.length === 0,
        errors,
        canJoin: errors.length === 0
      };
    }
  },
  
  // Forum utilities
  forum: {
    formatPostParams: (filters) => {
      const params = {};
      
      if (filters.category) params.category = filters.category;
      if (filters.tag) params.tag = filters.tag;
      if (filters.author) params.author = filters.author;
      if (filters.status) params.status = filters.status;
      if (filters.sortBy) params.sortBy = filters.sortBy;
      if (filters.search) params.search = filters.search;
      if (filters.expertOnly) params.expertOnly = filters.expertOnly;
      if (filters.page) params.page = filters.page;
      if (filters.limit) params.limit = filters.limit;
      
      return params;
    },
    
    formatSearchParams: (query, filters = {}) => {
      const params = { q: query };
      
      if (filters.type) params.type = filters.type;
      if (filters.page) params.page = filters.page;
      if (filters.limit) params.limit = filters.limit;
      
      return params;
    },
    
    calculateTrendingScore: (post) => {
      const hoursSinceCreation = (Date.now() - new Date(post.createdAt)) / (1000 * 60 * 60);
      const commentWeight = (post.stats?.commentCount || 0) * 2;
      const voteWeight = ((post.stats?.upvotes || 0) * 1.5) - ((post.stats?.downvotes || 0) * 0.5);
      const viewWeight = (post.stats?.views || 0) * 0.01;
      
      const timeDecay = Math.exp(-hoursSinceCreation / 48);
      return (commentWeight + voteWeight + viewWeight) * timeDecay;
    },
    
    formatDateTime: (dateString) => {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);
      
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: diffDays < 365 ? undefined : 'numeric'
      });
    },
    
    generatePostExcerpt: (content, maxLength = 150) => {
      if (!content || content.length <= maxLength) return content;
      return content.substring(0, maxLength) + '...';
    },
    
    // Check if user has permission to moderate
    canModerate: (user) => {
      return user?.role === 'admin' || user?.role === 'expert';
    },
    
    // Check if user can post in expert-only categories
    canPostExpertOnly: (user) => {
      return user?.role === 'admin' || user?.role === 'expert';
    },
    
    // Format tags for display
    formatTags: (tags) => {
      if (!tags || !Array.isArray(tags)) return [];
      return tags.map(tag => tag.toLowerCase().trim()).filter(tag => tag.length > 0);
    },
    
    // Validate post data before submission
    validatePost: (postData) => {
      const errors = [];
      
      if (!postData.title || postData.title.trim().length < 5) {
        errors.push('Title must be at least 5 characters');
      }
      
      if (!postData.content || postData.content.trim().length < 10) {
        errors.push('Content must be at least 10 characters');
      }
      
      if (!postData.category) {
        errors.push('Category is required');
      }
      
      if (postData.tags && postData.tags.length > 10) {
        errors.push('Maximum 10 tags allowed');
      }
      
      return errors;
    },
    
    // Validate comment data before submission
    validateComment: (commentData) => {
      const errors = [];
      
      if (!commentData.content || commentData.content.trim().length < 2) {
        errors.push('Comment must be at least 2 characters');
      }
      
      if (commentData.content && commentData.content.length > 2000) {
        errors.push('Comment cannot exceed 2000 characters');
      }
      
      return errors;
    },
  },
};

// Create a socket utility for easy socket connection
export const socketUtils = {
  connect: (token) => {
    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
    const socket = io(socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling']
    });
    
    return socket;
  },
  
  // Socket event constants
  events: {
    // Video call events
    VIDEO_CALL_JOIN: 'video-call:join',
    VIDEO_CALL_JOINED: 'video-call:joined',
    VIDEO_CALL_READY: 'video-call:ready',
    VIDEO_CALL_USER_JOINED: 'video-call:user-joined',
    VIDEO_CALL_OFFER: 'video-call:offer',
    VIDEO_CALL_ANSWER: 'video-call:answer',
    VIDEO_CALL_ICE_CANDIDATE: 'video-call:ice-candidate',
    VIDEO_CALL_USER_LEFT: 'video-call:user-left',
    VIDEO_CALL_ENDED: 'video-call:ended',
    VIDEO_CALL_TOGGLE_MEDIA: 'video-call:toggle-media',
    VIDEO_CALL_SCREEN_SHARE: 'video-call:screen-share',
    VIDEO_CALL_RAISE_HAND: 'video-call:raise-hand',
    VIDEO_CALL_REACTION: 'video-call:reaction',
    
    // Chat events
    CHAT_JOIN: 'chat:join',
    CHAT_PREVIOUS_MESSAGES: 'chat:previous-messages',
    CHAT_USER_JOINED: 'chat:user-joined',
    CHAT_SEND_MESSAGE: 'chat:send-message',
    CHAT_NEW_MESSAGE: 'chat:new-message',
    CHAT_TYPING: 'chat:typing',
    CHAT_TYPING_INDICATOR: 'chat:typing-indicator',
    CHAT_MARK_READ: 'chat:mark-read',
    CHAT_MESSAGES_READ: 'chat:messages-read',
    CHAT_LEAVE: 'chat:leave',
    CHAT_USER_LEFT: 'chat:user-left',
    
    // Notification events
    NOTIFICATION_CONSULTATION_READY: 'notification:consultation-ready',
    NOTIFICATION_NEW_MESSAGE: 'notification:new-message',
    
    // General events
    ERROR: 'error',
    USER_DISCONNECTED: 'user-disconnected'
  }
};

export const videoCallUtils = apiUtils.videoCall;

// Export everything
export default api;

// Re-export commonly used functions for convenience
export const {
  handleError,
  handleSuccess,
  booking,
  videoCall,
  forum
} = apiUtils;