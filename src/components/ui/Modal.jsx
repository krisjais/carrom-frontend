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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2C241E]/60 dark:bg-black/80 backdrop-blur-xs overflow-y-auto">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className={`relative w-full ${maxWidth} bg-white dark:bg-[#15191C] border border-[#D5C4A1] dark:border-[#2B3034] rounded-2xl shadow-2xl p-6 sm:p-7 my-8 z-10 animate-in fade-in zoom-in-95 duration-200 text-[#4A4238] dark:text-[#F5F1E8] transition-colors duration-200`}>
        <div className="flex items-center justify-between pb-4 border-b border-[#E8E1D5] dark:border-[#2B3034]">
          <h3 className="text-xl font-serif font-black text-[#3E342B] dark:text-[#F5F1E8]">{title}</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#7E7060] dark:text-[#B8B1A5] hover:text-[#3E342B] dark:hover:text-white hover:bg-[#FAF9F6] dark:hover:bg-[#181C1F] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
};


