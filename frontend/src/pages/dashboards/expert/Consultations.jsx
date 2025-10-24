import { useState } from 'react';
import { Users, Calendar, Clock, CheckCircle, XCircle, Search, Filter, Video, MessageCircle } from 'lucide-react';

const Consultations = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const consultations = [
    {
      id: 1,
      clientName: 'John Kamau',
      issue: 'Maize Pest Control',
      amount: 2000,
      date: '2024-03-20',
      time: '10:30 AM',
      status: 'confirmed',
      type: 'video',
      duration: '45 mins'
    },
    {
      id: 2,
      clientName: 'Mary Wanjiku',
      issue: 'Soil Testing Results',
      amount: 1500,
      date: '2024-03-22',
      time: '3:00 PM',
      status: 'pending',
      type: 'message',
      duration: '30 mins'
    },
    {
      id: 3,
      clientName: 'Peter Mwangi',
      issue: 'Irrigation Setup',
      amount: 2500,
      date: '2024-03-18',
      time: '2:00 PM',
      status: 'completed',
      type: 'video',
      duration: '60 mins'
    },
    {
      id: 4,
      clientName: 'Sarah K.',
      issue: 'Fertilizer Recommendations',
      amount: 1800,
      date: '2024-03-15',
      time: '11:00 AM',
      status: 'completed',
      type: 'message',
      duration: '25 mins'
    }
  ];

  const filteredConsultations = consultations.filter(consult => {
    const matchesSearch = consult.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         consult.issue.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = activeFilter === 'all' || consult.status === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
      case 'pending': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'completed': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed': return <CheckCircle size={14} />;
      case 'pending': return <Clock size={14} />;
      case 'completed': return <CheckCircle size={14} />;
      default: return <Clock size={14} />;
    }
  };

  const handleAccept = (id) => {
    console.log('Accept consultation:', id);
  };

  const handleDecline = (id) => {
    console.log('Decline consultation:', id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Consultations Management</h2>
          <p className="text-gray-600 dark:text-gray-400">Manage all your consultations in one place</p>
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
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
            </select>
            <button className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
              <Filter size={18} className="text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Consultations List */}
      <div className="space-y-4">
        {filteredConsultations.map(consultation => (
          <div key={consultation.id} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center space-x-4 mb-4 lg:mb-0">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {consultation.clientName.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-lg">{consultation.clientName}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{consultation.issue}</p>
                  <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center space-x-1">
                      <Calendar size={14} />
                      <span>{consultation.date}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock size={14} />
                      <span>{consultation.time}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      {consultation.type === 'video' ? <Video size={14} /> : <MessageCircle size={14} />}
                      <span>{consultation.duration}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">KSh {consultation.amount}</div>
                  <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(consultation.status)}`}>
                    {getStatusIcon(consultation.status)}
                    <span className="capitalize">{consultation.status}</span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  {consultation.status === 'pending' && (
                    <>
                      <button 
                        onClick={() => handleDecline(consultation.id)}
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors duration-200"
                      >
                        Decline
                      </button>
                      <button 
                        onClick={() => handleAccept(consultation.id)}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200"
                      >
                        Accept
                      </button>
                    </>
                  )}
                  {consultation.status === 'confirmed' && (
                    <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors duration-200">
                      Start Session
                    </button>
                  )}
                  {consultation.status === 'completed' && (
                    <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200">
                      View Details
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredConsultations.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No consultations found</h3>
            <p className="text-gray-500 dark:text-gray-400">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Consultations;