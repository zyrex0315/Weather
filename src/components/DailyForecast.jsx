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

// Helper to get min/max temp from a day's array of forecast entries
function getMinMaxTemp(dayArr) {
  if (!Array.isArray(dayArr) || dayArr.length === 0) return { min: null, max: null };
  let min = dayArr[0].main.temp, max = dayArr[0].main.temp;
  dayArr.forEach(item => {
    if (item.main.temp < min) min = item.main.temp;
    if (item.main.temp > max) max = item.main.temp;
  });
  return { min, max };
}

const DailyForecast = ({ data }) => {
  if (!data || data.length === 0) return null;
  // Get today's ISO date for accent
  const todayISO = new Date().toISOString().split('T')[0];
  return (
    <div className="pt-4 border-t border-white/20">
      <div className="font-semibold mb-2 text-center">5-Day Forecast</div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 md:gap-4">
        {data.map((d, i) => {
          const isToday = d.date === todayISO;
          let dayLabel;
          if (i === 0 && isToday) {
            dayLabel = 'TODAY';
          } else {
            const dateObj = new Date(d.dt * 1000);
            const weekday = dateObj.toLocaleDateString(undefined, { weekday: 'short' }).toUpperCase();
            const dateStr = dateObj.toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' });
            dayLabel = `${weekday}, ${dateStr}`;
          }
          return (
            <div
              key={i}
              className={`flex flex-col items-center justify-between bg-white/40 backdrop-blur-lg rounded-xl px-2 py-4 shadow-md transition-transform duration-200 hover:scale-105 ${isToday ? 'scale-105 bg-blue-100 shadow-blue-200' : ''}`}
              style={{ minHeight: 120, minWidth: 0 }}
            >
              <div className={`text-xs font-bold mb-1 uppercase tracking-wide text-center whitespace-nowrap ${isToday ? 'text-blue-700' : 'text-gray-700'}`}>{dayLabel}</div>
              <div className="mb-1 text-2xl flex items-center justify-center">{getWeatherEmoji(d.iconMain)}</div>
              <div className="text-base font-extrabold mb-1 text-gray-900">{`${Math.round(d.max)}°/${Math.round(d.min)}°C`}</div>
              <div className="text-xs text-gray-500 mt-1">{d.main}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DailyForecast; 