import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, Loader2, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import axios from 'axios';
import toast from 'react-hot-toast';

const AiChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
          text: "Hello! I'm your AI assistant powered by Gemini. How can I help you today?", 
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

  // Custom components for markdown rendering - WITHOUT className props
  const MarkdownComponents = {
    // Style headers using inline styles or wrapper divs
    h1: ({node, ...props}) => {
      const { children, ...rest } = props;
      return <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginTop: '0.5rem', marginBottom: '0.25rem' }} {...rest}>{children}</h1>;
    },
    h2: ({node, ...props}) => {
      const { children, ...rest } = props;
      return <h2 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginTop: '0.5rem', marginBottom: '0.25rem' }} {...rest}>{children}</h2>;
    },
    h3: ({node, ...props}) => {
      const { children, ...rest } = props;
      return <h3 style={{ fontSize: '1rem', fontWeight: 'bold', marginTop: '0.5rem', marginBottom: '0.25rem' }} {...rest}>{children}</h3>;
    },
    h4: ({node, ...props}) => {
      const { children, ...rest } = props;
      return <h4 style={{ fontSize: '0.875rem', fontWeight: 'bold', marginTop: '0.25rem', marginBottom: '0.125rem' }} {...rest}>{children}</h4>;
    },
    
    // Style lists with inline styles
    ul: ({node, ...props}) => {
      const { children, ...rest } = props;
      return <ul style={{ listStyleType: 'disc', marginLeft: '1rem', marginTop: '0.25rem', marginBottom: '0.25rem' }} {...rest}>{children}</ul>;
    },
    ol: ({node, ...props}) => {
      const { children, ...rest } = props;
      return <ol style={{ listStyleType: 'decimal', marginLeft: '1rem', marginTop: '0.25rem', marginBottom: '0.25rem' }} {...rest}>{children}</ol>;
    },
    li: ({node, ...props}) => {
      const { children, ...rest } = props;
      return <li style={{ marginBottom: '0.125rem' }} {...rest}>{children}</li>;
    },
    
    // Style emphasis
    strong: ({node, ...props}) => {
      const { children, ...rest } = props;
      return <strong style={{ fontWeight: 'bold', color: '#2563eb' }} {...rest}>{children}</strong>;
    },
    em: ({node, ...props}) => {
      const { children, ...rest } = props;
      return <em style={{ fontStyle: 'italic' }} {...rest}>{children}</em>;
    },
    
    // Style code blocks
    code: ({node, inline, ...props}) => {
      const { children, ...rest } = props;
      if (inline) {
        return <code style={{ backgroundColor: '#e5e7eb', borderRadius: '0.25rem', padding: '0.125rem 0.25rem', fontSize: '0.875rem' }} {...rest}>{children}</code>;
      }
      return <pre style={{ backgroundColor: '#e5e7eb', borderRadius: '0.375rem', padding: '0.5rem', marginTop: '0.5rem', marginBottom: '0.5rem', overflowX: 'auto', fontSize: '0.875rem' }}><code {...rest}>{children}</code></pre>;
    },
    
    // Style blockquotes
    blockquote: ({node, ...props}) => {
      const { children, ...rest } = props;
      return <blockquote style={{ borderLeftWidth: '4px', borderLeftColor: '#3b82f6', paddingLeft: '0.75rem', paddingTop: '0.25rem', paddingBottom: '0.25rem', marginTop: '0.5rem', marginBottom: '0.5rem', backgroundColor: '#eff6ff', borderRadius: '0 0.25rem 0.25rem 0' }} {...rest}>{children}</blockquote>;
    },
    
    // Style paragraphs
    p: ({node, ...props}) => {
      const { children, ...rest } = props;
      return <p style={{ marginBottom: '0.5rem', lineHeight: '1.5' }} {...rest}>{children}</p>;
    },
    
    // Style horizontal rule
    hr: ({node, ...props}) => {
      return <hr style={{ marginTop: '0.75rem', marginBottom: '0.75rem', borderColor: '#d1d5db' }} {...props} />;
    },
  };

  return (
    <div className="fixed bottom-6 right-6 z-[999]">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-4 rounded-full shadow-2xl transition-all duration-500 ease-out ${
          isOpen
            ? 'bg-gradient-to-r from-red-500 to-pink-500 rotate-180 scale-110'
            : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:scale-110 hover:shadow-blue-500/50 hover:shadow-lg'
        } text-white transform`}
      >
        {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
      </button>

      {isOpen && (
        <div className="absolute bottom-20 right-0 w-[350px] sm:w-[400px] h-[550px] flex flex-col bg-white dark:bg-gray-900 rounded-2xl shadow-3xl border border-gray-100 dark:border-gray-800 overflow-hidden animate-in slide-in-from-bottom-2">
          {/* Custom Header */}
          <div className="p-4 bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm border border-white/20">
                <Bot size={20} />
              </div>
              <div>
                <h3 className="font-bold text-lg flex items-center gap-2">
                  Mkulima Hub AI
                  <Sparkles size={16} className="text-yellow-300 animate-pulse"/>
                </h3>
                <p className="text-xs opacity-90">Your Smart Farming Assistant</p>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 rounded-full -translate-y-6 translate-x-6"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full translate-y-4 -translate-x-4"></div>
          </div>

          {/* Chat Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in-50 duration-300`}>
                <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm shadow-md transition-all duration-200 hover:shadow-lg ${
                  m.sender === 'user'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-md shadow-blue-500/20'
                  : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border dark:border-gray-700 rounded-bl-md shadow-gray-200 dark:shadow-gray-800/50'
                }`}>
                  {m.sender === 'user' ? (
                    <div className="whitespace-pre-wrap">{m.text}</div>
                  ) : (
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      components={MarkdownComponents}
                    >
                      {m.text}
                    </ReactMarkdown>
                  )}
                  <div className="text-xs opacity-70 mt-2">{m.time}</div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start animate-in fade-in-50 duration-300">
                <div className="px-4 py-3 rounded-2xl bg-white dark:bg-gray-800 border dark:border-gray-700 shadow-md">
                  <div className="flex items-center gap-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">AI is thinking...</span>
                  </div>
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
              className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-xl outline-none text-sm dark:text-white transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-gray-700 border border-transparent focus:border-blue-300"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 disabled:opacity-30 disabled:cursor-not-allowed text-sm font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
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