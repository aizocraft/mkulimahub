// src/components/VideoCall/VideoGrid.jsx
import React, { useEffect } from 'react';

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

  // Sync streams to video elements
  useEffect(() => {
    if (localStream && localVideoRef.current) {
      console.log('🎥 VideoGrid: Setting local stream to video element');
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteStream && remoteVideoRef.current) {
      console.log('🎥 VideoGrid: Setting remote stream to video element');
      remoteVideoRef.current.srcObject = remoteStream;

      // Wait for metadata to load before attempting to play
      const video = remoteVideoRef.current;
      const onLoadedMetadata = () => {
        video.play().catch(err => {
          console.warn('Could not auto-play remote video in VideoGrid:', err);
        });
        video.removeEventListener('loadedmetadata', onLoadedMetadata);
      };
      video.addEventListener('loadedmetadata', onLoadedMetadata);

      // Cleanup function to remove listener if component unmounts
      return () => {
        video.removeEventListener('loadedmetadata', onLoadedMetadata);
      };
    }
  }, [remoteStream]);

  return (
    <div className="video-grid h-full p-4 md:p-6">
      {/* Call duration */}
      <div className="call-duration absolute top-4 left-4 z-10">
        <span className="timer bg-black/60 text-white px-3 py-1 rounded-lg backdrop-blur-sm">
          {formatDuration(callDuration)}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 h-full">
        {/* Remote video (main) */}
        <div className="relative bg-gray-850 rounded-2xl overflow-hidden min-h-[200px] md:min-h-[300px]">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover bg-black"
            style={{ minHeight: '200px' }}
          />
          {!remoteStream && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-850 min-h-[200px]">
              <div className="text-7xl mb-4 text-gray-600">👤</div>
              <p className="text-gray-400 text-lg font-medium">No one connected yet</p>
              <p className="text-gray-500 text-sm mt-1">Waiting for other participant</p>
            </div>
          )}
          <div className="absolute bottom-4 left-4 bg-black/60 text-white px-4 py-2 rounded-lg backdrop-blur-sm">
            <p className="font-medium">
              {connectedUsers[0]?.userName || 'Remote'}
            </p>
            <p className="text-sm text-gray-300">
              {remoteStream ? 'Connected' : 'Connecting...'}
            </p>
          </div>
        </div>

        {/* Local video (small) */}
        <div className="relative bg-gray-850 rounded-2xl overflow-hidden min-h-[150px] md:min-h-[200px]">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover bg-black"
            style={{ minHeight: '150px' }}
          />
          {!localStream && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-850 min-h-[150px]">
              <div className="text-5xl mb-3 text-gray-600">📷</div>
              <p className="text-gray-400">Camera off</p>
            </div>
          )}

          <div className="absolute top-4 left-4 bg-black/60 text-white px-3 py-1.5 rounded-lg backdrop-blur-sm">
            <p className="font-medium text-sm">You ({user?.name || 'User'})</p>
          </div>

          {/* Status indicators */}
          <div className="absolute top-4 right-4 flex gap-2">
            {localStream && (
              <div className="bg-green-600 text-white p-1.5 rounded-full">
                <span className="text-xs">●</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Screen share */}
      {isScreenSharing && screenStream && (
        <div className="video-tile screen-share mt-4">
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
        <div className="participants-list mt-4 bg-gray-800 rounded-lg p-4">
          <h4 className="text-white font-medium mb-2">Participants ({connectedUsers.length + 1})</h4>
          <ul className="space-y-1">
            <li className="text-gray-300">
              <span className="text-blue-400 font-medium">You</span> ({user?.name})
            </li>
            {connectedUsers.map(participant => (
              <li key={participant.userId} className="text-gray-300">
                {participant.userName}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default VideoGrid;
