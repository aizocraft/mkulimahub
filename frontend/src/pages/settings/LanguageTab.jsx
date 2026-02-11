import { Languages } from 'lucide-react';
import LanguageToggle from '../../components/LanguageToggle';

const LanguageTab = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Language</h2>
      </div>

      {/* Language Toggle Section */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Languages className="mr-2" /> Language Selection
        </h3>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          Choose your preferred language for the application interface.
        </p>
        <div className="flex items-center space-x-4">
          <span className="text-gray-700 dark:text-gray-300 font-medium">Select Language:</span>
          <LanguageToggle />
        </div>
      </div>
    </div>
  );
};

export default LanguageTab;