import { useState } from 'react';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from '../services/firebase';

GoogleSignin.configure({
  webClientId: '395840890810-i38lti626o72ocm9u9e0uslv4v64bb8m.apps.googleusercontent.com',
});

export function useGoogleAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const signInWithGoogle = async () => {
    setError(null);
    setLoading(true);
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      await GoogleSignin.signOut(); // paksa fresh login tiap kali

      const userInfo = await GoogleSignin.signIn();

      // handle berbagai struktur response versi lama & baru
      const idToken =
        userInfo?.data?.idToken ||
        userInfo?.idToken       ||
        userInfo?.user?.idToken ||
        null;

      if (!idToken) throw new Error('idToken tidak ditemukan');

      const credential = GoogleAuthProvider.credential(idToken);
      await signInWithCredential(auth, credential);

    } catch (e) {
      if (e.code === statusCodes.SIGN_IN_CANCELLED) {
        // user cancel, abaikan
      } else if (e.code === statusCodes.IN_PROGRESS) {
        setError('Sign-in sedang berjalan.');
      } else if (e.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        setError('Google Play Services tidak tersedia.');
      } else {
        setError(e.message ?? 'Google Sign-In gagal.');
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    signInWithGoogle,
    loading,
    error,
    isGoogleAvailable: true,
  };
}
