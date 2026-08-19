'use client';

import React from 'react';
import Link from 'next/link';
import { Trophy, Swords, Clock, Users, Shield, ArrowRight, Sparkles } from 'lucide-react';

export function TournamentHero({ stats }) {
  const registeredCount = stats?.registeredCount ?? 0;
  const matchesCount = stats?.matchesCount ?? 0;
  const currentRound = stats?.currentRound ?? 1;
  const matchDuration = stats?.matchDuration ?? 10;
  const registrationOpen = stats?.registrationOpen ?? true;

  return (
    <div className="relative overflow-hidden bg-[#0B0D0E] border-b border-[#2A313C] py-16 sm:py-24">
      {/* Subtle Background Radial Pattern */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-radial from-[#F2C94C]/20 via-transparent to-transparent rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1F242C] border border-[#F2C94C]/30 text-[#F2C94C] text-xs font-mono font-bold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Collegiate Speed Chess Championship 2026</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl font-extrabold text-[#F5F1E8] font-display tracking-tight leading-none uppercase">
            CHESS CHAMPIONSHIP <span className="text-[#F2C94C]">2026</span>
          </h1>

          {/* Tagline */}
          <p className="text-xl sm:text-2xl text-[#9BB0D3] font-light italic font-sans">
            &quot;Think ahead. Play smart. Finish strong.&quot;
          </p>

          <p className="text-sm sm:text-base text-[#9BB0D3]/80 leading-relaxed max-w-xl mx-auto">
            Experience high-stakes 10-minute speed chess matches with live captured piece scoring, material point calculations, and dynamic collegiate standings.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/chess/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#F2C94C] hover:bg-[#F7DB82] text-[#0B0D0E] font-bold px-8 py-3.5 rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 uppercase tracking-wide font-display text-base"
            >
              <span>Register Now</span>
              <ArrowRight className="w-5 h-5" />
            </Link>

            <Link
              href="/chess/standings"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#1A1E24] hover:bg-[#1F242C] border border-[#F2C94C]/40 text-[#F5F1E8] hover:text-[#F2C94C] font-semibold px-8 py-3.5 rounded-xl transition-all font-display text-base uppercase"
            >
              <Trophy className="w-5 h-5 text-[#F2C94C]" />
              <span>View Standings</span>
            </Link>
          </div>

          {/* Tournament Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-10 border-t border-[#2A313C]/60 mt-10">
            
            <div className="bg-[#14171A] border border-[#2A313C] rounded-2xl p-4 text-center">
              <div className="flex items-center justify-center gap-1.5 text-[#F2C94C] text-xs font-mono uppercase font-bold mb-1">
                <Shield className="w-3.5 h-3.5" />
                <span>Registration</span>
              </div>
              <div className="text-lg font-bold font-display text-[#F5F1E8]">
                {registrationOpen ? (
                  <span className="text-emerald-400">OPEN</span>
                ) : (
                  <span className="text-amber-400 font-sans">CLOSED</span>
                )}
              </div>
            </div>

            <div className="bg-[#14171A] border border-[#2A313C] rounded-2xl p-4 text-center">
              <div className="flex items-center justify-center gap-1.5 text-[#F2C94C] text-xs font-mono uppercase font-bold mb-1">
                <Clock className="w-3.5 h-3.5" />
                <span>Match Duration</span>
              </div>
              <div className="text-lg font-bold font-display text-[#F5F1E8]">
                {matchDuration} Mins / Game
              </div>
            </div>

            <div className="bg-[#14171A] border border-[#2A313C] rounded-2xl p-4 text-center">
              <div className="flex items-center justify-center gap-1.5 text-[#F2C94C] text-xs font-mono uppercase font-bold mb-1">
                <Users className="w-3.5 h-3.5" />
                <span>Players</span>
              </div>
              <div className="text-xl font-bold font-display text-[#F2C94C]">
                {registeredCount} Registered
              </div>
            </div>

            <div className="bg-[#14171A] border border-[#2A313C] rounded-2xl p-4 text-center">
              <div className="flex items-center justify-center gap-1.5 text-[#F2C94C] text-xs font-mono uppercase font-bold mb-1">
                <Swords className="w-3.5 h-3.5" />
                <span>Current Round</span>
              </div>
              <div className="text-xl font-bold font-display text-[#F5F1E8]">
                Round {currentRound} ({matchesCount} Matches)
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
