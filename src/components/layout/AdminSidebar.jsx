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
  Shield,
  ChevronRight
} from 'lucide-react';

export const AdminSidebar = () => {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <aside className="w-64 bg-[#17022E] border-r border-[#4A138C] flex flex-col shrink-0 sticky top-0 h-screen overflow-y-auto z-30 shadow-2xl">
      {/* Brand Header */}
      <div className="p-6 border-b border-[#4A138C]/80 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-[#FFBA00] flex items-center justify-center text-[#210440] font-display font-black text-base shadow-md shadow-[#FFBA00]/20">
            C
          </div>
          <div>
            <span className="font-display font-black text-white text-base block leading-none tracking-tight">
              CARROM<span className="text-[#FFBA00]">PRO</span>
            </span>
            <span className="text-[10px] text-[#FDB095] font-mono font-bold tracking-wider uppercase">
              Admin Console
            </span>
          </div>
        </Link>
      </div>

      {/* Nav List */}
      <nav className="p-3.5 space-y-1.5 flex-1 text-xs font-semibold">
        {/* 1. Dashboard */}
        <Link
          href="/admin"
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl transition-all ${
            pathname === '/admin'
              ? 'bg-[#FFBA00] text-[#210440] font-black shadow-md shadow-[#FFBA00]/15'
              : 'text-[#D8C7F0] hover:text-white hover:bg-[#2C0854]'
          }`}
        >
          <LayoutDashboard className={`w-4 h-4 ${pathname === '/admin' ? 'text-[#210440]' : 'text-[#FDB095]'}`} />
          <span>Dashboard</span>
        </Link>

        {/* 2. Participants */}
        <Link
          href="/admin/registrations"
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl transition-all ${
            pathname.startsWith('/admin/registrations')
              ? 'bg-[#FFBA00] text-[#210440] font-black shadow-md shadow-[#FFBA00]/15'
              : 'text-[#D8C7F0] hover:text-white hover:bg-[#2C0854]'
          }`}
        >
          <Users className={`w-4 h-4 ${pathname.startsWith('/admin/registrations') ? 'text-[#210440]' : 'text-[#FDB095]'}`} />
          <span>Participants</span>
        </Link>

        {/* 3. Teams */}
        <Link
          href="/admin/teams"
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl transition-all ${
            pathname.startsWith('/admin/teams')
              ? 'bg-[#FFBA00] text-[#210440] font-black shadow-md shadow-[#FFBA00]/15'
              : 'text-[#D8C7F0] hover:text-white hover:bg-[#2C0854]'
          }`}
        >
          <Layers className={`w-4 h-4 ${pathname.startsWith('/admin/teams') ? 'text-[#210440]' : 'text-[#FDB095]'}`} />
          <span>Teams</span>
        </Link>

        {/* 4. Tournament Group */}
        <div className="pt-3 pb-1">
          <div className="px-3.5 py-1 text-[10px] uppercase font-mono tracking-widest text-[#FDB095] font-bold">
            Tournament
          </div>
          <div className="space-y-1 mt-1 pl-2 border-l-2 border-[#4A138C] ml-3.5">
            <Link
              href="/admin/draws"
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all ${
                pathname.startsWith('/admin/draws')
                  ? 'bg-[#FFBA00] text-[#210440] font-black shadow-sm'
                  : 'text-[#D8C7F0] hover:text-white hover:bg-[#2C0854]'
              }`}
            >
              <GitFork className={`w-3.5 h-3.5 ${pathname.startsWith('/admin/draws') ? 'text-[#210440]' : 'text-[#E5958E]'}`} />
              <span>Draws & Brackets</span>
            </Link>

            <Link
              href="/admin/matches"
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all ${
                pathname.startsWith('/admin/matches')
                  ? 'bg-[#FFBA00] text-[#210440] font-black shadow-sm'
                  : 'text-[#D8C7F0] hover:text-white hover:bg-[#2C0854]'
              }`}
            >
              <Calendar className={`w-3.5 h-3.5 ${pathname.startsWith('/admin/matches') ? 'text-[#210440]' : 'text-[#E5958E]'}`} />
              <span>Matches</span>
            </Link>
          </div>
        </div>

        {/* 5. Announcements */}
        <Link
          href="/admin/announcements"
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl transition-all ${
            pathname.startsWith('/admin/announcements')
              ? 'bg-[#FFBA00] text-[#210440] font-black shadow-md shadow-[#FFBA00]/15'
              : 'text-[#D8C7F0] hover:text-white hover:bg-[#2C0854]'
          }`}
        >
          <Bell className={`w-4 h-4 ${pathname.startsWith('/admin/announcements') ? 'text-[#210440]' : 'text-[#FDB095]'}`} />
          <span>Announcements</span>
        </Link>

        {/* 6. Settings */}
        <Link
          href="/admin/rules"
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl transition-all ${
            pathname.startsWith('/admin/rules')
              ? 'bg-[#FFBA00] text-[#210440] font-black shadow-md shadow-[#FFBA00]/15'
              : 'text-[#D8C7F0] hover:text-white hover:bg-[#2C0854]'
          }`}
        >
          <Settings className={`w-4 h-4 ${pathname.startsWith('/admin/rules') ? 'text-[#210440]' : 'text-[#FDB095]'}`} />
          <span>Settings</span>
        </Link>
      </nav>

      {/* Footer Actions */}
      <div className="p-3.5 border-t border-[#4A138C] space-y-1.5 text-xs">
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between px-3 py-2 rounded-xl text-[#D8C7F0] hover:text-white hover:bg-[#2C0854] transition-colors"
        >
          <span>View Public Site</span>
          <ExternalLink className="w-3.5 h-3.5 text-[#FDB095]" />
        </Link>

        <button
          onClick={logout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-[#E5958E] hover:text-rose-300 hover:bg-[#2C0854] transition-colors font-bold cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
