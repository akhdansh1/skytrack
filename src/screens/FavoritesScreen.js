import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useWeather } from '../context/WeatherContext';
import { getWeatherByCity } from '../services/weatherService';
import {
  getWeatherDescription,
  getWeatherEmoji,
  formatTemp,
} from '../utils/weatherUtils';

import Toast from '../components/Toast';
import { useToast } from '../hooks/useToast';

const getCityName = (city) => {
  if (typeof city === 'string') {
    return city;
  }

  return city?.name || city?.cityName || '';
};

const getCityRegion = (city) => {
  if (typeof city === 'string') {
    return '';
  }

  return city?.region || city?.admin1 || '';
};

const getCityCountry = (city) => {
  if (typeof city === 'string') {
    return '';
  }

  return city?.country || '';
};

const getCityKey = (city) => {
  const name = getCityName(city);
  const country = getCityCountry(city);

  return `${name}-${country}`;
};

export default function FavoritesScreen() {
  const { favorites, removeFavorite, loadingFavorites } = useWeather();

  const [weatherData, setWeatherData] = useState({});
  const [loading, setLoading] = useState({});

  const { toast, showToast, hideToast } = useToast();
  const insets = useSafeAreaInsets();

  const loadWeather = useCallback(
    async (city) => {
      const cityName = getCityName(city);
      const cityKey = getCityKey(city);

      if (!cityName) return;
      if (weatherData[cityKey] || loading[cityKey]) return;

      setLoading((prev) => ({
        ...prev,
        [cityKey]: true,
      }));

      try {
        const data = await getWeatherByCity(cityName);

        setWeatherData((prev) => ({
          ...prev,
          [cityKey]: data,
        }));
      } catch {
        showToast(`Gagal memuat cuaca ${cityName}`, 'error');
      } finally {
        setLoading((prev) => ({
          ...prev,
          [cityKey]: false,
        }));
      }
    },
    [weatherData, loading, showToast]
  );

  useEffect(() => {
    favorites.forEach((city) => {
      loadWeather(city);
    });
  }, [favorites, loadWeather]);

  const handleRemoveFavorite = async (city) => {
    const cityName = getCityName(city);

    const result = await removeFavorite(city);

    if (!result.success) {
      showToast(result.message || 'Gagal menghapus kota favorit.', 'error');
      return;
    }

    showToast(`${cityName} dihapus dari favorit`, 'info');
  };

  return (
    <LinearGradient
      colors={['#0f0c29', '#302b63', '#24243e']}
      style={styles.container}
    >
      <Toast
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        duration={toast.duration}
        onHide={hideToast}
      />

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          {
            paddingTop: insets.top + 16,
            paddingBottom: insets.bottom + 16,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Kota Favorit</Text>

        {loadingFavorites ? (
          <View style={styles.empty}>
            <ActivityIndicator size="large" color="#e94560" />
            <Text style={styles.emptyHint}>Memuat kota favorit...</Text>
          </View>
        ) : favorites.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>❤️</Text>
            <Text style={styles.emptyText}>Belum ada kota favorit</Text>
            <Text style={styles.emptyHint}>
              Cari kota di tab Cari lalu tap ikon hati
            </Text>
          </View>
        ) : (
          favorites.map((city) => {
            const cityName = getCityName(city);
            const region = getCityRegion(city);
            const country = getCityCountry(city);
            const cityKey = getCityKey(city);

            const data = weatherData[cityKey];
            const code = data?.current?.weather_code ?? 0;

            return (
              <View key={cityKey} style={styles.card}>
                <View style={styles.cardLeft}>
                  <Text style={styles.cityName}>{cityName}</Text>

                  {(region || country) && (
                    <Text style={styles.regionText}>
                      {[region, country].filter(Boolean).join(', ')}
                    </Text>
                  )}

                  {loading[cityKey] ? (
                    <ActivityIndicator
                      size="small"
                      color="#e94560"
                      style={{ marginTop: 8 }}
                    />
                  ) : data ? (
                    <Text style={styles.desc}>
                      {getWeatherEmoji(code)} {getWeatherDescription(code)}
                    </Text>
                  ) : null}
                </View>

                <View style={styles.cardRight}>
                  {data && (
                    <Text style={styles.temp}>
                      {formatTemp(data.current.temperature_2m)}
                    </Text>
                  )}

                  <TouchableOpacity
                    onPress={() => handleRemoveFavorite(city)}
                    hitSlop={{
                      top: 10,
                      bottom: 10,
                      left: 10,
                      right: 10,
                    }}
                    style={{ marginTop: 8 }}
                  >
                    <Ionicons name="heart" size={22} color="#e94560" />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: 20,
    flexGrow: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 20,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  emptyHint: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center',
    marginTop: 10,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 18,
    padding: 18,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  cardLeft: {
    flex: 1,
  },
  cardRight: {
    alignItems: 'flex-end',
  },
  cityName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  regionText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.45)',
    marginBottom: 6,
  },
  desc: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
  },
  temp: {
    fontSize: 28,
    fontWeight: '200',
    color: '#fff',
  },
});