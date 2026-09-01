'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export const Modal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-2xl' }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 999999
      }}
      className="overflow-y-auto bg-[#2C241E]/75 dark:bg-black/85 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6"
    >
      <div
        className="fixed inset-0 -z-10"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className={`relative w-full ${maxWidth} max-h-[calc(100vh-2.5rem)] sm:max-h-[calc(100vh-4rem)] flex flex-col bg-white dark:bg-[#15191C] border border-[#D5C4A1] dark:border-[#2B3034] rounded-2xl shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-200 text-[#4A4238] dark:text-[#F5F1E8] transition-colors duration-200 overflow-hidden`}>
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 sm:px-6 sm:py-4.5 border-b border-[#E8E1D5] dark:border-[#2B3034] shrink-0 bg-white dark:bg-[#15191C]">
          <h3 className="text-base sm:text-lg font-bold tracking-tight text-[#3E342B] dark:text-[#F5F1E8]">{title}</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#7E7060] dark:text-[#B8B1A5] hover:text-[#3E342B] dark:hover:text-white hover:bg-[#FAF9F6] dark:hover:bg-[#181C1F] transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto px-5 py-4 sm:px-6 sm:py-5 flex-1 overscroll-contain">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};
