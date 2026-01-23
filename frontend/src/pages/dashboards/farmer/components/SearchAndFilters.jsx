// pages/dashboards/farmer/components/SearchAndFilters.jsx
import React from 'react';
import { 
  Search, 
  Filter, 
  MapPin, 
  DollarSign, 
  Star,
  X,
  Sparkles
} from 'lucide-react';

const SearchAndFilters = ({ 
  searchQuery, 
  onSearchChange,
  selectedSpecialty,
  onSpecialtyChange,
  selectedAvailability,
  onAvailabilityChange,
  maxRate,
  onMaxRateChange,
  minRating,
  onMinRatingChange,
  onClearFilters,
  expertsCount 
}) => {
  const specialties = ['All', 'Crop Science', 'Soil Management', 'Pest Control', 'Irrigation', 'Organic Farming', 'Climate Smart', 'Livestock', 'Marketing'];
  const availabilityOptions = ['All', 'Available', 'Busy', 'Away'];
  const ratingOptions = [0, 3, 4, 4.5];

  // Check if any filter is active
  const isFilterActive = 
    selectedSpecialty !== 'All' || 
    selectedAvailability !== 'All' || 
    maxRate < 1000 || 
    minRating > 0;

  return (
    <div className="space-y-6">
      {/* Main Search */}
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl blur opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
        <div className="relative">
          <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search experts by name, specialty, or location..."
            className="w-full pl-14 pr-5 py-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 shadow-sm"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          <div className="absolute right-5 top-1/2 transform -translate-y-1/2">
            <span className="text-xs px-3 py-1.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full font-medium">
              {expertsCount} experts
            </span>
          </div>
        </div>
      </div>

      {/* Filter Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <Filter className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Filters</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Find the perfect expert</p>
          </div>
        </div>
        
        {isFilterActive && (
          <button
            onClick={onClearFilters}
            className="flex items-center space-x-2 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
          >
            <X size={14} />
            <span>Clear filters</span>
          </button>
        )}
      </div>

      {/* Filter Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Specialty Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Specialty
          </label>
          <select
            value={selectedSpecialty}
            onChange={(e) => onSpecialtyChange(e.target.value)}
            className="w-full px-3 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
          >
            {specialties.map((specialty) => (
              <option key={specialty} value={specialty}>{specialty}</option>
            ))}
          </select>
        </div>

        {/* Availability Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Availability
          </label>
          <select
            value={selectedAvailability}
            onChange={(e) => onAvailabilityChange(e.target.value)}
            className="w-full px-3 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
          >
            {availabilityOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>

        {/* Max Rate Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center justify-between">
            <span>Max Rate</span>
            <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
              KSh {maxRate.toLocaleString()}
            </span>
          </label>
          <div className="flex items-center space-x-3">
            <DollarSign className="w-4 h-4 text-gray-400" />
            <input
              type="range"
              min="0"
              max="1000"
              step="50"
              value={maxRate}
              onChange={(e) => onMaxRateChange(parseInt(e.target.value))}
              className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500"
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-500 mt-1">
            <span>FREE</span>
            <span>1,000/hr</span>
          </div>
        </div>

        {/* Min Rating Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center justify-between">
            <span>Min Rating</span>
            <span className="flex items-center text-xs font-medium text-yellow-600 dark:text-yellow-400">
              <Star className="w-3 h-3 fill-current mr-1" />
              {minRating === 0 ? 'Any' : minRating}+
            </span>
          </label>
          <div className="flex space-x-2">
            {ratingOptions.map((rating) => (
              <button
                key={rating}
                onClick={() => onMinRatingChange(rating)}
                className={`flex-1 px-3 py-2 rounded-lg border ${
                  minRating === rating
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                    : 'border-gray-300 dark:border-gray-600 hover:border-blue-500 text-gray-700 dark:text-gray-300'
                } transition-colors flex items-center justify-center`}
              >
                {rating === 0 ? (
                  <span className="text-sm">Any</span>
                ) : (
                  <>
                    <Star className="w-3 h-3 fill-current mr-1" />
                    <span className="text-sm">{rating}+</span>
                  </>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Active Filters Display */}
      {isFilterActive && (
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/10 dark:to-cyan-900/10 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
              <Sparkles className="w-4 h-4 mr-2" />
              Active Filters:
            </div>
            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
              {expertsCount} results
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedSpecialty !== 'All' && (
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm">
                {selectedSpecialty}
              </span>
            )}
            {selectedAvailability !== 'All' && (
              <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm">
                {selectedAvailability}
              </span>
            )}
            {maxRate < 1000 && (
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm">
                Under KSh {maxRate.toLocaleString()}/hr
              </span>
            )}
            {minRating > 0 && (
              <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-full text-sm">
                {minRating}+ Stars
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchAndFilters;