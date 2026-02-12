// pages/dashboards/farmer/components/BookingModal.jsx
import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  CheckCircle,
  Loader2,
  Info,
  MessageCircle
} from 'lucide-react';
import { bookingAPI } from '../../../../api';
import toast from 'react-hot-toast';

const BookingModal = ({ expert, isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('09:00');
  const [duration, setDuration] = useState(60);
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');

  // Validate expert data - FIXED: Check for both id and _id
  useEffect(() => {
    if (isOpen) {
      const expertId = expert?.id || expert?._id;
      if (!expert || !expertId) {
        console.error('BookingModal: Invalid expert data', expert);
        toast.error('Cannot book: Expert information is missing');
        setTimeout(() => onClose(), 1000);
      }
    }
  }, [isOpen, expert, onClose]);

  // Get expert ID - handle both id and _id
  const expertId = expert?.id || expert?._id;
  
  if (!expert || !expertId) {
    console.log('BookingModal: Expert data missing, not rendering');
    return null;
  }

  const hourlyRate = expert.hourlyRate || 0;
  const totalCost = (duration / 60) * hourlyRate;
  const isFree = hourlyRate === 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!date) {
      toast.error('Please select a date');
      return;
    }
    if (!time) {
      toast.error('Please select a time');
      return;
    }
    if (!topic || topic.trim().length < 5) {
      toast.error('Please enter a valid topic (min 5 characters)');
      return;
    }

    try {
      setLoading(true);
      
      const bookingData = {
        expertId: expertId, // Use the correct ID
        date: date,
        startTime: time,
        duration: parseInt(duration),
        topic: topic.trim(),
        description: description.trim()
      };

      const response = await bookingAPI.bookConsultation(bookingData);
      
      if (response.data.success) {
        toast.success(response.data.message);
        onSuccess(response.data.consultation, isFree);
      } else {
        toast.error(response.data.message || 'Booking failed');
      }
    } catch (error) {
      console.error('Booking error:', error);
      
      let errorMsg = 'Booking failed. Please try again.';
      
      if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMsg = error.response.data.error;
      } else if (error.message) {
        errorMsg = error.message;
      }
      
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Generate time options (8 AM to 8 PM, every 30 minutes)
  const timeOptions = [];
  for (let hour = 8; hour <= 20; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      timeOptions.push(timeStr);
    }
  }

  // Format time for display
  const formatTime = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Request Consultation</h2>
              <p className="text-gray-600 dark:text-gray-400">Propose a time to {expert.name}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              disabled={loading}
            >
              <X size={24} className="text-gray-500" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Date Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
              <Calendar className="inline mr-2" size={18} />
              Select Date
            </label>
            <input
              type="date"
              min={new Date().toISOString().split('T')[0]}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
              disabled={loading}
            />
          </div>

          {/* Time Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
              <Clock className="inline mr-2" size={18} />
              Select Time
            </label>
            <select
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              disabled={loading}
              required
            >
              {timeOptions.map((timeOption) => (
                <option key={timeOption} value={timeOption}>
                  {formatTime(timeOption)}
                </option>
              ))}
            </select>
          </div>

          {/* Duration Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
              Duration
            </label>
            <div className="flex space-x-2">
              {[30, 60, 90, 120].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setDuration(mins)}
                  className={`flex-1 px-4 py-3 rounded-lg border ${
                    duration === mins
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                  }`}
                  disabled={loading}
                >
                  {mins} min
                </button>
              ))}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Total: {isFree ? 'FREE' : `KSh ${totalCost.toLocaleString()}`}
            </p>
          </div>

          {/* Topic */}
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
              <MessageCircle className="inline mr-2" size={18} />
              What do you need help with?
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Crop disease, Soil testing, Irrigation advice"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
              disabled={loading}
              minLength="5"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
              <Info className="inline mr-2" size={18} />
              Additional Details (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell the expert more about your situation..."
              rows="3"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
              disabled={loading}
            />
          </div>

          {/* Summary */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Expert</span>
                <span className="font-medium">{expert.name}</span>
              </div>
              {date && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Date</span>
                  <span>{new Date(date).toLocaleDateString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Time</span>
                <span>{formatTime(time)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Duration</span>
                <span>{duration} minutes</span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span className={isFree ? 'text-green-600' : 'text-blue-600'}>
                    {isFree ? 'FREE' : `KSh ${totalCost.toLocaleString()}`}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Note */}
          <div className="text-sm text-gray-600 dark:text-gray-400 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
            <Info className="inline mr-2" size={16} />
            The expert will review your request and either accept or decline it.
          </div>

          {/* Buttons */}
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !date || !topic || topic.length < 5}
              className="flex-1 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={20} />
                  Sending...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2" size={20} />
                  Send Request
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingModal;