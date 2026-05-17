import { useCallback, useEffect, useRef, useState } from 'react';
import { getWeatherByCoords } from '../services/weatherService';

export function useWeatherData(location, autoLoad = true) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const mountedRef = useRef(true);

  const isValidLocation = (loc) => {
    return (
      loc &&
      typeof loc.latitude === 'number' &&
      typeof loc.longitude === 'number'
    );
  };

  const loadWeather = useCallback(
    async (isRefresh = false) => {
      if (!isValidLocation(location)) {
        setError('Lokasi tidak valid.');
        return {
          success: false,
          message: 'Lokasi tidak valid.',
        };
      }

      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError(null);

        const data = await getWeatherByCoords(
          location.latitude,
          location.longitude
        );

        if (mountedRef.current) {
          setWeather(data);
        }

        return {
          success: true,
          weather: data,
        };
      } catch (err) {
        const message =
          err.message || 'Gagal mengambil data cuaca. Silakan coba kembali.';

        if (mountedRef.current) {
          setError(message);
        }

        return {
          success: false,
          message,
        };
      } finally {
        if (mountedRef.current) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    [location]
  );

  const refresh = useCallback(() => {
    return loadWeather(true);
  }, [loadWeather]);

  const clearWeather = useCallback(() => {
    setWeather(null);
    setError(null);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    if (autoLoad && isValidLocation(location)) {
      loadWeather(false);
    }

    return () => {
      mountedRef.current = false;
    };
  }, [location, autoLoad, loadWeather]);

  return {
    weather,
    loading,
    refreshing,
    error,
    refresh,
    loadWeather,
    clearWeather,
  };
}