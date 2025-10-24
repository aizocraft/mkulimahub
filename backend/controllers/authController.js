const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');


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

    // Basic required field checks
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
      { expiresIn: '7d' } // Extended to 7 days for better UX
    );

    // Return response without password
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: generateUserResponse(user),
      token
    });

  } catch (error) {
    next(error);
  }
};

exports.loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Basic required field checks
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Please provide email and password' 
      });
    }

    // Find user including password field
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid email or password' 
      });
    }

    // Check if user is active
    if (user.isActive === false) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated. Please contact support.'
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
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

    // Return response without password
    res.status(200).json({
      success: true,
      message: 'Login successful',
      user: generateUserResponse(user),
      token
    });

  } catch (error) {
    next(error);
  }
};

// Get current user profile
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
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
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: generateUserResponse(user)
    });
  } catch (error) {
    next(error);
  }
};

// Change password
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }

    // Get user with password
    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
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

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Deactivate account (soft delete)
exports.deactivateAccount = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { isActive: false },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Account deactivated successfully'
    });
  } catch (error) {
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
        console.error('Google OAuth error:', err);
        return res.redirect(`${process.env.CLIENT_URL}/login?error=auth_failed`);
      }
      
      if (!user) {
        console.error('Google OAuth failed: No user returned');
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

      console.log('Google OAuth successful for user:', user.email, 'isNewUser:', isNewUser);

      // Clear the new user flag after first login
      if (isNewUser) {
        user.isNewUser = false;
        await user.save();
      }

      // Redirect to frontend with token and user info
      const userResponse = generateUserResponse(user);
      const redirectUrl = `${process.env.CLIENT_URL}/auth/success?token=${token}&user=${encodeURIComponent(JSON.stringify(userResponse))}&isNewUser=${isNewUser}`;
      
      console.log('Redirecting to:', redirectUrl);
      res.redirect(redirectUrl);
    } catch (error) {
      console.error('Error in Google callback:', error);
      res.redirect(`${process.env.CLIENT_URL}/login?error=auth_failed`);
    }
  })(req, res, next);
};

// Check if email exists for Google Auth
exports.checkEmail = async (req, res, next) => {
  try {
    const { email } = req.body;
    
    const user = await User.findOne({ email });
    
    res.status(200).json({
      success: true,
      exists: !!user,
      isGoogleAuth: user?.googleId ? true : false
    });
  } catch (error) {
    next(error);
  }
};

// Update current user's role (allow farmer/expert switching)
exports.updateMyRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    
    // Validate role
    if (!role || !['farmer', 'expert'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Valid role (farmer, expert) is required. Admin role can only be assigned by administrators.'
      });
    }

    // Get current user
    const currentUser = await User.findById(req.user.id);
    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user is trying to switch to their current role
    if (currentUser.role === role) {
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

    res.status(200).json({
      success: true,
      message: `Role updated to ${role} successfully`,
      user: generateUserResponse(user)
    });
  } catch (error) {
    next(error);
  }
};