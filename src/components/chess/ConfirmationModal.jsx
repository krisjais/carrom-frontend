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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#14171A] border border-[#2A313C] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6">
        
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
              isDestructive ? 'bg-red-950/80 border border-red-500/40 text-red-400' : 'bg-[#1F242C] border border-[#F2C94C]/40 text-[#F2C94C]'
            }`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold font-display text-[#F5F1E8]">{title}</h3>
          </div>
          <button
            onClick={onCancel}
            disabled={loading}
            className="text-[#9BB0D3] hover:text-[#F5F1E8] p-1 rounded-lg hover:bg-[#1A1E24]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-[#9BB0D3] leading-relaxed">
          {message}
        </p>

        <div className="flex items-center gap-3 justify-end pt-2">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl border border-[#2A313C] hover:bg-[#1A1E24] text-[#F5F1E8] text-xs uppercase tracking-wider font-mono font-semibold transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider font-display transition-all ${
              isDestructive
                ? 'bg-red-600 hover:bg-red-500 text-white shadow-md'
                : 'bg-[#F2C94C] hover:bg-[#F7DB82] text-[#0B0D0E] shadow-md'
            }`}
          >
            {loading ? 'Processing...' : confirmText}
          </button>
        </div>

      </div>
    </div>
  );
}
