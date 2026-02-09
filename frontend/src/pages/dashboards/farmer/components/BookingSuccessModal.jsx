// pages/dashboards/farmer/components/BookingSuccessModal.jsx
import React, { useState } from 'react';
import { 
  CheckCircle, 
  Calendar, 
  Clock,
  Download,
  X,
  FileText
} from 'lucide-react';

const BookingSuccessModal = ({ consultation, isFree, isOpen, onClose }) => {
  const [isDownloading, setIsDownloading] = useState(false);

  if (!isOpen || !consultation) return null;

  const expert = consultation.expert || {};
  const totalAmount = consultation.payment?.amount || 0;
  const bookingDate = new Date(consultation.bookingDate || new Date());
  const startTime = consultation.startTime || '09:00';
  const duration = consultation.duration || 30;

  // Format time
  const formatTime = (timeStr) => {
    try {
      const [hours, minutes] = timeStr.split(':').map(Number);
      const period = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;
      return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
    } catch (error) {
      return '09:00 AM';
    }
  };

  // Generate PDF content
  const generatePDFContent = () => {
    const content = `
BOOKING CONFIRMATION
====================

Expert: ${expert?.name || 'Agricultural Expert'}
Date: ${bookingDate.toLocaleDateString('en-US', { 
  weekday: 'long', 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric' 
})}
Time: ${formatTime(startTime)}
Duration: ${duration} minutes
Topic: ${consultation.topic || 'Consultation'}
Amount: ${isFree ? 'FREE' : `KSh ${totalAmount.toLocaleString()}`}
Booking ID: ${consultation._id || 'N/A'}
Booked on: ${new Date().toLocaleDateString()}
Status: Pending confirmation

AgroConnect • www.agroconnect.com
`;
    return content;
  };

  // Handle download
  const handleDownload = async () => {
    setIsDownloading(true);
    
    try {
      const content = generatePDFContent();
      
      // Method 1: Try to create PDF using jsPDF (if available)
      try {
        if (window.jspdf && window.jspdf.jsPDF) {
          const { jsPDF } = window.jspdf;
          const doc = new jsPDF();
          
          doc.setFontSize(16);
          doc.text('Booking Confirmation', 20, 20);
          
          doc.setFontSize(12);
          const lines = content.split('\n');
          lines.forEach((line, index) => {
            doc.text(line, 20, 40 + (index * 8));
          });
          
          doc.save(`booking-${consultation._id || Date.now()}.pdf`);
        } else {
          // Fallback to text file
          throw new Error('jsPDF not available');
        }
      } catch (pdfError) {
        // Create text file as fallback
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        
        a.href = url;
        a.download = `booking-${consultation._id || Date.now()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
      
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setTimeout(() => setIsDownloading(false), 500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal container */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors z-10"
          >
            <X size={20} className="text-gray-500 dark:text-gray-400" />
          </button>

          {/* Success Icon */}
          <div className="p-6 text-center pb-4">
            <div className="w-16 h-16 mx-auto bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-green-500/20">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
              Booking Confirmed
            </h2>
          </div>

          {/* Booking Details */}
          <div className="px-5 pb-5">
            {/* Expert Info */}
            <div className="flex items-center space-x-3 mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 overflow-hidden flex-shrink-0">
                {expert?.profilePicture ? (
                  <img
                    src={expert.profilePicture}
                    alt={expert.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="%23ffffff"><path d="M12 12q-1.65 0-2.825-1.175T8 8q0-1.65 1.175-2.825T12 4q1.65 0 2.825 1.175T16 8q0 1.65-1.175 2.825T12 12Zm-8 8v-2.8q0-.85.438-1.563T5.6 14.55q1.55-.775 3.15-1.163T12 13q1.65 0 3.25.388t3.15 1.162q.725.375 1.163 1.088T20 17.2V20H4Z"/></svg>';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white font-bold">
                    {expert?.name?.charAt(0) || 'A'}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 dark:text-white truncate text-sm">
                  {expert?.name || 'Agricultural Expert'}
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                  Agricultural Specialist
                </p>
              </div>
              {!isFree && (
                <div className="text-right flex-shrink-0">
                  <div className="text-sm font-bold text-blue-600 dark:text-blue-400">
                    KSh {totalAmount.toLocaleString()}
                  </div>
                </div>
              )}
            </div>

            {/* Booking Details Grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="space-y-1">
                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                  <Calendar size={12} className="mr-1.5 flex-shrink-0" />
                  <span>Date</span>
                </div>
                <div className="font-medium text-gray-900 dark:text-white text-sm">
                  {bookingDate.toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                  <Clock size={12} className="mr-1.5 flex-shrink-0" />
                  <span>Time</span>
                </div>
                <div className="font-medium text-gray-900 dark:text-white text-sm">
                  {formatTime(startTime)}
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                  <Clock size={12} className="mr-1.5 flex-shrink-0" />
                  <span>Duration</span>
                </div>
                <div className="font-medium text-gray-900 dark:text-white text-sm">
                  {duration} min
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                  <span className="mr-1.5">📝</span>
                  <span>Topic</span>
                </div>
                <div className="font-medium text-gray-900 dark:text-white text-sm truncate">
                  {consultation.topic || 'Consultation'}
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 mb-4 border border-blue-100 dark:border-blue-800/30">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm">
                Next Steps
              </h4>
              <div className="space-y-2">
                <div className="flex items-start">
                  <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400">1</span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Expert will review your request
                  </p>
                </div>
                <div className="flex items-start">
                  <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400">2</span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {isFree ? 'Confirmation sent' : 'Payment instructions'}
                  </p>
                </div>
                <div className="flex items-start">
                  <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400">3</span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Meeting link before session
                  </p>
                </div>
              </div>
            </div>

            {/* Booking ID */}
            {consultation._id && (
              <div className="mb-4">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Booking ID</div>
                <div className="font-mono text-xs text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700/50 px-2 py-1.5 rounded-lg truncate">
                  {consultation._id}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className={`w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl border transition-all ${
                  isDownloading
                    ? 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                    : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                {isDownloading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    <span className="font-medium text-sm">Downloading...</span>
                  </>
                ) : (
                  <>
                    <Download size={16} />
                    <span className="font-medium text-sm">Download Receipt</span>
                  </>
                )}
              </button>

              <button
                onClick={onClose}
                className="w-full px-4 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-medium text-sm rounded-xl shadow transition-all active:scale-95"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingSuccessModal;