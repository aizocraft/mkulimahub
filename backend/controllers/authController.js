const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
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

exports.registerUser = async (req, res, next) => {
  try {
    const { 
      name, 
      email, 
      password, 
      role, 
      profilePicture, 
      bio, 
      phone,
      // Expert fields
      expertise,
      yearsOfExperience,
      hourlyRate,
      languages,
      // Farmer fields
      farmSize,
      mainCrops,
      experienceLevel,
      address
    } = req.body;

    // Log registration attempt
    logger.info('User registration attempt', {
      email: email,
      role: role || 'farmer',
      ip: req.ip
    });

    // Basic required field checks
    if (!name || !email || !password) {
      logger.warn('Registration failed - missing required fields', {
        email: email,
        missingFields: [!name && 'name', !email && 'email', !password && 'password'].filter(Boolean)
      });
      return res.status(400).json({ 
        success: false,
        message: 'Please provide name, email, and password' 
      });
    }

    // Validate role
    if (role && !['admin', 'farmer', 'expert'].includes(role)) {
      logger.warn('Registration failed - invalid role', {
        email: email,
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
      logger.warn('Registration failed - email already exists', {
        email: email,
        existingUserId: existingUser._id
      });
      return res.status(409).json({ 
        success: false,
        message: 'User with this email already exists' 
      });
    }

    // Hash password with 10 salt rounds
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user data object
    const userData = {
      name,
      email,
      password: hashedPassword,
      role: role || 'farmer',
      profilePicture,
      bio,
      phone,
      address
    };

    // Add expert-specific fields if role is expert
    if (role === 'expert') {
      userData.expertise = expertise || [];
      userData.yearsOfExperience = yearsOfExperience || 0;
      userData.hourlyRate = hourlyRate || 0;
      userData.languages = languages || ['English'];
    }

    // Add farmer-specific fields if role is farmer
    if (role === 'farmer' || !role) {
      userData.farmSize = farmSize || '';
      userData.mainCrops = mainCrops || [];
      userData.experienceLevel = experienceLevel || 'beginner';
    }

    // Create and save user
    const user = new User(userData);
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user._id, 
        role: user.role,
        email: user.email
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Log successful registration
    logger.info('User registered successfully', {
      userId: user._id,
      email: user.email,
      role: user.role,
      ip: req.ip
    });

    // Return response without password
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: generateUserResponse(user),
      token
    });

  } catch (error) {
    logger.error('Registration error', {
      error: error.message,
      email: req.body.email,
      stack: error.stack
    });
    next(error);
  }
};

exports.loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Log login attempt
    logger.info('User login attempt', {
      email: email,
      ip: req.ip
    });

    // Basic required field checks
    if (!email || !password) {
      logger.warn('Login failed - missing credentials', {
        email: email,
        ip: req.ip
      });
      return res.status(400).json({ 
        success: false,
        message: 'Please provide email and password' 
      });
    }

    // Find user including password field
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      logger.warn('Login failed - user not found', {
        email: email,
        ip: req.ip
      });
      return res.status(401).json({ 
        success: false,
        message: 'Invalid email or password' 
      });
    }

    // Check if user is active
    if (user.isActive === false) {
      logger.warn('Login failed - account deactivated', {
        userId: user._id,
        email: user.email,
        ip: req.ip
      });
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated. Please contact support.'
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      logger.warn('Login failed - invalid password', {
        userId: user._id,
        email: user.email,
        ip: req.ip
      });
      return res.status(401).json({ 
        success: false,
        message: 'Invalid email or password' 
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user._id, 
        role: user.role,
        email: user.email
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Log successful login
    logger.info('User logged in successfully', {
      userId: user._id,
      email: user.email,
      role: user.role,
      ip: req.ip
    });

    // Return response without password
    res.status(200).json({
      success: true,
      message: 'Login successful',
      user: generateUserResponse(user),
      token
    });

  } catch (error) {
    logger.error('Login error', {
      error: error.message,
      email: req.body.email,
      ip: req.ip,
      stack: error.stack
    });
    next(error);
  }
};

// Get current user profile
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      logger.warn('Profile fetch failed - user not found', {
        userId: req.user.id
      });
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    logger.info('Profile fetched successfully', {
      userId: user._id,
      email: user.email
    });

    res.status(200).json({ 
      success: true,
      user: generateUserResponse(user)
    });
  } catch (error) {
    logger.error('Profile fetch error', {
      error: error.message,
      userId: req.user.id,
      stack: error.stack
    });
    next(error);
  }
};

// Update current user profile
exports.updateProfile = async (req, res, next) => {
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
      experienceLevel
    } = req.body;
    
    // Log profile update attempt
    logger.info('Profile update attempt', {
      userId: req.user.id,
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

    // Role-specific fields (only update if user has that role)
    if (req.user.role === 'expert') {
      if (expertise !== undefined) updateData.expertise = expertise;
      if (yearsOfExperience !== undefined) updateData.yearsOfExperience = yearsOfExperience;
      if (hourlyRate !== undefined) updateData.hourlyRate = hourlyRate;
      if (availability !== undefined) updateData.availability = availability;
      if (languages !== undefined) updateData.languages = languages;
    }

    if (req.user.role === 'farmer') {
      if (farmSize !== undefined) updateData.farmSize = farmSize;
      if (mainCrops !== undefined) updateData.mainCrops = mainCrops;
      if (experienceLevel !== undefined) updateData.experienceLevel = experienceLevel;
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!user) {
      logger.warn('Profile update failed - user not found', {
        userId: req.user.id
      });
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    logger.info('Profile updated successfully', {
      userId: user._id,
      email: user.email,
      updatedFields: Object.keys(updateData)
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: generateUserResponse(user)
    });
  } catch (error) {
    logger.error('Profile update error', {
      error: error.message,
      userId: req.user.id,
      stack: error.stack
    });
    next(error);
  }
};

// Change password
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Log password change attempt
    logger.info('Password change attempt', {
      userId: req.user.id
    });

    if (!currentPassword || !newPassword) {
      logger.warn('Password change failed - missing required fields', {
        userId: req.user.id
      });
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    if (newPassword.length < 6) {
      logger.warn('Password change failed - password too short', {
        userId: req.user.id
      });
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }

    // Get user with password
    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      logger.warn('Password change failed - user not found', {
        userId: req.user.id
      });
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      logger.warn('Password change failed - current password incorrect', {
        userId: user._id,
        email: user.email
      });
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    user.password = hashedPassword;
    await user.save();

    logger.info('Password changed successfully', {
      userId: user._id,
      email: user.email
    });

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    logger.error('Password change error', {
      error: error.message,
      userId: req.user.id,
      stack: error.stack
    });
    next(error);
  }
};

// Deactivate account (soft delete)
exports.deactivateAccount = async (req, res, next) => {
  try {
    // Log account deactivation attempt
    logger.info('Account deactivation attempt', {
      userId: req.user.id
    });

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { isActive: false },
      { new: true }
    );

    if (!user) {
      logger.warn('Account deactivation failed - user not found', {
        userId: req.user.id
      });
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    logger.info('Account deactivated successfully', {
      userId: user._id,
      email: user.email
    });

    res.status(200).json({
      success: true,
      message: 'Account deactivated successfully'
    });
  } catch (error) {
    logger.error('Account deactivation error', {
      error: error.message,
      userId: req.user.id,
      stack: error.stack
    });
    next(error);
  }
};

// Google OAuth routes
exports.googleAuth = passport.authenticate('google', {
  scope: ['profile', 'email']
});

exports.googleCallback = (req, res, next) => {
  passport.authenticate('google', { session: false }, async (err, user, info) => {
    try {
      if (err) {
        logger.error('Google OAuth error', {
          error: err.message,
          stack: err.stack,
          ip: req.ip
        });
        return res.redirect(`${process.env.CLIENT_URL}/login?error=auth_failed`);
      }
      
      if (!user) {
        logger.warn('Google OAuth failed - no user returned', {
          ip: req.ip
        });
        return res.redirect(`${process.env.CLIENT_URL}/login?error=auth_failed`);
      }

      // Check if this is a new user
      const isNewUser = user.isNewUser === true;

      // Generate JWT token
      const token = jwt.sign(
        { 
          id: user._id, 
          role: user.role,
          email: user.email
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Log successful Google OAuth
      logger.info('Google OAuth successful', {
        userId: user._id,
        email: user.email,
        isNewUser: isNewUser,
        ip: req.ip
      });

      // Clear the new user flag after first login
      if (isNewUser) {
        user.isNewUser = false;
        await user.save();
      }

      // Redirect to frontend with token and user info
      const userResponse = generateUserResponse(user);
      const redirectUrl = `${process.env.CLIENT_URL}/auth/success?token=${token}&user=${encodeURIComponent(JSON.stringify(userResponse))}&isNewUser=${isNewUser}`;
      
      res.redirect(redirectUrl);
    } catch (error) {
      logger.error('Error in Google callback', {
        error: error.message,
        stack: error.stack,
        ip: req.ip
      });
      res.redirect(`${process.env.CLIENT_URL}/login?error=auth_failed`);
    }
  })(req, res, next);
};

// Check if email exists for Google Auth
exports.checkEmail = async (req, res, next) => {
  try {
    const { email } = req.body;
    
    logger.info('Email check request', {
      email: email,
      ip: req.ip
    });
    
    const user = await User.findOne({ email });
    
    res.status(200).json({
      success: true,
      exists: !!user,
      isGoogleAuth: user?.googleId ? true : false
    });
  } catch (error) {
    logger.error('Email check error', {
      error: error.message,
      email: req.body.email,
      stack: error.stack
    });
    next(error);
  }
};

// Update current user's role (allow farmer/expert switching)
exports.updateMyRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    
    // Log role update attempt
    logger.info('Role update attempt', {
      userId: req.user.id,
      requestedRole: role,
      currentRole: req.user.role
    });
    
    // Validate role
    if (!role || !['farmer', 'expert'].includes(role)) {
      logger.warn('Role update failed - invalid role', {
        userId: req.user.id,
        invalidRole: role
      });
      return res.status(400).json({
        success: false,
        message: 'Valid role (farmer, expert) is required. Admin role can only be assigned by administrators.'
      });
    }

    // Get current user
    const currentUser = await User.findById(req.user.id);
    if (!currentUser) {
      logger.warn('Role update failed - user not found', {
        userId: req.user.id
      });
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user is trying to switch to their current role
    if (currentUser.role === role) {
      logger.warn('Role update failed - same role', {
        userId: req.user.id,
        role: role
      });
      return res.status(400).json({
        success: false,
        message: `You are already a ${role}`
      });
    }

    // Update user role
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { role },
      { new: true, runValidators: true }
    );

    logger.info('Role updated successfully', {
      userId: user._id,
      email: user.email,
      oldRole: currentUser.role,
      newRole: role
    });

    res.status(200).json({
      success: true,
      message: `Role updated to ${role} successfully`,
      user: generateUserResponse(user)
    });
  } catch (error) {
    logger.error('Role update error', {
      error: error.message,
      userId: req.user.id,
      stack: error.stack
    });
    next(error);
  }
};