import { useState } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  FileText,
  User,
  Clock,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  Copy
} from 'lucide-react';

const LogTable = ({ logs, currentPage, logsPerPage, loading }) => {
  const [expandedLogs, setExpandedLogs] = useState(new Set());

  const currentLogs = logs.slice(
    (currentPage - 1) * logsPerPage,
    currentPage * logsPerPage
  );

  const getLevelIcon = (level) => {
    const iconProps = { size: 16 };
    switch (level) {
      case 'error': return <XCircle {...iconProps} className="text-red-500" />;
      case 'warn': return <AlertTriangle {...iconProps} className="text-yellow-500" />;
      case 'info': return <Info {...iconProps} className="text-blue-500" />;
      case 'debug': return <CheckCircle {...iconProps} className="text-gray-500" />;
      default: return <Info {...iconProps} className="text-gray-500" />;
    }
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'error': return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'warn': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'info': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'debug': return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
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

  const toggleLogExpansion = (index) => {
    const newExpanded = new Set(expandedLogs);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedLogs(newExpanded);
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

  const getUserRole = (log) => {
    if (log.meta?.role) return log.meta.role;
    if (log.meta?.userRole) return log.meta.userRole;
    return 'Unknown';
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-32">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-gray-400 text-sm">Loading logs...</p>
        </div>
      </div>
    );
  }

  if (currentLogs.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-16 h-16 text-gray-500 mx-auto mb-4 opacity-50" />
        <p className="text-gray-400 text-lg font-medium">No logs found</p>
        <p className="text-gray-500 text-sm mt-1">Try adjusting your search criteria</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/30 border border-gray-700 rounded-xl overflow-hidden shadow-2xl">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-700/50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">User</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Level</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Time</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Message</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {currentLogs.map((log, index) => (
              <tr key={index} className="hover:bg-gray-700/30 transition-all duration-150 group">
                {/* User Column */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold shadow-lg">
                      {getUserAvatar(log)}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-white">
                        {getUserDisplayName(log)}
                      </span>
                      <span className="text-xs text-gray-400 capitalize">
                        {getUserRole(log)}
                      </span>
                      {log.meta?.email && (
                        <span className="text-xs text-gray-500 truncate max-w-[120px]">
                          {log.meta.email}
                        </span>
                      )}
                    </div>
                  </div>
                </td>

                {/* Level Column */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    {getLevelIcon(log.level)}
                    <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getLevelColor(log.level)}`}>
                      {log.level.toUpperCase()}
                    </span>
                  </div>
                </td>

                {/* Time Column */}
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
                  <div className="max-w-lg">
                    <div className="text-sm text-white font-medium line-clamp-2">
                      {log.message}
                    </div>
                    
                    {/* Show role change details if available */}
                    {log.meta?.oldRole && log.meta?.newRole && (
                      <div className="mt-2 flex items-center space-x-2 text-xs">
                        <span className="text-gray-400">Role changed:</span>
                        <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 rounded">
                          {log.meta.oldRole}
                        </span>
                        <span className="text-gray-400">→</span>
                        <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded">
                          {log.meta.newRole}
                        </span>
                      </div>
                    )}

                    {/* Expanded View */}
                    {expandedLogs.has(index) && (
                      <div className="mt-3 p-4 bg-gray-700/50 rounded-xl border border-gray-600">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                          <div>
                            <h4 className="font-semibold text-gray-300 mb-2">Event Details</h4>
                            <pre className="text-gray-400 whitespace-pre-wrap bg-gray-800/50 p-2 rounded-lg">
                              {JSON.stringify({
                                timestamp: log.timestamp,
                                level: log.level,
                                message: log.message,
                                ...(log.method && { method: log.method, url: log.url, statusCode: log.statusCode }),
                                ...(log.ip && { ip: log.ip }),
                                ...(log.duration && { duration: `${log.duration}ms` })
                              }, null, 2)}
                            </pre>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-300 mb-2">User Context</h4>
                            <pre className="text-gray-400 whitespace-pre-wrap bg-gray-800/50 p-2 rounded-lg">
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
                      onClick={() => toggleLogExpansion(index)}
                      className="p-2 text-gray-400 hover:text-white hover:bg-gray-600 rounded-lg transition-all duration-200 group/expand"
                      title={expandedLogs.has(index) ? 'Collapse' : 'Expand'}
                    >
                      {expandedLogs.has(index) ? 
                        <ChevronUp size={16} className="group-hover/expand:scale-110 transition-transform" /> : 
                        <ChevronDown size={16} className="group-hover/expand:scale-110 transition-transform" />
                      }
                    </button>
                    <button
                      onClick={() => copyToClipboard(JSON.stringify(log, null, 2))}
                      className="p-2 text-gray-400 hover:text-white hover:bg-gray-600 rounded-lg transition-all duration-200 group/copy"
                      title="Copy event data"
                    >
                      <Copy size={16} className="group-hover/copy:scale-110 transition-transform" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LogTable;