'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Layers,
  GitFork,
  Calendar,
  Bell,
  Settings,
  LogOut,
  ExternalLink,
  X
} from 'lucide-react';
import { CarromCoin } from '@/components/ui/CarromElements';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export const AdminSidebar = ({ isOpen = false, onClose = () => {} }) => {
  const pathname = usePathname();
  const { logout } = useAuth();

  const handleLinkClick = () => {
    onClose();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-[#2C241E]/80 dark:bg-black/80 backdrop-blur-xs z-40 lg:hidden animate-in fade-in"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Aside */}
      <aside
        className={`fixed top-0 bottom-0 left-0 w-64 bg-[#3E342B] dark:bg-[#121517] border-r border-[#4A4238] dark:border-[#2B3034] flex flex-col shrink-0 h-screen overflow-y-auto z-50 shadow-2xl transition-all duration-300 ease-in-out lg:translate-x-0 lg:sticky lg:z-30 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-[#4A4238] dark:border-[#2B3034] flex items-center justify-between">
          <Link href="/admin" onClick={handleLinkClick} className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-full bg-white dark:bg-[#15191C] flex items-center justify-center border border-[#D5C4A1] dark:border-[#2B3034] shadow-xs">
              <CarromCoin type="queen" size="xs" />
            </div>
            <div>
              <span className="font-serif font-bold text-white dark:text-[#F5F1E8] text-base block leading-none tracking-tight">
                CARROM<span className="text-[#E74C3C]">PRO</span>
              </span>
              <span className="text-[9px] text-[#D5C4A1] dark:text-[#D4A94C] font-sans font-bold tracking-[0.18em] uppercase block mt-0.5">
                CONTROL ROOM
              </span>
            </div>
          </Link>

          <button
            onClick={onClose}
            className="lg:hidden text-[#D5C4A1] hover:text-white p-1 rounded-lg"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav List */}
        <nav className="p-3.5 space-y-1.5 flex-1 text-xs font-semibold">
          <div className="px-3.5 pt-2 pb-1 text-[9px] uppercase font-sans tracking-widest text-[#D5C4A1] dark:text-[#817B72] font-bold">
            OVERVIEW
          </div>

          {/* 1. Dashboard */}
          <Link
            href="/admin"
            onClick={handleLinkClick}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
              pathname === '/admin'
                ? 'bg-[#D5C4A1] dark:bg-[#1B2024] text-[#3E342B] dark:text-[#F5F1E8] dark:border dark:border-[rgba(212,169,76,0.3)] font-bold shadow-xs'
                : 'text-[#FAF9F6]/80 dark:text-[#B8B1A5] hover:text-white dark:hover:text-[#F5F1E8] hover:bg-[#4A4238] dark:hover:bg-[#181C1F]'
            }`}
          >
            <LayoutDashboard className={`w-4 h-4 ${pathname === '/admin' ? 'text-[#3E342B] dark:text-[#D4A94C]' : 'text-[#D5C4A1] dark:text-[#817B72]'}`} />
            <span className="text-xs tracking-wider uppercase">Dashboard</span>
          </Link>

          {/* 2. Participants */}
          <Link
            href="/admin/registrations"
            onClick={handleLinkClick}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
              pathname.startsWith('/admin/registrations')
                ? 'bg-[#D5C4A1] dark:bg-[#1B2024] text-[#3E342B] dark:text-[#F5F1E8] dark:border dark:border-[rgba(212,169,76,0.3)] font-bold shadow-xs'
                : 'text-[#FAF9F6]/80 dark:text-[#B8B1A5] hover:text-white dark:hover:text-[#F5F1E8] hover:bg-[#4A4238] dark:hover:bg-[#181C1F]'
            }`}
          >
            <Users className={`w-4 h-4 ${pathname.startsWith('/admin/registrations') ? 'text-[#3E342B] dark:text-[#D4A94C]' : 'text-[#D5C4A1] dark:text-[#817B72]'}`} />
            <span className="text-xs tracking-wider uppercase">Participants</span>
          </Link>

          {/* 3. Teams */}
          <Link
            href="/admin/teams"
            onClick={handleLinkClick}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
              pathname.startsWith('/admin/teams')
                ? 'bg-[#D5C4A1] dark:bg-[#1B2024] text-[#3E342B] dark:text-[#F5F1E8] dark:border dark:border-[rgba(212,169,76,0.3)] font-bold shadow-xs'
                : 'text-[#FAF9F6]/80 dark:text-[#B8B1A5] hover:text-white dark:hover:text-[#F5F1E8] hover:bg-[#4A4238] dark:hover:bg-[#181C1F]'
            }`}
          >
            <Layers className={`w-4 h-4 ${pathname.startsWith('/admin/teams') ? 'text-[#3E342B] dark:text-[#D4A94C]' : 'text-[#D5C4A1] dark:text-[#817B72]'}`} />
            <span className="text-xs tracking-wider uppercase">Teams & Entries</span>
          </Link>

          {/* 4. Tournament Group */}
          <div className="pt-4 pb-1">
            <div className="px-3.5 py-1 text-[9px] uppercase font-sans tracking-widest text-[#D5C4A1] dark:text-[#817B72] font-bold">
              TOURNAMENT OPERATIONS
            </div>
            <div className="space-y-1 mt-1">
              <Link
                href="/admin/draws"
                onClick={handleLinkClick}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                  pathname.startsWith('/admin/draws')
                    ? 'bg-[#D5C4A1] dark:bg-[#1B2024] text-[#3E342B] dark:text-[#F5F1E8] dark:border dark:border-[rgba(212,169,76,0.3)] font-bold shadow-xs'
                    : 'text-[#FAF9F6]/80 dark:text-[#B8B1A5] hover:text-white dark:hover:text-[#F5F1E8] hover:bg-[#4A4238] dark:hover:bg-[#181C1F]'
                }`}
              >
                <GitFork className={`w-4 h-4 ${pathname.startsWith('/admin/draws') ? 'text-[#3E342B] dark:text-[#D4A94C]' : 'text-[#D5C4A1] dark:text-[#817B72]'}`} />
                <span className="text-xs tracking-wider uppercase">Draws & Brackets</span>
              </Link>

              <Link
                href="/admin/matches"
                onClick={handleLinkClick}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                  pathname.startsWith('/admin/matches')
                    ? 'bg-[#D5C4A1] dark:bg-[#1B2024] text-[#3E342B] dark:text-[#F5F1E8] dark:border dark:border-[rgba(212,169,76,0.3)] font-bold shadow-xs'
                    : 'text-[#FAF9F6]/80 dark:text-[#B8B1A5] hover:text-white dark:hover:text-[#F5F1E8] hover:bg-[#4A4238] dark:hover:bg-[#181C1F]'
                }`}
              >
                <Calendar className={`w-4 h-4 ${pathname.startsWith('/admin/matches') ? 'text-[#3E342B] dark:text-[#D4A94C]' : 'text-[#D5C4A1] dark:text-[#817B72]'}`} />
                <span className="text-xs tracking-wider uppercase">Matches & Arena</span>
              </Link>
            </div>
          </div>

          {/* 5. Communications & Settings */}
          <div className="pt-4 pb-1">
            <div className="px-3.5 py-1 text-[9px] uppercase font-sans tracking-widest text-[#D5C4A1] dark:text-[#817B72] font-bold">
              COMMUNICATIONS & CONFIG
            </div>
            <div className="space-y-1 mt-1">
              <Link
                href="/admin/announcements"
                onClick={handleLinkClick}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                  pathname.startsWith('/admin/announcements')
                    ? 'bg-[#D5C4A1] dark:bg-[#1B2024] text-[#3E342B] dark:text-[#F5F1E8] dark:border dark:border-[rgba(212,169,76,0.3)] font-bold shadow-xs'
                    : 'text-[#FAF9F6]/80 dark:text-[#B8B1A5] hover:text-white dark:hover:text-[#F5F1E8] hover:bg-[#4A4238] dark:hover:bg-[#181C1F]'
                }`}
              >
                <Bell className={`w-4 h-4 ${pathname.startsWith('/admin/announcements') ? 'text-[#3E342B] dark:text-[#D4A94C]' : 'text-[#D5C4A1] dark:text-[#817B72]'}`} />
                <span className="text-xs tracking-wider uppercase">Announcements</span>
              </Link>

              <Link
                href="/admin/rules"
                onClick={handleLinkClick}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                  pathname.startsWith('/admin/rules')
                    ? 'bg-[#D5C4A1] dark:bg-[#1B2024] text-[#3E342B] dark:text-[#F5F1E8] dark:border dark:border-[rgba(212,169,76,0.3)] font-bold shadow-xs'
                    : 'text-[#FAF9F6]/80 dark:text-[#B8B1A5] hover:text-white dark:hover:text-[#F5F1E8] hover:bg-[#4A4238] dark:hover:bg-[#181C1F]'
                }`}
              >
                <Settings className={`w-4 h-4 ${pathname.startsWith('/admin/rules') ? 'text-[#3E342B] dark:text-[#D4A94C]' : 'text-[#D5C4A1] dark:text-[#817B72]'}`} />
                <span className="text-xs tracking-wider uppercase">Rules & Settings</span>
              </Link>
            </div>
          </div>
        </nav>

        {/* Footer Actions with Theme Switcher */}
        <div className="p-3.5 border-t border-[#4A4238] dark:border-[#2B3034] space-y-2 text-xs">
          <div className="flex items-center justify-between px-3.5 py-1.5 rounded-xl bg-[#4A4238]/40 dark:bg-[#181C1F] border border-[#4A4238] dark:border-[#2B3034]">
            <span className="text-[11px] font-mono uppercase text-[#D5C4A1] dark:text-[#B8B1A5] font-bold">Arena Theme</span>
            <ThemeToggle />
          </div>

          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3.5 py-2 rounded-xl text-[#FAF9F6]/80 dark:text-[#B8B1A5] hover:text-white dark:hover:text-[#F5F1E8] hover:bg-[#4A4238] dark:hover:bg-[#181C1F] transition-colors"
          >
            <span className="text-xs tracking-wider uppercase font-bold">View Public Site</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#D5C4A1] dark:text-[#D4A94C]" />
          </Link>

          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3.5 py-2 rounded-xl text-rose-300 dark:text-rose-400 hover:text-rose-200 hover:bg-[#4A4238] dark:hover:bg-[#181C1F] transition-colors text-xs tracking-wider uppercase font-bold cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};


