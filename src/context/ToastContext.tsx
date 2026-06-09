import { createContext, useContext, useCallback, useState, useRef, type ReactNode } from 'react';
import type { Toast, ToastType } from '@/types';

interface ToastContextType {
  toasts: Toast[];
  addToast: (message: string, type: ToastType, undo?: () => void) => void;
  dismissToast: (id: string) => void;
  dismissAll: () => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const dismissToast = useCallback((id: string) => {
    if (timersRef.current[id]) {
      clearTimeout(timersRef.current[id]);
      delete timersRef.current[id];
    }
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message: string, type: ToastType, undo?: () => void) => {
    const id = Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
    const toast: Toast = { id, type, message, undo };

    setToasts((prev) => {
      const updated = [...prev, toast];
      if (updated.length > 3) {
        const removed = updated.shift();
        if (removed) dismissToast(removed.id);
      }
      return updated;
    });

    timersRef.current[id] = setTimeout(() => {
      dismissToast(id);
    }, 4000);
  }, [dismissToast]);

  const dismissAll = useCallback(() => {
    Object.values(timersRef.current).forEach(clearTimeout);
    timersRef.current = {};
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, dismissToast, dismissAll }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToastContext() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToastContext must be used within ToastProvider');
  return ctx;
}
