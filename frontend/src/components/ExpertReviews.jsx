import React, { useState, useEffect } from 'react';
import { Star, X, MessageCircle, ThumbsUp, ThumbsDown, User } from 'lucide-react';
import api from '../api';

const ExpertReviews = ({ isOpen, onClose, expertId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  });

  useEffect(() => {
    if (isOpen && expertId) {
      fetchReviews();
    }
  }, [isOpen, expertId]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const response = await api.get('/dashboard/expert-reviews');
      
      if (response.data.success) {
        setReviews(response.data.reviews);
        setStats({
          averageRating: response.data.stats.averageRating,
          totalReviews: response.data.stats.totalReviews,
          ratingDistribution: response.data.stats.ratingDistribution
        });
      }

    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    return [1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        size={16}
        className={`${
          star <= rating
            ? 'text-yellow-500 fill-current'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Expert Reviews</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Client feedback and ratings</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors duration-200"
          >
            <X size={24} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : (
            <>
              {/* Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl p-6 text-center">
                  <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                    {stats.averageRating}
                  </div>
                  <div className="flex items-center justify-center mb-2">
                    {renderStars(Math.floor(stats.averageRating))}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Average Rating</div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-6 text-center">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                    {stats.totalReviews}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Reviews</div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Rating Distribution</div>
                  <div className="space-y-1">
                    {[5, 4, 3, 2, 1].map((rating) => (
                      <div key={rating} className="flex items-center text-xs">
                        <span className="w-3">{rating}</span>
                        <Star size={10} className="text-yellow-500 fill-current mx-1" />
                        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-1 mx-2">
                          <div
                            className="bg-yellow-500 h-1 rounded-full"
                            style={{ width: `${(stats.ratingDistribution[rating] / stats.totalReviews) * 100}%` }}
                          ></div>
                        </div>
                        <span className="w-6 text-right">{stats.ratingDistribution[rating]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Reviews List */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Recent Reviews
                </h3>

                {reviews.map((review) => (
                  <div key={review.id} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                        {review.clientInitials}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <h4 className="font-semibold text-gray-900 dark:text-white">
                              {review.clientName}
                            </h4>
                            <div className="flex items-center">
                              {renderStars(review.rating)}
                            </div>
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(review.date).toLocaleDateString()}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 mb-3">
                          <MessageCircle size={14} className="text-gray-400" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {review.consultationType}
                          </span>
                        </div>

                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                          {review.comment}
                        </p>

                        <div className="flex items-center space-x-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                          <button className="flex items-center space-x-1 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors duration-200">
                            <ThumbsUp size={14} />
                            <span className="text-sm">Helpful</span>
                          </button>
                          <button className="flex items-center space-x-1 text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200">
                            <ThumbsDown size={14} />
                            <span className="text-sm">Not helpful</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExpertReviews;
