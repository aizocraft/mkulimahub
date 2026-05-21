
const fs = require('fs');
const path = require('path');

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const logFile = path.join(logsDir, 'app.log');

const normalizeMetaIdentity = (meta = {}) => {
  // Backward/forward compatible mapping so the UI can always read from meta.email/meta.name.
  // Existing controller logs often use top-level fields like `userEmail` / `userName`.
  // Some request logs put identity in `userId`.
  const out = { ...meta };

  // Support top-level-ish keys included inside `meta` (defensive)
  if (out.userEmail && !out.email) out.email = out.userEmail;
  if (out.userName && !out.name) out.name = out.userName;

  // Support controllers that might pass `email`/`name` under different keys
  // Also map common IP/userAgent keys to the UI expected shape
  if (out.userAgent && !out.userAgent) {
    // no-op
  }

  if (out.ip && !out.metaIp) {
    // no-op
  }


  // Ensure canonical keys exist where possible
  if (!out.userAgent && meta.userAgent) out.userAgent = meta.userAgent;
  if (!out.ip && meta.ip) out.ip = meta.ip;

  // Canonical meta for UI
  if (!out.email && meta.email) out.email = meta.email;
  if (!out.name && meta.name) out.name = meta.name;

  return out;
};

// Enhanced logger function
const logToFile = (level, message, meta = {}) => {
  const normalizedMeta = normalizeMetaIdentity(meta);
  
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level,
    message,
    ...normalizedMeta
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