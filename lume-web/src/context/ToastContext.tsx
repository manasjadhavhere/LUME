import React, { createContext, useContext, ReactNode } from 'react';
import useToast from '../hooks/useToast';
import type { ToastVariant } from '../components/layout/Toast';

interface ToastContextType {
  toasts: Array<{ id: string; message: string; variant: ToastVariant }>;
  addToast: (message: string, variant?: ToastVariant, duration?: number) => void;
  removeToast: (id: string) => void;
  showError: (message: string, duration?: number) => void;
  showWarning: (message: string, duration?: number) => void;
  showSuccess: (message: string, duration?: number) => void;
  showInfo: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const {
    toasts,
    addToast,
    removeToast,
    showError,
    showWarning,
    showSuccess,
    showInfo,
  } = useToast();

  return (
    <ToastContext.Provider
      value={{
        toasts,
        addToast,
        removeToast,
        showError,
        showWarning,
        showSuccess,
        showInfo,
      }}
    >
      {children}
    </ToastContext.Provider>
  );
};

export const useToastContext = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToastContext must be used within a ToastProvider');
  }
  return context;
};

export default ToastContext;
