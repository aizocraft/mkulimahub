const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const weatherService = {
  // Get all Kenya counties
  getCounties: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/weather/counties`);
      if (!response.ok) throw new Error('Failed to fetch counties');
      return await response.json();
    } catch (error) {
      console.error('Error fetching counties:', error);
      throw error;
    }
  },

  // Get weather by user's current location
  getWeatherByLocation: async (lat, lon) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/weather/coordinates?lat=${lat}&lon=${lon}`
      );
      if (!response.ok) throw new Error('Failed to fetch weather by location');
      return await response.json();
    } catch (error) {
      console.error('Error fetching weather by location:', error);
      throw error;
    }
  },

  // Get weather by county name
  getWeatherByCounty: async (countyName) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/weather/county/${encodeURIComponent(countyName)}`
      );
      if (!response.ok) throw new Error(`Failed to fetch weather for ${countyName}`);
      return await response.json();
    } catch (error) {
      console.error(`Error fetching weather for ${countyName}:`, error);
      throw error;
    }
  },

  // Get weather for multiple counties
  getMultipleCountiesWeather: async (counties) => {
    try {
      const response = await fetch(`${API_BASE_URL}/weather/multiple`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ counties }),
      });
      if (!response.ok) throw new Error('Failed to fetch multiple counties weather');
      return await response.json();
    } catch (error) {
      console.error('Error fetching multiple counties weather:', error);
      throw error;
    }
  },

  // Get 5-day forecast for a county
  getForecast: async (countyName) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/weather/forecast/${encodeURIComponent(countyName)}`
      );
      if (!response.ok) throw new Error(`Failed to fetch forecast for ${countyName}`);
      return await response.json();
    } catch (error) {
      console.error(`Error fetching forecast for ${countyName}:`, error);
      throw error;
    }
  },

  // Search counties
  searchCounties: async (query) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/weather/search?query=${encodeURIComponent(query)}`
      );
      if (!response.ok) throw new Error('Failed to search counties');
      return await response.json();
    } catch (error) {
      console.error('Error searching counties:', error);
      throw error;
    }
  },

  // Check weather service health
  checkHealth: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/weather/health`);
      return await response.json();
    } catch (error) {
      console.error('Weather service health check failed:', error);
      throw error;
    }
  }
};

// Helper function to get user's location
export const getUserLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
      },
      (error) => {
        let errorMessage = 'Unable to retrieve your location';
        
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied. Please allow location access.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
          default:
            errorMessage = 'An unknown error occurred.';
        }
        
        reject(new Error(errorMessage));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  });
};

// Helper function to format temperature
export const formatTemperature = (temp) => {
  return `${Math.round(temp)}°C`;
};

// Helper function to get weather icon based on condition
export const getWeatherIcon = (condition) => {
  const conditions = {
    'Clear': 'sunny',
    'Clouds': 'cloudy',
    'Rain': 'rainy',
    'Drizzle': 'drizzle',
    'Thunderstorm': 'storm',
    'Snow': 'snow',
    'Mist': 'mist',
    'Smoke': 'smoke',
    'Haze': 'haze',
    'Dust': 'dust',
    'Fog': 'fog',
    'Sand': 'sand',
    'Ash': 'ash',
    'Squall': 'squall',
    'Tornado': 'tornado'
  };
  
  return conditions[condition] || 'unknown';
};

// Helper function to get wind direction
export const getWindDirection = (degrees) => {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(degrees / 45) % 8;
  return directions[index];
};