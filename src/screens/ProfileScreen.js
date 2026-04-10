import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast';
import { useToast } from '../hooks/useToast';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { toast, showToast, hideToast } = useToast();
  const insets = useSafeAreaInsets();

  const handleLogout = async () => {
    const result = await logout();
    if (!result.success) showToast(result.message, 'error');
  };

  const initial = user?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?';

  return (
    <LinearGradient colors={['#0f0c29', '#302b63', '#24243e']} style={styles.container}>
      <Toast message={toast.message} type={toast.type} visible={toast.visible} onHide={hideToast} />
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Profil</Text>

        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
          <Text style={styles.displayName}>{user?.displayName || 'Pengguna SkyTrack'}</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>

        <View style={styles.section}>
          {[
            { icon: 'person-outline',      label: 'Nama',  value: user?.displayName || '-' },
            { icon: 'mail-outline',         label: 'Email', value: user?.email || '-' },
            { icon: 'shield-checkmark-outline', label: 'Status', value: user?.emailVerified ? 'Terverifikasi' : 'Belum Terverifikasi' },
          ].map((item, i) => (
            <View key={i} style={[styles.infoRow, i > 0 && styles.infoRowBorder]}>
              <Ionicons name={item.icon} size={20} color="rgba(255,255,255,0.5)" style={{ marginRight: 14 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.infoLabel}>{item.label}</Text>
                <Text style={styles.infoValue}>{item.value}</Text>
              </View>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
          <Ionicons name="log-out-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.logoutText}>Keluar</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll:    { paddingHorizontal: 20, flexGrow: 1 },
  title:     { fontSize: 24, fontWeight: '800', color: '#fff', marginBottom: 24 },
  profileCard: {
    backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 24,
    padding: 28, alignItems: 'center', marginBottom: 20,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  avatar:      { width: 80, height: 80, borderRadius: 40, backgroundColor: '#e94560', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  avatarText:  { fontSize: 32, fontWeight: '800', color: '#fff' },
  displayName: { fontSize: 20, fontWeight: '700', color: '#fff', marginBottom: 4 },
  email:       { fontSize: 14, color: 'rgba(255,255,255,0.5)' },
  section:     { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 20, marginBottom: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  infoRow:     { flexDirection: 'row', alignItems: 'center', padding: 18 },
  infoRowBorder: { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.07)' },
  infoLabel:   { fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 2 },
  infoValue:   { fontSize: 15, color: '#fff', fontWeight: '500' },
  logoutBtn:   {
    backgroundColor: '#e94560', borderRadius: 16, height: 52,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    shadowColor: '#e94560', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 8, elevation: 6,
  },
  logoutText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
