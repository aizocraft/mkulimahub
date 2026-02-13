import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, MessageCircle, DollarSign, Activity } from 'lucide-react';
import { dashboardAPI } from '../api';

const SystemAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState({
    userGrowth: [],
    consultations: [],
    revenue: [],
    activity: []
  });
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalUsersChange: 0,
    totalConsultations: 0,
    totalConsultationsChange: 0,
    totalRevenue: 0,
    totalRevenueChange: 0,
    forumActivity: 0,
    forumActivityChange: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        
        // Fetch dashboard stats and analytics data from API
        const [statsResponse, analyticsResponse] = await Promise.all([
          dashboardAPI.getStats(),
          dashboardAPI.getAnalytics()
        ]);

        // Set stats from dashboard API
        if (statsResponse.data?.stats) {
          setStats(statsResponse.data.stats);
        } else if (statsResponse.data) {
          setStats(statsResponse.data);
        }

        // Set analytics data from dashboard API
        if (analyticsResponse.data?.data) {
          const data = analyticsResponse.data.data;
          setAnalyticsData({
            userGrowth: data.userGrowth || [],
            consultations: data.consultations || [],
            revenue: data.revenue || [],
            activity: data.activity || [
              { name: 'Users', value: data.metrics?.totalUsers || 0, color: '#8884d8' },
              { name: 'Experts', value: data.activity?.find(a => a.name === 'Experts')?.value || 0, color: '#82ca9d' },
              { name: 'Consultations', value: data.metrics?.totalConsultations || 0, color: '#ffc658' },
              { name: 'Transactions', value: data.activity?.find(a => a.name === 'Transactions')?.value || 0, color: '#ff7300' }
            ]
          });
        }
      } catch (err) {
        console.error('Error fetching analytics data:', err);
        setError('Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, []);

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300'];

  // Format currency
  const formatCurrency = (amount) => {
    return `KSh ${(amount || 0).toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <Activity className="w-8 h-8 text-purple-600" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">System Analytics</h2>
      </div>

      {/* Key Metrics Cards - Using real data from dashboardAPI */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats.totalUsers || 0}
              </p>
              <p className={`text-sm flex items-center mt-1 ${
                stats.totalUsersChange >= 0 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                <TrendingUp className="w-4 h-4 mr-1" />
                {stats.totalUsersChange >= 0 ? '+' : ''}{stats.totalUsersChange || 0}% from last month
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Consultations</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats.totalConsultations || 0}
              </p>
              <p className={`text-sm flex items-center mt-1 ${
                stats.totalConsultationsChange >= 0 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                <TrendingUp className="w-4 h-4 mr-1" />
                {stats.totalConsultationsChange >= 0 ? '+' : ''}{stats.totalConsultationsChange || 0}% from last month
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
              <MessageCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Revenue</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(stats.totalRevenue)}
              </p>
              <p className={`text-sm flex items-center mt-1 ${
                stats.totalRevenueChange >= 0 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                <TrendingUp className="w-4 h-4 mr-1" />
                {stats.totalRevenueChange >= 0 ? '+' : ''}{stats.totalRevenueChange || 0}% from last month
              </p>
            </div>
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl">
              <DollarSign className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Forum Activity</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats.forumActivity || 0}
              </p>
              <p className={`text-sm flex items-center mt-1 ${
                stats.forumActivityChange >= 0 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                <TrendingUp className="w-4 h-4 mr-1" />
                {stats.forumActivityChange >= 0 ? '+' : ''}{stats.forumActivityChange || 0}% from last month
              </p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
              <Activity className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts - Using real data from dashboardAPI */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">User Growth</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analyticsData.userGrowth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="users" stroke="#8884d8" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
          {analyticsData.userGrowth.length === 0 && (
            <p className="text-center text-gray-500 dark:text-gray-400 mt-4">
              No user growth data available
            </p>
          )}
        </div>

        {/* Consultations Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Consultations Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData.consultations}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
          {analyticsData.consultations.length === 0 && (
            <p className="text-center text-gray-500 dark:text-gray-400 mt-4">
              No consultations data available
            </p>
          )}
        </div>

        {/* Revenue Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Revenue Growth</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analyticsData.revenue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="amount" stroke="#ffc658" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
          {analyticsData.revenue.length === 0 && (
            <p className="text-center text-gray-500 dark:text-gray-400 mt-4">
              No revenue data available
            </p>
          )}
        </div>

        {/* Activity Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Activity Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analyticsData.activity.filter(item => item.value > 0)}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {analyticsData.activity.filter(item => item.value > 0).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          {analyticsData.activity.filter(item => item.value > 0).length === 0 && (
            <p className="text-center text-gray-500 dark:text-gray-400 mt-4">
              No activity data available
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SystemAnalytics;