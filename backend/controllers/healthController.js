const mongoose = require('mongoose');
const packageJson = require('../../package.json');

/**
 * @desc    Get health status of the application
 * @route   GET /api/health
 * @access  Public
 */
const getHealth = async (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStates = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  const healthCheck = {
    status: dbState === 1 ? 'ok' : 'error',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: packageJson.version,
    environment: process.env.NODE_ENV || 'development',
    database: {
      status: dbStates[dbState] || 'unknown',
      state: dbState,
    },
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100,
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024 * 100) / 100,
      unit: 'MB',
    },
  };

  const statusCode = dbState === 1 ? 200 : 503;
  res.status(statusCode).json(healthCheck);
};

/**
 * @desc    Simple liveness probe
 * @route   GET /api/health/live
 * @access  Public
 */
const getLiveness = (req, res) => {
  res.status(200).json({ status: 'alive', timestamp: new Date().toISOString() });
};

/**
 * @desc    Readiness probe - checks if app is ready to serve traffic
 * @route   GET /api/health/ready
 * @access  Public
 */
const getReadiness = async (req, res) => {
  const dbState = mongoose.connection.readyState;

  if (dbState === 1) {
    res.status(200).json({
      status: 'ready',
      timestamp: new Date().toISOString(),
      database: 'connected',
    });
  } else {
    res.status(503).json({
      status: 'not ready',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
    });
  }
};

module.exports = {
  getHealth,
  getLiveness,
  getReadiness,
};

