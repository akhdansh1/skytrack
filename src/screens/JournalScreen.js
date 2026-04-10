import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Modal, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { subscribeJournal, addJournalEntry, updateJournalEntry, deleteJournalEntry } from '../services/journalService';
import Toast from '../components/Toast';
import { useToast } from '../hooks/useToast';

const MOODS = [
  { emoji: '☀️', label: 'Cerah' }, { emoji: '⛅', label: 'Berawan' },
  { emoji: '🌧️', label: 'Hujan' }, { emoji: '⛈️', label: 'Badai' },
  { emoji: '❄️', label: 'Dingin' }, { emoji: '🌫️', label: 'Berkabut' },
];

export default function JournalScreen() {
  const { user } = useAuth();
  const insets   = useSafeAreaInsets();
  const { toast, showToast, hideToast } = useToast();
  const [entries, setEntries]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [modal, setModal]       = useState(false);
  const [editing, setEditing]   = useState(null);
  const [title, setTitle]       = useState('');
  const [note, setNote]         = useState('');
  const [mood, setMood]         = useState(MOODS[0]);
  const [saving, setSaving]     = useState(false);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeJournal(user.uid, data => {
      setEntries(data);
      setLoading(false);
    });
    return unsub;
  }, [user]);

  const openAdd = () => {
    setEditing(null); setTitle(''); setNote(''); setMood(MOODS[0]); setModal(true);
  };

  const openEdit = (entry) => {
    setEditing(entry);
    setTitle(entry.title);
    setNote(entry.note);
    setMood(entry.mood || MOODS[0]);
    setModal(true);
  };

  const handleSave = async () => {
    if (!title.trim()) { showToast('Judul harus diisi', 'error'); return; }
    setSaving(true);
    try {
      if (editing) {
        await updateJournalEntry(editing.id, { title: title.trim(), note: note.trim(), mood });
        showToast('Catatan diperbarui ✅', 'success');
      } else {
        await addJournalEntry(user.uid, { title: title.trim(), note: note.trim(), mood });
        showToast('Catatan ditambahkan 📝', 'success');
      }
      setModal(false);
    } catch (e) {
      showToast(e.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteJournalEntry(id);
      showToast('Catatan dihapus', 'info');
    } catch (e) {
      showToast(e.message, 'error');
    }
  };

  const formatDate = (ts) => {
    if (!ts) return '';
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <LinearGradient colors={['#0f0c29', '#302b63', '#24243e']} style={styles.container}>
      <Toast message={toast.message} type={toast.type} visible={toast.visible} onHide={hideToast} />
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 80 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Jurnal Cuaca</Text>
          <TouchableOpacity style={styles.addBtn} onPress={openAdd} activeOpacity={0.85}>
            <Ionicons name="add" size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.center}><ActivityIndicator size="large" color="#e94560" /></View>
        ) : entries.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>📓</Text>
            <Text style={styles.emptyText}>Belum ada catatan</Text>
            <Text style={styles.emptyHint}>Tap tombol + untuk menambah catatan cuaca harian</Text>
          </View>
        ) : (
          entries.map(entry => (
            <View key={entry.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.moodEmoji}>{entry.mood?.emoji}</Text>
                <View style={styles.cardMeta}>
                  <Text style={styles.cardTitle}>{entry.title}</Text>
                  <Text style={styles.cardDate}>{formatDate(entry.createdAt)}</Text>
                </View>
                <View style={styles.cardActions}>
                  <TouchableOpacity onPress={() => openEdit(entry)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Ionicons name="pencil-outline" size={18} color="rgba(255,255,255,0.5)" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(entry.id)} style={{ marginLeft: 12 }} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Ionicons name="trash-outline" size={18} color="#e94560" />
                  </TouchableOpacity>
                </View>
              </View>
              {entry.note ? <Text style={styles.cardNote}>{entry.note}</Text> : null}
              <Text style={styles.moodLabel}>{entry.mood?.label}</Text>
            </View>
          ))
        )}
      </ScrollView>

      {/* Modal Form */}
      <Modal visible={modal} animationType="slide" transparent onRequestClose={() => setModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editing ? 'Edit Catatan' : 'Catatan Baru'}</Text>
              <TouchableOpacity onPress={() => setModal(false)}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalLabel}>Mood Cuaca</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
              {MOODS.map(m => (
                <TouchableOpacity
                  key={m.label}
                  style={[styles.moodChip, mood.label === m.label && styles.moodChipActive]}
                  onPress={() => setMood(m)}
                >
                  <Text style={styles.moodChipEmoji}>{m.emoji}</Text>
                  <Text style={styles.moodChipLabel}>{m.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.modalLabel}>Judul</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Judul catatan..."
              placeholderTextColor="#555"
              value={title}
              onChangeText={setTitle}
              maxLength={60}
            />

            <Text style={styles.modalLabel}>Catatan</Text>
            <TextInput
              style={[styles.modalInput, styles.modalTextarea]}
              placeholder="Tulis catatan cuaca hari ini..."
              placeholderTextColor="#555"
              value={note}
              onChangeText={setNote}
              multiline
              maxLength={300}
              textAlignVertical="top"
            />

            <TouchableOpacity
              style={[styles.saveBtn, saving && { opacity: 0.6 }]}
              onPress={handleSave}
              disabled={saving}
              activeOpacity={0.85}
            >
              {saving
                ? <ActivityIndicator color="#fff" size="small" />
                : <Text style={styles.saveBtnText}>{editing ? 'Simpan Perubahan' : 'Tambah Catatan'}</Text>
              }
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll:    { paddingHorizontal: 20, flexGrow: 1 },
  header:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title:     { fontSize: 24, fontWeight: '800', color: '#fff' },
  addBtn:    { backgroundColor: '#e94560', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  center:    { paddingTop: 60, alignItems: 'center' },
  empty:     { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 80 },
  emptyEmoji: { fontSize: 48, marginBottom: 16 },
  emptyText:  { fontSize: 18, fontWeight: '700', color: '#fff', marginBottom: 8 },
  emptyHint:  { fontSize: 14, color: 'rgba(255,255,255,0.4)', textAlign: 'center' },
  card: {
    backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 16,
    padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  cardHeader:  { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  moodEmoji:   { fontSize: 28, marginRight: 12 },
  cardMeta:    { flex: 1 },
  cardTitle:   { fontSize: 16, fontWeight: '700', color: '#fff', marginBottom: 2 },
  cardDate:    { fontSize: 12, color: 'rgba(255,255,255,0.4)' },
  cardActions: { flexDirection: 'row', alignItems: 'center' },
  cardNote:    { fontSize: 14, color: 'rgba(255,255,255,0.65)', lineHeight: 20, marginBottom: 8 },
  moodLabel:   { fontSize: 12, color: '#e94560', fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalCard:   { backgroundColor: '#1a1a2e', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 36 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle:  { fontSize: 18, fontWeight: '700', color: '#fff' },
  modalLabel:  { fontSize: 13, color: 'rgba(255,255,255,0.5)', fontWeight: '500', marginBottom: 8 },
  modalInput:  {
    backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 12,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
    color: '#fff', fontSize: 15, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 16,
  },
  modalTextarea: { height: 100 },
  moodChip:      { alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 12, padding: 10, marginRight: 8, minWidth: 60, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  moodChipActive: { backgroundColor: 'rgba(233,69,96,0.3)', borderColor: '#e94560' },
  moodChipEmoji:  { fontSize: 22, marginBottom: 4 },
  moodChipLabel:  { fontSize: 11, color: '#fff' },
  saveBtn:   { backgroundColor: '#e94560', borderRadius: 14, height: 52, justifyContent: 'center', alignItems: 'center' },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
