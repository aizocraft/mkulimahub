const User = require('../models/User');
const bcrypt = require('bcryptjs');

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

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      users: users.map(user => generateUserResponse(user))
    });
  } catch (error) {
    next(error);
  }
};

// Get single user by ID
exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      user: generateUserResponse(user)
    });
  } catch (error) {
    next(error);
  }
};

// Update user role (Admin only)
exports.updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    
    if (!role || !['admin', 'farmer', 'expert'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Valid role (admin, farmer, expert) is required'
      });
    }

    // Prevent admin from changing their own role
    if (req.params.id === req.user.id) {
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
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User role updated successfully',
      user: generateUserResponse(user)
    });
  } catch (error) {
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
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User profile updated successfully',
      user: generateUserResponse(user)
    });
  } catch (error) {
    next(error);
  }
};

// Delete user (Admin only - hard delete)
exports.deleteUser = async (req, res, next) => {
  try {
    // Prevent admin from deleting themselves
    if (req.params.id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
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

    // Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password'
      });
    }

    // Validate role
    if (role && !['admin', 'farmer', 'expert'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be admin, farmer, or expert'
      });
    }

    // Check for existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
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

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: generateUserResponse(user)
    });
  } catch (error) {
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

    res.status(200).json({
      success: true,
      count: experts.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      experts: experts.map(expert => generateUserResponse(expert))
    });
  } catch (error) {
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

    res.status(200).json({
      success: true,
      count: farmers.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      farmers: farmers.map(farmer => generateUserResponse(farmer))
    });
  } catch (error) {
    next(error);
  }
};

// Toggle user verification (Admin only)
exports.toggleVerification = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.isVerified = !user.isVerified;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${user.isVerified ? 'verified' : 'unverified'} successfully`,
      user: generateUserResponse(user)
    });
  } catch (error) {
    next(error);
  }
};

// Toggle user active status (Admin only)
exports.toggleActiveStatus = async (req, res, next) => {
  try {
    // Prevent admin from deactivating themselves
    if (req.params.id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot deactivate your own account'
      });
    }

    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      user: generateUserResponse(user)
    });
  } catch (error) {
    next(error);
  }
};