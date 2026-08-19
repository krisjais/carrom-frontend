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
    <header className="sticky top-0 z-40 w-full bg-[#0B0D0E]/95 backdrop-blur-xl border-b border-[#D4A94C]/20 shadow-2xl shadow-black/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo with Championship Coin Badge */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#F2C94C] to-[#D4A94C] flex items-center justify-center text-[#0B0D0E] font-display font-black text-xl shadow-lg shadow-[#F2C94C]/20 group-hover:scale-105 group-hover:shadow-[#F2C94C]/40 transition-all border border-[#F7DB82]">
              C
            </div>
            <div>
              <span className="font-display font-black text-2xl tracking-wide text-[#F5F1E8] block leading-none">
                CARROM<span className="text-[#F2C94C]">PRO</span>
              </span>
              <span className="text-[10px] text-[#D4A94C] font-mono font-bold tracking-[0.2em] uppercase">
                CHAMPIONSHIP 2026
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1 bg-[#14171A] p-1.5 rounded-full border border-[#2A313C] shadow-inner">
            <Link
              href="/"
              className={`px-4 py-2 rounded-full text-xs font-display font-bold uppercase tracking-wider transition-all ${
                isActive('/') && pathname === '/'
                  ? 'text-[#0B0D0E] bg-[#F2C94C] shadow-md shadow-[#F2C94C]/20 font-black'
                  : 'text-[#F5F1E8]/75 hover:text-white hover:bg-[#1A1E24]'
              }`}
            >
              Home
            </Link>

            <Link
              href="/tournament"
              className={`px-4 py-2 rounded-full text-xs font-display font-bold uppercase tracking-wider transition-all ${
                isActive('/tournament')
                  ? 'text-[#0B0D0E] bg-[#F2C94C] shadow-md shadow-[#F2C94C]/20 font-black'
                  : 'text-[#F5F1E8]/75 hover:text-white hover:bg-[#1A1E24]'
              }`}
            >
              Tournament
            </Link>

            <Link
              href="/live"
              className={`px-4 py-2 rounded-full text-xs font-display font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                isActive('/live')
                  ? 'text-[#0B0D0E] bg-[#F2C94C] shadow-md shadow-[#F2C94C]/20 font-black'
                  : 'text-[#F5F1E8]/75 hover:text-white hover:bg-[#1A1E24]'
              }`}
            >
              <span className="live-dot" />
              <span>Live Arena</span>
            </Link>

            <Link
              href="/results"
              className={`px-4 py-2 rounded-full text-xs font-display font-bold uppercase tracking-wider transition-all ${
                isActive('/results')
                  ? 'text-[#0B0D0E] bg-[#F2C94C] shadow-md shadow-[#F2C94C]/20 font-black'
                  : 'text-[#F5F1E8]/75 hover:text-white hover:bg-[#1A1E24]'
              }`}
            >
              Results
            </Link>

            {/* "More" Dropdown */}
            <div className="relative" ref={moreRef}>
              <button
                onClick={() => setMoreOpen(!moreOpen)}
                className={`px-4 py-2 rounded-full text-xs font-display font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                  moreOpen || moreLinks.some((l) => isActive(l.href))
                    ? 'text-[#F2C94C] bg-[#1A1E24]'
                    : 'text-[#F5F1E8]/75 hover:text-white hover:bg-[#1A1E24]'
                }`}
              >
                <span>More</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${moreOpen ? 'rotate-180 text-[#F2C94C]' : ''}`} />
              </button>

              {moreOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-[#14171A] border border-[#D4A94C]/30 rounded-2xl shadow-2xl p-2 space-y-1 z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-xl">
                  {moreLinks.map((link) => {
                    const Icon = link.icon;
                    return (
                      <Link
                        key={link.name}
                        href={link.href}
                        onClick={() => setMoreOpen(false)}
                        className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                          isActive(link.href)
                            ? 'text-[#0B0D0E] bg-[#F2C94C] font-bold'
                            : 'text-[#F5F1E8]/80 hover:text-white hover:bg-[#1A1E24]'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${isActive(link.href) ? 'text-[#0B0D0E]' : 'text-[#F2C94C]'}`} />
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
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#1A1E24] border border-[#D4A94C]/50 text-[#F2C94C] text-xs font-display font-bold uppercase tracking-wider hover:bg-[#2A313C] transition-colors"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Admin Panel</span>
                </Link>
                <button
                  onClick={logout}
                  className="p-2.5 rounded-xl text-[#F5F1E8]/60 hover:text-rose-400 hover:bg-[#1A1E24] transition-colors cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : isParticipant ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/participant/dashboard"
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#1A1E24] border border-[#2A313C] text-white text-xs font-display font-bold uppercase tracking-wider hover:border-[#D4A94C] transition-colors"
                >
                  <User className="w-3.5 h-3.5 text-[#F2C94C]" />
                  <span>My Portal</span>
                </Link>
                <button
                  onClick={logout}
                  className="p-2.5 rounded-xl text-[#F5F1E8]/60 hover:text-rose-400 hover:bg-[#1A1E24] transition-colors cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/participant/login"
                  className="px-4 py-2 rounded-xl text-[#F5F1E8]/80 hover:text-[#F2C94C] text-xs font-display font-bold uppercase tracking-wider transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/registration"
                  className="px-5 py-2.5 rounded-xl btn-gold text-xs font-black tracking-wider shadow-lg transition-all"
                >
                  REGISTER NOW
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu toggle */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2.5 rounded-xl text-[#F5F1E8] hover:bg-[#1A1E24] cursor-pointer"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[#2A313C] bg-[#0B0D0E] px-4 py-5 space-y-4 shadow-2xl">
          <div className="grid grid-cols-2 gap-2 text-xs font-display font-bold uppercase">
            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              className={`p-3 rounded-xl ${isActive('/') && pathname === '/' ? 'text-[#0B0D0E] bg-[#F2C94C]' : 'text-slate-200 bg-[#14171A]'}`}
            >
              Home
            </Link>
            <Link
              href="/tournament"
              onClick={() => setMobileOpen(false)}
              className={`p-3 rounded-xl ${isActive('/tournament') ? 'text-[#0B0D0E] bg-[#F2C94C]' : 'text-slate-200 bg-[#14171A]'}`}
            >
              Tournament
            </Link>
            <Link
              href="/live"
              onClick={() => setMobileOpen(false)}
              className={`p-3 rounded-xl flex items-center gap-1.5 ${isActive('/live') ? 'text-[#0B0D0E] bg-[#F2C94C]' : 'text-slate-200 bg-[#14171A]'}`}
            >
              <span className="live-dot" />
              <span>Live Arena</span>
            </Link>
            <Link
              href="/results"
              onClick={() => setMobileOpen(false)}
              className={`p-3 rounded-xl ${isActive('/results') ? 'text-[#0B0D0E] bg-[#F2C94C]' : 'text-slate-200 bg-[#14171A]'}`}
            >
              Results
            </Link>
            <Link
              href="/brackets"
              onClick={() => setMobileOpen(false)}
              className="p-3 rounded-xl text-slate-200 bg-[#14171A]"
            >
              Brackets
            </Link>
            <Link
              href="/categories"
              onClick={() => setMobileOpen(false)}
              className="p-3 rounded-xl text-slate-200 bg-[#14171A]"
            >
              Categories
            </Link>
            <Link
              href="/rules"
              onClick={() => setMobileOpen(false)}
              className="p-3 rounded-xl text-slate-200 bg-[#14171A]"
            >
              Rules
            </Link>
            <Link
              href="/champions"
              onClick={() => setMobileOpen(false)}
              className="p-3 rounded-xl text-slate-200 bg-[#14171A]"
            >
              Champions
            </Link>
          </div>

          <div className="pt-3 border-t border-[#2A313C] flex flex-col gap-2.5">
            {!user ? (
              <>
                <Link
                  href="/registration"
                  onClick={() => setMobileOpen(false)}
                  className="w-full py-3 rounded-xl btn-gold text-xs text-center font-black"
                >
                  REGISTER FOR TOURNAMENT
                </Link>
                <div className="flex gap-2">
                  <Link
                    href="/participant/login"
                    onClick={() => setMobileOpen(false)}
                    className="flex-1 py-2.5 rounded-xl bg-[#14171A] text-[#F5F1E8] text-xs text-center font-bold font-display uppercase"
                  >
                    Participant Login
                  </Link>
                  <Link
                    href="/admin/login"
                    onClick={() => setMobileOpen(false)}
                    className="flex-1 py-2.5 rounded-xl bg-[#14171A] text-[#F5F1E8] text-xs text-center font-bold font-display uppercase"
                  >
                    Admin Login
                  </Link>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#14171A]">
                <Link
                  href={isAdmin ? '/admin' : '/participant/dashboard'}
                  onClick={() => setMobileOpen(false)}
                  className="text-xs font-bold text-[#F2C94C]"
                >
                  {isAdmin ? 'Open Admin Panel →' : 'My Participant Portal →'}
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setMobileOpen(false);
                  }}
                  className="text-xs text-rose-400 font-semibold cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
