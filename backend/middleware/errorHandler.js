const errorHandler = (err, req, res, next) => {
  // Log the error with additional context
  console.error('\n--- ERROR HANDLER ---');
  console.error('Timestamp:', new Date().toISOString());
  console.error('Request URL:', req.originalUrl);
  console.error('Request Method:', req.method);
  console.error('Error Stack:', err.stack);
  console.error('Error Details:', {
    name: err.name,
    message: err.message,
    statusCode: err.statusCode,
    validationErrors: err.errors,
    code: err.code
  });
  console.error('--- END ERROR ---\n');

  // Handle Joi validation errors
  if (err.isJoi) {
    return res.status(422).json({
      success: false,
      message: 'Validation Error',
      errors: err.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }))
    });
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    return res.status(422).json({
      success: false,
      message: 'Validation Error',
      errors: Object.keys(err.errors).map(key => ({
        field: key,
        message: err.errors[key].message
      }))
    });
  }

  // Handle MongoDB duplicate key errors
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(409).json({
      success: false,
      message: 'Duplicate Key Error',
      error: `${field} already exists`
    });
  }

  // Handle invalid ObjectId errors
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format',
      error: `Invalid ${err.path}: ${err.value}`
    });
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token',
      error: 'Authentication failed'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired',
      error: 'Please log in again'
    });
  }

  // Default error response
  const statusCode = err.statusCode || 500;
  const message = statusCode === 500 ? 'Internal Server Error' : err.message;

  res.status(statusCode).json({
    success: false,
    message,
    error: process.env.NODE_ENV === 'development' ? {
      name: err.name,
      stack: err.stack,
      details: err
    } : undefined
  });
};

module.exports = errorHandler;