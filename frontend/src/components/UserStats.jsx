import React from 'react';
import { Users, Shield, UserCheck, Sprout } from 'lucide-react';

const UserStats = ({ users }) => {
  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === 'admin').length,
    experts: users.filter(u => u.role === 'expert').length,
    farmers: users.filter(u => u.role === 'farmer').length,
  };

  const getPercentage = (count) => {
    return stats.total > 0 ? ((count / stats.total) * 100).toFixed(1) : 0;
  };

  const statConfigs = [
    {
      key: 'total',
      label: 'Total Users',
      icon: Users,
      color: 'bg-blue-500',
      textColor: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      key: 'admins',
      label: 'Admins',
      icon: Shield,
      color: 'bg-purple-500',
      textColor: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20'
    },
    {
      key: 'experts',
      label: 'Experts',
      icon: UserCheck,
      color: 'bg-orange-500',
      textColor: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20'
    },
    {
      key: 'farmers',
      label: 'Farmers',
      icon: Sprout,
      color: 'bg-emerald-500',
      textColor: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statConfigs.map((stat) => (
        <div 
          key={stat.key}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow duration-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                {stat.label}
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats[stat.key]}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                {getPercentage(stats[stat.key])}% of total
              </p>
            </div>
            <div className={`p-3 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="mt-4 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${stat.color} transition-all duration-500`}
              style={{ width: `${getPercentage(stats[stat.key])}%` }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default UserStats;