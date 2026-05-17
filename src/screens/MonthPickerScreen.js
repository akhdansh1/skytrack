import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const months = [
  { id: 1, name: 'Januari' },
  { id: 2, name: 'Februari' },
  { id: 3, name: 'Maret' },
  { id: 4, name: 'April' },
  { id: 5, name: 'Mei' },
  { id: 6, name: 'Juni' },
  { id: 7, name: 'Juli' },
  { id: 8, name: 'Agustus' },
  { id: 9, name: 'September' },
  { id: 10, name: 'Oktober' },
  { id: 11, name: 'November' },
  { id: 12, name: 'Desember' },
];

export default function MonthPickerScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  const selectedMonth = route?.params?.selectedMonth || currentMonth;

  const [selectedYear, setSelectedYear] = useState(
    route?.params?.selectedYear || currentYear
  );

  const handleSelectMonth = (month) => {
    navigation.navigate('Main', {
      screen: 'Journal',
      params: {
        selectedMonth: month.id,
        selectedMonthName: month.name,
        selectedYear,
      },
    });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 16 }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.85}
        >
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </TouchableOpacity>

        <View style={styles.headerText}>
          <Text style={styles.title}>Pilih Bulan</Text>
          <Text style={styles.subtitle}>
            Pilih bulan dan tahun untuk menampilkan jurnal.
          </Text>
        </View>
      </View>

      <View style={styles.yearContainer}>
        <TouchableOpacity
          style={styles.yearButton}
          onPress={() => setSelectedYear(selectedYear - 1)}
          activeOpacity={0.85}
        >
          <Text style={styles.yearButtonText}>−</Text>
        </TouchableOpacity>

        <Text style={styles.yearText}>{selectedYear}</Text>

        <TouchableOpacity
          style={styles.yearButton}
          onPress={() => setSelectedYear(selectedYear + 1)}
          activeOpacity={0.85}
        >
          <Text style={styles.yearButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={months}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        contentContainerStyle={styles.monthList}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const isSelected =
            item.id === selectedMonth && selectedYear === route?.params?.selectedYear;

          return (
            <TouchableOpacity
              style={[
                styles.monthCard,
                isSelected && styles.monthCardActive,
              ]}
              onPress={() => handleSelectMonth(item)}
              activeOpacity={0.85}
            >
              <Text
                style={[
                  styles.monthText,
                  isSelected && styles.monthTextActive,
                ]}
              >
                {item.name}
              </Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0c29',
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  headerText: {
    flex: 1,
  },
  title: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    color: '#b8b8b8',
    fontSize: 14,
    marginTop: 8,
  },
  yearContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  yearButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#e94560',
    alignItems: 'center',
    justifyContent: 'center',
  },
  yearButtonText: {
    color: '#ffffff',
    fontSize: 26,
    fontWeight: '700',
  },
  yearText: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '700',
    marginHorizontal: 28,
  },
  monthList: {
    paddingBottom: 24,
  },
  monthCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    margin: 8,
    paddingVertical: 24,
    borderRadius: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  monthCardActive: {
    backgroundColor: 'rgba(233,69,96,0.3)',
    borderColor: '#e94560',
  },
  monthText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  monthTextActive: {
    color: '#ffffff',
    fontWeight: '800',
  },
});