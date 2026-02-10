// pages/dashboards/farmer/components/ExpertCard.jsx
import React from 'react';
import { 
  Star, 
  MapPin, 
  Award, 
  CheckCircle, 
  Clock,
  Users,
  Sparkles,
  TrendingUp,
  Shield,
  MessageCircle,
  Calendar,
  DollarSign
} from 'lucide-react';

const ExpertCard = ({ expert, onBook, onViewProfile }) => {
  // Ensure expert exists
  if (!expert) {
    console.error('ExpertCard: Expert prop is undefined');
    return null;
  }

  // Get expert ID - try both _id and id
  const expertId = expert._id || expert.id;
  
  if (!expertId) {
    console.error('ExpertCard: No expert ID found', expert);
    return null;
  }

  const hourlyRate = expert.hourlyRate || 0;
  const rating = expert.rating?.average || 0;
  const ratingCount = expert.rating?.count || 0;
  const displayRating = rating > 0 ? rating.toFixed(1) : 'New';
  const expertise = expert.expertise || [];
  const county = expert.address?.county || 'Not specified';
  const yearsOfExperience = expert.yearsOfExperience || 0;
  const isVerified = expert.isVerified || false;
  const availability = expert.availability || 'available';
  const expertName = expert.name || 'Unknown Expert';

  // Generate initials for profile picture
  const getInitials = (name) => {
    if (!name) return 'EX';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Get availability color
  const getAvailabilityColor = () => {
    switch(availability.toLowerCase()) {
      case 'available': return 'bg-green-500';
      case 'busy': return 'bg-yellow-500';
      case 'away': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  // Get rate color
  const getRateColor = (rate) => {
    if (rate === 0) return 'text-green-600 dark:text-green-400';
    if (rate < 2000) return 'text-blue-600 dark:text-blue-400';
    if (rate < 5000) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-purple-600 dark:text-purple-400';
  };

  // Render star rating
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          size={14}
          className={`${
            i <= Math.floor(rating)
              ? 'fill-yellow-400 text-yellow-400'
              : 'fill-gray-200 text-gray-200 dark:fill-gray-700 dark:text-gray-700'
          }`}
        />
      );
    }
    return stars;
  };

  const handleBookClick = () => {
    if (!expert || !expertId) {
      console.error('Cannot book: Expert data is missing');
      return;
    }
    onBook(expert);
  };

  const handleViewProfileClick = () => {
    if (!expert || !expertId) {
      console.error('Cannot view profile: Expert data is missing');
      return;
    }
    onViewProfile(expert);
  };

  return (
    <div className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300 hover:transform hover:-translate-y-1">
      {/* Expert Header */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          {/* Profile Section */}
          <div className="flex items-start space-x-4">
            <div className="relative">
              {/* Profile Picture */}
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 overflow-hidden">
                {expert.profilePicture ? (
                  <img
                    src={expert.profilePicture}
                    alt={expertName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white text-xl font-bold">
                    {getInitials(expertName)}
                  </div>
                )}
              </div>
              
              {/* Availability Indicator */}
              <div className="absolute -bottom-1 -right-1">
                <div className={`w-6 h-6 rounded-full border-2 border-white dark:border-gray-800 ${getAvailabilityColor()} flex items-center justify-center`}>
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
            </div>

            {/* Expert Info */}
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {expertName}
                </h3>
                {isVerified && (
                  <Shield size={16} className="text-blue-500 fill-blue-100" />
                )}
              </div>
              
              <div className="flex items-center space-x-2 mt-1">
                <MapPin size={14} className="text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {county}
                </span>
              </div>

              {/* Rating */}
              <div className="flex items-center space-x-2 mt-2">
                <div className="flex items-center">
                  {renderStars(rating)}
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {rating.toFixed(1)}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-500">
                  ({ratingCount} {ratingCount === 1 ? 'review' : 'reviews'})
                </span>
              </div>
            </div>
          </div>

          {/* Hourly Rate */}
          <div className="text-right">
            <div className={`text-2xl font-bold ${getRateColor(hourlyRate)}`}>
              {hourlyRate === 0 ? (
                <span className="flex items-center">
                  <span className="bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
                    FREE
                  </span>
                </span>
              ) : (
                `KSh ${hourlyRate.toLocaleString()}`
              )}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {hourlyRate === 0 ? 'No charge' : 'per hour'}
            </div>
          </div>
        </div>

        {/* Expertise Tags */}
        <div className="mb-4">
          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 flex items-center">
            <Award size={12} className="mr-1" />
            Specializations
          </div>
          <div className="flex flex-wrap gap-2">
            {expertise.slice(0, 3).map((skill, index) => (
              <span
                key={`skill-${index}`}
                className="px-3 py-1.5 text-xs font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full border border-blue-100 dark:border-blue-800"
              >
                {skill}
              </span>
            ))}
            {expertise.length > 3 && (
              <span className="px-3 py-1.5 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                +{expertise.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
            <div className="text-sm font-bold text-gray-900 dark:text-white">
              {yearsOfExperience}+
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Years</div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
            <div className="text-sm font-bold text-gray-900 dark:text-white">
              {ratingCount}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Consultations</div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
            <div className="text-sm font-bold text-gray-900 dark:text-white">
              {availability === 'available' ? 'Available' : 'Busy'}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Status</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={handleBookClick}
            className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold py-3 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
          >
            <Calendar size={16} />
            <span>Book Now</span>
          </button>
          
          <button
            onClick={handleViewProfileClick}
            className="px-4 py-3 border border-gray-300 dark:border-gray-600 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl transition-all duration-200 flex items-center justify-center"
          >
            <Users size={16} />
          </button>
        </div>
      </div>

      {/* Decorative Bottom Border */}
      <div className="h-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    </div>
  );
};

export default ExpertCard;