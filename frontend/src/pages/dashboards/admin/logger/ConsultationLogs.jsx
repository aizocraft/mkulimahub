import { useState, useEffect, useMemo } from 'react';
import { logService } from '../../../../services/logService';
import LogFilters from './components/LogFilters';
import LogStats from './components/LogStats';
import LogTable from './components/LogTable';
import Pagination from './components/Pagination';
import { 
  MessageSquare, 
  Video, 
  Calendar,
  Clock,
  DollarSign,
  Star,
  UserCheck,
  UserX
} from 'lucide-react';

const ConsultationLogs = () => {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [consultationType, setConsultationType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [logsPerPage, setLogsPerPage] = useState(20);

  const consultationTypes = [
    { id: 'all', label: 'All Consultations', icon: MessageSquare },
    { id: 'scheduled', label: 'Scheduled Sessions', icon: Calendar },
    { id: 'completed', label: 'Completed', icon: UserCheck },
    { id: 'cancelled', label: 'Cancelled', icon: UserX },
    { id: 'video', label: 'Video Calls', icon: Video },
    { id: 'payment', label: 'Payments', icon: DollarSign },
    { id: 'rating', label: 'Ratings & Reviews', icon: Star }
  ];

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    filterLogs();
    setCurrentPage(1);
  }, [logs, searchTerm, levelFilter, dateRange, consultationType]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await logService.getAllLogs();
      // Since consultation logs aren't implemented yet, we'll filter for any relevant logs
      const consultationLogs = (response.logs || []).filter(log => 
        log.message?.includes('consultation') ||
        log.message?.includes('session') ||
        log.message?.includes('meeting') ||
        log.message?.includes('call') ||
        log.message?.includes('booking') ||
        log.message?.includes('schedule') ||
        log.message?.includes('payment') ||
        log.message?.includes('rating') ||
        log.message?.includes('review')
      );
      setLogs(consultationLogs);
    } catch (err) {
      setError('Failed to fetch consultation logs');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterLogs = () => {
    let filtered = [...logs];

    // Filter by consultation type
    if (consultationType !== 'all') {
      switch (consultationType) {
        case 'scheduled':
          filtered = filtered.filter(log => 
            log.message?.includes('scheduled') || 
            log.message?.includes('booking') ||
            log.message?.includes('appointment')
          );
          break;
        case 'completed':
          filtered = filtered.filter(log => 
            log.message?.includes('completed') || 
            log.message?.includes('finished') ||
            log.message?.includes('ended')
          );
          break;
        case 'cancelled':
          filtered = filtered.filter(log => 
            log.message?.includes('cancelled') || 
            log.message?.includes('canceled') ||
            log.message?.includes('cancellation')
          );
          break;
        case 'video':
          filtered = filtered.filter(log => 
            log.message?.includes('video') || 
            log.message?.includes('call') ||
            log.message?.includes('meeting')
          );
          break;
        case 'payment':
          filtered = filtered.filter(log => 
            log.message?.includes('payment') || 
            log.message?.includes('paid') ||
            log.message?.includes('transaction')
          );
          break;
        case 'rating':
          filtered = filtered.filter(log => 
            log.message?.includes('rating') || 
            log.message?.includes('review') ||
            log.message?.includes('feedback')
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
        (log.meta?.expertId && log.meta.expertId.toLowerCase().includes(term)) ||
        (log.meta?.farmerId && log.meta.farmerId.toLowerCase().includes(term))
      );
    }

    setFilteredLogs(filtered);
  };

  // Stats calculation (placeholder data since consultations aren't implemented)
  const stats = useMemo(() => {
    const scheduled = filteredLogs.filter(log => 
      log.message?.includes('scheduled') || 
      log.message?.includes('booking')
    ).length;

    const completed = filteredLogs.filter(log => 
      log.message?.includes('completed') || 
      log.message?.includes('finished')
    ).length;

    const cancelled = filteredLogs.filter(log => 
      log.message?.includes('cancelled') || 
      log.message?.includes('canceled')
    ).length;

    const payments = filteredLogs.filter(log => 
      log.message?.includes('payment') || 
      log.message?.includes('paid')
    ).length;

    const uniqueUsers = new Set(
      filteredLogs
        .filter(log => log.userId && log.userId !== 'anonymous')
        .map(log => log.userId)
    ).size;

    return {
      total: filteredLogs.length,
      scheduled,
      completed,
      cancelled,
      payments,
      uniqueUsers,
      completionRate: scheduled > 0 ? Math.round((completed / scheduled) * 100) : 0
    };
  }, [filteredLogs]);

  const quickActions = [
    { label: 'New Bookings', search: 'scheduled', type: 'scheduled' },
    { label: 'Completed Sessions', search: 'completed', type: 'completed' },
    { label: 'Cancellations', search: 'cancelled', type: 'cancelled' },
    { label: 'Payments', search: 'payment', type: 'payment' }
  ];

  const handleQuickAction = (action) => {
    setSearchTerm(action.search);
    setConsultationType(action.type);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading consultation logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Feature Notice */}
      <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
        <div className="flex items-center space-x-3">
          <MessageSquare className="text-purple-400" size={20} />
          <div>
            <h3 className="font-semibold text-purple-300">Consultation System</h3>
            <p className="text-purple-200 text-sm mt-1">
              The consultation logging system is being implemented. This section will show real-time 
              expert-farmer interactions, session bookings, and consultation analytics.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickActions.map((action, index) => (
          <button
            key={index}
            onClick={() => handleQuickAction(action)}
            className="p-4 bg-gray-700/50 border border-gray-600 rounded-xl hover:border-purple-500/50 transition-all duration-200 text-left group"
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
        typeFilter={consultationType}
        setTypeFilter={setConsultationType}
        types={consultationTypes}
        logsPerPage={logsPerPage}
        setLogsPerPage={setLogsPerPage}
      />

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
          <div className="flex items-center space-x-2 text-red-400">
            <UserX size={16} />
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

export default ConsultationLogs;