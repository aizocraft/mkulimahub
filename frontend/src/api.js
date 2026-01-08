// api.js - UPDATED WITH FORUM ENDPOINTS
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
  timeout: 10000, // 10 second timeout
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
  (response) => {
    // Add custom response handling if needed
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
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

// User Management API
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

  // Public access
  getExperts: (params = {}) => api.get('/users/experts', { params }),
  getFarmers: (params = {}) => api.get('/users/farmers', { params }),
};

// Forum API
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

// Upload API (for attachments)
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

// Notification API
export const notificationAPI = {
  getAll: (params = {}) => api.get('/notifications', { params }),
  markAsRead: (notificationId) => api.put(`/notifications/${notificationId}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  delete: (notificationId) => api.delete(`/notifications/${notificationId}`),
  getUnreadCount: () => api.get('/notifications/unread-count'),
};

// Utility functions for handling API responses
export const apiUtils = {
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

  handleSuccess: (response) => ({
    success: true,
    data: response.data,
    status: response.status,
  }),
  
  // Forum-specific utilities
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

// Export everything
export default api;

// Re-export commonly used functions for convenience
export const {
  handleError,
  handleSuccess,
  forum,
} = apiUtils;