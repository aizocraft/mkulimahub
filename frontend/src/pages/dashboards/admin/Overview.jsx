import { useState, useEffect } from 'react';
import { userAPI } from '../../../api';
import UserDistribution from './UserDistribution';
import { 
  Users, 
  TrendingUp, 
  Activity, 
  DollarSign, 
  MessageCircle,
  Cpu,
  Flag,
  UserCheck,
  AlertTriangle,
  Database,
  Server,
  Cloud,
  CreditCard,
  RefreshCw
} from 'lucide-react';

const Overview = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeConsultations: 34,
    monthlyRevenue: 450,
    qnaActivity: 89
  });

  const [activities, setActivities] = useState([
    { id: 1, action: 'New farmer registered', user: 'John Karman', time: '2 hours ago', type: 'user' },
    { id: 2, action: 'Expert consultation completed', user: 'Dr. Jane Expert', time: '4 hours ago', type: 'consultation' },
    { id: 3, action: 'Content flagged for review', user: 'Anonymous', time: '5 hours ago', type: 'alert' },
    { id: 4, action: 'Payment processed', user: 'Mary Wanjiku', time: '6 hours ago', type: 'payment' },
    { id: 5, action: 'New expert verified', user: 'Dr. James Mwangi', time: '8 hours ago', type: 'user' }
  ]);

  const [systemHealth, setSystemHealth] = useState([
    { component: 'Database', status: 'Healthy', indicator: 'healthy', icon: Database },
    { component: 'API Services', status: 'Online', indicator: 'healthy', icon: Server },
    { component: 'Storage', status: '75% Used', indicator: 'warning', icon: Cloud },
    { component: 'Payments', status: 'Active', indicator: 'healthy', icon: CreditCard }
  ]);

  const [flaggedContent, setFlaggedContent] = useState([
    { id: 1, type: 'Post', content: 'Inappropriate farming advice', user: 'user123', severity: 'medium' },
    { id: 2, type: 'Comment', content: 'Spam message detected', user: 'user456', severity: 'low' },
    { id: 3, type: 'Question', content: 'Potential misinformation', user: 'user789', severity: 'high' }
  ]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getAllUsers();
      
      if (response.data?.success && Array.isArray(response.data.users)) {
        const usersData = response.data.users;
        setUsers(usersData);
        
        // Calculate total users
        const totalUsers = usersData.length;
        setStats(prevStats => ({
          ...prevStats,
          totalUsers
        }));
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'user': return <UserCheck size={16} className="text-blue-500" />;
      case 'consultation': return <MessageCircle size={16} className="text-green-500" />;
      case 'alert': return <AlertTriangle size={16} className="text-yellow-500" />;
      case 'payment': return <DollarSign size={16} className="text-purple-500" />;
      default: return <Activity size={16} className="text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="overview-grid space-y-6 p-6">
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading overview...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="overview-grid space-y-6 p-6">
      {/* Compact Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <Users size={24} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalUsers}</p>
              <div className="flex items-center space-x-1 mt-1">
                <TrendingUp size={14} className="text-green-500" />
                <span className="text-xs text-green-600 dark:text-green-400 font-medium">+12% this month</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
              <MessageCircle size={24} className="text-green-600 dark:text-green-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Consultations</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.activeConsultations}</p>
              <div className="flex items-center space-x-1 mt-1">
                <TrendingUp size={14} className="text-green-500" />
                <span className="text-xs text-green-600 dark:text-green-400 font-medium">+8% this week</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
              <DollarSign size={24} className="text-purple-600 dark:text-purple-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Revenue</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">KSh {stats.monthlyRevenue}K</p>
              <div className="flex items-center space-x-1 mt-1">
                <TrendingUp size={14} className="text-green-500" />
                <span className="text-xs text-green-600 dark:text-green-400 font-medium">+15% this month</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
              <Activity size={24} className="text-orange-600 dark:text-orange-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Q&A Activity</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.qnaActivity}</p>
              <div className="flex items-center space-x-1 mt-1">
                <TrendingUp size={14} className="text-green-500" />
                <span className="text-xs text-green-600 dark:text-green-400 font-medium">+5% today</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* User Distribution Component */}
        <div className="lg:col-span-1 xl:col-span-1">
          <UserDistribution users={users} />
        </div>

        {/* System Health */}
        <div className="lg:col-span-1 xl:col-span-1 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2 mb-6">
            <Cpu size={20} className="text-gray-600 dark:text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">System Health</h3>
          </div>
          
          <div className="space-y-4">
            {systemHealth.map((system, index) => {
              const IconComponent = system.icon;
              return (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <IconComponent size={18} className="text-gray-500 dark:text-gray-400" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{system.component}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`text-sm font-medium ${
                      system.indicator === 'healthy' ? 'text-green-600 dark:text-green-400' :
                      system.indicator === 'warning' ? 'text-yellow-600 dark:text-yellow-400' :
                      'text-red-600 dark:text-red-400'
                    }`}>
                      {system.status}
                    </span>
                    <div className={`w-2 h-2 rounded-full ${
                      system.indicator === 'healthy' ? 'bg-green-500' :
                      system.indicator === 'warning' ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="lg:col-span-2 xl:col-span-1 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2 mb-6">
            <Activity size={20} className="text-gray-600 dark:text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
          </div>
          
          <div className="space-y-4">
            {activities.map(activity => (
              <div key={activity.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700/30 rounded-lg transition-colors duration-150">
                <div className="flex-shrink-0 mt-0.5">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.action}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs text-gray-500 dark:text-gray-400">by {activity.user}</span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">•</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Flagged Content */}
        <div className="lg:col-span-2 xl:col-span-3 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2 mb-6">
            <Flag size={20} className="text-gray-600 dark:text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Flagged Content</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {flaggedContent.map(item => (
              <div key={item.id} className={`p-4 border rounded-lg ${
                item.severity === 'high' ? 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20' :
                item.severity === 'medium' ? 'border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20' :
                'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">{item.type}</span>
                  <div className={`w-2 h-2 rounded-full ${
                    item.severity === 'high' ? 'bg-red-500' :
                    item.severity === 'medium' ? 'bg-yellow-500' :
                    'bg-gray-500'
                  }`}></div>
                </div>
                <p className="text-sm text-gray-900 dark:text-white mb-3 line-clamp-2">{item.content}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 dark:text-gray-400">@{item.user}</span>
                  <button className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300 rounded transition-colors duration-200">
                    Review
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;