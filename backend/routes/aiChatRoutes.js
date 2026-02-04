//routes/aiChatRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); 
const { chatWithGemini, getChatHistory } = require('../controllers/geminiController');

// All AI routes require the user to be logged in
router.post('/chat', auth, chatWithGemini);
router.get('/history', auth, getChatHistory);

module.exports = router;