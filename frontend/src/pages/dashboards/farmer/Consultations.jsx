// pages/dashboards/farmer/Consultations.jsx 
import { useState, useEffect } from 'react';
import { 
  Users, Calendar, Play, Plus, MessageCircle, Clock, Star, 
  Video, CheckCircle, XCircle, Search, Filter, ExternalLink,
  Phone, Video as VideoIcon
} from 'lucide-react';
import { bookingAPI, apiUtils, videoCallAPI } from '../../../api';
import toast from 'react-hot-toast';
import VideoCallModal from '../../../components/VideoCall/VideoCallModal';
import MpesaPaymentModal from '../../../components/MpesaPaymentModal';
import socketService from '../../../services/socketService';
import { useAuth } from '../../../context/AuthContext';


const Consultations = () => {
  const { user: authUser } = useAuth();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [loading, setLoading] = useState(false);
  const [consultations, setConsultations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showVideoCallModal, setShowVideoCallModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Use auth user, with localStorage fallback for compatibility
  const user = authUser || JSON.parse(localStorage.getItem('user') || 'null');

  // Fetch consultations based on active tab
  useEffect(() => {
    fetchConsultations();
  }, [activeTab]);

  const fetchConsultations = async () => {
    try {
      setLoading(true);

      let params = {};

      // Send activeTab as status parameter - backend handles the logic
      if (activeTab !== 'all') {
        params.status = activeTab;
      }

      const response = await bookingAPI.getFarmerConsultations(params);
      
      if (response.data.success) {
        const consultationsData = response.data.consultations.map(consultation => ({
          ...consultation,
          formattedDate: apiUtils.booking.formatBookingDate(consultation.bookingDate),
          formattedTime: apiUtils.booking.formatTimeSlot({
            startTime: consultation.startTime,
            duration: consultation.duration
          }),
          statusColor: apiUtils.booking.getStatusColor(consultation.status),
          statusIcon: apiUtils.booking.getStatusIcon(consultation.status)
        }));
        
        setConsultations(consultationsData);
      }
    } catch (error) {
      console.error('Error fetching consultations:', error);
      toast.error('Failed to load consultations');
    } finally {
      setLoading(false);
    }
  };

  // handleJoinCall - Open modal immediately; VideoCallContainer handles connection/setup
  const handleJoinCall = (consultation) => {
    if (consultation.status !== 'accepted') {
      toast.error('Consultation must be accepted before starting video call');
      return;
    }

    const browserSupport = apiUtils.videoCall.checkBrowserSupport();
    if (!browserSupport.allSupported) {
      toast.error('Your browser does not support video calls. Please use Chrome, Firefox, or Edge.');
      return;
    }

    // Open modal immediately - socket connection and media permissions are handled inside
    setSelectedConsultation(consultation);
    setShowVideoCallModal(true);
  };

  const handleAddReview = async (consultationId, rating, review) => {
    try {
      const response = await bookingAPI.addReview(consultationId, { rating, review });
      if (response.data.success) {
        toast.success('Review added successfully');
        fetchConsultations();
      }
    } catch (error) {
      const errorMsg = apiUtils.handleError(error).message;
      toast.error(errorMsg);
    }
  };

  const handleBookConsultation = () => {
    // Redirect to experts page to book a consultation
    window.location.href = '/experts';
  };

  // Filter consultations based on search term (backend handles status filtering)
  const filteredConsultations = consultations.filter(consult => {
    const matchesSearch =
      consult.expert?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consult.topic?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consult.description?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  const getStatusDisplay = (status) => {
    const statusMap = {
      pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' },
      accepted: { label: 'Scheduled', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' },
      completed: { label: 'Completed', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' },
      cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' },
      rejected: { label: 'Rejected', color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' }
    };
    
    return statusMap[status] || { label: status, color: 'bg-gray-100 text-gray-800' };
  };

  const ConsultationDetailsModal = () => {
    if (!selectedConsultation) return null;
    
    const statusDisplay = getStatusDisplay(selectedConsultation.status);
    const totalAmount = selectedConsultation.payment?.amount || 0;
    const isFree = selectedConsultation.payment?.isFree;

    // Check if video call is available (accepted + free or paid)
    const payment = selectedConsultation.payment;
    const canStartVideoCall = selectedConsultation.status === 'accepted' && 
      (!payment || payment.isFree || payment.status === 'paid');

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Consultation Details</h3>
              <button 
                onClick={() => setShowDetailsModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <XCircle size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Expert Info */}
              <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  {selectedConsultation.expert?.name?.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white text-lg">
                    {selectedConsultation.expert?.name || 'Unknown Expert'}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    {selectedConsultation.expert?.expertise?.join(', ') || 'Expert'}
                  </p>
                  <div className="flex items-center space-x-1 mt-1">
                    <Star size={14} className="text-yellow-500 fill-current" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedConsultation.expert?.rating?.average || 'No rating yet'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Consultation Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Topic</label>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedConsultation.topic}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Description</label>
                    <p className="text-gray-700 dark:text-gray-300">
                      {selectedConsultation.description || 'No description provided'}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Status</label>
                    <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${statusDisplay.color}`}>
                      {statusDisplay.label}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Date & Time</label>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedConsultation.formattedDate} • {selectedConsultation.startTime}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Duration</label>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedConsultation.duration} minutes</p>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                  <span className="mr-2">💵</span>
                  Payment Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400">Hourly Rate</label>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      KSh {selectedConsultation.payment?.hourlyRate?.toLocaleString() || '0'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400">Duration</label>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {(selectedConsultation.duration / 60).toFixed(1)} hours
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400">Total Amount</label>
                    <p className={`text-2xl font-bold ${isFree ? 'text-green-600' : 'text-purple-600'}`}>
                      {isFree ? 'FREE' : `KSh ${totalAmount.toLocaleString()}`}
                    </p>
                  </div>
                </div>
                <div className="mt-3">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    selectedConsultation.payment?.status === 'paid' 
                      ? 'bg-green-100 text-green-800' 
                      : selectedConsultation.payment?.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    Payment: {selectedConsultation.payment?.status || 'pending'}
                  </span>
                  {isFree && (
                    <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                      Free Consultation
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons - UPDATED */}
              <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                {canStartVideoCall && (
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      handleJoinCall(selectedConsultation);
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors duration-200 flex items-center"
                  >
                    <VideoIcon size={16} className="mr-2" />
                    Start Video Call
                  </button>
                )}

                {selectedConsultation.payment?.status === 'pending' && !selectedConsultation.payment?.isFree && (
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      setShowPaymentModal(true);
                    }}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200"
                  >
                    Pay Now
                  </button>
                )}

                {selectedConsultation.status === 'accepted' && (
                  <button
                    onClick={() => handleCancelConsultation(selectedConsultation._id)}
                    className="px-4 py-2 border border-red-600 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                  >
                    Cancel Consultation
                  </button>
                )}

                {selectedConsultation.status === 'completed' && !selectedConsultation.rating && (
                  <button
                    onClick={() => {
                      const rating = prompt('Rate this consultation (1-5 stars):', '5');
                      const review = prompt('Add a review (optional):');
                      if (rating && rating >= 1 && rating <= 5) {
                        handleAddReview(selectedConsultation._id, parseInt(rating), review);
                      }
                    }}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors duration-200"
                  >
                    <Star size={16} className="inline mr-2" />
                    Add Review
                  </button>
                )}

                {selectedConsultation.status === 'completed' && selectedConsultation.rating && (
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={16}
                          className={`${i < selectedConsultation.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Rated {selectedConsultation.rating}/5
                    </span>
                  </div>
                )}

                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Consultations</h2>
          <p className="text-gray-600 dark:text-gray-400">Manage your expert consultations and bookings</p>
        </div>
        <button 
          onClick={handleBookConsultation}
          className="mt-4 sm:mt-0 flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors duration-200"
        >
          <Plus size={18} />
          <span>Book Consultation</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-6">
          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search consultations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-4">
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="upcoming">Upcoming</option>
              <option value="pending">Pending Acceptance</option>
              <option value="rejected">Rejected</option>
              <option value="pending_payment">Pending Payment</option>
              <option value="past">Past Sessions</option>
              <option value="all">All Consultations</option>
            </select>
            <button 
              className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
              onClick={fetchConsultations}
            >
              <Filter size={18} className="text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading consultations...</p>
        </div>
      ) : (
        <>
          {activeTab === 'upcoming' && (
            <div className="space-y-4">
              {filteredConsultations.map(consultation => (
                <div key={consultation._id} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow duration-200">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex-1 mb-4 lg:mb-0">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                          <Users size={24} className="text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <h3 
                            className="font-semibold text-gray-900 dark:text-white text-lg cursor-pointer hover:text-emerald-600"
                            onClick={() => {
                              setSelectedConsultation(consultation);
                              setShowDetailsModal(true);
                            }}
                          >
                            {consultation.expert?.name || 'Unknown Expert'}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400">{consultation.topic}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <div className="flex items-center space-x-1">
                              <Star size={14} className="text-yellow-500 fill-current" />
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {consultation.expert?.rating?.average || 'No rating'}
                              </span>
                            </div>
                            <span className="text-gray-400">•</span>
                            <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400">
                              <Calendar size={14} />
                              <span>{consultation.formattedDate}</span>
                            </div>
                            <span className="text-gray-400">•</span>
                            <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400">
                              <Clock size={14} />
                              <span>{consultation.startTime}</span>
                            </div>
                            <span className="text-gray-400">•</span>
                            <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400">
                              <span>{consultation.duration} mins</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                          {consultation.payment?.isFree ? 'FREE' : `KSh ${consultation.payment?.amount?.toLocaleString() || '0'}`}
                        </div>
                        <div className="flex items-center justify-end space-x-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusDisplay(consultation.status).color}`}>
                            {getStatusDisplay(consultation.status).label}
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedConsultation(consultation);
                            setShowDetailsModal(true);
                          }}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors duration-200"
                        >
                          Details
                        </button>
                        {consultation.payment?.status === 'pending' && !consultation.payment?.isFree && (
                          <button
                            onClick={() => {
                              setSelectedConsultation(consultation);
                              setShowPaymentModal(true);
                            }}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200"
                          >
                            Pay
                          </button>
                        )}
                        {consultation.status === 'accepted' && (
                          <button
                            onClick={() => handleJoinCall(consultation)}
                            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
                          >
                            <Video size={16} />
                            <span>Video Call</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {filteredConsultations.length === 0 && (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No upcoming consultations</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">Book your first consultation with an expert</p>
                  <button 
                    onClick={handleBookConsultation}
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors duration-200"
                  >
                    <Plus size={18} />
                    <span>Book Consultation</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'past' && (
            <div className="space-y-4">
              {filteredConsultations.map(consultation => (
                <div key={consultation._id} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex-1 mb-4 lg:mb-0">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                          <Users size={24} className="text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <h3 
                            className="font-semibold text-gray-900 dark:text-white text-lg cursor-pointer hover:text-emerald-600"
                            onClick={() => {
                              setSelectedConsultation(consultation);
                              setShowDetailsModal(true);
                            }}
                          >
                            {consultation.expert?.name || 'Unknown Expert'}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400">{consultation.topic}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <div className="flex items-center space-x-1">
                              <Star size={14} className="text-yellow-500 fill-current" />
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {consultation.expert?.rating?.average || 'No rating'}
                              </span>
                            </div>
                            <span className="text-gray-400">•</span>
                            <span className="text-sm text-gray-600 dark:text-gray-400">{consultation.formattedDate}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                          {consultation.payment?.isFree ? 'FREE' : `KSh ${consultation.payment?.amount?.toLocaleString() || '0'}`}
                        </div>
                        <div className="text-sm text-green-600 dark:text-green-400">Completed</div>
                      </div>
                      {!consultation.rating && consultation.status === 'completed' && (
                        <button 
                          onClick={() => {
                            setSelectedConsultation(consultation);
                            setShowDetailsModal(true);
                          }}
                          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors duration-200"
                        >
                          Add Review
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'pending' && (
            <div className="space-y-4">
              {filteredConsultations.map(consultation => (
                <div key={consultation._id} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow duration-200">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex-1 mb-4 lg:mb-0">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl">
                          <Clock size={24} className="text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <div>
                          <h3
                            className="font-semibold text-gray-900 dark:text-white text-lg cursor-pointer hover:text-emerald-600"
                            onClick={() => {
                              setSelectedConsultation(consultation);
                              setShowDetailsModal(true);
                            }}
                          >
                            {consultation.expert?.name || 'Unknown Expert'}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400">{consultation.topic}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <div className="flex items-center space-x-1">
                              <Star size={14} className="text-yellow-500 fill-current" />
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {consultation.expert?.rating?.average || 'No rating'}
                              </span>
                            </div>
                            <span className="text-gray-400">•</span>
                            <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400">
                              <Calendar size={14} />
                              <span>{consultation.formattedDate}</span>
                            </div>
                            <span className="text-gray-400">•</span>
                            <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400">
                              <Clock size={14} />
                              <span>{consultation.startTime}</span>
                            </div>
                            <span className="text-gray-400">•</span>
                            <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400">
                              <span>{consultation.duration} mins</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                          {consultation.payment?.isFree ? 'FREE' : `KSh ${consultation.payment?.amount?.toLocaleString() || '0'}`}
                        </div>
                        <div className="flex items-center justify-end space-x-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusDisplay(consultation.status).color}`}>
                            {getStatusDisplay(consultation.status).label}
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedConsultation(consultation);
                            setShowDetailsModal(true);
                          }}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors duration-200"
                        >
                          Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {filteredConsultations.length === 0 && (
                <div className="text-center py-12">
                  <Clock className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No pending consultations</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">Your consultation requests are being reviewed by experts</p>
                  <button
                    onClick={handleBookConsultation}
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors duration-200"
                  >
                    <Plus size={18} />
                    <span>Book New Consultation</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'rejected' && (
            <div className="space-y-4">
              {filteredConsultations.map(consultation => (
                <div key={consultation._id} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow duration-200">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex-1 mb-4 lg:mb-0">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl">
                          <XCircle size={24} className="text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                          <h3
                            className="font-semibold text-gray-900 dark:text-white text-lg cursor-pointer hover:text-emerald-600"
                            onClick={() => {
                              setSelectedConsultation(consultation);
                              setShowDetailsModal(true);
                            }}
                          >
                            {consultation.expert?.name || 'Unknown Expert'}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400">{consultation.topic}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <div className="flex items-center space-x-1">
                              <Star size={14} className="text-yellow-500 fill-current" />
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {consultation.expert?.rating?.average || 'No rating'}
                              </span>
                            </div>
                            <span className="text-gray-400">•</span>
                            <span className="text-sm text-gray-600 dark:text-gray-400">{consultation.formattedDate}</span>
                            <span className="text-gray-400">•</span>
                            <span className="text-sm text-gray-600 dark:text-gray-400">{consultation.duration} mins</span>
                          </div>
                          {consultation.cancellationReason && (
                            <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded text-sm text-red-700 dark:text-red-300">
                              <strong>Reason:</strong> {consultation.cancellationReason}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                          {consultation.payment?.isFree ? 'FREE' : `KSh ${consultation.payment?.amount?.toLocaleString() || '0'}`}
                        </div>
                        <div className="text-sm text-red-600 dark:text-red-400">Rejected</div>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedConsultation(consultation);
                          setShowDetailsModal(true);
                        }}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors duration-200"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {filteredConsultations.length === 0 && (
                <div className="text-center py-12">
                  <XCircle className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No rejected consultations</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">Your consultation requests have been accepted or are still pending</p>
                  <button
                    onClick={handleBookConsultation}
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors duration-200"
                  >
                    <Plus size={18} />
                    <span>Book New Consultation</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'pending_payment' && (
            <div className="space-y-4">
              {filteredConsultations.map(consultation => (
                <div key={consultation._id} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow duration-200">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex-1 mb-4 lg:mb-0">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
                          <span className="text-orange-600 dark:text-orange-400 font-bold text-lg">💳</span>
                        </div>
                        <div>
                          <h3
                            className="font-semibold text-gray-900 dark:text-white text-lg cursor-pointer hover:text-emerald-600"
                            onClick={() => {
                              setSelectedConsultation(consultation);
                              setShowDetailsModal(true);
                            }}
                          >
                            {consultation.expert?.name || 'Unknown Expert'}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400">{consultation.topic}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <div className="flex items-center space-x-1">
                              <Star size={14} className="text-yellow-500 fill-current" />
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {consultation.expert?.rating?.average || 'No rating'}
                              </span>
                            </div>
                            <span className="text-gray-400">•</span>
                            <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400">
                              <Calendar size={14} />
                              <span>{consultation.formattedDate}</span>
                            </div>
                            <span className="text-gray-400">•</span>
                            <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400">
                              <Clock size={14} />
                              <span>{consultation.startTime}</span>
                            </div>
                            <span className="text-gray-400">•</span>
                            <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400">
                              <span>{consultation.duration} mins</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                          KSh {consultation.payment?.amount?.toLocaleString() || '0'}
                        </div>
                        <div className="flex items-center justify-end space-x-2">
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">
                            Payment Pending
                          </span>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                            Scheduled
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedConsultation(consultation);
                            setShowDetailsModal(true);
                          }}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors duration-200"
                        >
                          Details
                        </button>
                        {consultation.payment?.status === 'pending' && !consultation.payment?.isFree && (
                          <button
                            onClick={() => {
                              setSelectedConsultation(consultation);
                              setShowPaymentModal(true);
                            }}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200"
                          >
                            Pay
                          </button>
                        )}
                        {consultation.status === 'accepted' && (
                          <button
                            onClick={() => handleJoinCall(consultation)}
                            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
                          >
                            <Video size={16} />
                            <span>Video Call</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {filteredConsultations.length === 0 && (
                <div className="text-center py-12">
                  <span className="text-6xl">💳</span>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No pending payments</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">All your consultations are either free or paid</p>
                  <button
                    onClick={handleBookConsultation}
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors duration-200"
                  >
                    <Plus size={18} />
                    <span>Book New Consultation</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'all' && (
            <div className="space-y-4">
              {filteredConsultations.map(consultation => (
                <div key={consultation._id} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow duration-200">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-center space-x-4 mb-4 lg:mb-0">
                      <div
                        className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center text-white font-semibold cursor-pointer"
                        onClick={() => {
                          setSelectedConsultation(consultation);
                          setShowDetailsModal(true);
                        }}
                      >
                        {consultation.expert?.name?.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <h3
                          className="font-semibold text-gray-900 dark:text-white text-lg cursor-pointer hover:text-emerald-600"
                          onClick={() => {
                            setSelectedConsultation(consultation);
                            setShowDetailsModal(true);
                          }}
                        >
                          {consultation.expert?.name || 'Unknown Expert'}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">{consultation.topic}</p>
                        <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center space-x-1">
                            <Calendar size={14} />
                            <span>{consultation.formattedDate}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock size={14} />
                            <span>{consultation.startTime}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <span>{consultation.duration} mins</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                          {consultation.payment?.isFree ? 'FREE' : `KSh ${consultation.payment?.amount?.toLocaleString() || '0'}`}
                        </div>
                        <div className="flex items-center justify-end space-x-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusDisplay(consultation.status).color}`}>
                            {getStatusDisplay(consultation.status).label}
                          </span>
                          {consultation.payment?.status === 'pending' && !consultation.payment?.isFree && (
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">
                              Payment Pending
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedConsultation(consultation);
                          setShowDetailsModal(true);
                        }}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors duration-200"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Details Modal */}
      {showDetailsModal && <ConsultationDetailsModal />}

      {/* Payment Modal */}
      {showPaymentModal && selectedConsultation && (
        <MpesaPaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          consultation={selectedConsultation}
        />
      )}

      {/* Video Call Modal */}
      {showVideoCallModal && selectedConsultation && user && (
        <VideoCallModal
          consultation={selectedConsultation}
          user={{ ...user, id: user.id || user._id }}
          isOpen={showVideoCallModal}
          onClose={() => setShowVideoCallModal(false)}
          onEndCall={() => {
            toast.success('Video call ended');
            fetchConsultations(); // Refresh consultations after call ends
          }}
        />
      )}
    </div>
  );
};

export default Consultations;