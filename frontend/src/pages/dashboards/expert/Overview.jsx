import { useState, useEffect } from 'react';
import {
  Users,
  MessageCircle,
  DollarSign,
  Star,
  Clock,
  TrendingUp,
  CheckCircle,
  Shield,
  Edit3,
  Calendar,
  BarChart3,
  Settings
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { Link } from 'react-router-dom';
import api, { bookingAPI, forumAPI } from '../../../api';

const Overview = () => {
  const { user } = useAuth();

  const [expertStats, setExpertStats] = useState({
    totalConsultations: 47,
    questionsAnswered: 23,
    monthlyEarnings: 94000,
    rating: 4.8,
    pendingConsultations: 0
  });

  const calculateProfileCompletion = () => {
    if (!user) return 0;
    let filled = 0;
    let total = 5;
    if (user.name) filled++;
    if (user.email) filled++;
    if (user.phone) filled++;
    if (user.bio) filled++;
    if (user.expertise && user.expertise.length > 0) filled++;
    return Math.round((filled / total) * 100);
  };

  const [pendingConsultations, setPendingConsultations] = useState([]);
  const [pendingReviews, setPendingReviews] = useState([]);

  const handleAcceptConsultation = async (id) => {
    try {
      await bookingAPI.acceptConsultation(id);
      setPendingConsultations(prev =>
        prev.map(consult =>
          consult.id === id ? { ...consult, status: 'accepted' } : consult
        )
      );
    } catch (error) {
      console.error('Error accepting consultation:', error);
    }
  };

  const handleDeclineConsultation = async (id) => {
    try {
      await bookingAPI.rejectConsultation(id, 'Declined by expert');
      setPendingConsultations(prev =>
        prev.filter(consult => consult.id !== id)
      );
    } catch (error) {
      console.error('Error declining consultation:', error);
    }
  };

  const handleApprove = async (type, id) => {
    try {
      await forumAPI.approveContent(type, id);
      setPendingReviews(prev => prev.filter(review => review.item._id !== id));
    } catch (error) {
      console.error('Error approving content:', error);
    }
  };

  const handleReject = async (type, id) => {
    try {
      const reason = prompt('Enter rejection reason:');
      if (reason) {
        await forumAPI.rejectContent(type, id, reason);
        setPendingReviews(prev => prev.filter(review => review.item._id !== id));
      }
    } catch (error) {
      console.error('Error rejecting content:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch pending consultations
        const pendingResponse = await bookingAPI.getExpertConsultations({ status: 'pending' });
        const pendingConsultations = pendingResponse.data.consultations || [];
        const formattedPending = pendingConsultations.map(consult => ({
          id: consult._id,
          clientInitials: consult.farmer?.name ? consult.farmer.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U',
          clientName: consult.farmer?.name || 'Unknown Farmer',
          issue: consult.description || 'Consultation Request',
          amount: consult.payment?.amount || 0,
          time: new Date(consult.bookingDate).toLocaleDateString() + ' ' + consult.startTime,
          status: consult.status
        }));
        setPendingConsultations(formattedPending);

        // Fetch pending reviews
        const reviewsResponse = await forumAPI.getPendingReviews({ type: 'both' });
        setPendingReviews(reviewsResponse.data.items || []);

        setExpertStats(prev => ({ ...prev, pendingConsultations: formattedPending.length }));
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
              <Users size={24} className="text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Consultations</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{expertStats.totalConsultations}</p>
              <div className="flex items-center space-x-1 mt-1">
                <TrendingUp size={14} className="text-green-500" />
                <span className="text-xs text-green-600 dark:text-green-400 font-medium">+12% this month</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <MessageCircle size={24} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Questions Answered</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{expertStats.questionsAnswered}</p>
              <div className="flex items-center space-x-1 mt-1">
                <TrendingUp size={14} className="text-green-500" />
                <span className="text-xs text-green-600 dark:text-green-400 font-medium">+8% this week</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
              <DollarSign size={24} className="text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Monthly Earnings</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">KSh {expertStats.monthlyEarnings.toLocaleString()}</p>
              <div className="flex items-center space-x-1 mt-1">
                <TrendingUp size={14} className="text-green-500" />
                <span className="text-xs text-green-600 dark:text-green-400 font-medium">+15% growth</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl">
              <Star size={24} className="text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Average Rating</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{expertStats.rating}</p>
              <div className="flex items-center space-x-1 mt-1">
                <Star size={14} className="text-yellow-500 fill-current" />
                <span className="text-xs text-gray-600 dark:text-gray-400">from 38 reviews</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile & Earnings */}
        <div className="lg:col-span-1 space-y-6">
          {/* Profile Status */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2 mb-6">
              <CheckCircle size={20} className="text-gray-600 dark:text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Profile Status</h3>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600 dark:text-gray-400">Profile Completion</span>
                  <span className="font-medium text-gray-900 dark:text-white">{calculateProfileCompletion()}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: `${calculateProfileCompletion()}%` }}></div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Shield size={16} className="text-green-600 dark:text-green-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Verification</span>
                </div>
                <span className={`text-sm font-medium ${user?.isVerified ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {user?.isVerified ? 'Verified' : 'Not Verified'}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center space-x-2">
                  <CheckCircle size={16} className="text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Availability</span>
                </div>
                <span className={`text-sm font-medium ${user?.availability === 'available' ? 'text-green-600 dark:text-green-400' : user?.availability === 'busy' ? 'text-yellow-600 dark:text-yellow-400' : 'text-gray-600 dark:text-gray-400'}`}>
                  {user?.availability ? user.availability.charAt(0).toUpperCase() + user.availability.slice(1) : 'Unknown'}
                </span>
              </div>
            </div>

            <Link to="/profile" className="w-full mt-4 flex items-center justify-center space-x-2 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors duration-200">
              <Edit3 size={16} />
              <span>Edit Profile</span>
            </Link>
          </div>

          {/* Earnings Overview */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2 mb-6">
              <DollarSign size={20} className="text-gray-600 dark:text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Earnings Overview</h3>
            </div>

            <div className="text-center mb-6">
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                KSh {expertStats.monthlyEarnings.toLocaleString()}
              </div>
              <div className="text-gray-600 dark:text-gray-400">This Month</div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <span className="text-sm text-gray-600 dark:text-gray-400">Last 3 Months</span>
                <span className="font-semibold text-gray-900 dark:text-white">KSh 267,000</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <span className="text-sm text-gray-600 dark:text-gray-400">Total Consultations</span>
                <span className="font-semibold text-gray-900 dark:text-white">{expertStats.totalConsultations}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <span className="text-sm text-gray-600 dark:text-gray-400">Average Rating</span>
                <span className="font-semibold text-gray-900 dark:text-white">{expertStats.rating}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Actions & Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2 mb-6">
              <Settings size={20} className="text-gray-600 dark:text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Quick Actions</h3>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <button className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-all duration-200 hover:border-purple-300 dark:hover:border-purple-600 group">
                <div className="p-3 bg-blue-500 rounded-lg w-12 h-12 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-200 mx-auto">
                  <MessageCircle size={20} className="text-white" />
                </div>
                <div className="text-center">
                  <div className="font-semibold text-gray-900 dark:text-white text-sm">Answer Questions</div>
                </div>
              </button>

              <button className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-all duration-200 hover:border-purple-300 dark:hover:border-purple-600 group">
                <div className="p-3 bg-green-500 rounded-lg w-12 h-12 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-200 mx-auto">
                  <Calendar size={20} className="text-white" />
                </div>
                <div className="text-center">
                  <div className="font-semibold text-gray-900 dark:text-white text-sm">Manage Schedule</div>
                </div>
              </button>

              <button className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-all duration-200 hover:border-purple-300 dark:hover:border-purple-600 group">
                <div className="p-3 bg-purple-500 rounded-lg w-12 h-12 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-200 mx-auto">
                  <Users size={20} className="text-white" />
                </div>
                <div className="text-center">
                  <div className="font-semibold text-gray-900 dark:text-white text-sm">View Clients</div>
                </div>
              </button>

              <button className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-all duration-200 hover:border-purple-300 dark:hover:border-purple-600 group">
                <div className="p-3 bg-orange-500 rounded-lg w-12 h-12 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-200 mx-auto">
                  <BarChart3 size={20} className="text-white" />
                </div>
                <div className="text-center">
                  <div className="font-semibold text-gray-900 dark:text-white text-sm">Analytics</div>
                </div>
              </button>
            </div>
          </div>

          {/* Pending Consultations */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <Clock size={20} className="text-gray-600 dark:text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Pending Consultations</h3>
              </div>
              <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 text-sm rounded-full">
                {expertStats.pendingConsultations}
              </span>
            </div>

            <div className="space-y-4">
              {pendingConsultations.map(consultation => (
                <div key={consultation.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-sm transition-shadow duration-200">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {consultation.clientInitials}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">{consultation.clientName}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{consultation.issue}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">{consultation.time}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-bold text-gray-900 dark:text-white text-lg mb-2">
                      KSh {consultation.amount}
                    </div>
                    {consultation.status === 'pending' ? (
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleDeclineConsultation(consultation.id)}
                          className="px-3 py-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded text-sm transition-colors duration-200"
                        >
                          Decline
                        </button>
                        <button 
                          onClick={() => handleAcceptConsultation(consultation.id)}
                          className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors duration-200"
                        >
                          Accept
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-1 text-green-600 dark:text-green-400 text-sm">
                        <CheckCircle size={14} />
                        <span>Confirmed</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Forum Moderation */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <Shield size={20} className="text-gray-600 dark:text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Forum Moderation</h3>
              </div>
              <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-sm rounded-full">
                {pendingReviews.length}
              </span>
            </div>

            <div className="space-y-4">
              {pendingReviews.length > 0 ? (
                pendingReviews.map(review => (
                  <div key={review.item._id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-sm transition-shadow duration-200">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {review.type === 'post' ? 'P' : 'C'}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {review.type === 'post' ? review.item.title : `Comment on "${review.item.post?.title || 'Post'}"`}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          by {review.item.author?.name || 'Unknown'}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleReject(review.type, review.item._id)}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors duration-200"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleApprove(review.type, review.item._id)}
                        className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors duration-200"
                      >
                        Approve
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Shield size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No pending reviews</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;