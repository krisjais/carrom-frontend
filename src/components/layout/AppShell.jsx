'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { LiveTicker } from '@/components/layout/LiveTicker';
import { Footer } from '@/components/layout/Footer';

export function AppShell({ children }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');
  const isChessRoute = pathname?.startsWith('/chess');

  if (isChessRoute) {
    return (
      <main className="flex-1 flex flex-col min-h-screen bg-[#F5F2EB] dark:bg-[#0D0D0D] text-[#171715] dark:text-[#FAF8F3] selection:bg-[#E4DED5] dark:selection:bg-[#2A2A28] selection:text-[#171715] dark:selection:text-[#FAF8F3] transition-colors font-sans antialiased">
        {children}
      </main>
    );
  }

  if (isAdminRoute) {
    return (
      <main className="flex-1 flex flex-col min-h-screen">
        {children}
      </main>
    );
  }

  return (
    <>
      <Navbar />
      <LiveTicker />
      <main className="flex-1 flex flex-col">
        {children}
      </main>
      <Footer />
    </>
  );
}
