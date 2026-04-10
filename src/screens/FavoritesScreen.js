import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useWeather } from '../context/WeatherContext';
import { getWeatherByCity } from '../services/weatherService';
import { getWeatherDescription, getWeatherEmoji, formatTemp } from '../utils/weatherUtils';
import Toast from '../components/Toast';
import { useToast } from '../hooks/useToast';

export default function FavoritesScreen() {
  const { favorites, removeFavorite } = useWeather();
  const [weatherData, setWeatherData] = useState({});
  const [loading, setLoading]         = useState({});
  const { toast, showToast, hideToast } = useToast();
  const insets = useSafeAreaInsets();

  const loadWeather = async (city) => {
    if (weatherData[city] || loading[city]) return;
    setLoading(prev => ({ ...prev, [city]: true }));
    try {
      const data = await getWeatherByCity(city);
      setWeatherData(prev => ({ ...prev, [city]: data }));
    } catch {
      showToast(`Gagal memuat cuaca ${city}`, 'error');
    } finally {
      setLoading(prev => ({ ...prev, [city]: false }));
    }
  };

  React.useEffect(() => {
    favorites.forEach(loadWeather);
  }, [favorites]);

  return (
    <LinearGradient colors={['#0f0c29', '#302b63', '#24243e']} style={styles.container}>
      <Toast message={toast.message} type={toast.type} visible={toast.visible} onHide={hideToast} />
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Kota Favorit</Text>

        {favorites.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>❤️</Text>
            <Text style={styles.emptyText}>Belum ada kota favorit</Text>
            <Text style={styles.emptyHint}>Cari kota di tab Cari lalu tap ikon hati</Text>
          </View>
        ) : (
          favorites.map(city => {
            const data = weatherData[city];
            const code = data?.current?.weather_code ?? 0;
            return (
              <View key={city} style={styles.card}>
                <View style={styles.cardLeft}>
                  <Text style={styles.cityName}>{city}</Text>
                  {loading[city]
                    ? <ActivityIndicator size="small" color="#e94560" style={{ marginTop: 8 }} />
                    : data
                      ? <Text style={styles.desc}>{getWeatherEmoji(code)} {getWeatherDescription(code)}</Text>
                      : null
                  }
                </View>
                <View style={styles.cardRight}>
                  {data && <Text style={styles.temp}>{formatTemp(data.current.temperature_2m)}</Text>}
                  <TouchableOpacity
                    onPress={() => { removeFavorite(city); showToast(`${city} dihapus dari favorit`, 'info'); }}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
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
  container: { flex: 1 },
  scroll:    { paddingHorizontal: 20, flexGrow: 1 },
  title:     { fontSize: 24, fontWeight: '800', color: '#fff', marginBottom: 20 },
  empty:     { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 80 },
  emptyEmoji: { fontSize: 48, marginBottom: 16 },
  emptyText:  { fontSize: 18, fontWeight: '700', color: '#fff', marginBottom: 8 },
  emptyHint:  { fontSize: 14, color: 'rgba(255,255,255,0.4)', textAlign: 'center' },
  card: {
    backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 18,
    padding: 18, marginBottom: 12, flexDirection: 'row',
    justifyContent: 'space-between', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  cardLeft:  { flex: 1 },
  cardRight: { alignItems: 'flex-end' },
  cityName:  { fontSize: 18, fontWeight: '700', color: '#fff', marginBottom: 4 },
  desc:      { fontSize: 13, color: 'rgba(255,255,255,0.6)' },
  temp:      { fontSize: 28, fontWeight: '200', color: '#fff' },
});
