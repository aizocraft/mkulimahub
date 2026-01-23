import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { toast } from 'react-toastify';
import { 
  Palette,
  User,
  Bell,
  ShieldCheck,
  EyeIcon,
  Database as DataIcon,
  Languages,
  ChevronRight,
  Save,
  RotateCcw,
  Sprout,
  Lightbulb,
  Crown,
  Settings as SettingsIcon
} from 'lucide-react';

// Import tab components
import AppearanceTab from './settings/AppearanceTab';
import AccountTab from './settings/AccountTab';
import NotificationsTab from './settings/NotificationsTab';
import PrivacySecurityTab from './settings/PrivacySecurityTab';
import AccessibilityTab from './settings/AccessibilityTab';
import StorageDataTab from './settings/StorageDataTab';
import LanguageTab from './settings/LanguageTab';

const SettingsPage = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  
  const [activeSection, setActiveSection] = useState('appearance');
  const [saved, setSaved] = useState(false);

  const navigationItems = [
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'account', label: 'Account', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy & Security', icon: ShieldCheck },
    { id: 'accessibility', label: 'Accessibility', icon: EyeIcon },
    { id: 'storage', label: 'Storage & Data', icon: DataIcon },
    { id: 'language', label: 'Language', icon: Languages }
  ];

  const handleSaveSettings = () => {
    setSaved(true);
    toast.success('Settings saved successfully!');
    setTimeout(() => setSaved(false), 3000);
  };

  const handleResetSettings = () => {
    toast.info('Settings reset to defaults');
  };

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
          <div className="lg:w-80 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/20 p-6 h-fit lg:sticky lg:top-8">
            <div className="space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
                      isActive
                        ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg shadow-emerald-500/25'
                        : 'hover:bg-white/50 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <Icon size={20} className={isActive ? 'text-white' : 'text-gray-500 dark:text-gray-400 group-hover:text-emerald-500'} />
                    <span className="font-medium">{item.label}</span>
                    <ChevronRight size={16} className={`ml-auto transition-transform ${isActive ? 'rotate-90' : ''}`} />
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
                <span className={`text-xs px-2 py-1 rounded-full ${user?.isVerified ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}>
                  {user?.isVerified ? 'Verified ✓' : 'Not Verified'}
                </span>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/20 p-6 lg:p-8">
            {activeSection === 'appearance' && <AppearanceTab />}
            {activeSection === 'account' && <AccountTab user={user} />}
            {activeSection === 'notifications' && <NotificationsTab />}
            {activeSection === 'privacy' && <PrivacySecurityTab />}
            {activeSection === 'accessibility' && <AccessibilityTab />}
            {activeSection === 'storage' && <StorageDataTab />}
            {activeSection === 'language' && <LanguageTab />}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-end space-y-4 sm:space-y-0 sm:space-x-4 mt-8">
          <button
            onClick={handleResetSettings}
            className="flex items-center justify-center space-x-2 px-6 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-300 dark:border-gray-600 hover:bg-white dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl transition-all duration-200 font-medium hover:shadow-lg"
          >
            <RotateCcw size={18} />
            <span>Reset to Defaults</span>
          </button>
          
          <button
            onClick={handleSaveSettings}
            className={`flex items-center justify-center space-x-2 px-8 py-3 rounded-xl transition-all duration-300 font-medium shadow-lg hover:shadow-xl ${
              saved 
                ? 'bg-emerald-500 text-white' 
                : 'bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white'
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