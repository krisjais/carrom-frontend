'use client';

import React from 'react';
import { UserPlus, Users, Clock, Trophy } from 'lucide-react';

export function HowItWorksGrid() {
  const steps = [
    {
      num: '01',
      icon: UserPlus,
      title: 'REGISTER',
      desc: 'Register yourself for the tournament and get your Player ID.'
    },
    {
      num: '02',
      icon: Users,
      title: 'MATCHES',
      desc: 'Players will be matched automatically for each round.'
    },
    {
      num: '03',
      icon: Clock,
      title: 'PLAY 10 MIN',
      desc: 'Each match has 10 minutes of play time.'
    },
    {
      num: '04',
      icon: Trophy,
      title: 'SCORE & WIN',
      desc: 'Points are calculated based on pieces captured.'
    }
  ];

  return (
    <div className="space-y-4 pt-2">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold font-display text-[#111111] dark:text-[#F4F4F5] tracking-wider uppercase">
          HOW IT WORKS
        </h3>
        <span className="text-[10px] font-mono text-[#666666] dark:text-[#A1A1AA]">4 STEPS TO CHAMPIONSHIP</span>
      </div>

      <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Connecting horizontal line for desktop */}
        <div className="hidden lg:block absolute top-12 left-12 right-12 h-0.5 border-t border-dashed border-[#E5E5E5] dark:border-[#27272A] z-0" />

        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <div
              key={step.title}
              className="relative z-10 bg-white dark:bg-[#121215] border border-[#E5E5E5] dark:border-[#27272A] rounded-2xl p-6 text-center space-y-3 shadow-xs hover:border-[#C9A227] hover:-translate-y-1 transition-all group"
            >
              {/* Step number badge */}
              <div className="flex items-center justify-between text-[10px] font-mono font-bold text-[#666666] dark:text-[#A1A1AA]">
                <span className="bg-gray-100 dark:bg-[#18181C] px-2 py-0.5 rounded-md border border-[#E5E5E5] dark:border-[#27272A] text-[#111111] dark:text-[#F4F4F5]">
                  {step.num}
                </span>
                <span className="text-[#C9A227]">STEP</span>
              </div>

              <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-[#18181C] border border-[#E5E5E5] dark:border-[#27272A] flex items-center justify-center text-[#111111] dark:text-[#F4F4F5] mx-auto group-hover:bg-black group-hover:text-[#C9A227] transition-colors">
                <Icon className="w-5 h-5" />
              </div>

              <h4 className="text-xs font-bold font-display text-[#111111] dark:text-[#F4F4F5] tracking-wide">{step.title}</h4>
              <p className="text-xs text-[#666666] dark:text-[#A1A1AA] leading-relaxed font-sans">{step.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
