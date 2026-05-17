import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
} from 'react';

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  reload,
} from 'firebase/auth';

import { auth } from '../services/firebase';

const AuthContext = createContext(null);

const getAuthErrorMessage = (error) => {
  const code = error?.code;

  switch (code) {
    case 'auth/invalid-email':
      return 'Format email tidak valid.';
    case 'auth/user-disabled':
      return 'Akun pengguna telah dinonaktifkan.';
    case 'auth/user-not-found':
      return 'Akun tidak ditemukan.';
    case 'auth/wrong-password':
      return 'Password salah.';
    case 'auth/email-already-in-use':
      return 'Email sudah digunakan.';
    case 'auth/weak-password':
      return 'Password terlalu lemah. Gunakan minimal 6 karakter.';
    case 'auth/missing-password':
      return 'Password wajib diisi.';
    case 'auth/invalid-credential':
      return 'Email atau password tidak sesuai.';
    case 'auth/too-many-requests':
      return 'Terlalu banyak percobaan login. Silakan coba beberapa saat lagi.';
    case 'auth/network-request-failed':
      return 'Koneksi internet bermasalah. Periksa jaringan Anda.';
    default:
      return error?.message || 'Terjadi kesalahan autentikasi.';
  }
};

const validateEmail = (email) => {
  if (!email || email.trim() === '') {
    throw new Error('Email wajib diisi.');
  }

  const emailRegex = /\S+@\S+\.\S+/;

  if (!emailRegex.test(email.trim())) {
    throw new Error('Format email tidak valid.');
  }
};

const validatePassword = (password) => {
  if (!password || password.trim() === '') {
    throw new Error('Password wajib diisi.');
  }

  if (password.length < 6) {
    throw new Error('Password minimal 6 karakter.');
  }
};

const validateDisplayName = (displayName) => {
  if (!displayName || displayName.trim() === '') {
    throw new Error('Nama pengguna wajib diisi.');
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const refreshUser = async () => {
    try {
      if (!auth.currentUser) {
        setUser(null);
        return null;
      }

      await reload(auth.currentUser);
      setUser({ ...auth.currentUser });

      return auth.currentUser;
    } catch (error) {
      return null;
    }
  };

  const register = async (email, password, displayName) => {
    try {
      setAuthLoading(true);

      validateDisplayName(displayName);
      validateEmail(email);
      validatePassword(password);

      const credential = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      await updateProfile(credential.user, {
        displayName: displayName.trim(),
      });

      await refreshUser();

      return {
        success: true,
        user: auth.currentUser,
      };
    } catch (error) {
      return {
        success: false,
        message: getAuthErrorMessage(error),
      };
    } finally {
      setAuthLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setAuthLoading(true);

      validateEmail(email);
      validatePassword(password);

      const credential = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      setUser(credential.user);

      return {
        success: true,
        user: credential.user,
      };
    } catch (error) {
      return {
        success: false,
        message: getAuthErrorMessage(error),
      };
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = async () => {
    try {
      setAuthLoading(true);

      await signOut(auth);
      setUser(null);

      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        message: getAuthErrorMessage(error),
      };
    } finally {
      setAuthLoading(false);
    }
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      authLoading,
      isAuthenticated: !!user,
      register,
      login,
      logout,
      refreshUser,
    }),
    [user, loading, authLoading]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth harus digunakan di dalam AuthProvider.');
  }

  return context;
};