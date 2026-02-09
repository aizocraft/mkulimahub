import { BookOpen } from 'lucide-react';

const Knowledge = () => {
  return (
    <div className="p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
          <BookOpen className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Knowledge Base</h2>
          <p className="text-gray-600 dark:text-gray-400">Farming guides and resources</p>
        </div>
      </div>
      
      <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-8 text-center">
        <BookOpen className="w-16 h-16 text-emerald-600 dark:text-emerald-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Knowledge Content</h3>
        <p className="text-gray-600 dark:text-gray-400">
          This is the Knowledge tab. More content will be added here.
        </p>
      </div>
    </div>
  );
};

export default Knowledge;