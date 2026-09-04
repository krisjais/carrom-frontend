'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
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
      className="relative overflow-hidden rounded-3xl border border-[#D5CFC5] dark:border-[#262624] bg-[#FAF8F3] dark:bg-[#121212] p-6 sm:p-10 lg:p-12 transition-all shadow-sm"
    >
      {/* Ambient Epic 3D Chess Pieces Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img
          src="/chess_pieces_epic_bg.jpg"
          alt="Chess Pieces Background"
          className="w-full h-full object-cover object-center opacity-25 dark:opacity-40 transition-transform duration-1000 scale-105"
        />
        {/* Soft Vignette & Gradient Overlays for optimal readability in both light & dark themes */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#FAF8F3] via-[#FAF8F3]/90 to-[#FAF8F3]/60 dark:from-[#121212] dark:via-[#121212]/85 dark:to-[#121212]/50" />
        <div className="absolute inset-0 bg-radial from-transparent to-[#FAF8F3]/60 dark:to-[#121212]/70" />
      </div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
        
        {/* LEFT COLUMN: Editorial Text, CTA Buttons & Horizontal Stat Strip */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-8 sm:space-y-10">
          
          <div ref={textRef} className="space-y-5">
            {/* Spaced Uppercase Eyebrow */}
            <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.25em] text-[#77736B] dark:text-[#A8A49C] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#171715] dark:bg-[#FAF8F3]" />
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
                className="inline-flex items-center gap-2 bg-[#171715] dark:bg-[#FAF8F3] hover:bg-black dark:hover:bg-white text-[#FAF8F3] dark:text-[#0D0D0D] font-semibold px-7 py-3.5 rounded-full text-xs uppercase tracking-wider transition-all duration-200 shadow-sm hover:shadow hover:-translate-y-0.5 active:translate-y-0 font-mono"
              >
                <span>Start Playing</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              <Link
                href="/chess/standings"
                className="inline-flex items-center gap-2 border border-[#D5CFC5] dark:border-[#262624] bg-white/40 dark:bg-black/30 hover:bg-[#EFEAE1]/60 dark:hover:bg-[#1D1D1B] text-[#171715] dark:text-[#FAF8F3] font-semibold px-7 py-3.5 rounded-full text-xs uppercase tracking-wider transition-colors duration-200 font-mono backdrop-blur-xs"
              >
                <span>Explore Standings</span>
              </Link>
            </div>
          </div>

          {/* HORIZONTAL STAT STRIP */}
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

        {/* RIGHT COLUMN: Atmospheric Visual Card showcasing the 3D Render */}
        <div className="lg:col-span-5 relative flex items-center justify-center min-h-[340px] sm:min-h-[420px] select-none">
          
          {/* Subtle Decorative Editorial Callout */}
          <div className="absolute top-0 right-3 sm:right-6 z-20 text-right pointer-events-none hidden sm:block">
            <span className="font-serif italic text-base sm:text-lg text-[#77736B] dark:text-[#A8A49C] block leading-snug">
              Better Moves <br />
              <span className="font-sans text-xs tracking-wide not-italic opacity-80">Brighter Mind</span>
            </span>
          </div>

          {/* Luxury 3D Chess Pieces Showcase Card */}
          <div className="relative w-full max-w-sm sm:max-w-md aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border border-[#D5CFC5]/80 dark:border-[#262624] group">
            <img
              src="/chess_pieces_epic_bg.jpg"
              alt="Championship 3D Chess Arena"
              className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
            />
            {/* Inner vignette ring */}
            <div className="absolute inset-0 ring-1 ring-inset ring-black/10 dark:ring-white/10 rounded-3xl pointer-events-none" />
          </div>

        </div>

      </div>
    </section>
  );
}
