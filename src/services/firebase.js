import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  initializeAuth,
  getAuth,
  getReactNativePersistence,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: 'AIzaSyDGR422Ypw7tyj12-Pr0Vn9M3CzRV0mER4',
  authDomain: 'skytrack-271d0.firebaseapp.com',
  projectId: 'skytrack-271d0',
  storageBucket: 'skytrack-271d0.firebasestorage.app',
  messagingSenderId: '395840890810',
  appId: '1:395840890810:web:2842d3afa7fbe2a8335f83',
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

let auth;

try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (error) {
  auth = getAuth(app);
}

const db = getFirestore(app);

export { app, auth, db };