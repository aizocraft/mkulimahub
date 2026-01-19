// src/components/VideoCall/VideoCallContainer.jsx
import React, { useState, useEffect } from 'react';
import useVideoCall from '../../hooks/useVideoCall';
import useChat from '../../hooks/useChat';
import VideoGrid from './VideoGrid';
import VideoCallControls from './VideoCallControls';
import ChatContainer from '../Chat/ChatContainer';
import CallNotification from './CallNotification';

const VideoCallContainer = ({ consultation, user, onEndCall }) => {
  const [showChat, setShowChat] = useState(true);
  const [incomingCall, setIncomingCall] = useState(null);
  
  const {
    // Video call state
    localStream,
    remoteStream,
    screenStream,
    isCallActive,
    isConnecting,
    isMuted,
    isVideoOff,
    isScreenSharing,
    callDuration,
    error,
    roomInfo,
    connectedUsers,
    
    // Refs
    localVideoRef,
    remoteVideoRef,
    screenVideoRef,
    
    // Functions
    startVideoCall,
    endCall,
    toggleAudio,
    toggleVideo,
    startScreenShare,
    stopScreenShare,
  } = useVideoCall(consultation?._id, user);

  const chat = useChat(consultation?._id, user);

  // Handle incoming call notifications
  useEffect(() => {
    const handleIncomingCall = (data) => {
      if (data.consultationId === consultation?._id) {
        setIncomingCall({
          callerName: data.callerName,
          timestamp: data.timestamp,
        });
      }
    };

    // You'll need to setup socket listener for incoming calls
    // socketService.on('notification:incoming-call', handleIncomingCall);

    return () => {
      // socketService.off('notification:incoming-call', handleIncomingCall);
    };
  }, [consultation?._id]);

  // Start call when consultation is accepted
  useEffect(() => {
    if (consultation?.status === 'accepted' && !isCallActive && !isConnecting) {
      // Auto-start or show start button based on your logic
    }
  }, [consultation, isCallActive, isConnecting]);

  // Handle call end
  const handleEndCall = () => {
    endCall();
    if (onEndCall) onEndCall();
  };

  // Handle incoming call response
  const handleAcceptCall = () => {
    setIncomingCall(null);
    startVideoCall();
  };

  const handleRejectCall = () => {
    setIncomingCall(null);
    // Notify caller that call was rejected
  };

  if (error) {
    return (
      <div className="video-call-error">
        <div className="error-message">{error}</div>
        <button onClick={() => window.location.reload()}>Reload</button>
      </div>
    );
  }

  return (
    <div className="video-call-container">
      {/* Incoming call notification */}
      {incomingCall && (
        <CallNotification
          callerName={incomingCall.callerName}
          onAccept={handleAcceptCall}
          onReject={handleRejectCall}
        />
      )}

      {/* Connecting state */}
      {isConnecting && (
        <div className="connecting-overlay">
          <div className="spinner"></div>
          <p>Connecting to video call...</p>
        </div>
      )}

      {/* Main video call interface */}
      <div className="video-call-main">
        <div className={`video-section ${showChat ? 'with-chat' : 'full-width'}`}>
          <VideoGrid
            localStream={localStream}
            remoteStream={remoteStream}
            screenStream={screenStream}
            localVideoRef={localVideoRef}
            remoteVideoRef={remoteVideoRef}
            screenVideoRef={screenVideoRef}
            connectedUsers={connectedUsers}
            isScreenSharing={isScreenSharing}
            callDuration={callDuration}
            user={user}
          />
          
          <VideoCallControls
            isCallActive={isCallActive}
            isMuted={isMuted}
            isVideoOff={isVideoOff}
            isScreenSharing={isScreenSharing}
            onToggleAudio={toggleAudio}
            onToggleVideo={toggleVideo}
            onScreenShare={startScreenShare}
            onStopScreenShare={stopScreenShare}
            onEndCall={handleEndCall}
            onToggleChat={() => setShowChat(!showChat)}
            showChat={showChat}
            canStartCall={consultation?.status === 'accepted' && !isCallActive}
            onStartCall={startVideoCall}
          />
        </div>

        {/* Chat panel */}
        {showChat && (
          <div className="chat-section">
            <ChatContainer
              messages={chat.messages}
              onSendMessage={chat.sendMessage}
              onTyping={chat.handleTyping}
              typingUsers={chat.typingUsers}
              messagesEndRef={chat.messagesEndRef}
              user={user}
            />
          </div>
        )}
      </div>

      {/* Call info */}
      <div className="call-info">
        <div className="call-status">
          {isCallActive ? 'Call in progress' : 'Ready to call'}
        </div>
        <div className="call-participants">
          {connectedUsers.length > 0 ? (
            <span>
              {connectedUsers.length + 1} participant{connectedUsers.length + 1 > 1 ? 's' : ''}
            </span>
          ) : (
            <span>Waiting for participants...</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoCallContainer;