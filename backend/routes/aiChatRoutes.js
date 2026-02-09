const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { chatWithGemini, getChatHistory } = require('../controllers/geminiController');

router.post('/chat', auth, chatWithGemini);
router.get('/history', auth, getChatHistory);

module.exports = router;