'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { AdminSidebar } from '@/components/layout/AdminSidebar';

import AdminLoginPage from './login/page';

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAdmin, loading } = useAuth();

  const isLoginPage = pathname === '/admin/login';

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-[#070B16] text-[#94A3B8] p-6 space-y-4">
        <div className="w-8 h-8 rounded-full border-2 border-[#D4AF37] border-t-transparent animate-spin" />
        <p className="text-xs font-mono font-semibold text-slate-300">
          Loading Admin Workspace...
        </p>
      </div>
    );
  }

  // If user is not authenticated as admin, show login directly
  if (!user || user.role !== 'admin') {
    return <AdminLoginPage />;
  }

  return (
    <div className="flex-1 flex min-h-screen">
      <AdminSidebar />
      <div className="flex-1 p-6 sm:p-8 lg:p-10 max-w-7xl mx-auto w-full overflow-x-hidden">
        {children}
      </div>
    </div>
  );
}
