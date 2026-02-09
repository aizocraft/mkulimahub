
const fs = require('fs');
const path = require('path');

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const logFile = path.join(logsDir, 'app.log');

// Enhanced logger function
const logToFile = (level, message, meta = {}) => {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level,
    message,
    ...meta
  };
  
  const logLine = JSON.stringify(logEntry) + '\n';
  
  // Write to file (async)
  fs.appendFile(logFile, logLine, (err) => {
    if (err) {
      console.error('Failed to write to log file:', err);
    }
  });
  
  // Also log to console for development
  console.log(`[${timestamp}] ${level.toUpperCase()}: ${message}`);
};

// Request logger middleware
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logToFile('info', `${req.method} ${req.originalUrl}`, {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.connection.remoteAddress,
      userId: req.user ? req.user.id : 'anonymous'
    });
  });
  
  next();
};

// Error logger
const errorLogger = (error, req, res, next) => {
  logToFile('error', error.message, {
    stack: error.stack,
    method: req.method,
    url: req.originalUrl,
    userId: req.user ? req.user.id : 'anonymous'
  });
  next(error);
};

// Manual logging functions
const logger = {
  info: (message, meta = {}) => logToFile('info', message, meta),
  warn: (message, meta = {}) => logToFile('warn', message, meta),
  error: (message, meta = {}) => logToFile('error', message, meta),
  debug: (message, meta = {}) => logToFile('debug', message, meta)
};

module.exports = {
  requestLogger,
  errorLogger,
  logger
};