const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    // Debug: Log incoming headers
    console.log('Received headers:', req.headers);
    
    // 1. Check if Authorization header exists
    const authHeader = req.header('Authorization');
    if (!authHeader) {
      console.log('Authorization header missing');
      return res.status(401).json({ error: 'Authorization header missing' });
    }

    // 2. Verify header format
    if (!authHeader.startsWith('Bearer ')) {
      console.log('Invalid token format - missing Bearer prefix');
      return res.status(401).json({ error: 'Invalid token format' });
    }

    // 3. Extract token
    const token = authHeader.replace('Bearer ', '');
    console.log('Extracted token:', token);

    // 4. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded);

    // 5. Find user
    const user = await User.findOne({ _id: decoded.id });
    if (!user) {
      console.log('User not found for token');
      return res.status(401).json({ error: 'User not found' });
    }

    // 6. Attach to request
    req.token = token;
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    
    res.status(401).json({ error: 'Authentication failed' });
  }
};

module.exports = auth;