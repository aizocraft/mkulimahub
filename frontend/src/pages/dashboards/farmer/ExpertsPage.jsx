import React, { useEffect, useState } from "react";
import { userAPI, apiUtils } from "../../../api"; 
import { useTheme } from '../../../context/ThemeContext';
import {
  Star,
  DollarSign,
  MapPin,
  Clock,
  Briefcase,
  Loader2,
  CheckCircle,
  Search,
  Filter,
  ChevronRight,
  Sparkles,
  User,
  Award,
  MessageCircle,
  Calendar,
  Shield,
  Zap,
  Users,
  BookOpen
} from "lucide-react";

// Helper component for rating stars
const RatingDisplay = ({ average, count }) => {
  const roundedRating = Math.round(average);
  const stars = Array.from({ length: 5 }, (_, index) => (
    <Star
      key={index}
      className={`w-4 h-4 transition-colors duration-150 ${
        index < roundedRating 
          ? "text-yellow-500 fill-yellow-500 dark:text-yellow-400 dark:fill-yellow-400" 
          : "text-gray-300 dark:text-gray-600"
      }`}
    />
  ));

  return (
    <div className="flex items-center space-x-1">
      {stars}
      <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">
        {average.toFixed(1)} ({count})
      </span>
    </div>
  );
};

// Expert Card Component
const ExpertCard = ({ expert }) => {
  const getAvailabilityColor = (availability) => {
    switch(availability?.toLowerCase()) {
      case 'available':
        return 'bg-green-500';
      case 'busy':
        return 'bg-yellow-500';
      case 'offline':
        return 'bg-gray-400';
      default:
        return 'bg-blue-500';
    }
  };

  const getRateColor = (rate) => {
    if (rate < 1000) return 'text-green-600 dark:text-green-400';
    if (rate < 3000) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300 hover:transform hover:-translate-y-2">
      {/* Header with Profile Image */}
      <div className="relative h-48 bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/20 dark:to-cyan-900/20 overflow-hidden">
        {/* Availability Indicator */}
        <div className="absolute top-4 left-4 flex items-center gap-2">
          <div className="flex items-center gap-1 px-3 py-1 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-full">
            <div className={`w-2 h-2 rounded-full ${getAvailabilityColor(expert.availability)} animate-pulse`} />
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300 capitalize">
              {expert.availability || 'Available'}
            </span>
          </div>
          
          {/* Verified Badge */}
          {expert.isVerified && (
            <div className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 backdrop-blur-sm rounded-full flex items-center gap-1">
              <Shield className="w-3 h-3 text-blue-600 dark:text-blue-400" />
              <span className="text-xs font-medium text-blue-700 dark:text-blue-300">Verified</span>
            </div>
          )}
        </div>

        {/* Profile Image */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
          <div className="relative">
            <img
              src={expert.profilePicture || `https://placehold.co/96x96/3b82f6/FFFFFF?text=${expert.name.charAt(0)}`}
              onError={(e) => e.target.src = `https://placehold.co/96x96/3b82f6/FFFFFF?text=${expert.name.charAt(0)}`}
              alt={expert.name}
              className="w-24 h-24 rounded-full object-cover ring-4 ring-white dark:ring-gray-800 shadow-xl"
            />
            {/* Online Status Indicator */}
            <div className="absolute bottom-2 right-2 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800" />
          </div>
        </div>
      </div>

      {/* Expert Content */}
      <div className="p-6 pt-10">
        <div className="text-center mb-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {expert.name}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
            Agricultural Specialist
          </p>
          
          {/* Rating */}
          <div className="flex items-center justify-center mt-3">
            <RatingDisplay average={expert.rating?.average || 4.5} count={expert.rating?.count || 0} />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="text-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="text-sm font-bold text-blue-600 dark:text-blue-400">
              {expert.yearsOfExperience || 5}+
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Years</div>
          </div>
          
          <div className="text-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
              {expert.successRate || 95}%
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Success</div>
          </div>
          
          <div className="text-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className={`text-sm font-bold ${getRateColor(expert.hourlyRate || 1500)}`}>
              Ksh {expert.hourlyRate || 1500}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">/hour</div>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <MapPin className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {expert.address?.county || 'Nairobi, Kenya'}
            </span>
          </div>
          
          <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <BookOpen className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {expert.yearsOfExperience || 5}+ years experience
            </span>
          </div>
        </div>

        {/* Expertise Tags */}
        <div className="mb-6">
          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Specializes in:</div>
          <div className="flex flex-wrap gap-2">
            {(expert.expertise || ['Crop Management', 'Soil Science', 'Pest Control']).slice(0, 3).map((topic, index) => (
              <span 
                key={index} 
                className="px-3 py-1 text-xs font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full"
              >
                {topic}
              </span>
            ))}
            {(expert.expertise?.length || 0) > 3 && (
              <span className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                +{(expert.expertise?.length || 0) - 3}
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button className="w-full group/btn bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40">
            <MessageCircle className="w-4 h-4" />
            Book Consultation
            <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
          </button>
          
          <button className="w-full border border-blue-500 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 font-medium py-2 px-4 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2">
            <User className="w-4 h-4" />
            View Profile
          </button>
        </div>
      </div>
    </div>
  );
};

// Main component
const ExpertsPage = () => {
  const { theme } = useTheme();
  const [experts, setExperts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [selectedAvailability, setSelectedAvailability] = useState('All');

  // Specialties filter options
  const specialties = ['All', 'Crop Science', 'Soil Management', 'Pest Control', 'Irrigation', 'Organic Farming', 'Climate Smart'];
  const availabilityOptions = ['All', 'Available', 'Busy', 'Offline'];

  // --- Data Fetching ---
  useEffect(() => {
    const fetchExperts = async () => {
      try {
        setLoading(true);
        const response = await userAPI.getExperts();
        const result = apiUtils.handleSuccess(response);

        if (result.success && Array.isArray(result.data.experts)) {
          setExperts(result.data.experts);
        } else {
          setError("Unexpected response format or data structure.");
        }
      } catch (err) {
        const errorResult = apiUtils.handleError(err);
        setError(errorResult.message);
      } finally {
        setLoading(false);
      }
    };

    fetchExperts();
  }, []);

  // Filter experts based on search and filters
  const filteredExperts = experts.filter(expert => {
    const matchesSearch = expert.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         expert.expertise?.some(topic => topic.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesSpecialty = selectedSpecialty === 'All' || 
                           expert.expertise?.some(topic => topic.toLowerCase().includes(selectedSpecialty.toLowerCase()));
    
    const matchesAvailability = selectedAvailability === 'All' || 
                              expert.availability?.toLowerCase() === selectedAvailability.toLowerCase();
    
    return matchesSearch && matchesSpecialty && matchesAvailability;
  });

  // Stats for the header
  const stats = [
    { 
      number: experts.length, 
      label: 'Total Experts',
      icon: <Users className="w-5 h-5 text-blue-500" />,
      color: 'from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20'
    },
    { 
      number: experts.filter(e => e.isVerified).length, 
      label: 'Verified',
      icon: <Shield className="w-5 h-5 text-emerald-500" />,
      color: 'from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20'
    },
    { 
      number: experts.filter(e => e.availability?.toLowerCase() === 'available').length, 
      label: 'Available Now',
      icon: <Clock className="w-5 h-5 text-yellow-500" />,
      color: 'from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20'
    },
    { 
      number: '24/7', 
      label: 'Support',
      icon: <Zap className="w-5 h-5 text-purple-500" />,
      color: 'from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20'
    },
  ];

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900/20 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Loading Experts</h3>
        <p className="text-gray-600 dark:text-gray-400">Fetching the best agricultural specialists...</p>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900/20 flex items-center justify-center">
      <div className="max-w-lg p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-red-200 dark:border-red-900/50">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
            <Shield className="w-8 h-8 text-red-500 dark:text-red-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Unable to Load Experts</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">Please check your connection and try again.</p>
          <p className="text-sm text-gray-500 dark:text-gray-500">Error: {error}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900/20 transition-colors duration-300">
      {/* Sleek Header Section */}
      <div className="relative pt-16 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 via-transparent to-transparent dark:from-blue-500/10"></div>
        <div className="max-w-7xl mx-auto relative">
          <div className="text-center">
            {/* Compact Title with Icon */}
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                  <Sparkles className="w-2 h-2 text-white" />
                </div>
              </div>
              <div className="text-left">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                  Expert <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">Advisors</span>
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                  Connect with certified agricultural specialists
                </p>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 max-w-2xl mx-auto">
              {stats.map((stat, index) => (
                <div 
                  key={index}
                  className={`p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gradient-to-br ${stat.color}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.number}</div>
                    {stat.icon}
                  </div>
                  <div className="text-xs font-medium text-gray-600 dark:text-gray-400">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Quick Search */}
            <div className="max-w-xl mx-auto">
              <div className="relative">
                <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search experts by name or specialty..."
                  className="w-full pl-14 pr-5 py-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 shadow-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className="absolute right-5 top-1/2 transform -translate-y-1/2">
                  <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
                    {filteredExperts.length} found
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <Filter className="w-4 h-4" />
              <span className="text-sm font-medium">Filter experts:</span>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={() => {
                  setSearchQuery('');
                  setSelectedSpecialty('All');
                  setSelectedAvailability('All');
                }}
                className="text-xs px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
              >
                Clear all filters
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Specialty Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                Specialty
              </label>
              <div className="flex flex-wrap gap-2">
                {specialties.map((specialty) => (
                  <button
                    key={specialty}
                    onClick={() => setSelectedSpecialty(specialty)}
                    className={`px-3 py-1.5 text-sm rounded-lg transition-all duration-200 ${
                      selectedSpecialty === specialty
                        ? 'bg-blue-500 text-white shadow-sm'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {specialty}
                  </button>
                ))}
              </div>
            </div>

            {/* Availability Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                Availability
              </label>
              <div className="flex flex-wrap gap-2">
                {availabilityOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => setSelectedAvailability(option)}
                    className={`px-3 py-1.5 text-sm rounded-lg transition-all duration-200 ${
                      selectedAvailability === option
                        ? 'bg-emerald-500 text-white shadow-sm'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Experts Grid Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {filteredExperts.length > 0 ? (
          <>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                Available Experts
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {selectedSpecialty === 'All' 
                  ? 'Browse all certified agricultural experts' 
                  : `${selectedSpecialty} specialists`}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredExperts.map((expert, index) => (
                <ExpertCard 
                  key={expert.id} 
                  expert={expert}
                  style={{ animationDelay: `${index * 100}ms` }}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mb-6">
              <Users className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No experts found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Try adjusting your search filters</p>
            <button 
              onClick={() => {
                setSearchQuery('');
                setSelectedSpecialty('All');
                setSelectedAvailability('All');
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              Reset filters
            </button>
          </div>
        )}
      </div>

      {/* Minimal Footer */}
      <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              All experts are verified and certified. Consultations are secure and confidential.
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-500">
              <span className="flex items-center gap-1">
                <Shield className="w-3 h-3" />
                Verified Experts
              </span>
              <span>•</span>
              <span>{experts.length} specialists</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpertsPage;