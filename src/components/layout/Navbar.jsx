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
  Bell,
  Sparkles
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
    <header className="sticky top-0 z-40 w-full bg-[#210440]/95 backdrop-blur-lg border-b border-[#4A138C]/80 shadow-lg shadow-[#140129]/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-[#FFBA00] flex items-center justify-center text-[#210440] font-display font-black text-xl shadow-md shadow-[#FFBA00]/20 group-hover:scale-105 group-hover:bg-[#FFC933] transition-all">
              C
            </div>
            <div>
              <span className="font-display font-black text-xl tracking-tight text-white block leading-none">
                CARROM<span className="text-[#FFBA00]">PRO</span>
              </span>
              <span className="text-[10px] text-[#FDB095] font-mono font-bold tracking-widest uppercase">
                Championship 2026
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1.5 lg:gap-2 bg-[#17022E]/80 p-1.5 rounded-full border border-[#4A138C]">
            <Link
              href="/"
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                isActive('/') && pathname === '/'
                  ? 'text-[#210440] bg-[#FFBA00] shadow-sm'
                  : 'text-[#D8C7F0] hover:text-white hover:bg-[#2C0854]'
              }`}
            >
              Home
            </Link>

            <Link
              href="/tournament"
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                isActive('/tournament')
                  ? 'text-[#210440] bg-[#FFBA00] shadow-sm'
                  : 'text-[#D8C7F0] hover:text-white hover:bg-[#2C0854]'
              }`}
            >
              Tournament
            </Link>

            <Link
              href="/live"
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${
                isActive('/live')
                  ? 'text-[#210440] bg-[#FFBA00] shadow-sm'
                  : 'text-[#D8C7F0] hover:text-white hover:bg-[#2C0854]'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Live Arena</span>
            </Link>

            <Link
              href="/results"
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                isActive('/results')
                  ? 'text-[#210440] bg-[#FFBA00] shadow-sm'
                  : 'text-[#D8C7F0] hover:text-white hover:bg-[#2C0854]'
              }`}
            >
              Results
            </Link>

            {/* "More" Dropdown */}
            <div className="relative" ref={moreRef}>
              <button
                onClick={() => setMoreOpen(!moreOpen)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                  moreOpen || moreLinks.some((l) => isActive(l.href))
                    ? 'text-[#FFBA00] bg-[#2C0854]'
                    : 'text-[#D8C7F0] hover:text-white hover:bg-[#2C0854]'
                }`}
              >
                <span>More</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${moreOpen ? 'rotate-180' : ''}`} />
              </button>

              {moreOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-[#210440] border border-[#4A138C] rounded-2xl shadow-2xl p-2 space-y-1 z-50 animate-in fade-in zoom-in-95 duration-150">
                  {moreLinks.map((link) => {
                    const Icon = link.icon;
                    return (
                      <Link
                        key={link.name}
                        href={link.href}
                        onClick={() => setMoreOpen(false)}
                        className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                          isActive(link.href)
                            ? 'text-[#210440] bg-[#FFBA00] font-bold'
                            : 'text-[#D8C7F0] hover:text-white hover:bg-[#2C0854]'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${isActive(link.href) ? 'text-[#210440]' : 'text-[#FDB095]'}`} />
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
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#2C0854] border border-[#FFBA00]/40 text-[#FFBA00] text-xs font-bold hover:bg-[#380E6B] transition-colors"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Admin Panel</span>
                </Link>
                <button
                  onClick={logout}
                  className="p-2.5 rounded-xl text-[#D8C7F0] hover:text-rose-400 hover:bg-[#2C0854] transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : isParticipant ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/participant/dashboard"
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#2C0854] border border-[#4A138C] text-white text-xs font-bold hover:border-[#FFBA00] transition-colors"
                >
                  <User className="w-3.5 h-3.5 text-[#FFBA00]" />
                  <span>My Portal</span>
                </Link>
                <button
                  onClick={logout}
                  className="p-2.5 rounded-xl text-[#D8C7F0] hover:text-rose-400 hover:bg-[#2C0854] transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link
                  href="/participant/login"
                  className="px-4 py-2 rounded-xl text-[#D8C7F0] hover:text-white text-xs font-semibold transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/registration"
                  className="px-5 py-2.5 rounded-xl btn-gold text-xs font-black tracking-wide shadow-md transition-all"
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
              className="p-2.5 rounded-xl text-[#D8C7F0] hover:text-white hover:bg-[#2C0854]"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[#4A138C] bg-[#210440] px-4 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-2 text-xs font-bold">
            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              className={`p-3 rounded-xl ${isActive('/') && pathname === '/' ? 'text-[#210440] bg-[#FFBA00]' : 'text-slate-200 bg-[#2C0854]'}`}
            >
              Home
            </Link>
            <Link
              href="/tournament"
              onClick={() => setMobileOpen(false)}
              className={`p-3 rounded-xl ${isActive('/tournament') ? 'text-[#210440] bg-[#FFBA00]' : 'text-slate-200 bg-[#2C0854]'}`}
            >
              Tournament
            </Link>
            <Link
              href="/live"
              onClick={() => setMobileOpen(false)}
              className={`p-3 rounded-xl flex items-center gap-1.5 ${isActive('/live') ? 'text-[#210440] bg-[#FFBA00]' : 'text-slate-200 bg-[#2C0854]'}`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Live Arena</span>
            </Link>
            <Link
              href="/results"
              onClick={() => setMobileOpen(false)}
              className={`p-3 rounded-xl ${isActive('/results') ? 'text-[#210440] bg-[#FFBA00]' : 'text-slate-200 bg-[#2C0854]'}`}
            >
              Results
            </Link>
            <Link
              href="/brackets"
              onClick={() => setMobileOpen(false)}
              className="p-3 rounded-xl text-slate-200 bg-[#2C0854]"
            >
              Brackets
            </Link>
            <Link
              href="/categories"
              onClick={() => setMobileOpen(false)}
              className="p-3 rounded-xl text-slate-200 bg-[#2C0854]"
            >
              Categories
            </Link>
            <Link
              href="/rules"
              onClick={() => setMobileOpen(false)}
              className="p-3 rounded-xl text-slate-200 bg-[#2C0854]"
            >
              Rules
            </Link>
            <Link
              href="/champions"
              onClick={() => setMobileOpen(false)}
              className="p-3 rounded-xl text-slate-200 bg-[#2C0854]"
            >
              Champions
            </Link>
          </div>

          <div className="pt-3 border-t border-[#4A138C] flex flex-col gap-2.5">
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
                    className="flex-1 py-2.5 rounded-xl bg-[#2C0854] text-[#D8C7F0] text-xs text-center font-bold"
                  >
                    Participant Login
                  </Link>
                  <Link
                    href="/admin/login"
                    onClick={() => setMobileOpen(false)}
                    className="flex-1 py-2.5 rounded-xl bg-[#2C0854] text-[#D8C7F0] text-xs text-center font-bold"
                  >
                    Admin Login
                  </Link>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#2C0854]">
                <Link
                  href={isAdmin ? '/admin' : '/participant/dashboard'}
                  onClick={() => setMobileOpen(false)}
                  className="text-xs font-bold text-[#FFBA00]"
                >
                  {isAdmin ? 'Open Admin Panel →' : 'My Participant Portal →'}
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setMobileOpen(false);
                  }}
                  className="text-xs text-rose-300 font-semibold"
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
