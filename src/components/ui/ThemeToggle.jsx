'use client';

import React from 'react';
import { useTheme } from '@/context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle({ className = '', variant = 'compact' }) {
  const { theme, toggleTheme, mounted } = useTheme();
  const isDark = theme === 'dark';

  if (!mounted) {
    return (
      <div
        className={`w-9 h-9 rounded-full bg-[#FAF9F6] dark:bg-[#15191C] border border-[#E8E1D5] dark:border-[#2B3034] shrink-0 ${className}`}
        aria-hidden="true"
      />
    );
  }

  if (variant === 'segmented') {
    return (
      <div
        className={`inline-flex items-center p-1 rounded-full bg-[#FAF9F6] dark:bg-[#121517] border border-[#E8E1D5] dark:border-[#2B3034] gap-1 ${className}`}
        role="group"
        aria-label="Theme selection"
      >
        <button
          type="button"
          onClick={() => isDark && toggleTheme()}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
            !isDark
              ? 'bg-white text-[#3E342B] shadow-xs font-bold'
              : 'text-[#817B72] hover:text-[#B8B1A5]'
          }`}
          title="Switch to Light Theme"
        >
          <Sun className="w-3.5 h-3.5 text-[#D4A94C]" />
          <span>Light</span>
        </button>

        <button
          type="button"
          onClick={() => !isDark && toggleTheme()}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
            isDark
              ? 'bg-[#1B2024] text-[#F5F1E8] shadow-xs font-bold'
              : 'text-[#7E7060] hover:text-[#3E342B]'
          }`}
          title="Switch to Night Theme"
        >
          <Moon className="w-3.5 h-3.5 text-[#D4A94C]" />
          <span>Night</span>
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`relative w-9 h-9 rounded-full flex items-center justify-center bg-white dark:bg-[#15191C] border border-[#D5C4A1] dark:border-[#2B3034] text-[#4A4238] dark:text-[#F5F1E8] hover:border-[#4A4238] dark:hover:border-[#D4A94C] shadow-2xs transition-all duration-200 cursor-pointer shrink-0 group ${className}`}
      title={isDark ? 'Switch to Light Theme (☀)' : 'Switch to Night Theme (☾)'}
      aria-label={isDark ? 'Switch to Light Theme' : 'Switch to Night Theme'}
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-[#D4A94C] transition-transform group-hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 text-[#7E7060] group-hover:text-[#3E342B] transition-transform group-hover:-rotate-12" />
      )}
    </button>
  );
}
