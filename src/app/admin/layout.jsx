'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { Menu } from 'lucide-react';
import AdminLoginPage from './login/page';
import { CarromCoin } from '@/components/ui/CarromElements';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAdmin, loading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isLoginPage = pathname === '/admin/login';

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-[#FAF9F6] dark:bg-[#0B0D0E] text-[#4A4238] dark:text-[#F5F1E8] p-6 space-y-4">
        <div className="w-8 h-8 rounded-full border-2 border-[#E74C3C] border-t-transparent animate-spin" />
        <p className="text-xs font-mono font-semibold text-[#7E7060] dark:text-[#B8B1A5]">
          Loading Control Room...
        </p>
      </div>
    );
  }

  // If user is not authenticated as admin, show login directly
  if (!user || user.role !== 'admin') {
    return <AdminLoginPage />;
  }

  return (
    <div className="flex-1 flex flex-col lg:flex-row min-h-screen bg-[#FAF9F6] dark:bg-[#0B0D0E] text-[#4A4238] dark:text-[#F5F1E8] transition-colors duration-200">
      {/* Mobile Top Header */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-[#3E342B] dark:bg-[#121517] border-b border-[#4A4238] dark:border-[#2B3034] sticky top-0 z-30 shadow-lg text-white">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-white dark:bg-[#15191C] flex items-center justify-center border border-[#D5C4A1] dark:border-[#2B3034]">
            <CarromCoin type="queen" size="xs" />
          </div>
          <span className="font-serif font-bold text-white dark:text-[#F5F1E8] text-sm tracking-tight">
            CARROM<span className="text-[#E74C3C]">PRO</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 rounded-xl bg-[#4A4238] dark:bg-[#181C1F] text-[#D5C4A1] hover:text-white transition-colors cursor-pointer"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      <AdminSidebar
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      <div className="flex-1 p-4 sm:p-6 lg:p-10 max-w-7xl mx-auto w-full overflow-x-hidden min-w-0">
        {children}
      </div>
    </div>
  );
}


