import { useState } from 'react';
import { Calendar, Clock, Plus, Settings, Video, MessageCircle, User } from 'lucide-react';

const Schedule = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const appointments = [
    {
      id: 1,
      clientName: 'John Kamau',
      type: 'video',
      time: '10:30 AM - 11:15 AM',
      duration: '45 mins',
      issue: 'Maize Pest Control',
      status: 'confirmed'
    },
    {
      id: 2,
      clientName: 'Mary Wanjiku',
      type: 'message',
      time: '3:00 PM - 3:30 PM',
      duration: '30 mins',
      issue: 'Soil Testing Results',
      status: 'confirmed'
    },
    {
      id: 3,
      clientName: 'Peter Mwangi',
      type: 'video',
      time: '4:00 PM - 5:00 PM',
      duration: '60 mins',
      issue: 'Irrigation Setup',
      status: 'pending'
    }
  ];

  const availability = [
    { day: 'Monday', slots: ['9:00 AM - 12:00 PM', '2:00 PM - 5:00 PM'] },
    { day: 'Tuesday', slots: ['9:00 AM - 12:00 PM', '2:00 PM - 5:00 PM'] },
    { day: 'Wednesday', slots: ['9:00 AM - 12:00 PM'] },
    { day: 'Thursday', slots: ['9:00 AM - 12:00 PM', '2:00 PM - 5:00 PM'] },
    { day: 'Friday', slots: ['9:00 AM - 12:00 PM'] },
    { day: 'Saturday', slots: ['10:00 AM - 1:00 PM'] },
    { day: 'Sunday', slots: ['Not Available'] }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Schedule Management</h2>
          <p className="text-gray-600 dark:text-gray-400">Manage your availability and appointments</p>
        </div>
        <div className="flex space-x-3 mt-4 sm:mt-0">
          <button className="flex items-center space-x-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors duration-200">
            <Settings size={18} />
            <span>Settings</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors duration-200">
            <Plus size={18} />
            <span>Add Slot</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Appointments */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <Calendar size={20} className="text-gray-600 dark:text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Today's Appointments</h3>
              </div>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>

            <div className="space-y-4">
              {appointments.map(appointment => (
                <div key={appointment.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-sm transition-shadow duration-200">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-lg ${
                      appointment.type === 'video' 
                        ? 'bg-red-100 dark:bg-red-900/30' 
                        : 'bg-blue-100 dark:bg-blue-900/30'
                    }`}>
                      {appointment.type === 'video' ? (
                        <Video size={20} className="text-red-600 dark:text-red-400" />
                      ) : (
                        <MessageCircle size={20} className="text-blue-600 dark:text-blue-400" />
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">{appointment.clientName}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{appointment.issue}</div>
                      <div className="flex items-center space-x-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
                        <Clock size={12} />
                        <span>{appointment.time}</span>
                        <span>•</span>
                        <span>{appointment.duration}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      appointment.status === 'confirmed'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                    }`}>
                      {appointment.status}
                    </div>
                    <button className="mt-2 px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm transition-colors duration-200">
                      {appointment.type === 'video' ? 'Join Call' : 'Open Chat'}
                    </button>
                  </div>
                </div>
              ))}

              {appointments.length === 0 && (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">No appointments scheduled for today</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Availability Settings */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2 mb-6">
              <Clock size={20} className="text-gray-600 dark:text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Weekly Availability</h3>
            </div>

            <div className="space-y-4">
              {availability.map((day, index) => (
                <div key={index} className="flex justify-between items-start p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="font-medium text-gray-900 dark:text-white text-sm">{day.day}</div>
                  <div className="text-right">
                    {day.slots.map((slot, slotIndex) => (
                      <div key={slotIndex} className="text-xs text-gray-600 dark:text-gray-400">
                        {slot}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <button className="w-full mt-4 flex items-center justify-center space-x-2 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors duration-200">
              <Settings size={16} />
              <span>Edit Availability</span>
            </button>
          </div>

          {/* Quick Stats */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 mt-6">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">This Week</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Scheduled Sessions</span>
                <span className="font-semibold text-gray-900 dark:text-white">8</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Available Hours</span>
                <span className="font-semibold text-gray-900 dark:text-white">25 hrs</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Booked Rate</span>
                <span className="font-semibold text-green-600 dark:text-green-400">68%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Schedule;