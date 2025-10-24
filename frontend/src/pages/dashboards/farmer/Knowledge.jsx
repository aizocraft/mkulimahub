import { useState } from 'react';
import { BookOpen, Search, Filter, Play, Star, Clock, Download, Eye } from 'lucide-react';

const Knowledge = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All Topics', count: 24 },
    { id: 'crops', name: 'Crop Guides', count: 8 },
    { id: 'soil', name: 'Soil Management', count: 5 },
    { id: 'pests', name: 'Pest Control', count: 6 },
    { id: 'irrigation', name: 'Irrigation', count: 3 },
    { id: 'harvest', name: 'Harvest Techniques', count: 2 }
  ];

  const resources = [
    {
      id: 1,
      title: 'Maize Farming Complete Guide',
      category: 'crops',
      type: 'guide',
      duration: '15 min read',
      rating: 4.8,
      views: 1247,
      description: 'Complete guide to modern maize farming techniques including planting, care, and harvest.',
      featured: true
    },
    {
      id: 2,
      title: 'Soil Testing and Analysis',
      category: 'soil',
      type: 'article',
      duration: '8 min read',
      rating: 4.6,
      views: 892,
      description: 'Learn how to test and analyze your soil for optimal crop growth.',
      featured: false
    },
    {
      id: 3,
      title: 'Organic Pest Control Methods',
      category: 'pests',
      type: 'video',
      duration: '12 min watch',
      rating: 4.9,
      views: 1563,
      description: 'Natural and organic methods to control common farm pests.',
      featured: true
    },
    {
      id: 4,
      title: 'Drip Irrigation Setup',
      category: 'irrigation',
      type: 'guide',
      duration: '10 min read',
      rating: 4.5,
      views: 734,
      description: 'Step-by-step guide to setting up efficient drip irrigation systems.',
      featured: false
    },
    {
      id: 5,
      title: 'Tomato Harvesting Techniques',
      category: 'harvest',
      type: 'article',
      duration: '6 min read',
      rating: 4.7,
      views: 567,
      description: 'Best practices for harvesting tomatoes to maximize yield and quality.',
      featured: false
    },
    {
      id: 6,
      title: 'Compost Making Guide',
      category: 'soil',
      type: 'video',
      duration: '18 min watch',
      rating: 4.8,
      views: 983,
      description: 'Learn how to make high-quality compost from farm waste.',
      featured: true
    }
  ];

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'all' || resource.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const getTypeIcon = (type) => {
    switch (type) {
      case 'video': return <Play size={16} className="text-red-500" />;
      case 'guide': return <BookOpen size={16} className="text-blue-500" />;
      case 'article': return <Eye size={16} className="text-green-500" />;
      default: return <BookOpen size={16} className="text-gray-500" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'video': return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300';
      case 'guide': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300';
      case 'article': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Knowledge Base</h2>
          <p className="text-gray-600 dark:text-gray-400">Access farming guides, articles, and expert advice</p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors duration-200">
            <Download size={18} />
            <span>Download Guides</span>
          </button>
        </div>
      </div>

      {/* Search and Categories */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-6">
          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search knowledge base..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Categories */}
          <div className="flex-1 overflow-x-auto">
            <div className="flex space-x-2">
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors duration-200 ${
                    activeCategory === category.id
                      ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <span>{category.name}</span>
                  <span className="px-1.5 py-0.5 bg-white dark:bg-gray-800 rounded text-xs">
                    {category.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Featured Resources */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Featured Resources</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredResources.filter(r => r.featured).map(resource => (
            <div key={resource.id} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {getTypeIcon(resource.type)}
                  <span className={`px-2 py-1 text-xs rounded-full ${getTypeColor(resource.type)}`}>
                    {resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}
                  </span>
                </div>
                {resource.featured && (
                  <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 text-xs rounded-full">
                    Featured
                  </span>
                )}
              </div>

              <h4 className="font-semibold text-gray-900 dark:text-white text-lg mb-2">{resource.title}</h4>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{resource.description}</p>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center space-x-1">
                    <Clock size={14} />
                    <span>{resource.duration}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star size={14} className="text-yellow-500 fill-current" />
                    <span>{resource.rating}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Eye size={14} />
                    <span>{resource.views}</span>
                  </div>
                </div>
                <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors duration-200 text-sm">
                  View {resource.type === 'video' ? 'Video' : 'Guide'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* All Resources */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">All Resources</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map(resource => (
            <div key={resource.id} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center space-x-3 mb-4">
                {getTypeIcon(resource.type)}
                <span className={`px-2 py-1 text-xs rounded-full ${getTypeColor(resource.type)}`}>
                  {resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}
                </span>
              </div>

              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{resource.title}</h4>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">{resource.description}</p>

              <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center space-x-1">
                  <Clock size={14} />
                  <span>{resource.duration}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Star size={14} className="text-yellow-500 fill-current" />
                  <span>{resource.rating}</span>
                </div>
              </div>

              <button className="w-full mt-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors duration-200 text-sm">
                Read More
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {filteredResources.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No resources found</h3>
          <p className="text-gray-500 dark:text-gray-400">Try adjusting your search or browse different categories</p>
        </div>
      )}
    </div>
  );
};

export default Knowledge;