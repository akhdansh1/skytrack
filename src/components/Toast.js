import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Animated,
  Text,
  StyleSheet,
  View,
  TouchableOpacity,
} from 'react-native';

const COLORS = {
  success: '#27AE60',
  error: '#E74C3C',
  info: '#2980B9',
  warning: '#F39C12',
};

const ICONS = {
  success: '✓',
  error: '✕',
  info: 'i',
  warning: '!',
};

const LABELS = {
  success: 'Berhasil',
  error: 'Gagal',
  info: 'Informasi',
  warning: 'Peringatan',
};

export default function Toast({
  message,
  type = 'info',
  visible,
  onHide,
  duration = 2500,
}) {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const [shouldRender, setShouldRender] = useState(visible);

  const toastColor = COLORS[type] || COLORS.info;
  const toastIcon = ICONS[type] || ICONS.info;
  const toastLabel = LABELS[type] || LABELS.info;

  const hideToast = useCallback(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShouldRender(false);
      onHide?.();
    });
  }, [translateY, opacity, onHide]);

  useEffect(() => {
    let timer;

    if (visible && message) {
      setShouldRender(true);

      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 80,
          friction: 9,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      timer = setTimeout(() => {
        hideToast();
      }, duration);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [visible, message, duration, translateY, opacity, hideToast]);

  if (!shouldRender || !message) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <View style={[styles.bar, { backgroundColor: toastColor }]} />

      <View style={[styles.iconBox, { backgroundColor: toastColor }]}>
        <Text style={styles.iconText}>{toastIcon}</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.label}>{toastLabel}</Text>
        <Text style={styles.text}>{message}</Text>
      </View>

      <TouchableOpacity onPress={hideToast} style={styles.closeButton}>
        <Text style={styles.closeText}>×</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    zIndex: 9999,
    backgroundColor: '#1e1e2e',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  bar: {
    width: 5,
    alignSelf: 'stretch',
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginLeft: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  label: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  text: {
    color: '#dcdcdc',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 19,
  },
  closeButton: {
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  closeText: {
    color: '#ffffff',
    fontSize: 22,
    lineHeight: 22,
  },
});