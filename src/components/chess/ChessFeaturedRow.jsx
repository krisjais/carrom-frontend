'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function ChessFeaturedRow({ totalPlayers = 0 }) {
  const displayCount = totalPlayers || 24;

  return (
    <section className="py-6 sm:py-10 select-none">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* LEFT CARD (60%): Community Card with Obsidian Knight Visual */}
        <div className="lg:col-span-7 bg-[#FAF8F3] dark:bg-[#151514] border border-[#D5CFC5] dark:border-[#262624] rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6 sm:gap-8 shadow-xs overflow-hidden group">
          
          {/* Knight Image Frame */}
          <div className="w-full sm:w-44 h-48 sm:h-full shrink-0 rounded-2xl overflow-hidden shadow-md border border-[#D5CFC5]/50 dark:border-[#262624] relative">
            <img
              src="/chess_card_knight.jpg"
              alt="Chess Knight"
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            />
          </div>

          {/* Card Content */}
          <div className="flex-1 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#77736B] dark:text-[#A8A49C] font-semibold block">
                INTER-COLLEGIATE NETWORK
              </span>
              <h3 className="text-2xl font-bold font-serif text-[#171715] dark:text-[#FAF8F3] tracking-tight">
                A Championship Community
              </h3>
              <p className="text-xs text-[#4E4C47] dark:text-[#8E8E93] leading-relaxed">
                Connect, compete, and master the board alongside collegiate competitors. Every match is timed, verified, and recorded into tournament history.
              </p>
            </div>

            {/* Avatar Stack + Player Count */}
            <div className="flex items-center gap-3 pt-1">
              <div className="flex -space-x-2 overflow-hidden">
                <div className="inline-block h-7 w-7 rounded-full ring-2 ring-[#FAF8F3] dark:ring-[#151514] bg-[#22221F] text-[#FAF8F3] flex items-center justify-center text-[10px] font-bold">K</div>
                <div className="inline-block h-7 w-7 rounded-full ring-2 ring-[#FAF8F3] dark:ring-[#151514] bg-[#4E4C47] text-[#FAF8F3] flex items-center justify-center text-[10px] font-bold">Q</div>
                <div className="inline-block h-7 w-7 rounded-full ring-2 ring-[#FAF8F3] dark:ring-[#151514] bg-[#77736B] text-[#FAF8F3] flex items-center justify-center text-[10px] font-bold">B</div>
                <div className="inline-block h-7 w-7 rounded-full ring-2 ring-[#FAF8F3] dark:ring-[#151514] bg-[#BDB6AA] text-[#171715] flex items-center justify-center text-[10px] font-bold">R</div>
              </div>
              <span className="text-xs font-semibold text-[#171715] dark:text-[#FAF8F3] font-mono">
                {displayCount}+ Active Competitors
              </span>
            </div>

            {/* CTA Button */}
            <div className="pt-2">
              <Link
                href="/chess/register"
                className="inline-flex items-center gap-2 bg-[#22221F] dark:bg-[#FAF8F3] hover:bg-black dark:hover:bg-white text-[#FAF8F3] dark:text-[#0D0D0D] text-xs font-semibold px-5 py-2.5 rounded-full uppercase tracking-wider transition-all duration-200 shadow-xs hover:-translate-y-0.5"
              >
                <span>Join the Tournament</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

          </div>
        </div>

        {/* RIGHT CARD (40%): Editorial Master Quote */}
        <div className="lg:col-span-5 bg-[#FAF8F3] dark:bg-[#151514] border border-[#D5CFC5] dark:border-[#262624] rounded-3xl p-8 sm:p-10 flex flex-col justify-between relative shadow-xs overflow-hidden">
          
          {/* Subtle Watermark Queen Symbol */}
          <div className="absolute -bottom-6 -right-6 text-8xl font-serif text-[#D5CFC5]/20 dark:text-[#262624]/40 select-none pointer-events-none">
            ♛
          </div>

          <div className="space-y-4 relative z-10">
            <span className="text-4xl font-serif text-[#171715] dark:text-[#FAF8F3] block leading-none opacity-40">
              “
            </span>
            <blockquote className="text-xl sm:text-2xl font-serif text-[#171715] dark:text-[#FAF8F3] leading-snug tracking-tight">
              Chess is not just a game; it is a discipline of foresight, calm, and tactical precision.
            </blockquote>
          </div>

          <div className="pt-6 relative z-10">
            <div className="text-xs font-mono font-semibold uppercase tracking-wider text-[#77736B] dark:text-[#A8A49C]">
              — GARRY KASPAROV
            </div>
            <div className="text-[10px] text-[#77736B]/80 dark:text-[#8E8E93] font-sans pt-0.5">
              13th World Chess Champion
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
