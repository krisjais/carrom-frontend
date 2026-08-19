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
  Shield
} from 'lucide-react';

export const AdminSidebar = () => {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <aside className="w-64 bg-[#152442] border-r border-[#35538C] flex flex-col shrink-0 sticky top-0 h-screen overflow-y-auto z-30 shadow-2xl">
      {/* Brand Header with Gold Circular Logo Badge */}
      <div className="p-6 border-b border-[#35538C] flex items-center justify-between">
        <Link href="/admin" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#F2C94C] to-[#D4A94C] flex items-center justify-center text-[#1E3258] font-display font-black text-lg shadow-md shadow-[#F2C94C]/25 border border-[#F7DB82]">
            C
          </div>
          <div>
            <span className="font-display font-black text-white text-base block leading-none tracking-wide">
              CARROM<span className="text-[#FFD691]">PRO</span>
            </span>
            <span className="text-[10px] text-[#D4A94C] font-mono font-bold tracking-[0.18em] uppercase">
              ADMIN CONSOLE
            </span>
          </div>
        </Link>
      </div>

      {/* Nav List */}
      <nav className="p-3.5 space-y-1.5 flex-1 text-xs font-semibold">
        <div className="px-3.5 pt-2 pb-1 text-[10px] uppercase font-mono tracking-widest text-[#D4A94C] font-bold">
          OVERVIEW
        </div>

        {/* 1. Dashboard */}
        <Link
          href="/admin"
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-full transition-all ${
            pathname === '/admin'
              ? 'bg-[#FFD691] text-[#1E3258] font-black shadow-md shadow-[#FFD691]/20'
              : 'text-[#D4DEEE] hover:text-white hover:bg-[#1E3258]'
          }`}
        >
          <LayoutDashboard className={`w-4 h-4 ${pathname === '/admin' ? 'text-[#1E3258]' : 'text-[#D4A94C]'}`} />
          <span className="font-display text-xs tracking-wider uppercase">Dashboard</span>
        </Link>

        {/* 2. Participants */}
        <Link
          href="/admin/registrations"
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-full transition-all ${
            pathname.startsWith('/admin/registrations')
              ? 'bg-[#FFD691] text-[#1E3258] font-black shadow-md shadow-[#FFD691]/20'
              : 'text-[#D4DEEE] hover:text-white hover:bg-[#1E3258]'
          }`}
        >
          <Users className={`w-4 h-4 ${pathname.startsWith('/admin/registrations') ? 'text-[#1E3258]' : 'text-[#D4A94C]'}`} />
          <span className="font-display text-xs tracking-wider uppercase">Participants</span>
        </Link>

        {/* 3. Teams */}
        <Link
          href="/admin/teams"
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-full transition-all ${
            pathname.startsWith('/admin/teams')
              ? 'bg-[#FFD691] text-[#1E3258] font-black shadow-md shadow-[#FFD691]/20'
              : 'text-[#D4DEEE] hover:text-white hover:bg-[#1E3258]'
          }`}
        >
          <Layers className={`w-4 h-4 ${pathname.startsWith('/admin/teams') ? 'text-[#1E3258]' : 'text-[#D4A94C]'}`} />
          <span className="font-display text-xs tracking-wider uppercase">Teams & Entries</span>
        </Link>

        {/* 4. Tournament Group */}
        <div className="pt-4 pb-1">
          <div className="px-3.5 py-1 text-[10px] uppercase font-mono tracking-widest text-[#D4A94C] font-bold">
            TOURNAMENT OPERATIONS
          </div>
          <div className="space-y-1 mt-1">
            <Link
              href="/admin/draws"
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-full transition-all ${
                pathname.startsWith('/admin/draws')
                  ? 'bg-[#FFD691] text-[#1E3258] font-black shadow-md shadow-[#FFD691]/20'
                  : 'text-[#D4DEEE] hover:text-white hover:bg-[#1E3258]'
              }`}
            >
              <GitFork className={`w-4 h-4 ${pathname.startsWith('/admin/draws') ? 'text-[#1E3258]' : 'text-[#D4A94C]'}`} />
              <span className="font-display text-xs tracking-wider uppercase">Draws & Brackets</span>
            </Link>

            <Link
              href="/admin/matches"
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-full transition-all ${
                pathname.startsWith('/admin/matches')
                  ? 'bg-[#FFD691] text-[#1E3258] font-black shadow-md shadow-[#FFD691]/20'
                  : 'text-[#D4DEEE] hover:text-white hover:bg-[#1E3258]'
              }`}
            >
              <Calendar className={`w-4 h-4 ${pathname.startsWith('/admin/matches') ? 'text-[#1E3258]' : 'text-[#D4A94C]'}`} />
              <span className="font-display text-xs tracking-wider uppercase">Matches & Arena</span>
            </Link>
          </div>
        </div>

        {/* 5. Communications & Settings */}
        <div className="pt-4 pb-1">
          <div className="px-3.5 py-1 text-[10px] uppercase font-mono tracking-widest text-[#D4A94C] font-bold">
            COMMUNICATIONS & CONFIG
          </div>
          <div className="space-y-1 mt-1">
            <Link
              href="/admin/announcements"
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-full transition-all ${
                pathname.startsWith('/admin/announcements')
                  ? 'bg-[#FFD691] text-[#1E3258] font-black shadow-md shadow-[#FFD691]/20'
                  : 'text-[#D4DEEE] hover:text-white hover:bg-[#1E3258]'
              }`}
            >
              <Bell className={`w-4 h-4 ${pathname.startsWith('/admin/announcements') ? 'text-[#1E3258]' : 'text-[#D4A94C]'}`} />
              <span className="font-display text-xs tracking-wider uppercase">Announcements</span>
            </Link>

            <Link
              href="/admin/rules"
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-full transition-all ${
                pathname.startsWith('/admin/rules')
                  ? 'bg-[#FFD691] text-[#1E3258] font-black shadow-md shadow-[#FFD691]/20'
                  : 'text-[#D4DEEE] hover:text-white hover:bg-[#1E3258]'
              }`}
            >
              <Settings className={`w-4 h-4 ${pathname.startsWith('/admin/rules') ? 'text-[#1E3258]' : 'text-[#D4A94C]'}`} />
              <span className="font-display text-xs tracking-wider uppercase">Rules & Settings</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Footer Actions */}
      <div className="p-3.5 border-t border-[#35538C] space-y-1.5 text-xs">
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[#D4DEEE] hover:text-white hover:bg-[#1E3258] transition-colors"
        >
          <span className="font-display text-xs tracking-wider uppercase font-bold">View Public Site</span>
          <ExternalLink className="w-3.5 h-3.5 text-[#D4A94C]" />
        </Link>

        <button
          onClick={logout}
          className="w-full flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-[#FF96A4] hover:text-[#FF6E80] hover:bg-[#1E3258] transition-colors font-display text-xs tracking-wider uppercase font-bold cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
