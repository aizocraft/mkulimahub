// src/hooks/useVideoCall.js - COMPLETE FIX
import { useState, useRef, useEffect, useCallback } from 'react';
import { videoCallAPI } from '../api';
import socketService from '../services/socketService';

const useVideoCall = (consultationId, user) => {
  // State
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [error, setError] = useState(null);
  const [roomInfo, setRoomInfo] = useState(null);
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [isCallEstablished, setIsCallEstablished] = useState(false);
  const [isInitiator, setIsInitiator] = useState(false);
  
  // Refs
  const peerConnectionRef = useRef(null);
  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const callIntervalRef = useRef();
  const socketListenersRef = useRef([]);
  const pendingIceCandidatesRef = useRef([]);
  const hasSetRemoteDescriptionRef = useRef(false);
  const isNegotiatingRef = useRef(false);
  const isInitiatorRef = useRef(false);
  const connectedUsersRef = useRef([]);
  const currentRoomIdRef = useRef(null);
  const remoteTracksRef = useRef([]);

  // ========== WEBRTC FUNCTIONS ==========
  const initializeWebRTC = useCallback(() => {
    try {
      console.log('Initializing WebRTC...');
      
      // Enhanced configuration for better connectivity
      const config = {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun2.l.google.com:19302' },
          { urls: 'stun:stun3.l.google.com:19302' }
        ],
        iceCandidatePoolSize: 10,
        iceTransportPolicy: 'all',
        bundlePolicy: 'max-bundle',
        rtcpMuxPolicy: 'require'
      };
      
      const peerConnection = new RTCPeerConnection(config);
      
      // Enhanced logging
      peerConnection.oniceconnectionstatechange = () => {
        console.log('ICE connection state:', peerConnection.iceConnectionState);
      };
      
      peerConnection.onicegatheringstatechange = () => {
        console.log('ICE gathering state:', peerConnection.iceGatheringState);
      };
      
      peerConnection.onsignalingstatechange = () => {
        console.log('Signaling state:', peerConnection.signalingState);
      };
      
      peerConnectionRef.current = peerConnection;
      setupPeerConnectionListeners(peerConnection);
      
      console.log('✅ WebRTC initialized');
      return peerConnection;
      
    } catch (error) {
      console.error('WebRTC initialization failed:', error);
      throw new Error('WebRTC not supported');
    }
  }, []);

  const setupPeerConnectionListeners = useCallback((peerConnection) => {
    peerConnection.onicecandidate = (event) => {
      console.log('ICE candidate generated:', event.candidate ? 'Found' : 'All candidates');
      if (event.candidate && roomInfo?.roomId) {
        // Send ICE candidate to all other users
        connectedUsers.forEach(otherUser => {
          if (otherUser.userId !== user?.id) {
            socketService.sendIceCandidate(roomInfo.roomId, event.candidate, otherUser.userId);
          }
        });
      }
    };

    peerConnection.ontrack = (event) => {
      console.log('🎯 Received remote track:', event.track.kind);
      console.log('Track enabled:', event.track.enabled);
      console.log('Track readyState:', event.track.readyState);

      // Ensure the track is enabled
      event.track.enabled = true;

      // Listen for track state changes
      event.track.onended = () => {
        console.log('Remote track ended:', event.track.kind);
      };

      event.track.onmute = () => {
        console.log('Remote track muted:', event.track.kind);
      };

      event.track.onunmute = () => {
        console.log('Remote track unmuted:', event.track.kind);
      };

      setRemoteStream(prev => {
        let newStream;

        if (prev) {
          // Add track to existing stream and return new stream to trigger re-render
          prev.addTrack(event.track);
          newStream = new MediaStream(prev.getTracks());
          console.log('📝 Added track to existing remote stream');
        } else {
          // Create new stream
          if (event.streams && event.streams[0]) {
            // Ensure all tracks in the stream are enabled
            event.streams[0].getTracks().forEach(track => {
              track.enabled = true;
              console.log(`Enabled track: ${track.kind}`);
            });
            newStream = event.streams[0];
            console.log('📝 Using provided stream from event');
          } else {
            newStream = new MediaStream();
            newStream.addTrack(event.track);
            console.log('📝 Created new MediaStream for remote track');
          }
        }

        console.log('New remote stream tracks:', newStream.getTracks().map(t => `${t.kind}: ${t.label} (${t.readyState}, enabled: ${t.enabled})`));
        return newStream;
      });

      setIsCallEstablished(true);
      console.log('✅ Remote stream established');

      // Notify that we're connected
      if (roomInfo?.roomId) {
        socketService.sendConnectionEstablished(roomInfo.roomId);
      }
    };

    peerConnection.onconnectionstatechange = () => {
      console.log('Peer connection state:', peerConnection.connectionState);
      
      switch (peerConnection.connectionState) {
        case 'connected':
          console.log('✅✅✅ PEER CONNECTION CONNECTED!');
          startCallTimer();
          setIsCallEstablished(true);
          break;
        case 'disconnected':
        case 'failed':
          console.log('❌ Peer connection failed');
          break;
        case 'closed':
          console.log('Peer connection closed');
          break;
      }
    };

    peerConnection.onnegotiationneeded = async () => {
      console.log('Negotiation needed - deferring to manual control');
      // Don't automatically negotiate - let the socket events handle this
      // This prevents premature negotiation before room setup is complete
    };
  }, [roomInfo, connectedUsers, user?.id]);

  const getLocalMediaStream = async () => {
    try {
      console.log('Requesting camera and microphone...');

      // Import videoCallUtils dynamically to avoid circular dependency
      const { videoCallUtils } = await import('../utils/videoCallUtils');
      const constraints = videoCallUtils.getMediaConstraints();

      console.log('Using constraints:', constraints);

      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      console.log('✅ Media access granted');
      console.log('Stream tracks:', stream.getTracks().map(t => `${t.kind}: ${t.label} (${t.readyState})`));

      setLocalStream(stream);

      // Ensure video element is properly set up
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.muted = true;
        localVideoRef.current.volume = 0; // Ensure no audio feedback

        // Force video to play (browsers may require user interaction)
        try {
          await localVideoRef.current.play();
        } catch (playError) {
          console.warn('Could not auto-play local video:', playError);
        }
      }

      return stream;
    } catch (error) {
      console.error('Media access error:', error);
      let errorMessage = 'Camera/microphone access required. ';
      if (error.name === 'NotAllowedError') {
        errorMessage += 'Please allow permissions and refresh the page.';
      } else if (error.name === 'NotFoundError') {
        errorMessage += 'No camera or microphone found.';
      } else if (error.name === 'NotReadableError') {
        errorMessage += 'Camera or microphone is already in use.';
      }
      throw new Error(errorMessage);
    }
  };

  const createAndSendOffer = async (roomIdOverride) => {
    const users = connectedUsersRef.current;
    const roomId = roomIdOverride || roomInfo?.roomId;

    if (!peerConnectionRef.current || !roomId || users.length === 0) {
      console.log('Cannot create offer yet - missing:', {
        pc: !!peerConnectionRef.current,
        room: !!roomId,
        users: users.length,
        roomId: roomId
      });
      return;
    }

    try {
      console.log('Creating WebRTC offer...');

      const offer = await peerConnectionRef.current.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
        voiceActivityDetection: true
      });

      await peerConnectionRef.current.setLocalDescription(offer);
      console.log('✅ Offer created and local description set');

      // Send offer to other user
      const otherUser = users.find(u => u.userId !== user?.id);
      if (otherUser) {
        socketService.sendOffer(roomId, offer, otherUser.userId);
        console.log(`📤 Offer sent to ${otherUser.userName}`);
      }

    } catch (error) {
      console.error('Error creating offer:', error);
    }
  };

  const handleIncomingOffer = async (offerData) => {
    console.log('📨 Received offer from:', offerData.fromUserName);
    
    if (hasSetRemoteDescriptionRef.current) {
      console.log('Already processing an offer, ignoring duplicate');
      return;
    }
    
    hasSetRemoteDescriptionRef.current = true;
    
    try {
      // If we don't have a peer connection yet, create one
      if (!peerConnectionRef.current) {
        await initializeWebRTC();
        
        // Add local tracks if we have them
        if (localStream) {
          localStream.getTracks().forEach(track => {
            peerConnectionRef.current.addTrack(track, localStream);
          });
        }
      }
      
      // Set remote description
      await peerConnectionRef.current.setRemoteDescription(
        new RTCSessionDescription(offerData.offer)
      );
      console.log('✅ Remote description set from offer');
      
      // Process any pending ICE candidates
      pendingIceCandidatesRef.current.forEach(candidate => {
        peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      });
      pendingIceCandidatesRef.current = [];
      
      // Create and send answer
      const answer = await peerConnectionRef.current.createAnswer();
      await peerConnectionRef.current.setLocalDescription(answer);
      console.log('✅ Answer created');
      
      // Send answer back
      socketService.sendAnswer(roomInfo?.roomId, answer, offerData.fromUserId);
      console.log(`📤 Answer sent to ${offerData.fromUserName}`);
      
      hasSetRemoteDescriptionRef.current = false;
      
    } catch (error) {
      console.error('Error handling offer:', error);
      hasSetRemoteDescriptionRef.current = false;
    }
  };

  // ========== SOCKET EVENT HANDLERS ==========
  const setupSocketListeners = useCallback((roomId) => {
    console.log('Setting up socket listeners...');

    // Clear existing listeners
    socketListenersRef.current.forEach(({ event }) => {
      socketService.off(event);
    });
    socketListenersRef.current = [];

    const listeners = [
      {
        event: 'video-call:joined',
        handler: (data) => {
          console.log('✅ Joined room:', data);
          isInitiatorRef.current = data.isInitiator;
          setRoomInfo({
            roomId: data.roomId,
            consultationId: data.consultationId,
            otherUser: data.otherUser
          });
          // Store roomId in ref for immediate use
          currentRoomIdRef.current = data.roomId;
          const users = data.connectedUsers || [];
          connectedUsersRef.current = users;
          setConnectedUsers(users);
          setIsInitiator(data.isInitiator);


        }
      },
      
      {
        event: 'video-call:user-joined',
        handler: (data) => {
          console.log('👤 User joined:', data.userName);
          const newUser = { userId: data.userId, userName: data.userName };
          setConnectedUsers(prev => {
            const exists = prev.find(u => u.userId === data.userId);
            return exists ? prev : [...prev, newUser];
          });
          connectedUsersRef.current = [...connectedUsersRef.current.filter(u => u.userId !== data.userId), newUser];
        }
      },
      
      {
        event: 'video-call:ready',
        handler: (data) => {
          console.log('🎯 Call is ready with', data.users.length, 'users');
          if (isInitiatorRef.current) {
            // Use roomId from event data directly
            const roomId = data.roomId || `consultation_${data.consultationId}`;
            if (roomId) {
              console.log('Creating offer for room:', roomId);

              // Update roomInfo state if not set yet
              if (!roomInfo?.roomId) {
                setRoomInfo({
                  roomId,
                  consultationId: data.consultationId,
                  otherUser: null
                });
              }

              // Store roomId in ref for immediate use
              currentRoomIdRef.current = roomId;

              setTimeout(() => createAndSendOffer(roomId), 500);
            } else {
              console.error('No roomId available in ready event');
            }
          }
        }
      },
      
      {
        event: 'video-call:offer',
        handler: (data) => {
          console.log('📨 Received offer');
          handleIncomingOffer(data);
        }
      },
      
      {
        event: 'video-call:answer',
        handler: async (data) => {
          console.log('📨 Received answer from:', data.fromUserName);
          if (peerConnectionRef.current) {
            try {
              await peerConnectionRef.current.setRemoteDescription(
                new RTCSessionDescription(data.answer)
              );
              console.log('✅ Remote description set from answer');

              // Process any pending ICE candidates
              pendingIceCandidatesRef.current.forEach(candidate => {
                peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate)).catch(error => {
                  console.error('Error adding pending ICE candidate:', error);
                });
              });
              pendingIceCandidatesRef.current = [];
            } catch (error) {
              console.error('Error setting remote description:', error);
            }
          }
        }
      },
      
      {
        event: 'video-call:ice-candidate',
        handler: async (data) => {
          console.log('🧊 Received ICE candidate');
          if (peerConnectionRef.current) {
            try {
              // If we already have a remote description, add the candidate immediately
              if (peerConnectionRef.current.remoteDescription) {
                await peerConnectionRef.current.addIceCandidate(
                  new RTCIceCandidate(data.candidate)
                );
                console.log('✅ ICE candidate added');
              } else {
                // Store for later when we get the remote description
                pendingIceCandidatesRef.current.push(data.candidate);
                console.log('ICE candidate stored for later');
              }
            } catch (error) {
              console.error('Error adding ICE candidate:', error);
            }
          }
        }
      },
      
      {
        event: 'video-call:peer-connected',
        handler: (data) => {
          console.log('✅ Peer connected:', data.userName);
          setIsCallEstablished(true);
        }
      },
      
      {
        event: 'video-call:user-left',
        handler: (data) => {
          console.log('👋 User left:', data.userName);
          setConnectedUsers(prev => prev.filter(u => u.userId !== data.userId));
          if (data.remainingUsers <= 1) {
            setRemoteStream(null);
            setIsCallEstablished(false);
          }
        }
      },
      
      {
        event: 'error',
        handler: (errorData) => {
          console.error('Socket error:', errorData);
          setError(errorData.message || 'Connection error');
        }
      }
    ];
    
    // Register listeners
    listeners.forEach(({ event, handler }) => {
      socketService.on(event, handler);
      socketListenersRef.current.push({ event, handler });
    });
  }, [localStream]);

  // ========== CALL MANAGEMENT ==========
  const startCallTimer = () => {
    clearInterval(callIntervalRef.current);
    callIntervalRef.current = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
  };

  const startVideoCall = async () => {
    try {
      console.log('🚀 Starting video call...');
      setIsConnecting(true);
      setError(null);
      hasSetRemoteDescriptionRef.current = false;
      pendingIceCandidatesRef.current = [];
      isNegotiatingRef.current = false;

      // 1. Get room info
      console.log('Step 1: Getting room info...');
      const response = await videoCallAPI.initiateVideoCall(consultationId);
      const { roomId } = response.data.data;
      console.log('Room ID:', roomId);

      // 2. Get local media
      console.log('Step 2: Getting local media...');
      const stream = await getLocalMediaStream();

      // 3. Initialize WebRTC
      console.log('Step 3: Initializing WebRTC...');
      await initializeWebRTC();

      // 4. Add local tracks
      console.log('Step 4: Adding local tracks...');
      stream.getTracks().forEach(track => {
        peerConnectionRef.current.addTrack(track, stream);
      });

      // 5. Ensure socket is connected, then join room
      console.log('Step 5: Joining socket room...');
      if (!socketService.isSocketConnected()) {
        console.log('Socket not ready, waiting for connection...');
        await socketService.waitForConnection();
      }
      await socketService.joinVideoRoom(consultationId);

      // 6. Setup listeners
      console.log('Step 6: Setting up listeners...');
      setupSocketListeners(roomId);

      console.log('✅ Video call setup complete!');
      setIsCallActive(true);
      setIsConnecting(false);
      
    } catch (error) {
      console.error('❌ Failed to start video call:', error);
      const msg = error?.message || error?.toString?.() || 'Failed to start video call. Check your connection and try again.';
      setError(msg);
      setIsConnecting(false);
      cleanup();
    }
  };

  const cleanup = useCallback(() => {
    console.log('🧹 Cleaning up video call...');

    // Stop timer
    clearInterval(callIntervalRef.current);
    callIntervalRef.current = null;

    // Stop and clear local media streams
    if (localStream) {
      console.log('Stopping local media tracks...');
      localStream.getTracks().forEach(track => {
        console.log(`Stopping track: ${track.kind} (${track.label})`);
        track.stop();
        track.enabled = false;
      });
      setLocalStream(null);
    }

    // Clear remote stream (don't stop remote tracks as they're controlled by the other peer)
    if (remoteStream) {
      console.log('Clearing remote stream...');
      setRemoteStream(null);
    }

    // Clear video elements
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
      console.log('Cleared local video element');
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
      console.log('Cleared remote video element');
    }

    // Close peer connection
    if (peerConnectionRef.current) {
      console.log('Closing peer connection...');
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    // Remove socket listeners
    socketListenersRef.current.forEach(({ event }) => {
      socketService.off(event);
    });
    socketListenersRef.current = [];

    // Reset all state
    setIsCallActive(false);
    setIsCallEstablished(false);
    setRoomInfo(null);
    setConnectedUsers([]);
    setCallDuration(0);
    setIsInitiator(false);
    setIsMuted(false);
    setIsVideoOff(false);

    // Reset refs
    hasSetRemoteDescriptionRef.current = false;
    pendingIceCandidatesRef.current = [];
    isNegotiatingRef.current = false;
    connectedUsersRef.current = [];

    console.log('✅ Video call cleanup complete - camera and microphone should be stopped');
  }, [localStream, remoteStream]);

  const endCall = () => {
    console.log('Ending call...');
    if (roomInfo?.roomId) {
      socketService.endCall(roomInfo.roomId, consultationId);
    }
    cleanup();
  };

  // Remove auto-start - call will be started manually

  // Control functions
  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  // User-friendly waiting message
  const waitingMessage = isCallActive && !isCallEstablished
    ? connectedUsers.length > 0
      ? `Connecting with ${connectedUsers[0]?.userName || 'participant'}...`
      : 'Waiting for the other participant to join...'
    : null;

  return {
    // State
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
    isInitiator,
    waitingMessage,
    
    // Refs
    localVideoRef,
    remoteVideoRef,
    
    // Functions
    startVideoCall,
    endCall,
    toggleAudio,
    toggleVideo,
    cleanup
  };
};

export default useVideoCall;