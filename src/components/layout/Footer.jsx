import React from 'react';
import Link from 'next/link';
import { CATEGORIES } from '@/lib/constants';
import { CarromCoin } from '@/components/ui/CarromElements';

export const Footer = () => {
  return (
    <footer className="w-full bg-[#171614] dark:bg-[#0B0A09] text-[#F7F4EC] text-xs mt-auto border-t border-[#24221E] dark:border-[#2E2B26] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Col 1: Brand Summary */}
          <div className="space-y-3.5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#24221E] border border-[#38342E] flex items-center justify-center">
                <CarromCoin type="queen" size="xs" />
              </div>
              <span className="font-serif font-bold text-[#F7F4EC] text-xl tracking-tight">
                CARROM<span className="italic font-normal text-[#D93829] ml-1">CHAMPIONSHIP</span>
              </span>
            </div>
            <p className="text-[12px] text-[#A39C8F] leading-relaxed max-w-xs font-sans">
              College Carrom Championship 2026. A modern collegiate sports platform celebrating precision, strategy, and official competition on the Main Carrom Board.
            </p>
          </div>

          {/* Col 2: Navigation */}
          <div>
            <h4 className="font-sans font-bold text-[#C2A268] text-xs uppercase tracking-widest mb-3.5">
              Championship
            </h4>
            <ul className="space-y-2.5 text-xs text-[#A39C8F]">
              <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link href="/tournament" className="hover:text-white transition-colors">Tournament Information</Link></li>
              <li><Link href="/live" className="hover:text-white transition-colors">Main Board Live Broadcast</Link></li>
              <li><Link href="/results" className="hover:text-white transition-colors">Match Results</Link></li>
              <li><Link href="/registration" className="text-[#D93829] hover:underline font-bold transition-colors">Register Athlete Entry →</Link></li>
            </ul>
          </div>

          {/* Col 3: Categories */}
          <div>
            <h4 className="font-sans font-bold text-[#C2A268] text-xs uppercase tracking-widest mb-3.5">
              Divisions
            </h4>
            <ul className="space-y-2.5 text-xs text-[#A39C8F]">
              {CATEGORIES.map((c) => (
                <li key={c.id}>
                  <Link href={`/brackets?category=${c.id}`} className="hover:text-white transition-colors">
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Directives & Rules */}
          <div className="space-y-3.5">
            <h4 className="font-sans font-bold text-[#C2A268] text-xs uppercase tracking-widest mb-3.5">
              Official Directives
            </h4>
            <ul className="space-y-2.5 text-xs text-[#A39C8F]">
              <li><Link href="/rules" className="hover:text-white transition-colors">Official Rulebook</Link></li>
              <li><Link href="/brackets" className="hover:text-white transition-colors">Knockout Brackets</Link></li>
              <li><Link href="/categories" className="hover:text-white transition-colors">Championship Categories</Link></li>
              <li><Link href="/tournament" className="hover:text-white transition-colors">Tournament Overview</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-[#24221E] dark:border-[#2E2B26] flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#6F6A60] font-mono">
          <p>© 2026 Intra-College Carrom Championship. Editorial Sports Standard.</p>
          <p className="text-[#C2A268]">Single Main Carrom Board • Single-Game Knockout</p>
        </div>
      </div>
    </footer>
  );
};

