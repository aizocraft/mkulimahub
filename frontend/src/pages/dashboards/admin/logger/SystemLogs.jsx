import { useState, useEffect, useMemo } from 'react';
import { logService } from '../../../../services/logService';
import LogFilters from './components/LogFilters';
import LogStats from './components/LogStats';
import LogTable from './components/LogTable';
import Pagination from './components/Pagination';
import { 
  Server, 
  Cpu, 
  Database, 
  Network,
  HardDrive,
  AlertTriangle,
  Settings,
  Activity
} from 'lucide-react';

const SystemLogs = () => {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [systemType, setSystemType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [logsPerPage, setLogsPerPage] = useState(20);

  const systemTypes = [
    { id: 'all', label: 'All System Events', icon: Server },
    { id: 'api', label: 'API Requests', icon: Network },
    { id: 'database', label: 'Database', icon: Database },
    { id: 'error', label: 'System Errors', icon: AlertTriangle },
    { id: 'performance', label: 'Performance', icon: Activity },
    { id: 'startup', label: 'Startup/Shutdown', icon: Settings },
    { id: 'security', label: 'Security Events', icon: HardDrive }
  ];

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    filterLogs();
    setCurrentPage(1);
  }, [logs, searchTerm, levelFilter, dateRange, systemType]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await logService.getAllLogs();
      const systemLogs = (response.logs || []).filter(log => 
        log.method && log.url || // API requests
        log.level === 'error' || // Errors
        log.message?.includes('system') ||
        log.message?.includes('database') ||
        log.message?.includes('server') ||
        log.message?.includes('API') ||
        log.message?.includes('startup') ||
        log.message?.includes('shutdown') ||
        log.message?.includes('performance') ||
        log.message?.includes('memory') ||
        log.message?.includes('cpu')
      );
      setLogs(systemLogs);
    } catch (err) {
      setError('Failed to fetch system logs');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterLogs = () => {
    let filtered = [...logs];

    // Filter by system type
    if (systemType !== 'all') {
      switch (systemType) {
        case 'api':
          filtered = filtered.filter(log => log.method && log.url);
          break;
        case 'database':
          filtered = filtered.filter(log => 
            log.message?.includes('database') || 
            log.message?.includes('Database') ||
            log.message?.includes('mongodb') ||
            log.message?.includes('MongoDB')
          );
          break;
        case 'error':
          filtered = filtered.filter(log => log.level === 'error');
          break;
        case 'performance':
          filtered = filtered.filter(log => 
            log.message?.includes('performance') || 
            log.message?.includes('slow') ||
            log.message?.includes('timeout') ||
            log.duration > 1000 // Requests taking more than 1 second
          );
          break;
        case 'startup':
          filtered = filtered.filter(log => 
            log.message?.includes('startup') || 
            log.message?.includes('shutdown') ||
            log.message?.includes('Server started') ||
            log.message?.includes('Application listening')
          );
          break;
        case 'security':
          filtered = filtered.filter(log => 
            log.message?.includes('security') || 
            log.message?.includes('Security') ||
            log.message?.includes('unauthorized') ||
            log.message?.includes('forbidden') ||
            log.message?.includes('blocked')
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
        log.method?.toLowerCase().includes(term) ||
        log.url?.toLowerCase().includes(term) ||
        log.ip?.toLowerCase().includes(term) ||
        (log.duration && log.duration.toString().includes(term))
      );
    }

    setFilteredLogs(filtered);
  };

  // Stats calculation
  const stats = useMemo(() => {
    const apiRequests = filteredLogs.filter(log => log.method && log.url).length;
    const errors = filteredLogs.filter(log => log.level === 'error').length;
    const warnings = filteredLogs.filter(log => log.level === 'warn').length;
    
    const slowRequests = filteredLogs.filter(log => 
      log.duration > 1000
    ).length;

    const status4xx = filteredLogs.filter(log => 
      log.statusCode >= 400 && log.statusCode < 500
    ).length;

    const status5xx = filteredLogs.filter(log => 
      log.statusCode >= 500
    ).length;

    return {
      total: filteredLogs.length,
      apiRequests,
      errors,
      warnings,
      slowRequests,
      status4xx,
      status5xx,
      errorRate: apiRequests > 0 ? Math.round(((status4xx + status5xx) / apiRequests) * 100) : 0
    };
  }, [filteredLogs]);

  const quickActions = [
    { label: 'API Requests', search: '', type: 'api' },
    { label: 'System Errors', search: 'error', type: 'error' },
    { label: 'Slow Requests', search: 'slow', type: 'performance' },
    { label: 'Security Events', search: 'unauthorized', type: 'security' }
  ];

  const handleQuickAction = (action) => {
    setSearchTerm(action.search);
    setSystemType(action.type);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading system logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickActions.map((action, index) => (
          <button
            key={index}
            onClick={() => handleQuickAction(action)}
            className="p-4 bg-gray-700/50 border border-gray-600 rounded-xl hover:border-orange-500/50 transition-all duration-200 text-left group"
          >
            <div className="text-sm font-medium text-gray-300 group-hover:text-white">
              {action.label}
            </div>
          </button>
        ))}
      </div>

      {/* Stats */}
      <LogStats stats={stats} />

      {/* Filters */}
      <LogFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        levelFilter={levelFilter}
        setLevelFilter={setLevelFilter}
        dateRange={dateRange}
        setDateRange={setDateRange}
        typeFilter={systemType}
        setTypeFilter={setSystemType}
        types={systemTypes}
        logsPerPage={logsPerPage}
        setLogsPerPage={setLogsPerPage}
      />

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
          <div className="flex items-center space-x-2 text-red-400">
            <AlertTriangle size={16} />
            <span>{error}</span>
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

export default SystemLogs;