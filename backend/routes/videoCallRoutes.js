// routes/videoCallRoutes.js 
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const videoCallController = require('../controllers/videoCallController');

// Get WebRTC configuration
router.get('/config/webrtc', auth, videoCallController.getCallConfig);

// Initiate video call
router.post('/consultations/:consultationId/video-call', auth, videoCallController.initiateVideoCall);

// Get consultation chat
router.get('/consultations/:consultationId/chat', auth, videoCallController.getConsultationChat);

// Send message 
router.post('/consultations/:consultationId/chat/messages', auth, videoCallController.sendMessage);

// Mark messages as read
router.post('/consultations/:consultationId/chat/read', auth, videoCallController.markMessagesAsRead);

module.exports = router;