'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Trophy, Shield, Users, Swords, UserPlus, Menu, X, Lock } from 'lucide-react';

export function ChessNavbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Home', href: '/chess', icon: Trophy },
    { label: 'Players', href: '/chess/players', icon: Users },
    { label: 'Matches', href: '/chess/matches', icon: Swords },
    { label: 'Standings', href: '/chess/standings', icon: Shield },
  ];

  const isActive = (path) => {
    if (path === '/chess') return pathname === '/chess';
    return pathname?.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-50 bg-[#0B0D0E]/95 backdrop-blur-md border-b border-[#2A313C]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Branding */}
          <Link href="/chess" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F2C94C] to-[#D4A94C] p-0.5 shadow-md group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#0B0D0E] rounded-[10px] flex items-center justify-center">
                <span className="text-xl font-bold text-[#F2C94C] font-display">♟</span>
              </div>
            </div>
            <div>
              <span className="text-xs uppercase tracking-widest text-[#F2C94C] font-mono font-bold block">Championship 2026</span>
              <span className="text-lg font-bold text-[#F5F1E8] font-display tracking-wide group-hover:text-[#F2C94C] transition-colors">CHESS CHAMPIONSHIP</span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    active
                      ? 'bg-[#1F242C] text-[#F2C94C] border border-[#F2C94C]/30 shadow-sm'
                      : 'text-[#9BB0D3] hover:text-[#F5F1E8] hover:bg-[#1A1E24]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-[#F2C94C]' : 'text-[#9BB0D3]'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* CTA & Admin Link */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/chess/register"
              className="flex items-center gap-2 bg-[#F2C94C] hover:bg-[#F7DB82] text-[#0B0D0E] font-bold px-5 py-2.5 rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 text-sm uppercase tracking-wide font-display"
            >
              <UserPlus className="w-4 h-4" />
              <span>Register Now</span>
            </Link>

            <Link
              href="/chess/admin/login"
              className="text-xs text-[#9BB0D3] hover:text-[#F2C94C] transition-colors flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-[#1A1E24]"
              title="Admin Console"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Admin</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-[#9BB0D3] hover:text-[#F5F1E8] hover:bg-[#1A1E24] focus:outline-none"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#2A313C] bg-[#14171A] px-4 pt-3 pb-6 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-semibold transition-all ${
                  active
                    ? 'bg-[#1F242C] text-[#F2C94C] border border-[#F2C94C]/30'
                    : 'text-[#9BB0D3] hover:text-[#F5F1E8] hover:bg-[#1A1E24]'
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? 'text-[#F2C94C]' : 'text-[#9BB0D3]'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}

          <div className="pt-4 border-t border-[#2A313C]/60 flex flex-col gap-3">
            <Link
              href="/chess/register"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 bg-[#F2C94C] text-[#0B0D0E] font-bold py-3 rounded-xl uppercase tracking-wide font-display text-sm"
            >
              <UserPlus className="w-4 h-4" />
              <span>Register Now</span>
            </Link>

            <Link
              href="/chess/admin/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 text-xs text-[#9BB0D3] hover:text-[#F2C94C] py-2"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Admin Access</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
