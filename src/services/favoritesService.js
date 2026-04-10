import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

export const getFavorites = async (userId) => {
  const ref  = doc(db, 'user_favorites', userId);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data().cities || [] : [];
};

export const saveFavorites = async (userId, cities) => {
  const ref = doc(db, 'user_favorites', userId);
  await setDoc(ref, { cities });
};
