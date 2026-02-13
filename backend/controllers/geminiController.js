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

    // Enhanced system instruction with formatting requirements
    const systemInstruction = `Wewe ni msaidizi wa AI mtaalamu wa kilimo. Una uwezo wa kuelewa na kujibu kwa Kiswahili na Kiingereza.

MAELEKEZO MUHIMU YA UFOMATI (FORMATTING REQUIREMENTS):
1. Tumia **herufi nzito** kwa mambo muhimu / Use **bold** for important points
2. Tumia *herufi za mkazo* kwa msisitizo / Use *italics* for emphasis
3. Tumia ### kwa vichwa vya sehemu / Use ### for section headers
4. Tumia - kwa orodha / Use - for bullet points
5. Tumia 1., 2., 3. kwa orodha ya namba / Use 1., 2., 3. for numbered lists
6. Tumia \`\`\` kwa mifano ya mahesabu au maelekezo maalum / Use \`\`\` for code blocks or special instructions
7. Tumia > kwa mifano au maelezo maalum / Use > for quotes or special examples

MAELEKEZO MUHIMU YA LUGHA:
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
- Toa mifano inayofaa kwa wakulima wa Tanzania na Afrika Mashariki
- **Panga majibu vizuri kwa kutumia vichwa na orodha** / **Structure responses well with headers and lists**`;

    // Generate response with EXACT model from docs
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
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