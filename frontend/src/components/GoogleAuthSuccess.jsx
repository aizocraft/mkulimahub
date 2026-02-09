// GoogleAuthSuccess.jsx - UPDATED with axios
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { CheckCircle, Loader } from 'lucide-react';
import { authAPI } from '../api'; // Import the API

const GoogleAuthSuccess = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthSuccess = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const shortToken = urlParams.get('t'); // Changed from 'token' to 't'

      console.log('🔍 Google Auth Success - Short token received:', shortToken ? 'Yes' : 'No');

      if (shortToken) {
        try {
          console.log('🔄 Exchanging short token for full token...');
          
          // Use the authAPI method instead of fetch
          const response = await authAPI.exchangeToken(shortToken);
          
          if (response.data.success) {
            const { token, user } = response.data;
            
            console.log('✅ Token exchange successful for user:', user.email);
            
            // Login user
            login(user, token);
            toast.success(`Welcome ${user.name}!`);
            
            // Notify opener window if this is a popup
            if (window.opener) {
              console.log('📤 Sending success message to opener...');
              window.opener.postMessage({
                type: 'AUTH_SUCCESS',
                token,
                user
              }, window.location.origin);
              
              setTimeout(() => window.close(), 500);
            } else {
              // Navigate based on role
              navigateToDashboard(user);
            }
          } else {
            throw new Error(response.data.message || 'Failed to exchange token');
          }
        } catch (error) {
          console.error('❌ Error processing auth success:', error);
          
          // Try alternative: direct fetch
          console.log('🔄 Trying direct fetch as fallback...');
          try {
            const response = await fetch('http://localhost:5000/api/auth/exchange-token', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ token: shortToken })
            });
            
            if (response.ok) {
              const data = await response.json();
              const { token, user } = data;
              
              login(user, token);
              toast.success(`Welcome ${user.name}!`);
              
              if (window.opener) {
                window.opener.postMessage({
                  type: 'AUTH_SUCCESS',
                  token,
                  user
                }, window.location.origin);
                setTimeout(() => window.close(), 500);
              } else {
                navigateToDashboard(user);
              }
            } else {
              throw new Error('Direct fetch also failed');
            }
          } catch (fallbackError) {
            console.error('❌ Fallback also failed:', fallbackError);
            toast.error('Authentication failed. Please try logging in again.');
            setTimeout(() => {
              if (window.opener) {
                window.close();
              } else {
                navigate('/login');
              }
            }, 3000);
          }
        }
      } else {
        console.error('❌ No short token found in URL');
        toast.error('Authentication failed: No authentication token received');
        
        setTimeout(() => {
          if (window.opener) {
            window.close();
          } else {
            navigate('/login');
          }
        }, 2000);
      }
    };

    handleAuthSuccess();
  }, [login, navigate]);

  const navigateToDashboard = (user) => {
    console.log('📍 Navigating to dashboard for role:', user.role);
    
    setTimeout(() => {
      if (user.role === 'admin') {
        navigate('/dashboard/admin');
      } else if (user.role === 'farmer') {
        navigate('/dashboard/farmer');
      } else if (user.role === 'expert') {
        navigate('/dashboard/expert');
      } else {
        navigate('/dashboard');
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
        <div className="animate-bounce mb-6">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Authentication Successful!
        </h2>
        
        <p className="text-gray-600 mb-2">
          Finalizing authentication...
        </p>
        
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-6">
          <Loader className="w-4 h-4 animate-spin" />
          <span>Please wait...</span>
        </div>
        
        <div className="text-xs text-gray-400">
          <p>Check browser console (F12) for details</p>
        </div>
      </div>
    </div>
  );
};

export default GoogleAuthSuccess;