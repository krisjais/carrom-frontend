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

  const isTournamentActive = pathname.startsWith('/admin/draws') || pathname.startsWith('/admin/matches');

  return (
    <aside className="w-64 bg-[#070B16] border-r border-[#1C2B48] flex flex-col shrink-0 min-h-screen">
      {/* Brand Header */}
      <div className="p-5 border-b border-[#1C2B48] flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#D4AF37] flex items-center justify-center text-[#070B16] font-display font-black text-sm">
            C
          </div>
          <div>
            <span className="font-display font-bold text-white text-sm block leading-none">
              CARROM<span className="text-[#D4AF37]">PRO</span>
            </span>
            <span className="text-[10px] text-[#D4AF37] font-mono font-bold tracking-wider uppercase">
              Admin Console
            </span>
          </div>
        </Link>
      </div>

      {/* Nav List */}
      <nav className="p-3 space-y-1 flex-1 text-xs font-semibold">
        {/* 1. Dashboard */}
        <Link
          href="/admin"
          className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all ${
            pathname === '/admin'
              ? 'bg-[#0E1626] text-[#D4AF37] border border-[#1C2B48]'
              : 'text-[#94A3B8] hover:text-white hover:bg-[#0E1626]/50'
          }`}
        >
          <LayoutDashboard className={`w-4 h-4 ${pathname === '/admin' ? 'text-[#D4AF37]' : 'text-[#64748B]'}`} />
          <span>Dashboard</span>
        </Link>

        {/* 2. Participants */}
        <Link
          href="/admin/registrations"
          className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all ${
            pathname.startsWith('/admin/registrations')
              ? 'bg-[#0E1626] text-[#D4AF37] border border-[#1C2B48]'
              : 'text-[#94A3B8] hover:text-white hover:bg-[#0E1626]/50'
          }`}
        >
          <Users className={`w-4 h-4 ${pathname.startsWith('/admin/registrations') ? 'text-[#D4AF37]' : 'text-[#64748B]'}`} />
          <span>Participants</span>
        </Link>

        {/* 3. Teams */}
        <Link
          href="/admin/teams"
          className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all ${
            pathname.startsWith('/admin/teams')
              ? 'bg-[#0E1626] text-[#D4AF37] border border-[#1C2B48]'
              : 'text-[#94A3B8] hover:text-white hover:bg-[#0E1626]/50'
          }`}
        >
          <Layers className={`w-4 h-4 ${pathname.startsWith('/admin/teams') ? 'text-[#D4AF37]' : 'text-[#64748B]'}`} />
          <span>Teams</span>
        </Link>

        {/* 4. Tournament Group */}
        <div className="pt-2 pb-1">
          <div className="px-3 py-1 text-[10px] uppercase font-mono tracking-wider text-[#64748B] font-bold">
            Tournament
          </div>
          <div className="space-y-0.5 mt-1 pl-2 border-l border-[#1C2B48] ml-3">
            <Link
              href="/admin/draws"
              className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-all ${
                pathname.startsWith('/admin/draws')
                  ? 'bg-[#0E1626] text-[#D4AF37] font-bold'
                  : 'text-[#94A3B8] hover:text-white hover:bg-[#0E1626]/50'
              }`}
            >
              <GitFork className={`w-3.5 h-3.5 ${pathname.startsWith('/admin/draws') ? 'text-[#D4AF37]' : 'text-[#64748B]'}`} />
              <span>Draws & Brackets</span>
            </Link>

            <Link
              href="/admin/matches"
              className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-all ${
                pathname.startsWith('/admin/matches')
                  ? 'bg-[#0E1626] text-[#D4AF37] font-bold'
                  : 'text-[#94A3B8] hover:text-white hover:bg-[#0E1626]/50'
              }`}
            >
              <Calendar className={`w-3.5 h-3.5 ${pathname.startsWith('/admin/matches') ? 'text-[#D4AF37]' : 'text-[#64748B]'}`} />
              <span>Matches</span>
            </Link>
          </div>
        </div>

        {/* 5. Announcements */}
        <Link
          href="/admin/announcements"
          className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all ${
            pathname.startsWith('/admin/announcements')
              ? 'bg-[#0E1626] text-[#D4AF37] border border-[#1C2B48]'
              : 'text-[#94A3B8] hover:text-white hover:bg-[#0E1626]/50'
          }`}
        >
          <Bell className={`w-4 h-4 ${pathname.startsWith('/admin/announcements') ? 'text-[#D4AF37]' : 'text-[#64748B]'}`} />
          <span>Announcements</span>
        </Link>

        {/* 6. Settings */}
        <Link
          href="/admin/rules"
          className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all ${
            pathname.startsWith('/admin/rules')
              ? 'bg-[#0E1626] text-[#D4AF37] border border-[#1C2B48]'
              : 'text-[#94A3B8] hover:text-white hover:bg-[#0E1626]/50'
          }`}
        >
          <Settings className={`w-4 h-4 ${pathname.startsWith('/admin/rules') ? 'text-[#D4AF37]' : 'text-[#64748B]'}`} />
          <span>Settings</span>
        </Link>
      </nav>

      {/* Footer Actions */}
      <div className="p-3 border-t border-[#1C2B48] space-y-1 text-xs">
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between px-3 py-2 rounded-lg text-[#94A3B8] hover:text-white hover:bg-[#0E1626] transition-colors"
        >
          <span>View Public Site</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>

        <button
          onClick={logout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-[#0E1626] transition-colors font-semibold"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
