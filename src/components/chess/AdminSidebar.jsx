'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { chessApi } from '@/lib/chessApi';
import { useChessTheme } from '@/context/ChessThemeContext';
import {
  LayoutDashboard,
  Users,
  Swords,
  Trophy,
  Settings,
  LogOut,
  ArrowLeft,
  Sun,
  Moon,
  Menu,
  X
} from 'lucide-react';

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme, mounted } = useChessTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { label: 'Dashboard', href: '/chess/admin', icon: LayoutDashboard },
    { label: 'Players', href: '/chess/admin/players', icon: Users },
    { label: 'Matches', href: '/chess/admin/matches', icon: Swords },
    { label: 'Standings', href: '/chess/admin/standings', icon: Trophy },
    { label: 'Settings', href: '/chess/admin/settings', icon: Settings },
  ];

  const handleLogout = () => {
    chessApi.logoutAdmin();
    router.push('/chess/admin/login');
  };

  const isActive = (href) => {
    if (href === '/chess/admin') return pathname === '/chess/admin';
    return pathname?.startsWith(href);
  };

  const activeItem = navItems.find((item) => isActive(item.href)) || navItems[0];

  return (
    <>
      {/* 1. MOBILE TOP APP BAR (Visible on screens < lg) */}
      <header className="lg:hidden w-full sticky top-0 z-40 bg-[#FAF8F3]/95 dark:bg-[#151514]/95 backdrop-blur-md border-b border-[#D5CFC5] dark:border-[#262624] px-4 py-3 flex items-center justify-between shadow-xs transition-colors">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="w-9 h-9 rounded-xl border border-[#D5CFC5] dark:border-[#262624] bg-[#EFEAE1] dark:bg-[#1E1E1C] text-[#171715] dark:text-[#FAF8F3] hover:bg-[#E4DED5] flex items-center justify-center transition-all shadow-xs active:scale-95 cursor-pointer"
            aria-label="Open Admin Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link href="/chess/admin" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-[#22221F] dark:bg-[#FAF8F3] text-[#FAF8F3] dark:text-[#0D0D0D] flex items-center justify-center font-bold text-sm shadow-2xs group-hover:scale-105 transition-transform">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z"/>
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-serif font-bold text-xs sm:text-sm text-[#171715] dark:text-[#FAF8F3] tracking-tight">
                  CHESS ADMIN
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-md bg-[#EFEAE1] dark:bg-[#1E1E1C] border border-[#D5CFC5]/70 dark:border-[#2E2E2B] text-amber-700 dark:text-amber-400 font-bold uppercase">
                  {activeItem.label}
                </span>
              </div>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="w-8 h-8 flex items-center justify-center rounded-xl border border-[#D5CFC5] dark:border-[#262624] bg-[#EFEAE1] dark:bg-[#1D1D1B] text-[#171715] dark:text-[#FAF8F3] hover:bg-[#E4DED5] transition-all shadow-xs cursor-pointer"
            title={mounted && theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            aria-label="Toggle Theme"
          >
            {mounted && theme === 'dark' ? (
              <Sun className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-[#171715]" />
            )}
          </button>
        </div>
      </header>

      {/* 2. MOBILE SLIDE-IN NAVIGATION DRAWER (Slide from Left) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop Blur Overlay */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-200 animate-in fade-in"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Sheet */}
          <aside
            className="fixed top-0 bottom-0 left-0 w-72 max-w-[85vw] bg-[#FAF8F3] dark:bg-[#141414] border-r border-[#D5CFC5] dark:border-[#262624] shadow-2xl flex flex-col justify-between p-5 z-10 transition-transform duration-300 ease-out animate-in slide-in-from-left"
          >
            <div className="space-y-6">
              {/* Drawer Brand Header with Close 'X' */}
              <div className="flex items-center justify-between border-b border-[#D5CFC5] dark:border-[#262624] pb-4">
                <Link
                  href="/chess/admin"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3"
                >
                  <div className="w-9 h-9 rounded-xl bg-[#22221F] dark:bg-[#FAF8F3] text-[#FAF8F3] dark:text-[#0D0D0D] flex items-center justify-center font-bold text-lg shadow-xs">
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z"/>
                    </svg>
                  </div>
                  <div>
                    <span className="text-[9px] font-mono text-[#77736B] dark:text-[#A8A49C] font-semibold uppercase tracking-widest block leading-none">
                      ADMIN CONSOLE
                    </span>
                    <h2 className="text-sm font-bold font-serif text-[#171715] dark:text-[#FAF8F3] tracking-tight mt-1">
                      CHESS ARENA
                    </h2>
                  </div>
                </Link>

                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="w-8 h-8 rounded-xl border border-[#D5CFC5] dark:border-[#262624] hover:bg-[#EFEAE1] dark:hover:bg-[#20201E] flex items-center justify-center text-[#77736B] dark:text-[#8E8E93] hover:text-[#171715] dark:hover:text-[#FAF8F3] transition-colors cursor-pointer"
                  aria-label="Close menu"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Navigation Module Links */}
              <nav className="space-y-1.5">
                <span className="text-[9px] font-mono font-semibold uppercase tracking-widest text-[#77736B] dark:text-[#8E8E93] px-3.5 mb-2 block">
                  MANAGEMENT MODULES
                </span>
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs uppercase tracking-wider font-semibold transition-all ${
                        active
                          ? 'bg-[#22221F] dark:bg-[#FAF8F3] text-[#FAF8F3] dark:text-[#0D0D0D] shadow-xs'
                          : 'text-[#4E4C47] dark:text-[#8E8E93] hover:bg-[#EFEAE1] dark:hover:bg-[#1D1D1B] hover:text-[#171715] dark:hover:text-[#FAF8F3]'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${active ? 'text-inherit' : 'text-[#77736B] dark:text-[#8E8E93]'}`} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Drawer Footer Actions */}
            <div className="pt-4 border-t border-[#D5CFC5] dark:border-[#262624] space-y-2">
              <Link
                href="/chess"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 text-xs font-mono text-[#77736B] dark:text-[#8E8E93] hover:text-[#171715] dark:hover:text-[#FAF8F3] px-3.5 py-2.5 rounded-xl hover:bg-[#EFEAE1] dark:hover:bg-[#1D1D1B] transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Exit to Public Site</span>
              </Link>

              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 transition-all uppercase tracking-wider shadow-xs cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* 3. DESKTOP STICKY SIDEBAR (Visible only on screens >= lg) */}
      <aside className="hidden lg:flex w-64 bg-[#FAF8F3] dark:bg-[#151514] border-r border-[#D5CFC5] dark:border-[#262624] flex-col justify-between sticky top-0 h-screen overflow-y-auto p-5 shrink-0 transition-colors z-30">
        <div className="space-y-6">
          {/* Admin Brand Header */}
          <div className="flex items-center justify-between border-b border-[#D5CFC5] dark:border-[#262624] pb-4">
            <Link href="/chess/admin" className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-xl bg-[#22221F] dark:bg-[#FAF8F3] text-[#FAF8F3] dark:text-[#0D0D0D] flex items-center justify-center font-bold text-lg shadow-xs group-hover:scale-105 transition-transform">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z"/>
                </svg>
              </div>
              <div>
                <span className="text-[9px] font-mono text-[#77736B] dark:text-[#A8A49C] font-semibold uppercase tracking-widest block leading-none">
                  ADMIN CONSOLE
                </span>
                <h2 className="text-sm font-bold font-serif text-[#171715] dark:text-[#FAF8F3] tracking-tight mt-1">
                  CHESS CHAMPIONSHIP
                </h2>
              </div>
            </Link>

            {/* Small Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="w-8 h-8 flex items-center justify-center rounded-xl border border-[#D5CFC5] dark:border-[#262624] bg-[#EFEAE1] dark:bg-[#1D1D1B] text-[#171715] dark:text-[#FAF8F3] hover:bg-[#E4DED5] dark:hover:bg-[#262624] transition-all shadow-xs hover:scale-105 active:scale-95 cursor-pointer"
              title={mounted && theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle Theme"
            >
              {mounted && theme === 'dark' ? (
                <Sun className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20" />
              ) : (
                <Moon className="w-3.5 h-3.5 text-[#171715]" />
              )}
            </button>
          </div>

          {/* Navigation items */}
          <nav className="space-y-1.5">
            <span className="text-[9px] font-mono font-semibold uppercase tracking-widest text-[#77736B] dark:text-[#8E8E93] px-3.5 mb-2 block">
              MANAGEMENT MODULES
            </span>
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs uppercase tracking-wider font-semibold transition-all ${
                    active
                      ? 'bg-[#22221F] dark:bg-[#FAF8F3] text-[#FAF8F3] dark:text-[#0D0D0D] shadow-xs'
                      : 'text-[#4E4C47] dark:text-[#8E8E93] hover:bg-[#EFEAE1] dark:hover:bg-[#1D1D1B] hover:text-[#171715] dark:hover:text-[#FAF8F3]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-inherit' : 'text-[#77736B] dark:text-[#8E8E93]'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer / Exit / Logout */}
        <div className="pt-4 border-t border-[#D5CFC5] dark:border-[#262624] space-y-2">
          <Link
            href="/chess"
            className="flex items-center gap-2 text-xs font-mono text-[#77736B] dark:text-[#8E8E93] hover:text-[#171715] dark:hover:text-[#FAF8F3] px-3.5 py-2 rounded-xl hover:bg-[#EFEAE1] dark:hover:bg-[#1D1D1B] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Exit to Public Site</span>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 transition-all uppercase tracking-wider shadow-xs cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
