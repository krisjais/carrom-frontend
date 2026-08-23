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
import { CarromCoin } from '@/components/ui/CarromElements';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

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
    { name: 'Divisions & Categories', href: '/categories', icon: Layers },
    { name: 'Knockout Brackets', href: '/brackets', icon: GitFork },
    { name: 'Official Rules', href: '/rules', icon: BookOpen },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#FAF9F6]/95 dark:bg-[#0B0D0E]/95 backdrop-blur-md border-b border-[#E8E1D5] dark:border-[#2B3034] shadow-xs transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 sm:h-20">
          {/* Brand Logo with Editorial Typography */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 rounded-full bg-white dark:bg-[#15191C] border border-[#D5C4A1] dark:border-[#2B3034] flex items-center justify-center shadow-xs group-hover:border-[#4A4238] dark:group-hover:border-[#D4A94C] transition-colors">
              <CarromCoin type="queen" size="sm" />
            </div>
            <div>
              <span className="font-serif font-black text-xl sm:text-2xl tracking-tight text-[#4A4238] dark:text-[#F5F1E8] block leading-none">
                CARROM<span className="text-[#E74C3C]">PRO</span>
              </span>
              <span className="text-[9px] text-[#7E7060] dark:text-[#B8B1A5] font-sans font-bold tracking-[0.18em] uppercase block mt-0.5">
                COLLEGE CARROM CHAMPIONSHIP
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-[#F4EFE6] dark:bg-[#121517] p-1.5 rounded-full border border-[#E8E1D5] dark:border-[#2B3034]">
            <Link
              href="/"
              className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all ${
                isActive('/') && pathname === '/'
                  ? 'text-[#3E342B] dark:text-[#F5F1E8] bg-white dark:bg-[#1B2024] shadow-xs font-bold dark:border dark:border-[#2B3034]'
                  : 'text-[#7E7060] dark:text-[#817B72] hover:text-[#4A4238] dark:hover:text-[#F5F1E8] hover:bg-white/60 dark:hover:bg-[#181C1F]'
              }`}
            >
              Home
            </Link>

            <Link
              href="/tournament"
              className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all ${
                isActive('/tournament')
                  ? 'text-[#3E342B] dark:text-[#F5F1E8] bg-white dark:bg-[#1B2024] shadow-xs font-bold dark:border dark:border-[#2B3034]'
                  : 'text-[#7E7060] dark:text-[#817B72] hover:text-[#4A4238] dark:hover:text-[#F5F1E8] hover:bg-white/60 dark:hover:bg-[#181C1F]'
              }`}
            >
              Tournament
            </Link>

            <Link
              href="/live"
              className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                isActive('/live')
                  ? 'text-[#3E342B] dark:text-[#F5F1E8] bg-white dark:bg-[#1B2024] shadow-xs font-bold dark:border dark:border-[#2B3034]'
                  : 'text-[#7E7060] dark:text-[#817B72] hover:text-[#4A4238] dark:hover:text-[#F5F1E8] hover:bg-white/60 dark:hover:bg-[#181C1F]'
              }`}
            >
              <span className="live-dot" />
              <span>Live Arena</span>
            </Link>

            <Link
              href="/results"
              className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all ${
                isActive('/results')
                  ? 'text-[#3E342B] dark:text-[#F5F1E8] bg-white dark:bg-[#1B2024] shadow-xs font-bold dark:border dark:border-[#2B3034]'
                  : 'text-[#7E7060] dark:text-[#817B72] hover:text-[#4A4238] dark:hover:text-[#F5F1E8] hover:bg-white/60 dark:hover:bg-[#181C1F]'
              }`}
            >
              Results
            </Link>

            {/* "More" Dropdown Menu */}
            <div className="relative" ref={moreRef}>
              <button
                onClick={() => setMoreOpen(!moreOpen)}
                className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                  moreOpen || moreLinks.some((l) => isActive(l.href))
                    ? 'text-[#3E342B] dark:text-[#F5F1E8] bg-white dark:bg-[#1B2024] shadow-xs font-bold dark:border dark:border-[#2B3034]'
                    : 'text-[#7E7060] dark:text-[#817B72] hover:text-[#4A4238] dark:hover:text-[#F5F1E8] hover:bg-white/60 dark:hover:bg-[#181C1F]'
                }`}
              >
                <span>More</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${moreOpen ? 'rotate-180 text-[#E74C3C]' : ''}`} />
              </button>

              {moreOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#15191C] border border-[#E8E1D5] dark:border-[#2B3034] rounded-2xl shadow-xl p-2 space-y-1 z-50 animate-in fade-in zoom-in-95 duration-150">
                  {moreLinks.map((link) => {
                    const Icon = link.icon;
                    return (
                      <Link
                        key={link.name}
                        href={link.href}
                        onClick={() => setMoreOpen(false)}
                        className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                          isActive(link.href)
                            ? 'text-[#3E342B] dark:text-[#F5F1E8] bg-[#F4EFE6] dark:bg-[#1B2024] font-bold'
                            : 'text-[#4A4238] dark:text-[#B8B1A5] hover:bg-[#FAF9F6] dark:hover:bg-[#181C1F]'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${isActive(link.href) ? 'text-[#E74C3C]' : 'text-[#7E7060] dark:text-[#817B72]'}`} />
                        <span>{link.name}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </nav>

          {/* Right Action: Theme Toggle & Register / Admin Control Room */}
          <div className="hidden md:flex items-center gap-3">
            {/* Theme Switcher Toggle Button */}
            <ThemeToggle />

            {isAdmin ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/admin"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#3E342B] dark:bg-[#1B2024] text-[#FAF9F6] dark:text-[#F5F1E8] border border-transparent dark:border-[#2B3034] text-xs font-semibold uppercase tracking-wider hover:bg-[#2C241E] dark:hover:bg-[#242B30] transition-colors shadow-xs"
                >
                  <Shield className="w-3.5 h-3.5 text-[#D5C4A1]" />
                  <span>Control Room</span>
                </Link>
                <button
                  onClick={logout}
                  className="p-2 rounded-xl text-[#7E7060] dark:text-[#B8B1A5] hover:text-rose-600 hover:bg-[#F4EFE6] dark:hover:bg-[#181C1F] transition-colors cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/registration"
                className="btn-primary text-xs font-bold tracking-wider shadow-md"
              >
                REGISTER NOW
              </Link>
            )}
          </div>

          {/* Mobile Navigation Header */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2.5 rounded-xl text-[#4A4238] dark:text-[#F5F1E8] hover:bg-[#F4EFE6] dark:hover:bg-[#181C1F] cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[#E8E1D5] dark:border-[#2B3034] bg-white dark:bg-[#0B0D0E] px-4 py-5 space-y-4 shadow-xl animate-in slide-in-from-top-2">
          <div className="grid grid-cols-2 gap-2 text-xs font-semibold uppercase tracking-wider">
            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              className={`p-3 rounded-xl ${
                isActive('/') && pathname === '/'
                  ? 'text-[#3E342B] dark:text-[#F5F1E8] bg-[#D5C4A1] dark:bg-[#1B2024] font-bold'
                  : 'text-[#4A4238] dark:text-[#B8B1A5] bg-[#FAF9F6] dark:bg-[#15191C]'
              }`}
            >
              Home
            </Link>
            <Link
              href="/tournament"
              onClick={() => setMobileOpen(false)}
              className={`p-3 rounded-xl ${
                isActive('/tournament')
                  ? 'text-[#3E342B] dark:text-[#F5F1E8] bg-[#D5C4A1] dark:bg-[#1B2024] font-bold'
                  : 'text-[#4A4238] dark:text-[#B8B1A5] bg-[#FAF9F6] dark:bg-[#15191C]'
              }`}
            >
              Tournament
            </Link>
            <Link
              href="/live"
              onClick={() => setMobileOpen(false)}
              className={`p-3 rounded-xl flex items-center gap-1.5 ${
                isActive('/live')
                  ? 'text-[#3E342B] dark:text-[#F5F1E8] bg-[#D5C4A1] dark:bg-[#1B2024] font-bold'
                  : 'text-[#4A4238] dark:text-[#B8B1A5] bg-[#FAF9F6] dark:bg-[#15191C]'
              }`}
            >
              <span className="live-dot" />
              <span>Live Arena</span>
            </Link>
            <Link
              href="/results"
              onClick={() => setMobileOpen(false)}
              className={`p-3 rounded-xl ${
                isActive('/results')
                  ? 'text-[#3E342B] dark:text-[#F5F1E8] bg-[#D5C4A1] dark:bg-[#1B2024] font-bold'
                  : 'text-[#4A4238] dark:text-[#B8B1A5] bg-[#FAF9F6] dark:bg-[#15191C]'
              }`}
            >
              Results
            </Link>
            <Link
              href="/brackets"
              onClick={() => setMobileOpen(false)}
              className="p-3 rounded-xl text-[#4A4238] dark:text-[#B8B1A5] bg-[#FAF9F6] dark:bg-[#15191C]"
            >
              Brackets
            </Link>
            <Link
              href="/categories"
              onClick={() => setMobileOpen(false)}
              className="p-3 rounded-xl text-[#4A4238] dark:text-[#B8B1A5] bg-[#FAF9F6] dark:bg-[#15191C]"
            >
              Categories
            </Link>
            <Link
              href="/rules"
              onClick={() => setMobileOpen(false)}
              className="p-3 rounded-xl text-[#4A4238] dark:text-[#B8B1A5] bg-[#FAF9F6] dark:bg-[#15191C] col-span-2 text-center"
            >
              Rules
            </Link>
          </div>

          <div className="pt-3 border-t border-[#E8E1D5] dark:border-[#2B3034] flex flex-col gap-2.5">
            {!isAdmin ? (
              <Link
                href="/registration"
                onClick={() => setMobileOpen(false)}
                className="w-full py-3 rounded-xl btn-primary text-xs text-center font-bold"
              >
                REGISTER NOW
              </Link>
            ) : (
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#FAF9F6] dark:bg-[#15191C] border border-[#E8E1D5] dark:border-[#2B3034]">
                <Link
                  href="/admin"
                  onClick={() => setMobileOpen(false)}
                  className="text-xs font-bold text-[#E74C3C]"
                >
                  Open Control Room →
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setMobileOpen(false);
                  }}
                  className="text-xs text-rose-600 font-semibold cursor-pointer"
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

