import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { authAPI } from '../api';
import { toast } from 'react-toastify';
import { 
  Sun, 
  Moon, 
  Bell, 
  User, 
  Shield, 
  Palette, 
  Database, 
  Mail,
  MessageSquare,
  Download,
  Trash2,
  Key,
  ChevronRight,
  Check,
  Save,
  RotateCcw,
  ShieldCheck,
  Database as DataIcon,
  Languages,
  Eye as EyeIcon,
  Sprout,
  Lightbulb,
  Crown,
  ArrowRight,
  Info,
  Clock,
  Volume2,
  AlertTriangle,
  Lock
} from 'lucide-react';

const SettingsPage = () => {
  const { user, updateUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  
  const [activeSection, setActiveSection] = useState('appearance');
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    marketing: false,
    security: true
  });
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);
  const [saved, setSaved] = useState(false);
  
  // Password change states
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  // Account deactivation states
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);
  const [deactivateReason, setDeactivateReason] = useState('');
  const [isDeactivating, setIsDeactivating] = useState(false);

  const navigationItems = [
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'account', label: 'Account', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy & Security', icon: ShieldCheck },
    { id: 'accessibility', label: 'Accessibility', icon: EyeIcon },
    { id: 'storage', label: 'Storage & Data', icon: DataIcon },
    { id: 'language', label: 'Language', icon: Languages }
  ];

  // Handle role change
  const handleRoleChange = async (newRole) => {
    if (!user || user.role === newRole) return;
    
    setIsUpdatingRole(true);
    try {
      const response = await authAPI.updateMyRole({ role: newRole });
      
      if (response.data.success) {
        const updatedUser = { ...user, role: newRole };
        updateUser(updatedUser);
        
        toast.success(`Role updated to ${newRole} successfully!`);
        
        // Refresh page after 2 seconds to apply role changes
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

  // Handle password change
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

  // Handle account deactivation
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

  const handleSaveSettings = () => {
    setSaved(true);
    toast.success('Settings saved successfully!');
    setTimeout(() => setSaved(false), 3000);
  };

  const handleResetSettings = () => {
    setNotifications({
      email: true,
      push: true,
      sms: false,
      marketing: false,
      security: true
    });
    toast.info('Settings reset to defaults');
  };

  // Components
  const SettingItem = ({ children, label, description }) => (
    <div className="p-6 bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/20 hover:border-emerald-200 dark:hover:border-emerald-800/50 transition-all duration-300 group">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <label className="block text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {label}
          </label>
          {description && (
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              {description}
            </p>
          )}
          {children}
        </div>
      </div>
    </div>
  );

  const ToggleSwitch = ({ enabled, onChange, label }) => (
    <button
      onClick={onChange}
      className={`relative inline-flex h-7 w-14 items-center rounded-full transition-all duration-300 ${
        enabled 
          ? 'bg-gradient-to-r from-emerald-500 to-green-500' 
          : 'bg-gray-300 dark:bg-gray-600'
      }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white transition-all duration-300 shadow-lg ${
          enabled ? 'translate-x-8' : 'translate-x-1'
        }`}
      />
      <span className="sr-only">{label}</span>
    </button>
  );

  const RoleBadge = ({ role }) => {
    const getRoleConfig = (role) => {
      const configs = {
        farmer: { icon: Sprout, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/30', label: 'Farmer' },
        expert: { icon: Lightbulb, color: 'text-yellow-500', bg: 'bg-yellow-100 dark:bg-yellow-900/30', label: 'Expert' },
        admin: { icon: Crown, color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-900/30', label: 'Administrator' }
      };
      return configs[role] || configs.farmer;
    };

    const config = getRoleConfig(role);
    const Icon = config.icon;

    return (
      <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full ${config.bg}`}>
        <Icon size={16} className={config.color} />
        <span className={`text-sm font-medium ${config.color}`}>{config.label}</span>
      </div>
    );
  };

  // Available roles for self-update
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

  const availableRoles = getAvailableRoles();

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-emerald-900/20 transition-all duration-500">
      {/* Background Animation */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-emerald-300 dark:bg-emerald-600 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl opacity-20 animate-float"></div>
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-green-300 dark:bg-green-600 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl opacity-20 animate-float" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="relative max-w-7xl mx-auto p-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-3">
            Settings
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Customize your experience and preferences
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Navigation Sidebar */}
          <div className="lg:w-80 bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/20 p-6 h-fit">
            <div className="space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                      activeSection === item.id
                        ? 'bg-gradient-to-r from-emerald-500/20 to-green-500/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                        : 'hover:bg-white/50 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <Icon size={20} />
                    <span className="font-medium">{item.label}</span>
                    <ChevronRight size={16} className="ml-auto" />
                  </button>
                );
              })}
            </div>

            {/* User Profile Card */}
            <div className="mt-8 p-4 bg-white/40 dark:bg-gray-700/40 rounded-xl border border-white/20 dark:border-gray-600/20">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full flex items-center justify-center">
                  <User size={24} className="text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 dark:text-white">{user?.name || 'User'}</h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">{user?.email || 'user@example.com'}</p>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <RoleBadge role={user?.role || 'farmer'} />
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {user?.isVerified ? 'Verified' : 'Not Verified'}
                </span>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/20 p-8">
            {/* Appearance Section */}
            {activeSection === 'appearance' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Appearance</h2>
                
                <SettingItem 
                  label="Theme Mode" 
                  description="Choose between light and dark themes"
                >
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center space-x-3">
                      {theme === 'dark' ? <Moon size={20} className="text-emerald-500" /> : <Sun size={20} className="text-emerald-500" />}
                      <span className="text-gray-700 dark:text-gray-300">
                        {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                      </span>
                    </div>
                    <ToggleSwitch
                      enabled={theme === 'dark'}
                      onChange={toggleTheme}
                      label="Theme Toggle"
                    />
                  </div>
                </SettingItem>

                <SettingItem 
                  label="Accent Color" 
                  description="Choose your preferred accent color for the interface"
                >
                  <div className="flex space-x-4 mt-4">
                    {['emerald', 'green', 'teal', 'lime', 'cyan'].map((color) => (
                      <button
                        key={color}
                        className={`w-12 h-12 rounded-full bg-${color}-500 border-2 border-white hover:scale-110 transition-transform duration-200`}
                      />
                    ))}
                  </div>
                </SettingItem>
              </div>
            )}

            {/* Account Section */}
            {activeSection === 'account' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Account Settings</h2>
                
                {/* Password Change */}
                <SettingItem 
                  label="Change Password" 
                  description="Update your account password for enhanced security"
                >
                  <form onSubmit={handlePasswordChange} className="mt-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Current Password
                      </label>
                      <input
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                        className="w-full px-4 py-2 bg-white/50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                        placeholder="Enter current password"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        New Password
                      </label>
                      <input
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                        className="w-full px-4 py-2 bg-white/50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                        placeholder="Enter new password"
                        minLength={6}
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        className="w-full px-4 py-2 bg-white/50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                        placeholder="Confirm new password"
                        required
                      />
                    </div>
                    
                    <button
                      type="submit"
                      disabled={isChangingPassword}
                      className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white rounded-lg transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Lock size={18} />
                      <span>{isChangingPassword ? 'Changing Password...' : 'Change Password'}</span>
                    </button>
                  </form>
                </SettingItem>

                {/* Role Selection */}
                {user?.role !== 'admin' && availableRoles.length > 0 && (
                  <SettingItem 
                    label="Switch Role" 
                    description="Change between farmer and expert roles to access different features"
                  >
                    <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
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
                            className={`p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                              isCurrentRole
                                ? 'border-emerald-500 bg-emerald-500/10'
                                : 'border-gray-300 dark:border-gray-600 hover:border-emerald-300 dark:hover:border-emerald-700 bg-white/50 dark:bg-gray-700/30'
                            } ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 cursor-pointer'}`}
                          >
                            <div className="flex items-center justify-between mb-3">
                              <Icon size={24} className={role.color} />
                              {isCurrentRole && (
                                <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                                  <Check size={16} className="text-white" />
                                </div>
                              )}
                            </div>
                            <div className="font-semibold text-gray-900 dark:text-white mb-2">{role.label}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">{role.description}</div>
                            {isCurrentRole && (
                              <div className="mt-3 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                                Current Role
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                    {isUpdatingRole && (
                      <div className="mt-4 text-sm text-emerald-600 dark:text-emerald-400 flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                        <span>Updating role...</span>
                      </div>
                    )}
                  </SettingItem>
                )}

                {/* Admin Notice */}
                {user?.role === 'admin' && (
                  <SettingItem 
                    label="Administrator Account" 
                    description="Your account role and permissions"
                  >
                    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl">
                      <div className="flex items-start space-x-3">
                        <Crown size={20} className="text-purple-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-medium text-purple-900 dark:text-purple-100 mb-1">
                            Administrator Account
                          </h4>
                          <p className="text-purple-700 dark:text-purple-300 text-sm">
                            You are currently an administrator. Admin roles can only be assigned by other administrators. 
                            You have full access to all platform features and user management.
                          </p>
                        </div>
                      </div>
                    </div>
                  </SettingItem>
                )}

                {/* Account Deactivation */}
                <SettingItem 
                  label="Account Deactivation" 
                  description="Temporarily deactivate your account. You can reactivate later by logging in."
                >
                  <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle size={20} className="text-red-500 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <h4 className="font-medium text-red-900 dark:text-red-100 mb-2">
                          Deactivate Account
                        </h4>
                        <p className="text-red-700 dark:text-red-300 text-sm mb-4">
                          This will temporarily disable your account. Your data will be preserved but you won't be able to access the platform until you log in again.
                        </p>
                        
                        {!showDeactivateConfirm ? (
                          <button
                            onClick={() => setShowDeactivateConfirm(true)}
                            className="flex items-center space-x-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all duration-200 font-medium"
                          >
                            <Trash2 size={18} />
                            <span>Deactivate Account</span>
                          </button>
                        ) : (
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-red-700 dark:text-red-300 mb-2">
                                Reason for deactivation (optional)
                              </label>
                              <textarea
                                value={deactivateReason}
                                onChange={(e) => setDeactivateReason(e.target.value)}
                                className="w-full px-4 py-2 bg-white/50 dark:bg-gray-700/50 border border-red-300 dark:border-red-700 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                                placeholder="Please let us know why you're deactivating your account..."
                                rows={3}
                              />
                            </div>
                            <div className="flex space-x-3">
                              <button
                                onClick={handleDeactivateAccount}
                                disabled={isDeactivating}
                                className="flex items-center space-x-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Trash2 size={18} />
                                <span>{isDeactivating ? 'Deactivating...' : 'Confirm Deactivation'}</span>
                              </button>
                              <button
                                onClick={() => {
                                  setShowDeactivateConfirm(false);
                                  setDeactivateReason('');
                                }}
                                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-all duration-200 font-medium"
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
            )}

            {/* Other sections remain the same */}
            {activeSection === 'notifications' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Notifications</h2>
                
                {[
                  { key: 'email', label: 'Email Notifications', description: 'Receive updates and alerts via email', icon: Mail },
                  { key: 'push', label: 'Push Notifications', description: 'Get real-time notifications in your browser', icon: Bell },
                  { key: 'sms', label: 'SMS Alerts', description: 'Important alerts via text message', icon: MessageSquare },
                  { key: 'marketing', label: 'Marketing Emails', description: 'Updates about new features and promotions', icon: Mail },
                  { key: 'security', label: 'Security Alerts', description: 'Critical security and privacy notifications', icon: Shield }
                ].map((item) => (
                  <SettingItem key={item.key} label={item.label} description={item.description}>
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center space-x-3">
                        <item.icon size={20} className="text-emerald-500" />
                        <span className="text-gray-700 dark:text-gray-300">{item.description}</span>
                      </div>
                      <ToggleSwitch
                        enabled={notifications[item.key]}
                        onChange={() => setNotifications(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                        label={item.label}
                      />
                    </div>
                  </SettingItem>
                ))}
              </div>
            )}

            {/* Other sections... */}
            {activeSection === 'privacy' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Privacy & Security</h2>
                <SettingItem label="Privacy Settings" description="Manage your privacy preferences">
                  <div className="mt-4 space-y-4">
                    <p className="text-gray-600 dark:text-gray-400">Privacy settings will be available soon.</p>
                  </div>
                </SettingItem>
              </div>
            )}

            {activeSection === 'accessibility' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Accessibility</h2>
                <SettingItem label="Accessibility Features" description="Customize your experience">
                  <div className="mt-4 space-y-4">
                    <p className="text-gray-600 dark:text-gray-400">Accessibility features will be available soon.</p>
                  </div>
                </SettingItem>
              </div>
            )}

            {activeSection === 'storage' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Storage & Data</h2>
                <SettingItem label="Storage Management" description="Manage your data and storage">
                  <div className="mt-4 space-y-4">
                    <p className="text-gray-600 dark:text-gray-400">Storage management features will be available soon.</p>
                  </div>
                </SettingItem>
              </div>
            )}

            {activeSection === 'language' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Language</h2>
                <SettingItem label="Language Preferences" description="Choose your preferred language">
                  <div className="mt-4 space-y-4">
                    <p className="text-gray-600 dark:text-gray-400">Language settings will be available soon.</p>
                  </div>
                </SettingItem>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 mt-8">
          <button
            onClick={handleResetSettings}
            className="flex items-center space-x-2 px-6 py-3 bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl border border-gray-300 dark:border-gray-600 hover:bg-white/80 dark:hover:bg-gray-700/60 text-gray-700 dark:text-gray-300 rounded-xl transition-all duration-200 font-medium"
          >
            <RotateCcw size={18} />
            <span>Reset to Defaults</span>
          </button>
          
          <button
            onClick={handleSaveSettings}
            className={`flex items-center space-x-2 px-8 py-3 rounded-xl transition-all duration-300 font-medium ${
              saved 
                ? 'bg-emerald-500 text-white' 
                : 'bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white shadow-lg hover:shadow-xl'
            }`}
          >
            <Save size={18} />
            <span>{saved ? 'Saved!' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default SettingsPage;