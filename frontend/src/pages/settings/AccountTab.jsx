import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../api';
import { toast } from 'react-toastify';
import { 
  Key, 
  Lock, 
  RefreshCw, 
  Clock, 
  AlertTriangle, 
  Trash2, 
  ArrowRight,
  Settings as SettingsIcon,
  Info,
  EyeIcon,
  EyeOff,
  Sprout,
  Lightbulb,
  Crown,
  Check
} from 'lucide-react';

const AccountTab = ({ user }) => {
  const { updateUser, logout } = useAuth();
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);
  const [deactivateReason, setDeactivateReason] = useState('');
  const [isDeactivating, setIsDeactivating] = useState(false);

  const SettingItem = ({ children, label, description, icon: Icon }) => (
    <div className="p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/20 hover:border-emerald-200 dark:hover:border-emerald-800/50 transition-all duration-300 group hover:shadow-lg">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            {Icon && (
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                <Icon size={20} className="text-emerald-600 dark:text-emerald-400" />
              </div>
            )}
            <div>
              <label className="block text-lg font-semibold text-gray-900 dark:text-white">
                {label}
              </label>
              {description && (
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                  {description}
                </p>
              )}
            </div>
          </div>
          {children}
        </div>
      </div>
    </div>
  );

  const ToggleSwitch = ({ enabled, onChange, label, disabled = false }) => (
    <button
      onClick={onChange}
      disabled={disabled}
      className={`relative inline-flex h-7 w-14 items-center rounded-full transition-all duration-300 ${
        enabled 
          ? 'bg-gradient-to-r from-emerald-500 to-green-500' 
          : 'bg-gray-300 dark:bg-gray-600'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white transition-all duration-300 shadow-lg ${
          enabled ? 'translate-x-8' : 'translate-x-1'
        }`}
      />
      <span className="sr-only">{label}</span>
    </button>
  );

  const getAvailableRoles = () => {
    if (user?.role === 'admin') {
      return [];
    }
    
    return [
      { 
        value: 'farmer', 
        label: 'Farmer', 
        icon: Sprout, 
        description: 'Manage farm operations and get expert advice',
        color: 'text-green-500',
        bg: 'bg-green-100 dark:bg-green-900/30'
      },
      { 
        value: 'expert', 
        label: 'Expert', 
        icon: Lightbulb, 
        description: 'Share knowledge and help farmers',
        color: 'text-yellow-500',
        bg: 'bg-yellow-100 dark:bg-yellow-900/30'
      }
    ];
  };

  const handleRoleChange = async (newRole) => {
    if (!user || user.role === newRole) return;
    
    setIsUpdatingRole(true);
    try {
      const response = await authAPI.updateMyRole({ role: newRole });
      
      if (response.data.success) {
        const updatedUser = { ...user, role: newRole };
        updateUser(updatedUser);
        
        toast.success(`Role updated to ${newRole} successfully!`);
        
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    } catch (error) {
      console.error('Error updating role:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update role';
      toast.error(errorMessage);
    } finally {
      setIsUpdatingRole(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }
    
    setIsChangingPassword(true);
    try {
      const response = await authAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      if (response.data.success) {
        toast.success('Password changed successfully!');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      }
    } catch (error) {
      console.error('Error changing password:', error);
      const errorMessage = error.response?.data?.message || 'Failed to change password';
      toast.error(errorMessage);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDeactivateAccount = async () => {
    if (!deactivateReason.trim()) {
      toast.error('Please provide a reason for deactivation');
      return;
    }
    
    setIsDeactivating(true);
    try {
      const response = await authAPI.deactivateAccount();
      
      if (response.data.success) {
        toast.success('Account deactivated successfully');
        logout();
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('Error deactivating account:', error);
      const errorMessage = error.response?.data?.message || 'Failed to deactivate account';
      toast.error(errorMessage);
    } finally {
      setIsDeactivating(false);
      setShowDeactivateConfirm(false);
      setDeactivateReason('');
    }
  };

  const availableRoles = getAvailableRoles();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Account Settings</h2>
      </div>
      
      {/* Password Change */}
      <SettingItem 
        label="Change Password" 
        description="Update your account password for enhanced security"
        icon={Key}
      >
        <form onSubmit={handlePasswordChange} className="mt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { 
                label: 'Current Password', 
                value: passwordData.currentPassword,
                onChange: (val) => setPasswordData(prev => ({ ...prev, currentPassword: val })),
                show: showPassword.current,
                toggleShow: () => setShowPassword(prev => ({ ...prev, current: !prev.current }))
              },
              { 
                label: 'New Password', 
                value: passwordData.newPassword,
                onChange: (val) => setPasswordData(prev => ({ ...prev, newPassword: val })),
                show: showPassword.new,
                toggleShow: () => setShowPassword(prev => ({ ...prev, new: !prev.new }))
              },
              { 
                label: 'Confirm Password', 
                value: passwordData.confirmPassword,
                onChange: (val) => setPasswordData(prev => ({ ...prev, confirmPassword: val })),
                show: showPassword.confirm,
                toggleShow: () => setShowPassword(prev => ({ ...prev, confirm: !prev.confirm }))
              }
            ].map((field, index) => (
              <div key={index} className="relative">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {field.label}
                </label>
                <div className="relative">
                  <input
                    type={field.show ? "text" : "password"}
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white/50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 pr-10"
                    placeholder={`Enter ${field.label.toLowerCase()}`}
                    required
                  />
                  <button
                    type="button"
                    onClick={field.toggleShow}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    {field.show ? <EyeOff size={18} /> : <EyeIcon size={18} />}
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isChangingPassword}
              className="flex items-center space-x-2 px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white rounded-lg transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {isChangingPassword ? (
                <>
                  <RefreshCw size={18} className="animate-spin" />
                  <span>Changing...</span>
                </>
              ) : (
                <>
                  <Lock size={18} />
                  <span>Change Password</span>
                </>
              )}
            </button>
          </div>
        </form>
      </SettingItem>

      {/* Role Selection */}
      {user?.role !== 'admin' && availableRoles.length > 0 && (
        <SettingItem 
          label="Switch Role" 
          description="Change between farmer and expert roles to access different features"
          icon={SettingsIcon}
        >
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
            <div className="flex items-start space-x-3">
              <Info size={20} className="text-blue-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                  Role Switching Information
                </h4>
                <p className="text-blue-700 dark:text-blue-300 text-sm">
                  Switching roles will change your dashboard and available features. 
                  The page will refresh automatically after role change.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {availableRoles.map((role) => {
              const Icon = role.icon;
              const isCurrentRole = user?.role === role.value;
              const isDisabled = isUpdatingRole || isCurrentRole;
              
              return (
                <button
                  key={role.value}
                  onClick={() => handleRoleChange(role.value)}
                  disabled={isDisabled}
                  className={`p-5 rounded-xl border-2 transition-all duration-300 text-left group ${
                    isCurrentRole
                      ? 'border-emerald-500 bg-gradient-to-r from-emerald-500/10 to-green-500/10'
                      : 'border-gray-300 dark:border-gray-600 hover:border-emerald-300 dark:hover:border-emerald-700 bg-white/50 dark:bg-gray-700/30'
                  } ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02] cursor-pointer'}`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-lg ${role.bg}`}>
                      <Icon size={24} className={role.color} />
                    </div>
                    {isCurrentRole && (
                      <div className="w-7 h-7 bg-emerald-500 rounded-full flex items-center justify-center">
                        <Check size={16} className="text-white" />
                      </div>
                    )}
                  </div>
                  <div className="font-semibold text-gray-900 dark:text-white mb-2 text-lg">{role.label}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">{role.description}</div>
                  <div className="flex items-center text-sm">
                    <ArrowRight size={16} className={`mr-2 ${isCurrentRole ? 'text-emerald-500' : 'text-gray-400 group-hover:text-emerald-500'}`} />
                    <span className={isCurrentRole ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-gray-500 group-hover:text-emerald-500'}>
                      {isCurrentRole ? 'Current Role' : 'Switch to this role'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
          {isUpdatingRole && (
            <div className="mt-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl">
              <div className="flex items-center justify-center space-x-3">
                <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">Updating role...</span>
              </div>
            </div>
          )}
        </SettingItem>
      )}

      {/* Admin Notice */}
      {user?.role === 'admin' && (
        <SettingItem 
          label="Administrator Account" 
          description="Your account role and permissions"
          icon={Crown}
        >
          <div className="p-5 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800 rounded-xl">
            <div className="flex items-start space-x-4">
              <Crown size={24} className="text-purple-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">
                  Administrator Account
                </h4>
                <p className="text-purple-700 dark:text-purple-300 text-sm mb-3">
                  You are currently an administrator. Admin roles can only be assigned by other administrators. 
                  You have full access to all platform features and user management.
                </p>
                <div className="flex items-center space-x-4 text-sm">
                  <span className="text-purple-600 dark:text-purple-400">• Full Access</span>
                  <span className="text-purple-600 dark:text-purple-400">• User Management</span>
                  <span className="text-purple-600 dark:text-purple-400">• System Settings</span>
                </div>
              </div>
            </div>
          </div>
        </SettingItem>
      )}

      {/* Account Deactivation */}
      <SettingItem 
        label="Account Deactivation" 
        description="Temporarily deactivate your account. You can reactivate later by logging in."
        icon={Clock}
      >
        <div className="mt-6 p-5 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl">
          <div className="flex items-start space-x-4">
            <AlertTriangle size={24} className="text-yellow-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
                Deactivate Account
              </h4>
              <p className="text-yellow-700 dark:text-yellow-300 text-sm mb-4">
                This will temporarily disable your account. Your data will be preserved but you won't be able to access the platform until you log in again.
              </p>
              
              {!showDeactivateConfirm ? (
                <button
                  onClick={() => setShowDeactivateConfirm(true)}
                  className="flex items-center space-x-2 px-4 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-all duration-200 font-medium"
                >
                  <Clock size={18} />
                  <span>Deactivate Account</span>
                </button>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-yellow-700 dark:text-yellow-300 mb-2">
                      Reason for deactivation (optional)
                    </label>
                    <textarea
                      value={deactivateReason}
                      onChange={(e) => setDeactivateReason(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white/50 dark:bg-gray-700/50 border border-yellow-300 dark:border-yellow-700 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-200"
                      placeholder="Please let us know why you're deactivating your account..."
                      rows={3}
                    />
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={handleDeactivateAccount}
                      disabled={isDeactivating}
                      className="flex items-center space-x-2 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isDeactivating ? (
                        <RefreshCw size={18} className="animate-spin" />
                      ) : (
                        <Trash2 size={18} />
                      )}
                      <span>{isDeactivating ? 'Deactivating...' : 'Confirm Deactivation'}</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowDeactivateConfirm(false);
                        setDeactivateReason('');
                      }}
                      className="px-4 py-2.5 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-all duration-200 font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </SettingItem>
    </div>
  );
};

export default AccountTab;