'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserPlus, Sun, Moon } from 'lucide-react';
import { useChessTheme } from '@/context/ChessThemeContext';

export function ChessHeader() {
  const pathname = usePathname();
  const { theme, toggleTheme, mounted } = useChessTheme();

  const navItems = [
    { label: 'Home', href: '/chess' },
    { label: 'Players', href: '/chess/players' },
    { label: 'Matches', href: '/chess/matches' },
    { label: 'Standings', href: '/chess/standings' },
    { label: 'Rules', href: '/chess/rules' },
  ];

  const isActive = (path) => {
    if (path === '/chess') return pathname === '/chess';
    return pathname?.startsWith(path);
  };

  const isDark = theme === 'dark';

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-[#121215] border-b border-[#E5E5E5] dark:border-[#27272A] px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xs transition-colors select-none">
      
      {/* LEFT: Branding */}
      <Link href="/chess" className="flex items-center gap-3 group">
        <div className="w-9 h-9 rounded-lg bg-black dark:bg-[#F4F4F5] text-[#C9A227] dark:text-[#09090B] flex items-center justify-center font-bold text-xl shadow-xs group-hover:scale-105 transition-transform">
          ♟
        </div>
        <div>
          <span className="text-base font-extrabold font-display text-[#111111] dark:text-[#F4F4F5] tracking-wide block leading-none">
            CHESS PORTAL
          </span>
          <span className="text-[10px] uppercase tracking-widest text-[#C9A227] font-mono font-bold block pt-0.5">
            TOURNAMENT
          </span>
        </div>
      </Link>

      {/* CENTER: Navigation Links */}
      <nav className="flex items-center space-x-4 sm:space-x-8">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`text-xs sm:text-sm font-semibold transition-colors ${
                active
                  ? 'text-[#111111] dark:text-white font-bold border-b-2 border-black dark:border-white pb-1'
                  : 'text-[#666666] dark:text-[#A1A1AA] hover:text-[#111111] dark:hover:text-white'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* RIGHT: Theme Toggle & Register Button */}
      <div className="flex items-center gap-3">
        
        {/* Sun / Moon Theme Toggle */}
        <button
          onClick={toggleTheme}
          aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="p-2 rounded-xl border border-[#E5E5E5] dark:border-[#27272A] bg-gray-50 dark:bg-[#18181C] text-[#111111] dark:text-[#F4F4F5] hover:bg-gray-100 dark:hover:bg-[#202026] focus:outline-none focus:ring-2 focus:ring-[#C9A227] transition-all group"
        >
          {mounted && isDark ? (
            <Sun className="w-4 h-4 text-[#C9A227] group-hover:rotate-45 transition-transform duration-300" />
          ) : (
            <Moon className="w-4 h-4 text-[#111111] group-hover:-rotate-12 transition-transform duration-300" />
          )}
        </button>

        <Link
          href="/chess/register"
          className="inline-flex items-center gap-1.5 bg-[#C9A227] hover:bg-[#D4A94C] text-black font-bold px-4 py-2 rounded-xl text-xs uppercase font-display tracking-wider transition-colors shadow-xs"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Register</span>
        </Link>
      </div>

    </header>
  );
}
