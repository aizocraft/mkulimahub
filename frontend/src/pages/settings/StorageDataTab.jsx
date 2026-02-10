import { Database, Cloud, Download, HardDrive } from 'lucide-react';

const StorageDataTab = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Storage & Data</h2>
      </div>

      {/* Storage Usage Section */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <HardDrive className="mr-2" /> Storage Usage
        </h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-700 dark:text-gray-300">Local Storage</span>
            <span className="text-gray-900 dark:text-white">2.5 GB / 10 GB (25%)</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full" style={{ width: '25%' }}></div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-700 dark:text-gray-300">Cloud Storage</span>
            <span className="text-gray-900 dark:text-white">5 GB / 100 GB (5%)</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div className="bg-green-600 h-2 rounded-full" style={{ width: '5%' }}></div>
          </div>
        </div>
      </div>

      {/* Data Management Section */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Database className="mr-2" /> Data Management
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Cloud className="mr-2 text-gray-600 dark:text-gray-400" />
              <span className="text-gray-700 dark:text-gray-300">Backup to Cloud</span>
            </div>
            <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Backup Now
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Download className="mr-2 text-gray-600 dark:text-gray-400" />
              <span className="text-gray-700 dark:text-gray-300">Export Data</span>
            </div>
            <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
              Export
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Database className="mr-2 text-gray-600 dark:text-gray-400" />
              <span className="text-gray-700 dark:text-gray-300">Clear Local Data</span>
            </div>
            <button className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
              Clear Data
            </button>
          </div>
        </div>
      </div>

      {/* Sample Data Placeholder */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Sample Data</h3>
        <p className="text-gray-700 dark:text-gray-300">
          This is a placeholder for sample data. In a real application, this would display actual user data statistics, such as number of files, data size, etc.
        </p>
        <ul className="mt-4 space-y-2">
          <li className="text-gray-600 dark:text-gray-400">Total Files: 150</li>
          <li className="text-gray-600 dark:text-gray-400">Data Size: 7.5 GB</li>
          <li className="text-gray-600 dark:text-gray-400">Last Backup: 2023-10-01</li>
        </ul>
      </div>
    </div>
  );
};

export default StorageDataTab;