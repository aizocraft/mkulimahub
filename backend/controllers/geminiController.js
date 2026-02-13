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

    // System instruction to keep the AI focused on farming topics only
    const systemInstruction = `You are an agricultural expert AI assistant. Your only area of expertise is farming and agriculture. 
- Provide helpful advice only about farming, crops, livestock, soil management, weather for agriculture, agricultural techniques, pest control for farms, irrigation, fertilizers, and other farming-related topics.
- If the user asks about anything unrelated to farming (such as medical advice, technology, entertainment, politics, sports, finance, cooking, travel, relationships, or any other non-farming topic), respond with: "I am an agricultural expert and only provide farming advice. I'm not an expert in that field. Please ask me about farming or agricultural topics."
- Stay focused on farming and agriculture. Do not provide information about other topics.
- Be helpful, concise, and informative for farming-related questions.`;

    // Generate response with EXACT model from docs
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview", // Exact model
      contents: systemInstruction + '\n\nUser question: ' + trimmedMessage,
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
