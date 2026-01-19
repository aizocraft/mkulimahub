// src/components/Chat/ChatInput.jsx
import React from 'react';
import { Send, Smile, Paperclip } from 'lucide-react';

const ChatInput = ({ value, onChange, onKeyPress, onSend, placeholder }) => {
  return (
    <div className="chat-input-container">
      <div className="chat-input-actions">
        <button className="chat-action-button" type="button">
          <Paperclip size={18} />
        </button>
        <button className="chat-action-button" type="button">
          <Smile size={18} />
        </button>
      </div>
      
      <div className="chat-input-wrapper">
        <textarea
          value={value}
          onChange={onChange}
          onKeyPress={onKeyPress}
          placeholder={placeholder}
          rows="1"
          className="chat-input"
        />
        <button
          onClick={onSend}
          disabled={!value.trim()}
          className={`chat-send-button ${value.trim() ? 'enabled' : 'disabled'}`}
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};

export default ChatInput;