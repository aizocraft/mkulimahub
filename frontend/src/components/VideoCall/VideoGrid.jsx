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
      console.log('Remote stream tracks:', remoteStream.getTracks().map(t => `${t.kind}: ${t.label} (${t.readyState}, enabled: ${t.enabled})`));
      console.log('Remote stream active:', remoteStream.active);
      console.log('Remote stream id:', remoteStream.id);

      const video = remoteVideoRef.current;
      console.log('Video element before assignment:', {
        srcObject: video.srcObject,
        readyState: video.readyState,
        networkState: video.networkState,
        paused: video.paused,
        muted: video.muted
      });

      // Clear any existing srcObject first
      video.srcObject = null;

      // Small delay to ensure cleanup, then assign stream and attempt play
      setTimeout(async () => {
        video.srcObject = remoteStream;

        console.log('Video element after assignment:', {
          srcObject: video.srcObject,
          readyState: video.readyState,
          networkState: video.networkState,
          paused: video.paused,
          muted: video.muted
        });

        // Force load the video
        video.load();

        // Now attempt to play
        await attemptPlay();
      }, 50);

      // Force video to load and play
      const attemptPlay = async (force = false) => {
        try {
          // Ensure video is muted for autoplay
          video.muted = true;
          video.volume = 0;

          // Check if video is ready to play
          if (!force && video.readyState < 2) { // HAVE_CURRENT_DATA
            console.log('Video not ready yet, waiting... (readyState:', video.readyState, ')');
            return false;
          }

          console.log('Attempting to play remote video... (readyState:', video.readyState, ')');

          // Try to play
          const playPromise = video.play();

          // Handle the promise
          try {
            await playPromise;
            console.log('✅ Play promise resolved successfully');
          } catch (playError) {
            console.error('❌ Play promise rejected:', playError);
            throw playError; // Re-throw to be caught by outer try-catch
          }

          console.log('✅ Remote video playing successfully');
          console.log('Video element after play:', {
            readyState: video.readyState,
            networkState: video.networkState,
            paused: video.paused,
            currentTime: video.currentTime,
            duration: video.duration,
            videoWidth: video.videoWidth,
            videoHeight: video.videoHeight
          });

          // Double-check that video is actually playing
          setTimeout(() => {
            console.log('Video status check after 1s:', {
              paused: video.paused,
              currentTime: video.currentTime,
              readyState: video.readyState,
              networkState: video.networkState,
              videoWidth: video.videoWidth,
              videoHeight: video.videoHeight
            });
          }, 1000);

          return true;
        } catch (err) {
          console.warn('Could not auto-play remote video in VideoGrid:', err);
          console.warn('Play error details:', {
            name: err.name,
            message: err.message,
            code: err.code
          });

          // If it's a NotAllowedError, we need user interaction
          if (err.name === 'NotAllowedError') {
            console.log('Video play blocked by browser - requires user interaction');
            // Set up a one-time click handler to start video
            const startVideoOnClick = async () => {
              try {
                await video.play();
                console.log('✅ Video started after user interaction');
                document.removeEventListener('click', startVideoOnClick);
              } catch (e) {
                console.warn('Failed to start video after click:', e);
              }
            };
            document.addEventListener('click', startVideoOnClick, { once: true });
          } else {
            // For other errors, try again after a delay
            console.log('Retrying video play in 2 seconds...');
            setTimeout(() => attemptPlay(true), 2000);
          }

          return false;
        }
      };

      // Remove the immediate attemptPlay() call - it will be called after stream assignment

      const onLoadedMetadata = () => {
        console.log('Remote video metadata loaded');
        console.log('Video dimensions:', video.videoWidth, 'x', video.videoHeight);
        // Only attempt play if video is ready
        if (video.readyState >= 2) {
          attemptPlay();
        }
      };

      const onCanPlay = () => {
        console.log('Remote video can play');
        console.log('Video dimensions:', video.videoWidth, 'x', video.videoHeight);
        attemptPlay();
      };

      const onError = (e) => {
        console.error('Remote video error:', e);
        console.error('Error details:', {
          code: e.target?.error?.code,
          message: e.target?.error?.message
        });
      };

      const onLoadStart = () => console.log('Remote video load start');
      const onLoadedData = () => console.log('Remote video data loaded');
      const onPlaying = () => console.log('Remote video playing');
      const onPause = () => console.log('Remote video paused');
      const onWaiting = () => console.log('Remote video waiting');
      const onStalled = () => console.log('Remote video stalled');

      video.addEventListener('loadedmetadata', onLoadedMetadata);
      video.addEventListener('canplay', onCanPlay);
      video.addEventListener('error', onError);
      video.addEventListener('loadstart', onLoadStart);
      video.addEventListener('loadeddata', onLoadedData);
      video.addEventListener('playing', onPlaying);
      video.addEventListener('pause', onPause);
      video.addEventListener('waiting', onWaiting);
      video.addEventListener('stalled', onStalled);

      // Cleanup function to remove listeners if component unmounts
      return () => {
        video.removeEventListener('loadedmetadata', onLoadedMetadata);
        video.removeEventListener('canplay', onCanPlay);
        video.removeEventListener('error', onError);
        video.removeEventListener('loadstart', onLoadStart);
        video.removeEventListener('loadeddata', onLoadedData);
        video.removeEventListener('playing', onPlaying);
        video.removeEventListener('pause', onPause);
        video.removeEventListener('waiting', onWaiting);
        video.removeEventListener('stalled', onStalled);
      };
    } else if (!remoteStream && remoteVideoRef.current) {
      console.log('Clearing remote video element');
      remoteVideoRef.current.srcObject = null;
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
            muted
            playsInline
            controls={false}
            disablePictureInPicture
            className="w-full h-full object-cover bg-black"
            style={{
              minHeight: '200px',
              pointerEvents: 'none'
            }}
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
