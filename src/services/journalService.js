import {
  collection, addDoc, updateDoc, deleteDoc,
  doc, query, where, orderBy, onSnapshot, serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';

const COLLECTION = 'journal_entries';

export const subscribeJournal = (userId, callback) => {
  const q = query(
    collection(db, COLLECTION),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(q, snap => {
    const entries = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(entries);
  });
};

export const addJournalEntry = async (userId, data) => {
  await addDoc(collection(db, COLLECTION), {
    ...data, userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

export const updateJournalEntry = async (id, data) => {
  await updateDoc(doc(db, COLLECTION, id), {
    ...data, updatedAt: serverTimestamp()
  });
};

export const deleteJournalEntry = async (id) => {
  await deleteDoc(doc(db, COLLECTION, id));
};
