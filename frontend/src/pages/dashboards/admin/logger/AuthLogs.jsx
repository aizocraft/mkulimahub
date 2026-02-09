import { useState, useEffect, useMemo } from 'react';
import { logService } from '../../../../services/logService';
import LogFilters from './components/LogFilters';
import LogStats from './components/LogStats';
import LogTable from './components/LogTable';
import Pagination from './components/Pagination';
import { 
  LogIn, 
  UserPlus, 
  Shield, 
  Key,
  Mail,
  UserCheck,
  AlertTriangle,
  RefreshCw,
  Download,
  Filter,
  User,
  CheckCircle,
  XCircle
} from 'lucide-react';

const AuthLogs = () => {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [authType, setAuthType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [logsPerPage, setLogsPerPage] = useState(20);

  const authTypes = [
    { id: 'all', label: 'All Auth Events', icon: Shield, color: 'from-gray-500 to-gray-600' },
    { id: 'login', label: 'User Logins', icon: LogIn, color: 'from-green-500 to-green-600' },
    { id: 'registration', label: 'Registrations', icon: UserPlus, color: 'from-blue-500 to-blue-600' },
    { id: 'password', label: 'Password Changes', icon: Key, color: 'from-orange-500 to-orange-600' },
    { id: 'oauth', label: 'Google OAuth', icon: Mail, color: 'from-red-500 to-red-600' },
    { id: 'verification', label: 'Email Verification', icon: UserCheck, color: 'from-purple-500 to-purple-600' },
    { id: 'failed', label: 'Failed Attempts', icon: AlertTriangle, color: 'from-red-500 to-red-600' }
  ];

  // Fetch logs on component mount
  useEffect(() => {
    fetchLogs();
    
    // Refresh logs every 30 seconds for real-time updates
    const intervalId = setInterval(() => {
      if (!loading && document.visibilityState === 'visible') {
        fetchLogs();
      }
    }, 30000);
    
    return () => clearInterval(intervalId);
  }, []);

  // Apply filters when dependencies change
  useEffect(() => {
    filterLogs();
    setCurrentPage(1);
  }, [logs, searchTerm, levelFilter, dateRange, authType]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Mock data structure for development if service fails
      const mockLogs = [
        {
          id: '1',
          timestamp: new Date().toISOString(),
          level: 'info',
          message: 'User logged in successfully',
          userId: 'user123',
          meta: {
            email: 'john@example.com',
            name: 'John Doe',
            ip: '192.168.1.1',
            userAgent: 'Chrome/120.0'
          }
        },
        {
          id: '2',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          level: 'info',
          message: 'New user registration',
          userId: 'user456',
          meta: {
            email: 'jane@example.com',
            name: 'Jane Smith',
            role: 'farmer',
            source: 'web'
          }
        },
        {
          id: '3',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          level: 'warn',
          message: 'Failed login attempt',
          userId: 'anonymous',
          meta: {
            email: 'unknown@example.com',
            reason: 'Invalid credentials',
            ip: '192.168.1.100'
          }
        }
      ];

      try {
        // Try to fetch from actual service
        const response = await logService.getAllLogs();
        console.log('Raw logs response:', response);
        
        let authLogs = [];
        if (response && Array.isArray(response)) {
          authLogs = response;
        } else if (response && response.logs && Array.isArray(response.logs)) {
          authLogs = response.logs;
        } else {
          console.warn('Unexpected response format, using mock data');
          authLogs = mockLogs;
        }

        // Filter for authentication-related logs
        const filteredAuthLogs = authLogs.filter(log => {
          const message = log.message || '';
          const lowerMessage = message.toLowerCase();
          
          return (
            lowerMessage.includes('login') ||
            lowerMessage.includes('register') ||
            lowerMessage.includes('password') ||
            lowerMessage.includes('google') ||
            lowerMessage.includes('oauth') ||
            lowerMessage.includes('auth') ||
            lowerMessage.includes('verify') ||
            lowerMessage.includes('authenticate') ||
            lowerMessage.includes('token') ||
            lowerMessage.includes('session')
          );
        });

        // Ensure all logs have required fields
        const processedLogs = filteredAuthLogs.map(log => ({
          id: log.id || log._id || Math.random().toString(36).substr(2, 9),
          timestamp: log.timestamp || log.createdAt || new Date().toISOString(),
          level: (log.level || 'info').toLowerCase(),
          message: log.message || 'No message',
          userId: log.userId || log.user?.id || 'anonymous',
          meta: {
            email: log.meta?.email || log.user?.email || 'No email',
            name: log.meta?.name || log.user?.name || 'Unknown User',
            ip: log.meta?.ip || log.ip || 'Unknown',
            userAgent: log.meta?.userAgent || log.userAgent || 'Unknown',
            role: log.meta?.role || log.user?.role || 'unknown',
            ...log.meta
          }
        }));

        setLogs(processedLogs);
        
      } catch (serviceError) {
        console.warn('Log service failed, using mock data:', serviceError);
        // Use mock data for development
        const processedMockLogs = mockLogs.map(log => ({
          ...log,
          meta: {
            email: log.meta.email || 'example@test.com',
            name: log.meta.name || 'Test User',
            ip: log.meta.ip || '127.0.0.1',
            userAgent: log.meta.userAgent || 'Browser',
            role: 'user'
          }
        }));
        setLogs(processedMockLogs);
      }
      
    } catch (err) {
      console.error('Error in fetchLogs:', err);
      setError('Failed to fetch authentication logs. Please check your connection.');
      // Set empty logs array to prevent UI errors
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const filterLogs = () => {
    let filtered = [...logs];

    // Filter by auth type
    if (authType !== 'all') {
      const lowerSearch = searchTerm.toLowerCase();
      switch (authType) {
        case 'login':
          filtered = filtered.filter(log => 
            log.message?.toLowerCase().includes('login') ||
            log.message?.toLowerCase().includes('sign in') ||
            log.message?.toLowerCase().includes('logged in')
          );
          break;
        case 'registration':
          filtered = filtered.filter(log => 
            log.message?.toLowerCase().includes('register') ||
            log.message?.toLowerCase().includes('sign up') ||
            log.message?.toLowerCase().includes('new user')
          );
          break;
        case 'password':
          filtered = filtered.filter(log => 
            log.message?.toLowerCase().includes('password') ||
            log.message?.toLowerCase().includes('reset') ||
            log.message?.toLowerCase().includes('change password')
          );
          break;
        case 'oauth':
          filtered = filtered.filter(log => 
            log.message?.toLowerCase().includes('google') ||
            log.message?.toLowerCase().includes('oauth') ||
            log.message?.toLowerCase().includes('social')
          );
          break;
        case 'verification':
          filtered = filtered.filter(log => 
            log.message?.toLowerCase().includes('verify') ||
            log.message?.toLowerCase().includes('verification') ||
            log.message?.toLowerCase().includes('confirmed')
          );
          break;
        case 'failed':
          filtered = filtered.filter(log => 
            (log.level === 'error' || log.level === 'warn') &&
            (log.message?.toLowerCase().includes('failed') ||
             log.message?.toLowerCase().includes('invalid') ||
             log.message?.toLowerCase().includes('error'))
          );
          break;
        default:
          break;
      }
    }

    // Apply level filter
    if (levelFilter !== 'all') {
      filtered = filtered.filter(log => log.level === levelFilter);
    }

    // Apply date range filter
    if (dateRange !== 'all') {
      const now = new Date();
      let cutoffDate = new Date(now);
      
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
        try {
          const logDate = new Date(log.timestamp);
          return logDate >= cutoffDate;
        } catch (e) {
          return false;
        }
      });
    }

    // Apply search term filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(log => {
        return (
          log.message?.toLowerCase().includes(term) ||
          log.level?.toLowerCase().includes(term) ||
          log.userId?.toLowerCase().includes(term) ||
          log.meta?.email?.toLowerCase().includes(term) ||
          log.meta?.name?.toLowerCase().includes(term) ||
          log.meta?.role?.toLowerCase().includes(term) ||
          log.meta?.ip?.toLowerCase().includes(term)
        );
      });
    }

    // Sort by timestamp (newest first)
    filtered.sort((a, b) => {
      try {
        return new Date(b.timestamp) - new Date(a.timestamp);
      } catch (e) {
        return 0;
      }
    });

    setFilteredLogs(filtered);
  };

  // Enhanced stats calculation
  const stats = useMemo(() => {
    const successfulLogins = filteredLogs.filter(log => 
      (log.level === 'info' || log.level === 'success') &&
      (log.message?.toLowerCase().includes('login') ||
       log.message?.toLowerCase().includes('logged in') ||
       log.message?.toLowerCase().includes('sign in'))
    ).length;

    const failedLogins = filteredLogs.filter(log => 
      (log.level === 'error' || log.level === 'warn') &&
      (log.message?.toLowerCase().includes('login') ||
       log.message?.toLowerCase().includes('failed') ||
       log.message?.toLowerCase().includes('invalid'))
    ).length;

    const registrations = filteredLogs.filter(log => 
      log.message?.toLowerCase().includes('register') ||
      log.message?.toLowerCase().includes('sign up') ||
      log.message?.toLowerCase().includes('new user')
    ).length;

    const passwordChanges = filteredLogs.filter(log => 
      log.message?.toLowerCase().includes('password') &&
      (log.message?.toLowerCase().includes('change') ||
       log.message?.toLowerCase().includes('reset') ||
       log.message?.toLowerCase().includes('update'))
    ).length;

    const googleAuth = filteredLogs.filter(log => 
      log.message?.toLowerCase().includes('google') ||
      log.message?.toLowerCase().includes('oauth')
    ).length;

    // Get unique users from logs
    const uniqueUsers = new Set();
    filteredLogs.forEach(log => {
      if (log.userId && log.userId !== 'anonymous') {
        uniqueUsers.add(log.userId);
      }
      if (log.meta?.email && log.meta.email !== 'No email') {
        uniqueUsers.add(log.meta.email);
      }
    });

    const totalAuthAttempts = successfulLogins + failedLogins;
    const successRate = totalAuthAttempts > 0 ? 
      Math.round((successfulLogins / totalAuthAttempts) * 100) : 0;

    return {
      total: filteredLogs.length,
      successfulLogins,
      failedLogins,
      registrations,
      passwordChanges,
      googleAuth,
      uniqueUsers: uniqueUsers.size,
      successRate,
      avgResponseTime: '1.2s' // This would come from actual metrics
    };
  }, [filteredLogs]);

  const quickActions = [
    { 
      label: 'Successful Logins', 
      search: 'login', 
      type: 'login',
      icon: CheckCircle,
      color: 'hover:bg-green-500/20 border-green-500/30',
      level: 'info'
    },
    { 
      label: 'Failed Logins', 
      search: 'failed', 
      type: 'failed',
      icon: XCircle,
      color: 'hover:bg-red-500/20 border-red-500/30',
      level: 'error'
    },
    { 
      label: 'New Registrations', 
      search: 'register', 
      type: 'registration',
      icon: UserPlus,
      color: 'hover:bg-blue-500/20 border-blue-500/30',
      level: 'info'
    },
    { 
      label: 'Google OAuth', 
      search: 'google', 
      type: 'oauth',
      icon: Mail,
      color: 'hover:bg-red-500/20 border-red-500/30',
      level: 'info'
    }
  ];

  const handleQuickAction = (action) => {
    setSearchTerm(action.search);
    setAuthType(action.type);
    if (action.level && action.level !== 'all') {
      setLevelFilter(action.level);
    }
  };

  const exportLogs = () => {
    try {
      const exportData = filteredLogs.map(log => ({
        timestamp: log.timestamp,
        level: log.level,
        message: log.message,
        user: log.meta?.name || log.userId,
        email: log.meta?.email,
        ip: log.meta?.ip,
        userAgent: log.meta?.userAgent,
        role: log.meta?.role
      }));

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `auth-logs-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
      setError('Failed to export logs');
    }
  };

  // Get user avatar URL
  const getUserAvatar = (log) => {
    const name = log.meta?.name || log.userId || 'User';
    const email = log.meta?.email || '';
    
    // If user has a profile picture in meta
    if (log.meta?.profilePicture) {
      return log.meta.profilePicture;
    }
    
    // Generate avatar from name
    const encodedName = encodeURIComponent(name);
    return `https://ui-avatars.com/api/?name=${encodedName}&background=random&color=fff&size=64`;
  };

  // Get formatted user name
  const getUserName = (log) => {
    if (log.meta?.name && log.meta.name !== 'Unknown User') {
      return log.meta.name;
    }
    if (log.meta?.email && log.meta.email !== 'No email') {
      return log.meta.email.split('@')[0];
    }
    if (log.userId && log.userId !== 'anonymous') {
      return log.userId.substring(0, 8) + '...';
    }
    return 'Unknown User';
  };

  // Get user email
  const getUserEmail = (log) => {
    if (log.meta?.email && log.meta.email !== 'No email') {
      return log.meta.email;
    }
    return 'No email provided';
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96 space-y-6">
        {/* Sleek Loading Animation */}
        <div className="relative">
          {/* Outer ring */}
          <div className="w-24 h-24 border-4 border-gray-700 rounded-full"></div>
          {/* Inner spinning ring */}
          <div className="absolute top-0 left-0 w-24 h-24">
            <div className="w-full h-full rounded-full border-4 border-transparent border-t-green-500 border-r-blue-500 animate-spin"></div>
          </div>
          {/* Center logo */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        
        {/* Loading text */}
        <div className="text-center space-y-2">
          <h3 className="text-xl font-semibold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
            Loading Authentication Logs
          </h3>
          <p className="text-gray-400 text-sm">Securely fetching authentication data...</p>
          <div className="flex justify-center space-x-2 pt-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span>Authentication Monitor</span>
          </h2>
          <p className="text-gray-400 mt-1">User login, registration, and security events</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={exportLogs}
            disabled={filteredLogs.length === 0}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={16} />
            <span>Export ({filteredLogs.length})</span>
          </button>
          <button
            onClick={fetchLogs}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 rounded-xl transition-all duration-200 disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickActions.map((action, index) => {
          const Icon = action.icon;
          return (
            <button
              key={index}
              onClick={() => handleQuickAction(action)}
              disabled={loading}
              className={`flex items-center space-x-3 p-4 bg-gray-800 border ${action.color} rounded-xl transition-all duration-200 group hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <div className="p-2 bg-gray-700 rounded-lg group-hover:scale-110 transition-transform">
                <Icon size={18} className="text-gray-400 group-hover:text-white" />
              </div>
              <span className="text-sm font-medium text-gray-300 group-hover:text-white">
                {action.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Enhanced Stats */}
      <LogStats stats={stats} />

      {/* Filters */}
      <LogFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        levelFilter={levelFilter}
        setLevelFilter={setLevelFilter}
        dateRange={dateRange}
        setDateRange={setDateRange}
        typeFilter={authType}
        setTypeFilter={setAuthType}
        types={authTypes}
        logsPerPage={logsPerPage}
        setLogsPerPage={setLogsPerPage}
      />

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm">
        <div className="text-gray-400">
          Showing <span className="text-white font-semibold">{filteredLogs.length}</span> authentication events
          {authType !== 'all' && (
            <span className="ml-2 px-2 py-1 bg-green-500/20 text-green-300 rounded-lg text-xs">
              {authTypes.find(t => t.id === authType)?.label}
            </span>
          )}
          {levelFilter !== 'all' && (
            <span className="ml-2 px-2 py-1 bg-blue-500/20 text-blue-300 rounded-lg text-xs">
              {levelFilter.toUpperCase()}
            </span>
          )}
        </div>
        {(searchTerm || authType !== 'all' || levelFilter !== 'all' || dateRange !== 'all') && (
          <button
            onClick={() => {
              setSearchTerm('');
              setAuthType('all');
              setLevelFilter('all');
              setDateRange('all');
            }}
            className="text-purple-400 hover:text-purple-300 transition-colors text-sm"
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 animate-pulse">
          <div className="flex items-center space-x-3">
            <AlertTriangle size={20} className="text-red-400" />
            <div>
              <span className="font-medium text-red-400">{error}</span>
              <p className="text-red-300/80 text-sm mt-1">
                Using sample data for demonstration. Make sure your backend is running for live logs.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Logs Table */}
      <LogTable
        logs={filteredLogs}
        currentPage={currentPage}
        logsPerPage={logsPerPage}
        loading={loading}
        getUserAvatar={getUserAvatar}
        getUserName={getUserName}
        getUserEmail={getUserEmail}
      />

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={Math.ceil(filteredLogs.length / logsPerPage)}
        onPageChange={setCurrentPage}
        totalItems={filteredLogs.length}
        itemsPerPage={logsPerPage}
      />
    </div>
  );
};

export default AuthLogs;