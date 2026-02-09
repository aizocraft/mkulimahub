import { useState, useEffect } from 'react';
import { userAPI, apiUtils } from '../../../api';
import { toast } from 'react-toastify';

// Icons for better UI
import {
  User, Mail, Phone, MapPin, Edit3, Save, X,
  Upload, Calendar, Shield, Leaf, Target, Award,
  Settings, Briefcase, Globe, Clock, DollarSign,
  Crop, TrendingUp, Map, Eye, Trash2, RefreshCw,
  Download, Search, CheckCircle, XCircle, Users,
  ChevronDown, ChevronUp, Filter, MoreVertical
} from 'lucide-react';

const UserPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [verificationFilter, setVerificationFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectedUsers, setSelectedUsers] = useState(new Set());
  const [bulkAction, setBulkAction] = useState('');
  const [exportFormat, setExportFormat] = useState('csv');
  const [newRole, setNewRole] = useState('farmer');
  const [newExpertise, setNewExpertise] = useState('');
  const [newCrop, setNewCrop] = useState('');
  const [newLanguage, setNewLanguage] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);

  // Edit form state
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
    profilePicture: '',
    address: {
      street: '',
      city: '',
      county: '',
      country: 'Kenya'
    },
    expertise: [],
    yearsOfExperience: 0,
    hourlyRate: 0,
    availability: 'available',
    languages: ['English'],
    farmSize: '',
    mainCrops: [],
    experienceLevel: 'beginner',
    isVerified: false,
    isActive: true
  });

  // Animation states
  const [hoveredUser, setHoveredUser] = useState(null);
  const [pulseAnimation, setPulseAnimation] = useState(false);

  // Fetch all users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await userAPI.getAllUsers({ limit: 1000 });
      
      if (response?.data) {
        if (response.data.success && Array.isArray(response.data.users)) {
          setUsers(response.data.users);
        } else if (Array.isArray(response.data)) {
          setUsers(response.data);
        } else if (response.data.users && Array.isArray(response.data.users)) {
          setUsers(response.data.users);
        } else {
          setError('Unexpected response format');
          setUsers([]);
        }
      } else {
        setError('No data received from server');
        setUsers([]);
      }
    } catch (error) {
      console.error('Fetch users error:', error);
      const errorData = apiUtils.handleError(error);
      setError(errorData.message || 'Failed to load users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Show success message with animation
  const showSuccess = (message) => {
    setSuccessMessage(message);
    setPulseAnimation(true);
    toast.success(message);
    setTimeout(() => setPulseAnimation(false), 500);
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  // Get user avatar URL
  const getUserAvatar = (user) => {
    if (!user?.profilePicture || user.profilePicture === '') {
      const name = user?.name || 'User';
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=128`;
    }
    return user.profilePicture;
  };

  // User actions
  const handleAction = async (action, userId, ...args) => {
    if (!userId) return;
    
    setActionLoading(prev => ({ ...prev, [userId]: true }));
    
    try {
      const result = await action(userId, ...args);
      if (result && !result.success) {
        setError(result.message);
        toast.error(result.message);
      }
    } catch (err) {
      setError('Action failed');
      toast.error('Action failed');
    } finally {
      setActionLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  const handleStatusToggle = async (userId, currentStatus) => {
    try {
      const response = await userAPI.toggleActiveStatus(userId);
      
      if (response?.data?.success) {
        showSuccess(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
        fetchUsers();
        return { success: true };
      } else {
        return { success: false, message: response?.data?.message || 'Action failed' };
      }
    } catch (error) {
      const errorData = apiUtils.handleError(error);
      return { success: false, message: errorData.message };
    }
  };

  const handleVerificationToggle = async (userId, currentVerified) => {
    try {
      const response = await userAPI.toggleVerification(userId);
      
      if (response?.data?.success) {
        showSuccess(`User ${!currentVerified ? 'verified' : 'unverified'} successfully`);
        fetchUsers();
        return { success: true };
      } else {
        return { success: false, message: response?.data?.message || 'Action failed' };
      }
    } catch (error) {
      const errorData = apiUtils.handleError(error);
      return { success: false, message: errorData.message };
    }
  };

  // Change user role
  const handleRoleChange = async (userId) => {
    if (!newRole || !userId) return;

    try {
      setActionLoading(prev => ({ ...prev, role: true }));
      const response = await userAPI.updateUserRole(userId, { role: newRole });
      
      if (response?.data?.success) {
        showSuccess(`User role changed to ${newRole} successfully`);
        setIsRoleModalOpen(false);
        fetchUsers();
        return { success: true };
      } else {
        setError(response?.data?.message || 'Role change failed');
        return { success: false };
      }
    } catch (error) {
      const errorData = apiUtils.handleError(error);
      setError(errorData.message);
      return { success: false };
    } finally {
      setActionLoading(prev => ({ ...prev, role: false }));
    }
  };

  // Delete user functionality
  const handleDeleteUser = async (userId) => {
    try {
      setActionLoading(prev => ({ ...prev, delete: true }));
      const response = await userAPI.deleteUser(userId);
      
      if (response?.data?.success) {
        showSuccess('User deleted successfully');
        setIsDeleteModalOpen(false);
        fetchUsers();
        return { success: true };
      } else {
        setError(response?.data?.message || 'Delete failed');
        return { success: false };
      }
    } catch (error) {
      const errorData = apiUtils.handleError(error);
      setError(errorData.message);
      return { success: false };
    } finally {
      setActionLoading(prev => ({ ...prev, delete: false }));
    }
  };

  // Edit functionality
  const handleEditUser = (user) => {
    if (!user) return;
    setSelectedUser(user);
    setEditForm({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      bio: user.bio || '',
      profilePicture: user.profilePicture || '',
      address: user.address || {
        street: '',
        city: '',
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
      experienceLevel: user.experienceLevel || 'beginner',
      isVerified: user.isVerified || false,
      isActive: user.isActive !== undefined ? user.isActive : true
    });
    setIsEditModalOpen(true);
  };

  const handleEditFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setEditForm(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else if (name === 'expertise' || name === 'mainCrops' || name === 'languages') {
      const arrayValue = value.split(',').map(item => item.trim()).filter(item => item);
      setEditForm(prev => ({
        ...prev,
        [name]: arrayValue
      }));
    } else if (type === 'checkbox') {
      setEditForm(prev => ({
        ...prev,
        [name]: checked
      }));
    } else if (type === 'number') {
      setEditForm(prev => ({
        ...prev,
        [name]: parseFloat(value) || 0
      }));
    } else {
      setEditForm(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Handle array fields in edit form
  const handleArrayField = (field, value, action = 'add') => {
    if (action === 'add' && value.trim()) {
      setEditForm(prev => ({
        ...prev,
        [field]: [...prev[field], value.trim()]
      }));
    } else if (action === 'remove') {
      setEditForm(prev => ({
        ...prev,
        [field]: prev[field].filter(item => item !== value)
      }));
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      setActionLoading(prev => ({ ...prev, edit: true }));
      const response = await userAPI.updateUserProfile(selectedUser.id || selectedUser._id, editForm);
      
      if (response?.data?.success) {
        showSuccess('User updated successfully');
        setIsEditModalOpen(false);
        fetchUsers();
      } else {
        setError(response?.data?.message || 'Update failed');
        toast.error(response?.data?.message || 'Update failed');
      }
    } catch (error) {
      const errorData = apiUtils.handleError(error);
      setError(errorData.message);
      toast.error(errorData.message);
    } finally {
      setActionLoading(prev => ({ ...prev, edit: false }));
    }
  };

  const handleViewProfile = (user) => {
    if (!user) return;
    setSelectedUser(user);
    setIsProfileModalOpen(true);
  };

  const handleRoleModalOpen = (user) => {
    if (!user) return;
    setSelectedUser(user);
    setNewRole(user.role || 'farmer');
    setIsRoleModalOpen(true);
  };

  // Bulk actions
  const handleSelectUser = (userId) => {
    setSelectedUsers(prev => {
      const newSelected = new Set(prev);
      if (newSelected.has(userId)) {
        newSelected.delete(userId);
      } else {
        newSelected.add(userId);
      }
      return newSelected;
    });
  };

  const handleSelectAll = () => {
    if (selectedUsers.size === currentUsers.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(currentUsers.map(user => user?.id || user?._id)));
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedUsers.size === 0) return;

    try {
      setActionLoading(prev => ({ ...prev, bulk: true }));
      
      const actions = Array.from(selectedUsers).map(userId => {
        switch (bulkAction) {
          case 'activate':
            return userAPI.toggleActiveStatus(userId);
          case 'deactivate':
            return userAPI.toggleActiveStatus(userId);
          case 'verify':
            return userAPI.toggleVerification(userId);
          case 'delete':
            return userAPI.deleteUser(userId);
          default:
            return Promise.resolve();
        }
      });

      await Promise.all(actions);
      showSuccess(`${selectedUsers.size} users ${bulkAction}ed successfully`);
      
      setSelectedUsers(new Set());
      setBulkAction('');
      fetchUsers();
    } catch (error) {
      setError('Bulk action failed');
      toast.error('Bulk action failed');
    } finally {
      setActionLoading(prev => ({ ...prev, bulk: false }));
    }
  };

  // Export functionality
  const handleExportUsers = () => {
    try {
      const filteredUsers = getFilteredUsers();
      
      if (exportFormat === 'csv') {
        const csvContent = [
          ['Name', 'Email', 'Role', 'Status', 'Verified', 'Phone', 'Joined Date', 'Last Active'],
          ...filteredUsers.map(user => [
            `"${user?.name || ''}"`,
            `"${user?.email || ''}"`,
            `"${user?.role || ''}"`,
            user?.isActive ? 'Active' : 'Inactive',
            user?.isVerified ? 'Yes' : 'No',
            `"${user?.phone || ''}"`,
            user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A',
            user?.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'
          ])
        ].map(row => row.join(',')).join('\n');

        downloadFile(csvContent, 'text/csv', 'users.csv');
      } else if (exportFormat === 'json') {
        const jsonContent = JSON.stringify(filteredUsers, null, 2);
        downloadFile(jsonContent, 'application/json', 'users.json');
      }
      
      showSuccess(`Users exported as ${exportFormat.toUpperCase()} successfully`);
    } catch (err) {
      setError('Export failed');
      toast.error('Export failed');
    }
  };

  const downloadFile = (content, mimeType, fileName) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName.split('.')[0]}-${new Date().toISOString().split('T')[0]}.${fileName.split('.')[1]}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Helper functions for profile view
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

  const getRoleColor = (role) => {
    const colors = {
      admin: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-800',
      expert: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800',
      farmer: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
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

  // Filter and sort users
  const getFilteredUsers = () => {
    let filtered = users.filter(user => {
      if (!user) return false;
      
      const matchesSearch = !searchTerm || 
        (user.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
         user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         user.phone?.includes(searchTerm));
      
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'active' ? user.isActive : !user.isActive);
      const matchesVerification = verificationFilter === 'all' || 
        (verificationFilter === 'verified' ? user.isVerified : !user.isVerified);
      
      return matchesSearch && matchesRole && matchesStatus && matchesVerification;
    });

    // Sort users
    filtered.sort((a, b) => {
      let aValue = a[sortBy] || '';
      let bValue = b[sortBy] || '';
      
      if (sortBy === 'createdAt' || sortBy === 'lastLogin') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }
      
      if (typeof aValue === 'string') aValue = aValue.toLowerCase();
      if (typeof bValue === 'string') bValue = bValue.toLowerCase();
      
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  };

  const filteredUsers = getFilteredUsers();

  // Pagination logic
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setRoleFilter('all');
    setStatusFilter('all');
    setVerificationFilter('all');
    setSelectedUsers(new Set());
    setCurrentPage(1);
  };

  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Utility functions for styling
  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg';
      case 'expert': return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg';
      case 'farmer': return 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg';
      default: return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-lg';
    }
  };

  const getStatusColor = (isActive) => {
    return isActive 
      ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg' 
      : 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg';
  };

  const getVerificationColor = (isVerified) => {
    return isVerified 
      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg' 
      : 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-lg';
  };

  // Enhanced action buttons with tooltips
  const ActionButton = ({ 
    onClick, 
    loading, 
    icon, 
    tooltip, 
    color = 'blue',
    disabled = false 
  }) => {
    const colorClasses = {
      blue: 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
      green: 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
      red: 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700',
      purple: 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
      orange: 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700'
    };

    return (
      <div className="relative group">
        <button
          onClick={onClick}
          disabled={disabled || loading}
          className={`
            p-2 sm:p-3 rounded-xl font-medium transition-all transform 
            hover:scale-110 shadow-lg flex items-center justify-center
            ${colorClasses[color]}
            ${disabled || loading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-xl'}
            text-white min-w-[40px] min-h-[40px]
          `}
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            icon
          )}
        </button>
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-10">
          {tooltip}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
        </div>
      </div>
    );
  };

  // Statistics
  const stats = {
    total: users.length,
    active: users.filter(user => user?.isActive).length,
    admins: users.filter(user => user?.role === 'admin').length,
    experts: users.filter(user => user?.role === 'expert').length,
    farmers: users.filter(user => user?.role === 'farmer').length,
    verified: users.filter(user => user?.isVerified).length,
    online: users.filter(user => user?.lastLogin && (Date.now() - new Date(user.lastLogin).getTime()) < 15 * 60 * 1000).length,
  };

if (loading) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Animated gradient background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-r from-blue-300 to-purple-300 dark:from-blue-600/20 dark:to-purple-600/20 rounded-full blur-3xl opacity-70 animate-pulse"></div>
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-gradient-to-r from-indigo-300 to-blue-300 dark:from-indigo-600/20 dark:to-blue-600/20 rounded-full blur-3xl opacity-70 animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>
      
      {/* Main loading container */}
      <div className="relative z-10 text-center">
        {/* Dual ring loader */}
        <div className="relative mx-auto mb-8">
          {/* Outer ring - subtle pulse */}
          <div className="w-24 h-24 border-4 border-blue-100 dark:border-gray-700 rounded-full"></div>
          
          {/* Inner ring - spinning gradient */}
          <div className="absolute top-0 left-0 w-24 h-24">
            <div className="w-full h-full rounded-full border-4 border-transparent border-t-blue-500 border-r-purple-500 animate-spin"></div>
          </div>
          
          {/* Center dot with pulse */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-ping"></div>
          </div>
        </div>
        
        {/* Animated text with gradient */}
        <div className="space-y-3">
          <h3 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent animate-pulse">
            Loading Users
          </h3>
          
          {/* Dots animation */}
          <div className="flex justify-center space-x-2">
            <div className="w-2 h-2 bg-blue-400 dark:bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
            <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
            <div className="w-2 h-2 bg-purple-400 dark:bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
          </div>
          
          {/* Stats preview skeleton */}
          <div className="mt-8 opacity-50">
            <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 animate-pulse">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Subtle progress indicator */}
        <div className="mt-8 max-w-md mx-auto">
          <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 rounded-full animate-loading-bar"></div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 font-mono animate-pulse">
            Fetching user data...
          </p>
        </div>
      </div>
      
      {/* Add custom animation styles */}
      <style jsx>{`
        @keyframes loading-bar {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-loading-bar {
          animation: loading-bar 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
  if (error && users.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl max-w-md w-full mx-4 animate-fade-in">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-red-500 dark:text-red-400" />
          </div>
          <div className="text-red-500 dark:text-red-400 text-lg mb-4">Error: {error}</div>
          <button 
            onClick={fetchUsers}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-medium transition-all transform hover:scale-105 shadow-lg w-full"
          >
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 transition-colors p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="text-center lg:text-left">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent animate-slide-down">
              User Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1 sm:mt-2 text-sm sm:text-lg animate-slide-up">
              Managing {stats.total} user{stats.total !== 1 ? 's' : ''} in the system
            </p>
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-3 justify-center lg:justify-end w-full lg:w-auto">
            <div className="flex items-center space-x-2 bg-white dark:bg-gray-700 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 shadow-sm">
              <label className="text-sm text-gray-600 dark:text-gray-300">Format:</label>
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value)}
                className="bg-transparent border-none text-sm focus:ring-0"
              >
                <option value="csv">CSV</option>
                <option value="json">JSON</option>
              </select>
            </div>
            <ActionButton
              onClick={handleExportUsers}
              icon={<Download className="w-5 h-5" />}
              tooltip="Export Users"
              color="green"
            />
            <ActionButton
              onClick={fetchUsers}
              icon={<RefreshCw className="w-5 h-5" />}
              tooltip="Refresh Data"
              color="blue"
            />
          </div>
        </div>

        {/* Messages */}
        {successMessage && (
          <div className={`mb-4 sm:mb-6 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-xl shadow-lg animate-fade-in ${pulseAnimation ? 'animate-pulse' : ''}`}>
            <div className="flex items-center space-x-2 text-sm sm:text-base">
              <CheckCircle className="w-5 h-5" />
              <span>{successMessage}</span>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-4 sm:mb-6 bg-gradient-to-r from-red-500 to-red-600 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-xl shadow-lg animate-shake">
            <div className="flex items-center space-x-2 text-sm sm:text-base">
              <XCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          {[
            { label: 'Total Users', value: stats.total, color: 'from-blue-500 to-blue-600', icon: <Users className="w-5 h-5" /> },
            { label: 'Active', value: stats.active, color: 'from-green-500 to-green-600', icon: <CheckCircle className="w-5 h-5" /> },
            { label: 'Admins', value: stats.admins, color: 'from-purple-500 to-purple-600', icon: <Shield className="w-5 h-5" /> },
            { label: 'Experts', value: stats.experts, color: 'from-blue-500 to-blue-600', icon: <Target className="w-5 h-5" /> },
            { label: 'Farmers', value: stats.farmers, color: 'from-green-500 to-green-600', icon: <Leaf className="w-5 h-5" /> },
            { label: 'Verified', value: stats.verified, color: 'from-yellow-500 to-yellow-600', icon: <Award className="w-5 h-5" /> },
            { label: 'Online', value: stats.online, color: 'from-green-500 to-emerald-600', icon: <Globe className="w-5 h-5" /> }
          ].map((stat, index) => (
            <div 
              key={index} 
              className="bg-white dark:bg-gray-800 p-3 sm:p-4 lg:p-6 rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 animate-rise"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className={`text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                    {stat.value}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">{stat.label}</div>
                </div>
                <div className="text-lg sm:text-xl lg:text-2xl opacity-80">{stat.icon}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Bulk Actions */}
        {selectedUsers.size > 0 && (
          <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-xl p-4 sm:p-6 mb-6 sm:mb-8 animate-fade-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="bg-yellow-100 dark:bg-yellow-800 p-2 rounded-lg">
                  <Settings className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">
                    {selectedUsers.size} user{selectedUsers.size !== 1 ? 's' : ''} selected
                  </h3>
                  <p className="text-yellow-600 dark:text-yellow-400 text-sm">
                    Choose an action to perform on selected users
                  </p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                <select
                  value={bulkAction}
                  onChange={(e) => setBulkAction(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                >
                  <option value="">Choose action...</option>
                  <option value="activate">Activate</option>
                  <option value="deactivate">Deactivate</option>
                  <option value="verify">Verify</option>
                  <option value="delete">Delete</option>
                </select>
                
                <button
                  onClick={handleBulkAction}
                  disabled={!bulkAction || actionLoading.bulk}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 text-white rounded-lg font-medium transition-all text-sm"
                >
                  {actionLoading.bulk ? 'Processing...' : 'Apply'}
                </button>
                
                <button
                  onClick={() => setSelectedUsers(new Set())}
                  className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-all text-sm"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 lg:p-8 rounded-xl sm:rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 mb-6 sm:mb-8 animate-slide-up">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 sm:mb-6 flex items-center space-x-2">
            <Filter className="w-5 h-5 text-blue-500" />
            <span>Filter Users</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Search */}
            <div className="md:col-span-2 lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 sm:mb-3">
                Search Users
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-10 sm:pl-12 pr-4 py-2 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-all duration-200 text-sm sm:text-base"
                />
                <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                  <Search className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Role Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 sm:mb-3">
                Role
              </label>
              <select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-all duration-200 text-sm sm:text-base"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="expert">Expert</option>
                <option value="farmer">Farmer</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 sm:mb-3">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-all duration-200 text-sm sm:text-base"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* Verification Filter */}
            <div className="md:col-span-2 lg:col-span-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 sm:mb-3">
                Verification
              </label>
              <select
                value={verificationFilter}
                onChange={(e) => {
                  setVerificationFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-all duration-200 text-sm sm:text-base"
              >
                <option value="all">All Verification</option>
                <option value="verified">Verified</option>
                <option value="unverified">Unverified</option>
              </select>
            </div>
          </div>

          {/* Active Filters */}
          {(searchTerm || roleFilter !== 'all' || statusFilter !== 'all' || verificationFilter !== 'all') && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-600">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-gray-600 dark:text-gray-400">Active filters:</span>
                {searchTerm && (
                  <span className="bg-blue-500 text-white px-2 sm:px-3 py-1 rounded-full text-xs font-medium shadow-lg animate-fade-in">
                    Search: {searchTerm}
                  </span>
                )}
                {roleFilter !== 'all' && (
                  <span className="bg-purple-500 text-white px-2 sm:px-3 py-1 rounded-full text-xs font-medium shadow-lg animate-fade-in">
                    Role: {roleFilter}
                  </span>
                )}
                {statusFilter !== 'all' && (
                  <span className="bg-green-500 text-white px-2 sm:px-3 py-1 rounded-full text-xs font-medium shadow-lg animate-fade-in">
                    Status: {statusFilter}
                  </span>
                )}
                {verificationFilter !== 'all' && (
                  <span className="bg-yellow-500 text-white px-2 sm:px-3 py-1 rounded-full text-xs font-medium shadow-lg animate-fade-in">
                    Verification: {verificationFilter}
                  </span>
                )}
              </div>
              <button
                onClick={clearFilters}
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium transition-colors whitespace-nowrap hover:scale-105 transform"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>

        {/* Users Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden animate-slide-up">
          <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                Users List
                <span className="ml-2 text-sm text-gray-500 dark:text-gray-400 font-normal">
                  (Showing {currentUsers.length} of {filteredUsers.length} users)
                </span>
              </h2>
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Page {currentPage} of {totalPages}
                </div>
                {filteredUsers.length > 0 && (
                  <button
                    onClick={handleSelectAll}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors hover:scale-105 transform"
                  >
                    {selectedUsers.size === currentUsers.length ? 'Deselect All' : 'Select All'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {currentUsers.length === 0 ? (
            <div className="text-center py-12 sm:py-16 animate-pulse">
              <div className="text-gray-400 dark:text-gray-500 text-4xl sm:text-6xl mb-3 sm:mb-4">👥</div>
              <div className="text-gray-500 dark:text-gray-400 text-lg sm:text-xl mb-2">
                No users found
              </div>
              <p className="text-gray-400 dark:text-gray-500 text-sm sm:text-base max-w-md mx-auto px-4">
                {searchTerm || roleFilter !== 'all' || statusFilter !== 'all' || verificationFilter !== 'all'
                  ? 'Try adjusting your filters to see more results' 
                  : 'No users available in the system'
                }
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                        <input
                          type="checkbox"
                          checked={selectedUsers.size === currentUsers.length && currentUsers.length > 0}
                          onChange={handleSelectAll}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 transform hover:scale-110 transition-transform"
                        />
                      </th>
                      <th 
                        className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                        onClick={() => handleSort('name')}
                      >
                        <div className="flex items-center space-x-1 sm:space-x-2">
                          <span className="text-xs sm:text-sm">User</span>
                          {sortBy === 'name' && (
                            <span className="text-blue-500 text-xs">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                          )}
                        </div>
                      </th>
                      <th className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider text-xs sm:text-sm">
                        Role
                      </th>
                      <th className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider text-xs sm:text-sm">
                        Status
                      </th>
                      <th className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider text-xs sm:text-sm">
                        Verified
                      </th>
                      <th 
                        className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-xs sm:text-sm"
                        onClick={() => handleSort('createdAt')}
                      >
                        <div className="flex items-center space-x-1 sm:space-x-2">
                          <span>Joined</span>
                          {sortBy === 'createdAt' && (
                            <span className="text-blue-500 text-xs">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                          )}
                        </div>
                      </th>
                      <th className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider text-xs sm:text-sm">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {currentUsers.map((user, index) => (
                      <tr 
                        key={user?.id || user?._id || index} 
                        className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 transform hover:scale-[1.01] ${
                          selectedUsers.has(user?.id || user?._id) ? 'bg-blue-50 dark:bg-blue-900 scale-[1.02]' : ''
                        } ${
                          hoveredUser === user?.id || user?._id ? 'ring-2 ring-blue-500' : ''
                        }`}
                        onMouseEnter={() => setHoveredUser(user?.id || user?._id)}
                        onMouseLeave={() => setHoveredUser(null)}
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <td className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedUsers.has(user?.id || user?._id)}
                            onChange={() => handleSelectUser(user?.id || user?._id)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 transform hover:scale-110 transition-transform"
                          />
                        </td>
                        <td className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="relative">
                              <img
                                className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 rounded-full object-cover shadow-lg border-2 border-white dark:border-gray-600 transition-transform duration-200 hover:scale-110"
                                src={getUserAvatar(user)}
                                alt={user?.name || 'User'}
                              />
                              {user?.lastLogin && (Date.now() - new Date(user.lastLogin).getTime()) < 15 * 60 * 1000 && (
                                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-600 animate-pulse"></div>
                              )}
                            </div>
                            <div className="ml-2 sm:ml-3 lg:ml-4">
                              <div className="text-sm font-semibold text-gray-900 dark:text-white truncate max-w-[120px] sm:max-w-[150px] lg:max-w-none">
                                {user?.name || 'Unknown'}
                              </div>
                              <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate max-w-[120px] sm:max-w-[150px] lg:max-w-none">
                                {user?.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs font-semibold shadow-lg transition-transform hover:scale-105 ${getRoleBadgeColor(user?.role)}`}>
                            {user?.role}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleAction(handleStatusToggle, user?.id || user?._id, user?.isActive)}
                            disabled={actionLoading[user?.id || user?._id]}
                            className={`text-xs font-semibold px-2 sm:px-3 lg:px-4 py-1 sm:py-2 rounded-full transition-all shadow-lg ${getStatusColor(user?.isActive)} ${
                              actionLoading[user?.id || user?._id] 
                                ? 'opacity-50 cursor-not-allowed' 
                                : 'cursor-pointer hover:shadow-xl transform hover:scale-105'
                            }`}
                          >
                            {user?.isActive ? 'Active' : 'Inactive'}
                          </button>
                        </td>
                        <td className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleAction(handleVerificationToggle, user?.id || user?._id, user?.isVerified)}
                            disabled={actionLoading[user?.id || user?._id]}
                            className={`text-xs font-semibold px-2 sm:px-3 lg:px-4 py-1 sm:py-2 rounded-full transition-all shadow-lg ${getVerificationColor(user?.isVerified)} ${
                              actionLoading[user?.id || user?._id] 
                                ? 'opacity-50 cursor-not-allowed' 
                                : 'cursor-pointer hover:shadow-xl transform hover:scale-105'
                            }`}
                          >
                            {user?.isVerified ? 'Verified' : 'Unverified'}
                          </button>
                        </td>
                        <td className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                          {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-1 sm:space-x-2 lg:space-x-3">
                            <ActionButton
                              onClick={() => handleViewProfile(user)}
                              loading={actionLoading[user?.id || user?._id]}
                              icon={<Eye className="w-5 h-5" />}
                              tooltip="View Profile"
                              color="blue"
                            />
                            <ActionButton
                              onClick={() => handleEditUser(user)}
                              loading={actionLoading[user?.id || user?._id]}
                              icon={<Edit3 className="w-5 h-5" />}
                              tooltip="Edit User"
                              color="green"
                            />
                            <ActionButton
                              onClick={() => handleRoleModalOpen(user)}
                              loading={actionLoading[user?.id || user?._id]}
                              icon={<Shield className="w-5 h-5" />}
                              tooltip="Change Role"
                              color="purple"
                            />
                            <ActionButton
                              onClick={() => {
                                setSelectedUser(user);
                                setIsDeleteModalOpen(true);
                              }}
                              loading={actionLoading[user?.id || user?._id]}
                              icon={<Trash2 className="w-5 h-5" />}
                              tooltip="Delete User"
                              color="red"
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="bg-white dark:bg-gray-800 px-4 sm:px-6 lg:px-8 py-3 sm:py-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                      Showing {indexOfFirstUser + 1} to {Math.min(indexOfLastUser, filteredUsers.length)} of {filteredUsers.length} results
                    </div>
                    <div className="flex items-center space-x-1 sm:space-x-2">
                      <button
                        onClick={prevPage}
                        disabled={currentPage === 1}
                        className="px-3 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
                      >
                        Previous
                      </button>
                      
                      <div className="flex items-center space-x-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }

                          return (
                            <button
                              key={pageNum}
                              onClick={() => goToPage(pageNum)}
                              className={`px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm font-medium rounded-lg transition-all transform hover:scale-110 min-w-[2rem] ${
                                currentPage === pageNum
                                  ? 'bg-blue-600 text-white shadow-lg'
                                  : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                      </div>

                      <button
                        onClick={nextPage}
                        disabled={currentPage === totalPages}
                        className="px-3 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md mx-2 transform animate-scale-in">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <Trash2 className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Delete User
              </h3>
              
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to delete <span className="font-semibold">{selectedUser.name}</span>? This action cannot be undone.
              </p>

              <div className="flex space-x-3">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-all transform hover:scale-105"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    await handleDeleteUser(selectedUser.id || selectedUser._id);
                  }}
                  disabled={actionLoading.delete}
                  className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white rounded-lg font-medium transition-all transform hover:scale-105"
                >
                  {actionLoading.delete ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Role Change Modal */}
      {isRoleModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md mx-2 transform animate-scale-in">
            <div className="p-6">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 text-center">
                Change User Role
              </h3>
              
              <p className="text-gray-600 dark:text-gray-400 mb-4 text-center">
                Change role for <span className="font-semibold">{selectedUser.name}</span>
              </p>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select New Role
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="farmer">Farmer</option>
                  <option value="expert">Expert</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setIsRoleModalOpen(false)}
                  className="flex-1 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-all transform hover:scale-105"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    await handleRoleChange(selectedUser.id || selectedUser._id);
                  }}
                  disabled={actionLoading.role}
                  className="flex-1 px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:opacity-50 text-white rounded-lg font-medium transition-all transform hover:scale-105"
                >
                  {actionLoading.role ? 'Changing...' : 'Change Role'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Profile View Modal */}
      {isProfileModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto mx-2 sm:mx-4 transform animate-scale-in">
            <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-t-xl sm:rounded-t-2xl">
              <div className="flex justify-between items-center">
                <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  User Profile
                </h2>
                <button
                  onClick={() => setIsProfileModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl transition-colors transform hover:scale-110"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-6 lg:p-8">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sidebar */}
                <div className="lg:col-span-1 space-y-6">
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-6">
                    <div className="text-center">
                      <div className="relative inline-block mb-4">
                        <img 
                          src={getUserAvatar(selectedUser)}
                          alt={selectedUser.name}
                          className="w-32 h-32 rounded-2xl border-4 border-white dark:border-gray-800 shadow-lg mx-auto"
                        />
                      </div>
                      
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        {safeRender(selectedUser.name)}
                      </h3>
                      
                      <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full border ${getRoleColor(selectedUser.role)} mb-3`}>
                        {getRoleIcon(selectedUser.role)}
                        <span className="font-medium capitalize">{safeRender(selectedUser.role)}</span>
                      </div>
                      
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                        {safeRender(selectedUser.email)}
                      </p>

                      {selectedUser.role === 'expert' && selectedUser.yearsOfExperience > 0 && (
                        <div className="flex items-center justify-center space-x-1 text-sm text-blue-600 dark:text-blue-400 mb-2">
                          <Clock className="w-4 h-4" />
                          <span>{safeRender(selectedUser.yearsOfExperience)} years experience</span>
                        </div>
                      )}

                      <div className="flex items-center justify-center space-x-1 text-gray-500 dark:text-gray-400 text-sm">
                        <Calendar className="w-4 h-4" />
                        <span>Joined {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : 'Unknown'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-6">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Account Status</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Active</span>
                        <span className={`font-medium ${selectedUser.isActive ? 'text-green-600' : 'text-red-600'}`}>
                          {selectedUser.isActive ? 'Yes' : 'No'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Verified</span>
                        <span className={`font-medium ${selectedUser.isVerified ? 'text-blue-600' : 'text-yellow-600'}`}>
                          {selectedUser.isVerified ? 'Yes' : 'No'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Google Auth</span>
                        <span className="font-medium">
                          {selectedUser.googleId ? 'Yes' : 'No'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-3">
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-6">
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center space-x-2">
                            <User className="w-4 h-4" />
                            <span>Full Name</span>
                          </label>
                          <p className="text-gray-900 dark:text-white text-lg font-medium">
                            {safeRender(selectedUser.name)}
                          </p>
                        </div>

                        <div className="space-y-1">
                          <label className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center space-x-2">
                            <Mail className="w-4 h-4" />
                            <span>Email Address</span>
                          </label>
                          <p className="text-gray-900 dark:text-white text-lg">
                            {safeRender(selectedUser.email)}
                          </p>
                        </div>

                        <div className="space-y-1">
                          <label className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center space-x-2">
                            <Phone className="w-4 h-4" />
                            <span>Phone Number</span>
                          </label>
                          <p className="text-gray-900 dark:text-white text-lg">
                            {safeRender(selectedUser.phone, 'Not provided')}
                          </p>
                        </div>

                        <div className="space-y-1">
                          <label className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center space-x-2">
                            <MapPin className="w-4 h-4" />
                            <span>Address</span>
                          </label>
                          <p className="text-gray-900 dark:text-white text-lg">
                            {formatAddress(selectedUser.address)}
                          </p>
                        </div>
                      </div>

                      {/* Bio */}
                      {selectedUser.bio && (
                        <div className="space-y-3">
                          <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Bio
                          </label>
                          <div className="p-4 bg-white dark:bg-gray-800 rounded-xl">
                            <p className="text-gray-900 dark:text-white leading-relaxed">
                              {safeRender(selectedUser.bio)}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Expert Specific Fields */}
                      {selectedUser.role === 'expert' && (
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
                                {selectedUser.expertise?.map((skill, index) => (
                                  <span key={index} className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm">
                                    {safeRender(skill)}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <div className="space-y-1">
                              <label className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center space-x-2">
                                <Clock className="w-4 h-4" />
                                <span>Experience</span>
                              </label>
                              <p className="text-gray-900 dark:text-white text-lg">
                                {safeRender(selectedUser.yearsOfExperience, 0)} years
                              </p>
                            </div>

                            <div className="space-y-1">
                              <label className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center space-x-2">
                                <DollarSign className="w-4 h-4" />
                                <span>Hourly Rate</span>
                              </label>
                              <p className="text-gray-900 dark:text-white text-lg">
                                KSh {safeRender(selectedUser.hourlyRate, 0)}
                              </p>
                            </div>

                            <div className="space-y-1">
                              <label className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center space-x-2">
                                <Globe className="w-4 h-4" />
                                <span>Languages</span>
                              </label>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {selectedUser.languages?.map((lang, index) => (
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
                              <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${
                                selectedUser.availability === 'available' ? 'bg-green-100 text-green-800' :
                                selectedUser.availability === 'busy' ? 'bg-orange-100 text-orange-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {safeRender(selectedUser.availability)}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Farmer Specific Fields */}
                      {selectedUser.role === 'farmer' && (
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
                                {safeRender(selectedUser.farmSize, 'Not specified')}
                              </p>
                            </div>

                            <div className="space-y-1">
                              <label className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center space-x-2">
                                <Crop className="w-4 h-4" />
                                <span>Main Crops</span>
                              </label>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {selectedUser.mainCrops?.map((crop, index) => (
                                  <span key={index} className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 rounded-full text-sm">
                                    {safeRender(crop)}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <div className="space-y-1">
                              <label className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center space-x-2">
                                <TrendingUp className="w-4 h-4" />
                                <span>Experience Level</span>
                              </label>
                              <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${
                                selectedUser.experienceLevel === 'beginner' ? 'bg-blue-100 text-blue-800' :
                                selectedUser.experienceLevel === 'intermediate' ? 'bg-purple-100 text-purple-800' :
                                'bg-orange-100 text-orange-800'
                              }`}>
                                {safeRender(selectedUser.experienceLevel)}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750 rounded-b-xl sm:rounded-b-2xl flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4">
              <button
                onClick={() => handleEditUser(selectedUser)}
                className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg sm:rounded-xl font-medium transition-all transform hover:scale-105 shadow-lg text-sm sm:text-base w-full sm:w-auto"
              >
                <Edit3 className="w-4 h-4 inline mr-2" />
                Edit User
              </button>
              <button
                onClick={() => handleRoleModalOpen(selectedUser)}
                className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-lg sm:rounded-xl font-medium transition-all transform hover:scale-105 shadow-lg text-sm sm:text-base w-full sm:w-auto"
              >
                <Shield className="w-4 h-4 inline mr-2" />
                Change Role
              </button>
              <button
                onClick={() => setIsProfileModalOpen(false)}
                className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white rounded-lg sm:rounded-xl font-medium transition-all transform hover:scale-105 shadow-lg text-sm sm:text-base w-full sm:w-auto"
              >
                <X className="w-4 h-4 inline mr-2" />
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto mx-2 sm:mx-4 transform animate-scale-in">
            <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-t-xl sm:rounded-t-2xl">
              <div className="flex justify-between items-center">
                <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Edit User: {selectedUser.name}
                </h2>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl transition-colors transform hover:scale-110"
                >
                  ×
                </button>
              </div>
            </div>

            <form onSubmit={handleSaveEdit} className="p-4 sm:p-6 lg:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={editForm.name}
                    onChange={handleEditFormChange}
                    required
                    className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 dark:text-white"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={editForm.email}
                    onChange={handleEditFormChange}
                    required
                    className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 dark:text-white"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={editForm.phone}
                    onChange={handleEditFormChange}
                    className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 dark:text-white"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="address.street" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Street Address
                  </label>
                  <input
                    type="text"
                    id="address.street"
                    name="address.street"
                    value={editForm.address.street}
                    onChange={handleEditFormChange}
                    className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 dark:text-white"
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
                    value={editForm.address.county}
                    onChange={handleEditFormChange}
                    className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 dark:text-white"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="address.country" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Country
                  </label>
                  <input
                    type="text"
                    id="address.country"
                    name="address.country"
                    value={editForm.address.country}
                    onChange={handleEditFormChange}
                    className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Role-specific fields */}
              {selectedUser.role === 'expert' && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mb-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Expert Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Expertise
                      </label>
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newExpertise}
                            onChange={(e) => setNewExpertise(e.target.value)}
                            placeholder="Add expertise"
                            className="flex-1 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 dark:text-white"
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
                          {editForm.expertise.map((skill, index) => (
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

                    <div className="space-y-2">
                      <label htmlFor="yearsOfExperience" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Years of Experience
                      </label>
                      <input
                        type="number"
                        id="yearsOfExperience"
                        name="yearsOfExperience"
                        value={editForm.yearsOfExperience}
                        onChange={handleEditFormChange}
                        className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="hourlyRate" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Hourly Rate (KSh)
                      </label>
                      <input
                        type="number"
                        id="hourlyRate"
                        name="hourlyRate"
                        value={editForm.hourlyRate}
                        onChange={handleEditFormChange}
                        className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="availability" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Availability
                      </label>
                      <select
                        id="availability"
                        name="availability"
                        value={editForm.availability}
                        onChange={handleEditFormChange}
                        className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 dark:text-white"
                      >
                        <option value="available">Available</option>
                        <option value="busy">Busy</option>
                        <option value="away">Away</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {selectedUser.role === 'farmer' && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mb-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Farmer Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="farmSize" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Farm Size
                      </label>
                      <input
                        type="text"
                        id="farmSize"
                        name="farmSize"
                        value={editForm.farmSize}
                        onChange={handleEditFormChange}
                        className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Main Crops
                      </label>
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newCrop}
                            onChange={(e) => setNewCrop(e.target.value)}
                            placeholder="Add crop"
                            className="flex-1 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 dark:text-white"
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
                          {editForm.mainCrops.map((crop, index) => (
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

                    <div className="space-y-2">
                      <label htmlFor="experienceLevel" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Experience Level
                      </label>
                      <select
                        id="experienceLevel"
                        name="experienceLevel"
                        value={editForm.experienceLevel}
                        onChange={handleEditFormChange}
                        className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 dark:text-white"
                      >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Account Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="isVerified"
                      name="isVerified"
                      checked={editForm.isVerified}
                      onChange={handleEditFormChange}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="isVerified" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Verified Account
                    </label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="isActive"
                      name="isActive"
                      checked={editForm.isActive}
                      onChange={handleEditFormChange}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="isActive" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Active Account
                    </label>
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-6">
                <label htmlFor="bio" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Bio
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  value={editForm.bio}
                  onChange={handleEditFormChange}
                  rows="4"
                  className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 dark:text-white resize-none"
                />
              </div>

              <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl font-medium transition-colors duration-200 w-full sm:w-auto"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading.edit}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 text-white rounded-xl font-medium transition-all duration-200 w-full sm:w-auto"
                >
                  {actionLoading.edit ? (
                    <div className="flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Saving...
                    </div>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserPage;