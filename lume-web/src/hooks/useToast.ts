import { useState, useCallback } from 'react';
import type { ToastVariant } from '../components/layout/Toast';

export interface ToastMessage {
  id: string;
  message: string;
  variant: ToastVariant;
}

const useToast = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback(
    (message: string, variant: ToastVariant = 'info', duration?: number) => {
      const id = `toast-${Date.now()}-${Math.random()}`;
      const toast: ToastMessage = { id, message, variant };

      setToasts((prevToasts) => [...prevToasts, toast]);

      // Auto-remove toast after duration
      const timeout = setTimeout(() => {
        removeToast(id);
      }, duration || 4000);

      return () => clearTimeout(timeout);
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  const showError = useCallback(
    (message: string, duration?: number) => {
      addToast(message, 'error', duration);
    },
    [addToast]
  );

  const showWarning = useCallback(
    (message: string, duration?: number) => {
      addToast(message, 'warning', duration);
    },
    [addToast]
  );

  const showSuccess = useCallback(
    (message: string, duration?: number) => {
      addToast(message, 'success', duration);
    },
    [addToast]
  );

  const showInfo = useCallback(
    (message: string, duration?: number) => {
      addToast(message, 'info', duration);
    },
    [addToast]
  );

  return {
    toasts,
    addToast,
    removeToast,
    showError,
    showWarning,
    showSuccess,
    showInfo,
  };
};

export default useToast;
