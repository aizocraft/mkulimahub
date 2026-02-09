// src/components/Chat/ChatTypingIndicator.jsx
import React from 'react';

const ChatTypingIndicator = ({ typingUsers, currentUserId }) => {
  // Filter out current user and get names of typing users
  const otherTypingUsers = typingUsers?.filter(
    user => user.userId !== currentUserId
  );

  if (!otherTypingUsers?.length) return null;

  const names = otherTypingUsers.map(user => user.userName).join(', ');
  const isMultiple = otherTypingUsers.length > 1;
  
  return (
    <div className="typing-indicator">
      <div className="typing-dots">
        <span className="dot" />
        <span className="dot" />
        <span className="dot" />
      </div>
      <span className="typing-text">
        {isMultiple ? `${names} are typing...` : `${names} is typing...`}
      </span>
    </div>
  );
};

export default ChatTypingIndicator;