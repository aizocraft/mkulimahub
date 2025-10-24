import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { toast } from 'react-toastify';
import { 
  Sun, 
  Moon, 
  Bell, 
  User, 
  Shield, 
  Palette, 
  Database, 
  Globe, 
  Eye,
  EyeOff,
  Mail,
  Smartphone,
  MessageSquare,
  Download,
  Trash2,
  Key,
  Monitor,
  Laptop,
  Smartphone as Phone,
  Volume2,
  VolumeX,
  Clock,
  Lock,
  ChevronRight,
  Check,
  Save,
  RotateCcw,
  Settings,
  ShieldCheck,
  Database as DataIcon,
  Wifi,
  WifiOff,
  Languages,
  Eye as EyeIcon
} from 'lucide-react';

const SettingsPage = () => {
  const { user, updateProfile } = useAuth();
  const { theme, toggleTheme, setTheme } = useTheme();
  
  const [activeSection, setActiveSection] = useState('appearance');
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    marketing: false,
    security: true
  });

  const [privacy, setPrivacy] = useState({
    profileVisibility: 'public',
    dataCollection: true,
    personalizedAds: false,
    activityStatus: true
  });

  const [accessibility, setAccessibility] = useState({
    reducedMotion: false,
    highContrast: false,
    largerText: false,
    screenReader: false
  });

  const [storage, setStorage] = useState({
    autoDownload: false,
    cacheSize: '1GB',
    autoClearCache: true
  });

  const [language, setLanguage] = useState('en');
  const [saved, setSaved] = useState(false);

  const handleNotificationChange = (type) => {
    setNotifications(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const handlePrivacyChange = (type, value) => {
    setPrivacy(prev => ({
      ...prev,
      [type]: value
    }));
  };

  const handleAccessibilityChange = (type) => {
    setAccessibility(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const handleSaveSettings = () => {
    // Simulate saving settings
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
    setPrivacy({
      profileVisibility: 'public',
      dataCollection: true,
      personalizedAds: false,
      activityStatus: true
    });
    setAccessibility({
      reducedMotion: false,
      highContrast: false,
      largerText: false,
      screenReader: false
    });
    setLanguage('en');
    toast.info('Settings reset to defaults');
  };

  const navigationItems = [
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy & Security', icon: ShieldCheck },
    { id: 'accessibility', label: 'Accessibility', icon: EyeIcon },
    { id: 'storage', label: 'Storage & Data', icon: DataIcon },
    { id: 'language', label: 'Language', icon: Languages }
  ];

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-emerald-900/20 transition-all duration-500">
      {/* Background Animation */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-emerald-300 dark:bg-emerald-600 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl opacity-20 animate-float"></div>
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-green-300 dark:bg-green-600 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl opacity-20 animate-float" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="relative max-w-7xl mx-auto p-4 py-8">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
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
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full flex items-center justify-center">
                  <User size={24} className="text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 dark:text-white">{user?.name || 'User'}</h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">{user?.email || 'user@example.com'}</p>
                </div>
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
                  description="Choose between light and dark themes, or sync with your system"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    {[
                      { id: 'light', label: 'Light', icon: Sun, description: 'Clean and bright' },
                      { id: 'dark', label: 'Dark', icon: Moon, description: 'Easy on the eyes' },
                      { id: 'system', label: 'System', icon: Monitor, description: 'Auto-detect' }
                    ].map((themeOption) => (
                      <button
                        key={themeOption.id}
                        onClick={() => setTheme(themeOption.id)}
                        className={`p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                          theme === themeOption.id
                            ? 'border-emerald-500 bg-emerald-500/10'
                            : 'border-gray-300 dark:border-gray-600 hover:border-emerald-300 dark:hover:border-emerald-700 bg-white/50 dark:bg-gray-700/30'
                        }`}
                      >
                        <themeOption.icon size={24} className="mb-2 text-emerald-500" />
                        <div className="font-semibold text-gray-900 dark:text-white">{themeOption.label}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{themeOption.description}</div>
                      </button>
                    ))}
                  </div>
                </SettingItem>

                <SettingItem 
                  label="Accent Color" 
                  description="Choose your preferred accent color for the interface"
                >
                  <div className="flex space-x-4 mt-4">
                    {[
                      { color: 'emerald', bg: 'bg-emerald-500' },
                      { color: 'green', bg: 'bg-green-500' },
                      { color: 'teal', bg: 'bg-teal-500' },
                      { color: 'lime', bg: 'bg-lime-500' },
                      { color: 'cyan', bg: 'bg-cyan-500' }
                    ].map((colorObj) => (
                      <button
                        key={colorObj.color}
                        className={`w-12 h-12 rounded-full ${colorObj.bg} border-2 ${
                          theme === colorObj.color ? 'border-white ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-800 ring-emerald-500' : 'border-transparent'
                        } hover:scale-110 transition-transform duration-200`}
                      />
                    ))}
                  </div>
                </SettingItem>

                <SettingItem 
                  label="Font Size" 
                  description="Adjust the text size across the application"
                >
                  <div className="mt-4">
                    <input
                      type="range"
                      min="12"
                      max="24"
                      defaultValue="16"
                      className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mt-2">
                      <span>Small</span>
                      <span>Medium</span>
                      <span>Large</span>
                      <span>X-Large</span>
                    </div>
                  </div>
                </SettingItem>
              </div>
            )}

            {/* Notifications Section */}
            {activeSection === 'notifications' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Notifications</h2>
                
                {[
                  {
                    key: 'email',
                    label: 'Email Notifications',
                    description: 'Receive updates and alerts via email',
                    icon: Mail
                  },
                  {
                    key: 'push',
                    label: 'Push Notifications',
                    description: 'Get real-time notifications in your browser',
                    icon: Bell
                  },
                  {
                    key: 'sms',
                    label: 'SMS Alerts',
                    description: 'Important alerts via text message',
                    icon: MessageSquare
                  },
                  {
                    key: 'marketing',
                    label: 'Marketing Emails',
                    description: 'Updates about new features and promotions',
                    icon: Mail
                  },
                  {
                    key: 'security',
                    label: 'Security Alerts',
                    description: 'Critical security and privacy notifications',
                    icon: Shield
                  }
                ].map((item) => (
                  <SettingItem key={item.key} label={item.label} description={item.description}>
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center space-x-3">
                        <item.icon size={20} className="text-emerald-500" />
                        <span className="text-gray-700 dark:text-gray-300">{item.description}</span>
                      </div>
                      <ToggleSwitch
                        enabled={notifications[item.key]}
                        onChange={() => handleNotificationChange(item.key)}
                        label={item.label}
                      />
                    </div>
                  </SettingItem>
                ))}
              </div>
            )}

            {/* Privacy & Security Section */}
            {activeSection === 'privacy' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Privacy & Security</h2>
                
                <SettingItem 
                  label="Profile Visibility" 
                  description="Control who can see your profile and activity"
                >
                  <select 
                    className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white mt-4 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    value={privacy.profileVisibility}
                    onChange={(e) => handlePrivacyChange('profileVisibility', e.target.value)}
                  >
                    <option value="public">Public</option>
                    <option value="friends">Friends Only</option>
                    <option value="private">Private</option>
                  </select>
                </SettingItem>

                <SettingItem 
                  label="Data Collection" 
                  description="Help us improve by sharing anonymous usage data"
                >
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center space-x-3">
                      <DataIcon size={20} className="text-emerald-500" />
                      <span className="text-gray-700 dark:text-gray-300">Allow anonymous data collection</span>
                    </div>
                    <ToggleSwitch
                      enabled={privacy.dataCollection}
                      onChange={() => handlePrivacyChange('dataCollection', !privacy.dataCollection)}
                      label="Data Collection"
                    />
                  </div>
                </SettingItem>

                <SettingItem 
                  label="Two-Factor Authentication" 
                  description="Add an extra layer of security to your account"
                >
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center space-x-3">
                      <ShieldCheck size={20} className="text-emerald-500" />
                      <span className="text-gray-700 dark:text-gray-300">Enable 2FA for enhanced security</span>
                    </div>
                    <button className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white rounded-xl font-medium transition-all duration-200">
                      Enable
                    </button>
                  </div>
                </SettingItem>

                <SettingItem 
                  label="Login History" 
                  description="Review recent account activity"
                >
                  <div className="mt-4 space-y-3">
                    {[
                      { device: 'Chrome on Windows', time: 'Active now', status: 'active' },
                      { device: 'Safari on iPhone', time: '2 hours ago', status: 'inactive' },
                      { device: 'Firefox on Mac', time: '1 day ago', status: 'inactive' }
                    ].map((session, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-white/40 dark:bg-gray-700/40 rounded-lg border border-white/20 dark:border-gray-600/20">
                        <div className="flex items-center space-x-3">
                          <Monitor size={16} className="text-gray-500" />
                          <span className="text-gray-700 dark:text-gray-300">{session.device}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`text-sm ${session.status === 'active' ? 'text-emerald-500' : 'text-gray-500'}`}>
                            {session.time}
                          </span>
                          {session.status === 'active' && (
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </SettingItem>
              </div>
            )}

            {/* Accessibility Section */}
            {activeSection === 'accessibility' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Accessibility</h2>
                
                {[
                  {
                    key: 'reducedMotion',
                    label: 'Reduced Motion',
                    description: 'Minimize animations and transitions',
                    icon: Clock
                  },
                  {
                    key: 'highContrast',
                    label: 'High Contrast',
                    description: 'Increase color contrast for better visibility',
                    icon: EyeIcon
                  },
                  {
                    key: 'largerText',
                    label: 'Larger Text',
                    description: 'Increase default text size',
                    icon: EyeIcon
                  },
                  {
                    key: 'screenReader',
                    label: 'Screen Reader',
                    description: 'Optimize for screen readers',
                    icon: Volume2
                  }
                ].map((item) => (
                  <SettingItem key={item.key} label={item.label} description={item.description}>
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center space-x-3">
                        <item.icon size={20} className="text-emerald-500" />
                        <span className="text-gray-700 dark:text-gray-300">{item.description}</span>
                      </div>
                      <ToggleSwitch
                        enabled={accessibility[item.key]}
                        onChange={() => handleAccessibilityChange(item.key)}
                        label={item.label}
                      />
                    </div>
                  </SettingItem>
                ))}
              </div>
            )}

            {/* Storage & Data Section */}
            {activeSection === 'storage' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Storage & Data</h2>
                
                <SettingItem 
                  label="Storage Usage" 
                  description="Manage your local storage and cache"
                >
                  <div className="mt-4">
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                      <span>2.3 GB of 5 GB used</span>
                      <span>46%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3">
                      <div className="bg-gradient-to-r from-emerald-500 to-green-500 h-3 rounded-full w-2/3 transition-all duration-500"></div>
                    </div>
                  </div>
                </SettingItem>

                <SettingItem 
                  label="Cache Management" 
                  description="Clear temporary files and cached data"
                >
                  <div className="flex space-x-4 mt-4">
                    <button className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-xl transition-colors duration-200 text-gray-700 dark:text-gray-300">
                      <Trash2 size={18} />
                      <span>Clear Cache</span>
                    </button>
                    <button className="flex items-center space-x-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded-xl transition-colors duration-200">
                      <Trash2 size={18} />
                      <span>Clear All Data</span>
                    </button>
                  </div>
                </SettingItem>

                <SettingItem 
                  label="Data Export" 
                  description="Download your personal data"
                >
                  <button className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-xl transition-colors duration-200 text-gray-700 dark:text-gray-300 mt-4">
                    <Download size={18} />
                    <span>Export Data</span>
                  </button>
                </SettingItem>
              </div>
            )}

            {/* Language Section */}
            {activeSection === 'language' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Language & Region</h2>
                
                <SettingItem 
                  label="Language" 
                  description="Choose your preferred language"
                >
                  <select 
                    className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white mt-4 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                    <option value="zh">Chinese</option>
                    <option value="ja">Japanese</option>
                  </select>
                </SettingItem>

                <SettingItem 
                  label="Region" 
                  description="Set your regional preferences"
                >
                  <select 
                    className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white mt-4 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="us">United States</option>
                    <option value="uk">United Kingdom</option>
                    <option value="eu">European Union</option>
                    <option value="ca">Canada</option>
                    <option value="au">Australia</option>
                  </select>
                </SettingItem>

                <SettingItem 
                  label="Time Zone" 
                  description="Set your local time zone"
                >
                  <select 
                    className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white mt-4 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="est">Eastern Time (ET)</option>
                    <option value="cst">Central Time (CT)</option>
                    <option value="pst">Pacific Time (PT)</option>
                    <option value="gmt">Greenwich Mean Time (GMT)</option>
                    <option value="cet">Central European Time (CET)</option>
                  </select>
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
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #10b981, #22c55e);
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
        }
        
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #10b981, #22c55e);
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
      `}</style>
    </div>
  );
};

export default SettingsPage;