import { useState, useEffect } from 'react';
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
  AlertTriangle
} from 'lucide-react';

const Weather = () => {
  const [weatherData, setWeatherData] = useState({
    current: {
      temperature: 24,
      condition: 'partly-cloudy',
      humidity: 65,
      windSpeed: 12,
      pressure: 1013,
      visibility: 10
    },
    alerts: [
      { id: 1, type: 'rain', message: 'Heavy rainfall expected in Central region', severity: 'medium' },
      { id: 2, type: 'wind', message: 'Strong winds in Coastal areas', severity: 'low' }
    ],
    regions: [
      { name: 'Nairobi', temp: 24, condition: 'partly-cloudy', rainfall: 2 },
      { name: 'Mombasa', temp: 29, condition: 'sunny', rainfall: 0 },
      { name: 'Kisumu', temp: 26, condition: 'rain', rainfall: 8 },
      { name: 'Nakuru', temp: 22, condition: 'cloudy', rainfall: 5 }
    ]
  });

  const [loading, setLoading] = useState(false);

  const getWeatherIcon = (condition) => {
    const iconProps = { size: 24 };
    switch (condition) {
      case 'sunny': return <Sun {...iconProps} className="text-yellow-500" />;
      case 'rain': return <CloudRain {...iconProps} className="text-blue-500" />;
      case 'cloudy': return <Cloud {...iconProps} className="text-gray-500" />;
      case 'partly-cloudy': return <CloudDrizzle {...iconProps} className="text-gray-400" />;
      case 'snow': return <CloudSnow {...iconProps} className="text-blue-300" />;
      default: return <Cloud {...iconProps} className="text-gray-500" />;
    }
  };

  const getConditionText = (condition) => {
    switch (condition) {
      case 'sunny': return 'Sunny';
      case 'rain': return 'Rainy';
      case 'cloudy': return 'Cloudy';
      case 'partly-cloudy': return 'Partly Cloudy';
      case 'snow': return 'Snowy';
      default: return 'Clear';
    }
  };

  const refreshData = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
  };

  return (
    <div className="weather-dashboard space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Weather Intelligence</h2>
          <p className="text-gray-600 dark:text-gray-400">Real-time weather monitoring and agricultural alerts</p>
        </div>
        <button
          onClick={refreshData}
          disabled={loading}
          className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg transition-colors duration-200"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          <span>{loading ? 'Updating...' : 'Refresh Data'}</span>
        </button>
      </div>

      {/* Current Weather Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Weather Card */}
        <div className="lg:col-span-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold">Current Weather</h3>
              <p className="text-blue-100">Kenya Agricultural Zones</p>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin size={20} />
              <span className="font-medium">National Overview</span>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <Thermometer size={32} className="mx-auto mb-2" />
              <div className="text-3xl font-bold">{weatherData.current.temperature}°C</div>
              <div className="text-blue-100 text-sm">Temperature</div>
            </div>

            <div className="text-center">
              <Droplets size={32} className="mx-auto mb-2" />
              <div className="text-3xl font-bold">{weatherData.current.humidity}%</div>
              <div className="text-blue-100 text-sm">Humidity</div>
            </div>

            <div className="text-center">
              <Wind size={32} className="mx-auto mb-2" />
              <div className="text-3xl font-bold">{weatherData.current.windSpeed}km/h</div>
              <div className="text-blue-100 text-sm">Wind Speed</div>
            </div>

            <div className="text-center">
              <Gauge size={32} className="mx-auto mb-2" />
              <div className="text-3xl font-bold">{weatherData.current.pressure}hPa</div>
              <div className="text-blue-100 text-sm">Pressure</div>
            </div>
          </div>
        </div>

        {/* Weather Alerts */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2 mb-6">
            <AlertTriangle size={20} className="text-yellow-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Weather Alerts</h3>
          </div>

          <div className="space-y-4">
            {weatherData.alerts.map(alert => (
              <div key={alert.id} className={`p-4 rounded-lg border ${
                alert.severity === 'medium' ? 'border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20' :
                'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20'
              }`}>
                <div className="flex items-start space-x-3">
                  <AlertTriangle size={18} className={`mt-0.5 ${
                    alert.severity === 'medium' ? 'text-yellow-600 dark:text-yellow-400' :
                    'text-blue-600 dark:text-blue-400'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{alert.message}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        alert.severity === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' :
                        'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                      }`}>
                        {alert.severity === 'medium' ? 'Medium' : 'Low'} Priority
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Regional Weather */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2 mb-6">
          <MapPin size={20} className="text-gray-600 dark:text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Regional Weather Conditions</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {weatherData.regions.map((region, index) => (
            <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-900 dark:text-white">{region.name}</h4>
                {getWeatherIcon(region.condition)}
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Temperature</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{region.temp}°C</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Condition</span>
                  <span className="text-sm text-gray-700 dark:text-gray-300">{getConditionText(region.condition)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Rainfall</span>
                  <span className="text-sm font-medium text-blue-600 dark:text-blue-400">{region.rainfall}mm</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>Last updated</span>
                  <span>2 hours ago</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Agricultural Impact */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Crop Suitability</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Maize</span>
              <span className="text-sm text-green-600 dark:text-green-400 font-medium">Optimal</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Coffee</span>
              <span className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">Moderate</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Tea</span>
              <span className="text-sm text-red-600 dark:text-red-400 font-medium">Poor</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Forecast Summary</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-400">
              <CloudRain size={16} className="text-blue-500" />
              <span>Expected rainfall: 5-15mm in next 48 hours</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-400">
              <Thermometer size={16} className="text-orange-500" />
              <span>Temperature range: 22°C - 29°C</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-400">
              <Wind size={16} className="text-gray-500" />
              <span>Wind conditions: Light to moderate</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Weather;