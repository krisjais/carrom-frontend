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
  X,
  Radio
} from 'lucide-react';
import { CarromCoin } from '@/components/ui/CarromElements';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export const AdminSidebar = ({ isOpen = false, onClose = () => {} }) => {
  const pathname = usePathname();
  const { logout } = useAuth();

  const handleLinkClick = () => {
    onClose();
  };

  const navItems = [
    {
      group: 'OVERVIEW',
      links: [
        { name: 'Dashboard', href: '/admin', icon: LayoutDashboard, exact: true },
        { name: 'Participants', href: '/admin/registrations', icon: Users },
        { name: 'Teams & Entries', href: '/admin/teams', icon: Layers },
      ]
    },
    {
      group: 'TOURNAMENT ARENA',
      links: [
        { name: 'Draws & Brackets', href: '/admin/draws', icon: GitFork },
        { name: 'Matches & Arena', href: '/admin/matches', icon: Calendar },
      ]
    },
    {
      group: 'OPERATIONS & RULES',
      links: [
        { name: 'Bulletins', href: '/admin/announcements', icon: Bell },
        { name: 'Rules & Settings', href: '/admin/rules', icon: Settings },
      ]
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/75 backdrop-blur-xs z-40 lg:hidden animate-in fade-in duration-200"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Aside */}
      <aside
        className={`fixed top-0 bottom-0 left-0 w-64 bg-[#171614] dark:bg-[#11100E] border-r border-[#24221E] dark:border-[#2E2B26] flex flex-col shrink-0 h-screen overflow-y-auto z-50 shadow-2xl transition-all duration-300 ease-in-out lg:translate-x-0 lg:sticky lg:z-30 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-[#24221E] dark:border-[#2E2B26] flex items-center justify-between">
          <Link href="/admin" onClick={handleLinkClick} className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-full bg-[#24221E] flex items-center justify-center border border-[#38342E] shadow-xs group-hover:scale-105 transition-transform">
              <CarromCoin type="queen" size="xs" />
            </div>
            <div>
              <span className="font-serif font-bold text-[#F7F4EC] text-base block leading-none tracking-tight">
                CARROM<span className="italic font-normal text-[#D93829] ml-0.5">ADMIN</span>
              </span>
              <span className="text-[9px] text-[#C2A268] font-sans font-bold tracking-[0.2em] uppercase block mt-1">
                CONTROL ROOM
              </span>
            </div>
          </Link>

          <button
            onClick={onClose}
            className="lg:hidden text-[#A39C8F] hover:text-white p-1 rounded-lg"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation List */}
        <nav className="p-4 space-y-6 flex-1 text-xs font-semibold">
          {navItems.map((group) => (
            <div key={group.group} className="space-y-1">
              <div className="px-3.5 pb-2 text-[9px] uppercase font-sans tracking-[0.2em] text-[#A39C8F] font-bold">
                {group.group}
              </div>

              {group.links.map((link) => {
                const Icon = link.icon;
                const isCurrent = link.exact
                  ? pathname === link.href
                  : pathname.startsWith(link.href);

                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={handleLinkClick}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                      isCurrent
                        ? 'bg-[#F7F4EC] text-[#171614] font-bold shadow-xs'
                        : 'text-[#C8C2B4] hover:text-[#FFFFFF] hover:bg-white/5'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isCurrent ? 'text-[#D93829]' : 'text-[#A39C8F]'}`} />
                    <span className="text-xs tracking-wide">{link.name}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[#24221E] dark:border-[#2E2B26] space-y-2 text-xs">
          <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-[#24221E] border border-[#2E2B26]">
            <span className="text-[11px] font-mono uppercase text-[#A39C8F] font-bold">Theme</span>
            <ThemeToggle />
          </div>

          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[#C8C2B4] hover:text-[#FFFFFF] hover:bg-white/5 transition-colors font-mono"
          >
            <span className="text-xs uppercase tracking-wider font-bold">Public Portal</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#C2A268]" />
          </Link>

          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 transition-colors text-xs tracking-wider uppercase font-bold cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};


