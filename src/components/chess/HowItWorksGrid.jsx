'use client';

import React from 'react';
import { UserPlus, Users, Clock, Trophy } from 'lucide-react';

export function HowItWorksGrid() {
  const steps = [
    {
      num: '01',
      icon: UserPlus,
      title: 'REGISTER',
      desc: 'Register yourself for the tournament and get your verified Player ID.'
    },
    {
      num: '02',
      icon: Users,
      title: 'MATCHES',
      desc: 'Players are matched automatically for each championship round.'
    },
    {
      num: '03',
      icon: Clock,
      title: 'PLAY 10 MIN',
      desc: 'Each match has 10 minutes of strict speed chess clock play.'
    },
    {
      num: '04',
      icon: Trophy,
      title: 'SCORE & WIN',
      desc: 'Points are calculated based on pieces captured and match outcomes.'
    }
  ];

  return (
    <section className="py-14 sm:py-20 border-t border-[#D5CFC5]/80 dark:border-[#262624] select-none">
      
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3 mb-14 sm:mb-16">
        <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.25em] text-[#77736B] dark:text-[#A8A49C] font-semibold block">
          THE CHAMPIONSHIP BLUEPRINT
        </span>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-normal font-serif text-[#171715] dark:text-[#FAF8F3] tracking-tight">
          Your Path to the Championship
        </h2>
        <p className="text-xs sm:text-sm text-[#4E4C47] dark:text-[#A8A49C] font-sans leading-relaxed">
          Four structured stages designed to test mental endurance, blitz precision, and tactical foresight.
        </p>
      </div>

      {/* Horizontal Editorial Timeline (Desktop) & Vertical (Mobile) */}
      <div className="relative">
        
        {/* Connecting Line (Desktop) */}
        <div className="hidden lg:block absolute top-7 left-12 right-12 h-[1px] bg-[#D5CFC5] dark:bg-[#262624] z-0" />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-6 relative z-10">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={step.title}
                className="flex flex-col items-start space-y-4 group"
              >
                {/* Number & Icon Pill */}
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-full bg-[#FAF8F3] dark:bg-[#151514] border border-[#D5CFC5] dark:border-[#262624] flex items-center justify-center font-serif text-lg font-bold text-[#171715] dark:text-[#FAF8F3] shadow-xs group-hover:scale-105 group-hover:border-[#171715] dark:group-hover:border-[#FAF8F3] transition-all">
                    {step.num}
                  </div>
                  <div className="lg:hidden text-xs font-mono font-semibold uppercase text-[#77736B]">
                    Stage {idx + 1}
                  </div>
                </div>

                {/* Title and Description */}
                <div className="space-y-1.5 pt-1">
                  <h3 className="text-base font-bold font-serif text-[#171715] dark:text-[#FAF8F3] tracking-tight">
                    {step.title}
                  </h3>
                  <p className="text-xs text-[#4E4C47] dark:text-[#8E8E93] leading-relaxed font-sans max-w-xs">
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>

    </section>
  );
}
