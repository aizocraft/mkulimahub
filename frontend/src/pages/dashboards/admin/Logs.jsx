// src/pages/dashboards/admin/Logs.jsx
import { useState, useEffect, useMemo } from 'react';
import { logService } from '../../../services/logService';
import { 
  Search, 
  Download, 
  RefreshCw, 
  AlertCircle, 
  Info, 
  XCircle,
  CheckCircle,
  Trash2,
  FileText,
  Filter,
  Calendar,
  User,
  Clock,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Server,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  LogIn,
  UserPlus,
  Shield,
  Settings,
  Key,
  Mail,
  Zap,
  Cpu,
  Database,
  Network,
  HardDrive,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Sparkles,
  Satellite,
  Orbit
} from 'lucide-react';

const Logs = () => {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [expandedLogs, setExpandedLogs] = useState(new Set());
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [showStackTrace, setShowStackTrace] = useState(false);
  const [eventType, setEventType] = useState('all');
  const [userFilter, setUserFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [logsPerPage, setLogsPerPage] = useState(50);
  const [selectedLog, setSelectedLog] = useState(null);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'card'
  const [liveMode, setLiveMode] = useState(false);
  const [analyticsMode, setAnalyticsMode] = useState(false);

  // Pagination
  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);
  const currentLogs = useMemo(() => {
    const startIndex = (currentPage - 1) * logsPerPage;
    return filteredLogs.slice(startIndex, startIndex + logsPerPage);
  }, [filteredLogs, currentPage, logsPerPage]);

  // Event type definitions
  const eventTypes = [
    { id: 'all', label: 'All Events', icon: FileText, color: 'text-gray-500' },
    { id: 'login', label: 'User Logins', icon: LogIn, color: 'text-green-500' },
    { id: 'registration', label: 'Registrations', icon: UserPlus, color: 'text-blue-500' },
    { id: 'profile', label: 'Profile Updates', icon: User, color: 'text-purple-500' },
    { id: 'password', label: 'Password Changes', icon: Key, color: 'text-orange-500' },
    { id: 'auth', label: 'Authentication', icon: Shield, color: 'text-red-500' },
    { id: 'error', label: 'Errors Only', icon: XCircle, color: 'text-red-500' },
    { id: 'api', label: 'API Requests', icon: Server, color: 'text-cyan-500' }
  ];

  // Stats calculation
  const [stats, setStats] = useState({
    total: 0,
    errors: 0,
    warnings: 0,
    info: 0,
    debug: 0,
    requests: 0,
    logins: 0,
    registrations: 0,
    profileUpdates: 0,
    activeUsers: new Set()
  });

  useEffect(() => {
    const activeUsers = new Set();
    logs.forEach(log => {
      if (log.userId && log.userId !== 'anonymous') {
        activeUsers.add(log.userId);
      }
    });

    const newStats = {
      total: logs.length,
      errors: logs.filter(log => log.level === 'error').length,
      warnings: logs.filter(log => log.level === 'warn').length,
      info: logs.filter(log => log.level === 'info').length,
      debug: logs.filter(log => log.level === 'debug').length,
      requests: logs.filter(log => log.method).length,
      logins: logs.filter(log => 
        log.message?.includes('logged in') || 
        log.message?.includes('login') ||
        log.message?.includes('User logged in')
      ).length,
      registrations: logs.filter(log => 
        log.message?.includes('registered') || 
        log.message?.includes('registration') ||
        log.message?.includes('User registered')
      ).length,
      profileUpdates: logs.filter(log => 
        log.message?.includes('profile') || 
        log.message?.includes('Profile updated') ||
        log.message?.includes('updated profile')
      ).length,
      activeUsers
    };
    setStats(newStats);
  }, [logs]);

  // Auto-refresh functionality
  useEffect(() => {
    let interval;
    if (autoRefresh) {
      interval = setInterval(fetchLogs, 5000);
    }
    return () => clearInterval(interval);
  }, [autoRefresh]);

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    filterLogs();
    setCurrentPage(1);
  }, [logs, searchTerm, levelFilter, dateRange, eventType, userFilter]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await logService.getAllLogs();
      setLogs(response.logs || []);
    } catch (err) {
      setError('Failed to fetch logs. Make sure the backend logging system is properly set up.');
      console.error('Error fetching logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterLogs = () => {
    let filtered = [...logs];

    // Filter by level
    if (levelFilter !== 'all') {
      filtered = filtered.filter(log => log.level === levelFilter);
    }

    // Filter by event type
    if (eventType !== 'all') {
      switch (eventType) {
        case 'login':
          filtered = filtered.filter(log => 
            log.message?.includes('logged in') || 
            log.message?.includes('login') ||
            log.message?.includes('User logged in') ||
            log.message?.includes('Login successful')
          );
          break;
        case 'registration':
          filtered = filtered.filter(log => 
            log.message?.includes('registered') || 
            log.message?.includes('registration') ||
            log.message?.includes('User registered') ||
            log.message?.includes('Registration successful')
          );
          break;
        case 'profile':
          filtered = filtered.filter(log => 
            log.message?.includes('profile') || 
            log.message?.includes('Profile updated') ||
            log.message?.includes('updated profile') ||
            log.message?.includes('Profile fetched')
          );
          break;
        case 'password':
          filtered = filtered.filter(log => 
            log.message?.includes('password') || 
            log.message?.includes('Password changed') ||
            log.message?.includes('password change')
          );
          break;
        case 'auth':
          filtered = filtered.filter(log => 
            log.message?.includes('auth') || 
            log.message?.includes('authentication') ||
            log.message?.includes('OAuth') ||
            log.message?.includes('Google') ||
            log.message?.includes('login') ||
            log.message?.includes('registered')
          );
          break;
        case 'error':
          filtered = filtered.filter(log => log.level === 'error');
          break;
        case 'api':
          filtered = filtered.filter(log => log.method && log.url);
          break;
        default:
          break;
      }
    }

    // Filter by date range
    if (dateRange !== 'all') {
      const now = new Date();
      let cutoffDate = new Date();

      switch (dateRange) {
        case '1h':
          cutoffDate.setHours(now.getHours() - 1);
          break;
        case '24h':
          cutoffDate.setDate(now.getDate() - 1);
          break;
        case '7d':
          cutoffDate.setDate(now.getDate() - 7);
          break;
        case '30d':
          cutoffDate.setDate(now.getDate() - 30);
          break;
        default:
          break;
      }

      filtered = filtered.filter(log => {
        const logDate = new Date(log.timestamp);
        return logDate >= cutoffDate;
      });
    }

    // Filter by user
    if (userFilter) {
      const term = userFilter.toLowerCase();
      filtered = filtered.filter(log => 
        log.userId?.toLowerCase().includes(term) ||
        log.message?.toLowerCase().includes(term) ||
        (log.meta?.email && log.meta.email.toLowerCase().includes(term)) ||
        (log.meta?.name && log.meta.name.toLowerCase().includes(term))
      );
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(log => 
        log.message?.toLowerCase().includes(term) ||
        log.level?.toLowerCase().includes(term) ||
        log.timestamp?.toLowerCase().includes(term) ||
        log.url?.toLowerCase().includes(term) ||
        log.method?.toLowerCase().includes(term) ||
        log.userId?.toLowerCase().includes(term) ||
        log.ip?.toLowerCase().includes(term) ||
        (log.meta?.email && log.meta.email.toLowerCase().includes(term)) ||
        (log.meta?.name && log.meta.name.toLowerCase().includes(term)) ||
        (log.meta?.role && log.meta.role.toLowerCase().includes(term))
      );
    }

    setFilteredLogs(filtered);
  };

  const getLevelIcon = (level) => {
    const iconProps = { size: 16 };
    switch (level) {
      case 'error':
        return <XCircle {...iconProps} className="text-red-500" />;
      case 'warn':
        return <AlertTriangle {...iconProps} className="text-yellow-500" />;
      case 'info':
        return <Info {...iconProps} className="text-blue-500" />;
      case 'debug':
        return <CheckCircle {...iconProps} className="text-gray-500" />;
      default:
        return <Info {...iconProps} className="text-gray-500" />;
    }
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'error':
        return 'from-red-500 to-red-600 border-red-500/20';
      case 'warn':
        return 'from-yellow-500 to-yellow-600 border-yellow-500/20';
      case 'info':
        return 'from-blue-500 to-blue-600 border-blue-500/20';
      case 'debug':
        return 'from-gray-500 to-gray-600 border-gray-500/20';
      default:
        return 'from-gray-500 to-gray-600 border-gray-500/20';
    }
  };

  const getEventIcon = (log) => {
    const message = log.message?.toLowerCase() || '';
    
    if (message.includes('login') || message.includes('logged in')) {
      return <LogIn size={14} className="text-green-400" />;
    }
    if (message.includes('register') || message.includes('registered')) {
      return <UserPlus size={14} className="text-blue-400" />;
    }
    if (message.includes('profile')) {
      return <User size={14} className="text-purple-400" />;
    }
    if (message.includes('password')) {
      return <Key size={14} className="text-orange-400" />;
    }
    if (message.includes('google') || message.includes('oauth')) {
      return <Shield size={14} className="text-red-400" />;
    }
    if (log.method && log.url) {
      return <Server size={14} className="text-cyan-400" />;
    }
    
    return <FileText size={14} className="text-gray-400" />;
  };

  const getUserDisplayName = (log) => {
    if (log.meta?.name) return log.meta.name;
    if (log.meta?.email) return log.meta.email.split('@')[0];
    if (log.userId && log.userId !== 'anonymous') return `User ${log.userId.substring(0, 8)}`;
    return 'Anonymous';
  };

  const getUserAvatar = (log) => {
    const name = getUserDisplayName(log);
    return name.charAt(0).toUpperCase();
  };

  const getStatusColor = (statusCode) => {
    if (!statusCode) return 'bg-gray-500/20 text-gray-300';
    if (statusCode >= 500) return 'bg-red-500/20 text-red-300';
    if (statusCode >= 400) return 'bg-yellow-500/20 text-yellow-300';
    if (statusCode >= 300) return 'bg-blue-500/20 text-blue-300';
    return 'bg-green-500/20 text-green-300';
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatRelativeTime = (timestamp) => {
    const now = new Date();
    const logTime = new Date(timestamp);
    const diffInSeconds = Math.floor((now - logTime) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const toggleLogExpansion = (logIndex) => {
    const newExpanded = new Set(expandedLogs);
    if (newExpanded.has(logIndex)) {
      newExpanded.delete(logIndex);
    } else {
      newExpanded.add(logIndex);
    }
    setExpandedLogs(newExpanded);
  };

  const exportLogs = () => {
    const dataStr = JSON.stringify(filteredLogs, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `system-logs-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const clearLogs = async () => {
    if (window.confirm('Are you sure you want to clear all logs? This action cannot be undone.')) {
      try {
        await logService.clearLogs();
        setLogs([]);
        setFilteredLogs([]);
        setExpandedLogs(new Set());
        setCurrentPage(1);
      } catch (err) {
        setError('Failed to clear logs');
      }
    }
  };

  // Quick actions
  const quickActions = [
    { label: 'User Logins', search: 'login', icon: LogIn, color: 'hover:bg-green-500/20' },
    { label: 'Registrations', search: 'registered', icon: UserPlus, color: 'hover:bg-blue-500/20' },
    { label: 'Errors', search: 'error', level: 'error', icon: XCircle, color: 'hover:bg-red-500/20' },
    { label: 'Profile Updates', search: 'profile', icon: User, color: 'hover:bg-purple-500/20' },
    { label: 'Google Auth', search: 'Google', icon: Shield, color: 'hover:bg-red-500/20' },
    { label: 'API Calls', search: '', event: 'api', icon: Server, color: 'hover:bg-cyan-500/20' }
  ];

  const handleQuickAction = (action) => {
    setSearchTerm(action.search);
    if (action.level) setLevelFilter(action.level);
    if (action.event) setEventType(action.event);
    else setEventType('all');
    setUserFilter('');
  };

  // Pagination controls
  const paginationRange = useMemo(() => {
    const delta = 2;
    const range = [];
    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }
    if (currentPage - delta > 2) range.unshift('...');
    if (currentPage + delta < totalPages - 1) range.push('...');
    range.unshift(1);
    if (totalPages > 1) range.push(totalPages);
    return range;
  }, [currentPage, totalPages]);

  // Unique users for suggestions
  const uniqueUsers = useMemo(() => {
    const users = new Set();
    logs.forEach(log => {
      if (log.userId && log.userId !== 'anonymous') {
        users.add(log.userId);
      }
      if (log.meta?.email) {
        users.add(log.meta.email);
      }
      if (log.meta?.name) {
        users.add(log.meta.name);
      }
    });
    return Array.from(users).slice(0, 10);
  }, [logs]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96 space-y-6">
        <div className="relative">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
            <Satellite className="w-8 h-8 text-white animate-pulse" />
          </div>
          <div className="absolute inset-0 bg-purple-500/20 rounded-full animate-ping"></div>
        </div>
        <div className="text-center space-y-2">
          <p className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Initializing Log System
          </p>
          <p className="text-gray-400">Establishing secure connection to log database...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Futuristic Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div className="flex-1">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-2xl">
                <Orbit className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-gray-900 animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Quantum Log Monitor
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1 flex items-center space-x-2">
                <span>Real-time system analytics and user activity tracking</span>
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={exportLogs}
            disabled={filteredLogs.length === 0}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:scale-105"
          >
            <Download size={16} />
            <span>Export Data</span>
          </button>
          <button
            onClick={clearLogs}
            disabled={logs.length === 0}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:scale-105"
          >
            <Trash2 size={16} />
            <span>Purge Logs</span>
          </button>
          <button
            onClick={fetchLogs}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {quickActions.map((action, index) => (
          <button
            key={index}
            onClick={() => handleQuickAction(action)}
            className={`flex items-center space-x-3 p-4 bg-gray-800 border border-gray-700 rounded-xl hover:border-gray-600 transition-all duration-200 group ${action.color} hover:scale-105`}
          >
            <div className="p-2 bg-gray-700 rounded-lg group-hover:scale-110 transition-transform">
              <action.icon size={18} className="text-gray-400 group-hover:text-white" />
            </div>
            <span className="text-sm font-medium text-gray-300 group-hover:text-white">
              {action.label}
            </span>
          </button>
        ))}
      </div>

      {/* Enhanced Stats Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {[
          { label: 'Total Logs', value: stats.total, icon: Database, color: 'from-purple-500 to-purple-600' },
          { label: 'Active Users', value: stats.activeUsers.size, icon: User, color: 'from-green-500 to-green-600' },
          { label: 'Errors', value: stats.errors, icon: XCircle, color: 'from-red-500 to-red-600' },
          { label: 'API Requests', value: stats.requests, icon: Server, color: 'from-blue-500 to-blue-600' },
          { label: 'Logins', value: stats.logins, icon: LogIn, color: 'from-cyan-500 to-cyan-600' }
        ].map((stat, index) => (
          <div key={index} className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-4 border border-gray-700 shadow-2xl transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">{stat.label}</p>
                <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
              </div>
              <div className={`p-3 bg-gradient-to-br ${stat.color} rounded-xl shadow-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Advanced Controls */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700 shadow-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-400 mb-2">Quantum Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={16} />
              <input
                type="text"
                placeholder="Search across all dimensions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
              />
            </div>
          </div>

          {/* User Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">User Focus</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={16} />
              <input
                type="text"
                placeholder="User ID/Name/Email"
                value={userFilter}
                onChange={(e) => setUserFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                list="user-suggestions"
              />
              <datalist id="user-suggestions">
                {uniqueUsers.map((user, index) => (
                  <option key={index} value={user} />
                ))}
              </datalist>
            </div>
          </div>

          {/* Event Type */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Event Type</label>
            <select
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
            >
              {eventTypes.map(type => {
                const Icon = type.icon;
                return (
                  <option key={type.id} value={type.id} className="flex items-center space-x-2">
                    <Icon className="w-4 h-4" />
                    <span>{type.label}</span>
                  </option>
                );
              })}
            </select>
          </div>

          {/* Level Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Severity</label>
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
            >
              <option value="all">All Levels</option>
              <option value="error">Error</option>
              <option value="warn">Warning</option>
              <option value="info">Info</option>
              <option value="debug">Debug</option>
            </select>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Time Frame</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
            >
              <option value="all">All Time</option>
              <option value="1h">Last Hour</option>
              <option value="24h">Last 24H</option>
              <option value="7d">Last 7D</option>
              <option value="30d">Last 30D</option>
            </select>
          </div>

          {/* View Controls */}
          <div className="flex items-end space-x-3">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`flex items-center space-x-2 px-4 py-3 rounded-xl transition-all duration-200 ${
                autoRefresh 
                  ? 'bg-green-600 text-white shadow-lg' 
                  : 'bg-gray-700 text-gray-400 hover:text-white border border-gray-600'
              }`}
            >
              {autoRefresh ? <Pause size={16} /> : <Play size={16} />}
              <span className="text-sm">Live</span>
            </button>
            <select
              value={logsPerPage}
              onChange={(e) => setLogsPerPage(Number(e.target.value))}
              className="px-3 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value={25}>25/page</option>
              <option value={50}>50/page</option>
              <option value={100}>100/page</option>
              <option value={200}>200/page</option>
            </select>
          </div>
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-700">
          <div className="flex items-center space-x-4 text-sm">
            <span className="text-gray-400">
              Displaying <span className="text-white font-semibold">{currentLogs.length}</span> of{' '}
              <span className="text-white font-semibold">{filteredLogs.length}</span> events
            </span>
            {eventType !== 'all' && (
              <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded-lg text-xs">
                {eventTypes.find(e => e.id === eventType)?.label}
              </span>
            )}
          </div>
          {(searchTerm || userFilter || eventType !== 'all' || levelFilter !== 'all' || dateRange !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setUserFilter('');
                setEventType('all');
                setLevelFilter('all');
                setDateRange('all');
              }}
              className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
            >
              Clear all filters
            </button>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 animate-pulse">
          <div className="flex items-center space-x-2 text-red-400">
            <AlertCircle size={16} />
            <span className="font-medium">{error}</span>
          </div>
        </div>
      )}

      {/* Enhanced Logs Display */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700 shadow-2xl overflow-hidden">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FileText className="w-10 h-10 text-gray-500" />
            </div>
            <p className="text-gray-400 text-lg font-medium">No quantum events detected</p>
            <p className="text-gray-500 mt-2">
              {logs.length === 0 
                ? "Log system is initializing. Ensure backend services are running."
                : "Adjust your search parameters to reveal hidden events."
              }
            </p>
          </div>
        ) : (
          <>
            {/* Table View */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">User</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Event</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Level</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Timestamp</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Message</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {currentLogs.map((log, index) => {
                    const globalIndex = (currentPage - 1) * logsPerPage + index;
                    return (
                      <tr 
                        key={globalIndex} 
                        className="hover:bg-gray-700/30 transition-all duration-150 group"
                      >
                        {/* User Column */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                              {getUserAvatar(log)}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-white">
                                {getUserDisplayName(log)}
                              </span>
                              {log.meta?.role && (
                                <span className="text-xs text-gray-400 capitalize">
                                  {log.meta.role}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Event Column */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            {getEventIcon(log)}
                          </div>
                        </td>

                        {/* Level Column */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            {getLevelIcon(log.level)}
                            <span className={`px-3 py-1 text-xs font-medium rounded-full bg-gradient-to-r ${getLevelColor(log.level)} border text-white`}>
                              {log.level}
                            </span>
                          </div>
                        </td>

                        {/* Timestamp Column */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-white">
                              {formatTimestamp(log.timestamp)}
                            </span>
                            <span className="text-xs text-gray-400">
                              {formatRelativeTime(log.timestamp)}
                            </span>
                          </div>
                        </td>

                        {/* Message Column */}
                        <td className="px-6 py-4">
                          <div className="max-w-md">
                            <div className="text-sm text-white font-medium line-clamp-2">
                              {log.message}
                            </div>
                            {log.method && log.url && (
                              <div className="mt-2 flex items-center space-x-2">
                                <span className={`px-2 py-1 text-xs font-mono rounded ${getStatusColor(log.statusCode)}`}>
                                  {log.method}
                                </span>
                                <span className="text-xs text-gray-400 truncate flex-1">
                                  {log.url}
                                </span>
                                {log.statusCode && (
                                  <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(log.statusCode)}`}>
                                    {log.statusCode}
                                  </span>
                                )}
                              </div>
                            )}
                            
                            {/* Expanded View */}
                            {expandedLogs.has(globalIndex) && (
                              <div className="mt-3 p-4 bg-gray-700/50 rounded-xl border border-gray-600">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                  <div>
                                    <h4 className="font-semibold text-gray-300 mb-2">Event Details</h4>
                                    <pre className="text-gray-400 whitespace-pre-wrap">
                                      {JSON.stringify({
                                        timestamp: log.timestamp,
                                        level: log.level,
                                        message: log.message,
                                        ...(log.method && { method: log.method, url: log.url, statusCode: log.statusCode }),
                                        ...(log.ip && { ip: log.ip }),
                                        ...(log.duration && { duration: log.duration })
                                      }, null, 2)}
                                    </pre>
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-gray-300 mb-2">User Context</h4>
                                    <pre className="text-gray-400 whitespace-pre-wrap">
                                      {JSON.stringify({
                                        userId: log.userId,
                                        ...log.meta
                                      }, null, 2)}
                                    </pre>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Actions Column */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => toggleLogExpansion(globalIndex)}
                              className="p-2 text-gray-400 hover:text-white hover:bg-gray-600 rounded-lg transition-all duration-200"
                              title={expandedLogs.has(globalIndex) ? 'Collapse' : 'Expand'}
                            >
                              {expandedLogs.has(globalIndex) ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </button>
                            <button
                              onClick={() => navigator.clipboard.writeText(JSON.stringify(log, null, 2))}
                              className="p-2 text-gray-400 hover:text-white hover:bg-gray-600 rounded-lg transition-all duration-200"
                              title="Copy event data"
                            >
                              <FileText size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Advanced Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-700 bg-gray-800/50">
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <span>Showing</span>
                  <span className="text-white font-semibold">
                    {((currentPage - 1) * logsPerPage) + 1}-{Math.min(currentPage * logsPerPage, filteredLogs.length)}
                  </span>
                  <span>of</span>
                  <span className="text-white font-semibold">{filteredLogs.length}</span>
                  <span>events</span>
                </div>
                
                <div className="flex items-center space-x-1">
                  {/* First Page */}
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="p-2 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <SkipBack size={16} />
                  </button>

                  {/* Previous Page */}
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft size={16} />
                  </button>

                  {/* Page Numbers */}
                  {paginationRange.map((page, index) => (
                    <button
                      key={index}
                      onClick={() => typeof page === 'number' && setCurrentPage(page)}
                      className={`min-w-[40px] px-3 py-2 rounded-lg transition-all duration-200 ${
                        currentPage === page
                          ? 'bg-gradient-to-r from-purple-500 to-blue-600 text-white shadow-lg'
                          : 'text-gray-400 hover:text-white hover:bg-gray-700'
                      } ${typeof page !== 'number' ? 'cursor-default' : ''}`}
                      disabled={typeof page !== 'number'}
                    >
                      {page}
                    </button>
                  ))}

                  {/* Next Page */}
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight size={16} />
                  </button>

                  {/* Last Page */}
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="p-2 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <SkipForward size={16} />
                  </button>
                </div>

                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <span>Page</span>
                  <span className="text-white font-semibold">{currentPage}</span>
                  <span>of</span>
                  <span className="text-white font-semibold">{totalPages}</span>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* System Status Footer */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>System: Operational</span>
          </div>
          <div className="flex items-center space-x-2">
            <Database size={14} />
            <span>Logs: {logs.length.toLocaleString()}</span>
          </div>
          <div className="flex items-center space-x-2">
            <User size={14} />
            <span>Active Users: {stats.activeUsers.size}</span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Zap size={14} />
          <span>Quantum Log Monitor v2.0</span>
        </div>
      </div>
    </div>
  );
};

export default Logs;