import { useCallback, useState } from 'react';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from '../services/firebase';

const WEB_CLIENT_ID =
  '395840890810-i38lti626o72ocm9u9e0uslv4v64bb8m.apps.googleusercontent.com';

let isConfigured = false;

const configureGoogleSignIn = () => {
  if (isConfigured) return;

  GoogleSignin.configure({
    webClientId: WEB_CLIENT_ID,
    offlineAccess: false,
    forceCodeForRefreshToken: false,
  });

  isConfigured = true;
};

const getGoogleErrorMessage = (error) => {
  if (error?.code === statusCodes.SIGN_IN_CANCELLED) {
    return 'Login Google dibatalkan.';
  }

  if (error?.code === statusCodes.IN_PROGRESS) {
    return 'Proses login Google sedang berjalan.';
  }

  if (error?.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
    return 'Google Play Services tidak tersedia atau perlu diperbarui.';
  }

  return error?.message || 'Google Sign-In gagal.';
};

const extractIdToken = (userInfo) => {
  return (
    userInfo?.data?.idToken ||
    userInfo?.idToken ||
    userInfo?.user?.idToken ||
    null
  );
};

export function useGoogleAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const checkGoogleAvailable = useCallback(async () => {
    try {
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });

      return true;
    } catch {
      return false;
    }
  }, []);

  const signInWithGoogle = useCallback(async () => {
    setError(null);
    setLoading(true);

    try {
      configureGoogleSignIn();

      const available = await checkGoogleAvailable();

      if (!available) {
        throw new Error('Google Play Services tidak tersedia.');
      }

      /**
       * Catatan:
       * Jangan paksa GoogleSignin.signOut() setiap login,
       * karena itu membuat pengguna harus memilih akun terus-menerus.
       *
       * Jika ingin selalu memilih akun baru, aktifkan baris ini:
       * await GoogleSignin.signOut();
       */

      const userInfo = await GoogleSignin.signIn();
      const idToken = extractIdToken(userInfo);

      if (!idToken) {
        throw new Error('ID Token Google tidak ditemukan.');
      }

      const credential = GoogleAuthProvider.credential(idToken);
      const firebaseCredential = await signInWithCredential(auth, credential);

      return {
        success: true,
        user: firebaseCredential.user,
      };
    } catch (err) {
      const message = getGoogleErrorMessage(err);

      if (err?.code !== statusCodes.SIGN_IN_CANCELLED) {
        setError(message);
      }

      return {
        success: false,
        message,
        cancelled: err?.code === statusCodes.SIGN_IN_CANCELLED,
      };
    } finally {
      setLoading(false);
    }
  }, [checkGoogleAvailable]);

  const signOutGoogle = useCallback(async () => {
    try {
      configureGoogleSignIn();

      const isSignedIn = await GoogleSignin.isSignedIn();

      if (isSignedIn) {
        await GoogleSignin.signOut();
      }

      return {
        success: true,
      };
    } catch (err) {
      const message = err?.message || 'Gagal logout dari akun Google.';

      setError(message);

      return {
        success: false,
        message,
      };
    }
  }, []);

  return {
    signInWithGoogle,
    signOutGoogle,
    checkGoogleAvailable,
    loading,
    error,
    isGoogleAvailable: true,
  };
}