import { useState, useCallback } from 'react';

const initialToastState = {
  visible: false,
  message: '',
  type: 'info',
  duration: 2500,
};

export function useToast() {
  const [toast, setToast] = useState(initialToastState);

  const showToast = useCallback((message, type = 'info', duration = 2500) => {
    if (!message) return;

    setToast({
      visible: true,
      message,
      type,
      duration,
    });
  }, []);

  const hideToast = useCallback(() => {
    setToast((prev) => ({
      ...prev,
      visible: false,
    }));

    setTimeout(() => {
      setToast(initialToastState);
    }, 300);
  }, []);

  const showSuccess = useCallback(
    (message, duration) => {
      showToast(message, 'success', duration);
    },
    [showToast]
  );

  const showError = useCallback(
    (message, duration) => {
      showToast(message, 'error', duration);
    },
    [showToast]
  );

  const showInfo = useCallback(
    (message, duration) => {
      showToast(message, 'info', duration);
    },
    [showToast]
  );

  const showWarning = useCallback(
    (message, duration) => {
      showToast(message, 'warning', duration);
    },
    [showToast]
  );

  return {
    toast,
    showToast,
    hideToast,
    showSuccess,
    showError,
    showInfo,
    showWarning,
  };
}