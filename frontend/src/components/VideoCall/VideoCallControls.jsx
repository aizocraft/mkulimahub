// src/components/VideoCall/VideoCallControls.jsx
import React from 'react';

const VideoCallControls = ({
  isCallActive,
  isMuted,
  isVideoOff,
  isScreenSharing,
  onToggleAudio,
  onToggleVideo,
  onScreenShare,
  onStopScreenShare,
  onEndCall,
  onToggleChat,
  showChat,
  canStartCall,
  onStartCall
}) => {
  return (
    <div className="video-call-controls">
      {/* Start call button (if not active) */}
      {!isCallActive && canStartCall && (
        <button
          className="control-btn start-call-btn"
          onClick={onStartCall}
          title="Start Video Call"
        >
          <span className="btn-icon">🎥</span>
          <span className="btn-text">Start Call</span>
        </button>
      )}

      {/* Active call controls */}
      {isCallActive && (
        <>
          {/* Audio toggle */}
          <button
            className={`control-btn ${isMuted ? 'muted' : ''}`}
            onClick={onToggleAudio}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            <span className="btn-icon">
              {isMuted ? '🔇' : '🎤'}
            </span>
            <span className="btn-text">
              {isMuted ? 'Unmute' : 'Mute'}
            </span>
          </button>

          {/* Video toggle */}
          <button
            className={`control-btn ${isVideoOff ? 'video-off' : ''}`}
            onClick={onToggleVideo}
            title={isVideoOff ? 'Turn video on' : 'Turn video off'}
          >
            <span className="btn-icon">
              {isVideoOff ? '📷❌' : '📷'}
            </span>
            <span className="btn-text">
              {isVideoOff ? 'Video Off' : 'Video On'}
            </span>
          </button>

          {/* Screen share toggle */}
          <button
            className={`control-btn ${isScreenSharing ? 'active' : ''}`}
            onClick={isScreenSharing ? onStopScreenShare : onScreenShare}
            title={isScreenSharing ? 'Stop screen share' : 'Share screen'}
          >
            <span className="btn-icon">
              {isScreenSharing ? '🖥️❌' : '🖥️'}
            </span>
            <span className="btn-text">
              {isScreenSharing ? 'Stop Share' : 'Share Screen'}
            </span>
          </button>

          {/* Chat toggle */}
          <button
            className={`control-btn ${showChat ? 'active' : ''}`}
            onClick={onToggleChat}
            title={showChat ? 'Hide chat' : 'Show chat'}
          >
            <span className="btn-icon">
              {showChat ? '💬❌' : '💬'}
            </span>
            <span className="btn-text">
              {showChat ? 'Hide Chat' : 'Show Chat'}
            </span>
          </button>

          {/* End call button */}
          <button
            className="control-btn end-call-btn"
            onClick={onEndCall}
            title="End call"
          >
            <span className="btn-icon">📞❌</span>
            <span className="btn-text">End Call</span>
          </button>
        </>
      )}

      {/* Additional features */}
      {isCallActive && (
        <div className="additional-controls">
          <button
            className="feature-btn"
            title="Raise hand"
            onClick={() => {/* Handle raise hand */}}
          >
            ✋
          </button>
          <button
            className="feature-btn"
            title="Send reaction"
            onClick={() => {/* Handle reaction */}}
          >
            👍
          </button>
          <button
            className="feature-btn"
            title="Record call"
            onClick={() => {/* Handle recording */}}
          >
            ⏺️
          </button>
        </div>
      )}
    </div>
  );
};

export default VideoCallControls;