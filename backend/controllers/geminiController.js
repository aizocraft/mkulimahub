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

    // Validate input with bilingual error message
    if (!message?.trim()) {
      return res.status(400).json({ 
        success: false, 
        error: "Message is required / Ujumbe unahitajika" 
      });
    }

    const trimmedMessage = message.trim();

    // Save user message
    await AiChat.create({ 
      user: userId, 
      role: 'user', 
      message: trimmedMessage 
    });

    // System instruction with Kiswahili language support
    const systemInstruction = `Wewe ni msaidizi wa AI mtaalamu wa kilimo. Una uwezo wa kuelewa na kujibu kwa Kiswahili na Kiingereza.

MAELEKEZO MUHIMU:
1. Ikiwa mtumiaji anauliza kwa Kiswahili, jibu kwa Kiswahili
2. Ikiwa mtumiaji anauliza kwa Kiingereza, jibu kwa Kiingereza
3. Ikiwa mtumiaji anachanganya lugha, jibu kwa lugha kuu aliyotumia
4. Elewa na tumia istilahi za kilimo kwa Kiswahili (kama vile: mazao, mifugo, udongo, mbolea, wadudu, umwagiliaji, magonjwa ya mimea, n.k.)

ENEO LA UTAALAMU:
- Toa ushauri kuhusu kilimo pekee: mazao, mifugo, udongo, hali ya hewa kwa kilimo, mbinu za kilimo, udhibiti wa wadudu, umwagiliaji, mbolea, na mada nyinginezo za kilimo
- Usijibu maswali yasiyohusiana na kilimo

KWA MASWALI YASIYO KUHUSU KILIMO:
Kiswahili: "Samahani, mimi ni mtaalamu wa kilimo pekee. Siwezi kujibu swali hili kwa sababu siyo kuhusu kilimo. Tafadhali uliza swali kuhusu kilimo, mazao, mifugo, au mada nyinginezo za kilimo."

English: "I am an agricultural expert and only provide farming advice. Please ask me about farming or agricultural topics."

KUWA MSADIFU:
- Kuwa msaada, mfupi, na toa taarifa muhimu kwa maswali ya kilimo
- Elewa na utumie istilahi za kilimo za Kiswahili kwa usahihi
- Toa mifano inayofaa kwa wakulima wa Tanzania na Afrika Mashariki`;

    // Generate response with EXACT model from docs
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview", // Exact model
      contents: systemInstruction + '\n\nUser question / Swali la mtumiaji: ' + trimmedMessage,
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
    
    // Bilingual error messages
    let errorMessage = "AI service error / Hitilafu ya huduma ya AI";
    
    if (error.message?.includes("API key")) {
      errorMessage = "Invalid API key / Ufunguo wa API si sahihi";
    } else if (error.message?.includes("quota")) {
      errorMessage = "Service quota exceeded / Hundi ya huduma imeisha";
    } else if (error.message?.includes("rate limit")) {
      errorMessage = "Too many requests / Maombi mengi sana";
    }
    
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
      error: "Failed to load history / Imeshindwa kupakia historia" 
    });
  }
};