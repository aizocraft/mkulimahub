import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import UserManagement from '../../components/UserManagement';
import Overview from './admin/Overview';
import Weather from './admin/Weather';
import Logs from './admin/Logs';
import Transactions from './admin/Transactions';
import {
  BarChart3,
  Users,
  Cloud,
  Shield,
  CheckCircle,
  Settings,
  FileText,
  CreditCard
} from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('adminDashboardActiveTab') || 'overview');

  // Save active tab to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('adminDashboardActiveTab', activeTab);
  }, [activeTab]);

  const navigationTabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'weather', label: 'Weather', icon: Cloud },
    { id: 'transactions', label: 'Transactions', icon: CreditCard },
    { id: 'logs', label: 'System Logs', icon: FileText },
  ];

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
                  Admin Dashboard
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-sm lg:text-base mt-1">
                  Welcome back, <span className="font-semibold text-purple-600 dark:text-purple-400">{user?.name || 'Admin'}</span>
                </p>
              </div>
            </div>

            {/* Right Section - Status Badges + Settings */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
              
              {/* Status Badges */}
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center space-x-2 px-3 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-xl text-sm font-medium border border-purple-200 dark:border-purple-800 shadow-md hover:scale-105 transform transition-all duration-200">
                  <Shield size={16} />
                  <span className="hidden sm:inline">Administrator</span>
                  <span className="sm:hidden">Admin</span>
                </span>
                <span className="inline-flex items-center space-x-2 px-3 py-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-xl text-sm font-medium border border-emerald-200 dark:border-emerald-800 shadow-md hover:scale-105 transform transition-all duration-200">
                  <CheckCircle size={16} />
                  <span className="hidden sm:inline">All Access</span>
                  <span className="sm:hidden">Access</span>
                </span>
              </div>

              {/* Settings Button */}
              <div className="flex items-center">
                <Link 
                  to="/settings" 
                  className="p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-colors duration-200 shadow hover:shadow-lg"
                >
                  <Settings size={18} className="text-gray-600 dark:text-gray-400" />
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
          {activeTab === 'users' && <UserManagement />}
          {activeTab === 'weather' && <Weather />}
          {activeTab === 'transactions' && <Transactions />}
          {activeTab === 'logs' && <Logs />}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;