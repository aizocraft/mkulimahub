// src/services/logService.js
import api from '../api';

export const logService = {
  // Get all logs (normalized)
  // Backend returns: { success, logs, total }
  // Frontend callers expect: { logs: [], total } or just { logs }.
  getAllLogs: async () => {
    try {
      const response = await api.get('/logs');
      const data = response?.data;

      if (!data) return { logs: [], total: 0, success: false };
      if (Array.isArray(data)) return { logs: data, total: data.length, success: true };

      const logs = Array.isArray(data.logs) ? data.logs : [];
      const total = typeof data.total === 'number' ? data.total : logs.length;

      return { success: data.success !== false, logs, total };
    } catch (error) {
      console.error('Error fetching logs:', error);
      throw error;
    }
  },

  // Get logs by level (normalized)
  getLogsByLevel: async (level) => {
    try {
      const response = await api.get(`/logs/level/${level}`);
      const data = response?.data;

      if (!data) return { logs: [], total: 0, success: false };
      if (Array.isArray(data)) return { logs: data, total: data.length, success: true };

      const logs = Array.isArray(data.logs) ? data.logs : [];
      const total = typeof data.total === 'number' ? data.total : logs.length;

      return { success: data.success !== false, logs, total };
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