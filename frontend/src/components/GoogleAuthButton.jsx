import { useState, useRef } from 'react';
import { authAPI } from '../api';
import { toast } from 'react-toastify';

const GoogleAuthButton = ({ type = 'login', onSuccess, onNewUser }) => {
  const [loading, setLoading] = useState(false);
  const pollTimerRef = useRef(null);

  const handleGoogleAuth = async () => {
    try {
      setLoading(true);
      
      // Open Google OAuth in a new window
      const width = 600;
      const height = 700;
      const left = (window.screen.width - width) / 2;
      const top = (window.screen.height - height) / 2;
      
      const authUrl = type === 'login' 
        ? authAPI.getGoogleAuthUrl('login')
        : authAPI.getGoogleAuthUrl('register');
      
      const authWindow = window.open(
        authUrl,
        'Google Auth',
        `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`
      );

      if (!authWindow) {
        toast.error('Popup blocked! Please allow popups for this site and try again.');
        setLoading(false);
        return;
      }

      // Cleanup function
      const cleanup = () => {
        if (pollTimerRef.current) {
          clearInterval(pollTimerRef.current);
          pollTimerRef.current = null;
        }
        window.removeEventListener('message', messageHandler);
        setLoading(false);
      };

      // Listen for message from the auth window
      const messageHandler = (event) => {
        // For security, you should verify the origin
        // if (event.origin !== window.location.origin) return;
        
        if (event.data.type === 'AUTH_SUCCESS') {
          const { token, user, isNewUser } = event.data;
          
          cleanup();
          authWindow.close();
          
          if (isNewUser && onNewUser) {
            onNewUser(user, token);
          } else if (onSuccess) {
            onSuccess(user, token);
          }
        }
        
        if (event.data.type === 'AUTH_ERROR') {
          cleanup();
          authWindow.close();
          toast.error(event.data.message || 'Google authentication failed');
        }

        if (event.data.type === 'AUTH_CANCEL') {
          cleanup();
          authWindow.close();
        }
      };

      window.addEventListener('message', messageHandler);
      
      // Fallback cleanup after 10 minutes
      setTimeout(() => {
        cleanup();
        if (authWindow && !authWindow.closed) {
          authWindow.close();
        }
      }, 10 * 60 * 1000);
      
    } catch (error) {
      console.error('Google auth error:', error);
      toast.error('Failed to initiate Google authentication');
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleGoogleAuth}
      disabled={loading}
      className="w-full flex items-center justify-center gap-3 px-4 py-3.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md active:scale-95"
    >
      {loading ? (
        <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
      ) : (
        <>
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <span className="text-sm font-medium">
            {type === 'login' ? 'Continue with Google' : 'Sign up with Google'}
          </span>
        </>
      )}
    </button>
  );
};

export default GoogleAuthButton;