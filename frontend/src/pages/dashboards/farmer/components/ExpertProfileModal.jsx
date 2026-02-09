// pages/dashboards/farmer/components/ExpertProfileModal.jsx
import React from 'react';
import { 
  X, 
  Star, 
  MapPin, 
  Award, 
  Clock, 
  Users, 
  Briefcase, 
  CheckCircle, 
  Globe,
  MessageCircle,
  Calendar,
  DollarSign,
  Shield,
  TrendingUp,
  BookOpen,
  Phone,
  Mail,
  ExternalLink
} from 'lucide-react';

const ExpertProfileModal = ({ expert, isOpen, onClose, onBook }) => {
  if (!isOpen) return null;

  const hourlyRate = expert.hourlyRate || 0;
  const rating = expert.rating?.average || 0;
  const ratingCount = expert.rating?.count || 0;
  const expertise = expert.expertise || [];
  const languages = expert.languages || ['English'];
  const yearsOfExperience = expert.yearsOfExperience || 0;
  const bio = expert.bio || 'No bio available';
  const county = expert.address?.county || 'Not specified';
  const availability = expert.availability || 'available';

  // Render stars
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          size={18}
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

  // Get availability color
  const getAvailabilityColor = () => {
    switch(availability.toLowerCase()) {
      case 'available': return 'bg-green-500 text-white';
      case 'busy': return 'bg-yellow-500 text-white';
      case 'away': return 'bg-red-500 text-white';
      default: return 'bg-gray-400 text-white';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 overflow-hidden">
              {expert.profilePicture ? (
                <img
                  src={expert.profilePicture}
                  alt={expert.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white text-2xl font-bold">
                  {expert.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{expert.name}</h2>
              <p className="text-gray-600 dark:text-gray-400">Agricultural Expert</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X size={24} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Stats Bar */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {yearsOfExperience}+
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Years Experience</div>
            </div>
            
            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {rating.toFixed(1)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Rating</div>
            </div>
            
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {ratingCount}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Consultations</div>
            </div>
            
            <div className={`rounded-xl p-4 ${getAvailabilityColor()}`}>
              <div className="text-2xl font-bold capitalize">
                {availability}
              </div>
              <div className="text-sm opacity-90">Status</div>
            </div>
          </div>

          {/* Bio Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
              <BookOpen size={20} className="mr-2" />
              About
            </h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {bio}
            </p>
          </div>

          {/* Expertise Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
              <Award size={20} className="mr-2" />
              Expertise
            </h3>
            <div className="flex flex-wrap gap-2">
              {expertise.map((skill, index) => (
                <span
                  key={index}
                  className="px-4 py-2 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 text-blue-700 dark:text-blue-300 rounded-lg border border-blue-100 dark:border-blue-800"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Location & Languages */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                <MapPin size={20} className="mr-2" />
                Location
              </h3>
              <div className="space-y-2">
                <div className="flex items-center text-gray-700 dark:text-gray-300">
                  <MapPin size={16} className="mr-2 text-gray-400" />
                  {county}
                </div>
                {expert.address?.country && (
                  <div className="flex items-center text-gray-700 dark:text-gray-300">
                    <Globe size={16} className="mr-2 text-gray-400" />
                    {expert.address.country}
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                <Globe size={20} className="mr-2" />
                Languages
              </h3>
              <div className="space-y-2">
                {languages.map((lang, index) => (
                  <div key={index} className="flex items-center text-gray-700 dark:text-gray-300">
                    <CheckCircle size={16} className="mr-2 text-green-500" />
                    {lang}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Pricing Section */}
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/10 dark:to-cyan-900/10 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <DollarSign size={20} className="mr-2" />
              Consultation Rates
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Hourly Rate</div>
                  {hourlyRate === 0 ? (
                    <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                      FREE
                    </div>
                  ) : (
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                      KSh {hourlyRate.toLocaleString()}/hr
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Typical Session</div>
                  <div className="text-xl font-semibold text-gray-900 dark:text-white">
                    1 hour
                  </div>
                </div>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {hourlyRate === 0 
                  ? 'This expert offers free consultations to help farmers.'
                  : 'Flexible durations available from 15 minutes to 4 hours.'}
              </div>
            </div>
          </div>

          {/* Rating Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Star size={20} className="mr-2" />
              Reviews & Rating
            </h3>
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <div className="text-5xl font-bold text-gray-900 dark:text-white">
                  {rating.toFixed(1)}
                </div>
                <div className="flex items-center justify-center mt-2">
                  {renderStars(rating)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {ratingCount} reviews
                </div>
              </div>
              <div className="flex-1">
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((star) => (
                    <div key={star} className="flex items-center">
                      <div className="w-8 text-sm text-gray-600 dark:text-gray-400">{star}★</div>
                      <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full mx-3 overflow-hidden">
                        <div 
                          className="h-full bg-yellow-400 rounded-full"
                          style={{ width: `${(star <= rating ? 100 : 0)}%` }}
                        ></div>
                      </div>
                      <div className="w-8 text-sm text-gray-600 dark:text-gray-400">
                        {star <= rating ? '100%' : '0%'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="sticky bottom-0 bg-white dark:bg-gray-800 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex space-x-4">
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl font-medium transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => onBook(expert)}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg shadow-blue-500/25"
              >
                <Calendar size={20} />
                <span>Book Consultation</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpertProfileModal;