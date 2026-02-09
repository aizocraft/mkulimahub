// src/components/VideoCall/VideoCallControls.jsx - UPDATED
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
  onStartCall,
  isCallEstablished
}) => {
  return (
    <div className="video-call-controls p-4 bg-gray-800 border-t border-gray-700">
      {/* Call status indicator */}
      {isCallActive && (
        <div className="call-status-indicator mb-3 flex items-center justify-center">
          <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-2 ${
            isCallEstablished 
              ? 'bg-green-900/30 text-green-400' 
              : 'bg-yellow-900/30 text-yellow-400'
          }`}>
            {isCallEstablished ? (
              <>
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span>Connected</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
                <span>Connecting...</span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Start call button (if not active) */}
      {!isCallActive && canStartCall && (
        <div className="flex justify-center">
          <button
            className="control-btn start-call-btn px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2"
            onClick={onStartCall}
            title="Start Video Call"
          >
            <span className="btn-icon text-xl">🎥</span>
            <span className="btn-text font-medium">Start Video Call</span>
          </button>
        </div>
      )}

      {/* Active call controls */}
      {isCallActive && (
        <div className="flex flex-wrap items-center justify-center gap-3">
          {/* Audio toggle */}
          <button
            className={`control-btn px-4 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-2 ${
              isMuted 
                ? 'bg-red-900/30 text-red-400 hover:bg-red-900/40' 
                : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
            }`}
            onClick={onToggleAudio}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            <span className="btn-icon text-lg">
              {isMuted ? '🔇' : '🎤'}
            </span>
            <span className="btn-text text-sm">
              {isMuted ? 'Unmute' : 'Mute'}
            </span>
          </button>

          {/* Video toggle */}
          <button
            className={`control-btn px-4 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-2 ${
              isVideoOff 
                ? 'bg-red-900/30 text-red-400 hover:bg-red-900/40' 
                : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
            }`}
            onClick={onToggleVideo}
            title={isVideoOff ? 'Turn video on' : 'Turn video off'}
          >
            <span className="btn-icon text-lg">
              {isVideoOff ? '📷❌' : '📷'}
            </span>
            <span className="btn-text text-sm">
              {isVideoOff ? 'Video Off' : 'Video On'}
            </span>
          </button>

          {/* Screen share toggle */}
          <button
            className={`control-btn px-4 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-2 ${
              isScreenSharing 
                ? 'bg-blue-900/30 text-blue-400 hover:bg-blue-900/40' 
                : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
            }`}
            onClick={isScreenSharing ? onStopScreenShare : onScreenShare}
            title={isScreenSharing ? 'Stop screen share' : 'Share screen'}
          >
            <span className="btn-icon text-lg">
              {isScreenSharing ? '🖥️❌' : '🖥️'}
            </span>
            <span className="btn-text text-sm">
              {isScreenSharing ? 'Stop Share' : 'Share Screen'}
            </span>
          </button>

          {/* Chat toggle */}
          <button
            className={`control-btn px-4 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-2 ${
              showChat 
                ? 'bg-purple-900/30 text-purple-400 hover:bg-purple-900/40' 
                : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
            }`}
            onClick={onToggleChat}
            title={showChat ? 'Hide chat' : 'Show chat'}
          >
            <span className="btn-icon text-lg">
              {showChat ? '💬❌' : '💬'}
            </span>
            <span className="btn-text text-sm">
              {showChat ? 'Hide Chat' : 'Show Chat'}
            </span>
          </button>

          {/* End call button */}
          <button
            className="control-btn px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2"
            onClick={onEndCall}
            title="End call"
          >
            <span className="btn-icon text-lg">📞❌</span>
            <span className="btn-text font-medium">End Call</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default VideoCallControls;