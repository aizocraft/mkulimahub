const express = require('express');
const router = express.Router();
const weatherController = require('../controllers/weatherController');

// @route   GET /api/weather/counties
// @desc    Get all Kenya counties grouped by region
// @access  Public
router.get('/counties', weatherController.getCounties);

// @route   GET /api/weather/coordinates
// @desc    Get weather by latitude and longitude
// @access  Public
router.get('/coordinates', weatherController.getWeatherByCoordinates);

// @route   GET /api/weather/county/:countyName
// @desc    Get weather for a specific county
// @access  Public
router.get('/county/:countyName', weatherController.getWeatherByCounty);

// @route   POST /api/weather/multiple
// @desc    Get weather for multiple counties
// @access  Public
router.post('/multiple', weatherController.getMultipleCountiesWeather);

// @route   GET /api/weather/forecast/:countyName
// @desc    Get 5-day weather forecast for a county
// @access  Public
router.get('/forecast/:countyName', weatherController.getWeatherForecast);

// @route   GET /api/weather/historical
// @desc    Get historical weather data (requires paid plan)
// @access  Public
router.get('/historical', weatherController.getHistoricalData);

// @route   GET /api/weather/search
// @desc    Search counties by name or region
// @access  Public
router.get('/search', weatherController.searchCounties);

// @route   GET /api/weather/health
// @desc    Health check for weather service
// @access  Public
router.get('/health', (req, res) => {
  res.json({
    success: true,
    service: 'Weather API',
    status: 'operational',
    timestamp: new Date().toISOString(),
    openWeatherKey: process.env.OPENWEATHER_API_KEY ? 'configured' : 'missing',
    countiesAvailable: 47
  });
});

module.exports = router;