import { useState, useEffect } from 'react';
import { CreditCard, TrendingUp, TrendingDown, Calendar, Filter, ChevronLeft, ChevronRight, Search, Download, DollarSign, Users, Activity, Receipt, Clock, CheckCircle, XCircle, Eye, User, Mail, Phone, Briefcase } from 'lucide-react';
import { transactionAPI, bookingAPI } from '../../../api';
import { useAuth } from '../../../context/AuthContext';

const Transactions = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [dateRange, setDateRange] = useState('all');

  useEffect(() => {
    const loadTransactions = async () => {
      setLoading(true);
      try {
        let transactionResponse;

        // Role-based transaction fetching
        if (user?.role === 'admin') {
          // Admin sees all transactions
          transactionResponse = await transactionAPI.getAllTransactions({ page: 1, limit: 100 });
        } else {
          // Farmers and experts see only their own transactions
          transactionResponse = await transactionAPI.getUserTransactions({ page: 1, limit: 100 });
        }

        // Map transactions to component format
        const mappedTransactions = transactionResponse.data.data.transactions?.map(transaction => ({
          id: transaction._id,
          type: transaction.type,
          amount: transaction.amount,
          description: transaction.consultation?.topic || `Transaction - ${transaction.type}`,
          user: transaction.farmer?.name || transaction.expert?.name || transaction.farmer?.email || transaction.expert?.email || 'Unknown User',
          date: transaction.createdAt,
          status: transaction.status,
          // Add expert details for modal
          expert: transaction.expert ? {
            name: transaction.expert.name || 'N/A',
            email: transaction.expert.email || 'N/A',
            phone: transaction.expert.phone || 'N/A',
            specialization: transaction.expert.specialization || 'N/A',
            id: transaction.expert._id || 'N/A'
          } : null,
          farmer: transaction.farmer ? {
            name: transaction.farmer.name || 'N/A',
            email: transaction.farmer.email || 'N/A',
            phone: transaction.farmer.phone || 'N/A',
            id: transaction.farmer._id || 'N/A'
          } : null,
          consultation: transaction.consultation ? {
            topic: transaction.consultation.topic || 'N/A',
            status: transaction.consultation.status || 'N/A',
            scheduledDate: transaction.consultation.scheduledDate || 'N/A'
          } : null
        })) || [];

        // For non-admin users, also fetch their pending consultations
        let mappedPendingConsultations = [];
        if (user?.role !== 'admin') {
          const consultationResponse = await bookingAPI.getFarmerConsultations({ status: 'pending', page: 1, limit: 100 });

          // Map pending consultations to transaction format
          mappedPendingConsultations = consultationResponse.data?.data?.consultations?.filter(consultation => consultation.payment && consultation.payment.amount > 0).map(consultation => ({
            id: `pending-${consultation._id}`,
            type: 'payment',
            amount: consultation.payment.amount,
            description: consultation.topic || 'Pending Consultation Payment',
            user: consultation.farmer?.name || consultation.farmer?.email || 'Unknown User',
            date: consultation.createdAt,
            status: 'pending',
            expert: consultation.expert ? {
              name: consultation.expert.name || 'N/A',
              email: consultation.expert.email || 'N/A',
              phone: consultation.expert.phone || 'N/A',
              specialization: consultation.expert.specialization || 'N/A',
              id: consultation.expert._id || 'N/A'
            } : null,
            farmer: consultation.farmer ? {
              name: consultation.farmer.name || 'N/A',
              email: consultation.farmer.email || 'N/A',
              phone: consultation.farmer.phone || 'N/A',
              id: consultation.farmer._id || 'N/A'
            } : null,
            consultation: {
              topic: consultation.topic || 'N/A',
              status: consultation.status || 'N/A',
              scheduledDate: consultation.scheduledDate || 'N/A'
            }
          })) || [];
        }

        // Combine transactions and pending consultations
        const allTransactions = [...mappedTransactions, ...mappedPendingConsultations];

        // Sort by date (newest first)
        const sortedTransactions = allTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));

        setTransactions(sortedTransactions);
      } catch (error) {
        console.error('Error loading transactions:', error);
        // Set empty array on error to show no transactions message
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };

    loadTransactions();
  }, [user]);

  const filteredTransactions = transactions.filter(transaction => {
    // Status filter
    if (filter !== 'all' && transaction.status !== filter) return false;

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        transaction.description?.toLowerCase().includes(searchLower) ||
        transaction.user?.toLowerCase().includes(searchLower) ||
        transaction.id?.toLowerCase().includes(searchLower) ||
        (transaction.expert?.name && transaction.expert.name.toLowerCase().includes(searchLower)) ||
        (transaction.farmer?.name && transaction.farmer.name.toLowerCase().includes(searchLower));

      if (!matchesSearch) return false;
    }

    // Date range filter
    if (dateRange !== 'all') {
      const transactionDate = new Date(transaction.date);
      const now = new Date();

      switch (dateRange) {
        case 'today':
          if (transactionDate.toDateString() !== now.toDateString()) return false;
          break;
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          if (transactionDate < weekAgo) return false;
          break;
        case 'month':
          const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
          if (transactionDate < monthAgo) return false;
          break;
        default:
          break;
      }
    }

    return true;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredTransactions.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedTransactions = filteredTransactions.slice(startIndex, startIndex + pageSize);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleExportCSV = async () => {
    try {
      const response = await transactionAPI.exportTransactions({
        status: filter !== 'all' ? filter : undefined,
        search: searchTerm || undefined,
        dateRange: dateRange !== 'all' ? dateRange : undefined
      });

      // Create blob and download
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      // Fallback: generate CSV from current data
      const csvContent = generateCSVFromData(filteredTransactions);
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }
  };

  const generateCSVFromData = (data) => {
    const headers = ['ID', 'Type', 'Description', 'User', 'Expert Name', 'Expert Email', 'Expert Phone', 'Amount', 'Date', 'Status'];
    const csvRows = [
      headers.join(','),
      ...data.map(transaction => [
        transaction.id,
        transaction.type,
        `"${transaction.description.replace(/"/g, '""')}"`,
        `"${transaction.user.replace(/"/g, '""')}"`,
        `"${(transaction.expert?.name || 'N/A').replace(/"/g, '""')}"`,
        `"${(transaction.expert?.email || 'N/A').replace(/"/g, '""')}"`,
        `"${(transaction.expert?.phone || 'N/A').replace(/"/g, '""')}"`,
        transaction.amount,
        new Date(transaction.date).toLocaleDateString(),
        transaction.status
      ].join(','))
    ];
    return csvRows.join('\n');
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 md:gap-6">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">{user?.role === 'admin' || user?.role === 'expert' ? 'Total Revenue' : 'Total Sent'}</p>
              <p className="text-2xl font-bold">KSh {transactions.filter(t => t.status === 'completed').reduce((sum, t) => sum + (t.amount > 0 ? t.amount : 0), 0).toLocaleString()}</p>
            </div>
            <DollarSign size={32} className="text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Transactions</p>
              <p className="text-2xl font-bold">{transactions.length}</p>
            </div>
            <Activity size={32} className="text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm font-medium">Completed</p>
              <p className="text-2xl font-bold">{transactions.filter(t => t.status === 'completed').length}</p>
            </div>
            <CheckCircle size={32} className="text-emerald-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm font-medium">Pending</p>
              <p className="text-2xl font-bold">{transactions.filter(t => t.status === 'pending').length}</p>
            </div>
            <Clock size={32} className="text-yellow-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm font-medium">Failed</p>
              <p className="text-2xl font-bold">{transactions.filter(t => t.status === 'failed').length}</p>
            </div>
            <XCircle size={32} className="text-red-200" />
          </div>
        </div>
      </div>

      {/* Header with Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Transactions</h2>
          <p className="text-gray-600 dark:text-gray-400">Manage and monitor all payment transactions</p>
        </div>

        {/* Export Button */}
        <button
          onClick={handleExportCSV}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
        >
          <Download size={16} />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          {/* Date Range Filter */}
          <div className="relative">
            <Calendar size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="relative bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute -top-4 -left-4 w-24 h-24 bg-green-400/20 rounded-full blur-xl"></div>
        <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-emerald-400/20 rounded-full blur-xl"></div>

        <div className="relative">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {paginatedTransactions.map((transaction) => (
                  <tr
                    key={transaction.id}
                    className={`transition-colors ${
                      transaction.status === 'pending'
                        ? 'bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 hover:bg-yellow-100 dark:hover:bg-yellow-900/30'
                        : transaction.status === 'failed'
                        ? 'bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 hover:bg-red-100 dark:hover:bg-red-900/30'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {transaction.type === 'payment' ? (
                          <TrendingUp className="w-5 h-5 text-green-500 mr-2" />
                        ) : transaction.type === 'refund' ? (
                          <TrendingDown className="w-5 h-5 text-red-500 mr-2" />
                        ) : (
                          <Receipt className="w-5 h-5 text-blue-500 mr-2" />
                        )}
                        <span className={`text-sm font-medium capitalize ${
                          transaction.status === 'pending' ? 'text-yellow-800 dark:text-yellow-200' : 'text-gray-900 dark:text-white'
                        }`}>
                          {transaction.type}
                        </span>
                      </div>
                    </td>
                    <td className={`px-6 py-4 text-sm max-w-xs truncate ${
                      transaction.status === 'pending' ? 'text-yellow-800 dark:text-yellow-200' : 'text-gray-900 dark:text-white'
                    }`} title={transaction.description}>
                      {transaction.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center">
                        <Users size={14} className="mr-1" />
                        <span className={transaction.status === 'pending' ? 'text-yellow-800 dark:text-yellow-200' : ''}>
                          {transaction.user}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <span className={`font-semibold ${
                        transaction.status === 'pending'
                          ? 'text-yellow-700 dark:text-yellow-300'
                          : transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.amount > 0 ? '+' : ''}KSh {Math.abs(transaction.amount).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center">
                        <Calendar size={14} className="mr-1" />
                        <span className={transaction.status === 'pending' ? 'text-yellow-800 dark:text-yellow-200' : ''}>
                          {new Date(transaction.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                        <br />
                        <span className={`text-xs ${transaction.status === 'pending' ? 'text-yellow-600 dark:text-yellow-400' : 'text-gray-400'}`}>
                          {new Date(transaction.date).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          transaction.status === 'completed'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                            : transaction.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 border border-yellow-300'
                            : transaction.status === 'failed'
                            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
                        }`}>
                          {transaction.status === 'completed' && <CheckCircle size={12} className="mr-1" />}
                          {transaction.status === 'pending' && <Clock size={12} className="mr-1" />}
                          {transaction.status === 'failed' && <XCircle size={12} className="mr-1" />}
                          {transaction.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTransaction(transaction);
                          setShowDetailsModal(true);
                        }}
                        className="inline-flex items-center justify-center w-8 h-8 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {paginatedTransactions.length === 0 && (
            <div className="px-6 py-12 text-center">
              <CreditCard size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No transactions found</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 flex items-center justify-between">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Showing {startIndex + 1} to {Math.min(startIndex + pageSize, filteredTransactions.length)} of {filteredTransactions.length} transactions
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Transaction Details Modal */}
      {showDetailsModal && selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div 
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                <Receipt className="mr-3 text-green-500" size={24} />
                Transaction Details
              </h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <XCircle size={28} />
              </button>
            </div>

            <div className="space-y-6">
              {/* Main Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-xl border border-blue-200 dark:border-blue-700">
                  <div className="flex items-center mb-2">
                    <Receipt className="text-blue-500 mr-2" size={16} />
                    <span className="text-xs font-medium text-blue-700 dark:text-blue-300 uppercase tracking-wide">Transaction ID</span>
                  </div>
                  <p className="text-sm font-mono text-gray-900 dark:text-white break-all">{selectedTransaction.id}</p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 rounded-xl border border-purple-200 dark:border-purple-700">
                  <div className="flex items-center mb-2">
                    <Activity className="text-purple-500 mr-2" size={16} />
                    <span className="text-xs font-medium text-purple-700 dark:text-purple-300 uppercase tracking-wide">Type</span>
                  </div>
                  <p className="text-sm text-gray-900 dark:text-white capitalize font-semibold">{selectedTransaction.type}</p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-xl border border-green-200 dark:border-green-700">
                  <div className="flex items-center mb-2">
                    <DollarSign className="text-green-500 mr-2" size={16} />
                    <span className="text-xs font-medium text-green-700 dark:text-green-300 uppercase tracking-wide">Amount</span>
                  </div>
                  <p className="text-lg font-bold text-green-600 dark:text-green-400">
                    KSh {Math.abs(selectedTransaction.amount).toLocaleString()}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-4 rounded-xl border border-orange-200 dark:border-orange-700">
                  <div className="flex items-center mb-2">
                    <Clock className="text-orange-500 mr-2" size={16} />
                    <span className="text-xs font-medium text-orange-700 dark:text-orange-300 uppercase tracking-wide">Status</span>
                  </div>
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                    selectedTransaction.status === 'completed'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                      : selectedTransaction.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                  }`}>
                    {selectedTransaction.status === 'completed' && <CheckCircle size={14} className="mr-1" />}
                    {selectedTransaction.status === 'pending' && <Clock size={14} className="mr-1" />}
                    {selectedTransaction.status === 'failed' && <XCircle size={14} className="mr-1" />}
                    {selectedTransaction.status}
                  </span>
                </div>
              </div>

              {/* Detailed Information */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* User Information */}
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-xl border border-blue-200 dark:border-blue-700">
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3 block flex items-center">
                      <Users className="mr-2" size={16} />
                      User Information
                    </label>
                    <div className="space-y-2">
                      {selectedTransaction.farmer ? (
                        <>
                          <div className="flex items-center">
                            <User size={14} className="mr-2 text-gray-500" />
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {selectedTransaction.farmer.name}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <Mail size={14} className="mr-2 text-gray-500" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              {selectedTransaction.farmer.email}
                            </span>
                          </div>
                          {selectedTransaction.farmer.phone && selectedTransaction.farmer.phone !== 'N/A' && (
                            <div className="flex items-center">
                              <Phone size={14} className="mr-2 text-gray-500" />
                              <span className="text-sm text-gray-700 dark:text-gray-300">
                                {selectedTransaction.farmer.phone}
                              </span>
                            </div>
                          )}
                        </>
                      ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400">No user information available</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Expert Information */}
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 rounded-xl border border-purple-200 dark:border-purple-700">
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3 block flex items-center">
                      <Briefcase className="mr-2" size={16} />
                      Expert Information
                    </label>
                    <div className="space-y-2">
                      {selectedTransaction.expert ? (
                        <>
                          <div className="flex items-center">
                            <User size={14} className="mr-2 text-purple-500" />
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {selectedTransaction.expert.name}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <Mail size={14} className="mr-2 text-purple-500" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              {selectedTransaction.expert.email}
                            </span>
                          </div>
                          {selectedTransaction.expert.phone && selectedTransaction.expert.phone !== 'N/A' && (
                            <div className="flex items-center">
                              <Phone size={14} className="mr-2 text-purple-500" />
                              <span className="text-sm text-gray-700 dark:text-gray-300">
                                {selectedTransaction.expert.phone}
                              </span>
                            </div>
                          )}
                          {selectedTransaction.expert.specialization && selectedTransaction.expert.specialization !== 'N/A' && (
                            <div className="flex items-center">
                              <Briefcase size={14} className="mr-2 text-purple-500" />
                              <span className="text-sm text-gray-700 dark:text-gray-300">
                                {selectedTransaction.expert.specialization}
                              </span>
                            </div>
                          )}
                        </>
                      ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400">No expert assigned</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Transaction Details */}
                <div className="space-y-4">
                

                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 block flex items-center">
                      <Calendar className="mr-2" size={16} />
                      Transaction Date & Time
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {new Date(selectedTransaction.date).toLocaleString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Consultation Details */}
              {selectedTransaction.consultation && selectedTransaction.consultation.topic !== 'N/A' && (
                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 p-4 rounded-xl border border-indigo-200 dark:border-indigo-700">
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3 block">
                    Consultation Details
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Topic</p>
                      <p className="text-sm text-gray-900 dark:text-white font-medium">{selectedTransaction.consultation.topic}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Status</p>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        selectedTransaction.consultation.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                        selectedTransaction.consultation.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
                      }`}>
                        {selectedTransaction.consultation.status}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Scheduled Date</p>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {selectedTransaction.consultation.scheduledDate !== 'N/A' 
                          ? new Date(selectedTransaction.consultation.scheduledDate).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })
                          : 'Not scheduled'}
                      </p>
                    </div>
                  </div>
                </div>
              )}


            </div>

            <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;