// pages/dashboards/farmer/ExpertsPage.jsx
import React, { useState, useEffect } from 'react';
import { userAPI } from '../../../api';
import { useTheme } from '../../../context/ThemeContext';
import ExpertCard from './components/ExpertCard';
import ExpertProfileModal from './components/ExpertProfileModal';
import BookingModal from './components/BookingModal';
import BookingSuccessModal from './components/BookingSuccessModal';
import SearchAndFilters from './components/SearchAndFilters';
import AiChatBot from './components/AiChatBot';
import {
  Users,
  Shield,
  Zap,
  Clock,
  TrendingUp,
  Loader2,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

const ExpertsPage = () => {
  const { theme } = useTheme();
  const [experts, setExperts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [selectedAvailability, setSelectedAvailability] = useState('All');
  const [maxRate, setMaxRate] = useState(1000);
  const [minRating, setMinRating] = useState(0);
  
  // Modal states
  const [selectedExpert, setSelectedExpert] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [bookingSuccessData, setBookingSuccessData] = useState(null);
  const [isFreeBooking, setIsFreeBooking] = useState(false);

  // Fetch experts
  useEffect(() => {
    const fetchExperts = async () => {
      try {
        setLoading(true);
        console.log('Fetching experts from API...');
        
        const response = await userAPI.getExperts();
        console.log('API Response:', response);
        
        if (response.data) {
          // Check different possible response structures
          let expertsData = [];
          
          if (Array.isArray(response.data)) {
            // Case 1: Response.data is directly an array
            expertsData = response.data;
          } else if (response.data.experts && Array.isArray(response.data.experts)) {
            // Case 2: Response.data has experts array
            expertsData = response.data.experts;
          } else if (response.data.data && Array.isArray(response.data.data)) {
            // Case 3: Response.data has data array
            expertsData = response.data.data;
          } else if (response.data.success && Array.isArray(response.data.data)) {
            // Case 4: Response.data has success flag and data array
            expertsData = response.data.data;
          }
          
          console.log('Processed experts data:', expertsData);
          
          if (expertsData.length > 0) {
            // Log first expert to debug structure
            console.log('First expert structure:', {
              id: expertsData[0]._id || expertsData[0].id,
              name: expertsData[0].name,
              role: expertsData[0].role,
              hourlyRate: expertsData[0].hourlyRate,
              keys: Object.keys(expertsData[0])
            });
          }
          
          setExperts(expertsData);
          
          if (expertsData.length === 0) {
            toast.info('No experts found in the system');
          }
        } else {
          console.error('No data in response');
          setError('No data received from server');
          toast.error('Failed to load experts: No data received');
        }
      } catch (err) {
        console.error('Error fetching experts:', err);
        setError(err.message || 'Failed to load experts');
        toast.error('Failed to load experts. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchExperts();
  }, []);

  // Filter experts
  const filteredExperts = experts.filter(expert => {
    if (!expert) return false;
    
    // Search filter
    const matchesSearch = 
      (expert.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (expert.expertise?.some(topic => 
        (topic?.toLowerCase() || '').includes(searchQuery.toLowerCase())
      )) ||
      (expert.address?.county?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    
    // Specialty filter
    const matchesSpecialty = 
      selectedSpecialty === 'All' ||
      expert.expertise?.some(topic => 
        (topic?.toLowerCase() || '').includes(selectedSpecialty.toLowerCase())
      );
    
    // Availability filter
    const matchesAvailability = 
      selectedAvailability === 'All' ||
      (expert.availability?.toLowerCase() || '') === selectedAvailability.toLowerCase();
    
    // Rate filter
    const matchesRate = (expert.hourlyRate || 0) <= maxRate;
    
    // Rating filter
    const matchesRating = (expert.rating?.average || 0) >= minRating;
    
    return matchesSearch && matchesSpecialty && matchesAvailability && matchesRate && matchesRating;
  });

  // Handle expert selection for booking
  const handleBookExpert = (expert) => {
    if (!expert || (!expert._id && !expert.id)) {
      console.error('Cannot book: Expert has no ID', expert);
      toast.error('Cannot book: Expert information is incomplete');
      return;
    }
    
    console.log('Booking expert:', {
      id: expert._id || expert.id,
      name: expert.name
    });
    
    setSelectedExpert(expert);
    setShowBookingModal(true);
  };

  // Handle view profile
  const handleViewProfile = (expert) => {
    if (!expert || (!expert._id && !expert.id)) {
      toast.error('Cannot view profile: Expert information is incomplete');
      return;
    }
    
    setSelectedExpert(expert);
    setShowProfileModal(true);
  };

  // Handle booking success
  const handleBookingSuccess = (consultation, isFree) => {
    setBookingSuccessData(consultation);
    setIsFreeBooking(isFree);
    setShowSuccessModal(true);
    setShowBookingModal(false);
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedSpecialty('All');
    setSelectedAvailability('All');
    setMaxRate(10000);
    setMinRating(0);
  };

  // Stats
  const stats = [
    { 
      id: 'total-experts',
      number: experts.length, 
      label: 'Total Experts',
      icon: <Users className="w-5 h-5 text-blue-500" />,
      color: 'from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20'
    },
    { 
      id: 'verified-experts',
      number: experts.filter(e => e?.isVerified).length, 
      label: 'Verified',
      icon: <Shield className="w-5 h-5 text-emerald-500" />,
      color: 'from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20'
    },
    { 
      id: 'free-experts',
      number: experts.filter(e => (e?.hourlyRate || 0) === 0).length, 
      label: 'Free Experts',
      icon: <Zap className="w-5 h-5 text-yellow-500" />,
      color: 'from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20'
    },
    { 
      id: 'available-now',
      number: experts.filter(e => e?.availability === 'available').length, 
      label: 'Available Now',
      icon: <Clock className="w-5 h-5 text-purple-500" />,
      color: 'from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20'
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900/20 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Loading Experts</h3>
          <p className="text-gray-600 dark:text-gray-400">Finding the best agricultural specialists for you...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900/20 flex items-center justify-center">
        <div className="max-w-lg p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-red-200 dark:border-red-900/50">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-500 dark:text-red-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Unable to Load Experts</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900/20 transition-colors duration-300">
      {/* Header Section */}
      <div className="pt-16 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-2 h-2 text-white" />
                </div>
              </div>
              <div className="text-left">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                  Expert <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">Advisors</span>
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                  Connect with certified agricultural specialists. Book consultations 24/7.
                </p>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 max-w-2xl mx-auto">
              {stats.map((stat) => (
                <div 
                  key={stat.id}
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
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Search and Filters */}
        <div className="mb-8">
          <SearchAndFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedSpecialty={selectedSpecialty}
            onSpecialtyChange={setSelectedSpecialty}
            selectedAvailability={selectedAvailability}
            onAvailabilityChange={setSelectedAvailability}
            maxRate={maxRate}
            onMaxRateChange={setMaxRate}
            minRating={minRating}
            onMinRatingChange={setMinRating}
            onClearFilters={handleClearFilters}
            expertsCount={filteredExperts.length}
          />
        </div>

        {/* Experts Grid */}
        {filteredExperts.length > 0 ? (
          <>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                Available Experts ({filteredExperts.length})
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Click "Book Now" to schedule a consultation. Free experts available!
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredExperts.map((expert, index) => {
                // Get expert ID - try both _id and id
                const expertId = expert._id || expert.id;
                
                if (!expertId) {
                  console.warn(`Expert at index ${index} has no ID:`, expert);
                  return null;
                }
                
                return (
                  <ExpertCard
                    key={expertId}
                    expert={expert}
                    onBook={handleBookExpert}
                    onViewProfile={handleViewProfile}
                  />
                );
              })}
            </div>
          </>
        ) : experts.length > 0 ? (
          // No experts match filters
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mb-6">
              <Users className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No experts match your filters</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {experts.length} experts found, but none match your current filters
            </p>
            <button 
              onClick={handleClearFilters}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl transition-all duration-200"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          // No experts in system
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mb-6">
              <Users className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No experts available</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              There are currently no experts registered in the system.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Please check back later or contact support.
            </p>
          </div>
        )}

          <AiChatBot /> 
      </div>


      {/* Modals */}
      {selectedExpert && (
        <>
          <ExpertProfileModal
            expert={selectedExpert}
            isOpen={showProfileModal}
            onClose={() => setShowProfileModal(false)}
            onBook={() => {
              setShowProfileModal(false);
              setShowBookingModal(true);
            }}
          />

          <BookingModal
            expert={selectedExpert}
            isOpen={showBookingModal}
            onClose={() => setShowBookingModal(false)}
            onSuccess={handleBookingSuccess}
          />

          <BookingSuccessModal
            consultation={bookingSuccessData}
            isFree={isFreeBooking}
            isOpen={showSuccessModal}
            onClose={() => {
              setShowSuccessModal(false);
              setSelectedExpert(null);
            }}
          />
        </>
      )}

      {/* Footer */}
      <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              All experts are verified and certified. Book consultations 24/7. Free experts available.
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-500">
              <span>•</span>
              <span>{experts.length} certified experts</span>
              <span>•</span>
              <span>24/7 booking available</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpertsPage;