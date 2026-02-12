import React, { useState, useEffect } from 'react';
import { X, User, MessageCircle, Calendar, DollarSign, Star } from 'lucide-react';
import api from '../api';

const ViewClients = ({ isOpen, onClose, expertId }) => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalClients: 0,
    activeClients: 0,
    totalRevenue: 0
  });

  useEffect(() => {
    if (isOpen && expertId) {
      fetchClients();
    }
  }, [isOpen, expertId]);

  const fetchClients = async () => {
    setLoading(true);
    try {
      // Mock data for now - replace with actual API call
      const mockClients = [
        {
          id: 1,
          name: 'John Farmer',
          initials: 'JF',
          email: 'john.farmer@email.com',
          phone: '+254 712 345 678',
          totalConsultations: 5,
          totalSpent: 2500,
          lastConsultation: '2024-01-15',
          rating: 5,
          status: 'active',
          avatar: null
        },
        {
          id: 2,
          name: 'Mary Johnson',
          initials: 'MJ',
          email: 'mary.johnson@email.com',
          phone: '+254 723 456 789',
          totalConsultations: 3,
          totalSpent: 1800,
          lastConsultation: '2024-01-12',
          rating: 4,
          status: 'active',
          avatar: null
        },
        {
          id: 3,
          name: 'David Smith',
          initials: 'DS',
          email: 'david.smith@email.com',
          phone: '+254 734 567 890',
          totalConsultations: 8,
          totalSpent: 4200,
          lastConsultation: '2024-01-10',
          rating: 5,
          status: 'active',
          avatar: null
        },
        {
          id: 4,
          name: 'Sarah Wilson',
          initials: 'SW',
          email: 'sarah.wilson@email.com',
          phone: '+254 745 678 901',
          totalConsultations: 2,
          totalSpent: 1200,
          lastConsultation: '2024-01-08',
          rating: 3,
          status: 'inactive',
          avatar: null
        }
      ];

      setClients(mockClients);

      // Calculate stats
      const activeClients = mockClients.filter(client => client.status === 'active').length;
      const totalRevenue = mockClients.reduce((sum, client) => sum + client.totalSpent, 0);

      setStats({
        totalClients: mockClients.length,
        activeClients,
        totalRevenue
      });

    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    return [1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        size={14}
        className={`${
          star <= rating
            ? 'text-yellow-500 fill-current'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  const getStatusColor = (status) => {
    return status === 'active'
      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Clients</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your client relationships</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors duration-200"
          >
            <X size={24} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Stats */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {stats.totalClients}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Clients</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {stats.activeClients}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Active Clients</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                KSh {stats.totalRevenue.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {clients.map((client) => (
                <div key={client.id} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-start space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                      {client.initials}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                          {client.name}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(client.status)}`}>
                          {client.status}
                        </span>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <span className="truncate">{client.email}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <span>{client.phone}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                          <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                            {client.totalConsultations}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">Consultations</div>
                        </div>
                        <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                          <div className="text-lg font-bold text-green-600 dark:text-green-400">
                            KSh {client.totalSpent.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">Total Spent</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          <Calendar size={14} className="text-gray-400" />
                          <span className="text-gray-600 dark:text-gray-400">
                            Last: {new Date(client.lastConsultation).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          {renderStars(client.rating)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                    <button className="flex-1 flex items-center justify-center space-x-2 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors duration-200">
                      <MessageCircle size={16} />
                      <span className="text-sm">Message</span>
                    </button>
                    <button className="flex-1 flex items-center justify-center space-x-2 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors duration-200">
                      <Calendar size={16} />
                      <span className="text-sm">Schedule</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewClients;
