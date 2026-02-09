import { Bell } from 'lucide-react';

const NotificationIcon = ({ size = 16, className = "" }) => {
  return (
    <div className="relative">
      <Bell size={size} className={className} />
      <div className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-red-500 rounded-full border border-white dark:border-gray-900"></div>
    </div>
  );
};

export default NotificationIcon;