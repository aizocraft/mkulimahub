import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { CheckCircle, Loader } from 'lucide-react';

const GoogleAuthSuccess = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthSuccess = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      const userParam = urlParams.get('user');

      if (token && userParam) {
        try {
          const userData = JSON.parse(decodeURIComponent(userParam));
          
          login(userData, token);
          toast.success(`Welcome ${userData.name}!`);
          
          if (window.opener) {
            window.opener.postMessage({
              type: 'AUTH_SUCCESS',
              token,
              user: userData
            }, window.location.origin);
            
            setTimeout(() => window.close(), 500);
          } else {
            navigateToDashboard(userData);
          }
        } catch (error) {
          console.error('Error processing auth success:', error);
          toast.error('Authentication failed');
          setTimeout(() => window.close(), 2000);
        }
      } else {
        toast.error('Authentication failed');
        setTimeout(() => window.close(), 2000);
      }
    };

    handleAuthSuccess();
  }, [login, navigate]);

  const navigateToDashboard = (user) => {
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
          You have been successfully authenticated.
        </p>
        
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-6">
          <Loader className="w-4 h-4 animate-spin" />
          <span>Redirecting...</span>
        </div>
      </div>
    </div>
  );
};

export default GoogleAuthSuccess;