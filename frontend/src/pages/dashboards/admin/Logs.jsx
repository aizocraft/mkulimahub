import { useState } from 'react';
import AuthLogs from './logger/AuthLogs.jsx';
import UserLogs from './logger/UserLogs.jsx';
import ConsultationLogs from './logger/ConsultationLogs.jsx';
import SystemLogs from './logger/SystemLogs.jsx';
import { 
  Shield, 
  Users, 
  MessageSquare, 
  Server,
  Database,
  Activity
} from 'lucide-react';

const Logs = () => {
  const [activeTab, setActiveTab] = useState('auth');

  const tabs = [
    { id: 'auth', label: 'Authentication', icon: Shield, color: 'from-green-500 to-green-600', description: 'User login, registration, and auth events' },
    { id: 'users', label: 'User Management', icon: Users, color: 'from-blue-500 to-blue-600', description: 'Profile updates, role changes, and user actions' },
    { id: 'consultations', label: 'Consultations', icon: MessageSquare, color: 'from-purple-500 to-purple-600', description: 'Expert-farmer interactions and sessions' },
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
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700 shadow-2xl">
        <div className="flex space-x-1 p-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-3 px-6 py-4 rounded-xl transition-all duration-200 flex-1 text-left ${
                  isActive
                    ? `bg-gradient-to-r ${tab.color} text-white shadow-lg transform scale-105`
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                <div className={`p-2 rounded-lg ${
                  isActive ? 'bg-white/20' : 'bg-gray-700'
                }`}>
                  <Icon size={20} />
                </div>
                <div className="flex-1">
                  <div className="font-semibold">{tab.label}</div>
                </div>
                {isActive && (
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="border-t border-gray-700">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Logs;