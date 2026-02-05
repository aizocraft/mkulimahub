import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, Loader2, Sparkles, TestTube } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AiChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const scrollRef = useRef(null);
  
  const API_URL = import.meta.env.VITE_API_URL;

  const getHeaders = () => ({
    headers: { 
      Authorization: `Bearer ${localStorage.getItem('token')}` 
    }
  });

  useEffect(() => {
    if (isOpen && messages.length === 0) fetchHistory();
  }, [isOpen]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const fetchHistory = async () => {
    try {
      const response = await axios.get(`${API_URL}/ai/history`, getHeaders());
      if (response.data?.success && response.data.history?.length > 0) {
        setMessages(response.data.history.map(msg => ({
          text: msg.message,
          sender: msg.role === 'user' ? 'user' : 'bot',
          time: new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        })));
      } else {
        setMessages([{ 
          text: "Hello! I'm your AI assistant powered by Gemini-3-Flash-Preview. How can I help you today?", 
          sender: 'bot', 
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
        }]);
      }
    } catch (err) {
      setMessages([{ 
        text: "Welcome! Please login to continue chatting.", 
        sender: 'bot', 
        time: 'Now' 
      }]);
    }
  };

  // Test connection function
  const testConnection = async () => {
    setIsTesting(true);
    try {
      // Send a simple test message
      const testMessage = "Respond with 'AI is working' if you receive this.";
      const { data } = await axios.post(
        `${API_URL}/ai/chat`, 
        { message: testMessage }, 
        getHeaders()
      );
      
      if (data.success) {
        toast.success("✓ AI Connection Successful!");
        // Show test response
        setMessages(prev => [...prev, { 
          text: "Test: " + testMessage, 
          sender: 'user', 
          time: 'Now' 
        }, { 
          text: data.response, 
          sender: 'bot', 
          time: 'Now' 
        }]);
      }
    } catch (error) {
      console.error("Test failed:", error);
      toast.error("AI Connection Failed. Check API key.");
    } finally {
      setIsTesting(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = { text: input, sender: 'user', time: 'Just now' };
    setMessages(prev => [...prev, userMsg]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      const { data } = await axios.post(
        `${API_URL}/ai/chat`, 
        { message: currentInput }, 
        getHeaders()
      );
      
      if (data.success) {
        setMessages(prev => [...prev, { 
          text: data.response, 
          sender: 'bot', 
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
        }]);
      } else {
        throw new Error(data.error || "Failed");
      }
    } catch (error) {
      console.error("Chat error:", error);
      
      let errorMsg = "AI service error";
      if (error.response?.status === 401) {
        errorMsg = "Please login again";
      } else if (error.response?.data?.error) {
        errorMsg = error.response.data.error;
      }
      
      toast.error(errorMsg);
      
      // Remove failed user message
      setMessages(prev => prev.filter(msg => msg !== userMsg));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[999]">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-4 rounded-full shadow-2xl transition-all duration-300 ${
          isOpen ? 'bg-red-500 rotate-90' : 'bg-blue-600 hover:scale-105'
        } text-white`}
      >
        {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
      </button>

      {isOpen && (
        <div className="absolute bottom-20 right-0 w-[350px] sm:w-[400px] h-[550px] flex flex-col bg-white dark:bg-gray-900 rounded-2xl shadow-3xl border border-gray-100 dark:border-gray-800 overflow-hidden animate-in slide-in-from-bottom-2">
          {/* Header with Test Button */}
          <div className="p-4 bg-blue-600 dark:bg-blue-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg"><Bot size={20} /></div>
              <div>
                <h3 className="font-bold text-sm flex items-center gap-1">
                  Gemini AI 
                  <Sparkles size={12}/>
                  <span className="text-[10px] bg-white/30 px-1 rounded">v3-flash</span>
                </h3>
                <p className="text-[10px] opacity-70">Real-time Assistant</p>
              </div>
            </div>
            <button
              onClick={testConnection}
              disabled={isTesting}
              className="text-xs bg-white/20 hover:bg-white/30 px-2 py-1 rounded flex items-center gap-1 disabled:opacity-50"
              title="Test AI Connection"
            >
              <TestTube size={12} />
              {isTesting ? 'Testing...' : 'Test'}
            </button>
          </div>

          {/* Chat Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-950">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-4 py-2 rounded-2xl text-sm ${
                  m.sender === 'user' 
                  ? 'bg-blue-600 text-white rounded-br-none' 
                  : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border dark:border-gray-700 rounded-bl-none'
                }`}>
                  {m.text}
                  <div className="text-xs opacity-70 mt-1">{m.time}</div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="px-4 py-2 rounded-2xl bg-white dark:bg-gray-800 border dark:border-gray-700">
                  <Loader2 size={18} className="animate-spin text-blue-500" />
                </div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>

          {/* Input Form */}
          <form onSubmit={handleSend} className="p-4 bg-white dark:bg-gray-900 border-t dark:border-gray-800 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..."
              className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-xl outline-none text-sm dark:text-white"
              disabled={isLoading}
            />
            <button 
              type="submit" 
              disabled={isLoading || !input.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-30 text-sm font-medium"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AiChatBot;