// src/pages/dashboards/admin/Weather.jsx
import { useState, useEffect, useCallback } from 'react';
import { 
  Cloud, 
  CloudRain, 
  Sun, 
  CloudSnow, 
  CloudDrizzle,
  Wind,
  Thermometer,
  Droplets,
  Eye,
  Gauge,
  MapPin,
  RefreshCw,
  AlertTriangle,
  Search,
  ChevronDown,
  Navigation,
  Sunrise,
  Sunset,
  ThermometerSun,
  Droplet,
  Wind as WindIcon,
  Compass,
  Calendar,
  BarChart3,
  Leaf,
  ShieldAlert,
  Globe,
  TrendingUp,
  Download,
  Filter
} from 'lucide-react';
import { weatherService, getUserLocation } from '../../../services/weatherService';
import toast from 'react-hot-toast';

const Weather = () => {
  // State Management
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [counties, setCounties] = useState([]);
  const [countiesByRegion, setCountiesByRegion] = useState({});
  const [selectedCounty, setSelectedCounty] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showRegionDropdown, setShowRegionDropdown] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState('All Regions');
  const [weatherData, setWeatherData] = useState({
    current: {
      temperature: 0,
      condition: 'Clear',
      humidity: 0,
      windSpeed: 0,
      pressure: 0,
      visibility: 0,
      feelsLike: 0,
      sunrise: 0,
      sunset: 0
    },
    alerts: [],
    regions: [],
    forecast: [],
    agriculturalData: []
  });

  // Initialize counties on component mount
  useEffect(() => {
    fetchCounties();
  }, []);

  // Fetch all Kenya counties
  const fetchCounties = async () => {
    try {
      setLoading(true);
      const data = await weatherService.getCounties();
      if (data.success) {
        setCounties(data.counties);
        setCountiesByRegion(data.countiesByRegion);
        setSelectedCounty(data.counties[0]); // Default to first county
        fetchWeatherByCounty(data.counties[0].name);
      }
    } catch (error) {
      toast.error('Failed to load counties');
      console.error('Error fetching counties:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch weather by county name
  const fetchWeatherByCounty = async (countyName) => {
    try {
      setLoading(true);
      const response = await weatherService.getWeatherByCounty(countyName);
      
      if (response.success) {
        const data = response.data;
        
        // Update current weather
        setWeatherData(prev => ({
          ...prev,
          current: {
            temperature: data.main.temp,
            feelsLike: data.main.feels_like,
            condition: data.weather[0].main,
            humidity: data.main.humidity,
            windSpeed: data.wind.speed,
            pressure: data.main.pressure,
            visibility: data.visibility / 1000, // Convert to km
            sunrise: data.sys.sunrise,
            sunset: data.sys.sunset,
            windDirection: data.wind.deg
          },
          alerts: data.safetyAlerts || [],
          localTime: data.localTime,
          agriculturalImpact: data.agriculturalImpact
        }));

        // Update selected county
        const county = counties.find(c => c.name === countyName);
        setSelectedCounty(county);

        // Fetch forecast for this county
        fetchForecast(countyName);
      }
    } catch (error) {
      toast.error('Failed to fetch weather data');
      console.error('Error fetching weather:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch 5-day forecast
  const fetchForecast = async (countyName) => {
    try {
      const response = await weatherService.getForecast(countyName);
      if (response.success) {
        setWeatherData(prev => ({
          ...prev,
          forecast: response.forecast
        }));
      }
    } catch (error) {
      console.error('Error fetching forecast:', error);
    }
  };

  // Get weather by current location
  const getCurrentLocationWeather = async () => {
    try {
      setLocationLoading(true);
      const location = await getUserLocation();
      const response = await weatherService.getWeatherByLocation(location.lat, location.lon);
      
      if (response.success) {
        const data = response.data;
        setWeatherData(prev => ({
          ...prev,
          current: {
            temperature: data.main.temp,
            feelsLike: data.main.feels_like,
            condition: data.weather[0].main,
            humidity: data.main.humidity,
            windSpeed: data.wind.speed,
            pressure: data.main.pressure,
            visibility: data.visibility / 1000,
            sunrise: data.sys.sunrise,
            sunset: data.sys.sunset,
            windDirection: data.wind.deg
          },
          alerts: data.safetyAlerts || [],
          localTime: data.localTime
        }));

        // Update selected county with location data
        if (data.county) {
          setSelectedCounty({
            name: data.county.name,
            region: data.county.region,
            id: data.county.id
          });
        }

        toast.success('Weather data loaded for your location');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to get location weather');
      console.error('Location error:', error);
    } finally {
      setLocationLoading(false);
    }
  };

  // Refresh weather data
  const refreshData = async () => {
    if (selectedCounty) {
      await fetchWeatherByCounty(selectedCounty.name);
    }
  };

  // Export weather data as CSV
  const exportWeatherData = () => {
    try {
      const csvData = [
        ['County', 'Region', 'Temperature (°C)', 'Condition', 'Humidity (%)', 'Wind Speed (m/s)', 'Pressure (hPa)', 'Visibility (km)', 'Feels Like (°C)', 'Sunrise', 'Sunset'],
        [
          selectedCounty?.name || 'N/A',
          selectedCounty?.region || 'N/A',
          Math.round(weatherData.current.temperature),
          weatherData.current.condition,
          weatherData.current.humidity,
          weatherData.current.windSpeed,
          weatherData.current.pressure,
          weatherData.current.visibility,
          Math.round(weatherData.current.feelsLike),
          formatTime(weatherData.current.sunrise),
          formatTime(weatherData.current.sunset)
        ]
      ];

      const csvContent = csvData.map(row => row.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');

      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `weather-data-${selectedCounty?.name || 'current'}-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      toast.success('Weather data exported successfully');
    } catch (error) {
      toast.error('Failed to export weather data');
      console.error('Export error:', error);
    }
  };

  // Get weather icon based on condition
  const getWeatherIcon = (condition) => {
    const iconProps = { size: 24 };
    switch (condition) {
      case 'Clear':
        return <Sun {...iconProps} className="text-yellow-500" />;
      case 'Rain':
      case 'Drizzle':
        return <CloudRain {...iconProps} className="text-blue-500" />;
      case 'Clouds':
        return <Cloud {...iconProps} className="text-gray-500" />;
      case 'Thunderstorm':
        return <CloudDrizzle {...iconProps} className="text-purple-500" />;
      case 'Snow':
        return <CloudSnow {...iconProps} className="text-blue-300" />;
      case 'Mist':
      case 'Fog':
      case 'Haze':
        return <CloudDrizzle {...iconProps} className="text-gray-400" />;
      default:
        return <Cloud {...iconProps} className="text-gray-500" />;
    }
  };

  // Get condition text
  const getConditionText = (condition) => {
    const conditions = {
      'Clear': 'Clear Sky',
      'Clouds': 'Cloudy',
      'Rain': 'Rainy',
      'Drizzle': 'Drizzle',
      'Thunderstorm': 'Thunderstorm',
      'Snow': 'Snowy',
      'Mist': 'Misty',
      'Fog': 'Foggy',
      'Haze': 'Hazy'
    };
    return conditions[condition] || condition;
  };

  // Format time from timestamp
  const formatTime = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleTimeString('en-KE', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get wind direction from degrees
  const getWindDirection = (degrees) => {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
  };

  // Get severity color
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800';
      default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/30 dark:text-gray-300 dark:border-gray-800';
    }
  };

  // Filter counties by search and region
  const filteredCounties = counties.filter(county => {
    const matchesSearch = county.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         county.region.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRegion = selectedRegion === 'All Regions' || county.region === selectedRegion;
    return matchesSearch && matchesRegion;
  });

  // Regions for dropdown
  const regions = ['All Regions', ...Object.keys(countiesByRegion)];

  return (
    <div className="weather-dashboard space-y-6">
      {/* Header with Search and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Kenya Weather</h2>
          <p className="text-gray-600 dark:text-gray-400">Real-time weather monitoring</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {/* Location Button */}
          <button
            onClick={getCurrentLocationWeather}
            disabled={locationLoading}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg transition-all duration-200 hover:shadow-lg"
          >
            <Navigation size={18} className={locationLoading ? 'animate-pulse' : ''} />
            <span>{locationLoading ? 'Getting Location...' : 'Current Location'}</span>
          </button>

          {/* Refresh Button */}
          <button
            onClick={refreshData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition-all duration-200 hover:shadow-lg"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            <span>{loading ? 'Updating...' : 'Refresh'}</span>
          </button>

          {/* Export Button */}
          <button
            onClick={exportWeatherData}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 text-white rounded-lg transition-all duration-200"
          >
            <Download size={18} />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Search Input */}
        <div className="lg:col-span-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search counties or regions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>
        </div>

        {/* Region Filter Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowRegionDropdown(!showRegionDropdown)}
            className="w-full flex items-center justify-between px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            <div className="flex items-center gap-2">
              <Filter size={18} />
              <span>{selectedRegion}</span>
            </div>
            <ChevronDown size={18} className={`transform transition-transform duration-200 ${showRegionDropdown ? 'rotate-180' : ''}`} />
          </button>
          
          {showRegionDropdown && (
            <div className="absolute z-10 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {regions.map((region) => (
                <button
                  key={region}
                  onClick={() => {
                    setSelectedRegion(region);
                    setShowRegionDropdown(false);
                  }}
                  className={`w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150 ${
                    selectedRegion === region ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300' : ''
                  }`}
                >
                  {region}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Weather Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Weather Card */}
        <div className="lg:col-span-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <MapPin size={20} />
                <h3 className="text-xl font-semibold">
                  {selectedCounty ? `${selectedCounty.name}, ${selectedCounty.region}` : 'Select a County'}
                </h3>
              </div>
              <p className="text-blue-100 opacity-90">
                {weatherData.localTime || 'Loading time...'}
              </p>
            </div>
            
            <div className="mt-4 md:mt-0">
              <div className="flex items-center gap-2 text-3xl font-bold">
                {getWeatherIcon(weatherData.current.condition)}
                <span>{Math.round(weatherData.current.temperature)}°C</span>
              </div>
              <p className="text-blue-100 text-sm mt-1">
                Feels like {Math.round(weatherData.current.feelsLike)}°C • {getConditionText(weatherData.current.condition)}
              </p>
            </div>
          </div>

          {/* Weather Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <Droplets size={32} className="mx-auto mb-2" />
              <div className="text-3xl font-bold">{weatherData.current.humidity}%</div>
              <div className="text-blue-100 text-sm">Humidity</div>
            </div>

            <div className="text-center">
              <WindIcon size={32} className="mx-auto mb-2" />
              <div className="text-3xl font-bold">{weatherData.current.windSpeed}m/s</div>
              <div className="text-blue-100 text-sm">Wind Speed</div>
              <div className="text-xs opacity-75">
                {getWindDirection(weatherData.current.windDirection)}
              </div>
            </div>

            <div className="text-center">
              <Gauge size={32} className="mx-auto mb-2" />
              <div className="text-3xl font-bold">{weatherData.current.pressure}hPa</div>
              <div className="text-blue-100 text-sm">Pressure</div>
            </div>

            <div className="text-center">
              <Eye size={32} className="mx-auto mb-2" />
              <div className="text-3xl font-bold">{weatherData.current.visibility}km</div>
              <div className="text-blue-100 text-sm">Visibility</div>
            </div>
          </div>

          {/* Sunrise & Sunset */}
          <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-blue-400/30">
            <div className="flex items-center justify-center gap-3">
              <Sunrise className="text-yellow-300" size={24} />
              <div>
                <div className="text-sm text-blue-100">Sunrise</div>
                <div className="text-lg font-semibold">{formatTime(weatherData.current.sunrise)}</div>
              </div>
            </div>
            <div className="flex items-center justify-center gap-3">
              <Sunset className="text-orange-300" size={24} />
              <div>
                <div className="text-sm text-blue-100">Sunset</div>
                <div className="text-lg font-semibold">{formatTime(weatherData.current.sunset)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Weather Alerts & County Selector */}
        <div className="space-y-6">
          {/* County Selection */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Select County</h3>
              <span className="text-sm text-gray-500">{filteredCounties.length} counties</span>
            </div>
            
            <div className="max-h-60 overflow-y-auto pr-2">
              <div className="grid grid-cols-2 gap-2">
                {filteredCounties.slice(0, 20).map((county) => (
                  <button
                    key={county.id}
                    onClick={() => fetchWeatherByCounty(county.name)}
                    className={`p-3 rounded-lg text-left transition-all duration-200 ${
                      selectedCounty?.id === county.id
                        ? 'bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800'
                        : 'bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <div className="font-medium text-gray-900 dark:text-white">{county.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{county.region}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Weather Alerts */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-4">
              <ShieldAlert size={20} className="text-yellow-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Weather Alerts</h3>
            </div>

            <div className="space-y-3">
              {weatherData.alerts.length > 0 ? (
                weatherData.alerts.map((alert, index) => (
                  <div key={index} className={`p-3 rounded-lg border ${getSeverityColor(alert.severity)}`}>
                    <div className="flex items-start gap-2">
                      <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="font-medium text-sm">{alert.message}</div>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs opacity-75">{alert.type}</span>
                          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-white/50 dark:bg-black/50">
                            {alert.severity}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                  <AlertTriangle size={24} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No active weather alerts</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Forecast & Additional Data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 5-Day Forecast */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Calendar size={20} className="text-blue-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">5-Day Forecast</h3>
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Next 5 days</span>
          </div>

          <div className="space-y-3">
            {weatherData.forecast.slice(0, 5).map((day, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200">
                <div className="flex items-center gap-3">
                  {getWeatherIcon(day.condition)}
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">{day.dayOfWeek}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{day.date}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {Math.round(day.maxTemp)}° / {Math.round(day.minTemp)}°
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{day.condition}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Agricultural Impact */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Leaf size={20} className="text-green-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Agricultural Impact</h3>
            </div>
            <span className={`text-sm font-medium px-3 py-1 rounded-full ${
              weatherData.agriculturalImpact === 'Optimal' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
              weatherData.agriculturalImpact === 'Moderate' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
              'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
            }`}>
              {weatherData.agriculturalImpact || 'Analyzing...'}
            </span>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/10 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <ThermometerSun size={20} className="text-green-600 dark:text-green-400" />
                  <span className="font-medium text-gray-900 dark:text-white">Temperature</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {Math.round(weatherData.current.temperature)}°C
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Ideal: 20-30°C
                </div>
              </div>

              <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Droplet size={20} className="text-blue-600 dark:text-blue-400" />
                  <span className="font-medium text-gray-900 dark:text-white">Humidity</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {weatherData.current.humidity}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Optimal: 60-70%
                </div>
              </div>
            </div>

            <div className="p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-900/10 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 size={20} className="text-yellow-600 dark:text-yellow-400" />
                <span className="font-medium text-gray-900 dark:text-white">Crop Recommendations</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Maize</span>
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">Optimal</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Coffee</span>
                  <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">Moderate</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Tea</span>
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">Optimal</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/10 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={20} className="text-purple-600 dark:text-purple-400" />
                <span className="font-medium text-gray-900 dark:text-white">Growing Conditions</span>
              </div>
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Current weather conditions are {weatherData.agriculturalImpact?.toLowerCase() || 'favorable'} for most crops. 
                Consider irrigation if rainfall is below 10mm in the next 48 hours.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* County Weather Grid */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Globe size={20} className="text-gray-600 dark:text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Regional Weather Overview</h3>
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-400">Live data from all regions</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Object.entries(countiesByRegion).map(([region, regionCounties]) => (
            <div key={region} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-900 dark:text-white">{region}</h4>
                <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded">
                  {regionCounties.length} counties
                </span>
              </div>
              
              <div className="space-y-2">
                {regionCounties.slice(0, 3).map(county => (
                  <button
                    key={county.id}
                    onClick={() => fetchWeatherByCounty(county.name)}
                    className="w-full text-left p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{county.name}</span>
                      <ChevronDown size={14} className="text-gray-400" />
                    </div>
                  </button>
                ))}
              </div>

              {regionCounties.length > 3 && (
                <button
                  onClick={() => setSelectedRegion(region)}
                  className="w-full mt-3 text-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 pt-2 border-t border-gray-200 dark:border-gray-700"
                >
                  View all {regionCounties.length} counties
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 flex flex-col items-center gap-3">
            <RefreshCw size={24} className="animate-spin text-blue-600" />
            <div className="text-gray-900 dark:text-white">Loading weather data...</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Weather;