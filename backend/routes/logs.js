// backend/routes/logs.js
const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// Get all logs (admin only)
router.get('/', auth, admin, async (req, res) => {
  try {
    const logPath = path.join(__dirname, '../logs/app.log');
    
    // Check if log file exists
    if (!fs.existsSync(logPath)) {
      return res.status(404).json({ 
        success: false,
        message: 'Log file not found' 
      });
    }

    // Read log file
    const logData = fs.readFileSync(logPath, 'utf8');
    
    // Parse log entries
    const logEntries = logData
      .split('\n')
      .filter(line => line.trim())
      .map(line => {
        try {
          return JSON.parse(line);
        } catch (e) {
          return { 
            message: line, 
            timestamp: new Date().toISOString(),
            level: 'unknown'
          };
        }
      })
      .reverse(); // Show latest first

    res.json({
      success: true,
      logs: logEntries,
      total: logEntries.length
    });
  } catch (error) {
    console.error('Error reading logs:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error reading log file' 
    });
  }
});

// Get logs by level
router.get('/level/:level', auth, admin, async (req, res) => {
  try {
    const { level } = req.params;
    const logPath = path.join(__dirname, '../logs/app.log');
    
    if (!fs.existsSync(logPath)) {
      return res.status(404).json({ 
        success: false,
        message: 'Log file not found' 
      });
    }

    const logData = fs.readFileSync(logPath, 'utf8');
    const logEntries = logData
      .split('\n')
      .filter(line => line.trim())
      .map(line => {
        try {
          return JSON.parse(line);
        } catch (e) {
          return { 
            message: line, 
            timestamp: new Date().toISOString(),
            level: 'unknown'
          };
        }
      })
      .filter(entry => entry.level === level)
      .reverse();

    res.json({
      success: true,
      logs: logEntries,
      total: logEntries.length
    });
  } catch (error) {
    console.error('Error reading logs:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error reading log file' 
    });
  }
});

// Clear logs (optional - use with caution)
router.delete('/', auth, admin, async (req, res) => {
  try {
    const logPath = path.join(__dirname, '../logs/app.log');
    
    if (fs.existsSync(logPath)) {
      fs.writeFileSync(logPath, '');
    }
    
    res.json({
      success: true,
      message: 'Logs cleared successfully'
    });
  } catch (error) {
    console.error('Error clearing logs:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error clearing logs' 
    });
  }
});

module.exports = router;