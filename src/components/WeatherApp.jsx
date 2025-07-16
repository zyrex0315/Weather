import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Search, MapPin, LocateFixed } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { geocodeCity, fetchCurrentWeather, fetchForecastWeather } from '@/lib/api';
import CurrentWeather from './CurrentWeather';
import HourlyForecast from './HourlyForecast';
import DailyForecast from './DailyForecast';
import Alerts from './Alerts';

const DEFAULT_CITY = 'Butwal';

function groupForecastByDay(forecastList) {
  const days = {};
  forecastList.forEach(item => {
    const date = new Date(item.dt * 1000);
    const day = date.toISOString().split('T')[0];
    if (!days[day]) days[day] = [];
    days[day].push(item);
  });
  return Object.values(days);
}

// Helper: map temperature to gradient
function getTempGradient(temp) {
  if (temp == null) return 'from-blue-200 via-blue-100 to-blue-300';
  if (temp < 5) return 'from-blue-900 via-blue-600 to-blue-300'; // very cold
  if (temp < 15) return 'from-blue-700 via-blue-400 to-cyan-200'; // cold
  if (temp < 25) return 'from-cyan-300 via-yellow-100 to-orange-100'; // mild
  if (temp < 32) return 'from-yellow-200 via-orange-200 to-pink-100'; // warm
  return 'from-orange-400 via-red-300 to-yellow-200'; // hot
}

function normalizeDailyForecast(forecastList) {
  // Group by day (YYYY-MM-DD)
  const days = {};
  forecastList.forEach(item => {
    const date = new Date(item.dt * 1000);
    const day = date.toISOString().split('T')[0];
    if (!days[day]) days[day] = [];
    days[day].push(item);
  });
  // Sort days by date ascending
  const sortedDays = Object.keys(days).sort();
  // For each day, create normalized object
  return sortedDays.map(day => {
    const arr = days[day];
    // Min/max temp
    let min = arr[0].main.temp, max = arr[0].main.temp;
    arr.forEach(item => {
      if (item.main.temp < min) min = item.main.temp;
      if (item.main.temp > max) max = item.main.temp;
    });
    // Midday entry for icon
    const midIdx = Math.floor(arr.length / 2);
    const iconMain = arr[midIdx].weather[0].main;
    const dt = arr[midIdx].dt;
    // Most frequent weather type for main
    const freq = {};
    arr.forEach(item => {
      const main = item.weather[0].main;
      freq[main] = (freq[main] || 0) + 1;
    });
    const main = Object.entries(freq).sort((a, b) => b[1] - a[1])[0][0];
    return { date: day, min, max, main, iconMain, dt };
  });
}

const WeatherApp = () => {
  const [city, setCity] = useState('');
  const [location, setLocation] = useState({ name: '', country: '', lat: null, lon: null });
  const [current, setCurrent] = useState(null);
  const [hourly, setHourly] = useState([]);
  const [daily, setDaily] = useState([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    handleCitySearch(DEFAULT_CITY);
    // eslint-disable-next-line
  }, []);

  const handleCitySearch = async (cityName) => {
    setLoading(true);
    try {
      const loc = await geocodeCity(cityName);
      setLocation(loc);
      const [currentData, forecastData] = await Promise.all([
        fetchCurrentWeather(cityName),
        fetchForecastWeather(cityName)
      ]);
      setCurrent(currentData);
      // Filter forecast for next 24 hours
      const now = Date.now() / 1000;
      const next24h = forecastData.list.filter(item => item.dt >= now && item.dt <= now + 24 * 3600);
      setHourly(next24h);
      // Normalize daily forecast: always pick 5 unique days starting from today
      const allDays = normalizeDailyForecast(forecastData.list);
      console.log('Normalized days:', allDays.map(d => d.date));
      const uniqueDays = [];
      const seen = new Set();
      for (const day of allDays) {
        if (!seen.has(day.date)) {
          uniqueDays.push(day);
          seen.add(day.date);
        }
        if (uniqueDays.length === 5) break;
      }
      console.log('Unique days:', uniqueDays.map(d => d.date));
      setDaily(uniqueDays);
      toast({
        title: 'Weather Updated',
        description: `Weather data loaded for ${loc.name}`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch weather data.',
        variant: 'destructive',
      });
      setCurrent(null);
      setHourly([]);
      setDaily([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (city.trim()) {
      handleCitySearch(city.trim());
    }
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: 'Geolocation Not Supported',
        description: 'Your browser does not support geolocation.',
        variant: 'destructive',
      });
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          // Use reverse geocoding to get city name
          const url = `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=81aa30380f335865ccf9f3c478532905`;
          const resp = await fetch(url);
          const data = await resp.json();
          const cityName = data[0]?.name || 'Your Location';
          setLocation({ name: cityName, country: data[0]?.country || '', lat, lon });
          const [currentData, forecastData] = await Promise.all([
            fetchCurrentWeather(cityName),
            fetchForecastWeather(cityName)
          ]);
          setCurrent(currentData);
          setHourly(forecastData.list.slice(0, 8));
          const grouped = groupForecastByDay(forecastData.list);
          setDaily(grouped.slice(0, 5).map(dayArr => dayArr[Math.floor(dayArr.length / 2)]));
          toast({
            title: 'Weather Updated',
            description: 'Weather data loaded for your location.',
          });
        } catch (error) {
          toast({
            title: 'Error',
            description: error.message || 'Failed to fetch weather data.',
            variant: 'destructive',
          });
          setCurrent(null);
          setHourly([]);
          setDaily([]);
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        toast({
          title: 'Geolocation Error',
          description: err.message || 'Failed to get your location.',
          variant: 'destructive',
        });
        setLoading(false);
      }
    );
  };

  // Get current temperature (Celsius)
  const temp = current?.main?.temp;
  const bgGradient = getTempGradient(temp);

  return (
    <div className={`min-h-screen w-full flex items-center justify-center p-4 transition-all duration-1000 bg-gradient-to-br ${bgGradient}`}>
      <div className="w-full max-w-5xl flex flex-col items-center gap-4">
        {/* Search Form */}
        <Card className="p-4 bg-white/60 backdrop-blur-md border-white/30 w-full max-w-xl mb-4 shadow-xl rounded-2xl">
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
            <Button type="button" onClick={handleUseMyLocation} disabled={loading} size="icon" title="Use My Location">
              <LocateFixed className="h-4 w-4" />
            </Button>
          </form>
        </Card>
        {/* Weather Display */}
        {current && (
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Central Current Weather Card */}
            <Card className="p-8 bg-white/60 backdrop-blur-md border-white/30 shadow-xl rounded-2xl flex flex-col items-center justify-center">
              <div className="text-center space-y-4 w-full">
                {/* Location */}
                <div className="flex items-center justify-center gap-2 text-xl font-bold text-foreground drop-shadow">
                  <MapPin className="h-6 w-6" />
                  {location.name}{location.country ? `, ${location.country}` : ''}
                </div>
                {/* Current Weather */}
                <CurrentWeather data={current} />
              </div>
            </Card>
            {/* Daily Forecast Card (Grid) */}
            <Card className="p-8 bg-white/60 backdrop-blur-md border-white/30 shadow-xl rounded-2xl flex flex-col items-center justify-center">
              <div className="w-full">
                <h3 className="text-lg font-semibold mb-4 text-center">5-Day Forecast</h3>
                <DailyForecast data={daily} />
              </div>
            </Card>
          </div>
        )}
        {/* Hourly Forecast Card (Below) */}
        {current && (
          <div className="w-full flex justify-center">
            <Card className="w-full max-w-4xl p-6 bg-white/60 backdrop-blur-md border-white/30 shadow-xl rounded-2xl mt-4">
              <h3 className="text-md font-semibold mb-4 text-center">Next 24 Hours</h3>
              <HourlyForecast data={hourly} />
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default WeatherApp;