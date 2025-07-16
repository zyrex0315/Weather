// OpenWeatherMap API utility functions
const API_KEY = "81aa30380f335865ccf9f3c478532905";

// Geocode city name to lat/lon
export async function geocodeCity(city) {
  const url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=1&appid=${API_KEY}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to geocode city');
  const data = await response.json();
  if (!data[0]) throw new Error('City not found');
  return { lat: data[0].lat, lon: data[0].lon, name: data[0].name, country: data[0].country };
}

// Fetch current weather by city name
export async function fetchCurrentWeather(city) {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch current weather');
  return await response.json();
}

// Fetch 5-day/3-hour forecast by city name
export async function fetchForecastWeather(city) {
  const url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch forecast weather');
  return await response.json();
} 