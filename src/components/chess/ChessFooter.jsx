'use client';

import React from 'react';
import Link from 'next/link';

export function ChessFooter() {
  return (
    <footer className="bg-[#FAF8F3] dark:bg-[#151514] text-[#171715] dark:text-[#FAF8F3] py-16 px-6 sm:px-12 border-t border-[#D5CFC5] dark:border-[#262624] mt-auto select-none transition-colors">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Top row: Brand & Links */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 border-b border-[#D5CFC5]/60 dark:border-[#262624] pb-12">
          <div className="space-y-2 max-w-sm">
            <Link href="/chess" className="flex items-center gap-3 group">
              <div className="w-8 h-8 rounded-full bg-[#22221F] dark:bg-[#FAF8F3] text-[#FAF8F3] dark:text-[#0D0D0D] font-bold flex items-center justify-center text-base shadow-xs group-hover:scale-105 transition-transform">
                ♛
              </div>
              <span className="text-lg font-bold font-serif tracking-tight text-[#171715] dark:text-[#FAF8F3]">
                CHESS PORTAL
              </span>
            </Link>
            <p className="text-xs text-[#77736B] dark:text-[#8E8E93] leading-relaxed pt-1">
              The premier intra-collegiate speed chess championship. 10-minute blitz format, real-time material scoring, and official standings.
            </p>
          </div>

          <nav className="flex flex-wrap gap-x-8 gap-y-3 text-xs uppercase tracking-wider font-semibold text-[#4E4C47] dark:text-[#A8A49C]">
            <Link href="/chess" className="hover:text-[#171715] dark:hover:text-[#FAF8F3] transition-colors">Home</Link>
            <Link href="/chess/players" className="hover:text-[#171715] dark:hover:text-[#FAF8F3] transition-colors">Players</Link>
            <Link href="/chess/matches" className="hover:text-[#171715] dark:hover:text-[#FAF8F3] transition-colors">Matches</Link>
            <Link href="/chess/standings" className="hover:text-[#171715] dark:hover:text-[#FAF8F3] transition-colors">Standings</Link>
            <Link href="/chess/rules" className="hover:text-[#171715] dark:hover:text-[#FAF8F3] transition-colors">Rules</Link>
            <Link href="/chess/register" className="hover:text-[#171715] dark:hover:text-[#FAF8F3] transition-colors font-bold">Register</Link>
          </nav>
        </div>

        {/* Bottom row: Meta & Copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-mono text-[#77736B] dark:text-[#8E8E93]">
          <div>
            © 2026 Intra-College Chess Championship. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <Link href="/chess/rules" className="hover:underline">Tournament Regulations</Link>
            <Link href="/chess/admin/login" className="hover:underline">Admin Console</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
