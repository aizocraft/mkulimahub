import React from 'react';
import { Check, CheckCheck, User } from 'lucide-react';

const formatTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffHours < 24) {
    return 'Today';
  } else if (diffHours < 48) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  }
};

const ChatMessages = ({ messages, currentUserId, messagesEndRef }) => {
  let lastDate = null;

  return (
    <div className="messages">
      {messages.map((message, index) => {
        const isCurrentUser = message.sender._id === currentUserId;
        const showDate = false; // We'll implement date separators if needed
        const showAvatar = index === 0 || 
          messages[index - 1].sender._id !== message.sender._id ||
          new Date(message.createdAt) - new Date(messages[index - 1].createdAt) > 600000; // 10 minutes

        return (
          <React.Fragment key={message._id}>
            {showDate && (
              <div className="date-separator">
                <span>{formatDate(message.createdAt)}</span>
              </div>
            )}

            <div
              className={`message ${isCurrentUser ? 'sent' : 'received'}`}
              style={{ marginTop: showAvatar ? '16px' : '4px' }}
            >
              {/* Avatar for received messages */}
              {!isCurrentUser && showAvatar && (
                <div className="message-avatar">
                  {message.sender?.profilePicture ? (
                    <img
                      src={message.sender.profilePicture}
                      alt={message.sender.name}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-white">
                      <User size={14} />
                    </div>
                  )}
                </div>
              )}

              <div className="message-content">
                {/* Sender name for received messages */}
                {!isCurrentUser && showAvatar && (
                  <div className="message-sender">
                    {message.sender?.name || 'Unknown User'}
                  </div>
                )}

                <div className={`message-bubble ${isCurrentUser ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}>
                  <div className="message-text">{message.content}</div>
                  <div className="message-time">
                    <span>{formatTime(message.createdAt)}</span>
                    {isCurrentUser && (
                      <span className="ml-1">
                        {message.readBy && message.readBy.length > 1 ? (
                          <CheckCheck size={12} className="text-blue-400" />
                        ) : (
                          <Check size={12} className="text-gray-400" />
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </React.Fragment>
        );
      })}
      
      {/* Empty div for auto-scrolling */}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatMessages;