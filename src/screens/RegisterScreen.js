import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast';
import { useToast } from '../hooks/useToast';

export default function RegisterScreen({ navigation }) {
  const [name, setName]               = useState('');
  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading]     = useState(false);
  const { register } = useAuth();
  const { toast, showToast, hideToast } = useToast();
  const insets = useSafeAreaInsets();

  const handleRegister = async () => {
    if (!name.trim())     { showToast('Nama harus diisi', 'error'); return; }
    if (!email.trim())    { showToast('Email harus diisi', 'error'); return; }
    if (password.length < 6) { showToast('Password minimal 6 karakter', 'error'); return; }
    setIsLoading(true);
    const result = await register(email.trim(), password, name.trim());
    setIsLoading(false);
    if (!result.success) showToast(result.message, 'error');
    else showToast('Akun berhasil dibuat! 🎉', 'success');
  };

  return (
    <LinearGradient colors={['#0f0c29', '#302b63', '#24243e']} style={styles.container}>
      <Toast message={toast.message} type={toast.type} visible={toast.visible} onHide={hideToast} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>Buat Akun</Text>
            <Text style={styles.subtitle}>Daftar untuk mulai menggunakan SkyTrack</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>Nama Lengkap</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="person-outline" size={18} color="#888" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Nama kamu"
                placeholderTextColor="#555"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                returnKeyType="next"
              />
            </View>

            <Text style={styles.label}>Email</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={18} color="#888" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="email@contoh.com"
                placeholderTextColor="#555"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
              />
            </View>

            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={18} color="#888" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Minimal 6 karakter"
                placeholderTextColor="#555"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                returnKeyType="done"
                onSubmitEditing={handleRegister}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={18} color="#888" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.primaryBtn, isLoading && styles.btnDisabled]}
              onPress={handleRegister}
              disabled={isLoading}
              activeOpacity={0.85}
            >
              {isLoading
                ? <ActivityIndicator color="#fff" size="small" />
                : <Text style={styles.primaryBtnText}>Daftar Sekarang</Text>
              }
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            style={styles.bottomLink}
            activeOpacity={0.7}
          >
            <Text style={styles.bottomLinkText}>Sudah punya akun? </Text>
            <Text style={[styles.bottomLinkText, styles.bottomLinkBold]}>Masuk</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 24, flexGrow: 1 },
  backBtn: { marginBottom: 24, alignSelf: 'flex-start', padding: 4 },
  header: { marginBottom: 28 },
  title:    { fontSize: 28, fontWeight: '800', color: '#fff', marginBottom: 8 },
  subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.5)' },
  card: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 24, padding: 24,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    marginBottom: 20,
  },
  label: { color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: '500', marginBottom: 8, marginTop: 4 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 14, borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 14, marginBottom: 16, minHeight: 52,
  },
  inputIcon: { marginRight: 10 },
  input:     { flex: 1, color: '#fff', fontSize: 15, paddingVertical: 14 },
  eyeBtn:    { padding: 4 },
  primaryBtn: {
    backgroundColor: '#e94560', borderRadius: 14,
    height: 52, justifyContent: 'center', alignItems: 'center',
    marginTop: 4,
    shadowColor: '#e94560', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 8, elevation: 6,
  },
  primaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  btnDisabled:    { opacity: 0.6 },
  bottomLink:     { flexDirection: 'row', justifyContent: 'center', paddingVertical: 8 },
  bottomLinkText: { color: 'rgba(255,255,255,0.5)', fontSize: 14 },
  bottomLinkBold: { color: '#e94560', fontWeight: '700' },
});
