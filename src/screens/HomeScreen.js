import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { useLocation } from '../hooks/useLocation';
import { useWeatherData } from '../hooks/useWeatherData';
import { getWeatherDescription, getWeatherEmoji, getBackgroundColors, getGreeting, formatTemp } from '../utils/weatherUtils';

export default function HomeScreen() {
  const { user } = useAuth();
  const insets   = useSafeAreaInsets();
  const { location, cityName, loading: locLoading } = useLocation();
  const { weather, loading: weatherLoading, refresh } = useWeatherData(location);

  const isLoading = locLoading || weatherLoading;
  const current   = weather?.current;
  const daily     = weather?.daily;
  const code      = current?.weather_code ?? 0;
  const bgColors  = getBackgroundColors(code);
  const firstName = user?.displayName?.split(' ')[0] || 'Pengguna';

  const DAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  return (
    <LinearGradient colors={bgColors} style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refresh} tintColor="#fff" />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()}, {firstName} 👋</Text>
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={14} color="rgba(255,255,255,0.7)" />
              <Text style={styles.locationText}>{cityName}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={refresh} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="refresh-outline" size={24} color="rgba(255,255,255,0.8)" />
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.loadingText}>Memuat data cuaca...</Text>
          </View>
        ) : current ? (
          <>
            {/* Main weather card */}
            <View style={styles.mainCard}>
              <Text style={styles.weatherEmoji}>{getWeatherEmoji(code)}</Text>
              <Text style={styles.temperature}>{formatTemp(current.temperature_2m)}</Text>
              <Text style={styles.description}>{getWeatherDescription(code)}</Text>
              <Text style={styles.feelsLike}>Kelembapan {current.relative_humidity_2m}%</Text>
            </View>

            {/* Stats row */}
            <View style={styles.statsRow}>
              {[
                { icon: 'water-outline',     label: 'Kelembapan', value: `${current.relative_humidity_2m}%` },
                { icon: 'speedometer-outline', label: 'Angin',    value: `${Math.round(current.wind_speed_10m)} km/h` },
                { icon: 'pulse-outline',      label: 'Tekanan',   value: `${Math.round(current.surface_pressure)} hPa` },
              ].map((item, i) => (
                <View key={i} style={styles.statCard}>
                  <Ionicons name={item.icon} size={20} color="rgba(255,255,255,0.7)" />
                  <Text style={styles.statValue}>{item.value}</Text>
                  <Text style={styles.statLabel}>{item.label}</Text>
                </View>
              ))}
            </View>

            {/* 5-day forecast */}
            {daily && (
              <View style={styles.forecastCard}>
                <Text style={styles.forecastTitle}>Prakiraan 5 Hari</Text>
                {daily.time?.slice(0, 5).map((date, i) => {
                  const d = new Date(date);
                  return (
                    <View key={i} style={styles.forecastRow}>
                      <Text style={styles.forecastDay}>{DAYS[d.getDay()]}</Text>
                      <Text style={styles.forecastEmoji}>{getWeatherEmoji(daily.weather_code[i])}</Text>
                      <Text style={styles.forecastDesc}>{getWeatherDescription(daily.weather_code[i])}</Text>
                      <Text style={styles.forecastTemp}>
                        {formatTemp(daily.temperature_2m_max[i])} / {formatTemp(daily.temperature_2m_min[i])}
                      </Text>
                    </View>
                  );
                })}
              </View>
            )}
          </>
        ) : (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Gagal memuat cuaca. Tarik untuk refresh.</Text>
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll:    { paddingHorizontal: 20, flexGrow: 1 },
  header:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  greeting:  { fontSize: 18, fontWeight: '700', color: '#fff', marginBottom: 4 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locationText: { fontSize: 13, color: 'rgba(255,255,255,0.7)' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 80 },
  loadingText: { color: 'rgba(255,255,255,0.6)', marginTop: 12, fontSize: 14 },
  mainCard:   { alignItems: 'center', marginBottom: 28 },
  weatherEmoji: { fontSize: 80, marginBottom: 8 },
  temperature: { fontSize: 72, fontWeight: '200', color: '#fff', marginBottom: 8 },
  description: { fontSize: 20, color: 'rgba(255,255,255,0.85)', fontWeight: '500', marginBottom: 4 },
  feelsLike:   { fontSize: 14, color: 'rgba(255,255,255,0.5)' },
  statsRow:   { flexDirection: 'row', gap: 12, marginBottom: 20 },
  statCard:   {
    flex: 1, backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16, padding: 16, alignItems: 'center', gap: 6,
  },
  statValue: { fontSize: 16, fontWeight: '700', color: '#fff' },
  statLabel: { fontSize: 11, color: 'rgba(255,255,255,0.6)' },
  forecastCard: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 20, padding: 20,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  forecastTitle: { fontSize: 15, fontWeight: '700', color: '#fff', marginBottom: 16 },
  forecastRow:   { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.07)' },
  forecastDay:   { width: 36, fontSize: 14, fontWeight: '600', color: '#fff' },
  forecastEmoji: { fontSize: 20, marginHorizontal: 8 },
  forecastDesc:  { flex: 1, fontSize: 13, color: 'rgba(255,255,255,0.7)' },
  forecastTemp:  { fontSize: 13, color: '#fff', fontWeight: '600' },
});
