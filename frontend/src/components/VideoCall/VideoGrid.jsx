// src/components/VideoCall/VideoGrid.jsx
import React from 'react';

const VideoGrid = ({
  localStream,
  remoteStream,
  screenStream,
  localVideoRef,
  remoteVideoRef,
  screenVideoRef,
  connectedUsers,
  isScreenSharing,
  callDuration,
  user
}) => {
  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="video-grid">
      {/* Call duration */}
      <div className="call-duration">
        <span className="timer">{formatDuration(callDuration)}</span>
      </div>

      {/* Local video */}
      <div className="video-tile local-video">
        <video
          ref={localVideoRef}
          autoPlay
          muted
          playsInline
          className="video-element"
        />
        <div className="video-overlay">
          <span className="user-name">You ({user?.name})</span>
          {!localStream && (
            <div className="video-placeholder">
              <div className="placeholder-icon">👤</div>
              <span>Camera off</span>
            </div>
          )}
        </div>
      </div>

      {/* Remote video */}
      {remoteStream ? (
        <div className="video-tile remote-video">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="video-element"
          />
          <div className="video-overlay">
            <span className="user-name">
              {connectedUsers.find(u => u.userId !== user?.id)?.userName || 'Participant'}
            </span>
          </div>
        </div>
      ) : (
        <div className="video-tile waiting">
          <div className="waiting-content">
            <div className="waiting-icon">⏳</div>
            <p>Waiting for participant to join...</p>
          </div>
        </div>
      )}

      {/* Screen share */}
      {isScreenSharing && screenStream && (
        <div className="video-tile screen-share">
          <video
            ref={screenVideoRef}
            autoPlay
            playsInline
            className="video-element"
          />
          <div className="video-overlay">
            <span className="screen-label">Screen Share</span>
          </div>
        </div>
      )}

      {/* Connected users list (for more than 2 participants) */}
      {connectedUsers.length > 1 && (
        <div className="participants-list">
          <h4>Participants ({connectedUsers.length + 1})</h4>
          <ul>
            <li key={user?.id}>
              <span className="you">You</span> ({user?.name})
            </li>
            {connectedUsers.map(participant => (
              <li key={participant.userId}>
                {participant.userName} {participant.userId !== user?.id && '(remote)'}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default VideoGrid;