import { useState, useEffect, useMemo } from 'react';
import { transactionAPI } from '../../../../api';
import LogFilters from './components/LogFilters';
import LogStats from './components/LogStats';
import LogTable from './components/LogTable';
import Pagination from './components/Pagination';
import {
  CreditCard,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Receipt,
  RefreshCw,
  Download,
  AlertTriangle,
  Eye,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';

const TransactionsLog = () => {
  // State hooks - MUST BE CALLED UNCONDITIONALLY AND IN SAME ORDER
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [transactionType, setTransactionType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [logsPerPage, setLogsPerPage] = useState(20);
  const [selectedLog, setSelectedLog] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Transaction types - this is static data, so it should be outside hooks
  const transactionTypes = useMemo(() => [
    { id: 'all', label: 'All Transactions', icon: CreditCard, color: 'from-gray-500 to-gray-600' },
    { id: 'payment', label: 'Payments', icon: TrendingUp, color: 'from-green-500 to-green-600' },
    { id: 'refund', label: 'Refunds', icon: TrendingDown, color: 'from-red-500 to-red-600' },
    { id: 'transfer', label: 'Transfers', icon: Receipt, color: 'from-blue-500 to-blue-600' }
  ], []);

  // Calculate stats for LogStats component - MUST be called unconditionally
  const stats = useMemo(() => {
    const total = logs.length;
    const errors = logs.filter(log => log.level === 'error').length;
    const successRate = total > 0 ? Math.round(((total - errors) / total) * 100) : 0;
    const uniqueUsers = new Set(logs.map(log => log.userId)).size;

    return {
      total,
      errors,
      successRate,
      uniqueUsers,
      registrations: logs.filter(log => log.message.toLowerCase().includes('registration')).length,
      profileUpdates: logs.filter(log => log.message.toLowerCase().includes('profile')).length
    };
  }, [logs]);

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
  }, [logs, searchTerm, levelFilter, dateRange, transactionType]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch transactions from backend
      const response = await transactionAPI.getAllTransactions({ page: 1, limit: 100 });
      console.log('Raw transactions response:', response);

      let transactions = [];
      if (response && response.data && response.data.data && Array.isArray(response.data.data.transactions)) {
        transactions = response.data.data.transactions;
      } else {
        console.warn('Unexpected response format, using empty array');
        transactions = [];
      }

      // Map transactions to log format
      const processedLogs = transactions.map(transaction => ({
        id: transaction._id || Math.random().toString(36).substr(2, 9),
        timestamp: transaction.createdAt || new Date().toISOString(),
        level: transaction.status === 'completed' ? 'info' : transaction.status === 'failed' ? 'error' : 'warn',
        message: `Transaction ${transaction.type} - ${transaction.status}`,
        userId: transaction.farmer?._id || transaction.expert?._id || 'anonymous',
        meta: {
          transactionId: transaction._id,
          amount: transaction.amount,
          type: transaction.type,
          status: transaction.status,
          farmerId: transaction.farmer?._id,
          expertId: transaction.expert?._id,
          farmerName: transaction.farmer?.name || 'N/A',
          farmerEmail: transaction.farmer?.email || 'N/A',
          expertName: transaction.expert?.name || 'N/A',
          expertEmail: transaction.expert?.email || 'N/A',
          consultationTopic: transaction.consultation?.topic || 'N/A'
        }
      }));

      setLogs(processedLogs);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setError('Failed to load transaction logs');
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const filterLogs = () => {
    let filtered = [...logs];

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(log =>
        log.message.toLowerCase().includes(searchLower) ||
        log.meta?.transactionId?.toLowerCase().includes(searchLower) ||
        log.meta?.farmerName?.toLowerCase().includes(searchLower) ||
        log.meta?.expertName?.toLowerCase().includes(searchLower)
      );
    }

    // Level filter
    if (levelFilter !== 'all') {
      filtered = filtered.filter(log => log.level === levelFilter);
    }

    // Transaction type filter
    if (transactionType !== 'all') {
      filtered = filtered.filter(log => log.meta?.type === transactionType);
    }

    // Date range filter
    if (dateRange !== 'all') {
      const now = new Date();
      const filterDate = new Date();

      switch (dateRange) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          filtered = filtered.filter(log => new Date(log.timestamp) >= filterDate);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          filtered = filtered.filter(log => new Date(log.timestamp) >= filterDate);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          filtered = filtered.filter(log => new Date(log.timestamp) >= filterDate);
          break;
        default:
          break;
      }
    }

    setFilteredLogs(filtered);
  };

  // Calculate paginated logs
  const paginatedLogs = useMemo(() => {
    return filteredLogs.slice(
      (currentPage - 1) * logsPerPage,
      currentPage * logsPerPage
    );
  }, [filteredLogs, currentPage, logsPerPage]);

  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);

  // Loading state - MUST be returned AFTER all hooks are called
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  // Error state - MUST be returned AFTER all hooks are called
  if (error) {
    return (
      <div className="p-8 text-center">
        <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
        <p className="text-red-600">{error}</p>
        <button
          onClick={fetchLogs}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  // Main render - ALWAYS called after all hooks
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Transaction Logs</h2>
        <button
          onClick={fetchLogs}
          className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
        >
          <RefreshCw size={16} />
          <span>Refresh</span>
        </button>
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
        typeFilter={transactionType}
        setTypeFilter={setTransactionType}
        types={transactionTypes}
        logsPerPage={logsPerPage}
        setLogsPerPage={setLogsPerPage}
      />

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
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        totalItems={filteredLogs.length}
        itemsPerPage={logsPerPage}
      />
    </div>
  );
};

export default TransactionsLog;