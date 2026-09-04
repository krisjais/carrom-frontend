'use client';

import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export function ConfirmationModal({
  isOpen,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed with this action?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDestructive = true,
  onConfirm,
  onCancel,
  loading = false
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#FAF8F3] dark:bg-[#151514] border border-[#D5CFC5] dark:border-[#262624] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6">
        
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
              isDestructive ? 'bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400' : 'bg-[#EFEAE1] dark:bg-[#1D1D1B] border border-[#D5CFC5] dark:border-[#262624] text-[#171715] dark:text-[#FAF8F3]'
            }`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold font-serif text-[#171715] dark:text-[#FAF8F3]">{title}</h3>
          </div>
          <button
            onClick={onCancel}
            disabled={loading}
            className="text-[#77736B] hover:text-[#171715] dark:text-[#8E8E93] dark:hover:text-[#FAF8F3] p-1 rounded-lg hover:bg-[#EFEAE1] dark:hover:bg-[#1D1D1B]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-[#4E4C47] dark:text-[#9E9B93] leading-relaxed">
          {message}
        </p>

        <div className="flex items-center gap-3 justify-end pt-2">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl border border-[#D5CFC5] dark:border-[#262624] hover:bg-[#EFEAE1] dark:hover:bg-[#1D1D1B] text-[#171715] dark:text-[#FAF8F3] text-xs uppercase tracking-wider font-mono font-medium transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-6 py-2.5 rounded-xl font-medium text-xs uppercase tracking-wider font-mono transition-all ${
              isDestructive
                ? 'bg-red-600 hover:bg-red-700 text-white shadow-xs'
                : 'bg-[#22221F] dark:bg-[#FAF8F3] hover:bg-[#000000] dark:hover:bg-[#FFFFFF] text-[#FAF8F3] dark:text-[#0D0D0D] shadow-xs'
            }`}
          >
            {loading ? 'Processing...' : confirmText}
          </button>
        </div>

      </div>
    </div>
  );
}
