import { useState } from 'react';
import { Sprout, Plus, Search, Filter, Calendar, Droplets, Thermometer } from 'lucide-react';

const MyCrops = () => {
  const [crops, setCrops] = useState([
    {
      id: 1,
      name: 'Maize',
      type: 'Cereal',
      plantingDate: '2024-01-15',
      harvestDate: '2024-05-20',
      progress: 65,
      health: 'good',
      area: '2 acres',
      yield: 'Expected: 40 bags'
    },
    {
      id: 2,
      name: 'Beans',
      type: 'Legume',
      plantingDate: '2024-02-01',
      harvestDate: '2024-04-15',
      progress: 40,
      health: 'warning',
      area: '1 acre',
      yield: 'Expected: 15 bags'
    },
    {
      id: 3,
      name: 'Tomatoes',
      type: 'Vegetable',
      plantingDate: 'Planning',
      harvestDate: 'Planning',
      progress: 0,
      health: 'none',
      area: '0.5 acre',
      yield: 'Not planted'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');

  const filteredCrops = crops.filter(crop =>
    crop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    crop.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getHealthColor = (health) => {
    switch (health) {
      case 'good': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'poor': return 'bg-red-500';
      default: return 'bg-gray-300';
    }
  };

  const addNewCrop = () => {
    const newCrop = {
      id: crops.length + 1,
      name: 'New Crop',
      type: 'Vegetable',
      plantingDate: 'Planning',
      harvestDate: 'Planning',
      progress: 0,
      health: 'none',
      area: '0 acres',
      yield: 'Not planted'
    };
    setCrops([...crops, newCrop]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Crop Management</h2>
          <p className="text-gray-600 dark:text-gray-400">Manage all your crops and track their progress</p>
        </div>
        <button 
          onClick={addNewCrop}
          className="mt-4 sm:mt-0 flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors duration-200"
        >
          <Plus size={18} />
          <span>Add New Crop</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search crops by name or type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <select className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
              <option>All Types</option>
              <option>Cereal</option>
              <option>Legume</option>
              <option>Vegetable</option>
              <option>Fruit</option>
            </select>
            <button className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
              <Filter size={18} className="text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Crops Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCrops.map(crop => (
          <div key={crop.id} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow duration-200">
            {/* Crop Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                  <Sprout size={20} className="text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{crop.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{crop.type}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${getHealthColor(crop.health)}`}></div>
              </div>
            </div>

            {/* Progress Bar */}
            {crop.progress > 0 && (
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600 dark:text-gray-400">Growth Progress</span>
                  <span className="font-medium text-gray-900 dark:text-white">{crop.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${crop.progress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Crop Details */}
            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                  <Calendar size={14} />
                  <span>Planted</span>
                </div>
                <span className="font-medium text-gray-900 dark:text-white">{crop.plantingDate}</span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                  <Sprout size={14} />
                  <span>Harvest</span>
                </div>
                <span className="font-medium text-gray-900 dark:text-white">{crop.harvestDate}</span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                  <Droplets size={14} />
                  <span>Area</span>
                </div>
                <span className="font-medium text-gray-900 dark:text-white">{crop.area}</span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                  <Thermometer size={14} />
                  <span>Yield</span>
                </div>
                <span className="font-medium text-gray-900 dark:text-white">{crop.yield}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-2">
              <button className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm rounded-lg transition-colors duration-200">
                View Guide
              </button>
              <button className="flex-1 py-2 px-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded-lg transition-colors duration-200">
                Manage
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredCrops.length === 0 && (
        <div className="text-center py-12">
          <Sprout className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No crops found</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Try adjusting your search or add a new crop</p>
          <button 
            onClick={addNewCrop}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors duration-200"
          >
            <Plus size={18} />
            <span>Add Your First Crop</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default MyCrops;