'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  ChevronDown,
  Menu,
  X,
  User,
  Shield,
  LogOut,
  Layers,
  Calendar,
  GitFork,
  BookOpen,
  Trophy,
  Bell
} from 'lucide-react';

export const Navbar = () => {
  const pathname = usePathname();
  const { user, isAdmin, isParticipant, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (moreRef.current && !moreRef.current.contains(e.target)) {
        setMoreOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isActive = (href) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const moreLinks = [
    { name: 'Categories', href: '/categories', icon: Layers },
    { name: 'Fixtures', href: '/fixtures', icon: Calendar },
    { name: 'Brackets', href: '/brackets', icon: GitFork },
    { name: 'Rules', href: '/rules', icon: BookOpen },
    { name: 'Champions', href: '/champions', icon: Trophy },
    { name: 'Announcements', href: '/announcements', icon: Bell },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#070B16]/95 backdrop-blur-md border-b border-[#1C2B48]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-[#D4AF37] flex items-center justify-center text-[#070B16] font-display font-black text-lg shadow-sm group-hover:bg-[#E5C358] transition-colors">
              C
            </div>
            <div>
              <span className="font-display font-bold text-lg tracking-tight text-white block leading-none">
                CARROM<span className="text-[#D4AF37]">PRO</span>
              </span>
              <span className="text-[10px] text-[#94A3B8] font-medium tracking-wide">
                Championship 2026
              </span>
            </div>
          </Link>

          {/* Desktop Nav - Clean & Minimal 4-5 Items */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            <Link
              href="/"
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/') && pathname === '/'
                  ? 'text-[#D4AF37] bg-[#0E1626]'
                  : 'text-[#94A3B8] hover:text-white hover:bg-[#0E1626]/60'
              }`}
            >
              Home
            </Link>

            <Link
              href="/tournament"
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/tournament')
                  ? 'text-[#D4AF37] bg-[#0E1626]'
                  : 'text-[#94A3B8] hover:text-white hover:bg-[#0E1626]/60'
              }`}
            >
              Tournament
            </Link>

            <Link
              href="/live"
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                isActive('/live')
                  ? 'text-[#D4AF37] bg-[#0E1626]'
                  : 'text-[#94A3B8] hover:text-white hover:bg-[#0E1626]/60'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Live</span>
            </Link>

            <Link
              href="/results"
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/results')
                  ? 'text-[#D4AF37] bg-[#0E1626]'
                  : 'text-[#94A3B8] hover:text-white hover:bg-[#0E1626]/60'
              }`}
            >
              Results
            </Link>

            {/* "More" Dropdown for secondary tournament features */}
            <div className="relative" ref={moreRef}>
              <button
                onClick={() => setMoreOpen(!moreOpen)}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  moreOpen || moreLinks.some((l) => isActive(l.href))
                    ? 'text-[#D4AF37] bg-[#0E1626]'
                    : 'text-[#94A3B8] hover:text-white hover:bg-[#0E1626]/60'
                }`}
              >
                <span>More</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${moreOpen ? 'rotate-180' : ''}`} />
              </button>

              {moreOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-[#0E1626] border border-[#1C2B48] rounded-xl shadow-xl p-2 space-y-0.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                  {moreLinks.map((link) => {
                    const Icon = link.icon;
                    return (
                      <Link
                        key={link.name}
                        href={link.href}
                        onClick={() => setMoreOpen(false)}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                          isActive(link.href)
                            ? 'text-[#D4AF37] bg-[#141F36]'
                            : 'text-[#94A3B8] hover:text-white hover:bg-[#141F36]'
                        }`}
                      >
                        <Icon className="w-4 h-4 text-[#64748B]" />
                        <span>{link.name}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </nav>

          {/* Right Action: Register Button / User Portal */}
          <div className="hidden md:flex items-center gap-3">
            {isAdmin ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/admin"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0E1626] border border-[#D4AF37]/40 text-[#D4AF37] text-xs font-semibold hover:bg-[#141F36] transition-colors"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Admin Panel</span>
                </Link>
                <button
                  onClick={logout}
                  className="p-2 rounded-lg text-[#64748B] hover:text-white hover:bg-[#0E1626] transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : isParticipant ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/participant/dashboard"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0E1626] border border-[#1C2B48] text-slate-200 text-xs font-semibold hover:border-[#D4AF37]/50 transition-colors"
                >
                  <User className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>My Portal</span>
                </Link>
                <button
                  onClick={logout}
                  className="p-2 rounded-lg text-[#64748B] hover:text-white hover:bg-[#0E1626] transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/participant/login"
                  className="px-3 py-2 rounded-lg text-[#94A3B8] hover:text-white text-xs font-medium transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/registration"
                  className="px-4 py-2 rounded-xl bg-[#D4AF37] hover:bg-[#E5C358] text-[#070B16] font-bold text-xs shadow-sm transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu toggle */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-lg text-[#94A3B8] hover:text-white hover:bg-[#0E1626]"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[#1C2B48] bg-[#0E1626] px-4 py-4 space-y-3">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              className={`p-2.5 rounded-lg font-medium ${isActive('/') && pathname === '/' ? 'text-[#D4AF37] bg-[#141F36]' : 'text-slate-300'}`}
            >
              Home
            </Link>
            <Link
              href="/tournament"
              onClick={() => setMobileOpen(false)}
              className={`p-2.5 rounded-lg font-medium ${isActive('/tournament') ? 'text-[#D4AF37] bg-[#141F36]' : 'text-slate-300'}`}
            >
              Tournament
            </Link>
            <Link
              href="/live"
              onClick={() => setMobileOpen(false)}
              className={`p-2.5 rounded-lg font-medium ${isActive('/live') ? 'text-[#D4AF37] bg-[#141F36]' : 'text-slate-300'}`}
            >
              Live Matches
            </Link>
            <Link
              href="/results"
              onClick={() => setMobileOpen(false)}
              className={`p-2.5 rounded-lg font-medium ${isActive('/results') ? 'text-[#D4AF37] bg-[#141F36]' : 'text-slate-300'}`}
            >
              Results
            </Link>
            <Link
              href="/brackets"
              onClick={() => setMobileOpen(false)}
              className="p-2.5 rounded-lg font-medium text-slate-300"
            >
              Brackets
            </Link>
            <Link
              href="/categories"
              onClick={() => setMobileOpen(false)}
              className="p-2.5 rounded-lg font-medium text-slate-300"
            >
              Categories
            </Link>
            <Link
              href="/rules"
              onClick={() => setMobileOpen(false)}
              className="p-2.5 rounded-lg font-medium text-slate-300"
            >
              Rules
            </Link>
            <Link
              href="/announcements"
              onClick={() => setMobileOpen(false)}
              className="p-2.5 rounded-lg font-medium text-slate-300"
            >
              Notices
            </Link>
          </div>

          <div className="pt-3 border-t border-[#1C2B48] flex flex-col gap-2">
            {!user ? (
              <>
                <Link
                  href="/registration"
                  onClick={() => setMobileOpen(false)}
                  className="w-full py-2.5 rounded-xl bg-[#D4AF37] text-[#070B16] font-bold text-xs text-center"
                >
                  Register for Tournament
                </Link>
                <div className="flex gap-2">
                  <Link
                    href="/participant/login"
                    onClick={() => setMobileOpen(false)}
                    className="flex-1 py-2 rounded-lg bg-[#141F36] text-slate-300 text-xs text-center font-medium"
                  >
                    Participant Login
                  </Link>
                  <Link
                    href="/admin/login"
                    onClick={() => setMobileOpen(false)}
                    className="flex-1 py-2 rounded-lg bg-[#141F36] text-slate-300 text-xs text-center font-medium"
                  >
                    Admin Login
                  </Link>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-between">
                <Link
                  href={isAdmin ? '/admin' : '/participant/dashboard'}
                  onClick={() => setMobileOpen(false)}
                  className="text-xs font-bold text-[#D4AF37]"
                >
                  {isAdmin ? 'Open Admin Panel' : 'My Participant Portal'}
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setMobileOpen(false);
                  }}
                  className="text-xs text-[#94A3B8]"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
