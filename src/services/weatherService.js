import axios from 'axios';

const BASE_URL = 'https://api.open-meteo.com/v1';
const GEO_URL  = 'https://geocoding-api.open-meteo.com/v1';

export const getWeatherByCoords = async (latitude, longitude) => {
  const response = await axios.get(`${BASE_URL}/forecast`, {
    params: {
      latitude, longitude,
      current: 'temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,surface_pressure,visibility',
      daily: 'weather_code,temperature_2m_max,temperature_2m_min',
      timezone: 'auto',
      forecast_days: 5,
    }
  });
  return response.data;
};

export const searchCities = async (query) => {
  const response = await axios.get(`${GEO_URL}/search`, {
    params: { name: query, count: 10, language: 'id', format: 'json' }
  });
  return response.data.results || [];
};

export const getWeatherByCity = async (city) => {
  const cities = await searchCities(city);
  if (!cities.length) throw new Error('Kota tidak ditemukan');
  const { latitude, longitude, name, country } = cities[0];
  const weather = await getWeatherByCoords(latitude, longitude);
  return { ...weather, cityName: name, country };
};
