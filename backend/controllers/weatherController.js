const axios = require('axios');

// Kenya Counties Data
const kenyaCounties = [
  { id: 1, name: 'Mombasa', region: 'Coast', lat: -4.0435, lon: 39.6682 },
  { id: 2, name: 'Kwale', region: 'Coast', lat: -4.1816, lon: 39.4606 },
  { id: 3, name: 'Kilifi', region: 'Coast', lat: -3.5107, lon: 39.9093 },
  { id: 4, name: 'Tana River', region: 'Coast', lat: -1.4992, lon: 40.3089 },
  { id: 5, name: 'Lamu', region: 'Coast', lat: -2.2696, lon: 40.9006 },
  { id: 6, name: 'Taita-Taveta', region: 'Coast', lat: -3.3163, lon: 38.4842 },
  { id: 7, name: 'Garissa', region: 'North Eastern', lat: -0.4532, lon: 39.6460 },
  { id: 8, name: 'Wajir', region: 'North Eastern', lat: 1.7471, lon: 40.0573 },
  { id: 9, name: 'Mandera', region: 'North Eastern', lat: 3.9386, lon: 41.8625 },
  { id: 10, name: 'Marsabit', region: 'Eastern', lat: 2.3347, lon: 37.9940 },
  { id: 11, name: 'Isiolo', region: 'Eastern', lat: 0.3556, lon: 37.5833 },
  { id: 12, name: 'Meru', region: 'Eastern', lat: 0.0469, lon: 37.6559 },
  { id: 13, name: 'Tharaka-Nithi', region: 'Eastern', lat: -0.2961, lon: 38.0800 },
  { id: 14, name: 'Embu', region: 'Eastern', lat: -0.5388, lon: 37.4839 },
  { id: 15, name: 'Kitui', region: 'Eastern', lat: -1.3667, lon: 38.0167 },
  { id: 16, name: 'Machakos', region: 'Eastern', lat: -1.5167, lon: 37.2667 },
  { id: 17, name: 'Makueni', region: 'Eastern', lat: -1.8031, lon: 37.6231 },
  { id: 18, name: 'Nyandarua', region: 'Central', lat: -0.4167, lon: 36.5833 },
  { id: 19, name: 'Nyeri', region: 'Central', lat: -0.4167, lon: 36.9500 },
  { id: 20, name: 'Kirinyaga', region: 'Central', lat: -0.5000, lon: 37.2833 },
  { id: 21, name: 'Murang\'a', region: 'Central', lat: -0.9167, lon: 37.0333 },
  { id: 22, name: 'Kiambu', region: 'Central', lat: -1.1667, lon: 36.8333 },
  { id: 23, name: 'Turkana', region: 'Rift Valley', lat: 3.1167, lon: 35.6000 },
  { id: 24, name: 'West Pokot', region: 'Rift Valley', lat: 1.4167, lon: 35.1167 },
  { id: 25, name: 'Samburu', region: 'Rift Valley', lat: 1.1667, lon: 36.6667 },
  { id: 26, name: 'Trans-Nzoia', region: 'Rift Valley', lat: 1.0167, lon: 34.9500 },
  { id: 27, name: 'Uasin Gishu', region: 'Rift Valley', lat: 0.5167, lon: 35.2833 },
  { id: 28, name: 'Elgeyo-Marakwet', region: 'Rift Valley', lat: 0.5167, lon: 35.5167 },
  { id: 29, name: 'Nandi', region: 'Rift Valley', lat: 0.2000, lon: 35.1000 },
  { id: 30, name: 'Baringo', region: 'Rift Valley', lat: 0.4667, lon: 35.9667 },
  { id: 31, name: 'Laikipia', region: 'Rift Valley', lat: 0.2500, lon: 36.6833 },
  { id: 32, name: 'Nakuru', region: 'Rift Valley', lat: -0.2833, lon: 36.0667 },
  { id: 33, name: 'Narok', region: 'Rift Valley', lat: -1.0833, lon: 35.8667 },
  { id: 34, name: 'Kajiado', region: 'Rift Valley', lat: -1.8500, lon: 36.7833 },
  { id: 35, name: 'Kericho', region: 'Rift Valley', lat: -0.3667, lon: 35.2833 },
  { id: 36, name: 'Bomet', region: 'Rift Valley', lat: -0.7833, lon: 35.3500 },
  { id: 37, name: 'Kakamega', region: 'Western', lat: 0.2833, lon: 34.7500 },
  { id: 38, name: 'Vihiga', region: 'Western', lat: 0.0833, lon: 34.7167 },
  { id: 39, name: 'Bungoma', region: 'Western', lat: 0.5667, lon: 34.5667 },
  { id: 40, name: 'Busia', region: 'Western', lat: 0.4667, lon: 34.1167 },
  { id: 41, name: 'Siaya', region: 'Nyanza', lat: 0.0667, lon: 34.2833 },
  { id: 42, name: 'Kisumu', region: 'Nyanza', lat: -0.1000, lon: 34.7500 },
  { id: 43, name: 'Homa Bay', region: 'Nyanza', lat: -0.5333, lon: 34.4500 },
  { id: 44, name: 'Migori', region: 'Nyanza', lat: -1.0667, lon: 34.4667 },
  { id: 45, name: 'Kisii', region: 'Nyanza', lat: -0.6833, lon: 34.7667 },
  { id: 46, name: 'Nyamira', region: 'Nyanza', lat: -0.5667, lon: 34.9500 },
  { id: 47, name: 'Nairobi', region: 'Nairobi', lat: -1.2864, lon: 36.8172 }
];

// Helper functions
const getAgriculturalImpact = (weatherData) => {
  const { temp, humidity, weather } = weatherData;
  
  const conditions = {
    suitable: ['Clear', 'Few clouds'],
    moderate: ['Scattered clouds', 'Broken clouds'],
    poor: ['Rain', 'Thunderstorm', 'Snow']
  };

  let impact = 'Optimal';
  
  // Temperature check
  if (temp > 35 || temp < 15) impact = 'Poor';
  else if (temp > 30 || temp < 18) impact = 'Moderate';
  
  // Rainfall check
  if (weather[0].main === 'Rain') {
    impact = impact === 'Optimal' ? 'Moderate' : 'Poor';
  }
  
  // Humidity check for crop health
  if (humidity > 80) impact = 'Poor';
  else if (humidity < 40) impact = 'Moderate';

  return impact;
};

const getSafetyAlerts = (weatherData) => {
  const alerts = [];
  const { wind, weather, visibility } = weatherData;
  
  if (wind.speed > 20) {
    alerts.push({
      type: 'wind',
      severity: 'high',
      message: 'Strong winds expected. Secure outdoor items.'
    });
  }
  
  if (weather[0].main === 'Thunderstorm') {
    alerts.push({
      type: 'storm',
      severity: 'high',
      message: 'Thunderstorm warning. Seek shelter indoors.'
    });
  }
  
  if (weather[0].main === 'Rain' && visibility < 2000) {
    alerts.push({
      type: 'visibility',
      severity: 'medium',
      message: 'Low visibility due to heavy rain. Drive carefully.'
    });
  }
  
  if (weatherData.main.temp > 35) {
    alerts.push({
      type: 'heat',
      severity: 'medium',
      message: 'High temperature warning. Stay hydrated.'
    });
  }
  
  return alerts.length > 0 ? alerts : null;
};

// Controller functions
exports.getCounties = (req, res) => {
  try {
    // Group by region
    const countiesByRegion = kenyaCounties.reduce((acc, county) => {
      if (!acc[county.region]) {
        acc[county.region] = [];
      }
      acc[county.region].push(county);
      return acc;
    }, {});
    
    res.json({
      success: true,
      counties: kenyaCounties,
      countiesByRegion,
      totalCount: kenyaCounties.length,
      regions: Object.keys(countiesByRegion)
    });
  } catch (error) {
    console.error('Error fetching counties:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch counties data'
    });
  }
};

exports.getWeatherByCoordinates = async (req, res) => {
  try {
    const { lat, lon } = req.query;
    
    if (!lat || !lon) {
      return res.status(400).json({ 
        success: false,
        error: 'Latitude and longitude are required' 
      });
    }

    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`
    );
    
    const weatherData = response.data;
    
    // Enhance data with Kenya-specific info
    const enhancedData = {
      success: true,
      data: {
        ...weatherData,
        locationType: 'coordinates',
        localTime: new Date().toLocaleString('en-KE', { timeZone: 'Africa/Nairobi' }),
        agriculturalImpact: getAgriculturalImpact({
          temp: weatherData.main.temp,
          humidity: weatherData.main.humidity,
          weather: weatherData.weather
        }),
        safetyAlerts: getSafetyAlerts({
          wind: weatherData.wind,
          weather: weatherData.weather,
          visibility: weatherData.visibility,
          main: weatherData.main
        }),
        timestamp: new Date().toISOString()
      }
    };
    
    res.json(enhancedData);
  } catch (error) {
    console.error('Weather API error:', error.response?.data || error.message);
    
    let statusCode = 500;
    let errorMessage = 'Failed to fetch weather data';
    
    if (error.response?.status === 401) {
      statusCode = 401;
      errorMessage = 'Invalid OpenWeather API key';
    } else if (error.response?.status === 404) {
      statusCode = 404;
      errorMessage = 'Location not found';
    } else if (error.response?.status === 429) {
      statusCode = 429;
      errorMessage = 'API rate limit exceeded. Try again later.';
    }
    
    res.status(statusCode).json({ 
      success: false,
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.getWeatherByCounty = async (req, res) => {
  try {
    const { countyName } = req.params;
    
    // Find county coordinates
    const county = kenyaCounties.find(c => 
      c.name.toLowerCase() === countyName.toLowerCase()
    );
    
    if (!county) {
      return res.status(404).json({ 
        success: false,
        error: 'County not found. Please check the county name.' 
      });
    }

    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?lat=${county.lat}&lon=${county.lon}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`
    );
    
    const weatherData = response.data;
    
    // Enhance data with county info
    const enhancedData = {
      success: true,
      data: {
        ...weatherData,
        county: {
          name: county.name,
          region: county.region,
          coordinates: { lat: county.lat, lon: county.lon }
        },
        locationType: 'county',
        localTime: new Date().toLocaleString('en-KE', { timeZone: 'Africa/Nairobi' }),
        agriculturalImpact: getAgriculturalImpact({
          temp: weatherData.main.temp,
          humidity: weatherData.main.humidity,
          weather: weatherData.weather
        }),
        safetyAlerts: getSafetyAlerts({
          wind: weatherData.wind,
          weather: weatherData.weather,
          visibility: weatherData.visibility,
          main: weatherData.main
        }),
        timestamp: new Date().toISOString()
      }
    };
    
    res.json(enhancedData);
  } catch (error) {
    console.error(`Weather error for ${req.params.countyName}:`, error.message);
    
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch weather data for the county',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.getMultipleCountiesWeather = async (req, res) => {
  try {
    const { counties } = req.body;
    
    if (!Array.isArray(counties) || counties.length === 0) {
      return res.status(400).json({ 
        success: false,
        error: 'Array of county names is required' 
      });
    }

    if (counties.length > 10) {
      return res.status(400).json({
        success: false,
        error: 'Maximum 10 counties allowed per request'
      });
    }

    const weatherPromises = counties.map(async (countyName) => {
      const county = kenyaCounties.find(c => 
        c.name.toLowerCase() === countyName.toLowerCase()
      );
      
      if (!county) return null;
      
      try {
        const response = await axios.get(
          `https://api.openweathermap.org/data/2.5/weather?lat=${county.lat}&lon=${county.lon}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`
        );
        
        return {
          county: county.name,
          region: county.region,
          coordinates: { lat: county.lat, lon: county.lon },
          weather: response.data,
          agriculturalImpact: getAgriculturalImpact({
            temp: response.data.main.temp,
            humidity: response.data.main.humidity,
            weather: response.data.weather
          }),
          timestamp: new Date().toISOString()
        };
      } catch (error) {
        console.error(`Failed to fetch weather for ${countyName}:`, error.message);
        return {
          county: county.name,
          error: 'Failed to fetch weather data',
          available: false
        };
      }
    });

    const results = await Promise.all(weatherPromises);
    const validResults = results.filter(result => result !== null);
    
    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      count: validResults.length,
      totalRequested: counties.length,
      data: validResults
    });
  } catch (error) {
    console.error('Multiple counties weather error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch weather data for multiple counties'
    });
  }
};

exports.getWeatherForecast = async (req, res) => {
  try {
    const { countyName } = req.params;
    
    const county = kenyaCounties.find(c => 
      c.name.toLowerCase() === countyName.toLowerCase()
    );
    
    if (!county) {
      return res.status(404).json({ 
        success: false,
        error: 'County not found' 
      });
    }

    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${county.lat}&lon=${county.lon}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`
    );
    
    // Process forecast data
    const forecastData = response.data;
    const dailyForecast = [];
    
    // Group by day
    const forecastByDay = {};
    forecastData.list.forEach(item => {
      const date = new Date(item.dt * 1000).toLocaleDateString('en-KE');
      if (!forecastByDay[date]) {
        forecastByDay[date] = {
          date,
          temps: [],
          conditions: [],
          humidity: [],
          wind: []
        };
      }
      forecastByDay[date].temps.push(item.main.temp);
      forecastByDay[date].conditions.push(item.weather[0].main);
      forecastByDay[date].humidity.push(item.main.humidity);
      forecastByDay[date].wind.push(item.wind.speed);
    });
    
    // Calculate daily averages
    Object.keys(forecastByDay).forEach(date => {
      const day = forecastByDay[date];
      const avgTemp = (Math.min(...day.temps) + Math.max(...day.temps)) / 2;
      const mostCommonCondition = day.conditions.reduce((a, b, i, arr) => 
        arr.filter(v => v === a).length >= arr.filter(v => v === b).length ? a : b
      );
      
      dailyForecast.push({
        date,
        dayOfWeek: new Date(date).toLocaleDateString('en-KE', { weekday: 'long' }),
        minTemp: Math.min(...day.temps),
        maxTemp: Math.max(...day.temps),
        avgTemp: Math.round(avgTemp * 10) / 10,
        condition: mostCommonCondition,
        avgHumidity: Math.round(day.humidity.reduce((a, b) => a + b) / day.humidity.length),
        avgWindSpeed: Math.round(day.wind.reduce((a, b) => a + b) / day.wind.length * 10) / 10,
        rainfall: day.conditions.filter(c => c === 'Rain').length > 2 ? 'High' : 
                  day.conditions.filter(c => c === 'Rain').length > 0 ? 'Low' : 'None'
      });
    });
    
    // Limit to 5 days
    const fiveDayForecast = dailyForecast.slice(0, 5);
    
    res.json({
      success: true,
      county: county.name,
      region: county.region,
      forecast: fiveDayForecast,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error(`Forecast error for ${req.params.countyName}:`, error.message);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch weather forecast'
    });
  }
};

exports.getHistoricalData = async (req, res) => {
  try {
    const { countyName, days = 7 } = req.query;
    
    const county = kenyaCounties.find(c => 
      c.name.toLowerCase() === countyName.toLowerCase()
    );
    
    if (!county) {
      return res.status(404).json({ 
        success: false,
        error: 'County not found' 
      });
    }
    
    // Note: OpenWeather One Call API 3.0 has historical data
    // You might need to adjust based on your OpenWeather subscription
    const endDate = Math.floor(Date.now() / 1000);
    const startDate = endDate - (days * 24 * 60 * 60);
    
    // This is a simplified example - adjust based on actual API
    res.json({
      success: true,
      county: county.name,
      days: parseInt(days),
      data: {
        message: 'Historical data requires OpenWeather paid plan or alternative data source',
        suggestion: 'Consider using OpenWeather One Call API 3.0 for historical data'
      }
    });
  } catch (error) {
    console.error('Historical data error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch historical data'
    });
  }
};

// Search counties
exports.searchCounties = (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || query.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Search query must be at least 2 characters'
      });
    }
    
    const searchResults = kenyaCounties.filter(county => 
      county.name.toLowerCase().includes(query.toLowerCase()) ||
      county.region.toLowerCase().includes(query.toLowerCase())
    );
    
    res.json({
      success: true,
      query,
      count: searchResults.length,
      results: searchResults
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search counties'
    });
  }
};