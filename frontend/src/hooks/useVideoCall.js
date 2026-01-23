// src/hooks/useVideoCall.js - UPDATED with waitingMessage
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
  const [waitingMessage, setWaitingMessage] = useState('');
  
  // Refs
  const peerConnectionRef = useRef(null);
  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const callIntervalRef = useRef();
  const socketListenersRef = useRef([]);

  // ========== SOCKET INITIALIZATION ==========
  useEffect(() => {
    const initializeSocket = () => {
      try {
        const userId = user?.id;
        const token = localStorage.getItem('token') || 'dummy-token';
        
        if (!userId) {
          console.warn('User ID not available');
          return;
        }
        
        if (!socketService.isConnected()) {
          console.log('🔄 Initializing socket for user:', userId);
          socketService.initialize(token, userId);
        }
      } catch (err) {
        console.error('Socket initialization error:', err);
      }
    };

    initializeSocket();
    
    return () => {
      if (isCallActive) {
        endCall();
      }
    };
  }, [user?.id, isCallActive]);

  // ========== WEBRTC FUNCTIONS ==========
  const initializeWebRTC = useCallback(() => {
    try {
      console.log('Initializing WebRTC...');
      
      const config = {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      };
      
      const peerConnection = new RTCPeerConnection(config);
      
      peerConnection.onicecandidate = (event) => {
        if (event.candidate && roomInfo?.roomId) {
          const otherUser = connectedUsers.find(u => u.userId !== user?.id);
          if (otherUser) {
            socketService.sendIceCandidate(roomInfo.roomId, event.candidate, otherUser.userId);
          }
        }
      };

      peerConnection.ontrack = (event) => {
        console.log('🎯 Received remote stream');
        if (event.streams && event.streams[0]) {
          setRemoteStream(event.streams[0]);
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = event.streams[0];
          }
          setIsCallEstablished(true);
          setWaitingMessage('');
        }
      };

      peerConnection.onconnectionstatechange = () => {
        console.log('WebRTC state:', peerConnection.connectionState);
        if (peerConnection.connectionState === 'connected') {
          console.log('✅ WebRTC connected!');
          startCallTimer();
        }
      };

      peerConnectionRef.current = peerConnection;
      console.log('✅ WebRTC initialized');
      
    } catch (error) {
      console.error('WebRTC initialization failed:', error);
      throw new Error('WebRTC not supported');
    }
  }, [roomInfo, connectedUsers, user?.id]);

  const getLocalMediaStream = async () => {
    try {
      console.log('Requesting camera and microphone...');
      
      const constraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true
        },
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      console.log('✅ Media access granted');
      setLocalStream(stream);
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.muted = true;
      }
      
      return stream;
    } catch (error) {
      console.error('Media access error:', error);
      let errorMessage = 'Camera/microphone access required. ';
      if (error.name === 'NotAllowedError') {
        errorMessage += 'Please allow permissions.';
      }
      throw new Error(errorMessage);
    }
  };

  const createAndSendOffer = async () => {
    if (!peerConnectionRef.current || !roomInfo?.roomId || connectedUsers.length === 0) {
      console.log('Cannot create offer yet');
      return;
    }
    
    try {
      console.log('Creating offer...');
      setWaitingMessage('Establishing connection...');
      
      const offer = await peerConnectionRef.current.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      });
      
      await peerConnectionRef.current.setLocalDescription(offer);
      
      const otherUser = connectedUsers.find(u => u.userId !== user?.id);
      if (otherUser) {
        socketService.sendOffer(roomInfo.roomId, offer, otherUser.userId);
        console.log('✅ Offer sent');
      }
    } catch (error) {
      console.error('Error creating offer:', error);
    }
  };

  const handleIncomingOffer = async (offerData) => {
    console.log('📨 Received offer');
    setWaitingMessage('Establishing connection...');
    
    try {
      await peerConnectionRef.current.setRemoteDescription(
        new RTCSessionDescription(offerData.offer)
      );
      
      const answer = await peerConnectionRef.current.createAnswer();
      await peerConnectionRef.current.setLocalDescription(answer);
      
      socketService.sendAnswer(roomInfo?.roomId, answer, offerData.fromUserId);
      console.log('✅ Answer sent');
    } catch (error) {
      console.error('Error handling offer:', error);
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
          setRoomInfo({
            roomId: data.roomId,
            consultationId: data.consultationId
          });
          setConnectedUsers(data.connectedUsers || []);
          
          if (data.isInitiator) {
            if (data.connectedUsers.length > 0) {
              console.log('Other user present, creating offer...');
              setWaitingMessage('Connecting to other participant...');
              setTimeout(() => createAndSendOffer(), 1000);
            } else {
              setWaitingMessage('Waiting for other participant to join...');
            }
          } else if (data.connectedUsers.length > 0) {
            setWaitingMessage('Waiting for connection from other participant...');
          }
        }
      },
      
      {
        event: 'video-call:user-joined',
        handler: (data) => {
          console.log('👤 User joined:', data.userName);
          setConnectedUsers(prev => [...prev, { 
            userId: data.userId, 
            userName: data.userName 
          }]);
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
          console.log('📨 Received answer');
          if (peerConnectionRef.current) {
            try {
              await peerConnectionRef.current.setRemoteDescription(
                new RTCSessionDescription(data.answer)
              );
              console.log('✅ Remote description set');
              setWaitingMessage('Connection established!');
            } catch (error) {
              console.error('Error setting remote description:', error);
            }
          }
        }
      },
      
      {
        event: 'video-call:ice-candidate',
        handler: async (data) => {
          if (peerConnectionRef.current && data.candidate) {
            try {
              await peerConnectionRef.current.addIceCandidate(
                new RTCIceCandidate(data.candidate)
              );
            } catch (error) {
              console.error('Error adding ICE candidate:', error);
            }
          }
        }
      },
      
      {
        event: 'video-call:user-left',
        handler: (data) => {
          console.log('👋 User left');
          setConnectedUsers(prev => prev.filter(u => u.userId !== data.userId));
          setWaitingMessage('Other participant left. Waiting for someone to join...');
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
  }, []);

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
      setWaitingMessage('Initializing...');

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
      initializeWebRTC();

      // 4. Add local tracks
      console.log('Step 4: Adding local tracks...');
      stream.getTracks().forEach(track => {
        peerConnectionRef.current.addTrack(track, stream);
      });

      // 5. Check socket
      console.log('Step 5: Checking socket...');
      if (!socketService.isConnected()) {
        throw new Error('Socket not connected. Please wait and try again.');
      }

      // 6. Join socket room
      console.log('Step 6: Joining socket room...');
      await socketService.joinVideoRoom(consultationId);

      // 7. Setup listeners
      console.log('Step 7: Setting up listeners...');
      setupSocketListeners(roomId);

      console.log('✅ Video call setup complete!');
      setIsCallActive(true);
      setIsConnecting(false);
      
    } catch (error) {
      console.error('❌ Failed to start video call:', error);
      setError(error.message);
      setIsConnecting(false);
      cleanup();
    }
  };

  const cleanup = useCallback(() => {
    console.log('Cleaning up...');
    
    // Stop timer
    clearInterval(callIntervalRef.current);
    callIntervalRef.current = null;
    
    // Stop media streams
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    if (remoteStream) {
      remoteStream.getTracks().forEach(track => track.stop());
    }
    
    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    
    // Remove socket listeners
    socketListenersRef.current.forEach(({ event }) => {
      socketService.off(event);
    });
    socketListenersRef.current = [];
    
    // Reset state
    setIsCallActive(false);
    setIsCallEstablished(false);
    setLocalStream(null);
    setRemoteStream(null);
    setRoomInfo(null);
    setConnectedUsers([]);
    setCallDuration(0);
    setWaitingMessage('');
    
    console.log('✅ Cleanup complete');
  }, [localStream, remoteStream]);

  const endCall = () => {
    console.log('Ending call...');
    if (roomInfo?.roomId) {
      socketService.endCall(roomInfo.roomId, consultationId);
    }
    cleanup();
  };

  // Auto-start call
  useEffect(() => {
    if (consultationId && !isCallActive && !isConnecting) {
      console.log('Auto-starting video call...');
      startVideoCall();
    }
  }, [consultationId]);

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