'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Users,
  Swords,
  Trophy,
  Shield,
  Info,
  Calendar,
  CheckCircle,
  LayoutDashboard,
  Settings,
  Lock,
  X
} from 'lucide-react';

export function ChessSidebar({ mobileOpen, onCloseMobile }) {
  const pathname = usePathname();

  const mainNav = [
    { label: 'Home', href: '/chess', icon: Home },
    { label: 'Players', href: '/chess/players', icon: Users },
    { label: 'Matches', href: '/chess/matches', icon: Swords },
    { label: 'Standings', href: '/chess/standings', icon: Trophy },
    { label: 'Rules', href: '/chess#rules', icon: Shield },
    { label: 'About', href: '/chess#about', icon: Info },
  ];

  const tournamentNav = [
    { label: 'Rounds', href: '/chess/matches', icon: Calendar },
    { label: 'Schedule', href: '/chess/matches', icon: Calendar },
    { label: 'Results', href: '/chess/standings', icon: CheckCircle },
  ];

  const adminNav = [
    { label: 'Dashboard', href: '/chess/admin', icon: LayoutDashboard },
    { label: 'Players', href: '/chess/admin/players', icon: Users },
    { label: 'Matches', href: '/chess/admin/matches', icon: Swords },
    { label: 'Standings', href: '/chess/admin/standings', icon: Trophy },
    { label: 'Settings', href: '/chess/admin/settings', icon: Settings },
  ];

  const isActive = (href) => {
    if (href === '/chess') return pathname === '/chess';
    return pathname?.startsWith(href);
  };

  const renderNavGroup = (title, items) => (
    <div className="space-y-1">
      <h4 className="text-[10px] uppercase font-mono font-bold tracking-widest text-[#666666] px-3 mb-2">
        {title}
      </h4>
      <div className="space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={onCloseMobile}
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
      </div>
    </div>
  );

  const sidebarContent = (
    <aside className="w-60 bg-white border-r border-[#E5E5E5] p-4 flex flex-col justify-between min-h-[calc(100vh-65px)] shrink-0">
      
      <div className="space-y-6">
        {renderNavGroup('MAIN', mainNav)}
        {renderNavGroup('TOURNAMENT', tournamentNav)}
        {renderNavGroup('ADMIN', adminNav)}
      </div>

      {/* Bottom CTA */}
      <div className="pt-4 border-t border-[#E5E5E5]">
        <Link
          href="/chess/admin/login"
          onClick={onCloseMobile}
          className="w-full flex items-center justify-center gap-2 bg-[#000000] hover:bg-[#222222] text-white font-bold py-2.5 rounded-xl text-xs uppercase font-display tracking-wider transition-colors shadow-xs"
        >
          <Shield className="w-3.5 h-3.5 text-[#C9A227]" />
          <span>Admin Login</span>
        </Link>
      </div>

    </aside>
  );

  return (
    <>
      {/* Desktop permanent sidebar */}
      <div className="hidden lg:block">
        {sidebarContent}
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden bg-black/60 backdrop-blur-xs">
          <div className="relative w-64 bg-white h-full shadow-2xl overflow-y-auto">
            <button
              onClick={onCloseMobile}
              className="absolute top-4 right-4 p-1.5 text-gray-500 hover:text-black"
            >
              <X className="w-5 h-5" />
            </button>
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
