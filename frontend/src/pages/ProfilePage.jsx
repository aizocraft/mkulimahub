import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../api';
import { toast } from 'react-toastify';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Edit3, 
  Save, 
  X,
  Upload,
  Calendar,
  Shield,
  Leaf,
  Target,
  Award,
  Settings,
  Briefcase,
  Globe,
  Clock,
  DollarSign,
  Crop,
  TrendingUp,
  Map
} from 'lucide-react';

const ProfilePage = () => {
  const { user, login } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
    phone: '',
    profilePicture: '',
    address: {
      street: '',
      county: '',
      country: 'Kenya'
    },
    // Expert fields
    expertise: [],
    yearsOfExperience: 0,
    hourlyRate: 0,
    availability: 'available',
    languages: ['English'],
    // Farmer fields
    farmSize: '',
    mainCrops: [],
    experienceLevel: 'beginner'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newExpertise, setNewExpertise] = useState('');
  const [newCrop, setNewCrop] = useState('');
  const [newLanguage, setNewLanguage] = useState('');

  // Helper function to format address safely
  const formatAddress = (address) => {
    if (!address) return 'Not provided';
    if (typeof address === 'string') return address;
    if (typeof address === 'object') {
      const parts = [];
      if (address.street) parts.push(address.street);
      if (address.county) parts.push(address.county);
      if (address.country) parts.push(address.country);
      return parts.length > 0 ? parts.join(', ') : 'Not provided';
    }
    return 'Not provided';
  };

  // Helper function to safely render any value
  const safeRender = (value, fallback = 'Not provided') => {
    if (value === null || value === undefined) return fallback;
    if (typeof value === 'object') {
      try {
        return JSON.stringify(value);
      } catch {
        return fallback;
      }
    }
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (value === '') return fallback;
    return value;
  };

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        bio: user.bio || '',
        phone: user.phone || '',
        profilePicture: user.profilePicture || '',
        // Handle address properly - ensure it's always an object
        address: user.address && typeof user.address === 'object' 
          ? {
              street: user.address.street || '',
              county: user.address.county || '',
              country: user.address.country || 'Kenya'
            }
          : {
              street: '',
              county: '',
              country: 'Kenya'
            },
        // Expert fields
        expertise: user.expertise || [],
        yearsOfExperience: user.yearsOfExperience || 0,
        hourlyRate: user.hourlyRate || 0,
        availability: user.availability || 'available',
        languages: user.languages || ['English'],
        // Farmer fields
        farmSize: user.farmSize || '',
        mainCrops: user.mainCrops || [],
        experienceLevel: user.experienceLevel || 'beginner'
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'number' ? parseFloat(value) || 0 : value
      }));
    }
  };

  const handleArrayField = (field, value, action = 'add') => {
    if (action === 'add' && value.trim()) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], value.trim()]
      }));
    } else if (action === 'remove') {
      setFormData(prev => ({
        ...prev,
        [field]: prev[field].filter(item => item !== value)
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await authAPI.updateProfile(formData);
      if (response.data.success) {
        login(response.data.user, localStorage.getItem('token'));
        toast.success('Profile updated successfully');
        setIsEditing(false);
        // Clear temporary fields
        setNewExpertise('');
        setNewCrop('');
        setNewLanguage('');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
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

  const generateDefaultAvatar = (name) => {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff&size=200`;
  };

  const getRoleColor = (role) => {
    const colors = {
      farmer: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      expert: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800',
      admin: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700';
  };

  const getRoleIcon = (role) => {
    const icons = {
      farmer: <Leaf className="w-4 h-4" />,
      expert: <Target className="w-4 h-4" />,
      admin: <Shield className="w-4 h-4" />
    };
    return icons[role] || <User className="w-4 h-4" />;
  };

  const getAvailabilityColor = (availability) => {
    const colors = {
      available: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400',
      busy: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400',
      away: 'text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-400'
    };
    return colors[availability] || colors.available;
  };

  const getExperienceColor = (level) => {
    const colors = {
      beginner: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400',
      intermediate: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400',
      advanced: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400'
    };
    return colors[level] || colors.beginner;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-emerald-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-orange-900/20 flex items-center justify-center p-4">
        <div className="text-center text-gray-600 dark:text-gray-400">
          Please log in to view your profile
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-emerald-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-orange-900/20 transition-all duration-500">
      {/* Background Animation */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-orange-300 dark:bg-orange-600 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl opacity-20 animate-float"></div>
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-emerald-300 dark:bg-emerald-600 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl opacity-20 animate-float" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="relative max-w-6xl mx-auto p-4 py-8">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-emerald-600 bg-clip-text text-transparent mb-3">
            My Profile
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Manage your account information and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 animate-slide-up">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/20 dark:border-gray-700/20">
              <div className="text-center">
                <div className="relative inline-block mb-4">
                  <img 
                    src={formData.profilePicture || generateDefaultAvatar(user.name)}
                    alt={user.name}
                    className="w-24 h-24 rounded-2xl border-4 border-white dark:border-gray-800 shadow-lg mx-auto"
                  />
                  {isEditing && (
                    <div className="absolute bottom-0 right-0">
                      <input
                        type="file"
                        id="avatar-upload"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                      <label htmlFor="avatar-upload" className="cursor-pointer">
                        <div className="bg-orange-500 text-white p-2 rounded-full shadow-lg hover:bg-orange-600 transition-colors duration-200">
                          <Upload className="w-4 h-4" />
                        </div>
                      </label>
                    </div>
                  )}
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {safeRender(user.name)}
                </h3>
                
                <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full border ${getRoleColor(user.role)} mb-3`}>
                  {getRoleIcon(user.role)}
                  <span className="font-medium capitalize">{safeRender(user.role)}</span>
                </div>
                
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                  {safeRender(user.email)}
                </p>

                {/* Expert/Farmer Specific Badges */}
                {user.role === 'expert' && user.yearsOfExperience > 0 && (
                  <div className="flex items-center justify-center space-x-1 text-sm text-blue-600 dark:text-blue-400 mb-2">
                    <Clock className="w-4 h-4" />
                    <span>{safeRender(user.yearsOfExperience)} years experience</span>
                  </div>
                )}

                {user.role === 'farmer' && user.experienceLevel && (
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getExperienceColor(user.experienceLevel)} mb-3`}>
                    <TrendingUp className="w-3 h-3 mr-1" />
                    <span className="capitalize">{safeRender(user.experienceLevel)} Farmer</span>
                  </div>
                )}
                
                <div className="flex items-center justify-center space-x-1 text-gray-500 dark:text-gray-400 text-sm">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}</span>
                </div>
              </div>
            </div>

            {/* Stats Card */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/20 dark:border-gray-700/20">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                <Award className="w-5 h-5 text-orange-500" />
                <span>Profile Completion</span>
              </h4>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Basic Info</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">100%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-emerald-500 h-2 rounded-full w-full"></div>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Contact Details</span>
                  <span className="text-orange-500 font-medium">
                    {((user.phone ? 1 : 0) + (user.address ? 1 : 0)) * 50}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((user.phone ? 1 : 0) + (user.address ? 1 : 0)) * 50}%` }}
                  ></div>
                </div>

                {/* Role-specific completion */}
                {user.role === 'expert' && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Expert Profile</span>
                      <span className="text-blue-500 font-medium">
                        {((user.expertise?.length > 0 ? 1 : 0) + (user.yearsOfExperience > 0 ? 1 : 0)) * 50}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${((user.expertise?.length > 0 ? 1 : 0) + (user.yearsOfExperience > 0 ? 1 : 0)) * 50}%` }}
                      ></div>
                    </div>
                  </>
                )}

                {user.role === 'farmer' && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Farmer Profile</span>
                      <span className="text-emerald-500 font-medium">
                        {((user.farmSize ? 1 : 0) + (user.mainCrops?.length > 0 ? 1 : 0)) * 50}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${((user.farmSize ? 1 : 0) + (user.mainCrops?.length > 0 ? 1 : 0)) * 50}%` }}
                      ></div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/20 dark:border-gray-700/20">
              {!isEditing ? (
                // View Mode
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Personal Information
                    </h2>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-orange-600 to-emerald-600 hover:from-orange-700 hover:to-emerald-700 text-white rounded-xl transition-all duration-200 font-medium"
                    >
                      <Edit3 className="w-4 h-4" />
                      <span>Edit Profile</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center space-x-2">
                        <User className="w-4 h-4" />
                        <span>Full Name</span>
                      </label>
                      <p className="text-gray-900 dark:text-white text-lg font-medium">
                        {safeRender(user.name)}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center space-x-2">
                        <Mail className="w-4 h-4" />
                        <span>Email Address</span>
                      </label>
                      <p className="text-gray-900 dark:text-white text-lg">
                        {safeRender(user.email)}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center space-x-2">
                        <Phone className="w-4 h-4" />
                        <span>Phone Number</span>
                      </label>
                      <p className="text-gray-900 dark:text-white text-lg">
                        {safeRender(user.phone, 'Not provided')}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center space-x-2">
                        <MapPin className="w-4 h-4" />
                        <span>Address</span>
                      </label>
                      <p className="text-gray-900 dark:text-white text-lg">
                        {formatAddress(user.address)}
                      </p>
                    </div>
                  </div>

                  {/* Expert Specific Fields */}
                  {user.role === 'expert' && (
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                        <Target className="w-5 h-5 text-blue-500" />
                        <span>Expert Information</span>
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center space-x-2">
                            <Briefcase className="w-4 h-4" />
                            <span>Expertise</span>
                          </label>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {user.expertise?.map((skill, index) => (
                              <span key={index} className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm">
                                {safeRender(skill)}
                              </span>
                            ))}
                            {(!user.expertise || user.expertise.length === 0) && (
                              <span className="text-gray-500 dark:text-gray-400">No expertise listed</span>
                            )}
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center space-x-2">
                            <Clock className="w-4 h-4" />
                            <span>Experience</span>
                          </label>
                          <p className="text-gray-900 dark:text-white text-lg">
                            {safeRender(user.yearsOfExperience, 0)} years
                          </p>
                        </div>

                        <div className="space-y-1">
                          <label className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center space-x-2">
                            <DollarSign className="w-4 h-4" />
                            <span>Hourly Rate</span>
                          </label>
                          <p className="text-gray-900 dark:text-white text-lg">
                            KSh {safeRender(user.hourlyRate, 0)}
                          </p>
                        </div>

                        <div className="space-y-1">
                          <label className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center space-x-2">
                            <Globe className="w-4 h-4" />
                            <span>Languages</span>
                          </label>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {user.languages?.map((lang, index) => (
                              <span key={index} className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm">
                                {safeRender(lang)}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center space-x-2">
                            <Settings className="w-4 h-4" />
                            <span>Availability</span>
                          </label>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getAvailabilityColor(user.availability)}`}>
                            {safeRender(user.availability)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Farmer Specific Fields */}
                  {user.role === 'farmer' && (
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                        <Leaf className="w-5 h-5 text-emerald-500" />
                        <span>Farmer Information</span>
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center space-x-2">
                            <Map className="w-4 h-4" />
                            <span>Farm Size</span>
                          </label>
                          <p className="text-gray-900 dark:text-white text-lg">
                            {safeRender(user.farmSize, 'Not specified')}
                          </p>
                        </div>

                        <div className="space-y-1">
                          <label className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center space-x-2">
                            <Crop className="w-4 h-4" />
                            <span>Main Crops</span>
                          </label>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {user.mainCrops?.map((crop, index) => (
                              <span key={index} className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 rounded-full text-sm">
                                {safeRender(crop)}
                              </span>
                            ))}
                            {(!user.mainCrops || user.mainCrops.length === 0) && (
                              <span className="text-gray-500 dark:text-gray-400">No crops listed</span>
                            )}
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center space-x-2">
                            <TrendingUp className="w-4 h-4" />
                            <span>Experience Level</span>
                          </label>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getExperienceColor(user.experienceLevel)}`}>
                            {safeRender(user.experienceLevel)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {user.bio && (
                    <div className="space-y-3">
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Bio
                      </label>
                      <div className="p-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-xl">
                        <p className="text-gray-900 dark:text-white leading-relaxed">
                          {safeRender(user.bio)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                // Edit Mode
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Edit Personal Information
                    </h2>
                    <div className="flex space-x-3">
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditing(false);
                          // Reset form data to original user data
                          if (user) {
                            setFormData({
                              name: user.name || '',
                              email: user.email || '',
                              bio: user.bio || '',
                              phone: user.phone || '',
                              profilePicture: user.profilePicture || '',
                              address: user.address && typeof user.address === 'object' 
                                ? {
                                    street: user.address.street || '',
                                    county: user.address.county || '',
                                    country: user.address.country || 'Kenya'
                                  }
                                : {
                                    street: '',
                                    county: '',
                                    country: 'Kenya'
                                  },
                              expertise: user.expertise || [],
                              yearsOfExperience: user.yearsOfExperience || 0,
                              hourlyRate: user.hourlyRate || 0,
                              availability: user.availability || 'available',
                              languages: user.languages || ['English'],
                              farmSize: user.farmSize || '',
                              mainCrops: user.mainCrops || [],
                              experienceLevel: user.experienceLevel || 'beginner'
                            });
                          }
                        }}
                        className="flex items-center space-x-2 px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors duration-200 font-medium"
                      >
                        <X className="w-4 h-4" />
                        <span>Cancel</span>
                      </button>
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-orange-600 to-emerald-600 hover:from-orange-700 hover:to-emerald-700 disabled:opacity-50 text-white rounded-xl transition-all duration-200 font-medium"
                      >
                        {isLoading ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Save className="w-4 h-4" />
                        )}
                        <span>{isLoading ? 'Saving...' : 'Save Changes'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center space-x-2">
                        <User className="w-4 h-4" />
                        <span>Full Name *</span>
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center space-x-2">
                        <Mail className="w-4 h-4" />
                        <span>Email Address *</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="phone" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center space-x-2">
                        <Phone className="w-4 h-4" />
                        <span>Phone Number</span>
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Optional"
                        className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      />
                    </div>

                    {/* Address Fields */}
                    <div className="space-y-2">
                      <label htmlFor="address.street" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center space-x-2">
                        <MapPin className="w-4 h-4" />
                        <span>Street Address</span>
                      </label>
                      <input
                        type="text"
                        id="address.street"
                        name="address.street"
                        value={formData.address.street}
                        onChange={handleChange}
                        placeholder="Street address"
                        className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="address.county" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        County
                      </label>
                      <input
                        type="text"
                        id="address.county"
                        name="address.county"
                        value={formData.address.county}
                        onChange={handleChange}
                        placeholder="County"
                        className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      />
                    </div>
                  </div>

                  {/* Expert Specific Edit Fields */}
                  {user.role === 'expert' && (
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                        <Target className="w-5 h-5 text-blue-500" />
                        <span>Expert Information</span>
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label htmlFor="yearsOfExperience" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center space-x-2">
                            <Clock className="w-4 h-4" />
                            <span>Years of Experience</span>
                          </label>
                          <input
                            type="number"
                            id="yearsOfExperience"
                            name="yearsOfExperience"
                            value={formData.yearsOfExperience}
                            onChange={handleChange}
                            min="0"
                            max="50"
                            className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 text-gray-900 dark:text-white"
                          />
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="hourlyRate" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center space-x-2">
                            <DollarSign className="w-4 h-4" />
                            <span>Hourly Rate (KSh)</span>
                          </label>
                          <input
                            type="number"
                            id="hourlyRate"
                            name="hourlyRate"
                            value={formData.hourlyRate}
                            onChange={handleChange}
                            min="0"
                            className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 text-gray-900 dark:text-white"
                          />
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="availability" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center space-x-2">
                            <Settings className="w-4 h-4" />
                            <span>Availability</span>
                          </label>
                          <select
                            id="availability"
                            name="availability"
                            value={formData.availability}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 text-gray-900 dark:text-white"
                          >
                            <option value="available">Available</option>
                            <option value="busy">Busy</option>
                            <option value="away">Away</option>
                          </select>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center space-x-2">
                            <Globe className="w-4 h-4" />
                            <span>Languages</span>
                          </label>
                          <div className="space-y-2">
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={newLanguage}
                                onChange={(e) => setNewLanguage(e.target.value)}
                                placeholder="Add language"
                                className="flex-1 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  handleArrayField('languages', newLanguage, 'add');
                                  setNewLanguage('');
                                }}
                                className="px-4 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors duration-200"
                              >
                                Add
                              </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {formData.languages.map((lang, index) => (
                                <span key={index} className="flex items-center space-x-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm">
                                  <span>{lang}</span>
                                  <button
                                    type="button"
                                    onClick={() => handleArrayField('languages', lang, 'remove')}
                                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                                  >
                                    ×
                                  </button>
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="md:col-span-2 space-y-2">
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center space-x-2">
                            <Briefcase className="w-4 h-4" />
                            <span>Areas of Expertise</span>
                          </label>
                          <div className="space-y-2">
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={newExpertise}
                                onChange={(e) => setNewExpertise(e.target.value)}
                                placeholder="Add expertise area"
                                className="flex-1 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  handleArrayField('expertise', newExpertise, 'add');
                                  setNewExpertise('');
                                }}
                                className="px-4 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors duration-200"
                              >
                                Add
                              </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {formData.expertise.map((skill, index) => (
                                <span key={index} className="flex items-center space-x-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm">
                                  <span>{skill}</span>
                                  <button
                                    type="button"
                                    onClick={() => handleArrayField('expertise', skill, 'remove')}
                                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                                  >
                                    ×
                                  </button>
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Farmer Specific Edit Fields */}
                  {user.role === 'farmer' && (
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                        <Leaf className="w-5 h-5 text-emerald-500" />
                        <span>Farmer Information</span>
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label htmlFor="farmSize" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center space-x-2">
                            <Map className="w-4 h-4" />
                            <span>Farm Size</span>
                          </label>
                          <input
                            type="text"
                            id="farmSize"
                            name="farmSize"
                            value={formData.farmSize}
                            onChange={handleChange}
                            placeholder="e.g., 2 acres, 5 hectares"
                            className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                          />
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="experienceLevel" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center space-x-2">
                            <TrendingUp className="w-4 h-4" />
                            <span>Experience Level</span>
                          </label>
                          <select
                            id="experienceLevel"
                            name="experienceLevel"
                            value={formData.experienceLevel}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 text-gray-900 dark:text-white"
                          >
                            <option value="beginner">Beginner</option>
                            <option value="intermediate">Intermediate</option>
                            <option value="advanced">Advanced</option>
                          </select>
                        </div>

                        <div className="md:col-span-2 space-y-2">
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center space-x-2">
                            <Crop className="w-4 h-4" />
                            <span>Main Crops</span>
                          </label>
                          <div className="space-y-2">
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={newCrop}
                                onChange={(e) => setNewCrop(e.target.value)}
                                placeholder="Add main crop"
                                className="flex-1 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  handleArrayField('mainCrops', newCrop, 'add');
                                  setNewCrop('');
                                }}
                                className="px-4 py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors duration-200"
                              >
                                Add
                              </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {formData.mainCrops.map((crop, index) => (
                                <span key={index} className="flex items-center space-x-1 px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 rounded-full text-sm">
                                  <span>{crop}</span>
                                  <button
                                    type="button"
                                    onClick={() => handleArrayField('mainCrops', crop, 'remove')}
                                    className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-200"
                                  >
                                    ×
                                  </button>
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label htmlFor="bio" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Bio
                    </label>
                    <textarea
                      id="bio"
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      placeholder="Tell us about yourself..."
                      rows="4"
                      maxLength="500"
                      className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none"
                    />
                    <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
                      <span>Brief description about yourself</span>
                      <span>{formData.bio.length}/500 characters</span>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;