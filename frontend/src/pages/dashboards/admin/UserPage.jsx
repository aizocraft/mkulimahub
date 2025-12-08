import { useState, useEffect } from 'react';
import { userAPI, apiUtils } from '../../../api';

const UserPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isBulkActionsOpen, setIsBulkActionsOpen] = useState(false);
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

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);

  // Edit form state
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
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
    experienceLevel: 'beginner'
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
      }
    } catch (err) {
      setError('Action failed');
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
      experienceLevel: user.experienceLevel || 'beginner'
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
      }
    } catch (error) {
      const errorData = apiUtils.handleError(error);
      setError(errorData.message);
    } finally {
      setActionLoading(prev => ({ ...prev, edit: false }));
    }
  };

  const handleViewProfile = (user) => {
    if (!user) return;
    setSelectedUser(user);
    setIsProfileModalOpen(true);
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
      
      switch (bulkAction) {
        case 'activate':
          await Promise.all(
            Array.from(selectedUsers).map(userId => 
              userAPI.toggleActiveStatus(userId)
            )
          );
          showSuccess(`${selectedUsers.size} users activated successfully`);
          break;
        
        case 'deactivate':
          await Promise.all(
            Array.from(selectedUsers).map(userId => 
              userAPI.toggleActiveStatus(userId)
            )
          );
          showSuccess(`${selectedUsers.size} users deactivated successfully`);
          break;
        
        case 'verify':
          await Promise.all(
            Array.from(selectedUsers).map(userId => 
              userAPI.toggleVerification(userId)
            )
          );
          showSuccess(`${selectedUsers.size} users verified successfully`);
          break;
        
        case 'delete':
          await Promise.all(
            Array.from(selectedUsers).map(userId => 
              userAPI.deleteUser(userId)
            )
          );
          showSuccess(`${selectedUsers.size} users deleted successfully`);
          break;
        
        default:
          break;
      }
      
      setSelectedUsers(new Set());
      setBulkAction('');
      setIsBulkActionsOpen(false);
      fetchUsers();
    } catch (error) {
      setError('Bulk action failed');
    } finally {
      setActionLoading(prev => ({ ...prev, bulk: false }));
    }
  };

  // Enhanced export functionality
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
      purple: 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700'
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

  // Enhanced icons
  const Icons = {
    View: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    ),
    Edit: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
    Delete: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
    ),
    Refresh: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
    Export: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    Search: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    )
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-blue-200 rounded-full animate-spin"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-lg font-medium mt-4 animate-pulse">
            Loading users...
          </p>
        </div>
      </div>
    );
  }

  if (error && users.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl max-w-md w-full mx-4 animate-fade-in">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
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
              icon={Icons.Export}
              tooltip="Export Users"
              color="green"
            />
            <ActionButton
              onClick={fetchUsers}
              icon={Icons.Refresh}
              tooltip="Refresh Data"
              color="blue"
            />
          </div>
        </div>

        {/* Messages */}
        {successMessage && (
          <div className={`mb-4 sm:mb-6 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-xl shadow-lg animate-fade-in ${pulseAnimation ? 'animate-pulse' : ''}`}>
            <div className="flex items-center space-x-2 text-sm sm:text-base">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>{successMessage}</span>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-4 sm:mb-6 bg-gradient-to-r from-red-500 to-red-600 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-xl shadow-lg animate-shake">
            <div className="flex items-center space-x-2 text-sm sm:text-base">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          {[
            { label: 'Total Users', value: stats.total, color: 'from-blue-500 to-blue-600' },
            { label: 'Active', value: stats.active, color: 'from-green-500 to-green-600' },
            { label: 'Admins', value: stats.admins, color: 'from-purple-500 to-purple-600'},
            { label: 'Experts', value: stats.experts, color: 'from-blue-500 to-blue-600'},
            { label: 'Farmers', value: stats.farmers, color: 'from-green-500 to-green-600'},
            { label: 'Verified', value: stats.verified, color: 'from-yellow-500 to-yellow-600' },
            { label: 'Online', value: stats.online, color: 'from-green-500 to-emerald-600'}
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
                  <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
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
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 sm:mb-6">Filter Users</h3>
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
                  {Icons.Search}
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
                              icon={Icons.View}
                              tooltip="View Profile"
                              color="blue"
                            />
                            <ActionButton
                              onClick={() => handleEditUser(user)}
                              loading={actionLoading[user?.id || user?._id]}
                              icon={Icons.Edit}
                              tooltip="Edit User"
                              color="green"
                            />
                            <ActionButton
                              onClick={() => {
                                setSelectedUser(user);
                                setIsDeleteModalOpen(true);
                              }}
                              loading={actionLoading[user?.id || user?._id]}
                              icon={Icons.Delete}
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
                <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
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

      {/* Profile Modal */}
      {isProfileModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-2 sm:mx-4 transform animate-scale-in">
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

            <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
              {/* Profile content remains the same as before */}
              {/* ... */}
            </div>

            <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750 rounded-b-xl sm:rounded-b-2xl flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4">
              <button
                onClick={() => handleEditUser(selectedUser)}
                className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg sm:rounded-xl font-medium transition-all transform hover:scale-105 shadow-lg text-sm sm:text-base w-full sm:w-auto"
              >
                Edit User
              </button>
              <button
                onClick={() => setIsProfileModalOpen(false)}
                className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white rounded-lg sm:rounded-xl font-medium transition-all transform hover:scale-105 shadow-lg text-sm sm:text-base w-full sm:w-auto"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-2xl sm:max-w-4xl max-h-[90vh] overflow-y-auto mx-2 sm:mx-4 transform animate-scale-in">
            <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-t-xl sm:rounded-t-2xl">
              <div className="flex justify-between items-center">
                <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Edit User
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
              {/* Edit form content remains the same as before */}
              {/* ... */}
            </form>
          </div>
        </div>
      )}

      {/* Add these styles for animations */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-down {
          from { transform: translateY(-20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes slide-up {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes scale-in {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes rise {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-fade-in { animation: fade-in 0.3s ease-out; }
        .animate-slide-down { animation: slide-down 0.4s ease-out; }
        .animate-slide-up { animation: slide-up 0.4s ease-out; }
        .animate-scale-in { animation: scale-in 0.3s ease-out; }
        .animate-rise { animation: rise 0.5s ease-out; }
        .animate-shake { animation: shake 0.5s ease-in-out; }
      `}</style>
    </div>
  );
};

export default UserPage;