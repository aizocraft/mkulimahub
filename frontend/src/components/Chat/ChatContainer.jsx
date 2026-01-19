// src/components/Chat/ChatContainer.jsx
import React, { useState, useEffect, useRef } from 'react';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';
import ChatTypingIndicator from './ChatTypingIndicator';

const ChatContainer = ({
  messages,
  onSendMessage,
  onTyping,
  typingUsers,
  messagesEndRef,
  user
}) => {
  const [inputValue, setInputValue] = useState('');
  const chatContainerRef = useRef();

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (inputValue.trim()) {
      onSendMessage(inputValue);
      setInputValue('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    onTyping();
  };

  return (
    <div className="chat-container">
      {/* Chat header */}
      <div className="chat-header">
        <h3>Chat</h3>
        <div className="chat-info">
          <span className="message-count">{messages.length} messages</span>
        </div>
      </div>

      {/* Messages container */}
      <div className="messages-container" ref={chatContainerRef}>
        <ChatMessages
          messages={messages}
          currentUserId={user?.id}
          messagesEndRef={messagesEndRef}
        />
        
        {/* Typing indicator */}
        <ChatTypingIndicator typingUsers={typingUsers} currentUserId={user?.id} />
      </div>

      {/* Chat input */}
      <ChatInput
        value={inputValue}
        onChange={handleInputChange}
        onKeyPress={handleKeyPress}
        onSend={handleSend}
        placeholder="Type your message here..."
      />
    </div>
  );
};

export default ChatContainer;