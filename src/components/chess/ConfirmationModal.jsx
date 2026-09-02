'use client';

import React from 'react';
import { AlertTriangle, Trash2, X, Loader2 } from 'lucide-react';

export function ConfirmationModal({
  isOpen,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed with this action?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDestructive = true,
  onConfirm,
  onCancel,
  loading = false,
  icon: CustomIcon
}) {
  if (!isOpen) return null;

  const IconComponent = CustomIcon || (isDestructive ? Trash2 : AlertTriangle);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#141B2D] border border-[#E2E8F0] dark:border-[#232A3B] rounded-2xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
        
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
              isDestructive 
                ? 'bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400' 
                : 'bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-[#C9A227] dark:text-[#D4AF37]'
            }`}>
              <IconComponent className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold font-display text-[#0F172A] dark:text-[#F8FAFC] uppercase tracking-wide">
                {title}
              </h3>
              <span className="text-[10px] font-mono uppercase text-[#64748B] dark:text-[#94A3B8] block font-semibold">
                Action Confirmation
              </span>
            </div>
          </div>

          <button
            onClick={onCancel}
            disabled={loading}
            className="text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#1A2337] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3.5 bg-slate-50 dark:bg-[#161F33] border border-[#E2E8F0] dark:border-[#232A3B] rounded-xl text-xs text-[#475569] dark:text-[#CBD5E1] leading-relaxed">
          {message}
        </div>

        <div className="flex items-center gap-3 justify-end pt-1">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl border border-[#CBD5E1] dark:border-[#334155] hover:bg-slate-100 dark:hover:bg-[#1E293B] text-[#0F172A] dark:text-[#F8FAFC] text-xs uppercase tracking-wider font-display font-bold transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider font-display transition-all disabled:opacity-50 shadow-sm ${
              isDestructive
                ? 'bg-red-600 hover:bg-red-500 active:bg-red-700 text-white'
                : 'bg-[#C9A227] hover:bg-[#b08d20] dark:bg-[#D4AF37] dark:hover:bg-[#C9A227] text-slate-950'
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
