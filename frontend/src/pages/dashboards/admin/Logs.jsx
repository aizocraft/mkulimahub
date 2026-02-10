import { useState } from 'react';
import AuthLogs from './logger/AuthLogs.jsx';
import UserLogs from './logger/UserLogs.jsx';
import ConsultationLogs from './logger/ConsultationLogs.jsx';
import SystemLogs from './logger/SystemLogs.jsx';
import TransactionsLog from './logger/TransactionsLog.jsx';
import {
  Shield,
  Users,
  MessageSquare,
  Server,
  Database,
  Activity,
  CreditCard
} from 'lucide-react';

const Logs = () => {
  const [activeTab, setActiveTab] = useState('auth');

  const tabs = [
    { id: 'auth', label: 'Authentication', icon: Shield, color: 'from-green-500 to-green-600', description: 'User login, registration, and auth events' },
    { id: 'users', label: 'User Management', icon: Users, color: 'from-blue-500 to-blue-600', description: 'Profile updates, role changes, and user actions' },
    { id: 'consultations', label: 'Consultations', icon: MessageSquare, color: 'from-purple-500 to-purple-600', description: 'Expert-farmer interactions and sessions' },
    { id: 'transactions', label: 'Transactions', icon: CreditCard, color: 'from-emerald-500 to-emerald-600', description: 'Payment transactions and financial logs' },
    { id: 'system', label: 'System Logs', icon: Server, color: 'from-orange-500 to-orange-600', description: 'API requests, errors, and system events' }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'auth':
        return <AuthLogs />;
      case 'users':
        return <UserLogs />;
      case 'consultations':
        return <ConsultationLogs />;
      case 'transactions':
        return <TransactionsLog />;
      case 'system':
        return <SystemLogs />;
      default:
        return <AuthLogs />;
    }
  };

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div className="flex-1">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-2xl">
                <Database className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-gray-900 animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                 Logs
              </h1>
            
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Activity size={16} />
          <span>Real-time </span>
         
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-2xl backdrop-blur-xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 p-3">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group relative overflow-hidden rounded-2xl p-4 transition-all duration-300 hover:scale-105 ${
                  isActive
                    ? `bg-gradient-to-r ${tab.color} text-white shadow-xl transform scale-105 ring-2 ring-white/20`
                    : 'bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700/80 hover:shadow-lg border border-gray-200 dark:border-gray-600'
                }`}
              >
                {/* Background gradient animation */}
                <div className={`absolute inset-0 bg-gradient-to-r ${tab.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300 ${isActive ? 'opacity-20' : ''}`}></div>

                <div className="relative flex flex-col items-center space-y-3">
                  <div className={`p-3 rounded-xl transition-all duration-300 ${
                    isActive
                      ? 'bg-white/20 shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-700 group-hover:bg-gray-200 dark:group-hover:bg-gray-600'
                  }`}>
                    <Icon size={24} className={isActive ? 'text-white' : 'text-gray-600 dark:text-gray-400'} />
                  </div>
                  <div className="text-center">
                    <div className={`font-semibold text-sm ${isActive ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                      {tab.label}
                    </div>
                    <div className={`text-xs mt-1 ${isActive ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'}`}>
                      {tab.description}
                    </div>
                  </div>
                  {isActive && (
                    <div className="flex space-x-1">
                      <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                      <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  )}
                </div>

                {/* Hover effect */}
                {!isActive && (
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm rounded-b-3xl border-t border-gray-200 dark:border-gray-700">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Logs;