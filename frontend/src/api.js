import axios from 'axios';

// Base URL from environment or fallback
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // enable cookies if needed
  headers: {
    'Content-Type': 'application/json',
  },
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
      window.location.href = '/login';
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

  // Google OAuth
  getGoogleAuthUrl: () => `${API_BASE_URL}/auth/google`,
};

// User Management API
export const userAPI = {
  // Admin routes
  getAllUsers: (params = {}) => api.get('/users', { params }),
  getUserById: (id) => api.get(`/users/${id}`),
  createUser: (userData) => api.post('/users', userData),
  updateUserRole: (id, role) => api.put(`/users/${id}/role`, { role }),
  updateUserProfile: (id, userData) => api.put(`/users/${id}/profile`, userData),
  deleteUser: (id) => api.delete(`/users/${id}`),
  toggleVerification: (id) => api.put(`/users/${id}/verify`),
  toggleActiveStatus: (id) => api.put(`/users/${id}/active`),

  // Public access
  getExperts: (params = {}) => api.get('/users/experts', { params }),
  getFarmers: (params = {}) => api.get('/users/farmers', { params }),
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
};

export default api;
