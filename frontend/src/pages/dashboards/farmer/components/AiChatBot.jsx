// src/pages/dashboards/farmer/components/AiChatBot.jsx
import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageCircle, 
  X, 
  Send, 
  Bot, 
  User, 
  Loader2,
  Sparkles,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import toast from 'react-hot-toast';

const AiChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Initial greeting
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: 1,
          text: "Hello! I'm your Agri-AI Assistant. I can help you with crop issues, pest identification, farming advice, and connect you to human experts when needed. What's your farming problem today?",
          sender: 'bot',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  }, [isOpen]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 300);
    }
  }, [isOpen]);

  // Sample AI responses based on keywords
  const getAIResponse = (userMessage) => {
    const lowerMessage = userMessage.toLowerCase();
    
    const responses = [
      {
        keywords: ['pest', 'insect', 'bug', 'worm'],
        response: "I see you're dealing with pests. Can you describe the pest or upload a photo? Common solutions include neem oil spray (40ml neem oil + 1L water) or introducing natural predators like ladybugs."
      },
      {
        keywords: ['yellow', 'leaf', 'wilting', 'dying'],
        response: "Yellowing leaves could indicate nutrient deficiency (nitrogen, magnesium) or overwatering. Try a balanced NPK fertilizer (20-20-20) at 1kg per acre, and ensure proper drainage."
      },
      {
        keywords: ['watering', 'irrigation', 'water'],
        response: "Optimal watering depends on crop and soil. Most crops need 1-2 inches per week. Drip irrigation saves 30-50% water. Check soil moisture 2 inches deep before watering."
      },
      {
        keywords: ['fertilizer', 'nutrient', 'npk'],
        response: "For balanced nutrition, use NPK 17:17:17 at 50kg/acre during vegetative stage. For flowering, switch to high potassium (10:10:30). Always do soil testing first."
      },
      {
        keywords: ['price', 'market', 'sell'],
        response: "Current market rates: Wheat ₹2,200/quintal, Rice ₹3,100/quintal, Tomato ₹40/kg. Consider selling through Farmer Producer Organizations (FPOs) for better prices."
      },
      {
        keywords: ['weather', 'rain', 'drought'],
        response: "Check IMD weather alerts. For drought-prone areas, consider drought-resistant varieties: Pearl Millet (ICTP 8203) or Sorghum (CSH 16). Mulching helps retain soil moisture."
      }
    ];

    // Find matching response
    for (const { keywords, response } of responses) {
      if (keywords.some(keyword => lowerMessage.includes(keyword))) {
        return response;
      }
    }

    // Default response
    const defaultResponses = [
      "I understand you're facing farming issues. Could you provide more details about the problem? Include crop type, symptoms, and duration for better assistance.",
      "This sounds serious. Based on your description, I recommend: 1) Take clear photos 2) Check soil pH 3) Monitor for 24 hours 4) If problem persists, book a consultation with our human experts.",
      "I'm analyzing your query. For immediate assistance, you can: • Book free consultation with verified experts • Access our pest identification tool • Download farming guides from resources section."
    ];

    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!inputMessage.trim() || isLoading) return;

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      text: inputMessage,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    // Simulate AI thinking
    setTimeout(() => {
      const aiResponse = {
        id: messages.length + 2,
        text: getAIResponse(inputMessage),
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1000);
  };

  const handleQuickQuestion = (question) => {
    setInputMessage(question);
    // Auto-send after setting
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
  };

  const handleFeedback = (type) => {
    toast.success(`Feedback sent! ${type === 'like' ? '👍' : '👎'}`);
    // In real app, send to backend
  };

  const quickQuestions = [
    "How to treat yellow leaves?",
    "Best fertilizer for tomatoes?",
    "Pest control for cotton?",
    "Watering schedule for rice?"
  ];

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
      >
        <MessageCircle className="w-6 h-6 text-white" />
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center animate-pulse">
          <Sparkles className="w-3 h-3 text-white" />
        </div>
      </button>

      {/* Chat Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-end pb-6 pr-6 sm:pb-8 sm:pr-8">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Chat Container */}
          <div className="relative w-full max-w-md h-[600px] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 dark:border-gray-700">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-900 dark:to-emerald-900/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">Agri-AI Assistant</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Powered by SmartFarm AI</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
              <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                I can help with crop problems, pest identification, and farming advice
              </div>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] rounded-2xl p-3 ${
                    message.sender === 'user'
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-br-none'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-none'
                  }`}>
                    <div className="flex items-center gap-2 mb-1">
                      {message.sender === 'bot' ? (
                        <Bot className="w-4 h-4 text-green-500" />
                      ) : (
                        <User className="w-4 h-4 text-blue-300" />
                      )}
                      <span className="text-xs opacity-75">
                        {message.sender === 'bot' ? 'Agri-AI' : 'You'} • {message.timestamp}
                      </span>
                    </div>
                    <p className="text-sm">{message.text}</p>
                    
                    {message.sender === 'bot' && (
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => handleFeedback('like')}
                          className="p-1 hover:bg-white/20 rounded"
                        >
                          <ThumbsUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleFeedback('dislike')}
                          className="p-1 hover:bg-white/20 rounded"
                        >
                          <ThumbsDown className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl rounded-bl-none p-3">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-green-500" />
                      <span className="text-xs text-gray-500 dark:text-gray-400">Agri-AI is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Questions */}
            {messages.length === 1 && (
              <div className="px-4 pb-2">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Try asking:</p>
                <div className="flex flex-wrap gap-2">
                  {quickQuestions.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickQuestion(question)}
                      className="text-xs px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-colors text-gray-700 dark:text-gray-300"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Describe your farming problem..."
                  className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim() || isLoading}
                  className="px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-all duration-200 flex items-center justify-center"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </form>
              
              {/* Disclaimer */}
              <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-2 text-center">
                AI responses are for guidance only. For serious issues, consult certified experts.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AiChatBot;