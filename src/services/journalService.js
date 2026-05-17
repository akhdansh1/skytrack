import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';

import { db } from './firebase';

const COLLECTION = 'journal_entries';

const validateUserId = (userId) => {
  if (!userId) {
    throw new Error('User ID tidak tersedia. Pastikan pengguna sudah login.');
  }
};

const getJournalContent = (data) => {
  return data?.content || data?.note || '';
};

const validateJournalData = (data) => {
  if (!data) {
    throw new Error('Data jurnal tidak boleh kosong.');
  }

  if (!data.title || data.title.trim() === '') {
    throw new Error('Judul jurnal wajib diisi.');
  }

  const content = getJournalContent(data);

  if (!content || content.trim() === '') {
    throw new Error('Isi jurnal wajib diisi.');
  }
};

export const subscribeJournal = (userId, callback, onError) => {
  validateUserId(userId);

  const q = query(
    collection(db, COLLECTION),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const entries = snapshot.docs.map((document) => ({
        id: document.id,
        ...document.data(),
      }));

      callback(entries);
    },
    (error) => {
      if (onError) {
        onError(error);
      } else {
        console.error('Gagal mengambil data jurnal:', error);
      }
    }
  );
};

export const subscribeJournalByMonth = (
  userId,
  month,
  year,
  callback,
  onError
) => {
  validateUserId(userId);

  if (!month || !year) {
    throw new Error('Bulan dan tahun wajib diisi.');
  }

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 1);

  const startTimestamp = Timestamp.fromDate(startDate);
  const endTimestamp = Timestamp.fromDate(endDate);

  const q = query(
    collection(db, COLLECTION),
    where('userId', '==', userId),
    where('journalDate', '>=', startTimestamp),
    where('journalDate', '<', endTimestamp),
    orderBy('journalDate', 'desc')
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const entries = snapshot.docs.map((document) => ({
        id: document.id,
        ...document.data(),
      }));

      callback(entries);
    },
    (error) => {
      if (onError) {
        onError(error);
      } else {
        console.error('Gagal mengambil jurnal berdasarkan bulan:', error);
      }
    }
  );
};

export const addJournalEntry = async (userId, data) => {
  try {
    validateUserId(userId);
    validateJournalData(data);

    const content = getJournalContent(data).trim();

    const journalDate = data.journalDate
      ? Timestamp.fromDate(new Date(data.journalDate))
      : Timestamp.fromDate(new Date());

    const docRef = await addDoc(collection(db, COLLECTION), {
      title: data.title.trim(),
      note: content,
      content,
      mood: data.mood || null,
      weather: data.weather || null,
      cityName: data.cityName || null,
      temperature: data.temperature || null,
      userId,
      journalDate,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return docRef.id;
  } catch (error) {
    throw new Error(error.message || 'Gagal menambahkan jurnal.');
  }
};

export const updateJournalEntry = async (id, data) => {
  try {
    if (!id) {
      throw new Error('ID jurnal tidak tersedia.');
    }

    if (!data) {
      throw new Error('Data pembaruan jurnal tidak boleh kosong.');
    }

    const updateData = {
      ...data,
      updatedAt: serverTimestamp(),
    };

    if (data.title) {
      updateData.title = data.title.trim();
    }

    if (data.note || data.content) {
      const content = getJournalContent(data).trim();
      updateData.note = content;
      updateData.content = content;
    }

    if (data.journalDate) {
      updateData.journalDate = Timestamp.fromDate(new Date(data.journalDate));
    }

    await updateDoc(doc(db, COLLECTION, id), updateData);

    return true;
  } catch (error) {
    throw new Error(error.message || 'Gagal memperbarui jurnal.');
  }
};

export const deleteJournalEntry = async (id) => {
  try {
    if (!id) {
      throw new Error('ID jurnal tidak tersedia.');
    }

    await deleteDoc(doc(db, COLLECTION, id));

    return true;
  } catch (error) {
    throw new Error(error.message || 'Gagal menghapus jurnal.');
  }
};