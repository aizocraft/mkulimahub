import { useState, useEffect, useMemo } from 'react';
import { logService } from '../../../../services/logService';
import LogFilters from './components/LogFilters';
import LogStats from './components/LogStats';
import LogTable from './components/LogTable';
import Pagination from './components/Pagination';
import { 
  User, 
  UserCheck, 
  UserX, 
  Settings,
  Shield,
  Edit3,
  Activity,
  RefreshCw,
  Download,
  AlertTriangle,
  ArrowRightLeft
} from 'lucide-react';

const UserLogs = () => {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [userAction, setUserAction] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [logsPerPage, setLogsPerPage] = useState(20);

  const userActions = [
    { id: 'all', label: 'All User Actions', icon: User, color: 'from-gray-500 to-gray-600' },
    { id: 'profile', label: 'Profile Updates', icon: Edit3, color: 'from-purple-500 to-purple-600' },
    { id: 'role', label: 'Role Changes', icon: Shield, color: 'from-blue-500 to-blue-600' },
    { id: 'verification', label: 'Verification', icon: UserCheck, color: 'from-green-500 to-green-600' },
    { id: 'deactivation', label: 'Account Status', icon: UserX, color: 'from-red-500 to-red-600' },
    { id: 'settings', label: 'Settings Changes', icon: Settings, color: 'from-orange-500 to-orange-600' },
    { id: 'activity', label: 'User Activity', icon: Activity, color: 'from-cyan-500 to-cyan-600' }
  ];

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    filterLogs();
    setCurrentPage(1);
  }, [logs, searchTerm, levelFilter, dateRange, userAction]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await logService.getAllLogs();
      const userLogs = (response.logs || []).filter(log => 
        log.message?.includes('PROFILE') ||
        log.message?.includes('ROLE') ||
        log.message?.includes('USER') ||
        log.message?.includes('ACCOUNT') ||
        log.message?.includes('VERIFICATION') ||
        log.message?.includes('SETTINGS') ||
        log.message?.includes('profile') ||
        log.message?.includes('Profile') ||
        log.message?.includes('role') ||
        log.message?.includes('Role') ||
        log.message?.includes('user') ||
        log.message?.includes('User') ||
        log.message?.includes('account') ||
        log.message?.includes('Account') ||
        log.message?.includes('verification') ||
        log.message?.includes('deactivated') ||
        log.message?.includes('activated') ||
        log.message?.includes('settings') ||
        log.message?.includes('updated') ||
        log.message?.includes('changed')
      );
      setLogs(userLogs);
    } catch (err) {
      setError('Failed to fetch user management logs. Make sure the backend is running.');
      console.error('Error fetching user logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterLogs = () => {
    let filtered = [...logs];

    // Filter by user action
    if (userAction !== 'all') {
      switch (userAction) {
        case 'profile':
          filtered = filtered.filter(log => 
            log.message?.includes('PROFILE_UPDATE') || 
            log.message?.includes('Profile updated') ||
            log.message?.includes('updated profile') ||
            (log.message?.includes('profile') && log.message?.includes('update'))
          );
          break;
        case 'role':
          filtered = filtered.filter(log => 
            log.message?.includes('ROLE_UPDATE') || 
            log.message?.includes('Role updated') ||
            log.message?.includes('Role changed') ||
            log.message?.includes('role update') ||
            (log.message?.includes('role') && (log.message?.includes('update') || log.message?.includes('changed')))
          );
          break;
        case 'verification':
          filtered = filtered.filter(log => 
            log.message?.includes('VERIFICATION') || 
            log.message?.includes('verified') ||
            log.message?.includes('Verification') ||
            (log.message?.includes('verify') || log.message?.includes('verified'))
          );
          break;
        case 'deactivation':
          filtered = filtered.filter(log => 
            log.message?.includes('DEACTIVATED') || 
            log.message?.includes('ACTIVATED') ||
            log.message?.includes('deactivated') || 
            log.message?.includes('activated') ||
            log.message?.includes('Account status') ||
            (log.message?.includes('account') && (log.message?.includes('deactivated') || log.message?.includes('activated')))
          );
          break;
        case 'settings':
          filtered = filtered.filter(log => 
            log.message?.includes('SETTINGS') || 
            log.message?.includes('Settings') ||
            log.message?.includes('settings update') ||
            (log.message?.includes('password') && log.message?.includes('changed')) ||
            log.message?.includes('preferences')
          );
          break;
        case 'activity':
          filtered = filtered.filter(log => 
            log.message?.includes('ACTIVITY') || 
            log.message?.includes('Activity') ||
            log.message?.includes('last login') ||
            log.message?.includes('User activity') ||
            (log.message?.includes('active') && log.message?.includes('user'))
          );
          break;
        default:
          break;
      }
    }

    // Apply other filters
    if (levelFilter !== 'all') {
      filtered = filtered.filter(log => log.level === levelFilter);
    }

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

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(log => 
        log.message?.toLowerCase().includes(term) ||
        log.userId?.toLowerCase().includes(term) ||
        (log.meta?.email && log.meta.email.toLowerCase().includes(term)) ||
        (log.meta?.name && log.meta.name.toLowerCase().includes(term)) ||
        (log.meta?.role && log.meta.role.toLowerCase().includes(term)) ||
        (log.meta?.oldRole && log.meta.oldRole.toLowerCase().includes(term)) ||
        (log.meta?.newRole && log.meta.newRole.toLowerCase().includes(term))
      );
    }

    setFilteredLogs(filtered);
  };

  // Enhanced stats calculation
  const stats = useMemo(() => {
    const profileUpdates = filteredLogs.filter(log => 
      log.message?.includes('PROFILE_UPDATE') || 
      log.message?.includes('Profile updated') ||
      (log.message?.includes('profile') && log.message?.includes('update'))
    ).length;

    const roleChanges = filteredLogs.filter(log => 
      log.message?.includes('ROLE_UPDATE') || 
      log.message?.includes('Role updated') ||
      log.message?.includes('Role changed') ||
      (log.message?.includes('role') && (log.message?.includes('update') || log.message?.includes('changed')))
    ).length;

    const accountStatus = filteredLogs.filter(log => 
      log.message?.includes('DEACTIVATED') || 
      log.message?.includes('ACTIVATED') ||
      log.message?.includes('deactivated') || 
      log.message?.includes('activated')
    ).length;

    const verifications = filteredLogs.filter(log => 
      log.message?.includes('VERIFICATION') || 
      log.message?.includes('verified') ||
      log.message?.includes('Verification')
    ).length;

    const settingsChanges = filteredLogs.filter(log => 
      log.message?.includes('SETTINGS') || 
      log.message?.includes('Settings') ||
      log.message?.includes('password changed') ||
      log.message?.includes('preferences updated')
    ).length;

    const uniqueUsers = new Set(
      filteredLogs
        .filter(log => log.userId && log.userId !== 'anonymous')
        .map(log => log.userId)
    ).size;

    return {
      total: filteredLogs.length,
      profileUpdates,
      roleChanges,
      accountStatus,
      verifications,
      settingsChanges,
      uniqueUsers,
      activityRate: uniqueUsers > 0 ? Math.round((profileUpdates + roleChanges) / uniqueUsers) : 0
    };
  }, [filteredLogs]);

  const quickActions = [
    { 
      label: 'Profile Updates', 
      search: 'Profile updated', 
      type: 'profile',
      icon: Edit3,
      color: 'hover:bg-purple-500/20 border-purple-500/30'
    },
    { 
      label: 'Role Changes', 
      search: 'Role updated', 
      type: 'role',
      icon: ArrowRightLeft,
      color: 'hover:bg-blue-500/20 border-blue-500/30'
    },
    { 
      label: 'Account Deactivations', 
      search: 'deactivated', 
      type: 'deactivation',
      icon: UserX,
      color: 'hover:bg-red-500/20 border-red-500/30'
    },
    { 
      label: 'User Verifications', 
      search: 'verified', 
      type: 'verification',
      icon: UserCheck,
      color: 'hover:bg-green-500/20 border-green-500/30'
    }
  ];

  const handleQuickAction = (action) => {
    setSearchTerm(action.search);
    setUserAction(action.type);
  };

  const exportLogs = () => {
    const dataStr = JSON.stringify(filteredLogs, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `user-logs-${new Date().toISOString().split('T')[0]}.json`;
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
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-white animate-pulse" />
            </div>
            <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-ping"></div>
          </div>
          <div>
            <p className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Loading User Management Logs
            </p>
            <p className="text-gray-400 mt-2">Fetching user activity and profile changes...</p>
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
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <span>User Management Monitor</span>
          </h2>
          <p className="text-gray-400 mt-1">Profile updates, role changes, and user activities</p>
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
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl transition-all duration-200"
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
        typeFilter={userAction}
        setTypeFilter={setUserAction}
        types={userActions}
        logsPerPage={logsPerPage}
        setLogsPerPage={setLogsPerPage}
      />

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm">
        <div className="text-gray-400">
          Showing <span className="text-white font-semibold">{filteredLogs.length}</span> user management events
          {userAction !== 'all' && (
            <span className="ml-2 px-2 py-1 bg-blue-500/20 text-blue-300 rounded-lg text-xs">
              {userActions.find(t => t.id === userAction)?.label}
            </span>
          )}
        </div>
        {(searchTerm || userAction !== 'all' || levelFilter !== 'all' || dateRange !== 'all') && (
          <button
            onClick={() => {
              setSearchTerm('');
              setUserAction('all');
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

export default UserLogs;