// src/pages/SettingsPage.jsx
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { 
  Palette,
  User,
  Bell,
  ShieldCheck,
  EyeIcon,
  Database as DataIcon,
  Languages,
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
  const { t } = useTranslation('settings');
  
  const [activeSection, setActiveSection] = useState('appearance');
  const [saved, setSaved] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const navigationItems = [
    { id: 'appearance', label: t('appearance'), icon: Palette },
    { id: 'account', label: t('account'), icon: User },
    { id: 'notifications', label: t('notifications'), icon: Bell },
    { id: 'privacy', label: t('privacySecurity'), icon: ShieldCheck },
    { id: 'accessibility', label: t('accessibility'), icon: EyeIcon },
    { id: 'storage', label: t('storageData'), icon: DataIcon },
    { id: 'language', label: t('language'), icon: Languages }
  ];

  const handleSaveSettings = () => {
    setSaved(true);
    toast.success(t('savedSuccessfully'));
    setTimeout(() => setSaved(false), 3000);
  };

  const handleResetSettings = () => {
    toast.info(t('resetSuccessfully'));
  };

  const RoleBadge = ({ role }) => {
    const getRoleConfig = (role) => {
      const configs = {
        farmer: { icon: Sprout, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/30', label: t('farmer') },
        expert: { icon: Lightbulb, color: 'text-yellow-500', bg: 'bg-yellow-100 dark:bg-yellow-900/30', label: t('expert') },
        admin: { icon: Crown, color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-900/30', label: t('admin') }
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
            {t('settings')}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {t('customizeExperience')}
          </p>
        </div>

        <div className="flex flex-col gap-6">
          {/* Mobile Tab Navigation */}
          <div className="lg:hidden">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">{t('settings')}</h2>
              <button 
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="p-2 rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur border border-white/20 dark:border-gray-700/20 hover:bg-white/70 dark:hover:bg-gray-700/70 transition-all"
              >
                <SettingsIcon size={20} className="text-gray-700 dark:text-gray-300" />
              </button>
            </div>
            
            {/* Horizontal scroll tabs */}
            <div className="overflow-x-auto -mx-4 px-4 pb-2">
              <div className="flex gap-2 min-w-min">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveSection(item.id);
                        setShowMobileMenu(false);
                      }}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all duration-300 ${
                        isActive
                          ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg shadow-emerald-500/20 scale-105'
                          : 'bg-white/50 dark:bg-gray-800/50 backdrop-blur border border-white/20 dark:border-gray-700/20 text-gray-700 dark:text-gray-300 hover:bg-white/70 dark:hover:bg-gray-700/70'
                      }`}
                    >
                      <Icon size={16} />
                      <span className="text-sm font-medium">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Desktop & Tablet Layout */}
          <div className="hidden lg:flex gap-6">
            {/* Navigation Sidebar */}
            <div className="w-72 bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/20 p-5 h-fit sticky top-8 shadow-lg shadow-black/5 dark:shadow-black/20">
              <div className="space-y-1">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden ${
                        isActive
                          ? 'text-white'
                          : 'text-gray-700 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                      }`}
                    >
                      {/* Background for active */}
                      {isActive && (
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/80 to-green-500/80 rounded-xl" />
                      )}
                      {/* Hover background for inactive */}
                      {!isActive && (
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 to-green-500/0 group-hover:from-emerald-500/10 group-hover:to-green-500/10 rounded-xl transition-all duration-300" />
                      )}
                      
                      <Icon size={18} className="relative z-10 flex-shrink-0" />
                      <span className="font-medium relative z-10 text-sm">{item.label}</span>
                      
                      {isActive && (
                        <div className="ml-auto w-2 h-2 bg-white rounded-full relative z-10 animate-pulse" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* User Profile Card - Compact */}
              <div className="mt-6 p-4 bg-white/40 dark:bg-gray-700/40 backdrop-blur rounded-xl border border-white/20 dark:border-gray-600/20 hover:bg-white/50 dark:hover:bg-gray-700/50 transition-all duration-300">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <User size={20} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm truncate">{user?.name || t('user')}</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-xs truncate">{user?.email || 'user@example.com'}</p>
                  </div>
                </div>
                {user?.role && (
                  <div className="mt-3">
                    <RoleBadge role={user.role} />
                  </div>
                )}
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/20 p-6 lg:p-8 shadow-lg shadow-black/5 dark:shadow-black/20 animate-fadeIn">
              {activeSection === 'appearance' && <AppearanceTab />}
              {activeSection === 'account' && <AccountTab user={user} />}
              {activeSection === 'notifications' && <NotificationsTab />}
              {activeSection === 'privacy' && <PrivacySecurityTab />}
              {activeSection === 'accessibility' && <AccessibilityTab />}
              {activeSection === 'storage' && <StorageDataTab />}
              {activeSection === 'language' && <LanguageTab />}
            </div>
          </div>

          {/* Mobile Content */}
          <div className="lg:hidden bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/20 p-4 shadow-lg shadow-black/5 dark:shadow-black/20 animate-fadeIn">
            {activeSection === 'appearance' && <AppearanceTab />}
            {activeSection === 'account' && <AccountTab user={user} />}
            {activeSection === 'notifications' && <NotificationsTab />}
            {activeSection === 'privacy' && <PrivacySecurityTab />}
            {activeSection === 'accessibility' && <AccessibilityTab />}
            {activeSection === 'storage' && <StorageDataTab />}
            {activeSection === 'language' && <LanguageTab />}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-end space-y-4 sm:space-y-0 sm:space-x-4 mt-8">
            <button
              onClick={handleResetSettings}
              className="flex items-center justify-center space-x-2 px-6 py-3 bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl border border-gray-300 dark:border-gray-600 hover:bg-white/70 dark:hover:bg-gray-700/70 text-gray-700 dark:text-gray-300 rounded-xl transition-all duration-200 font-medium hover:shadow-lg"
            >
              <RotateCcw size={18} />
              <span>{t('resetToDefaults')}</span>
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
              <span>{saved ? t('saved') : t('saveChanges')}</span>
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        /* Smooth scrollbar for mobile tabs */
        .overflow-x-auto::-webkit-scrollbar {
          height: 4px;
        }
        .overflow-x-auto::-webkit-scrollbar-track {
          background: transparent;
        }
        .overflow-x-auto::-webkit-scrollbar-thumb {
          background: rgba(34, 197, 94, 0.4);
          border-radius: 4px;
        }
        .overflow-x-auto::-webkit-scrollbar-thumb:hover {
          background: rgba(34, 197, 94, 0.6);
        }
      `}</style>
    </div>
  );
};

export default SettingsPage;