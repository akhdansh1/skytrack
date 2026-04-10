import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { getFavorites, saveFavorites } from '../services/favoritesService';

const WeatherContext = createContext({});

export function WeatherProvider({ children }) {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    if (!user) { setFavorites([]); return; }
    getFavorites(user.uid).then(setFavorites).catch(() => {});
  }, [user]);

  const addFavorite = async (city) => {
    if (favorites.includes(city)) return;
    const updated = [...favorites, city];
    setFavorites(updated);
    if (user) await saveFavorites(user.uid, updated);
  };

  const removeFavorite = async (city) => {
    const updated = favorites.filter(c => c !== city);
    setFavorites(updated);
    if (user) await saveFavorites(user.uid, updated);
  };

  return (
    <WeatherContext.Provider value={{ favorites, addFavorite, removeFavorite }}>
      {children}
    </WeatherContext.Provider>
  );
}

export const useWeather = () => useContext(WeatherContext);
