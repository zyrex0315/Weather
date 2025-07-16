import React from 'react';

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

const CurrentWeather = ({ data }) => {
  if (!data) return null;
  const temp = data.main?.temp;
  const humidity = data.main?.humidity;
  const wind = data.wind?.speed;
  const sunrise = data.sys?.sunrise;
  const sunset = data.sys?.sunset;
  const description = data.weather?.[0]?.description;
  const main = data.weather?.[0]?.main;

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-center text-6xl">{getWeatherEmoji(main)}</div>
      <div className="text-5xl font-bold text-foreground">
        {typeof temp === 'number' ? Math.round(temp) : '--'}°C
      </div>
      <div className="text-lg text-muted-foreground capitalize">
        {description || '--'}
      </div>
      <div className="text-sm text-muted-foreground">
        Humidity: {typeof humidity === 'number' ? humidity : '--'}% | Wind: {typeof wind === 'number' ? wind : '--'} m/s
      </div>
      <div className="text-sm text-muted-foreground">
        {sunrise ? `Sunrise: ${new Date(sunrise * 1000).toLocaleTimeString()}` : ''} {sunset ? `| Sunset: ${new Date(sunset * 1000).toLocaleTimeString()}` : ''}
      </div>
    </div>
  );
};

export default CurrentWeather; 