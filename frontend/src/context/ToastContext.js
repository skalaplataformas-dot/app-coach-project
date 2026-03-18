'use client';
import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

let toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info') => {
    const id = ++toastId;
    setToasts(prev => [...prev.slice(-2), { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  const toast = {
    success: (msg) => addToast(msg, 'success'),
    error: (msg) => addToast(msg, 'error'),
    info: (msg) => addToast(msg, 'info'),
  };

  const borderColors = {
    success: 'border-l-[#00ff88]',
    error: 'border-l-red-400',
    info: 'border-l-cyan-400',
  };

  const textColors = {
    success: 'text-[#00ff88]',
    error: 'text-red-400',
    info: 'text-cyan-400',
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-4 right-4 left-4 md:left-auto md:w-80 z-50 space-y-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`bg-dark-800 border border-dark-500 border-l-4 ${borderColors[t.type]} rounded-xl px-4 py-3 shadow-lg animate-slide-up`}
          >
            <p className={`text-sm ${textColors[t.type]}`}>{t.message}</p>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
