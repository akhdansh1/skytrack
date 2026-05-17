import { useCallback, useEffect, useState } from 'react';
import * as Location from 'expo-location';

export function useLocation(autoLoad = true) {
  const [location, setLocation] = useState(null);
  const [cityName, setCityName] = useState('Mendeteksi lokasi...');
  const [permissionStatus, setPermissionStatus] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(autoLoad);

  const getReadableCityName = (place) => {
    if (!place) {
      return 'Lokasi Anda';
    }

    return (
      place.city ||
      place.district ||
      place.subregion ||
      place.region ||
      place.country ||
      'Lokasi Anda'
    );
  };

  const getCurrentLocation = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setCityName('Mendeteksi lokasi...');

      const serviceEnabled = await Location.hasServicesEnabledAsync();

      if (!serviceEnabled) {
        throw new Error('Layanan lokasi perangkat belum aktif.');
      }

      const { status } = await Location.requestForegroundPermissionsAsync();

      setPermissionStatus(status);

      if (status !== 'granted') {
        throw new Error('Izin lokasi ditolak.');
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const coords = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        altitude: currentLocation.coords.altitude,
        accuracy: currentLocation.coords.accuracy,
        timestamp: currentLocation.timestamp,
      };

      setLocation(coords);

      const [place] = await Location.reverseGeocodeAsync({
        latitude: coords.latitude,
        longitude: coords.longitude,
      });

      setCityName(getReadableCityName(place));

      return {
        success: true,
        location: coords,
        cityName: getReadableCityName(place),
      };
    } catch (err) {
      const message =
        err.message || 'Gagal mendeteksi lokasi. Silakan coba kembali.';

      setError(message);
      setCityName('Lokasi tidak tersedia');

      return {
        success: false,
        message,
      };
    } finally {
      setLoading(false);
    }
  }, []);

  const clearLocation = useCallback(() => {
    setLocation(null);
    setCityName('Mendeteksi lokasi...');
    setError(null);
    setPermissionStatus(null);
  }, []);

  useEffect(() => {
    if (autoLoad) {
      getCurrentLocation();
    }
  }, [autoLoad, getCurrentLocation]);

  return {
    location,
    cityName,
    permissionStatus,
    error,
    loading,
    getCurrentLocation,
    clearLocation,
  };
}