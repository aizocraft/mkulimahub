// src/components/VideoCall/VideoCallModal.jsx
import React, { useState, useEffect } from 'react';
import { apiUtils } from '../../api';
import { X, Video, Copy, ExternalLink, MessageCircle, Minimize2 } from 'lucide-react';
import ChatContainer from '../Chat/ChatContainer';
import useChat from '../../hooks/useChat';
import { useTheme } from '../../context/ThemeContext';

const VideoCallModal = ({ consultation, user, isOpen, onClose, onEndCall }) => {
  const [browserSupport, setBrowserSupport] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showChat, setShowChat] = useState(false);
  
  // Use theme context for light/dark mode
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Chat hook for consultation chat
  const chat = useChat(consultation?._id, user);

  useEffect(() => {
    // Check browser support
    const support = apiUtils.videoCall.checkBrowserSupport();
    setBrowserSupport(support);
    
    if (!support.allSupported) {
      console.warn(support.message);
    }
  }, [consultation]);

  // Get meeting info from consultation
  const meetingId = consultation?.meetingId;
  const meetingLink = consultation?.meetingLink;

  // Copy meeting link to clipboard
  const copyMeetingLink = () => {
    if (meetingLink) {
      navigator.clipboard.writeText(meetingLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Open meeting link in new tab
  const openMeetingLink = () => {
    if (meetingLink) {
      window.open(meetingLink, '_blank');
    }
  };

  if (!isOpen) return null;

  // Theme-aware classes
  const themeClasses = {
    modalBg: isDark 
      ? 'bg-gradient-to-br from-gray-900 to-gray-800' 
      : 'bg-gradient-to-br from-white to-gray-50',
    modalBorder: isDark ? 'border-gray-700/50' : 'border-gray-200',
    headerBg: isDark 
      ? 'bg-gradient-to-r from-gray-800/80 to-gray-900/80' 
      : 'bg-gradient-to-r from-gray-100/80 to-white/80',
    headerBorder: isDark ? 'border-gray-700/30' : 'border-gray-200/50',
    titleText: isDark ? 'text-white' : 'text-gray-900',
    subtitleText: isDark ? 'text-gray-400' : 'text-gray-600',
    cardBg: isDark 
      ? 'from-emerald-900/60 to-teal-900/60' 
      : 'from-emerald-50 to-teal-50',
    cardBorder: isDark ? 'border-emerald-500/30' : 'border-emerald-200',
    cardText: isDark ? 'text-white' : 'text-gray-900',
    cardSubtext: isDark ? 'text-emerald-400' : 'text-emerald-600',
    cardCodeBg: isDark ? 'bg-black/50' : 'bg-black/10',
    cardCodeText: isDark ? 'text-emerald-300' : 'text-emerald-700',
    cardCodeBorder: isDark ? 'border-emerald-500/30' : 'border-emerald-300/30',
    buttonSecondary: isDark 
      ? 'bg-gray-700/50 hover:bg-gray-600/50 text-white border-gray-600/30 hover:border-gray-500' 
      : 'bg-gray-100/50 hover:bg-gray-200/50 text-gray-700 border-gray-200 hover:border-gray-300',
    tipText: isDark ? 'text-gray-300' : 'text-gray-600',
    chatHeaderBg: isDark 
      ? 'bg-gray-800/50 hover:bg-gray-800/70' 
      : 'bg-gray-100/50 hover:bg-gray-200/50',
    chatHeaderBorder: isDark ? 'border-gray-700/30' : 'border-gray-200/50',
    chatContainerBg: isDark 
      ? 'bg-gray-900/50' 
      : 'bg-gray-50/50',
    chatContainerBorder: isDark ? 'border-gray-700/30' : 'border-gray-200/30',
    closeButton: isDark 
      ? 'text-gray-400 hover:text-white hover:bg-gray-700/50' 
      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100',
  };

  // Dynamic height classes based on chat state
  const modalHeightClass = showChat 
    ? 'md:max-h-[95vh] h-[auto] min-h-[60vh]' 
    : 'md:max-h-[70vh] h-[auto] min-h-[50vh]';

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <div 
        className={`
          w-full md:rounded-2xl md:max-w-5xl 
          overflow-hidden flex flex-col shadow-2xl 
          border ${themeClasses.modalBorder}
          ${themeClasses.modalBg}
          transition-all duration-300 ease-in-out
          ${modalHeightClass}
        `}
      >
        {/* Header - Sleek & Modern */}
        <div className={`
          flex items-center justify-between px-4 sm:px-6 py-4 
          ${themeClasses.headerBg} 
          border-b ${themeClasses.headerBorder}
          backdrop-blur-sm transition-all duration-300
        `}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Video size={20} className="text-white" />
            </div>
            <div>
              <h2 className={`text-lg sm:text-xl font-bold tracking-tight ${themeClasses.titleText}`}>
                {consultation?.topic}
              </h2>
              <p className={`text-xs sm:text-sm flex items-center gap-1 ${themeClasses.subtitleText}`}>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Expert: {consultation?.expert?.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition-all duration-200 group ${themeClasses.closeButton}`}
          >
            <X size={20} className="transition-colors" />
          </button>
        </div>

        {/* Meeting Card - Premium Design */}
        <div className={`
          mx-4 sm:mx-6 mt-4 p-4 sm:p-5 
          bg-gradient-to-r ${themeClasses.cardBg}
          rounded-xl border ${themeClasses.cardBorder}
          shadow-lg shadow-emerald-500/10 transition-all duration-300
        `}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
                <Video size={24} className="text-white" />
              </div>
              <div>
                <h3 className={`${themeClasses.cardText} font-semibold text-lg`}>Video Consultation</h3>
                {meetingId ? (
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`${themeClasses.cardSubtext} text-xs uppercase tracking-wider`}>Meeting ID</span>
                    <code className={`${themeClasses.cardCodeBg} px-2 py-1 rounded-lg ${themeClasses.cardCodeText} font-mono text-sm border ${themeClasses.cardCodeBorder}`}>
                      {meetingId}
                    </code>
                  </div>
                ) : (
                  <p className="text-yellow-500/80 text-sm mt-1">Preparing your meeting...</p>
                )}
              </div>
            </div>
            
            {meetingLink && (
              <div className="flex gap-2">
                <button
                  onClick={copyMeetingLink}
                  className={`
                    flex items-center gap-2 px-3 py-2.5 
                    rounded-xl transition-all duration-200 text-sm font-medium border
                    ${themeClasses.buttonSecondary}
                  `}
                >
                  <Copy size={16} className={copied ? 'text-emerald-400' : ''} />
                  <span className="hidden sm:inline">{copied ? 'Copied!' : 'Copy Link'}</span>
                  <span className="sm:hidden">{copied ? '✓' : 'Copy'}</span>
                </button>
                <button
                  onClick={openMeetingLink}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white rounded-xl transition-all duration-200 text-sm font-semibold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transform hover:scale-[1.02]"
                >
                  <ExternalLink size={16} />
                  <span>Join Call</span>
                </button>
              </div>
            )}
          </div>
          
          {/* Tip & Open Chat Button Row */}
          <div className="mt-4 pt-4 border-t border-emerald-500/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className={`${themeClasses.tipText} text-xs sm:text-sm leading-relaxed`}>
              <span className={`${themeClasses.cardSubtext} font-medium`}>💡 Tip:</span> Click "Join Call" to open the video meeting. 
              Message your {consultation?.expert?.role === 'expert' ? 'farmer' : 'expert'} while on the call.
            </p>
            {!showChat && (
              <button
                onClick={() => setShowChat(true)}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-400 hover:to-purple-500 text-white rounded-xl transition-all duration-200 text-sm font-medium shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transform hover:scale-[1.02] whitespace-nowrap"
              >
                <MessageCircle size={16} />
                <span>Open Chat</span>
              </button>
            )}
          </div>
        </div>

        {/* Chat Section - Dynamic height with smooth transition */}
        <div 
          className={`
            flex-1 flex flex-col min-h-0 mt-4 mx-4 sm:mx-6 mb-4
            transition-all duration-300 ease-in-out overflow-hidden
            ${showChat ? 'opacity-100 max-h-[500px]' : 'opacity-0 max-h-0'}
          `}
        >
          {/* Chat Header */}
          <div 
            className={`
              flex items-center justify-between px-4 py-3 
              rounded-t-xl border cursor-pointer transition-all duration-200
              ${themeClasses.chatHeaderBg} ${themeClasses.chatHeaderBorder}
              ${showChat ? 'opacity-100' : 'opacity-0 pointer-events-none'}
            `}
            onClick={() => setShowChat(!showChat)}
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <MessageCircle size={16} className="text-white" />
              </div>
              <span className={`${themeClasses.titleText} font-medium`}>Chat</span>
              <span className={themeClasses.subtitleText}>({chat.messages?.length || 0})</span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowChat(false);
              }}
              className="p-2 rounded-lg bg-violet-600 text-white hover:bg-violet-700 transition-all duration-200"
            >
              <Minimize2 size={16} />
            </button>
          </div>

          {/* Chat Container */}
          <div className={`
            flex-1 min-h-0 rounded-b-xl border border-t-0 overflow-hidden
            ${themeClasses.chatContainerBg} ${themeClasses.chatContainerBorder}
            ${showChat ? 'opacity-100' : 'opacity-0 pointer-events-none'}
          `}>
            <ChatContainer
              messages={chat.messages}
              onSendMessage={(content) => chat.sendMessage(content)}
              onTyping={chat.handleTyping}
              typingUsers={chat.typingUsers}
              messagesEndRef={chat.messagesEndRef}
              user={user}
            />
          </div>
        </div>

        {/* Show Chat Toggle Button when chat is hidden */}
        {!showChat && (
          <div className="px-4 sm:px-6 pb-4">
            <button
              onClick={() => setShowChat(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-400 hover:to-purple-500 text-white rounded-xl transition-all duration-200 text-sm font-medium shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transform hover:scale-[1.01]"
            >
              <MessageCircle size={18} />
              <span>Open Chat</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoCallModal;
