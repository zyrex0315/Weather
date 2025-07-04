import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Search, MapPin, Thermometer, Wind, Eye, Droplets } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const API_KEY = "81aa30380f335865ccf9f3c478532905";

const WeatherApp = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    
    fetchWeather('Butwal');
  }, []);

  const fetchWeather = async (cityName) => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}&units=metric`
      );
      
      if (!response.ok) {
        throw new Error('Weather data not found');
      }
      
      const data = await response.json();
      
      const weatherInfo = {
        name: data.name,
        country: data.sys.country,
        temperature: Math.round(data.main.temp),
        description: data.weather[0].description,
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        visibility: data.visibility / 1000,
        icon: data.weather[0].icon,
        main: data.weather[0].main
      };
      
      setWeatherData(weatherInfo);
      toast({
        title: "Weather Updated",
        description: `Weather data loaded for ${weatherInfo.name}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch weather data. Please check the city name.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (city.trim()) {
      fetchWeather(city.trim());
    }
  };

  const getWeatherEmoji = (main) => {
    const weatherEmojis = {
      'Clear': '☀️',
      'Clouds': '☁️',
      'Rain': '🌧️',
      'Drizzle': '🌦️',
      'Thunderstorm': '⛈️',
      'Snow': '❄️',
      'Mist': '🌫️',
      'Fog': '🌫️',
      'Haze': '🌫️'
    };
    return weatherEmojis[main] || '🌤️';
  };

  const getWeatherGradient = (main) => {
    const gradients = {
      'Clear': 'bg-gradient-sunset',
      'Clouds': 'bg-gradient-to-br from-weather-cloud to-weather-sky',
      'Rain': 'bg-gradient-to-br from-weather-rain to-weather-cloud',
      'Drizzle': 'bg-gradient-to-br from-weather-rain to-weather-cloud',
      'Thunderstorm': 'bg-gradient-to-br from-gray-700 to-weather-rain',
      'Snow': 'bg-gradient-to-br from-blue-100 to-weather-cloud',
      'Mist': 'bg-gradient-to-br from-weather-cloud to-weather-sky',
      'Fog': 'bg-gradient-to-br from-weather-cloud to-weather-sky',
      'Haze': 'bg-gradient-to-br from-weather-cloud to-weather-sky'
    };
    return gradients[main] || 'bg-gradient-sky';
  };

  return (
    <div className={`min-h-screen ${weatherData ? getWeatherGradient(weatherData.main) : 'bg-gradient-sky'} flex items-center justify-center p-4 transition-all duration-1000`}>
      <div className="w-full max-w-md space-y-6">
        {/* Search Form */}
        <Card className="p-4 bg-gradient-card backdrop-blur-sm border-white/20">
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              type="text"
              placeholder="Enter city name..."
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="flex-1 bg-white/50 border-white/30 placeholder:text-muted-foreground/70"
              disabled={loading}
            />
            <Button type="submit" disabled={loading} size="icon">
              <Search className="h-4 w-4" />
            </Button>
          </form>
        </Card>

        {/* Weather Display */}
        {weatherData && (
          <Card className="p-6 bg-gradient-card backdrop-blur-sm border-white/20 animate-fade-in">
            <div className="text-center space-y-4">
              {/* Location */}
              <div className="flex items-center justify-center gap-2 text-lg font-semibold text-foreground">
                <MapPin className="h-5 w-5" />
                {weatherData.name}, {weatherData.country}
              </div>

              {/* Weather Icon and Temperature */}
              <div className="space-y-2">
                <div className="text-6xl animate-float">
                  {getWeatherEmoji(weatherData.main)}
                </div>
                <div className="text-5xl font-bold text-foreground">
                  {weatherData.temperature}°C
                </div>
                <div className="text-lg text-muted-foreground capitalize">
                  {weatherData.description}
                </div>
              </div>

              {/* Weather Details */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/20">
                <div className="flex items-center gap-2 text-sm">
                  <Droplets className="h-4 w-4 text-weather-rain" />
                  <span>{weatherData.humidity}% Humidity</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Wind className="h-4 w-4 text-weather-sky" />
                  <span>{weatherData.windSpeed} m/s Wind</span>
                </div>
                <div className="flex items-center gap-2 text-sm col-span-2 justify-center">
                  <Eye className="h-4 w-4 text-weather-cloud" />
                  <span>{weatherData.visibility} km Visibility</span>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default WeatherApp;