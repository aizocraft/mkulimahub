import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import Overview from './expert/Overview';
import Consultations from './expert/Consultations';
import Weather from './admin/Weather';
import ForumPages from '../ForumPages';

import { 
  BarChart3, 
  MessageCircle, 
  Users, 
  Star, 
  Shield, 
  CheckCircle,
  Settings,
  Clock,
  Target,
  Award,
  DollarSign,
  Globe,
  Cloud,
  MessageSquare 
} from 'lucide-react';

const ExpertDashboard = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('expertDashboardActiveTab') || 'overview');
  const [expertData, setExpertData] = useState({
    isVerified: false,
    yearsOfExperience: 0,
    availability: 'available',
    expertise: [],
    hourlyRate: 0,
    languages: ['English']
  });

  // Initialize expert data from user context
  useEffect(() => {
    if (user) {
      setExpertData({
        isVerified: user.isVerified || false,
        yearsOfExperience: user.yearsOfExperience || 0,
        availability: user.availability || 'available',
        expertise: user.expertise || [],
        hourlyRate: user.hourlyRate || 0,
        languages: user.languages || ['English']
      });
    }
  }, [user]);

  // Save active tab to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('expertDashboardActiveTab', activeTab);
  }, [activeTab]);

  const navigationTabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'consultations', label: 'Consultations', icon: MessageCircle },
    { id: 'forum', label: 'Forum', icon: MessageSquare }, 
    { id: 'weather', label: 'Weather', icon: Cloud } 
  ];

  // Function to get verification display text
  const getVerificationDisplay = (isVerified) => {
    return isVerified ? 'Verified Expert' : 'Pending Verification';
  };

  // Function to get verification badge color
  const getVerificationColor = (isVerified) => {
    return isVerified 
      ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800'
      : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800';
  };

  // Function to get experience display text
  const getExperienceDisplay = (years) => {
    if (years === 0) return 'New Expert';
    if (years === 1) return '1 year experience';
    return `${years} years experience`;
  };

  // Function to get experience badge color
  const getExperienceColor = (years) => {
    if (years === 0) return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
    if (years < 3) return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800';
    if (years < 8) return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
    return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800';
  };

  // Function to get availability display text
  const getAvailabilityDisplay = (availability) => {
    const availabilityMap = {
      available: 'Available',
      busy: 'Busy',
      away: 'Away'
    };
    return availabilityMap[availability] || 'Available';
  };

  // Function to get availability badge color
  const getAvailabilityColor = (availability) => {
    const colors = {
      available: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      busy: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800',
      away: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700'
    };
    return colors[availability] || colors.available;
  };

  // Function to get primary expertise
  const getPrimaryExpertise = (expertise) => {
    return expertise && expertise.length > 0 ? expertise[0] : 'General Agriculture';
  };

  // Function to get expertise count display
  const getExpertiseCount = (expertise) => {
    if (!expertise || expertise.length === 0) return 'No specialties';
    if (expertise.length === 1) return '1 specialty';
    return `${expertise.length} specialties`;
  };

  // Function to get hourly rate display
  const getHourlyRateDisplay = (rate) => {
    return rate > 0 ? `KSh ${rate}/hr` : 'Rate not set';
  };

  // Function to get languages display
  const getLanguagesDisplay = (languages) => {
    if (!languages || languages.length === 0) return 'English';
    return languages.join(', ');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between py-4 space-y-4 lg:space-y-0">
            {/* Left Section - Title and User Info */}
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Shield className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white truncate">
                  Expert Dashboard
                </h1>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-gray-600 dark:text-gray-400 text-sm lg:text-base">
                    Welcome back, <span className="font-semibold text-purple-600 dark:text-purple-400">{user?.name || 'Expert'}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Right Section - Dynamic Badges and Actions */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
              {/* Dynamic Status Badges */}
              <div className="flex items-center space-x-2">
                {/* Verification Badge */}
                <span className={`inline-flex items-center space-x-2 px-3 py-2 rounded-xl text-sm font-medium border ${getVerificationColor(expertData.isVerified)}`}>
                  {expertData.isVerified ? (
                    <Shield size={16} className="text-purple-600 dark:text-purple-400" />
                  ) : (
                    <Clock size={16} className="text-yellow-600 dark:text-yellow-400" />
                  )}
                  <span className="hidden sm:inline">{getVerificationDisplay(expertData.isVerified)}</span>
                  <span className="sm:hidden">{expertData.isVerified ? 'Verified' : 'Pending'}</span>
                </span>

                {/* Experience Badge */}
                <span className={`inline-flex items-center space-x-2 px-3 py-2 rounded-xl text-sm font-medium border ${getExperienceColor(expertData.yearsOfExperience)}`}>
                  <Star size={16} className={
                    expertData.yearsOfExperience === 0 ? 'text-blue-600 dark:text-blue-400' :
                    expertData.yearsOfExperience < 3 ? 'text-green-600 dark:text-green-400' :
                    expertData.yearsOfExperience < 8 ? 'text-amber-600 dark:text-amber-400' :
                    'text-orange-600 dark:text-orange-400'
                  } />
                  <span>{getExperienceDisplay(expertData.yearsOfExperience)}</span>
                </span>

                {/* Availability Badge */}
                <span className={`inline-flex items-center space-x-2 px-3 py-2 rounded-xl text-sm font-medium border ${getAvailabilityColor(expertData.availability)}`}>
                  {expertData.availability === 'available' ? (
                    <CheckCircle size={16} className="text-emerald-600 dark:text-emerald-400" />
                  ) : expertData.availability === 'busy' ? (
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  ) : (
                    <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                  )}
                  <span>{getAvailabilityDisplay(expertData.availability)}</span>
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2">
               
                {/* Settings */}
                      <Link 
                      to="/settings"
                      className="p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-colors duration-200 flex items-center justify-center"
                      title="Settings"
                    >
                      <Settings size={18} className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white" />
                    </Link>
                                  </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1 overflow-x-auto scrollbar-hide">
            {navigationTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-3 rounded-t-lg border-b-2 transition-all duration-200 flex-shrink-0 min-w-0 group ${
                    isActive
                      ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-500 text-purple-700 dark:text-purple-300 shadow-sm'
                      : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <Icon 
                    size={18} 
                    className={`flex-shrink-0 transition-transform duration-200 ${
                      isActive ? 'scale-110' : 'group-hover:scale-105'
                    }`} 
                  />
                  <span className="font-medium text-sm whitespace-nowrap">{tab.label}</span>
                  {isActive && (
                    <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {activeTab === 'overview' && <Overview />}
          {activeTab === 'consultations' && <Consultations />}
          {activeTab === 'forum' && <ForumPages />}
          {activeTab === 'weather' && <Weather />}
       
        </div>

        {/* Expert Stats Summary */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Verification</p>
                <p className={`text-2xl font-bold mt-1 ${
                  expertData.isVerified 
                    ? 'text-purple-600 dark:text-purple-400' 
                    : 'text-yellow-600 dark:text-yellow-400'
                }`}>
                  {expertData.isVerified ? 'Verified' : 'Pending'}
                </p>
              </div>
              <div className={`p-3 rounded-xl ${
                expertData.isVerified 
                  ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' 
                  : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
              }`}>
                {expertData.isVerified ? (
                  <Shield className="w-6 h-6" />
                ) : (
                  <Clock className="w-6 h-6" />
                )}
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Experience</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {expertData.yearsOfExperience || 0} {expertData.yearsOfExperience === 1 ? 'year' : 'years'}
                </p>
              </div>
              <div className={`p-3 rounded-xl ${
                expertData.yearsOfExperience === 0 ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' :
                expertData.yearsOfExperience < 3 ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
                expertData.yearsOfExperience < 8 ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' :
                'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
              }`}>
                <Award className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Availability</p>
                <p className={`text-2xl font-bold mt-1 capitalize ${
                  expertData.availability === 'available' ? 'text-emerald-600 dark:text-emerald-400' :
                  expertData.availability === 'busy' ? 'text-orange-600 dark:text-orange-400' :
                  'text-gray-600 dark:text-gray-400'
                }`}>
                  {expertData.availability || 'available'}
                </p>
              </div>
              <div className={`p-3 rounded-xl ${
                expertData.availability === 'available' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' :
                expertData.availability === 'busy' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400' :
                'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
              }`}>
                {expertData.availability === 'available' ? (
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Expertise</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white mt-1 truncate">
                  {getPrimaryExpertise(expertData.expertise)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {getExpertiseCount(expertData.expertise)}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                <Target className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Additional Expert Details */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Hourly Rate</p>
                <p className={`text-2xl font-bold mt-1 ${
                  expertData.hourlyRate > 0 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {getHourlyRateDisplay(expertData.hourlyRate)}
                </p>
              </div>
              <div className={`p-3 rounded-xl ${
                expertData.hourlyRate > 0 
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' 
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
              }`}>
                <DollarSign className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Languages</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white mt-1 truncate">
                  {getLanguagesDisplay(expertData.languages)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {expertData.languages?.length || 1} language{expertData.languages?.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                <Globe className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Expertise Details */}
        {expertData.expertise && expertData.expertise.length > 0 && (
          <div className="mt-6 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-indigo-500" />
              Areas of Expertise
            </h3>
            <div className="flex flex-wrap gap-2">
              {expertData.expertise.map((skill, index) => (
                <span 
                  key={index}
                  className="inline-flex items-center px-3 py-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 rounded-lg text-sm font-medium border border-indigo-200 dark:border-indigo-800"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpertDashboard;