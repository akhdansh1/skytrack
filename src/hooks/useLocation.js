import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

export function useLocation() {
  const [location, setLocation]   = useState(null);
  const [cityName, setCityName]   = useState('Mendeteksi lokasi...');
  const [error, setError]         = useState(null);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setError('Izin lokasi ditolak');
          setLoading(false);
          return;
        }
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        setLocation(loc.coords);

        const [place] = await Location.reverseGeocodeAsync(loc.coords);
        if (place) {
          setCityName(place.city || place.subregion || place.region || 'Lokasi Anda');
        }
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { location, cityName, error, loading };
}
