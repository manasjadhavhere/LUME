import React, { useEffect, useState, useRef } from 'react';
import { AlertCircle, CheckCircle, AlertTriangle, Info, X } from 'lucide-react';
import './Toast.css';

export type ToastVariant = 'error' | 'warning' | 'success' | 'info';

export interface ToastProps {
  id: string;
  message: string;
  variant?: ToastVariant;
  duration?: number;
  onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({
  id,
  message,
  variant = 'info',
  duration = 4000,
  onClose,
}) => {
  const [isExiting, setIsExiting] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startXRef = useRef(0);
  const currentXRef = useRef(0);

  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => {
        onClose(id);
      }, 300);
    }, duration);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [id, duration, onClose]);

  const handleTouchStart = (e: React.TouchEvent) => {
    startXRef.current = e.touches[0].clientX;
    currentXRef.current = 0;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const currentX = e.touches[0].clientX;
    currentXRef.current = currentX - startXRef.current;
  };

  const handleTouchEnd = () => {
    if (currentXRef.current > 100 || currentXRef.current < -100) {
      setIsExiting(true);
      setTimeout(() => {
        onClose(id);
      }, 300);
    }
    currentXRef.current = 0;
  };

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose(id);
    }, 300);
  };

  const getIcon = () => {
    switch (variant) {
      case 'error':
        return <AlertCircle size={20} />;
      case 'warning':
        return <AlertTriangle size={20} />;
      case 'success':
        return <CheckCircle size={20} />;
      case 'info':
      default:
        return <Info size={20} />;
    }
  };

  return (
    <div
      className={`toast toast--${variant} ${isExiting ? 'toast--exiting' : ''}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        transform: `translateX(${currentXRef.current}px)`,
      }}
      role="alert"
      aria-live="polite"
    >
      <div className="toast__content">
        <div className="toast__icon">{getIcon()}</div>
        <p className="toast__message">{message}</p>
      </div>
      <button
        className="toast__close-btn"
        onClick={handleClose}
        aria-label="Close notification"
      >
        <X size={18} />
      </button>
    </div>
  );
};

export default Toast;
