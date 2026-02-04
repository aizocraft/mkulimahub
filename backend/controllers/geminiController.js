const { GoogleGenerativeAI } = require("@google/generative-ai");
const AiChat = require("../models/AiChat");

// 1. Setup API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// node-fetch may be ESM; handle default export when required from CJS
let fetchLib;
try {
  const nf = require('node-fetch');
  fetchLib = nf && (nf.default || nf);
} catch (e) {
  if (typeof fetch !== 'undefined') fetchLib = fetch;
}

exports.chatWithGemini = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user.id;

    // Save User message
    await AiChat.create({ user: userId, role: 'user', message });

        // Model selection: prefer env var, fall back to default
        const requestedModel = process.env.GEMINI_MODEL || "gemini-pro";
        let model = genAI.getGenerativeModel({ model: requestedModel });

        // Try generating content; if model not found or unsupported, list models and pick a compatible one
        let result;
        try {
          result = await model.generateContent(message);
        } catch (err) {
          console.error(`Gemini model '${requestedModel}' failed:`, err?.message || err);
          if (err && err.status === 404) {
            try {
              if (!fetchLib) throw new Error('No fetch implementation available to list models');
              const resp = await fetchLib('https://generativelanguage.googleapis.com/v1beta/models', {
                headers: { 'x-goog-api-key': process.env.GEMINI_API_KEY },
              });
              const listJson = await resp.json();
              const candidates = listJson?.models || [];

              const compatible = candidates.find((m) => {
                const name = m?.name || m?.model || "";
                const methods = m?.supportedMethods || m?.supported_generation_methods || m?.supportedGenerationMethods || m?.methods || m?.capabilities;
                if (Array.isArray(methods)) return methods.includes("generateContent") || methods.includes("generate") || methods.includes("generateText");
                return /bison|gemini|chat|gpt/i.test(name);
              });

              if (compatible) {
                const fallbackName = compatible.name || compatible.model;
                console.info(`Falling back to model: ${fallbackName}`);
                model = genAI.getGenerativeModel({ model: fallbackName });
                result = await model.generateContent(message);
              } else {
                throw new Error("No compatible generative model found in ListModels response");
              }
            } catch (listErr) {
              console.error("Error listing/falling back to models:", listErr?.message || listErr);
              throw listErr;
            }
          } else {
            throw err;
          }
        }

        const aiText = result.response?.text ? result.response.text() : (result?.text || "");

    // Save Bot message
    await AiChat.create({ user: userId, role: 'model', message: aiText });

    // Matches your frontend 'data.response'
    res.status(200).json({ success: true, response: aiText });

  } catch (error) {
    console.error("Gemini Error:", error);
    res.status(500).json({ success: false, error: "AI Error" });
  }
};

exports.getChatHistory = async (req, res) => {
  try {
    // Matches your frontend 'response.data.history'
    const history = await AiChat.find({ user: req.user.id }).sort({ timestamp: 1 });
    res.status(200).json({ success: true, history });
  } catch (error) {
    res.status(500).json({ success: false, error: "History Error" });
  }
};