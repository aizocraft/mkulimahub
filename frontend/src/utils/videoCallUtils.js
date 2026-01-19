// src/utils/videoCallUtils.js
import { videoCallAPI } from '../api';

export const videoCallUtils = {
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
    
    if (!consultation.payment.isFree && consultation.payment.status !== 'paid') {
      errors.push('Payment must be completed before starting video call');
    }
    
    const consultationTime = new Date(consultation.bookingDate);
    const [hours, minutes] = consultation.startTime.split(':').map(Number);
    consultationTime.setHours(hours, minutes, 0, 0);
    const now = new Date();
    
    // Check if consultation is within allowed time (30 minutes before to 2 hours after)
    const timeDiff = (consultationTime - now) / (1000 * 60); // in minutes
    if (timeDiff > 30) {
      errors.push('Video call can only be started 30 minutes before the scheduled time');
    }
    if (timeDiff < -120) {
      errors.push('Video call can only be joined up to 2 hours after the scheduled time');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      canJoin: errors.length === 0
    };
  }
};

export default videoCallUtils;