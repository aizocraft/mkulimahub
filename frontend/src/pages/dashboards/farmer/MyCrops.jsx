import { useState, useEffect } from 'react';
import { Sprout, Plus, Search, Filter, Calendar, Droplets, Thermometer, Edit, Trash2, X, Save } from 'lucide-react';
import { cropAPI, apiUtils } from '../../../api';

const MyCrops = () => {
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCrop, setEditingCrop] = useState(null);
  const [cropStats, setCropStats] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'Vegetable',
    plantingDate: '',
    harvestDate: '',
    area: '',
    yield: '',
    notes: ''
  });

  // Fetch crops on component mount
  useEffect(() => {
    fetchCrops();
    fetchCropStats();
  }, []);

  const fetchCrops = async () => {
    try {
      setLoading(true);
      const response = await cropAPI.getFarmerCrops();
      if (response.data.success) {
        setCrops(response.data.data);
      }
    } catch (error) {
      const errorData = apiUtils.handleError(error);
      setError(errorData.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCropStats = async () => {
    try {
      const response = await cropAPI.getCropStats();
      if (response.data.success) {
        setCropStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching crop stats:', error);
    }
  };

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

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'Vegetable',
      plantingDate: '',
      harvestDate: '',
      area: '',
      yield: '',
      notes: ''
    });
  };

  const handleAddCrop = () => {
    resetForm();
    setShowAddModal(true);
  };

  const handleEditCrop = (crop) => {
    setFormData({
      name: crop.name,
      type: crop.type,
      plantingDate: crop.plantingDate ? new Date(crop.plantingDate).toISOString().split('T')[0] : '',
      harvestDate: crop.harvestDate ? new Date(crop.harvestDate).toISOString().split('T')[0] : '',
      area: crop.area,
      yield: crop.yield,
      notes: crop.notes || ''
    });
    setEditingCrop(crop);
  };

  const handleSaveCrop = async () => {
    try {
      const cropData = {
        ...formData,
        plantingDate: formData.plantingDate || 'Planning',
        harvestDate: formData.harvestDate || 'Planning'
      };

      if (editingCrop) {
        await cropAPI.updateCrop(editingCrop._id, cropData);
      } else {
        await cropAPI.createCrop(cropData);
      }

      fetchCrops();
      fetchCropStats();
      setShowAddModal(false);
      setEditingCrop(null);
      resetForm();
    } catch (error) {
      const errorData = apiUtils.handleError(error);
      setError(errorData.message);
    }
  };

  const handleDeleteCrop = async (cropId) => {
    if (window.confirm('Are you sure you want to delete this crop?')) {
      try {
        await cropAPI.deleteCrop(cropId);
        fetchCrops();
        fetchCropStats();
      } catch (error) {
        const errorData = apiUtils.handleError(error);
        setError(errorData.message);
      }
    }
  };

  const handleUpdateProgress = async (cropId, progress, health) => {
    try {
      await cropAPI.updateCropProgress(cropId, { progress, health });
      fetchCrops();
    } catch (error) {
      const errorData = apiUtils.handleError(error);
      setError(errorData.message);
    }
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
          onClick={handleAddCrop}
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
      {!loading && filteredCrops.length === 0 && (
        <div className="text-center py-12">
          <Sprout className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No crops found</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Try adjusting your search or add a new crop</p>
          <button
            onClick={handleAddCrop}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors duration-200"
          >
            <Plus size={18} />
            <span>Add Your First Crop</span>
          </button>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editingCrop ? 'Edit Crop' : 'Add New Crop'}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingCrop(null);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Crop Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g., Maize, Tomatoes"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="Cereal">Cereal</option>
                  <option value="Legume">Legume</option>
                  <option value="Vegetable">Vegetable</option>
                  <option value="Fruit">Fruit</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Planting Date
                </label>
                <input
                  type="date"
                  value={formData.plantingDate}
                  onChange={(e) => setFormData({...formData, plantingDate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Expected Harvest Date
                </label>
                <input
                  type="date"
                  value={formData.harvestDate}
                  onChange={(e) => setFormData({...formData, harvestDate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Area
                </label>
                <input
                  type="text"
                  value={formData.area}
                  onChange={(e) => setFormData({...formData, area: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g., 2 acres"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Expected Yield
                </label>
                <input
                  type="text"
                  value={formData.yield}
                  onChange={(e) => setFormData({...formData, yield: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g., 40 bags"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows="3"
                  placeholder="Additional notes..."
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingCrop(null);
                  resetForm();
                }}
                className="flex-1 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCrop}
                className="flex-1 py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
              >
                <Save size={16} className="inline mr-2" />
                {editingCrop ? 'Update' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyCrops;