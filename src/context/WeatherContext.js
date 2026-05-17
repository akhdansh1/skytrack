import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';

import { useAuth } from './AuthContext';

import {
  getFavorites,
  addFavorite as addFavoriteService,
  removeFavorite as removeFavoriteService,
  saveFavorites,
  isFavoriteCity,
} from '../services/favoritesService';

const WeatherContext = createContext(null);

const getCityName = (city) => {
  if (typeof city === 'string') {
    return city;
  }

  return city?.name || city?.cityName || '';
};

const getCityCountry = (city) => {
  if (typeof city === 'string') {
    return '';
  }

  return city?.country || '';
};

export function WeatherProvider({ children }) {
  const { user } = useAuth();

  const [favorites, setFavorites] = useState([]);
  const [loadingFavorites, setLoadingFavorites] = useState(false);
  const [error, setError] = useState(null);

  const refreshFavorites = useCallback(async () => {
    if (!user?.uid) {
      setFavorites([]);
      return [];
    }

    try {
      setLoadingFavorites(true);
      setError(null);

      const data = await getFavorites(user.uid);

      setFavorites(data);

      return data;
    } catch (err) {
      setError(err.message || 'Gagal mengambil data favorit.');
      setFavorites([]);
      return [];
    } finally {
      setLoadingFavorites(false);
    }
  }, [user]);

  useEffect(() => {
    refreshFavorites();
  }, [refreshFavorites]);

  const addFavorite = async (city) => {
    if (!user?.uid) {
      setError('Pengguna belum login.');
      return {
        success: false,
        message: 'Pengguna belum login.',
      };
    }

    try {
      setError(null);

      const updatedFavorites = await addFavoriteService(user.uid, city);

      setFavorites(updatedFavorites);

      return {
        success: true,
        favorites: updatedFavorites,
      };
    } catch (err) {
      const message = err.message || 'Gagal menambahkan kota favorit.';

      setError(message);

      return {
        success: false,
        message,
      };
    }
  };

  const removeFavorite = async (city) => {
    if (!user?.uid) {
      setError('Pengguna belum login.');
      return {
        success: false,
        message: 'Pengguna belum login.',
      };
    }

    try {
      setError(null);

      const cityName = getCityName(city);
      const country = getCityCountry(city);

      const updatedFavorites = await removeFavoriteService(
        user.uid,
        cityName,
        country
      );

      setFavorites(updatedFavorites);

      return {
        success: true,
        favorites: updatedFavorites,
      };
    } catch (err) {
      const message = err.message || 'Gagal menghapus kota favorit.';

      setError(message);

      return {
        success: false,
        message,
      };
    }
  };

  const checkIsFavorite = async (city) => {
    if (!user?.uid) {
      return false;
    }

    try {
      const cityName = getCityName(city);
      const country = getCityCountry(city);

      return await isFavoriteCity(user.uid, cityName, country);
    } catch {
      return false;
    }
  };

  const saveAllFavorites = async (cities) => {
    if (!user?.uid) {
      setError('Pengguna belum login.');
      return {
        success: false,
        message: 'Pengguna belum login.',
      };
    }

    try {
      setError(null);

      const updatedFavorites = await saveFavorites(user.uid, cities);

      setFavorites(updatedFavorites);

      return {
        success: true,
        favorites: updatedFavorites,
      };
    } catch (err) {
      const message = err.message || 'Gagal menyimpan data favorit.';

      setError(message);

      return {
        success: false,
        message,
      };
    }
  };

  const clearFavoritesState = () => {
    setFavorites([]);
    setError(null);
  };

  const value = useMemo(
    () => ({
      favorites,
      loadingFavorites,
      error,
      addFavorite,
      removeFavorite,
      checkIsFavorite,
      saveAllFavorites,
      refreshFavorites,
      clearFavoritesState,
    }),
    [favorites, loadingFavorites, error, refreshFavorites]
  );

  return (
    <WeatherContext.Provider value={value}>
      {children}
    </WeatherContext.Provider>
  );
}

export const useWeather = () => {
  const context = useContext(WeatherContext);

  if (!context) {
    throw new Error('useWeather harus digunakan di dalam WeatherProvider.');
  }

  return context;
};