const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { logger } = require('../middleware/logger');

// Helper function to generate user response without password
const generateUserResponse = (user) => {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    profilePicture: user.profilePicture,
    bio: user.bio,
    phone: user.phone,
    address: user.address,
    // Role-specific fields
    expertise: user.expertise || [],
    yearsOfExperience: user.yearsOfExperience || 0,
    hourlyRate: user.hourlyRate || 0,
    availability: user.availability || 'available',
    languages: user.languages || ['English'],
    farmSize: user.farmSize || '',
    mainCrops: user.mainCrops || [],
    experienceLevel: user.experienceLevel || 'beginner',
    rating: user.rating || { average: 0, count: 0 },
    isVerified: user.isVerified || false,
    isActive: user.isActive !== undefined ? user.isActive : true,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
};

// Get all users (Admin only) with filtering
exports.getAllUsers = async (req, res, next) => {
  try {
    const { 
      role, 
      county, 
      expertise, 
      isActive, 
      page = 1, 
      limit = 10,
      search 
    } = req.query;
    
    // Log user list request
    logger.info('Admin fetching user list', {
      adminId: req.user.id,
      filters: { role, county, expertise, isActive, search, page, limit }
    });
    
    const filter = {};
    
    // Apply filters
    if (role) filter.role = role;
    if (county) filter['address.county'] = new RegExp(county, 'i');
    if (expertise) filter.expertise = new RegExp(expertise, 'i');
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    
    // Search across multiple fields
    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
        { bio: new RegExp(search, 'i') }
      ];
    }

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(filter);

    logger.info('User list fetched successfully', {
      adminId: req.user.id,
      count: users.length,
      total: total
    });

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      users: users.map(user => generateUserResponse(user))
    });
  } catch (error) {
    logger.error('Error fetching user list', {
      error: error.message,
      adminId: req.user.id,
      stack: error.stack
    });
    next(error);
  }
};

// Get single user by ID
exports.getUserById = async (req, res, next) => {
  try {
    logger.info('Fetching user by ID', {
      requestedById: req.user.id,
      targetUserId: req.params.id
    });
    
    const user = await User.findById(req.params.id);
    
    if (!user) {
      logger.warn('User not found', {
        requestedById: req.user.id,
        targetUserId: req.params.id
      });
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    logger.info('User fetched successfully', {
      requestedById: req.user.id,
      targetUserId: user._id,
      targetUserRole: user.role
    });

    res.status(200).json({
      success: true,
      user: generateUserResponse(user)
    });
  } catch (error) {
    logger.error('Error fetching user by ID', {
      error: error.message,
      requestedById: req.user.id,
      targetUserId: req.params.id,
      stack: error.stack
    });
    next(error);
  }
};

// Update user role (Admin only)
exports.updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    
    // Log role update attempt
    logger.info('Admin updating user role', {
      adminId: req.user.id,
      targetUserId: req.params.id,
      newRole: role
    });
    
    if (!role || !['admin', 'farmer', 'expert'].includes(role)) {
      logger.warn('Role update failed - invalid role', {
        adminId: req.user.id,
        targetUserId: req.params.id,
        invalidRole: role
      });
      return res.status(400).json({
        success: false,
        message: 'Valid role (admin, farmer, expert) is required'
      });
    }

    // Prevent admin from changing their own role
    if (req.params.id === req.user.id) {
      logger.warn('Role update failed - admin trying to change own role', {
        adminId: req.user.id
      });
      return res.status(400).json({
        success: false,
        message: 'Cannot change your own role'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    );

    if (!user) {
      logger.warn('Role update failed - user not found', {
        adminId: req.user.id,
        targetUserId: req.params.id
      });
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    logger.info('User role updated successfully', {
      adminId: req.user.id,
      targetUserId: user._id,
      oldRole: user.role, // Note: This shows the new role due to {new: true}
      newRole: role
    });

    res.status(200).json({
      success: true,
      message: 'User role updated successfully',
      user: generateUserResponse(user)
    });
  } catch (error) {
    logger.error('Error updating user role', {
      error: error.message,
      adminId: req.user.id,
      targetUserId: req.params.id,
      stack: error.stack
    });
    next(error);
  }
};

// Update user profile (Admin can update any user)
exports.updateUserProfile = async (req, res, next) => {
  try {
    const { 
      name, 
      email, 
      bio, 
      phone, 
      profilePicture, 
      address,
      // Expert fields
      expertise,
      yearsOfExperience,
      hourlyRate,
      availability,
      languages,
      // Farmer fields
      farmSize,
      mainCrops,
      experienceLevel,
      isVerified,
      isActive
    } = req.body;
    
    // Log profile update attempt
    logger.info('Admin updating user profile', {
      adminId: req.user.id,
      targetUserId: req.params.id,
      updatedFields: Object.keys(req.body).filter(key => req.body[key] !== undefined)
    });
    
    const updateData = {};
    
    // Basic profile fields
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (bio !== undefined) updateData.bio = bio;
    if (phone !== undefined) updateData.phone = phone;
    if (profilePicture) updateData.profilePicture = profilePicture;
    if (address) updateData.address = address;

    // Expert fields
    if (expertise !== undefined) updateData.expertise = expertise;
    if (yearsOfExperience !== undefined) updateData.yearsOfExperience = yearsOfExperience;
    if (hourlyRate !== undefined) updateData.hourlyRate = hourlyRate;
    if (availability !== undefined) updateData.availability = availability;
    if (languages !== undefined) updateData.languages = languages;

    // Farmer fields
    if (farmSize !== undefined) updateData.farmSize = farmSize;
    if (mainCrops !== undefined) updateData.mainCrops = mainCrops;
    if (experienceLevel !== undefined) updateData.experienceLevel = experienceLevel;

    // Admin-only fields
    if (isVerified !== undefined) updateData.isVerified = isVerified;
    if (isActive !== undefined) updateData.isActive = isActive;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!user) {
      logger.warn('Profile update failed - user not found', {
        adminId: req.user.id,
        targetUserId: req.params.id
      });
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    logger.info('User profile updated successfully by admin', {
      adminId: req.user.id,
      targetUserId: user._id,
      updatedFields: Object.keys(updateData)
    });

    res.status(200).json({
      success: true,
      message: 'User profile updated successfully',
      user: generateUserResponse(user)
    });
  } catch (error) {
    logger.error('Error updating user profile', {
      error: error.message,
      adminId: req.user.id,
      targetUserId: req.params.id,
      stack: error.stack
    });
    next(error);
  }
};

// Delete user (Admin only - hard delete)
exports.deleteUser = async (req, res, next) => {
  try {
    // Log delete attempt
    logger.info('Admin attempting to delete user', {
      adminId: req.user.id,
      targetUserId: req.params.id
    });

    // Prevent admin from deleting themselves
    if (req.params.id === req.user.id) {
      logger.warn('User deletion failed - admin trying to delete own account', {
        adminId: req.user.id
      });
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      logger.warn('User deletion failed - user not found', {
        adminId: req.user.id,
        targetUserId: req.params.id
      });
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    logger.info('User deleted successfully by admin', {
      adminId: req.user.id,
      deletedUserId: user._id,
      deletedUserEmail: user.email
    });

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting user', {
      error: error.message,
      adminId: req.user.id,
      targetUserId: req.params.id,
      stack: error.stack
    });
    next(error);
  }
};

// Create new user (Admin only)
exports.createUser = async (req, res, next) => {
  try {
    const { 
      name, 
      email, 
      password, 
      role, 
      profilePicture, 
      bio, 
      phone,
      address,
      // Expert fields
      expertise,
      yearsOfExperience,
      hourlyRate,
      languages,
      // Farmer fields
      farmSize,
      mainCrops,
      experienceLevel,
      isVerified
    } = req.body;

    // Log user creation attempt
    logger.info('Admin creating new user', {
      adminId: req.user.id,
      userEmail: email,
      userRole: role
    });

    // Basic validation
    if (!name || !email || !password) {
      logger.warn('User creation failed - missing required fields', {
        adminId: req.user.id,
        missingFields: [!name && 'name', !email && 'email', !password && 'password'].filter(Boolean)
      });
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password'
      });
    }

    // Validate role
    if (role && !['admin', 'farmer', 'expert'].includes(role)) {
      logger.warn('User creation failed - invalid role', {
        adminId: req.user.id,
        invalidRole: role
      });
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be admin, farmer, or expert'
      });
    }

    // Check for existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      logger.warn('User creation failed - email already exists', {
        adminId: req.user.id,
        email: email,
        existingUserId: existingUser._id
      });
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user data
    const userData = {
      name,
      email,
      password: hashedPassword,
      role: role || 'farmer',
      profilePicture,
      bio,
      phone,
      address,
      isVerified: isVerified || false
    };

    // Add role-specific fields
    if (role === 'expert') {
      userData.expertise = expertise || [];
      userData.yearsOfExperience = yearsOfExperience || 0;
      userData.hourlyRate = hourlyRate || 0;
      userData.languages = languages || ['English'];
    }

    if (role === 'farmer' || !role) {
      userData.farmSize = farmSize || '';
      userData.mainCrops = mainCrops || [];
      userData.experienceLevel = experienceLevel || 'beginner';
    }

    // Create user
    const user = new User(userData);
    await user.save();

    logger.info('User created successfully by admin', {
      adminId: req.user.id,
      newUserId: user._id,
      newUserEmail: user.email,
      newUserRole: user.role
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: generateUserResponse(user)
    });
  } catch (error) {
    logger.error('Error creating user', {
      error: error.message,
      adminId: req.user.id,
      userEmail: req.body.email,
      stack: error.stack
    });
    next(error);
  }
};

// Get experts with filtering
exports.getExperts = async (req, res, next) => {
  try {
    const { 
      expertise, 
      county, 
      minRating, 
      maxHourlyRate,
      page = 1, 
      limit = 10 
    } = req.query;
    
    // Log experts fetch request
    logger.info('Fetching experts list', {
      requestedById: req.user?.id || 'anonymous',
      filters: { expertise, county, minRating, maxHourlyRate, page, limit }
    });
    
    const filter = { 
      role: 'expert', 
      isActive: true 
    };
    
    if (expertise) filter.expertise = new RegExp(expertise, 'i');
    if (county) filter['address.county'] = new RegExp(county, 'i');
    if (minRating) filter['rating.average'] = { $gte: parseFloat(minRating) };
    if (maxHourlyRate) filter.hourlyRate = { $lte: parseFloat(maxHourlyRate) };

    const experts = await User.find(filter)
      .select('-password')
      .sort({ 'rating.average': -1, 'rating.count': -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(filter);

    logger.info('Experts list fetched successfully', {
      requestedById: req.user?.id || 'anonymous',
      count: experts.length,
      total: total
    });

    res.status(200).json({
      success: true,
      count: experts.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      experts: experts.map(expert => generateUserResponse(expert))
    });
  } catch (error) {
    logger.error('Error fetching experts list', {
      error: error.message,
      requestedById: req.user?.id || 'anonymous',
      stack: error.stack
    });
    next(error);
  }
};

// Get farmers with filtering
exports.getFarmers = async (req, res, next) => {
  try {
    const { 
      county, 
      mainCrops, 
      experienceLevel,
      page = 1, 
      limit = 10 
    } = req.query;
    
    // Log farmers fetch request
    logger.info('Fetching farmers list', {
      requestedById: req.user?.id || 'anonymous',
      filters: { county, mainCrops, experienceLevel, page, limit }
    });
    
    const filter = { 
      role: 'farmer', 
      isActive: true 
    };
    
    if (county) filter['address.county'] = new RegExp(county, 'i');
    if (mainCrops) filter.mainCrops = new RegExp(mainCrops, 'i');
    if (experienceLevel) filter.experienceLevel = experienceLevel;

    const farmers = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(filter);

    logger.info('Farmers list fetched successfully', {
      requestedById: req.user?.id || 'anonymous',
      count: farmers.length,
      total: total
    });

    res.status(200).json({
      success: true,
      count: farmers.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      farmers: farmers.map(farmer => generateUserResponse(farmer))
    });
  } catch (error) {
    logger.error('Error fetching farmers list', {
      error: error.message,
      requestedById: req.user?.id || 'anonymous',
      stack: error.stack
    });
    next(error);
  }
};

// Toggle user verification (Admin only)
exports.toggleVerification = async (req, res, next) => {
  try {
    // Log verification toggle attempt
    logger.info('Admin toggling user verification', {
      adminId: req.user.id,
      targetUserId: req.params.id
    });

    const user = await User.findById(req.params.id);
    
    if (!user) {
      logger.warn('Verification toggle failed - user not found', {
        adminId: req.user.id,
        targetUserId: req.params.id
      });
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const oldStatus = user.isVerified;
    user.isVerified = !user.isVerified;
    await user.save();

    logger.info('User verification status updated', {
      adminId: req.user.id,
      targetUserId: user._id,
      oldStatus: oldStatus,
      newStatus: user.isVerified
    });

    res.status(200).json({
      success: true,
      message: `User ${user.isVerified ? 'verified' : 'unverified'} successfully`,
      user: generateUserResponse(user)
    });
  } catch (error) {
    logger.error('Error toggling user verification', {
      error: error.message,
      adminId: req.user.id,
      targetUserId: req.params.id,
      stack: error.stack
    });
    next(error);
  }
};

// Toggle user active status (Admin only)
exports.toggleActiveStatus = async (req, res, next) => {
  try {
    // Log active status toggle attempt
    logger.info('Admin toggling user active status', {
      adminId: req.user.id,
      targetUserId: req.params.id
    });

    // Prevent admin from deactivating themselves
    if (req.params.id === req.user.id) {
      logger.warn('Active status toggle failed - admin trying to deactivate own account', {
        adminId: req.user.id
      });
      return res.status(400).json({
        success: false,
        message: 'Cannot deactivate your own account'
      });
    }

    const user = await User.findById(req.params.id);
    
    if (!user) {
      logger.warn('Active status toggle failed - user not found', {
        adminId: req.user.id,
        targetUserId: req.params.id
      });
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const oldStatus = user.isActive;
    user.isActive = !user.isActive;
    await user.save();

    logger.info('User active status updated', {
      adminId: req.user.id,
      targetUserId: user._id,
      oldStatus: oldStatus,
      newStatus: user.isActive
    });

    res.status(200).json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      user: generateUserResponse(user)
    });
  } catch (error) {
    logger.error('Error toggling user active status', {
      error: error.message,
      adminId: req.user.id,
      targetUserId: req.params.id,
      stack: error.stack
    });
    next(error);
  }
};

// Reactivate account (user can reactivate their own deactivated account)
exports.reactivateAccount = async (req, res, next) => {
  try {
    const userId = req.user.id;

    logger.info('User attempting to reactivate account', {
      userId: userId
    });

    const user = await User.findById(userId);

    if (!user) {
      logger.warn('Reactivation failed - user not found', {
        userId: userId
      });
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.isActive) {
      logger.info('Reactivation attempt failed - account already active', {
        userId: userId
      });
      return res.status(400).json({
        success: false,
        message: 'Your account is already active'
      });
    }

    user.isActive = true;
    await user.save();

    logger.info('User account reactivated successfully', {
      userId: userId,
      userEmail: user.email
    });

    res.status(200).json({
      success: true,
      message: 'Your account has been reactivated successfully',
      user: generateUserResponse(user)
    });
  } catch (error) {
    logger.error('Error reactivating account', {
      error: error.message,
      userId: req.user.id,
      stack: error.stack
    });
    next(error);
  }
};

// Delete account permanently (user can delete their own account)
exports.deleteAccountPermanently = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { password } = req.body;

    logger.info('User attempting to delete account permanently', {
      userId: userId
    });

    if (!password) {
      logger.warn('Permanent account deletion failed - password not provided', {
        userId: userId
      });
      return res.status(400).json({
        success: false,
        message: 'Password is required to delete your account'
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      logger.warn('Permanent deletion failed - user not found', {
        userId: userId
      });
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify password for security
    if (!user.password) {
      logger.warn('Permanent deletion failed - user uses Google OAuth', {
        userId: userId
      });
      return res.status(400).json({
        success: false,
        message: 'Cannot verify password for Google-authenticated accounts. Please contact support.'
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      logger.warn('Permanent deletion failed - incorrect password', {
        userId: userId
      });
      return res.status(401).json({
        success: false,
        message: 'Incorrect password. Account deletion failed.'
      });
    }

    const userEmail = user.email;
    const userName = user.name;

    // Delete the user account permanently
    await User.findByIdAndDelete(userId);

    logger.info('User account deleted permanently', {
      userId: userId,
      userEmail: userEmail,
      userName: userName
    });

    res.status(200).json({
      success: true,
      message: 'Your account has been permanently deleted'
    });
  } catch (error) {
    logger.error('Error deleting account permanently', {
      error: error.message,
      userId: req.user.id,
      stack: error.stack
    });
    next(error);
  }
};