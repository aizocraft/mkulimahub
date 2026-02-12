// src/hooks/useChat.js
import { useState, useEffect, useRef, useCallback } from 'react';
import { videoCallAPI } from '../api';
import socketService from '../services/socketService';

const useChat = (consultationId, user) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  
  const messagesEndRef = useRef();
  const typingTimeoutRef = useRef();
  const hasJoinedRef = useRef(false);

  // Load previous messages
const loadPreviousMessages = useCallback(async () => {
  try {
    // Use the correct function name
    const response = await videoCallAPI.getConsultationChat(consultationId);
    setMessages(response.data.messages || []);
    
    // Mark messages as read
    const unreadIds = response.data.messages
      .filter(msg => !msg.readBy?.includes(user?.id) && msg.sender._id !== user?.id)
      .map(msg => msg._id);
    
    if (unreadIds.length > 0) {
      try {
        await videoCallAPI.markMessagesAsRead(consultationId, unreadIds);
      } catch (error) {
        console.log('Could not mark messages as read:', error);
        // Fallback: use socket
        socketService.markMessagesAsRead(consultationId, unreadIds);
      }
    }
    
  } catch (error) {
    console.error('Failed to load messages:', error);
    setError('Failed to load chat messages');
  }
}, [consultationId, user?.id]);

  // Join chat room
  const joinChat = useCallback(() => {
    if (!consultationId || !user?.id || hasJoinedRef.current) return;
    
    try {
      socketService.joinChat(consultationId);
      hasJoinedRef.current = true;
      setIsConnected(true);
      
      // Setup chat listeners
      setupChatListeners();
      
      // Load previous messages
      loadPreviousMessages();
      
    } catch (error) {
      console.error('Failed to join chat:', error);
      setError('Failed to join chat');
    }
  }, [consultationId, user?.id, loadPreviousMessages]);

  // Setup socket listeners for chat
  const setupChatListeners = useCallback(() => {
    socketService.on('chat:previous-messages', (data) => {
      setMessages(data.messages || []);
    });

    socketService.on('chat:new-message', (data) => {
      const newMessage = data.message;
      setMessages(prev => [...prev, newMessage]);
      
      // Mark as read if it's not from current user
      if (newMessage.sender._id !== user?.id) {
        videoCallAPI.markMessagesAsRead(consultationId, [newMessage._id]);
        setUnreadCount(prev => prev + 1);
      }
      
      // Scroll to bottom
      scrollToBottom();
    });

    socketService.on('chat:user-joined', (data) => {
      console.log(`${data.userName} joined the chat`);
    });

    socketService.on('chat:user-left', (data) => {
      console.log(`${data.userName} left the chat`);
    });

    socketService.on('chat:typing-indicator', (data) => {
      if (data.userId !== user?.id) {
        setTypingUsers(prev => {
          const existing = prev.find(u => u.userId === data.userId);
          if (existing) {
            return prev.map(u => 
              u.userId === data.userId ? { ...u, isTyping: data.isTyping } : u
            );
          }
          return [...prev, { userId: data.userId, userName: data.userName, isTyping: data.isTyping }];
        });
        
        // Clear typing indicator after 3 seconds
        setTimeout(() => {
          setTypingUsers(prev => prev.filter(u => u.userId !== data.userId || !data.isTyping));
        }, 3000);
      }
    });

    socketService.on('chat:messages-read', (data) => {
      // Update read status for messages
      setMessages(prev => 
        prev.map(msg => 
          data.messageIds.includes(msg._id) 
            ? { ...msg, readBy: [...(msg.readBy || []), data.userId] }
            : msg
        )
      );
    });

    socketService.on('error', (errorData) => {
      console.error('Chat error:', errorData);
      setError(errorData.message || 'Chat error occurred');
    });
  }, [consultationId, user?.id]);

  // Send message - socket handler persists to DB and broadcasts, no need for duplicate API call
  const sendMessage = useCallback(async (content, type = 'text') => {
    if (!content || !content.trim()) return;
    
    try {
      socketService.sendMessage(consultationId, content.trim(), type);
      socketService.typingIndicator(consultationId, false);
      clearTimeout(typingTimeoutRef.current);
    } catch (error) {
      console.error('Failed to send message:', error);
      setError('Failed to send message');
    }
  }, [consultationId]);

  // Handle typing
  const handleTyping = useCallback(() => {
    if (!isTyping) {
      setIsTyping(true);
      socketService.typingIndicator(consultationId, true);
    }
    
    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set timeout to stop typing indicator after 1 second of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socketService.typingIndicator(consultationId, false);
    }, 1000);
  }, [consultationId, isTyping]);

  // Mark messages as read
  const markMessagesAsRead = useCallback(async (messageIds) => {
    try {
      await videoCallAPI.markMessagesAsRead(consultationId, messageIds);
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark messages as read:', error);
    }
  }, [consultationId]);

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Leave chat
  const leaveChat = useCallback(() => {
    if (hasJoinedRef.current) {
      socketService.leaveChat(consultationId);
      hasJoinedRef.current = false;
      setIsConnected(false);
      
      // Remove listeners
      socketService.off('chat:previous-messages');
      socketService.off('chat:new-message');
      socketService.off('chat:user-joined');
      socketService.off('chat:user-left');
      socketService.off('chat:typing-indicator');
      socketService.off('chat:messages-read');
      socketService.off('error');
    }
  }, [consultationId]);

  // Initialize on mount
  useEffect(() => {
    if (consultationId && user?.id) {
      joinChat();
    }
    
    return () => {
      leaveChat();
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [consultationId, user?.id, joinChat, leaveChat]);

  return {
    // State
    messages,
    isTyping,
    typingUsers,
    unreadCount,
    isConnected,
    error,
    
    // Refs
    messagesEndRef,
    
    // Functions
    sendMessage,
    handleTyping,
    markMessagesAsRead,
    scrollToBottom,
    joinChat,
    leaveChat,
    loadPreviousMessages,
  };
};

export default useChat;