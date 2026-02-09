import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

const AppearanceTab = () => {
  const { theme, toggleTheme } = useTheme();

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Appearance</h2>
      </div>
      
      <SettingItem 
        label="Theme Mode" 
        description="Choose between light and dark themes"
        icon={theme === 'dark' ? Moon : Sun}
      >
        <div className="flex items-center justify-between mt-6">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-purple-100 dark:bg-purple-900/30' : 'bg-amber-100 dark:bg-amber-900/30'}`}>
              {theme === 'dark' ? 
                <Moon size={20} className="text-purple-600 dark:text-purple-400" /> : 
                <Sun size={20} className="text-amber-600 dark:text-amber-400" />
              }
            </div>
            <div>
              <span className="text-gray-700 dark:text-gray-300 font-medium">
                {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
              </span>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {theme === 'dark' ? 'Easier on the eyes in low light' : 'Clean and vibrant appearance'}
              </p>
            </div>
          </div>
          <ToggleSwitch
            enabled={theme === 'dark'}
            onChange={toggleTheme}
            label="Theme Toggle"
          />
        </div>
      </SettingItem>
    </div>
  );
};

export default AppearanceTab;