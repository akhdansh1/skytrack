import { useState, useEffect } from 'react';
import { getWeatherByCoords } from '../services/weatherService';

export function useWeatherData(location) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  useEffect(() => {
    if (!location) return;
    setLoading(true);
    setError(null);
    getWeatherByCoords(location.latitude, location.longitude)
      .then(setWeather)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [location]);

  const refresh = () => {
    if (!location) return;
    setLoading(true);
    setError(null);
    getWeatherByCoords(location.latitude, location.longitude)
      .then(setWeather)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  };

  return { weather, loading, error, refresh };
}
