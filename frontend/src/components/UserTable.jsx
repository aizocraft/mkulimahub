import React from 'react';
import { Trash2, Eye } from 'lucide-react';

const UserTable = ({ users, onDeleteUser, onViewProfile }) => {
  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'expert': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
      case 'farmer': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return '👑';
      case 'expert': return '💡';
      case 'farmer': return '🌱';
      default: return '👤';
    }
  };

  if (users.length === 0) {
    return null;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 dark:bg-gray-700/50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              User
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">
              Contact
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Role
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden lg:table-cell">
              Joined
            </th>
            
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {users.map((user) => (
            <tr 
              key={user._id}
              className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150"
            >
              <td className="px-4 py-3 whitespace-nowrap">
                <div className="flex items-center">
                  <img 
                    src={user.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random&color=fff&size=64`}
                    alt={user.name}
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-200 dark:bg-gray-600"
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random&color=fff&size=64`;
                    }}
                  />
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {user.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 md:hidden">
                      {user.email}
                    </div>
                 
                  </div>
                </div>
              </td>
              
              <td className="px-4 py-3 whitespace-nowrap hidden md:table-cell">
                <div className="text-sm text-gray-900 dark:text-white">{user.email}</div>
                {user.phone && (
                  <div className="text-sm text-gray-500 dark:text-gray-400">{user.phone}</div>
                )}
              </td>
              
              <td className="px-4 py-3 whitespace-nowrap">
                <div className="flex items-center space-x-2">
                  <span className="text-sm">{getRoleIcon(user.role)}</span>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${getRoleBadgeClass(user.role)} capitalize`}>
                    {user.role}
                  </span>
                </div>
              </td>
              
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white hidden lg:table-cell">
                {new Date(user.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </td>
              
           
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;