import { useState } from 'react';
import { 
  Sprout, 
  Calendar, 
  MessageCircle, 
  BookOpen, 
  TrendingUp,
  Play,
  Plus,
  ChevronRight,
  Users,
  CheckCircle,
  Clock
} from 'lucide-react';

const Overview = () => {
  const [farmerStats, setFarmerStats] = useState({
    activeConsultations: 2,
    questionsAsked: 8,
    articlesRead: 15,
    expertConnections: 4
  });

  const [myCrops, setMyCrops] = useState([
    { id: 1, name: 'Maize', status: 'Growing', progress: 65, health: 'good' },
    { id: 2, name: 'Beans', status: 'Growing', progress: 40, health: 'warning' },
    { id: 3, name: 'Tomatoes', status: 'Planning', progress: 0, health: 'none' }
  ]);

  const [upcomingConsultations, setUpcomingConsultations] = useState([
    { 
      id: 1, 
      expertName: 'Dr. Peter Soil', 
      specialty: 'Soil Management', 
      amount: 2000, 
      time: 'Tomorrow at 10:00 AM',
      duration: '45 mins'
    },
    { 
      id: 2, 
      expertName: 'Mary Irrigation', 
      specialty: 'Water Management', 
      amount: 1500, 
      time: 'Friday at 2:00 PM',
      duration: '30 mins'
    }
  ]);

  const [recentActivity, setRecentActivity] = useState([
    { 
      id: 1, 
      title: 'Pest Management Session', 
      with: 'Dr. Jane Expert', 
      status: 'completed', 
      time: '2 hours ago',
      type: 'consultation'
    },
    { 
      id: 2, 
      title: 'Maize yellowing leaves', 
      responses: 3, 
      status: 'answered', 
      time: '1 day ago',
      type: 'question'
    },
    { 
      id: 3, 
      title: 'Modern Irrigation Techniques', 
      status: 'read', 
      time: '2 days ago',
      type: 'article'
    }
  ]);

  const [quickActions] = useState([
    { id: 1, title: 'Browse Knowledge', icon: BookOpen, color: 'bg-blue-500', description: 'Access farming guides' },
    { id: 2, title: 'Ask Question', icon: MessageCircle, color: 'bg-emerald-500', description: 'Get expert advice' },
    { id: 3, title: 'Book Consultation', icon: Calendar, color: 'bg-purple-500', description: 'Schedule 1-on-1' },
    { id: 4, title: 'Add Crop', icon: Sprout, color: 'bg-orange-500', description: 'Track new crop' }
  ]);

  const handleJoinCall = (consultationId) => {
    console.log('Joining call for consultation:', consultationId);
  };

  const getHealthColor = (health) => {
    switch (health) {
      case 'good': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'poor': return 'bg-red-500';
      default: return 'bg-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <Users size={24} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Consultations</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{farmerStats.activeConsultations}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
              <MessageCircle size={24} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Questions Asked</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{farmerStats.questionsAsked}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
              <BookOpen size={24} className="text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Articles Read</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{farmerStats.articlesRead}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
              <Users size={24} className="text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Expert Connections</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{farmerStats.expertConnections}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - My Crops & Quick Actions */}
        <div className="lg:col-span-1 space-y-6">
          {/* My Crops */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <Sprout size={20} className="text-gray-600 dark:text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">My Crops</h3>
              </div>
              <button className="flex items-center space-x-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-sm rounded-lg transition-colors duration-200">
                <Plus size={16} />
                <span>Add</span>
              </button>
            </div>

            <div className="space-y-4">
              {myCrops.map(crop => (
                <div key={crop.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${getHealthColor(crop.health)}`}></div>
                      <span className="font-semibold text-gray-900 dark:text-white">{crop.name}</span>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      crop.status === 'Growing' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                      'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}>
                      {crop.status}
                    </span>
                  </div>

                  {crop.progress > 0 && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Progress</span>
                        <span className="font-medium text-gray-900 dark:text-white">{crop.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${crop.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  <button className="w-full mt-3 flex items-center justify-center space-x-1 py-2 text-sm text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors duration-200">
                    <span>View Guide</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2 mb-6">
              <TrendingUp size={20} className="text-gray-600 dark:text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Quick Actions</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {quickActions.map(action => {
                const IconComponent = action.icon;
                return (
                  <button 
                    key={action.id}
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-all duration-200 hover:border-emerald-300 dark:hover:border-emerald-600 group"
                  >
                    <div className={`p-3 ${action.color} rounded-lg w-12 h-12 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-200`}>
                      <IconComponent size={20} className="text-white" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-gray-900 dark:text-white text-sm mb-1">{action.title}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{action.description}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Middle Column - Upcoming Consultations */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 h-full">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <Calendar size={20} className="text-gray-600 dark:text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Upcoming Consultations</h3>
              </div>
              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm rounded-full">
                {upcomingConsultations.length}
              </span>
            </div>

            <div className="space-y-4">
              {upcomingConsultations.map(consultation => (
                <div key={consultation.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">{consultation.expertName}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{consultation.specialty}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-900 dark:text-white">KSh {consultation.amount}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{consultation.duration}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-400">
                      <Clock size={14} />
                      <span>{consultation.time}</span>
                    </div>
                    <button 
                      onClick={() => handleJoinCall(consultation.id)}
                      className="flex items-center space-x-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors duration-200"
                    >
                      <Play size={14} />
                      <span>Join</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button className="w-full mt-4 flex items-center justify-center space-x-2 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors duration-200">
              <Plus size={16} />
              <span>Book New Consultation</span>
            </button>
          </div>
        </div>

        {/* Right Column - Recent Activity */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 h-full">
            <div className="flex items-center space-x-2 mb-6">
              <TrendingUp size={20} className="text-gray-600 dark:text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
            </div>

            <div className="space-y-4">
              {recentActivity.map(activity => (
                <div key={activity.id} className="flex items-start space-x-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-sm transition-shadow duration-200">
                  <div className={`p-2 rounded-lg ${
                    activity.type === 'consultation' ? 'bg-blue-100 dark:bg-blue-900/30' :
                    activity.type === 'question' ? 'bg-emerald-100 dark:bg-emerald-900/30' :
                    'bg-purple-100 dark:bg-purple-900/30'
                  }`}>
                    {activity.type === 'consultation' && <Users size={16} className="text-blue-600 dark:text-blue-400" />}
                    {activity.type === 'question' && <MessageCircle size={16} className="text-emerald-600 dark:text-emerald-400" />}
                    {activity.type === 'article' && <BookOpen size={16} className="text-purple-600 dark:text-purple-400" />}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 dark:text-white text-sm mb-1">
                      {activity.title}
                    </div>
                    {activity.with && (
                      <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">with {activity.with}</div>
                    )}
                    {activity.responses && (
                      <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">{activity.responses} responses</div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        activity.status === 'completed' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                        activity.status === 'answered' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
                        'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}>
                        {activity.status}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3 mt-6">
              <button className="flex items-center justify-center space-x-2 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 text-sm">
                <BookOpen size={16} />
                <span>Browse</span>
              </button>
              <button className="flex items-center justify-center space-x-2 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors duration-200 text-sm">
                <MessageCircle size={16} />
                <span>Ask</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;