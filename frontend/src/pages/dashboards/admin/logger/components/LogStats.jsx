import { TrendingUp, Users, Activity, CheckCircle, XCircle, Clock, BarChart3 } from 'lucide-react';

const LogStats = ({ stats }) => {
  const statCards = [
    {
      label: 'Total Events',
      value: stats.total?.toLocaleString() || '0',
      icon: Activity,
      color: 'from-purple-500 to-purple-600',
      trend: stats.total > 0 ? 'positive' : 'neutral'
    },
    {
      label: 'Unique Users',
      value: stats.uniqueUsers?.toLocaleString() || '0',
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      trend: stats.uniqueUsers > 0 ? 'positive' : 'neutral'
    },
    {
      label: 'Success Rate',
      value: stats.successRate ? `${stats.successRate}%` : 'N/A',
      icon: CheckCircle,
      color: 'from-green-500 to-green-600',
      trend: stats.successRate > 80 ? 'positive' : stats.successRate > 50 ? 'neutral' : 'negative'
    },
    {
      label: 'Errors',
      value: stats.errors?.toLocaleString() || '0',
      icon: XCircle,
      color: 'from-red-500 to-red-600',
      trend: stats.errors > 0 ? 'negative' : 'positive'
    },
    {
      label: 'Registrations',
      value: stats.registrations?.toLocaleString() || '0',
      icon: Users,
      color: 'from-cyan-500 to-cyan-600',
      trend: stats.registrations > 0 ? 'positive' : 'neutral'
    },
    {
      label: 'Profile Updates',
      value: stats.profileUpdates?.toLocaleString() || '0',
      icon: BarChart3,
      color: 'from-orange-500 to-orange-600',
      trend: stats.profileUpdates > 0 ? 'positive' : 'neutral'
    }
  ].filter(card => card.value !== undefined && card.value !== '0');

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div key={index} className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-4 border border-gray-700 shadow-2xl transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-400 mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <div className="flex items-center space-x-1 mt-2">
                  <TrendingUp size={12} className={
                    stat.trend === 'positive' ? 'text-green-400' : 
                    stat.trend === 'negative' ? 'text-red-400' : 'text-gray-400'
                  } />
                  <span className={`text-xs ${
                    stat.trend === 'positive' ? 'text-green-400' : 
                    stat.trend === 'negative' ? 'text-red-400' : 'text-gray-400'
                  }`}>
                    {stat.trend === 'positive' ? 'Optimal' : stat.trend === 'negative' ? 'Needs attention' : 'Stable'}
                  </span>
                </div>
              </div>
              <div className={`p-3 bg-gradient-to-br ${stat.color} rounded-xl shadow-lg`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default LogStats;