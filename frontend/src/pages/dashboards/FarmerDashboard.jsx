// src/pages/dashboards/FarmerDashboard.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import MyCrops from './farmer/MyCrops';
import Consultations from './farmer/Consultations';
import Weather from './admin/Weather';
import ExpertsPage from './farmer/ExpertsPage';
import ForumPages from '../ForumPages';
import Transactions from './admin/Transactions';
import {
  Activity,
  Sprout,
  Users,
  Cloud,
  MapPin,
  Star,
  CheckCircle,
  TrendingUp,
  Settings,
  GraduationCap,
  MessageSquare,
  CreditCard
} from 'lucide-react';

const FarmerDashboard = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('farmerDashboardActiveTab') || 'crops');
  const [farmerData, setFarmerData] = useState({
    county: '',
    experienceLevel: '',
    isActive: true
  });

  // Initialize farmer data from user context
  useEffect(() => {
    if (user) {
      setFarmerData({
        county: user.address?.county || 'Not specified',
        experienceLevel: user.experienceLevel || 'beginner',
        isActive: user.isActive !== false
      });
    }
  }, [user]);

  // Save active tab to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('farmerDashboardActiveTab', activeTab);
  }, [activeTab]);

  const navigationTabs = [
    { id: 'crops', label: 'My Crops', icon: Sprout },
    { id: 'consultations', label: 'Consultations', icon: Users },
    { id: 'transactions', label: 'Transactions', icon: CreditCard },
    { id: 'experts', label: 'Experts', icon: GraduationCap },
    { id: 'forum', label: 'Forum', icon: MessageSquare },
    { id: 'weather', label: 'Weather', icon: Cloud }
  ];

  // Function to get experience level display text
  const getExperienceDisplay = (level) => {
    const levels = {
      beginner: 'Beginner',
      intermediate: 'Intermediate',
      advanced: 'Advanced'
    };
    return levels[level] || 'Beginner';
  };

  // Function to get experience badge color
  const getExperienceColor = (level) => {
    const colors = {
      beginner: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
      intermediate: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      advanced: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800'
    };
    return colors[level] || colors.beginner;
  };

  // Function to get status badge color
  const getStatusColor = (isActive) => {
    return isActive 
      ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
      : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800';
  };

  // Function to get status display text
  const getStatusDisplay = (isActive) => {
    return isActive ? 'Active Farmer' : 'Inactive Farmer';
  };

  // Function to get county display text
  const getCountyDisplay = (county) => {
    return county && county !== 'Not specified' ? county : 'County not set';
  };

  // Function to handle tab clicks
  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
  };

  // Function to render active tab content
  const renderActiveTab = () => {
    switch (activeTab) {
      case 'crops':
        return <MyCrops />;
      case 'consultations':
        return <Consultations />;
      case 'experts':
        return <ExpertsPage />;
      case 'transactions':
        return <Transactions />;
      case 'forum':
        return <ForumPages />;
      case 'weather':
        return <Weather />;
      default:
        return <MyCrops />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between py-4 space-y-4 lg:space-y-0">
            {/* Left Section - Title and User Info */}
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Sprout className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white truncate">
                  Farmer Dashboard
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-sm lg:text-base mt-1">
                  Welcome back, <span className="font-semibold text-emerald-600 dark:text-emerald-400">{user?.name || 'Farmer'}</span>
                </p>
              </div>
            </div>

            {/* Right Section - Dynamic Badges and Actions */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
              {/* Dynamic Status Badges */}
              <div className="flex items-center space-x-2">
                {/* Status Badge */}
                <span className={`inline-flex items-center space-x-2 px-3 py-2 rounded-xl text-sm font-medium border ${getStatusColor(farmerData.isActive)}`}>
                  {farmerData.isActive ? (
                    <CheckCircle size={16} className="text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  )}
                  <span className="hidden sm:inline">{getStatusDisplay(farmerData.isActive)}</span>
                  <span className="sm:hidden">{farmerData.isActive ? 'Active' : 'Inactive'}</span>
                </span>

                {/* County Badge */}
                <span className={`inline-flex items-center space-x-2 px-3 py-2 rounded-xl text-sm font-medium border ${
                  farmerData.county && farmerData.county !== 'Not specified' 
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700'
                }`}>
                  <MapPin size={16} className={
                    farmerData.county && farmerData.county !== 'Not specified' 
                      ? 'text-blue-600 dark:text-blue-400' 
                      : 'text-gray-500 dark:text-gray-500'
                  } />
                  <span>{getCountyDisplay(farmerData.county)}</span>
                </span>

                {/* Experience Level Badge */}
                <span className={`inline-flex items-center space-x-2 px-3 py-2 rounded-xl text-sm font-medium border ${getExperienceColor(farmerData.experienceLevel)}`}>
                  <Star size={16} className={
                    farmerData.experienceLevel === 'beginner' ? 'text-blue-600 dark:text-blue-400' :
                    farmerData.experienceLevel === 'intermediate' ? 'text-amber-600 dark:text-amber-400' :
                    'text-purple-600 dark:text-purple-400'
                  } />
                  <span>{getExperienceDisplay(farmerData.experienceLevel)}</span>
                </span>
              </div>

              {/* Settings Link */}
              <Link
                to="/settings"
                className="p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-colors duration-200 group"
                title="Settings"
              >
                <Settings size={18} className="text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
              </Link>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 overflow-x-auto scrollbar-hide">
            {navigationTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-3 rounded-t-lg border-b-2 transition-all duration-200 flex-shrink-0 min-w-0 group relative z-20 ${
                    isActive
                      ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500 text-emerald-700 dark:text-emerald-300 shadow-sm'
                      : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon 
                    size={18} 
                    className={`flex-shrink-0 transition-transform duration-200 ${
                      isActive ? 'scale-110' : 'group-hover:scale-105'
                    }`} 
                  />
                  <span className="font-medium text-sm whitespace-nowrap">{tab.label}</span>
                  {isActive && (
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden min-h-[500px]">
          {renderActiveTab()}
        </div>

        {/* Farmer Stats Summary */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Status</p>
                <p className={`text-2xl font-bold mt-1 ${
                  farmerData.isActive 
                    ? 'text-emerald-600 dark:text-emerald-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {farmerData.isActive ? 'Active' : 'Inactive'}
                </p>
              </div>
              <div className={`p-3 rounded-xl ${
                farmerData.isActive 
                  ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' 
                  : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
              }`}>
                {farmerData.isActive ? (
                  <CheckCircle className="w-6 h-6" />
                ) : (
                  <div className="w-6 h-6 border-2 border-current rounded-full"></div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Location</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {farmerData.county || 'Not set'}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                <MapPin className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Experience</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1 capitalize">
                  {farmerData.experienceLevel || 'Beginner'}
                </p>
              </div>
              <div className={`p-3 rounded-xl ${
                farmerData.experienceLevel === 'beginner' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' :
                farmerData.experienceLevel === 'intermediate' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' :
                'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
              }`}>
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>
      </div>


    </div>
  );
};

export default FarmerDashboard;