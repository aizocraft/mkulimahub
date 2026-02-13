// controllers/videoCallController.js
const Consultation = require('../models/Consultation');
const ChatMessage = require('../models/ChatMessage');
const stunTurnService = require('../services/stunTurnService');

// Create ChatMessage model if not exists
const mongoose = require('mongoose');
const chatMessageSchema = new mongoose.Schema({
  consultation: { type: mongoose.Schema.Types.ObjectId, ref: 'Consultation' },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  content: String,
  type: { type: String, default: 'text' },
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

let ChatMessageModel;
try {
  ChatMessageModel = mongoose.model('ChatMessage');
} catch {
  ChatMessageModel = mongoose.model('ChatMessage', chatMessageSchema);
}

const videoCallController = {
  // Get WebRTC configuration
  getCallConfig: async (req, res) => {
    try {
      // Generate TURN credentials for better connectivity
      const iceServers = await stunTurnService.generateTurnCredentials();

      const rtcConfig = {
        iceServers,
        iceCandidatePoolSize: 10
      };

      res.status(200).json({
        success: true,
        rtcConfig
      });
    } catch (error) {
      console.error('Error getting call config:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  },

  // Initiate video call
  initiateVideoCall: async (req, res) => {
    try {
      const { consultationId } = req.params;
      const userId = req.user._id;

      // Find consultation
      const consultation = await Consultation.findById(consultationId)
        .populate('farmer expert', '_id name');

      if (!consultation) {
        return res.status(404).json({
          success: false,
          message: 'Consultation not found'
        });
      }

      // Verify user is part of consultation
      const isFarmer = consultation.farmer._id.toString() === userId.toString();
      const isExpert = consultation.expert._id.toString() === userId.toString();
      
      if (!isFarmer && !isExpert) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized'
        });
      }

      // Generate room ID
      const roomId = `consultation_${consultationId}`;
      const otherUser = isFarmer ? consultation.expert : consultation.farmer;

      res.status(200).json({
        success: true,
        message: 'Video call ready',
        data: {
          roomId,
          consultationId,
          otherUser: {
            id: otherUser._id,
            name: otherUser.name
          },
          user: {
            id: req.user._id,
            name: req.user.name
          }
        }
      });
    } catch (error) {
      console.error('Error initiating video call:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  },

  // Get consultation chat
  getConsultationChat: async (req, res) => {
    try {
      const { consultationId } = req.params;
      const userId = req.user._id;

      // Verify consultation
      const consultation = await Consultation.findById(consultationId);
      if (!consultation) {
        return res.status(404).json({
          success: false,
          message: 'Consultation not found'
        });
      }

      // Check authorization
      const isFarmer = consultation.farmer.toString() === userId.toString();
      const isExpert = consultation.expert.toString() === userId.toString();
      
      if (!isFarmer && !isExpert) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized'
        });
      }

      // Get messages
      const messages = await ChatMessageModel.find({ consultation: consultationId })
        .populate('sender', 'name profilePicture')
        .sort({ createdAt: 1 })
        .limit(50);

      res.status(200).json({
        success: true,
        messages,
        consultation: {
          id: consultation._id,
          topic: consultation.topic,
          status: consultation.status
        }
      });
    } catch (error) {
      console.error('Error getting chat:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  },

  // Send message
  sendMessage: async (req, res) => {
    try {
      const { consultationId } = req.params;
      const { content, type } = req.body;
      const userId = req.user._id;

      // Validate
      if (!content || content.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Message content is required'
        });
      }

      // Verify consultation
      const consultation = await Consultation.findById(consultationId);
      if (!consultation) {
        return res.status(404).json({
          success: false,
          message: 'Consultation not found'
        });
      }

      // Create message
      const message = new ChatMessageModel({
        consultation: consultationId,
        sender: userId,
        content: content.trim(),
        type: type || 'text',
        readBy: [userId]
      });

      await message.save();
      await message.populate('sender', 'name profilePicture');

      res.status(201).json({
        success: true,
        message: 'Message sent',
        data: message
      });
    } catch (error) {
      console.error('Error sending message:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  },


// Mark messages as read
markMessagesAsRead: async (req, res) => {
  try {
    const { consultationId } = req.params;
    const { messageIds } = req.body;
    const userId = req.user._id;

    await ChatMessageModel.updateMany(
      {
        _id: { $in: messageIds },
        consultation: consultationId,
        sender: { $ne: userId }
      },
      {
        $addToSet: { readBy: userId }
      }
    );

    res.status(200).json({
      success: true,
      message: 'Messages marked as read'
    });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
}


};

module.exports = videoCallController;