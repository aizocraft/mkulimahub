import { useState } from 'react';
import { Users, Calendar, Play, Plus, MessageCircle, Video, Clock, Star } from 'lucide-react';

const Consultations = () => {
  const [activeTab, setActiveTab] = useState('upcoming');

  const [upcomingConsultations, setUpcomingConsultations] = useState([
    {
      id: 1,
      expertName: 'Dr. Peter Soil',
      specialty: 'Soil Management',
      amount: 2000,
      time: 'Tomorrow at 10:00 AM',
      duration: '45 mins',
      status: 'scheduled',
      expertRating: 4.8
    },
    {
      id: 2,
      expertName: 'Mary Irrigation',
      specialty: 'Water Management',
      amount: 1500,
      time: 'Friday at 2:00 PM',
      duration: '30 mins',
      status: 'scheduled',
      expertRating: 4.6
    }
  ]);

  const [pastConsultations, setPastConsultations] = useState([
    {
      id: 3,
      expertName: 'Dr. Jane Expert',
      specialty: 'Pest Control',
      amount: 1800,
      time: 'March 15, 2024',
      duration: '60 mins',
      status: 'completed',
      expertRating: 4.9,
      review: true
    }
  ]);

  const [availableExperts, setAvailableExperts] = useState([
    {
      id: 1,
      name: 'Dr. John Agriculture',
      specialty: 'Crop Rotation',
      rating: 4.7,
      consultations: 127,
      price: 2000,
      available: true
    },
    {
      id: 2,
      name: 'Sarah Green',
      specialty: 'Organic Farming',
      rating: 4.9,
      consultations: 89,
      price: 2500,
      available: true
    },
    {
      id: 3,
      name: 'Mike Harvest',
      specialty: 'Harvest Techniques',
      rating: 4.5,
      consultations: 203,
      price: 1800,
      available: false
    }
  ]);

  const handleJoinCall = (consultationId) => {
    console.log('Joining call for consultation:', consultationId);
  };

  const handleBookConsultation = (expertId) => {
    console.log('Booking consultation with expert:', expertId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Consultations</h2>
          <p className="text-gray-600 dark:text-gray-400">Manage your expert consultations and bookings</p>
        </div>
        <button className="mt-4 sm:mt-0 flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors duration-200">
          <Plus size={18} />
          <span>Book Consultation</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-1 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex space-x-1">
          <button
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-lg transition-colors duration-200 ${
              activeTab === 'upcoming'
                ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
            onClick={() => setActiveTab('upcoming')}
          >
            Upcoming
          </button>
          <button
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-lg transition-colors duration-200 ${
              activeTab === 'past'
                ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
            onClick={() => setActiveTab('past')}
          >
            Past Sessions
          </button>
          <button
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-lg transition-colors duration-200 ${
              activeTab === 'experts'
                ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
            onClick={() => setActiveTab('experts')}
          >
            Available Experts
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'upcoming' && (
        <div className="space-y-4">
          {upcomingConsultations.map(consultation => (
            <div key={consultation.id} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="flex-1 mb-4 lg:mb-0">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                      <Users size={24} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white text-lg">{consultation.expertName}</h3>
                      <p className="text-gray-600 dark:text-gray-400">{consultation.specialty}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="flex items-center space-x-1">
                          <Star size={14} className="text-yellow-500 fill-current" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">{consultation.expertRating}</span>
                        </div>
                        <span className="text-gray-400">•</span>
                        <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400">
                          <Clock size={14} />
                          <span>{consultation.duration}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">KSh {consultation.amount}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{consultation.time}</div>
                  </div>
                  <button 
                    onClick={() => handleJoinCall(consultation.id)}
                    className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors duration-200"
                  >
                    <Play size={16} />
                    <span>Join Call</span>
                  </button>
                </div>
              </div>
            </div>
          ))}

          {upcomingConsultations.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No upcoming consultations</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">Book your first consultation with an expert</p>
              <button className="inline-flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors duration-200">
                <Plus size={18} />
                <span>Book Consultation</span>
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'past' && (
        <div className="space-y-4">
          {pastConsultations.map(consultation => (
            <div key={consultation.id} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="flex-1 mb-4 lg:mb-0">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                      <Users size={24} className="text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white text-lg">{consultation.expertName}</h3>
                      <p className="text-gray-600 dark:text-gray-400">{consultation.specialty}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="flex items-center space-x-1">
                          <Star size={14} className="text-yellow-500 fill-current" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">{consultation.expertRating}</span>
                        </div>
                        <span className="text-gray-400">•</span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">{consultation.time}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">KSh {consultation.amount}</div>
                    <div className="text-sm text-green-600 dark:text-green-400">Completed</div>
                  </div>
                  {!consultation.review && (
                    <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 text-sm">
                      Add Review
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'experts' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableExperts.map(expert => (
            <div key={expert.id} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {expert.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{expert.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{expert.specialty}</p>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Rating</span>
                  <div className="flex items-center space-x-1">
                    <Star size={14} className="text-yellow-500 fill-current" />
                    <span className="font-medium text-gray-900 dark:text-white">{expert.rating}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Consultations</span>
                  <span className="font-medium text-gray-900 dark:text-white">{expert.consultations}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Price</span>
                  <span className="font-bold text-gray-900 dark:text-white">KSh {expert.price}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Status</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    expert.available 
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}>
                    {expert.available ? 'Available' : 'Busy'}
                  </span>
                </div>
              </div>

              <div className="flex space-x-2">
                <button 
                  onClick={() => handleBookConsultation(expert.id)}
                  disabled={!expert.available}
                  className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm rounded-lg transition-colors duration-200"
                >
                  Book Now
                </button>
                <button className="p-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors duration-200">
                  <MessageCircle size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Consultations;