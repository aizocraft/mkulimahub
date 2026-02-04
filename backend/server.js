require('dotenv').config();
const path = require('path');
const express = require('express');
const passport = require('passport');
require('./config/passport');
const cors = require('cors');
const connectDB = require('./config/db');
const routes = require('./routes');
const { initializeSocket } = require('./socket');

const app = express();

// Passport middleware
app.use(passport.initialize());

// Get environment variables
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Strict & dynamic CORS Configuration
const corsOptions = {
  origin: FRONTEND_URL,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 204,
  preflightContinue: false
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' })); 
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Debug Middleware (for development only)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  });
}

// Routes
app.use('/api', routes);

// Enhanced Error Handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Database connection and server start
connectDB()
  .then(() => {
    const server = app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`🌍 CORS allowed for: ${FRONTEND_URL}`);
      console.log(`🧭 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
    
    // Initialize Socket.IO
    const io = initializeSocket(server);
    console.log(`🔌 Socket.IO server initialized`);
  })
  .catch(err => {
    console.error('❌ Database connection failed:', err);
    process.exit(1);
  });