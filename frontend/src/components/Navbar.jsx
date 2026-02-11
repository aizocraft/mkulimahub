import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import LanguageToggle from './LanguageToggle';
import { 
  Sun, 
  Moon, 
  User, 
  Settings, 
  LogOut, 
  LayoutDashboard,
  HelpCircle,
  Users,
  ChevronDown,
  Home,
  Info,
  Contact
} from 'lucide-react';
import NotificationIcon from './NotificationIcon';

const Navbar = () => {
  const { user, logout, isLoading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation('nav');
  const navigate = useNavigate();
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const profileRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
          profileRef.current && !profileRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
    setIsDropdownOpen(false);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const getDashboardLink = () => {
    if (!user) return '/';
    switch(user.role) {
      case 'admin': return '/dashboard/admin';
      case 'farmer': return '/dashboard/farmer';
      case 'expert': return '/dashboard/expert';
      default: return '/';
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-purple-500';
      case 'expert': return 'bg-orange-500';
      case 'farmer': return 'bg-emerald-500';
      default: return 'bg-gray-500';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return '👑';
      case 'expert': return '💡';
      case 'farmer': return '🌱';
      default: return '👤';
    }
  };

  const generateAvatar = (name) => {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff&bold=true&size=128`;
  };

  // Base navigation items for all users
  const baseNavigationItems = [
    { path: '/', label: t('home'), icon: Home },
    { path: '/about', label: t('about'), icon: Info },
    { path: '/contact', label: t('contact'), icon: Contact },

  ];

  // Role-specific navigation items
  const farmerItems = [

  ];

  const expertItems = [
   
  
  ];

  const adminItems = [
    { path: '/users', label: 'Users', icon: Users },
    { path: '/analytics', label: 'Analytics', icon: LayoutDashboard },
  ];

  const getRoleSpecificItems = () => {
    if (!user) return [];
    switch(user.role) {
      case 'farmer': return farmerItems;
      case 'expert': return expertItems;
      case 'admin': return adminItems;
      default: return [];
    }
  };

  // Combine all navigation items for mobile/tablet
  const allNavigationItems = [
    ...baseNavigationItems,
    ...getRoleSpecificItems(),
    ...(user ? [{ path: getDashboardLink(), label: 'Dashboard', icon: LayoutDashboard }] : [])
  ];

  if (isLoading) {
    return (
      <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                <img 
                  src="/logo.png" 
                  alt="MkulimaHub" 
                  className="w-8 h-8 object-contain"
                />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                Mkulima<span className="text-emerald-600">Hub</span>
              </span>
            </div>
            <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-6 w-20 rounded"></div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        
        {/* Mobile & Tablet Layout (up to lg breakpoint) */}
        <div className="lg:hidden">
          <div className="flex flex-col space-y-3 py-3">
            
            {/* Top Row - Logo, Theme, Auth */}
            <div className="flex items-center justify-between">
              {/* Logo */}
              <Link to="/" className="flex items-center space-x-2 group flex-shrink-0">
                <div className="flex items-center justify-center">
                  <img 
                    src="/logo.png" 
                    alt="MkulimaHub" 
                    className="w-8 h-8 object-contain group-hover:scale-105 transition-transform duration-200"
                  />
                </div>
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  Mkulima<span className="text-emerald-600">Hub</span>
                </span>
              </Link>

              {/* Right Side Actions */}
              <div className="flex items-center space-x-2">
                {/* Language Toggle */}
                <LanguageToggle />

                {/* Theme Toggle */}
                <button
                  onClick={toggleTheme}
                  className="p-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-all duration-200"
                  aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                >
                  <div className="relative w-4 h-4">
                    <Sun 
                      size={16} 
                      className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${
                        theme === 'light' 
                          ? 'rotate-0 scale-100 text-orange-500' 
                          : 'rotate-90 scale-0 text-gray-400'
                      }`} 
                    />
                    <Moon 
                      size={16} 
                      className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${
                        theme === 'dark' 
                          ? 'rotate-0 scale-100 text-blue-400' 
                          : '-rotate-90 scale-0 text-gray-400'
                      }`} 
                    />
                  </div>
                </button>

                {/* User Actions */}
                {user ? (
                  <>
                    {/* Notifications */}
                    <Link to="/notifications" className="p-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-all duration-200 block">
                      <NotificationIcon 
                        size={16} 
                        className="text-gray-600 dark:text-gray-400" 
                      />
                    </Link>

                    {/* Quick Logout */}
                    <button
                      onClick={handleLogout}
                      className="p-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-xl transition-all duration-200"
                      title="Logout"
                    >
                      <LogOut size={16} />
                    </button>
                  </>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Link
                      to="/login"
                      className="px-3 py-1.5 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium rounded-lg transition-colors duration-200 text-sm"
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition-all duration-200 text-sm"
                    >
                      Register
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Navigation Links - Horizontal Scroll for Mobile & Tablet */}
            <div className="w-full overflow-x-auto scrollbar-hide">
              <div className="flex space-x-1.5 pb-1 min-w-max">
                {allNavigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 flex-shrink-0 ${
                        isActive
                          ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      <Icon size={14} />
                      <span className="whitespace-nowrap">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Layout (lg breakpoint and above) */}
        <div className="hidden lg:block">
          <div className="flex justify-between items-center h-16">
            
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <Link to="/" className="flex items-center space-x-3 group">
                <div className="flex items-center justify-center">
                  <img 
                    src="/logo.png" 
                    alt="MkulimaHub" 
                    className="w-10 h-10 object-contain group-hover:scale-110 transition-transform duration-200"
                  />
                </div>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  Mkulima<span className="text-emerald-600">Hub</span>
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="flex items-center space-x-1">
              {baseNavigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <Icon size={16} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}

              {user && getRoleSpecificItems().map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <Icon size={16} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Right Side Actions - Desktop */}
            <div className="flex items-center space-x-3">
              {/* Language Toggle */}
              <LanguageToggle />

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-all duration-200 group"
                aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              >
                <div className="relative w-5 h-5">
                  <Sun
                    size={20}
                    className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${
                      theme === 'light'
                        ? 'rotate-0 scale-100 text-orange-500'
                        : 'rotate-90 scale-0 text-gray-400'
                    }`}
                  />
                  <Moon
                    size={20}
                    className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${
                      theme === 'dark'
                        ? 'rotate-0 scale-100 text-blue-400'
                        : '-rotate-90 scale-0 text-gray-400'
                    }`}
                  />
                </div>
              </button>

              {/* User Section - Desktop */}
              {user ? (
                <div className="flex items-center space-x-3">
                  {/* Notifications */}
                  <Link to="/notifications" className="p-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-all duration-200 block">
                    <NotificationIcon 
                      size={18} 
                      className="text-gray-600 dark:text-gray-400" 
                    />
                  </Link>

                  {/* Profile Dropdown */}
                  <div className="relative" ref={dropdownRef}>
                    <button
                      ref={profileRef}
                      onClick={toggleDropdown}
                      className="flex items-center space-x-3 p-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-all duration-200 group"
                    >
                      <div className="relative">
                        <img
                          src={user.profilePicture || generateAvatar(user.name)}
                          alt={user.name}
                          className="w-8 h-8 rounded-lg object-cover border-2 border-white dark:border-gray-800 group-hover:border-emerald-200 dark:group-hover:border-emerald-600 transition-colors duration-200"
                        />
                        <div className={`absolute -bottom-1 -right-1 w-3 h-3 ${getRoleColor(user.role)} rounded-full border-2 border-white dark:border-gray-800`}></div>
                      </div>
                      <div className="text-left">
                        <div className="text-sm font-medium text-gray-900 dark:text-white leading-none">
                          {user.name.split(' ')[0]}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                          {user.role}
                        </div>
                      </div>
                      <ChevronDown 
                        size={16} 
                        className={`text-gray-400 transition-transform duration-200 ${
                          isDropdownOpen ? 'rotate-180' : ''
                        }`} 
                      />
                    </button>

                    {/* Dropdown Menu - Desktop Only */}
                    {isDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 backdrop-blur-xl z-50 animate-in fade-in-0 zoom-in-95">
                        {/* Header */}
                        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                          <div className="flex items-center space-x-4">
                            <img
                              src={user.profilePicture || generateAvatar(user.name)}
                              alt={user.name}
                              className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-200 dark:border-emerald-600"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-1">
                                <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                                  {user.name}
                                </h3>
                                <span className="text-lg">{getRoleIcon(user.role)}</span>
                              </div>
                              <p className="text-sm text-gray-500 dark:text-gray-400 truncate mb-2">
                                {user.email}
                              </p>
                              <div className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                                user.role === 'admin' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' :
                                user.role === 'expert' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300' :
                                'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                              }`}>
                                <span className="capitalize">{user.role}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                          <div className="grid grid-cols-2 gap-2">
                            <Link
                              to={getDashboardLink()}
                              onClick={() => setIsDropdownOpen(false)}
                              className="flex items-center space-x-2 p-3 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                            >
                              <LayoutDashboard size={18} className="text-emerald-600 dark:text-emerald-400" />
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Dashboard</span>
                            </Link>
                            <Link
                              to="/profile"
                              onClick={() => setIsDropdownOpen(false)}
                              className="flex items-center space-x-2 p-3 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                            >
                              <User size={18} className="text-blue-600 dark:text-blue-400" />
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Profile</span>
                            </Link>
                          </div>
                        </div>

                        {/* Menu Items */}
                        <div className="p-2">
                         
                          <Link
                            to="/settings"
                            onClick={() => setIsDropdownOpen(false)}
                            className="flex items-center space-x-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl transition-colors duration-200"
                          >
                            <Settings size={18} />
                            <span className="font-medium">Settings</span>
                          </Link>
                          <Link
                            to="/help"
                            onClick={() => setIsDropdownOpen(false)}
                            className="flex items-center space-x-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl transition-colors duration-200"
                          >
                            <HelpCircle size={18} />
                            <span className="font-medium">Help & Support</span>
                          </Link>
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-gray-100 dark:border-gray-700">
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-xl transition-colors duration-200 font-medium"
                          >
                            <LogOut size={18} />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link
                    to="/login"
                    className="px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium rounded-xl transition-colors duration-200"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-xl transition-all duration-200 transform hover:scale-105"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;