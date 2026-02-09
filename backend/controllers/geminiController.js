const { GoogleGenAI } = require("@google/genai");
const AiChat = require("../models/AiChat");

// Initialize Gemini with API key
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

exports.chatWithGemini = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!message?.trim()) {
      return res.status(400).json({ 
        success: false, 
        error: "Message is required" 
      });
    }

    const trimmedMessage = message.trim();

    // Save user message
    await AiChat.create({ 
      user: userId, 
      role: 'user', 
      message: trimmedMessage 
    });

    // Generate response with EXACT model from docs
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview", // Exact model
      contents: trimmedMessage,
    });

    const aiText = response.text;

    // Save bot response
    await AiChat.create({ 
      user: userId, 
      role: 'model', 
      message: aiText 
    });

    res.json({ 
      success: true, 
      response: aiText 
    });

  } catch (error) {
    console.error("Gemini Error:", error);
    
    // Simple error handling
    const errorMessage = error.message?.includes("API key") 
      ? "Invalid API key" 
      : "AI service error";
    
    res.status(500).json({ 
      success: false, 
      error: errorMessage 
    });
  }
};

exports.getChatHistory = async (req, res) => {
  try {
    const history = await AiChat.find({ user: req.user.id })
      .sort({ timestamp: 1 });
    
    res.json({ 
      success: true, 
      history 
    });
  } catch (error) {
    console.error("History Error:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to load history" 
    });
  }
};