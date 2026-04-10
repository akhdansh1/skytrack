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
import { useGoogleAuth } from '../hooks/useGoogleAuth';

export default function LoginScreen({ navigation }) {
  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading]     = useState(false);
  const { login } = useAuth();
  const { toast, showToast, hideToast } = useToast();
  const insets = useSafeAreaInsets();
  const { signInWithGoogle, loading: googleLoading, isGoogleAvailable } = useGoogleAuth();

  const handleLogin = async () => {
    if (!email.trim()) { showToast('Email harus diisi', 'error'); return; }
    if (!password)     { showToast('Password harus diisi', 'error'); return; }
    setIsLoading(true);
    const result = await login(email.trim(), password);
    setIsLoading(false);
    if (!result.success) showToast(result.message, 'error');
    else showToast('Selamat datang kembali! 👋', 'success');
  };

  const handleGoogleLogin = async () => {
    if (!isGoogleAvailable) { showToast('Google Sign-In tidak tersedia', 'error'); return; }
    await signInWithGoogle();
  };

  return (
    <LinearGradient colors={['#0f0c29', '#302b63', '#24243e']} style={styles.container}>
      <Toast message={toast.message} type={toast.type} visible={toast.visible} onHide={hideToast} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 32, paddingBottom: insets.bottom + 24 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <Text style={styles.iconEmoji}>🌤️</Text>
            </View>
            <Text style={styles.appName}>SkyTrack</Text>
            <Text style={styles.tagline}>Cuaca real-time di genggaman Anda</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Masuk ke Akun</Text>

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
                onSubmitEditing={handleLogin}
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
              onPress={handleLogin}
              disabled={isLoading}
              activeOpacity={0.85}
            >
              {isLoading
                ? <ActivityIndicator color="#fff" size="small" />
                : <Text style={styles.primaryBtnText}>Masuk</Text>
              }
            </TouchableOpacity>

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>atau</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              style={[styles.googleBtn, (googleLoading || !isGoogleAvailable) && styles.btnDisabled]}
              onPress={handleGoogleLogin}
              disabled={googleLoading || !isGoogleAvailable}
              activeOpacity={0.85}
            >
              {googleLoading
                ? <ActivityIndicator color="#333" size="small" />
                : <>
                    <Text style={styles.googleIcon}>G</Text>
                    <Text style={styles.googleBtnText}>Masuk dengan Google</Text>
                  </>
              }
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={() => navigation.navigate('Register')}
            style={styles.bottomLink}
            activeOpacity={0.7}
          >
            <Text style={styles.bottomLinkText}>Belum punya akun? </Text>
            <Text style={[styles.bottomLinkText, styles.bottomLinkBold]}>Daftar sekarang</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 24, flexGrow: 1, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 32 },
  iconCircle: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },
  iconEmoji: { fontSize: 44 },
  appName:   { fontSize: 34, fontWeight: '800', color: '#fff', letterSpacing: 0.5, marginBottom: 6 },
  tagline:   { fontSize: 14, color: 'rgba(255,255,255,0.5)', textAlign: 'center' },
  card: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 24, padding: 24,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    marginBottom: 20,
  },
  cardTitle:    { fontSize: 18, fontWeight: '700', color: '#fff', marginBottom: 20 },
  label:        { color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: '500', marginBottom: 8, marginTop: 4 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 14, borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 14, marginBottom: 16, minHeight: 52,
  },
  inputIcon:       { marginRight: 10 },
  input:           { flex: 1, color: '#fff', fontSize: 15, paddingVertical: 14 },
  eyeBtn:          { padding: 4 },
  primaryBtn: {
    backgroundColor: '#e94560', borderRadius: 14,
    height: 52, justifyContent: 'center', alignItems: 'center',
    marginTop: 4, marginBottom: 20,
    shadowColor: '#e94560', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 8, elevation: 6,
  },
  primaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  btnDisabled:    { opacity: 0.6 },
  dividerRow:     { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  dividerLine:    { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.1)' },
  dividerText:    { color: 'rgba(255,255,255,0.4)', fontSize: 13, marginHorizontal: 12 },
  googleBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#ffffff', borderRadius: 14, height: 52, gap: 10,
  },
  googleIcon:     { fontSize: 18, fontWeight: '800', color: '#4285F4' },
  googleBtnText:  { color: '#333', fontWeight: '600', fontSize: 15 },
  bottomLink:     { flexDirection: 'row', justifyContent: 'center', paddingVertical: 8 },
  bottomLinkText: { color: 'rgba(255,255,255,0.5)', fontSize: 14 },
  bottomLinkBold: { color: '#e94560', fontWeight: '700' },
});
