'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Search,
  Bell,
  ChevronDown,
  Menu,
  X,
  User,
  Shield,
  LogOut,
  Layers,
  Calendar,
  BookOpen,
  Trophy,
  Radio
} from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

// Authentic Concentric Carrom Center Circle Icon
const CarromBoardIcon = ({ className = 'w-5 h-5 text-white' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.75" />
    <circle cx="12" cy="12" r="5.5" stroke="currentColor" strokeWidth="1.75" />
    <circle cx="12" cy="12" r="2.2" fill="currentColor" />
  </svg>
);

export const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAdmin, isParticipant, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const userDropdownRef = useRef(null);
  const searchContainerRef = useRef(null);

  // Close dropdown and search popover on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isActive = (href) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  // User initials for the right avatar badge (matches "RK" from reference)
  const getUserInitials = () => {
    if (!user) return 'RK';
    if (user.fullName) {
      const parts = user.fullName.trim().split(' ');
      if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      return user.fullName.slice(0, 2).toUpperCase();
    }
    if (user.email) return user.email.slice(0, 2).toUpperCase();
    return 'RK';
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/brackets?search=${encodeURIComponent(searchQuery.trim())}`);
    setSearchOpen(false);
  };

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Tournaments', href: '/tournament' },
    { name: 'Live Board', href: '/live', isLive: true },
    { name: 'Results', href: '/results' },
    { name: 'Leaderboard', href: '/champions' },
    { name: 'Rules', href: '/rules' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#F4F0E6] dark:bg-[#0F0E0D] border-b border-[#DCD6C8]/80 dark:border-[#2E2B26] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          
          {/* ========================================================= */}
          {/* 1. LEFT BRAND CAPSULE: [ (O) Carrom ]                       */}
          {/* ========================================================= */}
          <Link
            href="/"
            className="group inline-flex items-center gap-2.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-[#171614] dark:bg-[#1D1C19] border border-[#24221E] dark:border-[#2E2B26] shadow-sm hover:bg-[#2A2824] transition-all shrink-0"
          >
            <CarromBoardIcon className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#F7F4EC] group-hover:scale-110 transition-transform" />
            <span className="font-sans font-medium text-xs sm:text-sm tracking-tight text-[#F7F4EC]">
              Carrom
            </span>
          </Link>

          {/* ========================================================= */}
          {/* 2. CENTER NAV LINKS: Clean text with active underline     */}
          {/* ========================================================= */}
          <nav className="hidden md:flex items-center gap-7 lg:gap-9">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`relative text-xs sm:text-[13px] font-sans transition-all py-1 ${
                    active
                      ? 'text-[#171614] dark:text-[#F7F4EC] font-semibold'
                      : 'text-[#6F6A60] dark:text-[#A39C8F] hover:text-[#171614] dark:hover:text-[#F7F4EC] font-medium'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    {link.isLive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#D93829] animate-pulse" />
                    )}
                    <span>{link.name}</span>
                  </span>
                  {active && (
                    <span className="absolute left-0 right-0 -bottom-1 h-[2px] bg-[#171614] dark:bg-[#F7F4EC] rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* ========================================================= */}
          {/* 3. RIGHT ACTION GROUP: [Search] [Avatar Badge] [Menu]     */}
          {/* ========================================================= */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            
            {/* Search Button (Aligned for phone & desktop) */}
            <div className="relative flex items-center" ref={searchContainerRef}>
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="w-8 h-8 sm:w-8.5 sm:h-8.5 flex items-center justify-center text-[#4A4238] dark:text-[#C5BCAC] hover:text-[#171614] dark:hover:text-white transition-colors cursor-pointer rounded-full hover:bg-black/5 dark:hover:bg-white/5"
                title="Search tournaments & players"
                aria-label="Search"
              >
                <Search className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              </button>

              {/* Quick Search Popover */}
              {searchOpen && (
                <form
                  onSubmit={handleSearchSubmit}
                  className="absolute -right-12 sm:right-0 top-12 w-[calc(100vw-2.5rem)] max-w-xs sm:w-72 bg-white dark:bg-[#1D1C19] border border-[#DCD6C8] dark:border-[#2E2B26] rounded-2xl shadow-xl p-2.5 z-50 flex items-center gap-2 animate-in fade-in zoom-in-95 duration-150"
                >
                  <Search className="w-4 h-4 text-[#857B6C] shrink-0 ml-1.5" />
                  <input
                    type="text"
                    autoFocus
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search player or squad..."
                    className="w-full h-8 text-xs bg-transparent border-none outline-none text-[#171614] dark:text-[#F7F4EC] placeholder:text-[#857B6C]"
                  />
                  <button
                    type="submit"
                    className="px-2.5 py-1 rounded-lg bg-[#171614] text-white dark:bg-[#F7F4EC] dark:text-[#171614] text-[10px] font-bold uppercase"
                  >
                    Go
                  </button>
                </form>
              )}
            </div>

            {/* Theme Toggle (Subtle) */}
            <div className="hidden sm:flex items-center">
              <ThemeToggle />
            </div>

            {/* Circular Profile Avatar Badge: [RK] */}
            <div className="relative flex items-center" ref={userDropdownRef}>
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-full bg-[#171614] dark:bg-[#F7F4EC] text-[#F7F4EC] dark:text-[#171614] border border-[#24221E] dark:border-[#2E2B26] flex items-center justify-center font-sans font-bold text-[11px] sm:text-xs tracking-tight shadow-xs hover:opacity-90 transition-opacity cursor-pointer"
                title={user ? `${user.fullName || user.email}` : 'Player Profile'}
                aria-label="User profile menu"
              >
                {getUserInitials()}
              </button>

              {/* User Dropdown Menu */}
              {userDropdownOpen && (
                <div className="absolute right-0 top-11 w-56 bg-white dark:bg-[#1D1C19] border border-[#DCD6C8] dark:border-[#2E2B26] rounded-2xl shadow-xl p-2 z-50 space-y-1 animate-in fade-in zoom-in-95 duration-150">
                  {user ? (
                    <>
                      <div className="px-3 py-2 border-b border-[#DCD6C8]/80 dark:border-[#2E2B26]">
                        <p className="text-xs font-bold text-[#171614] dark:text-[#F7F4EC] truncate">
                          {user.fullName || 'Competitor'}
                        </p>
                        <p className="text-[10px] text-[#857B6C] truncate font-mono">
                          {user.email}
                        </p>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-[#171614]/5 dark:bg-white/10 text-[9px] font-bold uppercase tracking-wider text-[#171614] dark:text-[#F7F4EC]">
                          {user.role === 'admin' ? 'Referee / Admin' : 'Registered Athlete'}
                        </span>
                      </div>

                      {user.role === 'admin' ? (
                        <Link
                          href="/admin"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-[#171614] dark:text-[#F7F4EC] hover:bg-[#F4F0E6] dark:hover:bg-[#24221E] transition-colors"
                        >
                          <Shield className="w-4 h-4 text-[#C2A268]" />
                          <span>Admin Control Desk</span>
                        </Link>
                      ) : (
                        <Link
                          href="/participant/dashboard"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-[#171614] dark:text-[#F7F4EC] hover:bg-[#F4F0E6] dark:hover:bg-[#24221E] transition-colors"
                        >
                          <User className="w-4 h-4 text-[#C2A268]" />
                          <span>Player Dashboard</span>
                        </Link>
                      )}

                      <button
                        onClick={() => {
                          logout();
                          setUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors text-left cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="px-3 py-2 border-b border-[#DCD6C8]/80 dark:border-[#2E2B26]">
                        <p className="text-xs font-bold text-[#171614] dark:text-[#F7F4EC]">
                          Welcome, Athlete
                        </p>
                        <p className="text-[10px] text-[#857B6C]">
                          Sign in to view your category draws & matches
                        </p>
                      </div>
                      <Link
                        href="/participant/login"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-[#171614] dark:text-[#F7F4EC] hover:bg-[#F4F0E6] dark:hover:bg-[#24221E] transition-colors"
                      >
                        <User className="w-4 h-4" />
                        <span>Athlete Login</span>
                      </Link>
                      <div className="pt-1 border-t border-[#DCD6C8]/80 dark:border-[#2E2B26]">
                        <Link
                          href="/registration"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center justify-center w-full py-2 rounded-xl bg-[#171614] dark:bg-[#F7F4EC] text-[#F7F4EC] dark:text-[#171614] text-xs font-bold uppercase tracking-wider"
                        >
                          Register as Athlete
                        </Link>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Drawer Toggle (Perfect alignment with other icons) */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-[#171614] dark:text-[#F7F4EC] hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors"
                aria-label="Toggle Menu"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>

          </div>

        </div>
      </div>

      {/* Mobile Drawer with Smooth Transition */}
      <div
        className={`md:hidden overflow-hidden border-t border-[#DCD6C8] dark:border-[#2E2B26] bg-[#F4F0E6] dark:bg-[#0F0E0D] transition-all duration-300 ease-in-out ${
          mobileOpen ? 'max-h-[500px] opacity-100 py-5' : 'max-h-0 opacity-0 py-0 border-t-0'
        }`}
      >
        <div className="px-4 space-y-3">
          <div className="flex flex-col space-y-1">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`px-3 py-2.5 rounded-xl text-sm font-sans flex items-center justify-between transition-colors ${
                    active
                      ? 'bg-[#171614] text-[#F7F4EC] dark:bg-[#F7F4EC] dark:text-[#171614] font-bold'
                      : 'text-[#171614] dark:text-[#F7F4EC] hover:bg-black/5 dark:hover:bg-white/5 font-medium'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {link.isLive && (
                      <span className="w-2 h-2 rounded-full bg-[#D93829] animate-pulse" />
                    )}
                    <span>{link.name}</span>
                  </span>
                  {active && <span className="text-xs">●</span>}
                </Link>
              );
            })}
          </div>

          <div className="pt-3 border-t border-[#DCD6C8] dark:border-[#2E2B26] flex items-center justify-between">
            <span className="text-xs text-[#857B6C] font-mono">Theme Appearance</span>
            <ThemeToggle />
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <Link
              href="/registration"
              onClick={() => setMobileOpen(false)}
              className="w-full py-2.5 text-center rounded-xl bg-[#171614] text-white dark:bg-[#F7F4EC] dark:text-[#171614] text-xs font-bold uppercase tracking-wider"
            >
              Register as Athlete
            </Link>
            <div className="grid grid-cols-1 gap-2 text-center text-xs font-medium">
              <Link
                href="/participant/login"
                onClick={() => setMobileOpen(false)}
                className="py-2.5 rounded-xl bg-white dark:bg-[#1D1C19] border border-[#DCD6C8] dark:border-[#2E2B26] text-[#171614] dark:text-[#F7F4EC] font-semibold"
              >
                Athlete Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
