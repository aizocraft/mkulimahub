import { useState, useEffect, useContext } from 'react';
import { Bell, Trash2, CheckCircle, AlertCircle, Info, MessageSquare, Calendar, TrendingUp, Loader2 } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { notificationAPI } from '../api';

const NotificationPage = () => {
  const { user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  // Fetch notifications on component mount
  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await notificationAPI.getAll();
      if (response.data.success) {
        const notificationsWithIcons = response.data.data.map(notif => ({
          ...notif,
          id: notif._id,
          timestamp: new Date(notif.createdAt),
          icon: getIconForType(notif.type),
          color: getColorForType(notif.type)
        }));
        setNotifications(notificationsWithIcons);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const getIconForType = (type) => {
    const iconMap = {
      system: Info,
      expert: AlertCircle,
      consultation: Calendar,
      weather: AlertCircle,
      forum: MessageSquare,
      admin: Info
    };
    return iconMap[type] || Info;
  };

  const getColorForType = (type) => {
    const colorMap = {
      system: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
      expert: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400',
      consultation: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
      weather: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
      forum: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400',
      admin: 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400'
    };
    return colorMap[type] || 'bg-gray-100 dark:bg-gray-900/30 text-gray-600 dark:text-gray-400';
  };

  const markAsRead = async (id) => {
    try {
      await notificationAPI.markAsRead(id);
      setNotifications(notifications.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      ));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications(notifications.map(notif => ({ ...notif, read: true })));
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await notificationAPI.delete(id);
      setNotifications(notifications.filter(notif => notif.id !== id));
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  const clearAll = () => {
    // Note: This would require a bulk delete API endpoint
    // For now, we'll just clear the local state
    setNotifications([]);
  };

  const filteredNotifications = filter === 'all'
    ? notifications
    : notifications.filter(notif => notif.type === filter);

  const sortedNotifications = [...filteredNotifications].sort((a, b) => {
    if (sortBy === 'recent') return b.timestamp - a.timestamp;
    if (sortBy === 'oldest') return a.timestamp - b.timestamp;
    if (sortBy === 'unread') return (b.read ? 1 : 0) - (a.read ? 1 : 0);
    return 0;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const formatTime = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return timestamp.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-emerald-900/20 transition-all duration-500">
      {/* Background Animation */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-emerald-300 dark:bg-emerald-600 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl opacity-20 animate-float"></div>
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-green-300 dark:bg-green-600 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative max-w-4xl mx-auto p-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-2">
                Notifications
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'All caught up!'}
              </p>
            </div>
            <Bell className="text-emerald-600 dark:text-emerald-400" size={40} />
          </div>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Filter */}
          <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl rounded-xl border border-white/20 dark:border-gray-700/20 p-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Filter</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 dark:text-white"
            >
              <option value="all">All Notifications</option>
              <option value="system">System</option>
              <option value="expert">Expert</option>
              <option value="consultation">Consultation</option>
              <option value="weather">Weather</option>
              <option value="forum">Forum</option>
            </select>
          </div>

          {/* Sort */}
          <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl rounded-xl border border-white/20 dark:border-gray-700/20 p-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 dark:text-white"
            >
              <option value="recent">Most Recent</option>
              <option value="oldest">Oldest First</option>
              <option value="unread">Unread First</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex-1 px-4 py-2 bg-emerald-500/20 dark:bg-emerald-900/20 border border-emerald-500/50 dark:border-emerald-400/50 text-emerald-600 dark:text-emerald-400 rounded-lg hover:bg-emerald-500/30 transition-all duration-300 text-sm font-medium"
              >
                Mark All as Read
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={clearAll}
                className="flex-1 px-4 py-2 bg-red-500/20 dark:bg-red-900/20 border border-red-500/50 dark:border-red-400/50 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-500/30 transition-all duration-300 text-sm font-medium"
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-16">
            <Loader2 className="animate-spin text-emerald-600 dark:text-emerald-400" size={48} />
            <span className="ml-4 text-gray-600 dark:text-gray-400">Loading notifications...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-16">
            <AlertCircle size={48} className="mx-auto text-red-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Error Loading Notifications</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
            <button
              onClick={fetchNotifications}
              className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Notifications List */}
        <div className="space-y-3">
          {!loading && !error && sortedNotifications.length > 0 ? (
            sortedNotifications.map((notif) => {
              const Icon = notif.icon;
              return (
                <div
                  key={notif.id}
                  className={`group bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl rounded-xl border transition-all duration-300 p-4 hover:shadow-lg hover:shadow-emerald-500/10 dark:hover:shadow-emerald-400/10 cursor-pointer ${
                    notif.read
                      ? 'border-white/20 dark:border-gray-700/20'
                      : 'border-emerald-500/50 dark:border-emerald-400/50 bg-emerald-50/30 dark:bg-emerald-900/10'
                  }`}
                  onClick={() => markAsRead(notif.id)}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${notif.color}`}>
                      <Icon size={24} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className={`font-semibold text-gray-900 dark:text-white mb-1 ${!notif.read ? 'text-lg' : ''}`}>
                            {notif.title}
                            {!notif.read && (
                              <span className="ml-2 inline-block w-2 h-2 bg-emerald-500 rounded-full"></span>
                            )}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                            {notif.message}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                            {formatTime(notif.timestamp)}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {!notif.read && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notif.id);
                              }}
                              className="p-2 hover:bg-emerald-500/20 rounded-lg transition-all"
                              title="Mark as read"
                            >
                              <CheckCircle size={18} className="text-emerald-600 dark:text-emerald-400" />
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notif.id);
                            }}
                            className="p-2 hover:bg-red-500/20 rounded-lg transition-all"
                            title="Delete"
                          >
                            <Trash2 size={18} className="text-red-600 dark:text-red-400" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-16">
              <Bell size={48} className="mx-auto text-gray-400 dark:text-gray-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Notifications</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {filter !== 'all' ? 'No notifications in this category' : 'You\'re all caught up!'}
              </p>
            </div>
          )}
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
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default NotificationPage;
