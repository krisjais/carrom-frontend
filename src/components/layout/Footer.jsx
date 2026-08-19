import React from 'react';
import Link from 'next/link';
import { CATEGORIES } from '@/lib/constants';
import { CarromCoin } from '@/components/ui/CarromElements';

export const Footer = () => {
  return (
    <footer className="w-full bg-[#3E342B] dark:bg-[#07090A] text-[#FAF9F6] dark:text-[#F5F1E8] text-xs mt-auto border-t border-[#4A4238] dark:border-[#2B3034] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Col 1: Brand Summary */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-white dark:bg-[#15191C] flex items-center justify-center border border-[#D5C4A1] dark:border-[#2B3034]">
                <CarromCoin type="queen" size="xs" />
              </div>
              <span className="font-serif font-bold text-[#FAF9F6] dark:text-[#F5F1E8] text-lg tracking-tight">
                CARROM<span className="text-[#E74C3C]">PRO</span>
              </span>
            </div>
            <p className="text-[12px] text-[#FAF9F6]/70 dark:text-[#B8B1A5] leading-relaxed max-w-xs">
              College Carrom Championship 2026. A modern sports league identity celebrating precision, strategy, and collegiate competition on the single Main Carrom Board.
            </p>
          </div>

          {/* Col 2: Navigation */}
          <div>
            <h4 className="font-sans font-bold text-[#D5C4A1] dark:text-[#D4A94C] text-xs uppercase tracking-widest mb-3">
              Championship
            </h4>
            <ul className="space-y-2 text-xs text-[#FAF9F6]/80 dark:text-[#B8B1A5]">
              <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link href="/tournament" className="hover:text-white transition-colors">Tournament Information</Link></li>
              <li><Link href="/live" className="hover:text-white transition-colors">Main Board Live</Link></li>
              <li><Link href="/results" className="hover:text-white transition-colors">Match Results</Link></li>
              <li><Link href="/registration" className="text-[#E74C3C] hover:underline font-semibold transition-colors">Register Athlete Entry →</Link></li>
            </ul>
          </div>

          {/* Col 3: Categories */}
          <div>
            <h4 className="font-sans font-bold text-[#D5C4A1] dark:text-[#D4A94C] text-xs uppercase tracking-widest mb-3">
              Divisions
            </h4>
            <ul className="space-y-2 text-xs text-[#FAF9F6]/80 dark:text-[#B8B1A5]">
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
            <h4 className="font-sans font-bold text-[#D5C4A1] dark:text-[#D4A94C] text-xs uppercase tracking-widest mb-3">
              Information & Access
            </h4>
            <ul className="space-y-2 text-xs text-[#FAF9F6]/80 dark:text-[#B8B1A5]">
              <li><Link href="/rules" className="hover:text-white transition-colors">Official Regulations</Link></li>
              <li><Link href="/announcements" className="hover:text-white transition-colors">Press & Notice Board</Link></li>
              <li><Link href="/participant/login" className="hover:text-white transition-colors">Athlete Portal Login</Link></li>
              <li><Link href="/admin/login" className="text-[#D5C4A1] dark:text-[#D4A94C] hover:underline font-mono font-bold">Championship Control Room</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-[#4A4238]/60 dark:border-[#2B3034] flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#FAF9F6]/50 dark:text-[#817B72] font-mono">
          <p>© 2026 CarromPro College Championship. Swiss Editorial Sports Standard.</p>
          <p className="text-[#D5C4A1] dark:text-[#D4A94C]">Single Main Carrom Board Arena • Knockout Hierarchy</p>
        </div>
      </div>
    </footer>
  );
};

