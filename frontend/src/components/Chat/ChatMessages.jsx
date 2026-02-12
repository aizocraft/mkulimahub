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
    <div className="messages space-y-4">
      {messages.map((message, index) => {
        const isCurrentUser = message.sender._id === currentUserId;
        const showDate = false; // We'll implement date separators if needed
        const showAvatar = index === 0 ||
          messages[index - 1].sender._id !== message.sender._id ||
          new Date(message.createdAt) - new Date(messages[index - 1].createdAt) > 600000; // 10 minutes

        return (
          <React.Fragment key={message._id}>
            {showDate && (
              <div className="date-separator flex justify-center my-4">
                <span className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-xs font-medium">
                  {formatDate(message.createdAt)}
                </span>
              </div>
            )}

            <div
              className={`message flex gap-3 ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}
              style={{ marginTop: showAvatar ? '16px' : '4px' }}
            >
              {/* Avatar for received messages */}
              {!isCurrentUser && showAvatar && (
                <div className="message-avatar flex-shrink-0">
                  {message.sender?.profilePicture ? (
                    <img
                      src={message.sender.profilePicture}
                      alt={message.sender.name}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white text-sm font-medium">
                      {message.sender?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                  )}
                </div>
              )}

              {/* Spacer for sent messages */}
              {isCurrentUser && showAvatar && (
                <div className="w-8 h-8 flex-shrink-0" />
              )}

              <div className={`message-content flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'} max-w-[75%]`}>
                {/* Sender name for received messages */}
                {!isCurrentUser && showAvatar && (
                  <div className="message-sender text-gray-300 text-sm font-medium mb-1 px-1">
                    {message.sender?.name || 'Unknown User'}
                  </div>
                )}

                <div className={`message-bubble px-4 py-3 rounded-2xl shadow-sm ${
                  isCurrentUser
                    ? 'bg-blue-600 text-white rounded-br-md'
                    : 'bg-gray-700 text-gray-100 rounded-bl-md'
                }`}>
                  <div className="message-text text-sm leading-relaxed break-words">
                    {message.content}
                  </div>
                  <div className={`message-time flex items-center justify-end mt-2 text-xs ${
                    isCurrentUser ? 'text-blue-200' : 'text-gray-400'
                  }`}>
                    <span>{formatTime(message.createdAt)}</span>
                    {isCurrentUser && (
                      <span className="ml-1">
                        {message.readBy && message.readBy.length > 1 ? (
                          <CheckCheck size={12} className="text-blue-300" />
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