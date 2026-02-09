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
    // Google Auth field
    googleId: user.googleId || null,
    isGoogleAuth: !!user.googleId,
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

    // Log registration attempt with comprehensive details
    logger.info('USER_REGISTRATION_ATTEMPT', {
      userEmail: email,
      requestedRole: role || 'farmer',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString(),
      hasProfilePicture: !!profilePicture,
      hasBio: !!bio,
      hasPhone: !!phone,
      hasAddress: !!address,
      expertFieldsProvided: role === 'expert' ? {
        expertiseCount: expertise?.length || 0,
        yearsOfExperience: yearsOfExperience || 0,
        hourlyRate: hourlyRate || 0,
        languagesCount: languages?.length || 0
      } : null,
      farmerFieldsProvided: (role === 'farmer' || !role) ? {
        farmSize: !!farmSize,
        mainCropsCount: mainCrops?.length || 0,
        experienceLevel: experienceLevel || 'beginner'
      } : null
    });

    // Basic required field checks
    if (!name || !email || !password) {
      logger.warn('REGISTRATION_VALIDATION_FAILED', {
        userEmail: email,
        missingFields: {
          name: !name,
          email: !email,
          password: !password
        },
        ipAddress: req.ip,
        validationType: 'missing_required_fields'
      });
      return res.status(400).json({ 
        success: false,
        message: 'Please provide name, email, and password' 
      });
    }

    // Validate role
    if (role && !['admin', 'farmer', 'expert'].includes(role)) {
      logger.warn('REGISTRATION_VALIDATION_FAILED', {
        userEmail: email,
        invalidRole: role,
        ipAddress: req.ip,
        validationType: 'invalid_role',
        allowedRoles: ['admin', 'farmer', 'expert']
      });
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be admin, farmer, or expert'
      });
    }

    // Check for existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      logger.warn('REGISTRATION_CONFLICT', {
        userEmail: email,
        existingUserId: existingUser._id,
        existingUserRole: existingUser.role,
        existingUserStatus: existingUser.isActive ? 'active' : 'inactive',
        ipAddress: req.ip,
        conflictType: 'email_already_exists'
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

    // Log successful registration with comprehensive details
    logger.info('USER_REGISTRATION_SUCCESS', {
      userId: user._id,
      userEmail: user.email,
      userRole: user.role,
      ipAddress: req.ip,
      registrationTimestamp: user.createdAt,
      userStatus: 'active',
      verificationStatus: user.isVerified ? 'verified' : 'unverified',
      profileCompletion: {
        hasProfilePicture: !!user.profilePicture,
        hasBio: !!user.bio,
        hasPhone: !!user.phone,
        hasAddress: !!user.address
      },
      roleSpecificData: user.role === 'expert' ? {
        expertiseCount: user.expertise.length,
        yearsOfExperience: user.yearsOfExperience,
        hourlyRate: user.hourlyRate,
        languagesCount: user.languages.length
      } : {
        farmSize: user.farmSize,
        mainCropsCount: user.mainCrops.length,
        experienceLevel: user.experienceLevel
      }
    });

    // Return response without password
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: generateUserResponse(user),
      token
    });

  } catch (error) {
    logger.error('REGISTRATION_SYSTEM_ERROR', {
      errorMessage: error.message,
      errorType: error.name,
      userEmail: req.body.email,
      ipAddress: req.ip,
      stackTrace: error.stack,
      operation: 'user_registration',
      timestamp: new Date().toISOString()
    });
    next(error);
  }
};

exports.loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Log login attempt with comprehensive details
    logger.info('USER_LOGIN_ATTEMPT', {
      userEmail: email,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString(),
      loginMethod: 'email_password'
    });

    // Basic required field checks
    if (!email || !password) {
      logger.warn('LOGIN_VALIDATION_FAILED', {
        userEmail: email,
        missingFields: {
          email: !email,
          password: !password
        },
        ipAddress: req.ip,
        validationType: 'missing_credentials'
      });
      return res.status(400).json({ 
        success: false,
        message: 'Please provide email and password' 
      });
    }

    // Find user including password field
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      logger.warn('LOGIN_FAILED', {
        userEmail: email,
        ipAddress: req.ip,
        failureReason: 'user_not_found',
        accountStatus: 'non_existent'
      });
      return res.status(401).json({ 
        success: false,
        message: 'Invalid email or password' 
      });
    }

    // Check if user is active
    if (user.isActive === false) {
      logger.warn('LOGIN_FAILED', {
        userId: user._id,
        userEmail: user.email,
        userRole: user.role,
        ipAddress: req.ip,
        failureReason: 'account_deactivated',
        accountStatus: 'inactive',
        lastActive: user.updatedAt
      });
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated. Please contact support.'
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      logger.warn('LOGIN_FAILED', {
        userId: user._id,
        userEmail: user.email,
        userRole: user.role,
        ipAddress: req.ip,
        failureReason: 'invalid_password',
        accountStatus: 'active',
        verificationStatus: user.isVerified ? 'verified' : 'unverified'
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

    // Log successful login with comprehensive details
    logger.info('USER_LOGIN_SUCCESS', {
      userId: user._id,
      userEmail: user.email,
      userRole: user.role,
      ipAddress: req.ip,
      loginTimestamp: new Date().toISOString(),
      accountStatus: 'active',
      verificationStatus: user.isVerified ? 'verified' : 'unverified',
      lastLogin: user.lastLogin,
      sessionDuration: '7d',
      profileData: {
        hasProfilePicture: !!user.profilePicture,
        hasBio: !!user.bio,
        expertiseCount: user.expertise?.length || 0,
        mainCropsCount: user.mainCrops?.length || 0
      }
    });

    // Update last login timestamp
    user.lastLogin = new Date();
    await user.save();

    // Return response without password
    res.status(200).json({
      success: true,
      message: 'Login successful',
      user: generateUserResponse(user),
      token
    });

  } catch (error) {
    logger.error('LOGIN_SYSTEM_ERROR', {
      errorMessage: error.message,
      errorType: error.name,
      userEmail: req.body.email,
      ipAddress: req.ip,
      stackTrace: error.stack,
      operation: 'user_login',
      timestamp: new Date().toISOString()
    });
    next(error);
  }
};

// Get current user profile
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      logger.warn('PROFILE_FETCH_FAILED', {
        userId: req.user.id,
        ipAddress: req.ip,
        failureReason: 'user_not_found',
        operation: 'get_profile'
      });
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    logger.info('PROFILE_FETCH_SUCCESS', {
      userId: user._id,
      userEmail: user.email,
      userRole: user.role,
      ipAddress: req.ip,
      profileData: {
        hasProfilePicture: !!user.profilePicture,
        hasBio: !!user.bio,
        hasPhone: !!user.phone,
        hasAddress: !!user.address,
        verificationStatus: user.isVerified ? 'verified' : 'unverified',
        accountStatus: user.isActive ? 'active' : 'inactive'
      },
      roleSpecificData: user.role === 'expert' ? {
        expertiseCount: user.expertise.length,
        yearsOfExperience: user.yearsOfExperience,
        hourlyRate: user.hourlyRate,
        availability: user.availability
      } : {
        farmSize: user.farmSize,
        mainCropsCount: user.mainCrops.length,
        experienceLevel: user.experienceLevel
      }
    });

    res.status(200).json({ 
      success: true,
      user: generateUserResponse(user)
    });
  } catch (error) {
    logger.error('PROFILE_FETCH_ERROR', {
      errorMessage: error.message,
      errorType: error.name,
      userId: req.user.id,
      ipAddress: req.ip,
      stackTrace: error.stack,
      operation: 'get_profile',
      timestamp: new Date().toISOString()
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
    
    // Log profile update attempt with comprehensive details
    logger.info('PROFILE_UPDATE_ATTEMPT', {
      userId: req.user.id,
      userRole: req.user.role,
      ipAddress: req.ip,
      updateFields: Object.keys(req.body).filter(key => req.body[key] !== undefined),
      fieldDetails: {
        personalInfo: {
          name: !!name,
          email: !!email,
          bio: bio !== undefined,
          phone: phone !== undefined,
          profilePicture: !!profilePicture,
          address: !!address
        },
        expertFields: req.user.role === 'expert' ? {
          expertise: expertise !== undefined,
          yearsOfExperience: yearsOfExperience !== undefined,
          hourlyRate: hourlyRate !== undefined,
          availability: availability !== undefined,
          languages: languages !== undefined
        } : null,
        farmerFields: req.user.role === 'farmer' ? {
          farmSize: farmSize !== undefined,
          mainCrops: mainCrops !== undefined,
          experienceLevel: experienceLevel !== undefined
        } : null
      }
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
      logger.warn('PROFILE_UPDATE_FAILED', {
        userId: req.user.id,
        ipAddress: req.ip,
        failureReason: 'user_not_found',
        operation: 'update_profile'
      });
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    logger.info('PROFILE_UPDATE_SUCCESS', {
      userId: user._id,
      userEmail: user.email,
      userRole: user.role,
      ipAddress: req.ip,
      updatedFields: Object.keys(updateData),
      updateSummary: {
        personalInfoUpdated: !!updateData.name || !!updateData.email || updateData.bio !== undefined || updateData.phone !== undefined || !!updateData.profilePicture || !!updateData.address,
        expertFieldsUpdated: req.user.role === 'expert' ? {
          expertise: updateData.expertise !== undefined,
          yearsOfExperience: updateData.yearsOfExperience !== undefined,
          hourlyRate: updateData.hourlyRate !== undefined,
          availability: updateData.availability !== undefined,
          languages: updateData.languages !== undefined
        } : null,
        farmerFieldsUpdated: req.user.role === 'farmer' ? {
          farmSize: updateData.farmSize !== undefined,
          mainCrops: updateData.mainCrops !== undefined,
          experienceLevel: updateData.experienceLevel !== undefined
        } : null
      }
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: generateUserResponse(user)
    });
  } catch (error) {
    logger.error('PROFILE_UPDATE_ERROR', {
      errorMessage: error.message,
      errorType: error.name,
      userId: req.user.id,
      ipAddress: req.ip,
      stackTrace: error.stack,
      operation: 'update_profile',
      timestamp: new Date().toISOString()
    });
    next(error);
  }
};

// Change password
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Log password change attempt
    logger.info('PASSWORD_CHANGE_ATTEMPT', {
      userId: req.user.id,
      ipAddress: req.ip,
      hasCurrentPassword: !!currentPassword,
      hasNewPassword: !!newPassword,
      newPasswordLength: newPassword?.length || 0
    });

    if (!currentPassword || !newPassword) {
      logger.warn('PASSWORD_CHANGE_VALIDATION_FAILED', {
        userId: req.user.id,
        missingFields: {
          currentPassword: !currentPassword,
          newPassword: !newPassword
        },
        ipAddress: req.ip,
        validationType: 'missing_passwords'
      });
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    if (newPassword.length < 6) {
      logger.warn('PASSWORD_CHANGE_VALIDATION_FAILED', {
        userId: req.user.id,
        newPasswordLength: newPassword.length,
        minimumRequired: 6,
        ipAddress: req.ip,
        validationType: 'password_too_short'
      });
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }

    // Get user with password
    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      logger.warn('PASSWORD_CHANGE_FAILED', {
        userId: req.user.id,
        ipAddress: req.ip,
        failureReason: 'user_not_found',
        operation: 'change_password'
      });
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      logger.warn('PASSWORD_CHANGE_FAILED', {
        userId: user._id,
        userEmail: user.email,
        userRole: user.role,
        ipAddress: req.ip,
        failureReason: 'incorrect_current_password',
        operation: 'change_password'
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

    logger.info('PASSWORD_CHANGE_SUCCESS', {
      userId: user._id,
      userEmail: user.email,
      userRole: user.role,
      ipAddress: req.ip,
      passwordChangedAt: new Date().toISOString(),
      operation: 'change_password'
    });

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    logger.error('PASSWORD_CHANGE_ERROR', {
      errorMessage: error.message,
      errorType: error.name,
      userId: req.user.id,
      ipAddress: req.ip,
      stackTrace: error.stack,
      operation: 'change_password',
      timestamp: new Date().toISOString()
    });
    next(error);
  }
};

// Deactivate account (soft delete)
exports.deactivateAccount = async (req, res, next) => {
  try {
    // Log account deactivation attempt
    logger.info('ACCOUNT_DEACTIVATION_ATTEMPT', {
      userId: req.user.id,
      ipAddress: req.ip,
      timestamp: new Date().toISOString(),
      operation: 'deactivate_account'
    });

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { isActive: false },
      { new: true }
    );

    if (!user) {
      logger.warn('ACCOUNT_DEACTIVATION_FAILED', {
        userId: req.user.id,
        ipAddress: req.ip,
        failureReason: 'user_not_found',
        operation: 'deactivate_account'
      });
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    logger.info('ACCOUNT_DEACTIVATION_SUCCESS', {
      userId: user._id,
      userEmail: user.email,
      userRole: user.role,
      ipAddress: req.ip,
      deactivationTimestamp: new Date().toISOString(),
      accountStatus: 'inactive',
      lastActive: user.updatedAt,
      operation: 'deactivate_account'
    });

    res.status(200).json({
      success: true,
      message: 'Account deactivated successfully'
    });
  } catch (error) {
    logger.error('ACCOUNT_DEACTIVATION_ERROR', {
      errorMessage: error.message,
      errorType: error.name,
      userId: req.user.id,
      ipAddress: req.ip,
      stackTrace: error.stack,
      operation: 'deactivate_account',
      timestamp: new Date().toISOString()
    });
    next(error);
  }
};

// Google OAuth routes
exports.googleAuth = passport.authenticate('google', {
  scope: ['profile', 'email']
});

// Google OAuth callback - ULTRA MINIMAL
exports.googleCallback = (req, res, next) => {
  passport.authenticate('google', { session: false }, async (err, user) => {
    try {
      if (err || !user) {
        console.error('Google OAuth error:', err);
        return res.redirect(`${process.env.CLIENT_URL}/login?error=auth_failed`);
      }

      // Generate SHORT token (use user ID only)
      const shortToken = jwt.sign(
        { id: user._id }, // Only ID, nothing else
        process.env.JWT_SECRET,
        { expiresIn: '1h' } // Short expiration
      );

      console.log('Token length:', shortToken.length);
      
      // Redirect with ONLY the short token
      res.redirect(`${process.env.CLIENT_URL}/auth/success?t=${shortToken}`);
      
    } catch (error) {
      console.error('Google callback error:', error);
      res.redirect(`${process.env.CLIENT_URL}/login?error=auth_failed`);
    }
  })(req, res, next);
};

// Exchange short token for full token and user data
exports.exchangeToken = async (req, res, next) => {
  try {
    const { token: shortToken } = req.body;

    if (!shortToken) {
      return res.status(400).json({
        success: false,
        message: 'Token is required'
      });
    }

    // Verify short token
    const decoded = jwt.verify(shortToken, process.env.JWT_SECRET);
    
    // Get user
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Generate full token
    const fullToken = jwt.sign(
      { 
        id: user._id, 
        role: user.role,
        email: user.email
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      success: true,
      token: fullToken,
      user: generateUserResponse(user)
    });
  } catch (error) {
    console.error('Token exchange error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

// Check if email exists for Google Auth
exports.checkEmail = async (req, res, next) => {
  try {
    const { email } = req.body;
    
    logger.info('EMAIL_CHECK_REQUEST', {
      email: email,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString(),
      operation: 'check_email'
    });
    
    const user = await User.findOne({ email });
    
    logger.info('EMAIL_CHECK_RESULT', {
      email: email,
      exists: !!user,
      isGoogleAuth: user?.googleId ? true : false,
      userStatus: user ? {
        userId: user._id,
        role: user.role,
        isActive: user.isActive,
        isVerified: user.isVerified
      } : null,
      operation: 'check_email'
    });
    
    res.status(200).json({
      success: true,
      exists: !!user,
      isGoogleAuth: user?.googleId ? true : false
    });
  } catch (error) {
    logger.error('EMAIL_CHECK_ERROR', {
      errorMessage: error.message,
      errorType: error.name,
      email: req.body.email,
      ipAddress: req.ip,
      stackTrace: error.stack,
      operation: 'check_email',
      timestamp: new Date().toISOString()
    });
    next(error);
  }
};

// Update current user's role (allow farmer/expert switching)
exports.updateMyRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    
    // Log role update attempt with comprehensive details
    logger.info('ROLE_UPDATE_ATTEMPT', {
      userId: req.user.id,
      currentRole: req.user.role,
      requestedRole: role,
      ipAddress: req.ip,
      timestamp: new Date().toISOString(),
      operation: 'update_role'
    });
    
    // Validate role
    if (!role || !['farmer', 'expert'].includes(role)) {
      logger.warn('ROLE_UPDATE_VALIDATION_FAILED', {
        userId: req.user.id,
        invalidRole: role,
        allowedRoles: ['farmer', 'expert'],
        ipAddress: req.ip,
        validationType: 'invalid_role'
      });
      return res.status(400).json({
        success: false,
        message: 'Valid role (farmer, expert) is required. Admin role can only be assigned by administrators.'
      });
    }

    // Get current user
    const currentUser = await User.findById(req.user.id);
    if (!currentUser) {
      logger.warn('ROLE_UPDATE_FAILED', {
        userId: req.user.id,
        ipAddress: req.ip,
        failureReason: 'user_not_found',
        operation: 'update_role'
      });
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user is trying to switch to their current role
    if (currentUser.role === role) {
      logger.warn('ROLE_UPDATE_VALIDATION_FAILED', {
        userId: req.user.id,
        currentRole: currentUser.role,
        requestedRole: role,
        ipAddress: req.ip,
        validationType: 'same_role'
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

    logger.info('ROLE_UPDATE_SUCCESS', {
      userId: user._id,
      userEmail: user.email,
      oldRole: currentUser.role,
      newRole: role,
      ipAddress: req.ip,
      updateTimestamp: new Date().toISOString(),
      roleTransition: `${currentUser.role}_to_${role}`,
      operation: 'update_role'
    });

    res.status(200).json({
      success: true,
      message: `Role updated to ${role} successfully`,
      user: generateUserResponse(user)
    });
  } catch (error) {
    logger.error('ROLE_UPDATE_ERROR', {
      errorMessage: error.message,
      errorType: error.name,
      userId: req.user.id,
      ipAddress: req.ip,
      stackTrace: error.stack,
      operation: 'update_role',
      timestamp: new Date().toISOString()
    });
    next(error);
  }
};