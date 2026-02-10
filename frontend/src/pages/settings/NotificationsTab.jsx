import { useState } from 'react';
import { Bell, Mail, MessageSquare, Shield, CheckCircle, AlertCircle, Info, Calendar } from 'lucide-react';

const NotificationsTab = () => {
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    marketing: false,
    security: true
  });

  const sampleNotifications = [
    {
      id: 1,
      type: 'system',
      title: 'System Update',
      message: 'Your account has been successfully updated.',
      timestamp: new Date(Date.now() - 3600000), // 1 hour ago
      read: false,
      icon: Info,
      color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
    },
    {
      id: 2,
      type: 'consultation',
      title: 'Consultation Reminder',
      message: 'You have a consultation scheduled for tomorrow at 2 PM.',
      timestamp: new Date(Date.now() - 86400000), // 1 day ago
      read: true,
      icon: Calendar,
      color: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
    },
    {
      id: 3,
      type: 'forum',
      title: 'New Forum Reply',
      message: 'Someone replied to your post in the crop management forum.',
      timestamp: new Date(Date.now() - 172800000), // 2 days ago
      read: false,
      icon: MessageSquare,
      color: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
    }
  ];

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
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h2>
      </div>

      {/* Notification Preferences Section */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Bell className="mr-2" /> Notification Preferences
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Mail className="mr-2 text-gray-600 dark:text-gray-400" />
              <span className="text-gray-700 dark:text-gray-300">Email Notifications</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.email}
                onChange={(e) => setNotifications({...notifications, email: e.target.checked})}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Bell className="mr-2 text-gray-600 dark:text-gray-400" />
              <span className="text-gray-700 dark:text-gray-300">Push Notifications</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.push}
                onChange={(e) => setNotifications({...notifications, push: e.target.checked})}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <MessageSquare className="mr-2 text-gray-600 dark:text-gray-400" />
              <span className="text-gray-700 dark:text-gray-300">SMS Notifications</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.sms}
                onChange={(e) => setNotifications({...notifications, sms: e.target.checked})}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Shield className="mr-2 text-gray-600 dark:text-gray-400" />
              <span className="text-gray-700 dark:text-gray-300">Security Alerts</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.security}
                onChange={(e) => setNotifications({...notifications, security: e.target.checked})}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Recent Notifications Section */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Bell className="mr-2" /> Recent Notifications
        </h3>
        <div className="space-y-3">
          {sampleNotifications.map((notif) => {
            const Icon = notif.icon;
            return (
              <div
                key={notif.id}
                className={`group bg-gray-50 dark:bg-gray-700/50 rounded-lg border transition-all duration-300 p-4 ${
                  notif.read
                    ? 'border-gray-200 dark:border-gray-600'
                    : 'border-blue-500/50 dark:border-blue-400/50 bg-blue-50/30 dark:bg-blue-900/10'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${notif.color}`}>
                    <Icon size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h4 className={`font-semibold text-gray-900 dark:text-white mb-1 ${!notif.read ? 'text-lg' : ''}`}>
                          {notif.title}
                          {!notif.read && (
                            <span className="ml-2 inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                          )}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {notif.message}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                          {formatTime(notif.timestamp)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sample Data Placeholder */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Sample Notification Data</h3>
        <p className="text-gray-700 dark:text-gray-300">
          This is a placeholder for sample notification data. In a real application, this would display notification statistics, delivery rates, etc.
        </p>
        <ul className="mt-4 space-y-2">
          <li className="text-gray-600 dark:text-gray-400">Total Notifications: 150</li>
          <li className="text-gray-600 dark:text-gray-400">Unread Count: 12</li>
          <li className="text-gray-600 dark:text-gray-400">Last Notification: 2023-10-01</li>
        </ul>
      </div>
    </div>
  );
};

export default NotificationsTab;