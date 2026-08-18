'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export const Modal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-2xl' }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F1A30]/85 backdrop-blur-md overflow-y-auto">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className={`relative w-full ${maxWidth} bg-[#1E3258] border border-[#D7A859]/50 rounded-3xl shadow-2xl p-6 sm:p-7 my-8 z-10 animate-in fade-in zoom-in-95 duration-200`}>
        <div className="flex items-center justify-between pb-4 border-b border-[#35538C]">
          <h3 className="text-xl font-black font-display text-white">{title}</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#D4DEEE] hover:text-white hover:bg-[#2A457A] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
};
