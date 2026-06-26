import { createContext, useContext, useState, useCallback, useRef } from 'react';
import ToastContainer from './Toast.jsx';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const counterRef = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback((message, type = 'info', duration = 4000) => {
    const id = ++counterRef.current;
    setToasts((prev) => [...prev.slice(-4), { id, message, type }]);
    if (duration > 0) setTimeout(() => dismiss(id), duration);
    return id;
  }, [dismiss]);

  const toast = {
    success: (msg, dur) => show(msg, 'success', dur),
    error: (msg, dur) => show(msg, 'error', dur ?? 6000),
    info: (msg, dur) => show(msg, 'info', dur),
    warning: (msg, dur) => show(msg, 'warning', dur),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
