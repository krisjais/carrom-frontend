'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import gsap from 'gsap';

export function ChessHeroCard({ stats }) {
  const registeredCount = stats?.totalRegistrations ?? stats?.registeredCount ?? 0;
  const currentRound = stats?.currentRound ?? 1;
  const matchDuration = stats?.matchDuration ?? 10;
  const liveCount = stats?.liveMatches ?? 0;

  const containerRef = useRef(null);
  const textRef = useRef(null);
  const statsRowRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || typeof window === 'undefined') return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        textRef.current?.children || [],
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: 'power2.out',
        }
      );

      if (statsRowRef.current) {
        gsap.fromTo(
          statsRowRef.current.children,
          { opacity: 0, y: 15 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.08,
            delay: 0.35,
            ease: 'power2.out',
          }
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative overflow-hidden pt-6 pb-12 sm:pb-16 lg:pb-20 transition-all"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-6 items-center">
        
        {/* LEFT COLUMN: Editorial Text, CTA Buttons & Horizontal Stat Strip */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-8 sm:space-y-10 z-10">
          
          <div ref={textRef} className="space-y-5">
            {/* Spaced Uppercase Eyebrow */}
            <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.25em] text-[#77736B] dark:text-[#A8A49C] font-semibold">
              <span>THINK</span>
              <span>•</span>
              <span>PLAN</span>
              <span>•</span>
              <span>CONQUER</span>
            </div>

            {/* Huge Editorial Serif Headline */}
            <h1 className="text-4xl sm:text-6xl xl:text-7xl font-normal font-serif text-[#171715] dark:text-[#FAF8F3] tracking-tight leading-[1.08]">
              More Than a Game, <br />
              <span className="italic font-serif">A Sharper You.</span>
            </h1>

            {/* Supporting Copy */}
            <p className="text-sm sm:text-base text-[#4E4C47] dark:text-[#A8A49C] font-sans leading-relaxed max-w-lg">
              Welcome to the official Inter-College Chess Championship. Compete under strict 10-minute blitz timers, accumulate material points, and claim the collegiate crown.
            </p>

            {/* Dual Pill CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <Link
                href="/chess/register"
                className="inline-flex items-center gap-2 bg-[#22221F] dark:bg-[#FAF8F3] hover:bg-[#000000] dark:hover:bg-[#FFFFFF] text-[#FAF8F3] dark:text-[#0D0D0D] font-semibold px-7 py-3.5 rounded-full text-xs uppercase tracking-wider transition-all duration-200 shadow-sm hover:shadow hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>Start Playing</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              <Link
                href="/chess/standings"
                className="inline-flex items-center gap-2 border border-[#D5CFC5] dark:border-[#262624] bg-transparent hover:bg-[#EFEAE1]/60 dark:hover:bg-[#1D1D1B] text-[#171715] dark:text-[#FAF8F3] font-semibold px-7 py-3.5 rounded-full text-xs uppercase tracking-wider transition-colors duration-200"
              >
                <span>Explore Standings</span>
              </Link>
            </div>
          </div>

          {/* HORIZONTAL STAT STRIP (Integrated like reference) */}
          <div
            ref={statsRowRef}
            className="pt-6 border-t border-[#D5CFC5]/80 dark:border-[#262624] grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8"
          >
            <div>
              <div className="text-2xl sm:text-3xl font-serif font-bold text-[#171715] dark:text-[#FAF8F3] tracking-tight">
                {registeredCount}+
              </div>
              <div className="text-xs text-[#77736B] dark:text-[#8E8E93] font-medium pt-0.5">
                Registered Players
              </div>
            </div>

            <div>
              <div className="text-2xl sm:text-3xl font-serif font-bold text-[#171715] dark:text-[#FAF8F3] tracking-tight">
                Round {currentRound}
              </div>
              <div className="text-xs text-[#77736B] dark:text-[#8E8E93] font-medium pt-0.5">
                Tournament Stage
              </div>
            </div>

            <div>
              <div className="text-2xl sm:text-3xl font-serif font-bold text-[#171715] dark:text-[#FAF8F3] tracking-tight">
                {matchDuration} Min
              </div>
              <div className="text-xs text-[#77736B] dark:text-[#8E8E93] font-medium pt-0.5">
                Match Timer
              </div>
            </div>

            <div>
              <div className="text-2xl sm:text-3xl font-serif font-bold text-[#171715] dark:text-[#FAF8F3] tracking-tight flex items-center gap-2">
                <span>{liveCount}</span>
                {liveCount > 0 && (
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping inline-block" />
                )}
              </div>
              <div className="text-xs text-[#77736B] dark:text-[#8E8E93] font-medium pt-0.5">
                Live Matches
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Luxury Photographic King with Decorative Cursive Callout */}
        <div className="lg:col-span-5 relative flex items-center justify-center min-h-[380px] sm:min-h-[480px] select-none">
          
          {/* Subtle Decorative Editorial Callout with Arrow */}
          <div className="absolute top-2 right-4 sm:right-8 z-20 text-right pointer-events-none hidden sm:block">
            <span className="font-serif italic text-lg sm:text-xl text-[#77736B] dark:text-[#A8A49C] block leading-snug">
              Better Moves <br />
              <span className="font-sans text-sm tracking-wide not-italic opacity-80">Brighter Mind</span>
            </span>
            <svg
              className="w-10 h-10 ml-auto mt-1 text-[#77736B]/60 dark:text-[#A8A49C]/60 rotate-12"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>

          {/* Luxury Studio Chess King Image - Light & Dark variants */}
          <div className="relative w-full max-w-sm sm:max-w-md aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl border border-[#D5CFC5]/60 dark:border-[#262624] group">
            {/* Light Mode King Image */}
            <img
              src="/chess_hero_king_light.jpg"
              alt="Chess King Light"
              className="w-full h-full object-cover object-center dark:hidden transition-transform duration-700 group-hover:scale-105"
            />
            {/* Dark Mode King Image */}
            <img
              src="/chess_hero_king_dark.jpg"
              alt="Chess King Dark"
              className="w-full h-full object-cover object-center hidden dark:block transition-transform duration-700 group-hover:scale-105"
            />
            
            {/* Soft Ambient Inner Vignette */}
            <div className="absolute inset-0 ring-1 ring-inset ring-black/5 dark:ring-white/10 rounded-3xl pointer-events-none" />
          </div>

        </div>

      </div>
    </section>
  );
}
