'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
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

  // Toast functions
  const addToast = useCallback((message, type = 'info', duration = 4000) => {
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

      {/* Floating Website Notifications (Toasts) */}
      <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((t) => {
          const isSuccess = t.type === 'success';
          const isError = t.type === 'error';
          const isWarning = t.type === 'warning';

          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl shadow-2xl border backdrop-blur-xl transition-all duration-300 animate-in slide-in-from-top-4 fade-in ${
                isSuccess
                  ? 'bg-[#152C3E]/95 border-emerald-500/40 text-emerald-200 shadow-emerald-950/40'
                  : isError
                  ? 'bg-[#2A1520]/95 border-rose-500/40 text-rose-200 shadow-rose-950/40'
                  : isWarning
                  ? 'bg-[#2A2315]/95 border-amber-500/40 text-amber-200 shadow-amber-950/40'
                  : 'bg-[#1E3258]/95 border-[#35538C] text-slate-200 shadow-[#0F1A30]/60'
              }`}
            >
              <div className="shrink-0 mt-0.5">
                {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                {isError && <XCircle className="w-5 h-5 text-rose-400" />}
                {isWarning && <AlertTriangle className="w-5 h-5 text-amber-400" />}
                {!isSuccess && !isError && !isWarning && <Info className="w-5 h-5 text-[#FFD691]" />}
              </div>

              <div className="flex-1 text-xs font-semibold leading-relaxed">
                {t.message}
              </div>

              <button
                onClick={() => removeToast(t.id)}
                className="shrink-0 text-slate-400 hover:text-white transition-colors p-1 -mr-1 -mt-1 cursor-pointer"
                aria-label="Close notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Website Confirmation Dialog Modal */}
      {dialog && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-[#0F1A30]/85 backdrop-blur-md animate-in fade-in duration-150">
          <div
            className="fixed inset-0"
            onClick={dialog.onCancel}
            aria-hidden="true"
          />
          <div className="relative w-full max-w-md bg-[#1E3258] border border-[#D7A859]/50 rounded-3xl shadow-2xl p-6 sm:p-7 z-10 animate-in zoom-in-95 duration-150 space-y-5">
            <div className="flex items-start gap-4">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                  dialog.type === 'danger'
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    : dialog.type === 'warning'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'bg-[#FFD691]/20 text-[#FFD691] border border-[#D7A859]/40'
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
                <h3 className="text-lg font-black font-display text-white">
                  {dialog.title}
                </h3>
                <p className="text-xs text-[#D4DEEE] leading-relaxed">
                  {dialog.message}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#35538C]">
              <button
                type="button"
                onClick={dialog.onCancel}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#D4DEEE] hover:text-white transition-colors cursor-pointer"
              >
                {dialog.cancelText}
              </button>

              <button
                type="button"
                onClick={dialog.onConfirm}
                className={`px-5 py-2.5 rounded-xl text-xs font-black shadow-lg transition-all cursor-pointer ${
                  dialog.type === 'danger'
                    ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/30'
                    : dialog.type === 'warning'
                    ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-900/30'
                    : 'btn-cream'
                }`}
              >
                {dialog.confirmText}
              </button>
            </div>
          </div>
        </div>
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
