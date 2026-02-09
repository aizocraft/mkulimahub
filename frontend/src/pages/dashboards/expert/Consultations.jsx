// pages/dashboards/expert/Consultations.jsx 
import { useState, useEffect } from 'react';
import { 
  Users, Calendar, Clock, CheckCircle, XCircle, Search, Filter, 
  Video, MessageCircle, ChevronDown, DollarSign, CreditCard 
} from 'lucide-react';
import { bookingAPI, apiUtils } from '../../../api';
import toast from 'react-hot-toast';
import VideoCallModal from '../../../components/VideoCall/VideoCallModal';
import { useAuth } from '../../../context/AuthContext';

const Consultations = () => {
  const { user: authUser } = useAuth();
  const [activeFilter, setActiveFilter] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showVideoCallModal, setShowVideoCallModal] = useState(false);

  const user = authUser || JSON.parse(localStorage.getItem('user') || 'null');

  useEffect(() => {
    fetchConsultations();
  }, [activeFilter]);

  const fetchConsultations = async () => {
    try {
      setLoading(true);
      const params = {};
      if (activeFilter !== 'all') {
        params.status = activeFilter;
      }
      const response = await bookingAPI.getExpertConsultations(params);
      if (response.data.success) {
        setConsultations(response.data.consultations);
      }
    } catch (error) {
      toast.error('Failed to fetch consultations');
      console.error('Error fetching consultations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartVideoCall = (consultation) => {
    const validation = apiUtils.videoCall.validateConsultationForVideoCall(consultation);
    if (!validation.isValid) {
      toast.error(validation.errors[0] || 'Cannot start video call');
      return;
    }
    const browserSupport = apiUtils.videoCall.checkBrowserSupport();
    if (!browserSupport.allSupported) {
      toast.error(browserSupport.message);
      return;
    }
    setSelectedConsultation(consultation);
    setShowVideoCallModal(true);
  };

  const handleAccept = async (consultationId) => {
    try {
      const response = await bookingAPI.acceptConsultation(consultationId);
      if (response.data.success) {
        toast.success('Consultation accepted');
        fetchConsultations();
        setShowDetailsModal(false);
      }
    } catch (error) {
      const errorMsg = apiUtils.handleError(error).message;
      toast.error(errorMsg);
    }
  };

  const handleReject = async (consultationId, reason = 'Not available') => {
    try {
      const response = await bookingAPI.rejectConsultation(consultationId, reason);
      if (response.data.success) {
        toast.success('Consultation declined');
        fetchConsultations();
        setShowDetailsModal(false);
      }
    } catch (error) {
      const errorMsg = apiUtils.handleError(error).message;
      toast.error(errorMsg);
    }
  };

  const handleComplete = async (consultationId) => {
    try {
      const response = await bookingAPI.completeConsultation(consultationId);
      if (response.data.success) {
        toast.success('Consultation marked as completed');
        fetchConsultations();
        setShowDetailsModal(false);
      }
    } catch (error) {
      const errorMsg = apiUtils.handleError(error).message;
      toast.error(errorMsg);
    }
  };

  const handleCancel = async (consultationId) => {
    try {
      const response = await bookingAPI.cancelConsultation(consultationId, 'Cancelled by expert');
      if (response.data.success) {
        toast.success('Consultation cancelled');
        fetchConsultations();
        setShowDetailsModal(false);
      }
    } catch (error) {
      const errorMsg = apiUtils.handleError(error).message;
      toast.error(errorMsg);
    }
  };

  const filteredConsultations = consultations.filter(consult => {
    const matchesSearch = 
      consult.farmer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consult.topic?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consult.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeFilter === 'all') return matchesSearch;
    if (activeFilter === 'pending_payment') {
      return matchesSearch && consult.status === 'accepted' &&
             consult.payment?.status === 'pending' && !consult.payment?.isFree;
    }
    return matchesSearch && consult.status === activeFilter;
  });

  const getStatusColor = (status) => {
    return apiUtils.booking.getStatusColor(status);
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: <Clock size={14} className="text-yellow-600" />,
      accepted: <CheckCircle size={14} className="text-green-600" />,
      rejected: <XCircle size={14} className="text-red-600" />,
      completed: <CheckCircle size={14} className="text-blue-600" />,
      cancelled: <XCircle size={14} className="text-gray-600" />,
    };
    return icons[status] || <Clock size={14} className="text-gray-600" />;
  };

  const getPaymentStatus = (consultation) => {
    if (consultation.payment?.isFree) {
      return { text: 'Free', color: 'bg-green-100 text-green-800' };
    }
    
    switch (consultation.payment?.status) {
      case 'paid': return { text: 'Paid', color: 'bg-green-100 text-green-800' };
      case 'pending': return { text: 'Payment Pending', color: 'bg-yellow-100 text-yellow-800' };
      case 'failed': return { text: 'Payment Failed', color: 'bg-red-100 text-red-800' };
      case 'refunded': return { text: 'Refunded', color: 'bg-blue-100 text-blue-800' };
      default: return { text: 'Pending', color: 'bg-gray-100 text-gray-800' };
    }
  };

  const ConsultationDetailsModal = () => {
    if (!selectedConsultation) return null;

    const paymentStatus = getPaymentStatus(selectedConsultation);
    const totalAmount = selectedConsultation.payment?.amount || 0;
    const isFree = selectedConsultation.payment?.isFree;
    const hourlyRate = selectedConsultation.payment?.hourlyRate || 0;
    const totalHours = selectedConsultation.duration / 60;
    const canStartVideoCall = selectedConsultation.status === 'accepted';

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
                <XCircle size={20} />
              </button>
            </div>

            <div className="space-y-6">
              {/* Farmer Info */}
              <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  {selectedConsultation.farmer?.name?.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white text-lg">
                    {selectedConsultation.farmer?.name || 'Unknown Farmer'}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400">{selectedConsultation.farmer?.email}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{selectedConsultation.farmer?.phone}</p>
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
                    <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedConsultation.status)}`}>
                      {getStatusIcon(selectedConsultation.status)}
                      <span className="capitalize">{selectedConsultation.status}</span>
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Date & Time</label>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {new Date(selectedConsultation.bookingDate).toLocaleDateString()} • {selectedConsultation.startTime}
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
                  <DollarSign size={18} className="mr-2" />
                  Payment Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400">Hourly Rate</label>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      KSh {hourlyRate.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400">Duration</label>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {totalHours.toFixed(1)} hours
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400">Total Amount</label>
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      KSh {totalAmount.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="mt-3">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${paymentStatus.color}`}>
                    {paymentStatus.text}
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
                      handleStartVideoCall(selectedConsultation);
                    }}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200"
                  >
                    <Video size={16} className="inline mr-2" />
                    Start Video Call
                  </button>
                )}
                
                {selectedConsultation.status === 'pending' && (
                  <>
                    <button 
                      onClick={() => handleReject(selectedConsultation._id)}
                      className="flex-1 px-4 py-2 border border-red-600 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                    >
                      Decline
                    </button>
                    <button 
                      onClick={() => handleAccept(selectedConsultation._id)}
                      className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200"
                    >
                      Accept Consultation
                    </button>
                  </>
                )}
                
                {selectedConsultation.status === 'accepted' && (
                  <>
                    <button 
                      onClick={() => handleCancel(selectedConsultation._id)}
                      className="px-4 py-2 border border-gray-600 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={() => handleComplete(selectedConsultation._id)}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors duration-200"
                    >
                      Mark as Complete
                    </button>
                  </>
                )}

                {selectedConsultation.meetingLink && (
                  <a 
                    href={selectedConsultation.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200"
                  >
                    <Video size={16} className="inline mr-2" />
                    Join Video Call
                  </a>
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
          <p className="text-gray-600 dark:text-gray-400">Manage your consultations and payments</p>
        </div>
      </div>

      {/* Filters and Search */}
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
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-4">
            <select 
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="pending">Pending</option>
              <option value="pending_payment">Pending Payment</option>
              <option value="accepted">Accepted</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
              <option value="cancelled">Cancelled</option>
              <option value="all">All</option>
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

      {/* Consultations List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          </div>
        ) : filteredConsultations.length > 0 ? (
          filteredConsultations.map(consultation => {
            const paymentStatus = getPaymentStatus(consultation);
            const totalAmount = consultation.payment?.amount || 0;
            const isFree = consultation.payment?.isFree;
            const canStartVideoCall = consultation.status === 'accepted';

            return (
              <div key={consultation._id} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow duration-200">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-center space-x-4 mb-4 lg:mb-0">
                    <div 
                      className="w-12 h-12 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-semibold cursor-pointer"
                      onClick={() => {
                        setSelectedConsultation(consultation);
                        setShowDetailsModal(true);
                      }}
                    >
                      {consultation.farmer?.name?.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h3 
                        className="font-semibold text-gray-900 dark:text-white text-lg cursor-pointer hover:text-purple-600"
                        onClick={() => {
                          setSelectedConsultation(consultation);
                          setShowDetailsModal(true);
                        }}
                      >
                        {consultation.farmer?.name || 'Unknown Farmer'}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">{consultation.topic}</p>
                      <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center space-x-1">
                          <Calendar size={14} />
                          <span>{new Date(consultation.bookingDate).toLocaleDateString()}</span>
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
                        KSh {totalAmount.toLocaleString()}
                      </div>
                      <div className="flex items-center justify-end space-x-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(consultation.status)}`}>
                          {consultation.status}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${paymentStatus.color}`}>
                          {paymentStatus.text}
                        </span>
                        {isFree && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                            Free
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      {canStartVideoCall && (
                        <button 
                          onClick={() => handleStartVideoCall(consultation)}
                          className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200"
                        >
                          <Video size={16} />
                          <span>Video Call</span>
                        </button>
                      )}
                      
                      {consultation.status === 'pending' && (
                        <>
                          <button 
                            onClick={() => handleReject(consultation._id)}
                            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors duration-200"
                          >
                            Decline
                          </button>
                          <button 
                            onClick={() => handleAccept(consultation._id)}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200"
                          >
                            Accept
                          </button>
                        </>
                      )}
                      {consultation.status === 'accepted' && (
                        <>
                          <button 
                            onClick={() => handleCancel(consultation._id)}
                            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors duration-200"
                          >
                            Cancel
                          </button>
                          <button 
                            onClick={() => handleComplete(consultation._id)}
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors duration-200"
                          >
                            Complete
                          </button>
                        </>
                      )}
                      <button 
                        onClick={() => {
                          setSelectedConsultation(consultation);
                          setShowDetailsModal(true);
                        }}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
                      >
                        Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No consultations found</h3>
            <p className="text-gray-500 dark:text-gray-400">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {showDetailsModal && <ConsultationDetailsModal />}
      
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