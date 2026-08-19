import React from 'react';
import Link from 'next/link';
import { CATEGORIES } from '@/lib/constants';

export const Footer = () => {
  return (
    <footer className="w-full bg-[#070809] border-t border-[#D4A94C]/25 text-[#F5F1E8]/70 text-xs mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1: Brand Summary */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#F2C94C] to-[#D4A94C] flex items-center justify-center text-[#0B0D0E] font-display font-black text-sm shadow-md shadow-[#F2C94C]/20">
                C
              </div>
              <span className="font-display font-black text-[#F5F1E8] text-lg tracking-wide">
                CARROM<span className="text-[#F2C94C]">PRO</span>
              </span>
            </div>
            <p className="text-[12px] text-[#F5F1E8]/60 leading-relaxed max-w-xs">
              Annual Inter-College Carrom Championship platform. Single-elimination dynamic knockout draws, sequential arena scoring, and official collegiate regulations.
            </p>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="font-display font-bold text-[#F2C94C] text-xs uppercase tracking-widest mb-3">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/" className="hover:text-[#F2C94C] transition-colors">Home</Link></li>
              <li><Link href="/tournament" className="hover:text-[#F2C94C] transition-colors">Tournament Details</Link></li>
              <li><Link href="/live" className="hover:text-[#F2C94C] transition-colors">Live Arena Center</Link></li>
              <li><Link href="/results" className="hover:text-[#F2C94C] transition-colors">Match Results</Link></li>
              <li><Link href="/registration" className="text-[#F2C94C] hover:underline font-bold transition-colors">Register Entry →</Link></li>
            </ul>
          </div>

          {/* Col 3: Categories */}
          <div>
            <h4 className="font-display font-bold text-[#F2C94C] text-xs uppercase tracking-widest mb-3">
              Categories
            </h4>
            <ul className="space-y-2 text-xs">
              {CATEGORIES.map((c) => (
                <li key={c.id}>
                  <Link href={`/brackets?category=${c.id}`} className="hover:text-[#F2C94C] transition-colors">
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Portals & Rules */}
          <div className="space-y-3">
            <h4 className="font-display font-bold text-[#F2C94C] text-xs uppercase tracking-widest mb-3">
              Information & Access
            </h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/rules" className="hover:text-[#F2C94C] transition-colors">Tournament Rules</Link></li>
              <li><Link href="/announcements" className="hover:text-[#F2C94C] transition-colors">Notice Board</Link></li>
              <li><Link href="/participant/login" className="hover:text-[#F2C94C] transition-colors">Participant Portal</Link></li>
              <li><Link href="/admin/login" className="text-[#F2C94C] hover:underline font-mono font-bold">Admin Console</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-[#2A313C] flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#F5F1E8]/50 font-mono">
          <p>© 2026 Carrom Championship. Inter-College Sports Platform.</p>
          <p className="text-[#F2C94C]">Main Carrom Board Arena • Single-Game Knockout</p>
        </div>
      </div>
    </footer>
  );
};
