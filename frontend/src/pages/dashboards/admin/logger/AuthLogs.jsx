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

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    filterLogs();
    setCurrentPage(1);
  }, [logs, searchTerm, levelFilter, dateRange, authType]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await logService.getAllLogs();
      const authLogs = (response.logs || []).filter(log => 
        log.message?.includes('LOGIN') ||
        log.message?.includes('REGISTRATION') ||
        log.message?.includes('PASSWORD') ||
        log.message?.includes('GOOGLE') ||
        log.message?.includes('OAUTH') ||
        log.message?.includes('AUTH') ||
        log.message?.includes('VERIFICATION') ||
        log.message?.includes('AUTHENTICATION') ||
        log.message?.includes('logged in') ||
        log.message?.includes('registered') ||
        log.message?.includes('password') ||
        log.message?.includes('Google') ||
        log.message?.includes('OAuth') ||
        log.message?.includes('auth') ||
        log.message?.includes('verification') ||
        log.message?.includes('Authentication')
      );
      setLogs(authLogs);
    } catch (err) {
      setError('Failed to fetch authentication logs. Make sure the backend is running.');
      console.error('Error fetching auth logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterLogs = () => {
    let filtered = [...logs];

    // Filter by auth type
    if (authType !== 'all') {
      switch (authType) {
        case 'login':
          filtered = filtered.filter(log => 
            log.message?.includes('LOGIN') || 
            log.message?.includes('Login') ||
            log.message?.includes('logged in') ||
            (log.message?.includes('successful') && log.message?.includes('login'))
          );
          break;
        case 'registration':
          filtered = filtered.filter(log => 
            log.message?.includes('REGISTRATION') || 
            log.message?.includes('Registration') ||
            log.message?.includes('registered') ||
            log.message?.includes('User registered') ||
            log.message?.includes('User created')
          );
          break;
        case 'password':
          filtered = filtered.filter(log => 
            log.message?.includes('PASSWORD') || 
            log.message?.includes('Password') ||
            log.message?.includes('password change') ||
            log.message?.includes('Password changed')
          );
          break;
        case 'oauth':
          filtered = filtered.filter(log => 
            log.message?.includes('GOOGLE') || 
            log.message?.includes('Google') ||
            log.message?.includes('OAUTH') ||
            log.message?.includes('OAuth')
          );
          break;
        case 'verification':
          filtered = filtered.filter(log => 
            log.message?.includes('VERIFICATION') || 
            log.message?.includes('Verification') ||
            log.message?.includes('verified') ||
            log.message?.includes('email verification')
          );
          break;
        case 'failed':
          filtered = filtered.filter(log => 
            (log.message?.includes('failed') || 
             log.message?.includes('invalid') ||
             log.message?.includes('error')) && 
            (log.message?.includes('login') || 
             log.message?.includes('auth') ||
             log.message?.includes('password') ||
             log.level === 'error')
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
      let cutoffDate = new Date();
      switch (dateRange) {
        case '1h': cutoffDate.setHours(now.getHours() - 1); break;
        case '24h': cutoffDate.setDate(now.getDate() - 1); break;
        case '7d': cutoffDate.setDate(now.getDate() - 7); break;
        case '30d': cutoffDate.setDate(now.getDate() - 30); break;
        default: break;
      }
      filtered = filtered.filter(log => new Date(log.timestamp) >= cutoffDate);
    }

    // Apply search term filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(log => 
        log.message?.toLowerCase().includes(term) ||
        log.level?.toLowerCase().includes(term) ||
        log.userId?.toLowerCase().includes(term) ||
        (log.meta?.email && log.meta.email.toLowerCase().includes(term)) ||
        (log.meta?.name && log.meta.name.toLowerCase().includes(term)) ||
        (log.meta?.role && log.meta.role.toLowerCase().includes(term))
      );
    }

    setFilteredLogs(filtered);
  };

  // Enhanced stats calculation
  const stats = useMemo(() => {
    const successfulLogins = filteredLogs.filter(log => 
      log.message?.includes('LOGIN_SUCCESSFUL') || 
      log.message?.includes('Login successful') || 
      log.message?.includes('logged in successfully') ||
      (log.message?.includes('successful') && log.message?.includes('login'))
    ).length;

    const failedLogins = filteredLogs.filter(log => 
      log.message?.includes('LOGIN_FAILED') || 
      log.message?.includes('Login failed') || 
      log.message?.includes('invalid password') ||
      log.message?.includes('user not found') ||
      (log.message?.includes('failed') && log.message?.includes('login'))
    ).length;

    const registrations = filteredLogs.filter(log => 
      log.message?.includes('REGISTRATION_SUCCESSFUL') || 
      log.message?.includes('Registration successful') || 
      log.message?.includes('User registered successfully') ||
      (log.message?.includes('registered') && log.message?.includes('successfully'))
    ).length;

    const passwordChanges = filteredLogs.filter(log => 
      log.message?.includes('PASSWORD_CHANGED') || 
      log.message?.includes('Password changed successfully') ||
      log.message?.includes('password change successful')
    ).length;

    const googleAuth = filteredLogs.filter(log => 
      log.message?.includes('GOOGLE_OAUTH') || 
      log.message?.includes('Google OAuth') ||
      log.message?.includes('Google authentication')
    ).length;

    const uniqueUsers = new Set(
      filteredLogs
        .filter(log => log.userId && log.userId !== 'anonymous')
        .map(log => log.userId)
    ).size;

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
      uniqueUsers,
      successRate
    };
  }, [filteredLogs]);

  const quickActions = [
    { 
      label: 'Successful Logins', 
      search: 'Login successful', 
      type: 'login',
      icon: CheckCircle,
      color: 'hover:bg-green-500/20 border-green-500/30'
    },
    { 
      label: 'Failed Logins', 
      search: 'Login failed', 
      type: 'failed',
      icon: XCircle,
      color: 'hover:bg-red-500/20 border-red-500/30'
    },
    { 
      label: 'New Registrations', 
      search: 'registered', 
      type: 'registration',
      icon: UserPlus,
      color: 'hover:bg-blue-500/20 border-blue-500/30'
    },
    { 
      label: 'Google OAuth', 
      search: 'Google', 
      type: 'oauth',
      icon: Mail,
      color: 'hover:bg-red-500/20 border-red-500/30'
    }
  ];

  const handleQuickAction = (action) => {
    setSearchTerm(action.search);
    setAuthType(action.type);
  };

  const exportLogs = () => {
    const dataStr = JSON.stringify(filteredLogs, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `auth-logs-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-white animate-pulse" />
            </div>
            <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping"></div>
          </div>
          <div>
            <p className="text-xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
              Loading Authentication Logs
            </p>
            <p className="text-gray-400 mt-2">Securely fetching user authentication data...</p>
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
            <span>Export</span>
          </button>
          <button
            onClick={fetchLogs}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 rounded-xl transition-all duration-200"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
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
              className={`flex items-center space-x-3 p-4 bg-gray-800 border ${action.color} rounded-xl transition-all duration-200 group hover:scale-105`}
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
          <div className="flex items-center space-x-2 text-red-400">
            <AlertTriangle size={16} />
            <span className="font-medium">{error}</span>
          </div>
        </div>
      )}

      {/* Logs Table */}
      <LogTable
        logs={filteredLogs}
        currentPage={currentPage}
        logsPerPage={logsPerPage}
        loading={loading}
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