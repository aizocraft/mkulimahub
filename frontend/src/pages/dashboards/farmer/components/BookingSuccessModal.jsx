// pages/dashboards/farmer/components/BookingSuccessModal.jsx
import React from 'react';
import { 
  CheckCircle, 
  Calendar, 
  Clock, 
  DollarSign, 
  X,
  Download,
  MessageCircle,
  User,
  Sparkles
} from 'lucide-react';

const BookingSuccessModal = ({ consultation, isFree, isOpen, onClose }) => {
  if (!isOpen || !consultation) return null;

  const expert = consultation.expert;
  const totalAmount = consultation.payment?.amount || 0;
  const bookingDate = new Date(consultation.bookingDate);
  const startTime = consultation.startTime;
  const duration = consultation.duration;

  // Format time
  const formatTime = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const handleDownload = () => {
    const content = `
Booking Confirmation
====================

Expert: ${expert?.name}
Date: ${bookingDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
Time: ${formatTime(startTime)}
Duration: ${duration} minutes
Topic: ${consultation.topic}
${description ? `Description: ${consultation.description}` : ''}
Status: Pending (Awaiting expert confirmation)
${!isFree ? `Amount: KSh ${totalAmount.toLocaleString()}` : 'Amount: FREE'}
Booking ID: ${consultation._id}
Booked on: ${new Date().toLocaleDateString()}
    `;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `booking-${consultation._id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="p-6 text-center">
          <div className="w-20 h-20 mx-auto bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Booking Confirmed!
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Your consultation request has been sent to {expert?.name}
          </p>
        </div>

        {/* Success Details */}
        <div className="px-6 space-y-4">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 overflow-hidden">
                  {expert?.profilePicture ? (
                    <img
                      src={expert.profilePicture}
                      alt={expert.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white font-bold">
                      {expert?.name?.charAt(0)}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{expert?.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Agricultural Expert</p>
                </div>
              </div>
              {isFree ? (
                <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm font-medium">
                  FREE
                </span>
              ) : (
                <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  KSh {totalAmount.toLocaleString()}
                </span>
              )}
            </div>

            <div className="space-y-2 border-t border-green-100 dark:border-green-800 pt-3">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <Calendar size={14} className="mr-2" />
                  Date
                </div>
                <span className="font-medium text-gray-900 dark:text-white">
                  {bookingDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <Clock size={14} className="mr-2" />
                  Time
                </div>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatTime(startTime)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <Clock size={14} className="mr-2" />
                  Duration
                </div>
                <span className="font-medium text-gray-900 dark:text-white">
                  {duration} minutes
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <MessageCircle size={14} className="mr-2" />
                  Topic
                </div>
                <span className="font-medium text-gray-900 dark:text-white truncate ml-2">
                  {consultation.topic}
                </span>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-blue-50 dark:bg-blue-900/10 rounded-xl p-4">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
              <Sparkles size={16} className="mr-2" />
              What happens next?
            </h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-start">
                <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400">1</span>
                </div>
                <span>Expert will review and accept your booking</span>
              </li>
              <li className="flex items-start">
                <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400">2</span>
                </div>
                <span>{isFree ? 'Consultation will be confirmed' : 'You\'ll receive payment instructions'}</span>
              </li>
              <li className="flex items-start">
                <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400">3</span>
                </div>
                <span>Meeting link will be sent before the session</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 space-y-3">
          <button
            onClick={handleDownload}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-colors"
          >
            <Download size={18} />
            <span>Download Confirmation</span>
          </button>
          
          <button
            onClick={onClose}
            className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold rounded-xl transition-all duration-200"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingSuccessModal;