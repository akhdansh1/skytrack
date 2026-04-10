import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDGR422Ypw7tyj12-Pr0Vn9M3CzRV0mER4",
  authDomain: "skytrack-271d0.firebaseapp.com",
  projectId: "skytrack-271d0",
  storageBucket: "skytrack-271d0.firebasestorage.app",
  messagingSenderId: "395840890810",
  appId: "1:395840890810:web:2842d3afa7fbe2a8335f83"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
export const db = getFirestore(app);
