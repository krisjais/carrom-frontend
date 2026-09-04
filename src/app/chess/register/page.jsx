'use client';

import React from 'react';
import { ChessHeader } from '@/components/chess/ChessHeader';
import { RegistrationForm } from '@/components/chess/RegistrationForm';
import { ChessFooter } from '@/components/chess/ChessFooter';
import { Check, Shield, Trophy, Users, Clock } from 'lucide-react';

export default function ChessRegisterPage() {
  const highlights = [
    {
      title: 'Official Competitor Dossier',
      desc: 'Get assigned a permanent Player ID, track career matches, and showcase personal material records.'
    },
    {
      title: 'Strict 10-Minute Rapid Fixtures',
      desc: 'Fast-paced, high-stakes matches governed by our synchronous digital arbiter clock.'
    },
    {
      title: 'Dynamic Swiss Pairings',
      desc: 'Compete against opponents of equal skill each round with zero repeat matchups guaranteed.'
    },
    {
      title: 'Championship Trophy & Honors',
      desc: 'Climb the live podium standings and earn official recognition across the tournament circuit.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#F5F2EB] dark:bg-[#0D0D0D] flex flex-col font-sans text-[#171715] dark:text-[#FAF8F3] antialiased selection:bg-[#E4DED5] dark:selection:bg-[#2A2A28]">
      <ChessHeader />

      <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          
          {/* Left Column: Editorial Manifesto & Highlights */}
          <div className="lg:col-span-6 space-y-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-[#171715] dark:bg-[#FAF8F3]" />
                <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#77736B] dark:text-[#8E8E93] font-semibold">
                  The Arena Awaits • Season 2026
                </span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-[#171715] dark:text-[#FAF8F3] tracking-tight leading-[1.05]">
                Enter the Championship
              </h1>
              <p className="text-sm sm:text-base text-[#4E4C47] dark:text-[#9E9B93] mt-4 font-sans leading-relaxed">
                Step up to the 64 squares. Whether you are representing your division or testing your tactical nerve against the institution’s finest, registration guarantees your place in the opening round draw.
              </p>
            </div>

            {/* Feature Perks List */}
            <div className="space-y-4 pt-2">
              {highlights.map((h, i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 p-4 rounded-2xl bg-[#FAF8F3] dark:bg-[#141414] border border-[#D5CFC5]/70 dark:border-[#262624]"
                >
                  <div className="w-8 h-8 rounded-xl bg-[#EFEAE1] dark:bg-[#1E1E1C] border border-[#D5CFC5] dark:border-[#2E2E2B] flex items-center justify-center shrink-0 text-[#171715] dark:text-[#FAF8F3] mt-0.5">
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-sm text-[#171715] dark:text-[#FAF8F3]">
                      {h.title}
                    </h4>
                    <p className="text-xs text-[#77736B] dark:text-[#8E8E93] font-sans mt-0.5 leading-relaxed">
                      {h.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Editorial Kasparov Quote Strip */}
            <div className="p-6 rounded-2xl bg-[#EFEAE1]/50 dark:bg-[#141414] border border-[#D5CFC5]/60 dark:border-[#262624]">
              <p className="font-serif italic text-sm text-[#171715] dark:text-[#FAF8F3] leading-relaxed">
                “Chess is life in miniature. In chess, as in life, when people cannot see the future they make mistakes.”
              </p>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#77736B] dark:text-[#8E8E93] block mt-2">
                — Garry Kasparov, 13th World Champion
              </span>
            </div>
          </div>

          {/* Right Column: Registration Form */}
          <div className="lg:col-span-6 w-full">
            <RegistrationForm />
          </div>

        </div>
      </main>

      <ChessFooter />
    </div>
  );
}
