import axios from 'axios';

const BASE_URL = 'https://api.open-meteo.com/v1';
const GEO_URL = 'https://geocoding-api.open-meteo.com/v1';

const apiClient = axios.create({
  timeout: 15000,
});

/**
 * Mengambil data cuaca berdasarkan koordinat latitude dan longitude.
 */
export const getWeatherByCoords = async (latitude, longitude) => {
  try {
    if (latitude === undefined || longitude === undefined) {
      throw new Error('Latitude dan longitude wajib diisi');
    }

    const response = await apiClient.get(`${BASE_URL}/forecast`, {
      params: {
        latitude,
        longitude,
        current:
          'temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,surface_pressure,visibility',
        daily:
          'weather_code,temperature_2m_max,temperature_2m_min',
        timezone: 'auto',
        forecast_days: 5,
      },
    });

    return response.data;
  } catch (error) {
    throw new Error(
      error?.response?.data?.reason ||
      error?.message ||
      'Gagal mengambil data cuaca berdasarkan koordinat'
    );
  }
};

/**
 * Mencari daftar kota berdasarkan kata kunci.
 */
export const searchCities = async (query) => {
  try {
    if (!query || query.trim().length < 2) {
      throw new Error('Masukkan minimal 2 karakter nama kota');
    }

    const response = await apiClient.get(`${GEO_URL}/search`, {
      params: {
        name: query.trim(),
        count: 10,
        language: 'id',
        format: 'json',
      },
    });

    return response.data?.results || [];
  } catch (error) {
    throw new Error(
      error?.response?.data?.reason ||
      error?.message ||
      'Gagal mencari data kota'
    );
  }
};

/**
 * Mengambil data cuaca berdasarkan nama kota.
 */
export const getWeatherByCity = async (city) => {
  try {
    const cities = await searchCities(city);

    if (!cities.length) {
      throw new Error('Kota tidak ditemukan');
    }

    const selectedCity = cities[0];

    const {
      latitude,
      longitude,
      name,
      country,
      admin1,
      timezone,
    } = selectedCity;

    const weather = await getWeatherByCoords(latitude, longitude);

    return {
      ...weather,
      location: {
        cityName: name,
        region: admin1 || '',
        country: country || '',
        latitude,
        longitude,
        timezone,
      },
    };
  } catch (error) {
    throw new Error(
      error?.message ||
      'Gagal mengambil data cuaca berdasarkan kota'
    );
  }
};

/**
 * Mengubah kode cuaca Open-Meteo menjadi teks yang mudah dipahami.
 */
export const getWeatherDescription = (code) => {
  const weatherCodes = {
    0: 'Cerah',
    1: 'Sebagian cerah',
    2: 'Berawan sebagian',
    3: 'Mendung',
    45: 'Berkabut',
    48: 'Kabut beku',
    51: 'Gerimis ringan',
    53: 'Gerimis sedang',
    55: 'Gerimis lebat',
    61: 'Hujan ringan',
    63: 'Hujan sedang',
    65: 'Hujan lebat',
    71: 'Salju ringan',
    73: 'Salju sedang',
    75: 'Salju lebat',
    80: 'Hujan lokal ringan',
    81: 'Hujan lokal sedang',
    82: 'Hujan lokal lebat',
    95: 'Badai petir',
    96: 'Badai petir dengan hujan es ringan',
    99: 'Badai petir dengan hujan es lebat',
  };

  return weatherCodes[code] || 'Cuaca tidak diketahui';
};

/**
 * Format data cuaca agar lebih mudah digunakan di UI.
 */
export const formatCurrentWeather = (weatherData) => {
  const current = weatherData?.current;

  if (!current) {
    return null;
  }

  return {
    temperature: current.temperature_2m,
    humidity: current.relative_humidity_2m,
    weatherCode: current.weather_code,
    weatherDescription: getWeatherDescription(current.weather_code),
    windSpeed: current.wind_speed_10m,
    pressure: current.surface_pressure,
    visibility: current.visibility,
    visibilityKm: current.visibility
      ? (current.visibility / 1000).toFixed(1)
      : null,
    time: current.time,
  };
};