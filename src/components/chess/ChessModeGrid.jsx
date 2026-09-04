'use client';

import React from 'react';
import Link from 'next/link';
import { Zap, BarChart3, Users, BookOpen, ArrowRight } from 'lucide-react';

export function ChessModeGrid() {
  const modes = [
    {
      icon: Zap,
      title: 'Live Arena',
      subtitle: 'Jump into active collegiate matches in seconds and watch material score swings in real time.',
      cta: 'Watch Live',
      href: '/chess/matches',
      badge: 'Live',
    },
    {
      icon: BarChart3,
      title: 'Ranked Standings',
      subtitle: 'Climb the leaderboard, accumulate win points, and prove your departmental dominance.',
      cta: 'View Standings',
      href: '/chess/standings',
      badge: 'Official',
    },
    {
      icon: Users,
      title: 'Tournament Roster',
      subtitle: 'Explore verified contenders, player statistics, college departments, and battle history.',
      cta: 'View Roster',
      href: '/chess/players',
      badge: 'Roster',
    },
    {
      icon: BookOpen,
      title: 'Official Rules',
      subtitle: 'Understand the 10-minute blitz format, captured piece scoring weights, and FIDE guidelines.',
      cta: 'Read Rules',
      href: '/chess/rules',
      badge: 'Guide',
    },
  ];

  return (
    <section className="py-14 sm:py-20 border-t border-[#D5CFC5]/80 dark:border-[#262624] select-none">
      
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3 mb-12 sm:mb-16">
        <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.25em] text-[#77736B] dark:text-[#A8A49C] font-semibold block">
          CHOOSE YOUR MODE
        </span>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-normal font-serif text-[#171715] dark:text-[#FAF8F3] tracking-tight">
          Play Your Way
        </h2>
        <p className="text-xs sm:text-sm text-[#4E4C47] dark:text-[#A8A49C] font-sans leading-relaxed">
          Whether you're here to compete for the collegiate crown, track live games, or study the tournament regulations — explore the championship portal.
        </p>
      </div>

      {/* 4 Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {modes.map((mode) => {
          const Icon = mode.icon;
          return (
            <div
              key={mode.title}
              className="bg-[#FAF8F3] dark:bg-[#151514] border border-[#D5CFC5] dark:border-[#262624] rounded-3xl p-7 flex flex-col justify-between text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group"
            >
              <div className="space-y-4">
                {/* Icon Container */}
                <div className="w-12 h-12 rounded-2xl bg-[#EFEAE1] dark:bg-[#1D1D1B] text-[#171715] dark:text-[#FAF8F3] flex items-center justify-center mx-auto transition-transform duration-300 group-hover:scale-110">
                  <Icon className="w-5 h-5" />
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold font-serif text-[#171715] dark:text-[#FAF8F3] tracking-tight">
                  {mode.title}
                </h3>

                {/* Subtitle */}
                <p className="text-xs text-[#4E4C47] dark:text-[#8E8E93] leading-relaxed font-sans min-h-[48px]">
                  {mode.subtitle}
                </p>
              </div>

              {/* Bottom Pill CTA */}
              <div className="pt-6">
                <Link
                  href={mode.href}
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-full border border-[#D5CFC5] dark:border-[#262624] bg-[#FAF8F3] dark:bg-[#1D1D1B] text-[#171715] dark:text-[#FAF8F3] group-hover:bg-[#22221F] group-hover:text-[#FAF8F3] dark:group-hover:bg-[#FAF8F3] dark:group-hover:text-[#0D0D0D] text-xs font-semibold uppercase tracking-wider transition-all duration-200 shadow-xs"
                >
                  <span>{mode.cta}</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

    </section>
  );
}
