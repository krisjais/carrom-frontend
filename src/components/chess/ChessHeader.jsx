'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ArrowRight, Sun, Moon, Clock } from 'lucide-react';
import { useChessTheme } from '@/context/ChessThemeContext';
import { chessApi } from '@/lib/chessApi';

export function ChessHeader() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme, mounted } = useChessTheme();
  const [playerAuth, setPlayerAuth] = useState({ isAuthenticated: false, player: null });

  useEffect(() => {
    try {
      const auth = chessApi.getPlayerAuth();
      setPlayerAuth(auth);
    } catch {
      // Ignore in SSR
    }
  }, [pathname]);

  const navItems = [
    { label: 'Home', href: '/chess' },
    { label: 'Players', href: '/chess/players' },
    { label: 'Matches', href: '/chess/matches' },
    { label: 'Match History', href: '/chess/standings' },
    ...(playerAuth.isAuthenticated
      ? [{ label: 'My Clock & Match', href: '/chess/player/dashboard' }]
      : [{ label: 'Player Login', href: '/chess/login' }]),
    { label: 'Rules', href: '/chess/rules' },
  ];

  const isActive = (path) => {
    if (path === '/chess') return pathname === '/chess';
    return pathname?.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-50 pt-2.5 pb-2.5 px-3 sm:px-6 md:px-8 select-none transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between bg-[#FAF8F3]/95 dark:bg-[#151514]/95 backdrop-blur-md border border-[#D5CFC5] dark:border-[#262624] px-3 sm:px-6 py-2 rounded-full shadow-xs transition-all duration-300">
        
        {/* LEFT: Branding */}
        <Link href="/chess" className="flex items-center gap-2 group shrink-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#22221F] dark:bg-[#FAF8F3] text-[#FAF8F3] dark:text-[#0D0D0D] flex items-center justify-center font-bold text-sm sm:text-base shadow-xs group-hover:scale-105 transition-transform duration-200 shrink-0">
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current shrink-0" width="16" height="16" style={{ width: '16px', height: '16px', maxWidth: '16px', maxHeight: '16px' }} viewBox="0 0 24 24">
              <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z"/>
            </svg>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xs sm:text-sm font-bold tracking-tight text-[#171715] dark:text-[#FAF8F3] font-serif">
              CHESS
            </span>
            <span className="hidden sm:inline text-[9px] uppercase tracking-widest text-[#77736B] dark:text-[#A8A49C] font-mono font-medium">
              2026
            </span>
          </div>
        </Link>

        {/* CENTER: Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center space-x-7">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`relative py-1 text-xs uppercase tracking-wider transition-colors font-medium ${
                  active
                    ? 'text-[#171715] dark:text-[#FAF8F3] font-bold after:content-[""] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-4 after:h-[2px] after:bg-[#171715] dark:after:bg-[#FAF8F3] after:rounded-full'
                    : 'text-[#77736B] dark:text-[#8E8E93] hover:text-[#171715] dark:hover:text-[#FAF8F3]'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* RIGHT: Theme Toggle, User Portal, Hamburger */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          
          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full border border-[#D5CFC5] dark:border-[#262624] bg-[#EFEAE1] dark:bg-[#1D1D1B] text-[#171715] dark:text-[#FAF8F3] hover:bg-[#E4DED5] dark:hover:bg-[#262624] transition-all focus:outline-none shadow-xs shrink-0 cursor-pointer"
            title={mounted && theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle Light or Dark Theme"
          >
            {mounted && theme === 'dark' ? (
              <Sun className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-[#171715]" />
            )}
          </button>

          {/* If Authenticated Competitor */}
          {playerAuth.isAuthenticated ? (
            <Link
              href="/chess/player/dashboard"
              className="inline-flex items-center gap-1 sm:gap-1.5 border border-amber-600/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 dark:text-amber-300 font-semibold px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs uppercase tracking-wider transition-colors shrink-0"
              title="Open My Match Clocks"
            >
              <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span className="hidden xs:inline">My Clock</span>
            </Link>
          ) : (
            <>
              {/* Login (Tablet & Desktop) */}
              <Link
                href="/chess/login"
                className="hidden sm:inline-flex items-center gap-1 border border-[#D5CFC5] dark:border-[#262624] bg-[#FAF8F3] dark:bg-[#1D1D1B] hover:bg-[#EFEAE1] dark:hover:bg-[#262624] text-[#171715] dark:text-[#FAF8F3] font-semibold px-3 py-1.5 rounded-full text-xs uppercase tracking-wider transition-colors shrink-0"
              >
                <span>Login</span>
              </Link>

              {/* Register Button */}
              <Link
                href="/chess/register"
                className="inline-flex items-center gap-1 bg-[#22221F] dark:bg-[#FAF8F3] hover:bg-[#000000] dark:hover:bg-[#FFFFFF] text-[#FAF8F3] dark:text-[#0D0D0D] font-semibold px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs uppercase tracking-wider transition-all duration-200 shadow-xs shrink-0"
              >
                <span>Register</span>
                <ArrowRight className="w-3 h-3 hidden xs:inline" />
              </Link>
            </>
          )}

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 sm:p-2 rounded-full border border-[#D5CFC5] dark:border-[#262624] bg-[#EFEAE1] dark:bg-[#1D1D1B] text-[#171715] dark:text-[#FAF8F3] hover:bg-[#E4DED5] dark:hover:bg-[#262624] transition-colors focus:outline-none shrink-0 cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-2 max-w-7xl mx-auto rounded-2xl border border-[#D5CFC5] dark:border-[#262624] bg-[#FAF8F3]/95 dark:bg-[#151514]/95 backdrop-blur-md px-6 py-5 space-y-4 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col space-y-1.5">
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`py-2 px-3 rounded-xl text-xs uppercase tracking-wider transition-colors ${
                    active
                      ? 'bg-[#EFEAE1] dark:bg-[#1D1D1B] text-[#171715] dark:text-[#FAF8F3] font-bold'
                      : 'text-[#4E4C47] dark:text-[#8E8E93] hover:bg-[#EFEAE1]/60 dark:hover:bg-[#1D1D1B]/60'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className="pt-3 border-t border-[#D5CFC5] dark:border-[#262624] flex items-center justify-between">
            {playerAuth.isAuthenticated ? (
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-mono font-bold text-[#171715] dark:text-[#FAF8F3]">
                  {playerAuth.player?.fullName || playerAuth.player?.playerId}
                </span>
              </div>
            ) : (
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#77736B] dark:text-[#8E8E93]">
                Appearance
              </span>
            )}

            <button
              type="button"
              onClick={toggleTheme}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#D5CFC5] dark:border-[#262624] bg-[#EFEAE1] dark:bg-[#1D1D1B] text-[#171715] dark:text-[#FAF8F3] text-xs font-semibold cursor-pointer"
            >
              {mounted && theme === 'dark' ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span>Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-[#171715]" />
                  <span>Dark Mode</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
