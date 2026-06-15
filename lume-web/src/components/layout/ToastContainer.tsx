import React from 'react';
import Toast, { ToastVariant } from './Toast';
import './Toast.css';

export interface ToastMessage {
  id: string;
  message: string;
  variant: ToastVariant;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onClose: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onClose }) => {
  if (toasts.length === 0) {
    return null;
  }

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          id={toast.id}
          message={toast.message}
          variant={toast.variant}
          onClose={onClose}
        />
      ))}
    </div>
  );
};

export default ToastContainer;
