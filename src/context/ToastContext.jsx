'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info,
  X,
  Trash2,
  HelpCircle
} from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [dialog, setDialog] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Toast functions
  const addToast = useCallback((message, type = 'info', duration = 5000) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (msg, duration) => addToast(msg, 'success', duration),
    error: (msg, duration) => addToast(msg, 'error', duration),
    warning: (msg, duration) => addToast(msg, 'warning', duration),
    info: (msg, duration) => addToast(msg, 'info', duration)
  };

  // Promise-based confirmation dialog
  const confirm = useCallback(
    ({
      title = 'Are you sure?',
      message = '',
      confirmText = 'Confirm',
      cancelText = 'Cancel',
      type = 'danger' // 'danger' | 'warning' | 'primary'
    }) => {
      return new Promise((resolve) => {
        setDialog({
          title,
          message,
          confirmText,
          cancelText,
          type,
          onConfirm: () => {
            setDialog(null);
            resolve(true);
          },
          onCancel: () => {
            setDialog(null);
            resolve(false);
          }
        });
      });
    },
    []
  );

  return (
    <ToastContext.Provider value={{ toast, confirm }}>
      {children}

      {/* Floating Website Notifications (Mounted in Portal directly on document.body) */}
      {mounted &&
        createPortal(
          <div
            id="carrom-portal-toasts"
            style={{
              position: 'fixed',
              top: '24px',
              right: '24px',
              zIndex: 2147483647,
              pointerEvents: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              gap: '10px',
              width: 'auto',
              maxWidth: 'min(400px, calc(100vw - 32px))'
            }}
          >
            {toasts.map((t) => {
              const isSuccess = t.type === 'success';
              const isError = t.type === 'error';
              const isWarning = t.type === 'warning';

              return (
                <div
                  key={t.id}
                  style={{
                    pointerEvents: 'auto',
                    width: '100%',
                    minWidth: '280px',
                    maxWidth: '400px',
                    boxShadow: '0 12px 30px -4px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(213, 196, 161, 0.2)'
                  }}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl border backdrop-blur-xl transition-all duration-200 ${
                    isSuccess
                      ? 'bg-white dark:bg-[#15191C] border-emerald-300 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-300'
                      : isError
                      ? 'bg-white dark:bg-[#15191C] border-rose-300 dark:border-rose-800/60 text-rose-900 dark:text-rose-300'
                      : isWarning
                      ? 'bg-white dark:bg-[#15191C] border-amber-300 dark:border-amber-800/60 text-amber-900 dark:text-amber-300'
                      : 'bg-white dark:bg-[#15191C] border-[#D5C4A1] dark:border-[#2B3034] text-[#3E342B] dark:text-[#F5F1E8]'
                  }`}
                >
                  <div className="shrink-0">
                    {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
                    {isError && <XCircle className="w-5 h-5 text-[#E74C3C]" />}
                    {isWarning && <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
                    {!isSuccess && !isError && !isWarning && <Info className="w-5 h-5 text-[#E74C3C] dark:text-[#D4A94C]" />}
                  </div>

                  <div className="flex-1 text-xs sm:text-sm font-bold leading-snug break-words min-w-0">
                    {t.message}
                  </div>

                  <button
                    onClick={() => removeToast(t.id)}
                    className="shrink-0 p-1 text-[#7E7060] dark:text-[#B8B1A5] hover:text-[#3E342B] dark:hover:text-white rounded-lg transition-colors cursor-pointer -mr-1"
                    aria-label="Close notification"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>,
          document.body
        )}

      {/* Website Confirmation Dialog Modal (Mounted in Portal) */}
      {mounted &&
        dialog &&
        createPortal(
          <div
            id="carrom-portal-modal"
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 2147483647
            }}
            className="flex items-center justify-center p-4 bg-[#2C241E]/60 dark:bg-black/80 backdrop-blur-xs"
          >
            <div
              className="fixed inset-0"
              onClick={dialog.onCancel}
              aria-hidden="true"
            />
            <div className="relative w-full max-w-md bg-white dark:bg-[#15191C] border border-[#D5C4A1] dark:border-[#2B3034] rounded-2xl shadow-2xl p-6 sm:p-7 z-10 space-y-5 text-[#4A4238] dark:text-[#F5F1E8]">
              <div className="flex items-start gap-4">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border ${
                    dialog.type === 'danger'
                      ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800/50'
                      : dialog.type === 'warning'
                      ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/50'
                      : 'bg-[#FAF9F6] dark:bg-[#1B2024] text-[#E74C3C] border-[#D5C4A1] dark:border-[#2B3034]'
                  }`}
                >
                  {dialog.type === 'danger' ? (
                    <Trash2 className="w-6 h-6" />
                  ) : dialog.type === 'warning' ? (
                    <AlertTriangle className="w-6 h-6" />
                  ) : (
                    <HelpCircle className="w-6 h-6" />
                  )}
                </div>

                <div className="min-w-0 flex-1 space-y-1">
                  <h3 className="text-lg font-serif font-bold text-[#3E342B] dark:text-[#F5F1E8]">
                    {dialog.title}
                  </h3>
                  <p className="text-xs text-[#7E7060] dark:text-[#B8B1A5] leading-relaxed">
                    {dialog.message}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E8E1D5] dark:border-[#2B3034]">
                <button
                  type="button"
                  onClick={dialog.onCancel}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#7E7060] dark:text-[#B8B1A5] hover:text-[#3E342B] dark:hover:text-white transition-colors cursor-pointer"
                >
                  {dialog.cancelText}
                </button>

                <button
                  type="button"
                  onClick={dialog.onConfirm}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer uppercase tracking-wider ${
                    dialog.type === 'danger'
                      ? 'bg-[#E74C3C] hover:bg-[#C0392B] text-white shadow-xs'
                      : dialog.type === 'warning'
                      ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-xs'
                      : 'btn-primary'
                  }`}
                >
                  {dialog.confirmText}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context.toast;
}

export function useConfirm() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useConfirm must be used within a ToastProvider');
  }
  return context.confirm;
}

