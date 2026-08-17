'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Trophy, MapPin, Shield, CheckCircle2 } from 'lucide-react';
import { StatusBadge } from '@/components/ui/Badge';

export default function TournamentPage() {
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTournament = async () => {
      try {
        const res = await api.getCurrentTournament();
        if (res.success) setTournament(res.tournament);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTournament();
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <h1 className="text-3xl sm:text-4xl font-black font-display text-white">
          {tournament?.title || 'Annual Inter-College Carrom Championship'}
        </h1>
        <p className="text-xs sm:text-sm text-[#94A3B8]">
          Edition {tournament?.edition || '2026'} • 6 Tournament Boards
        </p>
        <div className="pt-1">
          <StatusBadge status={tournament?.status || 'ongoing'} />
        </div>
      </div>

      {/* 3 Main Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="sport-card p-5 space-y-2">
          <div className="flex items-center gap-2 text-[#D4AF37]">
            <Trophy className="w-5 h-5" />
            <h3 className="font-bold text-white text-sm font-display">Knockout Format</h3>
          </div>
          <p className="text-xs text-[#94A3B8] leading-relaxed">
            Single-elimination knockout in all 5 categories. Matches are Best of 3 Boards (2–0 or 2–1). Random byes are generated dynamically based on actual entries.
          </p>
        </div>

        <div className="sport-card p-5 space-y-2">
          <div className="flex items-center gap-2 text-[#D4AF37]">
            <MapPin className="w-5 h-5" />
            <h3 className="font-bold text-white text-sm font-display">Arena & Boards</h3>
          </div>
          <p className="text-xs text-[#94A3B8] leading-relaxed">
            Indoor Sports Complex. Features 6 championship Carrom boards with standard lighting and championship strikers.
          </p>
        </div>

        <div className="sport-card p-5 space-y-2">
          <div className="flex items-center gap-2 text-[#D4AF37]">
            <Shield className="w-5 h-5" />
            <h3 className="font-bold text-white text-sm font-display">Official Scoring</h3>
          </div>
          <p className="text-xs text-[#94A3B8] leading-relaxed">
            Tournament Rules: Coin = 1 pt, Queen = 3 pts (if covered), Striker foul = -1 pt. Admin records points and manually confirms board winners.
          </p>
        </div>
      </div>

      {/* 5 Categories Summary */}
      <div className="sport-card p-6 space-y-4">
        <h3 className="font-bold text-white text-base font-display">Categories Contested</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-[#070B16] border border-[#1C2B48]">
            <span className="font-bold text-white block mb-0.5">1. Boys Singles</span>
            <p className="text-[#94A3B8]">Individual knockout for male participants.</p>
          </div>
          <div className="p-3 rounded-lg bg-[#070B16] border border-[#1C2B48]">
            <span className="font-bold text-white block mb-0.5">2. Girls Singles</span>
            <p className="text-[#94A3B8]">Individual knockout for female participants.</p>
          </div>
          <div className="p-3 rounded-lg bg-[#070B16] border border-[#1C2B48]">
            <span className="font-bold text-white block mb-0.5">3. Boys Doubles</span>
            <p className="text-[#94A3B8]">2 male participants per team.</p>
          </div>
          <div className="p-3 rounded-lg bg-[#070B16] border border-[#1C2B48]">
            <span className="font-bold text-white block mb-0.5">4. Girls Doubles</span>
            <p className="text-[#94A3B8]">2 female participants per team.</p>
          </div>
          <div className="p-3 rounded-lg bg-[#070B16] border border-[#1C2B48]">
            <span className="font-bold text-white block mb-0.5">5. Mixed Doubles</span>
            <p className="text-[#94A3B8]">1 male and 1 female participant per team.</p>
          </div>
        </div>
      </div>

      {/* CTA Strip */}
      <div className="text-center pt-2">
        <Link
          href="/registration"
          className="inline-block px-8 py-3.5 rounded-xl bg-[#D4AF37] hover:bg-[#E5C358] text-[#070B16] font-bold text-xs shadow-sm transition-all"
        >
          Register for Tournament
        </Link>
      </div>
    </div>
  );
}
