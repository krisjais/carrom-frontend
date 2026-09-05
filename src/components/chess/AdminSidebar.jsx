'use client';

import React from 'react';
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
  Moon
} from 'lucide-react';

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme, mounted } = useChessTheme();

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

  return (
    <aside className="w-full lg:w-64 bg-[#FAF8F3] dark:bg-[#151514] border-b lg:border-b-0 lg:border-r border-[#D5CFC5] dark:border-[#262624] flex flex-col justify-between min-h-screen p-4 sm:p-5 shrink-0 transition-colors">
      <div className="space-y-6">
        
        {/* Admin Brand Header */}
        <div className="flex items-center justify-between border-b border-[#D5CFC5] dark:border-[#262624] pb-4">
          <Link href="/chess/admin" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-[#22221F] dark:bg-[#FAF8F3] text-[#FAF8F3] dark:text-[#0D0D0D] flex items-center justify-center font-bold text-lg shadow-xs group-hover:scale-105 transition-transform">
              ♛
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
            className="w-8 h-8 flex items-center justify-center rounded-xl border border-[#D5CFC5] dark:border-[#262624] bg-[#EFEAE1] dark:bg-[#1D1D1B] text-[#171715] dark:text-[#FAF8F3] hover:bg-[#E4DED5] dark:hover:bg-[#262624] transition-all shadow-xs hover:scale-105 active:scale-95"
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
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 transition-all uppercase tracking-wider shadow-xs"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Log Out</span>
        </button>
      </div>

    </aside>
  );
}
