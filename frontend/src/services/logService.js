// src/services/logService.js
import api from '../api';

export const logService = {
  // Get all logs
  getAllLogs: async () => {
    try {
      const response = await api.get('/logs');
      return response.data;
    } catch (error) {
      console.error('Error fetching logs:', error);
      throw error;
    }
  },

  // Get logs by level
  getLogsByLevel: async (level) => {
    try {
      const response = await api.get(`/logs/level/${level}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching logs by level:', error);
      throw error;
    }
  },

  // Clear logs
  clearLogs: async () => {
    try {
      const response = await api.delete('/logs');
      return response.data;
    } catch (error) {
      console.error('Error clearing logs:', error);
      throw error;
    }
  }
};