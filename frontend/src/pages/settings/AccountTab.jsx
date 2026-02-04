// src/pages/settings/AccountTab.jsx
import { useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authAPI, userAPI } from '../../api';
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

// Move SettingItem outside component to prevent remounting
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
  const [showDeletePassword, setShowDeletePassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  // Check if user is Google authenticated
  const isGoogleAuth = user?.googleId || user?.isGoogleAuth;

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
    }
  };

  const handleReactivateAccount = async () => {
    setIsDeactivating(true);
    try {
      const response = await userAPI.reactivateAccount();
      
      if (response.data.success) {
        toast.success('Account reactivated successfully!');
        const updatedUser = { ...user, isActive: true };
        updateUser(updatedUser);
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    } catch (error) {
      console.error('Error reactivating account:', error);
      const errorMessage = error.response?.data?.message || 'Failed to reactivate account';
      toast.error(errorMessage);
    } finally {
      setIsDeactivating(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword.trim()) {
      toast.error('Please enter your password to confirm deletion');
      return;
    }

    setIsDeletingAccount(true);
    try {
      const response = await userAPI.deleteAccountPermanently(deletePassword);
      
      if (response.data.success) {
        toast.success('Account deleted permanently');
        logout();
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete account';
      toast.error(errorMessage);
    } finally {
      setIsDeletingAccount(false);
      setShowDeleteConfirm(false);
      setDeletePassword('');
    }
  };

  const availableRoles = getAvailableRoles();

  return (
    <div className="space-y-6">
      {/* Profile Card */}
      <div className="p-6 bg-gradient-to-br from-white/80 to-white/40 dark:from-gray-800/80 dark:to-gray-800/40 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-gray-700/30 shadow-xl">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4 flex-1">
            {/* Profile Picture */}
            <div className="relative">
              <img 
                src={user?.profilePicture} 
                alt={user?.name}
                className="w-16 h-16 rounded-full object-cover ring-3 ring-emerald-200 dark:ring-emerald-900/50"
              />
              <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white dark:border-gray-800 ${user?.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
            </div>
            
            {/* User Info */}
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{user?.name}</h3>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-sm font-medium rounded-full">
                  {user?.role === 'expert' ? <Lightbulb size={14} /> : user?.role === 'farmer' ? <Sprout size={14} /> : <Crown size={14} />}
                  {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                </span>
                {user?.isVerified && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium rounded-full">
                    <Check size={14} /> Verified
                  </span>
                )}
                {isGoogleAuth && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-red-100 to-orange-100 dark:from-red-900/30 dark:to-orange-900/30 text-red-700 dark:text-red-300 text-sm font-medium rounded-full border border-red-200 dark:border-red-800/50">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Google
                  </span>
                )}
              </div>
            </div>

            {/* Status & Email */}
            <div className="text-right">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{user?.email}</p>
              <div className="flex items-center justify-end gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${user?.isActive ? 'bg-green-500' : 'bg-yellow-500'}`} />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {user?.isActive ? 'Active' : 'Deactivated'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Security & Preferences</h2>
      </div>
      
      {/* Password Change - Only for non-Google users */}
      {!isGoogleAuth && (
      <SettingItem 
        label="Change Password" 
        description="Update your account password for enhanced security"
        icon={Key}
      >
        <form onSubmit={handlePasswordChange} className="mt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Current Password */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showPassword.current ? "text" : "password"}
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                  autoComplete="current-password"
                  className="w-full px-4 py-2.5 bg-white/50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 pr-10"
                  placeholder="Enter current password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => ({ ...prev, current: !prev.current }))}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 pointer-events-auto"
                  tabIndex="-1"
                >
                  {showPassword.current ? <EyeOff size={18} /> : <EyeIcon size={18} />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword.new ? "text" : "password"}
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                  autoComplete="new-password"
                  className="w-full px-4 py-2.5 bg-white/50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 pr-10"
                  placeholder="Enter new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => ({ ...prev, new: !prev.new }))}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 pointer-events-auto"
                  tabIndex="-1"
                >
                  {showPassword.new ? <EyeOff size={18} /> : <EyeIcon size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showPassword.confirm ? "text" : "password"}
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  autoComplete="new-password"
                  className="w-full px-4 py-2.5 bg-white/50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 pr-10"
                  placeholder="Confirm new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => ({ ...prev, confirm: !prev.confirm }))}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 pointer-events-auto"
                  tabIndex="-1"
                >
                  {showPassword.confirm ? <EyeOff size={18} /> : <EyeIcon size={18} />}
                </button>
              </div>
            </div>
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
      )}

      {/* Role Selection - Compact */}
      {user?.role !== 'admin' && availableRoles.length > 0 && (
        <SettingItem 
          label="Switch Role" 
          description="Change your account role"
          icon={SettingsIcon}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
            {availableRoles.map((role) => {
              const Icon = role.icon;
              const isCurrentRole = user?.role === role.value;
              const isDisabled = isUpdatingRole || isCurrentRole;
              
              return (
                <button
                  key={role.value}
                  onClick={() => handleRoleChange(role.value)}
                  disabled={isDisabled}
                  className={`p-4 rounded-lg border-2 transition-all duration-300 group ${
                    isCurrentRole
                      ? 'border-emerald-500 bg-gradient-to-r from-emerald-50/80 to-green-50/80 dark:from-emerald-900/20 dark:to-green-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-emerald-400 dark:hover:border-emerald-600 bg-white/40 dark:bg-gray-700/20 hover:bg-white/60 dark:hover:bg-gray-700/40'
                  } ${isDisabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${role.bg}`}>
                        <Icon size={18} className={role.color} />
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-gray-900 dark:text-white text-sm">{role.label}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">{role.description}</div>
                      </div>
                    </div>
                    {isCurrentRole && (
                      <Check size={18} className="text-emerald-500 flex-shrink-0" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
          {isUpdatingRole && (
            <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg flex items-center justify-center space-x-2">
              <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-emerald-600 dark:text-emerald-400 text-sm font-medium">Updating role...</span>
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
        label="Account Status" 
        description={user?.isActive ? "Manage your account status" : "Your account is currently deactivated"}
        icon={Clock}
      >
        <div className={`mt-4 p-4 rounded-lg border transition-all ${
          user?.isActive 
            ? 'bg-yellow-50/80 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-900/30' 
            : 'bg-red-50/80 dark:bg-red-900/10 border-red-200 dark:border-red-900/30'
        }`}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1">
              {user?.isActive ? (
                <Clock size={20} className="text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
              ) : (
                <AlertTriangle size={20} className="text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
              )}
              <div>
                <h4 className={`font-semibold mb-1 ${
                  user?.isActive
                    ? 'text-yellow-900 dark:text-yellow-100'
                    : 'text-red-900 dark:text-red-100'
                }`}>
                  {user?.isActive ? 'Account Active' : 'Account Deactivated'}
                </h4>
                <p className={`text-sm ${
                  user?.isActive
                    ? 'text-yellow-700 dark:text-yellow-300'
                    : 'text-red-700 dark:text-red-300'
                }`}>
                  {user?.isActive 
                    ? 'Temporarily pause your account access'
                    : 'Reactivate to regain platform access'}
                </p>
              </div>
            </div>
            <button
              onClick={() => user?.isActive ? setShowDeactivateConfirm(true) : handleReactivateAccount()}
              disabled={isDeactivating}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 font-medium text-white text-sm flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed ${
                user?.isActive 
                  ? 'bg-yellow-500 hover:bg-yellow-600' 
                  : 'bg-green-500 hover:bg-green-600'
              }`}
            >
              {isDeactivating ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                </>
              ) : user?.isActive ? (
                <>
                  <Clock size={16} />
                  <span>Deactivate</span>
                </>
              ) : (
                <>
                  <Check size={16} />
                  <span>Reactivate</span>
                </>
              )}
            </button>
          </div>
        </div>

        {showDeactivateConfirm && (
          <div className="mt-4 p-4 bg-red-50/80 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-lg">
            <h4 className="font-semibold text-red-900 dark:text-red-100 mb-2">Confirm Deactivation</h4>
            <p className="text-red-700 dark:text-red-300 text-sm mb-4">
              Are you sure? You can reactivate anytime by logging in.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleDeactivateAccount}
                disabled={isDeactivating}
                className="flex items-center space-x-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all duration-200 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeactivating ? (
                  <RefreshCw size={16} className="animate-spin" />
                ) : (
                  <Clock size={16} />
                )}
                <span>{isDeactivating ? 'Deactivating...' : 'Deactivate'}</span>
              </button>
              <button
                onClick={() => setShowDeactivateConfirm(false)}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-lg transition-all duration-200 font-medium text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </SettingItem>

      {/* Delete Account - Only for non-Google users */}
      {!isGoogleAuth && (
      <SettingItem 
        label="Delete Account" 
        description="Permanently delete your account and all associated data"
        icon={Trash2}
      >
        <div className="mt-4 p-4 bg-red-50/80 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-lg">
          <div className="flex items-start gap-4">
            <AlertTriangle size={20} className="text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-semibold text-red-900 dark:text-red-100 mb-1">
                Delete Account Permanently
              </h4>
              <p className="text-red-700 dark:text-red-300 text-sm mb-4">
                This action is irreversible. All your data will be deleted.
              </p>
              
              {!showDeleteConfirm ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all duration-200 font-medium text-sm"
                >
                  <Trash2 size={16} />
                  <span>Delete Account</span>
                </button>
              ) : (
                <div className="space-y-3 mt-3">
                  <div>
                    <label className="block text-sm font-medium text-red-700 dark:text-red-300 mb-2">
                      Enter Password to Confirm
                    </label>
                    <div className="relative">
                      <input
                        type={showDeletePassword ? "text" : "password"}
                        value={deletePassword}
                        onChange={(e) => setDeletePassword(e.target.value)}
                        className="w-full px-4 py-2 bg-white/50 dark:bg-gray-700/50 border border-red-300 dark:border-red-700 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 pr-10 text-sm"
                        placeholder="Your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowDeletePassword(!showDeletePassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 pointer-events-auto"
                        tabIndex="-1"
                      >
                        {showDeletePassword ? <EyeOff size={16} /> : <EyeIcon size={16} />}
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleDeleteAccount}
                      disabled={isDeletingAccount}
                      className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all duration-200 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isDeletingAccount ? (
                        <RefreshCw size={16} className="animate-spin" />
                      ) : (
                        <Trash2 size={16} />
                      )}
                      <span>{isDeletingAccount ? 'Deleting...' : 'Delete'}</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowDeleteConfirm(false);
                        setDeletePassword('');
                        setShowDeletePassword(false);
                      }}
                      className="px-4 py-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-lg transition-all duration-200 font-medium text-sm"
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
      )}
      
      {/* Google Auth Info */}
      {isGoogleAuth && (
      <SettingItem 
        label="Google Account" 
        description="Your account uses Google authentication"
        icon={Lock}
      >
        <div className="mt-4 p-4 bg-blue-50/80 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900/30 rounded-lg">
          <div className="flex items-start gap-3">
            <Check size={18} className="text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                Google Authentication
              </h4>
              <p className="text-blue-700 dark:text-blue-300 text-sm">
                Password and account deletion are managed through your Google account. Contact support for help.
              </p>
            </div>
          </div>
        </div>
      </SettingItem>
      )}
    </div>
  );
};

export default AccountTab;