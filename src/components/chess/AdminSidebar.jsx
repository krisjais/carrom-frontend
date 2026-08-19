'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { chessApi } from '@/lib/chessApi';
import {
  LayoutDashboard,
  Users,
  Swords,
  Trophy,
  Settings,
  LogOut,
  ArrowLeft
} from 'lucide-react';

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

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
    <aside className="w-full lg:w-60 bg-white border-r border-[#E5E5E5] flex flex-col justify-between min-h-screen p-4 sm:p-5 shrink-0">
      <div className="space-y-6">
        
        {/* Admin Brand */}
        <div className="flex items-center gap-3 border-b border-[#E5E5E5] pb-4">
          <div className="w-9 h-9 rounded-xl bg-[#000000] text-[#C9A227] flex items-center justify-center font-bold font-display text-xl shadow-xs">
            ♟
          </div>
          <div>
            <span className="text-[9px] font-mono text-[#C9A227] font-bold uppercase tracking-widest block">ADMIN PANEL</span>
            <h2 className="text-sm font-extrabold font-display text-[#111111] leading-none">CHESS PORTAL</h2>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="space-y-1">
          <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#666666] px-3 mb-2 block">
            MANAGEMENT
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
                    ? 'sidebar-active-item font-bold text-white shadow-xs'
                    : 'text-[#111111] hover:bg-gray-100 hover:text-[#000000]'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-[#666666]'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

      </div>

      {/* Footer / Exit / Logout */}
      <div className="pt-4 border-t border-[#E5E5E5] space-y-2">
        <Link
          href="/chess"
          className="flex items-center gap-2 text-xs font-mono text-[#666666] hover:text-[#111111] px-3.5 py-2 rounded-xl hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Exit to Public Portal</span>
        </Link>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 border border-red-200 transition-all font-display uppercase tracking-wider shadow-xs"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Log Out</span>
        </button>
      </div>

    </aside>
  );
}
