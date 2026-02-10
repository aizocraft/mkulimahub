import { ShieldX, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const AccessDenied = ({ restrictedTo }) => {
  const getMessage = () => {
    switch (restrictedTo) {
      case 'admin':
        return 'This area is restricted to administrators only.';
      case 'farmer':
        return 'This area is restricted to farmers only.';
      case 'expert':
        return 'This area is restricted to experts only.';
      default:
        return 'You do not have permission to access this page.';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
            <ShieldX className="w-10 h-10 text-red-600 dark:text-red-400" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Access Denied
        </h1>

        {/* Message */}
        <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
          {getMessage()}
        </p>

        {/* Action Button */}
        <Link
          to="/dashboard"
          className="inline-flex items-center space-x-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl transition-colors duration-200 shadow-lg hover:shadow-xl"
        >
          <ArrowLeft size={18} />
          <span>Go to Your Dashboard</span>
        </Link>
      </div>
    </div>
  );
};

export default AccessDenied;
