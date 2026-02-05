import { useEffect } from 'react';
import socketService from '../services/socketService';
import { useAuth } from '../context/AuthContext';

const SocketInitializer = () => {
  const { user } = useAuth();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = user || (localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null);
    const userId = userData?._id || userData?.id;

    if (token && userId) {
      try {
        console.log('🔌 Initializing socket globally...');
        const socket = socketService.initialize(token, userId);

        if (socket) {
          socketService.on('connect', () => {
            console.log('✅ Global socket connected:', socketService.getSocketId());
          });
          socketService.on('disconnect', (reason) => {
            console.log('⚠️ Global socket disconnected:', reason);
          });
        }
      } catch (error) {
        console.error('❌ Global socket initialization error:', error);
      }
    } else if (!userId) {
      socketService.disconnect();
    }

    return () => {
      socketService.off('connect');
      socketService.off('disconnect');
    };
  }, [user?._id, user?.id]); // Re-run when user logs in/out

  return null;
};

export default SocketInitializer;