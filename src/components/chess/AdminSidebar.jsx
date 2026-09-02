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
  const { theme, toggleTheme } = useChessTheme();

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
    <aside className="w-full lg:w-64 bg-white dark:bg-[#141B2D] border-b lg:border-b-0 lg:border-r border-[#E2E8F0] dark:border-[#232A3B] flex flex-col justify-between min-h-screen p-4 sm:p-5 shrink-0 transition-colors">
      <div className="space-y-6">
        
        {/* Admin Brand Header */}
        <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#232A3B] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-950 dark:bg-slate-900 text-[#C9A227] dark:text-[#D4AF37] flex items-center justify-center font-bold font-display text-2xl shadow-sm border border-[#C9A227]/20">
              ♟
            </div>
            <div>
              <span className="text-[9px] font-mono text-[#C9A227] dark:text-[#D4AF37] font-extrabold uppercase tracking-widest block">
                ADMIN CONTROL
              </span>
              <h2 className="text-sm font-extrabold font-display text-[#0F172A] dark:text-[#F8FAFC] leading-none tracking-wide">
                CHESS PORTAL
              </h2>
            </div>
          </div>

          {/* Theme Switcher Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#1E293B] dark:hover:bg-[#26334D] text-slate-700 dark:text-amber-400 transition-colors border border-slate-200 dark:border-slate-700"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>
        </div>

        {/* Navigation items */}
        <nav className="space-y-1.5">
          <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#64748B] dark:text-[#94A3B8] px-3.5 mb-2 block">
            MANAGEMENT MODULES
          </span>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  active
                    ? 'sidebar-active-item'
                    : 'text-[#334155] dark:text-[#CBD5E1] hover:bg-slate-100 dark:hover:bg-[#1E293B] hover:text-[#0F172A] dark:hover:text-[#F8FAFC]'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-black dark:text-black' : 'text-[#64748B] dark:text-[#94A3B8]'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

      </div>

      {/* Footer / Exit / Logout */}
      <div className="pt-4 border-t border-[#E2E8F0] dark:border-[#232A3B] space-y-2">
        <Link
          href="/chess"
          className="flex items-center gap-2 text-xs font-mono text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] px-3.5 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-[#1E293B] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Exit to Public Portal</span>
        </Link>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 border border-red-200 dark:border-red-900/50 transition-all font-display uppercase tracking-wider shadow-xs"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Log Out</span>
        </button>
      </div>

    </aside>
  );
}

