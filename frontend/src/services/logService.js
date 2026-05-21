import { apiClient } from '../api';

// NOTE: if your /src/api.js does not export `apiClient`, this file will throw at import time.
// In that case, change to: `import api from '../api'` or export apiClient from api.js.


// This service expects the backend to return NDJSON-parsed logs with at least:
// { timestamp, level, message, ... }
// Admin endpoints are protected (auth + admin).

const normalizeLog = (log) => {
  if (!log || typeof log !== 'object') return null;

  const meta = log.meta && typeof log.meta === 'object' ? log.meta : {};

  // Backend controller logs often use top-level keys:
  // - userEmail, userName
  // Request logs use:
  // - userId
  // Map everything into meta.* so the UI can render consistently.
  const email = meta.email ?? meta.userEmail ?? log.userEmail;
  const name = meta.name ?? meta.userName ?? log.userName;
  const ip = meta.ip ?? meta.userIp ?? log.ip;
  const userAgent = meta.userAgent ?? log.userAgent;
  const role = meta.role ?? meta.userRole ?? log.userRole;

  return {
    ...log,
    meta: {
      ...meta,
      email: email ?? meta.email,
      name: name ?? meta.name,
      ip: ip ?? meta.ip,
      userAgent: userAgent ?? meta.userAgent,
      role: role ?? meta.role
    },
    // Keep userId available for UI fallbacks
    userId: log.userId ?? log.user?.id ?? log.userId
  };
};

export const logService = {
  async getAllLogs() {
    const res = await apiClient.get('/logs');
    // Backend returns: { success: true, logs: [...], total }
    const payload = res?.data;

    if (payload?.logs && Array.isArray(payload.logs)) {
      return { ...payload, logs: payload.logs.map(normalizeLog).filter(Boolean) };
    }

    // Fallback: if backend returns an array directly
    if (Array.isArray(payload)) {
      return payload.map(normalizeLog).filter(Boolean);
    }

    return { success: false, message: 'Unexpected logs response format', logs: [] };
  },

  async getLogsByLevel(level) {
    const res = await apiClient.get(`/logs/level/${encodeURIComponent(level)}`);
    const payload = res?.data;

    if (payload?.logs && Array.isArray(payload.logs)) {
      return { ...payload, logs: payload.logs.map(normalizeLog).filter(Boolean) };
    }

    return { success: false, message: 'Unexpected logs response format', logs: [] };
  },

  async clearLogs() {
    const res = await apiClient.delete('/logs');
    return res?.data;
  }
};

