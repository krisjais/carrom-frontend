import React from 'react';
import Link from 'next/link';
import { CATEGORIES } from '@/lib/constants';

export const Footer = () => {
  return (
    <footer className="w-full bg-[#140129] border-t border-[#4A138C] text-[#D8C7F0] text-xs mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1: Brand Summary */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#FFBA00] flex items-center justify-center text-[#210440] font-display font-black text-sm shadow-md shadow-[#FFBA00]/20">
                C
              </div>
              <span className="font-display font-black text-white text-base tracking-tight">
                CARROM<span className="text-[#FFBA00]">PRO</span>
              </span>
            </div>
            <p className="text-[12px] text-[#D8C7F0]/80 leading-relaxed max-w-xs">
              Annual Inter-College Carrom Championship platform. Clean dynamic knockout single-elimination draws, live sequential arena scoring, and official tournament rules.
            </p>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="font-display font-bold text-[#FFBA00] text-xs uppercase tracking-wider mb-3">
              Navigation
            </h4>
            <ul className="space-y-2">
              <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link href="/tournament" className="hover:text-white transition-colors">Tournament Details</Link></li>
              <li><Link href="/live" className="hover:text-white transition-colors">Live Match Center</Link></li>
              <li><Link href="/results" className="hover:text-white transition-colors">Match Results</Link></li>
              <li><Link href="/registration" className="text-[#FDB095] hover:text-[#FFBA00] font-semibold transition-colors">Register Entry →</Link></li>
            </ul>
          </div>

          {/* Col 3: Categories */}
          <div>
            <h4 className="font-display font-bold text-[#FFBA00] text-xs uppercase tracking-wider mb-3">
              Categories
            </h4>
            <ul className="space-y-2">
              {CATEGORIES.map((c) => (
                <li key={c.id}>
                  <Link href={`/brackets?category=${c.id}`} className="hover:text-white transition-colors">
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Portals & Rules */}
          <div className="space-y-3">
            <h4 className="font-display font-bold text-[#FFBA00] text-xs uppercase tracking-wider mb-3">
              Information & Access
            </h4>
            <ul className="space-y-2">
              <li><Link href="/rules" className="hover:text-white transition-colors">Tournament Rules</Link></li>
              <li><Link href="/announcements" className="hover:text-white transition-colors">Notice Board</Link></li>
              <li><Link href="/participant/login" className="hover:text-white transition-colors">Participant Portal</Link></li>
              <li><Link href="/admin/login" className="text-[#FFBA00] hover:underline font-mono font-bold">Admin Console</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-[#4A138C]/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#9E82C2]">
          <p>© 2026 Carrom Championship. Built for College Sports Tournaments.</p>
          <p className="text-[#FDB095]/80 font-mono">Main Carrom Board Arena • Single-Game Knockout Format</p>
        </div>
      </div>
    </footer>
  );
};
