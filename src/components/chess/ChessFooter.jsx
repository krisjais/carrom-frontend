'use client';

import React from 'react';
import Link from 'next/link';

export function ChessFooter() {
  return (
    <footer className="bg-[#000000] text-white py-12 px-6 sm:px-12 border-t border-black mt-auto select-none">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* LEFT: Branding & Copyright */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white text-black font-bold flex items-center justify-center text-lg shadow-xs">
              ♟
            </div>
            <div>
              <span className="text-sm font-extrabold font-display tracking-wide block leading-none text-white">
                CHESS PORTAL
              </span>
              <span className="text-[9px] uppercase tracking-widest text-[#C9A227] font-mono font-bold block pt-0.5">
                TOURNAMENT
              </span>
            </div>
          </div>

          <p className="text-xs text-gray-400 font-sans leading-relaxed pt-1">
            © 2026 Chess Championship. <br />
            All rights reserved.
          </p>
        </div>

        {/* CENTER: Quick Links */}
        <div>
          <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-[#C9A227] mb-4">
            QUICK LINKS
          </h4>
          <ul className="space-y-2 text-xs text-gray-300 font-sans">
            <li><Link href="/chess" className="hover:text-white transition-colors">Home</Link></li>
            <li><Link href="/chess/players" className="hover:text-white transition-colors">Players Directory</Link></li>
            <li><Link href="/chess/matches" className="hover:text-white transition-colors">Match Fixtures & Schedule</Link></li>
            <li><Link href="/chess/standings" className="hover:text-white transition-colors">Official Standings</Link></li>
          </ul>
        </div>

        {/* RIGHT: Tournament Support */}
        <div>
          <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-[#C9A227] mb-4">
            TOURNAMENT SUPPORT
          </h4>
          <ul className="space-y-2 text-xs text-gray-300 font-sans">
            <li><Link href="/chess/rules" className="hover:text-white transition-colors">Tournament Rules</Link></li>
            <li><Link href="/chess/register" className="hover:text-white transition-colors">Competitor Registration</Link></li>
          </ul>
        </div>

      </div>
    </footer>
  );
}
