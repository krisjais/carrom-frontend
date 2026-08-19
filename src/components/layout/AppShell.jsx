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
      <main className="flex-1 flex flex-col min-h-screen bg-[#F7F7F7] dark:bg-[#09090B] text-[#111111] dark:text-[#F4F4F5] transition-colors">
        {children}
      </main>
    );
  }

  if (isAdminRoute) {
    return (
      <main className="flex-1 flex flex-col min-h-screen bg-[#070B16]">
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
