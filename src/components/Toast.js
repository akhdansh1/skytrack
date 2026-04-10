import React, { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet, View } from 'react-native';

const COLORS = {
  success: '#27AE60',
  error:   '#E74C3C',
  info:    '#2980B9',
  warning: '#F39C12',
};

export default function Toast({ message, type = 'info', visible, onHide }) {
  const translateY = useRef(new Animated.Value(-80)).current;
  const opacity    = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, { toValue: 0, useNativeDriver: true, tension: 80 }),
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(translateY, { toValue: -80, duration: 250, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0, duration: 250, useNativeDriver: true }),
        ]).start(() => onHide?.());
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!visible && opacity._value === 0) return null;

  return (
    <Animated.View style={[styles.container, { transform: [{ translateY }], opacity }]}>
      <View style={[styles.bar, { backgroundColor: COLORS[type] || COLORS.info }]} />
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute', top: 60, left: 20, right: 20, zIndex: 9999,
    backgroundColor: '#1e1e2e', borderRadius: 12, flexDirection: 'row',
    alignItems: 'center', overflow: 'hidden', elevation: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8,
  },
  bar:  { width: 4, alignSelf: 'stretch' },
  text: { color: '#fff', fontSize: 14, fontWeight: '500', paddingHorizontal: 14, paddingVertical: 14, flex: 1 },
});
