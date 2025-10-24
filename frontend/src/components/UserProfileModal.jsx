import React, { useState } from 'react';
import { 
  X, 
  Upload, 
  Trash2, 
  User, 
  Mail, 
  Phone, 
  Calendar,
  Edit3,
  Save,
  Shield,
  Leaf,
  Target
} from 'lucide-react';

const UserProfileModal = ({ user, onClose, onUpdateProfile }) => {
  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email || '',
    bio: user.bio || '',
    phone: user.phone || '',
    profilePicture: user.profilePicture || ''
  });
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onUpdateProfile(user._id, formData);
    setLoading(false);
    setIsEditing(false);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const generateDefaultAvatar = (name) => {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff&size=128`;
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          ...formData,
          profilePicture: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const getRoleColor = (role) => {
    const colors = {
      farmer: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
      expert: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      admin: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
    };
    return colors[role] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
  };

  const getRoleIcon = (role) => {
    const icons = {
      farmer: <Leaf className="w-3 h-3" />,
      expert: <Target className="w-3 h-3" />,
      admin: <Shield className="w-3 h-3" />
    };
    return icons[role] || <User className="w-3 h-3" />;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/20 animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200/50 dark:border-gray-700/50">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-emerald-600 bg-clip-text text-transparent">
              User Profile
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Manage user information and preferences
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors duration-200 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="max-h-[80vh] overflow-y-auto">
          {/* Profile Header */}
          <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-start space-x-4">
              <div className="relative group">
                <img 
                  src={formData.profilePicture || generateDefaultAvatar(user.name)} 
                  alt={`${user.name}'s avatar`}
                  className="w-20 h-20 rounded-2xl border-4 border-white dark:border-gray-800 shadow-lg"
                />
                {isEditing && (
                  <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <input
                      type="file"
                      id="avatar-upload"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                    <label htmlFor="avatar-upload" className="cursor-pointer">
                      <Upload className="w-5 h-5 text-white" />
                    </label>
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-3 mb-2">
                  {isEditing ? (
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="text-xl font-bold bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-orange-500 focus:outline-none text-gray-900 dark:text-white"
                    />
                  ) : (
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white truncate">
                      {user.name}
                    </h3>
                  )}
                  <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                    {getRoleIcon(user.role)}
                    <span className="capitalize">{user.role}</span>
                  </span>
                </div>
                
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-orange-500 focus:outline-none text-gray-600 dark:text-gray-400 text-sm"
                  />
                ) : (
                  <p className="text-gray-600 dark:text-gray-400 text-sm truncate">
                    {user.email}
                  </p>
                )}
                
                <div className="flex items-center space-x-4 mt-3 text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-3 h-3" />
                    <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                  </div>
                  {user.updatedAt && (
                    <div className="flex items-center space-x-1">
                      <Edit3 className="w-3 h-3" />
                      <span>Updated {new Date(user.updatedAt).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* User Details */}
          <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-3 p-3 bg-gray-50/50 dark:bg-gray-800/50 rounded-xl">
                <User className="w-4 h-4 text-gray-400" />
                <div>
                  <div className="text-gray-500 dark:text-gray-400 text-xs">User ID</div>
                  <div className="text-gray-900 dark:text-white font-mono text-xs truncate">
                    {user._id}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-gray-50/50 dark:bg-gray-800/50 rounded-xl">
                <Phone className="w-4 h-4 text-gray-400" />
                <div>
                  <div className="text-gray-500 dark:text-gray-400 text-xs">Phone</div>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Add phone number"
                      className="w-full bg-transparent text-gray-900 dark:text-white focus:outline-none text-sm"
                    />
                  ) : (
                    <div className="text-gray-900 dark:text-white">
                      {user.phone || 'Not provided'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Bio Section */}
          <div className="p-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Bio
            </label>
            {isEditing ? (
              <div className="space-y-2">
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Tell us about yourself..."
                  rows="3"
                  maxLength="500"
                  className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none"
                />
                <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                  <span>Brief description about yourself</span>
                  <span>{formData.bio.length}/500</span>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-xl">
                <p className="text-gray-900 dark:text-white text-sm">
                  {user.bio || 'No bio provided'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200/50 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/50 rounded-b-3xl">
          <div className="flex space-x-2">
            {isEditing && formData.profilePicture && (
              <button
                type="button"
                onClick={() => setFormData({...formData, profilePicture: ''})}
                className="flex items-center space-x-2 px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors duration-200 text-sm"
              >
                <Trash2 className="w-4 h-4" />
                <span>Remove Photo</span>
              </button>
            )}
          </div>
          
          <div className="flex space-x-3">
            {isEditing ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      name: user.name || '',
                      email: user.email || '',
                      bio: user.bio || '',
                      phone: user.phone || '',
                      profilePicture: user.profilePicture || ''
                    });
                  }}
                  className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors duration-200 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-orange-600 to-emerald-600 hover:from-orange-700 hover:to-emerald-700 disabled:opacity-50 text-white rounded-xl transition-all duration-200 font-medium"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors duration-200 font-medium"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-orange-600 to-emerald-600 hover:from-orange-700 hover:to-emerald-700 text-white rounded-xl transition-all duration-200 font-medium"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Edit Profile</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileModal;