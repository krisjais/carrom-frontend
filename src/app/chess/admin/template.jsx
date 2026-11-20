'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

/**
 * Next.js Template for Chess Admin:
 * Re-mounts on every section navigation to trigger silky smooth hardware-accelerated
 * enter transitions between Dashboard, Players, Matches, Standings, and Settings.
 */
export default function ChessAdminTemplate({ children }) {
  const pathname = usePathname();
  const isLogin = pathname === '/chess/admin/login';

  if (isLogin) {
    return <>{children}</>;
  }

  return (
    <div key={pathname} className="chess-section-enter w-full flex-1">
      {children}
    </div>
  );
}
