'use client';

import { ToastProvider } from '@/context/ToastContext';
import ErrorBoundary from '@/components/ErrorBoundary';

export default function Providers({ children }) {
  return (
    <ToastProvider>
      <ErrorBoundary>
        {children}
      </ErrorBoundary>
    </ToastProvider>
  );
}
