// src/components/VideoCall/VideoCallContainer.jsx - FIXED VERSION
import React, { useState, useEffect } from 'react';
import useVideoCall from '../../hooks/useVideoCall';
import useChat from '../../hooks/useChat';
import ChatContainer from '../Chat/ChatContainer';
import VideoGrid from './VideoGrid';
import { Mic, MicOff, Video, VideoOff, Phone, PhoneOff, MessageSquare, X } from 'lucide-react';

const VideoCallContainer = ({ consultation, user, onEndCall }) => {
  const [showChat, setShowChat] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [remoteMuted, setRemoteMuted] = useState(true);

  const {
    localStream,
    remoteStream,
    isCallActive,
    isConnecting,
    isMuted,
    isVideoOff,
    callDuration,
    error,
    roomInfo,
    connectedUsers,
    isCallEstablished,
    waitingMessage,

    localVideoRef,
    remoteVideoRef,

    startVideoCall,
    endCall,
    toggleAudio,
    toggleVideo,
  } = useVideoCall(consultation?._id, user);

  const chat = useChat(consultation?._id, user);



  // Handle responsive design
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Start video call when component mounts (only once, no retry on error)
  const hasAttemptedRef = React.useRef(false);
  useEffect(() => {
    if (
      consultation?._id &&
      user &&
      !isCallActive &&
      !isConnecting &&
      !error &&
      !hasAttemptedRef.current
    ) {
      hasAttemptedRef.current = true;
      console.log('Starting video call from VideoCallContainer...');
      startVideoCall();
    }
  }, [consultation?._id, user, isCallActive, isConnecting, error, startVideoCall]);

  const isMobile = windowWidth < 768;

  // Format call duration
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Error display
  if (error) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-900 p-6">
        <div className="max-w-md w-full bg-gray-800 rounded-xl p-8 text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h3 className="text-white text-xl font-semibold mb-3">Connection Error</h3>
          <p className="text-gray-300 mb-6">{error}</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => {
                hasAttemptedRef.current = false;
                startVideoCall();
              }}
              className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Phone size={20} />
              Try Again
            </button>
            <button
              onClick={() => window.location.reload()}
              className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (isConnecting) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Phone size={24} className="text-blue-500" />
            </div>
          </div>
          <p className="text-white text-lg font-medium mt-6">Setting up video call...</p>
          <p className="text-gray-400 mt-2">Please wait while we connect you</p>
        </div>
      </div>
    );
  }

  // Get room ID safely
  const roomId = roomInfo?.roomId || 'Waiting...';

  return (
    <div className="video-call-container h-full flex flex-col bg-gray-900 relative">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-850 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className={`w-3 h-3 rounded-full ${isCallEstablished ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
          </div>
          <div>
            <h1 className="text-white font-semibold text-lg">
              {consultation?.topic || 'Video Consultation'}
            </h1>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-400">
                {isCallEstablished ? 'Connected' : waitingMessage || 'Ready to connect'}
              </span>
              {isCallActive && (
                <span className="text-blue-400 font-mono bg-blue-900/30 px-2 py-0.5 rounded">
                  {formatDuration(callDuration)}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {connectedUsers.length > 0 && (
            <div className="hidden md:flex items-center gap-2 text-gray-300">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm">
                  {user?.name?.charAt(0) || 'Y'}
                </div>
                {connectedUsers.map((user, index) => (
                  <div key={index} className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-sm">
                    {user.userName?.charAt(0) || 'U'}
                  </div>
                ))}
              </div>
              <span className="text-sm">
                {connectedUsers.length + 1} online
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Waiting banner - compact, doesn't cover video */}
      {isCallActive && !isCallEstablished && waitingMessage && (
        <div className="absolute top-16 left-4 right-4 md:left-1/2 md:right-auto md:-translate-x-1/2 md:w-96 z-10 bg-blue-600/90 backdrop-blur-sm rounded-lg px-4 py-3 flex items-center gap-3">
          <div className="text-2xl animate-pulse">📞</div>
          <div>
            <p className="text-white font-medium text-sm">{waitingMessage}</p>
            <p className="text-blue-100 text-xs">
              {connectedUsers.length > 0 ? 'Establishing connection...' : 'Share this consultation with the other participant'}
            </p>
          </div>
        </div>
      )}

      {/* Main content: video + optional chat */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Video area */}
        <div className={`flex-1 overflow-hidden ${showChat && isMobile ? 'hidden' : ''}`}>
          <VideoGrid
            localStream={localStream}
            remoteStream={remoteStream}
            screenStream={null}
            localVideoRef={localVideoRef}
            remoteVideoRef={remoteVideoRef}
            screenVideoRef={null}
            connectedUsers={connectedUsers}
            isScreenSharing={false}
            callDuration={callDuration}
            user={user}
          />
        </div>

        {/* Chat panel - on right for desktop */}
        {showChat && !isMobile && (
          <div className="w-80 lg:w-96 border-l border-gray-800 flex flex-col bg-gray-800">
            <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
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
        )}
      </div>

      {/* Chat panel - improved mobile design */}
      {showChat && isMobile && (
        <div className="fixed inset-0 z-20 flex flex-col bg-gray-800">
          {/* Chat header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-850">
            <h3 className="text-white font-semibold">Chat</h3>
            <button
              onClick={() => setShowChat(false)}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition-colors"
              aria-label="Close chat"
            >
              <X size={20} />
            </button>
          </div>

          {/* Chat content */}
          <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
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
      )}

      {/* Controls - Always visible overlay */}
      <div className={`border-t border-gray-800 bg-gray-850/95 backdrop-blur-sm ${showChat && isMobile ? 'absolute bottom-0 left-0 right-0 z-30' : ''}`}>
        <div className="max-w-3xl mx-auto p-4">
          <div className="flex items-center justify-center gap-4">
            {/* Audio control */}
            <button
              onClick={toggleAudio}
              className={`p-3 md:p-4 rounded-full transition-all ${
                isMuted
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? (
                <MicOff size={20} className="text-white md:w-6 md:h-6" />
              ) : (
                <Mic size={20} className="text-white md:w-6 md:h-6" />
              )}
            </button>

            {/* Video control */}
            <button
              onClick={toggleVideo}
              className={`p-3 md:p-4 rounded-full transition-all ${
                isVideoOff
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
              title={isVideoOff ? 'Turn video on' : 'Turn video off'}
            >
              {isVideoOff ? (
                <VideoOff size={20} className="text-white md:w-6 md:h-6" />
              ) : (
                <Video size={20} className="text-white md:w-6 md:h-6" />
              )}
            </button>

            {/* End call button */}
            <button
              onClick={endCall}
              className="p-3 md:p-4 rounded-full bg-red-600 hover:bg-red-700 transition-all"
              title="End call"
            >
              <PhoneOff size={20} className="text-white md:w-6 md:h-6" />
            </button>

            {/* Chat toggle */}
            <button
              onClick={() => setShowChat(!showChat)}
              className={`p-3 md:p-4 rounded-full transition-all ${
                showChat
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
              title={showChat ? 'Hide chat' : 'Show chat'}
            >
              <MessageSquare size={20} className="text-white md:w-6 md:h-6" />
            </button>
          </div>

          {/* Call status */}
          <div className="mt-4 text-center">
            <div className="inline-flex items-center gap-2 text-sm text-gray-400">
              <div className={`w-2 h-2 rounded-full ${isCallEstablished ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
              <span>
                {isCallActive
                  ? isCallEstablished
                    ? 'Connected'
                    : waitingMessage || 'Connecting...'
                  : 'Ready to start call'
                }
              </span>
              {isCallActive && (
                <span className="text-blue-400 font-mono">
                  • {formatDuration(callDuration)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCallContainer;