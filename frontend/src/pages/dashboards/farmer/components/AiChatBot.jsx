import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, Loader2, Sparkles } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AiChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);
  
  // Use the .env variable you provided
  const API_URL = import.meta.env.VITE_API_URL;

  // Helper to attach JWT Token for 401 fix
  const getHeaders = () => {
    const token = localStorage.getItem('token'); 
    return {
      headers: { Authorization: `Bearer ${token}` }
    };
  };

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
          text: "Jambo! I'm AgriAI. Ask me about crop diseases, fertilizers, or market prices.", 
          sender: 'bot', 
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
        }]);
      }
    } catch (err) {
      // If 401, don't crash, just show greeting
      setMessages([{ text: "Welcome! Please ask me any farming question.", sender: 'bot', time: 'Now' }]);
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
      const { data } = await axios.post(`${API_URL}/ai/chat`, { message: currentInput }, getHeaders());
      setMessages(prev => [...prev, { 
        text: data.response, 
        sender: 'bot', 
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      }]);
    } catch (error) {
      toast.error("AI is unavailable. Please check your login session.");
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[999]">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-4 rounded-full shadow-2xl transition-all duration-300 ${
          isOpen ? 'bg-red-500 rotate-90' : 'bg-emerald-600 hover:scale-105'
        } text-white`}
      >
        {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
      </button>

      {isOpen && (
        <div className="absolute bottom-20 right-0 w-[350px] sm:w-[400px] h-[550px] flex flex-col bg-white dark:bg-gray-900 rounded-2xl shadow-3xl border border-gray-100 dark:border-gray-800 overflow-hidden animate-in slide-in-from-bottom-2">
          {/* Header */}
          <div className="p-4 bg-emerald-600 dark:bg-emerald-900 text-white flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg"><Bot size={20} /></div>
            <div>
              <h3 className="font-bold text-sm flex items-center gap-1">AgriAI Expert <Sparkles size={12}/></h3>
              <p className="text-[10px] opacity-70">Always Active</p>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-950">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-4 py-2 rounded-2xl text-sm ${
                  m.sender === 'user' 
                  ? 'bg-emerald-600 text-white rounded-br-none' 
                  : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border dark:border-gray-700 rounded-bl-none'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <Loader2 size={18} className="animate-spin text-emerald-500" />
              </div>
            )}
            <div ref={scrollRef} />
          </div>

          {/* Footer */}
          <form onSubmit={handleSend} className="p-4 bg-white dark:bg-gray-900 border-t dark:border-gray-800 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything..."
              className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-xl outline-none text-sm dark:text-white"
            />
            <button type="submit" disabled={isLoading} className="text-emerald-600 disabled:opacity-30">
              <Send size={20} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AiChatBot;