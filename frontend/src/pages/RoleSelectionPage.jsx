import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../api';
import { toast } from 'react-toastify';
import { Sprout, Lightbulb, Crown, CheckCircle, ArrowRight } from 'lucide-react';

const RoleSelectionPage = () => {
  const [selectedRole, setSelectedRole] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const roles = [
    {
      value: 'farmer',
      label: 'Farmer',
      description: 'Manage your farm operations, track crops, and get expert advice',
      icon: Sprout,
      color: 'text-green-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      borderColor: 'border-green-200 dark:border-green-800'
    },
    {
      value: 'expert',
      label: 'Agricultural Expert',
      description: 'Share your knowledge, help farmers, and build your reputation',
      icon: Lightbulb,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
      borderColor: 'border-yellow-200 dark:border-yellow-800'
    },
    {
      value: 'admin',
      label: 'Administrator',
      description: 'Manage platform operations, users, and agricultural content',
      icon: Crown,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      borderColor: 'border-purple-200 dark:border-purple-800'
    }
  ];

  const handleRoleSelection = async () => {
    if (!selectedRole) {
      toast.error('Please select a role to continue');
      return;
    }

    setIsLoading(true);
    try {
      // Update user role in backend
      await authAPI.updateUserRole(user.id, selectedRole);
      
      // Update local user data
      const updatedUser = { ...user, role: selectedRole };
      const token = localStorage.getItem('token');
      login(updatedUser, token);
      
      toast.success(`Welcome as a ${selectedRole}! Your profile has been updated.`);
      
      // Navigate to appropriate dashboard
      navigateToDashboard(updatedUser);
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Failed to update role. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToDashboard = (userData) => {
    setTimeout(() => {
      if (userData.role === 'admin') {
        navigate('/dashboard/admin');
      } else if (userData.role === 'farmer') {
        navigate('/dashboard/farmer');
      } else if (userData.role === 'expert') {
        navigate('/dashboard/expert');
      } else {
        navigate('/dashboard');
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900/20 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Choose Your Role
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Welcome to Mkulima Hub! Please select how you'd like to use our platform. 
            You can always update this later in your profile settings.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {roles.map((role) => {
            const IconComponent = role.icon;
            const isSelected = selectedRole === role.value;
            
            return (
              <div
                key={role.value}
                onClick={() => setSelectedRole(role.value)}
                className={`p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                  isSelected
                    ? `${role.bgColor} ${role.borderColor} border-2 scale-105 shadow-lg`
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-md'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <IconComponent className={`w-8 h-8 ${role.color}`} />
                  {isSelected && (
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  )}
                </div>
                
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {role.label}
                </h3>
                
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  {role.description}
                </p>
                
                <div className={`mt-4 text-xs font-medium px-3 py-1 rounded-full inline-block ${
                  isSelected 
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                }`}>
                  {role.value.toUpperCase()}
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center">
          <button
            onClick={handleRoleSelection}
            disabled={!selectedRole || isLoading}
            className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-semibold py-3.5 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 mx-auto shadow-lg hover:shadow-xl"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Setting up your account...</span>
              </>
            ) : (
              <>
                <span>Continue as {selectedRole ? roles.find(r => r.value === selectedRole)?.label : 'User'}</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
          
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
            Your selection helps us personalize your experience
          </p>
        </div>
      </div>
    </div>
  );
};

export default RoleSelectionPage;