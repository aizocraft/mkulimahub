import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Redirect based on role
    switch(user.role) {
      case 'admin':
        navigate('/dashboard/admin');
        break;
      case 'farmer':
        navigate('/dashboard/farmer');
        break;
      case 'expert':
        navigate('/dashboard/expert');
        break;
      default:
        navigate('/');
    }
  }, [user, navigate]);

  return (
    <div className="dashboard-loading">
      <div className="loading-spinner">
        <div className="spinner"></div>
        <p>Redirecting to your dashboard...</p>
      </div>
    </div>
  );
};

export default Dashboard;