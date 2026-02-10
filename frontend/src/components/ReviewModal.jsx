import { useState, useEffect } from 'react';
import { Star, X, Send, Loader2, Sparkles, Heart, ThumbsUp } from 'lucide-react';
import { bookingAPI } from '../api';
import toast from 'react-hot-toast';

const ReviewModal = ({ isOpen, onClose, consultation, onReviewSuccess, isEdit = false }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [isAnimating, setIsAnimating] = useState(false);

  // Initialize values for edit mode
  useEffect(() => {
    if (isOpen && consultation) {
      if (isEdit && consultation.rating) {
        setRating(consultation.rating);
        setReview(consultation.review || '');
      } else {
        setRating(0);
        setReview('');
      }
      setHoverRating(0);
      setErrors({});
      setIsAnimating(false);
    }
  }, [isOpen, consultation, isEdit]);

  const handleStarClick = (starValue) => {
    setRating(starValue);
    setErrors(prev => ({ ...prev, rating: null }));
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 600);
  };

  const handleStarHover = (starValue) => {
    setHoverRating(starValue);
  };

  const handleStarLeave = () => {
    setHoverRating(0);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!rating || rating < 1 || rating > 5) {
      newErrors.rating = 'Please select a rating between 1 and 5 stars';
    }

    if (review.trim().length > 500) {
      newErrors.review = 'Review cannot exceed 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const reviewData = {
        rating: parseInt(rating),
        review: review.trim()
      };

      const response = isEdit
        ? await bookingAPI.editReview(consultation._id, reviewData)
        : await bookingAPI.addReview(consultation._id, reviewData);

      if (response.data.success) {
        toast.success(isEdit ? 'Review updated successfully!' : 'Review added successfully!');
        onReviewSuccess();
        onClose();
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to save review';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const getRatingLabel = (rating) => {
    const labels = {
      1: 'Poor',
      2: 'Fair',
      3: 'Good',
      4: 'Very Good',
      5: 'Excellent'
    };
    return labels[rating] || '';
  };

  const getRatingEmoji = (rating) => {
    const emojis = {
      1: '😞',
      2: '😐',
      3: '🙂',
      4: '😊',
      5: '🤩'
    };
    return emojis[rating] || '';
  };

  if (!isOpen || !consultation) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-lg w-full shadow-2xl border border-gray-200 dark:border-gray-700 animate-in zoom-in-95 duration-300 overflow-hidden">
        {/* Header with Gradient */}
        <div className="relative bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 p-6 text-white">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-full backdrop-blur-sm">
                <Sparkles size={20} className="text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">
                  {isEdit ? 'Edit Your Review' : 'Share Your Experience'}
                </h3>
                <p className="text-emerald-100 text-sm">
                  {isEdit ? 'Update your feedback' : 'Help others make informed decisions'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors duration-200 backdrop-blur-sm"
            >
              <X size={20} className="text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Expert Info with Enhanced Styling */}
          <div className="flex items-center space-x-4 mb-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-600/50 rounded-2xl border border-gray-200 dark:border-gray-600">
            <div className="relative">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                {consultation.expert?.name?.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center">
                <ThumbsUp size={10} className="text-white" />
              </div>
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-gray-900 dark:text-white text-lg">
                {consultation.expert?.name || 'Expert'}
              </h4>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">
                {consultation.topic}
              </p>
              <div className="flex items-center space-x-1">
                <Star size={12} className="text-yellow-500 fill-current" />
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {consultation.expert?.rating?.average || 'No rating yet'}
                </span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Star Rating with Enhanced Animation */}
            <div className="space-y-4">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                How would you rate this consultation? *
              </label>
              <div className="flex items-center space-x-4">
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleStarClick(star)}
                      onMouseEnter={() => handleStarHover(star)}
                      onMouseLeave={handleStarLeave}
                      className={`focus:outline-none transition-all duration-300 hover:scale-125 ${
                        isAnimating && star === rating ? 'animate-bounce' : ''
                      }`}
                    >
                      <Star
                        size={36}
                        className={`transition-all duration-300 ${
                          star <= (hoverRating || rating)
                            ? 'fill-yellow-400 text-yellow-400 drop-shadow-lg scale-110'
                            : 'text-gray-300 dark:text-gray-600 hover:text-yellow-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                {(rating > 0 || hoverRating > 0) && (
                  <div className="flex items-center space-x-2 animate-in slide-in-from-left duration-300">
                    <span className="text-2xl">{getRatingEmoji(hoverRating || rating)}</span>
                    <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                      {getRatingLabel(hoverRating || rating)}
                    </span>
                  </div>
                )}
              </div>
              {errors.rating && (
                <p className="text-sm text-red-600 dark:text-red-400 animate-in slide-in-from-top duration-200 flex items-center space-x-1">
                  <span>⚠️</span>
                  <span>{errors.rating}</span>
                </p>
              )}
            </div>

            {/* Review Text with Enhanced Styling */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center space-x-2">
                <Heart size={16} className="text-red-400" />
                <span>Your Review (Optional)</span>
              </label>
              <div className="relative">
                <textarea
                  value={review}
                  onChange={(e) => {
                    setReview(e.target.value);
                    setErrors(prev => ({ ...prev, review: null }));
                  }}
                  placeholder="Tell others about your experience... What did you like? What could be improved?"
                  rows={4}
                  maxLength={500}
                  className="w-full px-4 py-4 border-2 border-gray-200 dark:border-gray-600 rounded-2xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 resize-none shadow-sm focus:shadow-lg"
                />
                <div className="absolute bottom-3 right-3 text-xs text-gray-400 dark:text-gray-500">
                  {review.length}/500
                </div>
              </div>
              {errors.review && (
                <p className="text-sm text-red-600 dark:text-red-400 animate-in slide-in-from-top duration-200 flex items-center space-x-1">
                  <span>⚠️</span>
                  <span>{errors.review}</span>
                </p>
              )}
            </div>

            {/* Action Buttons with Premium Styling */}
            <div className="flex space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 font-medium shadow-sm hover:shadow-md"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 hover:from-emerald-600 hover:via-green-600 hover:to-teal-600 text-white rounded-2xl transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/40 font-semibold transform hover:scale-105"
              >
                {loading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Send size={18} />
                )}
                <span>{isEdit ? 'Update Review' : 'Submit Review'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;
