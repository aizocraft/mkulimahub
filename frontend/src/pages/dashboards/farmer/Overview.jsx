import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { userAPI } from '../../../api';
import { toast } from 'react-toastify';
import {
  TrendingUp,
  Users,
  Sprout,
  DollarSign,
  Calendar,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  Eye,
  Download,
  Filter,
  Search,
  Plus,
  BarChart3,
  PieChart,
  Activity,
  Leaf,
  Truck,
  ShoppingCart,
  CloudRain,
  Sun,
  Droplets,
  Thermometer
} from 'lucide-react';

const Overview = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalFarms: 0,
    activeCrops: 0,
    monthlyRevenue: 0,
    pendingTasks: 0,
    cropHealth: 0,
    soilMoisture: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [cropData, setCropData] = useState([]);
  const [weather, setWeather] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Simulate API calls
      setStats({
        totalFarms: 3,
        activeCrops: 12,
        monthlyRevenue: 24500,
        pendingTasks: 8,
        cropHealth: 85,
        soilMoisture: 65
      });

      setRecentActivity([
        { id: 1, type: 'planting', crop: 'Maize', date: '2 hours ago', status: 'completed' },
        { id: 2, type: 'irrigation', crop: 'Tomatoes', date: '5 hours ago', status: 'completed' },
        { id: 3, type: 'harvest', crop: 'Wheat', date: '1 day ago', status: 'pending' },
        { id: 4, type: 'fertilization', crop: 'Beans', date: '2 days ago', status: 'completed' },
        { id: 5, type: 'pest_control', crop: 'Maize', date: '3 days ago', status: 'completed' }
      ]);

      setCropData([
        { name: 'Maize', planted: '2024-01-15', harvest: '2024-04-20', health: 90, area: '5 acres' },
        { name: 'Tomatoes', planted: '2024-02-01', harvest: '2024-05-15', health: 85, area: '2 acres' },
        { name: 'Beans', planted: '2024-01-20', harvest: '2024-03-30', health: 78, area: '3 acres' },
        { name: 'Wheat', planted: '2024-01-10', harvest: '2024-04-10', health: 92, area: '8 acres' }
      ]);

      setWeather({
        temperature: 28,
        humidity: 65,
        rainfall: '15mm',
        condition: 'Partly Cloudy',
        forecast: 'Sunny tomorrow'
      });

    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, change, icon: Icon, color = 'emerald' }) => (
    <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/20 p-6 hover:shadow-lg transition-all duration-300 group">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{value}</p>
          {change && (
            <div className={`flex items-center mt-2 text-sm ${
              change > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            }`}>
              {change > 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
              <span>{Math.abs(change)}% from last month</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl bg-${color}-100 dark:bg-${color}-900/30 group-hover:scale-110 transition-transform duration-300`}>
          <Icon size={24} className={`text-${color}-500`} />
        </div>
      </div>
    </div>
  );

  const ActivityItem = ({ activity }) => {
    const getActivityConfig = (type) => {
      const configs = {
        planting: { icon: Sprout, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/30' },
        irrigation: { icon: Droplets, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30' },
        harvest: { icon: Truck, color: 'text-yellow-500', bg: 'bg-yellow-100 dark:bg-yellow-900/30' },
        fertilization: { icon: Leaf, color: 'text-emerald-500', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
        pest_control: { icon: Activity, color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/30' }
      };
      return configs[type] || configs.planting;
    };

    const config = getActivityConfig(activity.type);
    const Icon = config.icon;

    return (
      <div className="flex items-center space-x-4 p-4 bg-white/40 dark:bg-gray-700/40 rounded-xl border border-white/20 dark:border-gray-600/20 hover:bg-white/60 dark:hover:bg-gray-600/40 transition-colors duration-200">
        <div className={`p-2 rounded-lg ${config.bg}`}>
          <Icon size={20} className={config.color} />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900 dark:text-white capitalize">
              {activity.type.replace('_', ' ')} - {activity.crop}
            </h4>
            <span className={`text-xs px-2 py-1 rounded-full ${
              activity.status === 'completed' 
                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
            }`}>
              {activity.status}
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{activity.date}</p>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-emerald-900/20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-emerald-900/20 transition-all duration-500">
      {/* Background Animation */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-300 dark:bg-green-600 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl opacity-20 animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-300 dark:bg-emerald-600 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl opacity-20 animate-float" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="relative p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Here's what's happening on your farm today.
            </p>
          </div>
          <div className="flex space-x-3 mt-4 lg:mt-0">
            <button className="flex items-center space-x-2 px-4 py-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl border border-gray-300 dark:border-gray-600 hover:bg-white/80 dark:hover:bg-gray-700/60 text-gray-700 dark:text-gray-300 rounded-xl transition-all duration-200">
              <Filter size={18} />
              <span>Filter</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white rounded-xl transition-all duration-200">
              <Plus size={18} />
              <span>Add Activity</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <StatCard
            title="Total Farms"
            value={stats.totalFarms}
            change={12}
            icon={Sprout}
            color="green"
          />
          <StatCard
            title="Active Crops"
            value={stats.activeCrops}
            change={8}
            icon={Leaf}
            color="emerald"
          />
          <StatCard
            title="Monthly Revenue"
            value={`KSh ${stats.monthlyRevenue.toLocaleString()}`}
            change={15}
            icon={DollarSign}
            color="yellow"
          />
          <StatCard
            title="Pending Tasks"
            value={stats.pendingTasks}
            change={-5}
            icon={Clock}
            color="red"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Crop Health & Weather */}
          <div className="lg:col-span-2 space-y-6">
            {/* Crop Health */}
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/20 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Crop Health Overview</h2>
                <button className="p-2 hover:bg-white/40 dark:hover:bg-gray-700/40 rounded-xl transition-colors duration-200">
                  <MoreHorizontal size={20} className="text-gray-500" />
                </button>
              </div>
              
              <div className="space-y-4">
                {cropData.map((crop, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-white/40 dark:bg-gray-700/40 rounded-xl border border-white/20 dark:border-gray-600/20">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl flex items-center justify-center">
                        <Sprout size={24} className="text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">{crop.name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{crop.area}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-emerald-500 to-green-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${crop.health}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{crop.health}%</span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Harvest: {new Date(crop.harvest).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/20 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent Activity</h2>
                <button className="flex items-center space-x-2 px-3 py-2 bg-white/40 dark:bg-gray-700/40 border border-gray-300 dark:border-gray-600 hover:bg-white/60 dark:hover:bg-gray-600/40 rounded-xl transition-colors duration-200 text-gray-700 dark:text-gray-300">
                  <Eye size={16} />
                  <span className="text-sm">View All</span>
                </button>
              </div>
              
              <div className="space-y-3">
                {recentActivity.map((activity) => (
                  <ActivityItem key={activity.id} activity={activity} />
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar - Weather & Quick Actions */}
          <div className="space-y-6">
            {/* Weather Card */}
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/20 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Weather</h2>
                <Sun size={24} className="text-yellow-500" />
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Temperature</span>
                  <span className="font-semibold text-gray-900 dark:text-white flex items-center space-x-1">
                    <Thermometer size={16} />
                    <span>{weather.temperature}°C</span>
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Humidity</span>
                  <span className="font-semibold text-gray-900 dark:text-white flex items-center space-x-1">
                    <Droplets size={16} />
                    <span>{weather.humidity}%</span>
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Rainfall</span>
                  <span className="font-semibold text-gray-900 dark:text-white flex items-center space-x-1">
                    <CloudRain size={16} />
                    <span>{weather.rainfall}</span>
                  </span>
                </div>
                
                <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <strong>Condition:</strong> {weather.condition}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    <strong>Forecast:</strong> {weather.forecast}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/20 p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
              
              <div className="space-y-3">
                <button className="w-full flex items-center space-x-3 p-3 bg-white/40 dark:bg-gray-700/40 border border-gray-300 dark:border-gray-600 hover:bg-white/60 dark:hover:bg-gray-600/40 rounded-xl transition-colors duration-200 text-left">
                  <Plus size={20} className="text-emerald-500" />
                  <span className="text-gray-700 dark:text-gray-300">Add New Crop</span>
                </button>
                
                <button className="w-full flex items-center space-x-3 p-3 bg-white/40 dark:bg-gray-700/40 border border-gray-300 dark:border-gray-600 hover:bg-white/60 dark:hover:bg-gray-600/40 rounded-xl transition-colors duration-200 text-left">
                  <Calendar size={20} className="text-blue-500" />
                  <span className="text-gray-700 dark:text-gray-300">Schedule Task</span>
                </button>
                
                <button className="w-full flex items-center space-x-3 p-3 bg-white/40 dark:bg-gray-700/40 border border-gray-300 dark:border-gray-600 hover:bg-white/60 dark:hover:bg-gray-600/40 rounded-xl transition-colors duration-200 text-left">
                  <ShoppingCart size={20} className="text-purple-500" />
                  <span className="text-gray-700 dark:text-gray-300">Market Prices</span>
                </button>
                
                <button className="w-full flex items-center space-x-3 p-3 bg-white/40 dark:bg-gray-700/40 border border-gray-300 dark:border-gray-600 hover:bg-white/60 dark:hover:bg-gray-600/40 rounded-xl transition-colors duration-200 text-left">
                  <BarChart3 size={20} className="text-orange-500" />
                  <span className="text-gray-700 dark:text-gray-300">View Reports</span>
                </button>
              </div>
            </div>

            {/* Soil Conditions */}
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/20 p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Soil Conditions</h2>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <span>Moisture Level</span>
                    <span>{stats.soilMoisture}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-cyan-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${stats.soilMoisture}%` }}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <span>Nutrient Level</span>
                    <span>78%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-emerald-500 to-green-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: '78%' }}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <span>pH Level</span>
                    <span>6.8</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-yellow-500 to-orange-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: '85%' }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Overview;