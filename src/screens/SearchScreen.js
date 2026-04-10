import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getWeatherByCity } from '../services/weatherService';
import { useWeather } from '../context/WeatherContext';
import { getWeatherDescription, getWeatherEmoji, formatTemp } from '../utils/weatherUtils';
import Toast from '../components/Toast';
import { useToast } from '../hooks/useToast';

const POPULAR = ['Jakarta', 'Bandung', 'Surabaya', 'Bali', 'Yogyakarta', 'Medan', 'Makassar', 'Semarang'];

export default function SearchScreen() {
  const [query, setQuery]     = useState('');
  const [result, setResult]   = useState(null);
  const [loading, setLoading] = useState(false);
  const { favorites, addFavorite, removeFavorite } = useWeather();
  const { toast, showToast, hideToast } = useToast();
  const insets = useSafeAreaInsets();

  const search = async (city) => {
    const q = city || query.trim();
    if (!q) return;
    setLoading(true);
    setResult(null);
    try {
      const data = await getWeatherByCity(q);
      setResult(data);
    } catch (e) {
      showToast(e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const isFav  = result && favorites.includes(result.cityName);
  const code   = result?.current?.weather_code ?? 0;

  return (
    <LinearGradient colors={['#0f0c29', '#302b63', '#24243e']} style={styles.container}>
      <Toast message={toast.message} type={toast.type} visible={toast.visible} onHide={hideToast} />
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Cari Kota</Text>

        <View style={styles.searchRow}>
          <View style={styles.inputWrapper}>
            <Ionicons name="search-outline" size={18} color="#888" style={{ marginRight: 8 }} />
            <TextInput
              style={styles.input}
              placeholder="Nama kota..."
              placeholderTextColor="#555"
              value={query}
              onChangeText={setQuery}
              returnKeyType="search"
              onSubmitEditing={() => search()}
            />
          </View>
          <TouchableOpacity style={styles.searchBtn} onPress={() => search()} activeOpacity={0.85}>
            <Ionicons name="search" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Popular cities */}
        <Text style={styles.sectionLabel}>Kota Populer</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow}>
          {POPULAR.map(city => (
            <TouchableOpacity key={city} style={styles.chip} onPress={() => search(city)} activeOpacity={0.8}>
              <Text style={styles.chipText}>{city}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {loading && (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#e94560" />
          </View>
        )}

        {result && !loading && (
          <View style={styles.resultCard}>
            <View style={styles.resultHeader}>
              <View>
                <Text style={styles.cityName}>{result.cityName}</Text>
                <Text style={styles.country}>{result.country}</Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  if (isFav) { removeFavorite(result.cityName); showToast('Dihapus dari favorit', 'info'); }
                  else       { addFavorite(result.cityName);    showToast('Ditambahkan ke favorit ❤️', 'success'); }
                }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name={isFav ? 'heart' : 'heart-outline'} size={26} color={isFav ? '#e94560' : '#fff'} />
              </TouchableOpacity>
            </View>

            <View style={styles.mainWeather}>
              <Text style={styles.emoji}>{getWeatherEmoji(code)}</Text>
              <Text style={styles.temp}>{formatTemp(result.current.temperature_2m)}</Text>
              <Text style={styles.desc}>{getWeatherDescription(code)}</Text>
            </View>

            <View style={styles.statsRow}>
              {[
                { icon: 'water-outline',      label: 'Kelembapan', value: `${result.current.relative_humidity_2m}%` },
                { icon: 'speedometer-outline', label: 'Angin',     value: `${Math.round(result.current.wind_speed_10m)} km/h` },
              ].map((s, i) => (
                <View key={i} style={styles.statCard}>
                  <Ionicons name={s.icon} size={18} color="rgba(255,255,255,0.7)" />
                  <Text style={styles.statValue}>{s.value}</Text>
                  <Text style={styles.statLabel}>{s.label}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll:    { paddingHorizontal: 20, flexGrow: 1 },
  title:     { fontSize: 24, fontWeight: '800', color: '#fff', marginBottom: 20 },
  searchRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  inputWrapper: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 14,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', paddingHorizontal: 14,
  },
  input:     { flex: 1, color: '#fff', fontSize: 15, paddingVertical: 14 },
  searchBtn: { backgroundColor: '#e94560', borderRadius: 14, width: 52, justifyContent: 'center', alignItems: 'center' },
  sectionLabel: { fontSize: 14, fontWeight: '600', color: 'rgba(255,255,255,0.5)', marginBottom: 12 },
  chipsRow:  { marginBottom: 24 },
  chip:      { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, marginRight: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  chipText:  { color: '#fff', fontSize: 13, fontWeight: '500' },
  center:    { paddingTop: 60, alignItems: 'center' },
  resultCard: { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  resultHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  cityName:  { fontSize: 22, fontWeight: '800', color: '#fff' },
  country:   { fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 2 },
  mainWeather: { alignItems: 'center', marginBottom: 20 },
  emoji: { fontSize: 56, marginBottom: 8 },
  temp:  { fontSize: 52, fontWeight: '200', color: '#fff', marginBottom: 4 },
  desc:  { fontSize: 16, color: 'rgba(255,255,255,0.7)' },
  statsRow: { flexDirection: 'row', gap: 12 },
  statCard: { flex: 1, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 14, padding: 14, alignItems: 'center', gap: 4 },
  statValue: { fontSize: 15, fontWeight: '700', color: '#fff' },
  statLabel: { fontSize: 11, color: 'rgba(255,255,255,0.5)' },
});
