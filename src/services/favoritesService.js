import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';

import { db } from './firebase';

const COLLECTION = 'user_favorites';

const validateUserId = (userId) => {
  if (!userId) {
    throw new Error('User ID tidak tersedia. Pastikan pengguna sudah login.');
  }
};

const normalizeCity = (city) => {
  if (!city) {
    throw new Error('Data kota tidak boleh kosong.');
  }

  if (typeof city === 'string') {
    return {
      name: city.trim(),
      country: '',
      region: '',
      latitude: null,
      longitude: null,
    };
  }

  return {
    name: city.name?.trim() || city.cityName?.trim() || '',
    country: city.country || '',
    region: city.region || city.admin1 || '',
    latitude: city.latitude || null,
    longitude: city.longitude || null,
  };
};

const isSameCity = (cityA, cityB) => {
  const nameA = String(cityA?.name || cityA?.cityName || '').toLowerCase();
  const nameB = String(cityB?.name || cityB?.cityName || '').toLowerCase();

  const countryA = String(cityA?.country || '').toLowerCase();
  const countryB = String(cityB?.country || '').toLowerCase();

  return nameA === nameB && countryA === countryB;
};

export const getFavorites = async (userId) => {
  try {
    validateUserId(userId);

    const ref = doc(db, COLLECTION, userId);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      return [];
    }

    return snap.data()?.cities || [];
  } catch (error) {
    throw new Error(error.message || 'Gagal mengambil data favorit.');
  }
};

export const saveFavorites = async (userId, cities) => {
  try {
    validateUserId(userId);

    if (!Array.isArray(cities)) {
      throw new Error('Data favorit harus berupa array.');
    }

    const normalizedCities = cities
      .map(normalizeCity)
      .filter((city) => city.name);

    const ref = doc(db, COLLECTION, userId);

    await setDoc(
      ref,
      {
        userId,
        cities: normalizedCities,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    return normalizedCities;
  } catch (error) {
    throw new Error(error.message || 'Gagal menyimpan data favorit.');
  }
};

export const addFavorite = async (userId, city) => {
  try {
    validateUserId(userId);

    const newCity = normalizeCity(city);

    if (!newCity.name) {
      throw new Error('Nama kota wajib diisi.');
    }

    const currentFavorites = await getFavorites(userId);

    const isDuplicate = currentFavorites.some((item) =>
      isSameCity(item, newCity)
    );

    if (isDuplicate) {
      return currentFavorites;
    }

    const updatedFavorites = [...currentFavorites, newCity];

    const ref = doc(db, COLLECTION, userId);

    await setDoc(
      ref,
      {
        userId,
        cities: updatedFavorites,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    return updatedFavorites;
  } catch (error) {
    throw new Error(error.message || 'Gagal menambahkan kota favorit.');
  }
};

export const removeFavorite = async (userId, cityName, country = '') => {
  try {
    validateUserId(userId);

    if (!cityName) {
      throw new Error('Nama kota wajib diisi.');
    }

    const currentFavorites = await getFavorites(userId);

    const targetCity = {
      name: cityName,
      country,
    };

    const updatedFavorites = currentFavorites.filter(
      (item) => !isSameCity(item, targetCity)
    );

    const ref = doc(db, COLLECTION, userId);

    await setDoc(
      ref,
      {
        userId,
        cities: updatedFavorites,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    return updatedFavorites;
  } catch (error) {
    throw new Error(error.message || 'Gagal menghapus kota favorit.');
  }
};

export const isFavoriteCity = async (userId, cityName, country = '') => {
  try {
    validateUserId(userId);

    if (!cityName) {
      return false;
    }

    const favorites = await getFavorites(userId);

    const targetCity = {
      name: cityName,
      country,
    };

    return favorites.some((item) => isSameCity(item, targetCity));
  } catch (error) {
    throw new Error(error.message || 'Gagal memeriksa kota favorit.');
  }
};