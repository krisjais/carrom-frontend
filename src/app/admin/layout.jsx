'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { AdminSidebar } from '@/components/layout/AdminSidebar';

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAdmin, loading } = useAuth();

  // Allow admin/login without redirect loop
  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (!loading && !isLoginPage && (!user || user.role !== 'admin')) {
      router.push('/admin/login');
    }
  }, [user, isAdmin, loading, router, isLoginPage]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (loading || !isAdmin) {
    return (
      <div className="flex-1 flex items-center justify-center py-24 text-slate-400 text-sm">
        Verifying administrator credentials...
      </div>
    );
  }

  return (
    <div className="flex-1 flex min-h-[calc(100vh-80px)]">
      <AdminSidebar />
      <div className="flex-1 p-6 sm:p-8 lg:p-10 max-w-7xl mx-auto w-full overflow-x-hidden">
        {children}
      </div>
    </div>
  );
}
