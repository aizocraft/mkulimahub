import { useState } from 'react';
import { Bell, Mail, MessageSquare, Shield } from 'lucide-react';

const NotificationsTab = () => {
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    marketing: false,
    security: true
  });

  // Similar structure to other tabs
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h2>
      </div>
      {/* Add notification settings here */}
    </div>
  );
};

export default NotificationsTab;