import React from 'react';
import {
  WiDaySunny, WiCloud, WiRain, WiThunderstorm, WiSnow, WiFog, WiDayHaze, WiNightClear, WiDayCloudy, WiShowers, WiDayRainMix
} from 'react-icons/wi';
import CurrentWeather from './CurrentWeather';

// Emoji icon mapping (copied from CurrentWeather)
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

const HourlyForecast = ({ data }) => {
  if (!data || data.length === 0) return null;
  // Get current hour for highlight
  const nowHour = new Date().getHours();
  // Show only 8 cards (24 hours in 3-hour steps) for compactness
  const compactData = data.slice(0, 8);
  return (
    <div className="pt-4 border-t border-white/20">
      <div className="font-semibold mb-2 text-center">Next 24 Hours</div>
      <div className="grid grid-cols-4 md:grid-cols-8 gap-2 md:gap-4">
        {compactData.map((h, i) => {
          const hour = new Date(h.dt * 1000).getHours();
          const isNow = hour === nowHour;
          return (
            <div
              key={i}
              className={`flex flex-col items-center justify-between bg-white/40 backdrop-blur-lg rounded-xl px-2 py-3 shadow-md transition-transform duration-200 hover:scale-105 ${isNow ? 'scale-105 bg-blue-100 shadow-blue-200' : ''}`}
              style={{ minHeight: 90, minWidth: 0 }}
            >
              <div className={`text-xs font-bold mb-1 ${isNow ? 'text-blue-700' : 'text-gray-700'}`}>{hour}:00</div>
              <div className="mb-1 text-xl flex items-center justify-center">{getWeatherEmoji(h.weather[0].main)}</div>
              <div className="text-sm font-bold mb-1 text-gray-900">{isNaN(h.main.temp) ? '--' : Math.round(h.main.temp)}°C</div>
              <div className="flex items-center gap-1 text-xs text-blue-700">💧{Math.round(h.pop * 100)}%</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HourlyForecast; 