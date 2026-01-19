// src/hooks/useVideoCall.js
import { useState, useRef, useEffect, useCallback } from 'react';
import { videoCallAPI, videoCallUtils } from '../api';
import socketService from '../services/socketService';

const useVideoCall = (consultationId, user) => {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [screenStream, setScreenStream] = useState(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [error, setError] = useState(null);
  const [roomInfo, setRoomInfo] = useState(null);
  const [connectedUsers, setConnectedUsers] = useState([]);
  
  const peerConnectionRef = useRef(null);
  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const screenVideoRef = useRef();
  const callIntervalRef = useRef();
  const dataChannelRef = useRef();

  // Initialize WebRTC
  const initializeWebRTC = useCallback(async () => {
    try {
      const config = await videoCallUtils.getRTCPeerConnectionConfig();
      const peerConnection = new RTCPeerConnection(config);
      
      // Data channel for chat within call
      const dataChannel = peerConnection.createDataChannel('chat');
      dataChannelRef.current = dataChannel;
      
      setupDataChannel(dataChannel);
      
      peerConnectionRef.current = peerConnection;
      setupPeerConnectionListeners(peerConnection);
      
      return peerConnection;
    } catch (error) {
      console.error('Failed to initialize WebRTC:', error);
      setError('Failed to initialize video call. Please refresh and try again.');
      throw error;
    }
  }, []);

  // Setup data channel
  const setupDataChannel = (dataChannel) => {
    dataChannel.onopen = () => {
      console.log('Data channel opened');
    };
    
    dataChannel.onmessage = (event) => {
      console.log('Message from data channel:', event.data);
      // Handle chat messages, reactions, etc.
    };
    
    dataChannel.onclose = () => {
      console.log('Data channel closed');
    };
  };

  // Setup peer connection listeners
  const setupPeerConnectionListeners = (peerConnection) => {
    peerConnection.onicecandidate = (event) => {
      if (event.candidate && roomInfo?.roomId) {
        const targetUserId = connectedUsers.find(u => u.userId !== user?.id)?.userId;
        if (targetUserId) {
          socketService.sendIceCandidate(roomInfo.roomId, event.candidate, targetUserId);
        }
      }
    };

    peerConnection.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        setRemoteStream(event.streams[0]);
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      }
    };

    peerConnection.onconnectionstatechange = () => {
      console.log('Connection state:', peerConnection.connectionState);
      if (peerConnection.connectionState === 'connected') {
        console.log('Peer connection established');
        startCallTimer();
      }
    };

    peerConnection.ondatachannel = (event) => {
      console.log('Data channel received');
      dataChannelRef.current = event.channel;
      setupDataChannel(event.channel);
    };
  };

  // Get local media stream
  const getLocalMediaStream = async () => {
    try {
      const constraints = videoCallUtils.getMediaConstraints();
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      return stream;
    } catch (error) {
      console.error('Failed to get media stream:', error);
      setError('Could not access camera/microphone. Please check permissions.');
      throw error;
    }
  };

  // Start screen sharing
  const startScreenShare = async () => {
    try {
      const constraints = videoCallUtils.getScreenShareConstraints();
      const stream = await navigator.mediaDevices.getDisplayMedia(constraints);
      
      setScreenStream(stream);
      if (screenVideoRef.current) {
        screenVideoRef.current.srcObject = stream;
      }
      
      // Replace video track with screen share
      const videoTrack = stream.getVideoTracks()[0];
      if (peerConnectionRef.current && videoTrack) {
        const senders = peerConnectionRef.current.getSenders();
        const videoSender = senders.find(s => s.track?.kind === 'video');
        if (videoSender) {
          videoSender.replaceTrack(videoTrack);
        }
      }
      
      setIsScreenSharing(true);
      socketService.toggleScreenShare(roomInfo?.roomId, stream.id, true);
      
      // Handle screen share stop
      stream.getVideoTracks()[0].onended = () => {
        stopScreenShare();
      };
      
      return stream;
    } catch (error) {
      console.error('Failed to start screen share:', error);
      throw error;
    }
  };

  // Stop screen sharing
  const stopScreenShare = () => {
    if (screenStream) {
      screenStream.getTracks().forEach(track => track.stop());
      setScreenStream(null);
    }
    
    // Restore camera video track
    if (peerConnectionRef.current && localStream) {
      const senders = peerConnectionRef.current.getSenders();
      const videoSender = senders.find(s => s.track?.kind === 'video');
      const videoTrack = localStream.getVideoTracks()[0];
      
      if (videoSender && videoTrack) {
        videoSender.replaceTrack(videoTrack);
      }
    }
    
    setIsScreenSharing(false);
    socketService.toggleScreenShare(roomInfo?.roomId, null, false);
  };

  // Toggle audio
  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
        socketService.toggleMedia(roomInfo?.roomId, 'audio', audioTrack.enabled);
      }
    }
  };

  // Toggle video
  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
        socketService.toggleMedia(roomInfo?.roomId, 'video', videoTrack.enabled);
      }
    }
  };

  // Start video call
  const startVideoCall = async () => {
    try {
      setIsConnecting(true);
      setError(null);

      // 1. Initialize WebRTC
      await initializeWebRTC();
      
      // 2. Get local media stream
      const stream = await getLocalMediaStream();
      
      // 3. Add tracks to peer connection
      stream.getTracks().forEach(track => {
        peerConnectionRef.current.addTrack(track, stream);
      });

      // 4. Get room from backend
      const response = await videoCallAPI.initiateVideoCall(consultationId);
      const { roomId, otherUser } = response.data.data;
      
      setRoomInfo({ roomId, consultationId, otherUser });
      
      // 5. Join socket room
      await socketService.joinVideoRoom(consultationId);
      
      // 6. Setup socket listeners
      setupSocketListeners(roomId);
      
      // 7. Create and send offer (if initiator)
      if (peerConnectionRef.current) {
        const offer = await peerConnectionRef.current.createOffer();
        await peerConnectionRef.current.setLocalDescription(offer);
        
        socketService.sendOffer(roomId, offer, otherUser.id);
      }
      
      setIsCallActive(true);
      setIsConnecting(false);
      
    } catch (error) {
      console.error('Failed to start video call:', error);
      setError(error.message || 'Failed to start video call');
      setIsConnecting(false);
      cleanup();
    }
  };

  // Setup socket listeners
  const setupSocketListeners = (roomId) => {
    // Video call events
    socketService.on('video-call:joined', (data) => {
      console.log('Joined video room:', data);
      setConnectedUsers(data.connectedUsers);
    });

    socketService.on('video-call:user-joined', (data) => {
      console.log('User joined:', data);
      setConnectedUsers(prev => [...prev, {
        userId: data.userId,
        userName: data.userName
      }]);
    });

    socketService.on('video-call:ready', () => {
      console.log('Call ready to start');
    });

    socketService.on('video-call:offer', async (data) => {
      console.log('Received offer:', data);
      
      if (peerConnectionRef.current) {
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.offer));
        
        const answer = await peerConnectionRef.current.createAnswer();
        await peerConnectionRef.current.setLocalDescription(answer);
        
        socketService.sendAnswer(roomId, answer, data.fromUserId);
      }
    });

    socketService.on('video-call:answer', async (data) => {
      console.log('Received answer:', data);
      
      if (peerConnectionRef.current && peerConnectionRef.current.remoteDescription === null) {
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.answer));
      }
    });

    socketService.on('video-call:ice-candidate', async (data) => {
      console.log('Received ICE candidate:', data);
      
      if (peerConnectionRef.current && data.candidate) {
        try {
          await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
        } catch (error) {
          console.error('Error adding ICE candidate:', error);
        }
      }
    });

    socketService.on('video-call:user-left', (data) => {
      console.log('User left:', data);
      setConnectedUsers(prev => prev.filter(u => u.userId !== data.userId));
      
      if (connectedUsers.length <= 1) {
        endCall();
      }
    });

    socketService.on('video-call:ended', (data) => {
      console.log('Call ended by:', data.endedByName);
      endCall();
    });

    socketService.on('error', (errorData) => {
      console.error('Socket error:', errorData);
      setError(errorData.message || 'Socket error occurred');
    });
  };

  // Start call timer
  const startCallTimer = () => {
    callIntervalRef.current = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
  };

  // End call
  const endCall = () => {
    // Stop call timer
    if (callIntervalRef.current) {
      clearInterval(callIntervalRef.current);
      callIntervalRef.current = null;
    }
    
    // Stop all media tracks
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    
    if (screenStream) {
      screenStream.getTracks().forEach(track => track.stop());
    }
    
    if (remoteStream) {
      remoteStream.getTracks().forEach(track => track.stop());
    }
    
    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    
    // Leave socket room
    if (roomInfo?.roomId) {
      socketService.leaveVideoRoom(roomInfo.roomId);
    }
    
    // Remove socket listeners
    socketService.off('video-call:joined');
    socketService.off('video-call:user-joined');
    socketService.off('video-call:ready');
    socketService.off('video-call:offer');
    socketService.off('video-call:answer');
    socketService.off('video-call:ice-candidate');
    socketService.off('video-call:user-left');
    socketService.off('video-call:ended');
    socketService.off('error');
    
    // Reset state
    setIsCallActive(false);
    setLocalStream(null);
    setRemoteStream(null);
    setScreenStream(null);
    setRoomInfo(null);
    setConnectedUsers([]);
    setCallDuration(0);
  };

  // Cleanup
  const cleanup = () => {
    endCall();
  };

  // Effect for cleanup
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  return {
    // State
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
    initializeWebRTC,
    getLocalMediaStream,
  };
};

export default useVideoCall;