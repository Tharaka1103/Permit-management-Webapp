'use client';

import React, { createContext, useContext } from 'react';
import { toast, Toaster } from 'sonner';

interface ToastContextType {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  warning: (message: string) => void;
  loading: (message: string) => string | number;
  dismiss: (id?: string | number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const success = (message: string) => {
    toast.success(message, {
      duration: 4000,
    });
  };

  const error = (message: string) => {
    toast.error(message, {
      duration: 5000,
    });
  };

  const info = (message: string) => {
    toast.info(message, {
      duration: 4000,
    });
  };

  const warning = (message: string) => {
    toast.warning(message, {
      duration: 4000,
    });
  };

  const loading = (message: string) => {
    return toast.loading(message);
  };

  const dismiss = (id?: string | number) => {
    if (id) {
      toast.dismiss(id);
    } else {
      toast.dismiss();
    }
  };

  const value = {
    success,
    error,
    info,
    warning,
    loading,
    dismiss,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Toaster 
        position="bottom-right" 
        richColors 
        closeButton
        toastOptions={{
          style: {
            fontSize: '14px',
          },
        }}
      />
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
